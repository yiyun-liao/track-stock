# /project:debug-api

診斷 API 問題，快速定位是哪個服務出了問題。

## 使用方式

```
/project:debug-api                 # 全面檢查
/project:debug-api yfinance        # 只查特定服務
/project:debug-api 429             # 查 rate limit 問題
```

## 診斷步驟

### 1. 確認後端是否在運行
```bash
curl http://localhost:8000/health
```

### 2. 逐一測試各 API 端點

```bash
# 股價
curl "http://localhost:8000/stocks/prices?symbols=AAPL"

# 新聞
curl "http://localhost:8000/news/AAPL"

# Guardian 新聞
curl "http://localhost:8000/news/guardian"

# 技術指標
curl "http://localhost:8000/stocks/technical/AAPL"

# 公司概覽
curl "http://localhost:8000/stocks/overview/AAPL"

# 財務報表
curl "http://localhost:8000/stocks/financials/AAPL"
```

### 3. 常見問題對照

| 錯誤 | 原因 | 解法 |
|-----|------|------|
| 429 Too Many Requests | Rate limit | 等待 60 秒，或檢查快取是否工作 |
| `No data found` | yfinance 版本過舊 | `pip install --upgrade yfinance` |
| `Connection refused` | 後端未啟動 | `cd backend && python3 main.py` |
| `API key invalid` | .env 設定錯誤 | 檢查 `.env` 的 key 是否正確 |
| CORS error | 前端域名未列入白名單 | 檢查 `main.py` 的 CORS 設定 |

### 4. 輸出診斷報告

```
## API 診斷報告

健康檢查：[✅/❌]

各服務狀態：
- yfinance（股價）：[✅ 正常 / ❌ 錯誤訊息]
- NewsAPI（新聞）：[✅ / ❌]
- Guardian（新聞）：[✅ / ❌]
- Alpha Vantage（技術指標）：[✅ / ❌]
- Finnhub（財務）：[✅ / ❌]

問題診斷：
[說明找到了什麼問題]

建議修復步驟：
1. ...
2. ...
```

## 快取相關問題

若懷疑快取返回舊資料：
```bash
# 重啟後端清空記憶體快取
# 或在 API 請求加 ?refresh=true（若有實作）
```
