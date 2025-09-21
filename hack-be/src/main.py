from dataclasses import dataclass

import openmeteo_requests
from pydantic import BaseModel
from pydantic_ai import Agent, RunContext


@dataclass
class SupportDependencies:
    location: str
    date: str


class OutputType(BaseModel):
    temp: float
    humidity: float
    interesting_fact_the_city: str


weather_agent = Agent(
    "openai:gpt-5",
    # deps_type=None,
    output_type=OutputType,
    system_prompt=(
        "Providing a weather forecast at the locations the user provides.",
        "You will use the tool to check weather.",
    ),
)


@weather_agent.tool
async def weather_checker(
    ctx: RunContext[None], latitude: float, longitude: float
) -> str:
    """To check weather for a given location."""
    openmeteo = openmeteo_requests.AsyncClient()
    print("Fetching weather data...")
    print(f"Latitude: {latitude}, Longitude: {longitude}")
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": ["temperature_2m", "precipitation", "wind_speed_10m"],
        "current": ["temperature_2m", "relative_humidity_2m"],
    }
    responses = await openmeteo.weather_api(url, params=params)
    for each_item in responses:
        print(each_item.UtcOffsetSeconds(), each_item.Elevation())
        current = each_item.Current()
        current_temperature_2m = current.Variables(0).Value()  # type: ignore
        current_relative_humidity_2m = current.Variables(1).Value()  # type: ignore

        print(f"Current time: {current.Time()}")  # type: ignore
        print(f"Current temperature_2m: {current_temperature_2m}")
        print(f"Current relative_humidity_2m: {current_relative_humidity_2m}")
    return f"The current temperature is {current_temperature_2m}°C with a humidity of {current_relative_humidity_2m}%."


result = weather_agent.run_sync("What is the weather like in Ulaanbaatar?", deps=None)
print(result.output.interesting_fact_the_city)
