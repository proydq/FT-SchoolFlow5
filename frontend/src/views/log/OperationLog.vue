<template>
  <div class="operation-log-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h2>操作日志</h2>
        <p class="page-description">记录系统所有用户操作行为，支持多维度查询和统计分析</p>
        <div class="header-actions">
          <el-button @click="handleExport" :loading="exportLoading">
            <el-icon><Download /></el-icon>
            导出日志
          </el-button>
          <el-button type="danger" @click="handleCleanup" :disabled="selectedLogs.length === 0">
            <el-icon><Delete /></el-icon>
            清理日志
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon success">
                <el-icon><SuccessFilled /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.totalLogs }}</div>
                <div class="stats-label">总日志数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon info">
                <el-icon><User /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.activeUsers }}</div>
                <div class="stats-label">活跃用户</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon warning">
                <el-icon><WarningFilled /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.errorLogs }}</div>
                <div class="stats-label">异常操作</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon primary">
                <el-icon><Calendar /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.todayLogs }}</div>
                <div class="stats-label">今日操作</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <el-card>
        <div class="filter-content">
          <div class="filter-row">
            <div class="filter-left">
              <el-input
                v-model="searchQuery"
                placeholder="搜索用户名、操作内容、IP地址"
                prefix-icon="Search"
                style="width: 320px"
                clearable
                @keyup.enter="handleSearch"
                @clear="handleSearch"
              />

              <el-select v-model="operationFilter" placeholder="操作类型" style="width: 140px" clearable @change="handleFilter">
                <el-option label="全部类型" value="" />
                <el-option v-for="type in operationTypes" :key="type.value" :label="type.label" :value="type.value" />
              </el-select>

              <el-select v-model="moduleFilter" placeholder="功能模块" style="width: 140px" clearable @change="handleFilter">
                <el-option label="全部模块" value="" />
                <el-option v-for="module in modules" :key="module.value" :label="module.label" :value="module.value" />
              </el-select>

              <el-select v-model="statusFilter" placeholder="操作状态" style="width: 120px" clearable @change="handleFilter">
                <el-option label="全部状态" value="" />
                <el-option label="成功" value="success" />
                <el-option label="失败" value="error" />
                <el-option label="警告" value="warning" />
              </el-select>
            </div>

            <div class="filter-right">
              <el-date-picker
                v-model="dateRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 350px"
                @change="handleDateChange"
              />
              <el-button @click="handleReset">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
              <el-button type="primary" @click="handleSearch">
                <el-icon><Search /></el-icon>
                查询
              </el-button>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 日志列表 -->
    <div class="log-list-section">
      <el-card>
        <el-table
          :data="filteredLogs"
          style="width: 100%"
          @selection-change="handleSelectionChange"
          row-key="id"
          v-loading="loading"
          :row-class-name="getRowClassName"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="ID" width="80" />

          <el-table-column label="用户信息" width="150">
            <template #default="{ row }">
              <div class="user-info">
                <el-avatar :size="32" :src="row.userAvatar">
                  {{ row.username.charAt(0).toUpperCase() }}
                </el-avatar>
                <div class="user-details">
                  <div class="username">{{ row.username }}</div>
                  <div class="user-type">{{ row.userType }}</div>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="operation" label="操作类型" width="100">
            <template #default="{ row }">
              <el-tag :type="getOperationTagType(row.operation)" size="small">
                {{ getOperationText(row.operation) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="module" label="功能模块" width="120">
            <template #default="{ row }">
              <el-tag type="info" size="small">
                {{ getModuleText(row.module) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="description" label="操作内容" min-width="200" show-overflow-tooltip />

          <el-table-column prop="status" label="操作状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)" size="small">
                <el-icon v-if="row.status === 'success'"><SuccessFilled /></el-icon>
                <el-icon v-else-if="row.status === 'error'"><CircleCloseFilled /></el-icon>
                <el-icon v-else-if="row.status === 'warning'"><WarningFilled /></el-icon>
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="ip" label="IP地址" width="140" />

          <el-table-column prop="location" label="地理位置" width="120" />

          <el-table-column prop="userAgent" label="用户设备" width="160" show-overflow-tooltip>
            <template #default="{ row }">
              <el-tooltip :content="row.userAgent" placement="top">
                <span>{{ formatUserAgent(row.userAgent) }}</span>
              </el-tooltip>
            </template>
          </el-table-column>

          <el-table-column prop="duration" label="耗时" width="80">
            <template #default="{ row }">
              <span :class="getDurationClass(row.duration)">{{ row.duration }}ms</span>
            </template>
          </el-table-column>

          <el-table-column prop="createTime" label="操作时间" width="160" sortable />

          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <div class="operation-buttons">
                <el-button
                  size="small"
                  link
                  type="primary"
                  @click="viewLogDetail(row)"
                >
                  查看详情
                </el-button>
                <el-button
                  size="small"
                  link
                  type="danger"
                  @click="deleteLog(row)"
                >
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 批量操作 -->
        <div v-if="selectedLogs.length > 0" class="batch-actions">
          <div class="batch-info">
            已选择 {{ selectedLogs.length }} 条日志
          </div>
          <div class="batch-buttons">
            <el-button @click="batchExport">批量导出</el-button>
            <el-button type="danger" @click="batchDelete">批量删除</el-button>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="totalLogs"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 日志详情对话框 -->
    <el-dialog v-model="logDetailVisible" title="操作日志详情" width="800px">
      <div class="log-detail" v-if="currentLog">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="日志ID" :span="2">{{ currentLog.id }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ currentLog.username }}</el-descriptions-item>
          <el-descriptions-item label="用户类型">{{ currentLog.userType }}</el-descriptions-item>
          <el-descriptions-item label="操作类型">
            <el-tag :type="getOperationTagType(currentLog.operation)" size="small">
              {{ getOperationText(currentLog.operation) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="功能模块">
            <el-tag type="info" size="small">
              {{ getModuleText(currentLog.module) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="操作状态" :span="2">
            <el-tag :type="getStatusTagType(currentLog.status)" size="small">
              <el-icon v-if="currentLog.status === 'success'"><SuccessFilled /></el-icon>
              <el-icon v-else-if="currentLog.status === 'error'"><CircleCloseFilled /></el-icon>
              <el-icon v-else-if="currentLog.status === 'warning'"><WarningFilled /></el-icon>
              {{ getStatusText(currentLog.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="操作内容" :span="2">{{ currentLog.description }}</el-descriptions-item>
          <el-descriptions-item label="IP地址">{{ currentLog.ip }}</el-descriptions-item>
          <el-descriptions-item label="地理位置">{{ currentLog.location }}</el-descriptions-item>
          <el-descriptions-item label="用户设备" :span="2">{{ currentLog.userAgent }}</el-descriptions-item>
          <el-descriptions-item label="请求路径">{{ currentLog.path }}</el-descriptions-item>
          <el-descriptions-item label="请求方法">{{ currentLog.method }}</el-descriptions-item>
          <el-descriptions-item label="耗时">
            <span :class="getDurationClass(currentLog.duration)">{{ currentLog.duration }}ms</span>
          </el-descriptions-item>
          <el-descriptions-item label="操作时间">{{ currentLog.createTime }}</el-descriptions-item>
        </el-descriptions>

        <!-- 请求参数 -->
        <div v-if="currentLog.params" class="log-section">
          <h4>请求参数</h4>
          <el-input
            v-model="currentLog.params"
            type="textarea"
            :rows="4"
            readonly
            class="json-textarea"
          />
        </div>

        <!-- 响应结果 -->
        <div v-if="currentLog.response" class="log-section">
          <h4>响应结果</h4>
          <el-input
            v-model="currentLog.response"
            type="textarea"
            :rows="4"
            readonly
            class="json-textarea"
          />
        </div>

        <!-- 错误信息 -->
        <div v-if="currentLog.errorMessage" class="log-section">
          <h4>错误信息</h4>
          <el-alert
            :title="currentLog.errorMessage"
            type="error"
            :closable="false"
            show-icon
          />
        </div>
      </div>
    </el-dialog>

    <!-- 清理日志对话框 -->
    <el-dialog v-model="cleanupDialogVisible" title="清理日志" width="500px">
      <div class="cleanup-section">
        <el-alert
          title="清理日志将永久删除选定的日志数据，请谨慎操作！"
          type="warning"
          :closable="false"
          show-icon
          style="margin-bottom: 20px"
        />
        <el-form :model="cleanupForm" label-width="120px">
          <el-form-item label="清理方式">
            <el-radio-group v-model="cleanupForm.type">
              <el-radio label="selected">清理选中日志</el-radio>
              <el-radio label="date">按日期清理</el-radio>
              <el-radio label="status">按状态清理</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="cleanupForm.type === 'date'" label="保留天数">
            <el-input-number v-model="cleanupForm.days" :min="1" :max="365" />
            <span style="margin-left: 10px; color: #909399; font-size: 12px">
              将删除 {{ cleanupForm.days }} 天前的所有日志
            </span>
          </el-form-item>
          <el-form-item v-if="cleanupForm.type === 'status'" label="清理状态">
            <el-select v-model="cleanupForm.status" placeholder="请选择要清理的状态">
              <el-option label="成功" value="success" />
              <el-option label="失败" value="error" />
              <el-option label="警告" value="warning" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="cleanupDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmCleanup" :loading="cleanupLoading">
          确认清理
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Download,
  Delete,
  SuccessFilled,
  CircleCloseFilled,
  WarningFilled,
  User,
  Calendar
} from '@element-plus/icons-vue'
import * as operationLogApi from '@/api/system/operationLog'

// 响应式数据
const loading = ref(false)
const exportLoading = ref(false)
const cleanupLoading = ref(false)
const searchQuery = ref('')
const operationFilter = ref('')
const moduleFilter = ref('')
const statusFilter = ref('')
const dateRange = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const totalLogs = ref(0)
const selectedLogs = ref([])
const logs = ref([])

// 对话框状态
const logDetailVisible = ref(false)
const cleanupDialogVisible = ref(false)
const currentLog = ref(null)

// 统计数据
const stats = reactive({
  totalLogs: 0,
  activeUsers: 0,
  errorLogs: 0,
  todayLogs: 0
})

// 清理表单
const cleanupForm = reactive({
  type: 'selected',
  days: 30,
  status: ''
})

// 操作类型选项
const operationTypes = [
  { label: '登录', value: 'login' },
  { label: '登出', value: 'logout' },
  { label: '查看', value: 'view' },
  { label: '新增', value: 'create' },
  { label: '编辑', value: 'update' },
  { label: '删除', value: 'delete' },
  { label: '导入', value: 'import' },
  { label: '导出', value: 'export' },
  { label: '上传', value: 'upload' },
  { label: '下载', value: 'download' }
]

// 功能模块选项
const modules = [
  { label: '用户管理', value: 'user' },
  { label: '角色管理', value: 'role' },
  { label: '权限管理', value: 'permission' },
  { label: '部门管理', value: 'department' },
  { label: '岗位管理', value: 'position' },
  { label: '账号管理', value: 'account' },
  { label: '系统设置', value: 'system' },
  { label: '数据统计', value: 'statistics' },
  { label: '文件管理', value: 'file' },
  { label: '消息通知', value: 'message' }
]

// 计算属性
const filteredLogs = computed(() => {
  let filtered = logs.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(log =>
      log.username.toLowerCase().includes(query) ||
      log.description.toLowerCase().includes(query) ||
      log.ip.includes(query)
    )
  }

  if (operationFilter.value) {
    filtered = filtered.filter(log => log.operation === operationFilter.value)
  }

  if (moduleFilter.value) {
    filtered = filtered.filter(log => log.module === moduleFilter.value)
  }

  if (statusFilter.value) {
    filtered = filtered.filter(log => log.status === statusFilter.value)
  }

  if (dateRange.value && dateRange.value.length === 2) {
    filtered = filtered.filter(log => {
      const logTime = new Date(log.createTime).getTime()
      const startTime = new Date(dateRange.value[0]).getTime()
      const endTime = new Date(dateRange.value[1]).getTime()
      return logTime >= startTime && logTime <= endTime
    })
  }

  return filtered
})

// 方法
const loadLogs = async () => {
  loading.value = true
  try {
    // 模拟API调用，使用模拟数据
    await new Promise(resolve => setTimeout(resolve, 500))

    const mockLogs = [
      {
        id: 1,
        username: 'admin',
        userType: '管理员',
        userAvatar: '',
        operation: 'login',
        module: 'user',
        description: '用户登录系统',
        status: 'success',
        ip: '192.168.1.100',
        location: '北京市',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0',
        path: '/api/auth/login',
        method: 'POST',
        params: '{"username":"admin","password":"******"}',
        response: '{"code":200,"message":"登录成功","data":{"token":"xxx"}}',
        duration: 245,
        createTime: '2024-01-15 14:30:25',
        errorMessage: null
      },
      {
        id: 2,
        username: 'operator',
        userType: '运营人员',
        userAvatar: '',
        operation: 'create',
        module: 'user',
        description: '新增用户：张三',
        status: 'success',
        ip: '192.168.1.101',
        location: '上海市',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        path: '/api/users',
        method: 'POST',
        params: '{"name":"张三","email":"zhangsan@example.com"}',
        response: '{"code":200,"message":"创建成功","data":{"id":123}}',
        duration: 156,
        createTime: '2024-01-15 13:45:12',
        errorMessage: null
      },
      {
        id: 3,
        username: 'developer',
        userType: '开发人员',
        userAvatar: '',
        operation: 'update',
        module: 'system',
        description: '修改系统配置',
        status: 'error',
        ip: '192.168.1.102',
        location: '广州市',
        userAgent: 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
        path: '/api/system/config',
        method: 'PUT',
        params: '{"key":"smtp_host","value":"smtp.example.com"}',
        response: '{"code":500,"message":"配置更新失败"}',
        duration: 1250,
        createTime: '2024-01-15 12:20:45',
        errorMessage: '数据库连接超时'
      },
      {
        id: 4,
        username: 'service',
        userType: '客服人员',
        userAvatar: '',
        operation: 'export',
        module: 'user',
        description: '导出用户数据',
        status: 'warning',
        ip: '192.168.1.103',
        location: '深圳市',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0.0.0',
        path: '/api/users/export',
        method: 'GET',
        params: '{"format":"xlsx","filter":"active"}',
        response: '{"code":200,"message":"导出完成","data":{"url":"xxx"}}',
        duration: 3500,
        createTime: '2024-01-15 11:15:30',
        errorMessage: null
      },
      {
        id: 5,
        username: 'admin',
        userType: '管理员',
        userAvatar: '',
        operation: 'delete',
        module: 'user',
        description: '删除用户：李四',
        status: 'success',
        ip: '192.168.1.100',
        location: '北京市',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0',
        path: '/api/users/456',
        method: 'DELETE',
        params: '{}',
        response: '{"code":200,"message":"删除成功"}',
        duration: 89,
        createTime: '2024-01-15 10:30:15',
        errorMessage: null
      }
    ]

    logs.value = mockLogs
    totalLogs.value = mockLogs.length

    // 更新统计数据
    stats.totalLogs = mockLogs.length
    stats.activeUsers = [...new Set(mockLogs.map(log => log.username))].length
    stats.errorLogs = mockLogs.filter(log => log.status === 'error').length

    const today = new Date().toISOString().split('T')[0]
    stats.todayLogs = mockLogs.filter(log => log.createTime.startsWith(today)).length
  } catch (error) {
    console.error('获取操作日志失败:', error)
    ElMessage.error('获取操作日志失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadLogs()
}

const handleFilter = () => {
  currentPage.value = 1
  loadLogs()
}

const handleDateChange = () => {
  currentPage.value = 1
  loadLogs()
}

const handleReset = () => {
  searchQuery.value = ''
  operationFilter.value = ''
  moduleFilter.value = ''
  statusFilter.value = ''
  dateRange.value = []
  currentPage.value = 1
  loadLogs()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  loadLogs()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  loadLogs()
}

const handleSelectionChange = (selection) => {
  selectedLogs.value = selection
}

const handleExport = async () => {
  exportLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('日志导出成功')
  } catch (error) {
    console.error('导出日志失败:', error)
    ElMessage.error('导出日志失败')
  } finally {
    exportLoading.value = false
  }
}

const handleCleanup = () => {
  if (selectedLogs.value.length === 0) {
    ElMessage.warning('请先选择要清理的日志')
    return
  }
  cleanupForm.type = 'selected'
  cleanupDialogVisible.value = true
}

const confirmCleanup = async () => {
  cleanupLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))

    let cleanupCount = 0
    if (cleanupForm.type === 'selected') {
      cleanupCount = selectedLogs.value.length
    } else if (cleanupForm.type === 'date') {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - cleanupForm.days)
      cleanupCount = logs.value.filter(log => new Date(log.createTime) < cutoffDate).length
    } else if (cleanupForm.type === 'status') {
      cleanupCount = logs.value.filter(log => log.status === cleanupForm.status).length
    }

    ElMessage.success(`成功清理 ${cleanupCount} 条日志`)
    cleanupDialogVisible.value = false
    selectedLogs.value = []
    loadLogs()
  } catch (error) {
    console.error('清理日志失败:', error)
    ElMessage.error('清理日志失败')
  } finally {
    cleanupLoading.value = false
  }
}

const viewLogDetail = (log) => {
  currentLog.value = log
  logDetailVisible.value = true
}

const deleteLog = async (log) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除日志 ID: ${log.id} 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 模拟删除
    ElMessage.success('删除成功')
    loadLogs()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除日志失败:', error)
      ElMessage.error('删除日志失败')
    }
  }
}

const batchExport = async () => {
  exportLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    ElMessage.success(`成功导出 ${selectedLogs.value.length} 条日志`)
    selectedLogs.value = []
  } catch (error) {
    console.error('批量导出失败:', error)
    ElMessage.error('批量导出失败')
  } finally {
    exportLoading.value = false
  }
}

const batchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedLogs.value.length} 条日志吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 模拟批量删除
    ElMessage.success(`成功删除 ${selectedLogs.value.length} 条日志`)
    selectedLogs.value = []
    loadLogs()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

