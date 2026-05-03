import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, getCurrentUser } from '@/api/auth'
import type { UserInfo } from '@/api/auth'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const userInfo = ref<UserInfo | null>(null)
  const permissions = ref<string[]>([])

  async function login(username: string, password: string) {
    const result = await loginApi({ username, password })
    token.value = result.accessToken
    userInfo.value = result.user
    localStorage.setItem('token', result.accessToken)
    return result
  }

  async function fetchUserInfo() {
    const info = await getCurrentUser()
    userInfo.value = info
  }

  function logout() {
    token.value = null
    userInfo.value = null
    permissions.value = []
    localStorage.removeItem('token')
  }

  return { token, userInfo, permissions, login, fetchUserInfo, logout }
})
