'use client'

import { memo, useMemo } from 'react'
import { ChevronDown, TrendingUp, TrendingDown } from 'lucide-react'
import type { Stock } from '@/lib/types'

interface StockListProps {
  stocks: Stock[]
  selectedStock: string
  onSelectStock: (symbol: string) => void
  loading: boolean
}

function StockListComponent({
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
    return change_pct >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden flex flex-col h-full transition-colors duration-200">
      <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 px-6 py-4 flex-shrink-0">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">📊 Tracked Stocks</h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {loading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-700" />
            ))}
          </div>
        ) : !Array.isArray(stocks) || stocks.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {!Array.isArray(stocks) ? 'Failed to load stocks' : 'No stocks tracked yet'}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-400 mt-2">Make sure the backend is running on http://localhost:8000</p>
          </div>
        ) : (
          stocks.map((stock, index) => (
            <button
              key={stock.symbol}
              onClick={() => onSelectStock(stock.symbol)}
              className={`w-full px-6 py-4 text-left transition-all duration-200 ease-out transform hover:scale-[1.02] ${
                selectedStock === stock.symbol
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600'
                  : 'hover:bg-slate-50 dark:bg-slate-700 dark:hover:bg-slate-700/50'
              }`}
              style={{
                animation: loading ? `fadeIn 0.3s ease-out ${index * 50}ms` : 'none',
              }}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Left: Symbol & Name */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {stock.symbol}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Stock Price
                  </div>
                </div>

                {/* Right: Price & Change */}
                <div className="text-right">
                  <div className="font-semibold text-slate-900 dark:text-white">
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
      <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 px-6 py-3 text-center flex-shrink-0">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {stocks.length} stocks • Click refresh button to update
        </p>
      </div>
    </div>
  )
}

export default memo(StockListComponent)
