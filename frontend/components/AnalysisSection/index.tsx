'use client'

import { useState } from 'react'
import AnalysisTab from './component/AnalysisTab'
import Button from '@/components/ui/Button'
import { useAnalysis } from '@/lib/hooks'
import { useLanguageSafe } from '@/lib/language-context'
import type { Analysis } from '@/lib/types'
import { formatDataSources } from '@/lib/utils/data-sources'

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
  const { t } = useLanguageSafe()
  // Analysis fetch - only triggered when user clicks button
  const { data: analysis, loading: analysisLoading, error: analysisError, fetchData } = useAnalysis()

  return (
    <>
      {/* Header with Title */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('analysis.ai_summary')}</h2>

        {isDataLoading && (
          <div className="text-xs text-slate-500 italic">{t('analysis.loading_message')}</div>
        )}

        {!isDataLoading && analysis && (
          <div className="flex flex-col items-end gap-2 text-xs text-slate-600 dark:text-slate-400">
            {analysis.data_sources && analysis.data_sources.length > 0 && (
              <div>
                Sources: {formatDataSources(analysis.data_sources)}
              </div>
            )}
            {analysis.timestamp && (
              <div>
                ⏰ {new Date(analysis.timestamp).toLocaleTimeString()}
              </div>
            )}
          </div>
        )}

      </div>
        {!isDataLoading && !analysis && (
          <div className={'rounded-xl border shadow-sm h-40 flex justify-center items-center border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20'}>
            {!analysisLoading && (
              <div className='h-auto'>
                <Button
                  onClick={() => fetchData(selectedStock, language, stockHistory)}
                  isLoading={analysisLoading}
                  variant="success"
                  withBorder
                >
                  {t('button.generate_analysis')}
                </Button>
              </div>
            )}
            {analysisLoading && (
              <div className="px-6 py-4 space-y-4">
                <div className="h-6 w-40 animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
                <div className="space-y-2">
                  <div className="h-4 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
                </div>
              </div>
            )}
          </div>
        )}

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
