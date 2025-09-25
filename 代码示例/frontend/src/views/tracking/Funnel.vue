<template>
  <div class="conversion-analysis-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>转化分析</h1>
      <div class="header-actions">
        <el-select v-model="selectedFunnel" placeholder="选择漏斗" @change="handleFunnelChange">
          <el-option label="注册转化漏斗" value="register" />
          <el-option label="购买转化漏斗" value="purchase" />
          <el-option label="订阅转化漏斗" value="subscribe" />
          <el-option label="自定义漏斗" value="custom" />
        </el-select>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="handleDateChange"
        />
        <el-button type="primary" @click="createFunnel">
          <el-icon><Plus /></el-icon>
          创建漏斗
        </el-button>
      </div>
    </div>

    <!-- 转化概览 -->
    <div class="conversion-overview">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="overview-item">
              <div class="overview-value">{{ conversionMetrics.totalConversions.toLocaleString() }}</div>
              <div class="overview-label">总转化数</div>
              <div class="overview-trend">
                <span :class="conversionMetrics.conversionTrend > 0 ? 'up' : 'down'">
                  {{ conversionMetrics.conversionTrend > 0 ? '↑' : '↓' }}
                  {{ Math.abs(conversionMetrics.conversionTrend) }}%
                </span>
                <span class="trend-label">较上期</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="overview-item">
              <div class="overview-value">{{ conversionMetrics.conversionRate }}%</div>
              <div class="overview-label">转化率</div>
              <div class="overview-trend">
                <span :class="conversionMetrics.rateTrend > 0 ? 'up' : 'down'">
                  {{ conversionMetrics.rateTrend > 0 ? '↑' : '↓' }}
                  {{ Math.abs(conversionMetrics.rateTrend) }}%
                </span>
                <span class="trend-label">较上期</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="overview-item">
              <div class="overview-value">${{ conversionMetrics.avgOrderValue.toFixed(2) }}</div>
              <div class="overview-label">平均订单价值</div>
              <div class="overview-trend">
                <span :class="conversionMetrics.aovTrend > 0 ? 'up' : 'down'">
                  {{ conversionMetrics.aovTrend > 0 ? '↑' : '↓' }}
                  {{ Math.abs(conversionMetrics.aovTrend) }}%
                </span>
                <span class="trend-label">较上期</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="overview-item">
              <div class="overview-value">{{ conversionMetrics.avgConversionTime }}</div>
              <div class="overview-label">平均转化时间</div>
              <div class="overview-trend">
                <span :class="conversionMetrics.timeTrend < 0 ? 'up' : 'down'">
                  {{ conversionMetrics.timeTrend < 0 ? '↓' : '↑' }}
                  {{ Math.abs(conversionMetrics.timeTrend) }}%
                </span>
                <span class="trend-label">较上期</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 主要内容区域 -->
    <el-row :gutter="20" class="main-content">
      <!-- 转化路径分析 -->
      <el-col :span="16">
        <el-card class="path-analysis-card">
          <template #header>
            <div class="card-header">
              <span>转化路径分析</span>
              <el-radio-group v-model="pathView" size="small" @change="updatePathChart">
                <el-radio-button value="funnel">漏斗图</el-radio-button>
                <el-radio-button value="sankey">桑基图</el-radio-button>
                <el-radio-button value="tree">路径树</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          
          <div class="path-chart" ref="pathChart"></div>
          
          <div class="path-details">
            <el-table :data="pathSteps" style="width: 100%">
              <el-table-column prop="step" label="步骤" width="200">
                <template #default="{ row }">
                  <div class="step-info">
                    <span class="step-number">{{ row.order }}</span>
                    <span class="step-name">{{ row.step }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="users" label="用户数" width="120">
                <template #default="{ row }">
                  {{ row.users.toLocaleString() }}
                </template>
              </el-table-column>
              <el-table-column prop="conversionRate" label="转化率" width="120">
                <template #default="{ row }">
                  <el-progress
                    :percentage="row.conversionRate"
                    :color="getProgressColor(row.conversionRate)"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="dropRate" label="流失率" width="100">
                <template #default="{ row }">
                  <span class="drop-rate">{{ row.dropRate }}%</span>
                </template>
              </el-table-column>
              <el-table-column prop="avgTime" label="平均停留" width="100">
                <template #default="{ row }">
                  {{ row.avgTime }}
                </template>
              </el-table-column>
              <el-table-column label="优化建议" min-width="200">
                <template #default="{ row }">
                  <el-tag v-if="row.suggestion" type="warning" size="small">
                    {{ row.suggestion }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>

      <!-- 归因分析 -->
      <el-col :span="8">
        <el-card class="attribution-card">
          <template #header>
            <div class="card-header">
              <span>归因分析</span>
              <el-dropdown @command="handleAttributionModel">
                <span class="attribution-model">
                  {{ currentAttributionModel }}
                  <el-icon><ArrowDown /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="firstTouch">首次触点</el-dropdown-item>
                    <el-dropdown-item command="lastTouch">最后触点</el-dropdown-item>
                    <el-dropdown-item command="linear">线性归因</el-dropdown-item>
                    <el-dropdown-item command="timeDecay">时间衰减</el-dropdown-item>
                    <el-dropdown-item command="datadriven">数据驱动</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
          
          <div class="attribution-chart" ref="attributionChart"></div>
          
          <div class="attribution-list">
            <div v-for="channel in attributionChannels" :key="channel.name" class="attribution-item">
              <div class="channel-info">
                <el-icon :class="channel.type"><component :is="getChannelIcon(channel.type)" /></el-icon>
                <span class="channel-name">{{ channel.name }}</span>
              </div>
              <div class="channel-metrics">
                <div class="metric-value">{{ channel.conversions }}</div>
                <div class="metric-label">转化</div>
              </div>
              <div class="channel-contribution">
                <el-progress
                  :percentage="channel.contribution"
                  :stroke-width="6"
                  :color="getContributionColor(channel.contribution)"
                />
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- A/B测试 -->
    <el-card class="ab-testing-card">
      <template #header>
        <div class="card-header">
          <span>A/B测试</span>
          <div class="ab-controls">
            <el-select v-model="selectedTest" size="small" style="width: 200px">
              <el-option
                v-for="test in abTests"
                :key="test.id"
                :label="test.name"
                :value="test.id"
              />
            </el-select>
            <el-button type="primary" size="small" @click="createABTest">
              创建测试
            </el-button>
          </div>
        </div>
      </template>
      
      <div class="ab-test-details" v-if="currentTest">
        <div class="test-info">
          <div class="info-item">
            <span class="label">测试状态：</span>
            <el-tag :type="getTestStatusType(currentTest.status)">
              {{ currentTest.status }}
            </el-tag>
          </div>
          <div class="info-item">
            <span class="label">测试时间：</span>
            <span>{{ formatDateRange(currentTest.startDate, currentTest.endDate) }}</span>
          </div>
          <div class="info-item">
            <span class="label">样本量：</span>
            <span>{{ currentTest.sampleSize.toLocaleString() }} 用户</span>
          </div>
          <div class="info-item">
            <span class="label">置信度：</span>
            <el-progress
              :percentage="currentTest.confidence"
              :color="getConfidenceColor(currentTest.confidence)"
              style="width: 100px"
            />
          </div>
        </div>
        
        <div class="test-variants">
          <el-row :gutter="20">
            <el-col :span="12" v-for="variant in currentTest.variants" :key="variant.id">
              <div class="variant-card" :class="{ winner: variant.isWinner }">
                <div class="variant-header">
                  <span class="variant-name">{{ variant.name }}</span>
                  <el-tag v-if="variant.isWinner" type="success" size="small">胜出</el-tag>
                  <el-tag v-else-if="variant.isControl" type="info" size="small">对照组</el-tag>
                </div>
                
                <div class="variant-metrics">
                  <div class="metric">
                    <span class="value">{{ variant.conversions }}</span>
                    <span class="label">转化数</span>
                  </div>
                  <div class="metric">
                    <span class="value">{{ variant.conversionRate }}%</span>
                    <span class="label">转化率</span>
                  </div>
                  <div class="metric">
                    <span class="value">${{ variant.revenue.toLocaleString() }}</span>
                    <span class="label">收入</span>
                  </div>
                </div>
                
                <div class="variant-chart" :ref="`variantChart${variant.id}`"></div>
                
                <div class="variant-improvement" v-if="!variant.isControl">
                  <span class="improvement-label">相比对照组：</span>
                  <span class="improvement-value" :class="variant.improvement > 0 ? 'positive' : 'negative'">
                    {{ variant.improvement > 0 ? '+' : '' }}{{ variant.improvement }}%
                  </span>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
        
        <div class="test-recommendation">
          <el-alert
            :title="currentTest.recommendation.title"
            :type="currentTest.recommendation.type"
            :description="currentTest.recommendation.description"
            show-icon
          />
        </div>
      </div>
    </el-card>

    <!-- 优化建议 -->
    <el-card class="optimization-card">
      <template #header>
        <div class="card-header">
          <span>优化建议</span>
          <el-tag type="success">AI 驱动</el-tag>
        </div>
      </template>
      
      <div class="optimization-content">
        <el-tabs v-model="activeOptimizationType">
          <el-tab-pane label="漏斗优化" name="funnel">
            <div class="optimization-list">
              <div v-for="opt in funnelOptimizations" :key="opt.id" class="optimization-item">
                <div class="opt-priority" :class="opt.priority">
                  <span>{{ getPriorityText(opt.priority) }}</span>
                </div>
                <div class="opt-content">
                  <h4>{{ opt.title }}</h4>
                  <p>{{ opt.description }}</p>
                  <div class="opt-metrics">
                    <span class="metric">
                      <el-icon><TrendCharts /></el-icon>
                      预期提升：{{ opt.expectedLift }}%
                    </span>
                    <span class="metric">
                      <el-icon><User /></el-icon>
                      影响用户：{{ opt.affectedUsers.toLocaleString() }}
                    </span>
                    <span class="metric">
                      <el-icon><Coin /></el-icon>
                      预期收益：${{ opt.expectedRevenue.toLocaleString() }}
                    </span>
                  </div>
                </div>
                <div class="opt-action">
                  <el-button type="primary" size="small" @click="applyOptimization(opt)">
                    应用优化
                  </el-button>
                  <el-button size="small" @click="testOptimization(opt)">
                    测试
                  </el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="页面优化" name="page">
            <div class="page-optimization">
              <div class="page-heatmap" ref="pageHeatmap"></div>
              <div class="page-suggestions">
                <h4>页面优化建议</h4>
                <ul>
                  <li v-for="suggestion in pageSuggestions" :key="suggestion.id">
                    <el-icon :class="suggestion.type"><component :is="getSuggestionIcon(suggestion.type)" /></el-icon>
                    {{ suggestion.text }}
                  </li>
                </ul>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="流程优化" name="process">
            <div class="process-optimization">
              <el-timeline>
                <el-timeline-item
                  v-for="step in processSteps"
                  :key="step.id"
                  :type="step.status"
                  :hollow="step.isOptimized"
                >
                  <div class="process-step">
                    <div class="step-header">
                      <span class="step-title">{{ step.title }}</span>
                      <el-tag v-if="step.isBottleneck" type="danger" size="small">瓶颈</el-tag>
                    </div>
                    <div class="step-metrics">
                      <span>平均耗时：{{ step.avgTime }}</span>
                      <span>流失率：{{ step.dropRate }}%</span>
                    </div>
                    <div class="step-optimization" v-if="step.optimization">
                      <el-alert
                        :title="step.optimization"
                        type="warning"
                        :closable="false"
                        show-icon
                      />
                    </div>
                  </div>
                </el-timeline-item>
              </el-timeline>
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
  Plus, ArrowDown, TrendCharts, User, Coin, Message, Share,
  ShoppingCart, CreditCard, Warning, Setting, DataAnalysis
} from '@element-plus/icons-vue'

// 响应式数据
const selectedFunnel = ref('purchase')
const dateRange = ref([
  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  new Date()
])
const pathView = ref('funnel')
const currentAttributionModel = ref('最后触点')
const selectedTest = ref(1)
const activeOptimizationType = ref('funnel')

// 转化指标
const conversionMetrics = ref({
  totalConversions: 3456,
  conversionTrend: 12.5,
  conversionRate: 3.8,
  rateTrend: 8.2,
  avgOrderValue: 156.80,
  aovTrend: 5.3,
  avgConversionTime: '2.5天',
  timeTrend: -15.2
})

// 路径步骤
const pathSteps = ref([
  {
    order: 1,
    step: '访问首页',
    users: 10000,
    conversionRate: 100,
    dropRate: 0,
    avgTime: '45秒',
    suggestion: null
  },
  {
    order: 2,
    step: '浏览产品',
    users: 6500,
    conversionRate: 65,
    dropRate: 35,
    avgTime: '3分12秒',
    suggestion: '优化产品推荐算法'
  },
  {
    order: 3,
    step: '添加购物车',
    users: 2800,
    conversionRate: 28,
    dropRate: 57,
    avgTime: '1分30秒',
    suggestion: '简化添加流程'
  },
  {
    order: 4,
    step: '开始结算',
    users: 1200,
    conversionRate: 12,
    dropRate: 57,
    avgTime: '2分45秒',
    suggestion: '减少表单字段'
  },
  {
    order: 5,
    step: '完成支付',
    users: 380,
    conversionRate: 3.8,
    dropRate: 68,
    avgTime: '1分15秒',
    suggestion: '增加支付方式'
  }
])

// 归因渠道
const attributionChannels = ref([
  { name: '邮件营销', type: 'email', conversions: 156, contribution: 45 },
  { name: '社交媒体', type: 'social', conversions: 98, contribution: 28 },
  { name: '付费搜索', type: 'search', conversions: 67, contribution: 19 },
  { name: '直接访问', type: 'direct', conversions: 28, contribution: 8 }
])

// A/B测试
const abTests = ref([
  { id: 1, name: '结算页面优化测试' },
  { id: 2, name: '产品推荐算法测试' },
  { id: 3, name: '价格展示方式测试' }
])

const currentTest = ref({
  id: 1,
  name: '结算页面优化测试',
  status: '进行中',
  startDate: '2024-03-01',
  endDate: '2024-03-15',
  sampleSize: 5000,
  confidence: 95,
  variants: [
    {
      id: 'a',
      name: '版本A（对照组）',
      isControl: true,
      isWinner: false,
      conversions: 150,
      conversionRate: 3.0,
      revenue: 23400,
      improvement: 0
    },
    {
      id: 'b',
      name: '版本B（简化表单）',
      isControl: false,
      isWinner: true,
      conversions: 195,
      conversionRate: 3.9,
      revenue: 30420,
      improvement: 30
    }
  ],
  recommendation: {
    title: '版本B表现显著优于对照组',
    type: 'success',
    description: '建议采用版本B的简化表单设计，预计可提升30%的转化率。置信度已达到95%，结果具有统计显著性。'
  }
})

// 漏斗优化建议
const funnelOptimizations = ref([
  {
    id: 1,
    priority: 'high',
    title: '优化购物车页面加载速度',
    description: '当前购物车页面加载时间超过3秒，导致57%的用户流失。通过优化图片加载和减少API调用可显著改善。',
    expectedLift: 25,
    affectedUsers: 2800,
    expectedRevenue: 45000
  },
  {
    id: 2,
    priority: 'medium',
    title: '添加进度指示器',
    description: '在结算流程中添加清晰的进度指示，让用户了解还需完成的步骤，可以减少焦虑感。',
    expectedLift: 15,
    affectedUsers: 1200,
    expectedRevenue: 18000
  },
  {
    id: 3,
    priority: 'low',
    title: '优化移动端体验',
    description: '移动端转化率比桌面端低40%，需要针对移动设备优化界面和交互。',
    expectedLift: 10,
    affectedUsers: 3500,
    expectedRevenue: 12000
  }
])

// 页面优化建议
const pageSuggestions = ref([
  { id: 1, type: 'speed', text: '压缩图片资源，减少页面加载时间' },
  { id: 2, type: 'layout', text: '将重要CTA按钮移至首屏可见区域' },
  { id: 3, type: 'content', text: '添加用户评价和信任标识增强可信度' },
  { id: 4, type: 'interaction', text: '减少表单必填字段，降低填写门槛' }
])

// 流程步骤
const processSteps = ref([
  {
    id: 1,
    title: '用户注册',
    status: 'success',
    isOptimized: true,
    isBottleneck: false,
    avgTime: '1分30秒',
    dropRate: 15,
    optimization: null
  },
  {
    id: 2,
    title: '邮箱验证',
    status: 'warning',
    isOptimized: false,
    isBottleneck: true,
    avgTime: '5分钟',
    dropRate: 35,
    optimization: '建议改为可选验证或延后验证'
  },
  {
    id: 3,
    title: '完善资料',
    status: 'primary',
    isOptimized: false,
    isBottleneck: false,
    avgTime: '2分钟',
    dropRate: 20,
    optimization: '简化必填信息，其他信息可后续补充'
  },
  {
    id: 4,
    title: '首次购买',
    status: 'success',
    isOptimized: true,
    isBottleneck: false,
    avgTime: '3分钟',
    dropRate: 10,
    optimization: null
  }
])

// 图表实例
let pathChartInstance = null
let attributionChartInstance = null
let variantChartInstances = {}
let pageHeatmapInstance = null

// 方法
const handleFunnelChange = () => {
  loadFunnelData()
}

const handleDateChange = () => {
  loadFunnelData()
}

const createFunnel = () => {
  ElMessage.info('创建漏斗功能开发中')
}

const updatePathChart = () => {
  if (pathView.value === 'funnel') {
    initFunnelChart()
  } else if (pathView.value === 'sankey') {
    initSankeyChart()
  } else {
    initTreeChart()
  }
}

const handleAttributionModel = (model) => {
  const models = {
    firstTouch: '首次触点',
    lastTouch: '最后触点',
    linear: '线性归因',
    timeDecay: '时间衰减',
    datadriven: '数据驱动'
  }
  currentAttributionModel.value = models[model]
  updateAttributionData()
}

const createABTest = () => {
  ElMessage.info('创建A/B测试功能开发中')
}

const applyOptimization = (opt) => {
  ElMessage.success(`正在应用优化：${opt.title}`)
}

const testOptimization = (opt) => {
  ElMessage.info(`创建A/B测试：${opt.title}`)
}

const getProgressColor = (percentage) => {
  if (percentage >= 80) return '#67c23a'
  if (percentage >= 50) return '#e6a23c'
  return '#f56c6c'
}

const getChannelIcon = (type) => {
  const icons = {
    email: 'Message',
    social: 'Share',
    search: 'Search',
    direct: 'Link'
  }
  return icons[type] || 'Promotion'
}

const getContributionColor = (contribution) => {
  if (contribution >= 40) return '#67c23a'
  if (contribution >= 20) return '#e6a23c'
  return '#909399'
}

const getTestStatusType = (status) => {
  const types = {
    '进行中': 'primary',
    '已完成': 'success',
    '已暂停': 'warning',
    '已取消': 'info'
  }
  return types[status] || 'default'
}

const getConfidenceColor = (confidence) => {
  if (confidence >= 95) return '#67c23a'
  if (confidence >= 90) return '#e6a23c'
  return '#f56c6c'
}

const formatDateRange = (start, end) => {
  return `${start} ~ ${end}`
}

const getPriorityText = (priority) => {
  const texts = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return texts[priority] || priority
}

const getSuggestionIcon = (type) => {
  const icons = {
    speed: 'Timer',
    layout: 'Grid',
    content: 'Document',
    interaction: 'Mouse'
  }
  return icons[type] || 'InfoFilled'
}

const loadFunnelData = () => {
  // 模拟加载漏斗数据
  console.log('Loading funnel data...')
}

const updateAttributionData = () => {
  // 更新归因数据
  updateAttributionChart()
}

// 初始化漏斗图
const initFunnelChart = () => {
  const chartDom = document.querySelector('.path-chart')
  if (!chartDom) return
  
  if (!pathChartInstance) {
    pathChartInstance = echarts.init(chartDom)
  }
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} 用户 ({d}%)'
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
          position: 'inside',
          formatter: '{b}\n{c} 用户'
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
        data: pathSteps.value.map(step => ({
          name: step.step,
          value: step.users
        }))
      }
    ]
  }
  
  pathChartInstance.setOption(option)
}

