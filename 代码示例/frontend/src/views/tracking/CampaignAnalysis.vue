<template>
  <div class="campaign-analysis-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>活动效果分析</h1>
      <div class="header-actions">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="handleDateChange"
        />
        <el-button @click="exportReport">
          <el-icon><Download /></el-icon>
          导出报告
        </el-button>
      </div>
    </div>

    <!-- 活动选择器 -->
    <div class="campaign-selector">
      <el-select
        v-model="selectedCampaignId"
        placeholder="选择要分析的活动"
        size="large"
        @change="handleCampaignChange"
      >
        <el-option
          v-for="campaign in campaigns"
          :key="campaign.id"
          :label="campaign.name"
          :value="campaign.id"
        >
          <div class="campaign-option">
            <span class="campaign-name">{{ campaign.name }}</span>
            <el-tag :type="getCampaignStatusType(campaign.status)" size="small">
              {{ getCampaignStatusText(campaign.status) }}
            </el-tag>
          </div>
        </el-option>
      </el-select>
      <div class="campaign-info" v-if="selectedCampaign">
        <span>活动时间：{{ formatDate(selectedCampaign.startDate) }} - {{ formatDate(selectedCampaign.endDate) }}</span>
        <span>目标客户：{{ selectedCampaign.targetCount }} 人</span>
        <span>预算：${{ selectedCampaign.budget.toLocaleString() }}</span>
      </div>
    </div>

    <!-- ROI 分析卡片 -->
    <div class="roi-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="roi-card">
            <div class="roi-item">
              <div class="roi-icon revenue">
                <el-icon><Coin /></el-icon>
              </div>
              <div class="roi-content">
                <h3>${{ roiMetrics.revenue.toLocaleString() }}</h3>
                <p>总收入</p>
                <div class="roi-trend">
                  <span class="trend-value positive">+{{ roiMetrics.revenueGrowth }}%</span>
                  <span class="trend-label">环比增长</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="roi-card">
            <div class="roi-item">
              <div class="roi-icon cost">
                <el-icon><Wallet /></el-icon>
              </div>
              <div class="roi-content">
                <h3>${{ roiMetrics.cost.toLocaleString() }}</h3>
                <p>总成本</p>
                <div class="roi-trend">
                  <span class="trend-value negative">+{{ roiMetrics.costGrowth }}%</span>
                  <span class="trend-label">环比增长</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="roi-card">
            <div class="roi-item">
              <div class="roi-icon roi">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="roi-content">
                <h3>{{ roiMetrics.roi }}%</h3>
                <p>投资回报率</p>
                <div class="roi-trend">
                  <span class="trend-value" :class="roiMetrics.roiGrowth > 0 ? 'positive' : 'negative'">
                    {{ roiMetrics.roiGrowth > 0 ? '+' : '' }}{{ roiMetrics.roiGrowth }}%
                  </span>
                  <span class="trend-label">环比变化</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="roi-card">
            <div class="roi-item">
              <div class="roi-icon conversion">
                <el-icon><User /></el-icon>
              </div>
              <div class="roi-content">
                <h3>${{ roiMetrics.customerValue.toFixed(2) }}</h3>
                <p>客单价</p>
                <div class="roi-trend">
                  <span class="trend-value positive">+{{ roiMetrics.customerValueGrowth }}%</span>
                  <span class="trend-label">环比增长</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 主要内容区域 -->
    <el-row :gutter="20" class="main-content">
      <!-- 转化漏斗 -->
      <el-col :span="12">
        <el-card class="funnel-card">
          <template #header>
            <div class="card-header">
              <span>转化漏斗</span>
              <el-button type="text" size="small" @click="showFunnelDetails">
                查看详情 <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </template>
          <div class="funnel-chart" ref="funnelChart"></div>
          <div class="funnel-stats">
            <div class="funnel-stat" v-for="stage in funnelStages" :key="stage.name">
              <div class="stage-info">
                <span class="stage-name">{{ stage.name }}</span>
                <span class="stage-count">{{ stage.count.toLocaleString() }} 人</span>
              </div>
              <div class="stage-rate">
                <el-progress 
                  :percentage="stage.rate" 
                  :color="getProgressColor(stage.rate)"
                  :stroke-width="8"
                />
                <span class="rate-text">{{ stage.rate }}%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 客户行为分析 -->
      <el-col :span="12">
        <el-card class="behavior-card">
          <template #header>
            <div class="card-header">
              <span>客户行为分析</span>
              <el-select v-model="behaviorMetric" size="small" style="width: 120px">
                <el-option label="点击分布" value="clicks" />
                <el-option label="访问路径" value="paths" />
                <el-option label="停留时长" value="duration" />
              </el-select>
            </div>
          </template>
          <div class="behavior-chart" ref="behaviorChart"></div>
          <div class="behavior-insights">
            <h4>关键洞察</h4>
            <ul>
              <li v-for="insight in behaviorInsights" :key="insight.id">
                <el-icon :class="insight.type"><InfoFilled /></el-icon>
                {{ insight.text }}
              </li>
            </ul>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 对比分析 -->
    <el-card class="comparison-card">
      <template #header>
        <div class="card-header">
          <span>活动对比分析</span>
          <div class="comparison-controls">
            <el-checkbox-group v-model="comparisonCampaigns" @change="updateComparison">
              <el-checkbox 
                v-for="campaign in recentCampaigns" 
                :key="campaign.id" 
                :value="campaign.id"
                :disabled="comparisonCampaigns.length >= 3 && !comparisonCampaigns.includes(campaign.id)"
              >
                {{ campaign.name }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
      </template>
      
      <div class="comparison-content">
        <el-table :data="comparisonData" style="width: 100%">
          <el-table-column prop="name" label="活动名称" width="200" fixed>
            <template #default="{ row }">
              <div class="campaign-name-cell">
                <span>{{ row.name }}</span>
                <el-tag v-if="row.id === selectedCampaignId" type="primary" size="small">当前</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="sendCount" label="发送量" width="100" align="center">
            <template #default="{ row }">
              {{ row.sendCount.toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column prop="openRate" label="打开率" width="100" align="center">
            <template #default="{ row }">
              <div class="rate-cell">
                <span>{{ row.openRate }}%</span>
                <el-icon v-if="row.openRate > averageOpenRate" class="up"><Top /></el-icon>
                <el-icon v-else class="down"><Bottom /></el-icon>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="clickRate" label="点击率" width="100" align="center">
            <template #default="{ row }">
              <div class="rate-cell">
                <span>{{ row.clickRate }}%</span>
                <el-icon v-if="row.clickRate > averageClickRate" class="up"><Top /></el-icon>
                <el-icon v-else class="down"><Bottom /></el-icon>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="conversionRate" label="转化率" width="100" align="center">
            <template #default="{ row }">
              <div class="rate-cell">
                <span>{{ row.conversionRate }}%</span>
                <el-icon v-if="row.conversionRate > averageConversionRate" class="up"><Top /></el-icon>
                <el-icon v-else class="down"><Bottom /></el-icon>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="revenue" label="收入" width="120" align="center">
            <template #default="{ row }">
              ${{ row.revenue.toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column prop="cost" label="成本" width="100" align="center">
            <template #default="{ row }">
              ${{ row.cost.toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column prop="roi" label="ROI" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getRoiTagType(row.roi)">{{ row.roi }}%</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="效果评分" width="120" align="center">
            <template #default="{ row }">
              <el-rate 
                v-model="row.score" 
                disabled 
                :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
              />
            </template>
          </el-table-column>
        </el-table>
        
        <div class="comparison-chart" ref="comparisonChart"></div>
      </div>
    </el-card>

    <!-- 渠道效果分析 -->
    <el-card class="channel-analysis-card">
      <template #header>
        <div class="card-header">
          <span>渠道效果分析</span>
          <el-radio-group v-model="channelMetric" size="small" @change="updateChannelChart">
            <el-radio-button value="reach">触达率</el-radio-button>
            <el-radio-button value="engagement">互动率</el-radio-button>
            <el-radio-button value="conversion">转化率</el-radio-button>
            <el-radio-button value="revenue">收入贡献</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="14">
          <div class="channel-chart" ref="channelChart"></div>
        </el-col>
        <el-col :span="10">
          <div class="channel-details">
            <h4>渠道表现排名</h4>
            <div class="channel-list">
              <div v-for="(channel, index) in sortedChannels" :key="channel.id" class="channel-item">
                <div class="channel-rank">{{ index + 1 }}</div>
                <div class="channel-info">
                  <div class="channel-name">
                    <el-icon :class="channel.type"><component :is="getChannelIcon(channel.type)" /></el-icon>
                    {{ channel.name }}
                  </div>
                  <div class="channel-metrics">
                    <span>触达: {{ channel.reach }}%</span>
                    <span>转化: {{ channel.conversion }}%</span>
                    <span>ROI: {{ channel.roi }}%</span>
                  </div>
                </div>
                <div class="channel-performance">
                  <el-progress 
                    type="circle" 
                    :percentage="channel.performance" 
                    :width="50"
                    :color="getPerformanceColor(channel.performance)"
                  />
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 优化建议 -->
    <el-card class="recommendations-card">
      <template #header>
        <div class="card-header">
          <span>优化建议</span>
          <el-tag type="success">AI 驱动</el-tag>
        </div>
      </template>
      
      <div class="recommendations-content">
        <el-tabs v-model="activeRecommendationType">
          <el-tab-pane label="提升转化率" name="conversion">
            <div class="recommendation-list">
              <div v-for="rec in conversionRecommendations" :key="rec.id" class="recommendation-item">
                <div class="rec-icon" :class="rec.priority">
                  <el-icon><component :is="getRecommendationIcon(rec.type)" /></el-icon>
                </div>
                <div class="rec-content">
                  <h4>{{ rec.title }}</h4>
                  <p>{{ rec.description }}</p>
                  <div class="rec-impact">
                    <span class="impact-label">预期效果：</span>
                    <span class="impact-value">{{ rec.impact }}</span>
                  </div>
                </div>
                <div class="rec-action">
                  <el-button type="primary" size="small" @click="applyRecommendation(rec)">
                    应用建议
                  </el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="降低成本" name="cost">
            <div class="recommendation-list">
              <div v-for="rec in costRecommendations" :key="rec.id" class="recommendation-item">
                <div class="rec-icon" :class="rec.priority">
                  <el-icon><component :is="getRecommendationIcon(rec.type)" /></el-icon>
                </div>
                <div class="rec-content">
                  <h4>{{ rec.title }}</h4>
                  <p>{{ rec.description }}</p>
                  <div class="rec-impact">
                    <span class="impact-label">预期节省：</span>
                    <span class="impact-value">{{ rec.impact }}</span>
                  </div>
                </div>
                <div class="rec-action">
                  <el-button type="primary" size="small" @click="applyRecommendation(rec)">
                    应用建议
                  </el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="提升互动" name="engagement">
            <div class="recommendation-list">
              <div v-for="rec in engagementRecommendations" :key="rec.id" class="recommendation-item">
                <div class="rec-icon" :class="rec.priority">
                  <el-icon><component :is="getRecommendationIcon(rec.type)" /></el-icon>
                </div>
                <div class="rec-content">
                  <h4>{{ rec.title }}</h4>
                  <p>{{ rec.description }}</p>
                  <div class="rec-impact">
                    <span class="impact-label">预期提升：</span>
                    <span class="impact-value">{{ rec.impact }}</span>
                  </div>
                </div>
                <div class="rec-action">
                  <el-button type="primary" size="small" @click="applyRecommendation(rec)">
                    应用建议
                  </el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { 
  Download, Coin, Wallet, TrendCharts, User, ArrowRight, 
  InfoFilled, Top, Bottom, Message, Share, ChatDotRound,
  Clock, Promotion, DataAnalysis, PriceTag
} from '@element-plus/icons-vue'

// 响应式数据
const dateRange = ref([
  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  new Date()
])

const selectedCampaignId = ref(1)
const behaviorMetric = ref('clicks')
const channelMetric = ref('reach')
const activeRecommendationType = ref('conversion')
const comparisonCampaigns = ref([1, 2])

// 活动数据
const campaigns = ref([
  {
    id: 1,
    name: '春季促销活动',
    status: 'completed',
    startDate: '2024-03-01',
    endDate: '2024-03-15',
    targetCount: 10000,
    budget: 5000
  },
  {
    id: 2,
    name: '新品发布推广',
    status: 'active',
    startDate: '2024-03-10',
    endDate: '2024-03-25',
    targetCount: 8000,
    budget: 4000
  },
  {
    id: 3,
    name: '会员专享优惠',
    status: 'completed',
    startDate: '2024-02-15',
    endDate: '2024-02-28',
    targetCount: 5000,
    budget: 2000
  }
])

// ROI指标
const roiMetrics = ref({
  revenue: 45678,
  revenueGrowth: 23.5,
  cost: 4567,
  costGrowth: 8.2,
  roi: 900,
  roiGrowth: 15.3,
  customerValue: 128.50,
  customerValueGrowth: 12.8
})

// 漏斗阶段
const funnelStages = ref([
  { name: '曝光', count: 10000, rate: 100 },
  { name: '点击', count: 3500, rate: 35 },
  { name: '访问', count: 2100, rate: 21 },
  { name: '注册', count: 840, rate: 8.4 },
  { name: '购买', count: 168, rate: 1.68 }
])

// 行为洞察
const behaviorInsights = ref([
  { id: 1, type: 'info', text: '70%的用户在产品页面停留超过2分钟' },
  { id: 2, type: 'success', text: '移动端转化率比PC端高出35%' },
  { id: 3, type: 'warning', text: '购物车放弃率为65%，建议优化结算流程' },
  { id: 4, type: 'info', text: '用户最活跃时间为晚上8-10点' }
])

// 对比数据
const comparisonData = ref([
  {
    id: 1,
    name: '春季促销活动',
    sendCount: 10000,
    openRate: 35.2,
    clickRate: 12.8,
    conversionRate: 3.5,
    revenue: 45678,
    cost: 4567,
    roi: 900,
    score: 4.5
  },
  {
    id: 2,
    name: '新品发布推广',
    sendCount: 8000,
    openRate: 42.1,
    clickRate: 15.3,
    conversionRate: 4.2,
    revenue: 38456,
    cost: 4000,
    roi: 860,
    score: 4.0
  },
  {
    id: 3,
    name: '会员专享优惠',
    sendCount: 5000,
    openRate: 48.5,
    clickRate: 18.7,
    conversionRate: 5.8,
    revenue: 28900,
    cost: 2000,
    roi: 1345,
    score: 5.0
  }
])

// 渠道数据
const channels = ref([
  { id: 1, type: 'email', name: '邮件', reach: 85, engagement: 35, conversion: 3.5, revenue: 15678, roi: 850, performance: 78 },
  { id: 2, type: 'social', name: '社交媒体', reach: 92, engagement: 48, conversion: 2.8, revenue: 12345, roi: 720, performance: 82 },
  { id: 3, type: 'whatsapp', name: 'WhatsApp', reach: 78, engagement: 52, conversion: 4.2, revenue: 8900, roi: 920, performance: 85 },
  { id: 4, type: 'sms', name: '短信', reach: 95, engagement: 28, conversion: 2.1, revenue: 5600, roi: 650, performance: 65 }
])

// 优化建议
const conversionRecommendations = ref([
  {
    id: 1,
    type: 'timing',
    priority: 'high',
    title: '优化发送时间',
    description: '根据用户行为分析，建议将邮件发送时间调整至晚上8-10点，预计可提升打开率15%',
    impact: '转化率提升15-20%'
  },
  {
    id: 2,
    type: 'content',
    priority: 'medium',
    title: '个性化内容推荐',
    description: '基于用户历史浏览记录，推送个性化产品推荐，提高内容相关性',
    impact: '点击率提升25%'
  }
])

const costRecommendations = ref([
  {
    id: 1,
    type: 'channel',
    priority: 'high',
    title: '优化渠道组合',
    description: '减少低效渠道投入，将预算重新分配到高ROI渠道',
    impact: '节省20%营销成本'
  },
  {
    id: 2,
    type: 'targeting',
    priority: 'medium',
    title: '精准定向优化',
    description: '缩小目标受众范围，聚焦高价值客户群体',
    impact: '降低30%获客成本'
  }
])

const engagementRecommendations = ref([
  {
    id: 1,
    type: 'interactive',
    priority: 'high',
    title: '增加互动元素',
    description: '在邮件中添加调查问卷、投票等互动元素，提高用户参与度',
    impact: '互动率提升40%'
  },
  {
    id: 2,
    type: 'frequency',
    priority: 'medium',
    title: '调整发送频率',
    description: '根据用户偏好调整消息发送频率，避免过度打扰',
    impact: '退订率降低25%'
  }
])

// 图表实例
let funnelChartInstance = null
let behaviorChartInstance = null
let comparisonChartInstance = null
let channelChartInstance = null

// 计算属性
const selectedCampaign = computed(() => {
  return campaigns.value.find(c => c.id === selectedCampaignId.value)
})

const recentCampaigns = computed(() => {
  return campaigns.value.slice(0, 5)
})

const averageOpenRate = computed(() => {
  const total = comparisonData.value.reduce((sum, item) => sum + item.openRate, 0)
  return total / comparisonData.value.length
})

const averageClickRate = computed(() => {
  const total = comparisonData.value.reduce((sum, item) => sum + item.clickRate, 0)
  return total / comparisonData.value.length
})

const averageConversionRate = computed(() => {
  const total = comparisonData.value.reduce((sum, item) => sum + item.conversionRate, 0)
  return total / comparisonData.value.length
})

const sortedChannels = computed(() => {
  return [...channels.value].sort((a, b) => b[channelMetric.value] - a[channelMetric.value])
})

// 方法
const handleDateChange = () => {
  loadCampaignData()
}

const handleCampaignChange = () => {
  loadCampaignData()
}

const exportReport = () => {
  ElMessage.success('报告导出中...')
}

const showFunnelDetails = () => {
  ElMessage.info('查看漏斗详情')
}

const updateComparison = () => {
  updateComparisonChart()
}

const updateChannelChart = () => {
  initChannelChart()
}

const applyRecommendation = (rec) => {
  ElMessage.success(`正在应用建议：${rec.title}`)
}

const getCampaignStatusType = (status) => {
  const types = {
    active: 'success',
    completed: 'info',
    draft: 'warning'
  }
  return types[status] || 'default'
}

const getCampaignStatusText = (status) => {
  const texts = {
    active: '进行中',
    completed: '已完成',
    draft: '草稿'
  }
  return texts[status] || status
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const getProgressColor = (percentage) => {
  if (percentage >= 80) return '#67c23a'
  if (percentage >= 50) return '#e6a23c'
  return '#f56c6c'
}

const getRoiTagType = (roi) => {
  if (roi >= 1000) return 'success'
  if (roi >= 500) return 'warning'
  return 'danger'
}

const getPerformanceColor = (performance) => {
  if (performance >= 80) return '#67c23a'
  if (performance >= 60) return '#e6a23c'
  return '#f56c6c'
}

const getChannelIcon = (type) => {
  const icons = {
    email: 'Message',
    social: 'Share',
    whatsapp: 'ChatDotRound',
    sms: 'Iphone'
  }
  return icons[type] || 'Promotion'
}

const getRecommendationIcon = (type) => {
  const icons = {
    timing: 'Clock',
    content: 'Document',
    channel: 'Share',
    targeting: 'Aim',
    interactive: 'ChatDotRound',
    frequency: 'Calendar'
  }
  return icons[type] || 'Promotion'
}

const loadCampaignData = () => {
  // 模拟加载活动数据
  console.log('Loading campaign data...')
}

// 初始化漏斗图
const initFunnelChart = () => {
  const chartDom = document.querySelector('.funnel-chart')
  if (!chartDom) return
  
  funnelChartInstance = echarts.init(chartDom)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} 人 ({d}%)'
    },
    series: [
      {
        type: 'funnel',
        left: '10%',
        top: 20,
        bottom: 20,
        width: '80%',
        min: 0,
        max: 10000,
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: {
          show: true,
          position: 'inside'
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: 'solid'
          }
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1
        },
        emphasis: {
          label: {
            fontSize: 20
          }
        },
        data: funnelStages.value.map(stage => ({
          name: stage.name,
          value: stage.count
        }))
      }
    ]
  }
  
  funnelChartInstance.setOption(option)
}

// 初始化行为图表
const initBehaviorChart = () => {
  const chartDom = document.querySelector('.behavior-chart')
  if (!chartDom) return
  
  behaviorChartInstance = echarts.init(chartDom)
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['首页', '产品列表', '产品详情', '购物车', '结算', '支付']
    },
    yAxis: {
      type: 'value',
      name: '用户数'
    },
    series: [
      {
        type: 'line',
        smooth: true,
        data: [10000, 6500, 4200, 2100, 840, 168],
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
          ])
        }
      }
    ]
  }
  
  behaviorChartInstance.setOption(option)
}

