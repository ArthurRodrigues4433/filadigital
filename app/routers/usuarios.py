from fastapi import APIRouter, Depends, HTTPException  #type: ignore
from app.models import Usuario
from app.dependencies import pegar_sessao, verificar_token
from app.main import bcrypt_context, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from app.schemas import UsuarioSchema, LoginSchema
from sqlalchemy.orm import Session #type: ignore
from jose import jwt, JWTError #type: ignore
from datetime import datetime, timedelta, timezone
from fastapi.security import OAuth2PasswordRequestForm #type: ignore

router = APIRouter()

def criar_token(usuario_id, duracao_token=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)):
    data_expiracao = datetime.now(timezone.utc) + duracao_token
    dic_info = {"sub": str(usuario_id), "exp": data_expiracao}
    enconded_jwt = jwt.encode(dic_info, SECRET_KEY, ALGORITHM) #type: ignore
    return enconded_jwt


def autenticar_usuario(email: str, senha: str, session: Session):
    usuario = session.query(Usuario).filter(Usuario.email==email).first() #type: ignore
    if not usuario:
        return False
    elif not bcrypt_context.verify(senha, usuario.senha):
        return False
    return usuario


@router.get("/")
async def home():
    return {"message": "Usuário autenticado com sucesso!"}


@router.post("/registrar")
async def registrar_usuario(usuario_schema: UsuarioSchema , session: Session = Depends(pegar_sessao)):
    usuario = session.query(Usuario).filter(Usuario.email==usuario_schema.email).first() #type: ignore
    if usuario:
        return HTTPException(status_code=400, detail="Usuário já existe!")
    else:
        senha_criptografada = bcrypt_context.hash(usuario_schema.senha) 
        novo_usuario = Usuario(usuario_schema.nome, usuario_schema.email, senha_criptografada, usuario_schema.ativo, usuario_schema.admin) #type: ignore
        session.add(novo_usuario)
        session.commit()
        return {"message": f"Usuário registrado com sucesso!{usuario_schema.email}"}
    

@router.post("/login")
async def login(login_schema: LoginSchema, session: Session =  Depends(pegar_sessao)):
    usuario = autenticar_usuario(login_schema.email, login_schema.senha, session)
    if not usuario:
        raise HTTPException(status_code=400, detail="Usuário não encontrado ou dados invalidos!")
    else:
        access_token = criar_token(usuario.id)
        refresh_token = criar_token(usuario.id, duracao_token=timedelta(days=1))
        return {
            "access_token": access_token, 
            "refresh_token": refresh_token,
            "token_type": "bearer"
            }

# rota para trocar o token via form data no docs
@router.post("/login-form")
async def login_form(dados_formulario: OAuth2PasswordRequestForm = Depends(), session: Session =  Depends(pegar_sessao)):
    usuario = autenticar_usuario(dados_formulario.username, dados_formulario.password, session)
    if not usuario:
        raise HTTPException(status_code=400, detail="Usuário não encontrado ou dados invalidos!")
    else:
        access_token = criar_token(usuario.id)
        return {
            "access_token": access_token, 
            "token_type": "bearer"
            }


@router.get("/refresh")
async def use_refresh_token(usuario: Usuario = Depends(verificar_token)):
    access_token = criar_token(usuario.id)
    return {
        "access_token": access_token, 
        "token_type": "bearer"
        }