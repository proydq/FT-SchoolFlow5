<template>
  <div class="attendance-statistics">
    <!-- 统计概览卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :xs="12" :sm="6" :md="6" v-for="card in statCards" :key="card.title">
        <div class="stat-card" :style="{ background: card.gradient }">
          <div class="card-header">
            <div class="card-icon">
              <el-icon :size="28">
                <component :is="card.icon" />
              </el-icon>
            </div>
            <div class="card-trend" v-if="card.trend">
              <el-icon :class="card.trend > 0 ? 'trend-up' : 'trend-down'">
                <ArrowUp v-if="card.trend > 0" />
                <ArrowDown v-else />
              </el-icon>
              <span class="trend-value">{{ Math.abs(card.trend) }}%</span>
            </div>
          </div>
          <div class="card-value">{{ card.value }}</div>
          <div class="card-title">{{ card.title }}</div>
          <div class="card-subtitle" v-if="card.subtitle">{{ card.subtitle }}</div>
        </div>
      </el-col>
    </el-row>

    <!-- 查询条件 -->
    <el-card class="search-card">
      <el-form :model="queryForm" inline label-width="80px">
        <el-form-item label="统计维度">
          <el-select v-model="queryForm.dimension" placeholder="请选择" style="width: 120px" @change="handleDimensionChange">
            <el-option label="按日" value="day" />
            <el-option label="按周" value="week" />
            <el-option label="按月" value="month" />
            <el-option label="按季度" value="quarter" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="queryForm.dateRange"
            :type="getDatePickerType()"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 240px"
            @change="handleDateRangeChange"
          />
        </el-form-item>
        <el-form-item label="考勤日期">
          <el-date-picker
            v-model="queryForm.attendanceStartDate"
            type="date"
            placeholder="开始日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 140px"
            @change="handleQuery"
          />
        </el-form-item>
        <el-form-item label="至">
          <el-date-picker
            v-model="queryForm.attendanceEndDate"
            type="date"
            placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 140px"
            @change="handleQuery"
          />
        </el-form-item>
        <el-form-item label="人员类型">
          <el-select v-model="queryForm.userType" placeholder="请选择" clearable style="width: 100px">
            <el-option label="教师" value="teacher" />
            <el-option label="学生" value="student" />
          </el-select>
        </el-form-item>
        <el-form-item label="年级班级">
          <el-cascader
            v-model="queryForm.organizationPath"
            :options="organizationOptions"
            :props="cascaderProps"
            placeholder="请选择年级班级"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery" :icon="Search">查询</el-button>
          <el-button @click="handleReset" :icon="Refresh">重置</el-button>
          <el-button type="success" @click="handleExport" :icon="Download" :loading="exporting">
            {{ exporting ? '导出中' : '导出报告' }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 图表展示区域 -->
    <el-row :gutter="20">
      <!-- 考勤趋势图 -->
      <el-col :xs="24" :md="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>考勤趋势分析</span>
              <el-dropdown @command="handleTrendCommand">
                <el-button text :icon="More" />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="fullscreen">全屏查看</el-dropdown-item>
                    <el-dropdown-item command="export">导出图表</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
          <div class="chart-container" ref="trendChartRef"></div>
        </el-card>
      </el-col>

      <!-- 考勤状态分布饼图 -->
      <el-col :xs="24" :md="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>考勤状态分布</span>
              <el-dropdown @command="handlePieCommand">
                <el-button text :icon="More" />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="fullscreen">全屏查看</el-dropdown-item>
                    <el-dropdown-item command="export">导出图表</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
          <div class="chart-container" ref="pieChartRef"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <!-- 部门考勤率柱状图 -->
      <el-col :xs="24" :md="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>部门考勤率对比</span>
              <el-dropdown @command="handleBarCommand">
                <el-button text :icon="More" />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="fullscreen">全屏查看</el-dropdown-item>
                    <el-dropdown-item command="export">导出图表</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
          <div class="chart-container" ref="barChartRef"></div>
        </el-card>
      </el-col>

      <!-- 异常统计图 -->
      <el-col :xs="24" :md="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>异常统计分析</span>
              <el-dropdown @command="handleExceptionCommand">
                <el-button text :icon="More" />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="fullscreen">全屏查看</el-dropdown-item>
                    <el-dropdown-item command="export">导出图表</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
          <div class="chart-container" ref="exceptionChartRef"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 热力图 -->
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>考勤时段热力图</span>
              <div class="header-actions">
                <el-select v-model="heatmapType" style="width: 100px; margin-right: 10px" @change="updateHeatmap">
                  <el-option label="本周" value="week" />
                  <el-option label="本月" value="month" />
                </el-select>
                <el-dropdown @command="handleHeatmapCommand">
                  <el-button text :icon="More" />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="fullscreen">全屏查看</el-dropdown-item>
                      <el-dropdown-item command="export">导出图表</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </template>
          <div class="chart-container heatmap-container" ref="heatmapChartRef"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细数据表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>统计详情</span>
          <div class="header-actions">
            <el-button @click="handleRefreshTable" :icon="Refresh">刷新</el-button>
            <el-button @click="handleExportTable" :icon="Download">导出表格</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" v-loading="tableLoading" stripe height="400">
        <el-table-column prop="date" label="日期" width="110" />
        <el-table-column prop="totalCount" label="总人数" width="80" />
        <el-table-column prop="normalCount" label="正常出勤" width="90">
          <template #default="{ row }">
            <span class="text-success">{{ row.normalCount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="lateCount" label="迟到" width="70">
          <template #default="{ row }">
            <span class="text-warning">{{ row.lateCount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="earlyLeaveCount" label="早退" width="70">
          <template #default="{ row }">
            <span class="text-warning">{{ row.earlyLeaveCount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="absentCount" label="缺勤" width="70">
          <template #default="{ row }">
            <span class="text-danger">{{ row.absentCount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="leaveCount" label="请假" width="70">
          <template #default="{ row }">
            <span class="text-info">{{ row.leaveCount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="attendanceRate" label="出勤率" min-width="120">
          <template #default="{ row }">
            <el-progress :percentage="row.attendanceRate" :color="getProgressColor(row.attendanceRate)" />
          </template>
        </el-table-column>
        <el-table-column prop="punctualityRate" label="准时率" min-width="120">
          <template #default="{ row }">
            <el-progress :percentage="row.punctualityRate" :color="getProgressColor(row.punctualityRate)" />
          </template>
        </el-table-column>
        <el-table-column prop="averageWorkHours" label="平均工时" min-width="100" />
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="tablePagination.current"
          v-model:page-size="tablePagination.pageSize"
          :total="tablePagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleTableQuery"
          @current-change="handleTableQuery"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search,
  Refresh,
  Download,
  More,
  ArrowUp,
  ArrowDown,
  User,
  Clock,
  Check,
  Warning
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import type { AttendanceStatisticsQuery } from '@/types/attendance'
import {
  getAttendanceStatistics,
  getAttendanceReportData,
  exportAttendanceReport,
  getAttendanceTrendData,
  getAttendanceDistributionData,
  getGradeList,
  getClassList
} from '@/api/attendance'

// 响应式数据
const exporting = ref(false)
const tableLoading = ref(false)
const heatmapType = ref('week')

// ECharts实例
const trendChartRef = ref<HTMLDivElement>()
const pieChartRef = ref<HTMLDivElement>()
const barChartRef = ref<HTMLDivElement>()
const exceptionChartRef = ref<HTMLDivElement>()
const heatmapChartRef = ref<HTMLDivElement>()

let trendChart: ECharts | null = null
let pieChart: ECharts | null = null
let barChart: ECharts | null = null
let exceptionChart: ECharts | null = null
let heatmapChart: ECharts | null = null

// 查询表单
const queryForm = reactive<AttendanceStatisticsQuery>({
  dimension: 'day',
  dateRange: [],
  attendanceStartDate: undefined,
  attendanceEndDate: undefined,
  userType: undefined,
  organizationPath: []
})

// 表格分页
const tablePagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 表格数据
const tableData = ref([])

// 统计卡片数据
const statCards = computed(() => [
  {
    title: '总出勤率',
    value: '94.2%',
    subtitle: '本月平均',
    icon: Check,
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    trend: 2.3
  },
  {
    title: '准时率',
    value: '89.7%',
    subtitle: '本月平均',
    icon: Clock,
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    trend: -1.2
  },
  {
    title: '异常记录',
    value: '156',
    subtitle: '本月累计',
    icon: Warning,
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    trend: -5.8
  },
  {
    title: '平均工时',
    value: '8.2h',
    subtitle: '本月平均',
    icon: User,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    trend: 0.5
  }
])

// 选项数据
const organizationOptions = ref([])

// 级联选择器配置
const cascaderProps = {
  value: 'id',
  label: 'name',
  children: 'children'
}

// 根据维度获取日期选择器类型
const getDatePickerType = () => {
  switch (queryForm.dimension) {
    case 'day':
      return 'daterange'
    case 'week':
      return 'week'
    case 'month':
      return 'monthrange'
    case 'quarter':
      return 'monthrange'
    default:
      return 'daterange'
  }
}

// 获取进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage >= 95) return '#67c23a'
  if (percentage >= 90) return '#e6a23c'
  if (percentage >= 80) return '#f56c6c'
  return '#909399'
}

// 维度变化处理
const handleDimensionChange = () => {
  // 重置日期范围
  queryForm.dateRange = []
  handleQuery()
}

// 日期范围变化处理
const handleDateRangeChange = () => {
  handleQuery()
}

// 查询数据
const handleQuery = async () => {
  try {
    // 更新统计数据
    await updateStatistics()
    // 更新图表
    await updateCharts()
    // 更新表格
    await handleTableQuery()
  } catch (error) {
    console.error('查询失败:', error)
    ElMessage.error('查询失败')
  }
}

// 重置查询
const handleReset = () => {
  Object.assign(queryForm, {
    dimension: 'day',
    dateRange: [],
    attendanceStartDate: undefined,
    attendanceEndDate: undefined,
    userType: undefined,
    organizationPath: []
  })
  handleQuery()
}

// 导出报告
const handleExport = async () => {
  try {
    exporting.value = true
    const params = {
      ...queryForm,
      startDate: queryForm.dateRange?.[0],
      endDate: queryForm.dateRange?.[1]
    }
    delete params.dateRange

    await exportAttendanceReport(params)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}

// 更新统计数据
const updateStatistics = async () => {
  try {
    const params = {
      ...queryForm,
      startDate: queryForm.dateRange?.[0],
      endDate: queryForm.dateRange?.[1]
    }
    delete params.dateRange

    const response = await getAttendanceStatistics(params)
    // TODO: 更新统计卡片数据
  } catch (error) {
    console.error('更新统计数据失败:', error)
  }
}

// 更新图表
const updateCharts = async () => {
  try {
    await nextTick()

    // 更新趋势图
    await updateTrendChart()
    // 更新饼图
    await updatePieChart()
    // 更新柱状图
    await updateBarChart()
    // 更新异常统计图
    await updateExceptionChart()
    // 更新热力图
    await updateHeatmap()
  } catch (error) {
    console.error('更新图表失败:', error)
  }
}

// 更新趋势图
const updateTrendChart = async () => {
  if (!trendChart || !trendChartRef.value) return

  try {
    const response = await getAttendanceTrendData({
      dimension: queryForm.dimension,
      startDate: queryForm.dateRange?.[0],
      endDate: queryForm.dateRange?.[1]
    })

    const option = {
      title: {
        text: '考勤趋势',
        left: 'center',
        textStyle: {
          fontSize: 16,
          color: '#333'
        }
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['出勤率', '准时率'],
        bottom: 10
      },
      xAxis: {
        type: 'category',
        data: response.data?.dates || ['1月', '2月', '3月', '4月', '5月', '6月']
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLabel: {
          formatter: '{value}%'
        }
      },
      series: [
        {
          name: '出勤率',
          type: 'line',
          data: response.data?.attendanceRates || [94, 95, 93, 96, 94, 95],
          smooth: true,
          itemStyle: {
            color: '#43e97b'
          }
        },
        {
          name: '准时率',
          type: 'line',
          data: response.data?.punctualityRates || [89, 91, 87, 92, 89, 90],
          smooth: true,
          itemStyle: {
            color: '#4facfe'
          }
        }
      ]
    }

    trendChart.setOption(option)
  } catch (error) {
    console.error('更新趋势图失败:', error)
  }
}

// 更新饼图
const updatePieChart = async () => {
  if (!pieChart || !pieChartRef.value) return

  try {
    const response = await getAttendanceDistributionData({
      startDate: queryForm.dateRange?.[0],
      endDate: queryForm.dateRange?.[1]
    })

    const option = {
      title: {
        text: '考勤状态分布',
        left: 'center',
        textStyle: {
          fontSize: 16,
          color: '#333'
        }
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
          name: '考勤状态',
          type: 'pie',
          radius: '50%',
          data: response.data?.distribution || [
            { value: 1048, name: '正常出勤', itemStyle: { color: '#67c23a' } },
            { value: 735, name: '迟到', itemStyle: { color: '#e6a23c' } },
            { value: 580, name: '早退', itemStyle: { color: '#f56c6c' } },
            { value: 484, name: '缺勤', itemStyle: { color: '#909399' } },
            { value: 300, name: '请假', itemStyle: { color: '#409eff' } }
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

    pieChart.setOption(option)
  } catch (error) {
    console.error('更新饼图失败:', error)
  }
}

// 更新柱状图
const updateBarChart = async () => {
  if (!barChart || !barChartRef.value) return

  const option = {
    title: {
      text: '部门考勤率对比',
      left: 'center',
      textStyle: {
        fontSize: 16,
        color: '#333'
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['语文组', '数学组', '英语组', '物理组', '化学组', '生物组']
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '出勤率',
        type: 'bar',
        data: [96, 94, 95, 92, 93, 97],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#43e97b' },
            { offset: 1, color: '#38f9d7' }
          ])
        }
      }
    ]
  }

  barChart.setOption(option)
}

// 更新异常统计图
const updateExceptionChart = async () => {
  if (!exceptionChart || !exceptionChartRef.value) return

  const option = {
    title: {
      text: '异常统计分析',
      left: 'center',
      textStyle: {
        fontSize: 16,
        color: '#333'
      }
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      bottom: 10
    },
    series: [
      {
        name: '异常类型',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 35, name: '迟到严重', itemStyle: { color: '#e6a23c' } },
          { value: 28, name: '早退严重', itemStyle: { color: '#f56c6c' } },
          { value: 23, name: '缺勤未报告', itemStyle: { color: '#909399' } },
          { value: 18, name: '设备异常', itemStyle: { color: '#409eff' } },
          { value: 12, name: '数据缺失', itemStyle: { color: '#67c23a' } }
        ]
      }
    ]
  }

  exceptionChart.setOption(option)
}

// 更新热力图
const updateHeatmap = async () => {
  if (!heatmapChart || !heatmapChartRef.value) return

  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
  const days = heatmapType.value === 'week'
    ? ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    : Array.from({ length: 30 }, (_, i) => `${i + 1}日`)

  // 生成模拟热力图数据
  const data = []
  for (let i = 0; i < days.length; i++) {
    for (let j = 0; j < hours.length; j++) {
      const value = Math.random() * 100
      data.push([j, i, Math.round(value)])
    }
  }

  const option = {
    title: {
      text: `考勤时段热力图 (${heatmapType.value === 'week' ? '本周' : '本月'})`,
      left: 'center',
      textStyle: {
        fontSize: 16,
        color: '#333'
      }
    },
    tooltip: {
      position: 'top'
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
      max: 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '10%',
      inRange: {
        color: ['#e0f3ff', '#409eff', '#1f4f99']
      }
    },
    series: [
      {
        name: '打卡人数',
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
      }
    ]
  }

  heatmapChart.setOption(option)
}

// 表格查询
const handleTableQuery = async () => {
  tableLoading.value = true
  try {
    const params = {
      ...queryForm,
      pageNum: tablePagination.current,
      pageSize: tablePagination.pageSize,
      startDate: queryForm.dateRange?.[0],
      endDate: queryForm.dateRange?.[1]
    }
    delete params.dateRange

    const response = await getAttendanceReportData(params)
    tableData.value = response.data.records
    tablePagination.total = response.data.total
  } catch (error) {
    console.error('查询表格数据失败:', error)
    ElMessage.error('查询表格数据失败')
  } finally {
    tableLoading.value = false
  }
}

// 刷新表格
const handleRefreshTable = () => {
  handleTableQuery()
}

// 导出表格
const handleExportTable = () => {
  // TODO: 实现表格导出功能
  ElMessage.info('表格导出功能开发中')
}

// 图表命令处理
const handleTrendCommand = (command: string) => {
  handleChartCommand('trend', command)
}

const handlePieCommand = (command: string) => {
  handleChartCommand('pie', command)
}

const handleBarCommand = (command: string) => {
  handleChartCommand('bar', command)
}

const handleExceptionCommand = (command: string) => {
  handleChartCommand('exception', command)
}

const handleHeatmapCommand = (command: string) => {
  handleChartCommand('heatmap', command)
}

const handleChartCommand = (chartType: string, command: string) => {
  switch (command) {
    case 'fullscreen':
      // TODO: 实现全屏显示
      ElMessage.info('全屏功能开发中')
      break
    case 'export':
      // TODO: 实现图表导出
      ElMessage.info('图表导出功能开发中')
      break
  }
}

// 初始化图表
const initCharts = async () => {
  await nextTick()

  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value)
  }
  if (pieChartRef.value) {
    pieChart = echarts.init(pieChartRef.value)
  }
  if (barChartRef.value) {
    barChart = echarts.init(barChartRef.value)
  }
  if (exceptionChartRef.value) {
    exceptionChart = echarts.init(exceptionChartRef.value)
  }
  if (heatmapChartRef.value) {
    heatmapChart = echarts.init(heatmapChartRef.value)
  }

  // 窗口大小变化时重新调整图表大小
  window.addEventListener('resize', () => {
    trendChart?.resize()
    pieChart?.resize()
    barChart?.resize()
    exceptionChart?.resize()
    heatmapChart?.resize()
  })
}

// 初始化数据
const initData = async () => {
  try {
    // 获取年级班级数据
    const gradesResponse = await getGradeList()
    const grades = gradesResponse.data

    // 构建级联数据
    organizationOptions.value = await Promise.all(
      grades.map(async (grade: any) => {
        const classesResponse = await getClassList(grade.id)
        return {
          id: grade.id,
          name: grade.name,
          children: classesResponse.data.map((cls: any) => ({
            id: cls.id,
            name: cls.name
          }))
        }
      })
    )

    // 设置默认日期范围（本月）
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    queryForm.dateRange = [
      firstDay.toISOString().split('T')[0],
      lastDay.toISOString().split('T')[0]
    ]
  } catch (error) {
    console.error('初始化数据失败:', error)
  }
}

// 组件挂载
onMounted(async () => {
  await initData()
  await initCharts()
  await handleQuery()
})
</script>

<style scoped>
.attendance-statistics {
  padding: 20px;
  background-color: #f5f6fa;
  min-height: 100vh;
}

/* 统计卡片样式 */
.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  padding: 20px;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  min-height: 140px;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transform: translate(30px, -30px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-trend {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.trend-up {
  color: #67c23a;
}

.trend-down {
  color: #f56c6c;
}

.trend-value {
  margin-left: 4px;
}

.card-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
}

.card-title {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 5px;
}

.card-subtitle {
  font-size: 12px;
  opacity: 0.7;
}

/* 卡片样式 */
.search-card,
.chart-card,
.table-card {
  margin-bottom: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}

/* 图表容器样式 */
.chart-container {
  width: 100%;
  height: 300px;
}

.heatmap-container {
  height: 400px;
}

/* 表格样式 */
.text-success {
  color: #67c23a;
}

.text-warning {
  color: #e6a23c;
}

.text-danger {
  color: #f56c6c;
}

.text-info {
  color: #409eff;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .attendance-statistics {
    padding: 10px;
  }

  .stat-card {
    min-height: 120px;
  }

  .card-value {
    font-size: 24px;
  }

  .chart-container {
    height: 250px;
  }

  .heatmap-container {
    height: 300px;
  }
}

/* 图表主题定制 */
:deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-card__body) {
  padding: 20px;
}
</style>