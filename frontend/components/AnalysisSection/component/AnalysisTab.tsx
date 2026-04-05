'use client'

import { useState } from 'react'
import PriceAlertTab from './PriceAlertTab'
import NewsSummaryTab from './NewsSummaryTab'
import InvestmentAdviceTab from './InvestmentAdviceTab'
import { formatDataSources } from '@/lib/utils/data-sources'
import type { Analysis } from '@/lib/types'

interface AnalysisTabProps {
  analysis: Analysis | null
  analysisError: string
  analysisLoading: boolean
}

type Tab = 'price-alert' | 'news-summary' | 'investment-advice'

export default function AnalysisTab({
  analysis,
  analysisError,
  analysisLoading,
}: AnalysisTabProps) {
  const [activeTab, setActiveTab] = useState<Tab>('price-alert')

  const analysisTabs = [
    { id: 'price-alert', label: '🔔 Price Alert' },
    { id: 'news-summary', label: '📝 News Summary' },
    { id: 'investment-advice', label: '💡 Investment Advice' },
  ] as const

  return (
    <div className="space-y-4">
      {/* Data Sources & Timestamp Summary */}
      {analysis && (
        <div className="space-y-3">
          {/* Data Sources */}
          {analysis.data_sources && analysis.data_sources.length > 0 && (
            <div className="text-xs text-slate-600 dark:text-slate-400 text-center">
              📊 Data Sources: {formatDataSources(analysis.data_sources)}
            </div>
          )}
          {/* Updated Time */}
          {analysis.timestamp && (
            <div className="text-xs text-slate-500 dark:text-slate-500 text-center border-t border-slate-200 dark:border-slate-700 pt-2">
              ⏰ Analysis updated: {new Date(analysis.timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex space-x-2">
          {analysisTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'price-alert' && (
        <PriceAlertTab analysis={analysis} loading={analysisLoading} error={analysisError} />
      )}

      {activeTab === 'news-summary' && (
        <NewsSummaryTab analysis={analysis} loading={analysisLoading} error={analysisError} />
      )}

      {activeTab === 'investment-advice' && (
        <InvestmentAdviceTab analysis={analysis} loading={analysisLoading} error={analysisError} />
      )}
    </div>
  )
}
