// 班级信息管理API

import request from '@/utils/request'
import type {
  ClassInfo,
  ClassFormData,
  ClassFilterParams,
  ClassImportData,
  ClassStatistics,
  ClassTeacher
} from '@/types/class'

// 获取班级列表
export function getClassList(params: ClassFilterParams) {
  return request.get('/api/class/list', { params })
}

// 获取班级详情
export function getClassDetail(id: string) {
  return request.get(`/api/class/detail/${id}`)
}

// 新增班级
export function addClass(data: ClassFormData) {
  return request.post('/api/class/add', data)
}

// 更新班级
export function updateClass(id: string, data: ClassFormData) {
  return request.put(`/api/class/update/${id}`, data)
}

// 删除班级
export function deleteClass(id: string) {
  return request.delete(`/api/class/delete/${id}`)
}

// 批量删除班级
export function batchDeleteClass(ids: string[]) {
  return request.delete('/api/class/batch-delete', { data: { ids } })
}

// 调整班级状态
export function updateClassStatus(id: string, status: string, reason: string) {
  return request.put(`/api/class/status/${id}`, { status, reason })
}

// 批量调整班主任
export function batchUpdateTeacher(classIds: string[], teacherId: string, reason: string) {
  return request.put('/api/class/batch-update-teacher', { classIds, teacherId, reason })
}

// 获取年级列表（用于下拉选择）
export function getGradeList() {
  return request.get('/api/grade/list')
}

// 获取可选班主任列表
export function getAvailableTeachers(gradeId?: string) {
  return request.get('/api/teacher/available', { params: { gradeId } })
}

// 下载导入模板
export function downloadTemplate() {
  return request.get('/api/class/template', { responseType: 'blob' })
}

// 批量导入班级
export function importClasses(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/api/class/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 导出班级列表
export function exportClasses(params: ClassFilterParams) {
  return request.get('/api/class/export', { params, responseType: 'blob' })
}

// 获取班级统计信息
export function getClassStatistics() {
  return request.get('/api/class/statistics')
}

// 更换班主任
export function changeClassTeacher(classId: string, newTeacherId: string, reason: string) {
  return request.put(`/api/class/change-teacher/${classId}`, { newTeacherId, reason })
}

// 解除班主任关联
export function removeClassTeacher(classId: string, reason: string) {
  return request.put(`/api/class/remove-teacher/${classId}`, { reason })
}

// 获取班级学生列表
export function getClassStudents(classId: string) {
  return request.get(`/api/class/students/${classId}`)
}

// 调整班级排序
export function updateClassSort(classId: string, sort: number) {
  return request.put(`/api/class/sort/${classId}`, { sort })
}