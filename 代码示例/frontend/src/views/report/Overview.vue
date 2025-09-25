<template>
  <div class="overview-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h2>数据概览</h2>
        <div class="header-actions">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :shortcuts="dateShortcuts"
            @change="handleDateChange"
          />
          <el-button @click="handleExport">
            <el-icon><Download /></el-icon>
            导出报表
          </el-button>
          <el-button type="primary" @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
        </div>
      </div>
    </div>

    <!-- 关键指标卡片 -->
    <div class="metrics-grid">
      <div v-for="metric in keyMetrics" :key="metric.name" class="metric-card">
        <div class="metric-header">
          <span class="metric-name">{{ metric.name }}</span>
          <el-tooltip :content="metric.tooltip" placement="top">
            <el-icon class="info-icon"><InfoFilled /></el-icon>
          </el-tooltip>
        </div>
        <div class="metric-value">{{ metric.value }}</div>
        <div class="metric-change" :class="getChangeClass(metric.change)">
          <el-icon v-if="metric.change > 0"><Top /></el-icon>
          <el-icon v-else-if="metric.change < 0"><Bottom /></el-icon>
          <span>{{ Math.abs(metric.change) }}%</span>
          <span class="change-label">{{ metric.changeLabel }}</span>
        </div>
        <div class="metric-chart">
          <div ref="miniCharts" :data-metric="metric.id" class="mini-chart"></div>
        </div>
      </div>
    </div>

    <!-- 趋势图表 -->
    <el-row :gutter="20">
      <el-col :span="16">
        <div class="chart-card">
          <div class="card-header">
            <h3>营销趋势分析</h3>
            <el-radio-group v-model="trendType" @change="updateTrendChart">
              <el-radio-button label="daily">日</el-radio-button>
              <el-radio-button label="weekly">周</el-radio-button>
              <el-radio-button label="monthly">月</el-radio-button>
            </el-radio-group>
          </div>
          <div ref="trendChart" class="chart-container"></div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="chart-card">
          <div class="card-header">
            <h3>渠道效果对比</h3>
            <el-dropdown @command="handleChannelFilter">
              <el-button text>
                {{ channelFilter }} <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="all">全部渠道</el-dropdown-item>
                  <el-dropdown-item command="top5">TOP5渠道</el-dropdown-item>
                  <el-dropdown-item command="active">活跃渠道</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div ref="channelChart" class="chart-container"></div>
        </div>
      </el-col>
    </el-row>

    <!-- 同比环比分析 -->
    <div class="comparison-section">
      <div class="section-header">
        <h3>同比环比分析</h3>
        <el-segmented v-model="comparisonType" :options="comparisonOptions" @change="updateComparison" />
      </div>
      <el-table :data="comparisonData" style="width: 100%">
        <el-table-column prop="metric" label="指标" min-width="200" />
        <el-table-column prop="current" label="当前值" min-width="150" />
        <el-table-column prop="previous" label="对比值" min-width="150" />
        <el-table-column label="变化" min-width="150">
          <template #default="{ row }">
            <span :class="getChangeClass(row.changeRate)">
              {{ row.changeRate > 0 ? '+' : '' }}{{ row.changeRate }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column label="趋势" min-width="180">
          <template #default="{ row }">
            <div ref="sparklines" :data-row-id="row.id" class="sparkline"></div>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 预警提醒 -->
    <div class="alert-section">
      <div class="section-header">
        <h3>预警提醒</h3>
        <el-badge :value="alerts.filter(a => !a.read).length" :hidden="!alerts.filter(a => !a.read).length">
          <el-button text @click="showAllAlerts">查看全部</el-button>
        </el-badge>
      </div>
      <div class="alert-list">
        <div v-for="alert in alerts.slice(0, 5)" :key="alert.id" class="alert-item" :class="{ unread: !alert.read }">
          <el-icon class="alert-icon" :style="{ color: getAlertColor(alert.level) }">
            <Warning v-if="alert.level === 'high'" />
            <InfoFilled v-else />
          </el-icon>
          <div class="alert-content">
            <div class="alert-title">{{ alert.title }}</div>
            <div class="alert-desc">{{ alert.description }}</div>
            <div class="alert-time">{{ alert.time }}</div>
          </div>
          <el-button text size="small" @click="handleAlert(alert)">
            {{ alert.action }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 实时数据监控 -->
    <div class="realtime-section">
      <div class="section-header">
        <h3>实时监控</h3>
        <el-switch v-model="autoRefresh" active-text="自动刷新" @change="toggleAutoRefresh" />
      </div>
      <el-row :gutter="20">
        <el-col :span="6" v-for="monitor in realtimeMonitors" :key="monitor.id">
          <div class="monitor-card">
            <div class="monitor-header">
              <span>{{ monitor.name }}</span>
              <el-tag size="small" :type="monitor.status === 'normal' ? 'success' : 'warning'">
                {{ monitor.status === 'normal' ? '正常' : '异常' }}
              </el-tag>
            </div>
            <div class="monitor-value">{{ monitor.value }}</div>
            <div class="monitor-chart">
              <div ref="realtimeCharts" :data-monitor="monitor.id" class="realtime-chart"></div>
            </div>
            <div class="monitor-update">更新时间: {{ monitor.updateTime }}</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 导出对话框 -->
    <el-dialog v-model="exportDialogVisible" title="导出报表" width="500px">
      <el-form :model="exportForm" label-width="100px">
        <el-form-item label="报表类型">
          <el-select v-model="exportForm.type" placeholder="请选择">
            <el-option label="综合报表" value="comprehensive" />
            <el-option label="渠道分析" value="channel" />
            <el-option label="趋势分析" value="trend" />
            <el-option label="对比分析" value="comparison" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="exportForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item label="导出格式">
          <el-radio-group v-model="exportForm.format">
            <el-radio label="excel">Excel</el-radio>
            <el-radio label="pdf">PDF</el-radio>
            <el-radio label="csv">CSV</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="包含图表">
          <el-switch v-model="exportForm.includeCharts" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="exportDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmExport">确认导出</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import {
  Download,
  Refresh,
  InfoFilled,
  Top,
  Bottom,
  ArrowDown,
  Warning
} from '@element-plus/icons-vue'

// 日期范围
const dateRange = ref([
  new Date(Date.now() - 30 * 24 * 3600 * 1000),
  new Date()
])

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 7 * 24 * 3600 * 1000)
      return [start, end]
    }
  },
  {
    text: '最近一月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 30 * 24 * 3600 * 1000)
      return [start, end]
    }
  },
  {
    text: '最近三月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 90 * 24 * 3600 * 1000)
      return [start, end]
    }
  }
]

