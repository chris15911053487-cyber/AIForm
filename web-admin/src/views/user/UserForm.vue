<template>
  <el-drawer
    v-model="visible"
    :title="isEdit ? '编辑用户' : '新增用户'"
    direction="rtl"
    size="480px"
    @close="$emit('close')"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      style="padding: 0 20px;"
    >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item v-if="!isEdit" label="密码" prop="password">
        <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
        <el-button @click="visible = false">取消</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { createUser, updateUser } from '@/api/user'
import type { UserItem } from '@/api/user'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'

const props = defineProps<{
  visible: boolean
  editData: UserItem | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const visible = computed({
  get: () => props.visible,
  set: (val) => { if (!val) emit('close') },
})

const isEdit = computed(() => !!props.editData)

const formRef = ref<FormInstance>()
const submitting = ref(false)

const form = reactive({
  username: '',
  password: '',
  email: '',
  phone: '',
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' },
  ],
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      if (props.editData) {
        form.username = props.editData.username
        form.password = ''
        form.email = props.editData.email || ''
        form.phone = props.editData.phone || ''
      } else {
        form.username = ''
        form.password = ''
        form.email = ''
        form.phone = ''
      }
      formRef.value?.clearValidate()
    }
  },
)

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (isEdit.value) {
      await updateUser(props.editData!.id, {
        username: form.username,
        email: form.email || undefined,
        phone: form.phone || undefined,
      })
      ElMessage.success('更新成功')
    } else {
      await createUser({
        username: form.username,
        password: form.password,
        email: form.email || undefined,
        phone: form.phone || undefined,
        tenantId: '00000000-0000-0000-0000-000000000001',
      })
      ElMessage.success('创建成功')
    }
    emit('saved')
  } finally {
    submitting.value = false
  }
}
</script>
