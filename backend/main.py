"""
Track Stock - FastAPI Backend Server
Integrates data services, agents, and Telegram notifications
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

# Import services and agents
from services.stock_service import StockService
from services.news_service import NewsService
from services.telegram_service import TelegramService
from services.notification_formatter import NotificationFormatter
from services.guardian_news_service import GuardianNewsService
from services.alpha_vantage_service import AlphaVantageService
from services.finnhub_service import FinnhubService
from agents.scraper_agent import ScraperAgent
from agents.analyzer_agent import AnalyzerAgent

# Initialize FastAPI app
app = FastAPI(
    title="Track Stock API",
    description="AI-powered stock tracking system with Telegram notifications",
    version="0.1.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (update in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global configuration
CONFIG = {
    "stock_symbols": ["AAPL", "MSFT", "TSLA"],
    "news_api_key": os.getenv("NEWS_API_KEY"),
    "guardian_api_key": os.getenv("GUARDIAN_API_KEY"),
    "alpha_vantage_api_key": os.getenv("ALPHA_VANTAGE_API_KEY"),
    "fmp_api_key": os.getenv("FMP_API_KEY"),
    "claude_api_key": os.getenv("CLAUDE_API_KEY"),
}

# Initialize services
stock_service = StockService()
news_service = NewsService(api_key=CONFIG["news_api_key"])
guardian_service = GuardianNewsService(api_key=CONFIG["guardian_api_key"])
alpha_vantage_service = AlphaVantageService(api_key=CONFIG["alpha_vantage_api_key"])
finnhub_service = FinnhubService(api_key=CONFIG["fmp_api_key"])  # Use FMP_API_KEY env var for Finnhub token
telegram_service = TelegramService()
formatter = NotificationFormatter()
scraper = ScraperAgent(stock_service, news_service)
analyzer = AnalyzerAgent(claude_api_key=CONFIG["claude_api_key"])

# Cache for recent data (to avoid excessive API calls)
_cache = {
    "stocks": None,
    "stocks_timestamp": None,
    "news": None,
    "news_timestamp": None,
}


@app.get("/api/status")
async def get_status():
    """Get system status and health check"""
    return {
        "success": True,
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "version": "0.1.0",
    }


@app.get("/api/stocks")
async def get_stocks():
    """Get latest stock prices for tracked symbols"""
    try:
        stocks_data = stock_service.fetch_latest_price(CONFIG["stock_symbols"])
        # Convert dict to list for frontend
        stocks_list = [stock for stock in stocks_data.values() if "error" not in stock]
        return {
            "success": True,
            "data": stocks_list,
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch stock data: {str(e)}",
        )


@app.get("/api/stocks/{symbol}/history")
async def get_stock_history(symbol: str, period: str = "1mo"):
    """Get historical price data for a stock"""
    if symbol not in CONFIG["stock_symbols"]:
        raise HTTPException(
            status_code=400,
            detail=f"Symbol {symbol} is not in tracked list",
        )

    try:
        history = stock_service.fetch_historical_data(symbol, period)

        if "error" in history:
            raise Exception(history["error"])

        # Convert from {dates: [...], closes: [...]} to [{date: ..., price: ...}]
        prices = [
            {"date": date, "price": price}
            for date, price in zip(history.get("dates", []), history.get("closes", []))
        ]

        return {
            "success": True,
            "data": {
                "symbol": symbol,
                "prices": prices,
            },
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch price history: {str(e)}",
        )


@app.get("/api/news")
async def get_news(symbol: str = None):
    """Get latest news articles from NewsAPI"""
    try:
        if symbol:
            news_data = news_service.fetch_stock_news([symbol], max_articles_per_symbol=5)
        else:
            news_data = news_service.fetch_stock_news(
                CONFIG["stock_symbols"], max_articles_per_symbol=3
            )

        articles = []
        for symbol, stock_news in news_data.items():
            # Each stock_news has structure: {"articles": [...], "total_results": ..., ...}
            if "articles" in stock_news:
                # Add symbol to each article so frontend can filter by stock
                for article in stock_news["articles"]:
                    article["symbol"] = symbol
                articles.extend(stock_news["articles"])

        return {
            "success": True,
            "data": articles[:10],  # Return top 10 articles
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch news: {str(e)}",
        )


@app.get("/api/news/guardian")
async def get_guardian_news():
    """Get news from The Guardian API (independent journalism) for all tracked symbols"""
    try:
        news_data = guardian_service.fetch_stock_news(CONFIG["stock_symbols"], max_articles_per_symbol=3)
        articles = []

        # Aggregate articles from all symbols
        for symbol, stock_news in news_data.items():
            if "articles" in stock_news:
                for article in stock_news["articles"]:
                    article["symbol"] = symbol
                articles.extend(stock_news["articles"])

        return {
            "success": True,
            "data": articles[:10],  # Return top 10 articles
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch Guardian news: {str(e)}",
        )


@app.get("/api/indicators/technical/{symbol}")
async def get_technical_indicators(symbol: str):
    """Get technical indicators (RSI, MACD, Bollinger Bands) from Alpha Vantage"""
    if symbol not in CONFIG["stock_symbols"]:
        raise HTTPException(
            status_code=400,
            detail=f"Symbol {symbol} is not in tracked list",
        )

    try:
        indicators = alpha_vantage_service.get_technical_indicators(symbol)
        moving_avgs = alpha_vantage_service.get_moving_averages(symbol)

        # Combine indicators and moving averages
        indicators["moving_averages"] = moving_avgs.get("moving_averages", {})

        return {
            "success": True,
            "data": indicators,
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch technical indicators: {str(e)}",
        )


@app.get("/api/financials/profile/{symbol}")
async def get_company_profile(symbol: str):
    """Get company profile and key financial metrics from Finnhub"""
    if symbol not in CONFIG["stock_symbols"]:
        raise HTTPException(
            status_code=400,
            detail=f"Symbol {symbol} is not in tracked list",
        )

    try:
        profile = finnhub_service.get_company_profile(symbol)

        return {
            "success": True,
            "data": profile,
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch company profile: {str(e)}",
        )


@app.get("/api/financials/income/{symbol}")
async def get_income_statement(symbol: str):
    """Get income statement from Finnhub"""
    if symbol not in CONFIG["stock_symbols"]:
        raise HTTPException(
            status_code=400,
            detail=f"Symbol {symbol} is not in tracked list",
        )

    try:
        statement = finnhub_service.get_income_statement(symbol)

        return {
            "success": True,
            "data": statement,
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch income statement: {str(e)}",
        )


@app.get("/api/financials/balance/{symbol}")
async def get_balance_sheet(symbol: str):
    """Get balance sheet from Finnhub"""
    if symbol not in CONFIG["stock_symbols"]:
        raise HTTPException(
            status_code=400,
            detail=f"Symbol {symbol} is not in tracked list",
        )

    try:
        statement = finnhub_service.get_balance_sheet(symbol)

        return {
            "success": True,
            "data": statement,
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch balance sheet: {str(e)}",
        )


@app.get("/api/financials/cash-flow/{symbol}")
async def get_cash_flow(symbol: str):
    """Get cash flow statement from Finnhub"""
    if symbol not in CONFIG["stock_symbols"]:
        raise HTTPException(
            status_code=400,
            detail=f"Symbol {symbol} is not in tracked list",
        )

    try:
        statement = finnhub_service.get_cash_flow_statement(symbol)

        return {
            "success": True,
            "data": statement,
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch cash flow statement: {str(e)}",
        )


@app.get("/api/financials/dividends/{symbol}")
async def get_dividend_history(symbol: str):
    """Get dividend payment history from Finnhub"""
    if symbol not in CONFIG["stock_symbols"]:
        raise HTTPException(
            status_code=400,
            detail=f"Symbol {symbol} is not in tracked list",
        )

    try:
        dividends = finnhub_service.get_dividend_history(symbol)

        return {
            "success": True,
            "data": dividends,
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch dividend history: {str(e)}",
        )


@app.get("/api/analysis/{symbol}")
async def get_analysis(symbol: str, language: str = "zh"):
    """Get AI analysis for a stock

    Args:
        symbol: Stock symbol (e.g., 'AAPL')
        language: Response language ('zh' for Chinese, 'en' for English)
    """
    if symbol not in CONFIG["stock_symbols"]:
        raise HTTPException(
            status_code=400,
            detail=f"Symbol {symbol} is not in tracked list",
        )

    if language not in ["zh", "en"]:
        raise HTTPException(
            status_code=400,
            detail="Language must be 'zh' or 'en'",
        )

    try:
        # Get scraper data
        scraper_result = scraper.execute([symbol])

        if not scraper_result.get("stocks", {}).get(symbol):
            raise ValueError(f"Could not fetch data for {symbol}")

        # Analyze data with language parameter
        analysis_result = analyzer.execute(scraper_result, language=language)

        if analysis_result.get("status") != "success":
            raise ValueError("Analysis failed")

        analysis = analysis_result.get("analysis", {}).get(symbol, {})

        return {
            "success": True,
            "data": {
                "symbol": symbol,
                "news_summary": analysis.get("news_summary", ""),
                "price_alert": analysis.get("price_alert", ""),
                "investment_advice": analysis.get("investment_advice", ""),
                "timestamp": datetime.now().isoformat(),
            },
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate analysis: {str(e)}",
        )


@app.get("/api/alerts")
async def get_alerts():
    """Get alert history"""
    return {
        "success": True,
        "data": {
            "alerts": [],  # TODO: Implement alert persistence
        },
        "timestamp": datetime.now().isoformat(),
    }


@app.post("/api/notify/telegram")
async def send_telegram_notification(message: str, chat_id: str = None):
    """Send notification to Telegram"""
    try:
        result = telegram_service.send_message(message, chat_id)
        return {
            "success": result.get("success", False),
            "message_id": result.get("message_id"),
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send Telegram notification: {str(e)}",
        )


@app.on_event("startup")
async def startup_event():
    """Initialize on startup"""
    print("🚀 Track Stock API Server Starting...")
    print(f"📊 Tracking symbols: {CONFIG['stock_symbols']}")
    print("\n📰 News APIs:")
    print(f"  - NEWS_API_KEY: {'✅ Loaded' if CONFIG['news_api_key'] else '❌ Missing'}")
    print(f"  - GUARDIAN_API_KEY: {'✅ Loaded' if CONFIG['guardian_api_key'] else '❌ Missing'}")
    print("\n📈 Technical Indicators:")
    print(f"  - ALPHA_VANTAGE_API_KEY: {'✅ Loaded' if CONFIG['alpha_vantage_api_key'] else '❌ Missing'}")
    print("\n💰 Financial Data:")
    print(f"  - FINNHUB_API_KEY: {'✅ Loaded' if CONFIG['fmp_api_key'] else '❌ Missing'} (using FMP_API_KEY)")
    print(f"\n🤖 AI Analysis:")
    print(f"  - CLAUDE_API_KEY: {'✅ Loaded' if CONFIG['claude_api_key'] else '❌ Missing'}")
    print("\n✅ API Server Ready")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info",
    )
