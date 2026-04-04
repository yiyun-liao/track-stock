'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import StockList from '@/components/StockList'
import TabsSection from '@/components/TabsSection'
import AlertsSection from '@/components/AlertsSection'
import { useStocks, useNews, useAnalysis, useTechnicalIndicators, useCompanyFinancials } from '@/lib/hooks'
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
  const [mounted, setMounted] = useState(false)

  // Single analysis fetch for both AnalysisCard instances
  const { data: analysis, loading: analysisLoading, error: analysisError, refetch: refetchAnalysis } = useAnalysis(
    selectedStock,
    mounted && !stocksLoading,
    language
  )

  // Technical indicators (for Tab 3)
  const { data: technicalIndicators, loading: technicalLoading, error: technicalError, refetch: refetchTechnical } = useTechnicalIndicators(
    selectedStock,
    mounted && !stocksLoading
  )

  // Company financials (for Tab 4)
  const { data: companyProfile, loading: financialLoading, error: financialError, refetch: refetchFinancial } = useCompanyFinancials(
    selectedStock,
    mounted && !stocksLoading
  )

  // Hydration safety
  useEffect(() => {
    setMounted(true)
  }, [])

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

  // Determine error to display
  const error = stocksError || newsError || analysisError || technicalError || financialError || ''
  const loading = stocksLoading || newsLoading || analysisLoading || technicalLoading || financialLoading

  const handleStockSelect = useCallback((symbol: string) => {
    setSelectedStock(symbol)
    console.log('*** Selected stock:', symbol)
  }, [])

  // Manual refresh all data
  const handleRefresh = useCallback(async () => {
    await Promise.all([refetchStocks(), refetchNews(), refetchAnalysis(), refetchTechnical(), refetchFinancial()])
  }, [refetchStocks, refetchNews, refetchAnalysis, refetchTechnical, refetchFinancial])

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-200">
      <Header lastUpdate={lastUpdate} onRefresh={handleRefresh} isRefreshing={loading} />

      {error && (
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
            <p className="text-sm font-medium">⚠️ {error}</p>
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
              loading={loading}
            />
          </div>

          {/* Right Column: Tabs for Chart/News/Technical/Financial */}
          <div className="lg:col-span-2">
            <TabsSection
              symbol={selectedStock}
              news={news}
              loading={loading}
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
        <AlertsSection alerts={alerts} loading={loading} />
      </div>
    </main>
  )
}
