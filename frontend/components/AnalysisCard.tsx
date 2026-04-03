'use client'

import { Lightbulb, TrendingUp, Zap } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useAnalysis } from '@/lib/hooks/useAnalysis'

interface AnalysisCardProps {
  symbol: string
  loading: boolean
  showOnlyAlert?: boolean
  showOnlySummary?: boolean
}

export default function AnalysisCard({ symbol, loading, showOnlyAlert, showOnlySummary }: AnalysisCardProps) {
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
                重新嘗試
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
      {/* News Summary - show when not filtered or showOnlySummary */}
      {!showOnlyAlert && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex-shrink-0">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              News Summary
            </h3>
          </div>
          <div className="px-6 py-4 overflow-y-auto max-h-96 flex-1">
            <div className="text-sm text-slate-700 leading-relaxed">
              <ReactMarkdown
                components={{
                  h1: ({ ...props }) => <h1 className="text-lg font-semibold text-slate-900 mt-4 mb-2" {...props} />,
                  h2: ({ ...props }) => <h2 className="text-base font-semibold text-slate-900 mt-4 mb-2" {...props} />,
                  h3: ({ ...props }) => <h3 className="text-sm font-semibold text-slate-900 mt-3 mb-2" {...props} />,
                  p: ({ ...props }) => <p className="mb-3 text-slate-700" {...props} />,
                  ul: ({ ...props }) => <ul className="list-disc list-inside ml-2 mb-3" {...props} />,
                  ol: ({ ...props }) => <ol className="list-decimal list-inside ml-2 mb-3" {...props} />,
                  li: ({ ...props }) => <li className="mb-1 text-slate-700" {...props} />,
                  strong: ({ ...props }) => <strong className="font-semibold text-slate-900" {...props} />,
                  em: ({ ...props }) => <em className="italic text-slate-700" {...props} />,
                  code: ({ ...props }) => <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-900" {...props} />,
                  pre: ({ ...props }) => <pre className="bg-slate-100 p-3 rounded-lg overflow-x-auto mb-3" {...props} />,
                }}
              >
                {analysis.news_summary || 'No news summary available'}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* Price Alert - show when not filtered or showOnlyAlert */}
      {!showOnlySummary && (
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
      )}

      {/* Investment Advice - always show when not filtering by summary */}
      {!showOnlySummary && (
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
          <div className="border-b border-emerald-200 bg-emerald-100/50 px-6 py-4">
            {analysis.timestamp && (
              <div className="text-xs text-slate-500 text-center">
                Analysis updated: {new Date(analysis.timestamp).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
