# 前端架構規範

本文檔規定了前端代碼的架構標準，確保代碼組織清晰、可維護性強。

## 📁 目錄結構規範

```
frontend/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 主頁面 (Dashboard)
│   ├── layout.tsx         # 根佈局 (Providers 應在此)
│   └── globals.css        # 全局樣式
│
├── components/
│   ├── ui/                # ✅ 純 UI 組件 (零業務邏輯)
│   │   ├── Header.tsx
│   │   ├── ToggleButton.tsx (通用 Toggle 組件)
│   │   ├── MarkdownContent.tsx
│   │   └── NewsSection.tsx (純展示)
│   │
│   ├── sections/           # ✅ 業務邏輯組件 (含數據)
│   │   ├── AnalysisCard.tsx (接收 analysis prop)
│   │   ├── StockChart.tsx
│   │   ├── StockList.tsx
│   │   ├── TabsSection.tsx
│   │   └── AlertsSection.tsx
│   │
│   └── ⚠️ 不放這裡：
│       └── 混合的 UI + 業務邏輯組件
│
├── lib/
│   ├── contexts/           # ✅ 全局狀態 (主題、語言)
│   │   ├── theme-context.tsx
│   │   └── language-context.tsx
│   │
│   ├── hooks/              # ✅ 數據獲取邏輯
│   │   ├── useMounted.ts (Hydration 安全)
│   │   ├── useStocks.ts
│   │   ├── useNews.ts
│   │   ├── useAnalysis.ts
│   │   └── useStockHistory.ts
│   │
│   ├── api.ts              # API 客戶端
│   ├── types.ts            # TypeScript 類型定義
│   └── ⚠️ 不放這裡：
│       └── UI 組件
│
└── package.json
```

---

## 🏗️ 組件分類規則

### ✅ UI 組件 (`/components/ui/`)

**定義**：零業務邏輯的純展示層

**特徵**：
- ❌ 不能調用數據 hooks (useStocks, useAnalysis 等)
- ❌ 不能調用 context 進行複雜業務
- ✅ 只接收 props 和使用 UI context (主題、語言)
- ✅ 可以使用 useTheme, useLanguageSafe (UI state)
- ✅ 只負責渲染和簡單的 UI 狀態

**例子**：
```tsx
// ✅ 正確：純 UI 組件
export function ToggleButton({ isActive, onClick, label }) {
  return <button onClick={onClick}>{label}</button>
}

// ❌ 錯誤：在 UI 組件中調用數據 hook
export function StockDisplay() {
  const { data } = useStocks()  // ❌ 不能在 UI 組件做這個
  return <div>{data}</div>
}
```

### ✅ 業務邏輯組件 (`/components/sections/`)

**定義**：包含數據獲取、狀態管理的容器組件

**特徵**：
- ✅ 調用 useXxx hooks 獲取數據
- ✅ 處理複雜的業務邏輯和條件渲染
- ✅ 接收必要的 props 進行數據過濾
- ✅ 可以調用自訂 hooks (useMounted 等)
- ✅ 向 UI 組件傳遞數據

**例子**：
```tsx
// ✅ 正確：在業務邏輯組件中調用 hook
export function StockChart({ symbol }) {
  const { data } = useStockHistory(symbol)  // ✅ 可以
  return <ChartUI data={data} />
}

// ✅ 正確：接收完整數據，按條件渲染
export function AnalysisCard({ analysis, showOnlyAlert }) {
  if (showOnlyAlert) {
    return <AlertUI content={analysis.price_alert} />
  }
  return <SummaryUI content={analysis.news_summary} />
}
```

---

## 📊 數據流規範

### ✅ 正確的數據流

```
Dashboard (page.tsx)
├─ useStocks() → 調用一次
├─ useNews() → 調用一次
├─ useAnalysis(symbol, language) → 在 Dashboard 調用，非在子組件
└─ TabsSection
   ├─ StockChart (接收 symbol)
   │  └─ useStockHistory(symbol) → 自己獲取歷史數據
   └─ AnalysisCard (接收 analysis prop)
      └─ ❌ 不再調用 useAnalysis
```

### ❌ 避免的錯誤

**錯誤 1：重複 API 呼叫**
```tsx
// ❌ 錯誤：兩個 AnalysisCard 各呼叫一次 API
<TabsSection>
  <AnalysisCard showOnlyAlert />    // useAnalysis() → /api/analysis
  <AnalysisCard showOnlySummary />  // useAnalysis() → /api/analysis (重複!)
</TabsSection>

// ✅ 正確：在 Dashboard 調用一次，傳 prop 給兩個組件
const { data: analysis } = useAnalysis(symbol)
<AnalysisCard analysis={analysis} showOnlyAlert />
<AnalysisCard analysis={analysis} showOnlySummary />
```

**錯誤 2：在 UI 組件中調用 hook**
```tsx
// ❌ 錯誤：ToggleButton 是 UI，不應該有業務邏輯
function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage()  // ❌ 放在 UI?
  return <button onClick={toggleLanguage}>{language}</button>
}

// ✅ 正確：提取通用 UI，業務邏輯在上層
function ToggleButton({ value, onChange }) {
  return <button onClick={onChange}>{value}</button>
}

function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage()
  return <ToggleButton value={language} onChange={toggleLanguage} />
}
```

---

## 🎨 通用組件規範

### Toggle 按鈕統一樣式

所有 toggle 型按鈕應使用統一的 **ToggleButton** 組件：

