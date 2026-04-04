"""
Test script for Day 7 API integrations
Tests: Guardian News, Alpha Vantage Technical Indicators, FMP Financial Data
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

from services.guardian_news_service import GuardianNewsService
from services.alpha_vantage_service import AlphaVantageService
from services.fmp_financial_service import FMPFinancialService


def test_guardian_api():
    """Test Guardian News API"""
    print("\n" + "="*60)
    print("🔍 Testing Guardian News API")
    print("="*60)

    api_key = os.getenv("GUARDIAN_API_KEY")
    if not api_key:
        print("❌ GUARDIAN_API_KEY not found in .env")
        return False

    try:
        service = GuardianNewsService(api_key)
        symbols = ["AAPL", "MSFT"]

        for symbol in symbols:
            print(f"\n📰 Fetching Guardian news for {symbol}...")
            result = service.fetch_stock_news([symbol], max_articles_per_symbol=3)

            if symbol in result:
                status = result[symbol].get("status")
                articles = result[symbol].get("articles", [])

                print(f"  Status: {status}")
                print(f"  Articles found: {len(articles)}")

                for i, article in enumerate(articles[:2], 1):
                    print(f"\n  Article {i}:")
                    print(f"    Title: {article.get('title', 'N/A')[:60]}...")
                    print(f"    Source: {article.get('source')}")
                    print(f"    URL: {article.get('url')[:50]}...")

        print("\n✅ Guardian API Test Passed")
        return True

    except Exception as e:
        print(f"❌ Guardian API Test Failed: {str(e)}")
        return False


def test_alpha_vantage_api():
    """Test Alpha Vantage Technical Indicators API"""
    print("\n" + "="*60)
    print("📊 Testing Alpha Vantage Technical Indicators API")
    print("="*60)

    api_key = os.getenv("ALPHA_VANTAGE_API_KEY")
    if not api_key:
        print("❌ ALPHA_VANTAGE_API_KEY not found in .env")
        return False

    try:
        service = AlphaVantageService(api_key)
        symbol = "AAPL"

        print(f"\n📈 Fetching technical indicators for {symbol}...")
        indicators = service.get_technical_indicators(symbol)

        if "error" not in indicators:
            print(f"  Symbol: {indicators.get('symbol')}")
            print(f"\n  RSI (Relative Strength Index):")
            rsi = indicators.get("rsi", {})
            print(f"    Value: {rsi.get('value')} ({rsi.get('interpretation')})")

            print(f"\n  MACD (Moving Average Convergence Divergence):")
            macd = indicators.get("macd", {})
            print(f"    MACD: {macd.get('macd')}")
            print(f"    Signal: {macd.get('signal')}")
            print(f"    Histogram: {macd.get('histogram')} ({macd.get('interpretation')})")

            print(f"\n  Bollinger Bands:")
            bb = indicators.get("bollinger_bands", {})
            print(f"    Upper: ${bb.get('upper')}")
            print(f"    Middle: ${bb.get('middle')}")
            print(f"    Lower: ${bb.get('lower')}")

        print(f"\n  Moving Averages:")
        moving_avgs = indicators.get("moving_averages", {})
        print(f"    MA20: ${moving_avgs.get('ma20')}")
        print(f"    MA50: ${moving_avgs.get('ma50')}")
        print(f"    MA200: ${moving_avgs.get('ma200')}")

        print("\n✅ Alpha Vantage API Test Passed")
        return True

    except Exception as e:
        print(f"❌ Alpha Vantage API Test Failed: {str(e)}")
        return False


def test_fmp_api():
    """Test Financial Modeling Prep API"""
    print("\n" + "="*60)
    print("💰 Testing Financial Modeling Prep (FMP) API")
    print("="*60)

    api_key = os.getenv("FMP_API_KEY")
    if not api_key:
        print("❌ FMP_API_KEY not found in .env")
        return False

    try:
        service = FMPFinancialService(api_key)
        symbol = "AAPL"

        # Test company profile
        print(f"\n🏢 Fetching company profile for {symbol}...")
        profile = service.get_company_profile(symbol)

        if profile.get("status") == "success":
            print(f"  Company: {profile.get('company_name')}")
            print(f"  Sector: {profile.get('sector')}")
            print(f"  Industry: {profile.get('industry')}")
            print(f"  Market Cap: ${profile.get('market_cap'):,}" if profile.get('market_cap') else "  Market Cap: N/A")
            print(f"  P/E Ratio: {profile.get('pe_ratio')}")
            print(f"  Dividend Yield: {profile.get('dividend_yield')}")
            print(f"  ROE: {profile.get('roe')}")
            print(f"  ROA: {profile.get('roa')}")
            print(f"  Debt to Equity: {profile.get('debt_to_equity')}")

        # Test income statement
        print(f"\n📄 Fetching income statement for {symbol}...")
        income = service.get_income_statement(symbol)

        if income.get("status") == "success":
            print(f"  Revenue: ${income.get('revenue'):,}" if income.get('revenue') else "  Revenue: N/A")
            print(f"  Net Income: ${income.get('net_income'):,}" if income.get('net_income') else "  Net Income: N/A")
            print(f"  EPS: ${income.get('eps')}" if income.get('eps') else "  EPS: N/A")
            print(f"  Operating Margin: {income.get('operating_margin')}")

        # Test balance sheet
        print(f"\n🏦 Fetching balance sheet for {symbol}...")
        balance = service.get_balance_sheet(symbol)

        if balance.get("status") == "success":
            print(f"  Total Assets: ${balance.get('total_assets'):,}" if balance.get('total_assets') else "  Total Assets: N/A")
            print(f"  Total Debt: ${balance.get('debt'):,}" if balance.get('debt') else "  Total Debt: N/A")
            print(f"  Current Ratio: {balance.get('current_ratio')}")

        # Test dividends
        print(f"\n💵 Fetching dividend history for {symbol}...")
        dividends = service.get_dividend_history(symbol, limit=3)

        if dividends.get("status") == "success":
            divs = dividends.get("dividends", [])
            print(f"  Recent dividends: {len(divs)}")
            for div in divs[:2]:
                print(f"    {div.get('date')}: ${div.get('amount')}")

        print("\n✅ FMP API Test Passed")
        return True

    except Exception as e:
        print(f"❌ FMP API Test Failed: {str(e)}")
        return False


def main():
    """Run all API tests"""
    print("\n" + "█"*60)
    print("🚀 Day 7 API Integration Tests")
    print("█"*60)

    results = {
        "Guardian News API": test_guardian_api(),
        "Alpha Vantage API": test_alpha_vantage_api(),
        "FMP Financial API": test_fmp_api(),
    }

    print("\n" + "="*60)
    print("📊 Test Results Summary")
    print("="*60)

    for api_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{api_name}: {status}")

    passed_count = sum(1 for v in results.values() if v)
    total_count = len(results)

    print(f"\nTotal: {passed_count}/{total_count} tests passed")

    if passed_count == total_count:
        print("\n🎉 All API integrations are working correctly!")
    else:
        print(f"\n⚠️  {total_count - passed_count} test(s) failed. Check API keys and quotas.")

    return passed_count == total_count


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
