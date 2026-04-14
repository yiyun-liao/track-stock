# Skill: Pre-Merge（合併前品質檢查）

## 概述

在合併至 main 前執行完整的品質檢查，包括型別檢查、linting、測試、代碼審查，確保代碼品質。

## 何時使用

- **PR 準備** — 準備建立 PR 前執行
- **本地驗證** — 推送前本地檢查
- **CI/CD 檢查點** — Git hook 自動觸發
- **碩士合併** — 在 main 分支合併前最終驗證

## 調用方式

```bash
/project:pre-merge
```

## 檢查清單

### 🔴 【CRITICAL】阻擋合併

這些檢查失敗則**不能**合併。

```bash
# 1. TypeScript 型別檢查
npm run type-check
# ❌ 如果有錯誤，修復後重新執行
# ✅ 目標：0 errors

# 2. ESLint 代碼質量檢查
npm run lint
# ❌ 如果有 error（不是 warning），修復後重新執行
# ✅ 目標：0 errors

# 3. 測試通過
npm run test
# ❌ 如果任何測試失敗，調查原因、修復代碼或測試
# ✅ 目標：所有測試通過

# 4. 構建成功
npm run build
# ❌ 如果構建失敗，分析編譯錯誤、修復代碼
# ✅ 目標：構建成功
```

### 🟡 【WARNING】需要關注

這些檢查警告不阻擋合併，但應該解決。

- [ ] **性能**：無新的 bundle 大小膨脹（> 10%)
- [ ] **Test 覆蓋率**：新增代碼應有測試（目標 > 80%）
- [ ] **代碼重複**：沒有大量重複邏輯
- [ ] **已棄用 API**：沒有使用已棄用的依賴版本

### 🟢 【INFO】最佳實踐

不強制，但推薦：

- [ ] **JSDoc 註釋**：複雜函數有文檔
- [ ] **Git commit 訊息**：清晰、描述性強
- [ ] **性能**：沒有明顯的性能回退
- [ ] **用戶體驗**：新功能有適當的反饋提示

## 前端特定檢查

如果修改了 frontend/：

```bash
# 檢查組件分類是否正確
# - UI 組件應該在 /components/ui/
# - 業務�邏輯組件應該在 /components/sections/

# 檢查 useEffect 依賴陳列
# - 所有 useEffect 都有完整的依賴陳列
# - ESLint react-hooks/exhaustive-deps 規則通過

# 檢查是否有重複的 API 呼叫
# - 同一 API 只在一個地方呼叫
# - 子組件接收 props，不重複呼叫

# 檢查 React.memo 使用
# - 純 UI 組件應該 memo
# - 接收回調的組件應該配合 useCallback
```

詳見 @.claude/rules/frontend-architecture.md

## 後端特定檢查

如果修改了 backend/：

```bash
# Python 型別檢查
mypy backend/ --strict

# 後端 linting
pylint backend/

# 後端單元測試
python -m pytest backend/tests/

# API 規範檢查
# - 所有新 endpoint 都遵循 RESTful 設計
# - 返回統一的 response 格式
# - 錯誤處理完善
```

詳見 @.claude/rules/api-conventions.md

## 輸出格式

```markdown
# ✅ / ⚠️ / ❌ Pre-Merge 品質檢查報告

## 【檢查時間】
開始：2026-04-14 14:30
結束：2026-04-14 14:35

## 【檢查結果】

### 🔴 CRITICAL 檢查
- [x] TypeScript 型別檢查 ✅
- [x] ESLint 代碼質量 ✅
- [x] 單元測試 ✅
- [x] 構建成功 ✅

### 🟡 WARNING 檢查
- [x] Bundle 大小 ⚠️ (+12% - 超過閾值 10%)
- [x] Test 覆蓋率 ✅ (85%)
- [x] 代碼重複 ✅
- [x] 已棄用依賴 ✅

### 🟢 INFO 檢查
- [x] JSDoc 文檔 ⭐⭐⭐
- [x] Commit 訊息品質 ⭐⭐⭐⭐
- [x] 性能 ⭐⭐⭐

## 【修改統計】
- 修改檔案：N
- 新增行數：L
- 刪除行數：D
- 修改檔案類型：Frontend / Backend / Both

## 【代碼審查重點】
- 修改 1：✅ 合理，符合規範
- 修改 2：⚠️ 需要注意（說明原因）
- 修改 3：✅ 良好

## 【潛在問題】
1. Bundle 大小增加 12%
   - 原因：新增 recharts 依賴
   - 建議：考慮使用 dynamic import 延遲載入

## 【準許合併】
- **決定** ✅ 準許合併（或 ❌ 不準許）
- **原因** 所有 CRITICAL 檢查通過，WARNING 已評估

## 【後續行動】
- [ ] 優化 bundle 大小（下一個 sprint）
- [ ] 補充測試（現有覆蓋率 85%）
```

## 常見失敗及修復

| 失敗項 | 常見原因 | 修復方法 |
|--------|---------|---------|
| TypeScript 錯誤 | 型別不符 | `npm run type-check` 查看詳細錯誤，修改代碼 |
| ESLint 錯誤 | 代碼風格 / 規則違反 | `npm run lint -- --fix` 自動修復，無法修復的手動改 |
| 測試失敗 | 新代碼破壞既有邏輯 | 執行 `npm run test:watch` 逐個測試，調查根本原因 |
| 構建失敗 | 編譯錯誤 | 檢查 `npm run build` 的詳細錯誤訊息 |
| Bundle 膨脹 | 依賴太大 | 分析 bundle 構成，考慮 tree-shaking 或延遲載入 |

## 依賴規則

- @.claude/rules/agent-guidelines.md — 代碼審查清單
- @.claude/rules/frontend-architecture.md — 前端檢查項
- @.claude/rules/api-conventions.md — 後端檢查項
- @.claude/rules/code-style.md — 代碼風格檢查

## Agents 參與

- **Frontend Agent** — 檢查前端代碼品質
- **Scraper Agent** — 檢查後端 API 品質

---

**最後更新：** 2026-04-14
**狀態：** ✅ 生產就緒