// 初始化对比图表
const updateComparisonChart = () => {
  const chartDom = document.querySelector('.comparison-chart')
  if (!chartDom) return
  
  if (!comparisonChartInstance) {
    comparisonChartInstance = echarts.init(chartDom)
  }
  
  const selectedData = comparisonData.value.filter(item => 
    comparisonCampaigns.value.includes(item.id)
  )
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: selectedData.map(item => item.name)
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['打开率', '点击率', '转化率', 'ROI']
    },
    yAxis: {
      type: 'value'
    },
    series: selectedData.map(item => ({
      name: item.name,
      type: 'bar',
      data: [item.openRate, item.clickRate, item.conversionRate, item.roi / 10]
    }))
  }
  
  comparisonChartInstance.setOption(option)
}

// 初始化渠道图表
const initChannelChart = () => {
  const chartDom = document.querySelector('.channel-chart')
  if (!chartDom) return
  
  if (!channelChartInstance) {
    channelChartInstance = echarts.init(chartDom)
  }
  
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: channels.value.map(channel => ({
          name: channel.name,
          value: channel[channelMetric.value]
        }))
      }
    ]
  }
  
  channelChartInstance.setOption(option)
}

// 生命周期
onMounted(() => {
  initFunnelChart()
  initBehaviorChart()
  updateComparisonChart()
  initChannelChart()
  
  // 响应式调整
  window.addEventListener('resize', () => {
    funnelChartInstance?.resize()
    behaviorChartInstance?.resize()
    comparisonChartInstance?.resize()
    channelChartInstance?.resize()
  })
})

