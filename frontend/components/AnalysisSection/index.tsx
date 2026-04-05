'use client'

import { useState } from 'react'
import AnalysisTab from './component/AnalysisTab'
import type { Analysis } from '@/lib/types'

interface AnalysisSectionProps {
  analysis: Analysis | null
  analysisError: string
  analysisLoading: boolean
  historyLoading?: boolean
  newsLoading?: boolean
}

export default function AnalysisSection({
  analysis,
  analysisError,
  analysisLoading,
  historyLoading = false,
  newsLoading = false,
}: AnalysisSectionProps) {
  const [showAnalysis, setShowAnalysis] = useState(false)

  return (
    <>
      {/* Header with Title and Generate Analysis Button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">🤖 AI summary</h2>
        {!showAnalysis ? (
          <button
            onClick={() => setShowAnalysis(true)}
            disabled={historyLoading || newsLoading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-400 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {historyLoading || newsLoading ? 'Loading...' : 'Generate Analysis'}
          </button>
        ) : (
          <button
            onClick={() => setShowAnalysis(false)}
            className="px-4 py-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-900 dark:text-white text-sm font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        )}
      </div>

      {/* Analysis Tab Content */}
      {showAnalysis && (
        <AnalysisTab
          analysis={analysis}
          analysisError={analysisError}
          analysisLoading={analysisLoading}
        />
      )}
    </>
  )
}
