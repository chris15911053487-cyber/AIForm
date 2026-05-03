# Web 管理端实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建 Web 管理端 MVP — 用户可登录管理后台，进行用户管理和菜单管理

**Architecture:** Vite + Vue3 SPA，通过 Axios 调用已有 NestJS 后端 API（/api/v1/），动态路由从后端加载，多标签页切换

**Tech Stack:** Vue 3 (Composition API + `<script setup lang="ts">`), Vite 5, Element Plus, Vue Router 4, Pinia, Axios, TypeScript

**Spec:** `docs/superpowers/specs/2026-05-03-web-admin-design.md`

---

## 后端 API 响应格式

所有后端 API 响应都经过 `ResponseInterceptor` 包装：

```json
{ "code": 200, "message": "success", "data": <实际数据>, "timestamp": 1714761234567 }
```

前端 Axios 响应拦截器需要提取 `.data`。错误响应（如 401）由 `HttpExceptionFilter` 处理：

```json
{ "code": 401, "message": "Unauthorized", "error": { "type": "UnauthorizedException" }, "timestamp": 1714761234567, "requestId": "" }
```

---

## 文件结构

```
web-admin/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── .env.development
└── src/
    ├── main.ts
    ├── App.vue
    ├── env.d.ts
    ├── router/
    │   └── index.ts
    ├── stores/
    │   ├── user.ts
    │   └── tabs.ts
    ├── api/
    │   ├── request.ts
    │   ├── auth.ts
    │   ├── user.ts
    │   └── menu.ts
    ├── layout/
    │   ├── LayoutMain.vue
    │   └── SideMenu.vue
    └── views/
        ├── login/
        │   └── LoginView.vue
        ├── dashboard/
        │   └── DashboardView.vue
        ├── user/
        │   ├── UserList.vue
        │   └── UserForm.vue
        └── menu/
            ├── MenuManage.vue
            └── MenuForm.vue
```

---

### Task 1: 项目脚手架

**Files:**
- Create: `web-admin/package.json`
- Create: `web-admin/index.html`
- Create: `web-admin/vite.config.ts`
- Create: `web-admin/tsconfig.json`
- Create: `web-admin/tsconfig.node.json`
- Create: `web-admin/.env.development`
- Create: `web-admin/src/main.ts`
- Create: `web-admin/src/App.vue`
- Create: `web-admin/src/env.d.ts`

- [ ] **Step 1: 创建 web-admin 目录并初始化 package.json**

```bash
mkdir -p /Users/apple/Documents/AI/Claude/new20260502/web-admin/src/{router,stores,api,layout,views/{login,dashboard,user,menu}}
```

创建 `web-admin/package.json`:

```json
{
  "name": "web-admin",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.3.0",
    "pinia": "^2.1.0",
    "element-plus": "^2.6.0",
    "@element-plus/icons-vue": "^2.3.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "typescript": "^5.4.0",
    "vite": "^5.2.0",
    "vue-tsc": "^2.0.0",
    "@types/node": "^20.0.0"
  }
}
```

- [ ] **Step 2: 安装依赖**

```bash
cd /Users/apple/Documents/AI/Claude/new20260502/web-admin && npm install
```

- [ ] **Step 3: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>低代码平台 - 管理端</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 4: 创建 vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
```

- [ ] **Step 5: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForExpose": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": ["node"]
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue", "env.d.ts"]
}
```

- [ ] **Step 6: 创建 tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 7: 创建 .env.development**

```
VITE_API_BASE=/api/v1
```

- [ ] **Step 8: 创建 src/env.d.ts**

```typescript
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
```

- [ ] **Step 9: 创建 src/main.ts**

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
```

- [ ] **Step 10: 创建 src/App.vue**

```vue
<template>
  <router-view />
</template>

<script setup lang="ts">
</script>
```

- [ ] **Step 11: 验证项目可启动**

```bash
cd /Users/apple/Documents/AI/Claude/new20260502/web-admin && npm run dev
```

Expected: Vite dev server starts on http://localhost:5173

- [ ] **Step 12: Commit**

```bash
cd /Users/apple/Documents/AI/Claude/new20260502/web-admin
git init
git add -A
git commit -m "chore: scaffold Vite + Vue3 + Element Plus project"
```

---

### Task 2: Axios 封装 + API 层

**Files:**
- Create: `web-admin/src/api/request.ts`
- Create: `web-admin/src/api/auth.ts`
- Create: `web-admin/src/api/user.ts`
- Create: `web-admin/src/api/menu.ts`

- [ ] **Step 1: 创建 src/api/request.ts**

```typescript
import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api/v1',
  timeout: 15000,
})

