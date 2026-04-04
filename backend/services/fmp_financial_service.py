"""
Financial Modeling Prep (FMP) Service: Fetch company financial data

Provides comprehensive financial metrics including:
- P/E ratio, market cap, dividend yield
- Revenue, earnings, profit margins
- Debt ratios, ROE, ROA
- Industry comparisons
"""

import requests
from typing import Dict, Any, List
from datetime import datetime


class FMPFinancialService:
    """Service for fetching financial data from Financial Modeling Prep API"""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://financialmodelingprep.com/api/v3"
        self.timeout = 10

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
            # Fetch profile
            profile = self._fetch_profile(symbol)

            # Fetch financial ratios
            ratios = self._fetch_financial_ratios(symbol)

            # Combine data
            result = {
                "symbol": symbol,
                "company_name": profile.get("companyName"),
                "sector": profile.get("sector"),
                "industry": profile.get("industry"),
                "ceo": profile.get("ceo"),
                "website": profile.get("website"),
                "market_cap": profile.get("mktCap"),
                "pe_ratio": profile.get("pe"),
                "pb_ratio": profile.get("pb"),
                "dividend_yield": profile.get("dividendYield"),
                "revenue": profile.get("revenue"),
                "profit_margin": profile.get("profitMargin"),
                "roe": ratios.get("roe"),
                "roa": ratios.get("roa"),
                "debt_to_equity": ratios.get("debtToEquity"),
                "current_ratio": ratios.get("currentRatio"),
                "quick_ratio": ratios.get("quickRatio"),
                "timestamp": datetime.now().isoformat(),
                "status": "success",
            }

            return result

        except Exception as e:
            return {
                "symbol": symbol,
                "error": f"Failed to fetch company profile: {str(e)}",
                "status": "failed",
            }

    def _fetch_profile(self, symbol: str) -> Dict[str, Any]:
        """Fetch company profile from FMP"""
        try:
            url = f"{self.base_url}/profile/{symbol}"
            params = {"apikey": self.api_key}

            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()

            if data and len(data) > 0:
                return data[0]
            return {}

        except Exception as e:
            print(f"Error fetching profile for {symbol}: {str(e)}")
            return {}

    def _fetch_financial_ratios(self, symbol: str) -> Dict[str, Any]:
        """Fetch financial ratios from FMP"""
        try:
            url = f"{self.base_url}/ratios/{symbol}"
            params = {"apikey": self.api_key, "limit": 1}

            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()

            if data and len(data) > 0:
                ratio = data[0]
                return {
                    "roe": ratio.get("returnOnEquity"),
                    "roa": ratio.get("returnOnAssets"),
                    "debtToEquity": ratio.get("debtToEquity"),
                    "currentRatio": ratio.get("currentRatio"),
                    "quickRatio": ratio.get("quickRatio"),
                    "debtRatio": ratio.get("debtRatio"),
                    "netProfitMargin": ratio.get("netProfitMargin"),
                }
            return {}

        except Exception as e:
            print(f"Error fetching financial ratios for {symbol}: {str(e)}")
            return {}

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
                "timestamp": "..."
            }
        """
        try:
            url = f"{self.base_url}/income-statement/{symbol}"
            params = {"apikey": self.api_key, "limit": 1}

            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()

            if data and len(data) > 0:
                stmt = data[0]
                return {
                    "symbol": symbol,
                    "revenue": stmt.get("revenue"),
                    "gross_profit": stmt.get("grossProfit"),
                    "operating_income": stmt.get("operatingIncome"),
                    "net_income": stmt.get("netIncome"),
                    "eps": stmt.get("eps"),
                    "operating_margin": (
                        stmt.get("operatingIncome", 0) / stmt.get("revenue", 1)
                        if stmt.get("revenue")
                        else None
                    ),
                    "net_margin": (
                        stmt.get("netIncome", 0) / stmt.get("revenue", 1)
                        if stmt.get("revenue")
                        else None
                    ),
                    "date": stmt.get("date"),
                    "status": "success",
                }
            return {"symbol": symbol, "status": "no_data"}

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
                "timestamp": "..."
            }
        """
        try:
            url = f"{self.base_url}/balance-sheet-statement/{symbol}"
            params = {"apikey": self.api_key, "limit": 1}

            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()

            if data and len(data) > 0:
                stmt = data[0]
                return {
                    "symbol": symbol,
                    "total_assets": stmt.get("totalAssets"),
                    "total_liabilities": stmt.get("totalLiabilities"),
                    "total_equity": stmt.get("totalStockholdersEquity"),
                    "cash": stmt.get("cashAndCashEquivalents"),
                    "debt": stmt.get("totalDebt"),
                    "current_assets": stmt.get("totalCurrentAssets"),
                    "current_liabilities": stmt.get("totalCurrentLiabilities"),
                    "date": stmt.get("date"),
                    "status": "success",
                }
            return {"symbol": symbol, "status": "no_data"}

        except Exception as e:
            return {
                "symbol": symbol,
                "error": f"Failed to fetch balance sheet: {str(e)}",
                "status": "failed",
            }

    def get_cash_flow_statement(self, symbol: str) -> Dict[str, Any]:
        """Get cash flow statement data for a company"""
        try:
            url = f"{self.base_url}/cash-flow-statement/{symbol}"
            params = {"apikey": self.api_key, "limit": 1}

            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()

            if data and len(data) > 0:
                stmt = data[0]
                return {
                    "symbol": symbol,
                    "operating_cash_flow": stmt.get("operatingCashFlow"),
                    "investing_cash_flow": stmt.get("investingCashFlow"),
                    "financing_cash_flow": stmt.get("financingCashFlow"),
                    "free_cash_flow": stmt.get("freeCashFlow"),
                    "date": stmt.get("date"),
                    "status": "success",
                }
            return {"symbol": symbol, "status": "no_data"}

        except Exception as e:
            return {
                "symbol": symbol,
                "error": f"Failed to fetch cash flow statement: {str(e)}",
                "status": "failed",
            }

    def get_dividend_history(self, symbol: str, limit: int = 5) -> Dict[str, Any]:
        """Get dividend payment history for a company"""
        try:
            url = f"{self.base_url}/historical-price-full/dividend_payment/{symbol}"
            params = {"apikey": self.api_key}

            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()

            if "historical" in data:
                dividends = data["historical"][:limit]
                return {
                    "symbol": symbol,
                    "dividends": [
                        {
                            "date": d.get("date"),
                            "amount": d.get("dividend"),
                        }
                        for d in dividends
                    ],
                    "status": "success",
                }
            return {"symbol": symbol, "status": "no_data"}

        except Exception as e:
            return {
                "symbol": symbol,
                "error": f"Failed to fetch dividend history: {str(e)}",
                "status": "failed",
            }
