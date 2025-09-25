// 账号状态枚举
export enum AccountStatus {
  ACTIVE = 'active',      // 正常
  DISABLED = 'disabled',  // 禁用
  LOCKED = 'locked'       // 锁定
}

// 账号信息
export interface AccountInfo {
  id: number
  username: string
  email: string
  avatar?: string
  status: AccountStatus
  assignedPerson?: string
  assignedPersonId?: number
  role?: string
  roleId?: number
  roleName?: string
  departmentId?: number
  departmentName?: string
  lastLoginTime?: string
  loginCount: number
  isOnline: boolean
  createTime: string
  updateTime?: string
  createdBy?: string
  lastLoginIp?: string
  phone?: string
  realName?: string
  gender?: number
  remark?: string
}

// 账号表单数据
export interface AccountFormData {
  username: string
  email: string
  password?: string
  confirmPassword?: string
  status: AccountStatus
  roleId?: number
  departmentId?: number
  assignedPersonId?: number
  phone?: string
  realName?: string
  gender?: number
  remark?: string
}

// 账号查询参数
export interface AccountQuery {
  keyword?: string
  status?: AccountStatus | string
  roleId?: number
  departmentId?: number
  assignmentStatus?: 'assigned' | 'unassigned' | string
  isOnline?: boolean
  page?: number
  size?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 账号列表响应
export interface AccountListResponse {
  content: AccountInfo[]
  total: number
  page: number
  size: number
  totalPages: number
}

// 账号统计信息
export interface AccountStatistics {
  totalCount: number
  assignedCount: number
  unassignedCount: number
  activeCount: number
  disabledCount: number
  lockedCount: number
  onlineCount: number
  todayLoginCount: number
  thisWeekLoginCount: number
  thisMonthLoginCount: number
}

// 账号分配数据
export interface AccountAssignData {
  accountId: number
  personId: number
}

// 批量账号分配数据
export interface BatchAccountAssignData {
  accountIds: number[]
  personId: number
}

// 账号登录记录
export interface AccountLoginRecord {
  id: number
  accountId: number
  username: string
  loginTime: string
  logoutTime?: string
  loginIp: string
  userAgent: string
  location?: string
  duration?: number
  status: 'success' | 'failed'
  failReason?: string
}

// 账号登录记录查询参数
export interface AccountLoginRecordQuery {
  accountId?: number
  username?: string
  startTime?: string
  endTime?: string
  status?: 'success' | 'failed'
  loginIp?: string
  page?: number
  size?: number
}

// 账号登录记录列表响应
export interface AccountLoginRecordListResponse {
  content: AccountLoginRecord[]
  total: number
  page: number
  size: number
  totalPages: number
}

// 密码重置数据
export interface PasswordResetData {
  accountId: number
  newPassword: string
  confirmPassword: string
  forceChange?: boolean
}

// 账号批量操作数据
export interface BatchAccountOperationData {
  accountIds: number[]
  operation: 'enable' | 'disable' | 'lock' | 'unlock' | 'delete'
}

// 账号导入数据
export interface AccountImportData {
  username: string
  email: string
  password: string
  realName?: string
  phone?: string
  roleId?: number
  departmentId?: number
  status?: AccountStatus
}

// 账号导入结果
export interface AccountImportResult {
  success: boolean
  total: number
  successCount: number
  failCount: number
  errors: {
    row: number
    username: string
    email: string
    error: string
  }[]
}

// 账号权限信息
export interface AccountPermission {
  id: number
  name: string
  code: string
  type: 'menu' | 'button' | 'api'
  description?: string
}

// 账号角色信息
export interface AccountRole {
  id: number
  name: string
  code: string
  description?: string
  permissions: AccountPermission[]
}

// 账号在线状态
export interface AccountOnlineStatus {
  accountId: number
  username: string
  loginTime: string
  lastActiveTime: string
  loginIp: string
  location?: string
  deviceInfo?: string
  isActive: boolean
}

// 账号安全设置
export interface AccountSecuritySettings {
  accountId: number
  enableTwoFactor: boolean
  enableEmailNotification: boolean
  enableSmsNotification: boolean
  passwordExpireDays: number
  maxLoginAttempts: number
  lockDuration: number
  allowMultipleLogin: boolean
  ipWhitelist?: string[]
  sessionTimeout: number
}

// 账号个人资料
export interface AccountProfile {
  id: number
  username: string
  email: string
  realName?: string
  phone?: string
  avatar?: string
  gender?: number
  birthday?: string
  address?: string
  bio?: string
  departmentId?: number
  departmentName?: string
  positionId?: number
  positionName?: string
  roleId?: number
  roleName?: string
}