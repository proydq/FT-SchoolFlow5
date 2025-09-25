// 请假管理模块类型定义

// 请假类型相关类型
export interface LeaveTypeInfo {
  id: string
  typeName: string // 类型名称，格式：[人员类型][请假类型]
  applicablePersonType: 'teacher' | 'student' // 适用人员类型
  description?: string // 类型描述
  maxDuration: number // 最长时长（数值）
  durationUnit: 'day' | 'hour' // 时长单位
  requiresProof: boolean // 是否需要证明
  proofMaterialType?: string // 证明材料类型
  status: 'active' | 'inactive' // 类型状态
  remark?: string // 备注
  createTime: string
  updateTime: string
}

// 请假类型表单数据
export interface LeaveTypeFormData {
  typeName: string
  applicablePersonType: 'teacher' | 'student'
  description?: string
  maxDuration: number
  durationUnit: 'day' | 'hour'
  requiresProof: boolean
  proofMaterialType?: string
  status: 'active' | 'inactive'
  remark?: string
}

// 请假申请相关类型
export interface LeaveApplicationInfo {
  id: string
  applicationId: string // 申请编号，如 LEAVE202409001
  applicantId: string // 申请人ID
  applicantName: string // 申请人姓名
  applicantType: 'teacher' | 'student' // 申请人类型
  applicantCode: string // 工号/学号
  department?: string // 部门（教师）
  gradeName?: string // 年级（学生）
  className?: string // 班级（学生）
  classTeacher?: string // 班主任（学生）
  leaveTypeId: string // 请假类型ID
  leaveTypeName: string // 请假类型名称
  startTime: string // 请假开始时间
  endTime: string // 请假结束时间
  duration: number // 请假时长
  durationUnit: 'day' | 'hour' // 时长单位
  reason: string // 请假原因
  proofMaterials?: FileInfo[] // 证明材料
  workHandover?: string // 工作交接（教师）
  parentConfirmed?: boolean // 家长知情确认（学生）
  status: LeaveApplicationStatus // 申请状态
  currentApprovalLevel: number // 当前审批环节
  currentApprover?: string // 当前审批人
  approvalHistory: ApprovalRecord[] // 审批历史
  createTime: string
  updateTime: string
}

// 请假申请状态
export type LeaveApplicationStatus =
  | 'draft' // 草稿
  | 'pending' // 待审批
  | 'in_review' // 审批中
  | 'approved' // 已通过
  | 'rejected' // 已驳回
  | 'withdrawn' // 已撤回

// 请假申请表单数据
export interface LeaveApplicationFormData {
  leaveTypeId: string
  startTime: string
  endTime: string
  reason: string
  proofMaterials?: File[]
  workHandover?: string
  parentConfirmed?: boolean
}

// 审批记录
export interface ApprovalRecord {
  id: string
  applicationId: string
  approverLevel: number // 审批层级
  approverId: string // 审批人ID
  approverName: string // 审批人姓名
  approverRole: string // 审批人角色
  action: 'approve' | 'reject' // 审批动作
  opinion: string // 审批意见
  attachments?: FileInfo[] // 附件
  approvalTime: string
}

// 审批表单数据
export interface ApprovalFormData {
  action: 'approve' | 'reject'
  opinion: string
  attachments?: File[]
}

// 文件信息
export interface FileInfo {
  id: string
  fileName: string
  fileSize: number
  fileType: string
  filePath: string
  uploadTime: string
}

// 请假统计信息
export interface LeaveStatistics {
  totalApplications: number // 总申请数
  pendingApplications: number // 待审批数
  approvedApplications: number // 已通过数
  rejectedApplications: number // 已驳回数
  typeStatistics: TypeStatistics[] // 按类型统计
  monthlyStatistics: MonthlyStatistics[] // 按月统计
}

// 按类型统计
export interface TypeStatistics {
  typeId: string
  typeName: string
  count: number
  percentage: number
}

// 按月统计
export interface MonthlyStatistics {
  month: string
  count: number
  teacherCount: number
  studentCount: number
}

// 查询参数
export interface LeaveTypeListQuery {
  applicablePersonType?: 'teacher' | 'student' | 'all'
  status?: 'active' | 'inactive' | 'all'
  typeName?: string // 类型名称搜索
  maxDurationRange?: [number, number] // 最长时长范围
  pageNum: number
  pageSize: number
}

export interface LeaveApplicationListQuery {
  applicantType: 'teacher' | 'student'
  organizationId?: string // 部门ID/年级ID
  applicationDateRange?: [string, string] // 申请日期范围
  leaveTypeId?: string
  status?: LeaveApplicationStatus | 'all'
  applicantKeyword?: string // 申请人搜索（姓名/工号/学号）
  approverId?: string // 审批人筛选
  pageNum: number
  pageSize: number
}

export interface LeaveRecordQuery {
  applicantType: 'teacher' | 'student'
  organizationId?: string
  applicationDateRange?: [string, string]
  leaveTypeId?: string
  status?: LeaveApplicationStatus | 'all'
  applicantKeyword?: string
  pageNum: number
  pageSize: number
}

// 批量操作
export interface BatchApprovalData {
  applicationIds: string[]
  action: 'approve' | 'reject'
  opinion: string
}

export interface BatchWithdrawData {
  applicationIds: string[]
  reason: string
}

export interface BatchExportQuery {
  format: 'excel' | 'pdf'
  includeFields: string[] // 包含字段
  query: LeaveRecordQuery
}

// API 响应类型
export interface LeaveTypeListResponse {
  list: LeaveTypeInfo[]
  total: number
}

export interface LeaveApplicationListResponse {
  list: LeaveApplicationInfo[]
  total: number
}

export interface ApprovalListResponse {
  pending: LeaveApplicationInfo[] // 待我审批
  processed: LeaveApplicationInfo[] // 我已审批
}