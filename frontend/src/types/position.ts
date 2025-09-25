// 岗位信息
export interface PositionInfo {
  id: number
  positionName: string
  positionCode: string
  level: number
  departmentId?: number | null
  departmentName?: string
  description?: string
  minSalary?: number
  maxSalary?: number
  requirements?: string
  responsibilities?: string
  sortOrder: number
  status: number
  createTime?: string
  updateTime?: string
  userCount?: number
}

// 岗位表单数据
export interface PositionFormData {
  positionName: string
  positionCode: string
  level: number
  departmentId?: number | null
  description?: string
  minSalary?: number
  maxSalary?: number
  requirements?: string
  responsibilities?: string
  sortOrder: number
  status: number
}

// 岗位查询参数
export interface PositionQuery {
  keyword?: string
  departmentId?: number | null
  level?: number | null
  status?: number | null
  page?: number
  size?: number
}

// 岗位列表响应
export interface PositionListResponse {
  content: PositionInfo[]
  total: number
  page: number
  size: number
  totalPages: number
}

// 岗位级别枚举
export enum PositionLevel {
  JUNIOR = 1,     // 初级
  INTERMEDIATE = 2, // 中级
  SENIOR = 3,     // 高级
  EXPERT = 4,     // 专家
  MANAGEMENT = 5  // 管理
}

// 岗位级别选项
export interface PositionLevelOption {
  label: string
  value: number
  type: 'info' | 'success' | 'warning' | 'danger'
}

// 岗位统计信息
export interface PositionStatistics {
  totalCount: number
  linkedCount: number        // 已关联部门的岗位数
  unlinkedCount: number     // 未关联部门的岗位数
  levelStatistics: {
    level: number
    count: number
  }[]
  departmentStatistics: {
    departmentId: number
    departmentName: string
    positionCount: number
  }[]
}

// 岗位部门关联数据
export interface PositionDepartmentAssign {
  positionId: number
  departmentId: number
}

// 批量岗位部门关联数据
export interface BatchPositionDepartmentAssign {
  positionIds: number[]
  departmentId: number
}

// 岗位用户信息
export interface PositionUser {
  id: number
  name: string
  email?: string
  phone?: string
  positionId: number
  positionName: string
  departmentId?: number
  departmentName?: string
  joinTime?: string
  status: number
}

// 岗位用户列表响应
export interface PositionUserListResponse {
  content: PositionUser[]
  total: number
  page: number
  size: number
  totalPages: number
}