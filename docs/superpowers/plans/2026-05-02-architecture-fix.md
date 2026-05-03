# 架构文档修正实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 基于评审报告修正架构设计文档，使其成为AI驱动开发的可靠实施依据

**Architecture:** 对 `业务系统架构设计.md` 进行三阶段修改：先修结构（编号、去重），再补内容（缺失模块设计、数据库表），最后增强（AI层、测试策略）

**Tech Stack:** Markdown 文档编辑

**Spec:** `docs/superpowers/specs/2026-05-02-architecture-review.md`

---

## 文件结构

- **修改**: `业务系统架构设计.md` (主文档，4648行)
- **创建**: 无新文件，所有修改在主文档内完成

---

## 阶段一：结构修正

### Task 1: 修正章节编号和目录

**文件:**
- 修改: `业务系统架构设计.md`（全文多处）

**问题**: 章节编号混乱（两个第3章）、子节编号错位（3.1用作4.1）、章节顺序错乱（第9章在第7章前面）

- [ ] **Step 1: 修正主章节编号**

将下述章节重新编号，保持连续：
```
当前                                  →  修正后
## 3. 服务降级与容错机制 (行641)     →  删除，内容合并到第2章末尾
## 3. 后端模块设计 (行871)            →  ## 3. 后端模块设计 (不变)
## 4. 移动端适配规范 (行3073)         →  ## 4. 移动端适配规范 (不变)
## 5. 数据库设计 (行3213)             →  ## 5. 数据库设计 (不变)
## 6. Docker部署配置 (行3598)         →  ## 6. Docker部署配置 (不变)
## 9. 分批上线部署规划 (行3931)       →  ## 7. 分批上线部署规划
## 7. CI/CD流程 (行4121)             →  ## 8. CI/CD流程
## 8. 安全设计 (行4365)              →  ## 9. 安全设计
```

具体操作：
1. 将"## 3. 服务降级与容错机制"整节移动，作为"## 2. 微服务容器化部署"的子节（2.6），后续子节编号顺延
2. 修改"## 3. 后端模块设计"下所有子节编号：`2.1`→`3.1`, `2.2`→`3.2`, `2.3`→`3.3`, `2.4`→`3.4`, `2.5`→`3.5`
3. 修改"## 4. 移动端适配规范"下所有子节编号：`3.1`→`4.1`, `3.2`→`4.2`, `3.3`→`4.3`
4. 修改"## 5. 数据库设计"下子节编号：`4.1`→`5.1`
5. 修改"## 6. Docker部署配置"下子节编号：`5.1`→`6.1`, `5.2`→`6.2`, `5.5`→`6.3`
6. "## 9. 分批上线部署规划"→`## 7. 分批上线部署规划`，子节 `9.1-9.7`→`7.1-7.7`
7. "## 7. CI/CD流程"→`## 8. CI/CD流程`，子节 `6.1`→`8.1`
8. "## 8. 安全设计"→`## 9. 安全设计`，子节 `7.1-7.5`→`9.1-9.5`

- [ ] **Step 2: 更新目录**

修改文档开头的目录（行9-19），使其与实际章节对应：
```markdown
## 目录

1. [整体架构](#1-整体架构)
2. [微服务容器化部署](#2-微服务容器化部署)
3. [后端模块设计](#3-后端模块设计)
4. [移动端适配规范](#4-移动端适配规范)
5. [数据库设计](#5-数据库设计)
6. [Docker部署配置](#6-docker部署配置)
7. [分批上线部署规划](#7-分批上线部署规划)
8. [CI/CD流程](#8-cicd流程)
9. [安全设计](#9-安全设计)
10. [测试策略](#10-测试策略)
```

- [ ] **Step 3: 验证**

验证内容：确认文档中所有 `(#x-` 锚点链接与修正后的章节编号一致。

---

### Task 2: 去重合并内容

**文件:**
- 修改: `业务系统架构设计.md`

**问题**: Docker Compose 在第2.4节和第6节重复；环境变量配置在第2.5节和第6.2节重复

- [ ] **Step 1: 合并 Docker Compose 配置**

检查第2.4节（行219-578）和第6节（行3598-3712）的差异，合并为一份完整配置放在第6节，第2.4节改为引用：
```markdown
### 2.4 Docker Compose配置

完整的 Docker Compose 配置请参见 [第6节 Docker部署配置](#6-docker部署配置)。

以下仅列出容器划分和资源规划的摘要...
```
保留第2.4节的容器划分表和资源规划，删除重复的yaml配置块。

- [ ] **Step 2: 合并环境变量配置**

第2.5节（行588-601）的 `.env` 示例与第6.2节（行3716+）合并，统一放在第6.2节。第2.5节保留"容器间通信方案"的文字说明，删除 `.env` 代码块改为引用。

- [ ] **Step 3: 删除第2章中多余的细节配置**

第2章保留：容器划分方案（2.1）、容器架构图（2.2）、资源配置表（2.3）、容器间通信方案（2.5→2.4）、健康检查策略（2.6→2.5）。服务降级内容（原第3章）作为2.6。

---

## 阶段二：内容补充

### Task 3: 补充数据源管理模块设计

**文件:**
- 修改: `业务系统架构设计.md`（在表单引擎模块之后插入）

- [ ] **Step 1: 插入模块设计章节**

