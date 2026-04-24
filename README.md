# Track Stock -- AI-Powered Stock Monitoring System

## Problem

Retail investors face fragmented tooling: stock prices live in one app, financial news in another, technical indicators in a third, and AI-generated analysis nowhere integrated. Switching between tools wastes time and makes it hard to form a holistic view of any single stock.

## Solution

A unified monitoring dashboard that pulls real-time prices, financial statements, technical indicators, and news into one view -- then layers AI-powered analysis on top. The system scores each stock across three dimensions (technical, fundamental, sentiment) and surfaces actionable trading signals without requiring the user to context-switch.

---

## How It Works

```
                          +------------------+
                          |   Next.js 14     |
                          |   Dashboard      |
                          |  (port 3000)     |
                          +--------+---------+
                                   |
                              REST API calls
                                   |
                          +--------v---------+
                          |    FastAPI        |
                          |   Backend         |
                          |  (port 8000)      |
                          +--------+---------+
                                   |
              +--------------------+--------------------+
              |          |         |         |          |
         +----v---+ +---v----+ +-v------+ +-v-------+ +v---------+
         |yfinance| |NewsAPI | |Finnhub | |Alpha    | |Claude API|
         |        | |        | |        | |Vantage  | |          |
         +--------+ +--------+ +--------+ +---------+ +----------+
          Prices     News       Financial   Technical   AI Analysis
          History    Articles   Statements  Indicators  Summaries
```

1. **Data collection** -- The backend fetches from five external APIs with per-source caching (5 min for prices, 30 min for news, 24 hr for company profiles) and exponential backoff retry on failures.
2. **Scoring engine** -- Each stock receives a composite score: technical (35%) + fundamental (45%) + sentiment (20%), computed from RSI, P/E, ROE, debt ratio, and news sentiment.
3. **AI analysis** -- Claude API generates investment analysis per stock, with parallel API calls for multi-stock scenarios.
4. **Frontend rendering** -- Next.js dashboard with tab-based navigation (chart, news, technicals, financials, AI analysis, scoring), dark mode, and Chinese/English toggle.
5. **Notifications** -- Telegram bot pushes price alerts, news summaries, and full analysis reports.

---

## Key Design Decisions

**Error isolation over fail-fast.**
Critical APIs (stock prices) block the UI on failure. Optional APIs (company profile, Guardian news) degrade gracefully with yellow warnings. Each API call has its own try-catch -- a single failing source never takes down the whole dashboard.

**Frontend data flow: lift state, pass props.**
All data-fetching hooks (`useStocks`, `useAnalysis`, etc.) are called at the Dashboard level and passed as props. This eliminates duplicate API calls that would occur if child components each fetched independently. The pattern is enforced by splitting components into `ui/` (zero data hooks) and `sections/` (business logic containers).

**Multi-layer caching with per-source TTL.**
Stock prices cache for 5 minutes (volatile), technical indicators for 1 hour (compute-heavy, slow-changing), company info for 24 hours (near-static). Cache checks happen before any API call -- if cached data is fresh, the request is skipped entirely, preserving free-tier API quotas.

**Composite scoring instead of single-metric ranking.**
A single metric (e.g., P/E alone) misleads. The system weights fundamentals highest (45%) because long-term stock prices track earnings. Technical indicators (35%) help with timing. Sentiment (20%) captures short-term momentum but is down-weighted to avoid overreacting to news cycles.

**Lazy tab loading.**
Tabs for technical indicators, financials, and scoring only fetch data when the user clicks into them. This avoids wasting API quota on data the user may never look at, and reduces initial load time.

---

## Tech Stack

| Layer     | Technology                                           |
|-----------|------------------------------------------------------|
| Frontend  | Next.js 14, React 18, TypeScript, TailwindCSS, Recharts |
| Backend   | FastAPI, Python, yfinance, pandas                    |
| AI        | Claude API (parallel analysis, news summarization)   |
| Data APIs | Finnhub (financials), Alpha Vantage (technicals), NewsAPI |
| Alerts    | Telegram Bot API                                     |

---

## Project Structure

