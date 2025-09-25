// 消息类型枚举
export enum MessageType {
  SYSTEM = 'system',      // 系统消息
  NOTICE = 'notice',      // 通知公告
  PERSONAL = 'personal',  // 个人消息
  WARNING = 'warning',    // 警告消息
  ERROR = 'error'         // 错误消息
}

// 消息状态枚举
export enum MessageStatus {
  DRAFT = 'draft',        // 草稿
  PUBLISHED = 'published', // 已发布
  EXPIRED = 'expired'     // 已过期
}

// 消息优先级枚举
export enum MessagePriority {
  LOW = 'low',           // 低
  NORMAL = 'normal',     // 普通
  HIGH = 'high',         // 高
  URGENT = 'urgent'      // 紧急
}

// 消息信息
export interface MessageInfo {
  id: number
  title: string
  content: string
  type: MessageType
  priority: MessagePriority
  status: MessageStatus
  senderId: number
  senderName: string
  targetType: 'all' | 'department' | 'role' | 'user'
  targetIds?: number[]
  targetNames?: string[]
  readCount: number
  totalCount: number
  publishTime?: string
  expireTime?: string
  createTime: string
  updateTime?: string
  attachments?: MessageAttachment[]
}

// 消息附件
export interface MessageAttachment {
  id: number
  fileName: string
  fileSize: number
  fileType: string
  fileUrl: string
  uploadTime: string
}

// 消息表单数据
export interface MessageFormData {
  title: string
  content: string
  type: MessageType
  priority: MessagePriority
  targetType: 'all' | 'department' | 'role' | 'user'
  targetIds?: number[]
  publishTime?: string
  expireTime?: string
  attachments?: File[]
}

// 消息查询参数
export interface MessageQuery {
  keyword?: string
  type?: MessageType
  priority?: MessagePriority
  status?: MessageStatus
  senderId?: number
  targetType?: string
  startTime?: string
  endTime?: string
  page?: number
  size?: number
}

// 消息列表响应
export interface MessageListResponse {
  content: MessageInfo[]
  total: number
  page: number
  size: number
  totalPages: number
}

// 消息阅读记录
export interface MessageReadRecord {
  id: number
  messageId: number
  userId: number
  username: string
  realName?: string
  readTime: string
  isRead: boolean
}

// 消息统计信息
export interface MessageStatistics {
  totalCount: number
  publishedCount: number
  draftCount: number
  expiredCount: number
  todayCount: number
  thisWeekCount: number
  thisMonthCount: number
  typeStatistics: {
    type: MessageType
    count: number
  }[]
  priorityStatistics: {
    priority: MessagePriority
    count: number
  }[]
}