'use client'

import { Lightbulb } from 'lucide-react'
import AnalysisCard from '../../ui/AnalysisCard'
import { MarkdownContent } from '@/components/ui/MarkdownContent'
import { useLanguageSafe } from '@/lib/language-context'
import type { Analysis } from '@/lib/types'

interface NewsSummaryTabProps {
  analysis: Analysis | null
  loading: boolean
  error: string
}

export default function NewsSummaryTab({ analysis, loading, error }: NewsSummaryTabProps) {
  const { t } = useLanguageSafe()

  return (
    <AnalysisCard
      title="News Summary"
      icon={<Lightbulb className="h-5 w-5 text-yellow-600" />}
      loading={loading}
      error={error}
      content={
        analysis ? (
          <MarkdownContent
            content={analysis.news_summary || t('analysis.no_news_summary')}
            colorScheme="slate"
          />
        ) : null
      }
    />
  )
}
