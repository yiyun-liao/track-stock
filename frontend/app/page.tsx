'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import StockList from '@/components/StockList'
import TabsSection from '@/components/TabsSection'
import AlertsSection from '@/components/AlertsSection'
import { useStocks, useNews } from '@/lib/hooks'
import type { Alert } from '@/lib/types'

export default function Dashboard() {
  // Data layer - all fetching handled by hooks
  const { data: stocks, loading: stocksLoading, error: stocksError, refetch: refetchStocks } = useStocks()
  const { data: news, loading: newsLoading, error: newsError, refetch: refetchNews } = useNews()

  // Local state
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [selectedStock, setSelectedStock] = useState<string>('AAPL')
  const [lastUpdate, setLastUpdate] = useState<string>('')

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
  const error = stocksError || newsError || ''
  const loading = stocksLoading || newsLoading

  const handleStockSelect = (symbol: string) => {
    setSelectedStock(symbol)
    console.log('*** Selected stock:', symbol)
  }

  // Manual refresh all data
  const handleRefresh = async () => {
    await Promise.all([refetchStocks(), refetchNews()])
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header lastUpdate={lastUpdate} onRefresh={handleRefresh} isRefreshing={loading} />

      {error && (
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-red-50 p-4 text-red-700">
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

          {/* Right Column: Tabs for Chart/News */}
          <div className="lg:col-span-2">
            <TabsSection symbol={selectedStock} news={news} loading={loading} />
          </div>
        </div>

        {/* Alerts Section - Full Width */}
        <AlertsSection alerts={alerts} loading={loading} />
      </div>
    </main>
  )
}
