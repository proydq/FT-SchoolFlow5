import request from '@/utils/request'
import type {
  AttendanceRule,
  AttendanceRuleQuery,
  AttendanceRecord,
  AttendanceRecordQuery,
  ManualCheckRecord,
  AttendanceException,
  AttendanceExceptionQuery,
  AttendanceExceptionProcess,
  AttendanceStatistics,
  AttendanceStatisticsQuery,
  AttendanceReportData,
  DeviceSyncResult,
  SupplementRequest,
  BatchOperation
} from '@/types/attendance'

// 考勤规则相关API
export const getAttendanceRules = (params: AttendanceRuleQuery) => {
  return request.get('/api/attendance/rules', { params })
}

export const getAttendanceRule = (id: string) => {
  return request.get(`/api/attendance/rules/${id}`)
}

export const createAttendanceRule = (data: Partial<AttendanceRule>) => {
  return request.post('/api/attendance/rules', data)
}

export const updateAttendanceRule = (id: string, data: Partial<AttendanceRule>) => {
  return request.put(`/api/attendance/rules/${id}`, data)
}

export const deleteAttendanceRule = (id: string) => {
  return request.delete(`/api/attendance/rules/${id}`)
}

export const batchUpdateRuleStatus = (data: BatchOperation) => {
  return request.post('/api/attendance/rules/batch-status', data)
}

export const exportAttendanceRules = (params: AttendanceRuleQuery) => {
  return request.get('/api/attendance/rules/export', {
    params,
    responseType: 'blob'
  })
}

export const getRuleApplicationDetail = (id: string) => {
  return request.get(`/api/attendance/rules/${id}/application`)
}

// 考勤记录相关API
export const getAttendanceRecords = (params: AttendanceRecordQuery) => {
  return request.get('/api/attendance/records', { params })
}

export const getAttendanceRecord = (id: string) => {
  return request.get(`/api/attendance/records/${id}`)
}

export const manualCheckRecord = (data: ManualCheckRecord) => {
  const formData = new FormData()
  Object.keys(data).forEach(key => {
    if (key === 'proof' && data.proof) {
      data.proof.forEach(file => formData.append('proof', file))
    } else {
      formData.append(key, (data as any)[key])
    }
  })
  return request.post('/api/attendance/records/manual', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const syncDeviceRecords = () => {
  return request.post('/api/attendance/records/sync')
}

export const exportAttendanceRecords = (data: BatchOperation) => {
  return request.post('/api/attendance/records/export', data, {
    responseType: 'blob'
  })
}

export const markRecordsAsException = (data: BatchOperation) => {
  return request.post('/api/attendance/records/mark-exception', data)
}

export const updateAttendanceRecord = (id: string, data: Partial<AttendanceRecord>) => {
  return request.put(`/api/attendance/records/${id}`, data)
}

// 考勤异常处理相关API
export const getAttendanceExceptions = (params: AttendanceExceptionQuery) => {
  return request.get('/api/attendance/exceptions', { params })
}

export const getAttendanceException = (id: string) => {
  return request.get(`/api/attendance/exceptions/${id}`)
}

export const processAttendanceException = (data: AttendanceExceptionProcess) => {
  const formData = new FormData()
  Object.keys(data).forEach(key => {
    if (key === 'proof' && data.proof) {
      data.proof.forEach(file => formData.append('proof', file))
    } else {
      formData.append(key, (data as any)[key])
    }
  })
  return request.post('/api/attendance/exceptions/process', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const getExceptionProcessHistory = (id: string) => {
  return request.get(`/api/attendance/exceptions/${id}/history`)
}

export const submitSupplementRequest = (data: SupplementRequest) => {
  const formData = new FormData()
  Object.keys(data).forEach(key => {
    if (key === 'proof' && data.proof) {
      data.proof.forEach(file => formData.append('proof', file))
    } else {
      formData.append(key, (data as any)[key])
    }
  })
  return request.post('/api/attendance/supplement-request', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 考勤统计分析相关API
export const getAttendanceStatistics = (params: AttendanceStatisticsQuery) => {
  return request.get('/api/attendance/statistics', { params })
}

export const getAttendanceReportData = (params: AttendanceStatisticsQuery) => {
  return request.get('/api/attendance/reports', { params })
}

export const exportAttendanceReport = (params: AttendanceStatisticsQuery) => {
  return request.get('/api/attendance/reports/export', {
    params,
    responseType: 'blob'
  })
}

export const getAttendanceTrendData = (params: AttendanceStatisticsQuery) => {
  return request.get('/api/attendance/trend', { params })
}

export const getAttendanceDistributionData = (params: AttendanceStatisticsQuery) => {
  return request.get('/api/attendance/distribution', { params })
}

// 设备管理相关API
export const getDeviceStatus = () => {
  return request.get('/api/attendance/devices/status')
}

export const triggerDeviceSync = (deviceId?: string) => {
  return request.post('/api/attendance/devices/sync', { deviceId })
}

// 年级班级信息相关API
export const getGradeList = () => {
  return request.get('/api/system/grades')
}

export const getClassList = (gradeId?: string) => {
  return request.get('/api/system/classes', {
    params: gradeId ? { gradeId } : undefined
  })
}

export const getDepartmentList = () => {
  return request.get('/api/system/departments')
}

// 用户信息相关API
export const searchUsers = (params: {
  userType: 'teacher' | 'student'
  keyword: string
  organizationId?: string
}) => {
  return request.get('/api/system/users/search', { params })
}