// 初始化桑基图
const initSankeyChart = () => {
  const chartDom = document.querySelector('.path-chart')
  if (!chartDom) return
  
  if (!pathChartInstance) {
    pathChartInstance = echarts.init(chartDom)
  }
  
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
          { name: '产品页' },
          { name: '购物车' },
          { name: '结算' },
          { name: '支付' },
          { name: '退出' }
        ],
        links: [
          { source: '首页', target: '产品页', value: 6500 },
          { source: '首页', target: '退出', value: 3500 },
          { source: '产品页', target: '购物车', value: 2800 },
          { source: '产品页', target: '退出', value: 3700 },
          { source: '购物车', target: '结算', value: 1200 },
          { source: '购物车', target: '退出', value: 1600 },
          { source: '结算', target: '支付', value: 380 },
          { source: '结算', target: '退出', value: 820 }
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
  
  pathChartInstance.setOption(option)
}

// 初始化树图
const initTreeChart = () => {
  const chartDom = document.querySelector('.path-chart')
  if (!chartDom) return
  
  if (!pathChartInstance) {
    pathChartInstance = echarts.init(chartDom)
  }
  
  const option = {
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove'
    },
    series: [
      {
        type: 'tree',
        data: [{
          name: '首页',
          value: 10000,
          children: [
            {
              name: '产品页',
              value: 6500,
              children: [
                {
                  name: '购物车',
                  value: 2800,
                  children: [
                    { name: '结算', value: 1200 },
                    { name: '放弃', value: 1600 }
                  ]
                },
                { name: '继续浏览', value: 3700 }
              ]
            },
            { name: '直接退出', value: 3500 }
          ]
        }],
        top: '5%',
        left: '7%',
        bottom: '2%',
        right: '20%',
        symbolSize: 7,
        label: {
          position: 'left',
          verticalAlign: 'middle',
          align: 'right',
          fontSize: 12
        },
        leaves: {
          label: {
            position: 'right',
            verticalAlign: 'middle',
            align: 'left'
          }
        },
        expandAndCollapse: true,
        animationDuration: 550,
        animationDurationUpdate: 750
      }
    ]
  }
  
  pathChartInstance.setOption(option)
}

