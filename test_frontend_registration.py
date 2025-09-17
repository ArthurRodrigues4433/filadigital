#!/usr/bin/env python3
"""
Teste de registro via frontend simulation
"""
import requests
import json
import time

def test_frontend_registration():
    """Simula exatamente o que o frontend faz"""

    # Dados que o frontend envia - EMAIL NOVO
    user_data = {
        "name": "Teste Frontend Novo",
        "email": f"teste.frontend.{int(time.time())}@teste.com",
        "password": "123456",
        "userType": "dono"  # Testar com dono para verificar redirecionamento
    }

    # URL do backend
    url = "http://localhost:8000/usuarios/registrar"

    # Headers que o frontend usa
    headers = {
        "Content-Type": "application/json"
    }

    # Agora o frontend envia diretamente os valores em português
    mapped_role = user_data['userType']

    # Dados que o frontend processa (exatamente como no api.js)
    payload = {
        "nome": user_data["name"],
        "email": user_data["email"],
        "senha": user_data["password"],
        "role": mapped_role,
        "ativo": True,
        "admin": False,
        "establishment_id": None
    }

    print("=== TESTE DE REGISTRO VIA FRONTEND ===")
    print(f"URL: {url}")
    print(f"Headers: {headers}")
    print(f"Payload: {json.dumps(payload, indent=2)}")

    try:
        response = requests.post(url, headers=headers, json=payload)

        print(f"\nStatus Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")

        if response.status_code == 200:
            print("REGISTRO BEM-SUCEDIDO!")
            print(f"Response: {response.json()}")
        else:
            print("ERRO NO REGISTRO!")
            print(f"Status: {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error Response: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Raw Response: {response.text}")

    except Exception as e:
        print(f"ERRO DE CONEXAO: {e}")

if __name__ == "__main__":
    test_frontend_registration()