// FilaDigital - Sistema de Gerenciamento de Filas
// JavaScript para interações do frontend

// Estado global da aplicação
let appState = {
    currentUser: null,
    currentQueue: null,
    selectedQueue: null,
    establishments: [],
    queues: [],
    employees: []
};

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Configurar navegação mobile
    setupMobileNavigation();

    // Configurar formulários
    setupForms();

    // Carregar dados baseado na página atual
    loadPageData();

    // Configurar eventos gerais
    setupGeneralEvents();
}

// Navegação mobile
function setupMobileNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // Fechar menu ao clicar em um link
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }
}

// Configuração de formulários
function setupForms() {
    // Formulário de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Formulário de registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Formulários dos modais
    const establishmentForm = document.getElementById('establishmentForm');
    if (establishmentForm) {
        establishmentForm.addEventListener('submit', handleAddEstablishment);
    }

    const employeeForm = document.getElementById('employeeForm');
    if (employeeForm) {
        employeeForm.addEventListener('submit', handleAddEmployee);
    }

    const queueForm = document.getElementById('queueForm');
    if (queueForm) {
        queueForm.addEventListener('submit', handleAddQueue);
    }
}

// Carregar dados da página
function loadPageData() {
    const currentPage = getCurrentPage();

    // Verificar autenticação para páginas protegidas
    if (['dashboard-cliente', 'dashboard-dono', 'dashboard-funcionario', 'qrcode'].includes(currentPage)) {
        if (!window.FilaDigitalAPI.isAuthenticated()) {
            window.location.href = '/frontend/index.html';
            return;
        }
    }

    switch (currentPage) {
        case 'dashboard-cliente':
            loadClientDashboard();
            break;
        case 'dashboard-dono':
            loadOwnerDashboard();
            break;
        case 'dashboard-funcionario':
            loadEmployeeDashboard();
            break;
        case 'qrcode':
            loadQRCodePage();
            break;
    }
}

function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop().split('.')[0];
    return filename || 'index';
}

// Handlers de formulários
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Mostrar loading
    showModal('loadingModal');

    try {
        const result = await window.FilaDigitalAPI.login(email, password);

        if (result.success) {
            console.log('Login successful:', result.user);

            // Redirecionar baseado no tipo de usuário
            const role = result.user.role;
            let dashboardUrl = 'dashboard-cliente.html'; // padrão

            if (role === 'dono') {
                dashboardUrl = 'dashboard-dono.html';
            } else if (role === 'funcionario') {
                dashboardUrl = 'dashboard-funcionario.html';
            }

            console.log('Redirecting to:', dashboardUrl, 'for role:', role);
            closeModal();
            window.location.href = dashboardUrl;
        } else {
            closeModal();
            alert(result.error || 'Erro no login');
        }
    } catch (error) {
        console.error('Login error:', error);
        closeModal();
        alert('Erro de conexão. Tente novamente.');
    }
}

async function handleRegister(e) {
    e.preventDefault();

    const nameField = document.getElementById('name');
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    const userTypeField = document.getElementById('userType');

    if (!nameField || !emailField || !passwordField || !userTypeField) {
        alert('Erro: Campos do formulário não encontrados!');
        return;
    }

    const formData = {
        name: nameField.value.trim(),
        email: emailField.value.trim(),
        password: passwordField.value.trim(),
        userType: userTypeField.value
    };

    // Validação básica
    if (!formData.name || !formData.email || !formData.password || !formData.userType) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    if (formData.password.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres!');
        return;
    }

    console.log('Register attempt:', formData);

    // Mostrar loading
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Registrando...';
    }

    try {
        const result = await window.FilaDigitalAPI.register(formData);
        console.log('Registration result:', result);

        if (result.success) {
            alert('Registro realizado com sucesso! Faça login para continuar.');
            window.location.href = '/frontend/index.html';
        } else {
            console.error('Registration failed:', result.error);
            console.error('Full result object:', result);
            alert(`Erro no registro: ${result.error}`);
        }
    } catch (error) {
        console.error('Register error:', error);
        console.error('Error stack:', error.stack);
        alert('Erro de conexão. Tente novamente.');
    } finally {
        // Restaurar botão
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Registrar';
        }
    }
}

