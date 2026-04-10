import { useState, useCallback } from 'react'
import { apiClient } from '../api'
import type { Analysis } from '../types'

interface UseAnalysisState {
  data: Analysis | null
  loading: boolean
  error: string
  fetchData: (symbol: string, language: string, chartData?: any[]) => Promise<void>
  clearData: () => void
}

// Simple hash function for chart data
function hashChartData(prices: any[]): string {
  if (!prices || prices.length === 0) return 'no_data'
  // Use first, last, min, max prices as hash summary
  const sorted = [...prices].sort((a, b) => a.price - b.price)
  const hash = `${prices[0]?.price}-${prices[prices.length - 1]?.price}-${sorted[0]?.price}-${sorted[sorted.length - 1]?.price}`
  return hash
}

export function useAnalysis(): UseAnalysisState {
  const [data, setData] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = useCallback(async (symbol: string, language: string, chartData?: any[]) => {
    if (!symbol) return

    try {
      setLoading(true)
      setError('')
      // Calculate chart hash for smart caching
      const chartHash = chartData ? hashChartData(chartData) : undefined
      const response = await apiClient.getAnalysis(symbol, language, chartHash)

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
  }, [])

  const clearData = useCallback(() => {
    setData(null)
    setError('')
    setLoading(false)
  }, [])

  return { data, loading, error, fetchData, clearData }
}
