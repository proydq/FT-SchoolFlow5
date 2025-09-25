import request from '@/utils/request'

// 分页查询日志
export function getLogList(params) {
  return request({
    url: '/logs',
    method: 'get',
    params: {
      page: params.page || 1,
      size: params.size || 10,
      logType: params.logType,
      status: params.status,
      username: params.username,
      ip: params.ip,
      startTime: params.startTime,
      endTime: params.endTime,
      sortBy: params.sortBy || 'createTime',
      sortDir: params.sortDir || 'desc'
    }
  })
}

// 获取日志详情
export function getLogDetail(id) {
  return request({
    url: `/logs/${id}`,
    method: 'get'
  })
}

// 获取日志统计信息
export function getLogStatistics(params) {
  return request({
    url: '/logs/statistics',
    method: 'get',
    params: {
      startTime: params?.startTime,
      endTime: params?.endTime
    }
  })
}

// 获取日志类型分布
export function getLogTypeDistribution(params) {
  return request({
    url: '/logs/analysis/type-distribution',
    method: 'get',
    params: {
      startTime: params?.startTime,
      endTime: params?.endTime
    }
  })
}

// 获取操作状态分布
export function getStatusDistribution(params) {
  return request({
    url: '/logs/analysis/status-distribution',
    method: 'get',
    params: {
      startTime: params?.startTime,
      endTime: params?.endTime
    }
  })
}

// 获取用户操作排行
export function getUserRanking(params) {
  return request({
    url: '/logs/analysis/user-ranking',
    method: 'get',
    params: {
      startTime: params?.startTime,
      endTime: params?.endTime
    }
  })
}

// 获取每日操作数量
export function getDailyCount(params) {
  return request({
    url: '/logs/analysis/daily-count',
    method: 'get',
    params: {
      startTime: params?.startTime,
      endTime: params?.endTime
    }
  })
}

// 删除日志
export function deleteLog(id) {
  return request({
    url: `/logs/${id}`,
    method: 'delete'
  })
}

// 批量删除日志
export function deleteLogs(ids) {
  return request({
    url: '/logs/batch',
    method: 'delete',
    data: ids
  })
}

// 清理过期日志
export function cleanLogs(daysToKeep = 90) {
  return request({
    url: '/logs/clean',
    method: 'post',
    params: { daysToKeep }
  })
}

// 导出日志
export function exportLogs(params) {
  return request({
    url: '/logs/export',
    method: 'get',
    params: {
      logType: params.logType,
      status: params.status,
      username: params.username,
      ip: params.ip,
      startTime: params.startTime,
      endTime: params.endTime,
      format: params.format || 'csv'
    },
    responseType: 'blob'
  })
}