async function handleAddEstablishment(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('establishmentName').value,
        address: document.getElementById('establishmentAddress').value,
        bairro: '',
        cidade: '',
        estado: '',
        telefone: ''
    };

    console.log('Add establishment:', formData);

    try {
        const result = await window.FilaDigitalAPI.createEstablishment(formData);

        if (result.success) {
            console.log('Establishment created:', result.data);
            closeModal();
            loadEstablishmentsList();

            // Reset form
            e.target.reset();
        } else {
            alert(result.error || 'Erro ao criar estabelecimento');
        }
    } catch (error) {
        console.error('Error creating establishment:', error);
        alert('Erro de conexão. Tente novamente.');
    }
}

async function handleAddEmployee(e) {
    e.preventDefault();

    const formData = {
        employee_id: parseInt(document.getElementById('employeeEstablishment').value),
        establishment_id: parseInt(document.getElementById('employeeEstablishment').value)
    };

    console.log('Add employee to establishment:', formData);

    try {
        const success = await window.FilaDigitalAPI.addEmployeeToEstablishment(
            formData.establishment_id,
            formData.employee_id
        );

        if (success) {
            console.log('Employee added successfully');
            closeModal();
            loadEmployeesList();

            // Reset form
            e.target.reset();
        } else {
            alert('Erro ao adicionar funcionário');
        }
    } catch (error) {
        console.error('Error adding employee:', error);
        alert('Erro de conexão. Tente novamente.');
    }
}

async function handleAddQueue(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('queueName').value,
        description: '',
        estabelecimento_id: parseInt(document.getElementById('queueEstablishment').value)
    };

    console.log('Add queue:', formData);

    try {
        const result = await window.FilaDigitalAPI.createQueue(formData);

        if (result.success) {
            console.log('Queue created:', result.data);
            closeModal();
            loadQueuesList();

            // Reset form
            e.target.reset();
        } else {
            alert(result.error || 'Erro ao criar fila');
        }
    } catch (error) {
        console.error('Error creating queue:', error);
        alert('Erro de conexão. Tente novamente.');
    }
}

// Carregar dashboards
async function loadClientDashboard() {
    // Verificar se usuário está autenticado
    if (!window.FilaDigitalAPI.isAuthenticated()) {
        window.location.href = '/frontend/index.html';
        return;
    }

    await loadQueuesGrid();
    await loadClientHistory();

    // Verificar se usuário já está em uma fila
    setTimeout(async () => {
        await showCurrentQueue();
    }, 1000);
}

async function loadOwnerDashboard() {
    // Verificar se usuário está autenticado e é dono
    if (!window.FilaDigitalAPI.isAuthenticated() || !window.FilaDigitalAPI.hasRole('dono')) {
        window.location.href = '/frontend/index.html';
        return;
    }

    await loadEstablishmentsList();
    await loadEmployeesList();
    await loadQueuesList();
}

async function loadEmployeeDashboard() {
    // Verificar se usuário está autenticado e é funcionario
    if (!window.FilaDigitalAPI.isAuthenticated() || !window.FilaDigitalAPI.hasRole('funcionario')) {
        window.location.href = '/frontend/index.html';
        return;
    }

    await loadEmployeeQueues();
    await loadServiceHistory();
}

// Carregar filas (Cliente)
async function loadQueuesGrid() {
    const filasGrid = document.getElementById('filasGrid');
    if (!filasGrid) return;

    filasGrid.innerHTML = '<div class="loading">Carregando filas...</div>';

    try {
        const queues = await window.FilaDigitalAPI.getAvailableQueues();
        filasGrid.innerHTML = '';

        if (queues.length === 0) {
            filasGrid.innerHTML = '<p class="no-data">Nenhuma fila disponível no momento.</p>';
            return;
        }

        queues.forEach(queue => {
            const queueCard = createQueueCard(queue);
            filasGrid.appendChild(queueCard);
        });
    } catch (error) {
        console.error('Error loading queues:', error);
        filasGrid.innerHTML = '<p class="error">Erro ao carregar filas. Tente novamente.</p>';
    }
}

