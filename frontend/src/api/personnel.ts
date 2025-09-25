import request from '@/utils/request'
import type {
  TeacherInfo,
  TeacherFormData,
  TeacherFilterParams,
  TeacherImportData,
  StudentInfo,
  StudentFormData,
  StudentFilterParams,
  StudentImportData,
  BatchAdjustClassParams,
  Department,
  PersonnelStatistics,
  GuardianInfo,
  GuardianFormData,
  GuardianQuery,
  GuardianStatistics,
  GuardianRelation,
  StudentGuardianRelation
} from '@/types/personnel'

// 教师信息管理 API

// 获取教师列表
export const getTeacherList = (params: TeacherFilterParams) => {
  return request.get<{ list: TeacherInfo[], total: number }>('/api/teacher/list', { params })
}

// 获取教师详情
export const getTeacherDetail = (teacherId: string) => {
  return request.get<TeacherInfo>(`/api/teacher/detail/${teacherId}`)
}

// 新增教师
export const addTeacher = (data: TeacherFormData) => {
  return request.post('/api/teacher/add', data)
}

// 更新教师信息
export const updateTeacher = (teacherId: string, data: TeacherFormData) => {
  return request.put(`/api/teacher/update/${teacherId}`, data)
}

// 批量删除教师
export const deleteTeachers = (teacherIds: string[]) => {
  return request.delete('/api/teacher/delete', { teacherIds })
}

// 导出教师数据
export const exportTeachers = (params: TeacherFilterParams) => {
  return request.get('/api/teacher/export', { params, responseType: 'blob' })
}

// 下载教师导入模板
export const downloadTeacherTemplate = () => {
  return request.get('/api/teacher/template', { responseType: 'blob' })
}

// 批量导入教师
export const importTeachers = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<{
    success: number,
    failed: number,
    errors: Array<{ row: number, message: string }>
  }>('/api/teacher/import', formData)
}

// 检查工号是否存在
export const checkTeacherId = (teacherId: string) => {
  return request.get<{ exists: boolean }>('/api/teacher/check-id', { params: { teacherId } })
}

// 获取可用的班级列表（用于班主任关联）
export const getAvailableClasses = () => {
  return request.get<Array<{ classId: string, className: string }>>('/api/teacher/available-classes')
}

// 获取部门列表
export const getDepartmentList = () => {
  return request.get('/api/department/list')
}

// 学生信息管理 API

// 获取学生列表
export const getStudentList = (params: StudentFilterParams) => {
  return request.get<{ list: StudentInfo[], total: number }>('/api/student/list', { params })
}

// 获取学生详情
export const getStudentDetail = (studentId: string) => {
  return request.get<StudentInfo>(`/api/student/detail/${studentId}`)
}

// 新增学生
export const addStudent = (data: StudentFormData) => {
  return request.post('/api/student/add', data)
}

// 更新学生信息
export const updateStudent = (studentId: string, data: StudentFormData) => {
  return request.put(`/api/student/update/${studentId}`, data)
}

// 批量删除学生
export const deleteStudents = (studentIds: string[]) => {
  return request.delete('/api/student/delete', { studentIds })
}

// 批量调整班级
export const batchAdjustClass = (data: BatchAdjustClassParams) => {
  return request.post('/api/student/batch-adjust-class', data)
}

// 导出学生数据
export const exportStudents = (params: StudentFilterParams) => {
  return request.get('/api/student/export', { params, responseType: 'blob' })
}

// 下载学生导入模板
export const downloadStudentTemplate = () => {
  return request.get('/api/student/template', { responseType: 'blob' })
}

// 批量导入学生
export const importStudents = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<{
    success: number,
    failed: number,
    errors: Array<{ row: number, message: string }>
  }>('/api/student/import', formData)
}

// 检查学号是否存在
export const checkStudentId = (studentId: string) => {
  return request.get<{ exists: boolean }>('/api/student/check-id', { params: { studentId } })
}

// 生成学号
export const generateStudentId = (gradeId: string, classId: string) => {
  return request.get<{ studentId: string }>('/api/student/generate-id', { params: { gradeId, classId } })
}

// 获取年级班级级联数据
export const getGradeClassCascade = () => {
  return request.get('/api/student/grade-class-cascade')
}

