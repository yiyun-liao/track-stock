'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import StockList from '@/components/StockList'
import TabsSection from '@/components/TabsSection'
import AlertsSection from '@/components/AlertsSection'
import { useStocks, useNews, useAnalysis, useTechnicalIndicators, useCompanyFinancials, useStockHistory, useGuardianNews } from '@/lib/hooks'
import { useLanguageSafe } from '@/lib/language-context'
import type { Alert } from '@/lib/types'

const Header = dynamic(() => import('@/components/ui/Header'), { ssr: false })

export default function Dashboard() {
  // Data layer - all fetching handled by hooks
  const { data: stocks, loading: stocksLoading, error: stocksError, refetch: refetchStocks } = useStocks()
  const { data: news, loading: newsLoading, error: newsError, refetch: refetchNews } = useNews()
  const { language } = useLanguageSafe()

  // Local state
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [selectedStock, setSelectedStock] = useState<string>('AAPL')
  const [lastUpdate, setLastUpdate] = useState<string>('')

  // Guardian News (independent journalism source, complementary to NewsAPI)
  // Start immediately - no mounted check needed
  const { data: guardianNews, loading: guardianLoading, error: guardianError, refetch: refetchGuardian } = useGuardianNews(
    true
  )

  // Single analysis fetch for both AnalysisCard instances
  // Wait for chart and news to load first
  const { data: analysis, loading: analysisLoading, error: analysisError, refetch: refetchAnalysis } = useAnalysis(
    selectedStock,
    !historyLoading && !newsLoading,  // Only start after chart & news are ready
    language
  )

  // Technical indicators (for Tab 3)
  // Start immediately
  const { data: technicalIndicators, loading: technicalLoading, error: technicalError, refetch: refetchTechnical } = useTechnicalIndicators(
    selectedStock,
    true
  )

  // Company financials (for Tab 4)
  // Start immediately
  const { data: companyProfile, loading: financialLoading, error: financialError, refetch: refetchFinancial } = useCompanyFinancials(
    selectedStock,
    true
  )

  // Stock history (for chart)
  // Start immediately
  const { data: stockHistory, loading: historyLoading, error: historyError, refetch: refetchHistory } = useStockHistory(
    selectedStock,
    '1mo',  // period (default)
    true  // enabled - start immediately
  )

  // Sync selected stock when stocks load
  useEffect(() => {
    if (stocks.length > 0 && selectedStock === 'AAPL') {
      setSelectedStock(stocks[0].symbol)
    }
  }, [stocks])

  // Update timestamp
  useEffect(() => {
    setLastUpdate(new Date().toLocaleTimeString())
  }, [stocks, news])

  // Determine CRITICAL errors to display (only stocks & news)
  // Other errors are handled at component level
  const criticalError = stocksError || newsError || ''

  // Only show loading for critical data sources
  const criticalLoading = stocksLoading || newsLoading

  const handleStockSelect = useCallback((symbol: string) => {
    setSelectedStock(symbol)
    console.log('*** Selected stock:', symbol)
  }, [])

  // Manual refresh all data (including optional sources)
  const handleRefresh = useCallback(async () => {
    await Promise.all([
      refetchStocks(),
      refetchNews(),
      refetchAnalysis(),
      refetchTechnical(),
      refetchFinancial(),
      refetchHistory(),
      refetchGuardian(),
    ])
  }, [refetchStocks, refetchNews, refetchAnalysis, refetchTechnical, refetchFinancial, refetchHistory, refetchGuardian])

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
          {/* Left Column: Stock List */}
          <div className="lg:col-span-1 max-h-full overflow-y-auto">
            <StockList
              stocks={stocks}
              selectedStock={selectedStock}
              onSelectStock={handleStockSelect}
              loading={criticalLoading}
              error={stocksError}
            />
          </div>

          {/* Right Column: Tabs for Chart/News/Technical/Financial */}
          <div className="lg:col-span-2">
            <TabsSection
              symbol={selectedStock}
              news={news}
              newsError={newsError}
              newsLoading={newsLoading}
              guardianNews={guardianNews}
              guardianLoading={guardianLoading}
              stockHistory={stockHistory}
              historyError={historyError}
              historyLoading={historyLoading}
              analysis={analysis}
              analysisError={analysisError}
              analysisLoading={analysisLoading}
              technicalIndicators={technicalIndicators}
              technicalLoading={technicalLoading}
              technicalError={technicalError}
              companyProfile={companyProfile}
              financialLoading={financialLoading}
              financialError={financialError}
            />
          </div>
        </div>

        {/* Alerts Section - Full Width */}
        <AlertsSection alerts={alerts} loading={criticalLoading} />
      </div>
    </main>
  )
}
