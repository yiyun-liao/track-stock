'use client'

import { ExternalLink, Calendar } from 'lucide-react'
import { useLanguageSafe } from '@/lib/language-context'
import type { News } from '@/lib/types'

interface NewsSectionProps {
  news: News[]
  symbol: string
  loading: boolean
  guardianNews?: News[]
  guardianLoading?: boolean
}

export default function NewsSection({
  news,
  symbol,
  loading,
  guardianNews = [],
  guardianLoading = false,
}: NewsSectionProps) {
  const { t } = useLanguageSafe()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const stockNews = news.filter((n) => !n.symbol || n.symbol === symbol)
  const guardianNewsFiltered = guardianNews.filter((n) => !n.symbol || n.symbol === symbol)
  // Combine and sort by date (newest first)
  const allNews = [
    ...stockNews,
    ...guardianNewsFiltered,
  ].sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())

  const isLoading = loading || guardianLoading

  return (
    <div className="h-full flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col  divide-y divide-slate-200 dark:divide-slate-700">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-700" />
              ))}
            </div>
          ) : !Array.isArray(allNews) || allNews.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t('news.no_news_for_symbol').replace('{symbol}', symbol)}
              </p>
            </div>
          ) : (
            allNews.map((article, idx) => (
              <a
                key={idx}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-6 py-4 transition-all hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <div className="space-y-2">
                  {/* Title */}
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {article.title}
                      </h3>
                    </div>
                    <ExternalLink className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" />
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                    {article.description}
                  </p>

                  {/* Meta: Source & Date */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-block rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                      {article.source}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Calendar className="h-3 w-3" />
                      {formatDate(article.published_at)}
                    </div>
                  </div>
                </div>
              </a>
            ))
          )}
      </div>
      <div className="shrink-0 border-t border-slate-200 bg-slate-50 dark:bg-slate-700 px-6 py-3 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">
        {t('news.total_articles').replace('{count}', allNews.length.toString())} {guardianNewsFiltered.length > 0 && `(${stockNews.length} NewsAPI + ${guardianNewsFiltered.length} Guardian)`}
        </p>
      </div>
    </div>
  )
}
