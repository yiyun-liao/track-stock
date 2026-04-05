'use client'

import { memo } from 'react'
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useLanguageSafe } from '@/lib/language-context'

interface MACDChartProps {
  macd?: number
  signal?: number
  histogram?: number
  interpretation?: string
  loading?: boolean
}

/**
 * MACD (Moving Average Convergence Divergence) Chart
 * Shows momentum and trend direction
 */
export const MACDChart = memo(function MACDChart({
  macd = 2.54,
  signal = 2.12,
  histogram = 0.42,
  interpretation = 'bullish',
  loading = false,
}: MACDChartProps) {
  const { t } = useLanguageSafe()

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
    macd: macd - 1 + (i / 14) * 2,
    signal: signal - 0.8 + (i / 14) * 1.5,
    histogram: histogram - 0.5 + (i / 14) * 1,
  }))

  const isBullish = interpretation === 'bullish' || histogram > 0

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          {t('indicator.macd')}
        </h3>
      </div>

      {/* Metrics */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-slate-50 dark:bg-slate-700 p-3">
          <div className="text-sm text-slate-600 dark:text-slate-400">{t('indicator.macd_label')}</div>
          <div className="text-lg font-semibold text-slate-900 dark:text-white">{macd ? macd.toFixed(4) : 'N/A'}</div>
        </div>
        <div className="rounded-lg bg-slate-50 dark:bg-slate-700 p-3">
          <div className="text-sm text-slate-600 dark:text-slate-400">{t('indicator.signal_line')}</div>
          <div className="text-lg font-semibold text-slate-900 dark:text-white">{signal ? signal.toFixed(4) : 'N/A'}</div>
        </div>
        <div className={`rounded-lg p-3 ${isBullish ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
          <div className={`text-sm ${isBullish ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {t('indicator.histogram')}
          </div>
          <div className={`text-lg font-semibold ${isBullish ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
            {histogram ? histogram.toFixed(4) : 'N/A'}
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={250}>
        <ComposedChart data={data}>
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
          <Bar dataKey="histogram" fill={isBullish ? '#10b981' : '#ef4444'} opacity={0.6} />
          <Line type="monotone" dataKey="macd" stroke="#3b82f6" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="signal" stroke="#f59e0b" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Interpretation */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${isBullish ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
            {isBullish ? t('indicator.macd_bullish') : t('indicator.macd_bearish')}
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          {isBullish
            ? t('indicator.macd_desc_bullish')
            : t('indicator.macd_desc_bearish')}
        </p>
      </div>
    </div>
  )
})
