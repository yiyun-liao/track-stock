/**
 * Data sources configuration for analysis display
 * Defines labels, colors, and descriptions for each data source
 */

export type DataSource = '股價' | '新聞' | '財報' | '指數'

export interface DataSourceLabel {
  label: string
  icon: string
  color: string
  description: string
}

export const DATA_SOURCE_LABELS: Record<DataSource, DataSourceLabel> = {
  '股價': {
    label: 'Stock Price',
    icon: '📈',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    description: 'Real-time stock price and market data',
  },
  '新聞': {
    label: 'News',
    icon: '📰',
    color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    description: 'Financial news and market insights',
  },
  '財報': {
    label: 'Financials',
    icon: '📊',
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    description: 'Company financial statements and ratios',
  },
  '指數': {
    label: 'Indicators',
    icon: '📉',
    color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
    description: 'Technical indicators (RSI, MACD, Moving Averages)',
  },
}

/**
 * Get label configuration for a data source
 */
export function getDataSourceLabel(source: DataSource): DataSourceLabel {
  return DATA_SOURCE_LABELS[source] || {
    label: 'Unknown',
    icon: '❓',
    color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400',
    description: 'Unknown data source',
  }
}

/**
 * Format data sources for display
 */
export function formatDataSources(sources: DataSource[]): string {
  return sources
    .map((source) => `${getDataSourceLabel(source).icon} ${getDataSourceLabel(source).label}`)
    .join(' · ')
}
