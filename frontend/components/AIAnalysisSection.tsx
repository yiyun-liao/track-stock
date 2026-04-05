'use client'

import AnalysisCard from './AnalysisCard'
import { DATA_SOURCE_LABELS } from '@/lib/utils/data-sources'
import type { Analysis } from '@/lib/types'
import type { DataSource } from '@/lib/utils/data-sources'

interface AIAnalysisSectionProps {
  analysis: Analysis | null
  loading: boolean
  error: string
}

export default function AIAnalysisSection({
  analysis,
  loading,
  error,
}: AIAnalysisSectionProps) {
  return (
    <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
      {/* Header: Title + Loading + Data Sources */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">🤖 AI Analysis</h2>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Analyzing...
            </div>
          )}
        </div>
        {/* Data Sources */}
        {analysis?.data_sources && (analysis.data_sources as DataSource[]).length > 0 && (
          <div className="flex gap-2 flex-wrap justify-end">
            {(analysis.data_sources as DataSource[]).map((source) => (
              <span
                key={source}
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${DATA_SOURCE_LABELS[source].color}`}
                title={DATA_SOURCE_LABELS[source].description}
              >
                {DATA_SOURCE_LABELS[source].icon} {DATA_SOURCE_LABELS[source].label}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-4">
        <AnalysisCard analysis={analysis} loading={loading} error={error} hideDataSources />
      </div>
    </div>
  )
}
