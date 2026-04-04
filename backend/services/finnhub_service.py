"""
Finnhub Service: Fetch company financial data
Replaces deprecated FMP API with unlimited free tier support

Provides comprehensive financial metrics including:
- P/E ratio, market cap, dividend yield
- Revenue, earnings, profit margins
- Debt ratios, ROE, ROA
- Income statement, balance sheet, cash flow
"""

import requests
from typing import Dict, Any, List
from datetime import datetime
import time


class FinnhubService:
    """Service for fetching financial data from Finnhub API"""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://finnhub.io/api/v1"
        self.timeout = 10
        # Cache for financial data (key: symbol, value: {data, timestamp})
        self._cache = {}
        self._cache_ttl = 24 * 3600  # 24 hours for financial data

    def _get_from_cache(self, symbol: str, endpoint: str) -> Dict[str, Any] | None:
        """Get data from cache if valid"""
        cache_key = f"{symbol}:{endpoint}"
        if cache_key in self._cache:
            data, timestamp = self._cache[cache_key]
            if time.time() - timestamp < self._cache_ttl:
                return data
        return None

    def _set_cache(self, symbol: str, endpoint: str, data: Dict[str, Any]):
        """Store data in cache"""
        cache_key = f"{symbol}:{endpoint}"
        self._cache[cache_key] = (data, time.time())

    def get_company_profile(self, symbol: str) -> Dict[str, Any]:
        """
        Get comprehensive company profile and financial metrics

        Args:
            symbol: Stock symbol (e.g., 'AAPL')

        Returns:
            Dict with company information:
            {
                "symbol": "AAPL",
                "company_name": "Apple Inc",
                "sector": "Technology",
                "industry": "Consumer Electronics",
                "market_cap": 2500000000000,
                "pe_ratio": 28.5,
                "pb_ratio": 2.5,
                "dividend_yield": 0.005,
                "debt_to_equity": 1.8,
                "roe": 0.85,
                "roa": 0.20,
                "current_ratio": 1.1,
                "quick_ratio": 0.9,
                "status": "success"
            }
        """
        try:
            # Check cache
            cached = self._get_from_cache(symbol, "profile")
            if cached:
                return cached

            # Fetch company profile
            profile_url = f"{self.base_url}/stock/profile2"
            params = {"symbol": symbol, "token": self.api_key}

            response = requests.get(profile_url, params=params, timeout=self.timeout)
            response.raise_for_status()
            profile = response.json()

            if not profile:
                return {"symbol": symbol, "error": "No profile data found", "status": "failed"}

            # Fetch financial metrics (earnings, dividends)
            metrics_url = f"{self.base_url}/stock/metric"
            metric_response = requests.get(
                metrics_url,
                params={"symbol": symbol, "metric": "all", "token": self.api_key},
                timeout=self.timeout
            )
            metric_response.raise_for_status()
            metrics = metric_response.json().get("metric", {})

            result = {
                "symbol": symbol,
                "company_name": profile.get("name"),
                "sector": profile.get("finnhubIndustry"),
                "industry": profile.get("finnhubIndustry"),
                "ceo": profile.get("ceo"),
                "website": profile.get("weburl"),
                "market_cap": profile.get("marketCapitalization", 0) * 1e6,  # Convert to actual value
                "pe_ratio": metrics.get("peNormalizedAnnual"),
                "pb_ratio": metrics.get("pbAnnual"),
                "dividend_yield": metrics.get("dividendYieldIndicatedAnnual", 0) / 100,  # Convert from percentage
                "revenue": metrics.get("revenueAnnual"),
                "profit_margin": metrics.get("netMarginAnnual", 0) / 100 if metrics.get("netMarginAnnual") else None,
                "roe": metrics.get("roeTTM", 0) / 100 if metrics.get("roeTTM") else None,  # Convert from percentage
                "roa": metrics.get("roaTTM", 0) / 100 if metrics.get("roaTTM") else None,  # Convert from percentage
                "debt_to_equity": metrics.get("debtToEquityTTM"),
                "current_ratio": metrics.get("currentRatioTTM"),
                "quick_ratio": metrics.get("quickRatioTTM"),
                "timestamp": datetime.now().isoformat(),
                "status": "success",
            }

            # Cache the result
            self._set_cache(symbol, "profile", result)
            return result

        except Exception as e:
            return {
                "symbol": symbol,
                "error": f"Failed to fetch company profile: {str(e)}",
                "status": "failed",
            }

    def get_income_statement(self, symbol: str) -> Dict[str, Any]:
        """
        Get income statement data for a company

        Returns:
            {
                "symbol": "AAPL",
                "revenue": 394328000000,
                "gross_profit": 169183000000,
                "operating_income": 119437000000,
                "net_income": 99968000000,
                "eps": 6.05,
                "operating_margin": 0.30,
                "net_margin": 0.25,
                "date": "2023-12-31",
                "status": "success"
            }
        """
        try:
            # Check cache
            cached = self._get_from_cache(symbol, "income")
            if cached:
                return cached

            url = f"{self.base_url}/stock/financials-reported"
            params = {
                "symbol": symbol,
                "token": self.api_key,
                "freq": "annual"
            }

            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()

            if not data.get("data") or len(data["data"]) == 0:
                return {"symbol": symbol, "status": "no_data"}

            # Get latest financial report
            report = data["data"][0]
            financials = report.get("report", {}).get("ic", {})

            revenue = financials.get("revenue", 0)
            net_income = financials.get("netIncome", 0)

            result = {
                "symbol": symbol,
                "revenue": financials.get("revenue"),
                "gross_profit": financials.get("grossProfit"),
                "operating_income": financials.get("operatingExpense"),
                "net_income": financials.get("netIncome"),
                "eps": financials.get("eps"),
                "operating_margin": (
                    financials.get("operatingExpense", 0) / revenue
                    if revenue else None
                ),
                "net_margin": (
                    net_income / revenue
                    if revenue else None
                ),
                "date": report.get("endDate"),
                "timestamp": datetime.now().isoformat(),
                "status": "success",
            }

            # Cache the result
            self._set_cache(symbol, "income", result)
            return result

        except Exception as e:
            return {
                "symbol": symbol,
                "error": f"Failed to fetch income statement: {str(e)}",
                "status": "failed",
            }

    def get_balance_sheet(self, symbol: str) -> Dict[str, Any]:
        """
        Get balance sheet data for a company

        Returns:
            {
                "symbol": "AAPL",
                "total_assets": 348222000000,
                "total_liabilities": 287912000000,
                "total_equity": 60310000000,
                "cash": 29941000000,
                "debt": 112981000000,
                "current_assets": 140000000000,
                "current_liabilities": 128000000000,
                "date": "2023-12-31",
                "status": "success"
            }
        """
        try:
            # Check cache
            cached = self._get_from_cache(symbol, "balance")
            if cached:
                return cached

            url = f"{self.base_url}/stock/financials-reported"
            params = {
                "symbol": symbol,
                "token": self.api_key,
                "freq": "annual"
            }

            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()

            if not data.get("data") or len(data["data"]) == 0:
                return {"symbol": symbol, "status": "no_data"}

            # Get latest financial report
            report = data["data"][0]
            financials = report.get("report", {}).get("bs", {})

            result = {
                "symbol": symbol,
                "total_assets": financials.get("totalAssets"),
                "total_liabilities": financials.get("totalLiabilities"),
                "total_equity": financials.get("totalStockholdersEquity"),
                "cash": financials.get("cashAndCashEquivalents"),
                "debt": financials.get("totalDebt"),
                "current_assets": financials.get("totalCurrentAssets"),
                "current_liabilities": financials.get("totalCurrentLiabilities"),
                "date": report.get("endDate"),
                "timestamp": datetime.now().isoformat(),
                "status": "success",
            }

            # Cache the result
            self._set_cache(symbol, "balance", result)
            return result

        except Exception as e:
            return {
                "symbol": symbol,
                "error": f"Failed to fetch balance sheet: {str(e)}",
                "status": "failed",
            }

    def get_cash_flow_statement(self, symbol: str) -> Dict[str, Any]:
        """
        Get cash flow statement data for a company

        Returns:
            {
                "symbol": "AAPL",
                "operating_cash_flow": 110543000000,
                "investing_cash_flow": -10595000000,
                "financing_cash_flow": -106575000000,
                "free_cash_flow": 99948000000,
                "date": "2023-12-31",
                "status": "success"
            }
        """
        try:
            # Check cache
            cached = self._get_from_cache(symbol, "cashflow")
            if cached:
                return cached

            url = f"{self.base_url}/stock/financials-reported"
            params = {
                "symbol": symbol,
                "token": self.api_key,
                "freq": "annual"
            }

            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()

            if not data.get("data") or len(data["data"]) == 0:
                return {"symbol": symbol, "status": "no_data"}

            # Get latest financial report
            report = data["data"][0]
            financials = report.get("report", {}).get("cf", {})

            operating_cf = financials.get("operatingCashFlow", 0)
            capital_cf = financials.get("capitalExpenditure", 0)

            result = {
                "symbol": symbol,
                "operating_cash_flow": financials.get("operatingCashFlow"),
                "investing_cash_flow": financials.get("investingCashFlow"),
                "financing_cash_flow": financials.get("financingCashFlow"),
                "free_cash_flow": (operating_cf + capital_cf) if (operating_cf and capital_cf) else None,
                "date": report.get("endDate"),
                "timestamp": datetime.now().isoformat(),
                "status": "success",
            }

            # Cache the result
            self._set_cache(symbol, "cashflow", result)
            return result

        except Exception as e:
            return {
                "symbol": symbol,
                "error": f"Failed to fetch cash flow statement: {str(e)}",
                "status": "failed",
            }

    def get_dividend_history(self, symbol: str, limit: int = 5) -> Dict[str, Any]:
        """
        Get dividend payment history for a company

        Returns:
            {
                "symbol": "AAPL",
                "dividends": [
                    {"date": "2023-11-10", "amount": 0.24},
                    {"date": "2023-08-10", "amount": 0.24}
                ],
                "status": "success"
            }
        """
        try:
            # Check cache
            cached = self._get_from_cache(symbol, "dividends")
            if cached:
                return cached

            url = f"{self.base_url}/stock/dividend"
            params = {
                "symbol": symbol,
                "token": self.api_key
            }

            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            dividends = response.json()

            if not dividends:
                return {"symbol": symbol, "status": "no_data"}

            # Sort by date descending and get latest N
            sorted_divs = sorted(dividends, key=lambda x: x.get("exDate", ""), reverse=True)[:limit]

            result = {
                "symbol": symbol,
                "dividends": [
                    {
                        "date": d.get("exDate"),
                        "amount": d.get("dividend"),
                    }
                    for d in sorted_divs
                ],
                "timestamp": datetime.now().isoformat(),
                "status": "success",
            }

            # Cache the result
            self._set_cache(symbol, "dividends", result)
            return result

        except Exception as e:
            return {
                "symbol": symbol,
                "error": f"Failed to fetch dividend history: {str(e)}",
                "status": "failed",
            }
