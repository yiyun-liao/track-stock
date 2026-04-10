"""
Stock Scoring Configuration

Defines weights, thresholds, and rules for technical, fundamental, and sentiment scoring.
These values are exposed to the frontend for transparency.
"""

# ===========================
# 1. 权重配置 (WEIGHTS)
# ===========================

SCORING_WEIGHTS = {
    "technical": 0.35,    # 技术面权重 35%
    "fundamental": 0.45,  # 基本面权重 45%
    "sentiment": 0.20,    # 情绪面权重 20%
}

# ===========================
# 2. 技术面评分阈值 (TECHNICAL SCORING)
# ===========================

TECHNICAL_SCORING = {
    "rsi": {
        "weight": 0.40,
        "thresholds": [
            {"range": (0, 30), "score": 80, "label": "超卖 - 看涨信号强"},
            {"range": (30, 40), "score": 20, "label": "接近超卖"},
            {"range": (40, 50), "score": 35, "label": "偏弱"},
            {"range": (50, 60), "score": 50, "label": "中性偏强"},
            {"range": (60, 70), "score": 35, "label": "偏强"},
            {"range": (70, 100), "score": 20, "label": "超买 - 看跌信号"},
        ],
    },
    "macd": {
        "weight": 0.30,
        "thresholds": [
            {"range": (0.5, 1000), "score": 80, "label": "强势看涨"},
            {"range": (0, 0.5), "score": 60, "label": "看涨"},
            {"range": (-0.5, 0), "score": 40, "label": "弱势看涨"},
            {"range": (-1000, -0.5), "score": 20, "label": "看跌"},
        ],
    },
    "moving_averages": {
        "weight": 0.30,
        "rules": {
            "price_above_ma20": 15,      # 价格 > MA20: +15分
            "ma20_above_ma50": 15,       # MA20 > MA50: +15分
            "ma50_above_ma200": 20,      # MA50 > MA200: +20分
        },
    },
}

# ===========================
# 3. 基本面评分阈值 (FUNDAMENTAL SCORING)
# ===========================

FUNDAMENTAL_SCORING = {
    "pe_ratio": {
        "weight": 0.35,
        "thresholds": [
            {"range": (0, 15), "score": 75, "label": "低估"},
            {"range": (15, 25), "score": 60, "label": "合理"},
            {"range": (25, 40), "score": 40, "label": "偏高"},
            {"range": (40, 1000), "score": 20, "label": "高估"},
            {"isNull": True, "score": 50, "label": "无数据"},
        ],
    },
    "roe": {
        "weight": 0.25,
        "thresholds": [
            {"range": (20, 1000), "score": 80, "label": "优秀"},
            {"range": (15, 20), "score": 65, "label": "良好"},
            {"range": (10, 15), "score": 50, "label": "平均"},
            {"range": (0, 10), "score": 30, "label": "较弱"},
            {"range": (-1000, 0), "score": 10, "label": "亏损"},
            {"isNull": True, "score": 50, "label": "无数据"},
        ],
    },
    "debt_to_equity": {
        "weight": 0.20,
        "thresholds": [
            {"range": (0, 0.5), "score": 80, "label": "财务健康"},
            {"range": (0.5, 1.0), "score": 60, "label": "适度负债"},
            {"range": (1.0, 2.0), "score": 35, "label": "高负债"},
            {"range": (2.0, 1000), "score": 15, "label": "过度负债"},
            {"isNull": True, "score": 50, "label": "无数据"},
        ],
    },
    "dividend_yield": {
        "weight": 0.20,
        "thresholds": [
            {"range": (5, 1000), "score": 75, "label": "高股息"},
            {"range": (3, 5), "score": 65, "label": "中高股息"},
            {"range": (1, 3), "score": 55, "label": "中等股息"},
            {"range": (0, 1), "score": 45, "label": "低股息"},
            {"isNull": True, "score": 50, "label": "不派息"},
        ],
    },
}

# ===========================
# 4. 情绪面评分 (SENTIMENT SCORING)
# ===========================

