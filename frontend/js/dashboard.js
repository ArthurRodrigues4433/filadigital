// Dashboard específico
document.addEventListener('DOMContentLoaded', function() {
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        FilaDigital.logout();
    });

    // Carregar dados iniciais
    loadEstabelecimentos();
    loadFilas();
    loadFilasDisponiveis();
    loadMinhaPosicao();

    // Funcionalidade de rolagem suave para os cards do topo
    setupCardNavigation();

    // Funcionalidade de navegação suave para links da navbar
    setupNavbarNavigation();

    // Modais
    const estabelecimentoModal = document.getElementById('estabelecimentoModal');
    const filaModal = document.getElementById('filaModal');

    // Abrir modais
    document.getElementById('addEstabelecimentoBtn').addEventListener('click', () => {
        estabelecimentoModal.classList.add('show');
        document.getElementById('estabelecimentoForm').reset();
        // Clear any existing messages
        const messageEl = document.getElementById('estabelecimentoMessage');
        if (messageEl) {
            messageEl.style.display = 'none';
            messageEl.innerHTML = '';
        }
    });

    document.getElementById('addFilaBtn').addEventListener('click', () => {
        loadEstabelecimentosForSelect();
        filaModal.classList.add('show');
        document.getElementById('filaForm').reset();
        // Clear any existing messages
        const messageEl = document.getElementById('filaMessage');
        if (messageEl) {
            messageEl.style.display = 'none';
            messageEl.innerHTML = '';
        }
    });

    // Fechar modais
    function closeEstabelecimentoModal() {
        estabelecimentoModal.classList.remove('show');
    }

    function closeFilaModal() {
        filaModal.classList.remove('show');
    }

    document.getElementById('closeEstabelecimentoModal').addEventListener('click', closeEstabelecimentoModal);
    document.getElementById('closeFilaModal').addEventListener('click', closeFilaModal);

    // Cancel buttons
    const cancelEstabelecimentoBtn = document.getElementById('cancelEstabelecimentoBtn');
    const cancelFilaBtn = document.getElementById('cancelFilaBtn');

    if (cancelEstabelecimentoBtn) {
        cancelEstabelecimentoBtn.addEventListener('click', closeEstabelecimentoModal);
    }

    if (cancelFilaBtn) {
        cancelFilaBtn.addEventListener('click', closeFilaModal);
    }

    // Fechar modal clicando fora
    window.addEventListener('click', (e) => {
        if (e.target === estabelecimentoModal) {
            closeEstabelecimentoModal();
        }
        if (e.target === filaModal) {
            closeFilaModal();
        }
    });

    // Formulários
    document.getElementById('estabelecimentoForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveEstabelecimento();
    });

    document.getElementById('filaForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveFila();
    });

    // Polling para atualização em tempo real
    setInterval(() => {
        loadFilas();
        loadFilasDisponiveis();
    }, 30000); // Atualizar a cada 30 segundos
});

