from fastapi import APIRouter, Depends #type: ignore
from sqlalchemy.orm import Session #type: ignore
from app.dependencies import pegar_sessao
from app.schemas import EstabelecimentoSchema
from app.models import Estabelecimento

router = APIRouter()

@router.get("/")
async def estabelecimentos():
    return {"message": "API de Estabelecimentos funcionando!"}




@router.post("/estabelecimentos")
async def criar_estabelecimento(estabelecimento_schema: EstabelecimentoSchema, session: Session = Depends(pegar_sessao)):
    novo_estabelecimento = Estabelecimento(
        nome=estabelecimento_schema.nome, 
        rua=estabelecimento_schema.rua,
        bairro=estabelecimento_schema.bairro,
        cidade=estabelecimento_schema.cidade,
        estado=estabelecimento_schema.estado,
        telefone=estabelecimento_schema.telefone,
        usuario_id=estabelecimento_schema.usuario_id
        ) #type: ignore
    
    session.add(novo_estabelecimento)
    session.commit()

    return {"message": f"Estabelecimento criado com sucesso! ID do estabelecimento: {novo_estabelecimento.id}"}