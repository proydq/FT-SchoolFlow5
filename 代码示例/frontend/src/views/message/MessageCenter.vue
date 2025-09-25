<template>
  <div class="message-center">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">
          <el-icon><Bell /></el-icon>
          消息中心
        </h2>
        <div class="header-stats">
          <div class="stat-item">
            <span class="stat-label">全部消息</span>
            <span class="stat-value">{{ totalCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">未读消息</span>
            <span class="stat-value unread">{{ unreadCount }}</span>
          </div>
        </div>
      </div>
      <div class="header-actions">
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button type="primary" @click="markAllAsRead" :disabled="unreadCount === 0">
          <el-icon><Check /></el-icon>
          全部已读
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </div>
    </div>

    <!-- 筛选区域 -->
    <el-card class="filter-card">
      <el-form :model="filterForm" inline class="filter-form">
        <el-form-item label="类型">
          <el-select v-model="filterForm.type" placeholder="全部" clearable style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="系统通知" value="system" />
            <el-option label="营销活动" value="campaign" />
            <el-option label="数据报表" value="report" />
            <el-option label="告警提醒" value="alert" />
            <el-option label="工作流" value="workflow" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="优先级">
          <el-select v-model="filterForm.priority" placeholder="全部" clearable style="width: 100px">
            <el-option label="全部" value="" />
            <el-option label="紧急" value="urgent" />
            <el-option label="高" value="high" />
            <el-option label="普通" value="normal" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="阅读">
          <el-select v-model="filterForm.readStatus" placeholder="全部" clearable style="width: 90px">
            <el-option label="全部" value="" />
            <el-option label="未读" value="unread" />
            <el-option label="已读" value="read" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="处理">
          <el-select v-model="filterForm.processStatus" placeholder="全部" clearable style="width: 100px">
            <el-option label="全部" value="" />
            <el-option label="待处理" value="pending" />
            <el-option label="已处理" value="processed" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="收藏">
          <el-select v-model="filterForm.starStatus" placeholder="全部" clearable style="width: 100px">
            <el-option label="全部" value="" />
            <el-option label="已收藏" value="starred" />
            <el-option label="未收藏" value="unstarred" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="归档">
          <el-select v-model="filterForm.archiveStatus" placeholder="全部" clearable style="width: 100px">
            <el-option label="全部" value="" />
            <el-option label="未归档" value="active" />
            <el-option label="已归档" value="archived" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="时间">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始"
            end-placeholder="结束"
            value-format="YYYY-MM-DD"
            style="width: 240px"
            :shortcuts="dateShortcuts"
          />
        </el-form-item>
        
        <el-form-item label="关键词">
          <el-input 
            v-model="filterForm.keyword" 
            placeholder="搜索标题或内容"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 消息列表 -->
    <el-card class="message-list-card">
      <!-- 批量操作 -->
      <div class="batch-actions" v-if="selectedMessages.length > 0">
        <el-checkbox 
          v-model="isSelectAll"
          :indeterminate="isIndeterminate"
          @change="handleSelectAll"
        >
          全选
        </el-checkbox>
        <span class="selected-count">已选择 {{ selectedMessages.length }} 条</span>
        <div class="batch-buttons">
          <el-button size="small" @click="batchMarkAsRead">
            <el-icon><Check /></el-icon>
            标记已读
          </el-button>
          <el-button size="small" @click="batchProcess">
            <el-icon><Select /></el-icon>
            标记已处理
          </el-button>
          <el-button size="small" type="danger" @click="batchDelete">
            <el-icon><Delete /></el-icon>
            批量删除
          </el-button>
        </div>
      </div>

      <!-- 消息列表 -->
      <div class="message-list" v-loading="loading">
        <el-empty v-if="messageList.length === 0" description="暂无消息" />
        
        <TransitionGroup v-else name="list" tag="div">
          <div 
            v-for="message in messageList" 
            :key="message.id"
            class="message-item"
            :class="{ 
              'is-unread': !message.read,
              'is-selected': selectedMessages.includes(message.id)
            }"
            @click="handleMessageClick(message)"
          >
            <!-- 选择框 -->
            <el-checkbox 
              v-model="selectedMessages"
              :label="message.id"
              @click.stop
            />

            <!-- 消息图标 -->
            <div class="message-icon" :class="`icon-${message.type}`">
              <el-icon :size="24">
                <component :is="getIconByType(message.type)" />
              </el-icon>
            </div>

            <!-- 消息内容 -->
            <div class="message-content">
              <div class="content-header">
                <span class="message-title">{{ message.title }}</span>
                <div class="message-tags">
                  <el-tag 
                    v-if="message.priority === 'urgent'"
                    type="danger"
                    size="small"
                  >
                    紧急
                  </el-tag>
                  <el-tag 
                    v-if="message.priority === 'high'"
                    type="warning"
                    size="small"
                  >
                    重要
                  </el-tag>
                  <el-tag 
                    v-if="!message.read"
                    type="primary"
                    size="small"
                  >
                    未读
                  </el-tag>
                  <el-tag 
                    v-if="message.processed"
                    type="success"
                    size="small"
                  >
                    已处理
                  </el-tag>
                  <el-tag 
                    v-if="message.starred"
                    type="warning"
                    size="small"
                    effect="plain"
                  >
                    <el-icon><Star /></el-icon>
                  </el-tag>
                  <el-tag 
                    v-if="message.archived"
                    type="info"
                    size="small"
                    effect="plain"
                  >
                    已归档
                  </el-tag>
                </div>
              </div>
              <div class="message-text">{{ message.content }}</div>
              <div class="message-meta">
                <span class="meta-item">
                  <el-icon><User /></el-icon>
                  {{ message.source }}
                </span>
                <span class="meta-item">
                  <el-icon><Clock /></el-icon>
                  {{ formatTime(message.time) }}
                </span>
                <span class="meta-item" v-if="message.category">
                  <el-icon><FolderOpened /></el-icon>
                  {{ message.category }}
                </span>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="message-actions">
              <el-button 
                v-if="!message.read"
                link 
                size="small"
                @click.stop="markAsRead(message.id)"
              >
                标记已读
              </el-button>
              <el-button 
                v-if="!message.processed && message.actionRequired"
                link 
                size="small"
                type="primary"
                @click.stop="processMessage(message)"
              >
                立即处理
              </el-button>
              <el-button 
                link 
                size="small"
                @click.stop="viewDetail(message)"
              >
                查看详情
              </el-button>
              <el-dropdown trigger="click" @click.stop>
                <el-button link size="small">
                  <el-icon><More /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="starMessage(message)">
                      <el-icon><Star /></el-icon>
                      {{ message.starred ? '取消收藏' : '收藏' }}
                    </el-dropdown-item>
                    <el-dropdown-item @click="archiveMessage(message)">
                      <el-icon><FolderAdd /></el-icon>
                      {{ message.archived ? '取消归档' : '归档' }}
                    </el-dropdown-item>
                    <el-dropdown-item divided @click="deleteMessage(message.id)">
                      <el-icon><Delete /></el-icon>
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </TransitionGroup>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalCount"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 消息详情对话框 -->
    <MessageDetailDialog 
      v-model:visible="detailDialogVisible"
      :message="currentMessage"
      @refresh="loadMessages"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import MessageDetailDialog from '@/components/MessageDetailDialog.vue'
import { 
  Bell, Refresh, Check, Download, Search, RefreshLeft,
  User, Clock, FolderOpened, Delete, More, Star, FolderAdd,
  Select, Message, SuccessFilled, WarningFilled, CircleCloseFilled,
  Promotion, TrendCharts, Setting
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(156)
const selectedMessages = ref([])
const isSelectAll = ref(false)
const detailDialogVisible = ref(false)
const currentMessage = ref(null)

// 筛选表单
const filterForm = reactive({
  type: '',
  priority: '',
  readStatus: '',
  processStatus: '',
  starStatus: '',
  archiveStatus: '',
  dateRange: null,
  keyword: ''
})

// 日期快捷选项
const dateShortcuts = [
  {
    text: '今天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 0)
      return [start, end]
    }
  },
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  }
]

