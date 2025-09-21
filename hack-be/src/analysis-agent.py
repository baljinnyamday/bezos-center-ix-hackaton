import asyncio
from dataclasses import dataclass
from typing import Literal

import openmeteo_requests
import yfinance as yf
from pydantic import BaseModel
from pydantic_ai import Agent, RunContext

latitude = 51.51
longitude = 0.12


@dataclass
class SupportDependencies:
    pass


class CompanyModel(BaseModel):
    name: Literal[
        "Niskus LLC",
        "Happy Cow Farming",
        "Jung and brothers",
        "Flour company",
        "Gold Brewery",
        # companies to buy wheat
        "Bread and Butter Inc",
        "Healthy Snacks Co",
        "Pasta Makers Ltd",
        "Organic Farms",
        "Eco Foods",
        "Sustainable Supplies",
    ]
    sustainability_score: float
    profit_margin: float
    market_trend: str


class OutputType(BaseModel):
    companies_to_sell: list[CompanyModel]
    companies_to_buy: list[CompanyModel]
    sustainability_insights: str
    financial_insights: str


analysis_agent = Agent(
    "openai:gpt-4",
    deps_type=SupportDependencies,
    output_type=OutputType,
    system_prompt=(
        "You are an expert in analyzing business operations with a focus on sustainability.",
        "Your focus will be on the beer industry and it's supply chain.",
        "You will find the best use for spent grain from beer production using data.",
        "your financial insights should be extremely professional and long text",
    ),
)


@analysis_agent.tool_plain
async def get_weather() -> str:
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


@analysis_agent.tool_plain
def get_financial_summary() -> str:
    """Get summarized financial metrics for wheat futures."""
    t = yf.Ticker("ZW=F")
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


@analysis_agent.tool_plain
def get_historical_prices(start_date: str, end_date: str) -> str:
    """Get historical prices for wheat futures. Dates should be in YYYY-MM-DD format. This function is used to forecast future prices.
    Range must be in within 60 days.
    """
    t = yf.Ticker("ZW=F")
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
    result = await analysis_agent.run(
        "tell me which companies to buy wheat and which companies to sell wheat to maximize profit and sustainability. Provide detailed financial and sustainability insights.",
        deps=SupportDependencies(),
    )
    print(result.output)
    # async with analysis_agent.run_stream(
    #     "tell me which companies to buy wheat and which companies to sell wheat to maximize profit and sustainability. Provide detailed financial and sustainability insights.",
    #     deps=SupportDependencies(),
    # ) as response:
    #     async for text in response.stream_text():
    #         print(text)


asyncio.run(main())
