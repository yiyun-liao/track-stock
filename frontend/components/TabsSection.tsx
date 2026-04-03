'use client'

import { useState } from 'react'
import StockChart from './StockChart'
import NewsSection from './NewsSection'
import AnalysisCard from './AnalysisCard'
import type { News } from '@/lib/types'

interface TabsSectionProps {
  symbol: string
  news: News[]
  loading: boolean
}

type Tab = 'chart' | 'news'

export default function TabsSection({ symbol, news, loading }: TabsSectionProps) {
  const [activeTab, setActiveTab] = useState<Tab>('chart')

  const tabs = [
    { id: 'chart', label: 'Price Chart & Alert' },
    { id: 'news', label: 'News & Summary' },
  ] as const

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-green-500 text-green-600 dark:text-green-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Chart & Alert Tab */}
        {activeTab === 'chart' && (
          <>
            <StockChart symbol={symbol} loading={loading} />
            <AnalysisCard symbol={symbol} loading={loading} showOnlyAlert />
          </>
        )}

        {/* News Tab */}
        {activeTab === 'news' && (
          <>
            <AnalysisCard symbol={symbol} loading={loading} showOnlySummary />
            <NewsSection news={news} symbol={symbol} loading={loading} />
          </>
        )}
      </div>
    </div>
  )
}
