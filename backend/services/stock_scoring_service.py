"""
Stock Scoring Service

Calculates comprehensive stock scores based on:
- Technical indicators (RSI, MACD, Moving Averages)
- Fundamental metrics (P/E, ROE, Debt ratio, Dividend yield)
- Sentiment analysis (News volume and sentiment)
"""

from typing import Dict, Any, Optional, List
from datetime import datetime
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from config.scoring_config import SCORING_CONFIG


class StockScoringService:
    """Service for calculating stock scores"""

    def __init__(self):
        self.config = SCORING_CONFIG

    def calculate_technical_score(self, indicators: Dict[str, Any]) -> float:
        """
        Calculate technical score (0-100) based on RSI, MACD, and moving averages

        Args:
            indicators: Technical indicators dict with rsi, macd, bollinger_bands, moving_averages

        Returns:
            Technical score (0-100)
        """
        scores = {}

        # RSI Score
        rsi_value = indicators.get("rsi", {}).get("value")
        if rsi_value is not None:
            rsi_config = self.config["technical"]["rsi"]
            rsi_score = self._evaluate_threshold(rsi_value, rsi_config["thresholds"])
            scores["rsi"] = rsi_score * rsi_config["weight"]
        else:
            scores["rsi"] = 50 * self.config["technical"]["rsi"]["weight"]

        # MACD Score
        macd_histogram = indicators.get("macd", {}).get("histogram")
        if macd_histogram is not None:
            macd_config = self.config["technical"]["macd"]
            macd_score = self._evaluate_threshold(
                macd_histogram, macd_config["thresholds"]
            )
            scores["macd"] = macd_score * macd_config["weight"]
        else:
            scores["macd"] = 50 * self.config["technical"]["macd"]["weight"]

        # Moving Averages Score
        ma_config = self.config["technical"]["moving_averages"]
        moving_avgs = indicators.get("moving_averages", {})
        current_price = indicators.get("current_price")

        ma_score = 0
        ma20 = moving_avgs.get("ma20")
        ma50 = moving_avgs.get("ma50")
        ma200 = moving_avgs.get("ma200")

        if current_price and ma20 and current_price > ma20:
            ma_score += ma_config["rules"]["price_above_ma20"]
        if ma20 and ma50 and ma20 > ma50:
            ma_score += ma_config["rules"]["ma20_above_ma50"]
        if ma50 and ma200 and ma50 > ma200:
            ma_score += ma_config["rules"]["ma50_above_ma200"]

        scores["ma"] = ma_score * ma_config["weight"]

        # Calculate total technical score
        total_weight = (
            self.config["technical"]["rsi"]["weight"]
            + self.config["technical"]["macd"]["weight"]
            + self.config["technical"]["moving_averages"]["weight"]
        )
        technical_score = sum(scores.values()) / total_weight if total_weight > 0 else 50

        return round(technical_score, 1)

    def calculate_fundamental_score(self, financials: Dict[str, Any]) -> float:
        """
        Calculate fundamental score (0-100) based on financial metrics

        Args:
            financials: Dict with pe_ratio, roe, debt_to_equity, dividend_yield

        Returns:
            Fundamental score (0-100)
        """
        scores = {}
        fundamental_config = self.config["fundamental"]

        # P/E Ratio Score
        pe_ratio = financials.get("pe_ratio")
        pe_config = fundamental_config["pe_ratio"]
        pe_score = (
            self._evaluate_threshold(pe_ratio, pe_config["thresholds"])
            if pe_ratio is not None
            else 50
        )
        scores["pe"] = pe_score * pe_config["weight"]

        # ROE Score
        roe = financials.get("roe")
        roe_config = fundamental_config["roe"]
        roe_score = (
            self._evaluate_threshold(roe, roe_config["thresholds"])
            if roe is not None
            else 50
        )
        scores["roe"] = roe_score * roe_config["weight"]

        # Debt to Equity Score
        debt_ratio = financials.get("debt_to_equity")
        debt_config = fundamental_config["debt_to_equity"]
        debt_score = (
            self._evaluate_threshold(debt_ratio, debt_config["thresholds"])
            if debt_ratio is not None
            else 50
        )
        scores["debt"] = debt_score * debt_config["weight"]

        # Dividend Yield Score
        dividend_yield = financials.get("dividend_yield")
        div_config = fundamental_config["dividend_yield"]
        div_score = (
            self._evaluate_threshold(dividend_yield, div_config["thresholds"])
            if dividend_yield is not None
            else 50
        )
        scores["dividend"] = div_score * div_config["weight"]

        # Calculate total fundamental score
        total_weight = (
            pe_config["weight"]
            + roe_config["weight"]
            + debt_config["weight"]
            + div_config["weight"]
        )
        fundamental_score = (
            sum(scores.values()) / total_weight if total_weight > 0 else 50
        )

        return round(fundamental_score, 1)

    def calculate_sentiment_score(self, news_list: List[Dict[str, Any]]) -> float:
        """
        Calculate sentiment score (0-100) based on news volume and sentiment

        Args:
            news_list: List of news articles with title and description

        Returns:
            Sentiment score (0-100)
        """
        if not news_list:
            return 50  # Neutral if no news

        sentiment_config = self.config["sentiment"]
        keywords = sentiment_config["keywords"]

        # News Volume Score
        news_count = len(news_list)
        volume_config = sentiment_config["news_volume"]
        volume_score = self._evaluate_threshold(
            news_count, volume_config["thresholds"]
        )

        # News Sentiment Analysis
        positive_count = 0
        negative_count = 0
        neutral_count = 0

        for news in news_list:
            title = (news.get("title", "") or "").lower()
            description = (news.get("description", "") or "").lower()
            text = f"{title} {description}"

            is_positive = any(kw in text for kw in keywords["positive"])
            is_negative = any(kw in text for kw in keywords["negative"])

            if is_positive:
                positive_count += 1
            elif is_negative:
                negative_count += 1
            else:
                neutral_count += 1

        # Calculate sentiment ratio
        total = positive_count + negative_count + neutral_count
        if total > 0:
            positive_ratio = positive_count / total
            negative_ratio = negative_count / total

            # Determine sentiment score based on ratios
            if positive_ratio > 0.6:
                sentiment_score = 85
            elif positive_ratio > 0.4:
                sentiment_score = 65
            elif negative_ratio > 0.6:
                sentiment_score = 20
            elif negative_ratio > 0.4:
                sentiment_score = 35
            else:
                sentiment_score = 50
        else:
            sentiment_score = 50

        # Weighted combination of volume and sentiment
        sentiment_config = self.config["sentiment"]
        total_sentiment_score = (
            volume_score * sentiment_config["news_volume"]["weight"]
            + sentiment_score * sentiment_config["news_sentiment"]["weight"]
        ) / (
            sentiment_config["news_volume"]["weight"]
            + sentiment_config["news_sentiment"]["weight"]
        )

        return round(total_sentiment_score, 1)

    def calculate_overall_score(
        self,
        technical_score: float,
        fundamental_score: float,
        sentiment_score: float,
    ) -> Dict[str, Any]:
        """
        Calculate overall score (1-10) and rating

        Args:
            technical_score: Technical score (0-100)
            fundamental_score: Fundamental score (0-100)
            sentiment_score: Sentiment score (0-100)

        Returns:
            Dict with overall_score, rating, emoji, and breakdown
        """
        weights = self.config["weights"]

        # Weighted average (0-100 scale)
        overall_100 = (
            technical_score * weights["technical"]
            + fundamental_score * weights["fundamental"]
            + sentiment_score * weights["sentiment"]
        )

        # Convert to 1-10 scale
        overall_10 = round((overall_100 / 100) * 9 + 1, 1)

        # Get rating based on score
        rating_info = self._get_rating_info(overall_10)

        # Get risk level
        risk_level = self._get_risk_level(overall_10)

        return {
            "score": overall_10,
            "score_100": round(overall_100, 1),
            "rating": rating_info["rating"],
            "emoji": rating_info["emoji"],
            "color": rating_info["color"],
            "risk_level": risk_level["level"],
            "risk_label": risk_level["label"],
            "risk_description": risk_level["description"],
            "risk_color": risk_level["color"],
            "breakdown": {
                "technical": technical_score,
                "fundamental": fundamental_score,
                "sentiment": sentiment_score,
            },
            "weights": weights,
        }

    def calculate_comprehensive_score(
        self,
        indicators: Dict[str, Any],
        financials: Dict[str, Any],
        news_list: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Calculate comprehensive stock score

        Args:
            indicators: Technical indicators
            financials: Financial metrics
            news_list: News articles

        Returns:
            Complete scoring result with all details
        """
        try:
            # Calculate individual scores
            technical_score = self.calculate_technical_score(indicators)
            fundamental_score = self.calculate_fundamental_score(financials)
            sentiment_score = self.calculate_sentiment_score(news_list)

            # Calculate overall score
            overall = self.calculate_overall_score(
                technical_score, fundamental_score, sentiment_score
            )

            # Generate trading signals
            signals = self._generate_signals(
                technical_score,
                fundamental_score,
                sentiment_score,
                overall["score"],
            )

            result = {
                "symbol": financials.get("symbol", ""),
                "scores": {
                    "technical": technical_score,
                    "fundamental": fundamental_score,
                    "sentiment": sentiment_score,
                    "overall": overall,
                },
                "signals": signals,
                "timestamp": datetime.now().isoformat(),
                "status": "success",
            }

            return result

        except Exception as e:
            return {
                "symbol": financials.get("symbol", ""),
                "error": str(e),
                "status": "failed",
                "timestamp": datetime.now().isoformat(),
            }

    # ===== Helper Methods =====

    def _evaluate_threshold(
        self, value: float, thresholds: List[Dict[str, Any]]
    ) -> float:
        """
        Evaluate value against thresholds and return score

        Args:
            value: The value to evaluate
            thresholds: List of threshold configurations

        Returns:
            Score (0-100)
        """
        for threshold in thresholds:
            if "isNull" in threshold and value is None:
                return threshold.get("score", 50)
            if "range" in threshold:
                min_val, max_val = threshold["range"]
                if min_val <= value < max_val:
                    return threshold.get("score", 50)
        # If no threshold matches, return middle score
        return 50

    def _get_rating_info(self, score: float) -> Dict[str, str]:
        """Get rating information based on score"""
        for item in self.config["overall"]["score_to_rating"]:
            min_val, max_val = item["range"]
            if min_val <= score <= max_val:
                return {
                    "rating": item["rating"],
                    "emoji": item["emoji"],
                    "color": item["color"],
                }
        return {"rating": "未知", "emoji": "❓", "color": "#6b7280"}

    def _get_risk_level(self, score: float) -> Dict[str, str]:
        """Get risk level information based on score"""
        risk_config = self.config["overall"]["risk_levels"]

        for level_name, level_info in risk_config.items():
            min_val, max_val = level_info["range"]
            if min_val <= score <= max_val:
                return {
                    "level": level_name,
                    "label": level_info["label"],
                    "description": level_info["description"],
                    "color": level_info["color"],
                }

        return {
            "level": "unknown",
            "label": "未知",
            "description": "无法评估风险等级",
            "color": "#6b7280",
        }

    def _generate_signals(
        self,
        technical_score: float,
        fundamental_score: float,
        sentiment_score: float,
        overall_score: float,
    ) -> Dict[str, Any]:
        """Generate trading signals based on scores"""
        signals = []
        signals_config = self.config["signals"]

        # Technical signal
        if technical_score > 70:
            signals.append({"type": "technical", "signal": "✅ 技术面强势看涨"})
        elif technical_score < 30:
            signals.append({"type": "technical", "signal": "⚠️ 技术面走弱"})

        # Fundamental signal
        if fundamental_score > 70:
            signals.append({"type": "fundamental", "signal": "✅ 基本面良好"})
        elif fundamental_score < 40:
            signals.append({"type": "fundamental", "signal": "⚠️ 基本面较弱"})

        # Sentiment signal
        if sentiment_score > 70:
            signals.append({"type": "sentiment", "signal": "✅ 市场情绪积极"})
        elif sentiment_score < 30:
            signals.append({"type": "sentiment", "signal": "⚠️ 市场情绪消极"})

        # Overall action
        if overall_score >= 8:
            action = "强烈建议：买入"
        elif overall_score >= 7:
            action = "建议：买入或加仓"
        elif overall_score >= 5.5:
            action = "建议：持有或观望"
        elif overall_score >= 4:
            action = "建议：考虑减仓"
        else:
            action = "强烈建议：卖出"

        return {
            "signals": signals,
            "action": action,
            "signal_count": len(signals),
        }

    @staticmethod
    def get_scoring_config() -> Dict[str, Any]:
        """Return the scoring configuration for frontend display"""
        return SCORING_CONFIG