// 初始化归因图表
const updateAttributionChart = () => {
  const chartDom = document.querySelector('.attribution-chart')
  if (!chartDom) return
  
  if (!attributionChartInstance) {
    attributionChartInstance = echarts.init(chartDom)
  }
  
  const option = {
    tooltip: {
      trigger: 'item'
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
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: attributionChannels.value.map(channel => ({
          name: channel.name,
          value: channel.conversions
        }))
      }
    ]
  }
  
  attributionChartInstance.setOption(option)
}

// 初始化变体图表
const initVariantCharts = () => {
  currentTest.value.variants.forEach(variant => {
    const chartDom = document.querySelector(`.variant-chart[ref="variantChart${variant.id}"]`)
    if (!chartDom) return
    
    if (!variantChartInstances[variant.id]) {
      variantChartInstances[variant.id] = echarts.init(chartDom)
    }
    
    const option = {
      grid: {
        left: 0,
        right: 0,
        top: 10,
        bottom: 0
      },
      xAxis: {
        type: 'category',
        show: false,
        data: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7']
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
          data: [3.0, 3.2, 3.5, 3.4, 3.8, 3.9, variant.conversionRate],
          lineStyle: {
            color: variant.isWinner ? '#67c23a' : '#409eff',
            width: 2
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: variant.isWinner ? 'rgba(103, 194, 58, 0.3)' : 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: variant.isWinner ? 'rgba(103, 194, 58, 0.05)' : 'rgba(64, 158, 255, 0.05)' }
            ])
          }
        }
      ]
    }
    
    variantChartInstances[variant.id].setOption(option)
  })
}

