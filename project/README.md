# 低代码平台 — 后端 API

## 技术栈

- **框架**: NestJS 10.x (monorepo)
- **数据库**: PostgreSQL 15
- **缓存**: Redis 7
- **认证**: JWT (passport-jwt) + RBAC
- **ORM**: TypeORM

## 访问入口

### API 服务

```
http://localhost:3000/api/v1/
```

当前仅启动后端 API，Nginx 未启动。以下是打通的接口：

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/auth/register` | 注册 |
| POST | `/api/v1/auth/login` | 登录 |
| GET | `/api/v1/users` | 用户列表（需 JWT） |
| GET | `/api/v1/menus/tree` | 菜单树 |

### Nginx（可选）

通过 Nginx 反向代理时，入口在 `http://localhost:6001/api/`。需要先启动 nginx 容器：

```bash
docker compose up -d nginx
```

## 环境启动

### 1. 启动基础设施

```bash
docker compose up -d postgres redis
```

### 2. 启动 API 服务

```bash
pnpm dev
# 或 npm run dev
```

API 在 `http://localhost:3000` 监听，前缀 `api/v1`。

### 3. 验证

```bash
# 注册
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}'

# 登录
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 获取菜单树
curl http://localhost:3000/api/v1/menus/tree \
  -H "Authorization: Bearer <token>"
```

## 端口汇总

| 服务 | 端口 | 说明 |
|------|------|------|
| API (NestJS) | 3000 | 开发模式 |
| PostgreSQL | 5432 | 数据库 |
| Redis | 6380 | 缓存 |
| Nginx | 6001 | 反向代理（可选） |

## 目录结构

```
apps/api/          # 后端 API
├── src/
│   ├── auth/      # 认证模块（注册、登录、JWT、RBAC）
│   ├── menu/      # 菜单模块（菜单树、路由生成）
│   ├── form/      # 表单引擎
│   ├── datasource/ # 数据源适配器
│   └── common/    # 公共模块（过滤器、拦截器、命名策略）
db/init.sql        # 初始化 SQL（建表 + 种子数据）
docker-compose.yml # 开发环境容器编排
```

## 数据库表

10 张表：sys_tenants, sys_users, sys_roles, sys_user_roles, sys_resources, sys_role_permissions, sys_menus, data_sources, form_definitions, form_data

## 默认账号

| 用户 | 密码 | 角色 |
|------|------|------|
| admin | admin123 | admin |

## 当前阶段

Phase 1（核心模块）已完成。后续阶段包括报表引擎、知识库、AI 服务、消息中心、审批流程。
