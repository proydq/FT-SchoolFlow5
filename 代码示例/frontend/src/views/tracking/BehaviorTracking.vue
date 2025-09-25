<template>
  <div class="behavior-tracking-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>客户行为追踪</h1>
      <div class="header-actions">
        <el-select v-model="selectedSegment" placeholder="选择客户群体" @change="handleSegmentChange">
          <el-option label="全部客户" value="all" />
          <el-option label="新客户" value="new" />
          <el-option label="活跃客户" value="active" />
          <el-option label="流失风险" value="churn" />
          <el-option label="高价值客户" value="vip" />
        </el-select>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="handleDateChange"
        />
        <el-button type="primary" @click="showRealTimeTracking">
          <el-icon><View /></el-icon>
          实时监控
        </el-button>
      </div>
    </div>

    <!-- 行为概览卡片 -->
    <div class="behavior-overview">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="overview-item">
              <div class="overview-icon active">
                <el-icon><User /></el-icon>
              </div>
              <div class="overview-content">
                <h3>{{ behaviorStats.activeUsers.toLocaleString() }}</h3>
                <p>活跃用户</p>
                <el-progress :percentage="behaviorStats.activeRate" :color="getActiveColor" />
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="overview-item">
              <div class="overview-icon engagement">
                <el-icon><ChatDotRound /></el-icon>
              </div>
              <div class="overview-content">
                <h3>{{ behaviorStats.avgEngagement }}%</h3>
                <p>平均互动率</p>
                <div class="trend">
                  <span :class="behaviorStats.engagementTrend > 0 ? 'up' : 'down'">
                    {{ behaviorStats.engagementTrend > 0 ? '↑' : '↓' }} {{ Math.abs(behaviorStats.engagementTrend) }}%
                  </span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="overview-item">
              <div class="overview-icon retention">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="overview-content">
                <h3>{{ behaviorStats.retentionRate }}%</h3>
                <p>留存率</p>
                <div class="mini-chart" ref="retentionMiniChart"></div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="overview-item">
              <div class="overview-icon churn">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="overview-content">
                <h3>{{ behaviorStats.churnRisk }}</h3>
                <p>流失预警</p>
                <el-tag :type="getChurnTagType(behaviorStats.churnRiskLevel)">
                  {{ behaviorStats.churnRiskLevel }}
                </el-tag>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 主要内容区域 -->
    <el-row :gutter="20" class="main-content">
      <!-- 行为轨迹 -->
      <el-col :span="16">
        <el-card class="trajectory-card">
          <template #header>
            <div class="card-header">
              <span>客户行为轨迹</span>
              <div class="trajectory-controls">
                <el-radio-group v-model="trajectoryView" size="small" @change="updateTrajectory">
                  <el-radio-button value="timeline">时间线</el-radio-button>
                  <el-radio-button value="heatmap">热力图</el-radio-button>
                  <el-radio-button value="flow">流程图</el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </template>
          
          <!-- 时间线视图 -->
          <div v-if="trajectoryView === 'timeline'" class="timeline-view">
            <el-timeline>
              <el-timeline-item
                v-for="event in behaviorTimeline"
                :key="event.id"
                :timestamp="event.timestamp"
                :type="getTimelineType(event.type)"
                :hollow="event.important"
                placement="top"
              >
                <el-card>
                  <div class="timeline-event">
                    <div class="event-header">
                      <el-icon :class="event.type"><component :is="getEventIcon(event.type)" /></el-icon>
                      <span class="event-title">{{ event.title }}</span>
                      <el-tag size="small">{{ event.channel }}</el-tag>
                    </div>
                    <p class="event-description">{{ event.description }}</p>
                    <div class="event-meta">
                      <span>用户：{{ event.userName }}</span>
                      <span>设备：{{ event.device }}</span>
                      <span>位置：{{ event.location }}</span>
                    </div>
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </div>
          
          <!-- 热力图视图 -->
          <div v-else-if="trajectoryView === 'heatmap'" class="heatmap-view">
            <div class="heatmap-chart" ref="heatmapChart"></div>
          </div>
          
          <!-- 流程图视图 -->
          <div v-else class="flow-view">
            <div class="flow-chart" ref="flowChart"></div>
          </div>
        </el-card>
      </el-col>

      <!-- 兴趣分析 -->
      <el-col :span="8">
        <el-card class="interest-card">
          <template #header>
            <span>兴趣分析</span>
          </template>
          
          <div class="interest-tags">
            <el-tag
              v-for="interest in topInterests"
              :key="interest.name"
              :size="getInterestSize(interest.score)"
              :type="getInterestType(interest.category)"
              effect="plain"
            >
              {{ interest.name }}
              <span class="interest-score">{{ interest.score }}</span>
            </el-tag>
          </div>
          
          <div class="interest-chart" ref="interestChart"></div>
          
          <div class="interest-insights">
            <h4>兴趣洞察</h4>
            <ul>
              <li v-for="insight in interestInsights" :key="insight.id">
                <el-icon><InfoFilled /></el-icon>
                {{ insight.text }}
              </li>
            </ul>
          </div>
        </el-card>

        <!-- 活跃度分析 -->
        <el-card class="activity-card">
          <template #header>
            <span>活跃度分析</span>
          </template>
          
          <div class="activity-heatmap">
            <div class="heatmap-header">
              <span>时段分布</span>
              <span>最近7天</span>
            </div>
            <div class="heatmap-grid">
              <div class="heatmap-row" v-for="(row, dayIndex) in activityHeatmap" :key="dayIndex">
                <span class="day-label">{{ getDayLabel(dayIndex) }}</span>
                <div class="hour-cells">
                  <div
                    v-for="(value, hourIndex) in row"
                    :key="hourIndex"
                    class="heat-cell"
                    :class="getHeatLevel(value)"
                    :title="`${getDayLabel(dayIndex)} ${hourIndex}:00 - 活跃度: ${value}`"
                  ></div>
                </div>
              </div>
            </div>
            <div class="heatmap-legend">
              <span>低</span>
              <div class="legend-cells">
                <div class="heat-cell level-0"></div>
                <div class="heat-cell level-1"></div>
                <div class="heat-cell level-2"></div>
                <div class="heat-cell level-3"></div>
                <div class="heat-cell level-4"></div>
              </div>
              <span>高</span>
            </div>
          </div>
          
          <div class="activity-metrics">
            <div class="metric">
              <span class="label">平均会话时长</span>
              <span class="value">{{ activityMetrics.avgSessionDuration }} 分钟</span>
            </div>
            <div class="metric">
              <span class="label">日均访问次数</span>
              <span class="value">{{ activityMetrics.dailyVisits }} 次</span>
            </div>
            <div class="metric">
              <span class="label">页面浏览深度</span>
              <span class="value">{{ activityMetrics.pageDepth }} 页</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 流失预警 -->
    <el-card class="churn-warning-card">
      <template #header>
        <div class="card-header">
          <span>流失预警</span>
          <div class="warning-filters">
            <el-select v-model="churnRiskLevel" size="small" style="width: 120px">
              <el-option label="全部风险" value="all" />
              <el-option label="高风险" value="high" />
              <el-option label="中风险" value="medium" />
              <el-option label="低风险" value="low" />
            </el-select>
            <el-button type="primary" size="small" @click="exportChurnList">
              导出名单
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table :data="churnCustomers" style="width: 100%">
        <el-table-column prop="name" label="客户姓名" width="150">
          <template #default="{ row }">
            <div class="customer-info">
              <el-avatar :src="row.avatar" :size="32">{{ row.name[0] }}</el-avatar>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="lastActive" label="最后活跃" width="120">
          <template #default="{ row }">
            {{ formatRelativeTime(row.lastActive) }}
          </template>
        </el-table-column>
        <el-table-column prop="riskScore" label="风险评分" width="120">
          <template #default="{ row }">
            <el-progress
              :percentage="row.riskScore"
              :color="getChurnColor(row.riskScore)"
              :stroke-width="6"
            />
          </template>
        </el-table-column>
        <el-table-column prop="riskFactors" label="风险因素" min-width="200">
          <template #default="{ row }">
            <el-tag
              v-for="factor in row.riskFactors"
              :key="factor"
              size="small"
              type="warning"
              style="margin-right: 4px"
            >
              {{ factor }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="value" label="客户价值" width="120">
          <template #default="{ row }">
            ${{ row.value.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="recommendation" label="挽留建议" min-width="200">
          <template #default="{ row }">
            {{ row.recommendation }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="contactCustomer(row)">
              联系客户
            </el-button>
            <el-button size="small" @click="viewDetails(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="churn-summary">
        <div class="summary-item">
          <span class="label">高风险客户</span>
          <span class="value danger">{{ churnSummary.high }} 人</span>
        </div>
        <div class="summary-item">
          <span class="label">中风险客户</span>
          <span class="value warning">{{ churnSummary.medium }} 人</span>
        </div>
        <div class="summary-item">
          <span class="label">低风险客户</span>
          <span class="value success">{{ churnSummary.low }} 人</span>
        </div>
        <div class="summary-item">
          <span class="label">预计损失</span>
          <span class="value">${{ churnSummary.potentialLoss.toLocaleString() }}</span>
        </div>
      </div>
    </el-card>

    <!-- 实时监控对话框 -->
    <el-dialog v-model="realTimeDialog.visible" title="实时行为监控" width="1200px">
      <div class="realtime-monitoring">
        <div class="monitor-stats">
          <div class="stat-item">
            <span class="stat-label">当前在线</span>
            <span class="stat-value">{{ realtimeStats.onlineUsers }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">活跃会话</span>
            <span class="stat-value">{{ realtimeStats.activeSessions }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">页面浏览</span>
            <span class="stat-value">{{ realtimeStats.pageViews }}/分钟</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">转化事件</span>
            <span class="stat-value">{{ realtimeStats.conversions }}</span>
          </div>
        </div>
        
        <div class="monitor-feed">
          <div class="feed-header">
            <span>实时事件流</span>
            <el-switch v-model="autoRefresh" active-text="自动刷新" />
          </div>
          <div class="feed-content">
            <div v-for="event in realtimeEvents" :key="event.id" class="feed-item">
              <div class="event-time">{{ event.time }}</div>
              <div class="event-info">
                <el-icon :class="event.type"><component :is="getEventIcon(event.type)" /></el-icon>
                <span class="event-user">{{ event.user }}</span>
                <span class="event-action">{{ event.action }}</span>
                <el-tag size="small">{{ event.page }}</el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import {
  View, User, ChatDotRound, TrendCharts, Warning, InfoFilled,
  Clock, Document, ShoppingCart, Star, Share, Message, Location
} from '@element-plus/icons-vue'

// 响应式数据
const selectedSegment = ref('all')
const dateRange = ref([
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  new Date()
])
const trajectoryView = ref('timeline')
const churnRiskLevel = ref('all')
const autoRefresh = ref(true)

// 行为统计
const behaviorStats = ref({
  activeUsers: 12456,
  activeRate: 68,
  avgEngagement: 42.5,
  engagementTrend: 5.2,
  retentionRate: 85.3,
  churnRisk: 234,
  churnRiskLevel: '中等'
})

// 行为时间线
const behaviorTimeline = ref([
  {
    id: 1,
    timestamp: '2024-03-15 14:30:00',
    type: 'view',
    title: '浏览产品详情',
    description: '用户浏览了"春季新品"产品页面，停留时间2分35秒',
    channel: '网站',
    userName: '张三',
    device: 'iPhone 12',
    location: '上海',
    important: false
  },
  {
    id: 2,
    timestamp: '2024-03-15 14:35:00',
    type: 'cart',
    title: '添加购物车',
    description: '将2件商品添加到购物车，总价值$256',
    channel: '网站',
    userName: '张三',
    device: 'iPhone 12',
    location: '上海',
    important: true
  },
  {
    id: 3,
    timestamp: '2024-03-15 14:40:00',
    type: 'email',
    title: '打开营销邮件',
    description: '打开了"限时优惠"主题邮件，点击了优惠券链接',
    channel: '邮件',
    userName: '张三',
    device: 'iPhone 12',
    location: '上海',
    important: false
  },
  {
    id: 4,
    timestamp: '2024-03-15 14:45:00',
    type: 'purchase',
    title: '完成购买',
    description: '成功完成订单支付，订单金额$256',
    channel: '网站',
    userName: '张三',
    device: 'iPhone 12',
    location: '上海',
    important: true
  }
])

// 兴趣标签
const topInterests = ref([
  { name: '电子产品', score: 95, category: 'product' },
  { name: '智能家居', score: 88, category: 'product' },
  { name: '限时优惠', score: 82, category: 'promotion' },
  { name: '新品发布', score: 78, category: 'content' },
  { name: '技术评测', score: 72, category: 'content' },
  { name: '品牌故事', score: 65, category: 'brand' },
  { name: '用户评价', score: 60, category: 'social' },
  { name: '售后服务', score: 55, category: 'service' }
])

// 兴趣洞察
const interestInsights = ref([
  { id: 1, text: '对高科技产品表现出强烈兴趣' },
  { id: 2, text: '价格敏感，关注促销信息' },
  { id: 3, text: '重视产品评价和用户反馈' },
  { id: 4, text: '偏好通过邮件接收产品信息' }
])

// 活跃度热力图数据
const activityHeatmap = ref([
  [0, 0, 0, 0, 0, 0, 1, 2, 3, 2, 3, 4, 3, 2, 3, 4, 5, 4, 5, 4, 3, 2, 1, 0],
  [0, 0, 0, 0, 0, 1, 2, 3, 4, 3, 4, 5, 4, 3, 4, 5, 5, 5, 4, 3, 2, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 4, 4, 3, 3, 4, 5, 5, 4, 3, 2, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 2, 3, 4, 4, 5, 5, 4, 4, 5, 5, 4, 3, 2, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 2, 3, 4, 5, 5, 5, 4, 4, 5, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 2, 3, 4, 5, 5, 4, 3, 3, 4, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 2, 3, 3, 4, 3, 2, 2, 3, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0]
])

// 活跃度指标
const activityMetrics = ref({
  avgSessionDuration: 15.3,
  dailyVisits: 3.2,
  pageDepth: 8.5
})

// 流失预警客户
const churnCustomers = ref([
  {
    id: 1,
    name: '李四',
    avatar: 'https://picsum.photos/32/32?random=1',
    lastActive: '2024-03-01',
    riskScore: 85,
    riskFactors: ['30天未登录', '未完成购买', '退订邮件'],
    value: 2456,
    recommendation: '发送个性化优惠券，提供专属客服'
  },
  {
    id: 2,
    name: '王五',
    avatar: 'https://picsum.photos/32/32?random=2',
    lastActive: '2024-03-05',
    riskScore: 72,
    riskFactors: ['活跃度下降', '购买频率降低'],
    value: 1890,
    recommendation: '推送新品信息，邀请参加会员活动'
  },
  {
    id: 3,
    name: '赵六',
    avatar: 'https://picsum.photos/32/32?random=3',
    lastActive: '2024-03-10',
    riskScore: 45,
    riskFactors: ['浏览时长减少'],
    value: 567,
    recommendation: '发送满意度调查，了解需求变化'
  }
])

// 流失统计
const churnSummary = ref({
  high: 45,
  medium: 123,
  low: 234,
  potentialLoss: 156789
})

// 实时监控
const realTimeDialog = ref({
  visible: false
})

const realtimeStats = ref({
  onlineUsers: 234,
  activeSessions: 156,
  pageViews: 45,
  conversions: 12
})

const realtimeEvents = ref([
  {
    id: 1,
    time: '14:35:22',
    type: 'view',
    user: '用户A',
    action: '浏览了',
    page: '产品详情页'
  },
  {
    id: 2,
    time: '14:35:18',
    type: 'cart',
    user: '用户B',
    action: '添加到购物车',
    page: '购物车'
  },
  {
    id: 3,
    time: '14:35:10',
    type: 'purchase',
    user: '用户C',
    action: '完成购买',
    page: '订单确认'
  }
])

// 图表实例
let retentionMiniChartInstance = null
let heatmapChartInstance = null
let flowChartInstance = null
let interestChartInstance = null
let refreshInterval = null

// 计算属性
const getActiveColor = computed(() => {
  const rate = behaviorStats.value.activeRate
  if (rate >= 80) return '#67c23a'
  if (rate >= 60) return '#e6a23c'
  return '#f56c6c'
})

// 方法
const handleSegmentChange = () => {
  loadBehaviorData()
}

const handleDateChange = () => {
  loadBehaviorData()
}

const showRealTimeTracking = () => {
  realTimeDialog.value.visible = true
  startRealtimeMonitoring()
}

const updateTrajectory = () => {
  if (trajectoryView.value === 'heatmap') {
    setTimeout(() => initHeatmapChart(), 100)
  } else if (trajectoryView.value === 'flow') {
    setTimeout(() => initFlowChart(), 100)
  }
}

const exportChurnList = () => {
  ElMessage.success('正在导出流失风险客户名单...')
}

const contactCustomer = (customer) => {
  ElMessage.info(`正在联系客户：${customer.name}`)
}

const viewDetails = (customer) => {
  ElMessage.info(`查看客户详情：${customer.name}`)
}

const getChurnTagType = (level) => {
  const types = {
    '高': 'danger',
    '中等': 'warning',
    '低': 'success'
  }
  return types[level] || 'info'
}

const getTimelineType = (type) => {
  const types = {
    view: 'primary',
    cart: 'warning',
    email: 'info',
    purchase: 'success'
  }
  return types[type] || 'default'
}

const getEventIcon = (type) => {
  const icons = {
    view: 'View',
    cart: 'ShoppingCart',
    email: 'Message',
    purchase: 'SuccessFilled',
    share: 'Share',
    like: 'Star'
  }
  return icons[type] || 'Document'
}

const getInterestSize = (score) => {
  if (score >= 80) return 'large'
  if (score >= 60) return 'default'
  return 'small'
}

const getInterestType = (category) => {
  const types = {
    product: 'primary',
    promotion: 'success',
    content: 'info',
    brand: 'warning',
    social: '',
    service: 'danger'
  }
  return types[category] || ''
}

const getDayLabel = (index) => {
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  return days[index]
}

const getHeatLevel = (value) => {
  if (value === 0) return 'level-0'
  if (value <= 1) return 'level-1'
  if (value <= 2) return 'level-2'
  if (value <= 3) return 'level-3'
  if (value <= 4) return 'level-4'
  return 'level-5'
}

const formatRelativeTime = (dateStr) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  
  if (diff === 0) return '今天'
  if (diff === 1) return '昨天'
  if (diff < 7) return `${diff}天前`
  if (diff < 30) return `${Math.floor(diff / 7)}周前`
  return `${Math.floor(diff / 30)}月前`
}

const getChurnColor = (score) => {
  if (score >= 70) return '#f56c6c'
  if (score >= 40) return '#e6a23c'
  return '#67c23a'
}

const loadBehaviorData = () => {
  // 模拟加载行为数据
  console.log('Loading behavior data...')
}

// 初始化留存率迷你图
const initRetentionMiniChart = () => {
  const chartDom = document.querySelector('.mini-chart')
  if (!chartDom) return
  
  retentionMiniChartInstance = echarts.init(chartDom)
  
  const option = {
    grid: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    },
    xAxis: {
      type: 'category',
      show: false,
      data: ['D1', 'D3', 'D7', 'D14', 'D30']
    },
    yAxis: {
      type: 'value',
      show: false
    },
    series: [
      {
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: [100, 82, 65, 52, 43],
        lineStyle: {
          color: '#67c23a',
          width: 2
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
            { offset: 1, color: 'rgba(103, 194, 58, 0.05)' }
          ])
        }
      }
    ]
  }
  
  retentionMiniChartInstance.setOption(option)
}

// 初始化热力图
const initHeatmapChart = () => {
  const chartDom = document.querySelector('.heatmap-chart')
  if (!chartDom) return
  
  heatmapChartInstance = echarts.init(chartDom)
  
  const hours = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11',
                  '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23']
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  
  const data = []
  for (let i = 0; i < days.length; i++) {
    for (let j = 0; j < hours.length; j++) {
      data.push([j, i, activityHeatmap.value[i][j]])
    }
  }
  
  const option = {
    tooltip: {
      position: 'top'
    },
    grid: {
      left: 50,
      right: 20,
      top: 20,
      bottom: 50
    },
    xAxis: {
      type: 'category',
      data: hours,
      splitArea: {
        show: true
      }
    },
    yAxis: {
      type: 'category',
      data: days,
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: 0,
      max: 5,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      inRange: {
        color: ['#f0f0f0', '#95de64', '#52c41a', '#389e0d', '#237804']
      }
    },
    series: [{
      type: 'heatmap',
      data: data,
      label: {
        show: false
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }
  
  heatmapChartInstance.setOption(option)
}

// 初始化流程图
const initFlowChart = () => {
  const chartDom = document.querySelector('.flow-chart')
  if (!chartDom) return
  
  flowChartInstance = echarts.init(chartDom)
  
  const option = {
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove'
    },
    series: [
      {
        type: 'sankey',
        data: [
          { name: '首页' },
          { name: '产品列表' },
          { name: '产品详情' },
          { name: '购物车' },
          { name: '结算' },
          { name: '支付成功' },
          { name: '退出' }
        ],
        links: [
          { source: '首页', target: '产品列表', value: 500 },
          { source: '首页', target: '产品详情', value: 200 },
          { source: '首页', target: '退出', value: 100 },
          { source: '产品列表', target: '产品详情', value: 400 },
          { source: '产品列表', target: '退出', value: 100 },
          { source: '产品详情', target: '购物车', value: 300 },
          { source: '产品详情', target: '退出', value: 300 },
          { source: '购物车', target: '结算', value: 200 },
          { source: '购物车', target: '退出', value: 100 },
          { source: '结算', target: '支付成功', value: 150 },
          { source: '结算', target: '退出', value: 50 }
        ],
        orient: 'horizontal',
        label: {
          position: 'right'
        },
        lineStyle: {
          color: 'gradient',
          curveness: 0.5
        }
      }
    ]
  }
  
  flowChartInstance.setOption(option)
}

// 初始化兴趣图表
const initInterestChart = () => {
  const chartDom = document.querySelector('.interest-chart')
  if (!chartDom) return
  
  interestChartInstance = echarts.init(chartDom)
  
  const option = {
    radar: {
      indicator: topInterests.value.slice(0, 6).map(item => ({
        name: item.name,
        max: 100
      }))
    },
    series: [{
      type: 'radar',
      data: [{
        value: topInterests.value.slice(0, 6).map(item => item.score),
        name: '兴趣分布',
        areaStyle: {
          color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ])
        }
      }]
    }]
  }
  
  interestChartInstance.setOption(option)
}

// 启动实时监控
const startRealtimeMonitoring = () => {
  if (autoRefresh.value && !refreshInterval) {
    refreshInterval = setInterval(() => {
      // 模拟实时数据更新
      realtimeStats.value.pageViews = Math.floor(Math.random() * 20) + 30
      realtimeStats.value.onlineUsers = Math.floor(Math.random() * 50) + 200
      
      // 添加新事件
      const eventTypes = ['view', 'cart', 'email', 'purchase', 'share']
      const pages = ['首页', '产品详情', '购物车', '个人中心']
      const actions = ['浏览了', '点击了', '分享了', '收藏了']
      
      const newEvent = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        user: `用户${Math.floor(Math.random() * 1000)}`,
        action: actions[Math.floor(Math.random() * actions.length)],
        page: pages[Math.floor(Math.random() * pages.length)]
      }
      
      realtimeEvents.value.unshift(newEvent)
      if (realtimeEvents.value.length > 10) {
        realtimeEvents.value.pop()
      }
    }, 3000)
  }
}

