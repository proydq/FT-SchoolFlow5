import request from '@/utils/request'
import type {
  PositionInfo,
  PositionFormData,
  PositionQuery,
  PositionListResponse,
  PositionStatistics,
  BatchPositionDepartmentAssign,
  PositionDepartmentAssign,
  PositionUser,
  PositionUserListResponse
} from '@/types/position'

/**
 * 获取岗位分页列表
 */
export function getPositionList(params: PositionQuery) {
  return request.get<PositionListResponse>('/system/positions', { params })
}

/**
 * 获取岗位详情
 */
export function getPositionById(id: number) {
  return request.get<PositionInfo>(`/system/positions/${id}`)
}

/**
 * 创建岗位
 */
export function createPosition(data: PositionFormData) {
  return request.post('/system/positions', data)
}

/**
 * 更新岗位
 */
export function updatePosition(id: number, data: PositionFormData) {
  return request.put(`/system/positions/${id}`, data)
}

/**
 * 删除岗位
 */
export function deletePosition(id: number) {
  return request.delete(`/system/positions/${id}`)
}

/**
 * 批量删除岗位
 */
export function batchDeletePositions(ids: number[]) {
  return request.delete('/system/positions/batch', { data: ids })
}

/**
 * 更新岗位状态
 */
export function updatePositionStatus(id: number, status: number) {
  return request.patch(`/system/positions/${id}/status`, null, { params: { status } })
}

/**
 * 检查岗位编码是否存在
 */
export function checkPositionCode(code: string, excludeId?: number) {
  return request.get<{ exists: boolean }>('/system/positions/check-code', {
    params: { code, excludeId }
  })
}

/**
 * 关联岗位到部门
 */
export function assignPositionToDepartment(data: PositionDepartmentAssign) {
  return request.post('/system/positions/assign-department', data)
}

/**
 * 批量关联岗位到部门
 */
export function batchAssignPositionsToDepartment(data: BatchPositionDepartmentAssign) {
  return request.post('/system/positions/batch-assign-department', data)
}

/**
 * 取消岗位与部门的关联
 */
export function unassignPositionFromDepartment(positionId: number) {
  return request.delete(`/system/positions/${positionId}/unassign-department`)
}

/**
 * 获取岗位下的用户列表
 */
export function getPositionUsers(positionId: number, params?: { page?: number; size?: number }) {
  return request.get<PositionUserListResponse>(`/system/positions/${positionId}/users`, { params })
}

/**
 * 获取岗位统计信息
 */
export function getPositionStatistics() {
  return request.get<PositionStatistics>('/system/positions/statistics')
}

/**
 * 获取所有可用岗位（用于下拉选择）
 */
export function getAvailablePositions() {
  return request.get<PositionInfo[]>('/system/positions/available')
}

/**
 * 获取部门下的岗位列表
 */
export function getDepartmentPositions(departmentId: number) {
  return request.get<PositionInfo[]>(`/system/positions/department/${departmentId}`)
}

/**
 * 导出岗位数据
 */
export function exportPositions(params?: PositionQuery) {
  return request.get('/system/positions/export', {
    params,
    responseType: 'blob'
  })
}

/**
 * 获取岗位级别统计
 */
export function getPositionLevelStatistics() {
  return request.get<{
    level: number
    levelName: string
    count: number
    percentage: number
  }[]>('/system/positions/level-statistics')
}

/**
 * 复制岗位
 */
export function copyPosition(id: number, newName: string, newCode: string) {
  return request.post(`/system/positions/${id}/copy`, {
    positionName: newName,
    positionCode: newCode
  })
}

/**
 * 获取岗位职业发展路径
 */
export function getPositionCareerPath(id: number) {
  return request.get<{
    currentPosition: PositionInfo
    nextPositions: PositionInfo[]
    previousPositions: PositionInfo[]
  }>(`/system/positions/${id}/career-path`)
}

/**
 * 设置岗位职业发展路径
 */
export function setPositionCareerPath(id: number, data: {
  nextPositionIds: number[]
  previousPositionIds: number[]
}) {
  return request.put(`/system/positions/${id}/career-path`, data)
}