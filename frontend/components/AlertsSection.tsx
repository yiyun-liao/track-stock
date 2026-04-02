'use client'

import { AlertCircle, TrendingUp, Zap, BookOpen, CheckCircle } from 'lucide-react'
import type { Alert } from '@/lib/types'

interface AlertsSectionProps {
  alerts: Alert[]
  loading: boolean
}

export default function AlertsSection({ alerts, loading }: AlertsSectionProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'price':
        return <TrendingUp className="h-5 w-5 text-blue-600" />
      case 'news':
        return <Zap className="h-5 w-5 text-yellow-600" />
      case 'analysis':
        return <BookOpen className="h-5 w-5 text-purple-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-slate-600" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'price':
        return 'bg-blue-50 border-blue-200'
      case 'news':
        return 'bg-yellow-50 border-yellow-200'
      case 'analysis':
        return 'bg-purple-50 border-purple-200'
      default:
        return 'bg-slate-50 border-slate-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-900">
          🔔 Alert History
        </h2>
      </div>

      <div className="divide-y divide-slate-200">
        {loading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : !Array.isArray(alerts) || alerts.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">
              No alerts yet. Alerts will appear here as the system tracks price changes and analysis updates.
            </p>
            <p className="text-xs text-slate-400 mt-2">
              ⏰ Market hours: Mon-Fri, 9:30 AM - 4:00 PM EST
            </p>
          </div>
        ) : (
          alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`px-6 py-4 border-l-4 flex items-start gap-4 ${getAlertColor(alert.type)}`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 pt-0.5">
                {alert.read ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  getAlertIcon(alert.type)
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {alert.symbol} - {alert.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {alert.message}
                    </p>
                  </div>
                  <span className="inline-block rounded-full bg-white px-2 py-1 text-xs font-medium text-slate-600 flex-shrink-0">
                    {alert.type}
                  </span>
                </div>

                {/* Timestamp */}
                <p className="mt-2 text-xs text-slate-500">
                  {formatDate(alert.created_at)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {alerts.length > 0 && (
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 text-center">
          <p className="text-xs text-slate-500">
            {alerts.filter((a) => a.read).length} read •{' '}
            {alerts.filter((a) => !a.read).length} unread
          </p>
        </div>
      )}
    </div>
  )
}
