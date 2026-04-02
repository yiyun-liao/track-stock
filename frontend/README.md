# Track Stock - Frontend Dashboard

Next.js-based real-time stock tracking dashboard with AI-powered analysis integration.

## Tech Stack

- **Framework**: Next.js 14 (React 18)
- **Styling**: TailwindCSS 3
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Features

### Day 4 Implementation
- 📊 **Stock List**: Real-time tracking of multiple stocks with price changes
- 📈 **Price Charts**: Interactive 30-day price history visualization
- 📰 **News Section**: Latest news articles for tracked stocks
- 🔔 **Alert System**: Price alerts, news updates, and AI analysis notifications
- 🔄 **Auto-refresh**: 30-second automatic data refresh
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
# Edit .env.local and set NEXT_PUBLIC_API_URL
```

### Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

### Development

```bash
# Start development server
npm run dev

# Open browser
open http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main dashboard page
│   └── globals.css         # Global styles
├── components/
│   ├── Header.tsx          # Page header
│   ├── StockList.tsx       # Stock list with selection
│   ├── StockChart.tsx      # Price chart visualization
│   ├── NewsSection.tsx     # News articles display
│   └── AlertsSection.tsx   # Alert history
├── lib/
│   ├── api.ts              # API client
│   └── types.ts            # TypeScript types
└── public/                 # Static assets
```

## API Integration

The dashboard communicates with the backend API at `/api`:

- `GET /api/stocks` - Get all tracked stocks
- `GET /api/stocks/:symbol/history` - Get price history (1mo default)
- `GET /api/news` - Get latest news
- `GET /api/analysis/:symbol` - Get AI analysis
- `GET /api/alerts` - Get price alerts
- `GET /api/status` - Get system status

## Component Details

### Header
- Shows project title and update timestamp
- Displays system status indicator

### StockList
- Lists all tracked stocks with real-time prices
- Click to select stock for detailed view
- Shows price change percentage and trend

### StockChart
- Displays 30-day price history
- Interactive Recharts line chart
- Shows min/max price range

### NewsSection
- Shows latest 5 articles
- Filters by selected stock
- Links to external news sources
- Displays source and publish date

### AlertsSection
- Shows alert history (price, news, analysis)
- Visual indicators for alert type
- Read/unread status tracking
- Formatted timestamps

## Performance Optimization

- Image optimization via Next.js Image component (when images are added)
- Component-level code splitting
- Automatic data refresh every 30 seconds
- Responsive design to reduce bandwidth on mobile

## Future Enhancements (Day 5+)

- Real-time WebSocket updates
- User authentication and preferences
- Custom stock watchlist management
- Advanced chart indicators (moving average, RSI, etc.)
- Export alerts as PDF
- Dark mode theme
- Mobile app version

## Known Limitations

- Chart history requires backend API endpoint
- Alert system relies on backend data persistence
- Real-time updates limited by 30-second refresh interval

## Troubleshooting

### API Connection Errors
- Verify backend is running on `http://localhost:8000`
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Backend should have CORS headers enabled

### Chart Not Loading
- Ensure `/api/stocks/:symbol/history` endpoint exists
- Check browser console for API errors
- Verify stock symbol is valid

### Styling Issues
- Run `npm install` to ensure all dependencies
- Clear Next.js cache: `rm -rf .next`
- Rebuild with `npm run build`

## Development Notes

- Uses TypeScript for type safety
- Components are server-side renderable
- API client has error handling and fallbacks
- Responsive design uses TailwindCSS breakpoints

---

**Last Updated**: 2026-04-02
**Status**: Day 4 - Frontend Dashboard Complete
