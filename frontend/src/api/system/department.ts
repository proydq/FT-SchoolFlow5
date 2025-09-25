import request from '@/utils/request'
import type {
  DepartmentInfo,
  DepartmentFormData,
  DepartmentQuery,
  DepartmentListResponse,
  DepartmentTreeNode,
  DepartmentStatistics
} from '@/types/department'

/**
 * 获取部门树形结构
 */
export function getDepartmentTree() {
  return request.get<DepartmentInfo[]>('/system/departments/tree')
}

/**
 * 获取部门分页列表
 */
export function getDepartmentList(params: DepartmentQuery) {
  return request.get<DepartmentListResponse>('/system/departments', { params })
}

/**
 * 获取部门详情
 */
export function getDepartmentById(id: number) {
  return request.get<DepartmentInfo>(`/system/departments/${id}`)
}

/**
 * 创建部门
 */
export function createDepartment(data: DepartmentFormData) {
  return request.post('/system/departments', data)
}

/**
 * 更新部门
 */
export function updateDepartment(id: number, data: DepartmentFormData) {
  return request.put(`/system/departments/${id}`, data)
}

/**
 * 删除部门
 */
export function deleteDepartment(id: number) {
  return request.delete(`/system/departments/${id}`)
}

/**
 * 批量删除部门
 */
export function batchDeleteDepartments(ids: number[]) {
  return request.delete('/system/departments/batch', { data: ids })
}

/**
 * 更新部门状态
 */
export function updateDepartmentStatus(id: number, status: number) {
  return request.patch(`/system/departments/${id}/status`, null, { params: { status } })
}

/**
 * 检查部门编码是否存在
 */
export function checkDepartmentCode(code: string, excludeId?: number) {
  return request.get<{ exists: boolean }>('/system/departments/check-code', {
    params: { code, excludeId }
  })
}

/**
 * 获取部门下的用户列表
 */
export function getDepartmentUsers(deptId: number) {
  return request.get(`/system/departments/${deptId}/users`)
}

/**
 * 获取部门统计信息
 */
export function getDepartmentStatistics() {
  return request.get<DepartmentStatistics>('/system/departments/statistics')
}

/**
 * 导出部门数据
 */
export function exportDepartments(params?: DepartmentQuery) {
  return request.get('/system/departments/export', {
    params,
    responseType: 'blob'
  })
}

/**
 * 获取部门级联选择器数据
 */
export function getDepartmentCascader() {
  return request.get<DepartmentTreeNode[]>('/system/departments/cascader')
}