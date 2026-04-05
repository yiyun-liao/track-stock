'use client'

import { Lightbulb } from 'lucide-react'
import AnalysisCard from '../../ui/AnalysisCard'
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
            content={analysis.investment_advice || t('analysis.no_advice')}
            colorScheme="emerald"
          />
        ) : null
      }
    />
  )
}
