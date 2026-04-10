# 懶加載架構驗證指南

## 啟動服務

### 1. 啟動後端（終端 1）
```bash
cd /Users/yiyun/Desktop/2026-side-code/track-stock
source venv/bin/activate
cd backend
python main.py
```
應該看到：
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### 2. 啟動前端（終端 2）
```bash
cd /Users/yiyun/Desktop/2026-side-code/track-stock/frontend
npm run dev
```
應該看到：
```
▲ Next.js 15.x.x
- Local: http://localhost:3000
```

---

## 驗證步驟

### 打開瀏覽器開發者工具
1. 打開 http://localhost:3000
2. 按 `F12` 或 `Cmd+Option+I` 打開開發者工具
3. 切換到 **Console** tab
4. 打開 **Network** tab（用於觀看 API 請求）

---

## 測試 1：首屏加載（P0 Only）

**預期：只有 stocks + stockHistory 兩個 API 呼叫**

### Console 輸出
```
[enabledTabs] ['chart']
```

### Network 應該看到
- ✅ `GET /api/stocks`
- ✅ `GET /api/stock/AAPL/history?period=1mo`
- ❌ 不應該有 `/news/*`
- ❌ 不應該有 `/indicators/*`
- ❌ 不應該有 `/financials/*`
- ❌ 不應該有 `/scoring/*`

---

## 測試 2：切到 News Tab

**預期：news + guardian 兩個 API 開始加載**

### 操作
點擊 "📰 News" tab

### Console 輸出應該看到
```
[enabledTabs] ['chart', 'news']
[useNews] enabled, fetching...
[useGuardianNews] enabled, fetching...
[useNews] received 5 articles
[useGuardianNews] received X articles
```

### Network 應該新增
- ✅ `GET /api/news`
- ✅ `GET /api/news/guardian`

### 後端日誌
```
GET /api/news
GET /api/news/guardian
```

---

## 測試 3：切到 Technical Tab

**預期：technical API 開始加載；news 不重複呼叫**

### 操作
點擊 "📊 Technical Analysis" tab

### Console 輸出應該看到
```
[enabledTabs] ['chart', 'news', 'technical']
[useTechnicalIndicators] AAPL enabled, fetching...
[useTechnicalIndicators] received: AAPL {rsi: true, macd: false}
```

### Network 應該新增
- ✅ `GET /api/indicators/technical/AAPL`

### 驗證：News API 不應該再呼叫
在 Network tab 中搜尋 `/api/news`，應該只有 1 次請求（從 Test 2），不會增加

### 後端日誌
```
GET /api/indicators/technical/AAPL
```

---

## 測試 4：切到 Financial Tab

**預期：financial API 開始加載；news + technical 不重複**

### 操作
點擊 "💰 Company Profile" tab

### Console 輸出應該看到
```
[enabledTabs] ['chart', 'news', 'technical', 'financial']
[useCompanyFinancials] AAPL enabled, fetching...
[useCompanyFinancials] received: AAPL {company: true, pe_ratio: true}
```

### Network 應該新增
- ✅ `GET /api/financials/profile/AAPL`

### 驗證：舊 API 不重複
- News API 應該還是 1 次
- Technical API 應該還是 1 次

### 後端日誌
```
GET /api/financials/profile/AAPL
```

---

## 測試 5：切到 Scoring Tab（Sequential Waterfall）

**預期：technical 先完成，scoring 才啟動（不同時併發）**

### 操作
點擊 "⭐ Stock Score" tab

### Console 輸出應該看到
```
[enabledTabs] ['chart', 'news', 'technical', 'financial', 'scoring']
[useStockScoring.config] received  // 如果首次
[useStockScoring] AAPL enabled, fetching...
```

### Network 應該新增
- ✅ `GET /api/scoring/config` （如果首次）
- ✅ `GET /api/scoring/comprehensive/AAPL`

### 驗證：Sequential Loading（關鍵！）
在 Network tab 中，按 **時間順序**：
1. 看到 `/indicators/technical/AAPL` 完成（綠色✓）
2. 之後才看到 `/scoring/comprehensive/AAPL` 開始

（不應該同時併發！）

### 後端日誌
```
GET /api/scoring/config
GET /api/scoring/comprehensive/AAPL - START
  GET /api/scoring/comprehensive/AAPL - Fetching technical indicators
  GET /api/scoring/comprehensive/AAPL - Calculating scores
  ✅ DONE (score: X.X/10)
```

---

## 測試 6：切回 Chart Tab，再進 News Tab

**預期：News tab enabledTabs 已有，不重複呼叫**

### 操作
1. 點擊 "📈 Price Chart" tab
2. 再點擊 "📰 News" tab

### Console 應該看到
```
[enabledTabs] ['chart']  // 回到 chart
[enabledTabs] ['chart', 'news']  // 進 news
[useNews] disabled, skipping fetch  // 不呼叫！因為已有資料
[useGuardianNews] disabled, skipping fetch
```

