import request from './request'

// --- Filter schema types ---

export interface FilterFieldOption {
  name: string
  code: any
}

export interface FilterField {
  name: string
  label?: string
  type?: 'string' | 'int' | 'decimal' | 'date' | 'datetime' | 'bool'
  required?: boolean
  maxLength?: number
  options?: FilterFieldOption[]
  optionsSql?: string
  scan?: boolean
  noAllOption?: boolean
}

// --- Menu item ---

export interface MenuItem {
  id: string
  tenantId: string
  parentId?: string
  name: string
  icon?: string
  path: string
  component?: string
  sort: number
  visible: boolean
  cache: boolean
  status: string
  children?: MenuItem[]
  // New fields
  openMode: string
  menuKind: 'builtin' | 'report'
  queryTemplate?: string
  filterSchema: FilterField[]
  columnLabels: Record<string, string>
  columnNameMapping: Record<string, string>
  detailQueryTemplate?: string
  detailKeyColumn?: string
  detailKeyParam: string
  detailKeyType: string
  aiPrompt?: string
}

export interface MenuRoute {
  name: string
  path: string
  component?: string
  meta: { title: string; icon?: string; requiresAuth: boolean; menuId?: string; menuKind?: string; openMode?: string }
  children?: MenuRoute[]
}

export interface ReportData {
  columns: string[]
  rows: Record<string, any>[]
  total: number
}

// --- Create / Update params ---

export interface CreateMenuParams {
  name: string
  path: string
  icon?: string
  component?: string
  sort?: number
  visible?: boolean
  status?: string
  parentId?: string
  tenantId?: string
  // New fields
  openMode?: string
  menuKind?: 'builtin' | 'report'
  queryTemplate?: string
  filterSchema?: FilterField[]
  columnLabels?: Record<string, string>
  columnNameMapping?: Record<string, string>
  detailQueryTemplate?: string
  detailKeyColumn?: string
  detailKeyParam?: string
  detailKeyType?: string
  aiPrompt?: string
}

export interface UpdateMenuParams {
  name?: string
  path?: string
  icon?: string
  component?: string
  sort?: number
  visible?: boolean
  status?: string
  parentId?: string
  // New fields
  openMode?: string
  menuKind?: 'builtin' | 'report'
  queryTemplate?: string
  filterSchema?: FilterField[]
  columnLabels?: Record<string, string>
  columnNameMapping?: Record<string, string>
  detailQueryTemplate?: string
  detailKeyColumn?: string
  detailKeyParam?: string
  detailKeyType?: string
  aiPrompt?: string
}

// --- API functions ---

export function getMenuTree(): Promise<MenuItem[]> {
  return request.get('/menus/tree')
}

export function getMenuRoutes(): Promise<MenuRoute[]> {
  return request.get('/menus/routes')
}

export function createMenu(params: CreateMenuParams): Promise<MenuItem> {
  return request.post('/menus', params)
}

export function updateMenu(id: string, params: UpdateMenuParams): Promise<MenuItem> {
  return request.put(`/menus/${id}`, params)
}

export function deleteMenu(id: string): Promise<void> {
  return request.delete(`/menus/${id}`)
}

export function fetchReportData(menuId: string, params?: Record<string, string>): Promise<ReportData> {
  return request.get(`/menus/${menuId}/data`, { params })
}
