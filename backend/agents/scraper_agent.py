"""
Scraper Agent: Integrate StockService and NewsService to fetch market data.

Responsibility: Fetch stock prices and news data for given symbols
Input: List of stock symbols
Output: Combined data from both services with timestamp
"""

from typing import List, Dict, Any
from datetime import datetime
from services.stock_service import StockService
from services.news_service import NewsService


class ScraperAgent:
    """Agent that scrapes stock and news data from multiple sources."""

    def __init__(self, stock_service: StockService, news_service: NewsService):
        self.stock_service = stock_service
        self.news_service = news_service

    def execute(self, symbols: List[str]) -> Dict[str, Any]:
        try:
            # Fetch stock data
            stocks = self.stock_service.fetch_latest_price(symbols)

            # Fetch news data
            news = self.news_service.fetch_stock_news(symbols)

            return {
                "timestamp": datetime.now().isoformat(),
                "symbols": symbols,
                "stocks": stocks,
                "news": news,
                "status": "success",
            }

        except Exception as e:
            return {
                "timestamp": datetime.now().isoformat(),
                "symbols": symbols,
                "error": str(e),
                "status": "failed",
            }

    def get_stock_data(self, symbols: List[str]) -> Dict[str, Any]:
        """Fetch only stock data."""
        return self.stock_service.fetch_latest_price(symbols)

    def get_news_data(self, symbols: List[str]) -> Dict[str, Any]:
        """Fetch only news data."""
        return self.news_service.fetch_stock_news(symbols)
