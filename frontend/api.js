// FilaDigital - API Integration
// Configuração e funções para comunicação com o backend

const API_CONFIG = {
    // URL base da API - sempre aponta para o backend FastAPI
    BASE_URL: (() => {
        const currentOrigin = window.location.origin;
        // Se estamos em /frontend, removemos para chegar na raiz da API
        if (currentOrigin.includes('/frontend')) {
            return currentOrigin.replace('/frontend', '');
        }
        return currentOrigin;
    })(),
    ENDPOINTS: {
        // Usuários
        REGISTER: '/usuarios/registrar',
        LOGIN: '/usuarios/login',
        REFRESH_TOKEN: '/usuarios/refresh',

        // Estabelecimentos
        ESTABELECIMENTOS: '/estabelecimentos',
        DASHBOARD_OWNER: '/estabelecimentos/dashboard',

        // Filas
        FILAS: '/filas',
        FILAS_DISPONIVEIS: '/filas/disponiveis',
        MINHA_POSICAO: '/filas/minha-posicao',
        HISTORICO: '/filas/historico',
        DASHBOARD_FUNCIONARIO: '/filas/dashboard-funcionario',
        DASHBOARD_CLIENTE: '/filas/dashboard-cliente'
    }
};

// Estado de autenticação
let authState = {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    user: JSON.parse(localStorage.getItem('user') || 'null')
};

// Headers padrão para requisições autenticadas
function getAuthHeaders() {
    const headers = {
        'Content-Type': 'application/json'
    };

    if (authState.accessToken) {
        headers['Authorization'] = `Bearer ${authState.accessToken}`;
    }

    return headers;
}

// Função genérica para fazer requisições HTTP
async function apiRequest(endpoint, options = {}) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const config = {
        headers: getAuthHeaders(),
        ...options
    };

    console.log('API Request:', {
        url: url,
        method: config.method || 'GET',
        hasAuth: !!config.headers.Authorization
    });

    try {
        const response = await fetch(url, config);
        console.log('API Response:', {
            url: url,
            status: response.status,
            ok: response.ok
        });

        // Se o token expirou, tentar renovar
        if (response.status === 401 && authState.refreshToken) {
            console.log('Token expired, trying to refresh...');
            const newToken = await refreshAccessToken();
            if (newToken) {
                config.headers['Authorization'] = `Bearer ${newToken}`;
                console.log('Retrying with new token...');
                return fetch(url, config);
            }
        }

        return response;
    } catch (error) {
        console.error('API Request Error:', {
            url: url,
            error: error.message
        });
        throw error;
    }
}

// Renovar token de acesso
async function refreshAccessToken() {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REFRESH_TOKEN}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authState.refreshToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            authState.accessToken = data.access_token;
            localStorage.setItem('accessToken', data.access_token);
            return data.access_token;
        } else {
            // Token de refresh expirou, fazer logout
            logout();
            return null;
        }
    } catch (error) {
        console.error('Token refresh error:', error);
        logout();
        return null;
    }
}

// Login
async function login(email, password) {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha: password })
        });

        if (response.ok) {
            const data = await response.json();
            authState.accessToken = data.access_token;
            authState.refreshToken = data.refresh_token;

            // Salvar no localStorage
            localStorage.setItem('accessToken', data.access_token);
            localStorage.setItem('refreshToken', data.refresh_token);

            // Decodificar token para obter informações do usuário
            const userInfo = parseJwt(data.access_token);
            authState.user = userInfo;
            localStorage.setItem('user', JSON.stringify(userInfo));

            return { success: true, user: userInfo };
        } else {
            const error = await response.json();
            return { success: false, error: error.detail || 'Erro no login' };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Erro de conexão' };
    }
}

// Registro
async function register(userData) {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome: userData.name,
                email: userData.email,
                senha: userData.password,
                role: userData.userType,
                ativo: true,
                admin: false,
                establishment_id: null
            })
        });

        if (response.ok) {
            return { success: true };
        } else {
            let errorMessage = 'Erro no registro';
            try {
                const error = await response.json();
                console.error('Registration error details:', error);
                console.error('Response status:', response.status);
                console.error('Response statusText:', response.statusText);

                // Tratar diferentes tipos de erro
                if (error.detail) {
                    if (Array.isArray(error.detail)) {
                        // Erro de validação do Pydantic
                        errorMessage = error.detail.map(err => {
                            if (err.loc && err.loc.length > 1) {
                                return `${err.loc[1]}: ${err.msg}`;
                            }
                            return err.msg || 'Erro de validação';
                        }).join(', ');
                    } else {
                        // Erro simples
                        errorMessage = error.detail;
                    }
                } else if (error.message) {
                    errorMessage = error.message;
                }
            } catch (parseError) {
                console.error('Error parsing error response:', parseError);
                console.error('Raw response text:', await response.text());
                errorMessage = `Erro ${response.status}: ${response.statusText}`;
            }

            return { success: false, error: errorMessage };
        }
    } catch (error) {
        console.error('Register error:', error);
        return { success: false, error: 'Erro de conexão' };
    }
}

