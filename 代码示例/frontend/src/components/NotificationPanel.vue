<template>
  <el-popover
    placement="bottom-end"
    :width="380"
    trigger="click"
    popper-class="notification-popover"
    :visible="visible"
    @update:visible="updateVisible"
  >
    <template #reference>
      <div class="notification-wrapper">
        <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="notification-badge">
          <el-button type="text" class="notification-btn">
            <el-icon size="18" :class="['notification-icon', { 'breathing': unreadCount > 0 }]">
              <Bell />
            </el-icon>
          </el-button>
        </el-badge>
      </div>
    </template>

    <!-- 通知面板内容 -->
    <div class="notification-panel">
      <!-- 头部 -->
      <div class="panel-header">
        <div class="header-title">
          <span class="title-text">消息通知</span>
          <el-badge :value="unreadCount" type="danger" v-if="unreadCount > 0" />
        </div>
        <div class="header-actions">
          <el-button link size="small" @click="markAllAsRead" :disabled="unreadCount === 0">
            <el-icon><Check /></el-icon>
            全部已读
          </el-button>
          <el-button link size="small" @click="clearAll" :disabled="notifications.length === 0">
            <el-icon><Delete /></el-icon>
            清空
          </el-button>
        </div>
      </div>

      <!-- 标签页 -->
      <div class="panel-tabs">
        <el-segmented v-model="activeTab" :options="tabOptions" size="small" />
      </div>

      <!-- 通知列表 -->
      <div class="notification-list" v-loading="loading">
        <el-scrollbar height="400px" v-if="filteredNotifications.length > 0">
          <TransitionGroup name="notification-item" tag="div">
            <div
              v-for="item in filteredNotifications"
              :key="item.id"
              class="notification-item"
              :class="{ 'is-unread': !item.read }"
              @click="handleNotificationClick(item)"
            >
              <!-- 左侧图标 -->
              <div class="item-icon" :class="`icon-${item.type}`">
                <el-icon :size="20">
                  <component :is="getIconByType(item.type)" />
                </el-icon>
              </div>

              <!-- 内容区域 -->
              <div class="item-content">
                <div class="content-header">
                  <span class="content-title">{{ item.title }}</span>
                  <el-tag size="small" :type="getTagType(item.priority)" v-if="item.priority === 'urgent'">
                    紧急
                  </el-tag>
                </div>
                <div class="content-body">{{ item.content }}</div>
                <div class="content-footer">
                  <span class="footer-time">
                    <el-icon size="12"><Clock /></el-icon>
                    {{ formatTime(item.time) }}
                  </span>
                  <span class="footer-source" v-if="item.source">
                    来自 {{ item.source }}
                  </span>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="item-actions">
                <el-tooltip content="标记已读" v-if="!item.read">
                  <el-button
                    link
                    size="small"
                    @click.stop="markAsRead(item.id)"
                  >
                    <el-icon><Check /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="删除">
                  <el-button
                    link
                    size="small"
                    @click.stop="deleteNotification(item.id)"
                  >
                    <el-icon><Close /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </div>
          </TransitionGroup>
        </el-scrollbar>

        <!-- 空状态 -->
        <el-empty
          v-else
          description="暂无通知消息"
          :image-size="100"
        >
          <template #image>
            <el-icon :size="60" color="#C0C4CC">
              <Bell />
            </el-icon>
          </template>
        </el-empty>
      </div>

      <!-- 底部 -->
      <div class="panel-footer">
        <el-button link @click="viewAll">
          查看全部消息
          <el-icon class="el-icon--right"><ArrowRight /></el-icon>
        </el-button>
      </div>
    </div>
  </el-popover>

  <!-- 消息详情对话框 -->
  <MessageDetailDialog 
    v-model:visible="detailDialogVisible"
    :message="currentMessage"
    @refresh="updateCount"
  />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import MessageDetailDialog from '@/components/MessageDetailDialog.vue'
import { 
  Bell, Check, Delete, Close, Clock, ArrowRight,
  Message, SuccessFilled, WarningFilled, CircleCloseFilled,
  Promotion, TrendCharts, User, Setting
} from '@element-plus/icons-vue'

const router = useRouter()

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:visible', 'update:count'])