// 监听变化
watch(behaviorMetric, () => {
  initBehaviorChart()
})

watch(channelMetric, () => {
  initChannelChart()
})
</script>

<style scoped>
.campaign-analysis-page {
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

.campaign-selector {
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.campaign-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.campaign-info {
  margin-top: 12px;
  display: flex;
  gap: 24px;
  font-size: 14px;
  color: #666;
}

.roi-cards {
  margin-bottom: 20px;
}

.roi-card {
  height: 140px;
}

.roi-item {
  display: flex;
  align-items: center;
  height: 100%;
}

.roi-icon {
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

.roi-icon.revenue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.roi-icon.cost {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.roi-icon.roi {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.roi-icon.conversion {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.roi-content h3 {
  margin: 0 0 4px 0;
  font-size: 28px;
  font-weight: 600;
}

.roi-content p {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 14px;
}

.roi-trend {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.trend-value {
  font-weight: 500;
}

.trend-value.positive {
  color: #67c23a;
}

.trend-value.negative {
  color: #f56c6c;
}

.trend-label {
  color: #999;
}

.main-content {
  margin-bottom: 20px;
}

.funnel-card,
.behavior-card {
  height: 520px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.funnel-chart,
.behavior-chart {
  height: 300px;
}

.funnel-stats {
  margin-top: 20px;
}

.funnel-stat {
  margin-bottom: 12px;
}

.stage-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 14px;
}

.stage-rate {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rate-text {
  font-size: 12px;
  color: #666;
}

.behavior-insights {
  margin-top: 20px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.behavior-insights h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
}

.behavior-insights ul {
  margin: 0;
  padding-left: 20px;
}

.behavior-insights li {
  margin-bottom: 8px;
  font-size: 13px;
  line-height: 1.4;
}

.behavior-insights .el-icon {
  margin-right: 4px;
}

.behavior-insights .info {
  color: #409eff;
}

.behavior-insights .success {
  color: #67c23a;
}

.behavior-insights .warning {
  color: #e6a23c;
}

.comparison-card {
  margin-bottom: 20px;
}

.comparison-controls {
  display: flex;
  align-items: center;
}

.campaign-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rate-cell {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rate-cell .up {
  color: #67c23a;
  font-size: 12px;
}

.rate-cell .down {
  color: #f56c6c;
  font-size: 12px;
}

.comparison-chart {
  height: 300px;
  margin-top: 20px;
}

.channel-analysis-card {
  margin-bottom: 20px;
}

.channel-chart {
  height: 350px;
}

.channel-details {
  padding: 20px;
}

.channel-details h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 500;
}

.channel-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.channel-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.channel-rank {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
  font-weight: 600;
  margin-right: 12px;
}

.channel-info {
  flex: 1;
}

.channel-name {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  font-weight: 500;
}

.channel-name .el-icon {
  font-size: 16px;
}

.channel-name .email {
  color: #409eff;
}

.channel-name .social {
  color: #e6a23c;
}

.channel-name .whatsapp {
  color: #67c23a;
}

.channel-name .sms {
  color: #909399;
}

.channel-metrics {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #666;
}

.recommendations-card {
  margin-bottom: 20px;
}

.recommendation-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recommendation-item {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.rec-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  margin-right: 16px;
  color: white;
  font-size: 20px;
}

.rec-icon.high {
  background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
}

.rec-icon.medium {
  background: linear-gradient(135deg, #ffa726 0%, #fb8c00 100%);
}

.rec-icon.low {
  background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
}

.rec-content {
  flex: 1;
}

.rec-content h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
}

.rec-content p {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
}

.rec-impact {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.impact-label {
  color: #999;
}

.impact-value {
  color: #67c23a;
  font-weight: 500;
}

.rec-action {
  margin-left: 16px;
}
</style>