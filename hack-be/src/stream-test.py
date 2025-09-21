import asyncio

from pydantic_ai import Agent

agent = Agent(
    "openai:gpt-4o",
    system_prompt=(
        "You are an AI agent for a beer company that allocates spent grain byproducts. "
        "Use trading, weather, and demand data to suggest specific allocations (e.g. 20 tonnes to farms, "
        "50 tonnes to bioenergy). If real data is missing (mostly it is going to be absent), invent realistic client names, capacities, or limits "
        "to justify your decisions. Always maximize profit, minimize environmental impact, and explain trade-offs."
        "while making up data you can add as much detail as possible (e.g. client names, locations, capacities at real time)."
    ),
)

# result_sync = agent.run_sync("What is the capital of Italy?")
# print(result_sync.output)
# > The capital of Italy is Rome.


async def main():
    result = await agent.run("What is the capital of France?")
    print(result.output)
    # > The capital of France is Paris.

    async with agent.run_stream(
        "we have 100 tonnes of spent grain, how should we allocate it?"
    ) as response:
        async for text in response.stream_text():
            print(text)
            # > The capital of
            # > The capital of the UK is
            # > The capital of the UK is London.


asyncio.run(main())


# @app.post('/chat/')
# async def post_chat(
#     prompt: Annotated[str, fastapi.Form()], database: Database = Depends(get_db)
# ) -> StreamingResponse:
#     async def stream_messages():
#         """Streams new line delimited JSON `Message`s to the client."""
#         # stream the user prompt so that can be displayed straight away
#         yield (
#             json.dumps(
#                 {
#                     'role': 'user',
#                     'timestamp': datetime.now(tz=timezone.utc).isoformat(),
#                     'content': prompt,
#                 }
#             ).encode('utf-8')
#             + b'\n'
#         )
#         # get the chat history so far to pass as context to the agent
#         messages = await database.get_messages()
#         # run the agent with the user prompt and the chat history
#         async with agent.run_stream(prompt, message_history=messages) as result:
#             async for text in result.stream_output(debounce_by=0.01):
#                 # text here is a `str` and the frontend wants
#                 # JSON encoded ModelResponse, so we create one
#                 m = ModelResponse(parts=[TextPart(text)], timestamp=result.timestamp())
#                 yield json.dumps(to_chat_message(m)).encode('utf-8') + b'\n'

#         # add new messages (e.g. the user prompt and the agent response in this case) to the database
#         await database.add_messages(result.new_messages_json())

#     return StreamingResponse(stream_messages(), media_type='text/plain')
