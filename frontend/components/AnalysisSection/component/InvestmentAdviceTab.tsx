'use client'

import { Lightbulb, Zap } from 'lucide-react'
import AnalysisCard from './AnalysisCard'
import { MarkdownContent } from '@/components/ui/MarkdownContent'
import { useLanguageSafe } from '@/lib/language-context'
import type { Analysis } from '@/lib/types'

interface InvestmentAdviceTabProps {
  analysis: Analysis | null
  loading: boolean
  error: string
}

export default function InvestmentAdviceTab({ analysis, loading, error }: InvestmentAdviceTabProps) {
  const { t } = useLanguageSafe()

  if (loading) {
    return (
      <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-6 shadow-sm">
        <div className="space-y-4">
          <div className="h-6 w-40 animate-pulse rounded bg-emerald-100 dark:bg-emerald-800" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-emerald-100 dark:bg-emerald-800" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-emerald-100 dark:bg-emerald-800" />
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
              {isNetworkError ? `${t('error.network')}：${error}` : t('error.no_data')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!analysis) return null

  return (
    <AnalysisCard
      title="Investment Advice"
      icon={<Lightbulb className="h-5 w-5 text-yellow-600" />}
      content={
        <MarkdownContent
          content={analysis.investment_advice || 'No investment advice available'}
          colorScheme="emerald"
        />
      }
      footer={
        analysis.timestamp && (
          <div className="text-xs text-emerald-700 dark:text-emerald-400 text-center">
            Analysis updated: {new Date(analysis.timestamp).toLocaleTimeString()}
          </div>
        )
      }
      variant="success"
    />
  )
}