// 请求拦截器 — 注入 Token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 响应拦截器 — 提取 data、统一错误处理
request.interceptors.response.use(
  (response) => {
    const body = response.data
    if (body.code >= 200 && body.code < 300) {
      return body.data
    }
    ElMessage.error(body.message || '请求失败')
    return Promise.reject(new Error(body.message))
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      if (status === 401) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
      ElMessage.error(data?.message || `请求错误 ${status}`)
    } else {
      ElMessage.error('网络异常，请重试')
    }
    return Promise.reject(error)
  },
)

export default request
```

- [ ] **Step 2: 创建 src/api/auth.ts**

```typescript
import request from './request'

export interface LoginParams {
  username: string
  password: string
}

export interface UserInfo {
  id: string
  username: string
  email?: string
  roles: { code: string; name: string }[]
}

export interface LoginResult {
  accessToken: string
  user: UserInfo
}

export function login(params: LoginParams): Promise<LoginResult> {
  return request.post('/auth/login', params)
}

export function getCurrentUser(): Promise<UserInfo> {
  return request.get('/auth/current')
}
```

- [ ] **Step 3: 创建 src/api/user.ts**

```typescript
import request from './request'

export interface UserItem {
  id: string
  tenantId: string
  username: string
  email?: string
  phone?: string
  realName?: string
  avatar?: string
  status: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface UserQuery {
  page?: number
  pageSize?: number
}

export interface CreateUserParams {
  username: string
  password: string
  email?: string
  phone?: string
  tenantId: string
}

export function getUsers(params: UserQuery): Promise<PaginatedResult<UserItem>> {
  return request.get('/users', { params })
}

export function createUser(params: CreateUserParams): Promise<UserItem> {
  return request.post('/users', params)
}

export function updateUser(id: string, params: Partial<CreateUserParams>): Promise<UserItem> {
  return request.put(`/users/${id}`, params)
}
```

- [ ] **Step 4: 创建 src/api/menu.ts**

```typescript
import request from './request'

export interface MenuItem {
  id: string
  tenantId: string
  parentId?: string
  name: string
  icon?: string
  path: string
  component?: string
  sort: number
  visible: boolean
  cache: boolean
  status: string
  children?: MenuItem[]
}

export interface MenuRoute {
  name: string
  path: string
  component?: string
  meta: { title: string; icon?: string; requiresAuth: boolean }
  children?: MenuRoute[]
}

export function getMenuTree(): Promise<MenuItem[]> {
  return request.get('/menus/tree')
}

export function getMenuRoutes(): Promise<MenuRoute[]> {
  return request.get('/menus/routes')
}

export function createMenu(params: Partial<MenuItem>): Promise<MenuItem> {
  return request.post('/menus', params)
}

export function updateMenu(id: string, params: Partial<MenuItem>): Promise<MenuItem> {
  return request.put(`/menus/${id}`, params)
}

export function deleteMenu(id: string): Promise<void> {
  return request.delete(`/menus/${id}`)
}
```

- [ ] **Step 5: Commit**

```bash
cd /Users/apple/Documents/AI/Claude/new20260502/web-admin
git add -A
git commit -m "feat: add axios wrapper and API layer (auth, user, menu)"
```

---

### Task 3: Pinia Store（用户状态 + 标签页状态）

**Files:**
- Create: `web-admin/src/stores/user.ts`
- Create: `web-admin/src/stores/tabs.ts`

- [ ] **Step 1: 创建 src/stores/user.ts**

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, getCurrentUser } from '@/api/auth'
import type { UserInfo } from '@/api/auth'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const userInfo = ref<UserInfo | null>(null)
  const permissions = ref<string[]>([])

  async function login(username: string, password: string) {
    const result = await loginApi({ username, password })
    token.value = result.accessToken
    userInfo.value = result.user
    localStorage.setItem('token', result.accessToken)
    return result
  }

  async function fetchUserInfo() {
    const info = await getCurrentUser()
    userInfo.value = info
  }

  function logout() {
    token.value = null
    userInfo.value = null
    permissions.value = []
    localStorage.removeItem('token')
  }

  return { token, userInfo, permissions, login, fetchUserInfo, logout }
})
```

- [ ] **Step 2: 创建 src/stores/tabs.ts**

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface TabItem {
  path: string
  title: string
  query?: Record<string, string>
}

export const useTabsStore = defineStore('tabs', () => {
  const tabs = ref<TabItem[]>([{ path: '/dashboard', title: '仪表盘' }])
  const activeTab = ref('/dashboard')

  function addTab(tab: TabItem) {
    const exists = tabs.value.find((t) => t.path === tab.path)
    if (!exists) {
      tabs.value.push(tab)
    }
    activeTab.value = tab.path
  }

  function removeTab(path: string) {
    const idx = tabs.value.findIndex((t) => t.path === path)
    if (idx === -1) return
    tabs.value.splice(idx, 1)
    if (activeTab.value === path) {
      activeTab.value = tabs.value[Math.min(idx, tabs.value.length - 1)]?.path || '/dashboard'
    }
  }

  function setActiveTab(path: string) {
    activeTab.value = path
  }

  return { tabs, activeTab, addTab, removeTab, setActiveTab }
})
```

- [ ] **Step 3: Commit**

```bash
cd /Users/apple/Documents/AI/Claude/new20260502/web-admin
git add -A
git commit -m "feat: add Pinia stores (user auth + multi-tab state)"
```

---

### Task 4: 路由（静态路由 + 动态注册）

**Files:**
- Create: `web-admin/src/router/index.ts`

- [ ] **Step 1: 创建 src/router/index.ts**

```typescript
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { getMenuRoutes } from '@/api/menu'
import type { MenuRoute } from '@/api/menu'

// 静态路由
const staticRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/LoginView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/DashboardView.vue'),
    meta: { requiresAuth: true, title: '仪表盘' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes: staticRoutes,
})

