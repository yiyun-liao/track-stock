# AI 美股監控系統

## 專案背景
建立一個自動追蹤美股的監控系統，整合實時股價資料、AI 新聞摘要、自動警報通知，及視覺化 Dashboard，幫助投資者快速掌握市場動態。

## 技術選型

### 資料來源
- **股價資料**：yfinance（實時報價、歷史走勢）
- **新聞資料**：NewsAPI（財經新聞爬取）
- **AI 摘要**：Claude API（新聞智能總結）

### 後端
- **框架**：FastAPI（Python 非同步框架）
- **排程**：APScheduler（定時任務執行）
- **通知**：python-telegram-bot（Telegram 機器人）
- **資料庫**：SQLite（開發環境），可升級至 PostgreSQL（生產環境）

### 前端
- **框架**：Next.js（React SSR）
- **樣式**：TailwindCSS（Utility-first CSS）
- **圖表**：可考慮 Recharts 或 Chart.js

## 文件夾結構規範

```
track-stock/
├── backend/
│   ├── agents/
│   │   ├── scraper_agent.py      # 股價/新聞爬蟲 Agent
│   │   └── analyzer_agent.py      # AI 分析 Agent
│   ├── services/
│   │   ├── stock_service.py       # 股票數據處理
│   │   ├── news_service.py        # 新聞數據處理
│   │   └── telegram_service.py    # Telegram 通知
│   ├── models/
│   │   └── database.py            # ORM 模型（SQLAlchemy）
│   ├── api/
│   │   ├── stocks.py              # 股票 API 端點
│   │   ├── alerts.py              # 警報 API 端點
│   │   └── reports.py             # 報告 API 端點
│   ├── config.py                  # 配置（API keys、排程設定）
│   ├── main.py                    # FastAPI 應用入口
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── app/
│   │   ├── page.tsx               # 主頁面
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── stocks/
│   │   │   ├── alerts/
│   │   │   └── news/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── StockChart.tsx
│   │   ├── StockList.tsx
│   │   ├── AlertCard.tsx
│   │   └── NewsCard.tsx
│   ├── lib/
│   │   └── api.ts                 # API 客戶端
│   ├── package.json
│   └── .env.local.example
├── CLAUDE.md                       # 此文件：專案開發指南
├── README.md                       # 用戶文檔
└── .gitignore
```

## 開發慣例

### 命名規範
- Python：snake_case（函數、變數）、PascalCase（類別）
- TypeScript/JavaScript：camelCase（變數、函數）、PascalCase（組件、類別）
- 檔案名：snake_case（Python）、kebab-case（TypeScript 組件）

### 代碼組織
- **單一責任**：每個模塊負責明確的單一功能
- **依賴注入**：避免強耦合，便於測試
- **型別提示**：Python 用 type hints，TypeScript 確保完整型別

### API 設計
- 使用 RESTful 端點
- 統一的 response 格式：`{ "success": bool, "data": {...}, "error": "..." }`
- 版本前綴（可選）：`/api/v1/...`

### 環境變數
- 敏感資訊（API keys、DB URL）放在 `.env` 檔案
- 每個模塊的 `.env.example` 記錄所需變數

## 協作約定

### 需求與輸出格式
按照用戶學習目標進行協作：
1. **輸入**：明確的目標、輸入格式、預期輸出格式
2. **流程**：用戶給目標而不是步驟，我自主規劃執行方式
3. **Review**：用戶代碼後進行結構問題審查，再繼續
4. **Debug**：提供目標、輸入、預期輸出、實際輸出
5. **主動補充**：若需求不清楚，我會主動要求補充 context

### Git 工作流
- **分支與提交**：完成功能後，先展示 `git diff` 供用戶審查
- **不自動推送**：在用戶確認前，不執行 `git add` 和 `git push`
- **用戶主導**：用戶確認無誤後，再由我執行提交和推送

### 代碼質量
- 提交前確保代碼可運行
- 新功能配合測試（至少基本測試）
- 避免過度設計，按需求實現

### 學習重點：Video-Coding Skills
此專案的核心目標是學習「video-coding」技能：
1. **Prompt Engineering**：透過這個專案學習如何清晰地定義需求、編寫有效的提示詞
2. **Skill 開發**：將可重用的工作流（如爬蟲、分析、通知）設計成可複用的 Skill
3. **AI Agent 建立**：設計和實現自主決策的 Agent（如 Scraper Agent、Analyzer Agent）