// 响应式数据
const loading = ref(false)
const activeTab = ref('all')
const detailDialogVisible = ref(false)
const currentMessage = ref(null)
const notifications = ref([
  {
    id: 1,
    type: 'success',
    title: '营销活动执行成功',
    content: '春季新品推广活动已成功发送给500位目标客户',
    time: new Date(Date.now() - 1000 * 60 * 5),
    read: false,
    priority: 'normal',
    source: '营销系统'
  },
  {
    id: 2,
    type: 'warning',
    title: '邮件配额即将用完',
    content: '本月邮件发送配额已使用90%，请及时充值或升级套餐',
    time: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
    priority: 'urgent',
    source: '系统监控'
  },
  {
    id: 3,
    type: 'info',
    title: 'AI内容生成完成',
    content: '您请求的10篇营销邮件内容已生成完成，请查看',
    time: new Date(Date.now() - 1000 * 60 * 60),
    read: true,
    priority: 'normal',
    source: 'AI助手'
  },
  {
    id: 4,
    type: 'error',
    title: '数据导入失败',
    content: '客户数据导入失败，有15条数据格式错误，请检查后重试',
    time: new Date(Date.now() - 1000 * 60 * 120),
    read: false,
    priority: 'high',
    source: '数据中心'
  },
  {
    id: 5,
    type: 'campaign',
    title: '新的营销活动待审批',
    content: '张三创建的"黑五促销活动"需要您的审批',
    time: new Date(Date.now() - 1000 * 60 * 180),
    read: true,
    priority: 'normal',
    source: '工作流'
  },
  {
    id: 6,
    type: 'report',
    title: '周报已生成',
    content: '本周营销数据报表已生成，整体转化率提升15%',
    time: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true,
    priority: 'normal',
    source: '报表中心'
  }
])

// 标签选项
const tabOptions = [
  { label: '全部', value: 'all' },
  { label: '未读', value: 'unread' },
  { label: '系统', value: 'system' },
  { label: '营销', value: 'campaign' }
]

// 计算属性
const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

const filteredNotifications = computed(() => {
  switch (activeTab.value) {
    case 'unread':
      return notifications.value.filter(n => !n.read)
    case 'system':
      return notifications.value.filter(n => ['warning', 'error', 'info'].includes(n.type))
    case 'campaign':
      return notifications.value.filter(n => ['success', 'campaign', 'report'].includes(n.type))
    default:
      return notifications.value
  }
})

// 方法
const updateVisible = (val) => {
  emit('update:visible', val)
}

const getIconByType = (type) => {
  const iconMap = {
    success: 'SuccessFilled',
    warning: 'WarningFilled',
    error: 'CircleCloseFilled',
    info: 'Message',
    campaign: 'Promotion',
    report: 'TrendCharts',
    user: 'User',
    system: 'Setting'
  }
  return iconMap[type] || 'Message'
}

const getTagType = (priority) => {
  const typeMap = {
    urgent: 'danger',
    high: 'warning',
    normal: 'info',
    low: 'info'
  }
  return typeMap[priority] || 'info'
}

const formatTime = (time) => {
  const now = new Date()
  const diff = now - time
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return Math.floor(diff / minute) + '分钟前'
  } else if (diff < day) {
    return Math.floor(diff / hour) + '小时前'
  } else if (diff < 7 * day) {
    return Math.floor(diff / day) + '天前'
  } else {
    return time.toLocaleDateString()
  }
}

const handleNotificationClick = (item) => {
  if (!item.read) {
    markAsRead(item.id)
  }
  // 显示详情对话框
  viewDetail(item)
}

const markAsRead = (id) => {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    notification.read = true
    updateCount()
  }
}

const markAllAsRead = () => {
  notifications.value.forEach(n => {
    n.read = true
  })
  updateCount()
  ElMessage.success('已全部标记为已读')
}

const deleteNotification = (id) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
    updateCount()
    ElMessage.success('已删除')
  }
}

const clearAll = () => {
  notifications.value = []
  updateCount()
  ElMessage.success('已清空所有通知')
}

const viewAll = () => {
  emit('update:visible', false)
  // 跳转到消息中心页面
  router.push('/message/center')
}

const viewDetail = (item) => {
  // 创建详情对话框
  currentMessage.value = item
  detailDialogVisible.value = true
}

const updateCount = () => {
  emit('update:count', unreadCount.value)
}

// WebSocket 模拟接收新消息
const simulateNewMessage = () => {
  const types = ['success', 'warning', 'info', 'campaign', 'report']
  const titles = [
    '新客户注册',
    '营销活动完成',
    'AI任务完成',
    '系统更新',
    '数据同步完成'
  ]
  
  setTimeout(() => {
    const newNotification = {
      id: Date.now(),
      type: types[Math.floor(Math.random() * types.length)],
      title: titles[Math.floor(Math.random() * titles.length)],
      content: '这是一条新的通知消息',
      time: new Date(),
      read: false,
      priority: 'normal',
      source: '系统'
    }
    
    notifications.value.unshift(newNotification)
    updateCount()
    
    // 显示桌面通知（如果用户允许）
    if (Notification.permission === 'granted') {
      new Notification(newNotification.title, {
        body: newNotification.content,
        icon: '/favicon.ico'
      })
    }
  }, 30000) // 30秒后模拟新消息
}

