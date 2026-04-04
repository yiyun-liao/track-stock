"""
Alpha Vantage Service: Fetch technical indicators and stock data

Provides real-time stock data, technical indicators (RSI, MACD, Bollinger Bands),
and moving averages
"""

import requests
from typing import Dict, Any, List
from datetime import datetime


class AlphaVantageService:
    """Service for fetching technical indicators from Alpha Vantage API"""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://www.alphavantage.co/query"
        self.timeout = 10

    def get_technical_indicators(self, symbol: str) -> Dict[str, Any]:
        """
        Get comprehensive technical indicators for a stock

        Args:
            symbol: Stock symbol (e.g., 'AAPL')

        Returns:
            Dict with technical indicators:
            {
                "symbol": "AAPL",
                "rsi": {"value": 65.5, "interpretation": "overbought"},
                "macd": {"signal": 2.5, "histogram": 0.3, "interpretation": "bullish"},
                "bollinger_bands": {"upper": 180, "middle": 175, "lower": 170},
                "moving_averages": {
                    "ma20": 174.5,
                    "ma50": 173.2,
                    "ma200": 172.1
                },
                "status": "success"
            }
        """
        try:
            # Fetch RSI
            rsi_data = self._fetch_rsi(symbol)

            # Fetch MACD
            macd_data = self._fetch_macd(symbol)

            # Fetch Bollinger Bands
            bb_data = self._fetch_bollinger_bands(symbol)

            # Combine all indicators
            result = {
                "symbol": symbol,
                "rsi": rsi_data,
                "macd": macd_data,
                "bollinger_bands": bb_data,
                "timestamp": datetime.now().isoformat(),
                "status": "success",
            }

            return result

        except Exception as e:
            return {
                "symbol": symbol,
                "error": f"Failed to fetch technical indicators: {str(e)}",
                "status": "failed",
            }

    def _fetch_rsi(self, symbol: str) -> Dict[str, Any]:
        """Fetch Relative Strength Index (RSI) for a symbol"""
        try:
            params = {
                "function": "RSI",
                "symbol": symbol,
                "interval": "daily",
                "time_period": 14,
                "apikey": self.api_key,
            }

            response = requests.get(self.base_url, params=params, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()

            if "Technical Analysis: RSI" in data:
                latest_date = next(iter(data["Technical Analysis: RSI"]))
                rsi_value = float(data["Technical Analysis: RSI"][latest_date]["RSI"])

                # RSI interpretation
                if rsi_value > 70:
                    interpretation = "overbought"
                elif rsi_value < 30:
                    interpretation = "oversold"
                else:
                    interpretation = "neutral"

                return {
                    "value": round(rsi_value, 2),
                    "interpretation": interpretation,
                    "timestamp": latest_date,
                }
            else:
                return {"error": "No RSI data available"}

        except Exception as e:
            return {"error": f"Failed to fetch RSI: {str(e)}"}

    def _fetch_macd(self, symbol: str) -> Dict[str, Any]:
        """Fetch MACD (Moving Average Convergence Divergence) for a symbol"""
        try:
            params = {
                "function": "MACD",
                "symbol": symbol,
                "interval": "daily",
                "apikey": self.api_key,
            }

            response = requests.get(self.base_url, params=params, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()

            if "Technical Analysis: MACD" in data:
                latest_date = next(iter(data["Technical Analysis: MACD"]))
                macd_data = data["Technical Analysis: MACD"][latest_date]

                macd_value = float(macd_data.get("MACD", 0))
                signal_value = float(macd_data.get("MACD_Signal", 0))
                histogram = macd_value - signal_value

                # MACD interpretation
                if histogram > 0:
                    interpretation = "bullish"
                elif histogram < 0:
                    interpretation = "bearish"
                else:
                    interpretation = "neutral"

                return {
                    "macd": round(macd_value, 4),
                    "signal": round(signal_value, 4),
                    "histogram": round(histogram, 4),
                    "interpretation": interpretation,
                    "timestamp": latest_date,
                }
            else:
                return {"error": "No MACD data available"}

        except Exception as e:
            return {"error": f"Failed to fetch MACD: {str(e)}"}

    def _fetch_bollinger_bands(self, symbol: str) -> Dict[str, Any]:
        """Fetch Bollinger Bands for a symbol"""
        try:
            params = {
                "function": "BBANDS",
                "symbol": symbol,
                "interval": "daily",
                "time_period": 20,
                "series_type": "close",
                "apikey": self.api_key,
            }

            response = requests.get(self.base_url, params=params, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()

            if "Technical Analysis: BBANDS" in data:
                latest_date = next(iter(data["Technical Analysis: BBANDS"]))
                bb_data = data["Technical Analysis: BBANDS"][latest_date]

                return {
                    "upper": round(float(bb_data.get("Real Upper Band", 0)), 2),
                    "middle": round(float(bb_data.get("Real Middle Band", 0)), 2),
                    "lower": round(float(bb_data.get("Real Lower Band", 0)), 2),
                    "timestamp": latest_date,
                }
            else:
                return {"error": "No Bollinger Bands data available"}

        except Exception as e:
            return {"error": f"Failed to fetch Bollinger Bands: {str(e)}"}

    def get_moving_averages(self, symbol: str) -> Dict[str, Any]:
        """Get moving averages (MA 20, 50, 200) for a symbol"""
        try:
            moving_averages = {}

            for period in [20, 50, 200]:
                ma_value = self._fetch_moving_average(symbol, period)
                moving_averages[f"ma{period}"] = ma_value

            return {
                "symbol": symbol,
                "moving_averages": moving_averages,
                "timestamp": datetime.now().isoformat(),
                "status": "success",
            }

        except Exception as e:
            return {
                "symbol": symbol,
                "error": f"Failed to fetch moving averages: {str(e)}",
                "status": "failed",
            }

    def _fetch_moving_average(self, symbol: str, time_period: int) -> float:
        """Fetch simple moving average for a symbol"""
        try:
            params = {
                "function": "SMA",
                "symbol": symbol,
                "interval": "daily",
                "time_period": time_period,
                "series_type": "close",
                "apikey": self.api_key,
            }

            response = requests.get(self.base_url, params=params, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()

            if "Technical Analysis: SMA" in data:
                latest_date = next(iter(data["Technical Analysis: SMA"]))
                sma_value = float(data["Technical Analysis: SMA"][latest_date]["SMA"])
                return round(sma_value, 2)
            else:
                return None

        except Exception as e:
            print(f"Error fetching MA{time_period}: {str(e)}")
            return None
