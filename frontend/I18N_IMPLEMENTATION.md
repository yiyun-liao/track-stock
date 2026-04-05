# i18n 雙語結構實現計劃

## 完成狀態

✅ **第一階段：翻譯文件組織** (已完成)
- 建立 `lib/i18n/` 目錄
- 分離翻譯文件：`zh.ts`, `en.ts`, `index.ts`
- 添加 32 個新翻譯鍵，覆蓋基礎 UI 組件

## 待完成：組件更新（優先級順序）

### 高優先級（直接影響用戶體驗）

#### 1. Button 組件 - 加載狀態文本
- **文件**: `components/ui/Button.tsx`
- **當前**: `{isLoading ? loadingText || 'Loading...' : children}`
- **改為**: `{isLoading ? t(loadingText || 'button.loading') : children}`
- **需要**: 傳入 useLanguage hook

#### 2. 圖表相關組件

**StockChart.tsx**
- Line 46: `📈 {symbol} Price Chart (30 Days)` → `t('analysis.price_chart')`
- Line 49: `Price range: $` → `t('chart.price_range')`
- Line 55: `No chart data available` → `t('chart.no_data')`
- Line 70: `Price ($)` → `t('chart.price_label')`

**RSIChart.tsx**
- Title: `📊 相對強弱指數 (RSI)` → `t('indicator.rsi')`
- Line 60: `當前值` → `t('indicator.rsi_current')`
- Line 64: `狀態` → `t('indicator.rsi_status')`
- Line 83-84: `超買 (70)`, `超賣 (30)` → `t('indicator.rsi_label_overbought')`等

**MACDChart.tsx**
- Title: `📈 MACD 指標` → `t('indicator.macd')`
- Line 56-65: 各標籤 → 對應 `t()` 鍵

**MovingAveragesChart.tsx**
- Line 56: `📊 Moving Averages` → `t('indicator.moving_averages')`
- Line 63-76: 度量標籤 → 對應 `t()` 鍵

**BollingerBandsChart.tsx**
- Line 58: `🎯 Bollinger Bands` → `t('indicator.bollinger_bands')`
- Line 65-123: 各標籤 → 對應 `t()` 鍵

#### 3. 分析組件

**AnalysisSection/index.tsx**
- Line 29: `🤖 AI summary` → `t('analysis.ai_summary')`
- Line 32: `AI summary after Data loading...` → `t('analysis.loading_message')`
- Line 45: `Generate Analysis` → `t('button.generate_analysis')`

**AnalysisTab.tsx**
- Line 27-29: 選項卡標籤 → `t('tab.price_alert')` 等
- Line 40: `📊 Data Sources:` → `t('analysis.data_sources')`
- Line 46: `⏰ Analysis updated:` → `t('analysis.updated_time')`

**PriceAlertTab.tsx**
- Line 24: `No price alert available` → `t('analysis.no_price_alert')`

**NewsSummaryTab.tsx**
- Line 24: `No news summary available` → `t('analysis.no_news_summary')`

**InvestmentAdviceTab.tsx**
- Line 25: `No investment advice available` → `t('analysis.no_advice')`

#### 4. 新聞組件

**NewsSection.tsx**
- Line 52: `No news available for {symbol}` → `t('news.no_news_for_symbol')`
- Line 99: 頁腳統計 → `t('news.total_articles')`

### 中優先級（輔助信息）

#### 5. 公司檔案組件

**CompanyProfileCard.tsx**
- Line 65: `加載中...` → `t('company.loading')`
- 所有財務指標標籤已在 i18n 中，需要使用 `t()`

#### 6. 錯誤處理

**AnalysisCard.tsx**
- Line 80: `No Connection` → `t('error.no_connection')`
- Line 85: `No data available` → `t('error.no_data_available')`
- Line 85: `Network Error: {error}` → `t('error.network_error')`

**StockList.tsx**
- Line 45: `無法載入股票列表` → `t('error.unable_load_stocks')`
- Line 58: `Failed to load stocks` → `t('stocklist.failed')`
- Line 58: `No stocks tracked yet` → `t('stocklist.no_stocks')`
- Line 60: `Make sure the backend...` → `t('error.backend_info')`
- Line 83: `Stock Price` → `t('stocklist.stock_price')`
- Line 110: `{stocks.length} stocks • Click...` → `t('stocklist.footer')`

### 低優先級（非關鍵）

#### 7. 語言和主題切換

**LanguageToggle.tsx**
- Line 17, 19: 按鈕值和 title → i18n 化

**ThemeToggle.tsx**
- Line 20: `Switch to ... mode` → `t('theme.switch')`

#### 8. 其他

**app/page.tsx**
- Line 114: `🔔 Alert History` → `t('alert.title')`
- Line 115: `Coming soon...` → `t('alert.coming_soon')`

## 翻譯鍵總覽

### 已完成翻譯的鍵（37 個）
```
header.*, stocklist.*, news.*, tabs.*, analysis.*, error.*,
indicators.*, company.*, metrics.*, indicator.*(RSI, MACD, MA, BB)
```

### 新添加的鍵（32 個）
```
button.loading, button.generate_analysis, tab.price_alert,
tab.news_summary, tab.investment_advice, chart.no_data,
chart.price_label, news.no_news_for_symbol, news.total_articles,
analysis.ai_summary, analysis.loading_message, analysis.no_price_alert,
analysis.no_news_summary, analysis.no_advice, analysis.data_sources,
analysis.updated_time, error.no_connection, error.no_data_available,
error.network_error, error.backend_info, stocklist.footer,
language.english, language.chinese, language.switch_en,
language.switch_zh, theme.switch, alert.title, alert.coming_soon
```

### 待處理的硬編碼文本（20+ 個）
在各組件中仍需轉換的文本

## 實現步驟

### 簡單方案：逐步遷移
1. 從高優先級組件開始
2. 每個組件導入 `useLanguage`
3. 替換硬編碼文本為 `t()` 調用
4. 驗證中英文顯示正確

### 示例代碼模板

```tsx
import { useLanguage } from '@/lib/language-context'

export default function YourComponent() {
  const { t } = useLanguage()

  return (
    <div>
      <h2>{t('analysis.ai_summary')}</h2>
      <button>{t('button.generate_analysis')}</button>
    </div>
  )
}
```

## 文件修改清單

| 優先級 | 文件 | 修改數 | 狀態 |
|--------|------|--------|------|
| 高 | StockChart.tsx | 4 | ⏳ 待做 |
| 高 | RSIChart.tsx | 6+ | ⏳ 待做 |
| 高 | MACDChart.tsx | 6+ | ⏳ 待做 |
| 高 | AnalysisSection/index.tsx | 3 | ⏳ 待做 |
| 高 | AnalysisTab.tsx | 3 | ⏳ 待做 |
| 中 | NewsSection.tsx | 2 | ⏳ 待做 |
| 中 | StockList.tsx | 5 | ⏳ 待做 |
| 低 | LanguageToggle.tsx | 2 | ⏳ 待做 |
| 低 | ThemeToggle.tsx | 1 | ⏳ 待做 |
| 低 | page.tsx | 2 | ⏳ 待做 |

**總計**: ~35+ 處修改需要完成

## 下一步

1. 選擇高優先級組件開始更新
2. 測試中英文顯示
3. 逐步遷移至中優先級
4. 最後完成低優先級

建議: 先從 `AnalysisSection` 和圖表組件開始，因為這些是用戶最常見的界面。
