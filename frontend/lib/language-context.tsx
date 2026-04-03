'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Language = 'zh' | 'en'

interface LanguageContextType {
  language: Language
  toggleLanguage: () => void
  t: (key: string, defaults?: { [key: string]: string }) => string
}

const translations: Record<Language, Record<string, string>> = {
  zh: {
    'header.title': 'Track Stock',
    'header.subtitle': 'AI 驅動的股票追蹤和分析',
    'header.updated': '已更新：',
    'header.never': '未更新',
    'header.manual_refresh': '📊 手動刷新',
    'header.refresh': '刷新數據',
    'stocklist.title': '📊 追蹤股票',
    'stocklist.stock_price': '股票價格',
    'stocklist.stocks_count': '支股票',
    'stocklist.click_refresh': '按刷新按鈕更新',
    'stocklist.failed': '加載股票失敗',
    'stocklist.no_stocks': '尚未追蹤任何股票',
    'news.title': '📰 最新新聞',
    'news.no_news': '沒有可用的新聞',
    'tabs.chart': '價格圖表和警報',
    'tabs.news': '新聞和摘要',
    'analysis.price_chart': '📈 {symbol} 價格圖表（30 天）',
    'analysis.price_range': '價格範圍：',
    'analysis.news_summary': '📰 新聞摘要',
    'analysis.price_alert': '📈 價格警報',
    'analysis.investment_advice': '💡 投資建議',
    'analysis.analysis_updated': '分析更新：',
    'analysis.no_data': '無分析數據',
    'analysis.no_connection': '無法獲取分析',
    'analysis.retry': '重新嘗試',
    'error.network': 'API 連接失敗',
    'error.no_data': '缺少分析所需的完整數據',
  },
  en: {
    'header.title': 'Track Stock',
    'header.subtitle': 'AI-Powered Stock Tracking & Analysis',
    'header.updated': 'Updated: ',
    'header.never': 'Never',
    'header.manual_refresh': '📊 Manual refresh',
    'header.refresh': 'Refresh data',
    'stocklist.title': '📊 Tracked Stocks',
    'stocklist.stock_price': 'Stock Price',
    'stocklist.stocks_count': 'stocks',
    'stocklist.click_refresh': 'Click refresh button to update',
    'stocklist.failed': 'Failed to load stocks',
    'stocklist.no_stocks': 'No stocks tracked yet',
    'news.title': '📰 Latest News',
    'news.no_news': 'No news available',
    'tabs.chart': 'Price Chart & Alert',
    'tabs.news': 'News & Summary',
    'analysis.price_chart': '📈 {symbol} Price Chart (30 Days)',
    'analysis.price_range': 'Price range: ',
    'analysis.news_summary': '📰 News Summary',
    'analysis.price_alert': '📈 Price Alert',
    'analysis.investment_advice': '💡 Investment Advice',
    'analysis.analysis_updated': 'Analysis updated: ',
    'analysis.no_data': 'No analysis data',
    'analysis.no_connection': 'Unable to get analysis',
    'analysis.retry': 'Retry',
    'error.network': 'API connection failed',
    'error.no_data': 'Missing data required for analysis',
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('zh')
  const [mounted, setMounted] = useState(false)

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language | null
    const browserLanguage = navigator.language.startsWith('zh') ? 'zh' : 'en'
    const initialLanguage = savedLanguage || browserLanguage
    setLanguage(initialLanguage)
    setMounted(true)
  }, [])

  // Update localStorage when language changes
  useEffect(() => {
    if (!mounted) return
    localStorage.setItem('language', language)
  }, [language, mounted])

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'zh' ? 'en' : 'zh'))
  }

  const t = (key: string, defaults?: { [key: string]: string }): string => {
    const value = translations[language][key]
    if (!value && defaults) {
      return defaults[key] || key
    }
    return value || key
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

export function useLanguageSafe() {
  const context = useContext(LanguageContext)

  if (!context) {
    return {
      language: 'zh' as Language,
      toggleLanguage: () => {},
      t: (key: string) => key,
    }
  }

  return context
}