// 关键指标
const keyMetrics = ref([
  {
    id: 'revenue',
    name: '营销收入',
    value: '¥1,234,567',
    change: 15.3,
    changeLabel: '较上期',
    tooltip: '所有营销活动产生的总收入',
    sparkData: [45, 52, 48, 65, 72, 68, 75, 82, 90, 85]
  },
  {
    id: 'conversion',
    name: '转化率',
    value: '4.82%',
    change: 8.5,
    changeLabel: '较上期',
    tooltip: '营销活动的平均转化率',
    sparkData: [3.2, 3.5, 3.8, 4.1, 4.3, 4.5, 4.6, 4.7, 4.8, 4.82]
  },
  {
    id: 'customers',
    name: '新增客户',
    value: '3,456',
    change: -5.2,
    changeLabel: '较上期',
    tooltip: '通过营销活动获得的新客户数',
    sparkData: [280, 320, 350, 340, 360, 380, 370, 350, 330, 345]
  },
  {
    id: 'engagement',
    name: '互动率',
    value: '12.5%',
    change: 22.1,
    changeLabel: '较上期',
    tooltip: '用户与营销内容的互动比例',
    sparkData: [8.5, 9.2, 9.8, 10.3, 10.8, 11.2, 11.5, 11.8, 12.2, 12.5]
  }
])

// 趋势类型
const trendType = ref('daily')

// 渠道筛选
const channelFilter = ref('全部渠道')

// 对比类型
const comparisonType = ref('yoy')
const comparisonOptions = [
  { label: '同比', value: 'yoy' },
  { label: '环比', value: 'mom' }
]

