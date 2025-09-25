// 年级信息管理API

import request from '@/utils/request'
import type {
  GradeInfo,
  GradeFormData,
  GradeFilterParams,
  GradeStatistics,
  GradeDirector
} from '@/types/grade'

// 获取年级列表
export function getGradeList(params: GradeFilterParams) {
  return request.get('/api/grade/list', { params })
}

// 获取年级详情
export function getGradeDetail(id: string) {
  return request.get(`/api/grade/detail/${id}`)
}

// 新增年级
export function addGrade(data: GradeFormData) {
  return request.post('/api/grade/add', data)
}

// 更新年级
export function updateGrade(id: string, data: GradeFormData) {
  return request.put(`/api/grade/update/${id}`, data)
}

// 删除年级
export function deleteGrade(id: string) {
  return request.delete(`/api/grade/delete/${id}`)
}

// 批量删除年级
export function batchDeleteGrade(ids: string[]) {
  return request.delete('/api/grade/batch-delete', { data: { ids } })
}

// 调整年级状态
export function updateGradeStatus(id: string, status: string, reason: string) {
  return request.put(`/api/grade/status/${id}`, { status, reason })
}

// 分配年级主任
export function assignGradeDirector(gradeId: string, teacherId: string, reason: string) {
  return request.put(`/api/grade/assign-director/${gradeId}`, { teacherId, reason })
}

// 解除年级主任
export function removeGradeDirector(gradeId: string, reason: string) {
  return request.put(`/api/grade/remove-director/${gradeId}`, { reason })
}

// 获取可选年级主任列表
export function getAvailableDirectors() {
  return request.get('/api/teacher/available-directors')
}

// 获取年级统计信息
export function getGradeStatistics() {
  return request.get('/api/grade/statistics')
}

// 调整年级排序
export function updateGradeSort(gradeId: string, sort: number) {
  return request.put(`/api/grade/sort/${gradeId}`, { sort })
}

// 获取年级班级列表
export function getGradeClasses(gradeId: string) {
  return request.get(`/api/grade/classes/${gradeId}`)
}

// 导出年级数据
export function exportGrades(params: GradeFilterParams) {
  return request.get('/api/grade/export', { params, responseType: 'blob' })
}