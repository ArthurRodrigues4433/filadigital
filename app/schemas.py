from pydantic import BaseModel #type: ignore
from typing import Optional

class UsuarioSchema(BaseModel):
    nome: str
    email: str
    senha: str
    ativo: Optional[bool]
    admin: Optional[bool]

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