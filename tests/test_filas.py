from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_filas_root():
    response = client.get("/filas/")
    assert response.status_code == 200
    assert "API de Filas funcionando!" in response.json()["message"]

# Adicione outros testes conforme suas rotas de filas