在 `### 2.3 表单引擎模块` 结束后（行1193之后）插入新章节：

```markdown
### 3.6 数据源管理模块 (data-source-module)

#### 模块职责

- 多类型数据源接入（PostgreSQL、MySQL、HTTP API、CSV文件）
- 数据源连接测试与健康检查
- 连接池管理与配置
- 数据源元数据获取（表结构、字段信息）
- 数据预览与采样

#### 核心API接口

```typescript
// 数据源管理
GET    /api/v1/data-sources                 // 数据源列表
POST   /api/v1/data-sources                 // 创建数据源
GET    /api/v1/data-sources/:id             // 获取数据源详情
PUT    /api/v1/data-sources/:id             // 更新数据源
DELETE /api/v1/data-sources/:id             // 删除数据源
POST   /api/v1/data-sources/:id/test        // 测试连接
GET    /api/v1/data-sources/:id/schema      // 获取表结构
GET    /api/v1/data-sources/:id/preview     // 数据预览

// 请求示例：创建数据源
// POST /api/v1/data-sources
{
  "code": "main_db",
  "name": "主数据库",
  "type": "postgresql",
  "config": {
    "host": "postgres",
    "port": 5432,
    "database": "app",
    "username": "reader",
    "password": "***"
  },
  "options": {
    "poolSize": 10,
    "timeout": 30000
  }
}

// 响应示例
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "uuid-xxx",
    "code": "main_db",
    "name": "主数据库",
    "type": "postgresql",
    "status": "active",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

#### 关键数据模型

```typescript
interface DataSource {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'http' | 'csv';
  config: DataSourceConfig;
  options?: DataSourceOptions;
  status: 'active' | 'error' | 'disabled';
  lastCheckedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DataSourceConfig {
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;      // 加密存储
  url?: string;            // HTTP API地址
  headers?: Record<string, string>;
}

interface DataSourceOptions {
  poolSize?: number;
  timeout?: number;
  ssl?: boolean;
}
```

#### 模块依赖

- 依赖：`auth-module`, `common-module`
- 被依赖：`form-module`, `report-module`

#### 代码量控制

| 子模块 | 建议行数 |
|--------|----------|
| DataSourceController | 200 |
| DataSourceService | 300 |
| ConnectionPoolService | 200 |
| SchemaService | 200 |
| DTOs & Entities | 300 |
| 各类型适配器 | 600 |
| **总计** | **~1800行** |
```

- [ ] **Step 2: 更新附录代码行数汇总**

在附录A中更新数据源管理模块行数：2500 → 1800

---

### Task 4: 补充消息中心模块设计

**文件:**
- 修改: `业务系统架构设计.md`（在数据源管理模块之后插入）

- [ ] **Step 1: 插入模块设计章节**

```markdown
### 3.7 消息中心模块 (message-module)

#### 模块职责

- 系统通知管理（公告、提醒）
- WebSocket 实时推送
- 邮件发送（模板化）
- 消息已读/未读状态管理
- 用户消息偏好设置

#### 核心API接口

```typescript
// 消息管理
GET    /api/v1/messages                    // 消息列表（分页）
GET    /api/v1/messages/unread-count       // 未读消息数
PUT    /api/v1/messages/:id/read           // 标记已读
PUT    /api/v1/messages/read-all           // 全部已读
DELETE /api/v1/messages/:id                // 删除消息

// WebSocket连接
// ws://host/messages?token=jwt_token

// 消息模板
GET    /api/v1/message-templates           // 模板列表
POST   /api/v1/message-templates           // 创建模板
PUT    /api/v1/message-templates/:id       // 更新模板
DELETE /api/v1/message-templates/:id       // 删除模板

// 请求示例：获取消息列表
// GET /api/v1/messages?page=1&pageSize=20&type=notification
// 响应示例
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "msg-001",
        "type": "notification",
        "title": "审批通知",
        "content": "您的请假申请已通过",
        "isRead": false,
        "createdAt": "2025-01-01T10:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 20
  }
}
```

#### 关键数据模型

```typescript
interface Message {
  id: string;
  tenantId: string;
  userId: string;
  type: 'notification' | 'alert' | 'email';
  title: string;
  content: string;
  isRead: boolean;
  readAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
}

interface MessageTemplate {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  channel: 'in_app' | 'email' | 'all';
  subject?: string;
  body: string;               // 支持变量 {{variableName}}
  variables: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface UserMessagePreference {
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  mutedTypes: string[];
}
```

#### 模块依赖

- 依赖：`auth-module`, `common-module`
- 被依赖：`workflow-module`（审批通知）

#### 代码量控制

| 子模块 | 建议行数 |
|--------|----------|
| MessageController | 200 |
| MessageService | 250 |
| WebSocketGateway | 200 |
| EmailService | 200 |
| TemplateService | 200 |
| DTOs & Entities | 300 |
| **总计** | **~1350行** |
```

- [ ] **Step 2: 更新附录代码行数汇总**

消息中心模块行数：2400 → 1350

---

### Task 5: 补充审批流程模块设计

**文件:**
- 修改: `业务系统架构设计.md`（在消息中心模块之后插入）

- [ ] **Step 1: 插入模块设计章节**

```markdown
### 3.8 审批流程模块 (workflow-module)

#### 模块职责