// 生命周期
onMounted(() => {
  updateCount()
  // 请求桌面通知权限
  if (Notification.permission === 'default') {
    Notification.requestPermission()
  }
  // 模拟新消息
  simulateNewMessage()
})
</script>

<style lang="scss" scoped>
.notification-panel {
  padding: 0;
  
  .panel-header {
    padding: 12px 16px;
    border-bottom: 1px solid #EBEEF5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .header-title {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .title-text {
        font-size: 16px;
        font-weight: 500;
        color: #303133;
      }
    }
    
    .header-actions {
      display: flex;
      gap: 8px;
    }
  }
  
  .panel-tabs {
    padding: 12px 16px;
    border-bottom: 1px solid #EBEEF5;
  }
  
  .notification-list {
    min-height: 300px;
    max-height: 400px;
    
    .notification-item {
      display: flex;
      padding: 12px 16px;
      cursor: pointer;
      transition: all 0.3s;
      border-bottom: 1px solid #F2F6FC;
      
      &:hover {
        background-color: #F5F7FA;
      }
      
      &.is-unread {
        background-color: #F0F9FF;
        
        .content-title {
          font-weight: 600;
        }
        
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background-color: #409EFF;
        }
      }
      
      .item-icon {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        flex-shrink: 0;
        
        &.icon-success {
          background-color: #F0F9FF;
          color: #67C23A;
        }
        
        &.icon-warning {
          background-color: #FDF6EC;
          color: #E6A23C;
        }
        
        &.icon-error {
          background-color: #FEF0F0;
          color: #F56C6C;
        }
        
        &.icon-info {
          background-color: #F4F4F5;
          color: #909399;
        }
        
        &.icon-campaign {
          background-color: #ECF5FF;
          color: #409EFF;
        }
        
        &.icon-report {
          background-color: #F0F9FF;
          color: #409EFF;
        }
      }
      
      .item-content {
        flex: 1;
        min-width: 0;
        
        .content-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
          
          .content-title {
            font-size: 14px;
            color: #303133;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
        
        .content-body {
          font-size: 13px;
          color: #606266;
          line-height: 1.5;
          margin-bottom: 6px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        
        .content-footer {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
          color: #909399;
          
          .footer-time {
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }
      }
      
      .item-actions {
        display: flex;
        align-items: center;
        gap: 4px;
        opacity: 0;
        transition: opacity 0.3s;
      }
      
      &:hover .item-actions {
        opacity: 1;
      }
    }
  }
  
  .panel-footer {
    padding: 12px 16px;
    border-top: 1px solid #EBEEF5;
    text-align: center;
  }
}

// 动画效果
.notification-item-enter-active,
.notification-item-leave-active {
  transition: all 0.3s ease;
}

.notification-item-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.notification-item-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

// 通知图标呼吸灯效果（复用之前的样式）
.notification-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  
  .notification-badge {
    ::deep(.el-badge__content) {
      background: linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%);
      border: none;
      box-shadow: 0 2px 8px rgba(255, 71, 87, 0.4);
      animation: badge-pulse 2s ease-in-out infinite;
    }
  }
  
  .notification-btn {
    position: relative;
    padding: 6px;
    
    &:hover {
      .notification-icon {
        animation: bell-shake 0.5s ease-in-out;
      }
    }
  }
  
  .notification-icon {
    position: relative;
    color: #606266;
    transition: all 0.3s ease;
    
    &.breathing {
      color: #ff4757;
      
      &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255, 71, 87, 0.3) 0%, transparent 70%);
        animation: breathing-glow 2s ease-in-out infinite;
        pointer-events: none;
      }
      
      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 35px;
        height: 35px;
        border-radius: 50%;
        border: 2px solid rgba(255, 71, 87, 0.3);
        animation: ripple-effect 2s ease-out infinite;
        pointer-events: none;
      }
    }
  }
}

@keyframes breathing-glow {
  0%, 100% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(0.8);
  }
  50% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1.2);
  }
}

@keyframes ripple-effect {
  0% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(0.5);
  }
  80% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.5);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.5);
  }
}

@keyframes badge-pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 2px 8px rgba(255, 71, 87, 0.4);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(255, 71, 87, 0.6);
  }
}

@keyframes bell-shake {
  0%, 100% {
    transform: rotate(0deg);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: rotate(-10deg);
  }
  20%, 40%, 60%, 80% {
    transform: rotate(10deg);
  }
}
</style>

<style>
/* 全局样式 */
.notification-popover {
  padding: 0 !important;
}
</style>