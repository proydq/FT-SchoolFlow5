<template>
  <div class="email-marketing">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1>邮件营销管理</h1>
        <p class="page-desc">管理邮件营销活动，监控发送状态，分析邮件效果</p>
      </div>
      <div class="header-actions">
        <el-button @click="showTemplateLibrary" :icon="Collection">
          模板库
        </el-button>
        <el-button @click="importEmails" :icon="Upload">
          导入邮箱
        </el-button>
        <el-button @click="createEmail" type="primary" :icon="Edit">
          新建邮件
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon sent">
                <el-icon><Promotion /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ emailStats.sent }}</div>
                <div class="stat-label">已发送邮件</div>
                <div class="stat-change positive">
                  <el-icon><ArrowUp /></el-icon>
                  {{ emailStats.sentGrowth }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon opened">
                <el-icon><View /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ emailStats.opened }}</div>
                <div class="stat-label">邮件打开</div>
                <div class="stat-change positive">
                  <el-icon><ArrowUp /></el-icon>
                  {{ emailStats.openedGrowth }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon clicked">
                <el-icon><Mouse /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ emailStats.clicked }}</div>
                <div class="stat-label">邮件点击</div>
                <div class="stat-change negative">
                  <el-icon><ArrowDown /></el-icon>
                  {{ emailStats.clickedGrowth }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon bounced">
                <el-icon><WarningFilled /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ emailStats.bounced }}</div>
                <div class="stat-label">退信邮件</div>
                <div class="stat-change positive">
                  <el-icon><ArrowDown /></el-icon>
                  {{ emailStats.bouncedGrowth }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 主要内容区域 -->
    <el-row :gutter="20">
      <!-- 左侧邮件列表 -->
      <el-col :span="16">
        <el-card class="email-list-card">
          <template #header>
            <div class="card-header">
              <span>邮件列表</span>
              <div class="header-actions">
                <el-button-group size="small">
                  <el-button :type="listView === 'all' ? 'primary' : ''" @click="listView = 'all'">
                    全部 ({{ emailList.length }})
                  </el-button>
                  <el-button :type="listView === 'draft' ? 'primary' : ''" @click="listView = 'draft'">
                    草稿 ({{ getDraftCount() }})
                  </el-button>
                  <el-button :type="listView === 'sent' ? 'primary' : ''" @click="listView = 'sent'">
                    已发送 ({{ getSentCount() }})
                  </el-button>
                  <el-button :type="listView === 'scheduled' ? 'primary' : ''" @click="listView = 'scheduled'">
                    定时发送 ({{ getScheduledCount() }})
                  </el-button>
                </el-button-group>
                <el-input
                  v-model="searchKeyword"
                  placeholder="搜索邮件..."
                  size="small"
                  style="width: 200px; margin-left: 10px;"
                  @input="filterEmails"
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
              </div>
            </div>
          </template>

          <div class="email-list">
            <div 
              v-for="email in filteredEmails"
              :key="email.id"
              class="email-item"
              :class="{ 'selected': selectedEmail?.id === email.id }"
              @click="selectEmail(email)"
            >
              <div class="email-status">
                <el-icon 
                  :class="`status-${email.status}`"
                  :title="getStatusLabel(email.status)"
                >
                  <component :is="getStatusIcon(email.status)" />
                </el-icon>
              </div>
              
              <div class="email-content">
                <div class="email-header">
                  <div class="email-subject">{{ email.subject || '(无标题)' }}</div>
                  <div class="email-time">{{ formatTime(email.updatedAt) }}</div>
                </div>
                
                <div class="email-meta">
                  <span class="email-recipients">收件人: {{ email.recipientCount }}人</span>
                  <span class="email-type">{{ getTypeLabel(email.type) }}</span>
                  <el-tag 
                    :type="getStatusType(email.status)" 
                    size="small"
                  >
                    {{ getStatusLabel(email.status) }}
                  </el-tag>
                </div>

                <div v-if="email.status === 'sent'" class="email-stats">
                  <span class="stat-item">
                    <el-icon><View /></el-icon>
                    {{ email.analytics.openRate }}%
                  </span>
                  <span class="stat-item">
                    <el-icon><Mouse /></el-icon>
                    {{ email.analytics.clickRate }}%
                  </span>
                  <span class="stat-item">
                    <el-icon><WarningFilled /></el-icon>
                    {{ email.analytics.bounceRate }}%
                  </span>
                </div>
              </div>

              <div class="email-actions">
                <el-dropdown @command="handleEmailAction">
                  <el-button circle size="small">
                    <el-icon><MoreFilled /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item :command="`edit_${email.id}`" :disabled="email.status === 'sent'">
                        编辑
                      </el-dropdown-item>
                      <el-dropdown-item :command="`duplicate_${email.id}`">
                        复制
                      </el-dropdown-item>
                      <el-dropdown-item :command="`preview_${email.id}`">
                        预览
                      </el-dropdown-item>
                      <el-dropdown-item 
                        :command="`send_${email.id}`" 
                        :disabled="email.status === 'sent' || email.status === 'sending'"
                      >
                        发送
                      </el-dropdown-item>
                      <el-dropdown-item 
                        :command="`analytics_${email.id}`"
                        :disabled="email.status !== 'sent'"
                      >
                        查看分析
                      </el-dropdown-item>
                      <el-dropdown-item :command="`delete_${email.id}`" divided>
                        删除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>

            <div v-if="filteredEmails.length === 0" class="empty-state">
              <el-empty description="暂无邮件" />
            </div>
          </div>

          <div class="list-footer">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :total="filteredEmails.length"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </el-col>

      <!-- 右侧详情和监控 -->
      <el-col :span="8">
        <!-- 发送监控 -->
        <el-card class="monitoring-card" style="margin-bottom: 20px;">
          <template #header>
            <div class="card-header">
              <span>实时监控</span>
              <el-button size="small" @click="refreshMonitoring">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
          </template>

          <div class="monitoring-content">
            <div class="monitoring-item">
              <div class="monitor-label">发送队列</div>
              <div class="monitor-value">{{ monitoringData.queueSize }}封</div>
              <el-progress 
                :percentage="monitoringData.queueProgress" 
                :stroke-width="8"
                :show-text="false"
              />
            </div>

            <div class="monitoring-item">
              <div class="monitor-label">发送速度</div>
              <div class="monitor-value">{{ monitoringData.sendRate }}封/分钟</div>
              <div class="monitor-chart">
                <div 
                  v-for="(rate, index) in monitoringData.sendRateHistory"
                  :key="index"
                  class="rate-bar"
                  :style="{ height: `${(rate / 100) * 40}px` }"
                />
              </div>
            </div>

            <div class="monitoring-item">
              <div class="monitor-label">错误率</div>
              <div class="monitor-value" :class="{ 'error': monitoringData.errorRate > 5 }">
                {{ monitoringData.errorRate }}%
              </div>
            </div>

            <div class="monitoring-item">
              <div class="monitor-label">系统状态</div>
              <div class="monitor-value">
                <el-tag 
                  :type="monitoringData.systemStatus === 'healthy' ? 'success' : 'danger'"
                  size="small"
                >
                  {{ monitoringData.systemStatus === 'healthy' ? '正常' : '异常' }}
                </el-tag>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 邮件详情 -->
        <el-card v-if="selectedEmail" class="email-detail-card">
          <template #header>
            <div class="card-header">
              <span>邮件详情</span>
              <el-button size="small" @click="editSelectedEmail" :disabled="selectedEmail.status === 'sent'">
                编辑
              </el-button>
            </div>
          </template>

          <div class="email-detail">
            <div class="detail-section">
              <h4>基本信息</h4>
              <div class="detail-item">
                <span class="label">标题:</span>
                <span class="value">{{ selectedEmail.subject || '(无标题)' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">类型:</span>
                <span class="value">{{ getTypeLabel(selectedEmail.type) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">状态:</span>
                <el-tag :type="getStatusType(selectedEmail.status)" size="small">
                  {{ getStatusLabel(selectedEmail.status) }}
                </el-tag>
              </div>
              <div class="detail-item">
                <span class="label">收件人:</span>
                <span class="value">{{ selectedEmail.recipientCount }}人</span>
              </div>
              <div class="detail-item">
                <span class="label">创建时间:</span>
                <span class="value">{{ formatDateTime(selectedEmail.createdAt) }}</span>
              </div>
            </div>

            <div v-if="selectedEmail.status === 'scheduled'" class="detail-section">
              <h4>定时发送</h4>
              <div class="detail-item">
                <span class="label">发送时间:</span>
                <span class="value">{{ formatDateTime(selectedEmail.scheduledAt) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">倒计时:</span>
                <span class="value countdown">{{ getCountdown(selectedEmail.scheduledAt) }}</span>
              </div>
            </div>

            <div v-if="selectedEmail.status === 'sent'" class="detail-section">
              <h4>发送统计</h4>
              <div class="analytics-grid">
                <div class="analytics-item">
                  <div class="analytics-value">{{ selectedEmail.analytics.delivered }}</div>
                  <div class="analytics-label">成功送达</div>
                </div>
                <div class="analytics-item">
                  <div class="analytics-value">{{ selectedEmail.analytics.opened }}</div>
                  <div class="analytics-label">邮件打开</div>
                </div>
                <div class="analytics-item">
                  <div class="analytics-value">{{ selectedEmail.analytics.clicked }}</div>
                  <div class="analytics-label">链接点击</div>
                </div>
                <div class="analytics-item">
                  <div class="analytics-value">{{ selectedEmail.analytics.bounced }}</div>
                  <div class="analytics-label">退信</div>
                </div>
              </div>

              <div class="rate-indicators">
                <div class="rate-item">
                  <span class="rate-label">打开率:</span>
                  <div class="rate-bar-container">
                    <div class="rate-bar" :style="{ width: `${selectedEmail.analytics.openRate}%` }"></div>
                    <span class="rate-text">{{ selectedEmail.analytics.openRate }}%</span>
                  </div>
                </div>
                <div class="rate-item">
                  <span class="rate-label">点击率:</span>
                  <div class="rate-bar-container">
                    <div class="rate-bar" :style="{ width: `${selectedEmail.analytics.clickRate}%` }"></div>
                    <span class="rate-text">{{ selectedEmail.analytics.clickRate }}%</span>
                  </div>
                </div>
                <div class="rate-item">
                  <span class="rate-label">退信率:</span>
                  <div class="rate-bar-container">
                    <div class="rate-bar bounce" :style="{ width: `${selectedEmail.analytics.bounceRate}%` }"></div>
                    <span class="rate-text">{{ selectedEmail.analytics.bounceRate }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="detail-actions">
              <el-button 
                v-if="selectedEmail.status === 'draft'" 
                type="primary" 
                @click="sendEmail(selectedEmail)"
              >
                发送邮件
              </el-button>
              <el-button 
                v-if="selectedEmail.status === 'scheduled'" 
                @click="cancelScheduled(selectedEmail)"
              >
                取消定时
              </el-button>
              <el-button @click="previewEmail(selectedEmail)">
                预览邮件
              </el-button>
              <el-button @click="duplicateEmail(selectedEmail)">
                复制邮件
              </el-button>
            </div>
          </div>
        </el-card>

        <!-- 快速统计 -->
        <el-card class="quick-stats-card">
          <template #header>
            <span>今日统计</span>
          </template>

          <div class="quick-stats">
            <div class="quick-stat-item">
              <div class="stat-icon">
                <el-icon><Promotion /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ todayStats.sent }}</div>
                <div class="stat-text">已发送</div>
              </div>
            </div>
            <div class="quick-stat-item">
              <div class="stat-icon">
                <el-icon><View /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ todayStats.opened }}</div>
                <div class="stat-text">已打开</div>
              </div>
            </div>
            <div class="quick-stat-item">
              <div class="stat-icon">
                <el-icon><Mouse /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ todayStats.clicked }}</div>
                <div class="stat-text">已点击</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 邮件编辑器弹窗 -->
    <el-dialog
      v-model="showEmailEditor"
      title="邮件编辑器"
      width="80%"
      :before-close="handleEmailEditorClose"
      destroy-on-close
    >
      <div class="email-editor">
        <el-form :model="emailForm" :rules="emailRules" ref="emailFormRef" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="邮件标题" prop="subject">
                <el-input 
                  v-model="emailForm.subject" 
                  placeholder="输入邮件标题"
                  maxlength="100"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="邮件类型" prop="type">
                <el-select v-model="emailForm.type" placeholder="选择邮件类型">
                  <el-option label="营销邮件" value="marketing" />
                  <el-option label="通知邮件" value="notification" />
                  <el-option label="交易邮件" value="transactional" />
                  <el-option label="欢迎邮件" value="welcome" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="收件人选择" prop="recipients">
            <el-select
              v-model="emailForm.recipients"
              multiple
              filterable
              placeholder="选择收件人分组"
              style="width: 100%"
            >
              <el-option-group label="客户分组">
                <el-option
                  v-for="group in recipientGroups"
                  :key="group.id"
                  :label="group.name"
                  :value="group.id"
                >
                  <span>{{ group.name }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px;">{{ group.count }}人</span>
                </el-option>
              </el-option-group>
            </el-select>
          </el-form-item>

          <el-form-item label="发送者信息">
            <el-row :gutter="12">
              <el-col :span="12">
                <el-input v-model="emailForm.senderName" placeholder="发送者姓名" />
              </el-col>
              <el-col :span="12">
                <el-input v-model="emailForm.senderEmail" placeholder="发送者邮箱" />
              </el-col>
            </el-row>
          </el-form-item>

          <el-form-item label="邮件内容" prop="content">
            <div class="content-editor">
              <div class="editor-toolbar">
                <el-button-group size="small">
                  <el-button @click="insertTemplate">选择模板</el-button>
                  <el-button @click="insertVariable">插入变量</el-button>
                  <el-button @click="insertImage">插入图片</el-button>
                  <el-button @click="insertLink">插入链接</el-button>
                </el-button-group>
              </div>
              <el-input
                v-model="emailForm.content"
                type="textarea"
                :rows="15"
                placeholder="输入邮件内容，支持HTML格式..."
              />
            </div>
          </el-form-item>

          <el-form-item label="发送设置">
            <el-radio-group v-model="emailForm.sendType">
              <el-radio value="immediate">立即发送</el-radio>
              <el-radio value="scheduled">定时发送</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item v-if="emailForm.sendType === 'scheduled'" label="发送时间">
            <el-date-picker
              v-model="emailForm.scheduledAt"
              type="datetime"
              placeholder="选择发送时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              :disabled-date="disablePastDate"
            />
          </el-form-item>

          <el-form-item label="追踪设置">
            <el-checkbox-group v-model="emailForm.tracking">
              <el-checkbox value="open">打开追踪</el-checkbox>
              <el-checkbox value="click">点击追踪</el-checkbox>
              <el-checkbox value="unsubscribe">退订追踪</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>

        <div class="editor-preview" v-if="emailForm.content">
          <h4>邮件预览:</h4>
          <div class="preview-content" v-html="emailForm.content"></div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="saveDraft" :loading="savingDraft">
            保存草稿
          </el-button>
          <el-button @click="testSend">
            测试发送
          </el-button>
          <el-button @click="showEmailEditor = false">
            取消
          </el-button>
          <el-button 
            type="primary" 
            @click="submitEmail"
            :loading="submittingEmail"
          >
            {{ emailForm.sendType === 'immediate' ? '立即发送' : '定时发送' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 模板库弹窗 -->
    <el-dialog v-model="showTemplateDialog" title="邮件模板库" width="70%" destroy-on-close>
      <div class="template-library">
        <div class="template-filters">
          <el-select v-model="templateFilter.category" placeholder="模板分类" @change="filterTemplates">
            <el-option label="全部" value="" />
            <el-option label="营销推广" value="marketing" />
            <el-option label="产品通知" value="notification" />
            <el-option label="节日祝福" value="holiday" />
            <el-option label="欢迎邮件" value="welcome" />
          </el-select>
          <el-input
            v-model="templateFilter.keyword"
            placeholder="搜索模板..."
            style="width: 200px; margin-left: 10px;"
            @input="filterTemplates"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <div class="template-grid">
          <div 
            v-for="template in filteredTemplates"
            :key="template.id"
            class="template-item"
            @click="selectTemplate(template)"
          >
            <div class="template-preview">
              <img :src="template.preview" :alt="template.name" />
            </div>
            <div class="template-info">
              <div class="template-name">{{ template.name }}</div>
              <div class="template-desc">{{ template.description }}</div>
              <div class="template-meta">
                <el-tag size="small">{{ template.category }}</el-tag>
                <span class="usage-count">{{ template.usage }}次使用</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Edit, Upload, Collection, Promotion, View, Mouse, WarningFilled,
  ArrowUp, ArrowDown, Search, MoreFilled, Refresh
} from '@element-plus/icons-vue'

// 响应式数据
const listView = ref('all')
const searchKeyword = ref('')
const selectedEmail = ref(null)
const currentPage = ref(1)
const pageSize = ref(20)
const showEmailEditor = ref(false)
const showTemplateDialog = ref(false)
const savingDraft = ref(false)
const submittingEmail = ref(false)

// 邮件表单
const emailForm = reactive({
  subject: '',
  type: 'marketing',
  recipients: [],
  senderName: '',
  senderEmail: '',
  content: '',
  sendType: 'immediate',
  scheduledAt: null,
  tracking: ['open', 'click']
})

const emailRules = {
  subject: [
    { required: true, message: '请输入邮件标题', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择邮件类型', trigger: 'change' }
  ],
  recipients: [
    { required: true, message: '请选择收件人', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入邮件内容', trigger: 'blur' }
  ]
}

// 模板筛选
const templateFilter = reactive({
  category: '',
  keyword: ''
})

// 统计数据
const emailStats = ref({
  sent: 45267,
  sentGrowth: 12.5,
  opened: 28934,
  openedGrowth: 8.3,
  clicked: 12456,
  clickedGrowth: -2.1,
  bounced: 892,
  bouncedGrowth: -15.2
})

const todayStats = ref({
  sent: 1234,
  opened: 789,
  clicked: 234
})

// 监控数据
const monitoringData = ref({
  queueSize: 156,
  queueProgress: 75,
  sendRate: 85,
  sendRateHistory: [45, 67, 89, 76, 85, 91, 78, 82, 85, 88],
  errorRate: 2.3,
  systemStatus: 'healthy'
})

// 模拟邮件列表数据
const emailList = ref([
  {
    id: 1,
    subject: '春季新品发布会邀请函',
    type: 'marketing',
    status: 'sent',
    recipientCount: 1234,
    createdAt: '2024-03-15 09:30:00',
    updatedAt: '2024-03-15 10:15:00',
    analytics: {
      delivered: 1198,
      opened: 756,
      clicked: 234,
      bounced: 36,
      openRate: 63.1,
      clickRate: 19.5,
      bounceRate: 2.9
    }
  },
  {
    id: 2,
    subject: '会员专享优惠活动',
    type: 'marketing',
    status: 'draft',
    recipientCount: 890,
    createdAt: '2024-03-14 16:20:00',
    updatedAt: '2024-03-14 16:45:00',
    analytics: null
  },
  {
    id: 3,
    subject: '产品更新通知',
    type: 'notification',
    status: 'scheduled',
    recipientCount: 2456,
    createdAt: '2024-03-13 14:10:00',
    updatedAt: '2024-03-13 14:30:00',
    scheduledAt: '2024-03-16 09:00:00',
    analytics: null
  },
  {
    id: 4,
    subject: '客户满意度调研',
    type: 'transactional',
    status: 'sending',
    recipientCount: 567,
    createdAt: '2024-03-12 11:15:00',
    updatedAt: '2024-03-12 11:20:00',
    analytics: null
  }
])

// 收件人分组
const recipientGroups = ref([
  { id: 1, name: 'VIP客户', count: 156 },
  { id: 2, name: '活跃用户', count: 1234 },
  { id: 3, name: '新注册用户', count: 567 },
  { id: 4, name: '企业客户', count: 890 }
])

// 邮件模板
const emailTemplates = ref([
  {
    id: 1,
    name: '营销推广模板',
    category: 'marketing',
    description: '适合产品推广和营销活动',
    preview: 'https://via.placeholder.com/300x200?text=Marketing+Template',
    usage: 245,
    content: '<h1>营销推广</h1><p>这是一个营销邮件模板...</p>'
  },
  {
    id: 2,
    name: '产品通知模板',
    category: 'notification',
    description: '用于产品更新和功能通知',
    preview: 'https://via.placeholder.com/300x200?text=Notification+Template',
    usage: 128,
    content: '<h1>产品通知</h1><p>这是一个通知邮件模板...</p>'
  },
  {
    id: 3,
    name: '节日祝福模板',
    category: 'holiday',
    description: '节日问候和祝福邮件',
    preview: 'https://via.placeholder.com/300x200?text=Holiday+Template',
    usage: 89,
    content: '<h1>节日祝福</h1><p>这是一个节日邮件模板...</p>'
  },
  {
    id: 4,
    name: '欢迎邮件模板',
    category: 'welcome',
    description: '新用户欢迎邮件',
    preview: 'https://via.placeholder.com/300x200?text=Welcome+Template',
    usage: 167,
    content: '<h1>欢迎加入</h1><p>这是一个欢迎邮件模板...</p>'
  }
])

// 计算属性
const filteredEmails = computed(() => {
  let emails = emailList.value

  // 按视图筛选
  if (listView.value !== 'all') {
    emails = emails.filter(email => email.status === listView.value)
  }

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    emails = emails.filter(email => 
      email.subject?.toLowerCase().includes(keyword) ||
      getTypeLabel(email.type).toLowerCase().includes(keyword)
    )
  }

  return emails
})

const filteredTemplates = computed(() => {
  let templates = emailTemplates.value

  if (templateFilter.category) {
    templates = templates.filter(t => t.category === templateFilter.category)
  }

  if (templateFilter.keyword) {
    const keyword = templateFilter.keyword.toLowerCase()
    templates = templates.filter(t => 
      t.name.toLowerCase().includes(keyword) ||
      t.description.toLowerCase().includes(keyword)
    )
  }

  return templates
})

// 方法
const getDraftCount = () => {
  return emailList.value.filter(email => email.status === 'draft').length
}

const getSentCount = () => {
  return emailList.value.filter(email => email.status === 'sent').length
}

const getScheduledCount = () => {
  return emailList.value.filter(email => email.status === 'scheduled').length
}

const getStatusIcon = (status) => {
  const icons = {
    draft: 'EditPen',
    sent: 'Check',
    scheduled: 'Clock',
    sending: 'Loading'
  }
  return icons[status] || 'Document'
}

const getStatusLabel = (status) => {
  const labels = {
    draft: '草稿',
    sent: '已发送',
    scheduled: '定时发送',
    sending: '发送中'
  }
  return labels[status] || status
}

const getStatusType = (status) => {
  const types = {
    draft: 'info',
    sent: 'success',
    scheduled: 'warning',
    sending: 'primary'
  }
  return types[status] || ''
}

const getTypeLabel = (type) => {
  const labels = {
    marketing: '营销邮件',
    notification: '通知邮件',
    transactional: '交易邮件',
    welcome: '欢迎邮件'
  }
  return labels[type] || type
}

const formatTime = (dateTime) => {
  const date = new Date(dateTime)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) { // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) { // 24小时内
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return date.toLocaleDateString()
  }
}

const formatDateTime = (dateTime) => {
  return new Date(dateTime).toLocaleString('zh-CN')
}

const getCountdown = (scheduledAt) => {
  const now = new Date()
  const target = new Date(scheduledAt)
  const diff = target - now

  if (diff <= 0) {
    return '即将发送'
  }

  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)

  if (days > 0) {
    return `${days}天${hours}小时`
  } else if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  } else {
    return `${minutes}分钟`
  }
}

const selectEmail = (email) => {
  selectedEmail.value = email
}

const filterEmails = () => {
  // 搜索功能已在计算属性中实现
}

const refreshMonitoring = () => {
  // 模拟刷新监控数据
  monitoringData.value.queueSize = Math.floor(Math.random() * 200) + 50
  monitoringData.value.sendRate = Math.floor(Math.random() * 50) + 60
  monitoringData.value.errorRate = Math.round(Math.random() * 5 * 10) / 10
  ElMessage.success('监控数据已刷新')
}

const handleEmailAction = (command) => {
  const [action, emailId] = command.split('_')
  const email = emailList.value.find(e => e.id == emailId)
  
  if (!email) return

  switch (action) {
    case 'edit':
      editEmail(email)
      break
    case 'duplicate':
      duplicateEmail(email)
      break
    case 'preview':
      previewEmail(email)
      break
    case 'send':
      sendEmail(email)
      break
    case 'analytics':
      showAnalytics(email)
      break
    case 'delete':
      deleteEmail(email)
      break
  }
}

const createEmail = () => {
  // 重置表单
  Object.assign(emailForm, {
    subject: '',
    type: 'marketing',
    recipients: [],
    senderName: '',
    senderEmail: '',
    content: '',
    sendType: 'immediate',
    scheduledAt: null,
    tracking: ['open', 'click']
  })
  showEmailEditor.value = true
}

const editEmail = (email) => {
  // 加载邮件数据到表单
  Object.assign(emailForm, {
    id: email.id,
    subject: email.subject || '',
    type: email.type,
    recipients: [], // 这里需要根据实际情况加载
    senderName: '',
    senderEmail: '',
    content: email.content || '',
    sendType: email.scheduledAt ? 'scheduled' : 'immediate',
    scheduledAt: email.scheduledAt,
    tracking: ['open', 'click']
  })
  showEmailEditor.value = true
}

const editSelectedEmail = () => {
  if (selectedEmail.value) {
    editEmail(selectedEmail.value)
  }
}

const duplicateEmail = (email) => {
  ElMessage.success(`复制邮件: ${email.subject}`)
}

const previewEmail = (email) => {
  ElMessage.info(`预览邮件: ${email.subject}`)
}

const sendEmail = async (email) => {
  try {
    const result = await ElMessageBox.confirm(
      `确定发送邮件 "${email.subject}" 给 ${email.recipientCount} 位收件人吗？`,
      '确认发送',
      {
        confirmButtonText: '确认发送',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    if (result === 'confirm') {
      // 模拟发送过程
      email.status = 'sending'
      ElMessage.success('邮件发送中...')
      
      setTimeout(() => {
        email.status = 'sent'
        email.analytics = {
          delivered: email.recipientCount - Math.floor(Math.random() * 50),
          opened: Math.floor(email.recipientCount * 0.6),
          clicked: Math.floor(email.recipientCount * 0.2),
          bounced: Math.floor(Math.random() * 50),
          openRate: 60 + Math.floor(Math.random() * 20),
          clickRate: 15 + Math.floor(Math.random() * 15),
          bounceRate: 2 + Math.floor(Math.random() * 5)
        }
        ElMessage.success('邮件发送成功')
      }, 3000)
    }
  } catch {
    // 用户取消
  }
}

const showAnalytics = (email) => {
  ElMessage.info(`查看邮件分析: ${email.subject}`)
}

const deleteEmail = async (email) => {
  try {
    const result = await ElMessageBox.confirm(
      `确定删除邮件 "${email.subject}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    if (result === 'confirm') {
      const index = emailList.value.findIndex(e => e.id === email.id)
      if (index > -1) {
        emailList.value.splice(index, 1)
        ElMessage.success('邮件删除成功')
        
        // 如果删除的是选中的邮件，清除选择
        if (selectedEmail.value?.id === email.id) {
          selectedEmail.value = null
        }
      }
    }
  } catch {
    // 用户取消
  }
}

const cancelScheduled = async (email) => {
  try {
    const result = await ElMessageBox.confirm(
      '确定取消定时发送吗？',
      '取消定时',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    if (result === 'confirm') {
      email.status = 'draft'
      email.scheduledAt = null
      ElMessage.success('已取消定时发送')
    }
  } catch {
    // 用户取消
  }
}

const showTemplateLibrary = () => {
  showTemplateDialog.value = true
}

const importEmails = () => {
  ElMessage.info('导入邮箱功能开发中...')
}

const handleSizeChange = (size) => {
  pageSize.value = size
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

const handleEmailEditorClose = (done) => {
  // 检查是否有未保存的更改
  if (emailForm.subject || emailForm.content) {
    ElMessageBox.confirm('有未保存的更改，确定关闭吗？', '确认关闭', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      done()
    }).catch(() => {
      // 用户取消关闭
    })
  } else {
    done()
  }
}

const saveDraft = async () => {
  savingDraft.value = true
  try {
    // 模拟保存草稿
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 如果是新邮件，添加到列表
    if (!emailForm.id) {
      const newEmail = {
        id: Date.now(),
        subject: emailForm.subject,
        type: emailForm.type,
        status: 'draft',
        recipientCount: emailForm.recipients.length * 100, // 模拟计算收件人数量
        createdAt: new Date().toLocaleString(),
        updatedAt: new Date().toLocaleString(),
        analytics: null
      }
      emailList.value.unshift(newEmail)
    }
    
    ElMessage.success('草稿保存成功')
  } catch (error) {
    ElMessage.error('保存草稿失败')
  } finally {
    savingDraft.value = false
  }
}

const testSend = () => {
  ElMessage.success('测试邮件已发送到您的邮箱')
}

const submitEmail = async () => {
  submittingEmail.value = true
  try {
    // 模拟提交邮件
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const newEmail = {
      id: emailForm.id || Date.now(),
      subject: emailForm.subject,
      type: emailForm.type,
      status: emailForm.sendType === 'immediate' ? 'sending' : 'scheduled',
      recipientCount: emailForm.recipients.length * 100,
      createdAt: emailForm.id ? emailList.value.find(e => e.id === emailForm.id)?.createdAt : new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
      scheduledAt: emailForm.scheduledAt,
      analytics: null
    }

    if (emailForm.id) {
      // 更新现有邮件
      const index = emailList.value.findIndex(e => e.id === emailForm.id)
      if (index > -1) {
        emailList.value[index] = newEmail
      }
    } else {
      // 添加新邮件
      emailList.value.unshift(newEmail)
    }

    ElMessage.success(emailForm.sendType === 'immediate' ? '邮件发送中...' : '定时邮件设置成功')
    showEmailEditor.value = false

    // 如果是立即发送，模拟发送过程
    if (emailForm.sendType === 'immediate') {
      setTimeout(() => {
        newEmail.status = 'sent'
        newEmail.analytics = {
          delivered: newEmail.recipientCount - Math.floor(Math.random() * 50),
          opened: Math.floor(newEmail.recipientCount * 0.6),
          clicked: Math.floor(newEmail.recipientCount * 0.2),
          bounced: Math.floor(Math.random() * 50),
          openRate: 60 + Math.floor(Math.random() * 20),
          clickRate: 15 + Math.floor(Math.random() * 15),
          bounceRate: 2 + Math.floor(Math.random() * 5)
        }
        ElMessage.success('邮件发送成功')
      }, 5000)
    }
  } catch (error) {
    ElMessage.error('提交失败')
  } finally {
    submittingEmail.value = false
  }
}

const insertTemplate = () => {
  showTemplateLibrary()
}

const insertVariable = () => {
  ElMessage.info('插入变量功能开发中...')
}

const insertImage = () => {
  ElMessage.info('插入图片功能开发中...')
}

const insertLink = () => {
  ElMessage.info('插入链接功能开发中...')
}

const filterTemplates = () => {
  // 筛选逻辑已在计算属性中实现
}

const selectTemplate = (template) => {
  emailForm.content = template.content
  showTemplateDialog.value = false
  ElMessage.success(`已选择模板: ${template.name}`)
}

const disablePastDate = (time) => {
  return time.getTime() < Date.now()
}

// 组件挂载
onMounted(() => {
  // 初始化数据
  selectedEmail.value = emailList.value[0]
})
</script>

<style lang="scss" scoped>
.email-marketing {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .header-left {
      h1 {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 600;
      }

      .page-desc {
        margin: 0;
        color: var(--el-text-color-secondary);
        font-size: 14px;
      }
    }

    .header-actions {
      display: flex;
      gap: 10px;
    }
  }

  .stats-cards {
    margin-bottom: 20px;

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          font-size: 20px;

          &.sent {
            background-color: var(--el-color-primary-light-8);
            color: var(--el-color-primary);
          }

          &.opened {
            background-color: var(--el-color-success-light-8);
            color: var(--el-color-success);
          }

          &.clicked {
            background-color: var(--el-color-warning-light-8);
            color: var(--el-color-warning);
          }

          &.bounced {
            background-color: var(--el-color-danger-light-8);
            color: var(--el-color-danger);
          }
        }

        .stat-info {
          flex: 1;

          .stat-value {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 4px;
          }

          .stat-label {
            color: var(--el-text-color-secondary);
            font-size: 14px;
            margin-bottom: 4px;
          }

          .stat-change {
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 4px;

            &.positive {
              color: var(--el-color-success);
            }

            &.negative {
              color: var(--el-color-danger);
            }
          }
        }
      }
    }
  }

  .email-list-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-actions {
        display: flex;
        align-items: center;
      }
    }

    .email-list {
      .email-item {
        display: flex;
        align-items: center;
        padding: 16px;
        border: 1px solid var(--el-border-color-lighter);
        border-radius: 8px;
        margin-bottom: 12px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          border-color: var(--el-color-primary);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        &.selected {
          border-color: var(--el-color-primary);
          background-color: var(--el-color-primary-light-9);
        }

        .email-status {
          margin-right: 12px;

          .el-icon {
            font-size: 18px;

            &.status-draft {
              color: var(--el-color-info);
            }

            &.status-sent {
              color: var(--el-color-success);
            }

            &.status-scheduled {
              color: var(--el-color-warning);
            }

            &.status-sending {
              color: var(--el-color-primary);
            }
          }
        }

        .email-content {
          flex: 1;
          min-width: 0;

          .email-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

            .email-subject {
              font-weight: 500;
              color: var(--el-text-color-primary);
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .email-time {
              font-size: 12px;
              color: var(--el-text-color-placeholder);
              white-space: nowrap;
            }
          }

          .email-meta {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;
            font-size: 13px;

            .email-recipients {
              color: var(--el-text-color-secondary);
            }

            .email-type {
              color: var(--el-text-color-regular);
            }
          }

          .email-stats {
            display: flex;
            gap: 16px;

            .stat-item {
              display: flex;
              align-items: center;
              gap: 4px;
              font-size: 12px;
              color: var(--el-text-color-secondary);
            }
          }
        }

        .email-actions {
          margin-left: 12px;
        }
      }
    }

    .list-footer {
      margin-top: 20px;
      text-align: right;
    }
  }

  .monitoring-card {
    .monitoring-content {
      .monitoring-item {
        margin-bottom: 20px;

        &:last-child {
          margin-bottom: 0;
        }

        .monitor-label {
          font-size: 12px;
          color: var(--el-text-color-secondary);
          margin-bottom: 4px;
        }

        .monitor-value {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 8px;

          &.error {
            color: var(--el-color-danger);
          }
        }

        .monitor-chart {
          display: flex;
          align-items: end;
          gap: 2px;
          height: 40px;

          .rate-bar {
            width: 4px;
            background: var(--el-color-primary);
            border-radius: 2px;
            opacity: 0.8;
            transition: all 0.3s;

            &:hover {
              opacity: 1;
            }
          }
        }
      }
    }
  }

  .email-detail-card {
    .email-detail {
      .detail-section {
        margin-bottom: 20px;

        &:last-child {
          margin-bottom: 0;
        }

        h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        .detail-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          font-size: 13px;

          .label {
            min-width: 80px;
            color: var(--el-text-color-secondary);
          }

          .value {
            color: var(--el-text-color-primary);

            &.countdown {
              color: var(--el-color-warning);
              font-weight: 500;
            }
          }
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 16px;

          .analytics-item {
            text-align: center;
            padding: 12px;
            background: var(--el-fill-color-lighter);
            border-radius: 6px;

            .analytics-value {
              font-size: 18px;
              font-weight: 600;
              color: var(--el-text-color-primary);
              margin-bottom: 4px;
            }

            .analytics-label {
              font-size: 12px;
              color: var(--el-text-color-secondary);
            }
          }
        }

        .rate-indicators {
          .rate-item {
            display: flex;
            align-items: center;
            margin-bottom: 12px;

            .rate-label {
              min-width: 60px;
              font-size: 12px;
              color: var(--el-text-color-secondary);
            }

            .rate-bar-container {
              flex: 1;
              height: 6px;
              background: var(--el-fill-color-light);
              border-radius: 3px;
              position: relative;
              margin: 0 12px 0 8px;

              .rate-bar {
                height: 100%;
                background: var(--el-color-primary);
                border-radius: 3px;
                transition: width 0.3s;

                &.bounce {
                  background: var(--el-color-danger);
                }
              }

              .rate-text {
                position: absolute;
                right: -40px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 11px;
                color: var(--el-text-color-secondary);
              }
            }
          }
        }
      }

      .detail-actions {
        margin-top: 20px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
    }
  }

  .quick-stats-card {
    .quick-stats {
      .quick-stat-item {
        display: flex;
        align-items: center;
        margin-bottom: 16px;

        &:last-child {
          margin-bottom: 0;
        }

        .stat-icon {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          background: var(--el-fill-color-light);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          color: var(--el-color-primary);
        }

        .stat-info {
          .stat-number {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 2px;
          }

          .stat-text {
            font-size: 12px;
            color: var(--el-text-color-secondary);
          }
        }
      }
    }
  }

  .email-editor {
    .content-editor {
      .editor-toolbar {
        margin-bottom: 12px;
        padding: 8px;
        background: var(--el-fill-color-lighter);
        border-radius: 6px;
      }
    }

    .editor-preview {
      margin-top: 20px;
      padding: 16px;
      border: 1px solid var(--el-border-color-light);
      border-radius: 6px;

      h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
      }

      .preview-content {
        background: #fff;
        padding: 16px;
        border-radius: 4px;
        border: 1px solid var(--el-border-color-lighter);
      }
    }
  }

  .template-library {
    .template-filters {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
    }

    .template-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;

      .template-item {
        border: 1px solid var(--el-border-color-light);
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          border-color: var(--el-color-primary);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .template-preview {
          height: 140px;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .template-info {
          padding: 12px;

          .template-name {
            font-weight: 500;
            margin-bottom: 4px;
          }

          .template-desc {
            font-size: 12px;
            color: var(--el-text-color-secondary);
            margin-bottom: 8px;
          }

          .template-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .usage-count {
              font-size: 11px;
              color: var(--el-text-color-placeholder);
            }
          }
        }
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
  }

  .dialog-footer {
    text-align: right;
  }
}
</style>