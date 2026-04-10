import { useCallback, useEffect, useState } from 'react'
import { client } from '@/lib/api'

export interface CompanyProfile {
  symbol: string
  company_name?: string
  sector?: string
  industry?: string
  ceo?: string
  website?: string
  market_cap?: number
  pe_ratio?: number
  pb_ratio?: number
  dividend_yield?: number
  revenue?: number
  profit_margin?: number
  roe?: number
  roa?: number
  debt_to_equity?: number
  current_ratio?: number
  quick_ratio?: number
  timestamp: string
  status: string
}

export function useCompanyFinancials(symbol: string, enabled: boolean = true) {
  const [data, setData] = useState<CompanyProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetch = useCallback(async () => {
    if (!enabled || !symbol) return

    setLoading(true)
    setError('')

    try {
      const response = await client.get(`/financials/profile/${symbol}`)

      if (response.data?.success) {
        const data = response.data.data
        setData(data)
      } else {
        setError(response.data?.error || 'Failed to fetch company profile')
      }
    } catch (err: any) {
      const message = err.response?.data?.detail || err.message || 'Failed to fetch company profile'
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
    if (!enabled) {
      return
    }
    if (!symbol) {
      return
    }
    fetch()
  }, [symbol, enabled, fetch])

  // Clear old data when symbol changes to avoid stale data confusion
  useEffect(() => {
    if (data && data.symbol !== symbol) {
      setData(null)
    }
  }, [symbol, data])

  return {
    data,
    loading,
    error,
    refetch,
  }
}