- 流程定义管理（可视化设计器在后端）
- 流程实例创建与执行
- 多级审批节点（会签、或签、条件分支）
- 审批记录与流转历史
- 流程挂起/恢复/终止

#### 核心API接口

```typescript
// 流程定义
GET    /api/v1/workflows                   // 流程列表
POST   /api/v1/workflows                   // 创建流程定义
GET    /api/v1/workflows/:id               // 获取流程详情
PUT    /api/v1/workflows/:id               // 更新流程
DELETE /api/v1/workflows/:id               // 删除流程
PUT    /api/v1/workflows/:id/status        // 启用/停用流程

// 流程实例
POST   /api/v1/workflows/:id/start         // 发起审批
GET    /api/v1/workflow-instances/my       // 我的审批（待办/已办）
GET    /api/v1/workflow-instances/:id      // 实例详情
POST   /api/v1/workflow-instances/:id/approve   // 审批通过
POST   /api/v1/workflow-instances/:id/reject    // 审批驳回
PUT    /api/v1/workflow-instances/:id/suspend   // 挂起
PUT    /api/v1/workflow-instances/:id/resume    // 恢复

// 请求示例：发起审批
// POST /api/v1/workflows/wf-leave/start
{
  "title": "张三的请假申请",
  "formData": {
    "leaveType": "年假",
    "startDate": "2025-01-05",
    "endDate": "2025-01-06",
    "reason": "个人事务"
  },
  "attachments": ["file-uuid-1"]
}

// 响应示例
{
  "code": 200,
  "message": "success",
  "data": {
    "instanceId": "wf-inst-001",
    "status": "pending",
    "currentNode": "部门经理审批",
    "approver": "李四",
    "createdAt": "2025-01-01T10:00:00Z"
  }
}
```

#### 关键数据模型

```typescript
interface WorkflowDefinition {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  status: 'draft' | 'active' | 'disabled';
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

interface WorkflowNode {
  id: string;
  type: 'start' | 'approval' | 'condition' | 'end';
  name: string;
  config: {
    approvers?: string[];       // 审批人ID列表
    approvalType?: 'single' | 'counter_sign' | 'or_sign';
    condition?: string;         // 条件表达式
    timeout?: number;           // 超时时间（小时）
  };
}

interface WorkflowInstance {
  id: string;
  workflowId: string;
  tenantId: string;
  title: string;
  formData: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  currentNodeId: string;
  initiatorId: string;
  createdAt: Date;
  completedAt?: Date;
}

interface ApprovalRecord {
  id: string;
  instanceId: string;
  nodeId: string;
  approverId: string;
  action: 'approve' | 'reject' | 'transfer';
  comment?: string;
  createdAt: Date;
}
```

#### 模块依赖

- 依赖：`auth-module`, `message-module`, `common-module`
- 被依赖：`form-module`（审批表单）

#### 代码量控制

| 子模块 | 建议行数 |
|--------|----------|
| WorkflowController | 250 |
| WorkflowService | 350 |
| InstanceService | 300 |
| ApprovalService | 250 |
| DTOs & Entities | 300 |
| **总计** | **~1450行** |
```

- [ ] **Step 2: 更新附录代码行数汇总**

审批流程模块行数：3000 → 1450

---

### Task 6: 补充日志审计模块设计

**文件:**
- 修改: `业务系统架构设计.md`（在审批流程模块之后插入）

- [ ] **Step 1: 插入模块设计章节**

```markdown
### 3.9 日志审计模块 (audit-module)

#### 模块职责

- 操作日志记录（增删改查）
- 登录日志记录
- 敏感操作追踪
- 日志查询与导出
- 数据脱敏处理

#### 核心API接口

```typescript
// 审计日志查询
GET    /api/v1/audit-logs                  // 日志列表（支持筛选）
GET    /api/v1/audit-logs/:id              // 日志详情
GET    /api/v1/audit-logs/export           // 导出日志

// 登录日志
GET    /api/v1/audit-logs/login-history    // 登录历史

// 请求示例：查询操作日志
// GET /api/v1/audit-logs?userId=xxx&action=delete&startDate=2025-01-01&endDate=2025-01-31&page=1
// 响应示例
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "log-001",
        "userId": "user-001",
        "username": "张三",
        "action": "delete",
        "resource": "form_data",
        "resourceId": "data-123",
        "detail": "删除了表单数据",
        "ip": "192.168.1.100",
        "createdAt": "2025-01-15T14:30:00Z"
      }
    ],
    "total": 120
  }
}
```

#### 关键数据模型

```typescript
interface AuditLog {
  id: string;
  tenantId: string;
  userId?: string;
  username?: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'export';
  resource: string;
  resourceId?: string;
  detail?: string;
  metadata?: Record<string, any>;
  ip: string;
  userAgent?: string;
  duration?: number;
  status: 'success' | 'error';
  errorMessage?: string;
  createdAt: Date;
}

interface LoginLog {
  id: string;
  tenantId: string;
  userId?: string;
  username: string;
  ip: string;
  userAgent?: string;
  status: 'success' | 'failed';
  failReason?: string;
  createdAt: Date;
}
```

#### 模块依赖

- 依赖：`auth-module`, `common-module`
- 被依赖：所有业务模块（通过NestJS Interceptor异步记录）

#### 代码量控制

