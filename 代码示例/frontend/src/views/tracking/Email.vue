<template>
  <div class="email-tracking-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>邮件追踪</h1>
      <div class="header-actions">
        <el-button type="primary" @click="showTrackingSetup">
          <el-icon><Plus /></el-icon>
          添加追踪
        </el-button>
        <el-button @click="exportData">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-icon sent">
                <el-icon><Message /></el-icon>
              </div>
              <div class="stat-content">
                <h3>{{ emailStats.sent.toLocaleString() }}</h3>
                <p>邮件发送</p>
                <span class="growth-rate positive">+{{ emailStats.sentGrowth }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-icon delivered">
                <el-icon><Check /></el-icon>
              </div>
              <div class="stat-content">
                <h3>{{ emailStats.delivered.toLocaleString() }}</h3>
                <p>成功送达</p>
                <span class="growth-rate positive">+{{ emailStats.deliveredGrowth }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-icon opened">
                <el-icon><View /></el-icon>
              </div>
              <div class="stat-content">
                <h3>{{ emailStats.opened.toLocaleString() }}</h3>
                <p>邮件打开</p>
                <span class="growth-rate" :class="emailStats.openedGrowth > 0 ? 'positive' : 'negative'">
                  {{ emailStats.openedGrowth > 0 ? '+' : '' }}{{ emailStats.openedGrowth }}%
                </span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-icon clicked">
                <el-icon><Mouse /></el-icon>
              </div>
              <div class="stat-content">
                <h3>{{ emailStats.clicked.toLocaleString() }}</h3>
                <p>链接点击</p>
                <span class="growth-rate positive">+{{ emailStats.clickedGrowth }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 邮件追踪列表 -->
    <el-card class="tracking-list-card">
      <template #header>
        <div class="card-header">
          <span>邮件追踪记录</span>
          <div class="header-filters">
            <el-select v-model="filters.status" placeholder="状态筛选" size="small" style="width: 120px">
              <el-option label="全部状态" value="" />
              <el-option label="已发送" value="sent" />
              <el-option label="已送达" value="delivered" />
              <el-option label="已打开" value="opened" />
              <el-option label="已点击" value="clicked" />
              <el-option label="退回" value="bounced" />
            </el-select>
            <el-select v-model="filters.campaign" placeholder="活动筛选" size="small" style="width: 140px">
              <el-option label="全部活动" value="" />
              <el-option v-for="campaign in campaigns" :key="campaign.id" :label="campaign.name" :value="campaign.id" />
            </el-select>
            <el-date-picker
              v-model="filters.dateRange"
              type="daterange"
              size="small"
              format="YYYY/MM/DD"
              value-format="YYYY-MM-DD"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 240px"
            />
          </div>
        </div>
      </template>

      <el-table 
        :data="paginatedTrackingData" 
        v-loading="loading"
        style="width: 100%"
        :row-class-name="tableRowClassName"
      >
        <el-table-column prop="id" label="追踪ID" width="100" />
        <el-table-column prop="recipient" label="收件人" width="200" show-overflow-tooltip />
        <el-table-column prop="subject" label="邮件主题" min-width="250" show-overflow-tooltip />
        <el-table-column prop="campaign" label="所属活动" width="150" show-overflow-tooltip />
        <el-table-column prop="sentTime" label="发送时间" width="160" />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="openCount" label="打开次数" width="100" />
        <el-table-column prop="clickCount" label="点击次数" width="100" />
        <el-table-column prop="lastActivity" label="最后活动" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button type="text" size="small" @click="viewDetails(scope.row)">
                <el-icon><View /></el-icon>
                详情
              </el-button>
              <el-button type="text" size="small" @click="viewTimeline(scope.row)">
                <el-icon><Clock /></el-icon>
                时间线
              </el-button>
              <el-button type="text" size="small" @click="resendEmail(scope.row)" v-if="scope.row.status === 'bounced'">
                <el-icon><Refresh /></el-icon>
                重发
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.current"
          :page-size="pagination.size"
          :total="filteredTrackingData.length"
          layout="total, prev, pager, next, jumper"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 追踪设置对话框 -->
    <el-dialog v-model="trackingSetupDialog.visible" title="添加邮件追踪" width="600px">
      <el-form :model="trackingSetupDialog.form" :rules="setupFormRules" ref="setupFormRef" label-width="100px">
        <el-form-item label="追踪名称" prop="name" required>
          <el-input v-model="trackingSetupDialog.form.name" placeholder="输入追踪名称" />
        </el-form-item>
        <el-form-item label="关联活动" prop="campaignId" required>
          <el-select v-model="trackingSetupDialog.form.campaignId" placeholder="选择活动" style="width: 100%">
            <el-option v-for="campaign in campaigns" :key="campaign.id" :label="campaign.name" :value="campaign.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="追踪类型" prop="trackingTypes" required>
          <el-checkbox-group v-model="trackingSetupDialog.form.trackingTypes">
            <el-checkbox value="open">邮件打开</el-checkbox>
            <el-checkbox value="click">链接点击</el-checkbox>
            <el-checkbox value="download">附件下载</el-checkbox>
            <el-checkbox value="unsubscribe">取消订阅</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="追踪URL" prop="urls">
          <el-input
            v-model="trackingSetupDialog.form.urls"
            type="textarea"
            :rows="4"
            placeholder="每行一个URL，用于追踪链接点击"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="trackingSetupDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="saveTrackingSetup" :loading="saving">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailsDialog.visible" title="邮件追踪详情" width="800px">
      <div class="details-content" v-if="detailsDialog.record">
        <div class="details-header">
          <h3>{{ detailsDialog.record.subject }}</h3>
          <el-tag :type="getStatusTagType(detailsDialog.record.status)" size="large">
            {{ getStatusText(detailsDialog.record.status) }}
          </el-tag>
        </div>
        
        <el-descriptions :column="2" border class="details-info">
          <el-descriptions-item label="收件人">{{ detailsDialog.record.recipient }}</el-descriptions-item>
          <el-descriptions-item label="发送时间">{{ detailsDialog.record.sentTime }}</el-descriptions-item>
          <el-descriptions-item label="所属活动">{{ detailsDialog.record.campaign }}</el-descriptions-item>
          <el-descriptions-item label="邮件ID">{{ detailsDialog.record.id }}</el-descriptions-item>
          <el-descriptions-item label="打开次数">{{ detailsDialog.record.openCount }}</el-descriptions-item>
          <el-descriptions-item label="点击次数">{{ detailsDialog.record.clickCount }}</el-descriptions-item>
          <el-descriptions-item label="最后活动">{{ detailsDialog.record.lastActivity }}</el-descriptions-item>
          <el-descriptions-item label="用户代理">{{ detailsDialog.record.userAgent || '未知' }}</el-descriptions-item>
        </el-descriptions>

        <div class="activity-timeline" v-if="detailsDialog.record.activities?.length">
          <h4>活动时间线</h4>
          <el-timeline>
            <el-timeline-item
              v-for="activity in detailsDialog.record.activities"
              :key="activity.id"
              :timestamp="activity.time"
              :type="getActivityType(activity.type)"
            >
              <div class="activity-content">
                <strong>{{ getActivityText(activity.type) }}</strong>
                <p v-if="activity.details">{{ activity.details }}</p>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </el-dialog>

    <!-- 时间线对话框 -->
    <el-dialog v-model="timelineDialog.visible" title="邮件活动时间线" width="700px">
      <div class="timeline-content" v-if="timelineDialog.record">
        <div class="timeline-summary">
          <h3>{{ timelineDialog.record.subject }}</h3>
          <p>收件人: {{ timelineDialog.record.recipient }}</p>
        </div>
        <el-timeline>
          <el-timeline-item
            v-for="event in timelineDialog.record.timeline"
            :key="event.id"
            :timestamp="event.time"
            :type="getTimelineType(event.type)"
          >
            <div class="timeline-event">
              <div class="event-title">{{ getTimelineText(event.type) }}</div>
              <div class="event-details" v-if="event.details">{{ event.details }}</div>
              <div class="event-location" v-if="event.location">位置: {{ event.location }}</div>
              <div class="event-device" v-if="event.device">设备: {{ event.device }}</div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Download, Message, Check, View, Mouse, Clock, Refresh
} from '@element-plus/icons-vue'

// 响应式数据
const emailStats = ref({
  sent: 12567,
  sentGrowth: 15.3,
  delivered: 11834,
  deliveredGrowth: 12.8,
  opened: 8923,
  openedGrowth: -2.1,
  clicked: 3245,
  clickedGrowth: 8.7
})

const filters = ref({
  status: '',
  campaign: '',
  dateRange: null
})

const pagination = ref({
  current: 1,
  size: 10,
  total: 0
})

const loading = ref(false)

const campaigns = ref([
  { id: 1, name: '春季新品推广' },
  { id: 2, name: '会员专享优惠' },
  { id: 3, name: '年中大促销' },
  { id: 4, name: '客户关怀计划' },
  { id: 5, name: '产品更新通知' }
])

// 生成追踪数据
const generateTrackingData = () => {
  const statuses = ['sent', 'delivered', 'opened', 'clicked', 'bounced']
  const statusWeights = [0.05, 0.15, 0.35, 0.35, 0.1] // 权重分布
  
  const subjects = [
    '春季新品发布 - 限时优惠等你来',
    '独家会员福利 - 专享85折优惠',
    '年中大促倒计时 - 最后3天',
    '您的订单已确认 - 感谢您的信任',
    '产品使用指南 - 让您快速上手',
    '客户满意度调查 - 您的意见很重要',
    '新功能发布通知 - 体验全新升级',
    '生日专属礼品 - 祝您生日快乐',
    '库存补货通知 - 热销商品回归',
    '账户安全提醒 - 保护您的信息',
    '季度总结报告 - 一起回顾成长',
    '技术支持服务 - 随时为您解答',
    '合作伙伴推荐 - 优质资源分享',
    '行业趋势分析 - 洞察市场动向',
    '培训课程邀请 - 提升专业技能',
    '社区活动通知 - 线下聚会邀请',
    '客户案例分享 - 成功故事启发',
    '产品升级公告 - 更好的用户体验',
    '节日祝福邮件 - 温馨节日问候',
    '反馈收集邮件 - 帮助我们改进',
    '会议邀请函 - 重要会议提醒',
    '订阅确认邮件 - 欢迎加入我们',
    '密码重置通知 - 账户安全操作',
    '发货通知邮件 - 您的包裹在路上',
    '退款处理通知 - 款项已原路返回',
    '活动报名确认 - 期待您的参与',
    '优惠券发放 - 专属优惠码',
    '系统维护通知 - 服务临时中断',
    '调研问卷邀请 - 分享您的看法',
    '推荐计划奖励 - 感谢您的推荐'
  ]

  const recipients = [
    'john.doe@example.com', 'jane.smith@company.com', 'mike.johnson@email.com',
    'sarah.wilson@domain.com', 'david.brown@test.com', 'lisa.davis@sample.com',
    'chris.miller@demo.com', 'amanda.garcia@mail.com', 'kevin.martinez@web.com',
    'jennifer.lopez@site.com', 'robert.taylor@box.com', 'michelle.white@net.com',
    'daniel.harris@org.com', 'jessica.clark@info.com', 'brian.lewis@tech.com',
    'stephanie.walker@biz.com', 'matthew.hall@pro.com', 'ashley.allen@dev.com',
    'joshua.young@app.com', 'megan.king@service.com', 'andrew.wright@support.com',
    'rachel.scott@help.com', 'christopher.green@contact.com', 'kimberly.adams@news.com',
    'ryan.baker@update.com', 'nicole.gonzalez@notify.com', 'justin.nelson@alert.com',
    'heather.carter@remind.com', 'jonathan.mitchell@inform.com', 'samantha.perez@notice.com'
  ]

  const data = []
  
  for (let i = 1; i <= 35; i++) {
    const randomRecipient = recipients[Math.floor(Math.random() * recipients.length)]
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)]
    const randomCampaign = campaigns.value[Math.floor(Math.random() * campaigns.value.length)]
    
    // 根据权重选择状态
    const rand = Math.random()
    let status = statuses[0]
    let cumWeight = 0
    for (let j = 0; j < statuses.length; j++) {
      cumWeight += statusWeights[j]
      if (rand <= cumWeight) {
        status = statuses[j]
        break
      }
    }
    
    const sentDate = new Date(2024, 2, Math.floor(Math.random() * 30) + 1, 
                             Math.floor(Math.random() * 24), 
                             Math.floor(Math.random() * 60))
    
    const openCount = status === 'opened' || status === 'clicked' ? 
                     Math.floor(Math.random() * 5) + 1 : 
                     (Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0)
    
    const clickCount = status === 'clicked' ? 
                      Math.floor(Math.random() * 3) + 1 : 
                      (Math.random() > 0.8 ? Math.floor(Math.random() * 2) : 0)
    
    const lastActivity = status !== 'sent' ? 
                        new Date(sentDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleString('zh-CN') :
                        '-'
    
    // 生成活动记录
    const activities = []
    let activityId = 1
    
    activities.push({
      id: activityId++,
      type: 'sent',
      time: sentDate.toLocaleString('zh-CN'),
      details: '邮件发送成功'
    })
    
    if (status !== 'sent' && status !== 'bounced') {
      activities.push({
        id: activityId++,
        type: 'delivered',
        time: new Date(sentDate.getTime() + Math.random() * 60 * 60 * 1000).toLocaleString('zh-CN'),
        details: '邮件成功送达收件箱'
      })
    }
    
    if (status === 'opened' || status === 'clicked') {
      for (let k = 0; k < openCount; k++) {
        activities.push({
          id: activityId++,
          type: 'opened',
          time: new Date(sentDate.getTime() + Math.random() * 24 * 60 * 60 * 1000).toLocaleString('zh-CN'),
          details: `第${k + 1}次打开邮件`
        })
      }
    }
    
    if (status === 'clicked') {
      for (let k = 0; k < clickCount; k++) {
        activities.push({
          id: activityId++,
          type: 'clicked',
          time: new Date(sentDate.getTime() + Math.random() * 24 * 60 * 60 * 1000).toLocaleString('zh-CN'),
          details: `点击链接: https://example.com/product-${Math.floor(Math.random() * 100)}`
        })
      }
    }
    
    if (status === 'bounced') {
      activities.push({
        id: activityId++,
        type: 'bounced',
        time: new Date(sentDate.getTime() + Math.random() * 60 * 60 * 1000).toLocaleString('zh-CN'),
        details: '邮件退回 - 收件箱已满'
      })
    }
    
    // 生成时间线
    const timeline = activities.map(activity => ({
      id: activity.id,
      type: activity.type,
      time: activity.time,
      details: activity.details,
      location: Math.random() > 0.5 ? `${['北京', '上海', '广州', '深圳', '杭州'][Math.floor(Math.random() * 5)]}, 中国` : null,
      device: Math.random() > 0.5 ? ['iPhone', 'Android', 'Windows PC', 'Mac', 'iPad'][Math.floor(Math.random() * 5)] : null
    }))
    
    data.push({
      id: `TRK${String(i).padStart(6, '0')}`,
      recipient: randomRecipient,
      subject: randomSubject,
      campaign: randomCampaign.name,
      campaignId: randomCampaign.id,
      sentTime: sentDate.toLocaleString('zh-CN'),
      status,
      openCount,
      clickCount,
      lastActivity,
      userAgent: Math.random() > 0.5 ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' : null,
      activities,
      timeline
    })
  }
  
  return data.sort((a, b) => new Date(b.sentTime) - new Date(a.sentTime))
}

const trackingData = ref(generateTrackingData())

const trackingSetupDialog = ref({
  visible: false,
  form: {
    name: '',
    campaignId: null,
    trackingTypes: [],
    urls: ''
  }
})

const setupFormRef = ref()
const setupFormRules = {
  name: [
    { required: true, message: '请输入追踪名称', trigger: 'blur' }
  ],
  campaignId: [
    { required: true, message: '请选择关联活动', trigger: 'change' }
  ],
  trackingTypes: [
    { required: true, type: 'array', min: 1, message: '请选择至少一种追踪类型', trigger: 'change' }
  ]
}

const detailsDialog = ref({
  visible: false,
  record: null
})

const timelineDialog = ref({
  visible: false,
  record: null
})

const saving = ref(false)

// 计算属性
const filteredTrackingData = computed(() => {
  return trackingData.value.filter(item => {
    const statusMatch = !filters.value.status || item.status === filters.value.status
    const campaignMatch = !filters.value.campaign || item.campaignId === filters.value.campaign
    
    let dateMatch = true
    if (filters.value.dateRange && filters.value.dateRange.length === 2) {
      const itemDate = new Date(item.sentTime)
      const startDate = new Date(filters.value.dateRange[0])
      const endDate = new Date(filters.value.dateRange[1])
      endDate.setHours(23, 59, 59, 999)
      dateMatch = itemDate >= startDate && itemDate <= endDate
    }
    
    return statusMatch && campaignMatch && dateMatch
  })
})

const paginatedTrackingData = computed(() => {
  const start = (pagination.value.current - 1) * pagination.value.size
  const end = start + pagination.value.size
  return filteredTrackingData.value.slice(start, end)
})

// 方法
const showTrackingSetup = () => {
  trackingSetupDialog.value.visible = true
  trackingSetupDialog.value.form = {
    name: '',
    campaignId: null,
    trackingTypes: [],
    urls: ''
  }
}

const saveTrackingSetup = async () => {
  try {
    await setupFormRef.value.validate()
    saving.value = true
    
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('追踪设置已保存')
    trackingSetupDialog.value.visible = false
  } catch (error) {
    ElMessage.error('请完善必填信息')
  } finally {
    saving.value = false
  }
}

const exportData = () => {
  ElMessage.success('数据导出已开始，请稍候...')
}

const getStatusTagType = (status) => {
  const types = {
    sent: 'info',
    delivered: 'success',
    opened: 'warning',
    clicked: 'primary',
    bounced: 'danger'
  }
  return types[status] || 'default'
}

const getStatusText = (status) => {
  const texts = {
    sent: '已发送',
    delivered: '已送达',
    opened: '已打开',
    clicked: '已点击',
    bounced: '退回'
  }
  return texts[status] || status
}

const tableRowClassName = ({ row, rowIndex }) => {
  if (row.status === 'bounced') {
    return 'warning-row'
  }
  if (row.status === 'clicked') {
    return 'success-row'
  }
  return ''
}

const viewDetails = (record) => {
  detailsDialog.value.record = record
  detailsDialog.value.visible = true
}

const viewTimeline = (record) => {
  timelineDialog.value.record = record
  timelineDialog.value.visible = true
}

const resendEmail = async (record) => {
  try {
    await ElMessageBox.confirm('确定要重新发送这封邮件吗？', '确认重发', {
      type: 'warning'
    })
    ElMessage.success('邮件重发成功')
    record.status = 'sent'
  } catch {
    // 用户取消
  }
}

const handlePageChange = (page) => {
  pagination.value.current = page
}

const getActivityType = (type) => {
  const types = {
    sent: 'primary',
    delivered: 'success',
    opened: 'warning',
    clicked: 'info',
    bounced: 'danger'
  }
  return types[type] || 'default'
}

const getActivityText = (type) => {
  const texts = {
    sent: '邮件发送',
    delivered: '邮件送达',
    opened: '邮件打开',
    clicked: '链接点击',
    bounced: '邮件退回'
  }
  return texts[type] || type
}

const getTimelineType = (type) => {
  return getActivityType(type)
}

const getTimelineText = (type) => {
  return getActivityText(type)
}

onMounted(() => {
  pagination.value.total = trackingData.value.length
})
</script>

<style scoped lang="scss">
.email-tracking-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  height: 120px;
}

