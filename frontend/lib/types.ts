export interface Stock {
  symbol: string
  price: number
  change: number
  change_pct: number
  volume: number
  timestamp?: string
  high_52w?: number
  low_52w?: number
}

export interface StockPrice {
  timestamp: string
  price: number
}

export interface StockHistory {
  date: string
  price: number
}

export interface News {
  id?: string
  symbol?: string
  title: string
  description: string
  source: string
  url: string
  published_at: string
  image_url?: string
}

export interface Alert {
  id?: string
  symbol: string
  type: 'price' | 'news' | 'analysis'
  title: string
  message: string
  created_at: string
  read: boolean
}

export interface Analysis {
  symbol: string
  news_summary: string
  price_alert: string
  investment_advice: string
  timestamp?: string
  data_sources?: ('股價' | '新聞' | '財報' | '指數')[]
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp?: string
}
