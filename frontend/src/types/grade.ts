// 年级信息类型定义

// 年级基础信息
export interface GradeInfo {
  id: string
  gradeName: string        // 年级名称
  gradeLevel: number       // 年级层次 (1-12)
  stage: 'primary' | 'junior' | 'senior' // 学段：小学、初中、高中
  stageText: string        // 学段文本
  classCount: number       // 班级数量
  studentCount: number     // 学生总数
  gradeDirectorId?: string // 年级主任ID
  gradeDirectorName?: string // 年级主任姓名
  sort: number            // 排序
  status: 'active' | 'inactive' // 状态
  remark?: string         // 备注
  createTime: string      // 创建时间
  updateTime: string      // 更新时间
}

// 年级表单数据
export interface GradeFormData {
  gradeName: string
  gradeLevel: number
  stage: 'primary' | 'junior' | 'senior'
  gradeDirectorId?: string
  sort: number
  status: 'active' | 'inactive'
  remark?: string
}

// 年级筛选条件
export interface GradeFilterParams {
  stage?: string
  status?: string
  gradeName?: string
  pageNum: number
  pageSize: number
}

// 年级统计信息
export interface GradeStatistics {
  totalCount: number       // 年级总数
  activeCount: number      // 活跃年级数
  inactiveCount: number    // 非活跃年级数
  stageDistribution: {
    stage: string
    stageName: string
    count: number
    classCount: number
    studentCount: number
  }[]
}

// 年级主任信息
export interface GradeDirector {
  teacherId: string
  teacherName: string
  teacherCode: string
  phone?: string
  email?: string
  currentGrade?: string    // 当前负责年级
  status: 'active' | 'inactive'
}