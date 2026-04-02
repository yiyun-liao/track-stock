import { TrendingUp, RefreshCw } from 'lucide-react'

interface HeaderProps {
  lastUpdate: string
}

export default function Header({ lastUpdate }: HeaderProps) {
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

          {/* Status Info */}
          <div className="text-right">
            <div className="flex items-center justify-end gap-2">
              <RefreshCw className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-600">
                {lastUpdate ? `Updated: ${lastUpdate}` : 'Loading...'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              📊 Real-time market data
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