// 工具函数
const getOperationTagType = (operation) => {
  const typeMap = {
    login: 'success',
    logout: 'info',
    view: 'info',
    create: 'success',
    update: 'warning',
    delete: 'danger',
    import: 'primary',
    export: 'primary',
    upload: 'primary',
    download: 'primary'
  }
  return typeMap[operation] || 'info'
}

const getOperationText = (operation) => {
  const textMap = {
    login: '登录',
    logout: '登出',
    view: '查看',
    create: '新增',
    update: '编辑',
    delete: '删除',
    import: '导入',
    export: '导出',
    upload: '上传',
    download: '下载'
  }
  return textMap[operation] || operation
}

const getModuleText = (module) => {
  const textMap = {
    user: '用户管理',
    role: '角色管理',
    permission: '权限管理',
    department: '部门管理',
    position: '岗位管理',
    account: '账号管理',
    system: '系统设置',
    statistics: '数据统计',
    file: '文件管理',
    message: '消息通知'
  }
  return textMap[module] || module
}

const getStatusTagType = (status) => {
  const typeMap = {
    success: 'success',
    error: 'danger',
    warning: 'warning'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    success: '成功',
    error: '失败',
    warning: '警告'
  }
  return textMap[status] || status
}

const getDurationClass = (duration) => {
  if (duration > 2000) return 'duration-slow'
  if (duration > 1000) return 'duration-medium'
  return 'duration-fast'
}