// Logout
function logout() {
    authState.accessToken = null;
    authState.refreshToken = null;
    authState.user = null;

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    window.location.href = '/frontend/index.html';
}

// Verificar se usuário está autenticado
function isAuthenticated() {
    return !!authState.accessToken;
}

// Obter informações do usuário atual
function getCurrentUser() {
    return authState.user;
}

// Verificar role do usuário
function hasRole(role) {
    return authState.user && authState.user.role === role;
}

// Função utilitária para decodificar JWT
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error parsing JWT:', error);
        return null;
    }
}

// ====================
// API DE ESTABELECIMENTOS
// ====================

async function getEstablishments() {
    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.ESTABELECIMENTOS);
        if (response.ok) {
            const data = await response.json();
            return data.estabelecimentos || [];
        }
        return [];
    } catch (error) {
        console.error('Error fetching establishments:', error);
        return [];
    }
}

async function createEstablishment(establishmentData) {
    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.ESTABELECIMENTOS + '/criar-estabelecimento', {
            method: 'POST',
            body: JSON.stringify({
                nome: establishmentData.name,
                rua: establishmentData.address,
                bairro: establishmentData.bairro || '',
                cidade: establishmentData.cidade || '',
                estado: establishmentData.estado || '',
                telefone: establishmentData.telefone || '',
                usuario_id: establishmentData.usuario_id || getCurrentUser()?.sub
            })
        });

        if (response.ok) {
            const data = await response.json();
            return { success: true, data };
        } else {
            const error = await response.json();
            return { success: false, error: error.detail };
        }
    } catch (error) {
        console.error('Error creating establishment:', error);
        return { success: false, error: 'Erro de conexão' };
    }
}

async function deleteEstablishment(establishmentId) {
    try {
        const response = await apiRequest(`${API_CONFIG.ENDPOINTS.ESTABELECIMENTOS}/deletar-estabelecimento/${establishmentId}`, {
            method: 'POST'
        });

        return response.ok;
    } catch (error) {
        console.error('Error deleting establishment:', error);
        return false;
    }
}

async function getOwnerDashboard() {
    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.DASHBOARD_OWNER);
        if (response.ok) {
            return await response.json();
        }
        return null;
    } catch (error) {
        console.error('Error fetching owner dashboard:', error);
        return null;
    }
}

// ====================
// API DE FILAS
// ====================

async function getQueues() {
    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.FILAS);
        if (response.ok) {
            const data = await response.json();
            return data.filas || [];
        }
        return [];
    } catch (error) {
        console.error('Error fetching queues:', error);
        return [];
    }
}

async function getAvailableQueues() {
    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.FILAS_DISPONIVEIS);
        if (response.ok) {
            const data = await response.json();
            return data.filas || [];
        }
        return [];
    } catch (error) {
        console.error('Error fetching available queues:', error);
        return [];
    }
}

async function createQueue(queueData) {
    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.FILAS + '/criar-fila', {
            method: 'POST',
            body: JSON.stringify({
                nome: queueData.name,
                descricao: queueData.description,
                estabelecimento_id: queueData.estabelecimento_id
            })
        });

        if (response.ok) {
            const data = await response.json();
            return { success: true, data };
        } else {
            const error = await response.json();
            return { success: false, error: error.detail };
        }
    } catch (error) {
        console.error('Error creating queue:', error);
        return { success: false, error: 'Erro de conexão' };
    }
}

async function deleteQueue(queueId) {
    try {
        const response = await apiRequest(`${API_CONFIG.ENDPOINTS.FILAS}/apagar-fila/${queueId}`, {
            method: 'POST'
        });

        return response.ok;
    } catch (error) {
        console.error('Error deleting queue:', error);
        return false;
    }
}

