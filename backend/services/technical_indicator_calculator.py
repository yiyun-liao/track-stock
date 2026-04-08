"""
Technical Indicator Calculator

Calculates RSI, MACD, and Bollinger Bands from price data without relying on paid APIs.
Uses pandas for efficient numerical calculations.
"""

import pandas as pd
from typing import Dict, Any, List, Optional
from datetime import datetime


class TechnicalIndicatorCalculator:
    """Calculate technical indicators from OHLC price data"""

    @staticmethod
    def calculate_rsi(prices: List[float], period: int = 14) -> Optional[Dict[str, Any]]:
        """
        Calculate Relative Strength Index (RSI)

        Args:
            prices: List of closing prices (oldest to newest)
            period: RSI period (default 14)

        Returns:
            Dict with RSI value and interpretation, or None if insufficient data
        """
        if len(prices) < period + 1:
            return None

        # Convert to pandas Series for easier calculation
        price_series = pd.Series(prices)

        # Calculate price changes
        deltas = price_series.diff()

        # Separate gains and losses
        gains = deltas.where(deltas > 0, 0)
        losses = -deltas.where(deltas < 0, 0)

        # Calculate average gains and losses (using EMA)
        avg_gain = gains.ewm(span=period, adjust=False).mean()
        avg_loss = losses.ewm(span=period, adjust=False).mean()

        # Calculate RS and RSI
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))

        # Get the latest RSI value
        rsi_value = float(rsi.iloc[-1])

        # Determine interpretation
        if rsi_value > 70:
            interpretation = "overbought"
        elif rsi_value < 30:
            interpretation = "oversold"
        else:
            interpretation = "neutral"

        return {
            "value": round(rsi_value, 2),
            "interpretation": interpretation,
            "timestamp": datetime.now().isoformat(),
        }

    @staticmethod
    def calculate_macd(
        prices: List[float], short_window: int = 12, long_window: int = 26, signal_window: int = 9
    ) -> Optional[Dict[str, Any]]:
        """
        Calculate MACD (Moving Average Convergence Divergence)

        Args:
            prices: List of closing prices (oldest to newest)
            short_window: Short EMA period (default 12)
            long_window: Long EMA period (default 26)
            signal_window: Signal line EMA period (default 9)

        Returns:
            Dict with MACD, signal, histogram, and interpretation, or None if insufficient data
        """
        if len(prices) < long_window + signal_window:
            return None

        price_series = pd.Series(prices)

        # Calculate exponential moving averages
        short_ema = price_series.ewm(span=short_window, adjust=False).mean()
        long_ema = price_series.ewm(span=long_window, adjust=False).mean()

        # Calculate MACD line and signal line
        macd_line = short_ema - long_ema
        signal_line = macd_line.ewm(span=signal_window, adjust=False).mean()

        # Calculate histogram
        histogram = macd_line - signal_line

        # Get latest values
        macd_value = float(macd_line.iloc[-1])
        signal_value = float(signal_line.iloc[-1])
        histogram_value = float(histogram.iloc[-1])

        # Determine interpretation
        if histogram_value > 0:
            interpretation = "bullish"
        elif histogram_value < 0:
            interpretation = "bearish"
        else:
            interpretation = "neutral"

        return {
            "macd": round(macd_value, 4),
            "signal": round(signal_value, 4),
            "histogram": round(histogram_value, 4),
            "interpretation": interpretation,
            "timestamp": datetime.now().isoformat(),
        }

    @staticmethod
    def calculate_bollinger_bands(
        prices: List[float], period: int = 20, std_dev_mult: float = 2.0
    ) -> Optional[Dict[str, Any]]:
        """
        Calculate Bollinger Bands

        Args:
            prices: List of closing prices (oldest to newest)
            period: SMA period (default 20)
            std_dev_mult: Standard deviation multiplier (default 2.0)

        Returns:
            Dict with upper, middle, and lower bands, or None if insufficient data
        """
        if len(prices) < period:
            return None

        price_series = pd.Series(prices)

        # Calculate SMA (middle band)
        sma = price_series.rolling(window=period).mean()

        # Calculate standard deviation
        std = price_series.rolling(window=period).std()

        # Calculate upper and lower bands
        upper_band = sma + (std_dev_mult * std)
        lower_band = sma - (std_dev_mult * std)

        # Get latest values
        middle_value = float(sma.iloc[-1])
        upper_value = float(upper_band.iloc[-1])
        lower_value = float(lower_band.iloc[-1])

        return {
            "upper": round(upper_value, 2),
            "middle": round(middle_value, 2),
            "lower": round(lower_value, 2),
            "timestamp": datetime.now().isoformat(),
        }

    @staticmethod
    def calculate_moving_averages(prices: List[float]) -> Dict[str, Optional[float]]:
        """
        Calculate multiple moving averages

        Args:
            prices: List of closing prices (oldest to newest)

        Returns:
            Dict with MA20, MA50, MA200 values
        """
        price_series = pd.Series(prices)

        result = {}

        for period in [20, 50, 200]:
            if len(prices) >= period:
                ma = price_series.rolling(window=period).mean()
                result[f"ma{period}"] = round(float(ma.iloc[-1]), 2)
            else:
                result[f"ma{period}"] = None

        return result
