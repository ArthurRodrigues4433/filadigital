"""update_role_enum_to_portuguese

Revision ID: 7aeaa8396d70
Revises: 3fbd34cbb378
Create Date: 2025-09-17 14:42:18.672214

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7aeaa8396d70'
down_revision: Union[str, None] = '3fbd34cbb378'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Atualizar valores existentes na tabela usuarios
    op.execute("UPDATE usuarios SET role = 'usuario' WHERE role = 'user'")
    op.execute("UPDATE usuarios SET role = 'dono' WHERE role = 'owner'")
    op.execute("UPDATE usuarios SET role = 'funcionario' WHERE role = 'employee'")


def downgrade() -> None:
    # Reverter para valores em inglês
    op.execute("UPDATE usuarios SET role = 'user' WHERE role = 'usuario'")
    op.execute("UPDATE usuarios SET role = 'owner' WHERE role = 'dono'")
    op.execute("UPDATE usuarios SET role = 'employee' WHERE role = 'funcionario'")
