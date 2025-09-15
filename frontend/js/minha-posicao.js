// Minha Posição - Página específica para acompanhar posição nas filas
document.addEventListener('DOMContentLoaded', function() {
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        FilaDigital.logout();
    });

    // Carregar dados iniciais
    loadMinhaPosicao();
    loadHistorico();

    // Funcionalidade de navegação suave para links da navbar
    setupNavbarNavigation();

    // Toggle histórico
    document.getElementById('toggleHistoricoBtn').addEventListener('click', function() {
        const historicoContent = document.getElementById('historicoContent');
        const isVisible = !historicoContent.classList.contains('d-none');

        if (isVisible) {
            historicoContent.classList.add('d-none');
            this.textContent = '▼ Mostrar Histórico';
        } else {
            historicoContent.classList.remove('d-none');
            this.textContent = '▲ Ocultar Histórico';
            if (!historicoContent.querySelector('table')) {
                loadHistorico();
            }
        }
    });

    // Botão de atualizar
    document.getElementById('refreshBtn').addEventListener('click', () => {
        loadMinhaPosicao();
        loadHistorico();
        updateLastUpdate();
    });

    // Atualizar timestamp
    updateLastUpdate();

    // Polling para atualização em tempo real
    setInterval(() => {
        loadMinhaPosicao();
        loadHistorico(); // ALTERAÇÃO: adicionada atualização do histórico automaticamente
        updateLastUpdate();
    }, 30000); // Atualizar a cada 30 segundos
});

// ===== CARREGAMENTO DE DADOS =====

// ALTERAÇÃO: agora faz fetch da API em vez de arrays vazios
async function loadMinhaPosicao() {
    try {
        const minhaPosicaoList = document.getElementById('minhaPosicaoList');

        const posicoes = await FilaDigital.apiRequest('/filas/minha-posicao');

        // Atualizar estatísticas
        updateStats(posicoes);

        if (posicoes.length === 0) {
            minhaPosicaoList.innerHTML = `
                <div class="text-center py-4">
                    <div class="text-muted mb-3">
                        <span style="font-size: 3rem;">📋</span>
                    </div>
                    <h4 class="text-muted">Nenhuma fila ativa</h4>
                    <p class="text-muted">Você não está em nenhuma fila no momento.</p>
                    <p class="text-muted">Clique em "Filas Disponíveis" para entrar em uma fila.</p>
                </div>
            `;
        } else {
            renderMinhaPosicao(posicoes);
        }
    } catch (error) {
        console.error('Erro ao carregar posição:', error);
        document.getElementById('minhaPosicaoList').innerHTML = `
            <div class="text-center py-4">
                <div class="text-muted">
                    <span style="font-size: 2rem;">⚠️</span>
                    <p>Erro ao carregar sua posição nas filas.</p>
                </div>
            </div>
        `;
    }
}

// ALTERAÇÃO: agora faz fetch da API em vez de arrays vazios
async function loadHistorico() {
    try {
        const historicoList = document.getElementById('historicoList');

        const historico = await FilaDigital.apiRequest('/filas/historico');

        if (historico.length === 0) {
            historicoList.innerHTML = `
                <div class="text-center py-4">
                    <div class="text-muted mb-3">
                        <span style="font-size: 3rem;">📚</span>
                    </div>
                    <h4 class="text-muted">Nenhum histórico encontrado</h4>
                    <p class="text-muted">Você ainda não participou de nenhuma fila.</p>
                </div>
            `;
        } else {
            renderHistorico(historico);
        }
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        document.getElementById('historicoList').innerHTML = `
            <div class="text-center py-4">
                <div class="text-muted">
                    <span style="font-size: 2rem;">⚠️</span>
                    <p>Erro ao carregar histórico.</p>
                </div>
            </div>
        `;
    }
}

// ===== RENDERIZAÇÃO =====

