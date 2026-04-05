# 🚀 Track Stock - AI 美股監控系統

一個整合實時股價、AI 新聞摘要、技術指標與智能警報的專業級美股監控平台。

## ✨ 核心功能

### 📊 實時數據
- **股票價格** - yfinance 實時報價 & 30天走勢圖
- **財務指標** - Finnhub 完整的損益表、資產負債表、現金流量
- **公司概覽** - CEO、部門、產業、市值、P/E比

### 📰 新聞聚合
- NewsAPI - 100+ 財經新聞文章
- 自動去重 & 相關性排序
- AI 驅動的新聞摘要

### 📈 技術分析
- RSI (相對強弱指數)
- 移動平均線 (MA20, MA50, MA200)
- MACD & 布林帶 (Premium)

### 🤖 AI 功能
- Claude API 新聞智能總結
- 投資建議生成
- 股票對比分析

### 🔔 智能通知
- Telegram 機器人 實時警報
- 自定義價格警報設置
- 每日市場摘要報告

---

## 🏗️ 技術架構

### 後端
- **FastAPI** - 高性能 Python Web 框架
- **yfinance** - 股價數據 (含重試 + 5分鐘快取)
- **Finnhub API** - 財務數據 (無限免費額度)
- **Alpha Vantage** - 技術指標 & 公司概覽 (含24h快取)
- **NewsAPI** - 財經新聞聚合

### 前端
- **Next.js 14** - React SSR 框架
- **TailwindCSS** - Utility-first 樣式
- **Recharts** - 數據可視化圖表

### 數據庫
- SQLite (開發環境)
- PostgreSQL (生產環境可選)

---

## 🚀 快速開始

### 環境設置

```bash
# 1. 安裝依賴
cd backend
pip install -r requirements.txt

cd ../frontend
npm install

# 2. 配置環境變數
cp .env.example .env
# 編輯 .env，填入以下 API keys:
# - NEWS_API_KEY (newsapi.org)
# - FINNHUB_API_KEY (finnhub.io)
# - ALPHA_VANTAGE_API_KEY (alphavantage.co)
# - CLAUDE_API_KEY (anthropic.com)
# - TELEGRAM_BOT_TOKEN & TELEGRAM_CHAT_ID (可選)
```

### 啟動應用

```bash
# Terminal 1: 啟動後端 (port 8000)
cd backend
python3 main.py

# Terminal 2: 啟動前端 (port 3000)
cd frontend
npm run dev
```

訪問: http://localhost:3000

---

## 📡 API 端點

### 股票數據
| 端點 | 說明 |
|------|------|
| `GET /api/stocks` | 獲取追蹤股票的實時價格 |
| `GET /api/stocks/{symbol}/history` | 獲取30天歷史走勢 |

### 新聞 & 分析
| 端點 | 說明 |
|------|------|
| `GET /api/news` | 獲取最新新聞文章 |
| `GET /api/news/guardian/{symbol}` | 獲取 Guardian 新聞 |
| `GET /api/analysis/{symbol}` | 獲取 AI 投資分析 |

### 財務數據
| 端點 | 說明 |
|------|------|
| `GET /api/financials/profile/{symbol}` | 公司概覽 (CEO, 市值等) |
| `GET /api/financials/income/{symbol}` | 損益表 |
| `GET /api/financials/balance/{symbol}` | 資產負債表 |
| `GET /api/financials/cash-flow/{symbol}` | 現金流量表 |

### 技術指標
| 端點 | 說明 |
|------|------|
| `GET /api/indicators/technical/{symbol}` | RSI, MACD, 布林帶, 移動平均線 |

---

## 🔧 環境變數

```env
# 必需
NEWS_API_KEY=your_newsapi_key
FINNHUB_API_KEY=your_finnhub_key
ALPHA_VANTAGE_API_KEY=your_alphavantage_key
CLAUDE_API_KEY=your_claude_key

# 可選 (Telegram 通知)
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# 可選 (Guardian 新聞)
GUARDIAN_API_KEY=your_guardian_key
```

### 免費 API 配額

| API | 免費額度 | 限制 |
|-----|---------|------|
| NewsAPI | 100 請求/天 | 無 |
| Finnhub | 無限 | 無 |
| Alpha Vantage | 25 請求/天 | 1 請求/秒 |
| Claude API | 按使用計費 | - |

---

## 📊 項目進度

### ✅ 完成
- **Day 1-3**: 核心系統 (股價爬蟲、Telegram通知) ✅
- **Day 4-5**: 前端儀表板 & 端到端集成 ✅
- **Day 6**: UI 優化 & 錯誤隔離 ✅
- **Day 7**: 數據擴展 (Finnhub財務、Alpha Vantage公司概覽) ✅
- **Day 8**: 技術指標面板 (RSI、MACD、布林帶、移動平均線) ✅

