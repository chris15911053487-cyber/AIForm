<template>
  <div>
    <!-- Search bar -->
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

    <!-- Table -->
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

    <!-- Drawer form -->
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
