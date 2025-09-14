from fastapi import APIRouter, Depends, HTTPException #type: ignore
from sqlalchemy.orm import Session #type: ignore
from app.dependencies import pegar_sessao, verificar_token, verificar_dono_fila, impedir_dono_entrar, calcular_ordem, chamar_proximo
from app.schemas import CriarFilaSchema, UsuariosNaFilaSchema
from app.models import Fila, UsuariosNaFila, Usuario, Estabelecimento

router = APIRouter(dependencies=[Depends(verificar_token)])

@router.get("/")
async def listar_filas_usuario(session: Session = Depends(pegar_sessao), current_user: Usuario = Depends(verificar_token)):
    """
    Lista todas as filas dos estabelecimentos do usuário logado
    """
    filas = session.query(Fila).join(Estabelecimento).filter(Estabelecimento.usuario_id == current_user.id).all() # type: ignore

    # Contar pessoas em cada fila
    resultado = []
    for fila in filas:
        pessoas_na_fila = session.query(UsuariosNaFila).filter(
            UsuariosNaFila.fila_id == fila.id, # type: ignore
            UsuariosNaFila.status == "aguardando" # type: ignore
        ).count()

        resultado.append({
            "id": fila.id,
            "nome": fila.nome,
            "descricao": fila.descricao,
            "estabelecimento_id": fila.estabelecimento_id,
            "estabelecimento": {
                "id": fila.estabelecimento.id,
                "nome": fila.estabelecimento.nome
            },
            "pessoas_na_fila": pessoas_na_fila
        })

    return {"filas": resultado}

@router.get("/disponiveis")
async def listar_filas_disponiveis(session: Session = Depends(pegar_sessao), current_user: Usuario = Depends(verificar_token)):
    """
    Lista filas disponíveis de outros estabelecimentos (não do usuário logado)
    """
    filas = session.query(Fila).join(Estabelecimento).filter(Estabelecimento.usuario_id != current_user.id).all() # type: ignore

    resultado = []
    for fila in filas:
        pessoas_na_fila = session.query(UsuariosNaFila).filter(
            UsuariosNaFila.fila_id == fila.id, # type: ignore
            UsuariosNaFila.status == "aguardando" # type: ignore
        ).count()

        resultado.append({
            "id": fila.id,
            "nome": fila.nome,
            "descricao": fila.descricao,
            "estabelecimento_id": fila.estabelecimento_id,
            "estabelecimento": {
                "id": fila.estabelecimento.id,
                "nome": fila.estabelecimento.nome
            },
            "pessoas_na_fila": pessoas_na_fila
        })

    return {"filas": resultado}

# Rota para criar uma fila
@router.post("/criar-fila")
async def criar_fila(criar_fila_schema: CriarFilaSchema, session: Session = Depends(pegar_sessao)):
    nova_fila = Fila(
        nome = criar_fila_schema.nome, 
        descricao = criar_fila_schema.descricao,
        estabelecimento_id = criar_fila_schema.estabelecimento_id 
        )
    
    session.add(nova_fila)
    session.commit()

    return {"message": f"Fila criada com sucesso! ID da fila: {nova_fila.id}"}


# Rota para apagar fila completa
@router.post("/apagar-fila/{fila_id}")
async def apagar_fila(fila_id: int, session: Session = Depends (pegar_sessao), current_user: Usuario = Depends(verificar_token)):
    fila = session.query(Fila).filter(Fila.id == fila_id).first()
    if not fila:
        raise HTTPException(status_code=404, detail="Fila não encontrada")
    
    verificar_dono_fila(fila, current_user)
    
    # deletar os usuarios da fila
    usuarios = session.query(UsuariosNaFila).filter(UsuariosNaFila.fila_id == fila_id).all() #type: ignore
    for usuario in usuarios:
        session.delete(usuario)

    # Em seguida deleta a fila
    session.delete(fila)
    session.commit()

    return {
        "mensagem": f"Fila de {fila_id} apagado com sucesso!"
    }


# Rota para chamar o proximo da fila
@router.post("/{fila_id}/chamar-proximo")
async def chamar_proximo_usuario(fila_id: int, session: Session = Depends(pegar_sessao), current_user: Usuario = Depends(verificar_token)):
    fila = session.query(Fila).filter(Fila.id == fila_id).first()

    if not fila:
        raise HTTPException(status_code=404, detail="Fila não encontrada")
    
    usuario_chamado = chamar_proximo(fila, session, current_user)

    return {
        "message": f"Usuário {usuario_chamado.usuario_id} foi chamado!",
        "ordem": usuario_chamado.ordem
    }

    

# Para entrar usuarios na fila:
@router.post("/entrar-na-fila")
async def entrar_na_fila(usuarios_na_fila_schema: UsuariosNaFilaSchema, session: Session = Depends(pegar_sessao), current_user: Usuario = Depends(verificar_token)):
    fila = session.query(Fila).filter(Fila.id == usuarios_na_fila_schema.fila_id).first() # type: ignore
    if not fila:
        raise HTTPException(status_code=404, detail="Fila não encontrada")

    impedir_dono_entrar(fila, current_user) # type: ignore

    ordem = calcular_ordem(fila, session) # calcula a ordem automaticamente # type: ignore
    
    nova_entrada = UsuariosNaFila(
        usuario_id=current_user.id, #type: ignore
        fila_id=fila.id, #type: ignore
        ordem=ordem,
        status="aguardando"
    )

    session.add(nova_entrada)
    session.commit()

    return {
        "message": f"Você entrou na fila {fila.id} com sucesso!", #type: ignore
        "ordem_na_fila": ordem,
        "pessoas_na_frente": ordem - 1
    }


#rodar o test
'''
$env:PYTHONPATH="."
pytest ../tests/ --disable-warnings -v
'''