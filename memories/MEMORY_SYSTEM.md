# Agent Memory System
# ===================

## 目录结构

```
memories/
├── raw/                    # 原始记忆（会话记录）
│   ├── session_001.jsonl
│   ├── session_002.jsonl
│   └── ...
├── summary/                # 摘要记忆（蒸馏后）
│   ├── daily/
│   ├── weekly/
│   └── monthly/
├── consolidated/           # 归档记忆（长期保存）
│   ├── knowledge/
│   ├── preferences/
│   └── patterns/
└── index/                  # 记忆索引
    ├── tags.jsonl
    ├── timeline.jsonl
    └── relations.jsonl
```

## 记忆格式

### 原始记忆 (raw/)
```json
{
  "id": "uuid",
  "session_id": "session_uuid",
  "timestamp": "2026-09-03T10:30:00Z",
  "type": "user_input|agent_response|tool_call|tool_result",
  "content": "记忆内容",
  "metadata": {
    "agent": "friday",
    "tool": "google_drive",
    "importance": 0.8
  }
}
```

### 摘要记忆 (summary/)
```json
{
  "id": "uuid",
  "period": "2026-09-03",
  "type": "daily|weekly|monthly",
  "summary": "摘要内容",
  "key_points": ["要点1", "要点2"],
  "decisions": ["决策1", "决策2"],
  "action_items": ["待办1", "待办2"],
  "created_at": "2026-09-03T23:59:59Z"
}
```

### 归档记忆 (consolidated/)
```json
{
  "id": "uuid",
  "category": "knowledge|preferences|patterns",
  "title": "记忆标题",
  "content": "归档内容",
  "tags": ["tag1", "tag2"],
  "confidence": 0.95,
  "last_accessed": "2026-09-03T10:30:00Z",
  "access_count": 15
}
```

## 记忆操作

### 1. 记录 (Remember)
```javascript
memory.remember({
  content: "用户喜欢用Markdown格式",
  type: "preference",
  importance: 0.7
})
```

### 2. 回忆 (Recall)
```javascript
const memories = await memory.recall({
  query: "用户偏好",
  limit: 10,
  min_confidence: 0.8
})
```

### 3. 蒸馏 (Distill)
```javascript
await memory.distill({
  source: "raw",
  target: "summary",
  period: "daily"
})
```

### 4. 归档 (Archive)
```javascript
await memory.archive({
  source: "summary",
  target: "consolidated",
  category: "knowledge"
})
```

## 自动蒸馏规则

### 每日蒸馏
- 时间：每天 23:59
- 来源：raw/ 目录
- 目标：summary/daily/
- 保留：7 天

### 每周蒸馏
- 时间：每周日 23:59
- 来源：summary/daily/
- 目标：summary/weekly/
- 保留：90 天

### 每月蒸馏
- 时间：每月最后一天 23:59
- 来源：summary/weekly/
- 目标：summary/monthly/
- 保留：365 天

### 归档规则
- 来源：summary/monthly/
- 目标：consolidated/
- 条件：重要性 > 0.8 或访问次数 > 5

## 记忆检索

### 按标签检索
```javascript
const memories = await memory.search({
  tags: ["工作", "项目"],
  limit: 20
})
```

### 按时间检索
```javascript
const memories = await memory.search({
  from: "2026-09-01",
  to: "2026-09-03",
  type: "summary"
})
```

### 按关联检索
```javascript
const related = await memory.getRelated({
  memory_id: "uuid",
  depth: 2
})
```

## 容量管理

### 容量限制
- 原始记忆：100MB
- 摘要记忆：50MB
- 归档记忆：20MB
- 总计：170MB

### 清理策略
1. 原始记忆超过 7 天自动删除
2. 摘要记忆超过 90 天自动归档
3. 归档记忆超过 365 天压缩存储
4. 低重要性记忆优先清理

## 隐私保护

### 数据脱敏
- 自动识别敏感信息
- 替换为占位符
- 保留上下文结构

### 加密存储
- 本地数据 AES-256 加密
- 传输数据 TLS 1.3
- 密钥安全存储

### 访问控制
- 用户只能访问自己的记忆
- 管理员可查看统计信息
- 审计日志记录所有访问
