<template>
  <div class="scheduled-tasks">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h2>⏰ 定时任务管理</h2>
          <span class="subtitle">管理系统定时任务的配置、执行状态和监控日志</span>
        </div>
        <div class="header-actions">
          <el-button type="primary" icon="Plus" @click="showCreateDialog = true">
            新建任务
          </el-button>
          <el-button icon="Refresh" @click="refreshTasks">刷新</el-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon running">
                <el-icon><Timer /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.running }}</div>
                <div class="stats-label">运行中</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon stopped">
                <el-icon><VideoPause /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.stopped }}</div>
                <div class="stats-label">已停止</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon success">
                <el-icon><SuccessFilled /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.success }}</div>
                <div class="stats-label">执行成功</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon error">
                <el-icon><CircleCloseFilled /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ stats.error }}</div>
                <div class="stats-label">执行失败</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 筛选区域 -->
    <el-card class="filter-card">
      <el-form :model="filterForm" :inline="true" class="filter-form">
        <el-form-item label="任务名称">
          <el-input
            v-model="filterForm.name"
            placeholder="请输入任务名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="任务状态">
          <el-select v-model="filterForm.status" clearable placeholder="请选择状态" style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="运行中" value="running" />
            <el-option label="已停止" value="stopped" />
            <el-option label="已禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item label="任务分组">
          <el-select v-model="filterForm.group" clearable placeholder="请选择分组" style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="数据同步" value="sync" />
            <el-option label="报表生成" value="report" />
            <el-option label="系统维护" value="maintenance" />
            <el-option label="通知推送" value="notification" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 任务列表 -->
    <el-card class="table-card">
      <div class="table-header">
        <div class="table-title">
          <el-icon><List /></el-icon>
          <span>定时任务列表</span>
        </div>
        <div class="table-actions">
          <el-button-group>
            <el-button
              :type="viewMode === 'table' ? 'primary' : ''"
              icon="Grid"
              @click="viewMode = 'table'"
            >
              列表视图
            </el-button>
            <el-button
              :type="viewMode === 'card' ? 'primary' : ''"
              icon="Postcard"
              @click="viewMode = 'card'"
            >
              卡片视图
            </el-button>
          </el-button-group>
        </div>
      </div>

      <!-- 表格视图 -->
      <el-table
        v-if="viewMode === 'table'"
        :data="paginatedTasks"
        v-loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="name" label="任务名称" min-width="200">
          <template #default="{ row }">
            <div class="task-name">
              <div class="name">{{ row.name }}</div>
              <div class="description">{{ row.description }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="group" label="任务分组" width="120">
          <template #default="{ row }">
            <el-tag :type="getGroupTagType(row.group)" size="small">
              {{ getGroupName(row.group) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="cron" label="Cron表达式" width="150">
          <template #default="{ row }">
            <code class="cron-expression">{{ row.cron }}</code>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastExecution" label="上次执行" width="200">
          <template #default="{ row }">
            <div v-if="row.lastExecution" class="execution-info">
              <el-tag
                :type="row.lastExecution.success ? 'success' : 'danger'"
                size="small"
                style="margin-right: 8px"
              >
                {{ row.lastExecution.success ? '成功' : '失败' }}
              </el-tag>
              <span>{{ formatDateTime(row.lastExecution.time) }}</span>
            </div>
            <span v-else class="text-gray">暂无记录</span>
          </template>
        </el-table-column>
        <el-table-column prop="nextExecution" label="下次执行" width="170">
          <template #default="{ row }">
            <span v-if="row.nextExecution && row.status === 'running'" class="datetime-text">
              {{ formatDateTime(row.nextExecution) }}
            </span>
            <span v-else class="text-gray">-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                v-if="row.status === 'running'"
                type="warning"
                size="small"
                @click="pauseTask(row)"
              >
                暂停
              </el-button>
              <el-button
                v-else
                type="success"
                size="small"
                @click="startTask(row)"
              >
                启动
              </el-button>
              <el-button size="small" @click="executeTask(row)">立即执行</el-button>
              <el-dropdown @command="(cmd) => handleMoreAction(cmd, row)">
                <el-button size="small">
                  更多<el-icon><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="edit" icon="Edit">编辑</el-dropdown-item>
                    <el-dropdown-item command="log" icon="Document">执行日志</el-dropdown-item>
                    <el-dropdown-item command="copy" icon="CopyDocument">复制</el-dropdown-item>
                    <el-dropdown-item command="delete" icon="Delete" divided>删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 卡片视图 -->
      <div v-else class="card-view">
        <el-row :gutter="20" v-loading="loading">
          <el-col :span="8" v-for="task in paginatedTasks" :key="task.id">
            <el-card class="task-card" shadow="hover">
              <div class="task-card-header">
                <div class="task-info">
                  <h4>{{ task.name }}</h4>
                  <p class="task-desc">{{ task.description }}</p>
                </div>
                <el-tag :type="getStatusTagType(task.status)" size="small">
                  {{ getStatusName(task.status) }}
                </el-tag>
              </div>

              <div class="task-card-content">
                <div class="task-detail">
                  <el-icon><Timer /></el-icon>
                  <span>{{ task.cron }}</span>
                </div>
                <div class="task-detail">
                  <el-icon><FolderOpened /></el-icon>
                  <span>{{ getGroupName(task.group) }}</span>
                </div>
                <div class="task-detail" v-if="task.lastExecution">
                  <el-icon><Clock /></el-icon>
                  <span>上次执行: {{ formatDateTime(task.lastExecution.time) }}</span>
                </div>
              </div>

              <div class="task-card-actions">
                <el-button
                  v-if="task.status === 'running'"
                  type="warning"
                  size="small"
                  @click="pauseTask(task)"
                >
                  暂停
                </el-button>
                <el-button
                  v-else
                  type="success"
                  size="small"
                  @click="startTask(task)"
                >
                  启动
                </el-button>
                <el-button size="small" @click="executeTask(task)">执行</el-button>
                <el-button size="small" @click="editTask(task)">编辑</el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredTasks.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </el-card>

    <!-- 新建/编辑任务对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingTask ? '编辑定时任务' : '新建定时任务'"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="taskFormRef"
        :model="taskForm"
        :rules="taskFormRules"
        label-width="120px"
      >
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="taskForm.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="任务描述" prop="description">
          <el-input
            v-model="taskForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入任务描述"
          />
        </el-form-item>
        <el-form-item label="任务分组" prop="group">
          <el-select v-model="taskForm.group" placeholder="请选择任务分组">
            <el-option label="数据同步" value="sync" />
            <el-option label="报表生成" value="report" />
            <el-option label="系统维护" value="maintenance" />
            <el-option label="通知推送" value="notification" />
          </el-select>
        </el-form-item>
        <el-form-item label="Cron表达式" prop="cron">
          <el-input v-model="taskForm.cron" placeholder="请输入Cron表达式，如：0 0 2 * * ?">
            <template #append>
              <el-button @click="showCronHelper = true">生成器</el-button>
            </template>
          </el-input>
          <div class="form-help">
            <span class="help-text">下次执行时间：</span>
            <span class="next-time">{{ getNextExecutionTime(taskForm.cron) }}</span>
          </div>
        </el-form-item>
        <el-form-item label="执行类名" prop="className">
          <el-input v-model="taskForm.className" placeholder="请输入Java类的完整路径" />
        </el-form-item>
        <el-form-item label="方法名称" prop="methodName">
          <el-input v-model="taskForm.methodName" placeholder="请输入要执行的方法名" />
        </el-form-item>
        <el-form-item label="方法参数">
          <el-input
            v-model="taskForm.params"
            type="textarea"
            :rows="2"
            placeholder="请输入方法参数，JSON格式"
          />
        </el-form-item>
        <el-form-item label="任务状态">
          <el-radio-group v-model="taskForm.status">
            <el-radio label="running">启用</el-radio>
            <el-radio label="stopped">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="saveTask" :loading="saving">
          {{ editingTask ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 执行日志对话框 -->
    <el-dialog
      v-model="showLogDialog"
      title="执行日志"
      width="1000px"
    >
      <div class="log-container">
        <div class="log-filters">
          <el-form :model="logFilter" :inline="true">
            <el-form-item label="执行状态">
              <el-select v-model="logFilter.status" clearable placeholder="全部" style="width: 120px">
                <el-option label="成功" value="success" />
                <el-option label="失败" value="error" />
              </el-select>
            </el-form-item>
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="logFilter.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="width: 240px"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="loadExecutionLogs">查询</el-button>
            </el-form-item>
            <el-form-item>
              <el-button type="danger" plain @click="clearExecutionLogs">
                <el-icon><Delete /></el-icon>
                清空日志
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-table :data="executionLogs" v-loading="logsLoading" max-height="400">
          <el-table-column prop="executionTime" label="执行时间" width="160">
            <template #default="{ row }">
              {{ formatDateTime(row.executionTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.success ? 'success' : 'danger'" size="small">
                {{ row.success ? '成功' : '失败' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="duration" label="执行时长" width="100">
            <template #default="{ row }">
              {{ row.duration }}ms
            </template>
          </el-table-column>
          <el-table-column prop="result" label="执行结果" show-overflow-tooltip>
            <template #default="{ row }">
              <span :class="{ 'error-text': !row.success }">
                {{ row.result }}
              </span>
            </template>
          </el-table-column>
        </el-table>

        <div class="log-pagination">
          <el-pagination
            v-model:current-page="logCurrentPage"
            v-model:page-size="logPageSize"
            :total="logTotal"
            layout="total, sizes, prev, pager, next"
            background
            small
          />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Timer, VideoPause, SuccessFilled, CircleCloseFilled, Plus, Refresh, Delete,
  Search, List, Grid, Postcard, ArrowDown, Edit, Document, CopyDocument,
  FolderOpened, Clock
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const logsLoading = ref(false)
const showCreateDialog = ref(false)
const showLogDialog = ref(false)
const showCronHelper = ref(false)
const editingTask = ref(null)
const viewMode = ref('table')

// 统计数据
const stats = reactive({
  running: 5,
  stopped: 3,
  success: 247,
  error: 12
})

// 筛选表单
const filterForm = reactive({
  name: '',
  status: '',
  group: ''
})

// 任务表单
const taskForm = reactive({
  name: '',
  description: '',
  group: '',
  cron: '',
  className: '',
  methodName: '',
  params: '',
  status: 'running'
})

// 表单验证规则
const taskFormRules = {
  name: [
    { required: true, message: '请输入任务名称', trigger: 'blur' }
  ],
  group: [
    { required: true, message: '请选择任务分组', trigger: 'change' }
  ],
  cron: [
    { required: true, message: '请输入Cron表达式', trigger: 'blur' }
  ],
  className: [
    { required: true, message: '请输入执行类名', trigger: 'blur' }
  ],
  methodName: [
    { required: true, message: '请输入方法名称', trigger: 'blur' }
  ]
}

// 日志筛选
const logFilter = reactive({
  status: '',
  dateRange: null
})

// 分页数据
const currentPage = ref(1)
const pageSize = ref(10)
const logCurrentPage = ref(1)
const logPageSize = ref(20)
const logTotal = ref(0)

// 任务列表数据
const tasks = ref([
  {
    id: 1,
    name: '用户数据同步',
    description: '定期同步用户信息到数据仓库',
    group: 'sync',
    cron: '0 0 2 * * ?',
    status: 'running',
    className: 'com.example.job.UserSyncJob',
    methodName: 'execute',
    params: '{"source": "crm", "target": "warehouse"}',
    lastExecution: {
      time: new Date(Date.now() - 3600000),
      success: true,
      duration: 2345
    },
    nextExecution: new Date(Date.now() + 3600000 * 24)
  },
  {
    id: 2,
    name: '销售报表生成',
    description: '每日生成销售统计报表',
    group: 'report',
    cron: '0 30 8 * * ?',
    status: 'running',
    className: 'com.example.job.SalesReportJob',
    methodName: 'generateDailyReport',
    params: '{}',
    lastExecution: {
      time: new Date(Date.now() - 7200000),
      success: true,
      duration: 5432
    },
    nextExecution: new Date(Date.now() + 3600000 * 16)
  },
  {
    id: 3,
    name: '系统日志清理',
    description: '清理30天前的系统日志',
    group: 'maintenance',
    cron: '0 0 1 * * ?',
    status: 'stopped',
    className: 'com.example.job.LogCleanupJob',
    methodName: 'cleanup',
    params: '{"days": 30}',
    lastExecution: {
      time: new Date(Date.now() - 86400000),
      success: false,
      duration: 1234
    },
    nextExecution: null
  }
])

// 执行日志数据
const executionLogs = ref([
  {
    executionTime: new Date(Date.now() - 3600000),
    success: true,
    duration: 2345,
    result: '同步用户数据成功，共处理1234条记录'
  },
  {
    executionTime: new Date(Date.now() - 7200000),
    success: true,
    duration: 5432,
    result: '生成销售报表成功，文件已保存到/reports/daily/20231201.xlsx'
  },
  {
    executionTime: new Date(Date.now() - 86400000),
    success: false,
    duration: 1234,
    result: '清理日志失败：磁盘空间不足'
  }
])

// 计算属性
const filteredTasks = computed(() => {
  return tasks.value.filter(task => {
    const matchName = !filterForm.name || task.name.includes(filterForm.name)
    const matchStatus = !filterForm.status || task.status === filterForm.status
    const matchGroup = !filterForm.group || task.group === filterForm.group
    return matchName && matchStatus && matchGroup
  })
})

const paginatedTasks = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredTasks.value.slice(start, end)
})

// 方法函数
const refreshTasks = () => {
  loading.value = true
  // 模拟API调用
  setTimeout(() => {
    ElMessage.success('刷新成功')
    loading.value = false
  }, 1000)
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleReset = () => {
  filterForm.name = ''
  filterForm.status = ''
  filterForm.group = ''
  currentPage.value = 1
}

const startTask = (task) => {
  ElMessageBox.confirm(`确定要启动任务"${task.name}"吗？`, '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    task.status = 'running'
    task.nextExecution = new Date(Date.now() + 3600000)
    ElMessage.success('任务启动成功')
  })
}

const pauseTask = (task) => {
  ElMessageBox.confirm(`确定要暂停任务"${task.name}"吗？`, '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    task.status = 'stopped'
    task.nextExecution = null
    ElMessage.success('任务暂停成功')
  })
}

const executeTask = (task) => {
  ElMessage.info(`正在执行任务"${task.name}"...`)
  // 模拟任务执行
  setTimeout(() => {
    task.lastExecution = {
      time: new Date(),
      success: Math.random() > 0.3,
      duration: Math.floor(Math.random() * 5000) + 1000
    }
    ElMessage.success('任务执行完成')
  }, 2000)
}

const editTask = (task) => {
  editingTask.value = task
  Object.assign(taskForm, task)
  showCreateDialog.value = true
}

const handleMoreAction = (command, task) => {
  switch (command) {
    case 'edit':
      editTask(task)
      break
    case 'log':
      showLogDialog.value = true
      loadExecutionLogs()
      break
    case 'copy':
      const newTask = { ...task, id: Date.now(), name: task.name + '(副本)' }
      tasks.value.push(newTask)
      ElMessage.success('任务复制成功')
      break
    case 'delete':
      ElMessageBox.confirm(`确定要删除任务"${task.name}"吗？`, '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = tasks.value.findIndex(t => t.id === task.id)
        if (index > -1) {
          tasks.value.splice(index, 1)
          ElMessage.success('任务删除成功')
        }
      })
      break
  }
}

const saveTask = () => {
  // 表单验证
  if (!taskForm.name || !taskForm.group || !taskForm.cron || !taskForm.className || !taskForm.methodName) {
    ElMessage.error('请填写必填项')
    return
  }

  saving.value = true

  setTimeout(() => {
    if (editingTask.value) {
      // 更新任务
      Object.assign(editingTask.value, taskForm)
      ElMessage.success('任务更新成功')
    } else {
      // 创建新任务
      const newTask = {
        ...taskForm,
        id: Date.now(),
        lastExecution: null,
        nextExecution: taskForm.status === 'running' ? new Date(Date.now() + 3600000) : null
      }
      tasks.value.push(newTask)
      ElMessage.success('任务创建成功')
    }

    showCreateDialog.value = false
    editingTask.value = null
    resetTaskForm()
    saving.value = false
  }, 1000)
}

const resetTaskForm = () => {
  Object.assign(taskForm, {
    name: '',
    description: '',
    group: '',
    cron: '',
    className: '',
    methodName: '',
    params: '',
    status: 'running'
  })
}

const loadExecutionLogs = () => {
  logsLoading.value = true
  // 模拟API调用
  setTimeout(() => {
    logTotal.value = executionLogs.value.length
    logsLoading.value = false
  }, 500)
}

// 清空执行日志
const clearExecutionLogs = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有执行日志吗？此操作不可恢复。', '确认清空', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })

    executionLogs.value = []
    logTotal.value = 0
    logCurrentPage.value = 1
    ElMessage.success('执行日志已清空')
  } catch {
    // 用户取消操作
  }
}

// 工具函数
const getGroupTagType = (group) => {
  const types = {
    sync: '',
    report: 'success',
    maintenance: 'warning',
    notification: 'info'
  }
  return types[group] || ''
}

const getGroupName = (group) => {
  const names = {
    sync: '数据同步',
    report: '报表生成',
    maintenance: '系统维护',
    notification: '通知推送'
  }
  return names[group] || group
}

const getStatusTagType = (status) => {
  const types = {
    running: 'success',
    stopped: 'info',
    disabled: 'danger'
  }
  return types[status] || ''
}

const getStatusName = (status) => {
  const names = {
    running: '运行中',
    stopped: '已停止',
    disabled: '已禁用'
  }
  return names[status] || status
}

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const getNextExecutionTime = (cron) => {
  if (!cron) return '请先输入Cron表达式'
  // 这里应该使用Cron解析库来计算下次执行时间
  // 现在只是示例
  return '2023-12-02 02:00:00'
}

// 页面初始化
onMounted(() => {
  // 初始化数据
})
</script>

<style scoped lang="scss">
.scheduled-tasks {
  .page-header {
    margin-bottom: 24px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title-section {
        h2 {
          margin: 0;
          font-size: 24px;
          color: #303133;
        }

        .subtitle {
          color: #606266;
          font-size: 14px;
          margin-top: 4px;
        }
      }

      .header-actions {
        display: flex;
        gap: 12px;
      }
    }
  }

  .stats-cards {
    margin-bottom: 24px;

    .stats-card {
      .stats-content {
        display: flex;
        align-items: center;
        gap: 16px;

        .stats-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;

          &.running {
            background: linear-gradient(135deg, #67C23A, #85CE61);
          }

          &.stopped {
            background: linear-gradient(135deg, #909399, #B1B3B8);
          }

          &.success {
            background: linear-gradient(135deg, #67C23A, #85CE61);
          }

          &.error {
            background: linear-gradient(135deg, #F56C6C, #F78989);
          }
        }

        .stats-info {
          .stats-number {
            font-size: 28px;
            font-weight: bold;
            color: #303133;
            line-height: 1;
          }

          .stats-label {
            font-size: 14px;
            color: #606266;
            margin-top: 4px;
          }
        }
      }
    }
  }

  .filter-card {
    margin-bottom: 24px;

    .filter-form {
      margin: 0;
    }
  }

  .table-card {
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .table-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 500;
        color: #303133;
      }
    }

    .task-name {
      .name {
        font-weight: 500;
        color: #303133;
      }

      .description {
        font-size: 12px;
        color: #909399;
        margin-top: 2px;
      }
    }

    .cron-expression {
      background: #f5f7fa;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 12px;
    }

    .text-gray {
      color: #909399;
    }

    .execution-info {
      display: flex;
      align-items: center;
      white-space: nowrap;
    }

    .datetime-text {
      white-space: nowrap;
      font-size: 12px;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .pagination-container {
      margin-top: 24px;
      display: flex;
      justify-content: flex-end;
    }
  }

  .card-view {
    .task-card {
      margin-bottom: 16px;

      .task-card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16px;

        .task-info {
          h4 {
            margin: 0 0 8px 0;
            font-size: 16px;
            color: #303133;
          }

          .task-desc {
            margin: 0;
            font-size: 14px;
            color: #606266;
          }
        }
      }

      .task-card-content {
        margin-bottom: 16px;

        .task-detail {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 14px;
          color: #606266;

          &:last-child {
            margin-bottom: 0;
          }
        }
      }

      .task-card-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
    }
  }

  .form-help {
    margin-top: 4px;
    font-size: 12px;
    color: #909399;

    .next-time {
      color: #409EFF;
      font-weight: 500;
    }
  }

  .log-container {
    .log-filters {
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid #EBEEF5;
    }

    .log-pagination {
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
    }

    .error-text {
      color: #F56C6C;
    }
  }
}
</style>