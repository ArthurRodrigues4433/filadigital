# Router para operações de filas
# Gerencia criação, entrada/saída de filas, QR codes e dashboards

from fastapi import APIRouter, Depends, HTTPException  # type: ignore
from sqlalchemy.orm import Session  # type: ignore
from app.dependencies import obter_sessao, verificar_token, verificar_dono_fila, impedir_owner_employee_entrar, calcular_ordem, chamar_proximo, require_role, require_establishment_access, require_queue_access
from app.services import QueueService, QRCodeService, NotificationService, DashboardService
from app.models import Priority, Role, Fila, UsuariosNaFila, Usuario, Estabelecimento
from app.schemas import CriarFilaSchema, UsuariosNaFilaSchema

router = APIRouter(dependencies=[Depends(verificar_token)])

@router.get("/")
async def listar_filas_usuario(session: Session = Depends(obter_sessao), current_user: Usuario = Depends(require_role(Role.dono))):
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
async def listar_filas_disponiveis(session: Session = Depends(obter_sessao), current_user: Usuario = Depends(require_role(Role.usuario))):
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
async def criar_fila(criar_fila_schema: CriarFilaSchema, session: Session = Depends(obter_sessao), current_user: Usuario = Depends(require_role(Role.dono))):
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
async def apagar_fila(fila_id: int, session: Session = Depends (obter_sessao), current_user: Usuario = Depends(require_role(Role.dono))):
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
async def chamar_proximo_usuario(fila_id: int, session: Session = Depends(obter_sessao), current_user: Usuario = Depends(verificar_token)):
    fila = session.query(Fila).filter(Fila.id == fila_id).first()

    if not fila:
        raise HTTPException(status_code=404, detail="Fila não encontrada")

    # Usar o novo service para chamar próximo com prioridades
    usuario_chamado = QueueService.call_next_customer(fila, session, current_user)

    if not usuario_chamado:
        raise HTTPException(status_code=404, detail="Não tem mais usuarios aguardando!")

    return {
        "message": f"Usuário {usuario_chamado.usuario_id} foi chamado!",
        "ordem": usuario_chamado.ordem
    }


# Rota para carregar a posição do usuario
@router.get("/minha-posicao")
async def minha_posicao(session: Session = Depends(obter_sessao), current_user: Usuario = Depends(verificar_token)):
    posicoes = session.query(UsuariosNaFila).join(Fila).join(Estabelecimento).filter(
        UsuariosNaFila.usuario_id == current_user.id, # type: ignore
        UsuariosNaFila.status == "aguardando" # type: ignore
    ).all()

    resultado = []
    for pos in posicoes:
        resultado.append({
            "id": pos.id,
            "fila_nome": pos.fila.nome,
            "fila_descricao": pos.fila.descricao,
            "estabelecimento_nome": pos.fila.estabelecimento.nome,
            "posicao": pos.ordem,
            "status": pos.status
        })

    return resultado


# Rota para para pegar o historico de filas
@router.get("/historico")
async def historico(session: Session = Depends(obter_sessao), current_user: Usuario = Depends(verificar_token)):

    historico_entradas = session.query(UsuariosNaFila).join(Fila).join(Estabelecimento).filter(
        UsuariosNaFila.usuario_id == current_user.id, # type: ignore
        UsuariosNaFila.status != "aguardando" # type: ignore
    ).all()
    
    resultado = []
    for entry in historico_entradas:
        # Mapear status para o formato esperado pelo frontend
        if entry.status == "atendido": # type: ignore
            status_frontend = "concluido"
        else:
            status_frontend = "cancelado"  # Para outros status
        
        resultado.append({
            "data_hora": entry.horario_entrada.isoformat(),
            "fila_nome": entry.fila.nome,
            "estabelecimento_nome": entry.fila.estabelecimento.nome,
            "posicao_final": entry.ordem,
            "status": status_frontend
        })
    
    return resultado


