<template>
  <div class="customer-analysis-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1>客户分析</h1>
        <p>深度分析客户数据，洞察客户行为和价值</p>
      </div>
      <div class="header-actions">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleDateChange"
        />
        <el-button type="primary" @click="exportReport">
          <el-icon><Download /></el-icon>
          导出报告
        </el-button>
      </div>
    </div>

    <!-- 核心指标卡片 -->
    <div class="metrics-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="metric-card total-customers">
            <div class="metric-content">
              <div class="metric-icon">
                <el-icon><User /></el-icon>
              </div>
              <div class="metric-data">
                <h3>{{ customerMetrics.total.toLocaleString() }}</h3>
                <p>总客户数</p>
                <span class="growth-rate positive">+{{ customerMetrics.totalGrowth }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="metric-card active-customers">
            <div class="metric-content">
              <div class="metric-icon">
                <el-icon><View /></el-icon>
              </div>
              <div class="metric-data">
                <h3>{{ customerMetrics.active.toLocaleString() }}</h3>
                <p>活跃客户</p>
                <span class="growth-rate positive">+{{ customerMetrics.activeGrowth }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="metric-card new-customers">
            <div class="metric-content">
              <div class="metric-icon">
                <el-icon><Plus /></el-icon>
              </div>
              <div class="metric-data">
                <h3>{{ customerMetrics.newCustomers.toLocaleString() }}</h3>
                <p>新增客户</p>
                <span class="growth-rate positive">+{{ customerMetrics.newGrowth }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="metric-card customer-ltv">
            <div class="metric-content">
              <div class="metric-icon">
                <el-icon><Money /></el-icon>
              </div>
              <div class="metric-data">
                <h3>${{ customerMetrics.avgLTV.toLocaleString() }}</h3>
                <p>平均客户价值</p>
                <span class="growth-rate positive">+{{ customerMetrics.ltvGrowth }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 图表分析区域 -->
    <div class="charts-container">
      <el-row :gutter="20">
        <!-- 客户增长趋势 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>客户增长趋势</span>
                <el-dropdown @command="handleTrendCommand">
                  <el-button type="text">
                    更多操作 <el-icon><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="export">导出图表</el-dropdown-item>
                      <el-dropdown-item command="fullscreen">全屏显示</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
            <div class="chart-container">
              <div ref="customerTrendChart" class="chart"></div>
            </div>
          </el-card>
        </el-col>

        <!-- 客户来源分布 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>客户来源分布</span>
                <el-dropdown @command="handleSourceCommand">
                  <el-button type="text">
                    更多操作 <el-icon><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="export">导出图表</el-dropdown-item>
                      <el-dropdown-item command="details">查看详情</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
            <div class="chart-container">
              <div ref="customerSourceChart" class="chart"></div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <!-- 客户价值分布 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>客户价值分布</span>
                <el-radio-group v-model="valueDistributionType" size="small">
                  <el-radio-button label="ltv">生命周期价值</el-radio-button>
                  <el-radio-button label="revenue">收入贡献</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div class="chart-container">
              <div ref="customerValueChart" class="chart"></div>
            </div>
          </el-card>
        </el-col>

        <!-- 客户地域分布 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>客户地域分布</span>
                <el-switch
                  v-model="showGlobalView"
                  active-text="全球视图"
                  inactive-text="国内视图"
                />
              </div>
            </template>
            <div class="chart-container">
              <div ref="customerGeoChart" class="chart"></div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 客户行为分析 -->
    <div class="behavior-analysis">
      <el-card>
        <template #header>
          <div class="section-header">
            <span>客户行为分析</span>
            <el-button-group>
              <el-button :type="behaviorTab === 'engagement' ? 'primary' : ''" @click="behaviorTab = 'engagement'">参与度分析</el-button>
              <el-button :type="behaviorTab === 'lifecycle' ? 'primary' : ''" @click="behaviorTab = 'lifecycle'">生命周期</el-button>
              <el-button :type="behaviorTab === 'rfm' ? 'primary' : ''" @click="behaviorTab = 'rfm'">RFM分析</el-button>
            </el-button-group>
          </div>
        </template>

        <div v-if="behaviorTab === 'engagement'" class="engagement-analysis">
          <el-row :gutter="20">
            <el-col :span="16">
              <div ref="engagementChart" class="chart" style="height: 350px;"></div>
            </el-col>
            <el-col :span="8">
              <div class="engagement-metrics">
                <div class="metric-item">
                  <span class="label">平均会话时长</span>
                  <span class="value">{{ engagementMetrics.avgSessionDuration }}</span>
                </div>
                <div class="metric-item">
                  <span class="label">页面浏览深度</span>
                  <span class="value">{{ engagementMetrics.avgPageDepth }}</span>
                </div>
                <div class="metric-item">
                  <span class="label">互动率</span>
                  <span class="value">{{ engagementMetrics.interactionRate }}%</span>
                </div>
                <div class="metric-item">
                  <span class="label">回访率</span>
                  <span class="value">{{ engagementMetrics.returnRate }}%</span>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <div v-if="behaviorTab === 'lifecycle'" class="lifecycle-analysis">
          <el-row :gutter="20">
            <el-col :span="16">
              <div ref="lifecycleChart" class="chart" style="height: 350px;"></div>
            </el-col>
            <el-col :span="8">
              <div class="lifecycle-stages">
                <div class="stage-item" v-for="stage in lifecycleStages" :key="stage.name">
                  <div class="stage-header">
                    <span class="stage-name">{{ stage.name }}</span>
                    <span class="stage-count">{{ stage.count }}</span>
                  </div>
                  <div class="stage-progress">
                    <el-progress :percentage="stage.percentage" :color="stage.color" />
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <div v-if="behaviorTab === 'rfm'" class="rfm-analysis">
          <el-row :gutter="20">
            <el-col :span="16">
              <div ref="rfmChart" class="chart" style="height: 350px;"></div>
            </el-col>
            <el-col :span="8">
              <div class="rfm-segments">
                <div class="segment-item" v-for="segment in rfmSegments" :key="segment.name">
                  <div class="segment-info">
                    <div class="segment-name">{{ segment.name }}</div>
                    <div class="segment-desc">{{ segment.description }}</div>
                  </div>
                  <div class="segment-stats">
                    <span class="count">{{ segment.count }}</span>
                    <span class="percentage">{{ segment.percentage }}%</span>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </div>

    <!-- 客户细分分析 -->
    <div class="segmentation-analysis">
      <el-row :gutter="20">
        <el-col :span="14">
          <el-card>
            <template #header>
              <div class="section-header">
                <span>客户细分分析</span>
                <el-select v-model="segmentationType" placeholder="选择细分维度" style="width: 200px;">
                  <el-option label="消费能力" value="spending" />
                  <el-option label="活跃度" value="activity" />
                  <el-option label="忠诚度" value="loyalty" />
                  <el-option label="地域" value="geography" />
                </el-select>
              </div>
            </template>
            <div ref="segmentationChart" class="chart" style="height: 400px;"></div>
          </el-card>
        </el-col>
        <el-col :span="10">
          <el-card>
            <template #header>
              <span>细分洞察</span>
            </template>
            <div class="insights-list">
              <div class="insight-item" v-for="insight in customerInsights" :key="insight.id">
                <div class="insight-icon">
                  <el-icon :color="insight.type === 'positive' ? '#67C23A' : insight.type === 'warning' ? '#E6A23C' : '#F56C6C'">
                    <component :is="insight.icon" />
                  </el-icon>
                </div>
                <div class="insight-content">
                  <h4>{{ insight.title }}</h4>
                  <p>{{ insight.description }}</p>
                  <div class="insight-actions">
                    <el-button type="text" size="small">查看详情</el-button>
                    <el-button type="text" size="small">创建活动</el-button>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 预测分析 -->
    <div class="prediction-analysis">
      <el-card>
        <template #header>
          <div class="section-header">
            <span>预测分析</span>
            <el-button-group>
              <el-button :type="predictionTab === 'churn' ? 'primary' : ''" @click="predictionTab = 'churn'">流失预测</el-button>
              <el-button :type="predictionTab === 'value' ? 'primary' : ''" @click="predictionTab = 'value'">价值预测</el-button>
              <el-button :type="predictionTab === 'next' ? 'primary' : ''" @click="predictionTab = 'next'">下次购买</el-button>
            </el-button-group>
          </div>
        </template>

        <div v-if="predictionTab === 'churn'" class="churn-prediction">
          <el-row :gutter="20">
            <el-col :span="16">
              <div ref="churnPredictionChart" class="chart" style="height: 350px;"></div>
            </el-col>
            <el-col :span="8">
              <div class="churn-metrics">
                <div class="metric-card churn-risk">
                  <h3>{{ churnMetrics.highRisk }}</h3>
                  <p>高流失风险客户</p>
                  <el-button type="danger" size="small">立即处理</el-button>
                </div>
                <div class="metric-card churn-medium">
                  <h3>{{ churnMetrics.mediumRisk }}</h3>
                  <p>中等流失风险</p>
                  <el-button type="warning" size="small">关注</el-button>
                </div>
                <div class="metric-card churn-low">
                  <h3>{{ churnMetrics.lowRisk }}</h3>
                  <p>低流失风险</p>
                  <el-button type="success" size="small">维护</el-button>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <div v-if="predictionTab === 'value'" class="value-prediction">
          <div ref="valuePredictionChart" class="chart" style="height: 350px;"></div>
        </div>

        <div v-if="predictionTab === 'next'" class="next-purchase">
          <div ref="nextPurchaseChart" class="chart" style="height: 350px;"></div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Download, User, View, Plus, Money, ArrowDown,
  TrendCharts, Warning, InfoFilled, SuccessFilled
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 响应式数据
const dateRange = ref(['2024-01-01', '2024-12-31'])
const valueDistributionType = ref('ltv')
const showGlobalView = ref(false)
const behaviorTab = ref('engagement')
const segmentationType = ref('spending')
const predictionTab = ref('churn')

// 核心指标数据
const customerMetrics = ref({
  total: 125847,
  totalGrowth: 12.5,
  active: 89456,
  activeGrowth: 8.3,
  newCustomers: 15634,
  newGrowth: 23.7,
  avgLTV: 3250,
  ltvGrowth: 15.2
})

// 参与度指标
const engagementMetrics = ref({
  avgSessionDuration: '5分32秒',
  avgPageDepth: '8.3页',
  interactionRate: 67.8,
  returnRate: 34.5
})

// 生命周期阶段
const lifecycleStages = ref([
  { name: '新客户', count: '15,634', percentage: 12.4, color: '#409EFF' },
  { name: '发展期', count: '32,156', percentage: 25.5, color: '#67C23A' },
  { name: '成熟期', count: '45,789', percentage: 36.4, color: '#E6A23C' },
  { name: '衰退期', count: '23,456', percentage: 18.6, color: '#F56C6C' },
  { name: '流失期', count: '8,812', percentage: 7.1, color: '#909399' }
])

// RFM客户细分
const rfmSegments = ref([
  { name: '冠军客户', description: '最近购买、频率高、金额大', count: '8,456', percentage: 6.7 },
  { name: '忠实客户', description: '购买频率高、金额适中', count: '15,234', percentage: 12.1 },
  { name: '潜力客户', description: '最近购买、金额大但频率低', count: '12,567', percentage: 10.0 },
  { name: '新客户', description: '最近购买、但频率和金额较低', count: '18,789', percentage: 14.9 },
  { name: '需关怀客户', description: '一段时间未购买、但曾经价值高', count: '23,456', percentage: 18.6 }
])

// 流失预测指标
const churnMetrics = ref({
  highRisk: '3,256',
  mediumRisk: '7,891',
  lowRisk: '78,309'
})

// 客户洞察
const customerInsights = ref([
  {
    id: 1,
    type: 'positive',
    icon: 'SuccessFilled',
    title: '高价值客户增长',
    description: '过去30天内，高价值客户群体增长了18.5%，主要来源于社交媒体渠道'
  },
  {
    id: 2,
    type: 'warning',
    icon: 'Warning',
    title: '中等价值客户活跃度下降',
    description: '中等价值客户群体的平均会话时长下降了12%，建议加强互动营销'
  },
  {
    id: 3,
    type: 'info',
    icon: 'InfoFilled',
    title: '地域分布趋势',
    description: '北京和上海地区客户贡献了45%的总收入，但增长率放缓'
  },
  {
    id: 4,
    type: 'negative',
    icon: 'Warning',
    title: '流失风险警告',
    description: '检测到2,456位客户存在高流失风险，建议及时干预挽留'
  }
])

// 图表引用
const customerTrendChart = ref()
const customerSourceChart = ref()
const customerValueChart = ref()
const customerGeoChart = ref()
const engagementChart = ref()
const lifecycleChart = ref()
const rfmChart = ref()
const segmentationChart = ref()
const churnPredictionChart = ref()
const valuePredictionChart = ref()
const nextPurchaseChart = ref()

// 事件处理
const handleDateChange = (dates) => {
  ElMessage.success('日期范围已更新')
  // 这里可以重新加载数据
}

const exportReport = () => {
  ElMessage.success('报告导出功能开发中')
}

const handleTrendCommand = (command) => {
  if (command === 'export') {
    ElMessage.success('图表导出功能开发中')
  } else if (command === 'fullscreen') {
    ElMessage.success('全屏功能开发中')
  }
}

const handleSourceCommand = (command) => {
  if (command === 'export') {
    ElMessage.success('图表导出功能开发中')
  } else if (command === 'details') {
    ElMessage.success('详情查看功能开发中')
  }
}

// 初始化图表
const initCustomerTrendChart = () => {
  const chart = echarts.init(customerTrendChart.value)
  const option = {
    title: {
      show: false
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['新增客户', '活跃客户', '累计客户']
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '新增客户',
        type: 'line',
        data: [1200, 1350, 1180, 1420, 1650, 1380, 1520, 1680, 1450, 1720, 1890, 1634],
        smooth: true,
        itemStyle: { color: '#409EFF' }
      },
      {
        name: '活跃客户',
        type: 'line',
        data: [8500, 8750, 8920, 9100, 9350, 9200, 9480, 9650, 9420, 9780, 9920, 9456],
        smooth: true,
        itemStyle: { color: '#67C23A' }
      },
      {
        name: '累计客户',
        type: 'line',
        data: [95000, 96350, 97530, 98950, 100600, 101980, 103500, 105180, 106630, 108350, 110240, 125847],
        smooth: true,
        itemStyle: { color: '#E6A23C' }
      }
    ]
  }
  chart.setOption(option)
}

const initCustomerSourceChart = () => {
  const chart = echarts.init(customerSourceChart.value)
  const option = {
    title: {
      show: false
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '客户来源',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        data: [
          { value: 35684, name: '搜索引擎', itemStyle: { color: '#409EFF' } },
          { value: 28456, name: '社交媒体', itemStyle: { color: '#67C23A' } },
          { value: 23156, name: '直接访问', itemStyle: { color: '#E6A23C' } },
          { value: 18234, name: '邮件营销', itemStyle: { color: '#F56C6C' } },
          { value: 12456, name: '广告投放', itemStyle: { color: '#909399' } },
          { value: 7861, name: '其他', itemStyle: { color: '#C0C4CC' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  chart.setOption(option)
}

const initCustomerValueChart = () => {
  const chart = echarts.init(customerValueChart.value)
  const option = {
    title: {
      show: false
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: ['<$500', '$500-1000', '$1000-2000', '$2000-5000', '$5000-10000', '>$10000']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        type: 'bar',
        data: [15234, 23456, 34567, 28456, 12345, 6789],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#409EFF' },
            { offset: 1, color: '#67C23A' }
          ])
        },
        barWidth: '60%'
      }
    ]
  }
  chart.setOption(option)
}

const initEngagementChart = () => {
  const chart = echarts.init(engagementChart.value)
  const option = {
    title: {
      show: false
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['页面浏览', '互动次数', '会话时长']
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: [
      {
        type: 'value',
        name: '次数',
        position: 'left'
      },
      {
        type: 'value',
        name: '时长(分钟)',
        position: 'right'
      }
    ],
    series: [
      {
        name: '页面浏览',
        type: 'bar',
        data: [45000, 52000, 48000, 51000, 49000, 35000, 32000]
      },
      {
        name: '互动次数',
        type: 'bar',
        data: [15000, 18000, 16000, 17500, 16500, 12000, 11000]
      },
      {
        name: '会话时长',
        type: 'line',
        yAxisIndex: 1,
        data: [6.2, 7.1, 6.8, 7.3, 6.9, 5.2, 4.8]
      }
    ]
  }
  chart.setOption(option)
}

const initLifecycleChart = () => {
  const chart = echarts.init(lifecycleChart.value)
  const option = {
    title: {
      show: false
    },
    tooltip: {
      trigger: 'item'
    },
    series: [
      {
        type: 'funnel',
        left: '10%',
        width: '80%',
        maxSize: '80%',
        data: [
          { value: 45789, name: '成熟期', itemStyle: { color: '#E6A23C' } },
          { value: 32156, name: '发展期', itemStyle: { color: '#67C23A' } },
          { value: 23456, name: '衰退期', itemStyle: { color: '#F56C6C' } },
          { value: 15634, name: '新客户', itemStyle: { color: '#409EFF' } },
          { value: 8812, name: '流失期', itemStyle: { color: '#909399' } }
        ]
      }
    ]
  }
  chart.setOption(option)
}

const initRfmChart = () => {
  const chart = echarts.init(rfmChart.value)
  const option = {
    title: {
      show: false
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: ['需关怀客户', '新客户', '潜力客户', '忠实客户', '冠军客户']
    },
    series: [
      {
        type: 'bar',
        data: [23456, 18789, 12567, 15234, 8456],
        itemStyle: {
          color: (params) => {
            const colors = ['#F56C6C', '#409EFF', '#E6A23C', '#67C23A', '#FF6600']
            return colors[params.dataIndex]
          }
        }
      }
    ]
  }
  chart.setOption(option)
}

const initSegmentationChart = () => {
  const chart = echarts.init(segmentationChart.value)
  const option = {
    title: {
      show: false
    },
    tooltip: {
      trigger: 'item'
    },
    series: [
      {
        type: 'treemap',
        data: [
          {
            name: '高消费客户',
            value: 35000,
            children: [
              { name: '超高价值', value: 15000 },
              { name: '高价值', value: 12000 },
              { name: '中高价值', value: 8000 }
            ]
          },
          {
            name: '中等消费客户',
            value: 45000,
            children: [
              { name: '稳定消费', value: 25000 },
              { name: '偶尔消费', value: 12000 },
              { name: '尝试消费', value: 8000 }
            ]
          },
          {
            name: '低消费客户',
            value: 45847,
            children: [
              { name: '价格敏感', value: 20000 },
              { name: '新用户', value: 15847 },
              { name: '观望用户', value: 10000 }
            ]
          }
        ]
      }
    ]
  }
  chart.setOption(option)
}

const initChurnPredictionChart = () => {
  const chart = echarts.init(churnPredictionChart.value)
  const option = {
    title: {
      show: false
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['高风险', '中等风险', '低风险']
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '高风险',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: { focus: 'series' },
        data: [2800, 3200, 3100, 3300, 3200, 3256],
        itemStyle: { color: '#F56C6C' }
      },
      {
        name: '中等风险',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: { focus: 'series' },
        data: [7200, 7500, 7800, 7600, 7900, 7891],
        itemStyle: { color: '#E6A23C' }
      },
      {
        name: '低风险',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: { focus: 'series' },
        data: [75000, 76000, 77000, 77500, 78000, 78309],
        itemStyle: { color: '#67C23A' }
      }
    ]
  }
  chart.setOption(option)
}

// 初始化所有图表
const initAllCharts = () => {
  nextTick(() => {
    initCustomerTrendChart()
    initCustomerSourceChart()
    initCustomerValueChart()
    initEngagementChart()
    initLifecycleChart()
    initRfmChart()
    initSegmentationChart()
    initChurnPredictionChart()
  })
}

// 监听数据变化重新渲染图表
watch([valueDistributionType, showGlobalView, behaviorTab, segmentationType, predictionTab], () => {
  // 根据不同的选项重新加载对应的图表数据
  nextTick(() => {
    if (behaviorTab.value === 'engagement' && engagementChart.value) {
      initEngagementChart()
    } else if (behaviorTab.value === 'lifecycle' && lifecycleChart.value) {
      initLifecycleChart()
    } else if (behaviorTab.value === 'rfm' && rfmChart.value) {
      initRfmChart()
    }
    
    if (segmentationType.value && segmentationChart.value) {
      initSegmentationChart()
    }
    
    if (predictionTab.value === 'churn' && churnPredictionChart.value) {
      initChurnPredictionChart()
    }
  })
})

onMounted(() => {
  initAllCharts()
})
</script>

<style scoped lang="scss">
.customer-analysis-page {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .header-left {
    h1 {
      margin: 0 0 8px 0;
      color: #303133;
      font-size: 24px;
      font-weight: 600;
    }

    p {
      margin: 0;
      color: #909399;
      font-size: 14px;
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
    align-items: center;
  }
}

.metrics-cards {
  margin-bottom: 30px;

  .metric-card {
    height: 120px;
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
      transform: translateY(-2px);
    }

    .metric-content {
      display: flex;
      align-items: center;
      height: 100%;

      .metric-icon {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;

        .el-icon {
          font-size: 28px;
          color: white;
        }
      }

      .metric-data {
        flex: 1;

        h3 {
          margin: 0 0 5px 0;
          font-size: 28px;
          font-weight: 600;
          color: #303133;
        }

        p {
          margin: 0 0 5px 0;
          color: #909399;
          font-size: 14px;
        }

        .growth-rate {
          font-size: 12px;
          padding: 2px 6px;
          border-radius: 12px;

          &.positive {
            background-color: #f0f9ff;
            color: #67C23A;
          }

          &.negative {
            background-color: #fef0f0;
            color: #F56C6C;
          }
        }
      }
    }
  }

  .total-customers .metric-icon {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .active-customers .metric-icon {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }

  .new-customers .metric-icon {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }

  .customer-ltv .metric-icon {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  }
}

.charts-container {
  margin-bottom: 30px;

  .chart-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chart-container {
      height: 350px;

      .chart {
        width: 100%;
        height: 100%;
      }
    }
  }
}

.behavior-analysis,
.segmentation-analysis,
.prediction-analysis {
  margin-bottom: 30px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .chart {
    width: 100%;
    height: 100%;
  }
}

.engagement-metrics,
.lifecycle-stages,
.rfm-segments {
  padding: 20px;

  .metric-item,
  .stage-item,
  .segment-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #ebeef5;

    &:last-child {
      border-bottom: none;
    }
  }

  .stage-item {
    flex-direction: column;
    align-items: flex-start;

    .stage-header {
      display: flex;
      justify-content: space-between;
      width: 100%;
      margin-bottom: 8px;
    }

    .stage-progress {
      width: 100%;
    }
  }

  .segment-item {
    .segment-info {
      flex: 1;

      .segment-name {
        font-weight: 600;
        margin-bottom: 4px;
      }

      .segment-desc {
        font-size: 12px;
        color: #909399;
      }
    }

    .segment-stats {
      text-align: right;

      .count {
        display: block;
        font-weight: 600;
        color: #303133;
      }

      .percentage {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .label {
    color: #909399;
    font-size: 14px;
  }

  .value {
    font-weight: 600;
    color: #303133;
  }
}

.insights-list {
  .insight-item {
    display: flex;
    padding: 16px;
    margin-bottom: 16px;
    background: #fafafa;
    border-radius: 8px;
    border-left: 4px solid #409EFF;

    .insight-icon {
      margin-right: 12px;
      margin-top: 2px;
    }

    .insight-content {
      flex: 1;

      h4 {
        margin: 0 0 8px 0;
        font-size: 14px;
        font-weight: 600;
        color: #303133;
      }

      p {
        margin: 0 0 12px 0;
        font-size: 13px;
        color: #606266;
        line-height: 1.5;
      }

      .insight-actions {
        display: flex;
        gap: 8px;
      }
    }
  }
}

.churn-metrics {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .metric-card {
    padding: 16px;
    border-radius: 8px;
    text-align: center;

    &.churn-risk {
      background: #fef0f0;
      color: #F56C6C;
    }

    &.churn-medium {
      background: #fdf6ec;
      color: #E6A23C;
    }

    &.churn-low {
      background: #f0f9ff;
      color: #67C23A;
    }

    h3 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
    }

    p {
      margin: 0 0 12px 0;
      font-size: 13px;
    }
  }
}
</style>
