import os
from typing import Annotated

from fastapi import Depends
from supabase import AsyncClient, acreate_client

from src.config import settings

url: str = settings.URL
key: str = settings.KEY


async def create_supabase():
    supabase: AsyncClient = await acreate_client(url, key)
    return supabase


DbDep = Annotated[AsyncClient, Depends(create_supabase)]


# response = supabase.table("insights").select("*").execute()
# print(response.data)
