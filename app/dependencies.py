from app.database import engine
from app.main import SECRET_KEY, ALGORITHM, oauth2_scheme
from sqlalchemy.orm import sessionmaker, Session #type: ignore
from fastapi import Depends, HTTPException #type: ignore
from app.models import Usuario, Fila, UsuariosNaFila, Estabelecimento
from jose import jwt, JWTError  #type: ignore

# cria uma "fábrica" de sessões
Session = sessionmaker(bind=engine)

def pegar_sessao():
    session = Session()   # abre a conexão
    try:
        yield session     # entrega a sessão para a rota
    finally:
        session.close()   # fecha a conexão quando acabar

def verificar_token(token: str = Depends(oauth2_scheme), session: Session = Depends(pegar_sessao)): #type: ignore
    try:
        dic_info = jwt.decode(token, SECRET_KEY, ALGORITHM) #type: ignore 
        usuario_id = int(dic_info.get("sub")) #type: ignore
    except JWTError:
        raise HTTPException(status_code=401, detail="Acesso Negado, Verifique a validade do token!")
    # verificar o token
    # extrair o id do usuario do token
    usuario = session.query(Usuario).filter(Usuario.id==usuario_id).first() #type: ignore
    if not usuario:
        raise HTTPException(status_code=401, detail="Usuário não encontrado!")
    return usuario

# Função para verificar o dono do estabelecimento
def verificar_dono_estabelecimento(estabelecimento: Estabelecimento, usuario: Usuario):
    if estabelecimento.usuario_id != usuario.id:
        raise HTTPException(status_code=403, detail="Você não tem permissão para apagar este estabelecimento")

# Função para verificar o dono da fila
def verificar_dono_fila(fila: Fila, usuario: Usuario):
    if fila.estabelecimento.usuario_id != usuario.id:
        raise HTTPException(status_code=403, detail="Sem permissão")

# Função para inpedir do dono entrar na fila 
def impedir_dono_entrar(fila: Fila, usuario: Usuario):
    if fila.estabelecimento.usuario_id == usuario.id:
        raise HTTPException(status_code=403, detail="Dono do estabelecimento não pode entrar na própria fila")
    
# Função para calcular ordem da fila
def calcular_ordem(fila: Fila, session: Session): # type: ignore
    quantidade = session.query(UsuariosNaFila).filter(
        UsuariosNaFila.fila_id == fila.id,
        UsuariosNaFila.status == "aguardando"
    ).count()
    return quantidade + 1

# Função para chemar o proximo da fila e atualizar o status
def chamar_proximo(fila: Fila, session: Session, usuario: Usuario) -> UsuariosNaFila: # type: ignore
    # Só o dono pode chamar o proximo
    if fila.estabelecimento.usuario_id != usuario.id:
        raise HTTPException(status_code=404, detail="Sem permissão")
    
    # Pega o proximo usuario que está aguardando
    proximo_usuario = session.query(UsuariosNaFila)\
        .filter(
            UsuariosNaFila.fila_id == fila.id,
            UsuariosNaFila.status == "aguardando",
        )\
        .order_by(UsuariosNaFila.ordem)\
        .first()
    
    if not proximo_usuario:
        raise HTTPException(status_code=404, detail="Não tem mais usuarios aguardando!")
    
    proximo_usuario.status = "atendido"
    session.commit()

    return proximo_usuario
        