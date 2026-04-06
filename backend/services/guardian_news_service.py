"""
Guardian News Service: Fetch financial news from The Guardian API

Provides access to high-quality, independent journalism about finance and business
"""

import requests
from datetime import datetime, timedelta
from typing import List, Dict, Any
import os


class GuardianNewsService:
    """Service for fetching news from The Guardian API"""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://content.guardianapis.com/search"
        self.timeout = 10

    def fetch_stock_news(
        self, symbols: List[str], max_articles_per_symbol: int = 5
    ) -> Dict[str, Dict[str, Any]]:
        """
        Fetch financial news for given stock symbols from The Guardian

        Args:
            symbols: List of stock symbols (e.g., ['AAPL', 'MSFT'])
            max_articles_per_symbol: Maximum articles to fetch per symbol

        Returns:
            Dict with structure:
            {
                "AAPL": {
                    "articles": [
                        {
                            "title": "...",
                            "description": "...",
                            "url": "...",
                            "published_at": "...",
                            "source": "The Guardian"
                        }
                    ],
                    "total_results": 100,
                    "status": "success"
                }
            }
        """
        result = {}

        for symbol in symbols:
            try:
                articles = self._fetch_articles_for_symbol(symbol, max_articles_per_symbol)
                result[symbol] = {
                    "articles": articles,
                    "total_results": len(articles),
                    "status": "success" if articles else "no_results",
                }
            except Exception as e:
                result[symbol] = {
                    "error": f"Failed to fetch Guardian news for {symbol}: {str(e)}",
                    "status": "failed",
                }

        return result

    def _fetch_articles_for_symbol(
        self, symbol: str, max_articles: int
    ) -> List[Dict[str, Any]]:
        """Fetch articles for a single symbol from The Guardian"""
        # Search queries - company name and stock symbol
        queries = [
            symbol,  # e.g., "AAPL"
            f"{symbol} stock",  # e.g., "AAPL stock"
        ]

        all_articles = []
        seen_urls = set()

        for query in queries:
            try:
                params = {
                    "q": query,
                    "section": "business",  # Focus on business section
                    "type": "article",
                    "show-fields": "headline,shortUrl,byline,webPublicationDate,standfirst",
                    "order-by": "newest",
                    "page-size": max_articles * 2,  # Fetch more to account for duplicates
                    "api-key": self.api_key,
                }

                response = requests.get(
                    self.base_url, params=params, timeout=self.timeout
                )
                response.raise_for_status()
                data = response.json()

                if data.get("response", {}).get("results"):
                    for article in data["response"]["results"]:
                        article_url = article.get("fields", {}).get("shortUrl")

                        # Skip duplicates
                        if article_url in seen_urls:
                            continue

                        seen_urls.add(article_url)
                        all_articles.append(
                            {
                                "title": article.get("fields", {}).get("headline", ""),
                                "description": article.get("fields", {}).get(
                                    "standfirst", ""
                                ),
                                "url": article_url,
                                "published_at": article.get("fields", {}).get(
                                    "webPublicationDate", ""
                                ),
                                "source": "The Guardian",
                                "author": article.get("fields", {}).get("byline", ""),
                            }
                        )

                        if len(all_articles) >= max_articles:
                            break

                if len(all_articles) >= max_articles:
                    break

            except requests.exceptions.RequestException as e:
                print(f"Error fetching Guardian news for {query}: {str(e)}")
                continue

        return all_articles[:max_articles]
