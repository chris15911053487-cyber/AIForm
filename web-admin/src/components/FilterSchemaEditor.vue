<template>
  <div class="fs-editor">
    <!-- Header -->
    <div class="fs-header">
      <span class="fs-title">筛选字段</span>
      <div style="display: flex; gap: 8px;">
        <el-button size="small" type="primary" text @click="addField">+ 添加字段</el-button>
        <el-button size="small" text @click="advancedMode = !advancedMode">
          {{ advancedMode ? '可视化模式' : '高级模式(JSON)' }}
        </el-button>
      </div>
    </div>

    <!-- Visual mode: summary table -->
    <template v-if="!advancedMode">
      <div v-if="fields.length === 0" class="fs-empty">暂无筛选字段，点击"+ 添加字段"新增</div>
      <el-table v-else :data="fields" border size="small" style="width: 100%">
        <el-table-column prop="name" label="字段名" min-width="100" />
        <el-table-column prop="label" label="标签" min-width="100">
          <template #default="{ row }">{{ row.label || '-' }}</template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="90">
          <template #default="{ row }">{{ row.type || 'string' }}</template>
        </el-table-column>
        <el-table-column prop="required" label="必填" width="55" align="center">
          <template #default="{ row }">
            <span v-if="row.required" style="color: #1890ff;">是</span>
            <span v-else style="color: #c0c4cc;">-</span>
          </template>
        </el-table-column>
        <el-table-column label="选项" min-width="80">
          <template #default="{ row }">
            <span v-if="row.options?.length">{{ row.options.length }}项</span>
            <span v-else-if="row.optionsSql" style="color: #67c23a;">SQL</span>
            <span v-else style="color: #c0c4cc;">-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center">
          <template #default="{ $index }">
            <el-button size="small" text type="primary" @click="editField($index)">编辑</el-button>
            <el-button size="small" text type="danger" @click="removeField($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Field edit dialog -->
      <el-dialog
        v-model="editVisible"
        :title="'编辑筛选字段: ' + (editingField.name || '(新字段)')"
        width="560px"
        append-to-body
        destroy-on-close
      >
        <el-form v-if="editingField" label-width="100px" size="small">
          <el-form-item label="字段名" required>
            <el-input v-model="editingField.name" placeholder="如: status, orderDate" />
          </el-form-item>
          <el-form-item label="显示标签">
            <el-input v-model="editingField.label" placeholder="如: 状态, 订单日期" />
          </el-form-item>
          <el-form-item label="类型">
            <el-select v-model="editingField.type" style="width: 100%">
              <el-option v-for="t in FILTER_TYPES" :key="t" :label="t" :value="t" />
            </el-select>
          </el-form-item>
          <el-form-item label="必填">
            <el-switch v-model="editingField.required" />
          </el-form-item>
          <el-form-item label="扫描/模糊">
            <el-switch v-model="editingField.scan" />
          </el-form-item>
          <el-form-item label="无'全部'选项">
            <el-switch v-model="editingField.noAllOption" />
          </el-form-item>
          <el-form-item label="最大长度">
            <el-input-number v-model="editingField.maxLength" :min="0" :max="4000" />
          </el-form-item>

          <!-- Static options sub-editor -->
          <el-divider content-position="left">静态选项 (options)</el-divider>
          <KeyValueEditor
            v-if="editingField.options"
            v-model="optionsMap"
            title=""
            key-label="显示名"
            value-label="值(code)"
            key-placeholder="如: 进行中"
            value-placeholder="如: open"
          />

          <el-divider content-position="left">动态选项 SQL</el-divider>
          <el-input
            v-model="editingField.optionsSql"
            type="textarea"
            :rows="3"
            placeholder="SELECT WhsName AS name, WhsCode AS code FROM dbo.OWHS ORDER BY WhsCode"
            style="font-family: monospace; font-size: 12px;"
          />
        </el-form>
        <template #footer>
          <el-button @click="editVisible = false">关闭</el-button>
        </template>
      </el-dialog>
    </template>

    <!-- Advanced mode: JSON textarea -->
    <template v-else>
      <el-input
        :model-value="jsonText"
        type="textarea"
        :rows="10"
        placeholder='[
  {
    "name": "status",
    "label": "状态",
    "type": "string",
    "required": false,
    "options": [
      { "name": "进行中", "code": "open" }
    ]
  }
]'
        style="font-family: monospace; font-size: 12px;"
        @update:model-value="onJsonInput"
        @blur="tryParseJson"
      />
      <div v-if="jsonError" style="color: #f56c6c; font-size: 12px; margin-top: 4px;">{{ jsonError }}</div>
      <div style="margin-top: 6px;">
        <el-button size="small" @click="tryParseJson" :disabled="!jsonText">格式化校验</el-button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { FilterField } from '@/api/menu'
