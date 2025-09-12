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

- Python 3.12
- FastAPI
- Uvicorn
- Pytest
- SQLite
- Pydantic
- JWT (JSON Web Tokens)


## 📦 Instalação e execução

```bash
# Clone o repositório
git clone https://github.com/ArthurRodrigues4433/filadigital
cd filadigital

# Crie e ative o ambiente virtual
python -m venv venv
.\venv\Scripts\activate

# Instale as dependências
pip install -r requirements.txt

# Rode o servidor local
uvicorn app.main:app --reload
```

A aplicação estará disponível em `http://127.0.0.1:8000`.


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


## 🧪 Executando os testes

```bash
pytest -v
```

Certifique-se de estar na raiz do projeto e com o ambiente virtual ativado. Os testes estão localizados na pasta `tests/`.


## 📁 Estrutura do projeto

```
filadigital/
├── app/
│   ├── main.py
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── ...
├── tests/
│   ├── test_usuarios.py
│   ├── test_filas.py
│   └── test_estabelecimentos.py
├── requirements.txt
├── README.md
└── LICENSE
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


