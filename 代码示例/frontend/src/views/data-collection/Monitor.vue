<template>
  <div class="collection-monitor">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h2>📊 采集监控</h2>
          <span class="subtitle">API使用情况监控和成本分析仪表板</span>
        </div>
        <div class="header-actions">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="handleDateChange"
          />
          <el-button icon="Refresh" @click="refreshData">刷新数据</el-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <el-statistic title="本月API调用" :value="monthlyAPICalls">
            <template #suffix>次</template>
          </el-statistic>
          <div class="stat-footer">
            <span class="trend up">↑ 12.5%</span>
            较上月
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <el-statistic title="剩余额度" :value="remainingCredits">
            <template #suffix>/ {{ totalCredits }}</template>
          </el-statistic>
          <el-progress :percentage="creditsPercentage" :color="getProgressColor" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <el-statistic title="本月成本" :value="monthlyCost" :precision="2" prefix="$" />
          <div class="stat-footer">
            预算使用 <strong>{{ budgetUsage }}%</strong>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <el-statistic title="数据质量" :value="dataQuality" suffix="%" />
          <div class="stat-footer">
            <el-tag size="small" :type="dataQuality > 80 ? 'success' : 'warning'">
              {{ dataQuality > 80 ? '优秀' : '良好' }}
            </el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="chart-header">
              <span>API使用趋势</span>
              <el-radio-group v-model="chartTimeRange" size="small">
                <el-radio-button label="day">日</el-radio-button>
                <el-radio-button label="week">周</el-radio-button>
                <el-radio-button label="month">月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container" ref="trendChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>API类型分布</template>
          <div class="chart-container" ref="distributionChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细数据表格 -->
    <el-card class="detail-card">
      <template #header>
        <div class="detail-header">
          <span>详细使用记录</span>
          <el-button size="small" @click="exportData">导出数据</el-button>
        </div>
      </template>
      <el-table :data="usageRecords" stripe>
        <el-table-column prop="date" label="时间" width="180" />
        <el-table-column prop="apiType" label="API类型" width="150">
          <template #default="{ row }">
            <el-tag>{{ row.apiType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="endpoint" label="接口" min-width="200" />
        <el-table-column prop="count" label="调用次数" width="100" />
        <el-table-column prop="success" label="成功率" width="100">
          <template #default="{ row }">
            <el-progress :percentage="row.successRate" :text-inside="true" :stroke-width="20" />
          </template>
        </el-table-column>
        <el-table-column prop="cost" label="成本" width="100">
          <template #default="{ row }">
            ${{ row.cost.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="responseTime" label="平均响应时间" width="120">
          <template #default="{ row }">
            {{ row.responseTime }}ms
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="totalRecords"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

// 数据状态
const dateRange = ref([])
const chartTimeRange = ref('week')
const currentPage = ref(1)
const pageSize = ref(20)
const totalRecords = ref(156)

// 统计数据
const monthlyAPICalls = ref(12458)
const remainingCredits = ref(7542)
const totalCredits = ref(10000)
const monthlyCost = ref(234.56)
const budgetUsage = ref(78)
const dataQuality = ref(92)

// API分布数据
const apiDistribution = ref([
  { type: 'domain-search', name: '域名搜索', count: 4523, percentage: 36, color: '#409eff' },
  { type: 'email-finder', name: '邮箱查找', count: 3421, percentage: 28, color: '#67c23a' },
  { type: 'email-verifier', name: '邮箱验证', count: 2789, percentage: 22, color: '#e6a23c' },
  { type: 'enrichment', name: '信息丰富', count: 1725, percentage: 14, color: '#f56c6c' }
])

// 使用记录
const usageRecords = ref([
  {
    date: '2024-01-20 10:23:45',
    apiType: '域名搜索',
    endpoint: '/domain-search',
    count: 45,
    successRate: 95,
    cost: 4.5,
    responseTime: 230
  },
  {
    date: '2024-01-20 09:15:30',
    apiType: '邮箱验证',
    endpoint: '/email-verifier',
    count: 123,
    successRate: 88,
    cost: 6.15,
    responseTime: 180
  }
])

// 计算属性
const creditsPercentage = computed(() => {
  return Math.round((remainingCredits.value / totalCredits.value) * 100)
})

// 获取进度条颜色
const getProgressColor = (percentage) => {
  if (percentage < 20) return '#f56c6c'
  if (percentage < 50) return '#e6a23c'
  return '#67c23a'
}

// 刷新数据
const refreshData = () => {
  ElMessage.success('数据已刷新')
}

// 日期变化
const handleDateChange = () => {
  ElMessage.info('正在加载选定时间范围的数据...')
}

// 导出数据
const exportData = () => {
  ElMessage.success('正在导出数据...')
}

// 图表引用
const trendChartRef = ref(null)
const distributionChartRef = ref(null)
let trendChart = null
let distributionChart = null

// 初始化趋势图表
const initTrendChart = () => {
  if (!trendChartRef.value) return

  trendChart = echarts.init(trendChartRef.value)

  const option = {
    title: {
      show: false
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: ['API调用次数', '成功率', '平均响应时间'],
      bottom: 0
    },
    toolbox: {
      show: false  // 隐藏工具栏
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: generateDateLabels()
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '调用次数',
        position: 'left',
        axisLine: {
          lineStyle: {
            color: '#409eff'
          }
        },
        axisLabel: {
          formatter: '{value}'
        }
      },
      {
        type: 'value',
        name: '成功率(%)',
        position: 'right',
        min: 0,
        max: 100,
        axisLine: {
          lineStyle: {
            color: '#67c23a'
          }
        },
        axisLabel: {
          formatter: '{value}%'
        }
      },
      {
        type: 'value',
        name: '响应时间(ms)',
        position: 'right',
        offset: 60,
        axisLine: {
          lineStyle: {
            color: '#e6a23c'
          }
        },
        axisLabel: {
          formatter: '{value}ms'
        }
      }
    ],
    series: [
      {
        name: 'API调用次数',
        type: 'line',
        data: generateMockData(7, 1000, 2000),
        smooth: true,
        itemStyle: {
          color: '#409eff'
        },
        areaStyle: {
          opacity: 0.1
        }
      },
      {
        name: '成功率',
        type: 'line',
        yAxisIndex: 1,
        data: generateMockData(7, 85, 98),
        smooth: true,
        itemStyle: {
          color: '#67c23a'
        }
      },
      {
        name: '平均响应时间',
        type: 'line',
        yAxisIndex: 2,
        data: generateMockData(7, 150, 300),
        smooth: true,
        itemStyle: {
          color: '#e6a23c'
        }
      }
    ]
  }

  trendChart.setOption(option)
}

// 生成日期标签
const generateDateLabels = () => {
  const labels = []
  const today = new Date()

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    labels.push(`${date.getMonth() + 1}/${date.getDate()}`)
  }

  return labels
}

// 生成模拟数据
const generateMockData = (count, min, max) => {
  const data = []
  for (let i = 0; i < count; i++) {
    data.push(Math.floor(Math.random() * (max - min + 1)) + min)
  }
  return data
}

// 更新图表数据
const updateChartData = () => {
  if (!trendChart) return

  let dateLabels = []
  let apiCalls = []
  let successRates = []
  let responseTimes = []

  if (chartTimeRange.value === 'day') {
    // 按小时显示今天的数据
    const hours = 24
    for (let i = 0; i < hours; i++) {
      dateLabels.push(`${i}:00`)
    }
    apiCalls = generateMockData(hours, 50, 200)
    successRates = generateMockData(hours, 85, 98)
    responseTimes = generateMockData(hours, 150, 300)
  } else if (chartTimeRange.value === 'week') {
    // 按天显示一周的数据
    dateLabels = generateDateLabels()
    apiCalls = generateMockData(7, 800, 1500)
    successRates = generateMockData(7, 85, 98)
    responseTimes = generateMockData(7, 150, 300)
  } else {
    // 按天显示一个月的数据
    for (let i = 30; i > 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      dateLabels.push(`${date.getMonth() + 1}/${date.getDate()}`)
    }
    apiCalls = generateMockData(30, 500, 2000)
    successRates = generateMockData(30, 85, 98)
    responseTimes = generateMockData(30, 150, 300)
  }

  trendChart.setOption({
    xAxis: {
      data: dateLabels
    },
    series: [
      {
        name: 'API调用次数',
        data: apiCalls
      },
      {
        name: '成功率',
        data: successRates
      },
      {
        name: '平均响应时间',
        data: responseTimes
      }
    ]
  })
}

// 监听时间范围变化
watch(chartTimeRange, () => {
  updateChartData()
})

// 监听窗口大小变化
const handleResize = () => {
  if (trendChart) {
    trendChart.resize()
  }
  if (distributionChart) {
    distributionChart.resize()
  }
}

// 初始化分布图表
const initDistributionChart = () => {
  if (!distributionChartRef.value) return

  distributionChart = echarts.init(distributionChartRef.value)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center'
    },
    series: [
      {
        name: 'API类型',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
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
            fontSize: 18,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: apiDistribution.value.map(item => ({
          value: item.count,
          name: item.name,
          itemStyle: { color: item.color }
        }))
      }
    ]
  }

  distributionChart.setOption(option)
}

