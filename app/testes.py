import requests #type: ignore

headers = {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZXhwIjoxNzU3NjEwNjQ5fQ.yBxqmy2vNhkdziCelvDedN-kGXaSK_9CJPWT0IOFIEM"
}

requisicao = requests.get("http://127.0.0.1:8000/usuarios/refresh", headers=headers)  # exemplo de endpoint que retorna JSON
print(requisicao)
print(requisicao.json())