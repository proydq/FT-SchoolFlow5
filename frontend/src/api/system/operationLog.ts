import request from '@/utils/request'
import type {
  OperationLogInfo,
  OperationLogQuery,
  OperationLogListResponse,
  OperationLogStatistics
} from '@/types/operationLog'

/**
 * 获取操作日志分页列表
 */
export function getOperationLogList(params: OperationLogQuery) {
  return request.get<OperationLogListResponse>('/system/operation-logs', { params })
}

/**
 * 获取操作日志详情
 */
export function getOperationLogById(id: number) {
  return request.get<OperationLogInfo>(`/system/operation-logs/${id}`)
}

/**
 * 删除操作日志
 */
export function deleteOperationLog(id: number) {
  return request.delete(`/system/operation-logs/${id}`)
}

/**
 * 批量删除操作日志
 */
export function batchDeleteOperationLogs(ids: number[]) {
  return request.delete('/system/operation-logs/batch', { data: ids })
}

/**
 * 清理过期日志
 */
export function cleanupExpiredLogs(days: number) {
  return request.delete('/system/operation-logs/cleanup', { params: { days } })
}

/**
 * 获取操作日志统计信息
 */
export function getOperationLogStatistics() {
  return request.get<OperationLogStatistics>('/system/operation-logs/statistics')
}

/**
 * 导出操作日志
 */
export function exportOperationLogs(params?: OperationLogQuery) {
  return request.get('/system/operation-logs/export', {
    params,
    responseType: 'blob'
  })
}