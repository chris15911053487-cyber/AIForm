<template>
  <div>
    <h4>{{ formState === 'create' ? '新建菜单' : `编辑：${formData.name}` }}</h4>

    <el-tabs v-model="activeTab" type="border-card" style="margin-top: 12px;">
      <!-- Tab 1: 基本信息 -->
      <el-tab-pane label="基本信息" name="basic">
        <el-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-width="90px"
          style="max-width: 560px;"
        >
          <el-form-item label="菜单名称" prop="name">
            <el-input v-model="formData.name" placeholder="如：用户管理" />
          </el-form-item>
          <el-form-item label="路由路径" prop="path">
            <el-input v-model="formData.path" placeholder="如：/system/users" />
          </el-form-item>
          <el-form-item label="图标">
            <el-input v-model="formData.icon" placeholder="emoji 如：📋  或 Element Plus 图标名如：user" />
          </el-form-item>
          <el-form-item label="组件路径">
            <el-input v-model="formData.component" placeholder="如：system/users/index（内置菜单必填）" />
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number v-model="formData.sort" :min="0" />
          </el-form-item>
          <el-form-item label="可见">
            <el-switch v-model="formData.visible" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="formData.status" style="width: 120px;">
              <el-option label="启用" value="active" />
              <el-option label="禁用" value="disabled" />
            </el-select>
          </el-form-item>
          <el-form-item label="打开方式">
            <el-radio-group v-model="formData.openMode">
              <el-radio value="embed">容器内打开</el-radio>
              <el-radio value="dialog">弹框打开</el-radio>
              <el-radio value="blank">新界面打开</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="菜单类型">
            <el-radio-group v-model="formData.menuKind">
              <el-radio value="builtin">内置页面</el-radio>
              <el-radio value="report">动态报表</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- Tab 2: 报表配置 -->
      <el-tab-pane v-if="formData.menuKind === 'report'" label="报表配置" name="report">
        <el-form label-width="90px" style="max-width: 100%;">
          <el-form-item label="SQL 模板">
            <el-input
              v-model="formData.queryTemplate"
              type="textarea"
              :rows="5"
              placeholder="SELECT * FROM table WHERE 1=1"
              style="font-family: monospace; font-size: 12px;"
            />
            <div style="font-size: 11px; color: #909399; margin-top: 2px;">
              支持 SELECT / WITH...SELECT / EXEC 存储过程，参数用 @name 占位
            </div>
          </el-form-item>

          <el-form-item label="筛选字段">
            <FilterSchemaEditor v-model="formData.filterSchema" />
          </el-form-item>

          <el-form-item label="列标签">
            <KeyValueEditor
              v-model="formData.columnLabels"
              title="列标签映射"
              key-label="列名"
              value-label="显示标题"
              key-placeholder="如: orderNo"
              value-placeholder="如: 订单号"
            />
          </el-form-item>

          <el-form-item label="列名映射">
            <KeyValueEditor
              v-model="formData.columnNameMapping"
              title="列名映射"
              key-label="逻辑列名"
              value-label="SQL 列名"
              key-placeholder="如: orderNo"
              value-placeholder="如: ord_no"
            />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- Tab 3: 行详情 -->
      <el-tab-pane v-if="formData.menuKind === 'report'" label="行详情" name="detail">
        <el-form label-width="120px" style="max-width: 560px;">
          <el-form-item label="详情 SQL 模板">
            <el-input
              v-model="formData.detailQueryTemplate"
              type="textarea"
              :rows="4"
              placeholder="SELECT * FROM table WHERE id = @detailKey"
              style="font-family: monospace; font-size: 12px;"
            />
          </el-form-item>
          <el-form-item label="主键列名">
            <el-input v-model="formData.detailKeyColumn" placeholder="如: id" />
          </el-form-item>
          <el-form-item label="主键参数名">
            <el-input v-model="formData.detailKeyParam" placeholder="默认: detailKey" />
          </el-form-item>
          <el-form-item label="主键类型">
            <el-select v-model="formData.detailKeyType" style="width: 140px;">
              <el-option v-for="t in DETAIL_KEY_TYPES" :key="t" :label="t" :value="t" />
            </el-select>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- Tab 4: AI 配置 -->
      <el-tab-pane v-if="formData.menuKind === 'report'" label="AI 配置" name="ai">
        <el-form label-width="90px" style="max-width: 100%;">
          <el-form-item label="AI 提示词">
            <el-input
              v-model="formData.aiPrompt"
              type="textarea"
              :rows="8"
              placeholder="分析报表数据并提供洞察。可用占位符：{report_label}、{filters}、{metrics}、{data_sample}、{columns}"
              style="font-family: monospace; font-size: 12px;"
            />
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <!-- Actions -->
    <div style="margin-top: 16px; display: flex; gap: 8px;">
      <el-button type="primary" :loading="submitting" @click="handleSave">保存</el-button>
      <el-button v-if="formState === 'edit'" type="danger" :loading="deleting" @click="handleDelete">删除</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { createMenu, updateMenu, deleteMenu } from '@/api/menu'
import type { MenuItem, FilterField } from '@/api/menu'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import FilterSchemaEditor from '@/components/FilterSchemaEditor.vue'
import KeyValueEditor from '@/components/KeyValueEditor.vue'

