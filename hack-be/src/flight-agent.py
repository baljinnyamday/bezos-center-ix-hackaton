"""Example of a multi-agent flow where agents make autonomous purchasing decisions.

Modified version that allows agents to automatically purchase tickets based on criteria.
"""

import datetime
from dataclasses import dataclass
from typing import Literal

import logfire
from pydantic import BaseModel, Field
from pydantic_ai import Agent, ModelRetry, RunContext, RunUsage, UsageLimits
from pydantic_ai.messages import ModelMessage


class SeatPreference(BaseModel):
    row: int = Field(ge=1, le=30)
    seat: Literal["A", "B", "C", "D", "E", "F"]
    reasoning: str = Field(description="Why this seat was chosen")


class FlightDetails(BaseModel):
    """Details of the most suitable flight."""

    flight_number: str
    price: int
    origin: str = Field(description="Three-letter airport code")
    destination: str = Field(description="Three-letter airport code")
    date: datetime.date


class NoFlightFound(BaseModel):
    """When no valid flight is found."""


class PurchaseDecision(BaseModel):
    """Decision about whether to purchase a flight."""

    should_purchase: bool
    reasoning: str
    selected_flight: FlightDetails | None = None


class PurchaseRules(BaseModel):
    """Rules for autonomous purchasing decisions."""

    max_budget: int = 500
    auto_purchase_threshold: int = 300  # Auto-buy if under this amount
    preferred_airlines: list[str] = []  # Preferred airline codes
    avoid_early_morning: bool = True  # Avoid flights before 6 AM
    prefer_direct_flights: bool = True


@dataclass
class Deps:
    web_page_text: str
    req_origin: str
    req_destination: str
    req_date: datetime.date
    purchase_rules: PurchaseRules
    auto_purchase: bool = True  # Enable autonomous purchasing


# Enhanced search agent that can make purchase decisions
search_agent = Agent[Deps, PurchaseDecision](
    "openai:gpt-4o",
    output_type=PurchaseDecision,
    deps_type=Deps,
    retries=4,
    system_prompt=(
        "You are a flight booking agent that can make autonomous purchasing decisions. "
        "Your job is to find the best flight for the user and decide whether to purchase it. "
        "Consider factors like price, timing, and user preferences. "
        "If auto_purchase is enabled and you find a suitable flight within budget, you should purchase it. "
        "Always provide clear reasoning for your decision."
    ),
)

# Flight extraction agent (same as before)
extraction_agent = Agent(
    "openai:gpt-4o",
    output_type=list[FlightDetails],
    system_prompt="Extract all the flight details from the given text.",
)

# Autonomous seat selection agent
seat_selection_agent = Agent[FlightDetails, SeatPreference](
    "openai:gpt-4o",
    output_type=SeatPreference,
    deps_type=FlightDetails,
    system_prompt=(
        "You are an autonomous seat selection agent. "
        "Choose the best seat based on general preferences: "
        "- Window seats (A, F) are generally preferred "
        "- Front rows (1-3) have more legroom but may be noisier "
        "- Emergency exit rows (14, 20) have extra legroom "
        "- Middle rows (10-15) are usually quieter "
        "Make a reasonable choice based on these factors."
    ),
)


@search_agent.tool
async def extract_flights(ctx: RunContext[Deps]) -> list[FlightDetails]:
    """Get details of all flights."""
    result = await extraction_agent.run(ctx.deps.web_page_text, usage=ctx.usage)
    logfire.info("found {flight_count} flights", flight_count=len(result.output))
    return result.output


@search_agent.tool
async def analyze_flight_options(
    ctx: RunContext[Deps], flights: list[FlightDetails]
) -> str:
    """Analyze available flights and provide recommendations."""
    if not flights:
        return "No flights available for the requested route and date."

    # Filter flights that match criteria
    matching_flights = [
        f
        for f in flights
        if (
            f.origin == ctx.deps.req_origin
            and f.destination == ctx.deps.req_destination
            and f.date == ctx.deps.req_date
        )
    ]

    if not matching_flights:
        return "No flights match the requested criteria."

    # Sort by price
    matching_flights.sort(key=lambda x: x.price)

    analysis = f"Found {len(matching_flights)} matching flights:\n"
    for flight in matching_flights:
        within_budget = flight.price <= ctx.deps.purchase_rules.max_budget
        analysis += f"- {flight.flight_number}: ${flight.price} {'(within budget)' if within_budget else '(over budget)'}\n"

    cheapest = matching_flights[0]
    analysis += f"\nCheapest option: {cheapest.flight_number} for ${cheapest.price}"

    if (
        ctx.deps.auto_purchase
        and cheapest.price <= ctx.deps.purchase_rules.auto_purchase_threshold
    ):
        analysis += f"\nRECOMMENDATION: Purchase {cheapest.flight_number} - it's within budget and the cheapest available."

    return analysis


