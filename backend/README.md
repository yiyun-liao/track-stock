# Track Stock - Backend API Server

FastAPI-based backend for AI-powered stock tracking system with real-time data, AI analysis, and Telegram notifications.

## Tech Stack

- **Framework**: FastAPI (async Python framework)
- **Server**: Uvicorn (ASGI server)
- **Task Scheduling**: APScheduler (cron-based scheduling)
- **Notifications**: python-telegram-bot
- **AI Analysis**: Anthropic Claude API
- **Data Sources**: yfinance, NewsAPI
- **Database**: SQLite (development) → PostgreSQL (production-ready)
- **Type Hints**: Full Python type annotations

## Architecture

### Three-Layer Design

```
┌─────────────────────────────────────────┐
│      FastAPI REST Endpoints             │ Layer 1: API
│  /stocks, /news, /analysis, /alerts     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│    Agent Layer (Orchestration)          │ Layer 2: Agents
│  ScraperAgent  │  AnalyzerAgent        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Services Layer (Data Access)       │ Layer 3: Services
│  Stock  │  News  │  Telegram  │ Format  │
└─────────────────────────────────────────┘
               │
        ┌──────┴──────┬─────────┬────────┐
        ▼             ▼         ▼        ▼
    yfinance    NewsAPI   Telegram   Claude
```

## Components

### Services (Layer 3)

#### StockService
Manages stock price data from yfinance.

```python
from services.stock_service import StockService

stock_service = StockService()

# Get latest prices
stocks = stock_service.fetch_latest_price(["AAPL", "MSFT"])
# → [{"symbol": "AAPL", "price": 255.63, "change": 1.84, ...}]

# Get historical data
history = stock_service.fetch_historical_data("AAPL", "1mo")
# → [{"date": "2026-03-02", "price": 240.50}, ...]
```

**Methods:**
- `fetch_latest_price(symbols: list) → list` - Get current prices
- `fetch_historical_data(symbol: str, period: str) → list` - Historical data

**Supported Periods:** 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max

#### NewsService
Fetches financial news from NewsAPI.

```python
from services.news_service import NewsService

news_service = NewsService(api_key="your-newsapi-key")

# Get news by keywords
news = news_service.fetch_news(["Apple stock", "AAPL earnings"])
# → {"news": [{"title": "...", "source": "...", "url": "..."}]}

# Get news for multiple stocks
stock_news = news_service.fetch_stock_news(["AAPL", "MSFT"], max_articles_per_symbol=5)
```

**Methods:**
- `fetch_news(keywords: list, max_articles: int) → dict`
- `fetch_stock_news(symbols: list, max_articles_per_symbol: int) → dict`

#### TelegramService
Sends notifications via Telegram Bot.

```python
from services.telegram_service import TelegramService

telegram_service = TelegramService(
    bot_token="your-bot-token",
    chat_id="your-chat-id"
)

# Send text message
result = telegram_service.send_message("Stock alert: AAPL +2.5%")

# Send photo with caption
result = telegram_service.send_photo(
    photo_url="https://...",
    caption="Market chart"
)

# Verify bot connection
me = telegram_service.get_me()  # → {"bot_name": "...", "bot_id": "..."}
```

**Methods:**
- `send_message(text: str, chat_id: str, parse_mode: str) → dict`
- `send_photo(photo_url: str, caption: str, chat_id: str) → dict`
- `get_me() → dict`

#### NotificationFormatter
Formats messages for different notification types.

```python
from services.notification_formatter import NotificationFormatter

formatter = NotificationFormatter()

# Format A: Price alert
alert = formatter.format_price_alert("AAPL", 255.63, 2.5, 35595400)
# → HTML formatted message

# Format B: News summary
news_msg = formatter.format_news_summary("AAPL", [articles...])

# Format C: Complete analysis
analysis = formatter.format_complete_analysis("AAPL", 255.63, 2.5, summary)
```

**Three Notification Formats:**
- **Format A**: Price movement alert (simple)
- **Format B**: News with links and sources
- **Format C**: Complete end-of-day report

### Agents (Layer 2)

#### ScraperAgent
Orchestrates data collection from StockService and NewsService.

```python
from agents.scraper_agent import ScraperAgent

scraper = ScraperAgent(stock_service, news_service)

result = scraper.execute(["AAPL", "MSFT"])
# → {
#     "timestamp": "2026-04-02T10:00:00Z",
#     "symbols": ["AAPL", "MSFT"],
#     "stocks": {...},
#     "news": {...}
#   }
```

**Methods:**
- `execute(symbols: list) → dict` - Collect all data for symbols
- `get_stock_data() → dict` - Internal: fetch stock data
- `get_news_data() → dict` - Internal: fetch news data

#### AnalyzerAgent
Performs AI analysis using Claude API.

