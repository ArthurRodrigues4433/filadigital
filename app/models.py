from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime #type: ignore
from sqlalchemy.orm import relationship #type: ignore
from datetime import datetime
from app.database import Base

# -------------------------
# Usuários
# -------------------------
class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    senha = Column(String, nullable=False)
    ativo = Column(Boolean, default=True)
    admin = Column(Boolean, default=False)

    # Relacionamento: 1 usuário pode ter vários estabelecimentos
    estabelecimentos = relationship("Estabelecimento", back_populates="usuario")

    # Relacionamento: 1 usuário pode estar em várias filas (via UsuariosNaFila)
    filas = relationship("UsuariosNaFila", back_populates="usuario")

    def __init__(self, nome: str, email: str, senha: str, ativo: bool = True, admin: bool = False):
        self.nome = nome
        self.email = email
        self.senha = senha
        self.ativo = ativo
        self.admin = admin


# -------------------------
# Estabelecimentos
# -------------------------
class Estabelecimento(Base):
    __tablename__ = "estabelecimentos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    rua = Column(String, nullable=False)
    bairro = Column(String, nullable=False)
    cidade = Column(String, nullable=False)
    estado = Column(String, nullable=False)
    telefone = Column(String, nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)

    # Relacionamento: cada estabelecimento pertence a um usuário
    usuario = relationship("Usuario", back_populates="estabelecimentos")

    # Relacionamento: 1 estabelecimento pode ter várias filas
    filas = relationship("Fila", back_populates="estabelecimento")

    def __init__(self, nome: str, rua: str, bairro: str, cidade: str, estado: str, telefone: str, usuario_id: int):
        self.nome = nome
        self.rua = rua
        self.bairro = bairro
        self.cidade = cidade
        self.estado = estado
        self.telefone = telefone
        self.usuario_id = usuario_id


# -------------------------
# Filas
# -------------------------
class Fila(Base):
    __tablename__ = "filas"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    descricao = Column(String, nullable=True)
    estabelecimento_id = Column(Integer, ForeignKey("estabelecimentos.id"), nullable=False)

    # Relacionamento: cada fila pertence a um estabelecimento
    estabelecimento = relationship("Estabelecimento", back_populates="filas")

    # Relacionamento: 1 fila pode ter vários usuários dentro dela
    usuarios = relationship("UsuariosNaFila", back_populates="fila")

    def __init__(self, nome: str, descricao: str, estabelecimento_id: int):
        self.nome = nome
        self.descricao = descricao
        self.estabelecimento_id = estabelecimento_id


# -------------------------
# UsuariosNaFila (tabela intermediária)
# -------------------------
class UsuariosNaFila(Base):
    __tablename__ = "usuarios_na_fila"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    fila_id = Column(Integer, ForeignKey("filas.id"), nullable=False)
    ordem = Column(Integer, nullable=False)  # posição na fila
    status = Column(String, default="aguardando")  # aguardando, atendido, cancelado
    horario_entrada = Column(DateTime, default=datetime.utcnow)

    # Relacionamentos
    usuario = relationship("Usuario", back_populates="filas")
    fila = relationship("Fila", back_populates="usuarios")

    def __init__(self, usuario_id: int, fila_id: int, ordem: int, status: str = "aguardando"):
        self.usuario_id = usuario_id
        self.fila_id = fila_id
        self.ordem = ordem
        self.status = status