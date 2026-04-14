# API 設計規範

## RESTful 端點設計

- 使用標準 RESTful 端點，動詞用 HTTP method 表達（GET、POST、PUT、DELETE）
- 統一的 response 格式：
  ```json
  { "success": true, "data": {...}, "error": null }
  { "success": false, "data": null, "error": "錯誤說明" }
  ```
- 版本前綴（未來擴展用）：`/api/v1/...`

## 環境變數管理

- 所有 API keys、DB URL 等敏感資訊放在 `.env` 檔案，絕對不 hardcode
- 每個模塊的 `.env.example` 記錄所需變數（不含實際值）
- Services 透過依賴注入接收 API key，不自己讀 `os.getenv`

## 快取策略（多層次 TTL）

| 資料類型 | TTL | 原因 |
|---------|-----|------|
| 股票即時價格 | 5 分鐘 | 盤中頻繁變動 |
| 技術指標 (RSI/MA) | 1 小時 | 計算密集，變動慢 |
| 公司基本資訊 | 24 小時 | 幾乎不變 |
| 新聞資料 | 30 分鐘 | 即時性要求中等 |

## 重試機制

- 指數退避：失敗後等 1s、2s、4s 再重試（最多 3 次）
- Rate limit (429) 錯誤必須有 retry，不直接報錯
- 快取命中時不發送 API 請求（節省配額）

## 錯誤隔離原則

- **關鍵 API**（股價、核心功能）：失敗時紅色警告，阻止後續操作
- **可選 API**（公司資訊、進階指標）：失敗時黃色警告，其餘功能繼續
- 每個 API call 獨立 try-catch，不讓單一失敗影響整體

## 現有 API 來源

| 服務 | 用途 | 限制 |
|-----|------|------|
| yfinance | 股價、歷史走勢 | Rate limit，需重試 |
| NewsAPI | 財經新聞 | 每日 100 次免費 |
| Guardian API | 補充新聞 | 免費層足夠 |
| Finnhub | 財務三表 | 無限免費額度 |
| Alpha Vantage | RSI、MA、公司概覽 | 5 次/分鐘（免費層）|
| Claude API | AI 分析文字 | 按 token 收費 |
| Telegram Bot API | 通知推送 | 無限制 |

## 前端 API 客戶端規範

- 所有 API 呼叫集中在 `lib/api.ts`，組件不直接 fetch
- 同一支股票的分析 API，在最上層 component 呼叫一次，透過 props 往下傳
- 避免同一個 render cycle 重複呼叫相同 endpoint