import KeyValueEditor from './KeyValueEditor.vue'

const props = defineProps<{
  modelValue: FilterField[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: FilterField[]]
}>()

const FILTER_TYPES = ['string', 'int', 'decimal', 'date', 'datetime', 'bool']

const advancedMode = ref(false)
const jsonText = ref('')
const jsonError = ref('')
const editVisible = ref(false)
const editingIndex = ref(-1)
const editingField = reactive<FilterField>(createEmptyField())

function createEmptyField(): FilterField {
  return { name: '', label: '', type: 'string', required: false }
}

const fields = reactive<FilterField[]>([])

// Sync from prop
function syncFromProp() {
  fields.length = 0
  if (Array.isArray(props.modelValue)) {
    for (const f of props.modelValue) {
      fields.push({ ...f })
    }
  }
}
syncFromProp()
watch(() => props.modelValue, syncFromProp, { deep: true })

function emitFields() {
  emit('update:modelValue', fields.map(f => ({ ...f })))
}

// Visual mode
function addField() {
  fields.push(createEmptyField())
  emitFields()
}

function removeField(index: number) {
  fields.splice(index, 1)
  emitFields()
}

// Options map for the editing field
const optionsMap = computed({
  get(): Record<string, string> {
    const map: Record<string, string> = {}
    if (editingField.options) {
      for (const opt of editingField.options) {
        if (opt.name) map[opt.name] = opt.code
      }
    }
    return map
  },
  set(val: Record<string, string>) {
    editingField.options = Object.entries(val).map(([name, code]) => ({ name, code }))
  },
})

function editField(index: number) {
  editingIndex.value = index
  const src = fields[index]
  Object.assign(editingField, {
    name: src.name || '',
    label: src.label || '',
    type: src.type || 'string',
    required: src.required || false,
    maxLength: src.maxLength,
    options: src.options ? [...src.options] : [],
    optionsSql: src.optionsSql || '',
    scan: src.scan || false,
    noAllOption: src.noAllOption || false,
  })
  editVisible.value = true
}

// Sync editingField back when dialog closes
watch(editVisible, (val) => {
  if (!val && editingIndex.value >= 0 && editingIndex.value < fields.length) {
    Object.assign(fields[editingIndex.value], {
      name: editingField.name,
      label: editingField.label,
      type: editingField.type || 'string',
      required: editingField.required || false,
      maxLength: editingField.maxLength,
      options: editingField.options,
      optionsSql: editingField.optionsSql || undefined,
      scan: editingField.scan || false,
      noAllOption: editingField.noAllOption || false,
    })
    emitFields()
  }
})

// JSON advanced mode
function syncJsonFromFields() {
  jsonText.value = JSON.stringify(fields, null, 2)
  jsonError.value = ''
}
watch(advancedMode, (val) => {
  if (val) syncJsonFromFields()
})

function onJsonInput(val: string) {
  jsonText.value = val
}

function tryParseJson() {
  try {
    const parsed = JSON.parse(jsonText.value)
    if (!Array.isArray(parsed)) {
      jsonError.value = '须为 JSON 数组'
      return
    }
    jsonError.value = ''
    fields.length = 0
    for (const item of parsed) {
      fields.push({ ...item })
    }
    emitFields()
  } catch (e: any) {
    jsonError.value = 'JSON 格式错误: ' + e.message
  }
}
</script>

<style scoped>
.fs-editor {
  margin-bottom: 12px;
}
.fs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.fs-title {
  font-size: 13px;
  color: #606266;
}
.fs-empty {
  color: #c0c4cc;
  font-size: 12px;
  padding: 12px;
  text-align: center;
  border: 1px dashed #e8e8e8;
  border-radius: 4px;
}
</style>
