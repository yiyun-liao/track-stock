'use client'

import { useState } from 'react'
import StockChart from './StockChart'
import NewsSection from './ui/NewsSection'
import AnalysisCard from './AnalysisCard'
import { RSIChart } from './ui/RSIChart'
import { MACDChart } from './ui/MACDChart'
import { BollingerBandsChart } from './ui/BollingerBandsChart'
import { MovingAveragesChart } from './ui/MovingAveragesChart'
import { CompanyProfileCard } from './ui/CompanyProfileCard'
import type { News, Analysis } from '@/lib/types'
import type { TechnicalIndicators } from '@/lib/hooks/useTechnicalIndicators'
import type { CompanyProfile } from '@/lib/hooks/useCompanyFinancials'

interface TabsSectionProps {
  symbol: string
  news: News[]
  newsError: string
  newsLoading: boolean
  stockHistory?: any
  historyError: string
  historyLoading: boolean
  analysis: Analysis | null
  analysisError: string
  analysisLoading: boolean
  technicalIndicators?: TechnicalIndicators | null
  technicalLoading?: boolean
  technicalError?: string
  companyProfile?: CompanyProfile | null
  financialLoading?: boolean
  financialError?: string
}

type Tab = 'chart' | 'news' | 'technical' | 'financial'

export default function TabsSection({
  symbol,
  news,
  newsError,
  newsLoading,
  stockHistory,
  historyError,
  historyLoading,
  analysis,
  analysisError,
  analysisLoading,
  technicalIndicators,
  technicalLoading,
  technicalError,
  companyProfile,
  financialLoading,
  financialError,
}: TabsSectionProps) {
  const [activeTab, setActiveTab] = useState<Tab>('chart')

  const tabs = [
    { id: 'chart', label: '📈 Price Chart & Alert' },
    { id: 'news', label: '📰 News & Summary' },
    { id: 'technical', label: '📊 Technical Analysis' },
    { id: 'financial', label: '💰 Company Profile' },
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
            {historyError && (
              <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-4 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm font-medium">⚠️ {historyError}</p>
              </div>
            )}
            <StockChart symbol={symbol} loading={historyLoading} />
            <AnalysisCard analysis={analysis} loading={analysisLoading} error={analysisError} showOnlyAlert />
          </>
        )}

        {/* News Tab */}
        {activeTab === 'news' && (
          <>
            <AnalysisCard analysis={analysis} loading={analysisLoading} error={analysisError} showOnlySummary />
            {newsError && (
              <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-4 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm font-medium">⚠️ {newsError}</p>
              </div>
            )}
            <NewsSection news={news} symbol={symbol} loading={newsLoading} />
          </>
        )}

        {/* Technical Analysis Tab */}
        {activeTab === 'technical' && (
          <div className="space-y-4">
            {technicalError && (
              <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-4 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm font-medium">⚠️ {technicalError}</p>
              </div>
            )}
            <RSIChart
              value={technicalIndicators?.rsi?.value}
              interpretation={technicalIndicators?.rsi?.interpretation}
              loading={technicalLoading}
            />
            <MACDChart
              macd={technicalIndicators?.macd?.macd}
              signal={technicalIndicators?.macd?.signal}
              histogram={technicalIndicators?.macd?.histogram}
              interpretation={technicalIndicators?.macd?.interpretation}
              loading={technicalLoading}
            />
            <BollingerBandsChart
              upper={technicalIndicators?.bollinger_bands?.upper}
              middle={technicalIndicators?.bollinger_bands?.middle}
              lower={technicalIndicators?.bollinger_bands?.lower}
              currentPrice={technicalIndicators?.moving_averages?.ma50}
              loading={technicalLoading}
            />
            <MovingAveragesChart
              ma20={technicalIndicators?.moving_averages?.ma20}
              ma50={technicalIndicators?.moving_averages?.ma50}
              ma200={technicalIndicators?.moving_averages?.ma200}
              currentPrice={technicalIndicators?.moving_averages?.ma50}
              loading={technicalLoading}
            />
          </div>
        )}

        {/* Financial Data Tab */}
        {activeTab === 'financial' && (
          <div className="space-y-4">
            {financialError && (
              <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-4 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm font-medium">⚠️ {financialError}</p>
              </div>
            )}
            <CompanyProfileCard
              company_name={companyProfile?.company_name}
              sector={companyProfile?.sector}
              industry={companyProfile?.industry}
              market_cap={companyProfile?.market_cap}
              pe_ratio={companyProfile?.pe_ratio}
              pb_ratio={companyProfile?.pb_ratio}
              dividend_yield={companyProfile?.dividend_yield}
              roe={companyProfile?.roe}
              roa={companyProfile?.roa}
              debt_to_equity={companyProfile?.debt_to_equity}
              current_ratio={companyProfile?.current_ratio}
              quick_ratio={companyProfile?.quick_ratio}
              loading={financialLoading}
            />
          </div>
        )}
      </div>
    </div>
  )
}