```python
from agents.analyzer_agent import AnalyzerAgent

analyzer = AnalyzerAgent(claude_api_key="your-claude-key")

scraper_result = scraper.execute(["AAPL"])
analysis = analyzer.execute(scraper_result)
# → {
#     "status": "success",
#     "analysis": {
#       "AAPL": {
#         "news_summary": "...",
#         "price_alert": "...",
#         "investment_advice": "..."
#       }
#     }
#   }
```

**Three Analysis Methods:**
- `_analyze_news(symbol, news_data)` - Summarize news articles
- `_generate_price_alert(symbol, stock_data)` - Analyze price movements
- `_generate_investment_advice(symbol, stock_data, news_summary)` - Investment recommendation

**Configuration Constants:**
```python
ANALYZER_CONFIG = {
    "model": "claude-sonnet-4-6",
    "max_tokens": 500,
    "max_articles": 5,
}

CLAUDE_PROMPTS = {
    "news_analysis": "Analyze these news articles...",
    "price_analysis": "Analyze this price movement...",
    "investment_advice": "Give investment advice based on...",
}
```

### Task Scheduling (SchedulerManager)

Automated scheduling with APScheduler (Taiwan timezone).

```python
from services.scheduler_manager import SchedulerManager

scheduler = SchedulerManager()

# Schedule stock price updates (3 times daily)
scheduler.schedule_stock_price_updates(callback, ["AAPL", "MSFT"])

# Schedule news updates (3 times daily)
scheduler.schedule_news_updates(callback, ["AAPL", "MSFT"])

# Schedule analysis job (after market close)
scheduler.schedule_analysis_job(callback, ["AAPL", "MSFT"])
```

**Default Schedule (Taiwan Time):**
```python
SCHEDULE_CONFIG = {
    # Stock Price Updates
    "stock_open": "22:30",      # EST 09:30 (previous day)
    "stock_intraday": "01:00",  # EST 12:00 (next day)
    "stock_close": "05:00",     # EST 16:00 (next day)

    # News Updates
    "news_before_open": "21:30",
    "news_intraday": "01:00",
    "news_after_close": "06:00",

    # Analysis
    "analysis_after_close": "06:05",
}
```

## API Endpoints

### Stock Endpoints

**Get Latest Stock Prices**
```
GET /api/stocks
Response: {
  "success": true,
  "data": [
    {"symbol": "AAPL", "price": 255.63, "change": 1.84, "change_pct": 0.73, ...}
  ],
  "timestamp": "2026-04-02T10:00:00Z"
}
```

**Get Stock Price History**
```
GET /api/stocks/{symbol}/history?period=1mo
Response: {
  "success": true,
  "data": {
    "symbol": "AAPL",
    "prices": [
      {"date": "2026-03-02", "price": 240.50},
      {"date": "2026-03-03", "price": 242.10}
    ]
  }
}
```

### News Endpoints

**Get Latest News**
```
GET /api/news?symbol=AAPL
Response: {
  "success": true,
  "data": [
    {
      "title": "Article Title",
      "description": "Summary",
      "source": "Reuters",
      "url": "https://...",
      "published_at": "2026-04-02T10:00:00Z"
    }
  ]
}
```

### Analysis Endpoints

**Get AI Analysis for Stock**
```
GET /api/analysis/{symbol}
Response: {
  "success": true,
  "data": {
    "symbol": "AAPL",
    "news_summary": "Recent news indicates...",
    "price_alert": "Price moved up 2.5%...",
    "investment_advice": "Consider buying...",
    "timestamp": "2026-04-02T10:00:00Z"
  }
}
```

### Alert Endpoints

**Get Alert History**
```
GET /api/alerts
Response: {
  "success": true,
  "data": {
    "alerts": []
  }
}
```

### System Endpoints

**Get System Status**
```
GET /api/status
Response: {
  "success": true,
  "status": "running",
  "timestamp": "2026-04-02T10:00:00Z",
  "version": "0.1.0"
}
```

**Send Telegram Notification**
```
POST /api/notify/telegram
Body: {
  "message": "Stock alert...",
  "chat_id": "optional-override"
}
```

## Setup

### Prerequisites
- Python 3.8+
- pip or conda
- API Keys:
  - NewsAPI key from https://newsapi.org
  - Claude API key from https://console.anthropic.com
  - Telegram Bot token from @BotFather

### Installation

```bash
# 1. Clone repository
cd backend

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create .env file
cp .env.example .env

# 5. Configure API keys in .env
# Add your keys: CLAUDE_API_KEY, NEWS_API_KEY, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
```

### Environment Variables

Create `.env` file with:
```env
# Stock Data
YFINANCE_API_KEY=optional

# News Data
NEWS_API_KEY=your-newsapi-key

# AI Analysis
CLAUDE_API_KEY=your-claude-api-key

# Telegram Notifications
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id

# Server
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
DEBUG=False

# Database
DATABASE_URL=sqlite:///./stock_data.db

# Tracked Symbols
TRACKED_SYMBOLS=AAPL,MSFT,TSLA,GOOGL,AMZN
```

## Running the Server

