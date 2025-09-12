from fastapi.testclient import TestClient
from app.main import app
from tests.conftest import autenticar

client = TestClient(app)

def test_estabelecimentos_root():
    headers = autenticar()
    response = client.get("/estabelecimentos/", headers=headers)
    assert response.status_code == 200
    assert "API de Estabelecimentos funcionando!" in response.json()["message"]

def test_criar_estabelecimento():
    headers = autenticar()
    payload = {
        "nome": "Padaria Teste",
        "rua": "Rua Teste",
        "bairro": "Centro",
        "cidade": "Cidade Teste",
        "estado": "SP",
        "telefone": "11999999999",
        "usuario_id": 1
    }
    response = client.post("/estabelecimentos/criar-estabelecimento", json=payload, headers=headers)
    assert response.status_code == 200
    assert "Estabelecimento criado com sucesso!" in response.json()["message"]

def test_deletar_estabelecimento_nao_encontrado():
    headers = autenticar()
    response = client.post("/estabelecimentos/deletar-estabelecimento/9999", headers=headers)
    assert response.status_code == 404
    assert response.json()["detail"] == "Estabelecimento não encontrado"