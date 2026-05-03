import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api/v1',
  timeout: 15000,
})

// Request interceptor — inject Token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor — extract data, unified error handling
request.interceptors.response.use(
  (response) => {
    const body = response.data
    if (body.code >= 200 && body.code < 300) {
      return body.data
    }
    ElMessage.error(body.message || '请求失败')
    return Promise.reject(new Error(body.message))
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      if (status === 401) {
        localStorage.removeItem('token')
        window.location.href = '/login'
        return Promise.reject(error)
      }
      ElMessage.error(data?.message || `请求错误 ${status}`)
    } else {
      ElMessage.error('网络异常，请重试')
    }
    return Promise.reject(error)
  },
)

export default request