| 子模块 | 建议行数 |
|--------|----------|
| AuditInterceptor | 150 |
| AuditService | 250 |
| AuditController | 150 |
| LoginLogService | 100 |
| DTOs & Entities | 200 |
| **总计** | **~850行** |
```

- [ ] **Step 2: 更新附录代码行数汇总**

日志审计模块行数：2200 → 850

---

### Task 7: 补充知识库模块设计

**文件:**
- 修改: `业务系统架构设计.md`（在日志审计模块之后插入）

- [ ] **Step 1: 插入模块设计章节**

```markdown
### 3.10 知识库模块 (knowledge-module)

#### 模块职责

- 文档上传与管理（PDF、Word、Markdown、TXT）
- 文档分块与向量化（Embedding）
- 语义检索（基于向量相似度）
- 关键词搜索（混合检索）
- 知识库分类与标签

#### 核心API接口

```typescript
// 知识库管理
GET    /api/v1/knowledge-bases              // 知识库列表
POST   /api/v1/knowledge-bases              // 创建知识库
GET    /api/v1/knowledge-bases/:id          // 知识库详情
PUT    /api/v1/knowledge-bases/:id          // 更新知识库
DELETE /api/v1/knowledge-bases/:id          // 删除知识库

// 文档管理
POST   /api/v1/knowledge-bases/:id/documents       // 上传文档
GET    /api/v1/knowledge-bases/:id/documents       // 文档列表
DELETE /api/v1/knowledge-bases/:kbId/documents/:docId  // 删除文档
POST   /api/v1/knowledge-bases/:kbId/documents/:docId/reprocess  // 重新处理

// 检索
POST   /api/v1/knowledge-bases/:id/search           // 语义检索
POST   /api/v1/knowledge-bases/:id/hybrid-search    // 混合检索

// 请求示例：语义检索
// POST /api/v1/knowledge-bases/kb-001/search
{
  "query": "员工年假政策是什么？",
  "topK": 5,
  "threshold": 0.7
}

// 响应示例
{
  "code": 200,
  "message": "success",
  "data": {
    "results": [
      {
        "chunkId": "chunk-uuid",
        "documentName": "员工手册.pdf",
        "content": "员工每年享有5天带薪年假...",
        "score": 0.92,
        "metadata": {
          "page": 12,
          "section": "休假政策"
        }
      }
    ],
    "took": 45
  }
}
```

#### 关键数据模型

```typescript
interface KnowledgeBase {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  embeddingModel: string;           // text-embedding-3-small 等
  chunkSize: number;                // 分块大小（默认500 token）
  chunkOverlap: number;             // 重叠量（默认50 token）
  documentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface KnowledgeDocument {
  id: string;
  kbId: string;
  name: string;
  type: 'pdf' | 'docx' | 'md' | 'txt';
  size: number;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  chunkCount: number;
  createdAt: Date;
}

interface DocumentChunk {
  id: string;
  documentId: string;
  kbId: string;
  content: string;
  embedding: number[];              // 向量（Pgvector存储）
  metadata: Record<string, any>;
  chunkIndex: number;
}
```

#### 模块依赖

- 依赖：`auth-module`, `common-module`, MinIO（文件存储）, Pgvector（向量存储）
- 被依赖：`ai-module`（RAG检索）

#### 代码量控制

| 子模块 | 建议行数 |
|--------|----------|
| KnowledgeBaseController | 200 |
| DocumentService | 300 |
| ChunkingService | 200 |
| EmbeddingService | 200 |
| SearchService | 250 |
| DTOs & Entities | 250 |
| **总计** | **~1400行** |
```

- [ ] **Step 2: 更新附录代码行数汇总**

知识库模块行数：2600 → 1400

---

### Task 8: 补充Skill管理模块设计

**文件:**
- 修改: `业务系统架构设计.md`（在知识库模块之后插入）

- [ ] **Step 1: 插入模块设计章节**

```markdown
### 3.11 Skill管理模块 (skill-module)

#### 模块职责

- Skill 注册与元数据管理
- Skill 执行引擎（沙箱隔离）
- Skill 权限控制（谁能调用哪些Skill）
- Skill 执行日志与监控
- Skill 市场（内置Skill库）

#### 核心API接口

```typescript
// Skill管理
GET    /api/v1/skills                       // Skill列表
POST   /api/v1/skills                       // 注册Skill
GET    /api/v1/skills/:id                   // Skill详情
PUT    /api/v1/skills/:id                   // 更新Skill
DELETE /api/v1/skills/:id                   // 删除Skill

// Skill执行
POST   /api/v1/skills/:id/execute           // 执行Skill
GET    /api/v1/skills/:id/executions        // 执行历史
POST   /api/v1/skills/:id/validate          // 验证Skill定义

// Skill权限
GET    /api/v1/skills/:id/permissions        // 获取权限配置
PUT    /api/v1/skills/:id/permissions        // 设置权限

// 请求示例：执行Skill
// POST /api/v1/skills/skill-001/execute
{
  "inputs": {
    "filePath": "uploads/report.pdf",
    "operation": "extract_tables"
  }
}

// 响应示例
{
  "code": 200,
  "message": "success",
  "data": {
    "executionId": "exec-uuid",
    "status": "running",
    "startedAt": "2025-01-01T10:00:00Z"
  }
}
```

