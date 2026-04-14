# 工作流使用指南

根據不同的工作場景，選擇合適的 Skill 來執行。

---

## 🎯 **場景 1：開始工作日**

### 情況
- 早上開始工作，想快速了解昨天的進度
- 整理日誌，記錄完成功能、遇到的問題、下一步計畫

### 使用 Skill
```bash
/project:review-day
```

### 輸入
**自動讀取：**
- 最近 24 小時的 git commits
- 修改的檔案列表
- 行數統計

**可選手動補充：**
- 主要成就亮點
- 遇到的困難
- 重要決策

### 輸出格式
```markdown
# Day X 開發成果回顧

## 📊 數據概覽
- 完成 commit 數：5
- 修改檔案：12
- 新增行數：342
- 刪除行數：89

## ✅ 完成功能
- [x] 優化 StockChart 組件性能
- [x] 修復 useEffect 無限循環 bug
- [x] 新增黑暗模式支援

## 🐛 已修復 Bug
- 修復 API 超時問題（原因：快取過期）
- 修復前端重複呼叫（原因：Hook 依賴不完整）

## 📝 遇到問題
- NewsAPI 速度變慢，已增加超時時間
- Bundle 大小增加 8%，監控中

## 📚 學習心得
- 發現 useCallback 對性能優化的重要性
- 了解了 Redis 快取策略

## 🎯 下一步行動
- [ ] 優化 dashboard 初始載入時間
- [ ] 補充單元測試（覆蓋率 78%）
- [ ] 準備周五的 code review
```

### 最佳時機
- ⏰ **每天早上** — 開始工作前快速同步進度
- 📅 **每週五** — 週報總結本週工作
- 🏁 **Sprint 結束** — 衝刺回顧

---

## 📊 **場景 2：分析股票**

### 情況
- 想投資某支股票，需要深度分析
- 需要了解技術面、基本面、情緒面綜合評估
- 產出投資建議

### 使用 Skill
```bash
/project:analyze-stock AAPL
```

### 輸入
- **SYMBOL**：股票代碼（如 AAPL、MSFT、NVDA）
- 自動獲取即時數據（股價、財務指標、新聞）

### 輸出格式
```markdown
# 📊 股票分析報告 — AAPL

## 【綜合評分】
- **評分** 8.2 / 10
- **評級** 🟢 強烈買入
- **風險等級** 低風險

## 【三維度分布】
| 維度 | 得分 | 評級 |
|------|------|------|
| 📊 技術面 | 75/100 | 看漲 |
| 💰 基本面 | 85/100 | 優秀 |
| 📰 情緒面 | 70/100 | 中性偏強 |

## 【盈餘分析】
- EPS 趨勢：持續成長，最近 4 季 8%、12%、9%、15%
- P/E Ratio：25.3（低於歷史均值 28.5）
- PEG Ratio：0.9（< 1 表示低估）

## 【投資論點】
✅ 看漲原因：
1. EPS 持續成長，特別是 Q4 加速
2. P/E 相對低估，安全邊際足夠
3. 新聞情緒 70% 正面，市場看好

⚠️ 潛在風險：
1. 宏觀經濟放緩可能影響消費
2. 競爭對手技術進展

## 【明確建議】
### 對於新投資者
- **行動** 買入
- **建議持倉比例** 5-8%（保守配置）

### 對於現有持有者
- **行動** 加倉
- **目標價** $190（12 個月）
- **止損位** $165（下檔支撐）

## 【3-5 年前景】
基於目前成長率和競爭地位，預期未來 3-5 年 EPS CAGR ~12-15%，
股價潛力向上 30-50%。
```

### 最佳時機
- 🔍 **選股研究** — 評估是否值得買進
- 📈 **持股檢討** — 定期檢視現有持倉的邏輯
- 💡 **市場機會** — 特殊情況下重新評估標的

### 使用場景示例
```bash
# 新手投資者：評估 NVDA 是否值得買
/project:analyze-stock NVDA

# 已有持倉：檢視 MSFT 還值不值得繼續持有
/project:analyze-stock MSFT

# 市場異動：分析 Tesla 的投資價值
/project:analyze-stock TSLA
```

---

## 🔧 **場景 3：API 突然異常**

