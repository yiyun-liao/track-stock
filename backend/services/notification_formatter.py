"""
Notification Formatter: Generate three types of notification formats.

Input: Stock and news data from agents
Output: Formatted messages for different scenarios
"""

from typing import Dict, Any, List
from datetime import datetime


# ===== CONFIGURATION CONSTANTS =====
CONFIG = {
    # Price movement thresholds for trend indicators
    "strong_up_threshold": 2.0,      # > 2% = strong up
    "mild_down_threshold": -2.0,     # < -2% = strong down
    "max_news_articles": 5,          # Max articles to summarize
    "max_news_links": 3,             # Max links to display
    "max_article_title_length": 50,  # Truncate long titles
    "max_trend_char_length": 50,     # Max character length
    # Time formats
    "datetime_format": "%Y-%m-%d %H:%M:%S",  # Standard datetime format
    "market_open_time": "22:30 (台北時間前一天)",
    "market_intraday_time": "01:00",
    "market_close_time": "05:00",
    "analysis_time": "06:00",
}

# ===== PROMPT TEMPLATES =====
PROMPTS = {
    "news_summary": """請用繁體中文3-5句總結以下關於{symbol}的新聞，重點是對股價的可能影響：
    {news_text}
    摘要：""",

    "price_alert": """分析 {symbol} 股票的以下數據，用繁體中文生成簡短的漲跌預警（1-2句）：
    當前價格: ${price}
    變化: ${change} ({change_pct}%)
    交易量: {volume}
    預警：""",

    "investment_advice": """基於以下信息，用繁體中文提供 {symbol} 的簡短投資建議（3-4句）：
    當前股價: ${price}
    今日漲跌: {change_pct}%
    相關新聞摘要: {news_summary}
    投資建議：""",
}

# ===== MESSAGE TEMPLATES =====
MESSAGES = {
    "price_alert_format": """🔔 <b>{symbol} 股票警報</b>
    {trend}
    💰 <b>當前價格</b>: ${price:.2f}
    📊 <b>變化</b>: ${change:+.2f} ({change_pct:+.2f}%)
    📈 <b>交易量</b>: {volume:,}
    ⏰ <i>{timestamp}</i>""",

    "news_summary_format": """📰 <b>{symbol} 新聞摘要</b>
    <b>📌 新聞概括</b>
    {news_summary}
    <b>🔗 相關新聞</b>
    {article_links}
    {latest_time}""",

    "article_link": """{i}. <a href='{url}'>{title}...</a>
   <i>{source}</i>""",

    "complete_analysis_format": """📊 <b>{symbol} 收盤分析報告</b>
    <b>💰 股票價格</b>
    當前: ${price:.2f}
    變化: {change_pct:+.2f}%
    <b>📰 新聞摘要</b>
    {news_summary}
    <b>📈 價格預警</b>
    {price_alert}
    <b>💡 投資建議</b>
    {investment_advice}
    <b>🔗 相關新聞連結</b>
    {news_links}
    ⏰ <i>{timestamp}</i>""",

    "market_open_alert": """🔔 <b>美股開盤提醒</b>
    📊 <b>今日追蹤股票</b>
    {symbols}
    ⏰ <b>今日行程</b>
    ✓ 開盤時 22:30 (台北時間前一天)
    ✓ 盤中 01:00
    ✓ 收盤 05:00
    ✓ 收盤後 06:00 分析報告
    準備好了嗎？ 🚀""",

    "market_close_alert": """🏁 <b>美股收盤提醒</b>
    📊 <b>今日觀察股票</b>
    {symbols}
    ⏰ <b>接下來</b>
    ✓ 收盤後 1 小時 (06:00) - 完整分析報告
    ✓ 明天開盤前 - 新聞摘要
    敬請期待分析報告 📈""",
}