#### 关键数据模型

```typescript
interface Skill {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description: string;
  version: string;
  category: string;               // 分类：data, file, ai, system
  inputs: SkillParamSchema;
  outputs: SkillParamSchema;
  runtime: 'javascript' | 'python' | 'http';
  source: string;                 // 代码或HTTP端点
  timeout: number;                // 超时秒数
  status: 'active' | 'disabled';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SkillExecution {
  id: string;
  skillId: string;
  userId: string;
  inputs: Record<string, any>;
  outputs?: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
}
```

#### 模块依赖

- 依赖：`auth-module`, `common-module`
- 被依赖：`ai-module`（AI调用Skill）

#### 代码量控制

| 子模块 | 建议行数 |
|--------|----------|
| SkillController | 200 |
| SkillService | 250 |
| ExecutionEngine | 300 |
| SandboxService | 200 |
| PermissionGuard | 150 |
| DTOs & Entities | 250 |
| **总计** | **~1350行** |
```

- [ ] **Step 2: 更新附录代码行数汇总**

Skill管理模块行数：2800 → 1350

---

### Task 9: 补充AI服务模块设计（替代原空白设计）

**文件:**
- 修改: `业务系统架构设计.md`（在Skill管理模块之后插入，作为第3.12节）

- [ ] **Step 1: 插入完整的AI服务章节**

```markdown
### 3.12 AI服务模块 (ai-module)

#### 模块职责

- 多模型统一接入（OpenAI GPT-4o、Claude Opus 4、本地模型）
- 对话管理（会话创建、历史记录、上下文窗口管理）
- RAG 增强检索（结合知识库模块）
- Skill 调用编排（AI决策调用哪个Skill）
- Prompt 模板管理
- Token 用量统计与成本控制

#### 架构设计

```
┌─────────────────────────────────────────────┐
│                  AI Service                  │
├─────────────────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐  ┌──────────┐ │
│  │ 对话路由   │  │ RAG 引擎  │  │ Skill    │ │
│  │ (Router)  │  │ (Retrieve)│  │ 调度器   │ │
│  └─────┬─────┘  └─────┬─────┘  └────┬─────┘ │
│        │              │              │       │
│  ┌─────┴─────┐  ┌─────┴─────┐  ┌────┴─────┐ │
│  │ 模型适配器│  │ 提示词    │  │ 对话     │ │
│  │ (Adapter) │  │ 管理器    │  │ 记忆     │ │
│  └─────┬─────┘  └───────────┘  └──────────┘ │
│        │                                     │
│  ┌─────┴─────┐                               │
│  │ OpenAI    │  Claude    Local              │
│  │ GPT-4o    │  Opus 4    Model              │
│  └───────────┘                               │
└─────────────────────────────────────────────┘
```

#### 核心API接口

```typescript
// 对话管理
POST   /api/v1/ai/chat                      // 发起对话（支持流式SSE）
GET    /api/v1/ai/conversations             // 对话列表
GET    /api/v1/ai/conversations/:id         // 对话历史
DELETE /api/v1/ai/conversations/:id         // 删除对话

// Prompt管理
GET    /api/v1/ai/prompts                   // Prompt模板列表
POST   /api/v1/ai/prompts                   // 创建模板
PUT    /api/v1/ai/prompts/:id               // 更新模板

// 模型管理
GET    /api/v1/ai/models                    // 可用模型列表
GET    /api/v1/ai/usage                     // Token用量统计

// 请求示例：AI对话
// POST /api/v1/ai/chat
{
  "conversationId": "conv-001",       // 可选，继续已有对话
  "message": "公司年假怎么申请？",
  "options": {
    "model": "claude-opus-4",
    "useKnowledge": true,             // 启用RAG
    "useSkills": true,                // 允许调用Skill
    "stream": true
  }
}

// SSE流式响应
data: {"type":"token","content":"根据"}
data: {"type":"token","content":"公司"}
data: {"type":"skill_call","skill":"query_hr_system","status":"running"}
data: {"type":"token","content":"规定..."}
data: {"type":"done","usage":{"input":120,"output":350}}
```

#### 关键数据模型

```typescript
interface Conversation {
  id: string;
  tenantId: string;
  userId: string;
  title: string;
  model: string;
  messageCount: number;
  totalTokens: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolCalls?: ToolCall[];
  tokens?: number;
  createdAt: Date;
}

interface ToolCall {
  id: string;
  skillId: string;
  skillName: string;
  inputs: Record<string, any>;
  outputs?: Record<string, any>;
  status: 'pending' | 'running' | 'done' | 'error';
}

interface PromptTemplate {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  systemPrompt: string;
  userPromptTemplate?: string;
  variables: string[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ModelConfig {
  id: string;
  provider: 'openai' | 'anthropic' | 'local';
  model: string;
  apiKey: string;             // 加密存储
  baseUrl?: string;
  maxTokens: number;
  costPer1kInput: number;
  costPer1kOutput: number;
  isActive: boolean;
  priority: number;           // Fallback优先级
}
```

#### 模型路由与Fallback

