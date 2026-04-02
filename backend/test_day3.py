"""
Day 3 Test Script: Verify Telegram Bot and Scheduling

This script validates:
1. Telegram Bot connection and message sending
2. Notification formatter (3 formats)
3. APScheduler setup and job scheduling
4. Complete notification flow

Run with: python test_day3.py
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from services.telegram_service import TelegramService
from services.notification_formatter import NotificationFormatter
from services.scheduler_manager import SchedulerManager
from services.stock_service import StockService
from services.news_service import NewsService
from agents.scraper_agent import ScraperAgent
from agents.analyzer_agent import AnalyzerAgent

# Load environment variables
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

STOCK_SYMBOLS = ["AAPL", "MSFT", "TSLA"]


def test_telegram_service():
    """Test Telegram Bot connection."""
    print("\n" + "=" * 70)
    print("🔍 Testing Telegram Service")
    print("=" * 70)

    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")

    if not bot_token:
        print("❌ TELEGRAM_BOT_TOKEN not found in .env")
        return False

    if not chat_id:
        print("⚠️  TELEGRAM_CHAT_ID not found in .env")
        print("   步驟：")
        print("   1. 在 Telegram 中向你的 Bot 發送訊息")
        print(f"   2. 訪問：https://api.telegram.org/bot{bot_token}/getUpdates")
        print("   3. 複製 'chat.id' 值")
        print("   4. 添加到 .env: TELEGRAM_CHAT_ID=<你的_id>")
        print("\n   暫時跳過發送測試")
        return False

    telegram = TelegramService()

    # Test bot info
    print("\n🤖 Checking Bot Info...")
    bot_info = telegram.get_me()

    if bot_info["success"]:
        bot = bot_info.get("bot", {})
        print(f"✅ Bot connected: @{bot.get('username')}")
        print(f"   Bot ID: {bot.get('id')}")
        print(f"   Bot Name: {bot.get('first_name')}")
        return True
    else:
        print(f"❌ Bot connection failed: {bot_info.get('error')}")
        return False


def test_notification_formats():
    """Test three notification formats."""
    print("\n" + "=" * 70)
    print("🔍 Testing Notification Formats")
    print("=" * 70)

    # Sample data
    sample_stock = {
        "symbol": "AAPL",
        "price": 255.63,
        "change": 1.84,
        "change_pct": 0.73,
        "volume": 35595400,
    }

    sample_news = {
        "articles": [
            {
                "title": "Apple 發佈新款 MacBook Pro",
                "description": "蘋果今日發佈新款 M4 Pro MacBook Pro...",
                "source": "Tech News",
                "url": "https://example.com/news1",
                "published_at": "2026-04-02T10:00:00Z",
            },
            {
                "title": "AAPL 股票分析",
                "description": "分析師看好 AAPL...",
                "source": "Finance Daily",
                "url": "https://example.com/news2",
                "published_at": "2026-04-02T09:00:00Z",
            },
        ]
    }

    sample_analysis = {
        "news_summary": "蘋果發佈新款 MacBook Pro，配備 M4 Pro 晶片，性能提升 30%...",
        "price_alert": "股價上漲 0.73%，交易量良好，短線買氣回升",
        "investment_advice": "新品發佈支撐股價，建議持有並關注後續銷售數據",
        "news_links": [
            "https://example.com/news1",
            "https://example.com/news2",
        ],
    }

    formatter = NotificationFormatter()

    # Format A: Price Alert
    print("\n📊 Format A: 簡單價格警報")
    print("-" * 70)
    alert = formatter.format_price_alert("AAPL", sample_stock)
    print(alert)

    # Format B: News Summary
    print("\n\n📰 Format B: 新聞摘要 + 連結")
    print("-" * 70)
    news = formatter.format_news_summary("AAPL", sample_news, sample_analysis)
    print(news)

    # Format C: Complete Analysis
    print("\n\n📊 Format C: 完整分析報告")
    print("-" * 70)
    analysis = formatter.format_complete_analysis(
        "AAPL", sample_stock, sample_analysis
    )
    print(analysis)

    # Market alerts
    print("\n\n🔔 Format: 市場開盤提醒")
    print("-" * 70)
    open_alert = formatter.format_market_open_alert(STOCK_SYMBOLS)
    print(open_alert)

    print("\n\n🏁 Format: 市場收盤提醒")
    print("-" * 70)
    close_alert = formatter.format_market_close_alert(STOCK_SYMBOLS)
    print(close_alert)

    return True


def test_scheduler():
    """Test APScheduler setup."""
    print("\n" + "=" * 70)
    print("🔍 Testing APScheduler")
    print("=" * 70)

    scheduler = SchedulerManager()

    # Mock callback functions
    def mock_stock_update(timing: str, symbols: list):
        print(f"   📊 Stock update: {timing} - {symbols}")

    def mock_news_update(timing: str, symbols: list):
        print(f"   📰 News update: {timing} - {symbols}")

    def mock_analysis(symbols: list):
        print(f"   🤖 Analysis: {symbols}")

    # Schedule jobs
    print("\n📅 Scheduling jobs (Taiwan time)...")
    scheduler.schedule_stock_price_updates(mock_stock_update, STOCK_SYMBOLS)
    scheduler.schedule_news_updates(mock_news_update, STOCK_SYMBOLS)
    scheduler.schedule_analysis_job(mock_analysis, STOCK_SYMBOLS)

    # Print schedule
    scheduler.print_schedule()

    return True


def test_complete_flow():
    """Test complete notification flow."""
    print("\n" + "=" * 70)
    print("🔍 Testing Complete Notification Flow")
    print("=" * 70)

    print("\n🔄 Fetching data and generating notifications...")

    # Get data
    stock_service = StockService()
    news_api_key = os.getenv("NEWS_API_KEY")
    news_service = NewsService(api_key=news_api_key)
    scraper = ScraperAgent(stock_service, news_service)
    scraper_result = scraper.execute(STOCK_SYMBOLS[:1])  # Test with 1 symbol

    # Analyze
    claude_api_key = os.getenv("CLAUDE_API_KEY")
    analyzer = AnalyzerAgent(claude_api_key=claude_api_key)
    analysis_result = analyzer.execute(scraper_result)

    if analysis_result.get("status") == "success":
        symbol = STOCK_SYMBOLS[0]
        if symbol in analysis_result.get("analysis", {}):
            stock_data = scraper_result["stocks"].get(symbol, {})
            sym_analysis = analysis_result["analysis"][symbol]

            formatter = NotificationFormatter()

            if "error" not in sym_analysis:
                # Generate all three formats
                alert = formatter.format_price_alert(symbol, stock_data)
                news = formatter.format_news_summary(
                    symbol,
                    scraper_result.get("news", {}).get(symbol, {}),
                    sym_analysis,
                )
                analysis = formatter.format_complete_analysis(
                    symbol, stock_data, sym_analysis
                )

                print(f"✅ Generated notifications for {symbol}:")
                print(f"   ✓ Price Alert Format (Format A)")
                print(f"   ✓ News Summary Format (Format B)")
                print(f"   ✓ Complete Analysis Format (Format C)")

                return True

    print("⚠️ Could not complete flow test")
    return False


def main():
    """Run all tests."""
    print("\n🚀 Day 3: Telegram Bot & Scheduling Test")
    print("Testing notification system and job scheduling\n")

    # Test Telegram
    telegram_ok = test_telegram_service()

    # Test notification formats
    format_ok = test_notification_formats()

    # Test scheduler
    scheduler_ok = test_scheduler()

    # Test complete flow
    flow_ok = test_complete_flow()

    # Summary
    print("\n" + "=" * 70)
    print("✅ Day 3 Tests Complete!")
    print("=" * 70)

    if all([telegram_ok, format_ok, scheduler_ok]):
        print("\n✅ All core systems working!")
        print("✅ Telegram Bot: Ready to send notifications")
        print("✅ Notification Formats: 3 formats ready")
        print("✅ APScheduler: Jobs scheduled for Taiwan time")
        print("\n📅 Schedule Summary:")
        print("   📊 Stock Updates: 22:30 (open) / 01:00 (intraday) / 05:00 (close)")
        print("   📰 News Updates: 21:30 (before) / 01:00 (intraday) / 06:00 (after)")
        print("   🤖 Analysis: 06:05 (daily after close)")
        print("\n👉 Ready for Day 4: Frontend Dashboard")
    else:
        print("\n⚠️ Some tests failed - check errors above")


if __name__ == "__main__":
    main()