const getRowClassName = ({ row }) => {
  if (row.status === 'error') return 'error-row'
  if (row.status === 'warning') return 'warning-row'
  return ''
}

const formatUserAgent = (userAgent) => {
  if (!userAgent) return ''

  // 简化用户代理字符串显示
  if (userAgent.includes('Chrome')) {
    const version = userAgent.match(/Chrome\/(\d+)/)?.[1] || ''
    return `Chrome ${version}`
  } else if (userAgent.includes('Firefox')) {
    const version = userAgent.match(/Firefox\/(\d+)/)?.[1] || ''
    return `Firefox ${version}`
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    return 'Safari'
  } else if (userAgent.includes('Edge')) {
    const version = userAgent.match(/Edge\/(\d+)/)?.[1] || ''
    return `Edge ${version}`
  }

  return userAgent.substring(0, 20) + '...'
}

// 生命周期
onMounted(() => {
  loadLogs()
})
</script>

<style scoped lang="scss">
.operation-log-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  margin-bottom: 20px;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    h2 {
      margin: 0 0 8px 0;
      color: #303133;
      font-size: 24px;
      font-weight: 600;
    }

    .page-description {
      margin: 0;
      color: #909399;
      font-size: 14px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }
}

.operation-buttons {
  display: flex;
  gap: 4px;
  align-items: center;
  white-space: nowrap;

  .el-button {
    margin-left: 0 !important;

    & + .el-button {
      margin-left: 4px !important;
    }
  }
}

