// 操作日志信息
export interface OperationLogInfo {
  id: number
  userId: number
  username: string
  realName?: string
  module: string
  action: string
  description: string
  requestMethod: string
  requestUrl: string
  requestParams?: string
  responseData?: string
  ipAddress: string
  userAgent: string
  location?: string
  duration: number
  status: 'success' | 'failed'
  errorMessage?: string
  createTime: string
}

// 操作日志查询参数
export interface OperationLogQuery {
  keyword?: string
  userId?: number
  module?: string
  action?: string
  status?: 'success' | 'failed'
  startTime?: string
  endTime?: string
  ipAddress?: string
  page?: number
  size?: number
}

// 操作日志列表响应
export interface OperationLogListResponse {
  content: OperationLogInfo[]
  total: number
  page: number
  size: number
  totalPages: number
}

// 操作日志统计信息
export interface OperationLogStatistics {
  totalCount: number
  todayCount: number
  thisWeekCount: number
  thisMonthCount: number
  successCount: number
  failedCount: number
  moduleStatistics: {
    module: string
    count: number
  }[]
  userStatistics: {
    userId: number
    username: string
    count: number
  }[]
}