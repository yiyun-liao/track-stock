'use client'

import { memo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'

interface RSIChartProps {
  value?: number
  interpretation?: string
  loading?: boolean
}

/**
 * RSI (Relative Strength Index) Chart Component
 * Shows overbought/oversold conditions
 * 0-30: Oversold (green), 30-70: Neutral (yellow), 70-100: Overbought (red)
 */
export const RSIChart = memo(function RSIChart({ value = 50, interpretation = 'neutral', loading = false }: RSIChartProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <div className="h-12 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-700 mb-4" />
        <div className="h-64 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
      </div>
    )
  }

  // Generate mock data for visualization
  const data = Array.from({ length: 14 }, (_, i) => ({
    day: `Day ${i + 1}`,
    rsi: Math.max(20, Math.min(80, value - 15 + Math.random() * 30)),
  }))

  const getColor = () => {
    if (value > 70) return '#ef4444' // red - overbought
    if (value < 30) return '#10b981' // green - oversold
    return '#f59e0b' // amber - neutral
  }

  const getInterpretationLabel = () => {
    if (value > 70) return '⚠️ 超買'
    if (value < 30) return '📈 超賣'
    return '⚖️ 中立'
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          📊 相對強弱指數 (RSI)
        </h3>
      </div>

      {/* Current Value */}
      <div className="mb-6 flex items-end gap-4">
        <div className="flex-1">
          <div className="text-3xl font-bold" style={{ color: getColor() }}>
            {value ? value.toFixed(1) : 'N/A'}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">當前值</div>
        </div>
        <div className="flex-1">
          <div className="text-lg font-medium text-slate-700 dark:text-slate-300">{getInterpretationLabel()}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">狀態</div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="day" stroke="#94a3b8" />
          <YAxis domain={[0, 100]} stroke="#94a3b8" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f1f5f9',
            }}
          />
          {/* Reference lines for overbought/oversold */}
          <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="5 5" label={{ value: '超買 (70)', position: 'right', fill: '#ef4444' }} />
          <ReferenceLine y={30} stroke="#10b981" strokeDasharray="5 5" label={{ value: '超賣 (30)', position: 'right', fill: '#10b981' }} />
          <Line
            type="monotone"
            dataKey="rsi"
            stroke={getColor()}
            dot={false}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Interpretation */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {value > 70
            ? '⚠️ RSI 超買，可能面臨回調風險'
            : value < 30
              ? '📈 RSI 超賣，可能存在反彈機會'
              : '⚖️ RSI 處於中性區域，市場動能平衡'}
        </p>
      </div>
    </div>
  )
})
