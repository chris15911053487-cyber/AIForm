import request from './request'

export interface LoginParams {
  username: string
  password: string
}

export interface UserInfo {
  id: string
  username: string
  email?: string
  roles: { code: string; name: string }[]
}

export interface LoginResult {
  accessToken: string
  user: UserInfo
}

export function login(params: LoginParams): Promise<LoginResult> {
  return request.post('/auth/login', params)
}

export function getCurrentUser(): Promise<UserInfo> {
  return request.get('/auth/current')
}
