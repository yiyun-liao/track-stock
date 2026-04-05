'use client'

import { memo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface MovingAveragesChartProps {
  ma20?: number
  ma50?: number
  ma200?: number
  currentPrice?: number
  loading?: boolean
}

/**
 * Moving Averages Chart - Trend Confirmation
 */
export const MovingAveragesChart = memo(function MovingAveragesChart({
  ma20 = 179.45,
  ma50 = 178.9,
  ma200 = 177.32,
  currentPrice = 182,
  loading = false,
}: MovingAveragesChartProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <div className="h-12 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-700 mb-4" />
        <div className="h-64 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
      </div>
    )
  }

  // Generate mock data
  const data = Array.from({ length: 14 }, (_, i) => ({
    day: `Day ${i + 1}`,
    ma20: ma20 - 2 + (i / 14) * 4,
    ma50: ma50 - 1.5 + (i / 14) * 3,
    ma200: ma200 - 1 + (i / 14) * 2,
    price: currentPrice - 3 + (i / 14) * 6,
  }))

  // 判斷黃金叉/死亡叉
  const getSignal = () => {
    if (ma20 > ma50 && ma50 > ma200) return { label: '✓ 黃金叉 (看漲)', color: '#10b981' }
    if (ma20 < ma50 && ma50 < ma200) return { label: '✗ 死亡叉 (看跌)', color: '#ef4444' }
    return { label: '⚖️ 均線糾纏', color: '#f59e0b' }
  }

  const signal = getSignal()

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          📊 移動平均線 (Moving Averages)
        </h3>
      </div>

      {/* Metrics */}
      <div className="mb-6 grid grid-cols-4 gap-3">
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3">
          <div className="text-xs text-red-600 dark:text-red-400">MA 20</div>
          <div className="text-lg font-semibold text-red-700 dark:text-red-300">${ma20 ? ma20.toFixed(2) : 'N/A'}</div>
        </div>
        <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-3">
          <div className="text-xs text-yellow-600 dark:text-yellow-400">MA 50</div>
          <div className="text-lg font-semibold text-yellow-700 dark:text-yellow-300">${ma50 ? ma50.toFixed(2) : 'N/A'}</div>
        </div>
        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-3">
          <div className="text-xs text-green-600 dark:text-green-400">MA 200</div>
          <div className="text-lg font-semibold text-green-700 dark:text-green-300">${ma200 ? ma200.toFixed(2) : 'N/A'}</div>
        </div>
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3">
          <div className="text-xs text-blue-600 dark:text-blue-400">當前價格</div>
          <div className="text-lg font-semibold text-blue-700 dark:text-blue-300">${currentPrice ? currentPrice.toFixed(2) : 'N/A'}</div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="day" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f1f5f9',
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2.5} dot={false} name="當前價格" />
          <Line type="monotone" dataKey="ma20" stroke="#ef4444" strokeWidth={2} dot={false} name="MA20 (短期)" />
          <Line type="monotone" dataKey="ma50" stroke="#f59e0b" strokeWidth={2} dot={false} name="MA50 (中期)" />
          <Line type="monotone" dataKey="ma200" stroke="#10b981" strokeWidth={2} dot={false} name="MA200 (長期)" />
        </LineChart>
      </ResponsiveContainer>

      {/* Signal & Interpretation */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="mb-3 flex items-center gap-2">
          <div className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: signal.color + '20', color: signal.color }}>
            {signal.label}
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {ma20 > ma50 && ma50 > ma200
            ? '短期、中期、長期均線均向上排列，趨勢完整，看漲前景樂觀'
            : ma20 < ma50 && ma50 < ma200
              ? '短期、中期、長期均線均向下排列，趨勢明確，看跌風險高'
              : '均線互相糾纏，趨勢尚不明確，需要等待突破'}
        </p>
      </div>
    </div>
  )
})
