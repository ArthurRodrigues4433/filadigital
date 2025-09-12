from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_home():
    response = client.get("/usuarios/")
    assert response.status_code == 200
    assert "Usuário autenticado com sucesso!" in response.json()["message"]

def test_registrar_usuario():
    payload = {
        "nome": "Teste",
        "email": "teste@teste.com",
        "senha": "123456",
        "ativo": True,
        "admin": False
    }
    response = client.post("/usuarios/registrar", json=payload)
    assert response.status_code in [200, 400]  # 400 se já existir
    # Se 400, verifica mensagem de usuário já existe
    if response.status_code == 400:
        assert "Usuário já existe!" in response.json()["detail"]

def test_login_usuario():
    payload = {
        "email": "teste@teste.com",
        "senha": "123456"
    }
    response = client.post("/usuarios/login", json=payload)
    assert response.status_code in [200, 400]
    if response.status_code == 200:
        assert "access_token" in response.json()