// 对比数据
const comparisonData = ref([
  {
    id: 1,
    metric: '发送量',
    current: '125,000',
    previous: '98,000',
    changeRate: 27.6,
    status: '优秀',
    sparkData: [80, 85, 90, 95, 100, 105, 110, 120, 125]
  },
  {
    id: 2,
    metric: '打开率',
    current: '35.2%',
    previous: '32.8%',
    changeRate: 7.3,
    status: '良好',
    sparkData: [30, 31, 32, 32.5, 33, 33.5, 34, 34.5, 35.2]
  },
  {
    id: 3,
    metric: '点击率',
    current: '8.5%',
    previous: '9.2%',
    changeRate: -7.6,
    status: '下降',
    sparkData: [9.5, 9.3, 9.1, 8.9, 8.7, 8.6, 8.5, 8.5, 8.5]
  },
  {
    id: 4,
    metric: '转化数',
    current: '892',
    previous: '756',
    changeRate: 18.0,
    status: '优秀',
    sparkData: [70, 72, 75, 78, 80, 83, 85, 88, 89]
  },
  {
    id: 5,
    metric: 'ROI',
    current: '3.85',
    previous: '3.42',
    changeRate: 12.6,
    status: '良好',
    sparkData: [3.2, 3.3, 3.4, 3.5, 3.6, 3.65, 3.7, 3.8, 3.85]
  }
])

// 预警列表
const alerts = ref([
  {
    id: 1,
    level: 'high',
    title: '邮件退信率异常',
    description: '过去24小时邮件退信率达到8.5%，超过预警阈值5%',
    time: '10分钟前',
    action: '查看详情',
    read: false
  },
  {
    id: 2,
    level: 'medium',
    title: 'WhatsApp发送延迟',
    description: 'WhatsApp消息队列积压，平均延迟15分钟',
    time: '30分钟前',
    action: '优化队列',
    read: false
  },
  {
    id: 3,
    level: 'low',
    title: '转化率下降',
    description: '本周转化率较上周下降12%，需要关注',
    time: '2小时前',
    action: '分析原因',
    read: true
  },
  {
    id: 4,
    level: 'medium',
    title: '预算使用超标',
    description: 'Facebook广告预算使用已达85%，剩余预算不足',
    time: '3小时前',
    action: '调整预算',
    read: true
  },
  {
    id: 5,
    level: 'high',
    title: '客户投诉增加',
    description: '过去48小时收到投诉15起，较平时增加200%',
    time: '5小时前',
    action: '立即处理',
    read: false
  }
])

// 实时监控数据
const realtimeMonitors = ref([
  {
    id: 'sending',
    name: '发送速率',
    value: '1,250/分钟',
    status: 'normal',
    updateTime: '10:25:30',
    data: []
  },
  {
    id: 'opening',
    name: '实时打开率',
    value: '28.5%',
    status: 'normal',
    updateTime: '10:25:28',
    data: []
  },
  {
    id: 'clicking',
    name: '实时点击率',
    value: '6.8%',
    status: 'warning',
    updateTime: '10:25:32',
    data: []
  },
  {
    id: 'converting',
    name: '实时转化',
    value: '156',
    status: 'normal',
    updateTime: '10:25:29',
    data: []
  }
])

// 自动刷新
const autoRefresh = ref(true)
let refreshTimer = null

// 导出对话框
const exportDialogVisible = ref(false)
const exportForm = ref({
  type: 'comprehensive',
  dateRange: [],
  format: 'excel',
  includeCharts: true
})

// 图表实例
let trendChartInstance = null
let channelChartInstance = null
const miniChartInstances = new Map()
const sparklineInstances = new Map()
const realtimeChartInstances = new Map()

// 初始化趋势图表
const initTrendChart = () => {
  if (!trendChartInstance) {
    trendChartInstance = echarts.init(trendChart.value)
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['发送量', '打开量', '点击量', '转化量'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: generateDateLabels()
    },
    yAxis: [
      {
        type: 'value',
        name: '数量',
        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        }
      },
      {
        type: 'value',
        name: '转化量',
        splitLine: {
          show: false
        }
      }
    ],
    series: [
      {
        name: '发送量',
        type: 'line',
        smooth: true,
        data: generateRandomData(30, 8000, 12000),
        itemStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          opacity: 0.1
        }
      },
      {
        name: '打开量',
        type: 'line',
        smooth: true,
        data: generateRandomData(30, 2500, 4000),
        itemStyle: {
          color: '#67C23A'
        },
        areaStyle: {
          opacity: 0.1
        }
      },
      {
        name: '点击量',
        type: 'line',
        smooth: true,
        data: generateRandomData(30, 800, 1200),
        itemStyle: {
          color: '#E6A23C'
        },
        areaStyle: {
          opacity: 0.1
        }
      },
      {
        name: '转化量',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: generateRandomData(30, 50, 150),
        itemStyle: {
          color: '#F56C6C'
        },
        areaStyle: {
          opacity: 0.1
        }
      }
    ]
  }

  trendChartInstance.setOption(option)
}

