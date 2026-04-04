import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '../api'
import type { Analysis } from '../types'

interface UseAnalysisState {
  data: Analysis | null
  loading: boolean
  error: string
  refetch: () => Promise<void>
}

export function useAnalysis(symbol: string, enabled: boolean = true, language: string = 'zh'): UseAnalysisState {
  const [data, setData] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    if (!symbol) return

    try {
      setLoading(true)
      setError('')
      console.log(`[useAnalysis] Analyzing ${symbol} (${language})...`)
      const response = await apiClient.getAnalysis(symbol, language)
      console.log(`[useAnalysis] ${symbol} analysis received:`, response.data?.data_sources)

      if (response.success && response.data) {
        const analysis = response.data as Analysis
        // Check if analysis has critical content (price alert and investment advice)
        // news_summary might be empty if no recent news, that's okay
        const hasContent =
          analysis.price_alert &&
          analysis.price_alert.length > 10 &&
          analysis.investment_advice &&
          analysis.investment_advice.length > 10

        if (hasContent) {
          setData(analysis)
        } else {
          setError('Insufficient data for analysis')
          setData(null)
        }
      } else {
        setError(response.error || 'Failed to fetch analysis')
        setData(null)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch analysis'
      setError(message)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [symbol, language])

  useEffect(() => {
    if (!enabled) return
    fetchData()
  }, [symbol, enabled, fetchData, language])

  return { data, loading, error, refetch: fetchData }
}
