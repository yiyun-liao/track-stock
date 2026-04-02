"""
Analyzer Agent: Analyze stock and news data using Claude AI.

Responsibility: Generate AI-powered analysis (news summary, price alerts, investment advice)
Input: ScraperAgent output (stock and news data)
Output: AI analysis with news summary, price alerts, and investment advice
"""

from typing import List, Dict, Any
from datetime import datetime
from anthropic import Anthropic


class AnalyzerAgent:
    """Agent that analyzes stock data and news using Claude AI."""

    def __init__(self, claude_api_key: str):
        """
        Initialize with Claude API key (dependency injection).

        Args:
            claude_api_key: Anthropic API key for Claude
        """
        self.client = Anthropic(api_key=claude_api_key)
        self.model = "claude-sonnet-4-6"

    def execute(self, scraper_output: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main entry point: Analyze ScraperAgent output.

        Args:
            scraper_output: Output from ScraperAgent with stocks and news

        Returns:
            Dict with analysis for each symbol:
            {
                "timestamp": "...",
                "analysis": {
                    "AAPL": {
                        "news_summary": "...",
                        "news_links": [...],
                        "latest_news_time": "...",
                        "price_alert": "...",
                        "investment_advice": "...",
                        "confidence": 0.85
                    }
                }
            }
        """
        if "error" in scraper_output:
            return {
                "timestamp": datetime.now().isoformat(),
                "error": scraper_output.get("error"),
                "status": "failed",
            }

        analysis = {}
        stocks = scraper_output.get("stocks", {})
        news = scraper_output.get("news", {})

        for symbol in stocks.keys():
            try:
                stock_data = stocks.get(symbol, {})
                news_data = news.get(symbol, {})

                # Skip if stock data has error
                if "error" in stock_data:
                    analysis[symbol] = {"error": stock_data["error"]}
                    continue

                # Generate analysis components
                news_summary = self._analyze_news(symbol, news_data)
                news_links, latest_news_time = self._extract_news_links(news_data)
                price_alert = self._generate_price_alert(symbol, stock_data)
                investment_advice = self._generate_investment_advice(
                    symbol, stock_data, news_summary
                )

                analysis[symbol] = {
                    "news_summary": news_summary,
                    "news_links": news_links,
                    "latest_news_time": latest_news_time,
                    "price_alert": price_alert,
                    "investment_advice": investment_advice,
                    "confidence": 0.85,  # Default confidence
                }

            except Exception as e:
                analysis[symbol] = {"error": f"Analysis failed: {str(e)}"}

        return {
            "timestamp": datetime.now().isoformat(),
            "analysis": analysis,
            "status": "success",
        }

    def _analyze_news(self, symbol: str, news_data: Dict[str, Any]) -> str:
        """
        Generate AI-powered news summary for a stock.

        Args:
            symbol: Stock symbol
            news_data: News data from NewsService

        Returns:
            AI-generated summary (3-5 sentences)
        """
        articles = news_data.get("articles", [])

        if not articles:
            return "No recent news available."

        # Prepare news text for Claude
        news_text = "\n".join(
            [
                f"- {article['title']}: {article['description']}"
                for article in articles[:5]
            ]
        )

        prompt = f"""請用繁體中文3-5句總結以下關於{symbol}的新聞，重點是對股價的可能影響：

{news_text}

摘要："""

        response = self.client.messages.create(
            model=self.model,
            max_tokens=300,
            messages=[{"role": "user", "content": prompt}],
        )

        return response.content[0].text.strip()

    def _generate_price_alert(self, symbol: str, stock_data: Dict[str, Any]) -> str:
        """
        Generate price alert based on stock movement.

        Args:
            symbol: Stock symbol
            stock_data: Stock data from StockService

        Returns:
            AI-generated price alert
        """
        price = stock_data.get("price", 0)
        change = stock_data.get("change", 0)
        change_pct = stock_data.get("change_pct", 0)
        volume = stock_data.get("volume", 0)

        prompt = f"""分析 {symbol} 股票的以下數據，用繁體中文生成簡短的漲跌預警（1-2句）：

當前價格: ${price}
變化: ${change} ({change_pct}%)
交易量: {volume}

預警："""

        response = self.client.messages.create(
            model=self.model,
            max_tokens=150,
            messages=[{"role": "user", "content": prompt}],
        )

        return response.content[0].text.strip()

    def _generate_investment_advice(
        self, symbol: str, stock_data: Dict[str, Any], news_summary: str
    ) -> str:
        """
        Generate AI-powered investment advice.

        Args:
            symbol: Stock symbol
            stock_data: Stock data from StockService
            news_summary: AI-generated news summary

        Returns:
            AI-generated investment advice
        """
        price = stock_data.get("price", 0)
        change_pct = stock_data.get("change_pct", 0)

        prompt = f"""基於以下信息，用繁體中文提供 {symbol} 的簡短投資建議（3-4句）：

當前股價: ${price}
今日漲跌: {change_pct}%
相關新聞摘要: {news_summary}

投資建議："""

        response = self.client.messages.create(
            model=self.model,
            max_tokens=250,
            messages=[{"role": "user", "content": prompt}],
        )

        return response.content[0].text.strip()

    def _extract_news_links(self, news_data: Dict[str, Any]) -> tuple[List[str], str]:
        """
        Extract news URLs and latest publication time.

        Args:
            news_data: News data from NewsService

        Returns:
            Tuple of (news_links, latest_news_time)
        """
        articles = news_data.get("articles", [])

        if not articles:
            return [], ""

        links = [article.get("url") for article in articles if article.get("url")]
        latest_time = articles[0].get("published_at", "") if articles else ""

        return links, latest_time
