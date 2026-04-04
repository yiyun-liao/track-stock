# Day 7: 數據擴展 - 多源 API 整合

**進行中** | 開始日期: 2026-04-04

## 📊 三大 API 整合完成

### ✅ 1. Guardian News API (獨立新聞)
**檔案**: `backend/services/guardian_news_service.py`

**功能**:
- 從 The Guardian 獲取高質量金融新聞
- 支援多股票並發查詢
- 去重機制避免重複文章

**API 端點**:
```
GET /api/news/guardian/{symbol}
```

**響應範例**:
```json
{
  "success": true,
  "data": {
    "symbol": "AAPL",
    "source": "The Guardian",
    "articles": [
      {
        "title": "Apple reports record earnings...",
        "description": "iPhone sales boost profits...",
        "url": "https://...",
        "published_at": "2026-04-04T12:00:00Z",
        "author": "John Doe",
        "source": "The Guardian"
      }
    ],
    "count": 3
  }
}
```

**特點**:
- 獨立、高質量新聞
- Business section 專注財經
- 完整的作者和發布日期信息

---

### ✅ 2. Alpha Vantage Technical Indicators (技術指標)
**檔案**: `backend/services/alpha_vantage_service.py`

**功能**:
- RSI (Relative Strength Index) - 判斷超買/超賣
- MACD (Moving Average Convergence Divergence) - 趨勢跟蹤
- Bollinger Bands - 波動率分析
- 移動平均線 (MA 20, 50, 200)

**API 端點**:
```
GET /api/indicators/technical/{symbol}
GET /api/indicators/moving-averages/{symbol}  (可選)
```

**響應範例**:
```json
{
  "success": true,
  "data": {
    "symbol": "AAPL",
    "rsi": {
      "value": 65.5,
      "interpretation": "overbought",
      "timestamp": "2026-04-04"
    },
    "macd": {
      "macd": 2.5431,
      "signal": 2.1234,
      "histogram": 0.4197,
      "interpretation": "bullish",
      "timestamp": "2026-04-04"
    },
    "bollinger_bands": {
      "upper": 185.50,
      "middle": 180.00,
      "lower": 174.50,
      "timestamp": "2026-04-04"
    },
    "moving_averages": {
      "ma20": 179.45,
      "ma50": 178.90,
      "ma200": 177.32
    }
  }
}
```

**技術分析應用**:
- RSI > 70: 超買信號 (可能回調)
- RSI < 30: 超賣信號 (可能反彈)
- MACD histogram > 0: 看漲信號
- MACD histogram < 0: 看跌信號
- 價格在 Bollinger Bands 上方: 上升趨勢
- 價格在 Bollinger Bands 下方: 下降趨勢

---

### ✅ 3. Financial Modeling Prep (企業財務資料)
**檔案**: `backend/services/fmp_financial_service.py`

#### 3a. 公司概況和主要指標
```
GET /api/financials/profile/{symbol}
```

**返回信息**:
- 公司名稱、行業、部門、CEO
- 市值、P/E 比率、P/B 比率
- 股息收益率
- 利潤率、ROE、ROA
- 負債比率、流動比率

**響應範例**:
```json
{
  "success": true,
  "data": {
    "symbol": "AAPL",
    "company_name": "Apple Inc",
    "sector": "Technology",
    "industry": "Consumer Electronics",
    "market_cap": 2500000000000,
    "pe_ratio": 28.5,
    "pb_ratio": 42.8,
    "dividend_yield": 0.005,
    "roe": 0.85,
    "roa": 0.20,
    "debt_to_equity": 1.8,
    "current_ratio": 1.1,
    "quick_ratio": 0.9
  }
}
```

#### 3b. 損益表 (Income Statement)
```
GET /api/financials/income/{symbol}
```

**返回信息**:
- 總收入 (Revenue)
- 毛利潤 (Gross Profit)
- 營業利潤 (Operating Income)
- 淨收益 (Net Income)
- 每股收益 (EPS)
- 各項利潤率

#### 3c. 資產負債表 (Balance Sheet)
```
GET /api/financials/balance/{symbol}
```

