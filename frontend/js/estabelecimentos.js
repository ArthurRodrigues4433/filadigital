// Estabelecimentos específico
document.addEventListener('DOMContentLoaded', function() {
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        FilaDigital.logout();
    });

    // Carregar estabelecimentos
    loadEstabelecimentos();

    // Modal
    const modal = document.getElementById('estabelecimentoModal');
    const closeModal = document.getElementById('closeEstabelecimentoModal');

    function closeEstabelecimentoModal() {
        modal.classList.remove('show');
    }

    document.getElementById('addEstabelecimentoBtn').addEventListener('click', () => {
        document.getElementById('modalTitle').textContent = '🏢 Adicionar Estabelecimento';
        document.getElementById('estabelecimentoId').value = '';
        document.getElementById('estabelecimentoForm').reset();
        modal.classList.add('show');
        // Clear any existing messages
        const messageEl = document.getElementById('estabelecimentoMessage');
        if (messageEl) {
            messageEl.style.display = 'none';
            messageEl.innerHTML = '';
        }
    });

    closeModal.addEventListener('click', closeEstabelecimentoModal);

    // Cancel button
    const cancelBtn = document.getElementById('cancelEstabelecimentoBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeEstabelecimentoModal);
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeEstabelecimentoModal();
        }
    });

    // Formulário
    document.getElementById('estabelecimentoForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('estabelecimentoId').value;
        if (id) {
            await updateEstabelecimento(id);
        } else {
            await saveEstabelecimento();
        }
    });
});

async function loadEstabelecimentos() {
    try {
        const response = await FilaDigital.apiRequest('/estabelecimentos/');
        const estabelecimentos = response.estabelecimentos || [];

        renderEstabelecimentos(estabelecimentos);
    } catch (error) {
        console.error('Erro ao carregar estabelecimentos:', error);
        document.getElementById('estabelecimentosBody').innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-error">Erro ao carregar estabelecimentos.</td>
            </tr>
        `;
    }
}

function renderEstabelecimentos(estabelecimentos) {
    const tbody = document.getElementById('estabelecimentosBody');
    tbody.innerHTML = '';

    if (estabelecimentos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">Nenhum estabelecimento encontrado. Adicione o primeiro!</td>
            </tr>
        `;
        return;
    }

    estabelecimentos.forEach(est => {
        const endereco = `${est.rua}, ${est.bairro}, ${est.cidade} - ${est.estado}`;
        tbody.innerHTML += `
            <tr>
                <td>${est.id}</td>
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

async function updateEstabelecimento(id) {
    // Nota: O back-end não tem endpoint para atualizar estabelecimento
    // Implementar quando disponível
    alert('Funcionalidade de atualização em desenvolvimento');
}

async function editEstabelecimento(id) {
    // Nota: Como não temos endpoint para buscar estabelecimento específico,
    // vamos simular ou implementar quando disponível
    alert('Funcionalidade de edição em desenvolvimento');
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

// Tornar funções globais
window.editEstabelecimento = editEstabelecimento;
window.deleteEstabelecimento = deleteEstabelecimento;