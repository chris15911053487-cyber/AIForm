# AIForm — 低代码业务平台

AI 时代的前后端分离业务系统，集成表单引擎、动态菜单、数据源适配、报表等核心能力。

## 技术栈

| 层 | 技术 |
|----|------|
| 后端框架 | NestJS 10 (Node.js) |
| 数据库 | PostgreSQL 15 |
| 缓存 | Redis 7 |
| ORM | TypeORM |
| 认证 | JWT + RBAC (passport-jwt) |
| 前端 | Vue 3 + Element Plus + Vite |
| 状态管理 | Pinia |
| 路由 | Vue Router 4 (动态菜单) |

## 快速启动

### 1. 启动基础设施

```bash
cd project
docker compose up -d postgres redis
```

### 2. 启动后端 API

```bash
cd project
cp .env.example .env    # 首次需配置环境变量
npm run dev             # http://localhost:3000，前缀 api/v1
```

### 3. 启动前端

```bash
cd web-admin
npm run dev             # http://localhost:5173
```

### 4. 验证

```bash
# 注册
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}'

# 登录
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

默认账号：**admin** / **admin123**（超级管理员）

## 端口汇总

| 服务 | 端口 |
|------|------|
| API (NestJS) | 3000 |
| 前端开发服务器 | 5173 |
| PostgreSQL | 5432 |
| Redis | 6380 |
| Nginx（可选） | 6001 |

## 目录结构

```
├── project/                # 后端 NestJS 项目
│   ├── apps/api/src/
│   │   ├── auth/           # 认证模块（登录、JWT、RBAC）
│   │   ├── menu/           # 菜单模块（菜单树、动态路由）
│   │   ├── form/           # 表单引擎
│   │   ├── datasource/     # 数据源适配器
│   │   └── common/         # 公共模块（过滤器、拦截器、装饰器）
│   ├── db/init.sql         # 建表 + 种子数据
│   └── docker-compose.yml  # 基础设施容器编排
├── web-admin/              # 前端 Vue 3 管理端
│   └── src/
│       ├── api/            # 接口层（axios）
│       ├── views/          # 页面组件
│       ├── layout/         # 布局组件
│       ├── stores/         # Pinia 状态
│       └── router/         # 动态路由
├── docs/                   # 设计文档 & 计划
└── 业务系统架构设计.md       # 完整架构设计文档
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/auth/register` | 注册 |
| POST | `/api/v1/auth/login` | 登录 |
| GET | `/api/v1/users` | 用户列表（需 JWT） |
| GET | `/api/v1/menus/tree` | 菜单树（动态路由） |

完整架构设计见 [业务系统架构设计.md](业务系统架构设计.md)。
