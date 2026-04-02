'use client'

import { Lightbulb, TrendingUp, Zap } from 'lucide-react'
import { useAnalysis } from '@/lib/hooks/useAnalysis'

interface AnalysisCardProps {
  symbol: string
  loading: boolean
}

export default function AnalysisCard({ symbol, loading }: AnalysisCardProps) {
  const { data: analysis, loading: analysisLoading, error, refetch } = useAnalysis(symbol, !loading)

  if (loading || analysisLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div className="h-6 w-40 animate-pulse rounded bg-slate-100" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    const isNetworkError = error.includes('Failed') || error.includes('fetch')
    const isNoData = error.includes('No data')

    return (
      <div className={`rounded-xl border p-6 shadow-sm ${
        isNetworkError
          ? 'border-red-200 bg-red-50'
          : 'border-yellow-200 bg-yellow-50'
      }`}>
        <div className="flex items-start gap-3">
          <Zap className={`h-5 w-5 flex-shrink-0 mt-1 ${
            isNetworkError ? 'text-red-600' : 'text-yellow-600'
          }`} />
          <div>
            <h3 className={`font-semibold ${
              isNetworkError ? 'text-red-900' : 'text-yellow-900'
            }`}>
              {isNetworkError ? '無法獲取分析' : '暫無分析數據'}
            </h3>
            <p className={`text-sm mt-1 ${
              isNetworkError ? 'text-red-700' : 'text-yellow-700'
            }`}>
              {isNetworkError
                ? `API 連接失敗：${error}`
                : '缺少分析所需的完整數據'}
            </p>
            {isNetworkError && (
              <button
                onClick={refetch}
                className="mt-3 inline-block rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 transition-colors"
              >
                🔄 重新嘗試
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* News Summary */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            📰 News Summary
          </h3>
        </div>
        <div className="px-6 py-4">
          <p className="text-sm text-slate-700 leading-relaxed">
            {analysis.news_summary || 'No news summary available'}
          </p>
        </div>
      </div>

      {/* Price Alert */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            📈 Price Alert
          </h3>
        </div>
        <div className="px-6 py-4">
          <p className="text-sm text-slate-700 leading-relaxed">
            {analysis.price_alert || 'No price alert available'}
          </p>
        </div>
      </div>

      {/* Investment Advice */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 shadow-sm overflow-hidden">
        <div className="border-b border-emerald-200 bg-emerald-100/50 px-6 py-4">
          <h3 className="font-semibold text-emerald-900 flex items-center gap-2">
            💡 Investment Advice
          </h3>
        </div>
        <div className="px-6 py-4">
          <p className="text-sm text-emerald-800 leading-relaxed font-medium">
            {analysis.investment_advice || 'No investment advice available'}
          </p>
        </div>
      </div>

      {/* Timestamp */}
      {analysis.timestamp && (
        <div className="text-xs text-slate-500 text-center">
          Analysis updated: {new Date(analysis.timestamp).toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}
