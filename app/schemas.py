from pydantic import BaseModel #type: ignore
from typing import Optional
from app.models import Role, Priority

class UsuarioSchema(BaseModel):
    nome: str
    email: str
    senha: str
    ativo: Optional[bool] = True
    admin: Optional[bool] = False
    role: Optional[Role] = Role.usuario
    establishment_id: Optional[int] = None

    class Config:
        from_attributes = True

class EstabelecimentoSchema(BaseModel):
    nome: str
    rua: str
    bairro: str
    cidade: str
    estado: str
    telefone: str
    usuario_id: int

    class Config:
        from_attributes = True

class LoginSchema(BaseModel):
    email: str
    senha: str

    class Config:
        from_attributes = True

class CriarFilaSchema(BaseModel):
    nome: str
    descricao: str
    estabelecimento_id: int

    class Config:
        from_attributes = True

class UsuariosNaFilaSchema(BaseModel):
    usuario_id: int
    fila_id: int
    ordem: int
    status: str
    prioridade: Optional[Priority] = Priority.normal

    class Config:
        from_attributes = True