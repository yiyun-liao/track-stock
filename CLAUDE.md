# AI 美股監控系統

## 專案概覽

自動追蹤美股的監控系統，整合即時股價、AI 新聞摘要、自動警報通知與視覺化 Dashboard。

**技術棧**
- 後端：FastAPI + yfinance + NewsAPI + Guardian + Finnhub + Alpha Vantage
- 前端：Next.js + TailwindCSS
- AI：Claude API（並行分析）
- 通知：Telegram Bot

**目錄結構**
```
track-stock/
├── backend/
│   ├── agents/          # ScraperAgent, AnalyzerAgent
│   ├── services/        # 各資料源 Service
│   ├── api/             # FastAPI 端點
│   └── main.py
├── frontend/
│   ├── app/             # Next.js App Router
│   ├── components/      # UI + Section 組件
│   └── lib/             # hooks, api, types
├── docs/                # 參考文件（給人看）
└── .claude/             # AI 控制中心
    ├── rules/           # AI 自動讀取的規則
    └── commands/        # /project: 自訂指令
```

## AI 規則索引（.claude/rules/）

| 檔案 | 內容 |
|-----|------|
| `investment-philosophy.md` | 選股哲學，AnalyzerAgent 分析時的思維框架 |
| `code-style.md` | 命名規範、Git 流程、協作約定 |
| `api-conventions.md` | API 設計、快取策略、錯誤隔離 |
| `frontend-architecture.md` | 組件分類、Hook 規範、數據流 |
| `agent-guidelines.md` | React 反模式庫、代碼審查清單 |
| `scoring-reference.md` | 股票評分系統的權重與標準 |

## 自訂指令（.claude/commands/）

| 指令 | 用途 |
|-----|------|
| `/project:review-day` | 整理今日開發成果，輸出結構化日誌 |
| `/project:analyze-stock [SYMBOL]` | 按投資哲學框架分析個股 |
| `/project:debug-api` | 診斷 API 問題，快速定位服務狀態 |

---

## 目前狀態（Day 8 完成）

**已完成（Day 1-8）**
- ✅ 股價 / 新聞資料串接（yfinance、NewsAPI、Guardian）
- ✅ ScraperAgent + AnalyzerAgent（並行 Claude API 呼叫）
- ✅ Telegram Bot 三種通知格式
- ✅ Next.js Dashboard（走勢圖、新聞、警報、AI 分析）
- ✅ 前後端整合、錯誤處理、Dark Mode、多語言
- ✅ Finnhub 財務三表 + Alpha Vantage 公司概覽
- ✅ 技術指標面板（RSI、MA20/50/200）
- ✅ 股票評分系統（技術面 35% + 基本面 45% + 情緒面 20%）

**已知限制**
- MACD & 布林帶需 Alpha Vantage 付費升級（框架已就位）
- AnalyzerAgent prompt 尚未注入財務指標資料（Day 9 優先處理）

## 下一步（Day 9）

- [ ] 將 investment-philosophy 注入 AnalyzerAgent system prompt
- [ ] 把 P/E、RSI、EPS 趨勢傳進 investment_advice prompt
- [ ] Telegram Bot 互動問答（`/ask`、`/analyze`）
- [ ] RAG 知識庫：docs/ 向量化，支援自然語言查詢

---

**最後更新**：2026-04-10
