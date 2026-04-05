'use client'

import { useState } from 'react'
import AnalysisCard from './AnalysisCard'
import type { Analysis } from '@/lib/types'

interface AnalysisSectionProps {
  analysis: Analysis | null
  analysisError: string
  analysisLoading: boolean
}

type Tab = 'price-alert' | 'news-summary' | 'investment-advice'

export default function AnalysisSection({
  analysis,
  analysisError,
  analysisLoading,
}: AnalysisSectionProps) {
  const [activeTab, setActiveTab] = useState<Tab>('price-alert')

  const analysisTabs = [
    { id: 'price-alert', label: '🔔 Price Alert' },
    { id: 'news-summary', label: '📝 News Summary' },
    { id: 'investment-advice', label: '💡 Investment Advice' },
  ] as const

  return (
    <div className="space-y-4">
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
      <div className="space-y-6">

        {/* Price Alert Tab */}
        {activeTab === 'price-alert' && (
          <AnalysisCard analysis={analysis} loading={analysisLoading} error={analysisError} variant="price-alert" />
        )}

        {/* News Summary Tab */}
        {activeTab === 'news-summary' && (
          <AnalysisCard analysis={analysis} loading={analysisLoading} error={analysisError} variant="news-summary" />
        )}

        {/* Investment Advice Tab */}
        {activeTab === 'investment-advice' && (
          <AnalysisCard analysis={analysis} loading={analysisLoading} error={analysisError} variant="investment-advice" />
        )}
      </div>
    </div>
  )
}
