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
    updateLastUpdate();

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

    // Tornar funções globais para uso em outras funções
    window.closeEstabelecimentoModal = closeEstabelecimentoModal;
    window.closeFilaModal = closeFilaModal;

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
        if (e.target === estabelecimentoModal) closeEstabelecimentoModal();
        if (e.target === filaModal) closeFilaModal();
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
        loadMinhaPosicao();
        updateLastUpdate();
    }, 30000); // Atualizar a cada 30 segundos
});

// ===== FUNÇÕES DE CARREGAMENTO =====

async function loadEstabelecimentos() {
    try {
        const response = await FilaDigital.apiRequest('/estabelecimentos/');
        const estabelecimentos = response.estabelecimentos || [];
        const estabelecimentosList = document.getElementById('estabelecimentosList');

        if (estabelecimentos.length === 0) {
            estabelecimentosList.innerHTML = '<p class="text-center text-muted">Nenhum estabelecimento encontrado. Adicione o primeiro!</p>';
            updateStats(0, null, null, null);
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
                        <button class="btn btn-danger btn-sm" onclick="deleteEstabelecimento(${est.id})">🗑️ Deletar</button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        estabelecimentosList.innerHTML = html;

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
            updateStats(null, 0, null, null);
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
                        <button class="btn btn-success btn-sm" onclick="chamarProximo(${fila.id})">📢 Chamar</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteFila(${fila.id})">🗑️ Deletar</button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        filasList.innerHTML = html;

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
            updateStats(null, null, 0, null);
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
                        <button class="btn btn-primary btn-sm" onclick="entrarNaFila(${fila.id})">➕ Entrar</button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        filasDisponiveisList.innerHTML = html;

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

        if (estabelecimentos.length === 0) {
            select.innerHTML += '<option value="" disabled>Nenhum estabelecimento disponível</option>';
            return;
        }

        estabelecimentos.forEach(est => {
            select.innerHTML += `<option value="${est.id}">${est.nome}</option>`;
        });

        console.log(`Carregados ${estabelecimentos.length} estabelecimentos para seleção`);
    } catch (error) {
        console.error('Erro ao carregar estabelecimentos:', error);
        const select = document.getElementById('filaEstabelecimento');
        select.innerHTML = '<option value="">Erro ao carregar estabelecimentos</option>';
    }
}

async function loadMinhaPosicao() {
    try {
        const posicoes = await FilaDigital.apiRequest('/filas/minha-posicao'); // já é um array
        const minhaPosicaoEl = document.getElementById('minhaPosicao');

        if (!minhaPosicaoEl) return;

        if (posicoes.length === 0) {
            minhaPosicaoEl.textContent = '-';
            updateStats(null, null, null, '-');
            return;
        }

        // Calcula a média das posições
        const media = Math.round(posicoes.reduce((acc, p) => acc + p.posicao, 0) / posicoes.length);

        minhaPosicaoEl.textContent = media;
        updateStats(null, null, null, media);

    } catch (error) {
        console.error('Erro ao carregar minha posição:', error);
        const minhaPosicaoEl = document.getElementById('minhaPosicao');
        if (minhaPosicaoEl) minhaPosicaoEl.textContent = 'Erro';
    }
}

// ===== FUNÇÕES DE ESTATÍSTICAS =====
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

// ===== FUNÇÕES DE SALVAMENTO =====
async function saveEstabelecimento() {
    const nome = document.getElementById('estNome').value;
    const rua = document.getElementById('estRua').value;
    const bairro = document.getElementById('estBairro').value;
    const cidade = document.getElementById('estCidade').value;
    const estado = document.getElementById('estEstado').value;
    const telefone = document.getElementById('estTelefone').value;

    const token = FilaDigital.getToken();
    let usuario_id = null;
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            usuario_id = payload.sub;
            console.log('Usuario ID extraído do token:', usuario_id);
        } catch (e) {
            console.warn('Não foi possível extrair ID do usuário do token');
        }
    }

    if (!usuario_id) {
        FilaDigital.showMessage('estabelecimentoMessage', 'Erro: Usuário não autenticado. Faça login novamente.');
        return;
    }

    FilaDigital.setLoading('saveEstabelecimentoBtn', true);

    try {
        await FilaDigital.apiRequest('/estabelecimentos/criar-estabelecimento', {
            method: 'POST',
            body: JSON.stringify({ nome, rua, bairro, cidade, estado, telefone, usuario_id: parseInt(usuario_id) })
        });

        FilaDigital.showMessage('estabelecimentoMessage', 'Estabelecimento criado com sucesso!', 'success');
        setTimeout(() => {
            window.closeEstabelecimentoModal();
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

    if (!estabelecimento_id) {
        FilaDigital.showMessage('filaMessage', 'Selecione um estabelecimento');
        return;
    }

    const token = FilaDigital.getToken();
    let usuario_id = null;
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            usuario_id = payload.sub;
            console.log('Usuario ID extraído do token para fila:', usuario_id);
        } catch (e) {
            console.warn('Não foi possível extrair ID do usuário do token');
        }
    }

    if (!usuario_id) {
        FilaDigital.showMessage('filaMessage', 'Erro: Usuário não autenticado. Faça login novamente.');
        return;
    }

    FilaDigital.setLoading('saveFilaBtn', true);

    try {
        await FilaDigital.apiRequest('/filas/criar-fila', {
            method: 'POST',
            body: JSON.stringify({ nome, descricao, estabelecimento_id: parseInt(estabelecimento_id) })
        });

        FilaDigital.showMessage('filaMessage', 'Fila criada com sucesso!', 'success');
        setTimeout(() => {
            window.closeFilaModal();
            document.getElementById('filaForm').reset();
            loadFilas();
        }, 1500);
    } catch (error) {
        FilaDigital.showMessage('filaMessage', error.message);
    } finally {
        FilaDigital.setLoading('saveFilaBtn', false);
    }
}

