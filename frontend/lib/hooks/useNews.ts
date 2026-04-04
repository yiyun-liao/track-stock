import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '../api'
import type { News } from '../types'

interface UseNewsState {
  data: News[]
  loading: boolean
  error: string
  refetch: () => Promise<void>
}

export function useNews(): UseNewsState {
  const [data, setData] = useState<News[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      console.log('[useNews] Fetching...')
      const response = await apiClient.getNews()
      console.log('[useNews] Data received:', response.data?.length, 'articles')

      if (response.success && Array.isArray(response.data)) {
        setData(response.data.slice(0, 5)) // Limit to 5 articles
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
  }, [])

  useEffect(() => {
    fetchData() // Only fetch once on mount
  }, [])

  return { data, loading, error, refetch: fetchData }
}