```typescript
// 模型路由策略
class ModelRouter {
  async route(request: ChatRequest): Promise<ModelAdapter> {
    // 1. 检查用户指定模型
    if (request.options?.model) {
      return this.getAdapter(request.options.model);
    }
    // 2. 按优先级尝试
    for (const config of this.activeModels.sortByPriority()) {
      if (await this.isAvailable(config)) {
        return this.getAdapter(config);
      }
    }
    // 3. 所有模型不可用
    throw new ServiceUnavailableException('所有AI模型暂不可用');
  }
}
```

#### 响应缓存策略

- 相同问题（语义相似度 > 0.95）在 1 小时内直接返回缓存
- 缓存 Key：`hash(systemPrompt + userMessage + model)`
- 缓存存储：Redis，TTL = 1小时

#### 模块依赖

- 依赖：`auth-module`, `knowledge-module`, `skill-module`, `common-module`
- 被依赖：前端应用

#### 代码量控制

| 子模块 | 建议行数 |
|--------|----------|
| ChatController | 250 |
| ChatService | 350 |
| ModelRouter | 200 |
| ModelAdapters (OpenAI/Claude) | 400 |
| PromptService | 200 |
| CacheService | 150 |
| UsageService | 150 |
| DTOs & Entities | 300 |
| **总计** | **~2000行** |
```

- [ ] **Step 2: 更新附录代码行数汇总**

AI服务模块行数：3000 → 2000

---

## 阶段三：增强完善

### Task 10: 补充数据库表设计（报表、知识库、消息、审批、Skill、审计、数据源、AI）

**文件:**
- 修改: `业务系统架构设计.md`（在第5章数据库设计之后追加）

- [ ] **Step 1: 插入缺失的数据库表DDL**

在 `### 5.1 核心表结构 (PostgreSQL)` 的报表相关部分之后，追加以下表：

```sql
-- ========== 报表相关 ==========

-- 报表定义表（续）
CREATE TABLE report_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES sys_tenants(id),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(20) DEFAULT 'table',  -- table, chart, dashboard
    data_source_id UUID NOT NULL,
    sql_template TEXT NOT NULL,
    parameters JSONB,
    columns JSONB,
    charts JSONB,
    settings JSONB,
    created_by UUID REFERENCES sys_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== 知识库相关 ==========

CREATE TABLE knowledge_bases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES sys_tenants(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    embedding_model VARCHAR(100) DEFAULT 'text-embedding-3-small',
    chunk_size INT DEFAULT 500,
    chunk_overlap INT DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kb_id UUID NOT NULL REFERENCES knowledge_bases(id) ON DELETE CASCADE,
    name VARCHAR(500) NOT NULL,
    file_type VARCHAR(20) NOT NULL,
    file_size BIGINT,
    file_path VARCHAR(1000),
    status VARCHAR(20) DEFAULT 'uploading',
    chunk_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 使用 Pgvector 扩展存储向量
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    kb_id UUID NOT NULL REFERENCES knowledge_bases(id),
    content TEXT NOT NULL,
    embedding vector(1536),         -- OpenAI embedding 维度
    metadata JSONB,
    chunk_index INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== 消息相关 ==========

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES sys_tenants(id),
    user_id UUID NOT NULL REFERENCES sys_users(id),
    type VARCHAR(20) NOT NULL DEFAULT 'notification',
    title VARCHAR(200) NOT NULL,
    content TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES sys_tenants(id),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    channel VARCHAR(20) DEFAULT 'in_app',
    subject VARCHAR(200),
    body TEXT NOT NULL,
    variables JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== 审批流程相关 ==========

CREATE TABLE workflow_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES sys_tenants(id),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    nodes JSONB NOT NULL,
    edges JSONB,
    status VARCHAR(20) DEFAULT 'draft',
    version INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workflow_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflow_definitions(id),
    tenant_id UUID NOT NULL REFERENCES sys_tenants(id),
    title VARCHAR(200) NOT NULL,
    form_data JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    current_node_id VARCHAR(50),
    initiator_id UUID NOT NULL REFERENCES sys_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE approval_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
    node_id VARCHAR(50) NOT NULL,
    approver_id UUID NOT NULL REFERENCES sys_users(id),
    action VARCHAR(20) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== Skill相关 ==========

CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES sys_tenants(id),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    version VARCHAR(20) DEFAULT '1.0.0',
    category VARCHAR(50),
    inputs JSONB,
    outputs JSONB,
    runtime VARCHAR(20) DEFAULT 'javascript',
    source TEXT,
    timeout_sec INT DEFAULT 30,
    status VARCHAR(20) DEFAULT 'active',
    created_by UUID REFERENCES sys_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE skill_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id UUID NOT NULL REFERENCES skills(id),
    user_id UUID NOT NULL REFERENCES sys_users(id),
    inputs JSONB,
    outputs JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    error TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    duration_ms INT
);

-- ========== 审计日志相关 ==========

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES sys_tenants(id),
    user_id UUID,
    username VARCHAR(100),
    action VARCHAR(50) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100),
    detail TEXT,
    metadata JSONB,
    ip VARCHAR(50),
    user_agent TEXT,
    duration_ms INT,
    status VARCHAR(20) DEFAULT 'success',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_tenant ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action, created_at DESC);

-- ========== 数据源配置相关 ==========

CREATE TABLE data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES sys_tenants(id),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL,
    config JSONB NOT NULL,
    options JSONB,
    status VARCHAR(20) DEFAULT 'active',
    last_checked_at TIMESTAMP,
    created_by UUID REFERENCES sys_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== AI对话相关 ==========

CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES sys_tenants(id),
    user_id UUID NOT NULL REFERENCES sys_users(id),
    title VARCHAR(200),
    model VARCHAR(50),
    message_count INT DEFAULT 0,
    total_tokens INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    content TEXT,
    tool_calls JSONB,
    tokens INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_prompt_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES sys_tenants(id),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    system_prompt TEXT NOT NULL,
    user_prompt_template TEXT,
    variables JSONB,
    model VARCHAR(50),
    temperature DECIMAL(3,2),
    max_tokens INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

- [ ] **Step 2: 补充CREATE INDEX语句**

为关键字段添加索引声明（已在上面audit_logs中包含示例）。

---

### Task 11: 补充测试策略章节

**文件:**
- 修改: `业务系统架构设计.md`（在安全设计之后，作为第10章）

- [ ] **Step 1: 插入测试策略章节**

```markdown
## 10. 测试策略

