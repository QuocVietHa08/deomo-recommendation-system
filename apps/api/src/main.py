from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.routers.chat import router as chat_router
from src.routers.sessions import router as sessions_router
from src.routers.wines import router as wines_router


def get_application() -> FastAPI:
    _app = FastAPI(
        title="VinoBuzz API",
        description="AI Sommelier wine recommendation chat API",
        version="1.0.0",
    )

    _app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    _app.include_router(chat_router)
    _app.include_router(wines_router)
    _app.include_router(sessions_router)

    @_app.get("/", include_in_schema=False)
    async def health():
        return {"status": "VinoBuzz API running"}

    return _app


app = get_application()
