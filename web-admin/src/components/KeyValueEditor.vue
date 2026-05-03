<template>
  <div class="kv-editor">
    <div class="kv-header">
      <span class="kv-title">{{ title }}</span>
      <el-button size="small" type="primary" text @click="addRow">+ 添加</el-button>
    </div>
    <div v-if="entries.length === 0" class="kv-empty">暂无数据，点击"+ 添加"新增</div>
    <el-table v-else :data="entries" border size="small" style="width: 100%">
      <el-table-column :label="keyLabel" min-width="140">
        <template #default="{ row, $index }">
          <el-input
            v-model="row.key"
            size="small"
            :placeholder="keyPlaceholder"
            @blur="emitChange"
          />
        </template>
      </el-table-column>
      <el-table-column :label="valueLabel" min-width="140">
        <template #default="{ row, $index }">
          <el-input
            v-model="row.value"
            size="small"
            :placeholder="valuePlaceholder"
            @blur="emitChange"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="60" align="center">
        <template #default="{ $index }">
          <el-button size="small" type="danger" text @click="removeRow($index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

const props = defineProps<{
  modelValue: Record<string, string>
  title?: string
  keyLabel?: string
  valueLabel?: string
  keyPlaceholder?: string
  valuePlaceholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string>]
}>()

interface Entry {
  key: string
  value: string
}

const entries = reactive<Entry[]>([])

// Sync from prop -> entries
function syncFromProp() {
  entries.length = 0
  const obj = props.modelValue || {}
  for (const [k, v] of Object.entries(obj)) {
    entries.push({ key: k, value: v })
  }
}

syncFromProp()

watch(() => props.modelValue, syncFromProp, { deep: true })

function emitChange() {
  const obj: Record<string, string> = {}
  for (const e of entries) {
    const k = e.key.trim()
    if (k) {
      obj[k] = e.value
    }
  }
  emit('update:modelValue', obj)
}

function addRow() {
  entries.push({ key: '', value: '' })
}

function removeRow(index: number) {
  entries.splice(index, 1)
  emitChange()
}
</script>

<style scoped>
.kv-editor {
  margin-bottom: 12px;
}
.kv-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.kv-title {
  font-size: 13px;
  color: #606266;
}
.kv-empty {
  color: #c0c4cc;
  font-size: 12px;
  padding: 12px;
  text-align: center;
  border: 1px dashed #e8e8e8;
  border-radius: 4px;
}
</style>
