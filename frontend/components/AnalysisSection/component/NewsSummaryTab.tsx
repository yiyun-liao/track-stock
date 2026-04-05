'use client'

import { Lightbulb } from 'lucide-react'
import AnalysisCard from './AnalysisCard'
import { MarkdownContent } from '@/components/ui/MarkdownContent'
import type { Analysis } from '@/lib/types'

interface NewsSummaryTabProps {
  analysis: Analysis | null
  loading: boolean
  error: string
}

export default function NewsSummaryTab({ analysis, loading, error }: NewsSummaryTabProps) {
  return (
    <AnalysisCard
      title="News Summary"
      icon={<Lightbulb className="h-5 w-5 text-yellow-600" />}
      loading={loading}
      error={error}
      content={
        analysis ? (
          <MarkdownContent
            content={analysis.news_summary || 'No news summary available'}
            colorScheme="slate"
          />
        ) : null
      }
    />
  )
}