// 组件映射表 — key 对应数据库 sys_menus.component 字段
const componentMap: Record<string, () => Promise<any>> = {
  'system/users/index': () => import('@/views/user/UserList.vue'),
  'system/menus/index': () => import('@/views/menu/MenuManage.vue'),
}

// 将后端 MenuRoute 转为 Vue Router 路由
function buildRoutes(menus: MenuRoute[]): RouteRecordRaw[] {
  return menus.map((m) => {
    // 如果 component 字段为空且有子节点，则是目录节点（不用配 component）
    const route: RouteRecordRaw = {
      path: m.path,
      name: m.name,
      meta: { ...m.meta },
    }
    if (m.component && componentMap[m.component]) {
      route.component = componentMap[m.component]
    }
    if (m.children?.length) {
      route.children = buildRoutes(m.children)
    }
    return route
  })
}

// 加载动态路由
let dynamicRoutesLoaded = false

export async function loadDynamicRoutes() {
  if (dynamicRoutesLoaded) return
  const menus = await getMenuRoutes()
  const routes = buildRoutes(menus)
  // 将 LayoutMain 作为父路由，包裹所有动态路由
  router.addRoute({
    path: '/',
    component: () => import('@/layout/LayoutMain.vue'),
    children: routes,
  })
  dynamicRoutesLoaded = true
}

// 路由守卫
router.beforeEach(async (to, _from) => {
  const token = localStorage.getItem('token')

  if (to.path === '/login') {
    if (token) return '/dashboard'
    return true
  }

  if (!token) return '/login'

  // 有 token，确保动态路由已加载
  if (!dynamicRoutesLoaded) {
    try {
      await loadDynamicRoutes()
      return to.fullPath // 重试导航
    } catch {
      localStorage.removeItem('token')
      return '/login'
    }
  }

  return true
})

