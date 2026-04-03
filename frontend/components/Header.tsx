'use client'

import { TrendingUp, RefreshCw } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
  lastUpdate: string
  onRefresh: () => Promise<void>
  isRefreshing?: boolean
}

export default function Header({ lastUpdate, onRefresh, isRefreshing = false }: HeaderProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      await onRefresh()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 p-2">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Track Stock
              </h1>
              <p className="text-sm text-slate-500">
                AI-Powered Stock Tracking & Analysis
              </p>
            </div>
          </div>

          {/* Status Info & Refresh Button */}
          <div className="text-right">
            <div className="flex items-center justify-end gap-3">
              <div>
                <span className="text-sm font-medium text-slate-600">
                  {lastUpdate ? `Updated: ${lastUpdate}` : 'Never'}
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  📊 Manual refresh
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isLoading || isRefreshing}
                className={`p-2 rounded-lg transition-colors ${
                  isLoading || isRefreshing
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
                title="Refresh data"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading || isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
