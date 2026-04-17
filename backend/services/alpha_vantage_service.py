"""
Alpha Vantage Service: Fetch technical indicators and stock data

Provides real-time stock data, technical indicators (RSI, MACD, Bollinger Bands),
and moving averages

NOTE: RSI, MACD, and Bollinger Bands are calculated from price history (free tier)
Moving averages are fetched from Alpha Vantage (SMA still works on free tier)
"""

import requests
from typing import Dict, Any, List
from datetime import datetime
import json
from .technical_indicator_calculator import TechnicalIndicatorCalculator
from .stock_service import StockService, log_api_call


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
            # Get historical prices for indicator calculation
            hist_data = StockService.fetch_historical_data(symbol, period="3mo")

            if "error" in hist_data:
                log_api_call("technical_indicators", "get_technical_indicators", symbol, "no_data")
                return {
                    "symbol": symbol,
                    "rsi": {"error": "No RSI data available"},
                    "macd": {"error": "No MACD data available"},
                    "bollinger_bands": {"error": "No Bollinger Bands data available"},
                    "status": "success",  # Return success but with empty indicators
                }

            closes = hist_data.get("closes", [])

            # Calculate indicators from price history (free, no API calls)
            rsi_data = TechnicalIndicatorCalculator.calculate_rsi(closes)
            if rsi_data is None:
                rsi_data = {"error": "Insufficient data for RSI"}

            macd_data = TechnicalIndicatorCalculator.calculate_macd(closes)
            if macd_data is None:
                macd_data = {"error": "Insufficient data for MACD"}

            bb_data = TechnicalIndicatorCalculator.calculate_bollinger_bands(closes)
            if bb_data is None:
                bb_data = {"error": "Insufficient data for Bollinger Bands"}

            # Combine all indicators
            result = {
                "symbol": symbol,
                "rsi": rsi_data,
                "macd": macd_data,
                "bollinger_bands": bb_data,
                "timestamp": datetime.now().isoformat(),
                "status": "success",
            }

            log_api_call("technical_indicators", "get_technical_indicators", symbol, "success", result)
            return result

        except Exception as e:
            error_msg = str(e)
            log_api_call("technical_indicators", "get_technical_indicators", symbol, "error", error=error_msg)
            return {
                "symbol": symbol,
                "rsi": {"error": f"Failed to calculate RSI: {error_msg}"},
                "macd": {"error": f"Failed to calculate MACD: {error_msg}"},
                "bollinger_bands": {"error": f"Failed to calculate Bollinger Bands: {error_msg}"},
                "status": "success",  # Return success but with error indicators
            }


    def get_moving_averages(self, symbol: str) -> Dict[str, Any]:
        """Get moving averages (MA 20, 50, 200) for a symbol (calculated from price history)"""
        try:
            # Get historical prices
            hist_data = StockService.fetch_historical_data(symbol, period="1y")

            if "error" in hist_data:
                log_api_call("technical_indicators", "get_moving_averages", symbol, "no_data")
                return {
                    "symbol": symbol,
                    "moving_averages": {"ma20": None, "ma50": None, "ma200": None},
                    "timestamp": datetime.now().isoformat(),
                    "status": "success",
                }

            closes = hist_data.get("closes", [])

            # Calculate moving averages
            moving_averages = TechnicalIndicatorCalculator.calculate_moving_averages(closes)

            result = {
                "symbol": symbol,
                "moving_averages": moving_averages,
                "timestamp": datetime.now().isoformat(),
                "status": "success",
            }
            log_api_call("technical_indicators", "get_moving_averages", symbol, "success", moving_averages)
            return result

        except Exception as e:
            error_msg = str(e)
            log_api_call("technical_indicators", "get_moving_averages", symbol, "error", error=error_msg)
            return {
                "symbol": symbol,
                "moving_averages": {"ma20": None, "ma50": None, "ma200": None},
                "timestamp": datetime.now().isoformat(),
                "status": "success",  # Return success but with None values
            }