export default router
```

- [ ] **Step 2: Commit**

```bash
cd /Users/apple/Documents/AI/Claude/new20260502/web-admin
git add -A
git commit -m "feat: add router with static routes, dynamic loading, and auth guard"
```

---

### Task 5: 布局框架（LayoutMain + SideMenu）

**Files:**
- Create: `web-admin/src/layout/LayoutMain.vue`
- Create: `web-admin/src/layout/SideMenu.vue`

- [ ] **Step 1: 创建 src/layout/SideMenu.vue**

```vue
<template>
  <template v-for="item in menuList" :key="item.path">
    <!-- 有子菜单 -->
    <el-sub-menu
      v-if="item.children && item.children.length > 0"
      :index="item.path"
    >
      <template #title>
        <el-icon v-if="item.meta?.icon"><component :is="item.meta.icon" /></el-icon>
        <span>{{ item.meta?.title }}</span>
      </template>
      <SideMenu :menu-list="item.children" @menu-click="$emit('menuClick', $event)" />
    </el-sub-menu>
    <!-- 叶子菜单 -->
    <el-menu-item
      v-else
      :index="item.path"
      @click="$emit('menuClick', { path: item.path, title: item.meta?.title || item.name })"
    >
      <el-icon v-if="item.meta?.icon"><component :is="item.meta.icon" /></el-icon>
      <span>{{ item.meta?.title }}</span>
    </el-menu-item>
  </template>
</template>

<script setup lang="ts">
import type { RouteRecordRaw } from 'vue-router'

defineProps<{
  menuList: RouteRecordRaw[]
}>()

defineEmits<{
  menuClick: [tab: { path: string; title: string }]
}>()
</script>
```

- [ ] **Step 2: 创建 src/layout/LayoutMain.vue**

```vue
<template>
  <el-container style="height: 100vh">
    <!-- 顶栏 -->
    <el-header style="height: 50px; background: #fff; border-bottom: 1px solid #e8e8e8; display: flex; align-items: center; justify-content: space-between; padding: 0 20px;">
      <span style="font-weight: bold; font-size: 16px;">低代码平台</span>
      <div style="display: flex; align-items: center; gap: 16px;">
        <span>{{ userStore.userInfo?.username }}</span>
        <el-button size="small" @click="handleLogout">退出</el-button>
      </div>
    </el-header>

    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="210px" style="background: #fff; border-right: 1px solid #e8e8e8;">
        <el-menu
          :default-active="activeRoute"
          style="border-right: none;"
          background-color="#fff"
          text-color="#333"
          active-text-color="#1890ff"
          @select="handleMenuSelect"
        >
          <SideMenu
            :menu-list="menuRoutes"
            @menu-click="handleMenuClick"
          />
        </el-menu>
      </el-aside>

      <!-- 右侧内容 -->
      <el-container>
        <!-- 标签栏 -->
        <div style="background: #fff; border-bottom: 1px solid #e8e8e8; padding: 0 12px; display: flex; gap: 4px; align-items: center; height: 34px; overflow-x: auto;">
          <div
            v-for="tab in tabsStore.tabs"
            :key="tab.path"
            @click="handleTabClick(tab.path)"
            :style="{
              padding: '4px 12px',
              cursor: 'pointer',
              fontSize: '13px',
              borderRadius: '4px',
              background: tabsStore.activeTab === tab.path ? '#e6f7ff' : 'transparent',
              color: tabsStore.activeTab === tab.path ? '#1890ff' : '#333',
              whiteSpace: 'nowrap',
            }"
          >
            {{ tab.title }}
            <span
              v-if="tabsStore.tabs.length > 1"
              @click.stop="tabsStore.removeTab(tab.path)"
              style="margin-left: 4px; font-size: 11px; color: #999;"
            >✕</span>
          </div>
        </div>

        <!-- 内容区 -->
        <el-main style="background: #f0f2f5; padding: 16px;">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useTabsStore } from '@/stores/tabs'
import SideMenu from './SideMenu.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const tabsStore = useTabsStore()

// 从当前路由中提取子路由作为菜单
const menuRoutes = computed(() => {
  const mainRoute = router.getRoutes().find((r) => r.path === '/' && r.children)
  return mainRoute?.children?.filter((r) => r.meta?.title) || []
})

const activeRoute = computed(() => route.path)

// 侧边栏菜单点击 → 添加/切换标签 + 导航
function handleMenuClick(tab: { path: string; title: string }) {
  tabsStore.addTab({ path: tab.path, title: tab.title })
  router.push(tab.path)
}

function handleMenuSelect(index: string) {
  // el-menu select 事件（仅子菜单展开折叠，导航走 menuClick）
}

