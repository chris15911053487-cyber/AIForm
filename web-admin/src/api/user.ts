import request from './request'

export interface UserItem {
  id: string
  tenantId: string
  username: string
  email?: string
  phone?: string
  realName?: string
  avatar?: string
  status: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface UserQuery {
  page?: number
  pageSize?: number
}

export interface CreateUserParams {
  username: string
  password: string
  email?: string
  phone?: string
  tenantId: string
}

export function getUsers(params: UserQuery): Promise<PaginatedResult<UserItem>> {
  return request.get('/users', { params })
}

export function createUser(params: CreateUserParams): Promise<UserItem> {
  return request.post('/users', params)
}

export interface UpdateUserParams {
  username?: string
  email?: string
  phone?: string
}

export function updateUser(id: string, params: UpdateUserParams): Promise<UserItem> {
  return request.put(`/users/${id}`, params)
}