```tsx
// /components/ui/ToggleButton.tsx
interface ToggleButtonProps {
  value: string          // 顯示的文字
  onChange: () => void   // 切換回調
  title?: string        // 提示文本
}

export function ToggleButton({ value, onChange, title }: ToggleButtonProps) {
  return (
    <button
      onClick={onChange}
      className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-xs font-medium"
      title={title}
    >
      {value}
    </button>
  )
}
```

**使用**：
```tsx
<ToggleButton
  value={language === 'zh' ? 'EN' : '中'}
  onChange={toggleLanguage}
  title="Toggle language"
/>

<ToggleButton
  value={theme === 'light' ? '🌙' : '☀️'}
  onChange={toggleTheme}
  title="Toggle theme"
/>
```

---

## 🪝 Hooks 規範

### 1. 數據 Hooks

**用途**：API 調用、數據狀態管理

**命名**：`use[DataName]`

**返回結構**：
```tsx
interface UseStateReturn {
  data: T | null
  loading: boolean
  error: string
  refetch: () => Promise<void>
}
```

**規則**：
- ✅ 只在業務邏輯組件中使用
- ✅ 可以接收 enabled flag 控制何時執行
- ❌ 不要在 UI 組件中使用

### 2. UI Hooks (Context)

**用途**：全局 UI 狀態（主題、語言）

**命名**：`useLanguage()`, `useTheme()`

**規則**：
- ✅ 可在 UI 和業務邏輯組件中使用
- ✅ UI 組件可以直接調用
- ⚠️ 要提供 Safe 版本（useLanguageSafe）處理 hydration

### 3. 工具 Hooks

**用途**：通用工具函數（mounted 檢測等）

**命名**：`use[Utility]`

**例子**：
```tsx
// /lib/hooks/useMounted.ts
export function useMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted
}

// 使用
function MyComponent() {
  const mounted = useMounted()
  if (!mounted) return <LoadingPlaceholder />
  return <ActualContent />
}
```

---

## 🌍 Context 使用規範

### Language Context

**用途**：多語言支持

**使用位置**：
- ✅ Header (UI 組件) - 切換語言
- ✅ AnalysisCard (業務組件) - 獲取當前語言傳給 API
- ✅ 所有需要 i18n 的組件

**規則**：
- ✅ 使用 useLanguageSafe() 在可能失敗的地方（hydration 時）
- ✅ 在業務組件中獲取語言，傳給數據 hook

### Theme Context

**用途**：深色/淺色模式

**使用位置**：
- ✅ Header (UI 組件) - 切換主題
- ✅ MarkdownContent (UI 組件) - 根據主題選擇色彩方案
- ❌ 業務邏輯組件不需要

---

## ⚠️ 代碼重複 - 檢查清單

| 場景 | 何時提取 | 解決方案 |
|------|---------|--------|
| **3+ 個組件用相同 UI** | 立即 | 提取到 `/components/ui/` |
| **重複的 state 邏輯** | 出現 2 次 | 提取到 custom hook |
| **相同的樣式類** | 重複使用 | 提取到 Tailwind @apply 或組件 |
| **相同的條件邏輯** | 重複 3+ 次 | 提取到 util function 或 hook |

**例子：mounted 邏輯重複**
```tsx
// ❌ 不好：重複 3 次
function Component1() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  // ...
}

// ✅ 好：提取到 hook
function useMounted() { /* ... */ }
```

---

## 🔄 性能規範

### 1. API 呼叫優化

**規則**：
- ❌ 同一 API 不要在同個 render cycle 中呼叫 2 次
- ✅ 在最上層的 component 呼叫，下層接收 prop
- ✅ 使用 `refetch()` 進行手動刷新

**檢查**：
```tsx
// ❌ 不好：兩個 useAnalysis 各呼叫一次
<AnalysisCard showOnlyAlert />
<AnalysisCard showOnlySummary />

// ✅ 好：一個 useAnalysis，兩個組件接收
const { data: analysis } = useAnalysis()
<AnalysisCard analysis={analysis} showOnlyAlert />
<AnalysisCard analysis={analysis} showOnlySummary />
```

### 2. 組件 Memoization

**規則**：
- ✅ 純 UI 組件（不接收複雜 props）應該 memo
- ✅ 接收回調 prop 的組件應該 memo + useCallback
- ❌ 如果 memo 沒有帶來性能提升，可以移除

### 3. 依賴陣列

**規則**：
- ✅ useEffect, useCallback 必須有完整的依賴陣列
- ❌ 不要省略或忽視 ESLint 警告
- ✅ 使用 useCallback 包裝回調，減少不必要的依賴

---

## 📝 審查清單

在提交代碼前，確保：

- [ ] 純 UI 組件放在 `/components/ui/`
- [ ] 業務邏輯組件放在 `/components/sections/`
- [ ] 沒有在 UI 組件中調用數據 hooks
- [ ] 沒有重複的 API 呼叫
- [ ] 所有 toggle 使用統一的 ToggleButton
- [ ] 沒有重複的 mounted/hydration 邏輯
- [ ] useCallback/useEffect 有完整的依賴陣列
- [ ] 有相同邏輯的部分已提取到 hook 或組件
- [ ] 所有組件都有 React.memo（如適用）

---

## 🔗 相關文檔

- `CLAUDE.md` - 項目規劃和進度
- `ARCHITECTURE.md` - Day 5 架構審查結果
