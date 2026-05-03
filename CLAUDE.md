# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

低代码业务平台，包含后端 API（NestJS monorepo）和 Web 管理端（Vue3 + Element Plus）。当前处于 Phase 1：已完成的模块有认证授权（JWT + RBAC）、动态菜单、表单引擎、数据源适配器。架构设计文档见 `业务系统架构设计.md`。

## 常用命令

### 后端 (`project/`)

```bash
# 启动基础设施（PostgreSQL + Redis）
docker compose up -d postgres redis

# 开发模式启动 API（端口 3000，hot reload）
npm run dev        # 或 pnpm dev

# 构建
npm run build      # nest build

# 代码检查
npm run lint       # eslint --fix

# 测试
npm run test                    # 单元测试
npm run test:cov                # 带覆盖率
npm run test:integration        # 集成测试
```

### 前端 (`web-admin/`)

```bash
npm run dev        # Vite dev server (端口 5173, proxy /api -> localhost:3001)
npm run build      # vue-tsc && vite build
```

### 端口汇总

| 服务 | 端口 |
|------|------|
| API (NestJS) | 3000 |
| PostgreSQL | 5432 |
| Redis | 6380 |
| Nginx | 6001（可选） |
| 前端 dev | 5173 |

## 架构要点

### 后端全局管道/守卫/过滤器/拦截器

在 `main.ts` 中全局注册，顺序和理解关键：

- **ValidationPipe**: `whitelist: true, forbidNonWhitelisted: true, transform: true` — 所有 DTO 自动校验，未声明的字段会被剔除
- **JwtAuthGuard**: 全局守卫，默认要求认证。使用 `@Public()` 装饰器标记公开端点（如 `/auth/login`）
- **HttpExceptionFilter**: 统一异常响应格式
- **ResponseInterceptor**: 所有成功响应包裹为 `{ code, message, data, timestamp }`

### API 路由前缀

全局前缀 `api/v1`。认证模块路由示例：`POST /api/v1/auth/login`。

### 前端 API 请求流程

1. `web-admin/src/api/request.ts` — axios 实例，baseURL 默认为 `/api/v1`，请求拦截器注入 Bearer token，响应拦截器自动解包 `response.data.data`
2. `web-admin/src/api/auth.ts` — 认证相关接口
3. `web-admin/src/api/menu.ts` — 菜单/路由接口
4. `web-admin/src/api/user.ts` — 用户管理接口

### 前端动态路由机制

`router/index.ts` 在用户登录后调用 `loadDynamicRoutes()` 从后端 `/menus/tree` 获取菜单树，通过 `componentMap` 将后端的 `component` 字段映射到 Vue 组件。所有动态路由作为 `/` 布局路由的 children 添加。

`componentMap` 目前注册的组件：
- `system/users/index` → UserList
- `system/menus/index` → MenuManage

菜单类型为 `report` 的自动使用 `DynamicReportView`。

### 数据库

10 张表：`sys_tenants`, `sys_users`, `sys_roles`, `sys_user_roles`, `sys_resources`, `sys_role_permissions`, `sys_menus`, `data_sources`, `form_definitions`, `form_data`。初始化脚本在 `db/init.sql`（包含种子数据）。TypeORM 配置为 `synchronize: false`，所有表结构变更需通过 SQL 脚本管理。

默认账号：admin / admin123（超级管理员角色）。

### 目录约定

- 后端代码在 `project/apps/api/src/` 下，按模块分包（auth, menu, form, datasource, common）
- TypeScript 路径别名 `@app/*` → `apps/api/src/*`
- 前端路径别名 `@` → `src/`
