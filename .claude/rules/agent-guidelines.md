# Agent 训练指南

## 📚 核心目标

根据项目的 video-coding 学习目标，Agent 应该掌握：
1. **自主诊断** - 在用户报告问题前就发现问题
2. **架构思维** - 设计时就避免常见错误
3. **质量守护** - 通过自动化检查保证代码质量

---

## ❌ 反面教材库

### 反例 1: useEffect 无限循环（已修复）

**问题代码：**
```tsx
useEffect(() => {
  setLastUpdate(new Date().toLocaleTimeString())
}, [stocks, news])  // ❌ 错误！
```

**为什么错误：**
1. 当 `stocks` 或 `news` 改变时，执行 useEffect
2. `setLastUpdate()` 改变 `lastUpdate` 状态
3. `lastUpdate` 改变 → 页面重新渲染
4. 页面重新渲染 → useStocks() 和 useNews() 被重新调用
5. useStocks 和 useNews 返回新数据 → stocks/news 改变
6. 回到步骤 1 → **无限循环**

**正确做法：**
```tsx
useEffect(() => {
  setLastUpdate(new Date().toLocaleTimeString())
}, [refreshTrigger])  // ✅ 只在用户点击时更新
```

**Agent 应该学到的教训：**
- 任何改变状态的操作都可能导致级联重新渲染
- 要想清楚依赖链的完整路径
- 使用 ESLint `react-hooks/exhaustive-deps` 规则

**如何预防：**
1. 在设计时就思考数据流
2. 使用 ESLint 强制检查
3. 避免在 useEffect 中改变导致重新渲染的状态

---

### 反例 2: useEffect 依赖陈列缺失

**问题代码：**
```tsx
const fetchData = useCallback(async () => {
  // ...
}, [])

useEffect(() => {
  fetchData()  // 使用了 fetchData
}, [])  // ❌ 但没有在依赖陈列中
```

**为什么错误：**
- ESLint `exhaustive-deps` 规则会警告
- 虽然当前工作（因为 fetchData 引用稳定），但违反了 React hooks 规则
- 如果有人在 fetchData 中添加新依赖，可能导致 bug

**正确做法：**
```tsx
useEffect(() => {
  fetchData()
}, [fetchData])  // ✅ 添加所有使用的函数
```

**Agent 应该学到的教训：**
- 任何在 useEffect 中使用的变量/函数都要在依赖陈列中
- 这是 React hooks 的基本规则，不能马虎
- ESLint 不是建议，是强制规范

**如何预防：**
1. 始终启用 `react-hooks/exhaustive-deps: "error"`
2. 不要忽视 ESLint 警告
3. 提交前必须通过 `npm run lint`

---

## ✅ 代码审查检查表

### 提交前必检项

```
Hook 与副作用 (10 分)
- [ ] 所有 useEffect 的依赖陈列都完整（ESLint 通过）
- [ ] 没有 useEffect 引起的无限循环
- [ ] useCallback 依赖正确
- [ ] 状态更新不会导致级联重新渲染
- [ ] 自定义 hooks 有完整的类型定义
- [ ] 自定义 hooks 有 JSDoc 注释
- [ ] fetchData / API 调用不会重复执行
- [ ] 错误处理完善
- [ ] 加载状态管理清晰
- [ ] 重试逻辑合理

API 与数据 (8 分)
- [ ] API 调用有缓存检查
- [ ] API 响应时间 < 2s (95th percentile)
- [ ] 没有重复的 API 调用
- [ ] 错误处理有回退方案
- [ ] 数据格式验证完善
- [ ] 类型定义完整
- [ ] API 客户端集中管理
- [ ] 请求去重实现

性能 (7 分)
- [ ] 没有不必要的重新渲染
- [ ] 使用了 React.memo / useMemo 优化
- [ ] 列表使用了 key prop
- [ ] 图片优化（懒加载、尺寸）
- [ ] 捆绑包大小检查
- [ ] 首屏加载时间 < 3s
- [ ] 交互响应 < 100ms

类型安全 (5 分)
- [ ] TypeScript 无错误（严格模式）
- [ ] 没有 `any` 类型
- [ ] 接口定义完整
- [ ] 类型导出一致
- [ ] 泛型使用正确

```

### Agent 应该主动提醒的事项

```
⚠️ 危险信号 (立即处理)
1. useEffect 依赖陈列中有对象/数组字面量
   → 可能导致无限循环
   → 改为 useMemo / useRef

2. 在 render 中定义对象/函数
   → 每次 render 都是新引用
   → 导致 useEffect 重复执行
   → 移到 component 外或使用 useCallback

3. API 调用没有缓存
   → 浪费配额
   → 降低性能
   → 添加时间戳缓存

4. try-catch 中没有具体错误处理
   → 用户不知道发生了什么
   → 添加错误日志和用户提示

⚠️ 性能警告
1. 如果 useEffect 依赖 > 3
   → 考虑拆分成多个小 effects

2. 如果 API 响应 > 3s
   → 需要优化或添加缓存

3. 如果组件重新渲染 > 5 次/操作
   → 需要使用 React.memo / useMemo

🔍 代码质量检查
1. 所有 console.log 都有前缀（如 [useStocks]）
2. 没有注释掉的代码
3. 变量命名清晰一致
4. 函数长度 < 50 行
5. 复杂逻辑有注释说明
```

---

## 🤖 Agent 提示词模板

### 提示词 1: 代码审查

```
你是一个严格的 React 代码审查官。
审查以下代码，检查：
1. useEffect 依赖陈列是否完整？
2. 是否有可能导致无限循环的代码？
3. API 调用是否有缓存？
4. 性能是否有问题？
5. 类型定义是否完整？

如果有问题，提出具体的修改建议。
如果没有问题，说明"代码审查通过"。
```

### 提示词 2: 自动诊断

```
分析这个 API 日志，寻找性能问题：
- 是否有重复调用？
- API 响应时间是否过长？
- 是否有不必要的请求？

如果有问题，提出优化建议。
```

### 提示词 3: 架构建议

```
我要实现一个新功能：[功能描述]
基于反面教材库，预测可能出现的 bug：
1. useEffect 可能的问题
2. API 调用可能的问题
3. 性能可能的问题
4. 类型安全可能的问题

并提出预防措施。
```

---

## 📋 下一步行动

1. **立即** - ESLint 检查必须通过（0 错误）✅ 已完成
2. **本周** - 编写自动化性能监控工具
3. **本周** - 为关键 hooks 编写单元测试
4. **下周** - 集成 GitHub Actions CI/CD
5. **下周** - 训练 Agent 自动诊断能力