async function joinQueue(queueId) {
    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.FILAS + '/entrar-na-fila', {
            method: 'POST',
            body: JSON.stringify({
                fila_id: queueId,
                ordem: 0, // Será calculado pelo backend
                status: 'aguardando'
            })
        });

        if (response.ok) {
            const data = await response.json();
            return { success: true, data };
        } else {
            const error = await response.json();
            return { success: false, error: error.detail };
        }
    } catch (error) {
        console.error('Error joining queue:', error);
        return { success: false, error: 'Erro de conexão' };
    }
}

async function leaveQueue(positionId) {
    try {
        const response = await apiRequest(`${API_CONFIG.ENDPOINTS.FILAS}/sair-da-fila/${positionId}`, {
            method: 'DELETE'
        });

        return response.ok;
    } catch (error) {
        console.error('Error leaving queue:', error);
        return false;
    }
}

async function callNextCustomer(queueId) {
    try {
        const response = await apiRequest(`${API_CONFIG.ENDPOINTS.FILAS}/${queueId}/chamar-proximo`, {
            method: 'POST'
        });

        if (response.ok) {
            const data = await response.json();
            return { success: true, data };
        } else {
            const error = await response.json();
            return { success: false, error: error.detail };
        }
    } catch (error) {
        console.error('Error calling next customer:', error);
        return { success: false, error: 'Erro de conexão' };
    }
}

async function getMyPosition() {
    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.MINHA_POSICAO);
        if (response.ok) {
            return await response.json();
        }
        return [];
    } catch (error) {
        console.error('Error fetching my position:', error);
        return [];
    }
}

async function getQueueHistory() {
    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.HISTORICO);
        if (response.ok) {
            return await response.json();
        }
        return [];
    } catch (error) {
        console.error('Error fetching queue history:', error);
        return [];
    }
}

async function getEmployeeDashboard() {
    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.DASHBOARD_FUNCIONARIO);
        if (response.ok) {
            return await response.json();
        }
        return null;
    } catch (error) {
        console.error('Error fetching employee dashboard:', error);
        return null;
    }
}

async function getCustomerDashboard() {
    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.DASHBOARD_CLIENTE);
        if (response.ok) {
            return await response.json();
        }
        return null;
    } catch (error) {
        console.error('Error fetching customer dashboard:', error);
        return null;
    }
}

// ====================
// API DE FUNCIONÁRIOS
// ====================

async function getEstablishmentEmployees(establishmentId) {
    try {
        const response = await apiRequest(`${API_CONFIG.ENDPOINTS.ESTABELECIMENTOS}/${establishmentId}/funcionarios`);
        if (response.ok) {
            const data = await response.json();
            return data.funcionarios || [];
        }
        return [];
    } catch (error) {
        console.error('Error fetching employees:', error);
        return [];
    }
}

async function addEmployeeToEstablishment(establishmentId, employeeId) {
    try {
        const response = await apiRequest(`${API_CONFIG.ENDPOINTS.ESTABELECIMENTOS}/${establishmentId}/adicionar-funcionario`, {
            method: 'POST',
            body: JSON.stringify({ funcionario_id: employeeId })
        });

        return response.ok;
    } catch (error) {
        console.error('Error adding employee:', error);
        return false;
    }
}

// ====================
// API DE QR CODE
// ====================

async function generateQRCode(queueId) {
    try {
        const response = await apiRequest(`${API_CONFIG.ENDPOINTS.FILAS}/${queueId}/qr-code`);
        if (response.ok) {
            return await response.json();
        }
        return null;
    } catch (error) {
        console.error('Error generating QR code:', error);
        return null;
    }
}

async function joinQueueViaQR(qrCode) {
    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.FILAS + '/entrar-via-qr', {
            method: 'POST',
            body: JSON.stringify({ qr_code: qrCode })
        });

        if (response.ok) {
            const data = await response.json();
            return { success: true, data };
        } else {
            const error = await response.json();
            return { success: false, error: error.detail };
        }
    } catch (error) {
        console.error('Error joining via QR:', error);
        return { success: false, error: 'Erro de conexão' };
    }
}

// Exportar funções para uso global
window.FilaDigitalAPI = {
    login,
    register,
    logout,
    isAuthenticated,
    getCurrentUser,
    hasRole,
    getEstablishments,
    createEstablishment,
    deleteEstablishment,
    getOwnerDashboard,
    getQueues,
    getAvailableQueues,
    createQueue,
    deleteQueue,
    joinQueue,
    leaveQueue,
    callNextCustomer,
    getMyPosition,
    getQueueHistory,
    getEmployeeDashboard,
    getCustomerDashboard,
    getEstablishmentEmployees,
    addEmployeeToEstablishment,
    generateQRCode,
    joinQueueViaQR
};