import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '../api'
import type { News } from '../types'

interface UseNewsState {
  data: News[]
  loading: boolean
  error: string
  refetch: () => Promise<void>
}

export function useNews(enabled: boolean = true, symbol: string = 'AAPL'): UseNewsState {
  const [data, setData] = useState<News[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const response = await apiClient.getNews(symbol)

      if (response.success && Array.isArray(response.data)) {
        const articles = response.data.slice(0, 5)
        setData(articles)
      } else {
        setError(response.error || 'Failed to fetch news')
        setData([])
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch news'
      setError(message)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [symbol])

  useEffect(() => {
    if (!enabled) {
      return
    }
    fetchData()
  }, [enabled, fetchData])

  return { data, loading, error, refetch: fetchData }
}
