# 📲 FilaDigital

**FilaDigital** é um sistema de gerenciamento de filas para estabelecimentos, desenvolvido com **Python** e **FastAPI**, com foco em melhorar o atendimento ao público e reduzir aglomerações. O projeto permite que usuários entrem em filas virtualmente, acompanhem seu progresso em tempo real e sejam atendidos com mais conforto e segurança.

> 💡 Este projeto foi criado com o objetivo de facilitar o controle de filas em ambientes físicos, especialmente durante períodos de restrição sanitária, como a pandemia. Ele pode ser adaptado para diversos tipos de estabelecimentos — bancos, clínicas, restaurantes, órgãos públicos e mais.


## 🚀 Funcionalidades

- ✅ Cadastro e login de usuários com autenticação via token
- 🏢 Criação, listagem e exclusão de estabelecimentos
- 📋 Gerenciamento de filas por estabelecimento
- ⏱️ Visualização da posição na fila e tempo estimado de espera
- 🔐 Segurança com validação de dados e rotas protegidas
- 🧪 Testes automatizados com Pytest


## 🛠️ Tecnologias utilizadas

- **Python 3.12**
- **FastAPI** — framework web moderno e rápido
- **Uvicorn** — servidor ASGI para rodar a aplicação
- **Pytest** — para testes automatizados
- **SQLite** — banco de dados leve e fácil de configurar
- **Pydantic** — para validação de dados
- **HTTPBearer** — autenticação via token JWT


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

Após iniciar o servidor, acesse:

- **Swagger UI**: [`http://127.0.0.1:8000/docs`](http://127.0.0.1:8000/docs)
- **Redoc**: [`http://127.0.0.1:8000/redoc`](http://127.0.0.1:8000/redoc)

Essas interfaces permitem testar os endpoints diretamente no navegador.


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
└── ...
```


## 🤝 Contribuição

Contribuições são bem-vindas! Para colaborar:

1. Faça um fork do projeto
2. Crie uma branch com sua feature: `git checkout -b minha-feature`
3. Commit suas alterações: `git commit -m 'Minha feature'`
4. Faça push para a branch: `git push origin minha-feature`
5. Abra um Pull Request


## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.


Feito com 💻 por [Arthur Rodrigues](https://github.com/ArthurRodrigues4433)

