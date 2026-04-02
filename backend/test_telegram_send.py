"""
Quick test: Send a test message to Telegram

Run with: python test_telegram_send.py
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from services.telegram_service import TelegramService
from services.notification_formatter import NotificationFormatter

# Load environment variables
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

STOCK_SYMBOLS = ["AAPL", "MSFT", "TSLA"]


def test_send_simple_message():
    """Test sending a simple test message."""
    print("\n" + "=" * 70)
    print("📱 Test 1: Send Simple Test Message")
    print("=" * 70)

    telegram = TelegramService()

    message = """🧪 <b>Track Stock 系統測試</b>

✅ Backend 系統已啟動！

📊 追蹤股票：AAPL, MSFT, TSLA
🤖 AI 分析：Claude API
📅 排程：APScheduler (台灣時間)

👉 系統準備就緒！"""

    result = telegram.send_message(message)

    if result["success"]:
        print(f"✅ 訊息已發送！")
        print(f"   Message ID: {result.get('message_id')}")
        return True
    else:
        print(f"❌ 發送失敗：{result.get('error')}")
        return False


def test_send_price_alert():
    """Test sending a price alert notification."""
    print("\n" + "=" * 70)
    print("📱 Test 2: Send Price Alert Notification")
    print("=" * 70)

    telegram = TelegramService()
    formatter = NotificationFormatter()

    # Sample stock data
    sample_stock = {
        "symbol": "AAPL",
        "price": 255.63,
        "change": 1.84,
        "change_pct": 0.73,
        "volume": 35595400,
    }

    # Generate price alert
    alert_message = formatter.format_price_alert("AAPL", sample_stock)

    result = telegram.send_message(alert_message)

    if result["success"]:
        print(f"✅ 價格警報已發送！")
        print(f"\n訊息預覽：")
        print(alert_message)
        return True
    else:
        print(f"❌ 發送失敗：{result.get('error')}")
        return False


def test_send_market_alerts():
    """Test sending market open/close alerts."""
    print("\n" + "=" * 70)
    print("📱 Test 3: Send Market Alerts")
    print("=" * 70)

    telegram = TelegramService()
    formatter = NotificationFormatter()

    # Market open alert
    print("\n📌 Market Open Alert:")
    open_alert = formatter.format_market_open_alert(STOCK_SYMBOLS)
    result1 = telegram.send_message(open_alert)

    if result1["success"]:
        print("✅ 開盤提醒已發送")
    else:
        print(f"❌ 開盤提醒發送失敗：{result1.get('error')}")

    # Market close alert
    print("\n📌 Market Close Alert:")
    close_alert = formatter.format_market_close_alert(STOCK_SYMBOLS)
    result2 = telegram.send_message(close_alert)

    if result2["success"]:
        print("✅ 收盤提醒已發送")
    else:
        print(f"❌ 收盤提醒發送失敗：{result2.get('error')}")

    return result1["success"] and result2["success"]


def main():
    """Run all tests."""
    print("\n🚀 Telegram Bot 發送測試")
    print("=" * 70)

    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")

    if not bot_token:
        print("❌ TELEGRAM_BOT_TOKEN not found in .env")
        return

    if not chat_id:
        print("❌ TELEGRAM_CHAT_ID not found in .env")
        return

    print(f"\n✅ Bot Token: {bot_token[:20]}...")
    print(f"✅ Chat ID: {chat_id}")

    # Run tests
    test1 = test_send_simple_message()
    test2 = test_send_price_alert()
    test3 = test_send_market_alerts()

    # Summary
    print("\n" + "=" * 70)
    print("✅ 測試完成！")
    print("=" * 70)

    if all([test1, test2, test3]):
        print("\n✅ 所有訊息已成功發送到 Telegram！")
        print("✅ 系統準備就緒！")
    else:
        print("\n⚠️ 部分訊息發送失敗，請檢查 Telegram 設定")


if __name__ == "__main__":
    main()
