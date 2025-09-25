// 角色信息
export interface RoleInfo {
  id: number
  name: string
  code: string
  description: string
  type: 'system' | 'custom'
  status: number
  userCount: number
  permissions: string[]
  createTime?: string
  updateTime?: string
}

// 角色表单数据
export interface RoleFormData {
  roleName: string
  roleCode: string
  description: string
  status: number
  roleType?: string
}

// 角色查询参数
export interface RoleQuery {
  roleName?: string
  roleCode?: string
  status?: number
  pageNum?: number
  pageSize?: number
}

// 角色列表响应
export interface RoleListResponse {
  list: RoleInfo[]
  total: number
}

// 菜单节点
export interface MenuNode {
  id: string
  name: string
  icon?: string
  path?: string
  type?: string
  children?: MenuNode[]
}

// 权限组
export interface PermissionGroup {
  id: number
  name: string
  description: string
  permissions: Permission[]
}

// 权限项
export interface Permission {
  id: string
  name: string
  code: string
}

// 部门树节点
export interface DepartmentNode {
  id: number
  name: string
  children?: DepartmentNode[]
}

// 数据权限表单
export interface DataPermissionForm {
  dataScope: 'all' | 'self' | 'department' | 'department_and_sub' | 'custom'
  departments: number[]
  customerPermissions: string[]
  campaignPermissions: string[]
  allowExport: boolean
}