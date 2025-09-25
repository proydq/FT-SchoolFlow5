// 考勤管理模块类型定义

// 考勤规则类型
export interface AttendanceRule {
  id: string
  ruleName: string
  applicableType: 'teacher' | 'student'
  relatedGrades?: string[]
  checkType: 'work_checkin' | 'work_checkout' | 'lunch_break'
  timeSlots: TimeSlot[]
  allowedDeviation: {
    lateMinutes: number
    earlyMinutes: number
  }
  status: 'active' | 'pending' | 'inactive'
  effectiveDate?: string
  expiryDate?: string
  remark?: string
  createdAt: string
  updatedAt: string
  createdBy: string
}

// 时间段配置
export interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  name?: string
}

// 考勤规则查询参数
export interface AttendanceRuleQuery {
  applicableType?: string
  status?: string
  ruleName?: string
  effectiveDateRange?: [string, string] | null
  pageNum?: number
  pageSize?: number
}

// 考勤记录类型
export interface AttendanceRecord {
  id: string
  userId: string
  userName: string
  userType: 'teacher' | 'student'
  userCode: string // 工号或学号
  department?: string // 部门（教师）
  grade?: string // 年级（学生）
  className?: string // 班级（学生）
  checkDate: string
  checkTime: string
  checkType: 'work_checkin' | 'work_checkout' | 'lunch_break'
  checkMethod: 'face' | 'access_card' | 'manual' | 'parent_sign'
  deviceId?: string
  deviceName?: string
  result: 'normal' | 'late' | 'early' | 'absent' | 'leave_deduction'
  ruleId: string
  ruleName: string
  deviationMinutes?: number
  proof?: string[] // 证明材料
  remark?: string
  createdAt: string
  updatedAt: string
}

// 考勤记录查询参数
export interface AttendanceRecordQuery {
  userType?: string
  organizationId?: string
  dateRange?: [string, string] | null
  checkMethod?: string
  result?: string
  userName?: string
  userCode?: string
  deviceId?: string
  pageNum?: number
  pageSize?: number
}

// 手动录入打卡记录
export interface ManualCheckRecord {
  userType: 'teacher' | 'student'
  userId: string
  checkDate: string
  checkType: string
  checkTime: string
  checkMethod: 'manual' | 'parent_sign'
  proof?: File[]
  remark?: string
}

// 考勤异常类型
export interface AttendanceException {
  id: string
  userId: string
  userName: string
  userType: 'teacher' | 'student'
  userCode: string
  department?: string
  grade?: string
  className?: string
  exceptionDate: string
  exceptionType: 'missing_check' | 'late' | 'early' | 'device_error'
  timeSlot: string
  originalResult: string
  processingStatus: 'pending' | 'processed' | 'rejected'
  processingMethod?: 'supplement' | 'remark_only' | 'correct_to_normal' | 'keep_original' | 'resync_device' | 'manual_record'
  supplementTime?: string
  proof?: string[]
  processingRemark?: string
  processingBy?: string
  processingAt?: string
  createdAt: string
}

// 考勤异常查询参数
export interface AttendanceExceptionQuery {
  userType?: string
  exceptionType?: string
  processingStatus?: string
  dateRange?: [string, string] | null
  pageNum?: number
  pageSize?: number
}

// 考勤异常处理
export interface AttendanceExceptionProcess {
  exceptionId: string
  processingMethod: string
  supplementTime?: string
  proof?: File[]
  processingRemark: string
}

// 考勤统计数据
export interface AttendanceStatistics {
  totalCheckCount: number
  actualCheckCount: number
  normalCount: number
  lateCount: number
  earlyCount: number
  absentCount: number
  leaveDeductionCount: number
  normalRate: number
  exceptionRate: number
  lateRate: number
  earlyRate: number
  absentRate: number
}

// 考勤统计查询参数
export interface AttendanceStatisticsQuery {
  dimension: 'personal' | 'class' | 'grade' | 'school' | 'day' | 'week' | 'month' | 'quarter'
  userType?: 'teacher' | 'student'
  period?: 'day' | 'week' | 'month' | 'semester'
  dateRange?: [string, string] | null
  attendanceStartDate?: string
  attendanceEndDate?: string
  organizationId?: string
  organizationPath?: string[]
}

// 考勤报表数据
export interface AttendanceReportData {
  dimension: string
  name: string
  totalCheck: number
  actualCheck: number
  normalRate: number
  exceptionRate: number
  details?: AttendanceRecord[]
}

// 设备同步结果
export interface DeviceSyncResult {
  success: boolean
  syncCount: number
  exceptionCount: number
  deviceErrors: string[]
  message: string
}

// 补签申请
export interface SupplementRequest {
  userId: string
  exceptionDate: string
  timeSlot: string
  supplementTime: string
  reason: string
  proof?: File[]
  applicantType: 'student' | 'teacher'
}

// 批量操作参数
export interface BatchOperation {
  ids: string[]
  operation: 'activate' | 'deactivate' | 'delete' | 'export' | 'mark_exception'
  params?: Record<string, any>
}