# Rota para sair da fila
@router.delete("/sair-da-fila/{posicao_id}")
async def sair_da_fila(posicao_id: int, session: Session = Depends(obter_sessao), current_user: Usuario = Depends(verificar_token)):
    # Buscar a entrada na fila
    entrada = session.query(UsuariosNaFila).filter(
        UsuariosNaFila.id == posicao_id, # type: ignore
        UsuariosNaFila.usuario_id == current_user.id # type: ignore
    ).first()

    if not entrada:
        raise HTTPException(status_code=404, detail="Entrada na fila não encontrada")

    # Remover a entrada
    session.delete(entrada)
    session.commit()

    return {"message": "Você saiu da fila com sucesso!"}


# Para entrar usuarios na fila:
@router.post("/entrar-na-fila")
async def entrar_na_fila(usuarios_na_fila_schema: UsuariosNaFilaSchema, session: Session = Depends(obter_sessao), current_user: Usuario = Depends(verificar_token)):
    fila = session.query(Fila).filter(Fila.id == usuarios_na_fila_schema.fila_id).first() # type: ignore
    if not fila:
        raise HTTPException(status_code=404, detail="Fila não encontrada")

    # Usar o service para adicionar com prioridade
    prioridade = usuarios_na_fila_schema.prioridade or Priority.normal

    try:
        nova_entrada = QueueService.add_customer_to_queue(fila, current_user, session, prioridade)

        # Notificar sobre mudança na fila
        NotificationService.notify_queue_updated(fila, session)

        return {
            "message": f"Você entrou na fila {fila.id} com sucesso!",
            "ordem_na_fila": nova_entrada.ordem,
            "prioridade": prioridade.value,
            "pessoas_na_frente": nova_entrada.ordem - 1
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# Gerar QR Code para fila presencial
@router.get("/{fila_id}/qr-code")
async def gerar_qr_code_fila(fila_id: int, session: Session = Depends(obter_sessao), current_user: Usuario = Depends(require_role(Role.dono))):
    fila = session.query(Fila).filter(Fila.id == fila_id).first()
    if not fila:
        raise HTTPException(status_code=404, detail="Fila não encontrada")

    # Verificar se o dono tem acesso à fila
    if fila.estabelecimento.usuario_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acesso negado à fila")

    # Gerar QR Code
    qr_code = QRCodeService.generate_queue_qr(fila)

    return {
        "fila_id": fila_id,
        "fila_nome": fila.nome,
        "qr_code": qr_code,
        "estabelecimento": fila.estabelecimento.nome,
        "validade": "24h"  # Em produção, implementar expiração
    }

# Entrar na fila via QR Code (para clientes presenciais)
@router.post("/entrar-via-qr")
async def entrar_via_qr(qr_code: str, session: Session = Depends(obter_sessao), current_user: Usuario = Depends(verificar_token)):
    # Validar QR Code e adicionar à fila
    entrada = QRCodeService.validate_qr_and_add_customer(qr_code, current_user, session, Priority.high)

    if not entrada:
        raise HTTPException(status_code=400, detail="QR Code inválido ou fila não encontrada")

    return {
        "message": "Entrada via QR Code realizada com sucesso!",
        "ordem_na_fila": entrada.ordem,
        "prioridade": entrada.prioridade.value
    }

# Dashboard do funcionário
@router.get("/dashboard-funcionario")
async def dashboard_funcionario(session: Session = Depends(obter_sessao), current_user: Usuario = Depends(require_role(Role.funcionario))):
    return DashboardService.get_employee_dashboard(current_user, session)

# Dashboard do cliente
@router.get("/dashboard-cliente")
async def dashboard_cliente(session: Session = Depends(obter_sessao), current_user: Usuario = Depends(require_role(Role.usuario))):
    return DashboardService.get_customer_dashboard(current_user, session)

#rodar o test
'''
$env:PYTHONPATH="."
pytest ../tests/ --disable-warnings -v
'''