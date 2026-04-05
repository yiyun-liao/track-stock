'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useStockHistory } from '@/lib/hooks'

interface StockChartProps {
  symbol: string
  loading: boolean
}

export default function StockChart({ symbol, loading }: StockChartProps) {
  const { data: historyData, loading: chartLoading } = useStockHistory(symbol, '1mo', true)

  // Format data for display
  const data = historyData.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    price: item.price,
  }))

  if (chartLoading || loading) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <div className="h-80 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-700" />
      </div>
    )
  }

  const minPrice = data.length > 0 ? Math.min(...data.map((d) => d.price)) : 0
  const maxPrice = data.length > 0 ? Math.max(...data.map((d) => d.price)) : 100

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          📈 {symbol} Price Chart (30 Days)
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Price range: ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex h-80 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-700">
          <p className="text-slate-500 dark:text-slate-400">No chart data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
              domain={['dataMin - 5', 'dataMax + 5']}
              label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
              formatter={(value) => `$${(value as number).toFixed(2)}`}
              labelStyle={{ color: '#1f2937' }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
