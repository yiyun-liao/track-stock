'use client'

import { TrendingUp } from 'lucide-react'
import AnalysisCard from '../../ui/AnalysisCard'
import { MarkdownContent } from '@/components/ui/MarkdownContent'
import type { Analysis } from '@/lib/types'

interface PriceAlertTabProps {
  analysis: Analysis | null
  loading: boolean
  error: string
}

export default function PriceAlertTab({ analysis, loading, error }: PriceAlertTabProps) {
  return (
    <AnalysisCard
      title="Price Alert"
      icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
      loading={loading}
      error={error}
      content={
        analysis ? (
          <MarkdownContent
            content={analysis.price_alert || 'No price alert available'}
            colorScheme="slate"
          />
        ) : null
      }
    />
  )
}