// ===== FUNÇÕES DE DELETAR =====
async function deleteEstabelecimento(id) {
    if (!confirm('Tem certeza que deseja deletar este estabelecimento?')) return;

    const token = FilaDigital.getToken();
    let usuario_id = null;
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            usuario_id = payload.sub;
        } catch (e) {
            console.warn('Não foi possível extrair ID do usuário do token');
        }
    }

    if (!usuario_id) {
        alert('Erro: Usuário não autenticado');
        return;
    }

    try {
        await FilaDigital.apiRequest(`/estabelecimentos/deletar-estabelecimento/${id}`, { method: 'POST' });
        loadEstabelecimentos();
        loadFilas(); // Recarregar filas após deletar estabelecimento
        alert('Estabelecimento deletado com sucesso!');
    } catch (error) {
        alert('Erro ao deletar estabelecimento: ' + error.message);
    }
}

async function deleteFila(id) {
    if (!confirm('Tem certeza que deseja deletar esta fila?')) return;

    const token = FilaDigital.getToken();
    let usuario_id = null;
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            usuario_id = payload.sub;
        } catch (e) {
            console.warn('Não foi possível extrair ID do usuário do token');
        }
    }

    if (!usuario_id) {
        alert('Erro: Usuário não autenticado');
        return;
    }

    try {
        await FilaDigital.apiRequest(`/filas/apagar-fila/${id}`, { method: 'POST' });
        loadFilas();
        loadFilasDisponiveis(); // Recarregar filas disponíveis após deletar fila
        alert('Fila deletada com sucesso!');
    } catch (error) {
        alert('Erro ao deletar fila: ' + error.message);
    }
}