```
track-stock/
├── backend/
│   ├── main.py                          # FastAPI app, all REST endpoints
│   ├── agents/
│   │   ├── scraper_agent.py             # Orchestrates data collection
│   │   └── analyzer_agent.py            # Claude API analysis with parallel calls
│   ├── services/
│   │   ├── stock_service.py             # yfinance: prices, history
│   │   ├── news_service.py              # NewsAPI integration
│   │   ├── guardian_news_service.py      # Guardian News API
│   │   ├── finnhub_service.py           # Financial statements (income, balance, cash flow)
│   │   ├── alpha_vantage_service.py     # Technical indicators (RSI, MA)
│   │   ├── stock_scoring_service.py     # 3-dimension composite scoring
│   │   ├── technical_indicator_calculator.py  # RSI/MA calculation from price data
│   │   ├── telegram_service.py          # Telegram bot notifications
│   │   └── notification_formatter.py    # Alert message formatting
│   ├── config/
│   │   └── scoring_config.py            # Scoring weights and thresholds
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx                     # Dashboard: state management, data flow
│   │   ├── layout.tsx                   # Root layout with theme/language providers
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                          # Pure presentational (no data hooks)
│   │   │   ├── Header.tsx
│   │   │   ├── ToggleButton.tsx
│   │   │   └── MarkdownContent.tsx
│   │   ├── GeneralSection/              # Tabs: chart, news, technicals, financials
│   │   ├── AnalysisSection/             # AI analysis display
│   │   └── StockList.tsx                # Sidebar stock selector
│   ├── lib/
│   │   ├── hooks/                       # Data fetching (useStocks, useAnalysis, etc.)
│   │   ├── api.ts                       # Centralized API client
│   │   ├── types.ts                     # Shared TypeScript types
│   │   ├── language-context.tsx         # i18n (zh-TW / en)
│   │   └── theme-context.tsx            # Dark/light mode
│   └── package.json
│
├── .env.example                         # Required environment variables
└── .gitignore
```

---

## Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- API keys: NewsAPI, Finnhub (free), Alpha Vantage (free), Claude API

### Install

```bash
# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env
# Fill in API keys in .env

# Frontend
cd ../frontend
npm install
```

### Run

```bash
# Terminal 1 -- backend (port 8000)
cd backend
python3 main.py

# Terminal 2 -- frontend (port 3000)
cd frontend
npm run dev
```

Open `http://localhost:3000`.

---

## API Endpoints

| Method | Endpoint                              | Description                        |
|--------|---------------------------------------|------------------------------------|
| GET    | `/api/stocks`                         | Real-time prices for tracked stocks |
| GET    | `/api/stocks/{symbol}/history`        | 30-day price history               |
| GET    | `/api/news`                           | Aggregated financial news          |
| GET    | `/api/news/guardian/{symbol}`         | Guardian news for a symbol         |
| GET    | `/api/analysis/{symbol}`              | AI-generated investment analysis   |
| GET    | `/api/financials/profile/{symbol}`    | Company profile (CEO, market cap)  |
| GET    | `/api/financials/income/{symbol}`     | Income statement                   |
| GET    | `/api/financials/balance/{symbol}`    | Balance sheet                      |
| GET    | `/api/financials/cash-flow/{symbol}`  | Cash flow statement                |
| GET    | `/api/indicators/technical/{symbol}`  | RSI, MA20/50/200                   |
| GET    | `/api/scoring/comprehensive/{symbol}` | Composite score (tech/fund/sent)   |

---

## Environment Variables

```
# Required
NEWS_API_KEY=           # newsapi.org
FINNHUB_API_KEY=        # finnhub.io (free, unlimited)
ALPHA_VANTAGE_API_KEY=  # alphavantage.co (free, 25 req/day)
CLAUDE_API_KEY=         # anthropic.com

# Optional
TELEGRAM_BOT_TOKEN=     # Telegram bot for alerts
TELEGRAM_CHAT_ID=       # Telegram chat to receive alerts
GUARDIAN_API_KEY=        # Guardian news (supplementary)
```

---

## License

MIT