SENTIMENT_SCORING = {
    "news_volume": {
        "weight": 0.40,
        "thresholds": [
            {"range": (10, 1000), "score": 70, "label": "热点股"},
            {"range": (5, 10), "score": 55, "label": "关注度中等"},
            {"range": (0, 5), "score": 40, "label": "关注度低"},
            {"isEmpty": True, "score": 50, "label": "无新闻"},
        ],
    },
    "news_sentiment": {
        "weight": 0.60,
        "thresholds": [
            {"positiveRatio": (0.6, 1.0), "score": 85, "label": "强烈看涨"},
            {"positiveRatio": (0.4, 0.6), "score": 65, "label": "偏看涨"},
            {"positiveRatio": (0.35, 0.4), "score": 50, "label": "中性"},
            {"negativeRatio": (0.4, 0.6), "score": 35, "label": "偏看跌"},
            {"negativeRatio": (0.6, 1.0), "score": 20, "label": "强烈看跌"},
        ],
    },
    "keywords": {
        "positive": [
            # 英文
            "surge", "up", "gain", "strong", "positive", "bullish", "rally",
            "beat", "outperform", "excellent", "growth", "upgrade",
            # 中文
            "涨", "上升", "强", "优秀", "看好", "利好", "突破",
            "增长", "上调", "买入", "推荐",
        ],
        "negative": [
            # 英文
            "fall", "down", "loss", "weak", "negative", "bearish", "decline",
            "miss", "underperform", "poor", "downturn", "downgrade",
            # 中文
            "跌", "下降", "弱", "差", "看空", "利空", "下跌",
            "衰退", "下调", "卖出", "风险",
        ],
    },
}

# ===========================
# 5. 综合评分规则 (OVERALL SCORING)
# ===========================

OVERALL_SCORING = {
    "score_to_rating": [
        {"range": (8.0, 10.0), "rating": "强烈买入", "emoji": "🟢", "color": "#10b981"},
        {"range": (7.0, 8.0), "rating": "买入", "emoji": "🟢", "color": "#10b981"},
        {"range": (5.5, 7.0), "rating": "持有", "emoji": "🟡", "color": "#f59e0b"},
        {"range": (4.0, 5.5), "rating": "减持", "emoji": "🔴", "color": "#ef4444"},
        {"range": (1.0, 4.0), "rating": "强烈卖出", "emoji": "🔴", "color": "#ef4444"},
    ],
    "risk_levels": {
        "low": {
            "range": (7.0, 10.0),
            "label": "低风险",
            "description": "评分高、基本面良好、技术面强势",
            "color": "#10b981",
        },
        "medium": {
            "range": (4.5, 7.0),
            "label": "中等风险",
            "description": "评分中等、某些维度存在隐忧",
            "color": "#f59e0b",
        },
        "high": {
            "range": (1.0, 4.5),
            "label": "高风险",
            "description": "评分低、基本面较弱或技术面走势不佳",
            "color": "#ef4444",
        },
    },
}

# ===========================
# 6. 买卖信号规则 (TRADING SIGNALS)
# ===========================

TRADING_SIGNALS = {
    "buy_conditions": [
        {
            "name": "技术面强势",
            "condition": "technical_score > 70",
            "signal": "✅ 技术面强势看涨",
        },
        {
            "name": "基本面良好",
            "condition": "fundamental_score > 70",
            "signal": "✅ 基本面良好",
        },
        {
            "name": "情绪面积极",
            "condition": "sentiment_score > 70",
            "signal": "✅ 市场情绪积极",
        },
        {
            "name": "价格上涨",
            "condition": "price_change > 5",
            "signal": "📈 近期上涨超 5%",
        },
        {
            "name": "成交量增加",
            "condition": "volume_change > 1.5",
            "signal": "🔊 成交量增加",
        },
    ],
    "sell_conditions": [
        {
            "name": "技术面走弱",
            "condition": "technical_score < 30",
            "signal": "⚠️ 技术面走弱",
        },
        {
            "name": "基本面较弱",
            "condition": "fundamental_score < 40",
            "signal": "⚠️ 基本面较弱",
        },
        {
            "name": "情绪面消极",
            "condition": "sentiment_score < 30",
            "signal": "⚠️ 市场情绪消极",
        },
        {
            "name": "价格下跌",
            "condition": "price_change < -5",
            "signal": "📉 近期下跌超 5%",
        },
    ],
}

# ===========================
# 7. 导出完整配置 (EXPORT)
# ===========================

SCORING_CONFIG = {
    "weights": SCORING_WEIGHTS,
    "technical": TECHNICAL_SCORING,
    "fundamental": FUNDAMENTAL_SCORING,
    "sentiment": SENTIMENT_SCORING,
    "overall": OVERALL_SCORING,
    "signals": TRADING_SIGNALS,
}