// 组件挂载
onMounted(() => {
  initTrendChart()
  initDistributionChart()
  window.addEventListener('resize', handleResize)
})

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (trendChart) {
    trendChart.dispose()
  }
  if (distributionChart) {
    distributionChart.dispose()
  }
})
</script>

<style lang="scss" scoped>
.collection-monitor {
  padding: 20px;

  .page-header {
    margin-bottom: 24px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title-section {
        h2 {
          font-size: 24px;
          margin: 0 0 8px 0;
          color: #303133;
        }

        .subtitle {
          color: #909399;
          font-size: 14px;
        }
      }

      .header-actions {
        display: flex;
        gap: 12px;
      }
    }
  }

  .stats-row {
    margin-bottom: 20px;

    .stat-card {
      :deep(.el-statistic__content) {
        font-size: 28px;
      }

      .stat-footer {
        margin-top: 12px;
        font-size: 13px;
        color: #909399;

        .trend {
          font-weight: 500;

          &.up {
            color: #67c23a;
          }

          &.down {
            color: #f56c6c;
          }
        }

        strong {
          color: #303133;
        }
      }
    }
  }

  .charts-row {
    margin-bottom: 20px;

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .api-distribution {
      .distribution-item {
        margin-bottom: 20px;

        .item-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;

          .type {
            color: #303133;
            font-size: 14px;
          }

          .count {
            color: #606266;
            font-weight: 500;
          }
        }
      }
    }
  }

  .detail-card {
    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }
  }
}
</style>