### Development Mode
```bash
# Run with hot reload
python main.py

# Or with uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode
```bash
# Run with production settings
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### With Docker
```bash
docker build -t track-stock-backend .
docker run -p 8000:8000 --env-file .env track-stock-backend
```

### Access API
- **Server**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **ReDoc**: http://localhost:8000/redoc

## Testing

### Test Files

**test_day1.py** - Data Services Testing
```bash
python test_day1.py
```
Tests:
- StockService: fetch latest and historical data
- NewsService: fetch and aggregate articles
- Data format validation

**test_day2.py** - Agent Testing
```bash
python test_day2.py
```
Tests:
- ScraperAgent: data collection
- AnalyzerAgent: Claude API analysis
- Complete flow integration

**test_day3.py** - Telegram & Scheduling
```bash
python test_day3.py
```
Tests:
- TelegramService: bot connection
- NotificationFormatter: three message formats
- SchedulerManager: cron job scheduling
- End-to-end notification flow

**test_telegram_send.py** - Manual Telegram Test
```bash
python test_telegram_send.py
```
Tests actual Telegram message sending (requires valid credentials)

### Running Tests
```bash
# Run all tests
python test_day1.py && python test_day2.py && python test_day3.py

# Run specific test
python test_day1.py

# With verbose output
python -v test_day1.py
```

## Configuration & Customization

### Change Tracked Symbols
Edit `main.py`:
```python
CONFIG = {
    "stock_symbols": ["AAPL", "MSFT", "TSLA", "GOOGL"],
    ...
}
```

### Modify Schedule Times
Edit `services/scheduler_manager.py`:
```python
SCHEDULE_CONFIG = {
    "stock_open": "22:30",
    "stock_intraday": "01:00",
    ...
}
```

### Customize AI Prompts
Edit `agents/analyzer_agent.py`:
```python
CLAUDE_PROMPTS = {
    "news_analysis": "Your custom prompt...",
    ...
}
```

### Change Notification Templates
Edit `services/notification_formatter.py`:
```python
MESSAGES = {
    "price_alert": "Your custom template...",
    ...
}
```

## Database

### Current Setup (Day 4)
- SQLite for development
- In-memory data structures (Agents, Services)

### For Day 5+
- SQLAlchemy ORM models already included
- Migration path to PostgreSQL
- Alert persistence needed

### Models (models/database.py)
Ready for:
- Stock data history
- Alert records
- News cache
- User preferences

## Performance Considerations

### Rate Limiting
- yfinance: Built-in rate limiting (120 requests/min)
- NewsAPI: 100 requests/day free tier
- Claude API: Adapt to available quota

### Caching Strategy
- Scraper results cached per request
- News cached for 1 hour
- Stock prices cached for 5 minutes

### Optimization (Day 5+)
- Redis for distributed caching
- Database indexes on frequently queried columns
- Batch API requests where possible

## Troubleshooting

### Issue: "API key not found"
```
Solution: Verify CLAUDE_API_KEY is set in .env
```

### Issue: "Telegram bot not responding"
```
Solution:
1. Verify TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env
2. Run test_telegram_send.py to test connection
3. Ensure bot has been added to chat
```

### Issue: "yfinance rate limited"
```
Solution: This is normal behavior - yfinance auto-retries
Tests mock this gracefully
```

### Issue: "NewsAPI quota exceeded"
```
Solution: Upgrade NewsAPI plan or reduce update frequency
Edit SCHEDULE_CONFIG in scheduler_manager.py
```

## Development Notes

### Code Quality
- Full type hints (Python 3.8+)
- Dependency injection pattern
- Constants extracted to CONFIG dicts
- Error handling with try/except

### Testing Strategy
- Unit tests for services
- Integration tests for agents
- End-to-end tests for scheduler and Telegram
- Mock external API responses

### Git Workflow
- Feature branches for new features
- Commits before main branch push
- CLAUDE.md tracks high-level progress

## Architecture Decisions

### Why Agents?
- Encapsulate complex workflows
- Reusable building blocks for video-coding
- Clear input/output contracts
- Easy to extend and combine

### Why FastAPI?
- Async support for concurrent requests
- Automatic API documentation
- Type hints with Pydantic validation
- Perfect for building scalable APIs

### Why APScheduler?
- Cron-based scheduling
- Timezone support (important for market hours)
- Flexible job triggers
- Easy to test

### Why Three Services?
- Single responsibility principle
- Easy to test independently
- Reusable across different workflows
- Clear separation of concerns

## Next Steps (Day 5+)

- [ ] Database persistence for alerts
- [ ] WebSocket support for real-time updates
- [ ] User authentication and preferences
- [ ] Advanced error recovery
- [ ] Metrics and monitoring
- [ ] GraphQL API (optional)

---

**Status**: ✅ Day 4 Complete - Core backend ready for integration
**Last Updated**: 2026-04-02
**Next**: Day 5 - Full integration testing and DB persistence