### 情況
- Dashboard 載入變慢
- 某個 API 返回錯誤
- 新聞資料沒有更新
- API 呼叫頻繁失敗

### 使用 Skill
```bash
/project:debug-api
```

### 執行過程
1. **收集信息** — 診斷工具詢問：
   - 發生時間？
   - 受影響的股票代碼？
   - 具體錯誤訊息？
   - 多久發生一次？

2. **檢查服務** — 自動測試：
   ```bash
   curl -I https://query1.finance.yahoo.com/   # yfinance
   curl -I https://newsapi.org/v2/everything    # NewsAPI
   ```

3. **檢查快取** — 詢問：
   - 快取是否過期？
   - TTL 設定是否正確？

4. **檢查速率限制** — 查看：
   - API 配額使用情況
   - 是否觸發 429 錯誤

### 輸出格式
```markdown
# 🔍 API 診斷報告

## 【問題描述】
用戶報告：Dashboard 載入變慢，新聞更新延遲

## 【檢查結果】

### 服務連接性
- yfinance: ✅ 正常
- NewsAPI: ⚠️ 響應 4.2s（正常 < 2s）
- Finnhub: ✅ 正常

### 快取狀態
- 股票價格：✅ 正常（5 分鐘）
- 新聞資料：⚠️ 已過期（應 30 分鐘，現已 45 分鐘）

### 速率限制
- NewsAPI：85/100 今日配額（正常）
- Alpha Vantage：5/5 每分鐘（已達限制）

## 【根本原因】
1. NewsAPI 伺服器響應緩慢（可能是他們那邊問題）
2. 新聞快取 TTL 設定有誤，導致陳舊資料

## 【建議解決方案】
1. ✅ 增加 NewsAPI 超時時間從 2s → 5s
2. ✅ 檢查新聞快取 TTL，確保 30 分鐘更新
3. ✅ 新聞失敗時改用備用來源 Guardian API

## 【立即行動】
```bash
# 清除快取，重新取得數據
redis-cli FLUSHALL

# 重啟後端服務
python backend/main.py
```

## 【長期改善】
- 監控 API 響應時間，告警閾值 3s
- 考慮升級 NewsAPI 至付費方案
```

### 最佳時機
- 🚨 **急速排查** — API 突然故障，需要快速定位
- 📉 **性能下降** — Dashboard 變慢，找出瓶頸
- 🔄 **間歇性問題** — 不穩定的問題，需要系統診斷

---

## ✅ **場景 4：準備合併代碼**

### 情況
- 功能開發完成，準備 PR
- 推送前本地檢查
- 確保代碼品質達標

### 使用 Skill
```bash
/project:pre-merge
```

### 檢查流程（自動化）

```bash
# 1. TypeScript 型別檢查
npm run type-check
# ✅ 目標：0 errors

# 2. ESLint 代碼質量
npm run lint
# ✅ 目標：0 errors（warnings 可接受）

# 3. 單元測試
npm run test
# ✅ 目標：所有測試通過

# 4. 構建驗證
npm run build
# ✅ 目標：構建成功
```

### 輸出格式
```markdown
# ✅ Pre-Merge 品質檢查報告

## 【檢查時間】
開始：2026-04-14 16:30
結束：2026-04-14 16:45

## 【CRITICAL 檢查】
- [x] TypeScript 型別檢查 ✅
- [x] ESLint 代碼質量 ✅
- [x] 單元測試 ✅ (24/24 通過)
- [x] 構建成功 ✅

## 【WARNING 檢查】
- [x] Bundle 大小 ⚠️ (+6% - 在可接受範圍內)
- [x] Test 覆蓋率 ✅ (82%)
- [x] 代碼重複 ✅ (無新增重複)

## 【代碼審查重點】
- ✅ 修改 1：StockChart 組件優化 — 合理，符合規範
- ⚠️ 修改 2：useEffect 重構 — 依賴陳列完整，但建議補充註釋
- ✅ 修改 3：API 快取策略 — 良好，遵循規範

## 【潛在問題】
1. Bundle 大小增加 6%
   - 原因：新增 date-fns 依賴
   - 建議：監控，下個 sprint 考慮 tree-shaking

## 【準許合併】
✅ **準許合併** — 所有 CRITICAL 檢查通過

## 【建議】
- 後續 sprint 補充更多單元測試（目標 > 85%）
- 考慮優化 Bundle 大小
```

