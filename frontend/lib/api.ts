import axios, { AxiosError } from 'axios'
import type { Stock, News, Analysis, ApiResponse } from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

const client = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Handle response errors
client.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 404) {
      console.error('API endpoint not found:', error.config?.url)
    }
    return Promise.reject(error)
  }
)

export { client }

export const apiClient = {
  /**
   * Get latest stock prices for tracked symbols
   */
  async getStocks(): Promise<ApiResponse<Stock[]>> {
    try {
      const response = await client.get('/stocks')
      return response.data
    } catch (error) {
      console.error('Failed to fetch stocks:', error)
      return {
        success: false,
        error: 'Failed to fetch stock data',
        data: [],
      }
    }
  },

  /**
   * Get historical price data for a specific stock
   */
  async getStockHistory(
    symbol: string,
    period: string = '1mo'
  ): Promise<ApiResponse<{ symbol: string; prices: Array<{ date: string; price: number }> }>> {
    try {
      const response = await client.get(`/stocks/${symbol}/history`, {
        params: { period },
      })
      return response.data
    } catch (error) {
      console.error(`Failed to fetch history for ${symbol}:`, error)
      return {
        success: false,
        error: `Failed to fetch price history for ${symbol}`,
      }
    }
  },

  /**
   * Get latest news articles
   */
  async getNews(symbol?: string): Promise<ApiResponse<News[]>> {
    try {
      const params = symbol ? { symbol } : {}
      const response = await client.get('/news', { params })
      return response.data
    } catch (error) {
      console.error('Failed to fetch news:', error)
      return {
        success: false,
        error: 'Failed to fetch news data',
        data: [],
      }
    }
  },

  /**
   * Get news for a specific stock
   */
  async getStockNews(symbol: string): Promise<ApiResponse<News[]>> {
    return this.getNews(symbol)
  },

  /**
   * Get AI analysis for a stock
   */
  async getAnalysis(symbol: string, language: string = 'zh'): Promise<ApiResponse<Analysis>> {
    try {
      const response = await client.get(`/analysis/${symbol}`, {
        params: { language },
      })
      return response.data
    } catch (error) {
      console.error(`Failed to fetch analysis for ${symbol}:`, error)
      return {
        success: false,
        error: `Failed to fetch analysis for ${symbol}`,
      }
    }
  },

  /**
   * Get price alerts
   */
  async getAlerts(): Promise<ApiResponse<{ alerts: Array<any> }>> {
    try {
      const response = await client.get('/alerts')
      return response.data
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
      return {
        success: false,
        error: 'Failed to fetch alerts',
      }
    }
  },

  /**
   * Get system status
   */
  async getStatus(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    try {
      const response = await client.get('/status')
      return response.data
    } catch (error) {
      console.error('Failed to fetch status:', error)
      return {
        success: false,
        error: 'Failed to fetch system status',
      }
    }
  },
}
