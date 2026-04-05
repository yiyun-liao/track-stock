'use client'

import { Lightbulb } from 'lucide-react'
import AnalysisCard from './AnalysisCard'
import { MarkdownContent } from '@/components/ui/MarkdownContent'
import type { Analysis } from '@/lib/types'

interface InvestmentAdviceTabProps {
  analysis: Analysis | null
  loading: boolean
  error: string
}

export default function InvestmentAdviceTab({ analysis, loading, error }: InvestmentAdviceTabProps) {
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
      footer={
        analysis?.timestamp && (
          <div className="text-xs text-emerald-700 dark:text-emerald-400 text-center">
            Analysis updated: {new Date(analysis.timestamp).toLocaleTimeString()}
          </div>
        )
      }
    />
  )
}
