<template>
  <div>
    <div style="margin-bottom: 12px; display: flex; align-items: center; gap: 12px;">
      <h3 style="margin: 0;">{{ menuName }}</h3>
      <el-button size="small" :loading="loading" @click="fetchData">刷新</el-button>
    </div>

    <el-table
      v-if="!errorMsg"
      :data="rows"
      border
      stripe
      v-loading="loading"
      max-height="calc(100vh - 230px)"
      empty-text="查询无数据"
    >
      <el-table-column
        v-for="col in columns"
        :key="col"
        :prop="col"
        :label="columnLabels[col] || col"
        min-width="120"
        show-overflow-tooltip
      />
    </el-table>

    <el-empty v-if="errorMsg" :description="errorMsg" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { fetchReportData } from '@/api/menu'
import { getMenuTree } from '@/api/menu'
import type { MenuItem } from '@/api/menu'

const props = defineProps<{
  menuId?: string
  menuName?: string
}>()

const route = useRoute()

const menuId = computed(() => props.menuId || (route.meta.menuId as string))
const menuName = ref(props.menuName || (route.meta.title as string) || '报表')
const columns = ref<string[]>([])
const columnLabels = ref<Record<string, string>>({})
const rows = ref<Record<string, any>[]>([])
const loading = ref(false)
const errorMsg = ref('')

async function findMenuConfig(menuId: string): Promise<MenuItem | null> {
  const tree = await getMenuTree()
  function search(nodes: MenuItem[]): MenuItem | null {
    for (const n of nodes) {
      if (n.id === menuId) return n
      if (n.children) {
        const found = search(n.children)
        if (found) return found
      }
    }
    return null
  }
  return search(tree)
}

async function fetchData() {
  if (!menuId.value) {
    errorMsg.value = '未关联菜单ID'
    return
  }

  loading.value = true
  errorMsg.value = ''
  try {
    const menu = await findMenuConfig(menuId.value)
    if (menu) {
      menuName.value = menu.name
      columnLabels.value = menu.columnLabels || {}
    }

    const data = await fetchReportData(menuId.value)
    columns.value = data.columns
    rows.value = data.rows
  } catch (e: any) {
    const msg = e?.response?.data?.message || e?.message || '查询失败'
    errorMsg.value = msg
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>
