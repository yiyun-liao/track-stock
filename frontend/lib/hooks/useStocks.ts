import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '../api'
import type { Stock } from '../types'

interface UseStocksState {
  data: Stock[]
  loading: boolean
  error: string
  refetch: () => Promise<void>
}

export function useStocks(): UseStocksState {
  const [data, setData] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const response = await apiClient.getStocks()

      if (response.success && Array.isArray(response.data)) {
        setData(response.data)
      } else {
        setError(response.error || 'Failed to fetch stocks')
        setData([])
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch stocks'
      setError(message)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData() // Only fetch once on mount
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