### 10.1 测试金字塔

```
         ┌─────────┐
         │  E2E    │  10%  - 关键业务流程
         │  测试   │
        ┌┴─────────┴┐
        │  集成测试  │  30%  - 模块间API契约
        │           │
       ┌┴───────────┴┐
       │  单元测试    │  60%  - Service/Util/Pipe/Guard
       │             │
       └─────────────┘
```

### 10.2 单元测试

**覆盖范围**：所有 Service、Util、Pipe、Guard、Interceptor

**框架**：Jest + @nestjs/testing

**要求**：
- Service 层测试覆盖所有 public 方法
- Mock 所有外部依赖（Repository、其他Service、HTTP请求）
- 覆盖率目标：≥ 80%

**示例结构**：
```typescript
describe('UserService', () => {
  let service: UserService;
  let mockRepo: Repository<User>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockRepository },
      ],
    }).compile();
    service = module.get(UserService);
  });

  describe('create', () => {
    it('should hash password before saving', async () => { ... });
    it('should throw if username already exists', async () => { ... });
    it('should return created user without passwordHash', async () => { ... });
  });
});
```

### 10.3 集成测试

**覆盖范围**：Controller + Service + Database 联合测试

**框架**：Jest + supertest + Testcontainers (PostgreSQL, Redis)

**要求**：
- 每个模块至少覆盖一个完整流程（请求→处理→数据库→响应）
- 使用真实数据库（Testcontainers），不 mock Repository

**示例**：
```typescript
describe('UserController (integration)', () => {
  let app: INestApplication;
  let pgContainer: StartedPostgreSqlContainer;

  beforeAll(async () => {
    pgContainer = await new PostgreSqlContainer().start();
    process.env.DATABASE_URL = pgContainer.getConnectionUri();
    
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    app = module.createNestApplication();
    await app.init();
  });

  it('POST /api/v1/users - create user', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/users')
      .send({ username: 'test', password: 'Test123!' })
      .expect(201);
    
    expect(res.body.data.username).toBe('test');
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  afterAll(async () => {
    await app.close();
    await pgContainer.stop();
  });
});
```

### 10.4 契约测试

**目标**：确保微服务之间API契约不被破坏

**工具**：自定义契约测试脚本

**要求**：
- 每个服务的API响应格式变更需同步更新契约测试
- CI/CD 中在集成测试之后运行

### 10.5 E2E测试

**覆盖范围**：3个核心业务流程

1. **用户注册→登录→访问受保护页面**
2. **表单创建→填写→提交→数据查询**
3. **审批发起→逐级审批→结果通知**

**框架**：Playwright（前端E2E）

### 10.6 CI/CD 测试流水线

```
Lint → TypeCheck → Unit Tests → Integration Tests → Contract Tests → Build → Deploy
        (2min)       (1min)         (3min)            (2min)
```

- 所有阶段失败则阻断部署
- E2E 测试仅在 staging 环境运行（非CI阶段）
```

---

### Task 12: 补充部署完善内容

**文件:**
- 修改: `业务系统架构设计.md`（在第6章和第7章中补充）

- [ ] **Step 1: 在第6章Docker部署配置中补充日志和备份**

在第6章末尾追加：

```markdown
### 6.4 日志收集方案

开发/小规模部署阶段使用 Docker 日志驱动 + 宿主机关联：

```yaml
# docker-compose 日志配置
services:
  core-api:
    logging:
      driver: json-file
      options:
        max-size: "50m"
        max-file: "10"

  # 可选：后期引入 Loki + Promtail 做集中式日志
```

### 6.5 数据库备份策略

```bash
# 定时备份脚本 (cron: 每天凌晨2点)
#!/bin/bash
BACKUP_DIR=/data/backups
DATE=$(date +%Y%m%d_%H%M%S)
docker exec postgres-db pg_dump -U postgres app | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# 保留最近30天的备份
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

Docker Compose 添加备份服务：
```yaml
  backup:
    image: postgres:15-alpine
    volumes:
      - ./backups:/backups
      - ./scripts/backup.sh:/backup.sh:ro
    entrypoint: /bin/sh -c "while true; do /backup.sh; sleep 86400; done"
    networks:
      - backend
```
```

- [ ] **Step 2: 在第8章CI/CD中补充零停机部署**

