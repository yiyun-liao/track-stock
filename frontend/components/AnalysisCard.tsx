'use client'

import { Lightbulb, TrendingUp, Zap } from 'lucide-react'
import { MarkdownContent } from './ui/MarkdownContent'
import { useLanguageSafe } from '@/lib/language-context'
import type { Analysis } from '@/lib/types'

interface AnalysisCardProps {
  analysis: Analysis | null
  loading: boolean
  error: string
  showOnlyAlert?: boolean
  showOnlySummary?: boolean
}

export default function AnalysisCard({ analysis, loading, error, showOnlyAlert, showOnlySummary }: AnalysisCardProps) {
  const { t } = useLanguageSafe()

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <div className="space-y-4">
          <div className="h-6 w-40 animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    const isNetworkError = error.includes('Failed') || error.includes('fetch')

    return (
      <div className={`rounded-xl border p-6 shadow-sm ${
        isNetworkError
          ? 'border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10'
          : 'border-yellow-200 bg-yellow-50 dark:border-yellow-900/30 dark:bg-yellow-900/10'
      }`}>
        <div className="flex items-start gap-3">
          <Zap className={`h-5 w-5 flex-shrink-0 mt-1 ${
            isNetworkError ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
          }`} />
          <div>
            <h3 className={`font-semibold ${
              isNetworkError ? 'text-red-900 dark:text-red-300' : 'text-yellow-900 dark:text-yellow-300'
            }`}>
              {isNetworkError ? t('analysis.no_connection') : t('analysis.no_data')}
            </h3>
            <p className={`text-sm mt-1 ${
              isNetworkError ? 'text-red-700 dark:text-red-400' : 'text-yellow-700 dark:text-yellow-400'
            }`}>
              {isNetworkError
                ? `${t('error.network')}：${error}`
                : t('error.no_data')}
            </p>
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
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="border-b border-slate-200 bg-slate-50 dark:bg-slate-700 px-6 py-4 flex-shrink-0">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              News Summary
            </h3>
          </div>
          <div className="px-6 py-4 overflow-y-auto max-h-96 flex-1 text-sm leading-relaxed">
            <MarkdownContent content={analysis.news_summary || 'No news summary available'} colorScheme="slate" />
          </div>
        </div>
      )}

      {/* Price Alert - show when not filtered or showOnlyAlert */}
      {!showOnlySummary && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="border-b border-slate-200 bg-slate-50 dark:bg-slate-700 px-6 py-4 flex-shrink-0">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              📈 Price Alert
            </h3>
          </div>
          <div className="px-6 py-4 overflow-y-auto max-h-96 flex-1 text-sm leading-relaxed">
            <MarkdownContent content={analysis.price_alert || 'No price alert available'} colorScheme="slate" />
          </div>
        </div>
      )}

      {/* Investment Advice - always show when not filtering by summary */}
      {!showOnlySummary && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm overflow-hidden flex flex-col">
          <div className="border-b border-emerald-200 dark:border-emerald-800 bg-emerald-100/50 dark:bg-emerald-900/30 px-6 py-4 flex-shrink-0">
            <h3 className="font-semibold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
              💡 Investment Advice
            </h3>
          </div>
          <div className="px-6 py-4 overflow-y-auto max-h-96 flex-1 text-sm leading-relaxed">
            <MarkdownContent content={analysis.investment_advice || 'No investment advice available'} colorScheme="emerald" />
          </div>
          <div className="border-t border-emerald-200 dark:border-emerald-800 bg-emerald-100/50 dark:bg-emerald-900/30 px-6 py-3 flex-shrink-0">
            {analysis.timestamp && (
              <div className="text-xs text-emerald-700 dark:text-emerald-400 text-center">
                Analysis updated: {new Date(analysis.timestamp).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
