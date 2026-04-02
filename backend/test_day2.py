"""
Day 2 Test Script: Verify ScraperAgent and AnalyzerAgent integration

This script validates:
1. ScraperAgent fetches stock and news data correctly
2. AnalyzerAgent generates AI analysis using Claude API
3. Both agents work together in a complete flow

Run with: python test_day2.py
"""

import json
import os
from pathlib import Path
from dotenv import load_dotenv
from services.stock_service import StockService
from services.news_service import NewsService
from agents.scraper_agent import ScraperAgent
from agents.analyzer_agent import AnalyzerAgent

# Load environment variables from project root
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

STOCK_SYMBOLS = ["AAPL", "MSFT", "TSLA"]


def test_scraper_agent():
    """Test ScraperAgent integration."""
    print("\n" + "=" * 70)
    print("🔍 Testing ScraperAgent")
    print("=" * 70)

    # Initialize services
    stock_service = StockService()
    news_api_key = os.getenv("NEWS_API_KEY")
    news_service = NewsService(api_key=news_api_key)

    # Initialize agent with injected services
    scraper = ScraperAgent(stock_service, news_service)

    # Execute scraper
    print("\n📊 Fetching stock and news data...")
    result = scraper.execute(STOCK_SYMBOLS)

    if result.get("status") == "success":
        print(f"✅ ScraperAgent executed successfully")
        print(f"   Symbols: {result['symbols']}")
        print(f"   Timestamp: {result['timestamp']}")
        print(f"   Stocks fetched: {len(result['stocks'])}")
        print(f"   News sources: {len(result['news'])}")

        # Show sample data
        sample_symbol = STOCK_SYMBOLS[0]
        if sample_symbol in result["stocks"]:
            stock = result["stocks"][sample_symbol]
            if "error" not in stock:
                print(f"\n📈 Sample stock data ({sample_symbol}):")
                print(f"   Price: ${stock.get('price')}")
                print(f"   Change: {stock.get('change_pct')}%")
                print(f"   Volume: {stock.get('volume')}")

        if sample_symbol in result["news"]:
            news = result["news"][sample_symbol]
            articles_count = len(news.get("articles", []))
            print(f"\n📰 News data ({sample_symbol}):")
            print(f"   Articles found: {articles_count}")

        return result

    else:
        print(f"❌ ScraperAgent failed: {result.get('error')}")
        return None


def test_analyzer_agent(scraper_result):
    """Test AnalyzerAgent with ScraperAgent output."""
    print("\n" + "=" * 70)
    print("🔍 Testing AnalyzerAgent (Claude AI Analysis)")
    print("=" * 70)

    if not scraper_result:
        print("❌ Cannot test AnalyzerAgent without ScraperAgent output")
        return

    # Initialize analyzer with Claude API
    claude_api_key = os.getenv("CLAUDE_API_KEY")
    analyzer = AnalyzerAgent(claude_api_key=claude_api_key)

    # Execute analyzer
    print("\n🤖 Generating AI analysis using Claude API...")
    print("   (This may take a few seconds...)")

    result = analyzer.execute(scraper_result)

    if result.get("status") == "success":
        print(f"\n✅ AnalyzerAgent executed successfully")

        analysis = result.get("analysis", {})
        for symbol in STOCK_SYMBOLS:
            if symbol in analysis:
                sym_analysis = analysis[symbol]

                if "error" in sym_analysis:
                    print(f"\n⚠️ {symbol}: {sym_analysis['error']}")
                else:
                    print(f"\n📊 Analysis for {symbol}:")
                    print(f"   🔖 News Summary:")
                    print(f"      {sym_analysis.get('news_summary', 'N/A')[:100]}...")
                    print(f"\n   📈 Price Alert:")
                    print(f"      {sym_analysis.get('price_alert', 'N/A')[:80]}...")
                    print(f"\n   💡 Investment Advice:")
                    print(f"      {sym_analysis.get('investment_advice', 'N/A')[:100]}...")
                    print(f"\n   🔗 News Links: {len(sym_analysis.get('news_links', []))} articles")
                    if sym_analysis.get('latest_news_time'):
                        print(f"   ⏰ Latest News: {sym_analysis.get('latest_news_time')}")

        return result

    else:
        print(f"❌ AnalyzerAgent failed: {result.get('error')}")
        return None


def print_output_format():
    """Print expected output formats."""
    print("\n" + "=" * 70)
    print("📋 Output Format Reference")
    print("=" * 70)

    print("\n🔄 ScraperAgent Output:")
    print("""
{
  "timestamp": "2026-04-02T11:00:00",
  "symbols": ["AAPL", "MSFT"],
  "stocks": {
    "AAPL": {
      "symbol": "AAPL",
      "price": 255.63,
      "change": 1.84,
      "change_pct": 0.73,
      ...
    }
  },
  "news": {
    "AAPL": {
      "articles": [{
        "title": "...",
        "url": "https://...",
        "published_at": "2026-04-01T10:00:00Z"
      }]
    }
  }
}
    """)

    print("\n🤖 AnalyzerAgent Output:")
    print("""
{
  "timestamp": "2026-04-02T11:00:00",
  "analysis": {
    "AAPL": {
      "news_summary": "蘋果發佈新款...",
      "news_links": ["url1", "url2"],
      "latest_news_time": "2026-04-01T10:00:00Z",
      "price_alert": "上漲 0.73%，交易量良好",
      "investment_advice": "建議持有，關注新品發佈...",
      "confidence": 0.85
    }
  }
}
    """)


def main():
    """Run all tests."""
    print("\n🚀 Day 2: Agent Integration Test")
    print("Testing ScraperAgent & AnalyzerAgent with Claude AI")

    try:
        # Test ScraperAgent
        scraper_result = test_scraper_agent()

        # Test AnalyzerAgent
        if scraper_result:
            analyzer_result = test_analyzer_agent(scraper_result)
        else:
            analyzer_result = None

        # Print format reference
        print_output_format()

        # Summary
        print("\n" + "=" * 70)
        print("✅ Day 2 Tests Complete!")
        print("=" * 70)

        if scraper_result and analyzer_result:
            print("\n✅ Both agents working correctly!")
            print("✅ ScraperAgent: Successfully fetched stock and news data")
            print("✅ AnalyzerAgent: Successfully generated AI analysis")
            print("\n👉 Ready for Day 3: Telegram Bot & Scheduling")
        else:
            print("\n⚠️ Some tests failed - check errors above")

    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    main()
