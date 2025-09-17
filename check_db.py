#!/usr/bin/env python3
import sqlite3

def check_database():
    try:
        conn = sqlite3.connect('filadigital.db')
        cursor = conn.cursor()

        # Listar todas as tabelas
        cursor.execute('SELECT name FROM sqlite_master WHERE type="table"')
        tables = cursor.fetchall()

        print('=== VERIFICACAO DO BANCO DE DADOS ===')
        print(f'Tabelas encontradas: {len(tables)}')

        for table in tables:
            table_name = table[0]
            cursor.execute(f'SELECT COUNT(*) FROM {table_name}')
            count = cursor.fetchone()[0]
            print(f'[TABELA] {table_name}: {count} registros')

            # Mostrar estrutura da tabela
            cursor.execute(f'PRAGMA table_info({table_name})')
            columns = cursor.fetchall()
            print(f'   Colunas: {[col[1] for col in columns]}')

            # Mostrar alguns registros de exemplo
            if count > 0:
                cursor.execute(f'SELECT * FROM {table_name} LIMIT 3')
                rows = cursor.fetchall()
                print(f'   Amostra de dados:')
                for row in rows:
                    print(f'      {row}')
            print()

        conn.close()

    except Exception as e:
        print(f'[ERRO] Erro ao verificar banco de dados: {e}')

if __name__ == '__main__':
    check_database()