// 消息列表
const messageList = ref([
  {
    id: 1,
    type: 'campaign',
    title: '营销活动执行成功',
    content: '春季新品推广活动已成功发送给500位目标客户，打开率达到65%，点击率32%，转化率5.8%。活动效果超出预期，建议继续优化内容策略。',
    time: new Date(Date.now() - 1000 * 60 * 5),
    read: false,
    processed: false,
    priority: 'high',
    source: '营销系统',
    category: '活动通知',
    actionRequired: true,
    starred: false,
    archived: false
  },
  {
    id: 2,
    type: 'alert',
    title: '邮件配额即将用完',
    content: '本月邮件发送配额已使用90%（45,000/50,000），预计将在3天内用完。请及时充值或升级套餐以避免影响业务。',
    time: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
    processed: false,
    priority: 'urgent',
    source: '系统监控',
    category: '告警提醒',
    actionRequired: true,
    starred: true,
    archived: false
  },
  {
    id: 3,
    type: 'system',
    title: 'AI内容生成完成',
    content: '您请求的10篇营销邮件内容已生成完成，包含5个产品介绍模板和5个促销活动模板。所有内容已通过质量检测，可以直接使用。',
    time: new Date(Date.now() - 1000 * 60 * 60),
    read: true,
    processed: true,
    priority: 'normal',
    source: 'AI助手',
    category: '任务通知',
    actionRequired: false,
    starred: false,
    archived: false
  },
  {
    id: 4,
    type: 'alert',
    title: '数据导入失败',
    content: '客户数据导入失败，共有15条数据格式错误：邮箱格式不正确（8条），电话号码无效（5条），必填字段缺失（2条）。请检查数据后重试。',
    time: new Date(Date.now() - 1000 * 60 * 120),
    read: false,
    processed: false,
    priority: 'high',
    source: '数据中心',
    category: '错误通知',
    actionRequired: true,
    starred: false,
    archived: true
  },
  {
    id: 5,
    type: 'workflow',
    title: '新的营销活动待审批',
    content: '张三创建的"黑五促销活动"需要您的审批。活动预算：$10,000，目标客户：2,000人，计划发送时间：2024-11-24 09:00。',
    time: new Date(Date.now() - 1000 * 60 * 180),
    read: true,
    processed: false,
    priority: 'high',
    source: '工作流',
    category: '审批通知',
    actionRequired: true,
    starred: false,
    archived: false
  },
  {
    id: 6,
    type: 'report',
    title: '周报已生成',
    content: '本周营销数据报表已生成。关键指标：邮件发送12,000封，打开率58%，点击率28%，转化率4.5%，ROI 320%。整体表现优秀。',
    time: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true,
    processed: true,
    priority: 'normal',
    source: '报表中心',
    category: '报表通知',
    actionRequired: false,
    starred: true,
    archived: false
  },
  {
    id: 7,
    type: 'system',
    title: '系统维护通知',
    content: '系统将于2024-01-25 02:00-04:00进行例行维护，期间服务可能暂时不可用。请提前安排好相关工作。',
    time: new Date(Date.now() - 1000 * 60 * 60 * 48),
    read: true,
    processed: true,
    priority: 'normal',
    source: '系统管理',
    category: '系统通知',
    actionRequired: false,
    starred: false,
    archived: true
  },
  {
    id: 8,
    type: 'campaign',
    title: '客户反馈收集完成',
    content: '本月客户满意度调查已完成，共收集有效反馈325份。整体满意度评分4.3/5.0，NPS得分42。详细报告已生成。',
    time: new Date(Date.now() - 1000 * 60 * 60 * 72),
    read: false,
    processed: false,
    priority: 'normal',
    source: '客户中心',
    category: '调研通知',
    actionRequired: false,
    starred: false,
    archived: false
  }
])

