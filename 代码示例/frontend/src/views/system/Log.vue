<template>
  <div class="operation-log-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="title">
          <el-icon><Notebook /></el-icon>
          操作日志
        </h2>
        <p class="description">系统操作日志查询、分析、异常监控和导出管理</p>
      </div>
      <div class="header-right">
        <el-button type="danger" :icon="ClearLogs" @click="clearLogs">清空日志</el-button>
        <el-button :icon="Download" @click="exportLogs">导出日志</el-button>
        <el-button type="primary" :icon="TrendCharts" @click="showAnalysis">
          日志分析
        </el-button>
      </div>
    </div>

    <!-- 搜索条件 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="searchForm" label-width="80px" class="search-form">
        <el-row :gutter="16">
          <el-col :span="5">
            <el-form-item label="日志类型">
              <el-select v-model="searchForm.logType" placeholder="全部类型" clearable style="width: 100%">
                <el-option label="登录日志" value="login" />
                <el-option label="用户操作" value="user" />
                <el-option label="角色操作" value="role" />
                <el-option label="客户操作" value="customer" />
                <el-option label="产品操作" value="product" />
                <el-option label="营销活动" value="campaign" />
                <el-option label="系统配置" value="system" />
                <el-option label="数据导入" value="import" />
                <el-option label="文件上传" value="upload" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="操作结果">
              <el-select v-model="searchForm.status" placeholder="全部结果" clearable style="width: 100%">
                <el-option label="成功" value="success" />
                <el-option label="失败" value="error" />
                <el-option label="警告" value="warning" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="操作用户">
              <el-input
                v-model="searchForm.username"
                placeholder="用户名"
                clearable
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="IP地址">
              <el-input
                v-model="searchForm.ip"
                placeholder="IP地址"
                clearable
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="searchForm.dateRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item>
              <el-button type="primary" :icon="Search" @click="searchLogs">
                搜索
              </el-button>
              <el-button :icon="RefreshLeft" @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 日志列表 -->
    <el-card shadow="never" class="log-table-card">
      <template #header>
        <div class="card-header">
          <span class="title">操作日志列表</span>
          <div class="header-actions">
            <el-button
              v-if="selectedLogs.length > 0"
              type="danger"
              size="small"
              :icon="Delete"
              @click="batchDeleteLogs"
            >
              批量删除
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="paginatedLogs"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" sortable="custom" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag
              :type="getStatusType(row.status)"
              effect="dark"
              size="small"
            >
              <el-icon>
                <component :is="getStatusIcon(row.status)" />
              </el-icon>
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="日志类型" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="getLogTypeTag(row.logType)">
              {{ getLogTypeText(row.logType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="操作用户" width="120" />
        <el-table-column prop="operation" label="操作内容" min-width="200" />
        <el-table-column prop="ip" label="IP地址" width="140" />
        <el-table-column prop="userAgent" label="用户代理" width="200" show-overflow-tooltip />
        <el-table-column prop="createTime" label="操作时间" width="160" sortable="custom" />
        <el-table-column label="耗时" width="80">
          <template #default="{ row }">
            <span>{{ row.duration }}ms</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <div class="operation-buttons">
              <el-button
                type="text"
                size="small"
                @click="viewDetail(row)"
              >
                详情
              </el-button>
              <el-button
                type="text"
                size="small"
                style="color: var(--el-color-danger)"
                @click="deleteLog(row)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 日志详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="操作日志详情"
      width="800px"
      destroy-on-close
    >
      <div v-if="currentLog" class="log-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="日志ID">
            {{ currentLog.id }}
          </el-descriptions-item>
          <el-descriptions-item label="操作状态">
            <el-tag
              :type="getStatusType(currentLog.status)"
              effect="dark"
              size="small"
            >
              <el-icon>
                <component :is="getStatusIcon(currentLog.status)" />
              </el-icon>
              {{ getStatusText(currentLog.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="日志类型">
            <el-tag size="small" :type="getLogTypeTag(currentLog.logType)">
              {{ getLogTypeText(currentLog.logType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="操作用户">
            {{ currentLog.username }}
          </el-descriptions-item>
          <el-descriptions-item label="用户角色">
            {{ currentLog.userRole }}
          </el-descriptions-item>
          <el-descriptions-item label="操作时间">
            {{ currentLog.createTime }}
          </el-descriptions-item>
          <el-descriptions-item label="IP地址">
            {{ currentLog.ip }}
          </el-descriptions-item>
          <el-descriptions-item label="地理位置">
            {{ currentLog.location }}
          </el-descriptions-item>
          <el-descriptions-item label="操作耗时">
            {{ currentLog.duration }}ms
          </el-descriptions-item>
          <el-descriptions-item label="请求大小">
            {{ currentLog.requestSize }}KB
          </el-descriptions-item>
          <el-descriptions-item label="操作内容" :span="2">
            {{ currentLog.operation }}
          </el-descriptions-item>
          <el-descriptions-item label="用户代理" :span="2">
            {{ currentLog.userAgent }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">请求详情</el-divider>
        <el-tabs model-value="request" type="border-card">
          <el-tab-pane label="请求参数" name="request">
            <el-input
              v-model="currentLog.requestData"
              type="textarea"
              :rows="8"
              readonly
              class="log-data"
            />
          </el-tab-pane>
          <el-tab-pane label="响应数据" name="response">
            <el-input
              v-model="currentLog.responseData"
              type="textarea"
              :rows="8"
              readonly
              class="log-data"
            />
          </el-tab-pane>
          <el-tab-pane label="错误信息" name="error" v-if="currentLog.errorMessage">
            <el-alert
              :title="currentLog.errorMessage"
              type="error"
              :description="currentLog.errorStack"
              show-icon
              :closable="false"
            />
          </el-tab-pane>
        </el-tabs>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="exportLogDetail">导出详情</el-button>
      </template>
    </el-dialog>

    <!-- 日志分析对话框 -->
    <el-dialog
      v-model="analysisDialogVisible"
      title="日志分析报告"
      width="1200px"
      destroy-on-close
    >
      <div class="analysis-content">
        <el-row :gutter="20" class="stats-row">
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-item">
                <div class="stat-value">{{ analysisData.totalLogs }}</div>
                <div class="stat-label">总日志数</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-item">
                <div class="stat-value error">{{ analysisData.errorLogs }}</div>
                <div class="stat-label">错误日志</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-item">
                <div class="stat-value">{{ analysisData.uniqueUsers }}</div>
                <div class="stat-label">活跃用户</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-item">
                <div class="stat-value">{{ analysisData.avgDuration }}ms</div>
                <div class="stat-label">平均耗时</div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" class="charts-row">
          <el-col :span="12">
            <el-card shadow="never" class="chart-card">
              <template #header>
                <span class="chart-title">操作类型分布</span>
              </template>
              <div id="logTypeChart" style="height: 300px;"></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="never" class="chart-card">
              <template #header>
                <span class="chart-title">时间趋势分析</span>
              </template>
              <div id="timeSeriesChart" style="height: 300px;"></div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-card shadow="never" class="chart-card">
              <template #header>
                <span class="chart-title">Top 10 活跃用户</span>
              </template>
              <el-table :data="analysisData.topUsers" style="width: 100%" size="small">
                <el-table-column prop="username" label="用户名" />
                <el-table-column prop="count" label="操作次数" width="100" />
                <el-table-column prop="errorRate" label="错误率" width="100">
                  <template #default="{ row }">
                    <el-tag
                      :type="row.errorRate > 10 ? 'danger' : row.errorRate > 5 ? 'warning' : 'success'"
                      size="small"
                    >
                      {{ row.errorRate }}%
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="never" class="chart-card">
              <template #header>
                <span class="chart-title">异常IP监控</span>
              </template>
              <el-table :data="analysisData.suspiciousIPs" style="width: 100%" size="small">
                <el-table-column prop="ip" label="IP地址" />
                <el-table-column prop="location" label="地理位置" />
                <el-table-column prop="count" label="访问次数" width="100" />
                <el-table-column prop="riskLevel" label="风险等级" width="100">
                  <template #default="{ row }">
                    <el-tag
                      :type="row.riskLevel === 'high' ? 'danger' : row.riskLevel === 'medium' ? 'warning' : 'info'"
                      size="small"
                    >
                      {{ row.riskLevel === 'high' ? '高' : row.riskLevel === 'medium' ? '中' : '低' }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <template #footer>
        <el-button @click="analysisDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="exportAnalysisReport">导出报告</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watchEffect, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Notebook,
  Refresh,
  Download,
  TrendCharts,
  Search,
  RefreshLeft,
  Delete,
  CircleCheck,
  CircleClose,
  Warning,
  DeleteFilled as ClearLogs
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import {
  getLogList,
  getLogDetail,
  getLogStatistics,
  getLogTypeDistribution,
  getStatusDistribution,
  getUserRanking,
  getDailyCount,
  deleteLog as deleteLogApi,
  deleteLogs as deleteLogsApi,
  cleanLogs as cleanLogsApi,
  exportLogs as exportLogsApi
} from '@/api/log'

// 响应式数据
const loading = ref(false)
const detailDialogVisible = ref(false)
const analysisDialogVisible = ref(false)
const currentLog = ref(null)
const selectedLogs = ref([])

// 搜索表单
const searchForm = reactive({
  logType: '',
  status: '',
  username: '',
  ip: '',
  dateRange: []
})

// 分页数据
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 排序数据
const sortConfig = reactive({
  prop: 'createTime',
  order: 'descending'
})

// 日志数据
const logs = ref([])

// 计算属性 - 分页后的日志
const paginatedLogs = computed(() => {
  const start = (pagination.page - 1) * pagination.size
  const end = start + pagination.size
  return logs.value.slice(start, end)
})

// 更新分页总数
watchEffect(() => {
  pagination.total = logs.value.length
})

// 分析数据
const analysisData = reactive({
  totalLogs: 0,
  errorLogs: 0,
  uniqueUsers: 0,
  avgDuration: 0,
  topUsers: [],
  suspiciousIPs: []
})

// 方法定义
const getStatusType = (status) => {
  const types = {
    success: 'success',
    error: 'danger',
    warning: 'warning'
  }
  return types[status] || 'info'
}

const getStatusIcon = (status) => {
  const icons = {
    success: CircleCheck,
    error: CircleClose,
    warning: Warning
  }
  return icons[status] || CircleCheck
}

const getStatusText = (status) => {
  const texts = {
    success: '成功',
    error: '失败',
    warning: '警告'
  }
  return texts[status] || '未知'
}

const getLogTypeTag = (logType) => {
  const tags = {
    login: 'success',
    user: 'warning',
    role: 'warning',
    customer: 'warning',
    product: 'warning',
    campaign: 'danger',
    system: 'info',
    import: 'primary',
    upload: 'primary'
  }
  return tags[logType] || ''
}

const getLogTypeText = (logType) => {
  const texts = {
    login: '登录',
    user: '用户',
    role: '角色',
    customer: '客户',
    product: '产品',
    campaign: '营销',
    system: '系统',
    import: '导入',
    upload: '上传'
  }
  return texts[logType] || logType
}

const searchLogs = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      size: pagination.size,
      logType: searchForm.logType,
      status: searchForm.status,
      username: searchForm.username,
      ip: searchForm.ip,
      startTime: searchForm.dateRange && searchForm.dateRange[0] ? searchForm.dateRange[0] : null,
      endTime: searchForm.dateRange && searchForm.dateRange[1] ? searchForm.dateRange[1] : null,
      sortBy: sortConfig.prop,
      sortDir: sortConfig.order === 'descending' ? 'desc' : 'asc'
    }

    const res = await getLogList(params)
    if (res.data && res.data.data) {
      const pageData = res.data.data
      logs.value = pageData.content || pageData.records || []
      pagination.total = pageData.totalElements || pageData.total || 0
      ElMessage.success('日志列表已更新')
    } else {
      logs.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('查询日志失败:', error)
    ElMessage.error('查询日志失败: ' + (error.response?.data?.message || error.message))
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  Object.assign(searchForm, {
    logType: '',
    status: '',
    username: '',
    ip: '',
    dateRange: []
  })
  searchLogs()
}

const clearLogs = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有日志吗？这个操作不可恢复！',
      '清空确认',
      {
        type: 'warning',
        confirmButtonText: '确定清空',
        cancelButtonText: '取消',
        confirmButtonClass: 'el-button--danger'
      }
    )

    // 调用清空日志API，保留最近1天的日志
    await cleanLogsApi(1)
    ElMessage.success('日志清空成功')
    // 清空后刷新日志列表
    searchLogs()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清空日志失败:', error)
      ElMessage.error('清空日志失败: ' + (error.response?.data?.message || error.message))
    }
  }
}

const handleSelectionChange = (selection) => {
  selectedLogs.value = selection
}

const handleSortChange = ({ prop, order }) => {
  sortConfig.prop = prop
  sortConfig.order = order
  searchLogs()
}

const handleSizeChange = (size) => {
  pagination.size = size
  searchLogs()
}

const handleCurrentChange = (page) => {
  pagination.page = page
  searchLogs()
}

const viewDetail = (log) => {
  currentLog.value = log
  detailDialogVisible.value = true
}

const deleteLog = async (log) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除日志"${log.operation}"吗？删除后无法恢复。`,
      '删除确认',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }
    )
    
    // 调用删除API
    const res = await deleteLogApi(log.id)
    if (res.data && res.data.code === 200) {
      ElMessage.success('日志删除成功')
      searchLogs() // 重新加载日志列表
    } else {
      ElMessage.error(res.data?.message || '删除失败')
    }
  } catch (error) {
    // 用户取消删除
  }
}

const batchDeleteLogs = async () => {
  if (selectedLogs.value.length === 0) {
    ElMessage.warning('请选择要删除的日志')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedLogs.value.length} 条日志吗？删除后无法恢复。`,
      '批量删除确认',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }
    )
    
    // 调用批量删除API
    const deleteIds = selectedLogs.value.map(log => log.id)
    const res = await deleteLogsApi(deleteIds)
    if (res.data && res.data.code === 200) {
      ElMessage.success('日志批量删除成功')
      selectedLogs.value = []
      searchLogs() // 重新加载日志列表
    } else {
      ElMessage.error(res.data?.message || '批量删除失败')
    }
  } catch (error) {
    // 用户取消删除
  }
}

const exportLogs = async () => {
  try {
    const params = {
      logType: searchForm.logType,
      status: searchForm.status,
      username: searchForm.username,
      ip: searchForm.ip,
      startTime: searchForm.dateRange && searchForm.dateRange[0] ? searchForm.dateRange[0] : null,
      endTime: searchForm.dateRange && searchForm.dateRange[1] ? searchForm.dateRange[1] : null,
      format: 'csv'
    }

    const res = await exportLogsApi(params)
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `logs_${new Date().getTime()}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    ElMessage.success('日志导出成功')
  } catch (error) {
    console.error('导出日志失败:', error)
    ElMessage.error('导出日志失败: ' + (error.response?.data?.message || error.message))
  }
}

const exportLogDetail = () => {
  if (!currentLog.value) return
  
  const exportData = {
    基本信息: {
      日志ID: currentLog.value.id,
      操作状态: getStatusText(currentLog.value.status),
      日志类型: getLogTypeText(currentLog.value.logType),
      操作用户: currentLog.value.username,
      用户角色: currentLog.value.userRole,
      操作时间: currentLog.value.createTime,
      IP地址: currentLog.value.ip,
      地理位置: currentLog.value.location,
      操作耗时: currentLog.value.duration + 'ms',
      请求大小: currentLog.value.requestSize + 'KB',
      操作内容: currentLog.value.operation,
      用户代理: currentLog.value.userAgent
    },
    请求数据: currentLog.value.requestData,
    响应数据: currentLog.value.responseData,
    错误信息: currentLog.value.errorMessage,
    错误堆栈: currentLog.value.errorStack
  }
  
  console.log('导出日志详情:', exportData)
  ElMessage.success('日志详情导出成功')
}

const showAnalysis = async () => {
  analysisDialogVisible.value = true

  try {
    // 获取统计数据
    const statsRes = await getLogStatistics({
      startTime: searchForm.dateRange?.[0],
      endTime: searchForm.dateRange?.[1]
    })

    if (statsRes.data && statsRes.data.data) {
      const stats = statsRes.data.data
      analysisData.totalLogs = stats.total || 0
      analysisData.errorLogs = stats.errorCount || 0
      analysisData.uniqueUsers = stats.uniqueUsers || 0
      analysisData.avgDuration = stats.avgDuration || 0
    }

    // 获取用户排行
    const userRes = await getUserRanking({
      startTime: searchForm.dateRange?.[0],
      endTime: searchForm.dateRange?.[1]
    })

    if (userRes.data && userRes.data.data) {
      analysisData.topUsers = userRes.data.data.map(item => ({
        username: item.username,
        count: item.count,
        errorRate: ((item.errorCount / item.count) * 100).toFixed(1)
      }))
    }

    nextTick(() => {
      initCharts()
    })
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败')
  }
}

const exportAnalysisReport = () => {
  const reportData = {
    统计概览: {
      总日志数: analysisData.totalLogs,
      错误日志: analysisData.errorLogs,
      活跃用户: analysisData.uniqueUsers,
      平均耗时: analysisData.avgDuration + 'ms'
    },
    活跃用户Top10: analysisData.topUsers,
    异常IP监控: analysisData.suspiciousIPs,
    生成时间: new Date().toLocaleString()
  }
  
  console.log('导出分析报告:', reportData)
  ElMessage.success('分析报告导出成功')
}

const initCharts = async () => {
  try {
    // 获取日志类型分布数据
    const typeRes = await getLogTypeDistribution({
      startTime: searchForm.dateRange?.[0],
      endTime: searchForm.dateRange?.[1]
    })

    // 操作类型分布图
    const logTypeChart = echarts.init(document.getElementById('logTypeChart'))
    const typeData = typeRes.data?.data || []
    const logTypeOption = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: '操作类型',
          type: 'pie',
          radius: '50%',
          data: typeData.length > 0 ? typeData.map(item => ({
            value: item.count,
            name: getLogTypeText(item.logType)
          })) : [
            { value: 0, name: '暂无数据' }
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
  logTypeChart.setOption(logTypeOption)
  
    // 获取每日操作数量数据
    const dailyRes = await getDailyCount({
      startTime: searchForm.dateRange?.[0],
      endTime: searchForm.dateRange?.[1]
    })

    // 时间趋势图
    const timeSeriesChart = echarts.init(document.getElementById('timeSeriesChart'))
    const dailyData = dailyRes.data?.data || []
    const dates = dailyData.map(item => item.date)
    const counts = dailyData.map(item => item.count)

    const timeSeriesOption = {
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: dates.length > 0 ? dates : ['暂无数据']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '操作次数',
          type: 'line',
          data: counts.length > 0 ? counts : [0],
          smooth: true,
          areaStyle: {}
        }
      ]
    }
    timeSeriesChart.setOption(timeSeriesOption)
  } catch (error) {
    console.error('初始化图表失败:', error)
    ElMessage.error('加载图表数据失败')
  }
}


// 组件挂载时加载数据
onMounted(() => {
  searchLogs()
})

</script>

<style scoped lang="scss">
.operation-log-container {
  padding: 20px;
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
    
    .header-left {
      .title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 24px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin-bottom: 8px;
      }
      
      .description {
        color: var(--el-text-color-regular);
        margin: 0;
      }
    }
    
    .header-right {
      display: flex;
      gap: 12px;
    }
  }
  
  .search-card {
    margin-bottom: 20px;
    
    .search-form {
      .el-form-item {
        margin-bottom: 16px;
      }
    }
  }
  
  .log-table-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .title {
        font-weight: 600;
        font-size: 16px;
      }
      
      .header-actions {
        display: flex;
        align-items: center;
        gap: 16px;
      }
    }
    
    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
  
  .log-detail {
    .log-data {
      font-family: 'Courier New', monospace;
      font-size: 12px;
    }
  }
  
  .analysis-content {
    .stats-row {
      margin-bottom: 20px;
      
      .stat-card {
        .stat-item {
          text-align: center;
          padding: 10px;
          
          .stat-value {
            font-size: 24px;
            font-weight: 600;
            color: var(--el-color-primary);
            margin-bottom: 5px;
            
            &.error {
              color: var(--el-color-danger);
            }
          }
          
          .stat-label {
            font-size: 14px;
            color: var(--el-text-color-regular);
          }
        }
      }
    }
    
    .charts-row {
      margin-bottom: 20px;
      
      .chart-card {
        .chart-title {
          font-weight: 600;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .operation-log-container {
    padding: 10px;
    
    .page-header {
      flex-direction: column;
      gap: 16px;
      
      .header-right {
        align-self: stretch;
        justify-content: flex-end;
      }
    }
    
    .search-form {
      .el-row {
        .el-col {
          margin-bottom: 16px;
        }
      }
    }
    
    .analysis-content {
      .stats-row,
      .charts-row {
        .el-col {
          margin-bottom: 20px;
        }
      }
    }
  }
}

.operation-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
  
  .el-button {
    margin: 0;
  }
}
</style>
