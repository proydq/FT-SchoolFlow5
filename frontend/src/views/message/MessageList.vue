<template>
  <div class="message-management-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h2>消息管理</h2>
        <p class="page-description">统一管理系统消息通知，支持多渠道推送和阅读统计</p>
        <div class="header-actions">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            发布消息
          </el-button>
          <el-button @click="handleBatchPublish" :disabled="selectedMessages.length === 0">
            <el-icon><Promotion /></el-icon>
            批量发布
          </el-button>
          <el-button type="danger" @click="handleBatchDelete" :disabled="selectedMessages.length === 0">
            <el-icon><Delete /></el-icon>
            批量删除
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon primary">
                <el-icon><Message /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.totalMessages }}</div>
                <div class="stats-label">总消息数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon success">
                <el-icon><Select /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.publishedMessages }}</div>
                <div class="stats-label">已发布</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon warning">
                <el-icon><EditPen /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.draftMessages }}</div>
                <div class="stats-label">草稿</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon info">
                <el-icon><View /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.totalViews }}</div>
                <div class="stats-label">总阅读量</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <el-card>
        <div class="filter-content">
          <div class="filter-left">
            <el-input
              v-model="searchQuery"
              placeholder="搜索消息标题、内容"
              prefix-icon="Search"
              style="width: 280px"
              clearable
              @keyup.enter="handleSearch"
              @clear="handleSearch"
            />
            <el-select v-model="typeFilter" placeholder="消息类型" style="width: 120px" clearable @change="handleFilter">
              <el-option label="全部类型" value="" />
              <el-option v-for="type in messageTypes" :key="type.value" :label="type.label" :value="type.value" />
            </el-select>
            <el-select v-model="statusFilter" placeholder="发布状态" style="width: 120px" clearable @change="handleFilter">
              <el-option label="全部状态" value="" />
              <el-option label="已发布" value="published" />
              <el-option label="草稿" value="draft" />
              <el-option label="已撤回" value="withdrawn" />
            </el-select>
            <el-select v-model="priorityFilter" placeholder="优先级" style="width: 100px" clearable @change="handleFilter">
              <el-option label="全部" value="" />
              <el-option label="高" value="high" />
              <el-option label="中" value="medium" />
              <el-option label="低" value="low" />
            </el-select>
          </div>
          <div class="filter-right">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 240px"
              @change="handleDateChange"
            />
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 消息列表 -->
    <div class="message-list-section">
      <el-card>
        <el-table
          :data="filteredMessages"
          style="width: 100%"
          @selection-change="handleSelectionChange"
          row-key="id"
          v-loading="loading"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="ID" width="80" />

          <el-table-column label="消息信息" min-width="280">
            <template #default="{ row }">
              <div class="message-info">
                <div class="message-title">
                  <span>{{ row.title }}</span>
                  <div class="message-badges">
                    <el-tag :type="getPriorityTagType(row.priority)" size="small">
                      {{ getPriorityText(row.priority) }}
                    </el-tag>
                    <el-tag :type="getTypeTagType(row.type)" size="small">
                      {{ getTypeText(row.type) }}
                    </el-tag>
                  </div>
                </div>
                <div class="message-content">{{ row.content }}</div>
                <div class="message-meta">
                  <span class="creator">{{ row.creator }}</span>
                  <span class="create-time">{{ formatDate(row.createTime) }}</span>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="发布信息" width="160">
            <template #default="{ row }">
              <div v-if="row.status === 'published'" class="publish-info">
                <div class="publish-time">{{ formatDate(row.publishTime) }}</div>
                <div class="target-count">推送至 {{ row.targetCount }} 人</div>
              </div>
              <span v-else class="not-published">未发布</span>
            </template>
          </el-table-column>

          <el-table-column label="阅读统计" width="120">
            <template #default="{ row }">
              <div v-if="row.status === 'published'" class="read-stats">
                <div class="read-count">
                  <el-link type="primary" @click="handleViewReadRecords(row)">
                    {{ row.readCount || 0 }}
                  </el-link>
                </div>
                <div class="read-rate">
                  阅读率: {{ getReadRate(row) }}%
                </div>
              </div>
              <span v-else>-</span>
            </template>
          </el-table-column>

          <el-table-column prop="createTime" label="创建时间" width="160" sortable />

          <el-table-column label="操作" width="280" fixed="right">
            <template #default="{ row }">
              <div class="operation-buttons">
                <el-button size="small" link type="primary" @click="handleView(row)">查看</el-button>
                <el-button size="small" link type="primary" @click="handleEdit(row)">编辑</el-button>
                <el-button
                  v-if="row.status === 'draft'"
                  size="small"
                  link
                  type="success"
                  @click="handlePublish(row)"
                >
                  发布
                </el-button>
                <el-button
                  v-if="row.status === 'published'"
                  size="small"
                  link
                  type="warning"
                  @click="handleWithdraw(row)"
                >
                  撤回
                </el-button>
                <el-button size="small" link type="danger" @click="handleDelete(row)">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 批量操作 -->
        <div v-if="selectedMessages.length > 0" class="batch-actions">
          <div class="batch-info">
            已选择 {{ selectedMessages.length }} 条消息
          </div>
          <div class="batch-buttons">
            <el-button @click="handleBatchPublish">批量发布</el-button>
            <el-button @click="handleBatchWithdraw">批量撤回</el-button>
            <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="totalMessages"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 新增/编辑消息对话框 -->
    <el-dialog
      v-model="messageDialogVisible"
      :title="dialogTitle"
      width="900px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="消息标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入消息标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="消息类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择消息类型" style="width: 100%">
                <el-option v-for="type in messageTypes" :key="type.value" :label="type.label" :value="type.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="form.priority" placeholder="请选择优先级" style="width: 100%">
                <el-option label="高" value="high" />
                <el-option label="中" value="medium" />
                <el-option label="低" value="low" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="推送范围">
              <el-select v-model="form.targetType" placeholder="推送范围" style="width: 100%">
                <el-option label="全体用户" value="all" />
                <el-option label="指定部门" value="department" />
                <el-option label="指定人员" value="users" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item v-if="form.targetType === 'department'" label="选择部门">
          <el-select v-model="form.targetDepartments" multiple placeholder="选择部门" style="width: 100%">
            <el-option v-for="dept in departments" :key="dept.id" :label="dept.name" :value="dept.id" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="form.targetType === 'users'" label="选择人员">
          <el-select v-model="form.targetUsers" multiple placeholder="选择人员" style="width: 100%">
            <el-option v-for="user in users" :key="user.id" :label="user.name" :value="user.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="消息内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="6"
            placeholder="请输入消息内容"
          />
        </el-form-item>

        <el-form-item label="定时发布">
          <el-switch v-model="form.scheduled" />
          <el-date-picker
            v-if="form.scheduled"
            v-model="form.scheduleTime"
            type="datetime"
            placeholder="选择发布时间"
            style="margin-left: 10px"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="messageDialogVisible = false">取消</el-button>
        <el-button @click="handleSaveDraft">保存草稿</el-button>
        <el-button type="primary" @click="handleSubmit">
          {{ form.scheduled ? '定时发布' : '立即发布' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 消息详情对话框 -->
    <el-dialog v-model="messageDetailVisible" title="消息详情" width="800px">
      <div class="message-detail" v-if="currentMessage">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="消息ID">{{ currentMessage.id }}</el-descriptions-item>
          <el-descriptions-item label="消息标题">{{ currentMessage.title }}</el-descriptions-item>
          <el-descriptions-item label="消息类型">
            <el-tag :type="getTypeTagType(currentMessage.type)" size="small">
              {{ getTypeText(currentMessage.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="优先级">
            <el-tag :type="getPriorityTagType(currentMessage.priority)" size="small">
              {{ getPriorityText(currentMessage.priority) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="发布状态">
            <el-tag :type="getStatusTagType(currentMessage.status)">
              {{ getStatusText(currentMessage.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建人">{{ currentMessage.creator }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(currentMessage.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="发布时间">
            {{ currentMessage.publishTime ? formatDate(currentMessage.publishTime) : '未发布' }}
          </el-descriptions-item>
          <el-descriptions-item label="消息内容" :span="2">
            <div class="message-content-detail">{{ currentMessage.content }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- 阅读记录对话框 -->
    <el-dialog v-model="readRecordsVisible" title="阅读记录" width="800px">
      <el-table :data="readRecords" style="width: 100%">
        <el-table-column prop="userName" label="用户姓名" width="120" />
        <el-table-column prop="department" label="所属部门" width="150" />
        <el-table-column prop="readTime" label="阅读时间" width="160" />
        <el-table-column prop="readStatus" label="阅读状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.readStatus === 'read' ? 'success' : 'info'" size="small">
              {{ row.readStatus === 'read' ? '已读' : '未读' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="device" label="阅读设备" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Search,
  Refresh,
  Delete,
  Promotion,
  Message,
  Select,
  EditPen,
  View
} from '@element-plus/icons-vue'
import * as messageApi from '@/api/system/message'

// 响应式数据
const loading = ref(false)
const searchQuery = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
const priorityFilter = ref('')
const dateRange = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const totalMessages = ref(0)
const selectedMessages = ref([])
const messages = ref([])

// 对话框状态
const messageDialogVisible = ref(false)
const messageDetailVisible = ref(false)
const readRecordsVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const currentMessage = ref(null)
const readRecords = ref([])

// 统计数据
const stats = reactive({
  totalMessages: 0,
  publishedMessages: 0,
  draftMessages: 0,
  totalViews: 0
})

// 表单数据
const form = reactive({
  id: null,
  title: '',
  content: '',
  type: '',
  priority: 'medium',
  targetType: 'all',
  targetDepartments: [],
  targetUsers: [],
  scheduled: false,
  scheduleTime: null
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入消息标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入消息内容', trigger: 'blur' },
    { min: 5, max: 2000, message: '内容长度在 5 到 2000 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择消息类型', trigger: 'change' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ]
}

// 消息类型选项
const messageTypes = [
  { label: '系统通知', value: 'system' },
  { label: '公告', value: 'announcement' },
  { label: '活动', value: 'activity' },
  { label: '提醒', value: 'reminder' },
  { label: '警告', value: 'warning' }
]

// 部门列表
const departments = ref([
  { id: 1, name: '技术部' },
  { id: 2, name: '人力资源部' },
  { id: 3, name: '市场部' },
  { id: 4, name: '财务部' }
])

// 用户列表
const users = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' },
  { id: 4, name: '赵六' }
])

// 计算属性
const dialogTitle = computed(() => {
  return isEdit.value ? '编辑消息' : '发布消息'
})

const filteredMessages = computed(() => {
  let filtered = messages.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(msg =>
      msg.title.toLowerCase().includes(query) ||
      msg.content.toLowerCase().includes(query)
    )
  }

  if (typeFilter.value) {
    filtered = filtered.filter(msg => msg.type === typeFilter.value)
  }

  if (statusFilter.value) {
    filtered = filtered.filter(msg => msg.status === statusFilter.value)
  }

  if (priorityFilter.value) {
    filtered = filtered.filter(msg => msg.priority === priorityFilter.value)
  }

  if (dateRange.value && dateRange.value.length === 2) {
    filtered = filtered.filter(msg => {
      const msgTime = new Date(msg.createTime).getTime()
      const startTime = new Date(dateRange.value[0]).getTime()
      const endTime = new Date(dateRange.value[1]).getTime()
      return msgTime >= startTime && msgTime <= endTime
    })
  }

  return filtered
})

// 方法
const loadMessages = async () => {
  loading.value = true
  try {
    // 模拟API调用，使用模拟数据
    await new Promise(resolve => setTimeout(resolve, 500))

    const mockMessages = [
      {
        id: 1,
        title: '系统升级维护通知',
        content: '为了提供更好的服务体验，系统将于本周六晚上22:00-24:00进行升级维护，届时将无法访问系统，请提前安排好工作，给您带来的不便敬请谅解。',
        type: 'system',
        priority: 'high',
        status: 'published',
        creator: '系统管理员',
        createTime: '2024-01-15 09:00:00',
        publishTime: '2024-01-15 09:05:00',
        targetCount: 150,
        readCount: 128,
        targetType: 'all'
      },
      {
        id: 2,
        title: '春节放假通知',
        content: '根据国家法定节假日安排，春节假期为2月10日-2月18日，共9天。请各部门提前做好假期值班安排，祝大家春节快乐！',
        type: 'announcement',
        priority: 'medium',
        status: 'published',
        creator: '人事部',
        createTime: '2024-01-14 15:30:00',
        publishTime: '2024-01-14 16:00:00',
        targetCount: 150,
        readCount: 145,
        targetType: 'all'
      },
      {
        id: 3,
        title: '技术培训邀请',
        content: '技术部将于下周三举办Vue3新特性培训，欢迎对前端技术感兴趣的同事参加。培训时间：下周三14:00-17:00，地点：会议室A。',
        type: 'activity',
        priority: 'medium',
        status: 'draft',
        creator: '技术部',
        createTime: '2024-01-13 11:20:00',
        publishTime: null,
        targetCount: 0,
        readCount: 0,
        targetType: 'department'
      },
      {
        id: 4,
        title: '月度考勤提醒',
        content: '请各位同事及时完成本月考勤记录的提交，截止时间为本月最后一个工作日。如有疑问请联系人事部。',
        type: 'reminder',
        priority: 'low',
        status: 'published',
        creator: '人事部',
        createTime: '2024-01-12 10:15:00',
        publishTime: '2024-01-12 10:20:00',
        targetCount: 150,
        readCount: 89,
        targetType: 'all'
      },
      {
        id: 5,
        title: '安全警告：密码安全',
        content: '近期发现部分用户使用弱密码，存在安全风险。请立即更换为强密码，包含大小写字母、数字和特殊字符，长度不少于8位。',
        type: 'warning',
        priority: 'high',
        status: 'published',
        creator: '信息安全部',
        createTime: '2024-01-11 16:45:00',
        publishTime: '2024-01-11 16:50:00',
        targetCount: 150,
        readCount: 112,
        targetType: 'all'
      }
    ]

    messages.value = mockMessages
    totalMessages.value = mockMessages.length

    // 更新统计数据
    stats.totalMessages = mockMessages.length
    stats.publishedMessages = mockMessages.filter(msg => msg.status === 'published').length
    stats.draftMessages = mockMessages.filter(msg => msg.status === 'draft').length
    stats.totalViews = mockMessages.reduce((sum, msg) => sum + (msg.readCount || 0), 0)
  } catch (error) {
    console.error('获取消息列表失败:', error)
    ElMessage.error('获取消息列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadMessages()
}

const handleFilter = () => {
  currentPage.value = 1
  loadMessages()
}

const handleDateChange = () => {
  currentPage.value = 1
  loadMessages()
}

const handleReset = () => {
  searchQuery.value = ''
  typeFilter.value = ''
  statusFilter.value = ''
  priorityFilter.value = ''
  dateRange.value = []
  currentPage.value = 1
  loadMessages()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  loadMessages()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  loadMessages()
}

const handleSelectionChange = (selection) => {
  selectedMessages.value = selection
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  messageDialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.keys(form).forEach(key => {
    if (key in row) {
      form[key] = row[key]
    }
  })
  messageDialogVisible.value = true
}

const handleView = (row) => {
  currentMessage.value = row
  messageDetailVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除消息"${row.title}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 模拟删除
    ElMessage.success('删除成功')
    loadMessages()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }
}

const handlePublish = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要发布消息"${row.title}"吗？`,
      '确认发布',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 模拟发布
    row.status = 'published'
    row.publishTime = new Date().toLocaleString()
    ElMessage.success('发布成功')
    loadMessages()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('发布失败')
      console.error(error)
    }
  }
}

const handleWithdraw = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要撤回消息"${row.title}"吗？撤回后用户将无法查看此消息。`,
      '确认撤回',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 模拟撤回
    row.status = 'withdrawn'
    ElMessage.success('撤回成功')
    loadMessages()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('撤回失败')
      console.error(error)
    }
  }
}

const handleBatchPublish = async () => {
  if (selectedMessages.value.length === 0) {
    ElMessage.warning('请先选择要发布的消息')
    return
  }

  const draftMessages = selectedMessages.value.filter(msg => msg.status === 'draft')
  if (draftMessages.length === 0) {
    ElMessage.warning('选中的消息中没有可发布的草稿')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要批量发布 ${draftMessages.length} 条消息吗？`,
      '确认批量发布',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 模拟批量发布
    ElMessage.success(`成功发布 ${draftMessages.length} 条消息`)
    selectedMessages.value = []
    loadMessages()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量发布失败')
      console.error(error)
    }
  }
}

const handleBatchWithdraw = async () => {
  if (selectedMessages.value.length === 0) {
    ElMessage.warning('请先选择要撤回的消息')
    return
  }

  const publishedMessages = selectedMessages.value.filter(msg => msg.status === 'published')
  if (publishedMessages.length === 0) {
    ElMessage.warning('选中的消息中没有可撤回的已发布消息')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要批量撤回 ${publishedMessages.length} 条消息吗？`,
      '确认批量撤回',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 模拟批量撤回
    ElMessage.success(`成功撤回 ${publishedMessages.length} 条消息`)
    selectedMessages.value = []
    loadMessages()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量撤回失败')
      console.error(error)
    }
  }
}

const handleBatchDelete = async () => {
  if (selectedMessages.value.length === 0) {
    ElMessage.warning('请先选择要删除的消息')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedMessages.value.length} 条消息吗？`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 模拟批量删除
    ElMessage.success(`成功删除 ${selectedMessages.value.length} 条消息`)
    selectedMessages.value = []
    loadMessages()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
      console.error(error)
    }
  }
}

const handleViewReadRecords = async (row) => {
  // 模拟获取阅读记录
  readRecords.value = [
    {
      userName: '张三',
      department: '技术部',
      readTime: '2024-01-15 10:30:00',
      readStatus: 'read',
      device: 'PC'
    },
    {
      userName: '李四',
      department: '人事部',
      readTime: '2024-01-15 11:15:00',
      readStatus: 'read',
      device: 'Mobile'
    },
    {
      userName: '王五',
      department: '市场部',
      readTime: '',
      readStatus: 'unread',
      device: ''
    }
  ]
  readRecordsVisible.value = true
}

const resetForm = () => {
  form.id = null
  form.title = ''
  form.content = ''
  form.type = ''
  form.priority = 'medium'
  form.targetType = 'all'
  form.targetDepartments = []
  form.targetUsers = []
  form.scheduled = false
  form.scheduleTime = null

  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

const handleSaveDraft = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    // 模拟保存草稿
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success('草稿保存成功')
    messageDialogVisible.value = false
    loadMessages()
  } catch (error) {
    ElMessage.error('保存草稿失败')
    console.error(error)
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    // 模拟提交
    await new Promise(resolve => setTimeout(resolve, 1000))

    const action = form.scheduled ? '定时发布' : '发布'
    ElMessage.success(`${action}成功`)
    messageDialogVisible.value = false
    loadMessages()
  } catch (error) {
    ElMessage.error('发布失败')
    console.error(error)
  }
}

// 工具函数
const getTypeTagType = (type) => {
  const typeMap = {
    system: 'primary',
    announcement: 'success',
    activity: 'warning',
    reminder: 'info',
    warning: 'danger'
  }
  return typeMap[type] || 'info'
}

const getTypeText = (type) => {
  const textMap = {
    system: '系统通知',
    announcement: '公告',
    activity: '活动',
    reminder: '提醒',
    warning: '警告'
  }
  return textMap[type] || type
}

const getPriorityTagType = (priority) => {
  const typeMap = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return typeMap[priority] || 'info'
}

const getPriorityText = (priority) => {
  const textMap = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return textMap[priority] || priority
}

const getStatusTagType = (status) => {
  const typeMap = {
    published: 'success',
    draft: 'warning',
    withdrawn: 'info'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    published: '已发布',
    draft: '草稿',
    withdrawn: '已撤回'
  }
  return textMap[status] || status
}

const getReadRate = (message) => {
  if (!message.targetCount || message.targetCount === 0) return 0
  return Math.round((message.readCount / message.targetCount) * 100)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadMessages()
})
</script>

<style scoped lang="scss">
.message-management-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  margin-bottom: 20px;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    h2 {
      margin: 0 0 8px 0;
      color: #303133;
      font-size: 24px;
      font-weight: 600;
    }

    .page-description {
      margin: 0;
      color: #909399;
      font-size: 14px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }
}

.operation-buttons {
  display: flex;
  gap: 4px;
  align-items: center;
  white-space: nowrap;

  .el-button {
    margin-left: 0 !important;

    & + .el-button {
      margin-left: 4px !important;
    }
  }
}

.stats-section {
  margin-bottom: 20px;

  .stats-card {
    :deep(.el-card__body) {
      padding: 20px;
    }

    .stats-content {
      display: flex;
      align-items: center;
      gap: 16px;

      .stats-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: white;

        &.primary {
          background: linear-gradient(135deg, #409eff, #66b1ff);
        }

        &.success {
          background: linear-gradient(135deg, #67c23a, #85ce61);
        }

        &.warning {
          background: linear-gradient(135deg, #e6a23c, #ebb563);
        }

        &.info {
          background: linear-gradient(135deg, #909399, #b1b3b8);
        }
      }

      .stats-info {
        flex: 1;

        .stats-number {
          font-size: 28px;
          font-weight: 600;
          color: #303133;
          line-height: 1;
          margin-bottom: 4px;
        }

        .stats-label {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }
}

.filter-section {
  margin-bottom: 20px;

  .filter-content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .filter-left {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .filter-right {
      display: flex;
      gap: 12px;
      align-items: center;
    }
  }
}

.message-list-section {
  .message-info {
    .message-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      span {
        font-size: 14px;
        font-weight: 500;
        color: #303133;
      }

      .message-badges {
        display: flex;
        gap: 4px;
      }
    }

    .message-content {
      font-size: 13px;
      color: #606266;
      margin-bottom: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      line-height: 1.4;
    }

    .message-meta {
      font-size: 12px;
      color: #909399;
      display: flex;
      gap: 12px;

      .creator {
        &::before {
          content: '创建者: ';
        }
      }

      .create-time {
        &::before {
          content: '创建时间: ';
        }
      }
    }
  }

  .publish-info {
    font-size: 12px;

    .publish-time {
      color: #67c23a;
      margin-bottom: 4px;
    }

    .target-count {
      color: #909399;
    }
  }

  .not-published {
    color: #909399;
    font-size: 12px;
  }

  .read-stats {
    font-size: 12px;

    .read-count {
      margin-bottom: 4px;
    }

    .read-rate {
      color: #909399;
    }
  }

  .batch-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;
    margin: 16px 0;

    .batch-info {
      color: #606266;
      font-size: 14px;
    }

    .batch-buttons {
      display: flex;
      gap: 8px;
    }
  }

  .pagination-wrapper {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}

.message-detail {
  .message-content-detail {
    line-height: 1.6;
    color: #303133;
    white-space: pre-wrap;
  }
}

:deep(.el-table) {
  .el-button {
    margin-right: 8px;

    &:last-child {
      margin-right: 0;
    }
  }
}
</style>