function createQueueCard(queue) {
    const card = document.createElement('div');
    card.className = 'queue-card';

    // Calcular status baseado no número de pessoas
    let status = 'active';
    let statusClass = 'status-dot';
    if (queue.pessoas_na_fila >= 10) {
        status = 'busy';
        statusClass = 'status-dot busy';
    }

    card.innerHTML = `
        <h3>${queue.nome}</h3>
        <p>${queue.descricao || 'Fila de atendimento'}</p>
        <div class="queue-info">
            <div class="queue-status">
                <div class="${statusClass}"></div>
                <span>${getStatusText(status)}</span>
            </div>
            <div class="people-count">${queue.pessoas_na_fila} pessoas</div>
        </div>
        <p><strong>Estabelecimento:</strong> ${queue.estabelecimento?.nome || 'N/A'}</p>
        <button class="btn btn-primary" onclick="joinQueue(${queue.id})">
            Entrar na Fila
        </button>
    `;

    return card;
}

function getStatusText(status) {
    const statusTexts = {
        'active': 'Ativo',
        'busy': 'Ocupado',
        'closed': 'Fechado'
    };
    return statusTexts[status] || 'Desconhecido';
}

// Entrar na fila
async function joinQueue(queueId) {
    try {
        // Buscar informações da fila
        const queues = await window.FilaDigitalAPI.getAvailableQueues();
        const queue = queues.find(q => q.id === queueId);

        if (!queue) {
            alert('Fila não encontrada.');
            return;
        }

        appState.selectedQueue = queue;

        const confirmMessage = document.getElementById('confirmMessage');
        if (confirmMessage) {
            confirmMessage.textContent = `Deseja entrar na fila do ${queue.nome}?`;
        }

        showModal('confirmModal');
    } catch (error) {
        console.error('Error getting queue info:', error);
        alert('Erro ao carregar informações da fila.');
    }
}

async function confirmJoinQueue() {
    if (!appState.selectedQueue) return;

    console.log('Joining queue:', appState.selectedQueue);

    try {
        const result = await window.FilaDigitalAPI.joinQueue(appState.selectedQueue.id);

        if (result.success) {
            console.log('Successfully joined queue:', result.data);

            // Atualizar estado da aplicação
            appState.currentQueue = {
                ...appState.selectedQueue,
                userPosition: result.data.ordem_na_fila,
                joinTime: new Date(),
                priority: result.data.prioridade
            };

            closeModal();
            await showCurrentQueue();

            // Recarregar filas para atualizar contadores
            await loadQueuesGrid();
        } else {
            closeModal();
            alert(result.error || 'Erro ao entrar na fila');
        }
    } catch (error) {
        console.error('Error joining queue:', error);
        closeModal();
        alert('Erro de conexão. Tente novamente.');
    }
}

async function showCurrentQueue() {
    const currentQueueSection = document.getElementById('currentQueue');
    if (!currentQueueSection) return;

    try {
        const positions = await window.FilaDigitalAPI.getMyPosition();

        if (positions.length > 0) {
            const currentPosition = positions[0]; // Pega a primeira posição ativa

            const positionNumber = document.getElementById('positionNumber');
            const currentEstablishment = document.getElementById('currentEstablishment');
            const estimatedTime = document.getElementById('estimatedTime');

            if (positionNumber) positionNumber.textContent = currentPosition.ordem;
            if (currentEstablishment) currentEstablishment.textContent = currentPosition.fila.nome;
            if (estimatedTime) estimatedTime.textContent = '15-20 min'; // Pode ser calculado

            appState.currentQueue = {
                id: currentPosition.fila_id,
                positionId: currentPosition.id,
                userPosition: currentPosition.ordem,
                name: currentPosition.fila.nome
            };

            currentQueueSection.style.display = 'block';
        }
    } catch (error) {
        console.error('Error getting current position:', error);
    }
}

async function leaveQueue() {
    if (!appState.currentQueue) return;

    if (confirm('Tem certeza que deseja sair da fila?')) {
        console.log('Leaving queue:', appState.currentQueue);

        try {
            const success = await window.FilaDigitalAPI.leaveQueue(appState.currentQueue.positionId);

            if (success) {
                appState.currentQueue = null;

                const currentQueueSection = document.getElementById('currentQueue');
                if (currentQueueSection) {
                    currentQueueSection.style.display = 'none';
                }

                await loadQueuesGrid();
            } else {
                alert('Erro ao sair da fila');
            }
        } catch (error) {
            console.error('Error leaving queue:', error);
            alert('Erro de conexão. Tente novamente.');
        }
    }
}

