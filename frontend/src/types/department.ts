// 部门信息
export interface DepartmentInfo {
  id: number
  deptName: string
  deptCode: string
  parentId: number | null
  managerId: number | null
  managerName?: string
  phone?: string
  description?: string
  sortOrder: number
  status: number
  createTime?: string
  updateTime?: string
  children?: DepartmentInfo[]
}

// 部门表单数据
export interface DepartmentFormData {
  deptName: string
  deptCode: string
  parentId: number | null
  managerId?: number | null
  phone?: string
  description?: string
  sortOrder: number
  status: number
}

// 部门查询参数
export interface DepartmentQuery {
  keyword?: string
  status?: number
  parentId?: number
  page?: number
  size?: number
}

// 部门树节点
export interface DepartmentTreeNode {
  id: number
  name: string
  code?: string
  parentId: number | null
  children?: DepartmentTreeNode[]
  disabled?: boolean
}

// 部门列表响应
export interface DepartmentListResponse {
  content: DepartmentInfo[]
  total: number
  page: number
  size: number
  totalPages: number
}

// 部门统计信息
export interface DepartmentStatistics {
  totalCount: number
  activeCount: number
  inactiveCount: number
  totalEmployees: number
  departmentLevels: number
}