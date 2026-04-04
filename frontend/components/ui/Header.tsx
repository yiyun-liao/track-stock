'use client'

import { TrendingUp, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { ThemeToggle } from './ThemeToggle'
import { LanguageToggle } from './LanguageToggle'
import { useLanguage } from '@/lib/language-context'

interface HeaderProps {
  lastUpdate: string
  onRefresh: () => Promise<void>
  isRefreshing?: boolean
}

export default function Header({ lastUpdate, onRefresh, isRefreshing = false }: HeaderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useLanguage()

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      await onRefresh()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 p-2">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t('header.title')}
              </h1>
          </div>

          {/* Status Info & Control Buttons */}
          <div className="text-right">
            <div className="flex items-center justify-end gap-3">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {lastUpdate ? `${t('header.updated')}${lastUpdate}` : t('header.never')}
              </span>
              <button
                onClick={handleRefresh}
                disabled={isLoading || isRefreshing}
                className={`p-2 rounded-lg transition-colors ${
                  isLoading || isRefreshing
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
                title={t('header.refresh')}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading || isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
