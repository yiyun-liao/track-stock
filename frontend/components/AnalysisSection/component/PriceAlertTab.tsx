'use client'

import { TrendingUp } from 'lucide-react'
import AnalysisCard from '../../ui/AnalysisCard'
import { MarkdownContent } from '@/components/ui/MarkdownContent'
import { useLanguageSafe } from '@/lib/language-context'
import type { Analysis } from '@/lib/types'

interface PriceAlertTabProps {
  analysis: Analysis | null
  loading: boolean
  error: string
}

export default function PriceAlertTab({ analysis, loading, error }: PriceAlertTabProps) {
  const { t } = useLanguageSafe()

  return (
    <AnalysisCard
      title="Price Alert"
      icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
      loading={loading}
      error={error}
      content={
        analysis ? (
          <MarkdownContent
            content={analysis.price_alert || t('analysis.no_price_alert')}
            colorScheme="slate"
          />
        ) : null
      }
    />
  )
}