.stats-section {
  margin-bottom: 20px;

  .stats-card {
    :deep(.el-card__body) {
      padding: 20px;
    }

    .stats-content {
      display: flex;
      align-items: center;
      gap: 16px;

      .stats-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: white;

        &.success {
          background: linear-gradient(135deg, #67c23a, #85ce61);
        }

        &.info {
          background: linear-gradient(135deg, #409eff, #66b1ff);
        }

        &.warning {
          background: linear-gradient(135deg, #e6a23c, #ebb563);
        }

        &.primary {
          background: linear-gradient(135deg, #5e7ce0, #7693f5);
        }
      }

      .stats-info {
        flex: 1;

        .stats-number {
          font-size: 28px;
          font-weight: 600;
          color: #303133;
          line-height: 1;
          margin-bottom: 4px;
        }

        .stats-label {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }
}

.filter-section {
  margin-bottom: 20px;

  .filter-content {
    .filter-row {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .filter-left {
        display: flex;
        gap: 12px;
        align-items: center;
      }

      .filter-right {
        display: flex;
        gap: 12px;
        align-items: center;
      }
    }
  }
}

.log-list-section {
  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;

    .user-details {
      .username {
        font-size: 13px;
        font-weight: 500;
        line-height: 1.2;
      }

      .user-type {
        font-size: 12px;
        color: #909399;
        line-height: 1.2;
      }
    }
  }

  .batch-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;
    margin: 16px 0;

    .batch-info {
      color: #606266;
      font-size: 14px;
    }

    .batch-buttons {
      display: flex;
      gap: 8px;
    }
  }

  .pagination-wrapper {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}

.log-detail {
  .log-section {
    margin-top: 20px;

    h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }

    .json-textarea {
      :deep(.el-textarea__inner) {
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 12px;
        background: #f8f9fa;
      }
    }
  }
}

.cleanup-section {
  .el-form-item {
    margin-bottom: 20px;
  }
}

// 表格行样式
:deep(.el-table) {
  .error-row {
    background-color: #fef0f0;
  }

  .warning-row {
    background-color: #fdf6ec;
  }

  .duration-fast {
    color: #67c23a;
    font-weight: 500;
  }

  .duration-medium {
    color: #e6a23c;
    font-weight: 500;
  }

  .duration-slow {
    color: #f56c6c;
    font-weight: 500;
  }
}
</style>