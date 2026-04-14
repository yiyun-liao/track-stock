# 代碼風格規範

## 命名規範

- **Python**：snake_case（函數、變數）、PascalCase（類別）
- **TypeScript/JavaScript**：camelCase（變數、函數）、PascalCase（組件、類別）
- **檔案名**：snake_case（Python）、kebab-case（TypeScript 組件）

## 代碼組織原則

- **單一責任**：每個模塊負責明確的單一功能，不要把多種邏輯混在一起
- **依賴注入**：Services 不自己讀 `.env`，由外部傳入。避免強耦合，便於測試
- **型別提示**：Python 使用 type hints，TypeScript 確保完整型別，不用 `any`

## 函數設計

- 函數長度控制在 50 行以內
- 複雜邏輯必須有注釋說明
- 所有 console.log 加前綴（例如 `[useStocks]`、`[Analyzer]`）
- 不要留下注釋掉的廢棄代碼

## Git 工作流

- **不自動提交**：完成功能後，先展示 `git diff` 供用戶審查
- **不自動推送**：在用戶確認前，不執行 `git add` 和 `git push`
- **用戶主導**：用戶確認無誤後，再由我執行提交和推送

## 代碼質量

- 提交前確保代碼可運行（至少 import 不會 error）
- 新功能配合測試（至少基本 smoke test）
- 避免過度設計，按需求實現，不要預先抽象

## 協作約定

1. **輸入**：用戶給目標和預期輸出格式，不是步驟
2. **流程**：我自主規劃執行方式，完成後展示結果
3. **Review**：展示 diff → 用戶審查 → 確認後 commit
4. **Debug**：用戶提供目標、輸入、預期輸出、實際輸出
5. **主動補充**：若需求不清楚，主動要求補充 context
