'use client'

import { ExternalLink, Calendar } from 'lucide-react'
import type { News } from '@/lib/types'

interface NewsSectionProps {
  news: News[]
  symbol: string
  loading: boolean
}

export default function NewsSection({ news, symbol, loading }: NewsSectionProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const stockNews = news.filter((n) => !n.symbol || n.symbol === symbol)

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-900">
          📰 Latest News
        </h2>
      </div>

      <div className="divide-y divide-slate-200">
        {loading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : stockNews.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-500">
              No news available for {symbol}
            </p>
          </div>
        ) : (
          stockNews.map((article, idx) => (
            <a
              key={idx}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-6 py-4 transition-colors hover:bg-blue-50"
            >
              <div className="space-y-2">
                {/* Title */}
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 line-clamp-2 hover:text-blue-600">
                      {article.title}
                    </h3>
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-400 flex-shrink-0 mt-1" />
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 line-clamp-2">
                  {article.description}
                </p>

                {/* Meta: Source & Date */}
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {article.source}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="h-3 w-3" />
                    {formatDate(article.published_at)}
                  </div>
                </div>
              </div>
            </a>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 text-center">
        <p className="text-xs text-slate-500">
          {stockNews.length} articles • Powered by NewsAPI
        </p>
      </div>
    </div>
  )
}
