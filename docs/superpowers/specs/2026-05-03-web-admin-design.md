# Web 管理端设计文档

**日期**：2026-05-03  
**状态**：已确认  
**关联**：业务系统架构设计.md 第1.1-1.3节、Phase 1 后端 API

---

## 1. 目标

为低代码平台构建 Web 管理端 MVP，用户可登录后管理用户和菜单，支持多标签页浏览。后续模块（角色、表单、报表等）以此项目结构和页面模式为模板快速复制。

## 2. 技术栈

| 层 | 选型 | 说明 |
|---|------|------|
| 框架 | Vue 3 (Composition API) | `<script setup lang="ts">` |
| 构建 | Vite 5 | 快速 HMR |
| UI 库 | Element Plus | 表格、表单、抽屉、标签页 |
| 路由 | Vue Router 4 | 静态 + 动态路由 |
| 状态 | Pinia | 用户信息、菜单状态 |
| HTTP | Axios | 拦截器注入 Token |
| 语言 | TypeScript | 严格模式 |

## 3. 项目结构

```
web-admin/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .env.development                # VITE_API_BASE=http://localhost:3000/api/v1
├── src/
│   ├── main.ts                     # 入口，注册 Element Plus、Router、Pinia
│   ├── App.vue                     # 根组件 <router-view>
│   ├── router/
│   │   └── index.ts                # 静态路由 + addRoute 动态注册
│   ├── stores/
│   │   ├── user.ts                 # token、userInfo、login/logout actions
│   │   └── tabs.ts                 # 已打开标签页列表、activeTab
│   ├── api/
│   │   ├── request.ts              # axios 实例（baseURL、req/res 拦截器）
│   │   ├── auth.ts                 # login(), getCurrentUser()
│   │   ├── user.ts                 # getUsers(), createUser(), updateUser()
│   │   └── menu.ts                 # getMenuTree(), getMenuRoutes(), CRUD
│   ├── layout/
│   │   ├── LayoutMain.vue          # 主布局容器（侧边栏 + 顶栏 + 标签栏 + 内容）
│   │   └── SideMenu.vue            # 侧边栏递归菜单组件
│   └── views/
│       ├── login/
│       │   └── LoginView.vue       # 登录页
│       ├── dashboard/
│       │   └── DashboardView.vue   # 仪表盘（占位）
│       ├── user/
│       │   ├── UserList.vue        # 用户列表（搜索 + 表格 + 分页）
│       │   └── UserForm.vue        # 用户表单抽屉（新增/编辑）
│       └── menu/
│           ├── MenuManage.vue      # 菜单管理（左树右表单）
│           └── MenuForm.vue        # 右侧菜单编辑表单
```

## 4. 布局设计

```
┌──────────────────────────────────────────────┐
│  顶栏：Logo + 用户信息 + 退出                   │
├────────┬─────────────────────────────────────┤
│        │  标签栏：[仪表盘] [用户管理] [菜单管理]  │
│ 浅色   ├─────────────────────────────────────┤
│ 侧边栏 │                                     │
│ 菜单   │  <router-view> 内容区                 │
│ (递归) │  （当前激活标签页的组件）               │
│        │                                     │
└────────┴─────────────────────────────────────┘
```

- **侧边栏**：白色背景，递归渲染菜单树，点击菜单项触发标签页新增/切换
- **标签栏**：显示已打开的页面标签，支持关闭（最后一个标签不可关闭）
- **内容区**：`<router-view>` 渲染当前激活标签对应的组件

## 5. 路由设计

### 5.1 静态路由

| 路径 | 组件 | 说明 |
|------|------|------|
| `/login` | LoginView | 公开，无需认证 |
| `/` | redirect → `/dashboard` | 默认跳转 |
| `/dashboard` | DashboardView | 占位页，需认证 |

### 5.2 动态路由

应用启动后，从 `GET /api/v1/menus/routes` 获取路由配置并动态注册。后端返回格式：

```json
[
  {
    "name": "System",
    "path": "/system",
    "meta": { "title": "系统管理", "icon": "setting" },
    "children": [
      {
        "name": "UserList",
        "path": "/system/users",
        "component": "system/users/index",
        "meta": { "title": "用户管理", "icon": "user" }
      }
    ]
  }
]
```

**组件路径映射**：前端维护一个 `componentMap`，将 `meta.component` 映射到实际 `.vue` 文件：

```ts
const componentMap: Record<string, Component> = {
  'system/users/index': () => import('@/views/user/UserList.vue'),
  'system/menus/index': () => import('@/views/menu/MenuManage.vue'),
}
```

