"""
Stock data fetching service using yfinance.

Input: List of stock symbols (e.g., ["AAPL", "MSFT"])
Output: Dict of stock data with standardized format
"""

from typing import List, Dict, Any
from datetime import datetime, timedelta
import yfinance as yf


class StockService:
    """Service for fetching and formatting stock data."""

    @staticmethod
    def fetch_latest_price(symbols: List[str]) -> Dict[str, Any]:
        """
        Fetch latest price for multiple stocks.

        Args:
            symbols: List of stock symbols (e.g., ["AAPL", "MSFT"])

        Returns:
            Dict mapping symbol -> {price, change, change_pct, currency, timestamp}
        """
        result = {}

        for symbol in symbols:
            try:
                ticker = yf.Ticker(symbol)
                data = ticker.history(period="1d")

                if data.empty:
                    result[symbol] = {"error": f"No data found for {symbol}"}
                    continue

                latest = data.iloc[-1]
                prev_close = ticker.info.get("previousClose", latest["Open"])

                result[symbol] = {
                    "symbol": symbol,
                    "price": round(latest["Close"], 2),
                    "change": round(latest["Close"] - prev_close, 2),
                    "change_pct": round(((latest["Close"] - prev_close) / prev_close * 100), 2),
                    "open": round(latest["Open"], 2),
                    "high": round(latest["High"], 2),
                    "low": round(latest["Low"], 2),
                    "volume": int(latest["Volume"]),
                    "timestamp": datetime.now().isoformat(),
                }
            except Exception as e:
                result[symbol] = {"error": str(e)}

        return result

    @staticmethod
    def fetch_historical_data(
        symbol: str, period: str = "1mo"
    ) -> Dict[str, Any]:
        """
        Fetch historical data for a stock.

        Args:
            symbol: Stock symbol (e.g., "AAPL")
            period: Period for history (e.g., "1d", "1mo", "1y")

        Returns:
            Dict with dates, closes, and summary
        """
        try:
            ticker = yf.Ticker(symbol)
            data = ticker.history(period=period)

            if data.empty:
                return {"error": f"No historical data found for {symbol}"}

            return {
                "symbol": symbol,
                "period": period,
                "dates": data.index.strftime("%Y-%m-%d").tolist(),
                "closes": data["Close"].round(2).tolist(),
                "volumes": data["Volume"].astype(int).tolist(),
                "latest": {
                    "price": round(data["Close"].iloc[-1], 2),
                    "date": data.index[-1].strftime("%Y-%m-%d"),
                },
            }
        except Exception as e:
            return {"error": str(e)}
