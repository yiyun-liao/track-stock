"""
Quick API endpoint tests for Day 7
Tests the new endpoints without requiring all dependencies
"""

import requests
import json
from pathlib import Path
from dotenv import load_dotenv
import os

# Load environment variables
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

BASE_URL = "http://localhost:8000"
SYMBOLS = ["AAPL", "MSFT", "TSLA"]


def test_endpoints():
    """Test all Day 7 endpoints"""
    print("\n" + "█"*70)
    print("🚀 Day 7 API Endpoints Test (Quick Verification)")
    print("█"*70)
    print(f"\n📍 Testing against: {BASE_URL}")
    print(f"📊 Symbols to test: {SYMBOLS}")

    endpoints = [
        {
            "name": "Guardian News",
            "method": "GET",
            "path": "/api/news/guardian/{symbol}",
            "description": "Fetch news from The Guardian API",
        },
        {
            "name": "Technical Indicators",
            "method": "GET",
            "path": "/api/indicators/technical/{symbol}",
            "description": "Get RSI, MACD, Bollinger Bands from Alpha Vantage",
        },
        {
            "name": "Company Profile",
            "method": "GET",
            "path": "/api/financials/profile/{symbol}",
            "description": "Get company profile and metrics from FMP",
        },
        {
            "name": "Income Statement",
            "method": "GET",
            "path": "/api/financials/income/{symbol}",
            "description": "Get income statement from FMP",
        },
        {
            "name": "Balance Sheet",
            "method": "GET",
            "path": "/api/financials/balance/{symbol}",
            "description": "Get balance sheet from FMP",
        },
        {
            "name": "Cash Flow",
            "method": "GET",
            "path": "/api/financials/cash-flow/{symbol}",
            "description": "Get cash flow statement from FMP",
        },
        {
            "name": "Dividend History",
            "method": "GET",
            "path": "/api/financials/dividends/{symbol}",
            "description": "Get dividend history from FMP",
        },
    ]

    print("\n📋 Available Endpoints:")
    print("="*70)

    for i, endpoint in enumerate(endpoints, 1):
        print(f"\n{i}. {endpoint['name']}")
        print(f"   Path: {endpoint['path']}")
        print(f"   Description: {endpoint['description']}")

    print("\n" + "="*70)
    print("\n⏳ NOTE: The backend server needs to be running for tests!")
    print("   Start the server with: python backend/main.py")
    print("\n💡 Example curl commands to test these endpoints:")
    print("="*70)

    for endpoint in endpoints:
        symbol = "AAPL"
        path = endpoint["path"].replace("{symbol}", symbol)
        print(f"\n# {endpoint['name']}")
        print(f"curl '{BASE_URL}{path}'")

    # Try to check if server is running
    print("\n" + "="*70)
    print("🔍 Checking if backend server is running...")
    print("="*70)

    try:
        response = requests.get(f"{BASE_URL}/api/status", timeout=2)
        if response.status_code == 200:
            print("✅ Backend server is running!")
            print(f"📊 Response: {response.json()}")

            # Test one endpoint
            print("\n" + "="*70)
            print("🧪 Testing Technical Indicators endpoint...")
            print("="*70)

            test_url = f"{BASE_URL}/api/indicators/technical/AAPL"
            print(f"\nURL: {test_url}")

            response = requests.get(test_url, timeout=10)
            print(f"Status Code: {response.status_code}")

            if response.status_code == 200:
                data = response.json()
                print(f"✅ Endpoint returned data successfully")
                print(f"\nResponse structure:")
                print(json.dumps(data, indent=2)[:500] + "...")
            else:
                print(f"❌ Error: {response.text[:200]}")

        else:
            print(f"❌ Backend returned status {response.status_code}")

    except requests.exceptions.ConnectionError:
        print("❌ Backend server is not running")
        print("   To start the server:")
        print("   cd backend && python main.py")

    except Exception as e:
        print(f"❌ Error: {str(e)}")

    print("\n" + "="*70)
    print("📚 API Documentation:")
    print("="*70)
    print("""
Day 7 API Integrations:

1. GUARDIAN NEWS API
   - Endpoint: GET /api/news/guardian/{symbol}
   - Returns: High-quality independent journalism about the stock
   - Provides: Title, description, URL, author, publication date

2. ALPHA VANTAGE TECHNICAL INDICATORS
   - Endpoint: GET /api/indicators/technical/{symbol}
   - Returns: RSI, MACD, Bollinger Bands, Moving Averages
   - Indicators help identify market trends and overbought/oversold conditions

3. FINANCIAL MODELING PREP (FMP)
   - Company Profile: GET /api/financials/profile/{symbol}
     P/E ratio, market cap, dividend yield, ROE, ROA, etc.

   - Income Statement: GET /api/financials/income/{symbol}
     Revenue, net income, EPS, profit margins

   - Balance Sheet: GET /api/financials/balance/{symbol}
     Assets, liabilities, equity, cash, debt

   - Cash Flow: GET /api/financials/cash-flow/{symbol}
     Operating, investing, and financing cash flows

   - Dividends: GET /api/financials/dividends/{symbol}
     Historical dividend payments

🔑 Required API Keys (in .env):
   ✅ GUARDIAN_API_KEY
   ✅ ALPHA_VANTAGE_API_KEY
   ✅ FMP_API_KEY

📈 Use Cases:
   - Fundamental analysis: Use income statement + balance sheet
   - Technical analysis: Use RSI, MACD, Bollinger Bands
   - Sentiment analysis: Use Guardian news articles
   - Valuation: Use P/E ratio, market cap, cash flows
    """)


if __name__ == "__main__":
    test_endpoints()