function renderMinhaPosicao(posicoes) {
    const minhaPosicaoList = document.getElementById('minhaPosicaoList');

    if (posicoes.length === 0) {
        minhaPosicaoList.innerHTML = `
            <div class="text-center py-4">
                <div class="text-muted mb-3">
                    <span style="font-size: 3rem;">📋</span>
                </div>
                <h4 class="text-muted">Nenhuma fila ativa</h4>
                <p class="text-muted">Você não está em nenhuma fila no momento.</p>
            </div>
        `;
        return;
    }

    let html = '<div class="table-responsive"><table class="table"><thead><tr>';
    html += '<th>Fila</th><th>Estabelecimento</th><th>Sua Posição</th><th>Status</th><th>Tempo Estimado</th><th>Ações</th>';
    html += '</tr></thead><tbody>';

    posicoes.forEach(posicao => {
        const statusClass = posicao.status === 'aguardando' ? 'text-warning' :
                           posicao.status === 'chamado' ? 'text-success' : 'text-muted';
        const tempoEstimado = calcularTempoEstimado(posicao.posicao);

        html += `
            <tr>
                <td>
                    <div>
                        <strong>${posicao.fila_nome}</strong>
                        ${posicao.fila_descricao ? `<br><small class="text-muted">${posicao.fila_descricao}</small>` : ''}
                    </div>
                </td>
                <td>${posicao.estabelecimento_nome}</td>
                <td><span class="badge badge-lg">${posicao.posicao}</span></td>
                <td><span class="${statusClass}">${posicao.status}</span></td>
                <td><span class="text-info">${tempoEstimado}</span></td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="sairDaFila(${posicao.id})">
                        🚪 Sair da Fila
                    </button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    minhaPosicaoList.innerHTML = html;
}

function renderHistorico(historico) {
    const historicoList = document.getElementById('historicoList');

    if (historico.length === 0) {
        historicoList.innerHTML = `
            <div class="text-center py-4">
                <div class="text-muted mb-3">
                    <span style="font-size: 3rem;">📚</span>
                </div>
                <h4 class="text-muted">Nenhum histórico encontrado</h4>
                <p class="text-muted">Você ainda não participou de nenhuma fila.</p>
            </div>
        `;
        return;
    }

    let html = '<div class="table-responsive"><table class="table"><thead><tr>';
    html += '<th>Data/Hora</th><th>Fila</th><th>Estabelecimento</th><th>Posição Final</th><th>Status</th>';
    html += '</tr></thead><tbody>';

    historico.forEach(item => {
        const statusClass = item.status === 'concluido' ? 'text-success' :
                           item.status === 'cancelado' ? 'text-danger' : 'text-muted';
        const dataFormatada = new Date(item.data_hora).toLocaleString('pt-BR');

        html += `
            <tr>
                <td>${dataFormatada}</td>
                <td>${item.fila_nome}</td>
                <td>${item.estabelecimento_nome}</td>
                <td>${item.posicao_final}</td>
                <td><span class="${statusClass}">${item.status}</span></td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    historicoList.innerHTML = html;
}

// ===== ESTATÍSTICAS =====

function updateStats(posicoes) {
    const totalFilasAtivas = posicoes.length;
    const posicaoMedia = posicoes.length > 0 ?
        Math.round(posicoes.reduce((sum, p) => sum + p.posicao, 0) / posicoes.length) : '-';
    const tempoEstimado = posicoes.length > 0 ? calcularTempoEstimado(posicaoMedia) : '-';

    document.getElementById('totalFilasAtivas').textContent = totalFilasAtivas;
    document.getElementById('posicaoMedia').textContent = posicaoMedia;
    document.getElementById('tempoEstimado').textContent = tempoEstimado;
    document.getElementById('notificacoes').textContent = '0'; // Implementar notificações
}

// ===== UTILITÁRIOS =====

function calcularTempoEstimado(posicao) {
    if (posicao === '-') return '-';
    const minutos = posicao * 5;

    if (minutos < 60) {
        return `${minutos} min`;
    } else {
        const horas = Math.floor(minutos / 60);
        const minutosRestantes = minutos % 60;
        return `${horas}h ${minutosRestantes}min`;
    }
}

function updateLastUpdate() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('ultimaAtualizacao').textContent = timeString;
}

// ===== FUNÇÕES DE AÇÃO =====

async function sairDaFila(posicaoId) {
    if (!confirm('Tem certeza que deseja sair desta fila?')) return;

    try {
        await FilaDigital.apiRequest(`/filas/sair-da-fila/${posicaoId}`, { method: 'DELETE' });

        alert('Você saiu da fila com sucesso!');
        loadMinhaPosicao();
        loadHistorico(); // ALTERAÇÃO: atualizar histórico após sair
    } catch (error) {
        alert('Erro ao sair da fila: ' + error.message);
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
                return;
            }
        });
    });
}

// ===== FUNÇÕES GLOBAIS =====

window.sairDaFila = sairDaFila;