function handleTabClick(path: string) {
  tabsStore.setActiveTab(path)
  router.push(path)
}

function handleLogout() {
  userStore.logout()
  router.push('/login')
}

// 路由变化时同步标签状态
watch(
  () => route.path,
  (path) => {
    if (path !== '/login') {
      tabsStore.setActiveTab(path)
      const tab = tabsStore.tabs.find((t) => t.path === path)
      if (!tab) {
        const title = (route.meta?.title as string) || path
        tabsStore.addTab({ path, title })
      }
    }
  },
  { immediate: true },
)
</script>
```

- [ ] **Step 3: Commit**

```bash
cd /Users/apple/Documents/AI/Claude/new20260502/web-admin
git add -A
git commit -m "feat: add main layout with sidebar, header, multi-tab bar"
```

---

### Task 6: 登录页

**Files:**
- Create: `web-admin/src/views/login/LoginView.vue`

- [ ] **Step 1: 创建 src/views/login/LoginView.vue**

```vue
<template>
  <div class="login-container">
    <div class="login-card">
      <h2 style="text-align: center; margin-bottom: 8px;">低代码平台</h2>
      <p style="text-align: center; color: #999; margin-bottom: 32px;">管理端登录</p>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="用户名"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            style="width: 100%;"
            :loading="loading"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function handleLogin() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await userStore.login(form.username, form.password)
    ElMessage.success('登录成功')
    router.push('/dashboard')
  } catch {
    // 错误已在 request 拦截器中处理
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  background: #fff;
  border-radius: 8px;
  padding: 40px;
  width: 380px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}
</style>
```

- [ ] **Step 2: 验证登录流程**

```bash
# 确保后端正在运行 (docker-compose up -d postgres redis + npm run dev)
cd /Users/apple/Documents/AI/Claude/new20260502/web-admin && npm run dev
```

打开 http://localhost:5173 → 应被重定向到 `/login`，输入 admin/admin123 → 登录成功跳转 `/dashboard`。

- [ ] **Step 3: Commit**

```bash
cd /Users/apple/Documents/AI/Claude/new20260502/web-admin
git add -A
git commit -m "feat: add login page with JWT auth flow"
```

---

### Task 7: 仪表盘占位页

**Files:**
- Create: `web-admin/src/views/dashboard/DashboardView.vue`

- [ ] **Step 1: 创建 src/views/dashboard/DashboardView.vue**

```vue
<template>
  <div>
    <h3>仪表盘</h3>
    <el-card style="margin-top: 16px;">
      <p style="color: #999;">欢迎使用低代码平台管理端。请从左侧菜单选择功能模块。</p>
    </el-card>
    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :span="8">
        <el-card>
          <template #header>用户管理</template>
          <p style="color: #999;">管理系统用户</p>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>菜单管理</template>
          <p style="color: #999;">管理系统菜单</p>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>表单管理</template>
          <p style="color: #999;">管理表单定义（开发中）</p>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
cd /Users/apple/Documents/AI/Claude/new20260502/web-admin
git add -A
git commit -m "feat: add dashboard placeholder page"
```

---

### Task 8: 用户管理（列表 + 抽屉表单）

**Files:**
- Create: `web-admin/src/views/user/UserList.vue`
- Create: `web-admin/src/views/user/UserForm.vue`

- [ ] **Step 1: 创建 src/views/user/UserList.vue**

```vue
<template>
  <div>
    <!-- 搜索栏 -->
    <el-card style="margin-bottom: 16px;">
      <el-form :inline="true" :model="query">
        <el-form-item label="用户名">
          <el-input v-model="query.username" placeholder="搜索用户名" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width: 120px;">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchList">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card>
      <div style="margin-bottom: 12px; display: flex; justify-content: flex-end;">
        <el-button type="primary" @click="openCreate">+ 新增用户</el-button>
      </div>
      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDisable(row)">禁用</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div style="margin-top: 16px; display: flex; justify-content: flex-end;">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @current-change="fetchList"
          @size-change="fetchList"
        />
      </div>
    </el-card>

    <!-- 抽屉表单 -->
    <UserForm
      :visible="drawerVisible"
      :edit-data="editData"
      @close="drawerVisible = false"
      @saved="onSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getUsers } from '@/api/user'