**返回信息**:
- 總資產、總負債、總股東權益
- 現金及等價物
- 總債務
- 流動資產和流動負債

#### 3d. 現金流量表 (Cash Flow)
```
GET /api/financials/cash-flow/{symbol}
```

**返回信息**:
- 營運現金流
- 投資現金流
- 融資現金流
- 自由現金流 (Free Cash Flow)

#### 3e. 股息歷史
```
GET /api/financials/dividends/{symbol}
```

**返回信息**:
- 歷史股息支付日期和金額
- 最近 5 次分配

---

## 🔧 後端集成狀態

### 新增檔案
```
backend/
├── services/
│   ├── guardian_news_service.py        ✅ 完成
│   ├── alpha_vantage_service.py        ✅ 完成
│   └── fmp_financial_service.py        ✅ 完成
└── test_day7_endpoints.py              ✅ 完成
```

### 更新的檔案
```
backend/main.py
- 新增 3 個服務的初始化
- 新增 7 個 API 端點
- 更新啟動日誌以顯示 API 密鑰狀態
```

### 語法驗證
✅ 所有 Python 檔案通過語法檢查

---

## 🚀 如何使用

### 1. 確保環境變數已加載 (.env)
```
GUARDIAN_API_KEY=d075ed61-c9fe-4bad-9215-5e41b8182846
ALPHA_VANTAGE_API_KEY=JNTUIIDYJC8JGCN3
FMP_API_KEY=TzZdPl6Q2upGrOL1m5yCVdufKrHzvXHI
```

### 2. 重啟後端服務器
```bash
cd backend
python main.py
```

### 3. 測試 API 端點
```bash
# Guardian 新聞
curl http://localhost:8000/api/news/guardian/AAPL

# 技術指標
curl http://localhost:8000/api/indicators/technical/AAPL

# 公司概況
curl http://localhost:8000/api/financials/profile/AAPL

# 損益表
curl http://localhost:8000/api/financials/income/AAPL

# 資產負債表
curl http://localhost:8000/api/financials/balance/AAPL

# 現金流量
curl http://localhost:8000/api/financials/cash-flow/AAPL

# 股息歷史
curl http://localhost:8000/api/financials/dividends/AAPL
```

### 4. 查看伺服器日誌
伺服器啟動時應顯示：
```
📰 News APIs:
  - NEWS_API_KEY: ✅ Loaded
  - GUARDIAN_API_KEY: ✅ Loaded

📈 Technical Indicators:
  - ALPHA_VANTAGE_API_KEY: ✅ Loaded

💰 Financial Data:
  - FMP_API_KEY: ✅ Loaded
```

---

## 📈 分析用例

### 基本面分析 (Fundamental Analysis)
```
1. 用 FMP Income Statement 檢查收益增長
2. 用 FMP Balance Sheet 檢查債務水平
3. 用 FMP Profile 檢查 P/E、ROE、ROA
4. 用 Guardian 新聞檢查是否有重大事件
```

### 技術分析 (Technical Analysis)
```
1. 用 RSI 判斷超買/超賣
2. 用 MACD 判斷趨勢方向
3. 用 Bollinger Bands 判斷波動率
4. 用 Moving Averages 確認趨勢
```

### 投資決策
```
1. 結合技術指標和基本面數據
2. 使用 AI (Claude) 分析新聞
3. 綜合評分並生成投資建議
```

---

## 🔄 API 配額注意事項

### Alpha Vantage
- 免費版本: 每分鐘 5 次調用，每天 500 次
- 建議: 緩存結果，避免頻繁調用

### FMP (Financial Modeling Prep)
- 免費版本: 250 次調用/day
- 包含所有端點

### The Guardian API
- 免費版本: 每天 10,000 次調用
- 充足供应用户使用

---

## ✨ Next Steps (Day 8)

後續計劃：
1. 建立智能篩選系統 (Filtering & Ranking)
2. 整合股票評分系統 (Scoring System)
3. 前端展示財務數據和技術指標
4. 建立綜合分析儀表板

---

**狀態**: 🔄 開發中 - API 服務已完成，等待前端集成
**下一步**: Day 8 技術指標面板 + 股票評分系統
