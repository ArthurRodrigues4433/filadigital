# 📲 FilaDigital

![License](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/python-3.12-blue)
![FastAPI](https://img.shields.io/badge/framework-FastAPI-009688)

**FilaDigital** é um sistema de gerenciamento de filas para estabelecimentos, desenvolvido com **Python** e **FastAPI**, com foco em melhorar o atendimento ao público e reduzir aglomerações. O projeto permite que usuários entrem em filas virtualmente, acompanhem seu progresso em tempo real e sejam atendidos com mais conforto e segurança.

> 💡 Ideal para clínicas, bancos, restaurantes e qualquer lugar que precise organizar o fluxo de atendimento. O app foi criado para minimizar aglomerações e otimizar o tempo de espera dos clientes.


## 🚀 Funcionalidades

- ✅ Cadastro e login de usuários com autenticação via token
- 🏢 Criação, listagem e exclusão de estabelecimentos
- 📋 Gerenciamento de filas por estabelecimento
- ⏱️ Visualização da posição na fila e tempo estimado de espera
- 🔐 Segurança com validação de dados e rotas protegidas
- 🧪 Testes automatizados com Pytest


## 🛠️ Tecnologias utilizadas

### Backend
- **Python 3.12**
- **FastAPI** - Framework web moderno e rápido
- **Uvicorn** - Servidor ASGI para FastAPI
- **SQLAlchemy** - ORM para banco de dados
- **Alembic** - Migrações de banco de dados
- **Pydantic** - Validação de dados
- **SQLite** - Banco de dados (pode ser alterado para PostgreSQL)
- **JWT (python-jose)** - Autenticação baseada em tokens
- **Passlib/Bcrypt** - Hash de senhas
- **python-dotenv** - Variáveis de ambiente

### Frontend
- **HTML5/CSS3** - Estrutura e estilos das páginas
- **JavaScript (ES6+)** - Interatividade e comunicação com API
- **Fetch API** - Requisições HTTP para o backend

### Testes e Desenvolvimento
- **Pytest** - Framework de testes
- **Requests** - Biblioteca para testes de API


## 📦 Instalação e execução

### Pré-requisitos
- Python 3.12 ou superior
- Git

### Passos de instalação

```bash
# 1. Clone o repositório
git clone https://github.com/ArthurRodrigues4433/filadigital
cd filadigital

# 2. Crie e ative o ambiente virtual
python -m venv venv
.\venv\Scripts\activate  # Windows
# ou
source venv/bin/activate  # Linux/Mac

# 3. Instale as dependências
pip install -r requirements.txt

# 4. Configure as variáveis de ambiente (opcional)
# Crie um arquivo .env na raiz do projeto com:
# SECRET_KEY=sua_chave_secreta_aqui
# ALGORITHM=HS256
# ACCESS_TOKEN_EXPIRE_MINUTES=30

# 5. Execute as migrações do banco de dados
alembic upgrade head

# 6. (Opcional) Popule o banco com dados de exemplo
python populate_db.py

# 7. Rode o servidor
uvicorn app.main:app --reload
```

### Acesso à aplicação
- **Backend API**: `http://127.0.0.1:8000`
- **Frontend**: `http://127.0.0.1:8000/frontend/index.html`
- **Documentação API**: `http://127.0.0.1:8000/docs`
- **Documentação alternativa**: `http://127.0.0.1:8000/redoc`

### Sobre o Frontend
O frontend é composto por páginas HTML estáticas servidas pelo FastAPI, com JavaScript para interatividade:

- **index.html**: Página inicial com opções de login/registro
- **dashboard-cliente.html**: Interface para clientes verem suas filas
- **dashboard-dono.html**: Painel para donos gerenciarem estabelecimentos e filas
- **dashboard-funcionario.html**: Interface para funcionários chamarem próximos clientes
- **qrcode.html**: Página para gerar QR codes das filas

O JavaScript em `api.js` e `script.js` gerencia a comunicação com o backend via Fetch API.


## 🔄 Reestruturação do Projeto

O projeto foi completamente reestruturado para melhor organização e escalabilidade:

### Backend (FastAPI)
- **Estrutura modular**: Código organizado em diretórios dedicados (`models/`, `schemas/`, `services/`)
- **Configurações centralizadas**: Arquivo `config.py` com todas as configurações da aplicação
- **Nomes padronizados**: Funções e variáveis em português para consistência
- **Comentários explicativos**: Documentação detalhada em todos os arquivos
- **Separação de responsabilidades**: Lógica de negócio isolada nos services

### Frontend (HTML/CSS/JS)
- **Organização clara**: Arquivos separados por tipo (`pages/`, `js/`, `css/`, `config/`)
- **Referências atualizadas**: Todos os links corrigidos após reestruturação
- **Estrutura escalável**: Fácil adição de novas páginas e funcionalidades
- **Documentação específica**: `README_FRONTEND.md` com guia completo

### Benefícios da Reestruturação
- ✅ **Manutenibilidade**: Código mais fácil de entender e modificar
- ✅ **Escalabilidade**: Estrutura preparada para crescimento
- ✅ **Organização**: Arquivos agrupados por responsabilidade
- ✅ **Consistência**: Nomes e padrões uniformes
- ✅ **Documentação**: Comentários e guias detalhados

## 📚 Documentação da API

Acesse a documentação interativa gerada automaticamente pelo FastAPI:

- [Swagger UI](http://127.0.0.1:8000/docs)
- [Redoc](http://127.0.0.1:8000/redoc)


## 📡 Exemplos de requisições da API

Abaixo estão alguns exemplos de como interagir com a API usando `curl`, Postman ou Insomnia.

### 🔐 Autenticação

#### Registrar usuário

```http
POST /usuarios/registrar
Content-Type: application/json

{
  "nome": "Arthur",
  "email": "arthur@email.com",
  "senha": "123456"
}
```

#### Login

```http
POST /usuarios/login
Content-Type: application/json

{
  "email": "arthur@email.com",
  "senha": "123456"
}
```

> 🔑 A resposta inclui um token JWT que deve ser usado nas próximas requisições protegidas.


### 🏢 Estabelecimentos

#### Criar estabelecimento

```http
POST /estabelecimentos/
Authorization: Bearer <seu_token>
Content-Type: application/json

{
  "nome": "Clínica Saúde",
  "descricao": "Atendimento médico geral"
}
```

#### Listar estabelecimentos

```http
GET /estabelecimentos/
```


### 📋 Filas

#### Entrar na fila

```http
POST /filas/entrar
Authorization: Bearer <seu_token>
Content-Type: application/json

{
  "id_estabelecimento": 1
}
```

#### Ver posição na fila

```http
GET /filas/minha-posicao
Authorization: Bearer <seu_token>
```


## 🗄️ Gerenciamento do Banco de Dados

### Migrações com Alembic

```bash
# Criar uma nova migração
alembic revision --autogenerate -m "Descrição da migração"

# Aplicar migrações pendentes
alembic upgrade head

# Ver status das migrações
alembic current

# Reverter última migração
alembic downgrade -1
```

### Scripts de Utilitários

```bash
# Verificar conteúdo do banco de dados
python check_db.py

# Popular banco com dados de exemplo
python populate_db.py

# Testes manuais de API
python app/testes.py
```

## 🧪 Executando os testes

### Testes Automatizados
```bash
# Executar todos os testes
pytest -v

# Executar testes específicos
pytest tests/test_usuarios.py -v
pytest tests/test_estabelecimentos.py -v
pytest tests/test_filas.py -v

# Com cobertura
pytest --cov=app --cov-report=html
```

### Testes Manuais
```bash
# Teste de registro
python test_registration.py

# Teste de registro via frontend
python test_frontend_registration.py
```

Certifique-se de estar na raiz do projeto e com o ambiente virtual ativado. Os testes estão localizados na pasta `tests/`.


## 📁 Estrutura do projeto

```
filadigital/
├── app/                          # Código principal do backend (reestruturado)
│   ├── main.py                   # Ponto de entrada da aplicação FastAPI
│   ├── config.py                 # Configurações centralizadas da aplicação
│   ├── database.py               # Configuração do banco de dados SQLAlchemy
│   ├── dependencies.py           # Dependências compartilhadas (auth, validation)
│   ├── __init__.py               # Pacote Python
│   ├── models/                   # Modelos de dados organizados
│   │   └── __init__.py           # Usuario, Estabelecimento, Fila, UsuariosNaFila
│   ├── schemas/                  # Schemas Pydantic para validação
│   │   └── __init__.py           # UsuarioSchema, EstabelecimentoSchema, etc.
│   ├── services/                 # Lógica de negócio
│   │   └── __init__.py           # QueueService, QRCodeService, DashboardService
│   └── routers/                  # Rotas da API organizadas por módulo
│       ├── usuarios.py           # Rotas de usuários (registro, login, auth)
│       ├── estabelecimentos.py   # Rotas de estabelecimentos (CRUD)
│       └── filas.py              # Rotas de filas (entrar, sair, gerenciar)
├── frontend/                     # Interface do usuário (reestruturada)
│   ├── pages/                    # Páginas HTML organizadas
│   │   ├── index.html            # Página inicial de login
│   │   ├── resgister.html        # Página de registro
│   │   ├── qrcode.html           # Página de QR Code
│   │   ├── dashboard-cliente.html    # Dashboard do cliente
│   │   ├── dashboard-dono.html       # Dashboard do dono
│   │   └── dashboard-funcionario.html # Dashboard do funcionário
│   ├── js/                       # Arquivos JavaScript
│   │   ├── api.js                # Funções de comunicação com API
│   │   ├── script.js             # Lógica JavaScript principal
│   │   └── test-integration.js   # Testes de integração frontend
│   ├── css/                      # Arquivos de estilo
│   │   └── style.css             # Estilos CSS principais
│   ├── config/                   # Arquivos de configuração
│   │   ├── package.json          # Dependências Node.js
│   │   ├── pnpm-lock.yaml        # Lock file pnpm
│   │   ├── vite.config.js        # Configuração Vite
│   │   └── template_config.json  # Configurações de templates
│   ├── utils/                    # Utilitários e documentação
│   │   └── todo.md               # Lista de tarefas do frontend
│   ├── assets/                   # Recursos estáticos (imagens, etc.)
│   ├── .gitignore                # Git ignore específico do frontend
│   └── README_FRONTEND.md        # Documentação específica do frontend
├── alembic/                      # Migrações de banco de dados
│   ├── versions/                 # Arquivos de migração
│   │   ├── c81609cbe2c4_initial_migration.py
│   │   ├── 31e41ad995a0_add_role_and_establishment_id_to_.py
│   │   ├── 7aeaa8396d70_update_role_enum_to_portuguese.py
│   │   └── 3fbd34cbb378_add_missing_fields.py
│   ├── env.py                    # Configuração Alembic
│   ├── script.py.mako            # Template de scripts
│   └── README                    # Documentação Alembic
├── tests/                        # Testes automatizados
│   ├── conftest.py               # Configuração dos testes
│   ├── test_estabelecimentos.py  # Testes de estabelecimentos
│   ├── test_filas.py             # Testes de filas
│   └── test_usuarios.py          # Testes de usuários
├── .pytest_cache/                # Cache Pytest
├── .vscode/                      # Configurações VS Code
├── check_db.py                   # Script para verificar banco de dados
├── populate_db.py                # Script para popular banco com dados exemplo
├── test_registration.py          # Teste de registro manual
├── test_frontend_registration.py # Teste de registro via frontend
├── filadigital.db.backup         # Backup do banco de dados
├── login_data.json               # Dados de login exemplo
├── estabelecimento_data.json     # Dados de estabelecimentos exemplo
├── fila_data.json                # Dados de filas exemplo
├── test_data.json                # Dados de teste
├── test_api.html                 # Página de teste da API
├── README_INTEGRACAO.md          # Documentação de integração
├── README_FRONTEND.md            # Documentação específica do frontend
├── requirements.txt              # Dependências Python
├── .gitignore                    # Arquivos ignorados pelo Git
├── alembic.ini                   # Configuração Alembic
└── README.md                     # Este arquivo
```


## 🤝 Contribuição

Contribuições são bem-vindas! Para colaborar:

1. Faça um fork do projeto
2. Crie uma branch com sua feature: `git checkout -b minha-feature`
3. Commit suas alterações: `git commit -m 'Minha feature'`
4. Faça push para a branch: `git push origin minha-feature`
5. Abra um Pull Request


## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo `LICENSE` para mais detalhes.


Feito com 💻 por [Arthur Rodrigues](https://github.com/ArthurRodrigues4433)