import type { UserItem } from '@/api/user'
import UserForm from './UserForm.vue'

const loading = ref(false)
const tableData = ref<UserItem[]>([])
const total = ref(0)
const drawerVisible = ref(false)
const editData = ref<UserItem | null>(null)

const query = reactive({
  username: '',
  status: '',
  page: 1,
  pageSize: 20,
})

async function fetchList() {
  loading.value = true
  try {
    const res = await getUsers({ page: query.page, pageSize: query.pageSize })
    tableData.value = res.items
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editData.value = null
  drawerVisible.value = true
}

function openEdit(row: UserItem) {
  editData.value = row
  drawerVisible.value = true
}

function handleDisable(row: UserItem) {
  // TODO: 调用 updateUser 修改 status
}

function onSaved() {
  drawerVisible.value = false
  fetchList()
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(fetchList)
</script>
```

- [ ] **Step 2: 创建 src/views/user/UserForm.vue**

```vue
<template>
  <el-drawer
    v-model="visible"
    :title="isEdit ? '编辑用户' : '新增用户'"
    direction="rtl"
    size="480px"
    @close="$emit('close')"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      style="padding: 0 20px;"
    >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item v-if="!isEdit" label="密码" prop="password">
        <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
        <el-button @click="visible = false">取消</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { createUser, updateUser } from '@/api/user'
import type { UserItem } from '@/api/user'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'

const props = defineProps<{
  visible: boolean
  editData: UserItem | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const visible = computed({
  get: () => props.visible,
  set: (val) => { if (!val) emit('close') },
})

const isEdit = computed(() => !!props.editData)

const formRef = ref<FormInstance>()
const submitting = ref(false)

const form = reactive({
  username: '',
  password: '',
  email: '',
  phone: '',
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' },
  ],
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      if (props.editData) {
        form.username = props.editData.username
        form.password = ''
        form.email = props.editData.email || ''
        form.phone = props.editData.phone || ''
      } else {
        form.username = ''
        form.password = ''
        form.email = ''
        form.phone = ''
      }
      formRef.value?.clearValidate()
    }
  },
)

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (isEdit.value) {
      await updateUser(props.editData!.id, {
        username: form.username,
        email: form.email || undefined,
        phone: form.phone || undefined,
      })
      ElMessage.success('更新成功')
    } else {
      await createUser({
        username: form.username,
        password: form.password,
        email: form.email || undefined,
        phone: form.phone || undefined,
        tenantId: '00000000-0000-0000-0000-000000000001',
      })
      ElMessage.success('创建成功')
    }
    emit('saved')
  } finally {
    submitting.value = false
  }
}
</script>
```

- [ ] **Step 3: 验证用户管理功能**

```bash
cd /Users/apple/Documents/AI/Claude/new20260502/web-admin && npm run dev
```

访问 http://localhost:5173 → 登录 → 点击"用户管理"菜单：
- 应显示用户列表（admin 用户）
- 点击"新增用户" → 抽屉弹出 → 填写表单 → 确定后列表刷新
- 点击"编辑" → 抽屉弹出 → 修改 → 确定

- [ ] **Step 4: Commit**

```bash
cd /Users/apple/Documents/AI/Claude/new20260502/web-admin
git add -A
git commit -m "feat: add user management (list + drawer form)"
```

---

### Task 9: 菜单管理（左右分栏 + 编辑表单）

**Files:**
- Create: `web-admin/src/views/menu/MenuManage.vue`
- Create: `web-admin/src/views/menu/MenuForm.vue`

- [ ] **Step 1: 创建 src/views/menu/MenuManage.vue**

```vue
<template>
  <el-card style="height: calc(100vh - 140px);">
    <div style="display: flex; height: 100%;">
      <!-- 左侧菜单树 -->
      <div style="width: 300px; border-right: 1px solid #e8e8e8; padding-right: 16px; overflow-y: auto;">
        <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
          <strong>菜单树</strong>
          <el-button size="small" type="primary" @click="openCreate(null)">+ 新增根菜单</el-button>
        </div>
        <el-tree
          :data="treeData"
          :props="{ children: 'children', label: 'name' }"
          node-key="id"
          highlight-current
          default-expand-all
          @node-click="handleNodeClick"
        >
          <template #default="{ data }">
            <span style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
              <span>{{ data.name }}</span>
              <span>
                <el-button size="small" text @click.stop="openCreate(data)">+子</el-button>
              </span>
            </span>
          </template>
        </el-tree>
      </div>

      <!-- 右侧编辑 -->
      <div style="flex: 1; padding-left: 16px; overflow-y: auto;">
        <MenuForm
          v-if="selectedMenu !== undefined"
          :menu="selectedMenu"
          :parent-id="parentId"
          @saved="onSaved"
          @deleted="onDeleted"
        />
        <div v-else style="padding: 40px; text-align: center; color: #999;">
          请从左侧选择一个菜单节点进行编辑
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getMenuTree } from '@/api/menu'
import type { MenuItem } from '@/api/menu'
import MenuForm from './MenuForm.vue'