# ===== TREND INDICATORS =====
TRENDS = {
    "strong_up": "📈 <b>強勢上漲</b>",
    "mild_up": "🟢 <b>溫和上漲</b>",
    "mild_down": "🔴 <b>溫和下跌</b>",
    "strong_down": "📉 <b>急速下跌</b>",
}


class NotificationFormatter:
    @staticmethod
    def format_price_alert(
        symbol: str, stock_data: Dict[str, Any]
    ) -> str:
        if "error" in stock_data:
            return f"<b>⚠️ {symbol} 錯誤</b>\n{stock_data['error']}"

        price = stock_data.get("price", 0)
        change = stock_data.get("change", 0)
        change_pct = stock_data.get("change_pct", 0)
        volume = stock_data.get("volume", 0)

        # Determine trend indicator
        if change_pct > CONFIG["strong_up_threshold"]:
            trend = TRENDS["strong_up"]
        elif change_pct > 0:
            trend = TRENDS["mild_up"]
        elif change_pct > CONFIG["mild_down_threshold"]:
            trend = TRENDS["mild_down"]
        else:
            trend = TRENDS["strong_down"]

        message = MESSAGES["price_alert_format"].format(
            symbol=symbol,
            trend=trend,
            price=price,
            change=change,
            change_pct=change_pct,
            volume=volume,
            timestamp=datetime.now().strftime(CONFIG["datetime_format"]),
        )

        return message

    @staticmethod
    def format_news_summary(
        symbol: str, news_data: Dict[str, Any], analysis: Dict[str, Any] = None
    ) -> str:
        articles = news_data.get("articles", [])

        if not articles:
            return f"📰 <b>{symbol} 新聞</b>\n\n目前無新聞更新"

        # Build article links
        article_links = ""
        for i, article in enumerate(articles[: CONFIG["max_news_links"]], 1):
            title = article.get("title", "No title")[
                : CONFIG["max_article_title_length"]
            ]
            url = article.get("url", "#")
            source = article.get("source", "Unknown")
            article_links += MESSAGES["article_link"].format(
                i=i, url=url, title=title, source=source
            ) + "\n"

        # Get latest news time
        latest_time = ""
        if articles:
            pub_time = articles[0].get("published_at", "")
            if pub_time:
                latest_time = f"\n⏰ <i>最新新聞: {pub_time}</i>"

        message = MESSAGES["news_summary_format"].format(
            symbol=symbol,
            news_summary=analysis.get("news_summary", "") if analysis else "",
            article_links=article_links,
            latest_time=latest_time,
        )

        return message

    @staticmethod
    def format_complete_analysis(
        symbol: str,
        stock_data: Dict[str, Any],
        analysis: Dict[str, Any],
    ) -> str:
        if "error" in analysis:
            return f"<b>❌ {symbol} 分析失敗</b>\n{analysis['error']}"

        price = stock_data.get("price", 0)
        change_pct = stock_data.get("change_pct", 0)

        # Build news links
        news_links = ""
        link_list = analysis.get("news_links", [])
        if link_list:
            for i, link in enumerate(link_list[: CONFIG["max_news_links"]], 1):
                news_links += f"{i}. <a href='{link}'>閱讀新聞</a>\n"
        else:
            news_links = "無新聞連結"

        message = MESSAGES["complete_analysis_format"].format(
            symbol=symbol,
            price=price,
            change_pct=change_pct,
            news_summary=analysis.get("news_summary", "無新聞"),
            price_alert=analysis.get("price_alert", "無警報"),
            investment_advice=analysis.get("investment_advice", "無建議"),
            news_links=news_links,
            timestamp=datetime.now().strftime(CONFIG["datetime_format"]),
        )

        return message

    @staticmethod
    def format_market_open_alert(symbols: List[str]) -> str:
        message = MESSAGES["market_open_alert"].format(
            symbols=", ".join(symbols)
        )
        return message

    @staticmethod
    def format_market_close_alert(symbols: List[str]) -> str:
        message = MESSAGES["market_close_alert"].format(
            symbols=", ".join(symbols)
        )
        return message
