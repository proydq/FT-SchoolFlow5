import request from '@/utils/request'
import type {
  MessageInfo,
  MessageFormData,
  MessageQuery,
  MessageListResponse,
  MessageReadRecord,
  MessageStatistics
} from '@/types/message'

/**
 * 获取消息分页列表
 */
export function getMessageList(params: MessageQuery) {
  return request.get<MessageListResponse>('/system/messages', { params })
}

/**
 * 获取消息详情
 */
export function getMessageById(id: number) {
  return request.get<MessageInfo>(`/system/messages/${id}`)
}

/**
 * 创建消息
 */
export function createMessage(data: MessageFormData) {
  return request.post('/system/messages', data)
}

/**
 * 更新消息
 */
export function updateMessage(id: number, data: MessageFormData) {
  return request.put(`/system/messages/${id}`, data)
}

/**
 * 删除消息
 */
export function deleteMessage(id: number) {
  return request.delete(`/system/messages/${id}`)
}

/**
 * 批量删除消息
 */
export function batchDeleteMessages(ids: number[]) {
  return request.delete('/system/messages/batch', { data: ids })
}

/**
 * 发布消息
 */
export function publishMessage(id: number) {
  return request.post(`/system/messages/${id}/publish`)
}

/**
 * 撤回消息
 */
export function withdrawMessage(id: number) {
  return request.post(`/system/messages/${id}/withdraw`)
}

/**
 * 获取消息阅读记录
 */
export function getMessageReadRecords(messageId: number, params?: { page?: number; size?: number }) {
  return request.get<MessageReadRecord[]>(`/system/messages/${messageId}/read-records`, { params })
}

/**
 * 获取消息统计信息
 */
export function getMessageStatistics() {
  return request.get<MessageStatistics>('/system/messages/statistics')
}

/**
 * 导出消息数据
 */
export function exportMessages(params?: MessageQuery) {
  return request.get('/system/messages/export', {
    params,
    responseType: 'blob'
  })
}