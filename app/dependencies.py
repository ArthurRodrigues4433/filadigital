from app.database import engine
from app.main import SECRET_KEY, ALGORITHM, oauth2_scheme
from sqlalchemy.orm import sessionmaker, Session #type: ignore
from fastapi import Depends, HTTPException #type: ignore
from app.models import Usuario
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