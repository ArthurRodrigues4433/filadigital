// Filas específico
document.addEventListener('DOMContentLoaded', function() {
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        FilaDigital.logout();
    });

    // Carregar dados
    loadFilas();
    loadFilasDisponiveis();
    loadEstabelecimentosForSelect();

    // Modal
    const modal = document.getElementById('filaModal');
    const closeModal = document.getElementById('closeFilaModal');

    function closeFilaModal() {
        modal.classList.remove('show');
    }

    document.getElementById('addFilaBtn').addEventListener('click', () => {
        document.getElementById('filaForm').reset();
        modal.classList.add('show');
        // Clear any existing messages
        const messageEl = document.getElementById('filaMessage');
        if (messageEl) {
            messageEl.style.display = 'none';
            messageEl.innerHTML = '';
        }
    });

    closeModal.addEventListener('click', closeFilaModal);

    // Cancel button
    const cancelBtn = document.getElementById('cancelFilaBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeFilaModal);
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeFilaModal();
        }
    });

    // Formulário
    document.getElementById('filaForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveFila();
    });

    // Polling para atualização
    setInterval(() => {
        loadFilas();
        loadFilasDisponiveis();
    }, 30000);
});

async function loadFilas() {
    try {
        const response = await FilaDigital.apiRequest('/filas/');
        const filas = response.filas || [];

        renderFilas(filas);
    } catch (error) {
        console.error('Erro ao carregar filas:', error);
        document.getElementById('filasBody').innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-error">Erro ao carregar filas.</td>
            </tr>
        `;
    }
}

async function loadFilasDisponiveis() {
    try {
        const response = await FilaDigital.apiRequest('/filas/disponiveis');
        const filas = response.filas || [];

        renderFilasDisponiveis(filas);
    } catch (error) {
        console.error('Erro ao carregar filas disponíveis:', error);
        document.getElementById('filasDisponiveisBody').innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-error">Erro ao carregar filas disponíveis.</td>
            </tr>
        `;
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

function renderFilas(filas) {
    const tbody = document.getElementById('filasBody');
    tbody.innerHTML = '';

    if (filas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">Nenhuma fila encontrada. Crie a primeira!</td>
            </tr>
        `;
        return;
    }

    filas.forEach(fila => {
        tbody.innerHTML += `
            <tr>
                <td>${fila.id}</td>
                <td>${fila.nome}</td>
                <td>${fila.descricao || '-'}</td>
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
}

function renderFilasDisponiveis(filas) {
    const tbody = document.getElementById('filasDisponiveisBody');
    tbody.innerHTML = '';

    if (filas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">Nenhuma fila disponível no momento.</td>
            </tr>
        `;
        return;
    }

    filas.forEach(fila => {
        tbody.innerHTML += `
            <tr>
                <td>${fila.id}</td>
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

// Tornar funções globais
window.deleteFila = deleteFila;
window.entrarNaFila = entrarNaFila;
window.chamarProximo = chamarProximo;