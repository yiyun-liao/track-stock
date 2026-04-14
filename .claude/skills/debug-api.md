# Skill: Debug API（API 診斷工作流）

## 概述

快速診斷 API 問題，定位服務狀態、性能瓶頸、快取失效、速率限制等問題。

## 何時使用

- **API 呼叫失敗** — 某個 API 突然返回錯誤
- **性能下降** — Dashboard 載入變慢
- **數據不一致** — 數據與預期不符
- **偶發性問題** — 問題間歇性出現

## 調用方式

```bash
/project:debug-api
```

## 診斷步驟

### 步驟 1：收集信息

詢問用戶：
- [ ] 發生時間？
- [ ] 受影響的股票代碼？
- [ ] 出現的錯誤訊息？
- [ ] 多久發生一次？

### 步驟 2：檢查服務狀態

```bash
# 檢查各 API 的連接性
curl -I https://query1.finance.yahoo.com/  # yfinance
curl -I https://newsapi.org/v2/everything   # NewsAPI
curl -I https://finnhub.io/api/v1/quote     # Finnhub
```

### 步驟 3：檢查快取層

檢查項目：
- [ ] 快取 TTL 是否設定正確？
- [ ] 快取是否過期？
- [ ] 快取鍵值是否正確？
- [ ] 是否應該清除快取重新取得？

### 步驟 4：檢查速率限制

檢查項目：
- [ ] 某 API 是否超過每分鐘限制？
- [ ] 是否觸發 429 Too Many Requests？
- [ ] 重試邏輯是否正常工作？
- [ ] 指數退避延遲是否足夠？

### 步驟 5：檢查數據驗證

檢查項目：
- [ ] API 返回的格式是否改變？
- [ ] 必需欄位是否存在？
- [ ] 數據型別是否符合預期？
- [ ] 是否有 null / undefined 欄位？

### 步驟 6：檢查日誌

```bash
# 查看後端日誌
tail -f backend/logs/api.log | grep "ERROR\|WARN"

# 查看特定 API 的請求/回應
grep "yfinance\|NewsAPI\|Finnhub" backend/logs/api.log | tail -20
```

## 常見問題及解決方案

| 問題 | 徵兆 | 解決方案 |
|------|------|---------|
| **API 不可用** | 返回 503 / 網路超時 | 檢查 API 服務狀態頁、IP 是否被封鎖 |
| **API 速率限制** | 返回 429 / 403 | 檢查重試邏輯、增加延遲、升級 API 等級 |
| **快取過期** | 數據較舊 | 清除快取或調整 TTL |
| **數據格式變更** | JSON 解析失敗 | 檢查 API 文檔是否更新、調整解析邏輯 |
| **偶發性超時** | 間歇性失敗 | 增加連接超時時間、檢查網路連接 |
| **CORS 錯誤** | 前端無法呼叫 API | 檢查後端 CORS 設定、Proxy 配置 |

## 輸出格式

```markdown
# 🔍 API 診斷報告

## 【問題描述】
用戶報告：...

## 【初步診斷】
原因：...

## 【檢查結果】

### 服務連接性 ✅ / ⚠️ / ❌
- yfinance: ✅ 正常
- NewsAPI: ⚠️ 響應緩慢（> 2s）
- Finnhub: ✅ 正常

### 快取狀態
- 股票價格快取：已過期（設定 5 分鐘，現在 10 分鐘）
- 新聞快取：正常

### 速率限制
- Alpha Vantage：已達每分鐘限制（5/5）
- NewsAPI：正常（45/100 今日配額）

## 【根本原因】
1. NewsAPI 速度變慢導致超時
2. Alpha Vantage 技術指標呼叫過頻繁

## 【建議解決方案】
1. ✅ 增加 NewsAPI 超時時間至 10s
2. ✅ 調整 Alpha Vantage 快取 TTL 從 1 小時增加至 2 小時
3. ✅ 實現 API 呼叫去重（5 分鐘內同一股票不重複呼叫）

## 【立即行動】
```bash
# 清除快取，重新取得數據
redis-cli FLUSHALL

# 重啟後端服務
python backend/main.py
```

## 【長期改善】
- 監控 API 響應時間，設定告警（如 > 3s）
- 考慮升級 NewsAPI 至付費方案
- 實現更智能的快取策略
```

## 依賴規則

- @.claude/rules/api-conventions.md — API 設計、快取、重試機制
- @.claude/rules/code-style.md — 日誌記錄規範

## Agents 參與

- **Scraper Agent** — 檢查各 API 的集成邏輯、快取、重試機制

---

**最後更新：** 2026-04-14
**狀態：** ✅ 生產就緒
