from fastapi import APIRouter

from app.api.routes import cavecad, images, login, private
from app.api.routes import stream_r as stream
from app.api.routes import utils, websocket
from app.api.secure import secure_router
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(websocket.router)
api_router.include_router(stream.router)

# api_router.include_router(login.router)
# api_router.include_router(secure_router)
# api_router.include_router(utils.router)

# if settings.ENVIRONMENT == "local":
#     api_router.include_router(private.router)
