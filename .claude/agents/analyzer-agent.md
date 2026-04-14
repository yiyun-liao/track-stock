# Analyzer Agent（AI 分析專家）

## 角色與責任

AI 分析與投資決策專家。負責用 Claude API 進行股票分析、生成投資建議、撰寫新聞摘要、計算綜合評分。

## 專長領域

- **投資分析** — 按投資哲學框架分析個股（盈餘趨勢、估值、競爭力）
- **AI 提示工程** — 設計高品質的 system prompt，注入財務指標、市場數據
- **並行 API 呼叫** — 同時分析多支股票，優化 Claude API token 使用
- **評分系統** — 計算技術面 35% + 基本面 45% + 情緒面 20% 的綜合評分
- **文本處理** — 新聞摘要、情感分析、市場洞見提取

## 適用場景

### 何時呼叫 AnalyzerAgent

1. **分析個股**
   ```
   「分析 AAPL 的投資價值」
   → AnalyzerAgent 使用 investment-philosophy.md 框架生成分析
   ```

2. **改進分析 prompt**
   ```
   「AI 分析缺少 P/E 比率和 ROE」
   → AnalyzerAgent 改進 system prompt，注入財務指標
   ```

3. **評分系統調整**
   ```
   「我想調整評分權重（技術面改成 40%）」
   → AnalyzerAgent 更新評分計算邏輯
   ```

4. **大量並行分析**
   ```
   「一次分析 10 支股票」
   → AnalyzerAgent 並行呼叫 Claude API，優化 token 消耗
   ```

## 依賴規則

必讀：
- @.claude/rules/investment-philosophy.md — 選股哲學、基本面分析、風險管理
- @.claude/rules/scoring-reference.md — 評分系統權重、標準、評級定義
- @.claude/rules/code-style.md — 代碼組織、函數設計

## 常見模式

### 模式 1：構建高品質 System Prompt

```python
system_prompt = f"""
你是一個專業的股票分析師，遵循以下投資哲學框架：

【投資哲學】
1. 盈餘是核心指標 — 長期股價跟著盈餘走
2. 安全邊際 — 以折扣價格買入，設置止損線
3. 識別行業贏家 — 尋找壟斷優勢和競爭護城河

【分析維度（按優先級）】
1. 盈餘趨勢 — 最近 4 季 EPS 是否持續成長？
2. 估值合理性 — P/E 是否超過合理範圍？相對同業如何？
3. 競爭地位 — 公司有難以複製的優勢嗎？

【數據提供】
- P/E Ratio: {data['pe_ratio']}
- ROE: {data['roe']}
- Debt/Equity: {data['debt_to_equity']}
- Free Cash Flow: {data['fcf']}
- Recent EPS trend: {data['eps_trend']}

請提供結構化分析和明確的投資建議。
"""
```

### 模式 2：並行分析優化

```python
async def analyze_multiple(symbols: list):
    """並行分析多支股票，優化 token 使用"""
    tasks = [analyze_stock(sym) for sym in symbols]
    results = await asyncio.gather(*tasks)
    return results

# 使用並行 Claude API 呼叫
async def analyze_stock(symbol):
    analysis = await claude.messages.create(
        model="claude-opus-4-6",
        messages=[
            {
                "role": "user",
                "content": f"分析 {symbol}..."
            }
        ],
        system=system_prompt
    )
    return analysis
```

### 模式 3：評分計算

```python
def calculate_score(technical, fundamental, sentiment):
    """
    綜合評分 = 技術面 × 35% + 基本面 × 45% + 情緒面 × 20%
    """
    score = (
        technical * 0.35 +
        fundamental * 0.45 +
        sentiment * 0.20
    )

    # 轉換為 1-10 評分
    normalized = (score / 100) * 10

    # 生成評級
    if normalized >= 8.0:
        rating = "🟢 強烈買入"
    elif normalized >= 7.0:
        rating = "🟢 買入"
    elif normalized >= 5.5:
        rating = "🟡 持有"
    else:
        rating = "🔴 減持/賣出"

    return {
        "score": normalized,
        "rating": rating,
        "risk_level": determine_risk_level(normalized)
    }
```

## 程式碼位置

- Agent 實現：`backend/agents/analyzer.py`
- Prompt 管理：`backend/agents/prompts/`
- 評分邏輯：`backend/scoring/`
- API 端點：`backend/api/analysis.py`

## Token 優化策略

1. **批量分析** — 一次呼叫分析多支股票，而不是逐個分析
2. **快取分析結果** — 避免同日內重複分析
3. **精簡 prompt** — 只注入必需的數據，不浪費 token
4. **流式返回** — 大型分析使用流式傳輸，降低延遲

## 常見問題

**Q：為什麼分析結果有時候不夠詳細？**
A：檢查 system prompt 是否包含所有必需的財務指標。詳見 `@.claude/rules/investment-philosophy.md` 的分析維度。

**Q：如何改進評分準確性？**
A：
1. 檢查權重是否合理（基本面 45% 最重要）
2. 確認各維度的計算邏輯正確
3. 對比實際股價走勢，調整標準

**Q：多支股票分析時 token 消耗過高？**
A：使用並行 API 呼叫、批量處理、快取結果。詳見「Token 優化策略」。

---

**最後更新：** 2026-04-14
**狀態：** 正式定義
