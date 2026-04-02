'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import StockList from '@/components/StockList'
import StockChart from '@/components/StockChart'
import NewsSection from '@/components/NewsSection'
import AlertsSection from '@/components/AlertsSection'
import { apiClient } from '@/lib/api'
import type { Stock, News, Alert } from '@/lib/types'

export default function Dashboard() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [news, setNews] = useState<News[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [selectedStock, setSelectedStock] = useState<string>('AAPL')
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')

      const [stocksData, newsData] = await Promise.all([
        apiClient.getStocks(),
        apiClient.getNews(),
      ])

      if (stocksData.success && stocksData.data) {
        setStocks(stocksData.data)
        if (stocksData.data.length > 0 && !stocks.length) {
          setSelectedStock(stocksData.data[0].symbol)
        }
      }

      if (newsData.success && newsData.data) {
        setNews(newsData.data.slice(0, 5))
      }

      setLastUpdate(new Date().toLocaleTimeString())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleStockSelect = (symbol: string) => {
    setSelectedStock(symbol)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header lastUpdate={lastUpdate} />

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
          <div className="lg:col-span-1">
            <StockList
              stocks={stocks}
              selectedStock={selectedStock}
              onSelectStock={handleStockSelect}
              loading={loading}
            />
          </div>

          {/* Right Column: Chart and Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Stock Chart */}
            <StockChart symbol={selectedStock} loading={loading} />

            {/* News Section */}
            <NewsSection news={news} symbol={selectedStock} loading={loading} />
          </div>
        </div>

        {/* Alerts Section - Full Width */}
        <AlertsSection alerts={alerts} loading={loading} />
      </div>
    </main>
  )
}
