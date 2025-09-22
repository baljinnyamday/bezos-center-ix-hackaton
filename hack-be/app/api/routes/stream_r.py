import json
import logging
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from pydantic_ai.messages import ModelMessage

from src.db import DbDep
from src.stream_test import agent

router = APIRouter(prefix="/stream", tags=["Historical data submitted to cavecad"])
logger = logging.getLogger(__name__)


class ChatPrompt(BaseModel):
    prompt: str
    previous: list[str] | None = []


@router.get("/")
async def get(session: DbDep):
    try:
        response = await session.table("insights").select("*").execute()
        return JSONResponse(response.data, status_code=200)

    except Exception as e:
        logger.error(e)
        return JSONResponse("ERROR", status_code=500)


@router.post("/chat/")
async def post_chat(payload: ChatPrompt) -> StreamingResponse:
    async def stream_messages():
        """Streams new line delimited JSON `Message`s to the client."""
        # stream the user prompt so that can be displayed straight away

        # get the chat history so far to pass as context to the agent
        # messages = await database.get_messages()
        # run the agent with the user prompt and the chat history
        texts = []
        async with agent.run_stream(payload.prompt) as result:
            async for text in result.stream_text(debounce_by=0.01, delta=True):
                texts.append(text)
                yield text

        text = "".join(texts)
        print("FINAL TEXT", text)

        # add new messages (e.g. the user prompt and the agent response in this case) to the database
        # await database.add_messages(result.new_messages_json())

    return StreamingResponse(stream_messages(), media_type="text/event-stream")
