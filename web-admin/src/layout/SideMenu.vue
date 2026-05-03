<template>
  <template v-for="item in menuList" :key="item.path">
    <!-- Has children: show sub-menu -->
    <el-sub-menu
      v-if="item.children && item.children.length > 0"
      :index="item.path"
    >
      <template #title>
        <el-icon v-if="item.meta?.icon && iconMap[item.meta.icon as string]">
          <component :is="iconMap[item.meta.icon as string]" />
        </el-icon>
        <span>{{ item.meta?.title }}</span>
      </template>
      <SideMenu :menu-list="item.children" @open-dialog="(item) => emit('open-dialog', item)" @open-embed="(item) => emit('open-embed', item)" />
    </el-sub-menu>
    <!-- Leaf node: menu item -->
    <el-menu-item
      v-else
      :index="item.path"
      @click="handleClick(item.path)"
    >
      <el-icon v-if="item.meta?.icon && iconMap[item.meta.icon as string]">
        <component :is="iconMap[item.meta.icon as string]" />
      </el-icon>
      <span>{{ item.meta?.title }}</span>
    </el-menu-item>
  </template>
</template>

<script setup lang="ts">
import type { RouteRecordRaw } from 'vue-router'
import {
  DataBoard, Setting, User, Menu, Lock, Key, List,
  Document, Files, Monitor, Message, Bell, Search, Tools,
} from '@element-plus/icons-vue'

const props = defineProps<{
  menuList: RouteRecordRaw[]
}>()

const emit = defineEmits<{
  'open-dialog': [item: RouteRecordRaw]
  'open-embed': [item: RouteRecordRaw]
}>()

function handleClick(path: string) {
  const item = findMenuItem(props.menuList, path)
  if (!item) return
  const openMode = item.meta?.openMode || 'embed'

  if (openMode === 'blank') {
    window.open(window.location.origin + path, '_blank')
  } else if (openMode === 'dialog') {
    emit('open-dialog', item)
  } else {
    // embed mode: don't change URL, let LayoutMain handle component switching
    emit('open-embed', item)
  }
}

function findMenuItem(list: RouteRecordRaw[], path: string): RouteRecordRaw | null {
  for (const item of list) {
    if (item.path === path) return item
    if (item.children) {
      const found = findMenuItem(item.children, path)
      if (found) return found
    }
  }
  return null
}

// Map icon name strings to actual icon components
const iconMap: Record<string, any> = {
  dashboard: DataBoard,
  setting: Setting,
  user: User,
  team: User,
  menu: Menu,
  lock: Lock,
  key: Key,
  list: List,
  document: Document,
  files: Files,
  monitor: Monitor,
  message: Message,
  bell: Bell,
  search: Search,
  tools: Tools,
}
</script>
