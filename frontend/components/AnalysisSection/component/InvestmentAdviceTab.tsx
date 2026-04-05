'use client'

import { Lightbulb } from 'lucide-react'
import AnalysisCard from './AnalysisCard'
import { MarkdownContent } from '@/components/ui/MarkdownContent'
import { formatDataSources } from '@/lib/utils/data-sources'
import type { Analysis } from '@/lib/types'

interface InvestmentAdviceTabProps {
  analysis: Analysis | null
  loading: boolean
  error: string
}

export default function InvestmentAdviceTab({ analysis, loading, error }: InvestmentAdviceTabProps) {
  const footer = analysis ? (
    <div className="space-y-3">
      {/* Data Sources */}
      {analysis.data_sources && analysis.data_sources.length > 0 && (
        <div className="text-xs text-emerald-700 dark:text-emerald-400 text-center">
          📊 Data Sources: {formatDataSources(analysis.data_sources)}
        </div>
      )}
      {/* Updated Time */}
      {analysis.timestamp && (
        <div className="text-xs text-emerald-600 dark:text-emerald-500 text-center border-t border-emerald-200 dark:border-emerald-800 pt-2">
          ⏰ Analysis updated: {new Date(analysis.timestamp).toLocaleTimeString()}
        </div>
      )}
    </div>
  ) : null

  return (
    <AnalysisCard
      title="Investment Advice"
      icon={<Lightbulb className="h-5 w-5 text-yellow-600" />}
      loading={loading}
      error={error}
      variant="success"
      content={
        analysis ? (
          <MarkdownContent
            content={analysis.investment_advice || 'No investment advice available'}
            colorScheme="emerald"
          />
        ) : null
      }
      footer={footer}
    />
  )
}