// 计算属性
const unreadCount = computed(() => {
  return messageList.value.filter(m => !m.read).length
})

const isIndeterminate = computed(() => {
  const len = selectedMessages.value.length
  return len > 0 && len < messageList.value.length
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
    error: 'CircleCloseFilled'
  }
  return iconMap[type] || 'Message'
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
    return time.toLocaleString()
  }
}

const loadMessages = () => {
  loading.value = true
  // 模拟加载数据
  setTimeout(() => {
    loading.value = false
  }, 500)
}

const handleSearch = () => {
  loadMessages()
}

const handleReset = () => {
  filterForm.type = ''
  filterForm.priority = ''
  filterForm.readStatus = ''
  filterForm.processStatus = ''
  filterForm.starStatus = ''
  filterForm.archiveStatus = ''
  filterForm.dateRange = null
  filterForm.keyword = ''
  loadMessages()
}

const handleRefresh = () => {
  loadMessages()
  ElMessage.success('已刷新')
}

const markAsRead = (id) => {
  const message = messageList.value.find(m => m.id === id)
  if (message) {
    message.read = true
    ElMessage.success('已标记为已读')
  }
}

const markAllAsRead = () => {
  ElMessageBox.confirm(
    '确定将所有未读消息标记为已读吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    messageList.value.forEach(m => {
      m.read = true
    })
    ElMessage.success('已全部标记为已读')
  }).catch(() => {})
}

const handleSelectAll = (val) => {
  selectedMessages.value = val ? messageList.value.map(m => m.id) : []
}

const batchMarkAsRead = () => {
  const count = selectedMessages.value.length
  messageList.value.forEach(m => {
    if (selectedMessages.value.includes(m.id)) {
      m.read = true
    }
  })
  selectedMessages.value = []
  ElMessage.success(`已将${count}条消息标记为已读`)
}

const batchProcess = () => {
  const count = selectedMessages.value.length
  messageList.value.forEach(m => {
    if (selectedMessages.value.includes(m.id)) {
      m.processed = true
    }
  })
  selectedMessages.value = []
  ElMessage.success(`已将${count}条消息标记为已处理`)
}