// 初始化渠道图表
const initChannelChart = () => {
  if (!channelChartInstance) {
    channelChartInstance = echarts.init(channelChart.value)
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['转化率', 'ROI'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['邮件', 'WhatsApp', 'Facebook', 'Instagram', 'LinkedIn'],
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '转化率(%)',
        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        }
      },
      {
        type: 'value',
        name: 'ROI',
        splitLine: {
          show: false
        }
      }
    ],
    series: [
      {
        name: '转化率',
        type: 'bar',
        data: [4.5, 3.8, 5.2, 4.1, 3.5],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#409EFF' },
            { offset: 1, color: '#409EFF80' }
          ])
        }
      },
      {
        name: 'ROI',
        type: 'line',
        yAxisIndex: 1,
        data: [3.8, 3.2, 4.5, 3.9, 3.1],
        itemStyle: {
          color: '#67C23A'
        },
        symbol: 'circle',
        symbolSize: 8
      }
    ]
  }

  channelChartInstance.setOption(option)
}

// 初始化迷你图表
const initMiniCharts = () => {
  nextTick(() => {
    const charts = miniCharts.value
    if (!charts) return

    charts.forEach(chartDom => {
      const metricId = chartDom.dataset.metric
      const metric = keyMetrics.value.find(m => m.id === metricId)
      if (!metric) return

      let chart = miniChartInstances.get(metricId)
      if (!chart) {
        chart = echarts.init(chartDom)
        miniChartInstances.set(metricId, chart)
      }

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
          data: Array.from({ length: 10 }, (_, i) => i)
        },
        yAxis: {
          type: 'value',
          show: false
        },
        series: [{
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: metric.sparkData,
          lineStyle: {
            width: 2,
            color: metric.change > 0 ? '#67C23A' : '#F56C6C'
          },
          areaStyle: {
            opacity: 0.2,
            color: metric.change > 0 ? '#67C23A' : '#F56C6C'
          }
        }]
      }

      chart.setOption(option)
    })
  })
}

// 初始化sparkline图表
const initSparklines = () => {
  nextTick(() => {
    // 使用querySelector直接获取所有sparkline元素
    const chartElements = document.querySelectorAll('.sparkline')
    
    chartElements.forEach(chartDom => {
      const rowId = chartDom.dataset.rowId
      const row = comparisonData.value.find(r => r.id === parseInt(rowId))
      if (!row) return

      let chart = sparklineInstances.get(rowId)
      if (!chart) {
        chart = echarts.init(chartDom)
        sparklineInstances.set(rowId, chart)
      }

      const option = {
        grid: {
          left: 2,
          right: 2,
          top: 2,
          bottom: 2
        },
        xAxis: {
          type: 'category',
          show: false,
          data: Array.from({ length: row.sparkData?.length || 9 }, (_, i) => i)
        },
        yAxis: {
          type: 'value',
          show: false
        },
        series: [{
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: {
            width: 2,
            color: row.changeRate > 0 ? '#67C23A' : '#F56C6C'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0,
                color: row.changeRate > 0 ? 'rgba(103, 194, 58, 0.3)' : 'rgba(245, 108, 108, 0.3)'
              }, {
                offset: 1,
                color: 'rgba(255, 255, 255, 0.1)'
              }]
            }
          },
          data: row.sparkData || [80, 85, 90, 95, 100, 105, 110, 120, 125]
        }]
      }

      chart.setOption(option)
    })
  })
}

// 初始化实时监控图表
const initRealtimeCharts = () => {
  nextTick(() => {
    const charts = realtimeCharts.value
    if (!charts) return

    charts.forEach(chartDom => {
      const monitorId = chartDom.dataset.monitor
      const monitor = realtimeMonitors.value.find(m => m.id === monitorId)
      if (!monitor) return

      let chart = realtimeChartInstances.get(monitorId)
      if (!chart) {
        chart = echarts.init(chartDom)
        realtimeChartInstances.set(monitorId, chart)
        monitor.data = generateRandomData(20, 50, 100)
      }

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
          data: Array.from({ length: 20 }, (_, i) => i)
        },
        yAxis: {
          type: 'value',
          show: false
        },
        series: [{
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: monitor.data,
          lineStyle: {
            width: 1,
            color: monitor.status === 'normal' ? '#67C23A' : '#E6A23C'
          },
          areaStyle: {
            opacity: 0.3,
            color: monitor.status === 'normal' ? '#67C23A' : '#E6A23C'
          }
        }]
      }

      chart.setOption(option)
    })
  })
}

