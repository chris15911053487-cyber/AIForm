<template>
  <div style="height: 100vh; display: flex; flex-direction: column; background: #f0f2f5;">
    <!-- Minimal top bar -->
    <div style="height: 40px; background: #fff; border-bottom: 1px solid #e8e8e8; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; flex-shrink: 0;">
      <span style="font-weight: bold; font-size: 14px;">{{ title }}</span>
      <el-button size="small" @click="handleBack" v-if="showBack">返回</el-button>
    </div>

    <!-- Content area: full DynamicReportView -->
    <div style="flex: 1; padding: 12px; overflow-y: auto;">
      <div v-if="loading" style="text-align: center; padding: 40px; color: #999;">加载菜单配置...</div>
      <div v-else-if="errorMsg" style="text-align: center; padding: 40px; color: #f56c6c;">{{ errorMsg }}</div>
      <DynamicReportView v-else :menu-id="menuId" :menu-name="title" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getMenuTree } from '@/api/menu'
import type { MenuItem } from '@/api/menu'
import DynamicReportView from './DynamicReportView.vue'

const route = useRoute()
const router = useRouter()

const title = ref('')
const menuId = ref('')
const loading = ref(true)
const errorMsg = ref('')
const showBack = ref(false)

function handleBack() {
  router.back()
}

onMounted(async () => {
  try {
    // Resolve menuId by matching route path against menu tree
    const tree = await getMenuTree()
    const targetPath = route.path

    function normalizePath(p: string) {
      return p.startsWith('/') ? p : '/' + p
    }
    function findMenu(nodes: MenuItem[]): MenuItem | null {
      for (const n of nodes) {
        if (normalizePath(n.path) === targetPath) return n
        if (n.children) {
          const found = findMenu(n.children)
          if (found) return found
        }
      }
      return null
    }

    const menu = findMenu(tree)
    if (menu) {
      menuId.value = menu.id
      title.value = menu.name
    } else {
      errorMsg.value = '未找到对应菜单配置：' + targetPath
    }
  } catch (e: any) {
    errorMsg.value = '加载菜单失败：' + (e?.message || '未知错误')
  } finally {
    loading.value = false
  }
})
</script>
