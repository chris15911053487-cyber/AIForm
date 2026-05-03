<template>
  <div style="height: 100vh; display: flex; flex-direction: column;">
    <!-- Header -->
    <div style="height: 50px; background: #fff; border-bottom: 1px solid #e8e8e8; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; flex-shrink: 0;">
      <span style="font-weight: bold; font-size: 16px;">低代码平台</span>
      <div style="display: flex; align-items: center; gap: 16px;">
        <span>{{ userStore.userInfo?.username }}</span>
        <el-button size="small" @click="handleLogout">退出</el-button>
      </div>
    </div>

    <!-- Body: sidebar + right area -->
    <div style="flex: 1; display: flex; min-height: 0;">
      <!-- Sidebar -->
      <div style="width: 210px; background: #fff; border-right: 1px solid #e8e8e8; flex-shrink: 0; overflow-y: auto;">
        <el-menu
          :default-active="activeMenuPath"
          :default-openeds="openedMenus"
          unique-opened
          style="border-right: none;"
          background-color="#fff"
          text-color="#333"
          active-text-color="#1890ff"
        >
          <SideMenu
            :menu-list="menuRoutes"
            @open-dialog="handleOpenDialog"
            @open-embed="handleOpenEmbed"
          />
        </el-menu>
      </div>

      <!-- Right side: tabs on top, content below -->
      <div style="flex: 1; display: flex; flex-direction: column; min-width: 0;">
        <!-- Tab bar -->
        <div style="background: #fff; border-bottom: 1px solid #e8e8e8; padding: 0 12px; display: flex; gap: 4px; align-items: center; height: 34px; overflow-x: auto; flex-shrink: 0;">
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
              @click.stop="handleTabClose(tab.path)"
              style="margin-left: 4px; font-size: 11px; color: #999;"
            >✕</span>
          </div>
        </div>

        <!-- Content area: embed tab component takes priority, otherwise router-view -->
        <div style="flex: 1; background: #f0f2f5; padding: 16px; overflow-y: auto;">
          <component v-if="activeEmbedComponent" :is="activeEmbedComponent" v-bind="activeEmbedProps" />
          <router-view v-else />
        </div>
      </div>
    </div>

    <!-- Dialog for dialog-mode menus -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      fullscreen
      destroy-on-close
    >
      <component v-if="dialogComponent" :is="dialogComponent" v-bind="dialogProps" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, markRaw, ref, shallowRef, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useTabsStore } from '@/stores/tabs'
import type { TabItem } from '@/stores/tabs'
import { sidebarMenus, componentMap } from '@/router'
import SideMenu from './SideMenu.vue'
import type { RouteRecordRaw } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const tabsStore = useTabsStore()

const menuRoutes = computed(() => sidebarMenus.value)

// Active menu path for sidebar highlighting: follows embed tab, or route path for dashboard
const activeMenuPath = computed(() => {
  const tab = tabsStore.tabs.find((t) => t.path === tabsStore.activeTab)
  // If active tab is an embed tab (not dashboard, not router-based), use its path
  if (tab && tab.component && tab.path !== '/dashboard') {
    return tab.path
  }
  // Otherwise use the route path (for dashboard and router-based pages)
  return route.path
})

// Auto-open parent submenu for current route / embed tab
const openedMenus = computed(() => {
  const path = activeMenuPath.value
  const parts = path.split('/').filter(Boolean)
  if (parts.length >= 1) {
    return ['/' + parts[0]]
  }
  return []
})

// --- Embed tab component rendering ---

const activeEmbedComponent = ref<any>(null)
const activeEmbedProps = ref<Record<string, any>>({})

// Sync embed component when activeTab changes
watch(
  () => tabsStore.activeTab,
  (path) => {
    const tab = tabsStore.tabs.find((t) => t.path === path)
    activeEmbedComponent.value = tab?.component || null
    activeEmbedProps.value = tab?.props || {}
  },
  { immediate: true },
)

// --- Tab click: switch tab content without URL change ---

function handleTabClick(path: string) {
  tabsStore.setActiveTab(path)
}

function handleTabClose(path: string) {
  tabsStore.removeTab(path)
}

// --- Embed navigation from sidebar: resolve component, add tab, switch to it ---

async function handleOpenEmbed(item: RouteRecordRaw) {
  const meta = item.meta as Record<string, any> | undefined
  const path = item.path
  const title = (meta?.title as string) || (item.name as string) || path
  const componentPath = meta?.component as string | undefined
  const menuKind = (meta?.menuKind as string) || 'builtin'
  const menuId = meta?.menuId as string | undefined

  // Check if tab already exists
  let tab = tabsStore.tabs.find((t) => t.path === path)
  if (!tab) {
    tab = { path, title, component: null }
    tabsStore.tabs.push(tab)
  }
  tabsStore.activeTab = path

  // Load component if not yet resolved
  if (!tab.component) {
    try {
      let comp: any
      if (componentPath && componentMap[componentPath]) {
        const mod = await componentMap[componentPath]()
        comp = markRaw(mod.default || mod)
      } else if (menuKind === 'report') {
        const mod = await import('@/views/report/DynamicReportView.vue')
        comp = markRaw(mod.default || mod)
        tab.props = { menuId, menuName: title }
      } else {
        console.error(`[Embed] 无法解析组件: path="${path}", component="${componentPath}", menuKind="${menuKind}"`)
        ElMessage.warning(`菜单 "${title}" 未配置有效组件，无法在容器内打开`)
        tabsStore.removeTab(path)
        return
      }
      tab.component = comp
      // If this tab is active, immediately reflect the loaded component
      if (tabsStore.activeTab === path) {
        activeEmbedComponent.value = comp
        activeEmbedProps.value = tab.props || {}
      }
    } catch {
      // component load failed, remove the tab
      tabsStore.removeTab(path)
    }
  }
}

// --- Logout ---

function handleLogout() {
  userStore.logout()
  router.push('/login')
}

// --- Only sync route path for initial load (dashboard) and blank-mode navigations ---
watch(
  () => route.path,
  (path) => {
    if (path !== '/login') {
      // Sync tab if it's a router-based navigation (dashboard or blank mode)
      const tab = tabsStore.tabs.find((t) => t.path === path)
      if (tab) {
        tabsStore.setActiveTab(path)
      } else if (path === '/dashboard') {
        tabsStore.setActiveTab('/dashboard')
      }
    }
  },
  { immediate: true },
)

// --- Dialog mode ---
const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogComponent = shallowRef<any>(null)
const dialogProps = ref<Record<string, any>>({})

async function handleOpenDialog(item: RouteRecordRaw) {
  const meta = item.meta as Record<string, any> | undefined
  const componentPath = item.meta?.component as string | undefined
  const menuKind = meta?.menuKind || 'builtin'
  const menuId = meta?.menuId
  const title = (meta?.title as string) || (item.name as string) || ''

  dialogTitle.value = title
  dialogProps.value = {}

  // Resolve component
  if (componentPath && componentMap[componentPath]) {
    const mod = await componentMap[componentPath]()
    dialogComponent.value = mod.default || mod
  } else if (menuKind === 'report') {
    const mod = await import('@/views/report/DynamicReportView.vue')
    dialogComponent.value = mod.default || mod
    dialogProps.value = { menuId, menuName: title }
  } else {
    console.error(`[Dialog] 无法解析组件: component="${componentPath}", menuKind="${menuKind}"`)
	    ElMessage.warning(`菜单 "${title}" 未配置有效组件`)
	    dialogComponent.value = null
    return
  }

  dialogVisible.value = true
}
</script>
