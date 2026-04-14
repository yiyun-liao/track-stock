# 規則載入清單

根據 Claude Code 最佳實踐，定義規則載入策略以優化 context 使用。

---

## 【CRITICAL】每次都載入

這些規則影響所有工作，必須始終可用，不能延遲載入。

- **agent-guidelines.md**
  - 用途：React 反模式檢查、代碼審查清單
  - 觸發場景：任何 React/TypeScript 代碼審查
  - 重要性：⭐⭐⭐⭐⭐ 防止常見 bug（useEffect 無限循環、依賴陳列缺失）

- **code-style.md**
  - 用途：命名規範、Git 流程、協作約定
  - 觸發場景：寫任何程式碼時
  - 重要性：⭐⭐⭐⭐⭐ 確保代碼一致性

---

## 【CONDITIONAL】按文件類型載入

這些規則只在編輯相關代碼時載入，節省 token。

### 前端相關（編輯 `frontend/` 下的文件時自動載入）
- **frontend-architecture.md**
  - 用途：組件分類、Hook 規範、數據流、性能規範
  - 檔案匹配：`frontend/components/**/*.tsx`, `frontend/lib/**/*.ts`
  - 大小：372 行 | 優先級：⭐⭐⭐⭐⭐

### 後端相關（編輯 `backend/` 下的文件時自動載入）
- **api-conventions.md**
  - 用途：API 設計、快取策略、重試機制、錯誤隔離
  - 檔案匹配：`backend/api/**`, `backend/services/**`
  - 大小：56 行 | 優先級：⭐⭐⭐⭐

### 分析相關（執行分析任務時自動載入）
- **investment-philosophy.md**
  - 用途：選股哲學、基本面分析、風險管理
  - 觸發場景：執行 `/project:analyze-stock` 或評估股票
  - 大小：238 行 | 優先級：⭐⭐⭐

### 評分相關（計算股票評分時自動載入）
- **scoring-reference.md**
  - 用途：評分系統權重、標準、評級定義
  - 觸發場景：計算股票評分、顯示 ScoringCard 組件
  - 大小：227 行 | 優先級：⭐⭐⭐

---

## 載入策略

| 規則 | 檔案大小 | 載入方式 | 何時觸發 |
|------|---------|---------|---------|
| agent-guidelines.md | 224 行 | 自動 | 始終 |
| code-style.md | 40 行 | 自動 | 始終 |
| **小計（CRITICAL）** | **264 行** | - | - |
| frontend-architecture.md | 372 行 | 條件 | 編輯 frontend/* |
| api-conventions.md | 56 行 | 條件 | 編輯 backend/* |
| investment-philosophy.md | 238 行 | 條件 | 股票分析任務 |
| scoring-reference.md | 227 行 | 條件 | 評分計算任務 |
| **小計（CONDITIONAL）** | **893 行** | - | - |
| **總計** | **1,157 行** | - | - |

---

## Token 節省預期

### 現在（無策略）
- 每次對話：載入 1,157 行規則
- 平均 context：所有規則都載（浪費）

### 改進後（選擇性載入）
| 場景 | 載入規則 | 行數 | 節省 |
|------|---------|------|------|
| 一般代碼審查 | agent-guidelines + code-style | 264 行 | ⬇️ 77% |
| 前端開發 | + frontend-architecture | 636 行 | ⬇️ 45% |
| 後端開發 | + api-conventions | 320 行 | ⬇️ 72% |
| 股票分析 | + investment-philosophy + scoring | 729 行 | ⬇️ 37% |
| **平均節省** | - | ~387 行 | ⬇️ **67%** |

---

## 實現方式

### 方式 1：手動（現階段）
開發者在提示中明確指出：「我在做前端開發」→ Claude 主動載入 frontend-architecture.md

### 方式 2：自動（未來）
在 settings.json 中配置選擇性載入：
```json
{
  "rules_loading": "selective",
  "rules": {
    "critical": ["agent-guidelines.md", "code-style.md"],
    "conditional": {
      "frontend/": "frontend-architecture.md",
      "backend/": "api-conventions.md"
    }
  }
}
```

---

## 使用建議

1. **開發前端時** → 自動載入 frontend-architecture.md
   ```
   「我要修改 StockChart 組件」
   → Claude 自動讀取 frontend-architecture.md
   ```

2. **進行股票分析時** → 自動載入相關規則
   ```
   「分析 AAPL」
   → Claude 自動讀取 investment-philosophy.md + scoring-reference.md
   ```

3. **代碼審查時** → 必定加載 agent-guidelines.md
   ```
   任何 useEffect 或 Hook 相關的代碼
   → agent-guidelines.md 自動應用
   ```

---

**最後更新：** 2026-04-14
**狀態：** ✅ 已建立
