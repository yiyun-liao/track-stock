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
    'header.updated': '已更新：',
    'header.never': '未更新',
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
    'tabs.news': '新聞',
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
    // Day 7: Technical Indicators & Company Profile
    'indicators.company_profile': '💼 企業財務檔案',
    'company.loading': '加載中...',
    'company.market_cap': '市值',
    'company.health_assessment': '📊 健康度評估',
    'company.fair_valuation': '✅ 估值合理',
    'company.overvalued': '⚠️ 估值偏高',
    'company.evaluating': '⚪ 評估中',
    'company.strong_profitability': '盈利能力強',
    'metrics.pe_ratio': 'P/E 比率',
    'metrics.pb_ratio': 'P/B 比率',
    'metrics.dividend_yield': '股息率',
    'metrics.roe': 'ROE',
    'metrics.roa': 'ROA',
    'metrics.debt_to_equity': '負債/權益',
    'metrics.current_ratio': '流動比率',
    'metrics.quick_ratio': '速動比率',
    'metrics.pe_desc': '市盈率越低越便宜',
    'metrics.pb_desc': '淨資產倍數',
    'metrics.dividend_desc': '年度股息回報率',
    'metrics.roe_desc': '股東權益回報率',
    'metrics.roa_desc': '資產回報率',
    'metrics.debt_desc': '負債比率，越低越好',
    'metrics.current_desc': '償債能力，>1.0較好',
    'metrics.quick_desc': '速動償債能力',
    'indicator.rsi': '📊 相對強弱指數 (RSI)',
    'indicator.rsi_current': '當前值',
    'indicator.rsi_status': '狀態',
    'indicator.rsi_overbought': '⚠️ 超買',
    'indicator.rsi_oversold': '📈 超賣',
    'indicator.rsi_neutral': '⚖️ 中立',
    'indicator.rsi_label_overbought': '超買 (70)',
    'indicator.rsi_label_oversold': '超賣 (30)',
    'indicator.rsi_desc_overbought': '⚠️ RSI 超買，可能面臨回調風險',
    'indicator.rsi_desc_oversold': '📈 RSI 超賣，可能存在反彈機會',
    'indicator.rsi_desc_neutral': '⚖️ RSI 處於中性區域，市場動能平衡',
    'indicator.macd': '📈 MACD 指標',
    'indicator.macd_label': 'MACD',
    'indicator.signal_line': '信號線',
    'indicator.histogram': '柱狀圖',
    'indicator.macd_bullish': '✓ 看漲信號',
    'indicator.macd_bearish': '✗ 看跌信號',
    'indicator.macd_desc_bullish': 'MACD 線上穿信號線，動能轉強，看漲前景樂觀',
    'indicator.macd_desc_bearish': 'MACD 線下穿信號線，動能轉弱，需要謹慎',
    'indicator.moving_averages': '📊 移動平均線 (Moving Averages)',
    'indicator.ma20': 'MA 20',
    'indicator.ma50': 'MA 50',
    'indicator.ma200': 'MA 200',
    'indicator.current_price': '當前價格',
    'indicator.golden_cross': '✓ 黃金叉 (看漲)',
    'indicator.death_cross': '✗ 死亡叉 (看跌)',
    'indicator.ma_entanglement': '⚖️ 均線糾纏',
    'indicator.ma20_short': 'MA20 (短期)',
    'indicator.ma50_mid': 'MA50 (中期)',
    'indicator.ma200_long': 'MA200 (長期)',
    'indicator.ma_desc_bullish': '短期、中期、長期均線均向上排列，趨勢完整，看漲前景樂觀',
    'indicator.ma_desc_bearish': '短期、中期、長期均線均向下排列，趨勢明確，看跌風險高',
    'indicator.ma_desc_neutral': '均線互相糾纏，趨勢尚不明確，需要等待突破',
    'indicator.bollinger_bands': '🎯 布林帶 (Bollinger Bands)',
    'indicator.bb_upper': '上限',
    'indicator.bb_middle': '中線',
    'indicator.bb_lower': '下限',
    'indicator.bb_current': '當前',
    'indicator.bb_uptrend': '📈 上升趨勢',
    'indicator.bb_downtrend': '📉 下降趨勢',
    'indicator.bb_sideways': '⚖️ 側向整理',
    'indicator.bb_bandwidth': '帶寬 (Bandwidth)',
    'indicator.bb_volatility': '波動性',
  },
  en: {
    'header.title': 'Track Stock',
    'header.updated': 'Updated: ',
    'header.never': 'Never',
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
    'tabs.news': 'News',
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
    // Day 7: Technical Indicators & Company Profile
    'indicators.company_profile': '💼 Company Profile',
    'company.loading': 'Loading...',
    'company.market_cap': 'Market Cap',
    'company.health_assessment': '📊 Health Assessment',
    'company.fair_valuation': '✅ Fair Valuation',
    'company.overvalued': '⚠️ Overvalued',
    'company.evaluating': '⚪ Evaluating',
    'company.strong_profitability': 'Strong Profitability',
    'metrics.pe_ratio': 'P/E Ratio',
    'metrics.pb_ratio': 'P/B Ratio',
    'metrics.dividend_yield': 'Dividend Yield',
    'metrics.roe': 'ROE',
    'metrics.roa': 'ROA',
    'metrics.debt_to_equity': 'Debt to Equity',
    'metrics.current_ratio': 'Current Ratio',
    'metrics.quick_ratio': 'Quick Ratio',
    'metrics.pe_desc': 'Lower P/E is better',
    'metrics.pb_desc': 'Price-to-Book Ratio',
    'metrics.dividend_desc': 'Annual Dividend Yield',
    'metrics.roe_desc': 'Return on Equity',
    'metrics.roa_desc': 'Return on Assets',
    'metrics.debt_desc': 'Debt Ratio, lower is better',
    'metrics.current_desc': 'Solvency, >1.0 is better',
    'metrics.quick_desc': 'Quick Solvency',
    'indicator.rsi': '📊 Relative Strength Index (RSI)',
    'indicator.rsi_current': 'Current Value',
    'indicator.rsi_status': 'Status',
    'indicator.rsi_overbought': '⚠️ Overbought',
    'indicator.rsi_oversold': '📈 Oversold',
    'indicator.rsi_neutral': '⚖️ Neutral',
    'indicator.rsi_label_overbought': 'Overbought (70)',
    'indicator.rsi_label_oversold': 'Oversold (30)',
    'indicator.rsi_desc_overbought': '⚠️ RSI is overbought, risk of pullback',
    'indicator.rsi_desc_oversold': '📈 RSI is oversold, potential for rebound',
    'indicator.rsi_desc_neutral': '⚖️ RSI in neutral zone, balanced momentum',
    'indicator.macd': '📈 MACD Indicator',
    'indicator.macd_label': 'MACD',
    'indicator.signal_line': 'Signal Line',
    'indicator.histogram': 'Histogram',
    'indicator.macd_bullish': '✓ Bullish Signal',
    'indicator.macd_bearish': '✗ Bearish Signal',
    'indicator.macd_desc_bullish': 'MACD crossed above signal line, momentum strengthening, bullish outlook',
    'indicator.macd_desc_bearish': 'MACD crossed below signal line, momentum weakening, caution needed',
    'indicator.moving_averages': '📊 Moving Averages',
    'indicator.ma20': 'MA 20',
    'indicator.ma50': 'MA 50',
    'indicator.ma200': 'MA 200',
    'indicator.current_price': 'Current Price',
    'indicator.golden_cross': '✓ Golden Cross (Bullish)',
    'indicator.death_cross': '✗ Death Cross (Bearish)',
    'indicator.ma_entanglement': '⚖️ Moving Averages Entanglement',
    'indicator.ma20_short': 'MA20 (Short-term)',
    'indicator.ma50_mid': 'MA50 (Mid-term)',
    'indicator.ma200_long': 'MA200 (Long-term)',
    'indicator.ma_desc_bullish': 'Short/Mid/Long-term MAs aligned upward, complete trend, bullish outlook',
    'indicator.ma_desc_bearish': 'Short/Mid/Long-term MAs aligned downward, clear trend, high downside risk',
    'indicator.ma_desc_neutral': 'MAs entangled, trend unclear, awaiting breakout',
    'indicator.bollinger_bands': '🎯 Bollinger Bands',
    'indicator.bb_upper': 'Upper Band',
    'indicator.bb_middle': 'Middle Band',
    'indicator.bb_lower': 'Lower Band',
    'indicator.bb_current': 'Current',
    'indicator.bb_uptrend': '📈 Uptrend',
    'indicator.bb_downtrend': '📉 Downtrend',
    'indicator.bb_sideways': '⚖️ Sideways',
    'indicator.bb_bandwidth': 'Bandwidth',
    'indicator.bb_volatility': 'Volatility',
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
