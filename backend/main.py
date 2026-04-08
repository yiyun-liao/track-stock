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
import time

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
from services.stock_scoring_service import StockScoringService
from agents.scraper_agent import ScraperAgent
from agents.analyzer_agent import AnalyzerAgent

# Helper function for timestamped logging
def log_api(message: str):
    """Log API activity with timestamp (millisecond precision)"""
    timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]  # HH:MM:SS.ms
    print(f"[{timestamp}] {message}")

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
    "finnhub_api_key": os.getenv("FINNHUB_API_KEY"),
    "claude_api_key": os.getenv("CLAUDE_API_KEY"),
}

# Initialize services
stock_service = StockService()
news_service = NewsService(api_key=CONFIG["news_api_key"])
guardian_service = GuardianNewsService(api_key=CONFIG["guardian_api_key"])
alpha_vantage_service = AlphaVantageService(api_key=CONFIG["alpha_vantage_api_key"])
finnhub_service = FinnhubService(api_key=CONFIG["finnhub_api_key"])
stock_scoring_service = StockScoringService()
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
    "analysis": {},  # {symbol_language: (data, timestamp)}
}

# Cache TTL in seconds
CACHE_TTL = {
    "stocks": 300,  # 5 minutes
    "news": 300,    # 5 minutes
    "analysis": 3600,  # 1 hour
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
        log_api("GET /api/stocks - START")
        stocks_data = stock_service.fetch_latest_price(CONFIG["stock_symbols"])
        # Convert dict to list for frontend
        stocks_list = [stock for stock in stocks_data.values() if "error" not in stock]
        log_api(f"GET /api/stocks - DONE ({len(stocks_list)} stocks)")
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
        log_api(f"GET /api/stocks/{symbol}/history - START")
        history = stock_service.fetch_historical_data(symbol, period)

        if "error" in history:
            raise Exception(history["error"])

        # Convert from {dates: [...], closes: [...]} to [{date: ..., price: ...}]
        prices = [
            {"date": date, "price": price}
            for date, price in zip(history.get("dates", []), history.get("closes", []))
        ]

        log_api(f"GET /api/stocks/{symbol}/history - DONE ({len(prices)} prices)")
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
        log_api(f"GET /api/news - START")
        if symbol:
            news_data = news_service.fetch_stock_news([symbol], max_articles_per_symbol=5)
        else:
            news_data = news_service.fetch_stock_news(
                CONFIG["stock_symbols"], max_articles_per_symbol=3
            )

        articles = []
        for sym, stock_news in news_data.items():
            # Each stock_news has structure: {"articles": [...], "total_results": ..., ...}
            if "articles" in stock_news:
                # Add symbol to each article so frontend can filter by stock
                for article in stock_news["articles"]:
                    article["symbol"] = sym
                articles.extend(stock_news["articles"])

        log_api(f"GET /api/news - DONE ({len(articles)} articles)")
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
async def get_analysis(symbol: str, language: str = "zh", chart_hash: str = None):
    """Get AI analysis for a stock

    Args:
        symbol: Stock symbol (e.g., 'AAPL')
        language: Response language ('zh' for Chinese, 'en' for English)
        chart_hash: Hash of chart data for intelligent cache invalidation
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
        # Check cache first with chart hash consideration
        cache_key = f"{symbol}_{language}"
        cached_data, cached_time, cached_hash = _cache["analysis"].get(cache_key, (None, None, None))

        # Debug: Show cache state
        log_api(f"GET /api/analysis/{symbol} - Cache check: incoming_hash={chart_hash}, cached_hash={cached_hash}, has_cached_data={bool(cached_data)}")

        # Use cache if: 1) data exists, 2) cache is fresh, AND 3) chart hash matches
        if cached_data and cached_time:
            cache_age = time.time() - cached_time
            if cached_hash == chart_hash and cache_age < CACHE_TTL["analysis"]:
                log_api(f"GET /api/analysis/{symbol} - ✅ CACHE HIT (age: {cache_age:.1f}s, hash_match=True)")
                return {
                    "success": True,
                    "data": cached_data,
                }
            elif cached_hash != chart_hash:
                log_api(f"GET /api/analysis/{symbol} - ❌ CACHE MISS: hash mismatch (was: {cached_hash}, now: {chart_hash})")
            else:
                log_api(f"GET /api/analysis/{symbol} - ❌ CACHE MISS: cache expired ({cache_age:.1f}s > {CACHE_TTL['analysis']}s)")
        else:
            log_api(f"GET /api/analysis/{symbol} - ❌ CACHE MISS: no cached data")

        log_api(f"GET /api/analysis/{symbol} - START (fresh analysis)")
        # Get scraper data
        log_api(f"GET /api/analysis/{symbol} - Scraper.execute START")
        scraper_result = scraper.execute([symbol])
        log_api(f"GET /api/analysis/{symbol} - Scraper.execute DONE")

        if not scraper_result.get("stocks", {}).get(symbol):
            raise ValueError(f"Could not fetch data for {symbol}")

        # Analyze data with language parameter
        log_api(f"GET /api/analysis/{symbol} - Analyzer.execute START")
        analysis_result = analyzer.execute(scraper_result, language=language)
        log_api(f"GET /api/analysis/{symbol} - Analyzer.execute DONE")

        if analysis_result.get("status") != "success":
            raise ValueError("Analysis failed")

        analysis = analysis_result.get("analysis", {}).get(symbol, {})

        # Build response data
        response_data = {
            "symbol": symbol,
            "news_summary": analysis.get("news_summary", ""),
            "price_alert": analysis.get("price_alert", ""),
            "investment_advice": analysis.get("investment_advice", ""),
            "data_sources": analysis.get("data_sources", []),  # Include which data sources were used
            "timestamp": datetime.now().isoformat(),
        }

        # Cache the result with chart hash for intelligent invalidation
        _cache["analysis"][cache_key] = (response_data, time.time(), chart_hash)
        log_api(f"GET /api/analysis/{symbol} - ✅ DONE (saved cache with chart_hash={chart_hash}, TTL=1hour)")

        return {
            "success": True,
            "data": response_data,
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


@app.get("/api/scoring/config")
async def get_scoring_config():
    """Get scoring configuration for frontend display"""
    try:
        config = StockScoringService.get_scoring_config()
        return {
            "success": True,
            "data": config,
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch scoring configuration: {str(e)}",
        )


@app.get("/api/scoring/comprehensive/{symbol}")
async def get_comprehensive_score(symbol: str):
    """Get comprehensive stock score (technical + fundamental + sentiment)"""
    if symbol not in CONFIG["stock_symbols"]:
        raise HTTPException(
            status_code=400,
            detail=f"Symbol {symbol} is not in tracked list",
        )

    try:
        # Fetch all required data
        log_api(f"GET /api/scoring/comprehensive/{symbol} - START")

        # 1. Technical indicators
        log_api(f"GET /api/scoring/comprehensive/{symbol} - Fetching technical indicators")
        tech_result = alpha_vantage_service.get_technical_indicators(symbol)
        indicators = tech_result.get("rsi", {}).get("error") and tech_result or tech_result

        # Add current price to indicators
        stocks_data = stock_service.fetch_latest_price([symbol])
        current_price = stocks_data.get(symbol, {}).get("price")
        if indicators:
            indicators["current_price"] = current_price

        # 2. Fundamental metrics
        log_api(f"GET /api/scoring/comprehensive/{symbol} - Fetching fundamental data")
        profile = finnhub_service.get_company_profile(symbol)
        financials = {
            "symbol": symbol,
            "pe_ratio": profile.get("pe_ratio"),
            "roe": profile.get("roe"),
            "debt_to_equity": profile.get("debt_to_equity"),
            "dividend_yield": profile.get("dividend_yield"),
        }

        # 3. News and sentiment
        log_api(f"GET /api/scoring/comprehensive/{symbol} - Fetching news data")
        news_data = news_service.fetch_stock_news([symbol], max_articles_per_symbol=10)
        news_list = news_data.get(symbol, []) if isinstance(news_data.get(symbol), list) else []

        # 4. Calculate scores
        log_api(f"GET /api/scoring/comprehensive/{symbol} - Calculating scores")
        scoring_result = stock_scoring_service.calculate_comprehensive_score(
            indicators, financials, news_list
        )

        if scoring_result.get("status") == "success":
            log_api(f"GET /api/scoring/comprehensive/{symbol} - ✅ DONE (score: {scoring_result['scores']['overall']['score']}/10)")
        else:
            log_api(f"GET /api/scoring/comprehensive/{symbol} - ❌ FAILED: {scoring_result.get('error')}")

        return {
            "success": scoring_result.get("status") == "success",
            "data": scoring_result,
            "timestamp": datetime.now().isoformat(),
        }

    except Exception as e:
        log_api(f"GET /api/scoring/comprehensive/{symbol} - ❌ EXCEPTION: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to calculate comprehensive score: {str(e)}",
        )


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
    print(f"  - FINNHUB_API_KEY: {'✅ Loaded' if CONFIG['finnhub_api_key'] else '❌ Missing'}")
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
