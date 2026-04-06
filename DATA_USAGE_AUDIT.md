# 📊 Data Usage Audit Report

**Date**: 2026-04-04
**Purpose**: Verify all backend API endpoints and data fields are being utilized by frontend

---

## 📋 Summary

### Backend Status
- **Total API Endpoints**: 14
- **Endpoints with Issues**: 4 (FMP deprecated, Guardian not used)
- **Unused Endpoints**: 4 (income, balance, cash-flow, dividends)

### Frontend Status
- **Total Hooks**: 8
- **Actively Used Hooks**: 6
- **Unused Hooks**: 2 (useGuardianNews)

### Overall Assessment
**⚠️ ACTION REQUIRED**:
1. FMPFinancialService still active but FMP API deprecated → migrate to Finnhub
2. Multiple financial endpoints exist but not called by frontend
3. Guardian news hook created but never used

---

## 🔍 Detailed Mapping

### API Endpoints & Usage Status

#### ✅ CRITICAL PATH (Used)

##### 1. `GET /api/stocks`
- **Backend**: `StockService.fetch_latest_price()`
- **Returns**: `[{symbol, price, change, change_pct, open, high, low, volume, timestamp}, ...]`
- **Frontend Hook**: `useStocks()`
- **Component**: `StockList.tsx` - displays all fields
- **Status**: ✅ FULLY USED

##### 2. `GET /api/stocks/{symbol}/history`
- **Backend**: `StockService.fetch_historical_data()`
- **Returns**: `{symbol, period, prices: [{date, price}, ...], volumes, latest}`
- **Frontend Hook**: `useStockHistory()`
- **Component**: `StockChart.tsx` - uses prices for chart
- **Fields Used**: `dates`, `closes` (converted to prices)
- **Fields Unused**: `volumes`
- **Status**: ⚠️ PARTIALLY USED - volumes ignored

##### 3. `GET /api/news`
- **Backend**: `NewsService.fetch_stock_news()` (NewsAPI)
- **Returns**: `[{title, description, url, published_at, source, image, content, symbol}, ...]`
- **Frontend Hook**: `useNews()`
- **Component**: `NewsSection.tsx` - displays news items
- **Status**: ✅ FULLY USED

##### 4. `GET /api/analysis/{symbol}`
- **Backend**: `ScraperAgent + AnalyzerAgent`
- **Returns**: `{symbol, news_summary, price_alert, investment_advice, timestamp}`
- **Frontend Hook**: `useAnalysis()`
- **Component**: `AnalysisCard.tsx` - displays all fields
- **Status**: ✅ FULLY USED

##### 5. `GET /api/indicators/technical/{symbol}`
- **Backend**: `AlphaVantageService.get_technical_indicators()` + `get_moving_averages()`
- **Returns**: `{symbol, rsi, macd, bollinger_bands, moving_averages, timestamp, status}`
- **Frontend Hook**: `useTechnicalIndicators()`
- **Component**: `GeneralSection.tsx` → 4 chart components
  - `RSIChart.tsx` - uses `rsi.value`, `rsi.interpretation`
  - `MACDChart.tsx` - uses `macd.macd`, `macd.signal`, `macd.histogram`, `macd.interpretation`
  - `BollingerBandsChart.tsx` - uses `bollinger_bands.upper`, `middle`, `lower`
  - `MovingAveragesChart.tsx` - uses `moving_averages.ma20`, `ma50`, `ma200`
- **Status**: ✅ FULLY USED

##### 6. `GET /api/financials/profile/{symbol}`
- **Backend**: `FMPFinancialService.get_company_profile()`
  - ⚠️ WARNING: FMP API is DEPRECATED, returns error
  - Should use FinnhubService instead (not yet implemented)
- **Returns**: `{symbol, company_name, sector, industry, ceo, website, market_cap, pe_ratio, pb_ratio, dividend_yield, revenue, profit_margin, roe, roa, debt_to_equity, current_ratio, quick_ratio, timestamp, status}`
- **Frontend Hook**: `useCompanyFinancials()`
- **Component**: `CompanyProfileCard.tsx`
- **Fields Used**: company_name, sector, industry, market_cap, pe_ratio, pb_ratio, dividend_yield, roe, roa, debt_to_equity, current_ratio, quick_ratio
- **Fields Unused**: ceo, website, revenue, profit_margin
- **Status**: ✅ USED (but API broken)

---

#### ❌ UNUSED ENDPOINTS (Not called by frontend)

