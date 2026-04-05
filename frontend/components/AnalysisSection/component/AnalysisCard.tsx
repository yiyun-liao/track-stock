'use client'

import { ReactNode } from 'react'

interface AnalysisCardProps {
  title: string
  icon: ReactNode
  content: ReactNode
  footer?: ReactNode
  variant?: 'default' | 'success'
}

export default function AnalysisCard({
  title,
  icon,
  content,
  footer,
  variant = 'default'
}: AnalysisCardProps) {
  const isSuccess = variant === 'success'

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