### 📋 進行中 & 計劃中
- **Day 8 進行中**: 股票評分系統 & UI 優化
- **Day 9**: AI 增強 (股市分析模型、Bot互動)
- **Day 10**: 部署 & 生產優化

---

## 📂 文件結構

```
track-stock/
├── backend/
│   ├── main.py                    # FastAPI 應用入口
│   ├── services/
│   │   ├── stock_service.py       # yfinance 股票數據
│   │   ├── news_service.py        # NewsAPI 新聞
│   │   ├── finnhub_service.py     # Finnhub 財務數據 ⭐
│   │   ├── company_overview_service.py  # Alpha Vantage 公司信息 ⭐
│   │   ├── alpha_vantage_service.py     # 技術指標
│   │   ├── telegram_service.py    # Telegram 通知
│   │   └── guardian_news_service.py     # Guardian 新聞
│   ├── agents/
│   │   ├── scraper_agent.py       # 爬蟲 Agent
│   │   └── analyzer_agent.py      # 分析 Agent
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── app/
│   │   ├── page.tsx               # 主儀表板頁面
│   │   └── layout.tsx
│   ├── components/
│   │   ├── StockList.tsx          # 左側股票列表
│   │   ├── GeneralSection.tsx      # 右側主選項卡 (圖表、新聞、技術、財務)
│   │   ├── AnalysisSection.tsx     # AI 分析選項卡
│   │   ├── AnalysisCard.tsx        # AI 分析卡片 (含多個變體)
│   │   ├── AlertsSection.tsx       # 警報歷史部分
│   │   ├── StockChart.tsx          # 股票走勢圖
│   │   ├── AIAnalysisSection.tsx   # AI 分析內容 (已整合入 AnalysisSection)
│   │   └── ui/
│   │       ├── NewsSection.tsx     # 新聞聚合 (NewsAPI + Guardian)
│   │       ├── RSIChart.tsx        # RSI 圖表
│   │       ├── MACDChart.tsx       # MACD 圖表
│   │       ├── BollingerBandsChart.tsx  # 布林帶
│   │       ├── MovingAveragesChart.tsx  # 移動平均線
│   │       ├── CompanyProfileCard.tsx   # 公司概覽卡片
│   │       ├── Header.tsx          # 頂部標題欄
│   │       ├── ThemeToggle.tsx     # 深色模式切換
│   │       └── LanguageToggle.tsx  # 語言切換
│   ├── lib/
│   │   ├── api.ts                 # API 客戶端
│   │   ├── types.ts               # TypeScript 型別定義
│   │   ├── hooks/                 # React Hooks
│   │   │   ├── useStocks.ts        # 股票列表
│   │   │   ├── useNews.ts          # NewsAPI 新聞
│   │   │   ├── useGuardianNews.ts  # Guardian 新聞
│   │   │   ├── useStockHistory.ts  # 股票走勢
│   │   │   ├── useAnalysis.ts      # AI 分析 (含智能緩存)
│   │   │   ├── useTechnicalIndicators.ts  # 技術指標
│   │   │   └── useCompanyFinancials.ts    # 公司財務
│   │   └── language-context.tsx   # 語言上下文
│   └── package.json
├── CLAUDE.md                      # 開發指南
├── README.md                      # 本文件
└── .env                           # 環境變數 (不提交)
```

---

## 🛠️ 開發指南

詳見 [CLAUDE.md](CLAUDE.md)

### 主要約定
- **Python**: snake_case 函數、PascalCase 類別
- **TypeScript**: camelCase 變數、PascalCase 組件
- **API**: RESTful 設計，統一 response 格式
- **Git**: 功能完成後 push，用戶審核後再合併

---

## 🔍 故障排除

### 端口已被佔用
```bash
# 殺死佔用 8000 的進程
lsof -i :8000
kill -9 <PID>

# 或使用不同端口
python3 -m uvicorn backend.main:app --port 8001
```

### API 限流
- NewsAPI: 100 請求/天，超過需等待重置
- Alpha Vantage: 5 請求/分鐘 (免費層)，已實現自動快取 & 重試
- Finnhub: 無限制，最佳選擇

### 數據為 null
- 檢查 API key 是否正確
- 確認 API 限額未超
- 查看後端日誌: `tail -f backend.log`

---

## 📄 許可證

MIT

---

## 📧 聯繫

如有問題或建議，請提交 Issue 或 Pull Request。

**最後更新**: 2026-04-05 (Day 8 技術指標完成、新聞部分修復)