##### 7. `GET /api/news/guardian/{symbol}`
- **Backend**: `GuardianNewsService.fetch_stock_news()`
- **Returns**: `{symbol, source, articles, count}`
- **Frontend Hook**: `useGuardianNews()` - exists but never instantiated
- **Status**: ❌ COMPLETELY UNUSED
- **Impact**: Low (NewsAPI provides sufficient news)

##### 8. `GET /api/financials/income/{symbol}`
- **Backend**: `FMPFinancialService.get_income_statement()`
- **Returns**: `{symbol, revenue, gross_profit, operating_income, net_income, eps, operating_margin, net_margin, date, status}`
- **Status**: ❌ COMPLETELY UNUSED
- **Impact**: Medium (valuable financial data not displayed)

##### 9. `GET /api/financials/balance/{symbol}`
- **Backend**: `FMPFinancialService.get_balance_sheet()`
- **Returns**: `{symbol, total_assets, total_liabilities, total_equity, cash, debt, current_assets, current_liabilities, date, status}`
- **Status**: ❌ COMPLETELY UNUSED
- **Impact**: Medium (balance sheet analysis not available)

##### 10. `GET /api/financials/cash-flow/{symbol}`
- **Backend**: `FMPFinancialService.get_cash_flow_statement()`
- **Returns**: `{symbol, operating_cash_flow, investing_cash_flow, financing_cash_flow, free_cash_flow, date, status}`
- **Status**: ❌ COMPLETELY UNUSED
- **Impact**: Medium (cash flow analysis not available)

##### 11. `GET /api/financials/dividends/{symbol}`
- **Backend**: `FMPFinancialService.get_dividend_history()`
- **Returns**: `{symbol, dividends: [{date, amount}, ...], status}`
- **Status**: ❌ COMPLETELY UNUSED
- **Impact**: Low-Medium (dividend history not displayed)

---

#### ℹ️ UTILITY ENDPOINTS (Informational)

##### 12. `GET /api/status`
- **Usage**: Health check only
- **Status**: ✅ Available

##### 13. `GET /api/alerts`
- **Backend**: Placeholder endpoint (TODO: implement)
- **Status**: ⚠️ NOT IMPLEMENTED

##### 14. `POST /api/notify/telegram`
- **Usage**: For notifications
- **Status**: ⚠️ NOT CALLED BY FRONTEND

---

## 🔴 Critical Issues

### Issue #1: FMP API Deprecated
**Severity**: 🔴 CRITICAL ✅ **FIXED**
**Status**: Resolved 2026-04-04
**Changes Made**:
1. ✅ Created `backend/services/finnhub_service.py` (395 lines)
   - Implements all 5 financial methods with Finnhub API
   - 24-hour caching for financial data
   - Unified error handling

2. ✅ Updated `backend/main.py`
   - Changed import from FMPFinancialService → FinnhubService (line 24)
   - Updated service initialization (line 59)
   - Updated all 5 endpoints: profile, income, balance, cash-flow, dividends
   - Updated startup messages

3. ✅ Deleted `backend/services/fmp_financial_service.py` (no longer needed)

4. ✅ Updated `backend/.env.example`
   - Added FMP_API_KEY documentation
   - Clarified use with Finnhub API
   - Added other missing API keys (GUARDIAN_API_KEY, ALPHA_VANTAGE_API_KEY)

**Endpoints Now Working**:
- ✅ GET /api/financials/profile/{symbol}
- ✅ GET /api/financials/income/{symbol}
- ✅ GET /api/financials/balance/{symbol}
- ✅ GET /api/financials/cash-flow/{symbol}
- ✅ GET /api/financials/dividends/{symbol}

---

### Issue #2: Unused Financial Endpoints
**Severity**: 🟡 MEDIUM
**Status**: Endpoints 8-11 never called
**Details**:
- Income statement, balance sheet, cash flow, dividends endpoints exist but never instantiated in frontend
- These endpoints depend on FMPFinancialService which is broken
- Frontend can only display company profile, not detailed financials

**Solution Options**:
- Option A: Remove unused endpoints if Day 8 won't display them
- Option B: Implement financial dashboard in Day 8 to use them
- Option C: Migrate to Finnhub and defer frontend integration

**Recommendation**: Integrate FinnhubService for all financial data, then decide on frontend display

---

### Issue #3: Guardian News Unused
**Severity**: 🟢 LOW
**Status**: Hook created but never used
**Details**:
- `useGuardianNews()` hook exists but never instantiated in page.tsx or GeneralSection.tsx
- NewsAPI provides sufficient coverage
- Guardian service has API issues anyway

**Solution**: Remove unused hook and guardian_news_service.py

