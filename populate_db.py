#!/usr/bin/env python3
import sqlite3
from datetime import datetime
import bcrypt

def populate_database():
    try:
        conn = sqlite3.connect('filadigital.db')
        cursor = conn.cursor()

        print('=== POPULANDO BANCO DE DADOS ===')

        # Criar senha hash para usuários
        def hash_password(password):
            return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        # Adicionar mais usuários
        users_data = [
            ('Maria Cliente', 'maria@cliente.com', hash_password('123456'), 'user'),
            ('Pedro Funcionario', 'pedro@funcionario.com', hash_password('123456'), 'employee'),
            ('Ana Dono', 'ana@dono.com', hash_password('123456'), 'owner'),
        ]

        for name, email, password, role in users_data:
            cursor.execute('''
                INSERT INTO usuarios (nome, email, senha, ativo, admin, role)
                VALUES (?, ?, ?, 1, 0, ?)
            ''', (name, email, password, role))

        print('[USUARIOS] Adicionados 3 usuarios')

        # Adicionar mais estabelecimentos
        establishments_data = [
            ('Restaurante Sabor', 'Rua do Comércio, 100', 'Centro', 'São Paulo', 'SP', '11888888888', 4),  # ana@dono.com
            ('Lanchonete Rapida', 'Av. Principal, 200', 'Jardins', 'São Paulo', 'SP', '11777777777', 4),
        ]

        for name, rua, bairro, cidade, estado, telefone, usuario_id in establishments_data:
            cursor.execute('''
                INSERT INTO estabelecimentos (nome, rua, bairro, cidade, estado, telefone, usuario_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (name, rua, bairro, cidade, estado, telefone, usuario_id))

        print('[ESTABELECIMENTOS] Adicionados 2 estabelecimentos')

        # Adicionar mais filas
        queues_data = [
            ('Fila Normal', 'Atendimento normal', 1),
            ('Fila Preferencial', 'Atendimento prioritário', 1),
            ('Fila Delivery', 'Pedidos para entrega', 2),
            ('Fila Balcão', 'Atendimento no balcão', 2),
            ('Fila Expressa', 'Atendimento rápido', 3),
        ]

        for name, descricao, estabelecimento_id in queues_data:
            cursor.execute('''
                INSERT INTO filas (nome, descricao, estabelecimento_id)
                VALUES (?, ?, ?)
            ''', (name, descricao, estabelecimento_id))

        print('[FILAS] Adicionadas 5 filas')

        # Adicionar usuários nas filas
        queue_entries_data = [
            (2, 1, 1, 'aguardando', 'normal'),  # Maria na Fila Normal
            (2, 2, 1, 'aguardando', 'high'),    # Maria na Fila Preferencial
            (3, 4, 1, 'aguardando', 'normal'),  # Pedro na Fila Balcão
            (4, 5, 1, 'aguardando', 'normal'),  # Ana na Fila Expressa
        ]

        for usuario_id, fila_id, ordem, status, prioridade in queue_entries_data:
            cursor.execute('''
                INSERT INTO usuarios_na_fila (usuario_id, fila_id, ordem, status, prioridade_ia, horario_entrada)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (usuario_id, fila_id, ordem, status, prioridade, datetime.now()))

        print('[USUARIOS_NA_FILA] Adicionados 4 usuarios nas filas')

        # Vincular funcionário ao estabelecimento
        cursor.execute('UPDATE usuarios SET establishment_id = 2 WHERE id = 3')  # Pedro -> Lanchonete Rapida

        print('[FUNCIONARIOS] Vinculado Pedro ao estabelecimento Lanchonete Rapida')

        conn.commit()
        conn.close()

        print('=== BANCO DE DADOS POPULADO COM SUCESSO! ===')

    except Exception as e:
        print(f'[ERRO] Erro ao popular banco de dados: {e}')

if __name__ == '__main__':
    populate_database()