// 更新实时数据
const updateRealtimeData = () => {
  realtimeMonitors.value.forEach(monitor => {
    // 更新数值
    if (monitor.id === 'sending') {
      monitor.value = `${Math.floor(1000 + Math.random() * 500)}/分钟`
    } else if (monitor.id === 'opening') {
      monitor.value = `${(25 + Math.random() * 10).toFixed(1)}%`
    } else if (monitor.id === 'clicking') {
      monitor.value = `${(5 + Math.random() * 4).toFixed(1)}%`
    } else if (monitor.id === 'converting') {
      monitor.value = `${Math.floor(100 + Math.random() * 100)}`
    }

    // 更新时间
    const now = new Date()
    monitor.updateTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`

    // 更新图表数据
    if (monitor.data) {
      monitor.data.shift()
      monitor.data.push(50 + Math.random() * 50)

      const chart = realtimeChartInstances.get(monitor.id)
      if (chart) {
        chart.setOption({
          series: [{
            data: monitor.data
          }]
        })
      }
    }
  })
}

// 生成日期标签
const generateDateLabels = () => {
  const labels = []
  const days = trendType.value === 'daily' ? 30 : trendType.value === 'weekly' ? 12 : 12
  const now = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 3600 * 1000)
    if (trendType.value === 'daily') {
      labels.push(`${date.getMonth() + 1}/${date.getDate()}`)
    } else if (trendType.value === 'weekly') {
      labels.push(`第${Math.ceil(date.getDate() / 7)}周`)
    } else {
      labels.push(`${date.getMonth() + 1}月`)
    }
  }
  
  return labels
}

// 生成随机数据
const generateRandomData = (count, min, max) => {
  return Array.from({ length: count }, () => 
    Math.floor(min + Math.random() * (max - min))
  )
}

// 获取变化样式类
const getChangeClass = (change) => {
  if (change > 0) return 'positive'
  if (change < 0) return 'negative'
  return 'neutral'
}

// 获取状态标签类型
const getStatusType = (status) => {
  const statusMap = {
    '优秀': 'success',
    '良好': '',
    '下降': 'warning',
    '异常': 'danger'
  }
  return statusMap[status] || 'info'
}

// 获取预警颜色
const getAlertColor = (level) => {
  const colorMap = {
    high: '#F56C6C',
    medium: '#E6A23C',
    low: '#909399'
  }
  return colorMap[level] || '#909399'
}

// 处理日期变化
const handleDateChange = () => {
  ElMessage.success('数据已更新')
  refreshData()
}

// 刷新数据
const handleRefresh = () => {
  ElMessage.success('数据刷新成功')
  refreshData()
}

const refreshData = () => {
  // 更新所有图表
  updateTrendChart()
  updateChannelChart()
  updateComparison()
  initMiniCharts()
  initSparklines()
  updateRealtimeData()
}

// 更新趋势图表
const updateTrendChart = () => {
  if (trendChartInstance) {
    trendChartInstance.setOption({
      xAxis: {
        data: generateDateLabels()
      },
      series: [
        { data: generateRandomData(30, 8000, 12000) },
        { data: generateRandomData(30, 2500, 4000) },
        { data: generateRandomData(30, 800, 1200) },
        { data: generateRandomData(30, 50, 150) }
      ]
    })
  }
}

// 更新渠道图表
const updateChannelChart = () => {
  if (channelChartInstance) {
    const channels = channelFilter.value === 'TOP5渠道' 
      ? ['邮件', 'WhatsApp', 'Facebook', 'Instagram', 'LinkedIn']
      : channelFilter.value === '活跃渠道'
      ? ['邮件', 'WhatsApp', 'Facebook']
      : ['邮件', 'WhatsApp', 'Facebook', 'Instagram', 'LinkedIn', 'Twitter', 'TikTok']

    channelChartInstance.setOption({
      xAxis: { data: channels },
      series: [
        { data: channels.map(() => 3 + Math.random() * 3) },
        { data: channels.map(() => 2.5 + Math.random() * 2.5) }
      ]
    })
  }
}

// 处理渠道筛选
const handleChannelFilter = (command) => {
  channelFilter.value = command === 'all' ? '全部渠道' : command === 'top5' ? 'TOP5渠道' : '活跃渠道'
  updateChannelChart()
}

// 更新对比数据
const updateComparison = () => {
  // 模拟更新对比数据
  comparisonData.value.forEach(item => {
    const changeRate = -20 + Math.random() * 40
    item.changeRate = parseFloat(changeRate.toFixed(1))
    item.status = changeRate > 15 ? '优秀' : changeRate > 0 ? '良好' : changeRate > -10 ? '下降' : '异常'
  })
  // 延迟重新初始化图表
  setTimeout(() => {
    initSparklines()
  }, 50)
}

// 显示所有预警
const showAllAlerts = () => {
  ElMessage.info('跳转到预警中心')
}

// 处理预警
const handleAlert = (alert) => {
  alert.read = true
  ElMessage.info(`处理预警: ${alert.title}`)
}

// 切换自动刷新
const toggleAutoRefresh = (value) => {
  if (value) {
    refreshTimer = setInterval(() => {
      updateRealtimeData()
    }, 5000)
  } else {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// 导出报表
const handleExport = () => {
  exportDialogVisible.value = true
  exportForm.value.dateRange = dateRange.value
}

// 确认导出
const confirmExport = () => {
  ElMessage.success(`正在导出${exportForm.value.format.toUpperCase()}格式报表...`)
  exportDialogVisible.value = false
}

// 窗口大小变化处理
const handleResize = () => {
  trendChartInstance?.resize()
  channelChartInstance?.resize()
  miniChartInstances.forEach(chart => chart.resize())
  sparklineInstances.forEach(chart => chart.resize())
  realtimeChartInstances.forEach(chart => chart.resize())
}

// Refs
const trendChart = ref(null)
const channelChart = ref(null)
const miniCharts = ref([])
const sparklines = ref([])
const realtimeCharts = ref([])

onMounted(() => {
  nextTick(() => {
    initTrendChart()
    initChannelChart()
    initMiniCharts()
    initRealtimeCharts()
    
    // 延迟初始化sparklines，确保表格已渲染
    setTimeout(() => {
      initSparklines()
    }, 100)
    
    if (autoRefresh.value) {
      refreshTimer = setInterval(() => {
        updateRealtimeData()
      }, 5000)
    }
    
    window.addEventListener('resize', handleResize)
  })
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  
  window.removeEventListener('resize', handleResize)
  
  // 销毁图表实例
  trendChartInstance?.dispose()
  channelChartInstance?.dispose()
  miniChartInstances.forEach(chart => chart.dispose())
  sparklineInstances.forEach(chart => chart.dispose())
  realtimeChartInstances.forEach(chart => chart.dispose())
})
</script>

<style scoped lang="scss">
.overview-container {
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

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
  
  .metric-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    position: relative;
    
    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      
      .metric-name {
        font-size: 14px;
        color: #606266;
      }
      
      .info-icon {
        color: #909399;
        cursor: help;
      }
    }
    
    .metric-value {
      font-size: 32px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 8px;
    }
    
    .metric-change {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      margin-bottom: 16px;
      
      &.positive {
        color: #67C23A;
      }
      
      &.negative {
        color: #F56C6C;
      }
      
      &.neutral {
        color: #909399;
      }
      
      .change-label {
        color: #909399;
        margin-left: 4px;
      }
    }
    
    .mini-chart {
      height: 60px;
    }
  }
}

.chart-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
  }
  
  .chart-container {
    height: 350px;
  }
}

.comparison-section,
.alert-section,
.realtime-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
  }
}

.sparkline {
  height: 30px;
  width: 100px;
}

.alert-list {
  .alert-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    transition: background-color 0.3s;
    
    &:hover {
      background: #f5f7fa;
    }
    
    &.unread {
      background: #fef0f0;
    }
    
    .alert-icon {
      font-size: 20px;
      margin-top: 2px;
    }
    
    .alert-content {
      flex: 1;
      
      .alert-title {
        font-weight: 500;
        margin-bottom: 4px;
      }
      
      .alert-desc {
        font-size: 14px;
        color: #606266;
        margin-bottom: 4px;
      }
      
      .alert-time {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}

.monitor-card {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  
  .monitor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    font-size: 14px;
  }
  
  .monitor-value {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 12px;
  }
  
  .realtime-chart {
    height: 60px;
    margin-bottom: 8px;
  }
  
  .monitor-update {
    font-size: 12px;
    color: #909399;
  }
}
</style>