const treeData = ref<MenuItem[]>([])
const selectedMenu = ref<MenuItem | null>(null)
const parentId = ref<string | null>(null)

async function fetchTree() {
  treeData.value = await getMenuTree()
}

function handleNodeClick(data: MenuItem) {
  selectedMenu.value = data
  parentId.value = null // 编辑模式
}

function openCreate(parent: MenuItem | null) {
  selectedMenu.value = null
  parentId.value = parent?.id || null
}

function onSaved() {
  selectedMenu.value = null
  parentId.value = null
  fetchTree()
}

function onDeleted() {
  selectedMenu.value = null
  parentId.value = null
  fetchTree()
}

onMounted(fetchTree)
</script>
```

- [ ] **Step 2: 创建 src/views/menu/MenuForm.vue**

```vue
<template>
  <div>
    <h4>{{ formState === 'create' ? '新建菜单' : `编辑：${formData.name}` }}</h4>
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="80px"
      style="max-width: 480px; margin-top: 16px;"
    >
      <el-form-item label="菜单名称" prop="name">
        <el-input v-model="formData.name" placeholder="如：用户管理" />
      </el-form-item>
      <el-form-item label="图标" prop="icon">
        <el-input v-model="formData.icon" placeholder="如：user、setting" />
      </el-form-item>
      <el-form-item label="路由路径" prop="path">
        <el-input v-model="formData.path" placeholder="如：/system/users" />
      </el-form-item>
      <el-form-item label="组件路径" prop="component">
        <el-input v-model="formData.component" placeholder="如：system/users/index" />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" />
      </el-form-item>
      <el-form-item label="可见" prop="visible">
        <el-switch v-model="formData.visible" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="formData.status" style="width: 120px;">
          <el-option label="启用" value="active" />
          <el-option label="禁用" value="disabled" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :loading="submitting" @click="handleSave">保存</el-button>
        <el-button v-if="formState === 'edit'" type="danger" :loading="deleting" @click="handleDelete">删除</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { createMenu, updateMenu, deleteMenu } from '@/api/menu'
import type { MenuItem } from '@/api/menu'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'

const props = defineProps<{
  menu: MenuItem | null
  parentId: string | null
}>()

const emit = defineEmits<{
  saved: []
  deleted: []
}>()

const formState = computed(() => (props.menu ? 'edit' : 'create'))

const formRef = ref<FormInstance>()
const submitting = ref(false)
const deleting = ref(false)

const formData = reactive({
  name: '',
  icon: '',
  path: '',
  component: '',
  sort: 0,
  visible: true,
  status: 'active',
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  path: [{ required: true, message: '请输入路由路径', trigger: 'blur' }],
}

// 编辑时从 menu prop 填充表单
watch(
  () => [props.menu, props.parentId],
  () => {
    if (props.menu) {
      formData.name = props.menu.name
      formData.icon = props.menu.icon || ''
      formData.path = props.menu.path
      formData.component = props.menu.component || ''
      formData.sort = props.menu.sort
      formData.visible = props.menu.visible
      formData.status = props.menu.status
    } else {
      formData.name = ''
      formData.icon = ''
      formData.path = ''
      formData.component = ''
      formData.sort = 0
      formData.visible = true
      formData.status = 'active'
    }
    formRef.value?.clearValidate()
  },
  { immediate: true },
)

async function handleSave() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const payload = {
      name: formData.name,
      icon: formData.icon || undefined,
      path: formData.path,
      component: formData.component || undefined,
      sort: formData.sort,
      visible: formData.visible,
      status: formData.status,
      parentId: props.parentId,
      tenantId: '00000000-0000-0000-0000-000000000001',
    }

    if (formState.value === 'edit') {
      await updateMenu(props.menu!.id, payload)
      ElMessage.success('更新成功')
    } else {
      await createMenu(payload)
      ElMessage.success('创建成功')
    }
    emit('saved')
  } finally {
    submitting.value = false
  }
}

