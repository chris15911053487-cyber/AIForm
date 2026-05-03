import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { ref } from 'vue'
import { getMenuRoutes } from '@/api/menu'
import type { MenuRoute } from '@/api/menu'

// Reactive menu routes — LayoutMain reads this for sidebar rendering
export const sidebarMenus = ref<RouteRecordRaw[]>([])

// Routes that should render standalone (no admin layout)
export const standalonePaths = ['/master/items']

// Static routes: login, standalone pages, and the main layout shell (dashboard is always available)
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
    name: 'Main',
    component: () => import('@/layout/LayoutMain.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { requiresAuth: true, title: '仪表盘' },
      },
    ],
  },
  // Standalone report pages — bypass admin layout, render only the table
  ...standalonePaths.map((p) => ({
    path: p,
    name: p.replace(/\//g, '_'),
    component: () => import('@/views/report/StandaloneReportView.vue'),
    meta: { requiresAuth: true },
  })),
]

const router = createRouter({
  history: createWebHistory(),
  routes: staticRoutes,
})

// Component map — key matches sys_menus.component field in database
export const componentMap: Record<string, () => Promise<any>> = {
  'system/users/index': () => import('@/views/user/UserList.vue'),
  'system/menus/index': () => import('@/views/menu/MenuManage.vue'),
}

// Convert backend MenuRoute to Vue Router routes
function buildRoutes(menus: MenuRoute[]): RouteRecordRaw[] {
  return menus.map((m) => {
    // Resolve component: explicit mapping > DynamicReportView (for report menus) > undefined
    let component: (() => Promise<any>) | undefined
    if (m.component && componentMap[m.component]) {
      component = componentMap[m.component]
    } else if (m.meta.menuKind === 'report') {
      component = () => import('@/views/report/DynamicReportView.vue')
    }

    const route: RouteRecordRaw = {
      path: m.path,
      name: m.name,
      component,
      meta: { ...m.meta, component: m.component },
    } as RouteRecordRaw
    if (m.children?.length) {
      route.children = buildRoutes(m.children)
    }
    return route
  })
}

// Load dynamic routes from API — adds menu children to the existing '/' layout route
let dynamicRoutesLoaded = false

export async function loadDynamicRoutes() {
  if (dynamicRoutesLoaded) return
  const menus = await getMenuRoutes()
  const apiRoutes = buildRoutes(menus)

  // Embed mode no longer registers routes with the router (URL stays unchanged).
  // Only populate sidebarMenus for rendering the sidebar menu tree.
  sidebarMenus.value = apiRoutes
  dynamicRoutesLoaded = true
}

// Auth guard
router.beforeEach(async (to, _from) => {
  const token = localStorage.getItem('token')

  if (to.path === '/login') {
    if (token) return '/dashboard'
    return true
  }

  if (!token) return '/login'

  // Has token, ensure dynamic routes loaded
  if (!dynamicRoutesLoaded) {
    try {
      await loadDynamicRoutes()
      return to.fullPath // retry navigation
    } catch {
      localStorage.removeItem('token')
      return '/login'
    }
  }

  return true
})

export default router