在CI/CD的deploy-prod步骤后追加说明：

```markdown
### 8.2 零停机部署

生产环境使用 Docker 滚动更新：

```yaml
# docker-compose 部署配置
services:
  core-api:
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
        order: start-first
        failure_action: rollback
```

部署流程：
1. 启动新版本容器（健康检查通过）
2. 旧容器停止接收新请求
3. 旧容器处理完现有请求后关闭
4. Nginx 自动将流量切换到新容器
```

---

### Task 13: 更新文档版本信息和附录

**文件:**
- 修改: `业务系统架构设计.md`

- [ ] **Step 1: 更新版本信息**

修改文档头部（行3-5）：
```markdown
**版本**：V1.1
**日期**：2026年5月
**状态**：已评审修正
```

- [ ] **Step 2: 更新附录A代码行数汇总**

```markdown
### A. 模块代码行数汇总

| 模块 | 预计行数 | 说明 |
|------|----------|------|
| 用户权限模块 | 2000 | 包含Guard和Interceptor |
| 菜单管理模块 | 1600 | 含动态路由 |
| 表单引擎模块 | 2500 | 含多种字段类型处理 |
| 数据源管理模块 | 1800 | 含多类型适配器 |
| 报表引擎模块 | 2800 | 含图表配置 |
| 报表配置模块 | 2200 | 含模板管理 |
| 消息中心模块 | 1350 | 含WebSocket和邮件 |
| 审批流程模块 | 1450 | 含流程引擎 |
| 日志审计模块 | 850 | 含脱敏处理 |
| 知识库模块 | 1400 | 含向量检索 |
| Skill管理模块 | 1350 | 含执行引擎 |
| AI服务模块 | 2000 | 含多模型路由 |
| **总计** | **~21300行** | 优化后减少约28% |
```

---

### Task 14: API统一规范补充

**文件:**
- 修改: `业务系统架构设计.md`（在第4章移动端适配规范中补充统一API规范）

- [ ] **Step 1: 补充API版本和错误格式**

在第4章开头的API统一响应格式之后追加：

```markdown
### 4.0 API统一规范

#### URL版本策略

所有API使用路径版本号：`/api/v1/`。后续不兼容变更时递增版本号。

#### 统一错误响应格式

```typescript
// 错误响应
{
  "code": 400,
  "message": "参数校验失败",
  "error": {
    "type": "ValidationError",
    "details": [
      { "field": "username", "message": "用户名不能为空" },
      { "field": "email", "message": "邮箱格式不正确" }
    ]
  },
  "timestamp": 1704067200000,
  "requestId": "req-uuid-xxx"
}
```

#### 分页请求规范

```typescript
// GET /api/v1/users?page=1&pageSize=20&sort=createdAt&order=desc
interface PaginationQuery {
  page?: number;        // 默认1
  pageSize?: number;    // 默认20，最大100
  sort?: string;        // 排序字段
  order?: 'asc' | 'desc';
}
```

#### 移动端离线同步冲突策略

使用"最后写入胜出"(LWW) + 时间戳：
- 每条数据维护 `updatedAt` 字段
- 离线数据同步时，比较服务端和客户端的时间戳
- 取最新的版本，旧版本数据存入 `_conflicts` 字段供人工审核

```typescript
// POST /api/v1/mobile/sync 请求体
{
  "changes": [
    {
      "entity": "form_data",
      "id": "data-001",
      "data": { "field1": "value" },
      "updatedAt": "2025-01-01T10:00:00Z"
    }
  ]
}

// 响应体
{
  "code": 200,
  "message": "success",
  "data": {
    "applied": 3,
    "conflicts": [
      {
        "entity": "form_data",
        "id": "data-002",
        "serverVersion": { ... },
        "clientVersion": { ... }
      }
    ]
  }
}
```
```

- [ ] **Step 2: 更新目录**

在目录中补充新增的子节引用。

---

### Task 15: 最终验证

**文件:**
- 修改: `业务系统架构设计.md`

- [ ] **Step 1: 检查章节连续性**

确认所有章节编号从1到10，无跳号或重复。

- [ ] **Step 2: 检查锚点链接**

确认目录中所有 `(#x-xxx)` 锚点能正确跳转到对应章节。

- [ ] **Step 3: 检查交叉引用**

搜索文档中所有 `第x章` / `第x节` 等交叉引用，确认指向正确。

- [ ] **Step 4: 检查代码块完整性**

确认所有 Markdown 代码块正确闭合（``` 配对）。

- [ ] **Step 5: 验证文件行数**

```bash
wc -l 业务系统架构设计.md
```
预期：4700+ 行（补充了大量内容）

- [ ] **Step 6: Commit**

```bash
git add 业务系统架构设计.md docs/superpowers/
git commit -m "docs: 架构文档v1.1 - 修正编号、去重、补充缺失模块设计
- 修正章节编号混乱问题
- 去重Docker Compose和环境变量配置
- 补充7个缺失模块的详细设计
- 新增AI服务完整架构设计
- 补充全部数据库表DDL
- 新增测试策略章节
- 补充日志/备份/零停机部署方案"
```
```

---

## 实施顺序

任务按依赖关系排列：先结构(Task 1-2)，再补内容(Task 3-9)，最后增强(Task 10-15)。Task 3-9 互相独立可并行执行。
