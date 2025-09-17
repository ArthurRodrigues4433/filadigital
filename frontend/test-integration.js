// Teste de Integração Frontend-Backend
// Execute este arquivo no console do navegador para testar a integração

console.log('=== TESTE DE INTEGRAÇÃO FILADIGITAL ===');

// Teste 1: Verificar se a API está acessível
async function testAPIConnection() {
    console.log('1. Testando conexão com API...');
    try {
        const response = await fetch('/api/test');
        const data = await response.json();
        console.log('✅ API conectada:', data);
        return true;
    } catch (error) {
        console.error('❌ Erro na API:', error);
        return false;
    }
}

// Teste 2: Verificar se o frontend consegue carregar os arquivos
async function testFrontendFiles() {
    console.log('2. Testando carregamento de arquivos frontend...');
    const files = [
        '/frontend/style/style.css',
        '/frontend/api.js',
        '/frontend/scripts/script.js'
    ];

    for (const file of files) {
        try {
            const response = await fetch(file);
            if (response.ok) {
                console.log(`✅ ${file} carregado`);
            } else {
                console.error(`❌ ${file} falhou: ${response.status}`);
            }
        } catch (error) {
            console.error(`❌ ${file} erro:`, error);
        }
    }
}

// Teste 3: Verificar configuração da API
function testAPIConfig() {
    console.log('3. Verificando configuração da API...');
    if (typeof window.FilaDigitalAPI !== 'undefined') {
        console.log('✅ FilaDigitalAPI carregado');
        console.log('Base URL:', window.FilaDigitalAPI.constructor === Object ? 'Configurado' : 'Não configurado');
    } else {
        console.error('❌ FilaDigitalAPI não carregado');
    }
}

// Teste 4: Testar registro de usuário
async function testUserRegistration() {
    console.log('4. Testando registro de usuário...');
    if (typeof window.FilaDigitalAPI === 'undefined') {
        console.error('❌ FilaDigitalAPI não disponível');
        return;
    }

    try {
        const result = await window.FilaDigitalAPI.register({
            name: 'Test User',
            email: 'test' + Date.now() + '@example.com',
            password: '123456',
            userType: 'user'
        });

        if (result.success) {
            console.log('✅ Registro realizado com sucesso');
        } else {
            console.error('❌ Erro no registro:', result.error);
        }
    } catch (error) {
        console.error('❌ Erro na chamada de registro:', error);
    }
}

// Teste 5: Testar login
async function testUserLogin() {
    console.log('5. Testando login...');
    if (typeof window.FilaDigitalAPI === 'undefined') {
        console.error('❌ FilaDigitalAPI não disponível');
        return;
    }

    try {
        const result = await window.FilaDigitalAPI.login('test@example.com', '123456');

        if (result.success) {
            console.log('✅ Login realizado com sucesso');
            console.log('Token recebido:', result.user ? 'Sim' : 'Não');
        } else {
            console.error('❌ Erro no login:', result.error);
        }
    } catch (error) {
        console.error('❌ Erro na chamada de login:', error);
    }
}

// Executar todos os testes
async function runAllTests() {
    console.log('Iniciando testes de integração...\n');

    await testAPIConnection();
    console.log('');

    await testFrontendFiles();
    console.log('');

    testAPIConfig();
    console.log('');

    await testUserRegistration();
    console.log('');

    await testUserLogin();
    console.log('');

    console.log('=== TESTES CONCLUÍDOS ===');
    console.log('Verifique os resultados acima para identificar problemas.');
}

// Função para executar testes individuais
window.testIntegration = {
    runAll: runAllTests,
    apiConnection: testAPIConnection,
    frontendFiles: testFrontendFiles,
    apiConfig: testAPIConfig,
    registration: testUserRegistration,
    login: testUserLogin
};

// Executar automaticamente se estiver em modo de desenvolvimento
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('Modo desenvolvimento detectado. Execute: testIntegration.runAll()');
}

// Instruções de uso
console.log(`
=== INSTRUÇÕES DE TESTE ===
Para testar a integração, execute no console:

1. testIntegration.runAll() - Executa todos os testes
2. testIntegration.apiConnection() - Testa apenas a API
3. testIntegration.frontendFiles() - Testa carregamento de arquivos
4. testIntegration.apiConfig() - Verifica configuração da API
5. testIntegration.registration() - Testa registro
6. testIntegration.login() - Testa login

Verifique os logs acima para identificar problemas de integração.
`);