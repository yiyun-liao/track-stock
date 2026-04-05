'use client'

import AnalysisTab from './component/AnalysisTab'
import type { Analysis } from '@/lib/types'

interface AnalysisSectionProps {
  analysis: Analysis | null
  analysisError: string
  analysisLoading: boolean
}

export default function AnalysisSection({
  analysis,
  analysisError,
  analysisLoading,
}: AnalysisSectionProps) {
  return (
    <AnalysisTab
      analysis={analysis}
      analysisError={analysisError}
      analysisLoading={analysisLoading}
    />
  )
}