const batchDelete = () => {
  ElMessageBox.confirm(
    `确定删除选中的${selectedMessages.value.length}条消息吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    messageList.value = messageList.value.filter(
      m => !selectedMessages.value.includes(m.id)
    )
    const count = selectedMessages.value.length
    selectedMessages.value = []
    ElMessage.success(`已删除${count}条消息`)
  }).catch(() => {})
}

const handleMessageClick = (message) => {
  if (!message.read) {
    message.read = true
  }
  viewDetail(message)
}

const viewDetail = (message) => {
  currentMessage.value = message
  detailDialogVisible.value = true
}

const processMessage = (message) => {
  // 根据消息类型处理
  ElMessage.info(`处理消息: ${message.title}`)
  message.processed = true
}

const starMessage = (message) => {
  message.starred = !message.starred
  ElMessage.success(message.starred ? '已收藏' : '已取消收藏')
}

const archiveMessage = (message) => {
  message.archived = !message.archived
  ElMessage.success(message.archived ? '已归档' : '已取消归档')
}

const deleteMessage = (id) => {
  ElMessageBox.confirm(
    '确定删除这条消息吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = messageList.value.findIndex(m => m.id === id)
    if (index > -1) {
      messageList.value.splice(index, 1)
      ElMessage.success('已删除')
    }
  }).catch(() => {})
}

const handleExport = () => {
  ElMessage.success('正在导出消息列表...')
}

const handleSizeChange = () => {
  loadMessages()
}

const handlePageChange = () => {
  loadMessages()
}

// 生命周期
onMounted(() => {
  loadMessages()
})
</script>

<style lang="scss" scoped>
.message-center {
  padding: 20px;
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .header-content {
      display: flex;
      align-items: center;
      gap: 24px;
      
      .page-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 24px;
        font-weight: 500;
        color: #303133;
        margin: 0;
      }
      
      .header-stats {
        display: flex;
        gap: 24px;
        
        .stat-item {
          display: flex;
          flex-direction: column;
          
          .stat-label {
            font-size: 12px;
            color: #909399;
          }
          
          .stat-value {
            font-size: 20px;
            font-weight: 600;
            color: #303133;
            
            &.unread {
              color: #E6A23C;
            }
          }
        }
      }
    }
    
    .header-actions {
      display: flex;
      gap: 12px;
    }
  }
  
  .filter-card {
    margin-bottom: 20px;
    
    ::deep(.el-card__body) {
      padding: 16px 20px;
    }
    
    .filter-form {
      ::deep(.el-form-item) {
        margin-bottom: 0;
        margin-right: 16px;
        
        &:last-child {
          margin-right: 0;
        }
        
        .el-form-item__label {
          font-size: 14px;
          color: #606266;
        }
      }
      
      ::deep(.el-select) {
        .el-input__inner {
          font-size: 14px;
        }
      }
      
      ::deep(.el-input) {
        .el-input__inner {
          font-size: 14px;
        }
      }
      
      ::deep(.el-date-editor) {
        .el-input__inner {
          font-size: 14px;
        }
      }
    }
  }
  
  .message-list-card {
    .batch-actions {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 20px;
      background: #F5F7FA;
      border-bottom: 1px solid #EBEEF5;
      
      .selected-count {
        color: #606266;
        font-size: 14px;
      }
      
      .batch-buttons {
        margin-left: auto;
        display: flex;
        gap: 8px;
      }
    }
    
    .message-list {
      min-height: 400px;
      
      .message-item {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        padding: 16px 20px;
        border-bottom: 1px solid #F2F6FC;
        cursor: pointer;
        transition: all 0.3s;
        
        &:hover {
          background-color: #F5F7FA;
        }
        
        &.is-unread {
          background-color: #F0F9FF;
          
          .message-title {
            font-weight: 600;
          }
        }
        
        &.is-selected {
          background-color: #ECF5FF;
        }
        
        .message-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
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
        }
        
        .message-content {
          flex: 1;
          min-width: 0;
          
          .content-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
            
            .message-title {
              font-size: 15px;
              color: #303133;
            }
            
            .message-tags {
              display: flex;
              gap: 6px;
            }
          }
          
          .message-text {
            font-size: 14px;
            color: #606266;
            line-height: 1.6;
            margin-bottom: 8px;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
          
          .message-meta {
            display: flex;
            align-items: center;
            gap: 16px;
            font-size: 12px;
            color: #909399;
            
            .meta-item {
              display: flex;
              align-items: center;
              gap: 4px;
            }
          }
        }
        
        .message-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
      }
    }
    
    .pagination-wrapper {
      display: flex;
      justify-content: center;
      padding: 20px;
    }
  }
}

// 列表动画
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>