.stat-item {
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  color: white;
}

.stat-icon.sent {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.delivered {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-icon.opened {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-icon.clicked {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-content h3 {
  margin: 0 0 4px 0;
  font-size: 28px;
  font-weight: 600;
}

.stat-content p {
  margin: 0 0 4px 0;
  color: #666;
  font-size: 14px;
}

.growth-rate {
  font-size: 12px;
  font-weight: 500;
}

.growth-rate.positive {
  color: #67c23a;
}

.growth-rate.negative {
  color: #f56c6c;
}

.tracking-list-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-filters {
  display: flex;
  gap: 12px;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}

// 表格行样式
:deep(.warning-row) {
  background-color: #fef0e6;
}

:deep(.success-row) {
  background-color: #f0f9ff;
}

// 对话框样式
.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.details-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.details-info {
  margin-bottom: 24px;
}

.activity-timeline h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.activity-content strong {
  color: #409eff;
}

.activity-content p {
  margin: 4px 0 0 0;
  color: #666;
  font-size: 14px;
}

.timeline-summary {
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.timeline-summary h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 500;
}

.timeline-summary p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.timeline-event {
  .event-title {
    font-weight: 500;
    color: #409eff;
    margin-bottom: 4px;
  }
  
  .event-details {
    color: #666;
    font-size: 14px;
    margin-bottom: 4px;
  }
  
  .event-location,
  .event-device {
    color: #999;
    font-size: 12px;
    margin-bottom: 2px;
  }
}

.dialog-footer {
  text-align: right;
}
</style>