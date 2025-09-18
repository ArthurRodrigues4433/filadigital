# Aplicação principal FastAPI para o sistema FilaDigital
# Configura a aplicação, middlewares e rotas

from fastapi import FastAPI  # type: ignore
from fastapi.middleware.cors import CORSMiddleware  # type: ignore
from fastapi.staticfiles import StaticFiles  # type: ignore
from fastapi.responses import RedirectResponse
from app.config import (
    APP_TITLE,
    CORS_ORIGINS,
    CORS_CREDENTIALS,
    CORS_METHODS,
    CORS_HEADERS,
    STATIC_DIRECTORY,
    STATIC_MOUNT_PATH
)

# Cria a aplicação FastAPI
app = FastAPI(title=APP_TITLE)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,  # Em produção, especifique os domínios permitidos
    allow_credentials=CORS_CREDENTIALS,
    allow_methods=CORS_METHODS,
    allow_headers=CORS_HEADERS,
)

# Servir arquivos estáticos do front-end
app.mount(STATIC_MOUNT_PATH, StaticFiles(directory=STATIC_DIRECTORY), name="frontend")

# Rota para redirecionar para o front-end
@app.get("/")
async def root():
    return RedirectResponse(url="/frontend/index.html")

# Endpoint de teste para verificar conectividade
@app.get("/api/test")
async def api_test():
    return {"message": "API FilaDigital está funcionando!", "status": "ok"}

from app.routers import usuarios, estabelecimentos, filas
from app.database import Base, engine

Base.metadata.create_all(bind=engine)

# Incluindo as rotas
app.include_router(usuarios.router, prefix="/usuarios", tags=["Usuários"])
app.include_router(estabelecimentos.router, prefix="/estabelecimentos", tags=["Estabelecimentos"])
app.include_router(filas.router, prefix="/filas", tags=["Filas"])

# Para executar o servidor:
# uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Para ativar o ambiente virtual:
# .\venv\Scripts\activate

# Para executar os testes:
# $env:PYTHONPATH="."
# pytest tests/ --disable-warnings -v