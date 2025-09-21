from dataclasses import dataclass

import openmeteo_requests
from pydantic_ai import Agent, RunContext

openmeteo = openmeteo_requests.Client()
latitude: float = 52.52
longitude: float = 13.405
