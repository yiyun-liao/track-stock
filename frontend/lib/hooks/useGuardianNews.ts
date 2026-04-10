import { useState, useEffect, useCallback } from 'react'
import { client } from '../api'
import type { News } from '../types'

interface UseGuardianNewsState {
  data: News[]
  loading: boolean
  error: string
  refetch: () => Promise<void>
}

export function useGuardianNews(enabled: boolean = true): UseGuardianNewsState {
  const [data, setData] = useState<News[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const response = await client.get('/news/guardian')

      if (response.data?.success && Array.isArray(response.data.data)) {
        const articles = response.data.data
        setData(articles)
      } else {
        setError(response.data?.error || 'Failed to fetch Guardian news')
        setData([])
      }
    } catch (err: any) {
      const message = err.response?.data?.detail || err.message || 'Failed to fetch Guardian news'
      setError(message)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      return
    }
    fetchData()
  }, [enabled, fetchData])

  return { data, loading, error, refetch: fetchData }
}