新增模块时只需在 `componentMap` 加一行 + 数据库插入菜单记录。

## 6. 数据流

### 6.1 启动流程

```
App 启动
  → 路由守卫 beforeEach
    → 无 token → 跳转 /login
    → 有 token 且 store 无用户信息
      → GET /auth/current              (获取用户信息存 store)
      → GET /menus/routes              (获取路由配置)
      → 遍历路由，用 componentMap 匹配组件
      → router.addRoute() 动态注册
      → 侧边栏渲染菜单
      → 跳转目标页 / 默认 /dashboard
```

### 6.2 标签页与路由联动

```
点击侧边栏菜单项
  → tabsStore.addTab(route)
  → router.push(route.path)
  → LayoutMain 的 <router-view> 渲染对应组件
  → 标签栏高亮当前项

关闭标签
  → tabsStore.removeTab(path)
  → 如果关闭的是当前标签，router.push 到相邻标签
```

### 6.3 API 调用流程

```
View 组件 → api/xxx.ts → request.ts (axios)
  → request interceptor: 注入 Authorization: Bearer <token>
  → 发送请求
  → response interceptor: 统一处理
    → code=200 → 返回 data
    → code=401 → 清除 token，跳转 /login
    → 其他错误 → ElMessage.error()
```

## 7. 关键页面

### 7.1 登录页

- 居中卡片布局，渐变紫色背景
- 用户名 + 密码表单
- 调用 `POST /auth/login`，成功后存储 token 至 localStorage
- 登录成功跳转 `/dashboard`

### 7.2 用户管理

- **列表页**：搜索栏（用户名、状态筛选）+ 表格（用户名、邮箱、手机、角色、状态、创建时间）+ 分页
- **新增/编辑**：右侧 Drawer 滑出，表单字段：用户名、密码（新增时）、邮箱、手机号
- API：`GET /users`（分页列表）、`POST /users`（新增）、`PUT /users/:id`（编辑）

### 7.3 菜单管理

- **左右分栏**：
  - 左侧：菜单树（el-tree），顶部"新增根菜单"按钮，节点右键或 hover 显示操作
  - 右侧：选中节点的编辑表单（名称、图标、路径、组件、排序、状态）
- **编辑表单**：保存 + 删除按钮，新增子菜单按钮
- API：`GET /menus/tree`（获取树）、`POST /menus`（新增）、`PUT /menus/:id`（编辑）、`DELETE /menus/:id`（删除）

## 8. 状态管理

### userStore (Pinia)

```ts
{
  token: string | null,         // localStorage 持久化
  userInfo: { id, username, roles } | null,
  permissions: string[],
}
// actions: login(), logout(), fetchUserInfo()
```

### tabsStore (Pinia)

```ts
{
  tabs: Array<{ path, title, icon? }>,  // 已打开标签
  activeTab: string,                     // 当前激活路径
}
// actions: addTab(), removeTab(), setActiveTab()
```

## 9. 错误处理

| 场景 | 处理 |
|------|------|
| Token 过期 (401) | 清除 token → 跳转 /login → 提示"登录已过期" |
| 网络错误 | ElMessage.error("网络异常，请重试") |
| 表单校验失败 | Element Plus Form validation，字段下方红色提示 |
| 后端业务错误 | 显示 `response.data.message` |

## 10. 实现顺序

| 步骤 | 内容 | 验证标准 |
|------|------|----------|
| 1 | 项目脚手架：Vite + Vue3 + Element Plus + TS + Pinia + Router + Axios | `npm run dev` 可启动 |
| 2 | 登录页 + 认证：LoginView、request.ts 拦截器、userStore | 输入 admin/admin123 可登录获取 token |
| 3 | 布局框架：LayoutMain、SideMenu、tabsStore、动态路由注册 | 侧边栏显示菜单树，点击可切换标签页 |
| 4 | 用户管理：UserList + UserForm | 列表分页、新增/编辑抽屉、搜索 |
| 5 | 菜单管理：MenuManage + MenuForm | 左侧树 + 右侧编辑，新增/修改/删除 |

## 11. 超出范围（不做）

- 角色管理、资源管理、权限分配页面（后续模块）
- 表单引擎、数据源管理页面
- 移动端适配
- 国际化
- 暗黑模式
- 单元测试 / E2E 测试

---

## 变更记录

| 日期 | 变更 |
|------|------|
| 2026-05-03 | 初始版本 |
