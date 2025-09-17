from fastapi import APIRouter, Depends, HTTPException #type: ignore
from sqlalchemy.orm import Session #type: ignore
from app.dependencies import pegar_sessao, verificar_token, verificar_dono_estabelecimento, require_role
from app.models import Role
from app.schemas import EstabelecimentoSchema
from app.models import Estabelecimento, Usuario, Fila, UsuariosNaFila
from app.services import DashboardService

router = APIRouter(dependencies=[Depends(verificar_token)])

@router.get("/")
async def listar_estabelecimentos(session: Session = Depends(pegar_sessao), current_user: Usuario = Depends(require_role(Role.dono))):
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
async def criar_estabelecimento(estabelecimento_schema: EstabelecimentoSchema, session: Session = Depends(pegar_sessao), current_user: Usuario = Depends(require_role(Role.dono))):
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
async def cancelar_estabelecimento(estabelecimento_id: int, session: Session = Depends(pegar_sessao), current_user: Usuario = Depends(require_role(Role.dono))):

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

# Dashboard para owner: estatísticas dos estabelecimentos
@router.get("/dashboard")
async def dashboard_owner(session: Session = Depends(pegar_sessao), current_user: Usuario = Depends(require_role(Role.dono))):
    return DashboardService.get_owner_dashboard(current_user, session)

# Listar funcionários de um estabelecimento (para owner)
@router.get("/{estabelecimento_id}/funcionarios")
async def listar_funcionarios(estabelecimento_id: int, session: Session = Depends(pegar_sessao), current_user: Usuario = Depends(require_role(Role.dono))):
    estabelecimento = session.query(Estabelecimento).filter(Estabelecimento.id == estabelecimento_id).first()
    if not estabelecimento or estabelecimento.usuario_id != current_user.id: #type: ignore
        raise HTTPException(status_code=403, detail="Acesso negado")
    funcionarios = session.query(Usuario).filter(Usuario.establishment_id == estabelecimento_id, Usuario.role == Role.employee).all() #type: ignore
    return {"funcionarios": [{"id": f.id, "nome": f.nome, "email": f.email} for f in funcionarios]}

# Adicionar funcionário a estabelecimento (para owner)
@router.post("/{estabelecimento_id}/adicionar-funcionario")
async def adicionar_funcionario(estabelecimento_id: int, funcionario_id: int, session: Session = Depends(pegar_sessao), current_user: Usuario = Depends(require_role(Role.dono))):
    estabelecimento = session.query(Estabelecimento).filter(Estabelecimento.id == estabelecimento_id).first()
    if not estabelecimento or estabelecimento.usuario_id != current_user.id: #type: ignore
        raise HTTPException(status_code=403, detail="Acesso negado")
    funcionario = session.query(Usuario).filter(Usuario.id == funcionario_id).first()
    if not funcionario:
        raise HTTPException(status_code=404, detail="Funcionário não encontrado")
    funcionario.role = Role.funcionario
    funcionario.establishment_id = estabelecimento_id
    session.commit()
    return {"message": "Funcionário adicionado com sucesso"}