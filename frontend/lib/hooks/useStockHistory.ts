import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '../api'

interface PricePoint {
  date: string
  price: number
}

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
      console.log(`[useStockHistory] Fetching ${symbol} history (${period})...`)
      const response = await apiClient.getStockHistory(symbol, period)
      console.log(`[useStockHistory] ${symbol} data received:`, response.data?.prices?.length, 'prices')

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
  }, [symbol, period, enabled, fetchData])

  return { data, loading, error, refetch: fetchData }
}
