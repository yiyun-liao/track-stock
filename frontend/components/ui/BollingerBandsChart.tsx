'use client'

import { memo } from 'react'
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface BollingerBandsChartProps {
  upper?: number
  middle?: number
  lower?: number
  currentPrice?: number
  loading?: boolean
}

/**
 * Bollinger Bands Chart - Volatility Analysis
 */
export const BollingerBandsChart = memo(function BollingerBandsChart({
  upper = 185.5,
  middle = 180.0,
  lower = 174.5,
  currentPrice = 182,
  loading = false,
}: BollingerBandsChartProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <div className="h-12 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-700 mb-4" />
        <div className="h-64 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
      </div>
    )
  }

  const bandwidth = upper - lower
  const percentFromMiddle = ((currentPrice - middle) / (bandwidth / 2)) * 100

  // Generate mock data
  const data = Array.from({ length: 14 }, (_, i) => ({
    day: `Day ${i + 1}`,
    upper: upper - 2 + (i / 14) * 4,
    middle: middle - 1.5 + (i / 14) * 3,
    lower: lower - 1 + (i / 14) * 2,
    price: currentPrice - 3 + (i / 14) * 6,
  }))

  const getTrendStatus = () => {
    if (currentPrice > middle + bandwidth / 4) return { label: '📈 上升趨勢', color: '#10b981' }
    if (currentPrice < middle - bandwidth / 4) return { label: '📉 下降趨勢', color: '#ef4444' }
    return { label: '⚖️ 側向整理', color: '#f59e0b' }
  }

  const trend = getTrendStatus()

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          🎯 布林帶 (Bollinger Bands)
        </h3>
      </div>

      {/* Metrics */}
      <div className="mb-6 grid grid-cols-4 gap-3">
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3">
          <div className="text-xs text-red-600 dark:text-red-400">上限</div>
          <div className="text-lg font-semibold text-red-700 dark:text-red-300">${upper.toFixed(2)}</div>
        </div>
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3">
          <div className="text-xs text-amber-600 dark:text-amber-400">中線</div>
          <div className="text-lg font-semibold text-amber-700 dark:text-amber-300">${middle.toFixed(2)}</div>
        </div>
        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-3">
          <div className="text-xs text-green-600 dark:text-green-400">下限</div>
          <div className="text-lg font-semibold text-green-700 dark:text-green-300">${lower.toFixed(2)}</div>
        </div>
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3">
          <div className="text-xs text-blue-600 dark:text-blue-400">當前</div>
          <div className="text-lg font-semibold text-blue-700 dark:text-blue-300">${currentPrice.toFixed(2)}</div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorUpper" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorLower" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="day" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" domain={['dataMin - 5', 'dataMax + 5']} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f1f5f9',
            }}
          />
          <Area type="monotone" dataKey="upper" stroke="#ef4444" fill="url(#colorUpper)" />
          <Area type="monotone" dataKey="lower" stroke="#10b981" fill="url(#colorLower)" />
          <Line type="monotone" dataKey="middle" stroke="#f59e0b" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>

      {/* Status */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">帶寬 (Bandwidth)</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">${bandwidth.toFixed(2)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium" style={{ color: trend.color }}>
            {trend.label}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">波動性: {(bandwidth / middle * 100).toFixed(1)}%</p>
        </div>
      </div>
    </div>
  )
})
