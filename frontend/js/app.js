// Configurações globais
const API_BASE = 'http://127.0.0.1:8000'; // Ajuste para o endereço do back-end

// Utilitários
function showMessage(elementId, message, type = 'error') {
    const element = document.getElementById(elementId);
    if (!element) return;

    // Clear existing content
    element.innerHTML = '';

    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        <span>${message}</span>
    `;

    element.appendChild(alertDiv);
    element.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
        element.style.display = 'none';
        element.innerHTML = '';
    }, 5000);
}

function setLoading(buttonId, loading = true) {
    const button = document.getElementById(buttonId);
    if (!button) return;

    const loadingSpan = button.querySelector('.loading');
    const textSpan = button.querySelector('span:not(.loading)');

    if (loadingSpan && textSpan) {
        // New button structure with loading spans
        if (loading) {
            loadingSpan.classList.remove('d-none');
            textSpan.classList.add('d-none');
        } else {
            loadingSpan.classList.add('d-none');
            textSpan.classList.remove('d-none');
        }
    } else {
        // Fallback for old structure
        button.disabled = loading;
        button.textContent = loading ? 'Carregando...' : button.dataset.originalText || 'Enviar';
    }

    button.disabled = loading;
}

function getToken() {
    return localStorage.getItem('access_token');
}

function setToken(token) {
    localStorage.setItem('access_token', token);
}

function clearToken() {
    localStorage.removeItem('access_token');
}

function isLoggedIn() {
    return !!getToken();
}

// Funções de API
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const token = getToken();

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || 'Erro na requisição');
    }

    return data;
}

// Autenticação
async function login(email, senha) {
    try {
        const data = await apiRequest('/usuarios/login', {
            method: 'POST',
            body: JSON.stringify({ email, senha })
        });

        setToken(data.access_token);
        return data;
    } catch (error) {
        throw error;
    }
}

async function register(nome, email, senha) {
    try {
        const data = await apiRequest('/usuarios/registrar', {
            method: 'POST',
            body: JSON.stringify({ nome, email, senha, ativo: true, admin: false })
        });

        return data;
    } catch (error) {
        throw error;
    }
}

// Logout
function logout() {
    clearToken();
    window.location.href = '../index.html';
}

// Verificar autenticação
function checkAuth() {
    if (!isLoggedIn() && !window.location.pathname.includes('index.html')) {
        window.location.href = 'index.html';
    }
}

// Sistema de Roteamento Simplificado
const routes = {
    '/dashboard': '/frontend/pages/dashboard.html',
    '/estabelecimentos': '/frontend/pages/estabelecimentos.html',
    '/minhas-filas': '/frontend/pages/minhas-filas.html',
    '/minha-posicao': '/frontend/pages/minha-posicao.html'
};

// Interceptar cliques nos links da navbar
function setupNavigation() {
    document.addEventListener('click', function(e) {
        const link = e.target.closest('.nav-link');
        if (link && link.getAttribute('href').startsWith('/')) {
            e.preventDefault();
            const route = link.getAttribute('href');
            const targetUrl = routes[route];

            if (targetUrl) {
                console.log('Navegando para:', targetUrl);
                window.location.href = targetUrl;
            } else {
                console.warn('Rota não encontrada:', route);
            }
        }
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Configurar navegação
    setupNavigation();
    // Toggle entre login e registro
    const registerLink = document.getElementById('registerLink');
    const loginLink = document.getElementById('loginLink');
    const loginFormContainer = document.getElementById('loginFormContainer');
    const registerFormContainer = document.getElementById('registerFormContainer');

    if (registerLink && loginFormContainer && registerFormContainer) {
        registerLink.addEventListener('click', function(e) {
            e.preventDefault();
            loginFormContainer.classList.add('d-none');
            registerFormContainer.classList.remove('d-none');
            // Clear any existing messages
            const messageEl = document.getElementById('message');
            if (messageEl) {
                messageEl.style.display = 'none';
                messageEl.innerHTML = '';
            }
        });
    }

    if (loginLink && loginFormContainer && registerFormContainer) {
        loginLink.addEventListener('click', function(e) {
            e.preventDefault();
            registerFormContainer.classList.add('d-none');
            loginFormContainer.classList.remove('d-none');
            // Clear any existing messages
            const regMessageEl = document.getElementById('regMessage');
            if (regMessageEl) {
                regMessageEl.style.display = 'none';
                regMessageEl.innerHTML = '';
            }
        });
    }

    // Formulário de login
    const loginFormEl = document.getElementById('loginForm');
    if (loginFormEl) {
        loginFormEl.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;

            setLoading('loginBtn', true);

            try {
                await login(email, senha);
                window.location.href = 'pages/dashboard.html';
            } catch (error) {
                showMessage('message', error.message);
            } finally {
                setLoading('loginBtn', false);
            }
        });
    }

    // Formulário de registro
    const registerFormEl = document.getElementById('registerForm');
    if (registerFormEl) {
        registerFormEl.addEventListener('submit', async function(e) {
            e.preventDefault();
            const nome = document.getElementById('regNome').value;
            const email = document.getElementById('regEmail').value;
            const senha = document.getElementById('regSenha').value;

            setLoading('registerBtn', true);

            try {
                await register(nome, email, senha);
                showMessage('regMessage', 'Usuário registrado com sucesso! Faça login.', 'success');
                // Clear form
                registerFormEl.reset();
                setTimeout(() => {
                    if (registerFormContainer && loginFormContainer) {
                        registerFormContainer.classList.add('d-none');
                        loginFormContainer.classList.remove('d-none');
                    }
                }, 2000);
            } catch (error) {
                showMessage('regMessage', error.message);
            } finally {
                setLoading('registerBtn', false);
            }
        });
    }

    // Verificar autenticação em páginas protegidas
    checkAuth();
});

// Exportar funções para uso em outros arquivos
window.FilaDigital = {
    apiRequest,
    showMessage,
    setLoading,
    getToken,
    setToken,
    clearToken,
    isLoggedIn,
    login,
    register,
    logout,
    checkAuth
};