// Carregar histórico do cliente
async function loadClientHistory() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;

    historyList.innerHTML = '<div class="loading">Carregando histórico...</div>';

    try {
        const history = await window.FilaDigitalAPI.getQueueHistory();
        historyList.innerHTML = '';

        if (history.length === 0) {
            historyList.innerHTML = '<p class="no-data">Nenhum histórico encontrado.</p>';
            return;
        }

        history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'list-item';

            // Formatar data
            const date = new Date(item.data_hora);
            const formattedDate = date.toLocaleDateString('pt-BR');
            const formattedTime = date.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });

            historyItem.innerHTML = `
                <div class="item-info">
                    <h4>${item.fila_nome}</h4>
                    <p>${formattedDate} às ${formattedTime} - ${item.estabelecimento_nome} - Status: ${item.status}</p>
                </div>
            `;

            historyList.appendChild(historyItem);
        });
    } catch (error) {
        console.error('Error loading history:', error);
        historyList.innerHTML = '<p class="error">Erro ao carregar histórico.</p>';
    }
}

// Carregar listas do dashboard do dono
async function loadEstablishmentsList() {
    const establishmentsList = document.getElementById('establishmentsList');
    if (!establishmentsList) return;

    establishmentsList.innerHTML = '<div class="loading">Carregando estabelecimentos...</div>';

    try {
        const establishments = await window.FilaDigitalAPI.getEstablishments();
        establishmentsList.innerHTML = '';

        if (establishments.length === 0) {
            establishmentsList.innerHTML = '<p class="no-data">Nenhum estabelecimento encontrado.</p>';
            return;
        }

        establishments.forEach(establishment => {
            const listItem = document.createElement('div');
            listItem.className = 'list-item';

            listItem.innerHTML = `
                <div class="item-info">
                    <h4>${establishment.nome}</h4>
                    <p>${establishment.rua}, ${establishment.bairro} - ${establishment.cidade}</p>
                </div>
                <div class="item-actions">
                    <button class="btn btn-secondary" onclick="editEstablishment(${establishment.id})">Editar</button>
                    <button class="btn btn-danger" onclick="deleteEstablishment(${establishment.id})">Excluir</button>
                </div>
            `;

            establishmentsList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error loading establishments:', error);
        establishmentsList.innerHTML = '<p class="error">Erro ao carregar estabelecimentos.</p>';
    }
}

async function loadEmployeesList() {
    const employeesList = document.getElementById('employeesList');
    if (!employeesList) return;

    employeesList.innerHTML = '<div class="loading">Carregando funcionários...</div>';

    try {
        // Buscar estabelecimentos primeiro para obter funcionários
        const establishments = await window.FilaDigitalAPI.getEstablishments();
        let allEmployees = [];

        // Para cada estabelecimento, buscar funcionários
        for (const establishment of establishments) {
            const employees = await window.FilaDigitalAPI.getEstablishmentEmployees(establishment.id);
            allEmployees = allEmployees.concat(employees.map(emp => ({
                ...emp,
                establishment_name: establishment.nome
            })));
        }

        employeesList.innerHTML = '';

        if (allEmployees.length === 0) {
            employeesList.innerHTML = '<p class="no-data">Nenhum funcionário encontrado.</p>';
            return;
        }

        allEmployees.forEach(employee => {
            const listItem = document.createElement('div');
            listItem.className = 'list-item';

            listItem.innerHTML = `
                <div class="item-info">
                    <h4>${employee.nome}</h4>
                    <p>${employee.email} - ${employee.establishment_name} - Ativo</p>
                </div>
                <div class="item-actions">
                    <button class="btn btn-secondary" onclick="editEmployee(${employee.id})">Editar</button>
                    <button class="btn btn-danger" onclick="deleteEmployee(${employee.id})">Excluir</button>
                </div>
            `;

            employeesList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error loading employees:', error);
        employeesList.innerHTML = '<p class="error">Erro ao carregar funcionários.</p>';
    }
}

async function loadQueuesList() {
    const queuesList = document.getElementById('queuesList');
    if (!queuesList) return;

    queuesList.innerHTML = '<div class="loading">Carregando filas...</div>';

    try {
        const queues = await window.FilaDigitalAPI.getQueues();
        queuesList.innerHTML = '';

        if (queues.length === 0) {
            queuesList.innerHTML = '<p class="no-data">Nenhuma fila encontrada.</p>';
            return;
        }

        queues.forEach(queue => {
            const listItem = document.createElement('div');
            listItem.className = 'list-item';

            listItem.innerHTML = `
                <div class="item-info">
                    <h4>${queue.nome}</h4>
                    <p>${queue.descricao || 'Sem descrição'} - ${queue.pessoas_na_fila} pessoas</p>
                </div>
                <div class="item-actions">
                    <button class="btn btn-secondary" onclick="editQueue(${queue.id})">Editar</button>
                    <button class="btn btn-danger" onclick="deleteQueue(${queue.id})">Excluir</button>
                </div>
            `;

            queuesList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error loading queues:', error);
        queuesList.innerHTML = '<p class="error">Erro ao carregar filas.</p>';
    }
}

// Dashboard do funcionário
async function loadEmployeeQueues() {
    const employeeQueuesGrid = document.getElementById('employeeQueuesGrid');
    if (!employeeQueuesGrid) return;

    employeeQueuesGrid.innerHTML = '<div class="loading">Carregando filas...</div>';

    try {
        const dashboardData = await window.FilaDigitalAPI.getEmployeeDashboard();

        if (dashboardData && dashboardData.filas) {
            employeeQueuesGrid.innerHTML = '';

            if (dashboardData.filas.length === 0) {
                employeeQueuesGrid.innerHTML = '<p class="no-data">Nenhuma fila encontrada para seu estabelecimento.</p>';
                return;
            }

            dashboardData.filas.forEach(queue => {
                const queueCard = createEmployeeQueueCard(queue);
                employeeQueuesGrid.appendChild(queueCard);
            });
        } else {
            employeeQueuesGrid.innerHTML = '<p class="error">Erro ao carregar dados do dashboard.</p>';
        }
    } catch (error) {
        console.error('Error loading employee queues:', error);
        employeeQueuesGrid.innerHTML = '<p class="error">Erro ao carregar filas.</p>';
    }
}

function createEmployeeQueueCard(queue) {
    const card = document.createElement('div');
    card.className = 'employee-queue-card';

    card.innerHTML = `
        <div class="queue-header">
            <h3>${queue.fila_nome}</h3>
            <span class="queue-count">${queue.clientes_aguardando}</span>
        </div>
        <div class="next-client">
            <h4>Próximo Cliente:</h4>
            <p>${queue.clientes_aguardando > 0 ? 'Cliente na posição 1' : 'Nenhum cliente na fila'}</p>
        </div>
        <div class="queue-actions">
            <button class="btn btn-primary" onclick="callNext(${queue.fila_id})"
                    ${queue.clientes_aguardando === 0 ? 'disabled' : ''}>
                Chamar Próximo
            </button>
            <button class="btn btn-secondary" onclick="viewQueueDetails(${queue.fila_id})">
                Ver Detalhes
            </button>
        </div>
    `;

    return card;
}

async function callNext(queueId) {
    try {
        // Verificar se há clientes na fila
        const dashboardData = await window.FilaDigitalAPI.getEmployeeDashboard();
        const queue = dashboardData.filas.find(q => q.fila_id === queueId);

        if (!queue || queue.clientes_aguardando === 0) {
            alert('Não há clientes na fila.');
            return;
        }

        appState.selectedQueue = queue;

        const nextClientName = document.getElementById('nextClientName');
        const nextClientPosition = document.getElementById('nextClientPosition');

        if (nextClientName) nextClientName.textContent = 'Cliente';
        if (nextClientPosition) nextClientPosition.textContent = '1';

        showModal('callNextModal');
    } catch (error) {
        console.error('Error checking queue:', error);
        alert('Erro ao verificar fila.');
    }
}

async function confirmCallNext() {
    if (!appState.selectedQueue) return;

    console.log('Calling next client for queue:', appState.selectedQueue);

    try {
        const result = await window.FilaDigitalAPI.callNextCustomer(appState.selectedQueue.fila_id);

        if (result.success) {
            console.log('Next customer called:', result.data);
            closeModal();
            await loadEmployeeQueues();

            // Recarregar histórico de atendimentos
            const serviceHistory = document.getElementById('serviceHistory');
            if (serviceHistory) {
                await loadServiceHistory();
            }
        } else {
            closeModal();
            alert(result.error || 'Erro ao chamar próximo cliente');
        }
    } catch (error) {
        console.error('Error calling next customer:', error);
        closeModal();
        alert('Erro de conexão. Tente novamente.');
    }
}

async function loadServiceHistory() {
    const serviceHistory = document.getElementById('serviceHistory');
    if (!serviceHistory) return;

    serviceHistory.innerHTML = '<div class="loading">Carregando histórico...</div>';

    try {
        // Por enquanto, vamos buscar o histórico de filas do cliente
        // que pode incluir atendimentos realizados
        const history = await window.FilaDigitalAPI.getQueueHistory();

        serviceHistory.innerHTML = '';

        if (history.length === 0) {
            serviceHistory.innerHTML = '<p class="no-data">Nenhum atendimento encontrado.</p>';
            return;
        }

        history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'list-item';

            // Formatar data
            const date = new Date(item.data_hora);
            const formattedTime = date.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });

            historyItem.innerHTML = `
                <div class="item-info">
                    <h4>${item.fila_nome}</h4>
                    <p>${formattedTime} - ${item.estabelecimento_nome} - ${item.status}</p>
                </div>
            `;

            serviceHistory.appendChild(historyItem);
        });
    } catch (error) {
        console.error('Error loading service history:', error);
        serviceHistory.innerHTML = '<p class="error">Erro ao carregar histórico de atendimentos.</p>';
    }
}

// QR Code
function loadQRCodePage() {
    // Configurar tabs do QR Code
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = e.target.textContent.includes('Escanear') ? 'scan' : 'generate';
            showQRTab(tabName);
        });
    });
}

