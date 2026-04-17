import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '../api'
import { PricePoint } from '../types'

interface UseStockHistoryState {
  data: PricePoint[]
  loading: boolean
  error: string
  refetch: () => Promise<void>
}

export function useStockHistory(
  symbol: string,
  period: string = '1mo',
  enabled: boolean = true
): UseStockHistoryState {
  const [data, setData] = useState<PricePoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    if (!symbol) return

    try {
      setLoading(true)
      setError('')
      const response = await apiClient.getStockHistory(symbol, period)

      if (response.success && response.data?.prices) {
        setData(response.data.prices)
      } else {
        setError(response.error || 'Failed to fetch price history')
        setData([])
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch price history'
      setError(message)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [symbol, period])

  useEffect(() => {
    if (!enabled) return
    fetchData()
  }, [enabled, fetchData])

  return { data, loading, error, refetch: fetchData }
}
