'use client'

import { ChevronDown, TrendingUp, TrendingDown } from 'lucide-react'
import type { Stock } from '@/lib/types'

interface StockListProps {
  stocks: Stock[]
  selectedStock: string
  onSelectStock: (symbol: string) => void
  loading: boolean
}

export default function StockList({
  stocks,
  selectedStock,
  onSelectStock,
  loading,
}: StockListProps) {
  const getTrendIcon = (change_pct: number) => {
    return change_pct >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    )
  }

  const getTrendColor = (change_pct: number) => {
    return change_pct >= 0 ? 'text-green-700' : 'text-red-700'
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col h-full">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex-shrink-0">
        <h2 className="text-lg font-semibold text-slate-900">📊 Tracked Stocks</h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="divide-y divide-slate-200">
        {loading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : !Array.isArray(stocks) || stocks.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-500">
              {!Array.isArray(stocks) ? 'Failed to load stocks' : 'No stocks tracked yet'}
            </p>
            <p className="text-xs text-slate-400 mt-2">Make sure the backend is running on http://localhost:8000</p>
          </div>
        ) : (
          stocks.map((stock) => (
            <button
              key={stock.symbol}
              onClick={() => onSelectStock(stock.symbol)}
              className={`w-full px-6 py-4 text-left transition-colors ${
                selectedStock === stock.symbol
                  ? 'bg-blue-50 border-l-4 border-blue-600'
                  : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Left: Symbol & Name */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900">
                    {stock.symbol}
                  </div>
                  <div className="text-xs text-slate-500">
                    Stock Price
                  </div>
                </div>

                {/* Right: Price & Change */}
                <div className="text-right">
                  <div className="font-semibold text-slate-900">
                    ${stock.price.toFixed(2)}
                  </div>
                  <div className={`flex items-center justify-end gap-1 text-sm font-medium ${getTrendColor(stock.change_pct)}`}>
                    {getTrendIcon(stock.change_pct)}
                    <span>
                      {stock.change > 0 ? '+' : ''}
                      {stock.change.toFixed(2)} ({stock.change_pct.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 text-center flex-shrink-0">
        <p className="text-xs text-slate-500">
          {stocks.length} stocks • Auto-refresh every 30s
        </p>
      </div>
    </div>
  )
}
