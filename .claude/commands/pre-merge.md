# /project:pre-merge

Branch merge 前的完整品質檢查。涵蓋結構、型別、測試、i18n 四個面向，最後輸出 PR review 摘要。

## 使用方式

```
/project:pre-merge
```

---

## 執行步驟

### Step 0：收集 branch 變更範圍

```bash
# 找出此 branch 相對 main 的所有變更檔案
git diff main...HEAD --name-only

# 查看 commits
git log main...HEAD --oneline
```

從這份清單決定後續要審查哪些檔案。

---

### Step 1：結構檢查

#### Python（backend/）

- 每個模塊只有一種職責（ScraperAgent 只 scrape，AnalyzerAgent 只 analyze）
- Service 不自己讀 `.env`，由外部注入 API key
- 有 type hints（`def foo(symbol: str) -> dict:`）
- 函數長度控制在 50 行以內
- 所有 `print` / `logger` 有意義的前綴（如 `[AnalyzerAgent]`）

```bash
# 找沒有 type hint 的函數定義
grep -n "^def " backend/**/*.py | grep -v "def .*->.*:"

# 找超過 50 行的函數（輔助用）
awk '/^def /{start=NR} start && NR-start>50{print FILENAME ":" start; start=0}' $(git diff main...HEAD --name-only | grep "\.py$")
```

#### TypeScript/React（frontend/）

- 純 UI 組件放 `components/ui/`，業務邏輯組件放 `components/sections/`
- UI 組件不能呼叫 `useStocks`、`useAnalysis` 等 data hooks
- 同一 API 在同一 render cycle 只呼叫一次（不重複 fetch）
- `useEffect` 依賴陣列完整（ESLint `react-hooks/exhaustive-deps`）
- 檔名：React 組件用 PascalCase，其他用 kebab-case

```bash
# 確認 ESLint 通過
cd frontend && npx eslint . --ext .ts,.tsx --quiet 2>&1 | head -40
```

#### Claude API 使用

- AnalyzerAgent 的 prompt 有注入結構化資料（不只傳 symbol）
- system prompt 有引用 `investment-philosophy.md` 的框架
- 有 try-catch 包裹 Claude API 呼叫

---

### Step 2：型別正確性

```bash
# TypeScript 型別檢查
cd frontend && npx tsc --noEmit 2>&1 | head -50

# Python：確認沒有 `Any` 被誤用（有標記即可，不強制禁止）
grep -rn ": Any" backend/ --include="*.py"
```

逐一確認：
- TypeScript 無 `any`（`lib/types.ts` 定義完整）
- 新增的 API response 有對應的 interface
- Python Pydantic model 或 TypedDict 有覆蓋新欄位

---

### Step 3：測試正確性

```bash
# 執行後端測試
cd backend && python -m pytest tests/ -v 2>&1 | tail -30

# 執行前端測試（若有）
cd frontend && npm test -- --watchAll=false 2>&1 | tail -20
```

檢查重點：
- 新功能有對應測試（至少 smoke test）
- 測試能 pass（不是 skip 或 xfail）
- Mock 的 API key 不是真實值

---

### Step 4：i18n 完整性

此 project 使用 `frontend/lib/i18n/zh.ts`（繁體中文）與 `frontend/lib/i18n/en.ts`（英文）。

```bash
# 找出 branch 中所有新增的 i18n key（從 zh.ts 的 diff）
git diff main...HEAD -- frontend/lib/i18n/zh.ts

# 找出 en.ts 對應的 diff
git diff main...HEAD -- frontend/lib/i18n/en.ts
```

**自動比對：**

```bash
# 提取 zh.ts 的所有 key
node -e "const zh = require('./frontend/lib/i18n/zh.ts'); console.log(Object.keys(zh.default || zh))"

# 提取 en.ts 的所有 key
node -e "const en = require('./frontend/lib/i18n/en.ts'); console.log(Object.keys(en.default || en))"
```

或直接讀取兩個檔案，比對所有 key 是否在兩個語言都有對應值：

- `zh.ts` 中文值必須是**繁體中文**（不是簡體）
- `en.ts` 英文值必須是完整句子（不是空字串 `""`）
- 新組件使用的 `t('key')` 或 `translations.key` 必須在兩個語言都有定義

如有缺漏，列出：

```
❌ i18n 缺漏：
- zh.ts 有但 en.ts 沒有：[key1, key2]
- en.ts 有但 zh.ts 沒有：[key3]
- 空值（需補上）：[key4 in en.ts]
```

---

### Step 5：輸出 PR Review 摘要

用以下格式整理完整報告：

```
## Pre-Merge Check：[branch name]
> 時間：[datetime]
> 變更範圍：[N 個檔案，M 個 commits]

---

### ✅ 通過項目
- 結構：...
- 型別：TypeScript 無錯誤 / Python type hints 完整
- 測試：N 個測試全部通過
- i18n：zh.ts + en.ts 所有 key 同步

---

### ❌ 需修正（Merge 前必須處理）
1. [嚴重] `path/to/file.ts:42` — 描述問題
   - 修正前：`code`
   - 修正後：`code`
   - 原因：...

---

### ⚠️ 建議改進（非必要，可下個 iteration）
1. [建議] `path/to/file.py:10` — 描述建議
   - 原因：...

---

### 📋 i18n 狀態
| Key | zh.ts | en.ts |
|-----|-------|-------|
| key1 | ✅ | ✅ |
| key2 | ✅ | ❌ 缺漏 |

---

### 🔢 統計
- 結構問題：N 個
- 型別錯誤：N 個
- 測試失敗：N 個
- i18n 缺漏：N 個
- **整體評估**：✅ 可以 merge / ❌ 需修正後再 merge
```

---

## 注意事項

- 所有問題按嚴重性排列：`❌ 必修` > `⚠️ 建議`
- i18n key 對應要逐一確認，不能靠猜測
- Python type hint 缺漏列出但不強制阻擋（視嚴重度而定）
- ESLint 錯誤（非 warning）視為 `❌ 必修`
- 執行完後詢問：「是否要將此報告複製到 PR description？」
