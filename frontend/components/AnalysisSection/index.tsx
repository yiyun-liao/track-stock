'use client'

import { useState } from 'react'
import AnalysisTab from './component/AnalysisTab'
import { useAnalysis } from '@/lib/hooks'
import type { Analysis } from '@/lib/types'

interface AnalysisSectionProps {
  selectedStock: string
  isDataLoading?: boolean
  language?: string
  stockHistory?: any
}

export default function AnalysisSection({
  selectedStock,
  isDataLoading = false,
  language = 'en',
  stockHistory,
}: AnalysisSectionProps) {
  // Analysis fetch - only triggered when user clicks button
  const { data: analysis, loading: analysisLoading, error: analysisError, fetchData } = useAnalysis(
    selectedStock,
    false,  // Don't auto-fetch, only manual trigger
    language,
    stockHistory
  )

  return (
    <>
      {/* Header with Title */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">🤖 AI summary</h2>

        {/* Show loading message while data is loading */}
        {isDataLoading && (
          <div className="text-sm text-slate-500 italic">AI summary after Data loading.</div>
        )}

        {/* Show Generate Analysis button when data is ready and no analysis yet */}
        {!isDataLoading && !analysis && (
          <button
            onClick={() => fetchData()}
            disabled={analysisLoading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-400 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {analysisLoading ? 'Loading...' : 'Generate Analysis'}
          </button>
        )}
      </div>

      {/* Analysis Tab Content */}
      {analysis && (
        <AnalysisTab
          analysis={analysis}
          analysisError={analysisError}
          analysisLoading={analysisLoading}
        />
      )}
    </>
  )
}
