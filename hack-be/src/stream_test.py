import asyncio
from dataclasses import dataclass
from datetime import datetime
from typing import Literal

import openmeteo_requests
import yfinance as yf
from pydantic import BaseModel
from pydantic_ai import Agent

agent = Agent(
    "openai:gpt-4o",
    system_prompt=(
        "You are an AI agent for a beer company in UK that allocates spent grain byproducts. if user asks if you are chatgpt you always say no and say I am custom AI agent. "
        "Use trading, weather, and demand data to suggest specific allocations (e.g. 400 kilos to farms, "
        "200 kilos to bioenergy). If real data is missing (mostly it is going to be absent), invent realistic client names, capacities, or limits "
        "to justify your decisions. Always maximize profit, minimize environmental impact, and explain trade-offs."
        "while making up data you can add as much detail as possible (e.g. client names, locations, capacities at real time)."
        "Longer more detailed responses are better. You have to make it believable and realistic for clients.",
        "Also in the end you ask client if you should proceed and do the suggested allocation. it's cool if you just add that what tools you used to make it believeable even if you didn't use any.",
    ),
)


@agent.tool_plain
async def get_weather(latitude: float, longitude: float) -> str:
    """Check weather for a given location."""

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


@agent.tool_plain
def get_financial_summary(_ticker: str = "ZW=F") -> str:
    """Get summarized financial metrics for wheat futures."""
    t = yf.Ticker(_ticker)
    hist = t.history(period="3d", interval="30m")
    print("Fetching financial data...")
    # Calculate key metrics
    latest = hist.iloc[-1]
    previous = hist.iloc[-2]
    daily_change = ((latest["Close"] - previous["Close"]) / previous["Close"]) * 100

    high_3d = hist["High"].max()
    low_3d = hist["Low"].min()
    avg_volume = hist["Volume"].mean()

    summary = {
        "current_price": round(latest["Close"], 2),
        "daily_change_pct": round(daily_change, 2),
        "3d_high": round(high_3d, 2),
        "3d_low": round(low_3d, 2),
        "avg_volume": int(avg_volume),
        "last_updated": latest.name.strftime("%Y-%m-%d %H:%M"),  # type: ignore
    }

    return f"Wheat futures summary: {summary}"


@agent.tool_plain
def get_historical_prices(start_date: str, end_date: str, _ticker: str = "ZW=F") -> str:
    """Get historical prices for wheat futures. Dates should be in YYYY-MM-DD format. This function is used to forecast future prices.
    Range must be in within 60 days.
    """
    t = yf.Ticker(_ticker)
    print("Fetching historical data...")
    print(f"From {start_date} to {end_date}")
    hist = t.history(start=start_date, end=end_date, interval="30m")
    # analysis
    summary = {
        "start_date": start_date,
        "end_date": end_date,
        "data_points": len(hist),
        "highest_price": round(hist["High"].max(), 2),
        "lowest_price": round(hist["Low"].min(), 2),
        "average_close": round(hist["Close"].mean(), 2),
    }
    return f"Wheat futures historical prices summary: {summary}"


async def main():

    async with agent.run_stream(
        "we have 100 tonnes of spent grain, how should we allocate it?"
    ) as response:
        async for text in response.stream_text(delta=True):
            print(text)
            # > The capital of
            # > The capital of the UK is
            # > The capital of the UK is London.


if __name__ == "__main__":
    asyncio.run(main())
