from fastapi import APIRouter, Depends, HTTPException #type: ignore
from sqlalchemy.orm import Session #type: ignore
from app.dependencies import pegar_sessao, verificar_token, verificar_dono_estabelecimento
from app.schemas import EstabelecimentoSchema
from app.models import Estabelecimento, Usuario

router = APIRouter(dependencies=[Depends(verificar_token)])

@router.get("/")
async def listar_estabelecimentos(session: Session = Depends(pegar_sessao), current_user: Usuario = Depends(verificar_token)):
    """
    Lista todos os estabelecimentos do usuário logado
    """
    estabelecimentos = session.query(Estabelecimento).filter(Estabelecimento.usuario_id == current_user.id).all() # type: ignore

    # Retornar dados formatados para o front-end
    resultado = []
    for est in estabelecimentos:
        resultado.append({
            "id": est.id,
            "nome": est.nome,
            "rua": est.rua,
            "bairro": est.bairro,
            "cidade": est.cidade,
            "estado": est.estado,
            "telefone": est.telefone,
            "usuario_id": est.usuario_id
        })

    return {"estabelecimentos": resultado}


# Cria o estabelecimento
@router.post("/criar-estabelecimento")
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


# Apaga o estabelecimento
@router.post("/deletar-estabelecimento/{estabelecimento_id}")
async def cancelar_estabelecimento(estabelecimento_id: int, session: Session = Depends(pegar_sessao), current_user: Usuario = Depends(verificar_token)):

    estabelecimento = session.query(Estabelecimento).filter(Estabelecimento.id == estabelecimento_id).first()
    if not estabelecimento:
        raise HTTPException(status_code=404, detail="Estabelecimento não encontrado")
    
    verificar_dono_estabelecimento(estabelecimento, current_user)

    # Apaga todas as filas associadas ao estabelecimento
    for fila in estabelecimento.filas:
        session.delete(fila)

    # Depois apaga o estabelecimento
    session.delete(estabelecimento)
    session.commit()

    return {
        "mensagem": f"Estabelecimento {estabelecimento_id} apagado com sucesso!"
    }