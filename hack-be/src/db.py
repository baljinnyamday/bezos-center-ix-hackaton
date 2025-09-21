import os

from supabase import Client, create_client

url: str = "https://ejlsmygxkodqfrfqfiio.supabase.co"
key: str = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqbHNteWd4a29kcWZyZnFmaWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNTc2MzUsImV4cCI6MjA3MzkzMzYzNX0.Oa9WqNbiv3OLnxEB8EeUFWQleJlYod2I52Lv0N9HAaw"
)

supabase: Client = create_client(url, key)

response = supabase.table("insights").select("*").execute()
print(response.data)
