from fastapi.testclient import TestClient
from app.main import app
from tests.conftest import autenticar

client = TestClient(app)

def test_filas_root():
    headers = autenticar()
    response = client.get("/filas/", headers=headers)
    assert response.status_code == 200
    assert "API de Filas funcionando!" in response.json()["message"]

# Adicione outros testes conforme suas rotas de filas, sempre usando headers=autenticar()