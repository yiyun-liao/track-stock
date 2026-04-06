'use client'

import { ReactNode } from 'react'
import { Zap } from 'lucide-react'
import { useLanguageSafe } from '@/lib/language-context'

interface AnalysisCardProps {
  title: string
  icon: ReactNode
  content?: ReactNode
  footer?: ReactNode
  variant?: 'default' | 'success'
  loading?: boolean
  error?: string
}

export default function AnalysisCard({
  title,
  icon,
  content,
  footer,
  variant = 'default',
  loading = false,
  error = ''
}: AnalysisCardProps) {
  const { t } = useLanguageSafe()
  const isSuccess = variant === 'success'
  const isNetworkError = error.includes('Failed') || error.includes('fetch')

  // Loading state
  if (loading) {
    return (
      <div className={`rounded-xl border shadow-sm overflow-hidden flex flex-col ${
        isSuccess
          ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
      }`}>
        {/* Header */}
        <div className={`border-b px-6 py-4 flex-shrink-0 ${
          isSuccess
            ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-100/50 dark:bg-emerald-900/30'
            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700'
        }`}>
          <h3 className={`font-semibold flex items-center gap-2 ${
            isSuccess
              ? 'text-emerald-900 dark:text-emerald-300'
              : 'text-slate-900 dark:text-white'
          }`}>
            {icon}
            {title}
          </h3>
        </div>

        {/* Content - Loading skeleton */}
        <div className="px-6 py-4 space-y-4">
          <div className="h-6 w-40 animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={`rounded-xl border p-6 shadow-sm ${
        isNetworkError
          ? 'border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10'
          : 'border-yellow-200 bg-yellow-50 dark:border-yellow-900/30 dark:bg-yellow-900/10'
      }`}>
        <div className="flex items-start gap-3">
          <Zap className={`h-5 w-5 flex-shrink-0 mt-1 ${
            isNetworkError ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
          }`} />
          <div>
            <h3 className={`font-semibold ${
              isNetworkError ? 'text-red-900 dark:text-red-300' : 'text-yellow-900 dark:text-yellow-300'
            }`}>
              {isNetworkError ? t('error.no_connection') : 'No Data'}
            </h3>
            <p className={`text-sm mt-1 ${
              isNetworkError ? 'text-red-700 dark:text-red-400' : 'text-yellow-700 dark:text-yellow-400'
            }`}>
              {isNetworkError ? t('error.network_error', { error }) : t('error.no_data_available')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  return (
    <div className={`rounded-xl border shadow-sm overflow-hidden flex flex-col ${
      isSuccess
        ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20'
        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
    }`}>
      {/* Header */}
      <div className={`border-b px-6 py-4 flex-shrink-0 ${
        isSuccess
          ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-100/50 dark:bg-emerald-900/30'
          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700'
      }`}>
        <h3 className={`font-semibold flex items-center gap-2 ${
          isSuccess
            ? 'text-emerald-900 dark:text-emerald-300'
            : 'text-slate-900 dark:text-white'
        }`}>
          {icon}
          {title}
        </h3>
      </div>

      {/* Content */}
      <div className="px-6 py-4 overflow-y-auto max-h-96 flex-1 text-sm leading-relaxed">
        {content}
      </div>

      {/* Footer (optional) */}
      {footer && (
        <div className={`border-t px-6 py-3 flex-shrink-0 ${
          isSuccess
            ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-100/50 dark:bg-emerald-900/30'
            : 'border-slate-200 dark:border-slate-700'
        }`}>
          {footer}
        </div>
      )}
    </div>
  )
}