@search_agent.tool
async def select_seat_automatically(
    ctx: RunContext[Deps], flight: FlightDetails
) -> SeatPreference:
    """Automatically select the best available seat for the flight."""
    result = await seat_selection_agent.run(
        f"Select the best seat for flight {flight.flight_number}",
        deps=flight,
        usage=ctx.usage,
    )
    return result.output


@search_agent.tool
async def purchase_flight_and_seat(
    ctx: RunContext[Deps], flight: FlightDetails, seat: SeatPreference
) -> str:
    """Execute the flight and seat purchase."""
    # In a real implementation, this would call actual booking APIs
    purchase_details = {
        "flight": flight.flight_number,
        "price": flight.price,
        "route": f"{flight.origin} → {flight.destination}",
        "date": flight.date.strftime("%Y-%m-%d"),
        "seat": f"{seat.row}{seat.seat}",
        "total_cost": flight.price + 25,  # Adding seat selection fee
    }

    # Simulate purchase process
    confirmation_number = f"CONF{hash(str(purchase_details)) % 1000000:06d}"

    return (
        f"✅ PURCHASE COMPLETED!\nConfirmation: {confirmation_number}\n"
        + f"Flight: {purchase_details['flight']}\n"
        + f"Route: {purchase_details['route']}\n"
        + f"Date: {purchase_details['date']}\n"
        + f"Seat: {purchase_details['seat']}\n"
        + f"Total Cost: ${purchase_details['total_cost']}"
    )


# Sample flight data (same as original)
flights_web_page = """
1. Flight SFO-AK123
- Price: $350
- Origin: San Francisco International Airport (SFO)
- Destination: Ted Stevens Anchorage International Airport (ANC)
- Date: January 10, 2025

2. Flight SFO-AK456
- Price: $370
- Origin: San Francisco International Airport (SFO)
- Destination: Fairbanks International Airport (FAI)
- Date: January 10, 2025

3. Flight NYC-LA101
- Price: $250
- Origin: San Francisco International Airport (SFO)
- Destination: Ted Stevens Anchorage International Airport (ANC)
- Date: January 10, 2025

4. Flight BOS-SEA303
- Price: $120
- Origin: Boston Logan International Airport (BOS)
- Destination: Ted Stevens Anchorage International Airport (ANC)
- Date: January 12, 2025
"""


async def main():
    # Configure the agent for autonomous purchasing
    deps = Deps(
        web_page_text=flights_web_page,
        req_origin="SFO",
        req_destination="ANC",
        req_date=datetime.date(2025, 1, 10),
        auto_purchase=True,
        purchase_rules=PurchaseRules(max_budget=400, auto_purchase_threshold=350),
    )

    usage_limits = UsageLimits(request_limit=15)
    usage = RunUsage()

    print(
        f"🔍 Searching for flights from {deps.req_origin} to {deps.req_destination} on {deps.req_date}"
    )
    print(f"💰 Budget: ${deps.purchase_rules.max_budget}")
    print(f"🤖 Auto-purchase: {'Enabled' if deps.auto_purchase else 'Disabled'}")
    print("-" * 50)

    result = await search_agent.run(
        f"Find and potentially purchase a flight from {deps.req_origin} to {deps.req_destination} on {deps.req_date}. "
        f"My budget is ${deps.purchase_rules.max_budget}. If you find a good deal within budget, go ahead and buy it!",
        deps=deps,
        usage=usage,
        usage_limits=usage_limits,
    )

    decision = result.output
    print(
        f"\n🤔 Agent Decision: {'PURCHASE' if decision.should_purchase else 'NO PURCHASE'}"
    )
    print(f"📝 Reasoning: {decision.reasoning}")

    if decision.selected_flight:
        print(
            f"✈️  Selected Flight: {decision.selected_flight.flight_number} - ${decision.selected_flight.price}"
        )


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
