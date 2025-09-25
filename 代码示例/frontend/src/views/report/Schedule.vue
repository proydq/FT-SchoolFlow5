<template>
  <div class="schedule-report-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h2>定时报告</h2>
        <div class="header-actions">
          <el-button @click="showTemplateDialog = true">
            <el-icon><Document /></el-icon>
            报告模板
          </el-button>
          <el-button type="primary" @click="createNewSchedule">
            <el-icon><Plus /></el-icon>
            新建定时报告
          </el-button>
        </div>
      </div>
    </div>

    <!-- 筛选和统计 -->
    <div class="filter-section">
      <div class="filter-content">
        <div class="filter-left">
          <el-input
            v-model="searchQuery"
            placeholder="搜索报告名称"
            prefix-icon="Search"
            style="width: 300px"
            @change="handleSearch"
          />
          <el-select v-model="statusFilter" placeholder="状态" style="width: 120px" @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
            <el-option label="执行中" value="running" />
          </el-select>
          <el-select v-model="frequencyFilter" placeholder="频率" style="width: 120px" @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="每日" value="daily" />
            <el-option label="每周" value="weekly" />
            <el-option label="每月" value="monthly" />
          </el-select>
        </div>
        <div class="filter-right">
          <div class="stats-item">
            <span class="label">总报告数:</span>
            <span class="value">{{ totalSchedules }}</span>
          </div>
          <div class="stats-item">
            <span class="label">启用:</span>
            <span class="value enabled">{{ enabledCount }}</span>
          </div>
          <div class="stats-item">
            <span class="label">执行中:</span>
            <span class="value running">{{ runningCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 定时报告列表 -->
    <div class="schedule-list-section">
      <el-table :data="filteredSchedules" style="width: 100%">
        <el-table-column prop="name" label="报告名称" width="200">
          <template #default="{ row }">
            <div class="report-name">
              <el-icon class="report-icon" :style="{ color: getStatusColor(row.status) }">
                <Timer />
              </el-icon>
              {{ row.name }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="template" label="模板" width="150" />
        <el-table-column prop="frequency" label="发送频率" width="120">
          <template #default="{ row }">
            <el-tag size="small" :type="getFrequencyTagType(row.frequency)">
              {{ getFrequencyLabel(row.frequency) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="schedule" label="执行时间" width="120" />
        <el-table-column prop="recipients" label="接收者" width="100">
          <template #default="{ row }">
            <span>{{ row.recipients.length }}人</span>
          </template>
        </el-table-column>
        <el-table-column prop="lastSent" label="最后发送" width="160" />
        <el-table-column prop="nextSend" label="下次发送" width="160" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="viewSchedule(row)">查看</el-button>
            <el-button size="small" type="primary" @click="editSchedule(row)">编辑</el-button>
            <el-switch
              v-model="row.enabled"
              size="small"
              @change="toggleSchedule(row)"
            />
            <el-dropdown trigger="click">
              <el-button size="small" type="info">
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="executeNow(row)">立即执行</el-dropdown-item>
                  <el-dropdown-item @click="viewHistory(row)">执行历史</el-dropdown-item>
                  <el-dropdown-item @click="duplicateSchedule(row)">复制</el-dropdown-item>
                  <el-dropdown-item divided @click="deleteSchedule(row)">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalSchedules"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 创建/编辑定时报告对话框 -->
    <el-dialog
      v-model="scheduleDialogVisible"
      :title="editingSchedule ? '编辑定时报告' : '新建定时报告'"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form :model="scheduleForm" :rules="scheduleRules" ref="scheduleFormRef" label-width="120px">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-form-item label="报告名称" prop="name">
              <el-input v-model="scheduleForm.name" placeholder="请输入报告名称" />
            </el-form-item>
            <el-form-item label="描述">
              <el-input
                v-model="scheduleForm.description"
                type="textarea"
                :rows="3"
                placeholder="请输入报告描述"
              />
            </el-form-item>
            <el-form-item label="报告模板" prop="template">
              <el-select v-model="scheduleForm.template" placeholder="选择报告模板" style="width: 100%">
                <el-option
                  v-for="template in reportTemplates"
                  :key="template.id"
                  :label="template.name"
                  :value="template.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="数据范围">
              <el-radio-group v-model="scheduleForm.dataRange">
                <el-radio label="last7days">最近7天</el-radio>
                <el-radio label="last30days">最近30天</el-radio>
                <el-radio label="lastmonth">上个月</el-radio>
                <el-radio label="custom">自定义</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="scheduleForm.dataRange === 'custom'" label="自定义范围">
              <el-date-picker
                v-model="scheduleForm.customDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              />
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="发送设置" name="schedule">
            <el-form-item label="发送频率" prop="frequency">
              <el-radio-group v-model="scheduleForm.frequency" @change="handleFrequencyChange">
                <el-radio label="daily">每日</el-radio>
                <el-radio label="weekly">每周</el-radio>
                <el-radio label="monthly">每月</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="发送时间" prop="time">
              <el-time-picker
                v-model="scheduleForm.time"
                placeholder="选择时间"
                format="HH:mm"
                value-format="HH:mm"
              />
            </el-form-item>
            <el-form-item v-if="scheduleForm.frequency === 'weekly'" label="星期几">
              <el-checkbox-group v-model="scheduleForm.weekdays">
                <el-checkbox label="1">周一</el-checkbox>
                <el-checkbox label="2">周二</el-checkbox>
                <el-checkbox label="3">周三</el-checkbox>
                <el-checkbox label="4">周四</el-checkbox>
                <el-checkbox label="5">周五</el-checkbox>
                <el-checkbox label="6">周六</el-checkbox>
                <el-checkbox label="0">周日</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item v-if="scheduleForm.frequency === 'monthly'" label="月份中的日期">
              <el-select v-model="scheduleForm.monthDay" placeholder="选择日期">
                <el-option
                  v-for="day in 31"
                  :key="day"
                  :label="`${day}号`"
                  :value="day"
                />
                <el-option label="月末" value="last" />
              </el-select>
            </el-form-item>
            <el-form-item label="时区">
              <el-select v-model="scheduleForm.timezone" placeholder="选择时区">
                <el-option label="北京时间 (UTC+8)" value="Asia/Shanghai" />
                <el-option label="东京时间 (UTC+9)" value="Asia/Tokyo" />
                <el-option label="纽约时间 (UTC-5)" value="America/New_York" />
                <el-option label="伦敦时间 (UTC+0)" value="Europe/London" />
              </el-select>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="接收者" name="recipients">
            <div class="recipients-section">
              <div class="recipients-header">
                <h4>接收者列表</h4>
                <el-button @click="showRecipientDialog = true">
                  <el-icon><Plus /></el-icon>
                  添加接收者
                </el-button>
              </div>
              <div class="recipients-list">
                <div v-for="(recipient, index) in scheduleForm.recipients" :key="index" class="recipient-item">
                  <div class="recipient-info">
                    <el-avatar size="small" :src="recipient.avatar">{{ recipient.name.charAt(0) }}</el-avatar>
                    <div class="recipient-details">
                      <div class="name">{{ recipient.name }}</div>
                      <div class="email">{{ recipient.email }}</div>
                    </div>
                  </div>
                  <div class="recipient-actions">
                    <el-tag size="small">{{ recipient.role }}</el-tag>
                    <el-button size="small" text @click="removeRecipient(index)">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="邮件设置" name="email">
            <el-form-item label="邮件主题" prop="emailSubject">
              <el-input v-model="scheduleForm.emailSubject" placeholder="请输入邮件主题" />
            </el-form-item>
            <el-form-item label="邮件内容">
              <el-input
                v-model="scheduleForm.emailBody"
                type="textarea"
                :rows="5"
                placeholder="请输入邮件正文内容"
              />
            </el-form-item>
            <el-form-item label="附件格式">
              <el-checkbox-group v-model="scheduleForm.attachmentFormats">
                <el-checkbox label="pdf">PDF</el-checkbox>
                <el-checkbox label="excel">Excel</el-checkbox>
                <el-checkbox label="csv">CSV</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="发送选项">
              <el-checkbox v-model="scheduleForm.includeCharts">包含图表</el-checkbox>
              <el-checkbox v-model="scheduleForm.compressAttachment">压缩附件</el-checkbox>
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <template #footer>
        <el-button @click="scheduleDialogVisible = false">取消</el-button>
        <el-button @click="testSchedule">测试发送</el-button>
        <el-button type="primary" @click="saveSchedule">保存</el-button>
      </template>
    </el-dialog>

    <!-- 添加接收者对话框 -->
    <el-dialog v-model="showRecipientDialog" title="添加接收者" width="600px">
      <div class="recipient-selector">
        <el-tabs v-model="recipientTab">
          <el-tab-pane label="从通讯录选择" name="contacts">
            <div class="contacts-search">
              <el-input
                v-model="contactSearch"
                placeholder="搜索联系人"
                prefix-icon="Search"
                @input="handleContactSearch"
              />
            </div>
            <div class="contacts-list">
              <div v-for="contact in filteredContacts" :key="contact.id" class="contact-item">
                <el-checkbox v-model="contact.selected" @change="handleContactSelect(contact)">
                  <div class="contact-info">
                    <el-avatar size="small" :src="contact.avatar">{{ contact.name.charAt(0) }}</el-avatar>
                    <div class="contact-details">
                      <div class="name">{{ contact.name }}</div>
                      <div class="email">{{ contact.email }}</div>
                      <div class="role">{{ contact.role }}</div>
                    </div>
                  </div>
                </el-checkbox>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="手动输入" name="manual">
            <el-form :model="newRecipient" label-width="80px">
              <el-form-item label="姓名">
                <el-input v-model="newRecipient.name" placeholder="请输入姓名" />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input v-model="newRecipient.email" placeholder="请输入邮箱地址" />
              </el-form-item>
              <el-form-item label="角色">
                <el-select v-model="newRecipient.role" placeholder="选择角色">
                  <el-option label="管理员" value="admin" />
                  <el-option label="营销经理" value="marketing_manager" />
                  <el-option label="数据分析师" value="analyst" />
                  <el-option label="其他" value="other" />
                </el-select>
              </el-form-item>
            </el-form>
            <el-button type="primary" @click="addManualRecipient">添加</el-button>
          </el-tab-pane>
        </el-tabs>
      </div>
      <template #footer>
        <el-button @click="showRecipientDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmAddRecipients">确定</el-button>
      </template>
    </el-dialog>

    <!-- 模板选择对话框 -->
    <el-dialog v-model="showTemplateDialog" title="报告模板" width="800px">
      <div class="template-gallery">
        <div class="template-grid">
          <div v-for="template in reportTemplates" :key="template.id" class="template-card">
            <div class="template-preview">
              <img :src="template.preview" :alt="template.name" />
            </div>
            <div class="template-info">
              <h4>{{ template.name }}</h4>
              <p>{{ template.description }}</p>
              <div class="template-meta">
                <el-tag size="small">{{ template.category }}</el-tag>
                <span class="usage-count">{{ template.usage }}次使用</span>
              </div>
            </div>
            <div class="template-actions">
              <el-button size="small" @click="previewTemplate(template)">预览</el-button>
              <el-button size="small" type="primary" @click="useTemplate(template)">使用</el-button>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 执行历史对话框 -->
    <el-dialog v-model="showHistoryDialog" title="执行历史" width="1000px">
      <div class="history-section">
        <div class="history-header">
          <h4>{{ currentSchedule?.name }} - 执行历史</h4>
          <div class="history-stats">
            <div class="stat-item">
              <span class="label">总执行次数:</span>
              <span class="value">{{ executionHistory.length }}</span>
            </div>
            <div class="stat-item">
              <span class="label">成功:</span>
              <span class="value success">{{ successCount }}</span>
            </div>
            <div class="stat-item">
              <span class="label">失败:</span>
              <span class="value error">{{ failureCount }}</span>
            </div>
            <div class="stat-item">
              <span class="label">成功率:</span>
              <span class="value">{{ successRate }}%</span>
            </div>
          </div>
        </div>
        <el-table :data="executionHistory" style="width: 100%">
          <el-table-column prop="executionTime" label="执行时间" width="180" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
                {{ row.status === 'success' ? '成功' : '失败' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="duration" label="执行时长" width="100" />
          <el-table-column prop="recipients" label="发送对象" width="100" />
          <el-table-column prop="fileSize" label="文件大小" width="100" />
          <el-table-column prop="error" label="错误信息" />
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button size="small" @click="viewExecutionDetail(row)">查看详情</el-button>
              <el-button size="small" v-if="row.status === 'success'" @click="downloadReport(row)">下载</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Document,
  Timer,
  Delete,
  MoreFilled,
  Search
} from '@element-plus/icons-vue'

// 基础数据
const searchQuery = ref('')
const statusFilter = ref('')
const frequencyFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(20)

// 对话框状态
const scheduleDialogVisible = ref(false)
const showRecipientDialog = ref(false)
const showTemplateDialog = ref(false)
const showHistoryDialog = ref(false)
const editingSchedule = ref(false)

// 表单数据
const scheduleForm = ref({
  name: '',
  description: '',
  template: '',
  dataRange: 'last7days',
  customDateRange: [],
  frequency: 'weekly',
  time: '09:00',
  weekdays: ['1'],
  monthDay: 1,
  timezone: 'Asia/Shanghai',
  recipients: [],
  emailSubject: '',
  emailBody: '',
  attachmentFormats: ['pdf'],
  includeCharts: true,
  compressAttachment: false,
  enabled: true
})

const scheduleRules = {
  name: [{ required: true, message: '请输入报告名称', trigger: 'blur' }],
  template: [{ required: true, message: '请选择报告模板', trigger: 'change' }],
  frequency: [{ required: true, message: '请选择发送频率', trigger: 'change' }],
  time: [{ required: true, message: '请选择发送时间', trigger: 'change' }],
  emailSubject: [{ required: true, message: '请输入邮件主题', trigger: 'blur' }]
}

// Tab状态
const activeTab = ref('basic')
const recipientTab = ref('contacts')

// 定时报告列表
const schedules = ref([
  {
    id: 1,
    name: '每周营销效果报告',
    template: '营销概览模板',
    frequency: 'weekly',
    schedule: '周一 09:00',
    recipients: [
      { id: 1, name: '张三', email: 'zhang@company.com', role: '营销总监' },
      { id: 2, name: '李四', email: 'li@company.com', role: '数据分析师' }
    ],
    lastSent: '2024-01-15 09:00',
    nextSend: '2024-01-22 09:00',
    status: 'enabled',
    enabled: true
  },
  {
    id: 2,
    name: '月度客户增长报告',
    template: '客户分析模板',
    frequency: 'monthly',
    schedule: '1号 10:00',
    recipients: [
      { id: 3, name: '王五', email: 'wang@company.com', role: '客户成功经理' }
    ],
    lastSent: '2024-01-01 10:00',
    nextSend: '2024-02-01 10:00',
    status: 'enabled',
    enabled: true
  },
  {
    id: 3,
    name: '每日渠道监控报告',
    template: '渠道效果模板',
    frequency: 'daily',
    schedule: '每日 08:00',
    recipients: [
      { id: 4, name: '赵六', email: 'zhao@company.com', role: '渠道经理' }
    ],
    lastSent: '2024-01-16 08:00',
    nextSend: '2024-01-17 08:00',
    status: 'running',
    enabled: true
  },
  {
    id: 4,
    name: '季度财务分析报告',
    template: '财务分析模板',
    frequency: 'monthly',
    schedule: '1号 14:00',
    recipients: [
      { id: 5, name: '孙七', email: 'sun@company.com', role: 'CFO' }
    ],
    lastSent: '2023-12-01 14:00',
    nextSend: '2024-03-01 14:00',
    status: 'disabled',
    enabled: false
  }
])

// 报告模板
const reportTemplates = ref([
  {
    id: 1,
    name: '营销概览模板',
    category: '营销报表',
    description: '包含核心营销指标的综合报表',
    preview: '/images/template-marketing.png',
    usage: 156
  },
  {
    id: 2,
    name: '客户分析模板',
    category: '客户报表',
    description: '客户行为和特征分析报表',
    preview: '/images/template-customer.png',
    usage: 89
  },
  {
    id: 3,
    name: '渠道效果模板',
    category: '渠道报表',
    description: '多渠道效果对比分析报表',
    preview: '/images/template-channel.png',
    usage: 67
  },
  {
    id: 4,
    name: '财务分析模板',
    category: '财务报表',
    description: '营销投入产出分析报表',
    preview: '/images/template-finance.png',
    usage: 43
  }
])

// 联系人列表
const contacts = ref([
  { id: 1, name: '张三', email: 'zhang@company.com', role: '营销总监', avatar: '', selected: false },
  { id: 2, name: '李四', email: 'li@company.com', role: '数据分析师', avatar: '', selected: false },
  { id: 3, name: '王五', email: 'wang@company.com', role: '客户成功经理', avatar: '', selected: false },
  { id: 4, name: '赵六', email: 'zhao@company.com', role: '渠道经理', avatar: '', selected: false },
  { id: 5, name: '孙七', email: 'sun@company.com', role: 'CFO', avatar: '', selected: false }
])

const contactSearch = ref('')
const newRecipient = ref({
  name: '',
  email: '',
  role: 'other'
})

// 执行历史
const currentSchedule = ref(null)
const executionHistory = ref([
  {
    id: 1,
    executionTime: '2024-01-15 09:00:00',
    status: 'success',
    duration: '45秒',
    recipients: '2人',
    fileSize: '2.3MB',
    error: ''
  },
  {
    id: 2,
    executionTime: '2024-01-08 09:00:00',
    status: 'success',
    duration: '52秒',
    recipients: '2人',
    fileSize: '2.1MB',
    error: ''
  },
  {
    id: 3,
    executionTime: '2024-01-01 09:00:00',
    status: 'failure',
    duration: '15秒',
    recipients: '0人',
    fileSize: '0MB',
    error: '邮件服务器连接失败'
  }
])

// 计算属性
const filteredSchedules = computed(() => {
  let filtered = schedules.value

  if (searchQuery.value) {
    filtered = filtered.filter(schedule => 
      schedule.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(schedule => schedule.status === statusFilter.value)
  }

  if (frequencyFilter.value) {
    filtered = filtered.filter(schedule => schedule.frequency === frequencyFilter.value)
  }

  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filtered.slice(start, end)
})

const totalSchedules = computed(() => schedules.value.length)
const enabledCount = computed(() => schedules.value.filter(s => s.status === 'enabled').length)
const runningCount = computed(() => schedules.value.filter(s => s.status === 'running').length)

const filteredContacts = computed(() => {
  if (!contactSearch.value) return contacts.value
  return contacts.value.filter(contact =>
    contact.name.toLowerCase().includes(contactSearch.value.toLowerCase()) ||
    contact.email.toLowerCase().includes(contactSearch.value.toLowerCase())
  )
})

const successCount = computed(() => executionHistory.value.filter(h => h.status === 'success').length)
const failureCount = computed(() => executionHistory.value.filter(h => h.status === 'failure').length)
const successRate = computed(() => {
  if (executionHistory.value.length === 0) return 0
  return Math.round((successCount.value / executionHistory.value.length) * 100)
})

// 工具函数
const getStatusColor = (status) => {
  const colors = {
    enabled: '#67C23A',
    disabled: '#909399',
    running: '#E6A23C'
  }
  return colors[status] || '#909399'
}

const getStatusTagType = (status) => {
  const types = {
    enabled: 'success',
    disabled: 'info',
    running: 'warning'
  }
  return types[status] || 'info'
}

const getStatusLabel = (status) => {
  const labels = {
    enabled: '启用',
    disabled: '禁用',
    running: '执行中'
  }
  return labels[status] || status
}

const getFrequencyTagType = (frequency) => {
  const types = {
    daily: 'warning',
    weekly: 'primary',
    monthly: 'success'
  }
  return types[frequency] || 'info'
}

const getFrequencyLabel = (frequency) => {
  const labels = {
    daily: '每日',
    weekly: '每周',
    monthly: '每月'
  }
  return labels[frequency] || frequency
}

// 事件处理
const handleSearch = () => {
  currentPage.value = 1
}

const handleFilter = () => {
  currentPage.value = 1
}

const handleSizeChange = (size) => {
  pageSize.value = size
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

const handleFrequencyChange = () => {
  if (scheduleForm.value.frequency === 'daily') {
    scheduleForm.value.weekdays = []
    scheduleForm.value.monthDay = null
  } else if (scheduleForm.value.frequency === 'weekly') {
    scheduleForm.value.weekdays = ['1']
    scheduleForm.value.monthDay = null
  } else if (scheduleForm.value.frequency === 'monthly') {
    scheduleForm.value.weekdays = []
    scheduleForm.value.monthDay = 1
  }
}

const handleContactSearch = () => {
  // 搜索联系人
}

const handleContactSelect = (contact) => {
  // 选择联系人
}

// 定时报告操作
const createNewSchedule = () => {
  editingSchedule.value = false
  scheduleForm.value = {
    name: '',
    description: '',
    template: '',
    dataRange: 'last7days',
    customDateRange: [],
    frequency: 'weekly',
    time: '09:00',
    weekdays: ['1'],
    monthDay: 1,
    timezone: 'Asia/Shanghai',
    recipients: [],
    emailSubject: '',
    emailBody: '',
    attachmentFormats: ['pdf'],
    includeCharts: true,
    compressAttachment: false,
    enabled: true
  }
  scheduleDialogVisible.value = true
}

const viewSchedule = (schedule) => {
  ElMessage.info(`查看定时报告: ${schedule.name}`)
}

const editSchedule = (schedule) => {
  editingSchedule.value = true
  scheduleForm.value = { ...schedule }
  scheduleDialogVisible.value = true
}

const toggleSchedule = (schedule) => {
  const status = schedule.enabled ? 'enabled' : 'disabled'
  schedule.status = status
  ElMessage.success(`已${schedule.enabled ? '启用' : '禁用'}定时报告`)
}

const executeNow = (schedule) => {
  ElMessage.info(`正在执行报告: ${schedule.name}`)
  schedule.status = 'running'
  
  // 模拟执行过程
  setTimeout(() => {
    schedule.status = 'enabled'
    schedule.lastSent = new Date().toLocaleString('zh-CN')
    ElMessage.success('报告执行完成')
  }, 3000)
}

const viewHistory = (schedule) => {
  currentSchedule.value = schedule
  showHistoryDialog.value = true
}

const duplicateSchedule = (schedule) => {
  const newSchedule = {
    ...schedule,
    id: Date.now(),
    name: `${schedule.name} - 副本`,
    status: 'disabled',
    enabled: false
  }
  schedules.value.push(newSchedule)
  ElMessage.success('定时报告已复制')
}

const deleteSchedule = (schedule) => {
  ElMessageBox.confirm(
    `确定要删除定时报告 "${schedule.name}" 吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = schedules.value.findIndex(s => s.id === schedule.id)
    if (index > -1) {
      schedules.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  })
}

const saveSchedule = () => {
  // 保存定时报告
  ElMessage.success('定时报告保存成功')
  scheduleDialogVisible.value = false
}

const testSchedule = () => {
  ElMessage.info('正在发送测试邮件...')
  setTimeout(() => {
    ElMessage.success('测试邮件发送成功')
  }, 2000)
}

// 接收者管理
const removeRecipient = (index) => {
  scheduleForm.value.recipients.splice(index, 1)
}

const addManualRecipient = () => {
  if (newRecipient.value.name && newRecipient.value.email) {
    scheduleForm.value.recipients.push({ ...newRecipient.value })
    newRecipient.value = { name: '', email: '', role: 'other' }
    ElMessage.success('接收者添加成功')
  }
}

const confirmAddRecipients = () => {
  const selectedContacts = contacts.value.filter(c => c.selected)
  selectedContacts.forEach(contact => {
    if (!scheduleForm.value.recipients.find(r => r.email === contact.email)) {
      scheduleForm.value.recipients.push({
        name: contact.name,
        email: contact.email,
        role: contact.role,
        avatar: contact.avatar
      })
    }
  })
  
  // 重置选择状态
  contacts.value.forEach(c => c.selected = false)
  showRecipientDialog.value = false
  ElMessage.success(`已添加 ${selectedContacts.length} 个接收者`)
}

// 模板操作
const previewTemplate = (template) => {
  ElMessage.info(`预览模板: ${template.name}`)
}

const useTemplate = (template) => {
  scheduleForm.value.template = template.id
  scheduleForm.value.emailSubject = `${template.name} - ${new Date().toLocaleDateString()}`
  showTemplateDialog.value = false
  scheduleDialogVisible.value = true
  ElMessage.success(`已选择模板: ${template.name}`)
}

// 历史记录操作
const viewExecutionDetail = (execution) => {
  ElMessage.info(`查看执行详情: ${execution.executionTime}`)
}

const downloadReport = (execution) => {
  ElMessage.info(`下载报告: ${execution.executionTime}`)
}

// 引用
const scheduleFormRef = ref(null)

onMounted(() => {
  // 初始化数据
})
</script>

<style scoped lang="scss">
.schedule-report-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    
    .header-actions {
      display: flex;
      gap: 12px;
    }
  }
}

.filter-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  
  .filter-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .filter-left {
      display: flex;
      gap: 12px;
    }
    
    .filter-right {
      display: flex;
      gap: 20px;
      
      .stats-item {
        display: flex;
        align-items: center;
        gap: 4px;
        
        .label {
          color: #606266;
          font-size: 14px;
        }
        
        .value {
          font-weight: 600;
          
          &.enabled {
            color: #67C23A;
          }
          
          &.running {
            color: #E6A23C;
          }
        }
      }
    }
  }
}

.schedule-list-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  
  .report-name {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .report-icon {
      font-size: 16px;
    }
  }
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.recipients-section {
  .recipients-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  .recipients-list {
    .recipient-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      border: 1px solid #e4e7ed;
      border-radius: 6px;
      margin-bottom: 8px;
      
      .recipient-info {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .recipient-details {
          .name {
            font-weight: 500;
            margin-bottom: 2px;
          }
          
          .email {
            font-size: 14px;
            color: #606266;
          }
        }
      }
      
      .recipient-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }
  }
}

.recipient-selector {
  .contacts-search {
    margin-bottom: 16px;
  }
  
  .contacts-list {
    max-height: 300px;
    overflow-y: auto;
    
    .contact-item {
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .contact-info {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .contact-details {
          .name {
            font-weight: 500;
            margin-bottom: 2px;
          }
          
          .email {
            font-size: 12px;
            color: #606266;
            margin-bottom: 2px;
          }
          
          .role {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }
  }
}

.template-gallery {
  .template-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }
  
  .template-card {
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    overflow: hidden;
    transition: box-shadow 0.3s;
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .template-preview {
      height: 120px;
      background: #f5f7fa;
      display: flex;
      align-items: center;
      justify-content: center;
      
      img {
        max-width: 100%;
        max-height: 100%;
      }
    }
    
    .template-info {
      padding: 12px;
      
      h4 {
        margin: 0 0 8px 0;
        font-size: 14px;
        font-weight: 600;
      }
      
      p {
        margin: 0 0 8px 0;
        font-size: 12px;
        color: #606266;
        line-height: 1.4;
      }
      
      .template-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .usage-count {
          font-size: 12px;
          color: #909399;
        }
      }
    }
    
    .template-actions {
      padding: 0 12px 12px;
      display: flex;
      gap: 8px;
    }
  }
}

.history-section {
  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
    
    .history-stats {
      display: flex;
      gap: 16px;
      
      .stat-item {
        display: flex;
        align-items: center;
        gap: 4px;
        
        .label {
          color: #606266;
          font-size: 14px;
        }
        
        .value {
          font-weight: 600;
          
          &.success {
            color: #67C23A;
          }
          
          &.error {
            color: #F56C6C;
          }
        }
      }
    }
  }
}
</style>