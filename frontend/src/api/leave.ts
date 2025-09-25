import request from '@/utils/request'
import type {
  LeaveTypeInfo,
  LeaveTypeFormData,
  LeaveTypeListQuery,
  LeaveTypeListResponse,
  LeaveApplicationInfo,
  LeaveApplicationFormData,
  LeaveApplicationListQuery,
  LeaveApplicationListResponse,
  ApprovalRecord,
  ApprovalFormData,
  ApprovalListResponse,
  BatchApprovalData,
  BatchWithdrawData,
  BatchExportQuery,
  LeaveRecordQuery,
  LeaveStatistics
} from '@/types/leave'

// ============ 请假类型管理 API ============

// 获取请假类型列表
export function getLeaveTypeList(params: LeaveTypeListQuery) {
  return request.get<LeaveTypeListResponse>('/api/leave/type/list', { params })
}

// 获取请假类型详情
export function getLeaveTypeDetail(id: string) {
  return request.get<LeaveTypeInfo>(`/api/leave/type/${id}`)
}

// 新增请假类型
export function addLeaveType(data: LeaveTypeFormData) {
  return request.post('/api/leave/type', data)
}

// 更新请假类型
export function updateLeaveType(id: string, data: LeaveTypeFormData) {
  return request.put(`/api/leave/type/${id}`, data)
}

// 删除请假类型
export function deleteLeaveType(id: string) {
  return request.delete(`/api/leave/type/${id}`)
}

// 批量启用/停用请假类型
export function batchUpdateLeaveTypeStatus(ids: string[], status: 'active' | 'inactive') {
  return request.put('/api/leave/type/batch-status', { ids, status })
}

// 检查类型名称是否重复
export function checkLeaveTypeName(typeName: string, excludeId?: string) {
  return request.get<{ exists: boolean }>('/api/leave/type/check-name', { params: { typeName, excludeId } })
}

// 获取请假类型应用详情（使用统计）
export function getLeaveTypeUsage(id: string) {
  return request.get<{
    applicablePersons: { type: string; count: number }[]
    recentUsage: { date: string; count: number }[]
    totalApplications: number
  }>(`/api/leave/type/${id}/usage`)
}

// 导出请假类型配置
export function exportLeaveTypes(params: LeaveTypeListQuery) {
  return request.get('/api/leave/type/export', { params, responseType: 'blob' })
}

// ============ 请假申请管理 API ============

// 获取请假申请列表
export function getLeaveApplicationList(params: LeaveApplicationListQuery) {
  return request.get<LeaveApplicationListResponse>('/api/leave/application/list', { params })
}

// 获取请假申请详情
export function getLeaveApplicationDetail(id: string) {
  return request.get<LeaveApplicationInfo>(`/api/leave/application/${id}`)
}

// 提交请假申请
export function submitLeaveApplication(data: LeaveApplicationFormData) {
  return request.post<{ applicationId: string }>('/api/leave/application', data)
}

// 保存请假申请草稿
export function saveLeaveApplicationDraft(data: LeaveApplicationFormData) {
  return request.post<{ applicationId: string }>('/api/leave/application/draft', data)
}

// 更新请假申请（仅草稿状态）
export function updateLeaveApplication(id: string, data: LeaveApplicationFormData) {
  return request.put(`/api/leave/application/${id}`, data)
}

// 撤回请假申请
export function withdrawLeaveApplication(id: string, reason: string) {
  return request.put(`/api/leave/application/${id}/withdraw`, { reason })
}

// 批量撤回请假申请
export function batchWithdrawApplications(data: BatchWithdrawData) {
  return request.put('/api/leave/application/batch-withdraw', data)
}

// 删除请假申请草稿
export function deleteLeaveApplicationDraft(id: string) {
  return request.delete(`/api/leave/application/draft/${id}`)
}

// 获取可用的请假类型（根据当前用户）
export function getAvailableLeaveTypes() {
  return request.get<LeaveTypeInfo[]>('/api/leave/application/available-types')
}

// 上传证明材料
export function uploadProofMaterial(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<{ fileId: string; fileName: string; filePath: string }>('/api/leave/application/upload-proof', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// ============ 请假审批处理 API ============

// 获取待审批申请列表
export function getPendingApprovalList(params: {
  applicantType?: 'teacher' | 'student'
  leaveTypeId?: string
  applicationDateRange?: [string, string]
  pageNum: number
  pageSize: number
}) {
  return request.get<ApprovalListResponse>('/api/leave/approval/pending', { params })
}

// 获取已审批申请列表
export function getProcessedApprovalList(params: {
  applicantType?: 'teacher' | 'student'
  leaveTypeId?: string
  applicationDateRange?: [string, string]
  pageNum: number
  pageSize: number
}) {
  return request.get<LeaveApplicationListResponse>('/api/leave/approval/processed', { params })
}

// 提交审批决策
export function submitApproval(applicationId: string, data: ApprovalFormData) {
  return request.post(`/api/leave/approval/${applicationId}`, data)
}

// 批量审批
export function batchApproval(data: BatchApprovalData) {
  return request.post('/api/leave/approval/batch', data)
}

// 获取审批历史
export function getApprovalHistory(applicationId: string) {
  return request.get<ApprovalRecord[]>(`/api/leave/approval/${applicationId}/history`)
}

// 上传审批附件
export function uploadApprovalAttachment(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<{ fileId: string; fileName: string; filePath: string }>('/api/leave/approval/upload-attachment', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// ============ 请假记录查询 API ============

// 查询请假记录
export function getLeaveRecords(params: LeaveRecordQuery) {
  return request.get<LeaveApplicationListResponse>('/api/leave/record/list', { params })
}

// 获取请假统计信息
export function getLeaveStatistics(params: {
  applicantType?: 'teacher' | 'student'
  dateRange?: [string, string]
  organizationId?: string
}) {
  return request.get<LeaveStatistics>('/api/leave/record/statistics', { params })
}

// 导出请假记录
export function exportLeaveRecords(params: BatchExportQuery) {
  return request.post('/api/leave/record/export', params, { responseType: 'blob' })
}

// 导出申请详情（单条记录）
export function exportApplicationDetail(applicationId: string, format: 'pdf' | 'excel') {
  return request.get(`/api/leave/record/${applicationId}/export`, { params: { format }, responseType: 'blob' })
}

// ============ 通用工具 API ============

// 获取组织架构（部门/年级）
export function getOrganizations(type: 'department' | 'grade') {
  return request.get<{ id: string; name: string; parentId?: string }[]>('/api/leave/common/organizations', { params: { type } })
}

// 获取审批流程配置
export function getApprovalFlow(applicantType: 'teacher' | 'student', duration: number, durationUnit: 'day' | 'hour') {
  return request.get<{
    levels: {
      level: number
      roleName: string
      description: string
      required: boolean
    }[]
  }>('/api/leave/common/approval-flow', { params: { applicantType, duration, durationUnit } })
}

// 预览文件
export function previewFile(fileId: string) {
  return request.get<{ previewUrl: string }>(`/api/leave/common/file/${fileId}/preview`)
}

// 下载文件
export function downloadFile(fileId: string) {
  return request.get(`/api/leave/common/file/${fileId}/download`, { responseType: 'blob' })
}