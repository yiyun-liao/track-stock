'use client'

import { memo } from 'react'

interface CompanyProfileCardProps {
  company_name?: string
  sector?: string
  industry?: string
  market_cap?: number
  pe_ratio?: number
  pb_ratio?: number
  dividend_yield?: number
  roe?: number
  roa?: number
  debt_to_equity?: number
  current_ratio?: number
  quick_ratio?: number
  loading?: boolean
}

const formatNumber = (value: any): string => {
  if (!value) return 'N/A'
  if (typeof value === 'number') {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    if (value < 1) return value.toFixed(2) + '%'
    return value.toFixed(2)
  }
  return String(value)
}

const getRating = (value: any, type: string): string => {
  if (!value) return '⚪'
  switch (type) {
    case 'pe':
      // 低 P/E 更好
      if (value < 15) return '🟢'
      if (value < 25) return '🟡'
      return '🔴'
    case 'roe':
      // 高 ROE 更好
      if (value > 0.15) return '🟢'
      if (value > 0.1) return '🟡'
      return '🔴'
    case 'debt':
      // 低負債更好
      if (value < 1) return '🟢'
      if (value < 2) return '🟡'
      return '🔴'
    case 'ratio':
      // 流動比率 > 1 較好
      if (value > 1) return '🟢'
      if (value > 0.8) return '🟡'
      return '🔴'
    default:
      return '⚪'
  }
}

/**
 * Company Profile Card - Overview and Key Metrics
 */
export const CompanyProfileCard = memo(function CompanyProfileCard({
  company_name = '加載中...',
  sector = '-',
  industry = '-',
  market_cap = 0,
  pe_ratio = 0,
  pb_ratio = 0,
  dividend_yield = 0,
  roe = 0,
  roa = 0,
  debt_to_equity = 0,
  current_ratio = 0,
  quick_ratio = 0,
  loading = false,
}: CompanyProfileCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <div className="space-y-3">
          <div className="h-8 w-40 animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
          <div className="h-4 w-60 animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const metrics = [
    { label: 'P/E 比率', value: pe_ratio, unit: '', rating: getRating(pe_ratio, 'pe'), tooltip: '市盈率越低越便宜' },
    { label: 'P/B 比率', value: pb_ratio, unit: '', rating: '⚪', tooltip: '淨資產倍數' },
    { label: '股息率', value: dividend_yield, unit: '%', rating: '⚪', tooltip: '年度股息回報率' },
    { label: 'ROE', value: (roe * 100), unit: '%', rating: getRating(roe, 'roe'), tooltip: '股東權益回報率' },
    { label: 'ROA', value: (roa * 100), unit: '%', rating: '⚪', tooltip: '資產回報率' },
    { label: '負債/權益', value: debt_to_equity, unit: '', rating: getRating(debt_to_equity, 'debt'), tooltip: '負債比率，越低越好' },
    { label: '流動比率', value: current_ratio, unit: '', rating: getRating(current_ratio, 'ratio'), tooltip: '償債能力，>1.0較好' },
    { label: '速動比率', value: quick_ratio, unit: '', rating: getRating(quick_ratio, 'ratio'), tooltip: '速動償債能力' },
  ]

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-slate-50 dark:from-slate-700 dark:to-slate-800 p-6 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{company_name}</h2>
        <div className="flex gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
          <span>🏢 {sector}</span>
          <span>🏭 {industry}</span>
        </div>
      </div>

      {/* Market Cap */}
      {market_cap ? (
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-blue-50/50 dark:bg-blue-900/10">
          <div className="text-sm text-slate-600 dark:text-slate-400">市值</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatNumber(market_cap)}</div>
        </div>
      ) : null}

      {/* Metrics Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 hover:shadow-md transition-shadow"
              title={metric.tooltip}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{metric.label}</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {formatNumber(metric.value)}
                    {metric.unit}
                  </p>
                </div>
                <div className="text-lg">{metric.rating}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/50">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-600 dark:text-slate-400">📊 健康度評估:</span>
          <span className="font-semibold text-slate-900 dark:text-white">
            {pe_ratio && pe_ratio < 25
              ? '✅ 估值合理'
              : pe_ratio && pe_ratio > 35
                ? '⚠️ 估值偏高'
                : '⚪ 評估中'}
          </span>
          {roe && roe > 0.15 ? (
            <span className="ml-auto text-emerald-600 dark:text-emerald-400 font-semibold">盈利能力強</span>
          ) : null}
        </div>
      </div>
    </div>
  )
})