function showQRTab(tabName) {
    // Remover classe active de todas as tabs
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.qr-section').forEach(section => section.classList.remove('active'));

    // Ativar tab selecionada
    const activeBtn = tabName === 'scan' ?
        document.querySelector('.tab-btn:first-child') :
        document.querySelector('.tab-btn:last-child');

    if (activeBtn) activeBtn.classList.add('active');

    const activeSection = document.getElementById(tabName);
    if (activeSection) activeSection.classList.add('active');
}

function simulateScan() {
    console.log('Simulating QR code scan...');

    // Simular escaneamento
    setTimeout(() => {
        const scannedQueueName = document.getElementById('scannedQueueName');
        const scannedPosition = document.getElementById('scannedPosition');

        if (scannedQueueName) scannedQueueName.textContent = 'Restaurante ABC';
        if (scannedPosition) scannedPosition.textContent = '3';

        showModal('scanSuccessModal');
    }, 2000);
}

function generateQR() {
    const queueSelect = document.getElementById('queueSelect');
    if (!queueSelect || !queueSelect.value) {
        alert('Por favor, selecione uma fila primeiro.');
        return;
    }

    const selectedOption = queueSelect.options[queueSelect.selectedIndex];
    const queueName = selectedOption.textContent;

    console.log('Generating QR code for:', queueName);

    const qrDisplay = document.getElementById('qrDisplay');
    const qrQueueName = document.getElementById('qrQueueName');

    if (qrQueueName) qrQueueName.textContent = queueName;
    if (qrDisplay) qrDisplay.style.display = 'block';
}