因此在代碼審查時，重點關注：
- 函數/模塊是否易於抽象成 Skill？
- Agent 的責任邊界是否清晰？
- 是否有良好的輸入/輸出契約便於集成？

## 進度規劃（9 天）

| 日期 | 目標 | 輸出物 |
|------|------|--------|
| **第一階段：核心系統（Day 1-3）** |
| Day 1 | 環境設定、yfinance & NewsAPI 串接 | 資料格式驗證、API 測試 script |
| Day 2 | Scraper & Analyzer Agent 實作 | Agent 模組可運行 |
| Day 3 | Telegram Bot、排程、三種通知格式 | Bot 可接收和發送通知 ✅ |
| **第二階段：前端 & 整合（Day 4-6）** |
| Day 4 | 前端 Dashboard（走勢圖、清單、新聞、警報） | Next.js 前端完整頁面 ✅ |
| Day 5 | 前後端整合、完整流程測試、錯誤處理 | 可運行的端到端流程 |
| Day 6 | UI 優化、效能調整、代碼 review | 生產級代碼質量 |
| **第三階段：數據擴展（Day 7-8）** |
| Day 7 | 接多個新聞 API（Guardian, Reuters, Financial Times）、企業財務資料 | 豐富的新聞和財務數據 |
| Day 8 | 技術指標面板（RSI, MACD, 移動平均線）、股票評分系統 | 專業級數據可視化 |
| **第四階段：AI 增強 & 部署（Day 9-10）** |
| Day 9 | 訓練 AI 股市分析模型、Bot 互動問答 | AI 模型可回答股市問題 |
| Day 10 | Bot 進階功能、知識庫、使用者反饋、系統部署 | 生產級 AI 助手 |

---

## Day 7-8 詳細計劃：數據擴展

### Day 7：多重新聞 API & 企業財務資料

**目標**：整合多個高質量新聞來源和財務資料

**功能**：
- 📰 **多源新聞聚合**
  - Guardian API（獨立新聞）
  - Reuters API（財經專業）
  - Financial Times API（深度分析）
  - 去重和智能排序

- 💰 **企業財務資料**
  - P/E 比率、市值、股息率
  - 收益、營收、獲利率
  - 負債率、ROE、ROA
  - 與同業比較

- 🎯 **智能篩選**
  - 相關性評分
  - 情感分析（正負面）
  - 重要性標記

**輸出**：專業級數據儀表板

### Day 8：技術指標 & 股票評分系統

**目標**：提供技術分析和投資評分

**功能**：
- 📊 **技術指標**
  - RSI（相對強弱指數）
  - MACD（移動平均收斂散度）
  - 移動平均線（MA 20, 50, 200）
  - 布林帶 (Bollinger Bands)

- ⭐ **股票評分系統**
  - 綜合評分（1-10 分）
  - 技術面評分
  - 基本面評分
  - 買賣信號

- 📈 **專業級可視化**
  - K 線圖表
  - 指標疊加
  - 交易量分析
  - 價格預測

**輸出**：機構級投資分析工具

## Day 9-10 詳細計劃：AI 增強 & 部署

### Day 9：AI 股市分析模型 & Bot 互動

**目標**：建立 AI 助手能回答股市相關問題

**功能**：
- 📚 **知識庫構建**
  - 從分析結果建立知識庫
  - 股市術語、指標解釋
  - 常見投資問題

- 🤖 **Bot 互動功能**
  - `/ask <問題>` - 提問股市相關問題
  - `/analyze <股票>` - 詳細分析特定股票
  - `/compare <股票1> <股票2>` - 對比兩支股票
  - `/advice <投資目標>` - 獲得投資建議

- 🧠 **AI 模型微調**
  - 使用 Claude API 搭配知識庫 (RAG)
  - 上下文感知的回答
  - 自信度評估

**輸出**：Bot 可回答股市問題，精準度 > 85%

### Day 10：Bot 進階功能 & 知識庫管理 & 部署

**目標**：完整的 AI 助手系統和生產部署

**功能**：
- 📖 **知識庫管理**
  - 動態更新知識庫
  - 用戶反饋迴圈
  - 錯誤糾正機制

- 💬 **對話記憶**
  - 保存聊天歷史
  - 多輪對話支援
  - 個人化回應

- 🚀 **系統部署**
  - 容器化 (Docker)
  - CI/CD 流程
  - 監控和告警
  - 性能優化

**輸出**：生產級 AI 股市助手系統

---

**最後更新**：2026-04-02
