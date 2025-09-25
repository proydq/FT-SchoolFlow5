<template>
  <el-dialog
    v-model="visible"
    :title="message?.title || '消息详情'"
    width="680px"
    class="message-detail-dialog"
    :before-close="handleClose"
    :close-on-click-modal="false"
  >
    <div v-if="message" class="message-detail">
      <!-- 消息头部 -->
      <div class="detail-header">
        <div class="header-icon" :class="`icon-${message.type}`">
          <el-icon :size="32">
            <component :is="getIconByType(message.type)" />
          </el-icon>
        </div>
        <div class="header-info">
          <h3 class="detail-title">{{ message.title }}</h3>
          <div class="detail-meta">
            <span class="meta-item">
              <el-icon><User /></el-icon>
              {{ message.source }}
            </span>
            <span class="meta-item">
              <el-icon><Clock /></el-icon>
              {{ formatDateTime(message.time) }}
            </span>
            <span class="meta-item" v-if="message.category">
              <el-icon><FolderOpened /></el-icon>
              {{ message.category }}
            </span>
          </div>
          <div class="detail-tags">
            <el-tag 
              v-if="message.priority === 'urgent'"
              type="danger"
            >
              紧急
            </el-tag>
            <el-tag 
              v-if="message.priority === 'high'"
              type="warning"
            >
              重要
            </el-tag>
            <el-tag 
              v-if="!message.read"
              type="primary"
            >
              未读
            </el-tag>
            <el-tag 
              v-if="message.processed"
              type="success"
            >
              已处理
            </el-tag>
            <el-tag 
              v-if="message.starred"
              effect="plain"
            >
              <el-icon><Star /></el-icon>
              已收藏
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 消息内容 -->
      <div class="detail-content">
        <div class="content-section">
          <h4 class="section-title">消息内容</h4>
          <div class="section-body">
            <p>{{ message.content }}</p>
          </div>
        </div>

        <!-- 相关数据（如果有） -->
        <div class="content-section" v-if="message.data">
          <h4 class="section-title">相关数据</h4>
          <div class="section-body">
            <el-descriptions :column="2" border>
              <el-descriptions-item 
                v-for="(value, key) in message.data" 
                :key="key"
                :label="getDataLabel(key)"
              >
                {{ formatDataValue(value) }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>

        <!-- 操作记录 -->
        <div class="content-section" v-if="message.actions && message.actions.length > 0">
          <h4 class="section-title">操作记录</h4>
          <div class="section-body">
            <el-timeline>
              <el-timeline-item
                v-for="action in message.actions"
                :key="action.id"
                :timestamp="formatDateTime(action.time)"
                :type="getActionType(action.type)"
              >
                <div class="action-content">
                  <span class="action-user">{{ action.user }}</span>
                  <span class="action-text">{{ action.description }}</span>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </div>

        <!-- 附件（如果有） -->
        <div class="content-section" v-if="message.attachments && message.attachments.length > 0">
          <h4 class="section-title">附件</h4>
          <div class="section-body">
            <div class="attachment-list">
              <div 
                v-for="file in message.attachments" 
                :key="file.id"
                class="attachment-item"
              >
                <el-icon class="file-icon"><Document /></el-icon>
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">{{ formatFileSize(file.size) }}</span>
                <el-button link type="primary" @click="downloadFile(file)">
                  <el-icon><Download /></el-icon>
                  下载
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作 -->
    <template #footer>
      <div class="dialog-footer">
        <div class="footer-left">
          <el-button 
            v-if="!message?.read"
            type="primary" 
            plain
            @click="markAsRead"
          >
            <el-icon><Check /></el-icon>
            标记已读
          </el-button>
          <el-button 
            v-if="!message?.processed && message?.actionRequired"
            type="success"
            plain
            @click="markAsProcessed"
          >
            <el-icon><Select /></el-icon>
            标记已处理
          </el-button>
          <el-button 
            plain
            @click="toggleStar"
          >
            <el-icon><Star /></el-icon>
            {{ message?.starred ? '取消收藏' : '收藏' }}
          </el-button>
        </div>
        <div class="footer-right">
          <el-button @click="handleClose">关闭</el-button>
          <el-button 
            v-if="message?.actionRequired && !message?.processed"
            type="primary" 
            @click="handleAction"
          >
            立即处理
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  User, Clock, FolderOpened, Star, Check, Select,
  Document, Download, Message, SuccessFilled, 
  WarningFilled, CircleCloseFilled, Promotion, 
  TrendCharts, Setting
} from '@element-plus/icons-vue'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  message: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:visible', 'refresh'])

// 计算属性
const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 方法
const getIconByType = (type) => {
  const iconMap = {
    system: 'Setting',
    campaign: 'Promotion',
    report: 'TrendCharts',
    alert: 'WarningFilled',
    workflow: 'Message',
    success: 'SuccessFilled',
    error: 'CircleCloseFilled',
    info: 'Message'
  }
  return iconMap[type] || 'Message'
}

const formatDateTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString()
}

const formatFileSize = (size) => {
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB'
  } else {
    return (size / (1024 * 1024)).toFixed(2) + ' MB'
  }
}

const getDataLabel = (key) => {
  const labelMap = {
    sentCount: '发送数量',
    openRate: '打开率',
    clickRate: '点击率',
    conversionRate: '转化率',
    revenue: '产生收入',
    cost: '花费成本',
    roi: 'ROI',
    targetCount: '目标客户数',
    successCount: '成功数',
    failedCount: '失败数'
  }
  return labelMap[key] || key
}

const formatDataValue = (value) => {
  if (typeof value === 'number') {
    if (value < 1) {
      return (value * 100).toFixed(2) + '%'
    } else if (value > 1000) {
      return value.toLocaleString()
    }
  }
  return value
}

const getActionType = (type) => {
  const typeMap = {
    create: 'primary',
    update: 'warning',
    delete: 'danger',
    process: 'success'
  }
  return typeMap[type] || 'info'
}

const downloadFile = (file) => {
  ElMessage.info(`下载文件: ${file.name}`)
}

const markAsRead = () => {
  if (props.message) {
    props.message.read = true
    emit('refresh')
    ElMessage.success('已标记为已读')
  }
}

const markAsProcessed = () => {
  if (props.message) {
    props.message.processed = true
    emit('refresh')
    ElMessage.success('已标记为已处理')
  }
}

const toggleStar = () => {
  if (props.message) {
    props.message.starred = !props.message.starred
    emit('refresh')
    ElMessage.success(props.message.starred ? '已收藏' : '已取消收藏')
  }
}

const handleAction = () => {
  // 根据消息类型执行不同的操作
  const actionMap = {
    campaign: () => {
      ElMessage.info('跳转到营销活动页面')
      // router.push('/campaign/list')
    },
    alert: () => {
      ElMessage.info('跳转到系统设置页面')
      // router.push('/system/config')
    },
    workflow: () => {
      ElMessage.info('跳转到审批页面')
      // router.push('/workflow/approval')
    },
    report: () => {
      ElMessage.info('跳转到报表页面')
      // router.push('/report/overview')
    }
  }
  
  const action = actionMap[props.message?.type]
  if (action) {
    action()
  } else {
    ElMessage.info('处理中...')
  }
  
  handleClose()
}

const handleClose = () => {
  visible.value = false
}
</script>

<style lang="scss" scoped>
.message-detail {
  .detail-header {
    display: flex;
    gap: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #EBEEF5;
    
    .header-icon {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      
      &.icon-system {
        background: #F4F4F5;
        color: #909399;
      }
      
      &.icon-campaign {
        background: #ECF5FF;
        color: #409EFF;
      }
      
      &.icon-report {
        background: #F0F9FF;
        color: #409EFF;
      }
      
      &.icon-alert {
        background: #FDF6EC;
        color: #E6A23C;
      }
      
      &.icon-workflow {
        background: #F0F9FF;
        color: #409EFF;
      }
      
      &.icon-success {
        background: #F0F9FF;
        color: #67C23A;
      }
      
      &.icon-error {
        background: #FEF0F0;
        color: #F56C6C;
      }
    }
    
    .header-info {
      flex: 1;
      
      .detail-title {
        font-size: 18px;
        font-weight: 500;
        color: #303133;
        margin: 0 0 8px 0;
      }
      
      .detail-meta {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 8px;
        font-size: 14px;
        color: #606266;
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
      
      .detail-tags {
        display: flex;
        gap: 8px;
      }
    }
  }
  
  .detail-content {
    padding-top: 20px;
    
    .content-section {
      margin-bottom: 24px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .section-title {
        font-size: 15px;
        font-weight: 500;
        color: #303133;
        margin: 0 0 12px 0;
        padding-left: 8px;
        border-left: 3px solid #409EFF;
      }
      
      .section-body {
        padding: 0 12px;
        
        p {
          font-size: 14px;
          color: #606266;
          line-height: 1.8;
          margin: 0;
        }
        
        .action-content {
          font-size: 14px;
          
          .action-user {
            font-weight: 500;
            color: #303133;
            margin-right: 8px;
          }
          
          .action-text {
            color: #606266;
          }
        }
        
        .attachment-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          
          .attachment-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: #F5F7FA;
            border-radius: 4px;
            
            .file-icon {
              color: #909399;
            }
            
            .file-name {
              flex: 1;
              color: #303133;
              font-size: 14px;
            }
            
            .file-size {
              color: #909399;
              font-size: 12px;
            }
          }
        }
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .footer-left {
    display: flex;
    gap: 8px;
  }
  
  .footer-right {
    display: flex;
    gap: 8px;
  }
}
</style>

<style>
.message-detail-dialog .el-dialog__header {
  border-bottom: 1px solid #EBEEF5;
}

.message-detail-dialog .el-dialog__body {
  padding: 20px;
}
</style>