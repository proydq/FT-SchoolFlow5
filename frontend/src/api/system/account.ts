import request from '@/utils/request'
import type {
  AccountInfo,
  AccountFormData,
  AccountQuery,
  AccountListResponse,
  AccountStatistics,
  AccountAssignData,
  BatchAccountAssignData,
  AccountLoginRecord,
  AccountLoginRecordQuery,
  AccountLoginRecordListResponse,
  PasswordResetData,
  BatchAccountOperationData,
  AccountImportData,
  AccountImportResult,
  AccountRole,
  AccountOnlineStatus,
  AccountSecuritySettings,
  AccountProfile
} from '@/types/account'

/**
 * 获取账号分页列表
 */
export function getAccountList(params: AccountQuery) {
  return request.get<AccountListResponse>('/system/accounts', { params })
}

/**
 * 获取账号详情
 */
export function getAccountById(id: number) {
  return request.get<AccountInfo>(`/system/accounts/${id}`)
}

/**
 * 创建账号
 */
export function createAccount(data: AccountFormData) {
  return request.post('/system/accounts', data)
}

/**
 * 更新账号
 */
export function updateAccount(id: number, data: AccountFormData) {
  return request.put(`/system/accounts/${id}`, data)
}

/**
 * 删除账号
 */
export function deleteAccount(id: number) {
  return request.delete(`/system/accounts/${id}`)
}

/**
 * 批量删除账号
 */
export function batchDeleteAccounts(ids: number[]) {
  return request.delete('/system/accounts/batch', { data: ids })
}

/**
 * 更新账号状态
 */
export function updateAccountStatus(id: number, status: string) {
  return request.patch(`/system/accounts/${id}/status`, null, { params: { status } })
}

/**
 * 批量操作账号
 */
export function batchOperateAccounts(data: BatchAccountOperationData) {
  return request.post('/system/accounts/batch-operation', data)
}

/**
 * 重置密码
 */
export function resetPassword(data: PasswordResetData) {
  return request.post('/system/accounts/reset-password', data)
}

/**
 * 强制下线账号
 */
export function forceLogout(accountId: number) {
  return request.post(`/system/accounts/${accountId}/force-logout`)
}

/**
 * 检查用户名是否存在
 */
export function checkUsername(username: string, excludeId?: number) {
  return request.get<{ exists: boolean }>('/system/accounts/check-username', {
    params: { username, excludeId }
  })
}

/**
 * 检查邮箱是否存在
 */
export function checkEmail(email: string, excludeId?: number) {
  return request.get<{ exists: boolean }>('/system/accounts/check-email', {
    params: { email, excludeId }
  })
}

/**
 * 分配账号给人员
 */
export function assignAccountToPerson(data: AccountAssignData) {
  return request.post('/system/accounts/assign', data)
}

/**
 * 批量分配账号给人员
 */
export function batchAssignAccountsToPersons(data: BatchAccountAssignData) {
  return request.post('/system/accounts/batch-assign', data)
}

/**
 * 取消账号分配
 */
export function unassignAccount(accountId: number) {
  return request.delete(`/system/accounts/${accountId}/unassign`)
}

/**
 * 获取账号统计信息
 */
export function getAccountStatistics() {
  return request.get<AccountStatistics>('/system/accounts/statistics')
}

/**
 * 获取账号登录记录
 */
export function getAccountLoginRecords(params: AccountLoginRecordQuery) {
  return request.get<AccountLoginRecordListResponse>('/system/accounts/login-records', { params })
}

/**
 * 获取在线账号列表
 */
export function getOnlineAccounts() {
  return request.get<AccountOnlineStatus[]>('/system/accounts/online')
}

/**
 * 导入账号
 */
export function importAccounts(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<AccountImportResult>('/system/accounts/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 导出账号
 */
export function exportAccounts(params?: AccountQuery) {
  return request.get('/system/accounts/export', {
    params,
    responseType: 'blob'
  })
}

/**
 * 下载账号导入模板
 */
export function downloadImportTemplate() {
  return request.get('/system/accounts/import-template', {
    responseType: 'blob'
  })
}

/**
 * 获取可分配的人员列表
 */
export function getAssignablePersons() {
  return request.get('/system/accounts/assignable-persons')
}

/**
 * 获取账号可选角色列表
 */
export function getAccountRoles() {
  return request.get<AccountRole[]>('/system/accounts/roles')
}

/**
 * 更新账号角色
 */
export function updateAccountRole(accountId: number, roleId: number) {
  return request.patch(`/system/accounts/${accountId}/role`, null, { params: { roleId } })
}

/**
 * 批量更新账号角色
 */
export function batchUpdateAccountRoles(accountIds: number[], roleId: number) {
  return request.patch('/system/accounts/batch-role', null, {
    params: { roleId },
    data: accountIds
  })
}

/**
 * 获取账号安全设置
 */
export function getAccountSecuritySettings(accountId: number) {
  return request.get<AccountSecuritySettings>(`/system/accounts/${accountId}/security-settings`)
}

/**
 * 更新账号安全设置
 */
export function updateAccountSecuritySettings(accountId: number, settings: Partial<AccountSecuritySettings>) {
  return request.put(`/system/accounts/${accountId}/security-settings`, settings)
}

/**
 * 获取账号个人资料
 */
export function getAccountProfile(accountId: number) {
  return request.get<AccountProfile>(`/system/accounts/${accountId}/profile`)
}

/**
 * 更新账号个人资料
 */
export function updateAccountProfile(accountId: number, profile: Partial<AccountProfile>) {
  return request.put(`/system/accounts/${accountId}/profile`, profile)
}

/**
 * 解锁账号
 */
export function unlockAccount(accountId: number) {
  return request.post(`/system/accounts/${accountId}/unlock`)
}

/**
 * 锁定账号
 */
export function lockAccount(accountId: number, reason?: string) {
  return request.post(`/system/accounts/${accountId}/lock`, { reason })
}

/**
 * 启用账号
 */
export function enableAccount(accountId: number) {
  return request.post(`/system/accounts/${accountId}/enable`)
}

/**
 * 禁用账号
 */
export function disableAccount(accountId: number, reason?: string) {
  return request.post(`/system/accounts/${accountId}/disable`, { reason })
}

/**
 * 发送密码重置邮件
 */
export function sendPasswordResetEmail(email: string) {
  return request.post('/system/accounts/send-password-reset-email', { email })
}

/**
 * 生成随机密码
 */
export function generateRandomPassword() {
  return request.get<{ password: string }>('/system/accounts/generate-password')
}

/**
 * 验证密码强度
 */
export function validatePasswordStrength(password: string) {
  return request.post<{
    score: number
    level: 'weak' | 'medium' | 'strong'
    suggestions: string[]
  }>('/system/accounts/validate-password', { password })
}

/**
 * 清理无效账号
 */
export function cleanupInvalidAccounts() {
  return request.post<{
    deletedCount: number
    details: string[]
  }>('/system/accounts/cleanup')
}