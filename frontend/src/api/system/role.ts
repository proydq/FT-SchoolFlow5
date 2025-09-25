import request from '@/utils/request'
import type {
  RoleInfo,
  RoleFormData,
  RoleQuery,
  RoleListResponse
} from '@/types/role'

/**
 * 获取角色分页列表
 */
export function getRoleList(params: RoleQuery) {
  return request.get<RoleListResponse>('/system/roles', { params })
}

/**
 * 获取所有角色列表
 */
export function getAllRoles() {
  return request.get<{ data: RoleInfo[] }>('/system/roles/all')
}

/**
 * 获取启用的角色列表
 */
export function getActiveRoles() {
  return request.get<RoleInfo[]>('/system/roles/active')
}

/**
 * 获取角色详情
 */
export function getRoleDetail(id: number) {
  return request.get<RoleInfo>(`/system/roles/${id}`)
}

/**
 * 创建角色
 */
export function createRole(data: RoleFormData) {
  return request.post('/system/roles', data)
}

/**
 * 更新角色
 */
export function updateRole(id: number, data: RoleFormData) {
  return request.put(`/system/roles/${id}`, data)
}

/**
 * 删除角色
 */
export function deleteRole(id: number) {
  return request.delete(`/system/roles/${id}`)
}

/**
 * 批量删除角色
 */
export function batchDeleteRoles(ids: number[]) {
  return request.delete('/system/roles/batch', { data: ids })
}

/**
 * 更新角色状态
 */
export function updateRoleStatus(id: number, status: number) {
  return request.patch(`/system/roles/${id}/status`, null, { params: { status } })
}

/**
 * 检查角色编码是否存在
 */
export function checkRoleCode(roleCode: string, excludeId?: number) {
  return request.get<{ exists: boolean }>('/system/roles/check-code', {
    params: { roleCode, excludeId }
  })
}

/**
 * 获取角色菜单权限
 */
export function getRoleMenus(roleId: number) {
  return request.get<{ data: string[] }>(`/system/roles/${roleId}/menus`)
}

/**
 * 保存角色菜单权限
 */
export function saveRoleMenus(roleId: number, menuIds: string[]) {
  return request.post(`/system/roles/${roleId}/menus`, menuIds)
}