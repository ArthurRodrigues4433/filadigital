# Fila Digital - Front-end

Front-end responsivo e moderno para o sistema de filas digitais, desenvolvido com HTML, CSS e JavaScript puro.

## Funcionalidades

- ✅ Autenticação completa (login/registro)
- ✅ Dashboard com visão geral
- ✅ Gerenciamento de estabelecimentos (CRUD)
- ✅ Gerenciamento de filas (CRUD)
- ✅ Sistema de filas para usuários
- ✅ Interface responsiva (desktop e mobile)
- ✅ Atualização em tempo real via polling
- ✅ Validações de formulários
- ✅ Feedback visual (loading, sucesso, erro)

## Estrutura do Projeto

```
frontend/
├── index.html          # Página de login/registro
├── css/
│   └── styles.css      # Estilos globais e responsivos
├── js/
│   ├── app.js          # Utilitários globais e autenticação
│   ├── dashboard.js    # Funcionalidades do dashboard
│   ├── estabelecimentos.js  # CRUD de estabelecimentos
│   └── filas.js        # CRUD de filas
└── pages/
    ├── dashboard.html      # Dashboard principal
    ├── estabelecimentos.html  # Gestão de estabelecimentos
    └── filas.html          # Gestão de filas
```

## Como Usar

### 1. Configuração do Back-end

Certifique-se de que o back-end FastAPI está rodando em `http://127.0.0.1:8000`:

```bash
cd app
uvicorn main:app --reload
```

### 2. Abrir o Front-end

Abra o arquivo `frontend/index.html` em um navegador web moderno.

### 3. Fluxo de Uso

1. **Registro/Login**: Crie uma conta ou faça login
2. **Dashboard**: Visualize estabelecimentos e filas
3. **Estabelecimentos**: Crie e gerencie seus estabelecimentos
4. **Filas**: Crie filas para seus estabelecimentos
5. **Entrar em Filas**: Usuários podem entrar em filas disponíveis

## Funcionalidades Implementadas

### Autenticação
- Registro de novos usuários
- Login com email/senha
- Armazenamento seguro de tokens JWT
- Logout automático

### Estabelecimentos
- Criar estabelecimento
- Listar estabelecimentos do usuário
- Deletar estabelecimento (com confirmação)

### Filas
- Criar fila vinculada a estabelecimento
- Listar filas do usuário
- Deletar fila
- Chamar próximo da fila
- Entrar em fila disponível

### Interface
- Design moderno e limpo
- Totalmente responsivo
- Navegação intuitiva
- Feedback visual em tempo real

## APIs Consumidas

- `POST /usuarios/registrar` - Registrar usuário
- `POST /usuarios/login` - Login
- `POST /estabelecimentos/criar-estabelecimento` - Criar estabelecimento
- `POST /estabelecimentos/deletar-estabelecimento/{id}` - Deletar estabelecimento
- `POST /filas/criar-fila` - Criar fila
- `POST /filas/apagar-fila/{id}` - Deletar fila
- `POST /filas/entrar-na-fila` - Entrar na fila
- `POST /filas/{id}/chamar-proximo` - Chamar próximo

## Navegadores Suportados

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## Desenvolvimento

Para modificar ou estender:

1. **CSS**: Edite `css/styles.css` para alterações visuais
2. **JavaScript**: Modifique os arquivos em `js/` para funcionalidades
3. **HTML**: Atualize as páginas em `pages/` para estrutura

### Adicionar Novos Endpoints

Para integrar novos endpoints do back-end:

1. Adicione a função na seção apropriada do arquivo JS
2. Use `FilaDigital.apiRequest()` para fazer chamadas autenticadas
3. Atualize a interface HTML conforme necessário

## Notas Técnicas

- **Polling**: Atualização automática a cada 30 segundos
- **Tokens**: Armazenados em localStorage
- **Validações**: HTML5 + JavaScript
- **Responsividade**: CSS Grid e Flexbox
- **Compatibilidade**: ES6+ (fetch API, promises)

## Próximas Melhorias

- [ ] WebSockets para atualização em tempo real
- [ ] Notificações push
- [ ] PWA (Progressive Web App)
- [ ] Temas dark/light
- [ ] Internacionalização (i18n)
- [ ] Testes automatizados

## Suporte

Para dúvidas ou problemas, verifique:
1. Console do navegador (F12)
2. Logs do back-end FastAPI
3. Documentação da API (`/docs` no back-end)