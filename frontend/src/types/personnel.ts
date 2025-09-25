// 教师信息相关类型定义

// 教师状态枚举
export enum TeacherStatus {
  ACTIVE = 'active',    // 在职
  RESIGNED = 'resigned', // 离职
  RETIRED = 'retired'    // 退休
}

// 职位枚举
export enum Position {
  PRINCIPAL = 'principal',           // 校长
  ACADEMIC_DIRECTOR = 'academic_director', // 教务主任
  GRADE_DIRECTOR = 'grade_director',    // 年级主任
  CLASS_TEACHER = 'class_teacher',      // 班主任
  TEACHER = 'teacher'                   // 普通教师
}

// 教师信息
export interface TeacherInfo {
  teacherId: string          // 工号
  teacherName: string        // 姓名
  gender: 'male' | 'female'  // 性别
  department: string         // 部门
  position: Position         // 职位
  positionName?: string      // 职位名称
  relatedClass?: string      // 关联班级（班主任时）
  relatedGrade?: string      // 关联年级（年级主任时）
  mobile?: string            // 手机号
  email?: string             // 邮箱
  joinDate: string           // 入职日期
  status: TeacherStatus      // 状态
  statusText?: string        // 状态文本
  resignDate?: string        // 离职日期
  remark?: string            // 备注
  createTime?: string        // 创建时间
  updateTime?: string        // 更新时间
}

// 教师表单数据
export interface TeacherFormData {
  teacherName: string
  gender: 'male' | 'female'
  department: string
  position: Position
  relatedClass?: string
  relatedGrade?: string
  mobile?: string
  email?: string
  joinDate: string
  status: TeacherStatus
  resignDate?: string
  remark?: string
}

// 教师筛选参数
export interface TeacherFilterParams {
  keyword?: string           // 关键词（姓名/工号）
  teacherId?: string         // 工号
  department?: string        // 部门
  position?: Position        // 职位
  status?: TeacherStatus     // 状态
  pageNum: number
  pageSize: number
}

// 教师导入数据
export interface TeacherImportData {
  teacherName: string
  gender: string
  department: string
  position: string
  mobile?: string
  email?: string
  joinDate: string
  status: string
}

// 学生信息相关类型定义

// 学生状态枚举
export enum StudentStatus {
  ENROLLED = 'enrolled',      // 在校
  GRADUATED = 'graduated',    // 毕业
  TRANSFERRED = 'transferred', // 转学
  SUSPENDED = 'suspended',     // 休学
  DROPPED = 'dropped'          // 肄业
}

// 学生信息
export interface StudentInfo {
  studentId: string           // 学号
  studentName: string         // 姓名
  gender: 'male' | 'female'   // 性别
  gradeId: string             // 年级ID
  gradeName: string           // 年级名称
  classId: string             // 班级ID
  className: string           // 班级名称
  enrollDate: string          // 入学日期
  status: StudentStatus       // 状态
  statusText?: string         // 状态文本
  suspendReason?: string      // 休学原因
  graduateDate?: string       // 毕业日期
  guardianName?: string       // 主监护人姓名
  guardianPhone?: string      // 主监护人联系方式
  secondaryPhone?: string     // 副联系方式
  remark?: string             // 备注
  createTime?: string         // 创建时间
  updateTime?: string         // 更新时间
}

// 学生表单数据
export interface StudentFormData {
  studentName: string
  gender: 'male' | 'female'
  gradeId: string
  classId: string
  enrollDate: string
  status: StudentStatus
  suspendReason?: string
  guardianName?: string
  guardianPhone?: string
  secondaryPhone?: string
  remark?: string
}

// 学生筛选参数
export interface StudentFilterParams {
  keyword?: string            // 关键词（姓名/学号）
  studentId?: string          // 学号
  gradeId?: string            // 年级ID
  classId?: string            // 班级ID
  status?: StudentStatus      // 状态
  enrollStartDate?: string    // 入学开始日期
  enrollEndDate?: string      // 入学结束日期
  pageNum: number
  pageSize: number
}

// 学生导入数据
export interface StudentImportData {
  studentName: string
  gender: string
  gradeName: string
  className: string
  enrollDate: string
  status: string
  guardianName?: string
  guardianPhone?: string
}

// 批量调整班级参数
export interface BatchAdjustClassParams {
  studentIds: string[]        // 学生ID列表
  targetClassId: string       // 目标班级ID
  reason: string              // 调整原因
}

// 部门信息
export interface Department {
  departmentId: string
  departmentName: string
  departmentCode: string
  description?: string
}

// 统计数据
export interface PersonnelStatistics {
  totalTeachers: number       // 教师总数
  activeTeachers: number      // 在职教师数
  resignedTeachers: number    // 离职教师数
  retiredTeachers: number     // 退休教师数
  totalStudents: number       // 学生总数
  enrolledStudents: number    // 在校学生数
  graduatedStudents: number   // 毕业学生数
  suspendedStudents: number   // 休学学生数
}

// 监护人关系类型
export type GuardianRelation = 'father' | 'mother' | 'grandfather' | 'grandmother' | 'uncle' | 'aunt' | 'other'

// 监护人数据
export interface GuardianInfo {
  guardianId: string
  guardianName: string
  relation: GuardianRelation
  relationOther?: string // 当关系为其他时的具体说明
  idCardNumber: string
  phone: string
  alternatePhone?: string
  email?: string
  occupation?: string
  workplace?: string
  workAddress?: string
  homeAddress: string
  isEmergencyContact: boolean
  isLegalGuardian: boolean // 是否法定监护人
  students?: StudentInfo[] // 关联的学生列表
  createTime: string
  updateTime: string
  remark?: string
}

// 监护人表单数据
export interface GuardianFormData {
  guardianName: string
  relation: GuardianRelation
  relationOther?: string
  idCardNumber: string
  phone: string
  alternatePhone?: string
  email?: string
  occupation?: string
  workplace?: string
  workAddress?: string
  homeAddress: string
  isEmergencyContact: boolean
  isLegalGuardian: boolean
  studentIds?: string[] // 关联的学生ID列表
  remark?: string
}

// 监护人查询参数
export interface GuardianQuery {
  guardianName?: string
  phone?: string
  studentName?: string
  studentId?: string
  gradeId?: string
  classId?: string
  relation?: GuardianRelation
  pageNum: number
  pageSize: number
}

// 监护人统计数据
export interface GuardianStatistics {
  totalCount: number
  fatherCount: number
  motherCount: number
  otherCount: number
  emergencyContactCount: number
  legalGuardianCount: number
}

// 学生-监护人关联
export interface StudentGuardianRelation {
  id: string
  studentId: string
  studentName: string
  guardianId: string
  guardianName: string
  relation: GuardianRelation
  relationOther?: string
  isMain: boolean // 是否主要监护人
  createTime: string
}