from fastapi import FastAPI #type: ignore
from fastapi.middleware.cors import CORSMiddleware #type: ignore
from fastapi.staticfiles import StaticFiles #type: ignore
from passlib.context import CryptContext #type: ignore
from fastapi.security import OAuth2PasswordBearer #type: ignore
from dotenv import load_dotenv  #type: ignore
import os

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")) # type: ignore

app = FastAPI(title="FilaDigital")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especifique os domínios permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir arquivos estáticos do front-end
app.mount("/frontend", StaticFiles(directory="frontend"), name="frontend")

# Rota para redirecionar para o front-end
from fastapi.responses import RedirectResponse
@app.get("/")
async def root():
    return RedirectResponse(url="/frontend/index.html")

bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="usuarios/login-form")

from app.routers import usuarios, estabelecimentos, filas
from app.database import Base, engine

Base.metadata.create_all(bind=engine)

# Incluindo as rotas
app.include_router(usuarios.router, prefix="/usuarios", tags=["Usuários"])
app.include_router(estabelecimentos.router, prefix="/estabelecimentos", tags=["Estabelecimentos"])
app.include_router(filas.router, prefix="/filas", tags=["Filas"])

# para rodar o servidor: uvicorn app.main:app --reload

#ativar ambiente virtual: .\venv\Scripts\activate

'''
---testa o codigo---

$env:PYTHONPATH="."
pytest tests/ --disable-warnings -v
'''