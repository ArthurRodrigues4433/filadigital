// Minhas Filas - Página específica para gerenciamento das filas do usuário
document.addEventListener('DOMContentLoaded', function() {
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        FilaDigital.logout();
    });

    // Carregar dados iniciais
    loadFilas();
    loadEstabelecimentosForSelect();

    // Funcionalidade de navegação suave para links da navbar
    setupNavbarNavigation();

    // Modais
    const filaModal = document.getElementById('filaModal');

    // Abrir modal
    document.getElementById('addFilaBtn').addEventListener('click', () => {
        filaModal.classList.add('show');
        document.getElementById('filaForm').reset();
        // Clear any existing messages
        const messageEl = document.getElementById('filaMessage');
        if (messageEl) {
            messageEl.style.display = 'none';
            messageEl.innerHTML = '';
        }
    });

    // Fechar modal
    function closeFilaModal() {
        filaModal.classList.remove('show');
    }

    document.getElementById('closeFilaModal').addEventListener('click', closeFilaModal);

    // Cancel button
    const cancelBtn = document.getElementById('cancelFilaBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeFilaModal);
    }

    // Fechar modal clicando fora
    window.addEventListener('click', (e) => {
        if (e.target === filaModal) {
            closeFilaModal();
        }
    });

    // Formulário
    document.getElementById('filaForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveFila();
    });

    // Polling para atualização em tempo real
    setInterval(() => {
        loadFilas();
    }, 30000); // Atualizar a cada 30 segundos
});

// ===== CARREGAMENTO DE DADOS =====

async function loadFilas() {
    try {
        const response = await FilaDigital.apiRequest('/filas/');
        const filas = response.filas || [];

        const filasList = document.getElementById('filasList');

        if (filas.length === 0) {
            filasList.innerHTML = `
                <div class="text-center py-4">
                    <div class="text-muted mb-3">
                        <span style="font-size: 3rem;">📋</span>
                    </div>
                    <h4 class="text-muted">Nenhuma fila encontrada</h4>
                    <p class="text-muted">Você ainda não criou nenhuma fila.</p>
                    <p class="text-muted">Clique em "Criar Nova Fila" para começar.</p>
                </div>
            `;
            return;
        }

        let html = '<div class="table-responsive"><table class="table"><thead><tr>';
        html += '<th>Nome</th><th>Estabelecimento</th><th>Pessoas na Fila</th><th>Status</th><th>Ações</th>';
        html += '</tr></thead><tbody>';

        filas.forEach(fila => {
            const statusClass = fila.ativa ? 'text-success' : 'text-muted';
            const statusText = fila.ativa ? 'Ativa' : 'Inativa';

            html += `
                <tr>
                    <td>${fila.nome}</td>
                    <td>${fila.estabelecimento ? fila.estabelecimento.nome : '-'}</td>
                    <td><span class="badge">${fila.pessoas_na_fila}</span></td>
                    <td><span class="${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn btn-success btn-sm" onclick="chamarProximo(${fila.id})">
                            📢 Chamar
                        </button>
                        <button class="btn btn-primary btn-sm" onclick="editarFila(${fila.id})">
                            ✏️ Editar
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

    } catch (error) {
        console.error('Erro ao carregar filas:', error);
        document.getElementById('filasList').innerHTML = `
            <div class="text-center py-4">
                <div class="text-muted">
                    <span style="font-size: 2rem;">⚠️</span>
                    <p>Erro ao carregar suas filas.</p>
                </div>
            </div>
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

// ===== FUNÇÕES DE AÇÃO =====

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

async function editarFila(id) {
    // Implementar edição quando necessário
    alert('Funcionalidade de edição será implementada em breve.');
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

window.deleteFila = deleteFila;
window.chamarProximo = chamarProximo;
window.editarFila = editarFila;