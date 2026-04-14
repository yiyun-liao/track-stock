# Claude Code 結構優化計畫

根據 https://thisweb.dev/post/claude-code-structure 的建議，優化 .claude/ 配置。

## 第一步（優先）— 快速勝利，高 ROI

- [ ] **Task 1:** 建立 `.claude/rules/_manifest.md` — 定義規則載入策略
  - 標記 CRITICAL 規則（每次都載）
  - 標記 CONDITIONAL 規則（按檔案類型載）
  - 預估 token 節省：~75%

- [ ] **Task 2:** 改 CLAUDE.md 用 `@path` 引用規則
  - 將規則表格改成 `@.claude/rules/xxx.md` 語法
  - 保留現有內容，只改規則索引部分
  - 預估 context 節省：平均每次 70%

---

## 第二步 — 優化自動化

- [ ] **Task 3:** 擴充 `settings.local.json`
  - 加入 hooks（提交前自動跑檢查）
  - 加入更多權限（npm lint, type-check, git 等）
  - 設定 selective rule loading

- [ ] **Task 4:** 建立 `.claude/agents/` 目錄
  - 建立 `scraper-agent.md` — 資料爬蟲專家
  - 建立 `analyzer-agent.md` — AI 分析專家
  - 建立 `frontend-agent.md` — UI 前端專家（可選）

---

## 第三步 — 深度優化

- [ ] **Task 5:** 建立 `.claude/skills/` 目錄
  - 正式化 `review-day.md`
  - 正式化 `analyze-stock.md`
  - 正式化 `debug-api.md`
  - 正式化 `pre-merge.md`

- [ ] **Task 6:** 整理規則檔優先級
  - 標記 `agent-guidelines.md` 為 CRITICAL
  - 標記 `code-style.md` 為 CRITICAL
  - 其餘為 CONDITIONAL

---

## 預期成果

| 指標 | 目前 | 改進後 | 節省 |
|------|------|--------|------|
| Context overhead | 1,157 行 | ~300 行平均 | ⬇️ 75% |
| 自動化程度 | 零 | Hooks + Skills | ⬆️ 100% |
| Agent 識別度 | 隱含 | 正式文件 | ⬆️ 100% |

---

**開始時間：** 2026-04-14
**狀態：** 準備開始 → Task 1
