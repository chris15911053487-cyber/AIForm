import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'

export interface TabItem {
  path: string
  title: string
  component?: any        // shallowRef — resolved Vue component, set after first load
  props?: Record<string, any>
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
