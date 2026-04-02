'use client'

import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { apiClient } from '@/lib/api'

interface StockChartProps {
  symbol: string
  loading: boolean
}

interface ChartData {
  date: string
  price: number
}

export default function StockChart({ symbol, loading }: StockChartProps) {
  const [data, setData] = useState<ChartData[]>([])
  const [chartLoading, setChartLoading] = useState(true)

  useEffect(() => {
    if (symbol) {
      fetchChartData()
    }
  }, [symbol])

  const fetchChartData = async () => {
    try {
      setChartLoading(true)
      const response = await apiClient.getStockHistory(symbol, '1mo')

      if (response.success && response.data?.prices) {
        const formattedData = response.data.prices.map((item) => ({
          date: new Date(item.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          price: item.price,
        }))
        setData(formattedData)
      }
    } catch (error) {
      console.error('Failed to fetch chart data:', error)
      setData([])
    } finally {
      setChartLoading(false)
    }
  }

  if (chartLoading || loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-80 animate-pulse rounded-lg bg-slate-100" />
      </div>
    )
  }

  const minPrice = data.length > 0 ? Math.min(...data.map((d) => d.price)) : 0
  const maxPrice = data.length > 0 ? Math.max(...data.map((d) => d.price)) : 100

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">
          📈 {symbol} Price Chart (30 Days)
        </h2>
        <p className="text-sm text-slate-500">
          Price range: ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex h-80 items-center justify-center rounded-lg bg-slate-50">
          <p className="text-slate-500">No chart data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
              domain={['dataMin - 5', 'dataMax + 5']}
              label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
              formatter={(value) => `$${(value as number).toFixed(2)}`}
              labelStyle={{ color: '#1f2937' }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
