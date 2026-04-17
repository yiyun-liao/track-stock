"""
Stock data fetching service using yfinance.

Input: List of stock symbols (e.g., ["AAPL", "MSFT"])
Output: Dict of stock data with standardized format
"""

from typing import List, Dict, Any
from datetime import datetime, timedelta
import yfinance as yf
import json


# Configure logging
def log_api_call(api_name: str, endpoint: str, symbol: str, status: str, data: Any = None, error: str = None):
    """Log API call details with timestamp"""
    timestamp = datetime.now().isoformat()
    log_data = {
        "timestamp": timestamp,
        "api": api_name,
        "endpoint": endpoint,
        "symbol": symbol,
        "status": status,
    }
    if data:
        log_data["data_sample"] = str(data)[:200] if isinstance(data, str) else data
    if error:
        log_data["error"] = error
    print(f"[API_LOG] {json.dumps(log_data, indent=2)}")


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
                    log_api_call("yfinance", "fetch_latest_price", symbol, "no_data")
                    result[symbol] = {"error": f"No data found for {symbol}"}
                    continue

                latest = data.iloc[-1]
                prev_close = ticker.info.get("previousClose", latest["Open"])

                stock_data = {
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
                result[symbol] = stock_data
                log_api_call("yfinance", "fetch_latest_price", symbol, "success", stock_data)
            except Exception as e:
                error_msg = str(e)
                log_api_call("yfinance", "fetch_latest_price", symbol, "error", error=error_msg)
                result[symbol] = {"error": error_msg}

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
                log_api_call("yfinance", "fetch_historical_data", symbol, "no_data")
                return {"error": f"No historical data found for {symbol}"}

            hist_data = {
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
            log_api_call("yfinance", "fetch_historical_data", symbol, "success",
                        f"fetched {len(hist_data['dates'])} records")
            return hist_data
        except Exception as e:
            error_msg = str(e)
            log_api_call("yfinance", "fetch_historical_data", symbol, "error", error=error_msg)
            return {"error": error_msg}
