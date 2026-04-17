'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import StockList from '@/components/StockList'
import GeneralSection from '@/components/GeneralSection/index'
import AnalysisSection from '@/components/AnalysisSection/index'
import { useStocks, useNews,  useTechnicalIndicators, useCompanyFinancials, useStockHistory, useGuardianNews, useStockScoring } from '@/lib/hooks'
import { useLanguageSafe } from '@/lib/language-context'

// Tab types
type Tab = 'chart' | 'news' | 'technical' | 'financial' | 'scoring'

const Header = dynamic(() => import('@/components/ui/Header'), { ssr: false })

export default function Dashboard() {
  // Local state - declare first before using in hooks
  const [selectedStock, setSelectedStock] = useState<string>('AAPL')
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<Tab>('chart')
  const [enabledTabs, setEnabledTabs] = useState<Set<Tab>>(new Set(['chart']))

  const { language, t } = useLanguageSafe()

  // Data layer - all fetching handled by hooks
  const { data: stocks, loading: stocksLoading, error: stocksError, refetch: refetchStocks } = useStocks()

  // Lazy-load news only when news tab is visited
  const newsEnabled = enabledTabs.has('news')
  const { data: news, loading: newsLoading, error: newsError, refetch: refetchNews } = useNews(newsEnabled, selectedStock)

  // Guardian News (independent journalism source, complementary to NewsAPI)
  // Lazy-load when news tab is visited
  const { data: guardianNews, loading: guardianLoading, error: guardianError, refetch: refetchGuardian } = useGuardianNews(
    newsEnabled,
    selectedStock
  )

  // Stock history (for chart)
  // Start immediately - must be defined before useAnalysis since analysis depends on historyLoading
  const { data: stockHistory, loading: historyLoading, error: historyError, refetch: refetchHistory } = useStockHistory(
    selectedStock,
    '1mo',  // period (default)
    true  // enabled - start immediately
  )

  // P1 (按需加载)：Technical indicators - load when user visits Technical/Scoring tab (after chart is ready)
  const historyReady = stockHistory.length > 0 || !!historyError
  const technicalEnabled = (enabledTabs.has('technical') || enabledTabs.has('scoring')) && historyReady
  const { data: technicalIndicators, loading: technicalLoading, error: technicalError, refetch: refetchTechnical } = useTechnicalIndicators(
    selectedStock,
    technicalEnabled
  )

  // P1 (按需加载)：Company financials - load when user visits Financial tab
  const financialEnabled = enabledTabs.has('financial')
  const { data: companyProfile, loading: financialLoading, error: financialError, refetch: refetchFinancial } = useCompanyFinancials(
    selectedStock,
    financialEnabled
  )

  // P2 (聚合数据)：Stock Scoring - load when user visits Scoring tab (after technical data is ready)
  const scoringEnabled = enabledTabs.has('scoring') && !!technicalIndicators && !technicalLoading
  const { data: scoringData, config: scoringConfig, loading: scoringLoading, error: scoringError, refetch: refetchScoring } = useStockScoring(
    selectedStock,
    scoringEnabled
  )

  // enabledTabs tracks which tabs user has visited
  // (no logging needed)

  // Sync selected stock when stocks load
  useEffect(() => {
    if (stocks.length > 0 && selectedStock === 'AAPL') {
      setSelectedStock(stocks[0].symbol)
    }
  }, [stocks, selectedStock])

  // Update timestamp only once on mount and when user refreshes
  useEffect(() => {
    setLastUpdate(new Date().toLocaleTimeString())
  }, [refreshTrigger])

  // Determine CRITICAL errors to display (only stocks & news)
  // Other errors are handled at component level
  const criticalError = stocksError || newsError || ''

  // Only show loading for critical data sources
  const criticalLoading = stocksLoading || newsLoading

  const handleStockSelect = useCallback((symbol: string) => {
    setSelectedStock(symbol)
    setActiveTab('chart')
    setEnabledTabs(new Set(['chart']))
  }, [])

  // Add tab to enabled set when user visits it
  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab)
    setEnabledTabs(prev => prev.has(tab) ? prev : new Set([...prev, tab]))
  }, [])

  // Manual refresh: reset to chart tab and only refresh P0 data
  const handleRefresh = useCallback(async () => {
    setRefreshTrigger(prev => prev + 1)
    setActiveTab('chart')
    setEnabledTabs(new Set(['chart']))

    // Only refresh P0 (critical) data on manual refresh
    // P1/P2 data will re-fetch when user visits those tabs
    await Promise.all([refetchStocks(), refetchHistory()])
  }, [refetchStocks, refetchHistory])

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-200">
      <Header lastUpdate={lastUpdate} onRefresh={handleRefresh} isRefreshing={criticalLoading} />

      {criticalError && (
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
            <p className="text-sm font-medium">⚠️ {criticalError}</p>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Stock List + Alert History */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <StockList
                stocks={stocks}
                selectedStock={selectedStock}
                onSelectStock={handleStockSelect}
                loading={criticalLoading}
                error={stocksError}
              />
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{t('alert.title')}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('alert.coming_soon')}</p>
            </div>
          </div>

          {/* Right Column: All Tabs */}
          <div className="lg:col-span-2">
            <GeneralSection
              symbol={selectedStock}
              news={news}
              newsError={newsError}
              newsLoading={newsLoading}
              guardianNews={guardianNews}
              guardianLoading={guardianLoading}
              stockHistory={stockHistory}
              historyError={historyError}
              historyLoading={historyLoading}
              technicalIndicators={technicalIndicators}
              technicalLoading={technicalLoading}
              technicalError={technicalError}
              companyProfile={companyProfile}
              financialLoading={financialLoading}
              financialError={financialError}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              scoringData={scoringData}
              scoringConfig={scoringConfig}
              scoringLoading={scoringLoading}
              scoringError={scoringError}
            />
            <hr className='mt-4 mb-4'/>
            <AnalysisSection
              selectedStock= {selectedStock}
              isDataLoading={historyLoading || newsLoading}
              language={language}
              stockHistory={stockHistory}
              refreshTrigger={refreshTrigger}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
