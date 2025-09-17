# FilaDigital - Sistema Integrado

## 📋 Visão Geral
Sistema completo de gerenciamento de filas digitais com backend FastAPI e frontend integrado.

## 🚀 Como Usar

### 1. Iniciar o Backend
```bash
# No diretório raiz do projeto
python -m uvicorn app.main:app --reload
```
- Backend disponível em: `http://localhost:8000`
- Documentação API: `http://localhost:8000/docs`

### 2. Acessar o Frontend
- Abra `http://localhost:8000` no navegador
- Será redirecionado automaticamente para o frontend

### 3. Desenvolvimento com Vite (Opcional)
```bash
# No diretório frontend/
cd frontend
pnpm install
pnpm run dev
```
- Frontend de desenvolvimento: `http://localhost:3000`
- Proxy automático para API em `http://localhost:8000`

## 🔐 Funcionalidades Integradas

### Autenticação
- ✅ Login com JWT
- ✅ Registro de usuários
- ✅ Controle de roles (user/owner/employee)
- ✅ Renovação automática de tokens

### Para Clientes
- ✅ Visualizar filas disponíveis
- ✅ Entrar em filas
- ✅ Ver posição atual
- ✅ Histórico de atendimentos
- ✅ Sair de filas

### Para Proprietários
- ✅ Criar/gerenciar estabelecimentos
- ✅ Criar/gerenciar filas
- ✅ Visualizar estatísticas
- ✅ Gerenciar funcionários
- ✅ Dashboard completo

### Para Funcionários
- ✅ Visualizar filas do estabelecimento
- ✅ Chamar próximo cliente
- ✅ Histórico de atendimentos
- ✅ Dashboard do funcionário

## 🛠️ Tecnologias

### Backend
- **FastAPI** - Framework web moderno
- **SQLAlchemy** - ORM para banco de dados
- **SQLite** - Banco de dados
- **JWT** - Autenticação
- **Bcrypt** - Hash de senhas

### Frontend
- **HTML5/CSS3** - Interface responsiva
- **JavaScript (ES6+)** - Interações dinâmicas
- **Vite** - Build tool e dev server
- **Fetch API** - Comunicação com backend

## 📁 Estrutura do Projeto

```
Projeto FilaDigital/
├── app/                    # Backend FastAPI
│   ├── main.py            # Ponto de entrada da API
│   ├── models.py          # Modelos do banco de dados
│   ├── schemas.py         # Schemas Pydantic
│   ├── services.py        # Lógica de negócio
│   ├── dependencies.py    # Dependências e middlewares
│   ├── database.py        # Configuração do banco
│   └── routers/           # Endpoints organizados
├── frontend/              # Frontend
│   ├── index.html         # Página inicial
│   ├── api.js             # Cliente da API
│   ├── script.js          # Lógica do frontend
│   ├── style.css          # Estilos globais
│   ├── pages/             # Páginas do sistema
│   ├── scripts/           # Scripts organizados
│   ├── style/             # Estilos organizados
│   └── package.json       # Dependências frontend
├── tests/                 # Testes
├── alembic/               # Migrations do banco
└── requirements.txt       # Dependências Python
```

## 🔗 Endpoints da API

### Autenticação
- `POST /usuarios/registrar` - Registrar usuário
- `POST /usuarios/login` - Login
- `GET /usuarios/refresh` - Renovar token

### Estabelecimentos
- `GET /estabelecimentos` - Listar estabelecimentos
- `POST /estabelecimentos/criar-estabelecimento` - Criar estabelecimento
- `POST /estabelecimentos/deletar-estabelecimento/{id}` - Deletar estabelecimento
- `GET /estabelecimentos/dashboard` - Dashboard do proprietário

### Filas
- `GET /filas` - Listar filas do proprietário
- `GET /filas/disponiveis` - Listar filas disponíveis
- `POST /filas/criar-fila` - Criar fila
- `POST /filas/apagar-fila/{id}` - Deletar fila
- `POST /filas/entrar-na-fila` - Entrar na fila
- `DELETE /filas/sair-da-fila/{id}` - Sair da fila
- `POST /filas/{id}/chamar-proximo` - Chamar próximo cliente
- `GET /filas/minha-posicao` - Ver posição atual
- `GET /filas/historico` - Histórico de filas

## 🎯 Próximos Passos

### Melhorias Sugeridas
1. **Notificações em Tempo Real** - WebSocket para atualizações live
2. **QR Code Real** - Implementar geração real de QR codes
3. **Dashboard Analytics** - Gráficos e métricas avançadas
4. **Mobile App** - Aplicativo nativo
5. **Integração com Pagamentos** - Sistema de cobrança
6. **Multi-idioma** - Suporte a múltiplos idiomas

### Desenvolvimento
1. Adicionar testes automatizados
2. Implementar logging estruturado
3. Configurar CI/CD
4. Documentação da API com Swagger
5. Monitoramento e analytics

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do terminal
2. Consulte a documentação da API em `/docs`
3. Verifique se o backend está rodando na porta 8000
4. Certifique-se de que todas as dependências estão instaladas

---

**FilaDigital** - Gerenciamento inteligente de filas para estabelecimentos comerciais.