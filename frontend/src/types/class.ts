// 班级信息类型定义

// 班级状态枚举
export enum ClassStatus {
  NORMAL = 'normal',        // 正常
  SPLITTING = 'splitting',  // 拆分中
  MERGED = 'merged'        // 已合并
}

// 班级基础信息
export interface ClassInfo {
  id: string
  className: string        // 班级名称
  gradeId: string         // 所属年级ID
  gradeName: string       // 所属年级名称
  location?: string       // 班级位置
  sort: number           // 排序
  status: ClassStatus    // 班级状态
  studentCount: number   // 学生数
  teacherId?: string     // 班主任ID
  teacherName?: string   // 班主任姓名
  teacherCode?: string   // 班主任工号
  remark?: string        // 备注
  createTime: string     // 创建时间
  updateTime: string     // 更新时间
}

// 班级表单数据
export interface ClassFormData {
  className: string
  gradeId: string
  location?: string
  sort: number
  status: ClassStatus
  teacherId?: string
  remark?: string
  statusChangeReason?: string  // 状态变更原因
}

// 班主任信息
export interface ClassTeacher {
  teacherId: string
  teacherName: string
  teacherCode: string
  phone?: string
  associatedClasses?: string[]  // 关联的班级
  status: 'active' | 'inactive'  // 在职状态
}

// 批量导入数据
export interface ClassImportData {
  className: string
  gradeName: string
  location?: string
  sort: number
  status: string
  teacherName?: string
  teacherCode?: string
  remark?: string
}

// 班级筛选条件
export interface ClassFilterParams {
  gradeId?: string
  status?: ClassStatus
  className?: string
  teacherId?: string
  pageNum: number
  pageSize: number
}

// 班级统计信息
export interface ClassStatistics {
  totalCount: number      // 班级总数
  normalCount: number     // 正常状态数
  splittingCount: number  // 拆分中数
  mergedCount: number     // 已合并数
  gradeDistribution: {
    gradeId: string
    gradeName: string
    classCount: number
  }[]
}