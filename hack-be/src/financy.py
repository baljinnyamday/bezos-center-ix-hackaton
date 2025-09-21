# pip install yfinance
import yfinance as yf

# ZW=F is Chicago SRW Wheat continuous ticker on Yahoo
t = yf.Ticker("ZW=F")
hist = t.history(period="3d", interval="30m")

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
