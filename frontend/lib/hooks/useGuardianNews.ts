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
      // Use configured axios client to ensure correct API base URL
      const response = await client.get('/news/guardian')

      if (response.data?.success && Array.isArray(response.data.data)) {
        setData(response.data.data)
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
    if (!enabled) return
    fetchData() // Only fetch once on mount
  }, [enabled, fetchData])

  return { data, loading, error, refetch: fetchData }
}