async function handleDelete() {
  try {
    await ElMessageBox.confirm('确认删除该菜单？子菜单也会一同删除。', '删除确认', {
      type: 'warning',
    })
  } catch {
    return
  }

  deleting.value = true
  try {
    await deleteMenu(props.menu!.id)
    ElMessage.success('已删除')
    emit('deleted')
  } finally {
    deleting.value = false
  }
}
</script>
```

- [ ] **Step 3: 验证菜单管理功能**

```bash
cd /Users/apple/Documents/AI/Claude/new20260502/web-admin && npm run dev
```

访问 http://localhost:5173 → 登录 → 点击"菜单管理"：
- 左侧显示菜单树
- 点击节点 → 右侧显示编辑表单 → 可修改保存
- 点击"+子"→ 右侧显示新建表单 → 填写保存
- 点击"+新增根菜单"→ 创建顶层菜单
- 点击删除 → 确认后删除

- [ ] **Step 4: 验证动态路由联动**

在菜单管理中新增一个菜单项（如 `path: /test`, `component: 留空`），刷新页面后侧边栏应出现新菜单。

- [ ] **Step 5: Commit**

```bash
cd /Users/apple/Documents/AI/Claude/new20260502/web-admin
git add -A
git commit -m "feat: add menu management (tree + split-panel editing)"
```

---

### Task 10: 端到端验证

- [ ] **Step 1: 启动后端基础设施**

```bash
cd /Users/apple/Documents/AI/Claude/new20260502/project
docker compose up -d postgres redis
```

- [ ] **Step 2: 启动后端 API**

```bash
cd /Users/apple/Documents/AI/Claude/new20260502/project
npm run dev
```

验证后端：`curl http://localhost:3000/api/v1/auth/login -H 'Content-Type: application/json' -d '{"username":"admin","password":"admin123"}'`

- [ ] **Step 3: 启动前端**

```bash
cd /Users/apple/Documents/AI/Claude/new20260502/web-admin
npm run dev
```

- [ ] **Step 4: 完整流程验证**

| 序号 | 操作 | 预期结果 |
|------|------|----------|
| 1 | 打开 http://localhost:5173 | 自动跳转 `/login` |
| 2 | 输入 admin / admin123 登录 | 跳转仪表盘，侧边栏显示菜单 |
| 3 | 点击"用户管理" | 新标签打开，显示用户列表 |
| 4 | 点击"新增用户" | 抽屉弹出，填写表单 |
| 5 | 输入用户名+密码，点击确定 | 抽屉关闭，列表刷新显示新用户 |
| 6 | 点击某用户"编辑" | 抽屉弹出预填数据，修改后确定 |
| 7 | 点击"菜单管理" | 新标签打开，左树右表单 |
| 8 | 选择某个菜单节点 | 右侧显示编辑表单 |
| 9 | 修改名称后保存 | 提示"更新成功"，树刷新 |
| 10 | 点击"+新增根菜单"，填写后保存 | 树中新增一个菜单项 |
| 11 | 在菜单管理中新增指向用户管理的菜单 | 刷新后侧边栏显示新菜单，点击可打开 |
| 12 | 关闭某个标签 | 标签消失，自动激活相邻标签 |
| 13 | 点击"退出" | 跳转登录页 |

- [ ] **Step 5: Commit**

```bash
cd /Users/apple/Documents/AI/Claude/new20260502/web-admin
git add -A
git commit -m "docs: add end-to-end verification checklist"
```

---

## 已知限制（不做）

- 角色管理、资源管理、权限分配页面（后续模块）
- 表单引擎、数据源管理页面
- 用户状态"禁用"按钮未调用后端（后端 sys_users.status 需配合 PUT）
- 菜单节点的拖拽排序
- 移动端适配
- 国际化
- 暗黑模式
- 单元测试 / E2E 测试
