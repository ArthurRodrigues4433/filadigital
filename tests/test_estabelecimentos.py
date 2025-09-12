from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_estabelecimentos_root():
    response = client.get("/estabelecimentos/")
    assert response.status_code == 200
    assert "API de Estabelecimentos funcionando!" in response.json()["message"]

def test_criar_estabelecimento():
    payload = {
        "nome": "Padaria Teste",
        "rua": "Rua Teste",
        "bairro": "Centro",
        "cidade": "Cidade Teste",
        "estado": "SP",
        "telefone": "11999999999",
        "usuario_id": 1
    }
    response = client.post("/estabelecimentos/criar-estabelecimento", json=payload)
    assert response.status_code == 200
    assert "Estabelecimento criado com sucesso!" in response.json()["message"]

def test_deletar_estabelecimento_nao_encontrado():
    response = client.post("/estabelecimentos/deletar-estabelecimento/9999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Estabelecimento não encontrado"