// 初始化页面热力图
const initPageHeatmap = () => {
  const chartDom = document.querySelector('.page-heatmap')
  if (!chartDom) return
  
  pageHeatmapInstance = echarts.init(chartDom)
  
  // 生成模拟热力图数据
  const data = []
  for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 30; j++) {
      data.push([j, i, Math.random() * 100])
    }
  }
  
  const option = {
    tooltip: {
      position: 'top'
    },
    grid: {
      left: 40,
      right: 40,
      top: 20,
      bottom: 40
    },
    xAxis: {
      type: 'category',
      show: false
    },
    yAxis: {
      type: 'category',
      show: false
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      inRange: {
        color: ['#f0f0f0', '#ffd700', '#ff6b6b', '#ff0000']
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
  
  pageHeatmapInstance.setOption(option)
}

// 生命周期
onMounted(() => {
  initFunnelChart()
  updateAttributionChart()
  setTimeout(() => {
    initVariantCharts()
    initPageHeatmap()
  }, 100)
  
  // 响应式调整
  window.addEventListener('resize', () => {
    pathChartInstance?.resize()
    attributionChartInstance?.resize()
    Object.values(variantChartInstances).forEach(instance => instance?.resize())
    pageHeatmapInstance?.resize()
  })
})

// 监听变化
watch(selectedTest, () => {
  // 更新测试数据
  setTimeout(() => initVariantCharts(), 100)
})
</script>

<style scoped>
.conversion-analysis-page {
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

.conversion-overview {
  margin-bottom: 20px;
}

.overview-card {
  height: 120px;
}

.overview-item {
  text-align: center;
  padding: 20px 0;
}

.overview-value {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.overview-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.overview-trend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 12px;
}

.overview-trend .up {
  color: #67c23a;
}

.overview-trend .down {
  color: #f56c6c;
}

.trend-label {
  color: #999;
}

.main-content {
  margin-bottom: 20px;
}

.path-analysis-card {
  min-height: 600px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.path-chart {
  height: 350px;
  margin-bottom: 20px;
}

.path-details {
  margin-top: 20px;
}

.step-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-number {
  width: 24px;
  height: 24px;
  background: #409eff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.drop-rate {
  color: #f56c6c;
}

.attribution-card {
  min-height: 600px;
}

.attribution-model {
  cursor: pointer;
  color: #409eff;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.attribution-chart {
  height: 200px;
  margin-bottom: 20px;
}

.attribution-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.attribution-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.channel-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.channel-info .el-icon {
  font-size: 16px;
}

.channel-info .email {
  color: #409eff;
}

.channel-info .social {
  color: #e6a23c;
}

.channel-info .search {
  color: #67c23a;
}

.channel-info .direct {
  color: #909399;
}

.channel-metrics {
  text-align: center;
  margin: 0 16px;
}

.metric-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.metric-label {
  font-size: 12px;
  color: #666;
}

.channel-contribution {
  width: 100px;
}

.ab-testing-card {
  margin-bottom: 20px;
}

.ab-controls {
  display: flex;
  gap: 12px;
}

.test-info {
  display: flex;
  gap: 24px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-item .label {
  color: #666;
  font-size: 14px;
}

.test-variants {
  margin-bottom: 20px;
}

.variant-card {
  padding: 20px;
  background: white;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s;
}

.variant-card.winner {
  border-color: #67c23a;
  box-shadow: 0 2px 12px rgba(103, 194, 58, 0.1);
}

.variant-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.variant-name {
  font-size: 16px;
  font-weight: 500;
}

.variant-metrics {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.variant-metrics .metric {
  text-align: center;
}

.variant-metrics .value {
  display: block;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.variant-metrics .label {
  font-size: 12px;
  color: #666;
}

.variant-chart {
  height: 100px;
  margin-bottom: 16px;
}

.variant-improvement {
  text-align: center;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 6px;
}

.improvement-label {
  color: #666;
  font-size: 14px;
  margin-right: 8px;
}

.improvement-value {
  font-size: 18px;
  font-weight: 600;
}

.improvement-value.positive {
  color: #67c23a;
}

.improvement-value.negative {
  color: #f56c6c;
}

.optimization-card {
  margin-bottom: 20px;
}

.optimization-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.optimization-item {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.opt-priority {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  margin-right: 16px;
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.opt-priority.high {
  background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
}

.opt-priority.medium {
  background: linear-gradient(135deg, #ffa726 0%, #fb8c00 100%);
}

.opt-priority.low {
  background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
}

.opt-content {
  flex: 1;
}

.opt-content h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
}

.opt-content p {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.opt-metrics {
  display: flex;
  gap: 16px;
  font-size: 13px;
}

.opt-metrics .metric {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #409eff;
}

.opt-action {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 16px;
}

.page-optimization {
  display: flex;
  gap: 20px;
}

.page-heatmap {
  flex: 1;
  height: 300px;
}

.page-suggestions {
  width: 300px;
}

.page-suggestions h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
}

.page-suggestions ul {
  margin: 0;
  padding-left: 20px;
}

.page-suggestions li {
  margin-bottom: 8px;
  font-size: 13px;
  color: #666;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.page-suggestions .el-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.process-step {
  padding: 12px;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.step-title {
  font-weight: 500;
}

.step-metrics {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #666;
}
</style>
