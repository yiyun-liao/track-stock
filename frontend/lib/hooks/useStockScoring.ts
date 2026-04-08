import { useCallback, useEffect, useState } from 'react'
import { client } from '@/lib/api'

export interface ScoringBreakdown {
  technical: number
  fundamental: number
  sentiment: number
}

export interface OverallScore {
  score: number
  score_100: number
  rating: string
  emoji: string
  color: string
  risk_level: string
  risk_label: string
  risk_description: string
  risk_color: string
  breakdown: ScoringBreakdown
  weights: {
    technical: number
    fundamental: number
    sentiment: number
  }
}

export interface TradingSignal {
  type: string
  signal: string
}

export interface Signals {
  signals: TradingSignal[]
  action: string
  signal_count: number
}

export interface Scores {
  technical: number
  fundamental: number
  sentiment: number
  overall: OverallScore
}

export interface ScoringData {
  symbol: string
  scores: Scores
  signals: Signals
  timestamp: string
  status: string
}

export interface ScoringConfig {
  weights: Record<string, number>
  technical: Record<string, any>
  fundamental: Record<string, any>
  sentiment: Record<string, any>
  overall: Record<string, any>
  signals: Record<string, any>
}

export function useStockScoring(symbol: string, enabled: boolean = true) {
  const [data, setData] = useState<ScoringData | null>(null)
  const [config, setConfig] = useState<ScoringConfig | null>(null)
  const [loading, setLoading] = useState(false)
  const [configLoading, setConfigLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch scoring configuration (one time on mount)
  useEffect(() => {
    const fetchConfig = async () => {
      if (configLoading || config) return // Only fetch once

      setConfigLoading(true)
      try {
        const response = await client.get('/scoring/config')
        if (response.data?.success) {
          setConfig(response.data.data)
        }
      } catch (err: any) {
        console.error('Failed to fetch scoring config:', err)
      } finally {
        setConfigLoading(false)
      }
    }

    fetchConfig()
  }, [])

  // Fetch scoring data
  const fetch = useCallback(async () => {
    if (!enabled || !symbol) return

    setLoading(true)
    setError('')

    try {
      const response = await client.get(`/scoring/comprehensive/${symbol}`)

      if (response.data?.success) {
        setData(response.data.data)
      } else {
        setError(response.data?.error || 'Failed to fetch stock scoring')
      }
    } catch (err: any) {
      const message = err.response?.data?.detail || err.message || 'Failed to fetch stock scoring'
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
    config,
    loading,
    configLoading,
    error,
    refetch,
  }
}