// ===== FUNÇÕES DE INTERAÇÃO COM FILAS =====
async function entrarNaFila(filaId) {
    const token = FilaDigital.getToken();
    let usuario_id = null;
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            usuario_id = payload.sub;
        } catch (e) {
            console.warn('Não foi possível extrair ID do usuário do token');
        }
    }

    if (!usuario_id) {
        alert('Erro: Usuário não autenticado');
        return;
    }

    try {
        const data = await FilaDigital.apiRequest('/filas/entrar-na-fila', {
            method: 'POST',
            body: JSON.stringify({
                fila_id: parseInt(filaId),
                usuario_id: parseInt(usuario_id),
                ordem: 1, // será recalculado no backend
                status: 'aguardando'
            })
        });

        alert(`Você entrou na fila! Sua posição: ${data.ordem_na_fila}`);
        loadFilasDisponiveis();
        loadMinhaPosicao(); // Atualizar posição após entrar na fila
    } catch (error) {
        alert('Erro ao entrar na fila: ' + error.message);
    }
}

async function chamarProximo(filaId) {
    const token = FilaDigital.getToken();
    let usuario_id = null;
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            usuario_id = payload.sub;
        } catch (e) {
            console.warn('Não foi possível extrair ID do usuário do token');
        }
    }

    if (!usuario_id) {
        alert('Erro: Usuário não autenticado');
        return;
    }

    try {
        const data = await FilaDigital.apiRequest(`/filas/${filaId}/chamar-proximo`, { method: 'POST' });
        alert(`Usuário ${data.message} chamado!`);
        loadFilas();
        loadMinhaPosicao(); // Atualizar posição após chamar próximo
    } catch (error) {
        alert('Erro ao chamar próximo: ' + error.message);
    }
}

async function sairDaFila(posicaoId) {
    if (!confirm('Tem certeza que deseja sair desta fila?')) return;

    const token = FilaDigital.getToken();
    let usuario_id = null;
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            usuario_id = payload.sub;
        } catch (e) {
            console.warn('Não foi possível extrair ID do usuário do token');
        }
    }

    if (!usuario_id) {
        alert('Erro: Usuário não autenticado');
        return;
    }

    try {
        await FilaDigital.apiRequest(`/filas/sair-da-fila/${posicaoId}`, { method: 'DELETE' });
        alert('Você saiu da fila com sucesso!');
        loadMinhaPosicao();
        loadFilasDisponiveis(); // Recarregar filas disponíveis após sair
    } catch (error) {
        alert('Erro ao sair da fila: ' + error.message);
    }
}

// ===== FUNÇÕES DE NAVEGAÇÃO =====
function setupCardNavigation() {
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.addEventListener('click', function() {
            const label = this.querySelector('.stat-label').textContent.toLowerCase();
            if (label.includes('estabelecimentos')) window.location.href = 'estabelecimentos.html';
            else if (label.includes('filas') && !label.includes('disponíveis')) window.location.href = 'minhas-filas.html';
            else if (label.includes('disponíveis')) window.location.href = 'filas-disponiveis.html';
            else if (label.includes('posição')) window.location.href = 'minha-posicao.html';
        });

        card.style.cursor = 'pointer';
        card.addEventListener('mouseenter', () => card.style.transform = 'translateY(-4px) scale(1.02)');
        card.addEventListener('mouseleave', () => card.style.transform = 'translateY(0) scale(1)');
    });
}

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

function scrollToSection(target) {
    const element = document.querySelector(target);
    if (element) {
        const headerOffset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
}
// ===== UTILITÁRIOS =====

function updateLastUpdate() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    // Se existir um elemento para mostrar a última atualização
    const lastUpdateEl = document.getElementById('lastUpdate');
    if (lastUpdateEl) {
        lastUpdateEl.textContent = `Última atualização: ${timeString}`;
    }
}

// ===== EXPOSIÇÃO DE FUNÇÕES GLOBAIS =====

window.deleteEstabelecimento = deleteEstabelecimento;
window.deleteFila = deleteFila;
window.entrarNaFila = entrarNaFila;
window.chamarProximo = chamarProximo;
window.sairDaFila = sairDaFila;
window.scrollToSection = scrollToSection;