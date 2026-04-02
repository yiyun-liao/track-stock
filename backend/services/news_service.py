"""
News data fetching service using NewsAPI.

Input: Search keywords, number of articles
Output: List of news articles with standardized format
"""

from typing import List, Dict, Any
from datetime import datetime
import requests
import os


class NewsService:
    """Service for fetching and formatting news data."""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://newsapi.org/v2/everything"

    def fetch_news(
        self, keywords: List[str] | str, max_articles: int = 10
    ) -> Dict[str, Any]:
        if isinstance(keywords, list):
            query = " OR ".join(keywords)
        else:
            query = keywords

        try:
            params = {
                "q": query,
                "sortBy": "publishedAt",
                "language": "en",
                "pageSize": max_articles,
                "apiKey": self.api_key,
            }

            response = requests.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()

            if data.get("status") != "ok":
                return {
                    "error": data.get("message", "API error"),
                    "articles": [],
                }

            articles = []
            for article in data.get("articles", []):
                articles.append({
                    "title": article.get("title"),
                    "description": article.get("description"),
                    "source": article.get("source", {}).get("name"),
                    "url": article.get("url"),
                    "published_at": article.get("publishedAt"),
                    "image": article.get("urlToImage"),
                })

            return {
                "query": query,
                "total_results": data.get("totalResults", 0),
                "articles_returned": len(articles),
                "articles": articles,
                "fetched_at": datetime.now().isoformat(),
            }

        except requests.exceptions.RequestException as e:
            return {"error": f"Request failed: {str(e)}", "articles": []}
        except Exception as e:
            return {"error": f"Error processing news: {str(e)}", "articles": []}

    def fetch_stock_news(
        self, symbols: List[str], max_articles_per_symbol: int = 5
    ) -> Dict[str, Any]:
        result = {}

        for symbol in symbols:
            # Try searching by symbol and company name variations
            result[symbol] = self.fetch_news(symbol, max_articles_per_symbol)

        return result
