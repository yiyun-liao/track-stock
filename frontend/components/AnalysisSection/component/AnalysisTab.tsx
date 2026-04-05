'use client'

import { useState } from 'react'
import { useLanguageSafe } from '@/lib/language-context'
import Button from '@/components/ui/Button'
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
  const { t } = useLanguageSafe()
  const [activeTab, setActiveTab] = useState<Tab>('price-alert')

  const analysisTabs = [
    { id: 'price-alert', label: t('tab.price_alert') },
    { id: 'news-summary', label: t('tab.news_summary') },
    { id: 'investment-advice', label: t('tab.investment_advice') },
  ] as const

  return (
    <div className="space-y-4">
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex space-x-2">
          {analysisTabs.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              variant="tab"
              isActive={activeTab === tab.id}
            >
              {tab.label}
            </Button>
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
