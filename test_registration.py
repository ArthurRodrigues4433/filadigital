#!/usr/bin/env python3
import requests
import json

# URL base da API
BASE_URL = "http://localhost:8000"

def test_registration():
    """Testa o cadastro de usuário"""
    print("=== TESTANDO CADASTRO DE USUÁRIO ===")

    # Dados de teste
    user_data = {
        "nome": "Teste Usuario",
        "email": "teste@usuario.com",
        "senha": "123456",
        "role": "user",
        "ativo": True,
        "admin": False,
        "establishment_id": None
    }

    try:
        response = requests.post(f"{BASE_URL}/usuarios/registrar", json=user_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")

        if response.status_code == 200:
            print("CADASTRO BEM-SUCEDIDO!")
            return True
        else:
            print("ERRO NO CADASTRO")
            return False

    except Exception as e:
        print(f"ERRO DE CONEXAO: {e}")
        return False

def test_login():
    """Testa o login de usuário"""
    print("\n=== TESTANDO LOGIN DE USUÁRIO ===")

    # Dados de login
    login_data = {
        "email": "teste@usuario.com",
        "senha": "123456"
    }

    try:
        response = requests.post(f"{BASE_URL}/usuarios/login", json=login_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")

        if response.status_code == 200:
            print("LOGIN BEM-SUCEDIDO!")
            data = response.json()
            return data.get('access_token')
        else:
            print("ERRO NO LOGIN")
            return None

    except Exception as e:
        print(f"ERRO DE CONEXAO: {e}")
        return None

def test_protected_route(token):
    """Testa uma rota protegida"""
    print("\n=== TESTANDO ROTA PROTEGIDA ===")

    headers = {
        "Authorization": f"Bearer {token}"
    }

    try:
        response = requests.get(f"{BASE_URL}/usuarios/", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")

        if response.status_code == 200:
            print("ROTA PROTEGIDA FUNCIONANDO!")
            return True
        else:
            print("ERRO NA ROTA PROTEGIDA")
            return False

    except Exception as e:
        print(f"ERRO DE CONEXAO: {e}")
        return False

def test_frontend_registration():
    """Testa o cadastro via frontend (simulando)"""
    print("\n=== TESTANDO CADASTRO VIA FRONTEND ===")

    # Dados que o frontend envia
    frontend_data = {
        "name": "Frontend Teste",
        "email": "frontend@teste.com",
        "password": "123456",
        "userType": "user"
    }

    # Simular como o frontend envia (através do api.js)
    api_data = {
        "nome": frontend_data["name"],
        "email": frontend_data["email"],
        "senha": frontend_data["password"],
        "role": frontend_data["userType"],
        "ativo": True,
        "admin": False,
        "establishment_id": None
    }

    print(f"Dados enviados pelo frontend: {json.dumps(frontend_data, indent=2)}")
    print(f"Dados processados pela API: {json.dumps(api_data, indent=2)}")

    try:
        response = requests.post(f"{BASE_URL}/usuarios/registrar", json=api_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")

        if response.status_code == 200:
            print("CADASTRO VIA FRONTEND FUNCIONANDO!")
            return True
        else:
            print("ERRO NO CADASTRO VIA FRONTEND")
            return False

    except Exception as e:
        print(f"ERRO DE CONEXAO: {e}")
        return False

def main():
    print("INICIANDO TESTES DE CADASTRO E LOGIN")
    print("=" * 50)

    # Teste 1: Cadastro direto
    success1 = test_registration()

    # Teste 2: Login
    token = test_login()

    # Teste 3: Rota protegida (se login funcionou)
    if token:
        test_protected_route(token)

    # Teste 4: Cadastro via frontend
    success2 = test_frontend_registration()

    print("\n" + "=" * 50)
    print("RESUMO DOS TESTES:")
    print(f"Cadastro direto: {'OK' if success1 else 'ERRO'}")
    print(f"Login: {'OK' if token else 'ERRO'}")
    print(f"Rota protegida: {'OK' if token else 'ERRO'}")
    print(f"Cadastro via frontend: {'OK' if success2 else 'ERRO'}")

if __name__ == "__main__":
    main()