function shareQR() {
    console.log('Sharing QR code...');

    if (navigator.share) {
        navigator.share({
            title: 'FilaDigital - QR Code',
            text: 'Entre na fila usando este QR Code',
            url: window.location.href
        });
    } else {
        // Fallback para navegadores sem suporte ao Web Share API
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            alert('Link copiado para a área de transferência!');
        });
    }
}

// Funções de modal
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
    }
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
        modal.style.display = 'none';
    });
}

// Funções de navegação entre seções
function showSection(sectionId) {
    // Remover classe active de todas as seções
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Remover classe active de todos os links de navegação
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Ativar seção selecionada
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add('active');
    }

    // Ativar link de navegação correspondente
    const activeLink = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Funções de modal para adicionar itens
function openAddEstablishmentModal() {
    showModal('addEstablishmentModal');
}

function openAddEmployeeModal() {
    showModal('addEmployeeModal');
}

function openAddQueueModal() {
    showModal('addQueueModal');
}

// Funções de edição e exclusão (placeholders)
function editEstablishment(id) {
    console.log('Edit establishment:', id);
    alert('Funcionalidade de edição será implementada com o backend.');
}

async function deleteEstablishment(id) {
    if (confirm('Tem certeza que deseja excluir este estabelecimento?')) {
        console.log('Delete establishment:', id);

        try {
            const success = await window.FilaDigitalAPI.deleteEstablishment(id);
            if (success) {
                await loadEstablishmentsList();
            } else {
                alert('Erro ao excluir estabelecimento');
            }
        } catch (error) {
            console.error('Error deleting establishment:', error);
            alert('Erro de conexão. Tente novamente.');
        }
    }
}