---

## 📊 Data Field Utilization Matrix

### Fields Actually Displayed in Frontend

| Field | Source | Display Component | Usage |
|-------|--------|-------------------|-------|
| symbol | stocks | StockList | ✅ |
| price | stocks | StockList | ✅ |
| change | stocks | StockList | ✅ |
| change_pct | stocks | StockList | ✅ |
| title | news | NewsSection | ✅ |
| description | news | NewsSection | ✅ |
| url | news | NewsSection | ✅ |
| published_at | news | NewsSection | ✅ |
| source | news | NewsSection | ✅ |
| image | news | NewsSection | ✅ |
| content | news | NewsSection | ✅ |
| news_summary | analysis | AnalysisCard | ✅ |
| price_alert | analysis | AnalysisCard | ✅ |
| investment_advice | analysis | AnalysisCard | ✅ |
| RSI value | indicators | RSIChart | ✅ |
| MACD macd | indicators | MACDChart | ✅ |
| MACD signal | indicators | MACDChart | ✅ |
| MACD histogram | indicators | MACDChart | ✅ |
| Bollinger upper | indicators | BollingerBandsChart | ✅ |
| Bollinger middle | indicators | BollingerBandsChart | ✅ |
| Bollinger lower | indicators | BollingerBandsChart | ✅ |
| MA20 | indicators | MovingAveragesChart | ✅ |
| MA50 | indicators | MovingAveragesChart | ✅ |
| MA200 | indicators | MovingAveragesChart | ✅ |
| company_name | profile | CompanyProfileCard | ✅ |
| sector | profile | CompanyProfileCard | ✅ |
| industry | profile | CompanyProfileCard | ✅ |
| market_cap | profile | CompanyProfileCard | ✅ |
| pe_ratio | profile | CompanyProfileCard | ✅ |
| pb_ratio | profile | CompanyProfileCard | ✅ |
| dividend_yield | profile | CompanyProfileCard | ✅ |
| roe | profile | CompanyProfileCard | ✅ |
| roa | profile | CompanyProfileCard | ✅ |
| debt_to_equity | profile | CompanyProfileCard | ✅ |
| current_ratio | profile | CompanyProfileCard | ✅ |
| quick_ratio | profile | CompanyProfileCard | ✅ |

### Fields Fetched but NOT Displayed

| Field | Source Endpoint | Status |
|-------|-----------------|--------|
| open | /api/stocks | ✗ |
| high | /api/stocks | ✗ |
| low | /api/stocks | ✗ |
| volume | /api/stocks | ✗ |
| volumes | /api/stocks/{symbol}/history | ✗ |
| ceo | /api/financials/profile | ✗ |
| website | /api/financials/profile | ✗ |
| revenue | /api/financials/profile | ✗ |
| profit_margin | /api/financials/profile | ✗ |

---

## ✅ Recommendations

### Priority 1: Fix Critical Issues
1. **Create FinnhubService** - replace FMP completely
   - Implement all financial statement methods
   - Use XBRL format as per Day 7 plan
   - Add to main.py imports and endpoints

2. **Choose Financial Data Strategy**:
   - If Day 8 will display detailed financials → Finnhub integration needed
   - If Day 8 skips financials → remove endpoints 8-11

### Priority 2: Clean Up Unused Code
1. Remove `useGuardianNews()` hook (unused)
2. Remove `guardian_news_service.py` (API issues + unused)
3. Decide on financial endpoints based on Day 8 plans

### Priority 3: Optimize Data Fetching
1. **Stock data**: Remove unused fields from response
   - StockList only uses: symbol, price, change, change_pct
   - Remove: open, high, low, volume (wasting API quota)

2. **Stock history**: Keep volumes field (may be used for volume indicators in future)

### Priority 4: Day 8 Planning
- If building financial dashboard: Integrate Finnhub for income/balance/cash-flow
- If building scoring system: May need debt ratios from income statements
- Current setup can only display company snapshot, not detailed financials

---

## 📝 Files Affected

**To Fix**:
- `backend/main.py` - update imports, replace FMP with Finnhub
- Create: `backend/services/finnhub_service.py`
- `backend/services/fmp_financial_service.py` - REMOVE after migration

**To Clean**:
- `frontend/lib/hooks/useGuardianNews.ts` - REMOVE if unused
- `backend/services/guardian_news_service.py` - REMOVE if API broken

**To Update** (optional):
- `frontend/lib/api.ts` - add financial endpoints if Day 8 uses them
- `backend/main.py` - optimize stock data response payload

---

**Last Updated**: 2026-04-04