// 学生状态调整申请（班主任发起）
export const submitStatusAdjustRequest = (studentId: string, data: {
  targetStatus: string,
  reason: string
}) => {
  return request.post(`/api/student/status-adjust/${studentId}`, data)
}

// 获取人员统计数据
export const getPersonnelStatistics = () => {
  return request.get<PersonnelStatistics>('/api/personnel/statistics')
}

// 获取教师职位统计
export const getTeacherPositionStats = () => {
  return request.get<Array<{ position: string, count: number }>>('/api/teacher/position-stats')
}

// 获取学生年级分布统计
export const getStudentGradeStats = () => {
  return request.get<Array<{ gradeName: string, count: number }>>('/api/student/grade-stats')
}

// ============ 监护人管理相关接口 ============

// 获取监护人列表
export const getGuardianList = (params: GuardianQuery) => {
  return request.get<{ list: GuardianInfo[], total: number }>('/api/guardian/list', { params })
}

// 获取监护人详情
export const getGuardianDetail = (guardianId: string) => {
  return request.get<GuardianInfo>(`/api/guardian/detail/${guardianId}`)
}

// 新增监护人
export const addGuardian = (data: GuardianFormData) => {
  return request.post('/api/guardian/add', data)
}

// 更新监护人信息
export const updateGuardian = (guardianId: string, data: GuardianFormData) => {
  return request.put(`/api/guardian/update/${guardianId}`, data)
}

// 删除监护人
export const deleteGuardian = (guardianId: string) => {
  return request.delete(`/api/guardian/delete/${guardianId}`)
}

// 批量删除监护人
export const batchDeleteGuardian = (guardianIds: string[]) => {
  return request.post('/api/guardian/batch-delete', { guardianIds })
}

// 检查身份证号是否存在
export const checkIdCardNumber = (idCardNumber: string) => {
  return request.get<{ exists: boolean }>('/api/guardian/check-idcard', { params: { idCardNumber } })
}

// 获取学生的监护人列表
export const getStudentGuardians = (studentId: string) => {
  return request.get<GuardianInfo[]>(`/api/guardian/student/${studentId}`)
}

// 获取监护人关联的学生列表
export const getGuardianStudents = (guardianId: string) => {
  return request.get<StudentInfo[]>(`/api/guardian/students/${guardianId}`)
}

// 关联学生和监护人
export const bindStudentGuardian = (data: {
  studentId: string
  guardianId: string
  relation: GuardianRelation
  relationOther?: string
  isMain: boolean
}) => {
  return request.post('/api/guardian/bind-student', data)
}

// 解除学生和监护人关联
export const unbindStudentGuardian = (studentId: string, guardianId: string) => {
  return request.post('/api/guardian/unbind-student', {
    studentId,
    guardianId
  })
}

// 批量关联学生和监护人
export const batchBindStudentGuardian = (data: {
  guardianId: string
  studentIds: string[]
  relation: GuardianRelation
  relationOther?: string
}) => {
  return request.post('/api/guardian/batch-bind', data)
}

// 设置主要监护人
export const setMainGuardian = (studentId: string, guardianId: string) => {
  return request.post('/api/guardian/set-main', {
    studentId,
    guardianId
  })
}

// 导入监护人数据
export const importGuardianData = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<{
    success: number,
    failed: number,
    errors: Array<{ row: number, message: string }>
  }>('/api/guardian/import', formData)
}

// 导出监护人数据
export const exportGuardianData = (params: GuardianQuery) => {
  return request.get('/api/guardian/export', { params, responseType: 'blob' })
}

// 获取监护人统计数据
export const getGuardianStatistics = () => {
  return request.get<GuardianStatistics>('/api/guardian/statistics')
}

// 搜索监护人（用于下拉选择）
export const searchGuardians = (keyword: string) => {
  return request.get<GuardianInfo[]>('/api/guardian/search', { params: { keyword } })
}

// 获取学生-监护人关联记录
export const getStudentGuardianRelations = (studentId?: string, guardianId?: string) => {
  return request.get<StudentGuardianRelation[]>('/api/guardian/relations', { params: { studentId, guardianId } })
}