// 停止实时监控
const stopRealtimeMonitoring = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

// 生命周期
onMounted(() => {
  initRetentionMiniChart()
  initInterestChart()
  
  // 响应式调整
  window.addEventListener('resize', () => {
    retentionMiniChartInstance?.resize()
    heatmapChartInstance?.resize()
    flowChartInstance?.resize()
    interestChartInstance?.resize()
  })
})

onUnmounted(() => {
  stopRealtimeMonitoring()
})
</script>

<style scoped>
.behavior-tracking-page {
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

.behavior-overview {
  margin-bottom: 20px;
}

.overview-card {
  height: 140px;
}

.overview-item {
  display: flex;
  align-items: center;
  height: 100%;
}

.overview-icon {
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

.overview-icon.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.overview-icon.engagement {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.overview-icon.retention {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.overview-icon.churn {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.overview-content h3 {
  margin: 0 0 4px 0;
  font-size: 28px;
  font-weight: 600;
}

.overview-content p {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 14px;
}

.trend {
  font-size: 12px;
}

.trend .up {
  color: #67c23a;
}

.trend .down {
  color: #f56c6c;
}

.mini-chart {
  height: 40px;
  margin-top: 8px;
}

.main-content {
  margin-bottom: 20px;
}

.trajectory-card {
  min-height: 600px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.timeline-event {
  padding: 12px;
}

.event-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.event-header .el-icon {
  font-size: 18px;
}

.event-header .view {
  color: #409eff;
}

.event-header .cart {
  color: #e6a23c;
}

.event-header .email {
  color: #909399;
}

.event-header .purchase {
  color: #67c23a;
}

.event-title {
  font-weight: 500;
}

.event-description {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 13px;
}

.event-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
}

.heatmap-chart,
.flow-chart {
  height: 400px;
}

.interest-card {
  margin-bottom: 20px;
}

.interest-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.interest-score {
  margin-left: 4px;
  font-size: 11px;
  opacity: 0.7;
}

.interest-chart {
  height: 200px;
  margin-bottom: 20px;
}

.interest-insights {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.interest-insights h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 500;
}

.interest-insights ul {
  margin: 0;
  padding-left: 20px;
}

.interest-insights li {
  margin-bottom: 4px;
  font-size: 12px;
  color: #666;
}

.activity-card {
  min-height: 400px;
}

.activity-heatmap {
  margin-bottom: 20px;
}

.heatmap-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
  color: #666;
}

.heatmap-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.heatmap-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.day-label {
  width: 40px;
  font-size: 12px;
  color: #666;
}

.hour-cells {
  display: flex;
  gap: 2px;
}

.heat-cell {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  cursor: pointer;
}

.heat-cell.level-0 {
  background: #f0f0f0;
}

.heat-cell.level-1 {
  background: #d6e4ff;
}

.heat-cell.level-2 {
  background: #adc6ff;
}

.heat-cell.level-3 {
  background: #85a5ff;
}

.heat-cell.level-4 {
  background: #597ef7;
}

.heat-cell.level-5 {
  background: #2f54eb;
}

.heatmap-legend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
  font-size: 12px;
  color: #666;
}

.legend-cells {
  display: flex;
  gap: 2px;
}

.activity-metrics {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.metric {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 6px;
}

.metric .label {
  color: #666;
  font-size: 13px;
}

.metric .value {
  font-weight: 500;
  color: #333;
}

.churn-warning-card {
  margin-bottom: 20px;
}

.warning-filters {
  display: flex;
  gap: 12px;
}

.customer-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.churn-summary {
  display: flex;
  justify-content: space-around;
  padding: 20px;
  margin-top: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.summary-item {
  text-align: center;
}

.summary-item .label {
  display: block;
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
}

.summary-item .value {
  font-size: 24px;
  font-weight: 600;
}

.summary-item .danger {
  color: #f56c6c;
}

.summary-item .warning {
  color: #e6a23c;
}

.summary-item .success {
  color: #67c23a;
}

.realtime-monitoring {
  height: 500px;
}

.monitor-stats {
  display: flex;
  justify-content: space-around;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  margin-bottom: 4px;
  color: #666;
  font-size: 12px;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.monitor-feed {
  height: 350px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
}

.feed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.feed-content {
  height: 300px;
  overflow-y: auto;
  padding: 12px 16px;
}

.feed-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.event-time {
  width: 80px;
  color: #999;
  font-size: 12px;
}

.event-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.event-user {
  font-weight: 500;
}

.event-action {
  color: #666;
}
</style>