const props = defineProps<{
  menu: MenuItem | null
  parentId: string | null
}>()

const emit = defineEmits<{
  saved: []
  deleted: []
}>()

const DETAIL_KEY_TYPES = ['string', 'int', 'decimal', 'date', 'datetime', 'bool']

const formState = computed(() => (props.menu ? 'edit' : 'create'))

const activeTab = ref('basic')
const formRef = ref<FormInstance>()
const submitting = ref(false)
const deleting = ref(false)

const formData = reactive({
  name: '',
  icon: '',
  path: '',
  component: '',
  sort: 0,
  visible: true,
  status: 'active' as string,
  openMode: 'embed',
  menuKind: 'builtin' as 'builtin' | 'report',
  queryTemplate: '',
  filterSchema: [] as FilterField[],
  columnLabels: {} as Record<string, string>,
  columnNameMapping: {} as Record<string, string>,
  detailQueryTemplate: '',
  detailKeyColumn: '',
  detailKeyParam: 'detailKey',
  detailKeyType: 'string',
  aiPrompt: '',
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  path: [{ required: true, message: '请输入路由路径', trigger: 'blur' }],
}

// Populate form when menu or parentId changes
watch(
  () => [props.menu, props.parentId],
  () => {
    if (props.menu) {
      formData.name = props.menu.name
      formData.icon = props.menu.icon || ''
      formData.path = props.menu.path
      formData.component = props.menu.component || ''
      formData.sort = props.menu.sort
      formData.visible = props.menu.visible
      formData.status = props.menu.status
      formData.openMode = props.menu.openMode || 'embed'
      formData.menuKind = props.menu.menuKind || 'builtin'
      formData.queryTemplate = props.menu.queryTemplate || ''
      formData.filterSchema = props.menu.filterSchema ? [...props.menu.filterSchema] : []
      formData.columnLabels = props.menu.columnLabels ? { ...props.menu.columnLabels } : {}
      formData.columnNameMapping = props.menu.columnNameMapping ? { ...props.menu.columnNameMapping } : {}
      formData.detailQueryTemplate = props.menu.detailQueryTemplate || ''
      formData.detailKeyColumn = props.menu.detailKeyColumn || ''
      formData.detailKeyParam = props.menu.detailKeyParam || 'detailKey'
      formData.detailKeyType = props.menu.detailKeyType || 'string'
      formData.aiPrompt = props.menu.aiPrompt || ''
    } else {
      formData.name = ''
      formData.icon = ''
      formData.path = ''
      formData.component = ''
      formData.sort = 0
      formData.visible = true
      formData.status = 'active'
      formData.openMode = 'embed'
      formData.menuKind = 'builtin'
      formData.queryTemplate = ''
      formData.filterSchema = []
      formData.columnLabels = {}
      formData.columnNameMapping = {}
      formData.detailQueryTemplate = ''
      formData.detailKeyColumn = ''
      formData.detailKeyParam = 'detailKey'
      formData.detailKeyType = 'string'
      formData.aiPrompt = ''
    }
    activeTab.value = 'basic'
    formRef.value?.clearValidate()
  },
  { immediate: true },
)

// When switching from report to builtin, clear report fields
watch(
  () => formData.menuKind,
  (val) => {
    if (val === 'builtin') {
      formData.queryTemplate = ''
      formData.filterSchema = []
      formData.columnLabels = {}
      formData.columnNameMapping = {}
      formData.detailQueryTemplate = ''
      formData.detailKeyColumn = ''
      formData.aiPrompt = ''
    }
  },
)

async function handleSave() {
  // Validate only basic fields
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) {
    activeTab.value = 'basic'
    return
  }

  submitting.value = true
  try {
    const payload: any = {
      name: formData.name,
      path: formData.path,
      icon: formData.icon || undefined,
      component: formData.component || undefined,
      sort: formData.sort,
      visible: formData.visible,
      status: formData.status,
      parentId: props.parentId || undefined,
      openMode: formData.openMode,
      menuKind: formData.menuKind,
    }

    if (formData.menuKind === 'report') {
      payload.queryTemplate = formData.queryTemplate
      payload.filterSchema = formData.filterSchema
      payload.columnLabels = formData.columnLabels
      payload.columnNameMapping = formData.columnNameMapping
      payload.detailQueryTemplate = formData.detailQueryTemplate || undefined
      payload.detailKeyColumn = formData.detailKeyColumn || undefined
      payload.detailKeyParam = formData.detailKeyParam || 'detailKey'
      payload.detailKeyType = formData.detailKeyType || 'string'
      payload.aiPrompt = formData.aiPrompt || undefined
    }

    if (formState.value === 'edit') {
      await updateMenu(props.menu!.id, payload)
      ElMessage.success('更新成功')
    } else {
      await createMenu(payload)
      ElMessage.success('创建成功')
    }
    emit('saved')
  } finally {
    submitting.value = false
  }
}

async function handleDelete() {
  try {
    await ElMessageBox.confirm('确认删除该菜单？子菜单也会一同删除。', '删除确认', {
      type: 'warning',
    })
  } catch {
    return
  }

  deleting.value = true
  try {
    await deleteMenu(props.menu!.id)
    ElMessage.success('已删除')
    emit('deleted')
  } finally {
    deleting.value = false
  }
}
</script>
