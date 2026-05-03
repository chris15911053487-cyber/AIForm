<template>
  <el-card style="height: calc(100vh - 140px);">
    <div style="display: flex; height: 100%;">
      <!-- Left: menu tree -->
      <div style="width: 280px; border-right: 1px solid #e8e8e8; padding-right: 16px; display: flex; flex-direction: column;">
        <!-- Search + header -->
        <div style="margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <strong>菜单树</strong>
            <el-button size="small" type="primary" @click="openCreate(null)">+ 新增根菜单</el-button>
          </div>
          <el-input
            v-model="filterText"
            size="small"
            placeholder="搜索菜单..."
            clearable
            :prefix-icon="Search"
          />
        </div>

        <!-- Tree -->
        <div style="flex: 1; overflow-y: auto;">
          <el-tree
            ref="treeRef"
            :data="treeData"
            :props="{ children: 'children', label: 'name' }"
            node-key="id"
            highlight-current
            default-expand-all
            :filter-node-method="filterNode"
            @node-click="handleNodeClick"
          >
            <template #default="{ data }">
              <span style="display: flex; align-items: center; justify-content: space-between; width: 100%; padding-right: 4px;">
                <span>{{ data.name }}</span>
                <el-button size="small" text @click.stop="openCreate(data)">+子</el-button>
              </span>
            </template>
          </el-tree>
        </div>
      </div>

      <!-- Right: edit form -->
      <div style="flex: 1; padding-left: 20px; overflow-y: auto;">
        <MenuForm
          v-if="selectedMenu !== undefined"
          :key="selectedMenu?.id || 'create'"
          :menu="selectedMenu"
          :parent-id="parentId"
          @saved="onSaved"
          @deleted="onDeleted"
        />
        <div v-else style="padding: 60px 40px; text-align: center; color: #c0c4cc;">
          <div style="font-size: 48px; margin-bottom: 12px;">📋</div>
          <div>请从左侧选择一个菜单节点进行编辑</div>
          <div style="font-size: 12px; margin-top: 4px;">或点击 "+ 新增根菜单" 创建顶级菜单</div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { getMenuTree } from '@/api/menu'
import type { MenuItem } from '@/api/menu'
import type { ElTree } from 'element-plus'
import MenuForm from './MenuForm.vue'

const treeRef = ref<InstanceType<typeof ElTree>>()
const treeData = ref<MenuItem[]>([])
const selectedMenu = ref<MenuItem | null>(null)
const parentId = ref<string | null>(null)
const filterText = ref('')

async function fetchTree() {
  treeData.value = await getMenuTree()
}

function filterNode(value: string, data: MenuItem): boolean {
  if (!value) return true
  return data.name.toLowerCase().includes(value.toLowerCase())
}

watch(filterText, (val) => {
  treeRef.value?.filter(val)
})

function handleNodeClick(data: MenuItem) {
  selectedMenu.value = { ...data }
  parentId.value = null
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