function editEmployee(id) {
    console.log('Edit employee:', id);
    alert('Funcionalidade de edição será implementada com o backend.');
}

async function deleteEmployee(id) {
    if (confirm('Tem certeza que deseja excluir este funcionário?')) {
        console.log('Delete employee:', id);

        // Nota: A API atual não tem endpoint para deletar funcionários
        // Por enquanto, apenas removemos da lista local
        alert('Funcionalidade de exclusão de funcionários será implementada no backend.');

        // Recarregar lista
        await loadEmployeesList();
    }
}

function editQueue(id) {
    console.log('Edit queue:', id);
    alert('Funcionalidade de edição será implementada com o backend.');
}

async function deleteQueue(id) {
    if (confirm('Tem certeza que deseja excluir esta fila?')) {
        console.log('Delete queue:', id);

        try {
            const success = await window.FilaDigitalAPI.deleteQueue(id);
            if (success) {
                await loadQueuesList();
            } else {
                alert('Erro ao excluir fila');
            }
        } catch (error) {
            console.error('Error deleting queue:', error);
            alert('Erro de conexão. Tente novamente.');
        }
    }
}

function viewQueueDetails(id) {
    console.log('View queue details:', id);
    alert('Detalhes da fila serão implementados com o backend.');
}

// Configurar eventos gerais
function setupGeneralEvents() {
    // Fechar modal ao clicar fora dele
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });

    // Busca de filas (cliente)
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            filterQueues(searchTerm);
        });
    }

    // Tecla ESC para fechar modais
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

function filterQueues(searchTerm) {
    const queueCards = document.querySelectorAll('.queue-card');

    queueCards.forEach(card => {
        const queueName = card.querySelector('h3').textContent.toLowerCase();
        const queueDescription = card.querySelector('p').textContent.toLowerCase();

        if (queueName.includes(searchTerm) || queueDescription.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Simulação de atualizações em tempo real
function startRealTimeUpdates() {
    // Simular atualizações periódicas das filas
    setInterval(async () => {
        try {
            // Recarregar dados se estivermos na página apropriada
            const currentPage = getCurrentPage();
            if (currentPage === 'dashboard-cliente') {
                await loadQueuesGrid();
            } else if (currentPage === 'dashboard-funcionario') {
                await loadEmployeeQueues();
            } else if (currentPage === 'dashboard-dono') {
                await loadEstablishmentsList();
                await loadEmployeesList();
                await loadQueuesList();
            }
        } catch (error) {
            console.error('Error in real-time updates:', error);
        }
    }, 30000); // Atualizar a cada 30 segundos
}

// Iniciar atualizações em tempo real quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(startRealTimeUpdates, 5000); // Começar após 5 segundos
});

// Utilitários
function formatDate(date) {
    return new Intl.DateTimeFormat('pt-BR').format(date);
}

function formatTime(date) {
    return new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Exportar funções para uso global
window.FilaDigital = {
    showSection,
    joinQueue,
    confirmJoinQueue,
    leaveQueue,
    callNext,
    confirmCallNext,
    showQRTab,
    simulateScan,
    generateQR,
    shareQR,
    openAddEstablishmentModal,
    openAddEmployeeModal,
    openAddQueueModal,
    editEstablishment,
    deleteEstablishment,
    editEmployee,
    deleteEmployee,
    editQueue,
    deleteQueue,
    viewQueueDetails,
    closeModal
};