async function loadEstabelecimentos() {
    try {
        const response = await FilaDigital.apiRequest('/estabelecimentos/');
        const estabelecimentos = response.estabelecimentos || [];

        const estabelecimentosList = document.getElementById('estabelecimentosList');

        if (estabelecimentos.length === 0) {
            estabelecimentosList.innerHTML = '<p class="text-center text-muted">Nenhum estabelecimento encontrado. Adicione o primeiro!</p>';
            return;
        }

        let html = '<div class="table-responsive"><table class="table"><thead><tr><th>Nome</th><th>Endereço</th><th>Telefone</th><th>Ações</th></tr></thead><tbody>';

        estabelecimentos.forEach(est => {
            const endereco = `${est.rua}, ${est.bairro}, ${est.cidade} - ${est.estado}`;
            html += `
                <tr>
                    <td>${est.nome}</td>
                    <td>${endereco}</td>
                    <td>${est.telefone}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="deleteEstabelecimento(${est.id})">
                            🗑️ Deletar
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        estabelecimentosList.innerHTML = html;

        // Atualizar estatísticas
        updateStats(estabelecimentos.length, null, null, null);

    } catch (error) {
        console.error('Erro ao carregar estabelecimentos:', error);
        document.getElementById('estabelecimentosList').innerHTML = '<p class="text-center text-error">Erro ao carregar estabelecimentos.</p>';
    }
}

async function loadFilas() {
    try {
        const response = await FilaDigital.apiRequest('/filas/');
        const filas = response.filas || [];

        const filasList = document.getElementById('filasList');

        if (filas.length === 0) {
            filasList.innerHTML = '<p class="text-center text-muted">Nenhuma fila encontrada. Crie a primeira!</p>';
            return;
        }

        let html = '<div class="table-responsive"><table class="table"><thead><tr><th>Nome</th><th>Estabelecimento</th><th>Pessoas na Fila</th><th>Ações</th></tr></thead><tbody>';

        filas.forEach(fila => {
            html += `
                <tr>
                    <td>${fila.nome}</td>
                    <td>${fila.estabelecimento ? fila.estabelecimento.nome : '-'}</td>
                    <td><span class="badge">${fila.pessoas_na_fila}</span></td>
                    <td>
                        <button class="btn btn-success btn-sm" onclick="chamarProximo(${fila.id})">
                            📢 Chamar
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteFila(${fila.id})">
                            🗑️ Deletar
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        filasList.innerHTML = html;

        // Atualizar estatísticas
        updateStats(null, filas.length, null, null);

    } catch (error) {
        console.error('Erro ao carregar filas:', error);
        document.getElementById('filasList').innerHTML = '<p class="text-center text-error">Erro ao carregar filas.</p>';
    }
}

async function loadFilasDisponiveis() {
    try {
        const response = await FilaDigital.apiRequest('/filas/disponiveis');
        const filas = response.filas || [];

        const filasDisponiveisList = document.getElementById('filasDisponiveisList');

        if (filas.length === 0) {
            filasDisponiveisList.innerHTML = '<p class="text-center text-muted">Nenhuma fila disponível no momento.</p>';
            return;
        }

        let html = '<div class="table-responsive"><table class="table"><thead><tr><th>Nome</th><th>Estabelecimento</th><th>Pessoas na Fila</th><th>Ação</th></tr></thead><tbody>';

        filas.forEach(fila => {
            html += `
                <tr>
                    <td>${fila.nome}</td>
                    <td>${fila.estabelecimento ? fila.estabelecimento.nome : '-'}</td>
                    <td><span class="badge">${fila.pessoas_na_fila}</span></td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="entrarNaFila(${fila.id})">
                            ➕ Entrar
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        filasDisponiveisList.innerHTML = html;

        // Atualizar estatísticas
        updateStats(null, null, filas.length, null);

    } catch (error) {
        console.error('Erro ao carregar filas disponíveis:', error);
        document.getElementById('filasDisponiveisList').innerHTML = '<p class="text-center text-error">Erro ao carregar filas disponíveis.</p>';
    }
}

async function loadEstabelecimentosForSelect() {
    try {
        const response = await FilaDigital.apiRequest('/estabelecimentos/');
        const estabelecimentos = response.estabelecimentos || [];

        const select = document.getElementById('filaEstabelecimento');
        select.innerHTML = '<option value="">Selecione um estabelecimento</option>';

        estabelecimentos.forEach(est => {
            select.innerHTML += `<option value="${est.id}">${est.nome}</option>`;
        });
    } catch (error) {
        console.error('Erro ao carregar estabelecimentos:', error);
    }
}

function updateStats(estabelecimentosCount, filasCount, filasDisponiveisCount, minhaPosicao) {
    if (estabelecimentosCount !== null) {
        const el = document.getElementById('totalEstabelecimentos');
        if (el) el.textContent = estabelecimentosCount;
    }

    if (filasCount !== null) {
        const el = document.getElementById('totalFilas');
        if (el) el.textContent = filasCount;
    }

    if (filasDisponiveisCount !== null) {
        const el = document.getElementById('filasDisponiveis');
        if (el) el.textContent = filasDisponiveisCount;
    }

    if (minhaPosicao !== null) {
        const el = document.getElementById('minhaPosicao');
        if (el) el.textContent = minhaPosicao;
    }
}

async function saveEstabelecimento() {
    const nome = document.getElementById('estNome').value;
    const rua = document.getElementById('estRua').value;
    const bairro = document.getElementById('estBairro').value;
    const cidade = document.getElementById('estCidade').value;
    const estado = document.getElementById('estEstado').value;
    const telefone = document.getElementById('estTelefone').value;

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

    FilaDigital.setLoading('saveEstabelecimentoBtn', true);

    try {
        const data = await FilaDigital.apiRequest('/estabelecimentos/criar-estabelecimento', {
            method: 'POST',
            body: JSON.stringify({
                nome,
                rua,
                bairro,
                cidade,
                estado,
                telefone,
                usuario_id: parseInt(usuario_id)
            })
        });

        FilaDigital.showMessage('estabelecimentoMessage', 'Estabelecimento criado com sucesso!', 'success');
        setTimeout(() => {
            closeEstabelecimentoModal();
            document.getElementById('estabelecimentoForm').reset();
            loadEstabelecimentos();
        }, 1500);
    } catch (error) {
        FilaDigital.showMessage('estabelecimentoMessage', error.message);
    } finally {
        FilaDigital.setLoading('saveEstabelecimentoBtn', false);
    }
}

async function saveFila() {
    const nome = document.getElementById('filaNome').value;
    const descricao = document.getElementById('filaDescricao').value;
    const estabelecimento_id = document.getElementById('filaEstabelecimento').value;

    FilaDigital.setLoading('saveFilaBtn', true);

    try {
        const data = await FilaDigital.apiRequest('/filas/criar-fila', {
            method: 'POST',
            body: JSON.stringify({
                nome,
                descricao,
                estabelecimento_id: parseInt(estabelecimento_id)
            })
        });

        FilaDigital.showMessage('filaMessage', 'Fila criada com sucesso!', 'success');
        setTimeout(() => {
            closeFilaModal();
            document.getElementById('filaForm').reset();
            loadFilas();
        }, 1500);
    } catch (error) {
        FilaDigital.showMessage('filaMessage', error.message);
    } finally {
        FilaDigital.setLoading('saveFilaBtn', false);
    }
}

async function deleteEstabelecimento(id) {
    if (!confirm('Tem certeza que deseja deletar este estabelecimento?')) return;

    try {
        await FilaDigital.apiRequest(`/estabelecimentos/deletar-estabelecimento/${id}`, {
            method: 'POST'
        });

        loadEstabelecimentos();
        alert('Estabelecimento deletado com sucesso!');
    } catch (error) {
        alert('Erro ao deletar estabelecimento: ' + error.message);
    }
}

async function deleteFila(id) {
    if (!confirm('Tem certeza que deseja deletar esta fila?')) return;

    try {
        await FilaDigital.apiRequest(`/filas/apagar-fila/${id}`, {
            method: 'POST'
        });

        loadFilas();
        alert('Fila deletada com sucesso!');
    } catch (error) {
        alert('Erro ao deletar fila: ' + error.message);
    }
}

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

async function chamarProximo(filaId) {
    try {
        const data = await FilaDigital.apiRequest(`/filas/${filaId}/chamar-proximo`, {
            method: 'POST'
        });

        alert(`Usuário ${data.message} chamado!`);
        loadFilas();
    } catch (error) {
        alert('Erro ao chamar próximo: ' + error.message);
    }
}

// ===== FUNCIONALIDADES DE NAVEGAÇÃO =====

// Configurar navegação para rotas específicas nos cards do topo
function setupCardNavigation() {
    // Cards do topo como atalhos para rotas específicas
    const statCards = document.querySelectorAll('.stat-card');

    statCards.forEach(card => {
        card.addEventListener('click', function() {
            const label = this.querySelector('.stat-label').textContent.toLowerCase();

            if (label.includes('estabelecimentos')) {
                window.location.href = 'estabelecimentos.html';
            } else if (label.includes('filas') && !label.includes('disponíveis')) {
                window.location.href = 'minhas-filas.html';
            } else if (label.includes('disponíveis')) {
                window.location.href = 'filas-disponiveis.html';
            } else if (label.includes('posição')) {
                window.location.href = 'minha-posicao.html';
            }
        });

        // Adicionar cursor pointer e efeito visual
        card.style.cursor = 'pointer';
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Configurar navegação suave para links da navbar
function setupNavbarNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            scrollToSection(targetId);
        });
    });
}

// Função de rolagem suave
function scrollToSection(target) {
    const element = document.querySelector(target);
    if (element) {
        const headerOffset = 100; // Offset para compensar o header fixo
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// ===== CARREGAMENTO DE DADOS =====

// Carregar posição do usuário nas filas
async function loadMinhaPosicao() {
    try {
        // Simular dados por enquanto - implementar quando endpoint estiver disponível
        const minhaPosicaoList = document.getElementById('minhaPosicaoList');

        // Dados simulados
        const posicoes = [
            // Implementar quando endpoint estiver disponível
        ];

        if (posicoes.length === 0) {
            minhaPosicaoList.innerHTML = `
                <div class="text-center py-4">
                    <div class="text-muted mb-3">
                        <span style="font-size: 3rem;">📋</span>
                    </div>
                    <h4 class="text-muted">Nenhuma fila encontrada</h4>
                    <p class="text-muted">Você ainda não entrou em nenhuma fila.</p>
                    <p class="text-muted">Clique em "Filas Disponíveis" acima para ver opções.</p>
                </div>
            `;
        } else {
            // Renderizar posições quando houver dados
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

// Renderizar posições do usuário
function renderMinhaPosicao(posicoes) {
    const minhaPosicaoList = document.getElementById('minhaPosicaoList');

    if (posicoes.length === 0) {
        minhaPosicaoList.innerHTML = `
            <div class="text-center py-4">
                <div class="text-muted mb-3">
                    <span style="font-size: 3rem;">📋</span>
                </div>
                <h4 class="text-muted">Nenhuma fila encontrada</h4>
                <p class="text-muted">Você ainda não entrou em nenhuma fila.</p>
            </div>
        `;
        return;
    }

    let html = '<div class="table-responsive"><table class="table"><thead><tr>';
    html += '<th>Fila</th><th>Estabelecimento</th><th>Sua Posição</th><th>Status</th><th>Ações</th>';
    html += '</tr></thead><tbody>';

    posicoes.forEach(posicao => {
        const statusClass = posicao.status === 'aguardando' ? 'text-warning' :
                           posicao.status === 'chamado' ? 'text-success' : 'text-muted';

        html += `
            <tr>
                <td>${posicao.fila_nome}</td>
                <td>${posicao.estabelecimento_nome}</td>
                <td><strong>${posicao.posicao}</strong></td>
                <td><span class="${statusClass}">${posicao.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="sairDaFila(${posicao.id})">
                        Sair da Fila
                    </button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    minhaPosicaoList.innerHTML = html;
}

// ===== FUNÇÕES ADICIONAIS =====

// Sair da fila
async function sairDaFila(posicaoId) {
    if (!confirm('Tem certeza que deseja sair desta fila?')) return;

    try {
        // Implementar quando endpoint estiver disponível
        alert('Funcionalidade "Sair da Fila" será implementada quando o endpoint estiver disponível.');
        loadMinhaPosicao(); // Recarregar posições
    } catch (error) {
        alert('Erro ao sair da fila: ' + error.message);
    }
}

// ===== FUNÇÕES GLOBAIS =====

// Tornar funções globais para uso em HTML
window.deleteEstabelecimento = deleteEstabelecimento;
window.deleteFila = deleteFila;
window.entrarNaFila = entrarNaFila;
window.chamarProximo = chamarProximo;
window.sairDaFila = sairDaFila;
window.scrollToSection = scrollToSection;