### 前端特定檢查
- ✅ UI 組件是否在 `/components/ui/`
- ✅ 業務邏輯組件是否在 `/components/sections/`
- ✅ useEffect 依賴陳列是否完整
- ✅ 是否有重複的 API 呼叫

### 最佳時機
- 🔄 **PR 準備** — 推送前最後檢查
- 📤 **本地驗證** — 確認代碼可運行
- 🎯 **CI/CD 檢查點** — 自動品質把關

---

## 📅 **工作流日時表**

### 日常開發流程
```
┌─────────────────────────────────────────────────────┐
│ 早上 9:00                                           │
│ ├─ /project:review-day          ← 回顧昨天進度   │
│ └─ 開始今天工作                                     │
│                                                       │
│ 中午 12:00                                          │
│ ├─ 分析股票                                         │
│ ├─ /project:analyze-stock AAPL  ← 投資決策       │
│ └─ 繼續開發                                         │
│                                                       │
│ 下午 15:00                                          │
│ ├─ API 問題出現                                     │
│ ├─ /project:debug-api           ← 快速排查       │
│ └─ 修復問題                                         │
│                                                       │
│ 下午 17:00                                          │
│ ├─ 功能開發完成                                     │
│ ├─ /project:pre-merge           ← 品質檢查       │
│ ├─ 推送代碼                                         │
│ └─ 建立 PR                                          │
│                                                       │
│ 晚上 18:00                                          │
│ └─ /project:review-day          ← 整理日誌       │
└─────────────────────────────────────────────────────┘
```

### 每週流程
```
Monday-Thursday      Friday              Weekend
├─ Daily Workflow    ├─ review-day       ├─ review-day
├─ /project:*        ├─ /project:*       │  (週報)
└─ 持續開發          ├─ Code Review      │
                     └─ Weekly Planning   │
```

---

## 🎓 **快速參考**

| Skill | 何時用 | 輸入 | 輸出 |
|------|--------|------|------|
| **review-day** | 📅 每天早/晚 | git logs | 日報總結 |
| **analyze-stock** | 📈 選股時 | SYMBOL | 投資評分 + 建議 |
| **debug-api** | 🚨 故障時 | 問題描述 | 根本原因 + 解決方案 |
| **pre-merge** | ✅ 推送前 | 無需輸入 | 品質檢查報告 |

---

## 💡 **實際案例**

### 案例 1：新手投資者的一天

```bash
# 早上
9:00 /project:review-day
     ↓ 了解昨天進度

# 看股票新聞
10:30 我想分析 NVDA

/project:analyze-stock NVDA
     ↓ 獲得詳細分析報告
     ↓ 決定是否買進

# 下午開發
15:30 Dashboard 載入變慢

/project:debug-api
     ↓ 快速定位 NewsAPI 變慢
     ↓ 應急解決方案：增加超時時間

# 功能完成
17:00 開發完成，準備 PR

/project:pre-merge
     ✅ 所有檢查通過
     → 推送代碼

# 晚上
18:30 /project:review-day
      ↓ 記錄今天成果
```

### 案例 2：資深開發者的一週

```
Monday
├─ 工作開始：/project:review-day
├─ 遇到 API 問題：/project:debug-api
└─ 推送完成：/project:pre-merge

Tuesday-Thursday
├─ 分析股票投資機會：/project:analyze-stock
├─ 持續開發
└─ 日常檢查

Friday
├─ 週報：/project:review-day
├─ Code Review 檢查：/project:pre-merge
└─ 週末計畫
```

---

## ⚡ **常見問題**

**Q：什麼時候用 review-day？**
A：每天早晚、週末、Sprint 結束時。快速同步進度、記錄成果。

**Q：analyze-stock 和 pre-merge 可以一起用嗎？**
A：可以。它們是獨立工作流，沒有衝突。

**Q：debug-api 需要開發者權限嗎？**
A：需要能訪問後端日誌和資料庫。非開發者無法執行。

**Q：一天可以執行多少次 /project:* 指令？**
A：沒有限制。按需使用即可。

**Q：Skills 可以自訂嗎？**
A：可以。編輯 `.claude/skills/*.md` 文件後自動生效。

---

**最後更新：** 2026-04-14
**版本：** 1.0 - 完整演示指南
