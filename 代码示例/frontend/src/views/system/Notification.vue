<template>
  <div class="notification-management-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h2>消息管理</h2>
        <p class="page-description">管理系统通知、邮件通知、短信通知等各类消息推送</p>
      </div>
    </div>

    <!-- 通知类型切换 -->
    <div class="tabs-section">
      <el-card>
        <el-tabs v-model="activeTab" @tab-click="handleTabChange">
          <el-tab-pane name="system">
            <template #label>
              <span class="tab-label">
                <el-icon><Bell /></el-icon>
                <span>系统通知</span>
              </span>
            </template>
          </el-tab-pane>
          <el-tab-pane name="email">
            <template #label>
              <span class="tab-label">
                <el-icon><Message /></el-icon>
                <span>邮件通知</span>
              </span>
            </template>
          </el-tab-pane>
          <el-tab-pane name="sms">
            <template #label>
              <span class="tab-label">
                <el-icon><ChatDotRound /></el-icon>
                <span>短信通知</span>
              </span>
            </template>
          </el-tab-pane>
          <el-tab-pane name="template">
            <template #label>
              <span class="tab-label">
                <el-icon><Document /></el-icon>
                <span>通知模板</span>
              </span>
            </template>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>

    <!-- 系统通知 -->
    <div v-show="activeTab === 'system'" class="content-section">
      <el-card>
        <template #header>
          <div class="section-header">
            <span>系统通知管理</span>
            <el-button type="primary" @click="showCreateNotification">
              <el-icon><Plus /></el-icon>
              发布通知
            </el-button>
          </div>
        </template>

        <!-- 筛选条件 -->
        <div class="filter-section">
          <el-form :inline="true" :model="systemFilter" class="filter-form">
            <el-form-item label="通知类型">
              <el-select v-model="systemFilter.type" clearable placeholder="全部类型" style="width: 140px">
                <el-option label="系统公告" value="announcement" />
                <el-option label="维护通知" value="maintenance" />
                <el-option label="功能更新" value="update" />
                <el-option label="重要通知" value="important" />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="systemFilter.status" clearable placeholder="全部状态" style="width: 120px">
                <el-option label="已发布" value="published" />
                <el-option label="草稿" value="draft" />
                <el-option label="已过期" value="expired" />
              </el-select>
            </el-form-item>
            <el-form-item label="发布时间">
              <el-date-picker
                v-model="systemFilter.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 280px"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="searchSystemNotifications">查询</el-button>
              <el-button @click="resetSystemFilter">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 通知列表 -->
        <el-table :data="systemNotifications" v-loading="loading" stripe>
          <el-table-column prop="title" label="通知标题" min-width="200" />
          <el-table-column prop="type" label="类型" width="120">
            <template #default="{ row }">
              <el-tag :type="getNotificationTypeTag(row.type)" size="small">
                {{ getNotificationTypeName(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="priority" label="优先级" width="100">
            <template #default="{ row }">
              <el-tag :type="getPriorityTag(row.priority)" size="small">
                {{ getPriorityName(row.priority) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="readCount" label="已读/总数" width="140">
            <template #default="{ row }">
              <div class="read-progress">
                <span>{{ row.readCount }}/{{ row.targetCount }}</span>
                <el-progress
                  :percentage="Math.round(row.readCount / row.targetCount * 100)"
                  :stroke-width="4"
                  :show-text="false"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="publishTime" label="发布时间" width="160" />
          <el-table-column prop="expireTime" label="过期时间" width="160" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusTag(row.status)" size="small">
                {{ getStatusName(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button size="small" type="primary" link @click="viewNotification(row)">查看</el-button>
              <el-button size="small" type="warning" link @click="editNotification(row)">编辑</el-button>
              <el-button size="small" type="danger" link @click="deleteNotification(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="systemPagination.currentPage"
            v-model:page-size="systemPagination.pageSize"
            :page-sizes="[10, 20, 30, 50]"
            :total="systemPagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSystemSizeChange"
            @current-change="handleSystemCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 邮件通知配置 -->
    <div v-show="activeTab === 'email'" class="content-section">
      <el-card>
        <template #header>
          <div class="section-header">
            <span>邮件通知配置</span>
            <el-button type="primary" @click="saveEmailNotificationConfig">保存配置</el-button>
          </div>
        </template>

        <el-form :model="emailConfig" label-width="150px" class="config-form">
          <el-form-item label="用户注册通知">
            <el-switch v-model="emailConfig.userRegistration" />
            <span class="config-desc">新用户注册时发送欢迎邮件</span>
          </el-form-item>

          <el-form-item label="系统维护通知">
            <el-switch v-model="emailConfig.maintenance" />
            <span class="config-desc">系统维护前发送邮件通知</span>
          </el-form-item>

          <el-form-item label="密码重置通知">
            <el-switch v-model="emailConfig.passwordReset" />
            <span class="config-desc">用户重置密码时发送确认邮件</span>
          </el-form-item>

          <el-form-item label="重要公告通知">
            <el-switch v-model="emailConfig.importantAnnouncement" />
            <span class="config-desc">发布重要公告时同步发送邮件</span>
          </el-form-item>

          <el-form-item label="账号异常通知">
            <el-switch v-model="emailConfig.accountAlert" />
            <span class="config-desc">检测到账号异常登录时发送警告</span>
          </el-form-item>

          <el-form-item label="发送频率限制">
            <el-input-number v-model="emailConfig.rateLimit" :min="1" :max="1000" />
            <span class="config-desc">每小时最大发送邮件数量</span>
          </el-form-item>

          <el-form-item label="重试次数">
            <el-input-number v-model="emailConfig.retryCount" :min="0" :max="5" />
            <span class="config-desc">发送失败时的重试次数</span>
          </el-form-item>

          <el-form-item label="发送时间段">
            <el-time-picker
              v-model="emailConfig.sendTimeRange"
              is-range
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="HH:mm"
            />
            <span class="config-desc">限制邮件发送的时间段</span>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 短信通知配置 -->
    <div v-show="activeTab === 'sms'" class="content-section">
      <el-card>
        <template #header>
          <div class="section-header">
            <span>短信通知配置</span>
            <el-button type="primary" @click="saveSmsConfig">保存配置</el-button>
          </div>
        </template>

        <el-form :model="smsConfig" label-width="150px" class="config-form">
          <el-form-item label="短信服务商">
            <el-select v-model="smsConfig.provider" style="width: 200px">
              <el-option label="阿里云" value="aliyun" />
              <el-option label="腾讯云" value="tencent" />
              <el-option label="华为云" value="huawei" />
              <el-option label="网易云信" value="netease" />
            </el-select>
          </el-form-item>

          <el-form-item label="Access Key">
            <el-input v-model="smsConfig.accessKey" style="width: 300px" />
          </el-form-item>

          <el-form-item label="Secret Key">
            <el-input
              v-model="smsConfig.secretKey"
              type="password"
              show-password
              style="width: 300px"
            />
          </el-form-item>

          <el-form-item label="签名">
            <el-input v-model="smsConfig.signature" placeholder="短信签名" style="width: 200px" />
          </el-form-item>

          <el-form-item label="启用场景">
            <el-checkbox-group v-model="smsConfig.enabledScenarios">
              <el-checkbox label="loginVerification">登录验证码</el-checkbox>
              <el-checkbox label="passwordReset">密码重置</el-checkbox>
              <el-checkbox label="accountAlert">账号异常</el-checkbox>
              <el-checkbox label="urgentNotice">紧急通知</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="发送限制">
            <el-input-number v-model="smsConfig.dailyLimit" :min="10" :max="1000" />
            <span class="config-desc">每日最大发送量</span>
          </el-form-item>

          <el-form-item label="测试手机号">
            <el-input v-model="smsConfig.testPhone" placeholder="用于测试的手机号" style="width: 200px" />
            <el-button @click="sendTestSms" style="margin-left: 10px">发送测试</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 通知模板 -->
    <div v-show="activeTab === 'template'" class="content-section">
      <el-card>
        <template #header>
          <div class="section-header">
            <span>通知模板管理</span>
            <el-button type="primary" @click="showCreateTemplate">
              <el-icon><Plus /></el-icon>
              新建模板
            </el-button>
          </div>
        </template>

        <el-table :data="notificationTemplates" stripe>
          <el-table-column prop="name" label="模板名称" min-width="200" />
          <el-table-column prop="type" label="类型" width="120">
            <template #default="{ row }">
              <el-tag size="small">{{ getTemplateTypeName(row.type) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="category" label="分类" width="120" />
          <el-table-column prop="subject" label="主题/标题" min-width="200" />
          <el-table-column prop="updateTime" label="更新时间" width="160" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
                {{ row.status === 'active' ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button size="small" type="primary" link @click="editTemplate(row)">编辑</el-button>
              <el-button size="small" type="success" link @click="previewTemplate(row)">预览</el-button>
              <el-button size="small" type="danger" link @click="deleteTemplate(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 创建/编辑通知对话框 -->
    <el-dialog
      v-model="notificationDialogVisible"
      :title="isEditNotification ? '编辑通知' : '发布通知'"
      width="700px"
      destroy-on-close
    >
      <el-form
        ref="notificationFormRef"
        :model="notificationForm"
        :rules="notificationRules"
        label-width="100px"
      >
        <el-form-item label="通知标题" prop="title">
          <el-input v-model="notificationForm.title" placeholder="请输入通知标题" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="通知类型" prop="type">
              <el-select v-model="notificationForm.type" style="width: 100%">
                <el-option label="系统公告" value="announcement" />
                <el-option label="维护通知" value="maintenance" />
                <el-option label="功能更新" value="update" />
                <el-option label="重要通知" value="important" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="notificationForm.priority" style="width: 100%">
                <el-option label="低" value="low" />
                <el-option label="中" value="medium" />
                <el-option label="高" value="high" />
                <el-option label="紧急" value="urgent" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="通知内容" prop="content">
          <el-input
            v-model="notificationForm.content"
            type="textarea"
            :rows="6"
            placeholder="请输入通知内容"
          />
        </el-form-item>

        <el-form-item label="过期时间">
          <el-date-picker
            v-model="notificationForm.expireTime"
            type="datetime"
            placeholder="选择过期时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="发布状态">
          <el-radio-group v-model="notificationForm.status">
            <el-radio label="draft">保存为草稿</el-radio>
            <el-radio label="published">立即发布</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="notificationDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleNotificationSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Bell,
  Message,
  ChatDotRound,
  Document,
  Plus
} from '@element-plus/icons-vue'

// 响应式数据
const activeTab = ref('system')
const loading = ref(false)
const submitLoading = ref(false)
const notificationDialogVisible = ref(false)
const isEditNotification = ref(false)
const notificationFormRef = ref()

// 系统通知相关
const systemNotifications = ref([])
const systemFilter = reactive({
  type: '',
  status: '',
  dateRange: []
})
const systemPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 邮件配置
const emailConfig = reactive({
  userRegistration: true,
  maintenance: true,
  passwordReset: true,
  importantAnnouncement: false,
  accountAlert: true,
  rateLimit: 100,
  retryCount: 3,
  sendTimeRange: []
})

// 短信配置
const smsConfig = reactive({
  provider: 'aliyun',
  accessKey: '',
  secretKey: '',
  signature: '',
  enabledScenarios: ['loginVerification', 'accountAlert'],
  dailyLimit: 100,
  testPhone: ''
})

// 通知模板
const notificationTemplates = ref([])

// 通知表单
const notificationForm = reactive({
  id: null,
  title: '',
  type: '',
  priority: 'medium',
  content: '',
  expireTime: '',
  status: 'draft'
})

// 表单验证规则
const notificationRules = {
  title: [
    { required: true, message: '请输入通知标题', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择通知类型', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入通知内容', trigger: 'blur' }
  ]
}

// 方法
const handleTabChange = (tab) => {
  activeTab.value = tab.props.name
  if (tab.props.name === 'system') {
    loadSystemNotifications()
  } else if (tab.props.name === 'template') {
    loadNotificationTemplates()
  }
}

const loadSystemNotifications = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 800))

    // 模拟通知数据
    systemNotifications.value = [
      {
        id: 1,
        title: '系统维护通知',
        type: 'maintenance',
        priority: 'high',
        content: '系统将于今晚22:00-23:00进行维护升级，期间服务将暂时中断，请提前安排工作。',
        readCount: 145,
        targetCount: 200,
        publishTime: '2024-01-15 10:00:00',
        expireTime: '2024-01-20 10:00:00',
        status: 'published'
      },
      {
        id: 2,
        title: '新功能上线公告',
        type: 'update',
        priority: 'medium',
        content: '我们很高兴地宣布，新的报表功能已正式上线！现在您可以生成更详细的数据分析报告。',
        readCount: 89,
        targetCount: 200,
        publishTime: '2024-01-14 14:30:00',
        expireTime: '2024-01-25 14:30:00',
        status: 'published'
      },
      {
        id: 3,
        title: '安全策略更新',
        type: 'important',
        priority: 'urgent',
        content: '为提高系统安全性，我们已更新密码策略。请在下次登录时更新您的密码。',
        readCount: 167,
        targetCount: 200,
        publishTime: '2024-01-13 09:15:00',
        expireTime: '2024-01-30 09:15:00',
        status: 'published'
      },
      {
        id: 4,
        title: '节假日放假通知',
        type: 'announcement',
        priority: 'low',
        content: '根据国家法定节假日安排，春节期间系统正常运行，客服支持时间有所调整。',
        readCount: 0,
        targetCount: 200,
        publishTime: '',
        expireTime: '2024-02-20 18:00:00',
        status: 'draft'
      }
    ]

    systemPagination.total = systemNotifications.value.length
  } catch (error) {
    ElMessage.error('加载通知数据失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const loadNotificationTemplates = async () => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    notificationTemplates.value = [
      {
        id: 1,
        name: '用户注册欢迎模板',
        type: 'email',
        category: '用户管理',
        subject: '欢迎加入我们的平台！',
        updateTime: '2024-01-15 10:00:00',
        status: 'active'
      },
      {
        id: 2,
        name: '密码重置通知模板',
        type: 'email',
        category: '安全管理',
        subject: '您的密码已重置',
        updateTime: '2024-01-14 16:30:00',
        status: 'active'
      },
      {
        id: 3,
        name: '登录验证码模板',
        type: 'sms',
        category: '安全管理',
        subject: '登录验证码',
        updateTime: '2024-01-13 11:20:00',
        status: 'active'
      },
      {
        id: 4,
        name: '系统维护通知模板',
        type: 'system',
        category: '系统管理',
        subject: '系统维护通知',
        updateTime: '2024-01-12 09:45:00',
        status: 'inactive'
      }
    ]
  } catch (error) {
    ElMessage.error('加载模板数据失败')
    console.error(error)
  }
}

const searchSystemNotifications = () => {
  loadSystemNotifications()
}

const resetSystemFilter = () => {
  systemFilter.type = ''
  systemFilter.status = ''
  systemFilter.dateRange = []
  loadSystemNotifications()
}

const showCreateNotification = () => {
  isEditNotification.value = false
  resetNotificationForm()
  notificationDialogVisible.value = true
}

const editNotification = (row) => {
  isEditNotification.value = true
  Object.keys(notificationForm).forEach(key => {
    notificationForm[key] = row[key] || ''
  })
  notificationDialogVisible.value = true
}

const viewNotification = (row) => {
  ElMessageBox.alert(row.content, row.title, {
    confirmButtonText: '关闭',
    type: 'info'
  })
}

const deleteNotification = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除通知"${row.title}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    ElMessage.success('删除成功')
    loadSystemNotifications()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSystemSizeChange = (size) => {
  systemPagination.pageSize = size
  systemPagination.currentPage = 1
  loadSystemNotifications()
}

const handleSystemCurrentChange = (page) => {
  systemPagination.currentPage = page
  loadSystemNotifications()
}

const resetNotificationForm = () => {
  notificationForm.id = null
  notificationForm.title = ''
  notificationForm.type = ''
  notificationForm.priority = 'medium'
  notificationForm.content = ''
  notificationForm.expireTime = ''
  notificationForm.status = 'draft'

  if (notificationFormRef.value) {
    notificationFormRef.value.clearValidate()
  }
}

const handleNotificationSubmit = async () => {
  if (!notificationFormRef.value) return

  try {
    const valid = await notificationFormRef.value.validate()
    if (!valid) return

    submitLoading.value = true

    // 模拟提交
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success(isEditNotification.value ? '编辑成功' : '发布成功')
    notificationDialogVisible.value = false
    loadSystemNotifications()
  } catch (error) {
    ElMessage.error('操作失败')
    console.error(error)
  } finally {
    submitLoading.value = false
  }
}

const saveEmailNotificationConfig = async () => {
  try {
    // 模拟保存配置
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('邮件通知配置保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
    console.error(error)
  }
}

const saveSmsConfig = async () => {
  try {
    // 模拟保存配置
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('短信通知配置保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
    console.error(error)
  }
}

const sendTestSms = async () => {
  if (!smsConfig.testPhone) {
    ElMessage.warning('请先输入测试手机号')
    return
  }

  try {
    // 模拟发送测试短信
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('测试短信发送成功')
  } catch (error) {
    ElMessage.error('发送失败')
    console.error(error)
  }
}

const showCreateTemplate = () => {
  ElMessage.info('模板创建功能开发中...')
}

const editTemplate = (row) => {
  ElMessage.info('模板编辑功能开发中...')
}

const previewTemplate = (row) => {
  ElMessage.info('模板预览功能开发中...')
}

const deleteTemplate = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除模板"${row.name}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    ElMessage.success('删除成功')
    loadNotificationTemplates()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 辅助方法
const getNotificationTypeTag = (type) => {
  const tagMap = {
    announcement: '',
    maintenance: 'warning',
    update: 'success',
    important: 'danger'
  }
  return tagMap[type] || ''
}

const getNotificationTypeName = (type) => {
  const nameMap = {
    announcement: '系统公告',
    maintenance: '维护通知',
    update: '功能更新',
    important: '重要通知'
  }
  return nameMap[type] || type
}

const getPriorityTag = (priority) => {
  const tagMap = {
    low: 'info',
    medium: '',
    high: 'warning',
    urgent: 'danger'
  }
  return tagMap[priority] || ''
}

const getPriorityName = (priority) => {
  const nameMap = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急'
  }
  return nameMap[priority] || priority
}

const getStatusTag = (status) => {
  const tagMap = {
    published: 'success',
    draft: 'info',
    expired: 'danger'
  }
  return tagMap[status] || ''
}

const getStatusName = (status) => {
  const nameMap = {
    published: '已发布',
    draft: '草稿',
    expired: '已过期'
  }
  return nameMap[status] || status
}

const getTemplateTypeName = (type) => {
  const nameMap = {
    email: '邮件',
    sms: '短信',
    system: '系统'
  }
  return nameMap[type] || type
}

// 生命周期
onMounted(() => {
  loadSystemNotifications()
})
</script>

<style scoped lang="scss">
.notification-management-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  margin-bottom: 20px;

  .header-content {
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
  }
}

.tabs-section {
  margin-bottom: 20px;

  .tab-label {
    display: flex;
    align-items: center;
    gap: 6px;
  }
}

.content-section {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .filter-section {
    margin-bottom: 20px;
    padding: 20px 0;
    border-bottom: 1px solid #e4e7ed;

    .filter-form {
      margin: 0;
    }
  }

  .read-progress {
    span {
      display: block;
      margin-bottom: 4px;
      font-size: 12px;
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    padding: 20px 0 0 0;
  }

  .config-form {
    max-width: 800px;

    .config-desc {
      margin-left: 12px;
      color: #909399;
      font-size: 13px;
    }
  }
}

:deep(.el-card) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .el-card__header {
    padding: 16px 20px;
    border-bottom: 1px solid #e4e7ed;
  }

  .el-card__body {
    padding: 20px;
  }
}

:deep(.el-tabs__nav-wrap) {
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-table) {
  .el-button {
    margin-right: 8px;

    &:last-child {
      margin-right: 0;
    }
  }
}

:deep(.el-progress) {
  margin-top: 2px;
}

:deep(.el-checkbox-group) {
  .el-checkbox {
    margin-right: 20px;
    margin-bottom: 8px;
  }
}
</style>