或

```
[useNews] enabled, fetching...  // 如果被清掉了
[useGuardianNews] enabled, fetching...
```

### Network 驗證
在 `/api/news` 和 `/api/news/guardian` 行看請求次數：
- 如果只有 1 次 = ✅ 完美（快取重用）
- 如果有 2 次 = ⚠️ 有重複（可能需要調整）

---

## 測試 7：換股（StockList）

**預期：自動回 chart tab，所有資料重置**

### 操作
點擊 StockList 中的不同股票（如 MSFT）

### Console 應該看到
```
[handleStockSelect] MSFT → reset to chart tab
[enabledTabs] ['chart']  // 重置！
```

### Network 應該看到
- ✅ `GET /api/stock/MSFT/history?period=1mo` （新股票）
- 舊的 AAPL 相關 API 不再被呼叫

---

## 測試 8：手動 Refresh

**預期：回 chart，重置，只刷 P0**

### 操作
按頁面上的 "Refresh" 按鈕

### Console 應該看到
```
[handleRefresh] resetting to chart, refetching P0 only (stocks + history)
[enabledTabs] ['chart']  // 重置！
```

### Network 應該看到
- ✅ `GET /api/stocks` （重新呼叫）
- ✅ `GET /api/stock/AAPL/history?period=1mo` （重新呼叫）
- ❌ News/Technical/Financial/Scoring 不呼叫（等切換時再加載）

### 驗證：之後切到 News
```
[enabledTabs] ['chart', 'news']
[useNews] enabled, fetching...  // 重新 fetch 新資料
[useGuardianNews] enabled, fetching...
```

---

## 驗證清單

| 測試 | 條件 | 預期 | ✅/❌ |
|------|------|------|-------|
| 首屏 | 載入頁面 | 只有 stocks + history | _ |
| News | 進 news tab | news + guardian API 發出 | _ |
| Tech | 進 technical tab | technical API 發出，news 不重複 | _ |
| Financial | 進 financial tab | financial API 發出，news/tech 不重複 | _ |
| Scoring | 進 scoring tab | **Sequential**：technical 完成 → scoring 發出 | _ |
| 回訪 | News 再進一次 | 不重複呼叫或快取重用 | _ |
| 換股 | 點 StockList | 自動回 chart，enabledTabs 重置 | _ |
| Refresh | 點 refresh | 回 chart，重置，只刷 P0 | _ |

---

## 故障排除

### 症狀 1：首屏呼叫了 News/Technical 等
**問題：** enabledTabs 初始化錯誤或 hook 啟用條件有誤
**檢查：** page.tsx 第 22 行是否是 `new Set(['chart'])`

### 症狀 2：切 News tab 時 News API 被呼叫 2 次
**問題：** useEffect 依賴陣列有誤或 enabled 做了 false→true 振盪
**檢查：** useNews.ts useEffect 依賴：`[enabled, fetchData]`

### 症狀 3：Scoring + Technical 同時發出（不是 sequential）
**問題：** scoringEnabled 沒有等 technicalLoading
**檢查：** page.tsx 第 63 行是否有 `&& !technicalLoading`

### 症狀 4：後端沒有日誌
**問題：** `log_api()` 函數未定義或 print 被 buffering
**檢查：**
```bash
python -u main.py  # unbuffered
```

---

## 預期完美場景（所有日誌）

### 前端 Console
```
[enabledTabs] ['chart']
[useNews] disabled, skipping fetch
[useGuardianNews] disabled, skipping fetch
[useTechnicalIndicators] AAPL disabled, skipping fetch
[useCompanyFinancials] AAPL disabled, skipping fetch
[useStockScoring] AAPL disabled, skipping fetch

// 進 news tab
[enabledTabs] ['chart', 'news']
[useNews] enabled, fetching...
[useGuardianNews] enabled, fetching...
[useNews] received 5 articles
[useGuardianNews] received 10 articles

// 進 technical tab
[enabledTabs] ['chart', 'news', 'technical']
[useTechnicalIndicators] AAPL enabled, fetching...
[useTechnicalIndicators] received: AAPL {rsi: true, macd: false}

// 進 scoring tab
[enabledTabs] ['chart', 'news', 'technical', 'financial', 'scoring']
[useStockScoring.config] received
[useStockScoring] AAPL enabled, fetching...
[useStockScoring] received: AAPL {overall: 7.5}
```

### 後端日誌
```
GET /api/stocks
GET /api/stock/AAPL/history?period=1mo
GET /api/news
GET /api/news/guardian
GET /api/indicators/technical/AAPL
GET /api/financials/profile/AAPL
GET /api/scoring/config
GET /api/scoring/comprehensive/AAPL - START
  GET /api/scoring/comprehensive/AAPL - ✅ DONE (score: 7.5/10)
```

---

完成所有測試後，你會看到懶加載架構完美運作！🎉
