// Filas Disponíveis - Página específica para visualizar e entrar em filas
document.addEventListener('DOMContentLoaded', function() {
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        FilaDigital.logout();
    });

    // Carregar dados iniciais
    loadFilasDisponiveis();

    // Funcionalidade de navegação suave para links da navbar
    setupNavbarNavigation();

    // Funcionalidade de busca
    setupSearch();

    // Botão de atualizar
    document.getElementById('refreshBtn').addEventListener('click', () => {
        loadFilasDisponiveis();
    });

    // Polling para atualização em tempo real
    setInterval(() => {
        loadFilasDisponiveis();
    }, 30000); // Atualizar a cada 30 segundos
});

// ===== CARREGAMENTO DE DADOS =====

async function loadFilasDisponiveis() {
    try {
        const response = await FilaDigital.apiRequest('/filas/disponiveis');
        const filas = response.filas || [];

        const filasDisponiveisList = document.getElementById('filasDisponiveisList');

        if (filas.length === 0) {
            filasDisponiveisList.innerHTML = `
                <div class="text-center py-4">
                    <div class="text-muted mb-3">
                        <span style="font-size: 3rem;">🎯</span>
                    </div>
                    <h4 class="text-muted">Nenhuma fila disponível</h4>
                    <p class="text-muted">Não há filas disponíveis no momento.</p>
                    <p class="text-muted">Volte mais tarde ou crie sua própria fila.</p>
                </div>
            `;
            return;
        }

        let html = '<div class="table-responsive"><table class="table"><thead><tr>';
        html += '<th>Nome da Fila</th><th>Estabelecimento</th><th>Localização</th><th>Pessoas na Fila</th><th>Tempo Estimado</th><th>Ação</th>';
        html += '</tr></thead><tbody>';

        filas.forEach(fila => {
            const endereco = fila.estabelecimento ?
                `${fila.estabelecimento.rua}, ${fila.estabelecimento.bairro}` : '-';
            const tempoEstimado = calcularTempoEstimado(fila.pessoas_na_fila);

            html += `
                <tr>
                    <td>
                        <div>
                            <strong>${fila.nome}</strong>
                            ${fila.descricao ? `<br><small class="text-muted">${fila.descricao}</small>` : ''}
                        </div>
                    </td>
                    <td>${fila.estabelecimento ? fila.estabelecimento.nome : '-'}</td>
                    <td>${endereco}</td>
                    <td><span class="badge">${fila.pessoas_na_fila}</span></td>
                    <td><span class="text-info">${tempoEstimado}</span></td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="entrarNaFila(${fila.id})">
                            ➕ Entrar na Fila
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        filasDisponiveisList.innerHTML = html;

    } catch (error) {
        console.error('Erro ao carregar filas disponíveis:', error);
        document.getElementById('filasDisponiveisList').innerHTML = `
            <div class="text-center py-4">
                <div class="text-muted">
                    <span style="font-size: 2rem;">⚠️</span>
                    <p>Erro ao carregar filas disponíveis.</p>
                </div>
            </div>
        `;
    }
}

// ===== FUNCIONALIDADES DE BUSCA =====

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const clearBtn = document.getElementById('clearSearchBtn');

    // Busca ao clicar no botão
    searchBtn.addEventListener('click', () => {
        performSearch();
    });

    // Busca ao pressionar Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Limpar busca
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        loadFilasDisponiveis();
    });
}

function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();

    if (!searchTerm) {
        loadFilasDisponiveis();
        return;
    }

    // Filtrar filas na tabela
    const rows = document.querySelectorAll('#filasDisponiveisList table tbody tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// ===== UTILITÁRIOS =====

function calcularTempoEstimado(pessoasNaFila) {
    // Estimativa simples: 5 minutos por pessoa
    const minutos = pessoasNaFila * 5;

    if (minutos < 60) {
        return `${minutos} min`;
    } else {
        const horas = Math.floor(minutos / 60);
        const minutosRestantes = minutos % 60;
        return `${horas}h ${minutosRestantes}min`;
    }
}

// ===== FUNÇÕES DE AÇÃO =====

async function entrarNaFila(filaId) {
    // Obter ID do usuário do token JWT
    const token = FilaDigital.getToken();
    let usuario_id = 1; // fallback

    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            usuario_id = payload.sub;
        } catch (e) {
            console.warn('Não foi possível extrair ID do usuário do token');
        }
    }

    try {
        const data = await FilaDigital.apiRequest('/filas/entrar-na-fila', {
            method: 'POST',
            body: JSON.stringify({
                fila_id: parseInt(filaId),
                usuario_id: parseInt(usuario_id),
                ordem: 1, // Será calculada pelo back-end
                status: 'aguardando'
            })
        });

        alert(`Você entrou na fila! Sua posição: ${data.ordem_na_fila}`);
        loadFilasDisponiveis();
    } catch (error) {
        alert('Erro ao entrar na fila: ' + error.message);
    }
}

// ===== NAVEGAÇÃO =====

function setupNavbarNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#minha-posicao') {
                window.location.href = 'minha-posicao.html';
            }
        });
    });
}

// ===== FUNÇÕES GLOBAIS =====

window.entrarNaFila = entrarNaFila;