import { useCallback, useEffect, useState } from 'react'
import { client } from '@/lib/api'

export interface TechnicalIndicators {
  symbol: string
  rsi?: {
    value: number
    interpretation: string
    timestamp: string
  }
  macd?: {
    macd: number
    signal: number
    histogram: number
    interpretation: string
    timestamp: string
  }
  bollinger_bands?: {
    upper: number
    middle: number
    lower: number
    timestamp: string
  }
  moving_averages?: {
    ma20?: number
    ma50?: number
    ma200?: number
  }
  timestamp: string
  status: string
}

export function useTechnicalIndicators(symbol: string, enabled: boolean = true) {
  const [data, setData] = useState<TechnicalIndicators | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetch = useCallback(async () => {
    if (!enabled || !symbol) return

    setLoading(true)
    setError('')

    try {
      const response = await client.get(`/indicators/technical/${symbol}`)

      if (response.data?.success) {
        setData(response.data.data)
      } else {
        setError(response.data?.error || 'Failed to fetch technical indicators')
      }
    } catch (err: any) {
      const message = err.response?.data?.detail || err.message || 'Failed to fetch technical indicators'
      setError(message)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [symbol, enabled])

  const refetch = useCallback(async () => {
    await fetch()
  }, [fetch])

  useEffect(() => {
    if (enabled && symbol) {
      fetch()
    }
  }, [symbol, enabled, fetch])

  return {
    data,
    loading,
    error,
    refetch,
  }
}
