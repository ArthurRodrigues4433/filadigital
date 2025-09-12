from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def autenticar():
    client.post("/usuarios/registrar", json={
        "nome": "Teste",
        "email": "teste@teste.com",
        "senha": "123456"
    })
    resp = client.post("/usuarios/login", json={
        "email": "teste@teste.com",
        "senha": "123456"
    })
    token = resp.json().get("access_token")
    return {"Authorization": f"Bearer {token}"}