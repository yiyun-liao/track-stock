'use client'

import { useState } from 'react'
import Button from '../ui/Button'
import StockChart from './component/StockChart'
import NewsSection from './component/NewsSection'
import { RSIChart } from './component/RSIChart'
import { MACDChart } from './component/MACDChart'
import { BollingerBandsChart } from './component/BollingerBandsChart'
import { MovingAveragesChart } from './component/MovingAveragesChart'
import { CompanyProfileCard } from './component/CompanyProfileCard'
import type { News, Analysis } from '@/lib/types'
import type { TechnicalIndicators } from '@/lib/hooks/useTechnicalIndicators'
import type { CompanyProfile } from '@/lib/hooks/useCompanyFinancials'

interface GeneralSectionProps {
  symbol: string
  news: News[]
  newsError: string
  newsLoading: boolean
  guardianNews?: News[]
  guardianLoading?: boolean
  stockHistory?: any
  historyError: string
  historyLoading: boolean
  technicalIndicators?: TechnicalIndicators | null
  technicalLoading?: boolean
  technicalError?: string
  companyProfile?: CompanyProfile | null
  financialLoading?: boolean
  financialError?: string
}

type Tab = 'chart' | 'news' | 'technical' | 'financial'

export default function GeneralSection({
  symbol,
  news,
  newsError,
  newsLoading,
  guardianNews = [],
  guardianLoading = false,
  stockHistory,
  historyError,
  historyLoading,
  technicalIndicators,
  technicalLoading,
  technicalError,
  companyProfile,
  financialLoading,
  financialError,
}: GeneralSectionProps) {
  const [activeTab, setActiveTab] = useState<Tab>('chart')

  const generalTabs = [
    { id: 'chart', label: '📈 Price Chart' },
    { id: 'news', label: '📰 News' },
    { id: 'technical', label: '📊 Technical Analysis' },
    { id: 'financial', label: '💰 Company Profile' },
  ] as const

  const ErrorNotification = ({ error }: { error: string }) => (
    <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-4 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
      <p className="text-sm font-medium">⚠️ {error}</p>
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Tab Navigation - General Section */}
      <div className="space-y-4">
        <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-700">
          {generalTabs.map((tab) => (
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
      <div className="space-y-6 max-h-[512px] overflow-y-auto">
        {/* Chart & Alert Tab */}
        {activeTab === 'chart' && (
          <>
            {historyError && <ErrorNotification error={historyError} />}
            <StockChart symbol={symbol} data={stockHistory || []} loading={historyLoading} />
          </>
        )}

        {/* News Tab */}
        {activeTab === 'news' && (
          <>
            {newsError && (<ErrorNotification error={newsError} />)}
            <NewsSection
              news={news}
              symbol={symbol}
              loading={newsLoading}
              guardianNews={guardianNews}
              guardianLoading={guardianLoading}
            />
          </>
        )}

        {/* Technical Analysis Tab */}
        {activeTab === 'technical' && (
          <>
            {technicalError && (<ErrorNotification error={technicalError} />)}
          <div className="space-y-4 h-full overflow-y-auto">
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
          </>
        )}

        {/* Financial Data Tab */}
        {activeTab === 'financial' && (
          <>
            {financialError && (<ErrorNotification error={financialError} />)}
          <div className="space-y-4  h-full overflow-y-auto">
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
          </>
        )}
      </div>
    </div>
  )
}
