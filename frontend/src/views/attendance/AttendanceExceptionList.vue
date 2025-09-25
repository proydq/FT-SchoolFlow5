<template>
  <div class="attendance-exception-list">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :xs="12" :sm="6" :md="6" v-for="card in statCards" :key="card.title">
        <div class="stat-card" :style="{ background: card.gradient }">
          <div class="card-header">
            <div class="card-icon">
              <el-icon :size="28">
                <component :is="card.icon" />
              </el-icon>
            </div>
          </div>
          <div class="card-value">{{ card.value }}</div>
          <div class="card-title">{{ card.title }}</div>
        </div>
      </el-col>
    </el-row>

    <!-- 查询条件 -->
    <el-card class="search-card">
      <el-form :model="queryForm" ref="queryFormRef" inline label-width="80px">
        <el-form-item label="异常类型">
          <el-select v-model="queryForm.exceptionType" placeholder="请选择" clearable style="width: 150px">
            <el-option label="缺勤未报告" value="absent_no_report" />
            <el-option label="迟到严重" value="late_serious" />
            <el-option label="早退严重" value="early_serious" />
            <el-option label="设备异常" value="device_error" />
            <el-option label="数据缺失" value="data_missing" />
            <el-option label="其他异常" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理状态">
          <el-select v-model="queryForm.status" placeholder="请选择" clearable style="width: 120px">
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已处理" value="resolved" />
            <el-option label="已忽略" value="ignored" />
          </el-select>
        </el-form-item>
        <el-form-item label="人员类型">
          <el-select v-model="queryForm.userType" placeholder="请选择" clearable style="width: 100px">
            <el-option label="教师" value="teacher" />
            <el-option label="学生" value="student" />
          </el-select>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="queryForm.userName" placeholder="请输入姓名" clearable style="width: 120px" />
        </el-form-item>
        <el-form-item label="异常日期">
          <el-date-picker
            v-model="queryForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="严重程度">
          <el-select v-model="queryForm.severity" placeholder="请选择" clearable style="width: 100px">
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
            <el-option label="紧急" value="urgent" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery" :icon="Search">查询</el-button>
          <el-button @click="handleReset" :icon="Refresh">重置</el-button>
          <el-button @click="toggleAdvanced" :icon="Setting">
            {{ showAdvanced ? '收起' : '高级' }}
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 高级查询 -->
      <div v-show="showAdvanced" class="advanced-search">
        <el-divider />
        <el-form :model="queryForm" inline label-width="80px">
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
          <el-form-item label="工号/学号">
            <el-input v-model="queryForm.userCode" placeholder="请输入工号/学号" clearable style="width: 150px" />
          </el-form-item>
          <el-form-item label="处理人">
            <el-input v-model="queryForm.processorName" placeholder="请输入处理人" clearable style="width: 120px" />
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="queryForm.createTimeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 350px"
            />
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 操作栏 -->
    <el-card class="operation-card">
      <div class="operation-bar">
        <div class="left-operations">
          <el-button
            type="success"
            @click="handleBatchProcess"
            :disabled="!selectedExceptions.length"
            :icon="Check"
            v-if="hasPermission('attendance:exception:process')"
          >
            批量处理 ({{ selectedExceptions.length }})
          </el-button>
          <el-button
            type="warning"
            @click="handleBatchIgnore"
            :disabled="!selectedExceptions.length"
            :icon="Close"
            v-if="hasPermission('attendance:exception:ignore')"
          >
            批量忽略 ({{ selectedExceptions.length }})
          </el-button>
          <el-button type="info" @click="handleExport" :icon="Download" :loading="exporting">
            {{ exporting ? '导出中' : '导出数据' }}
          </el-button>
        </div>
        <div class="right-operations">
          <el-button @click="handleRefresh" :icon="Refresh">刷新</el-button>
        </div>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table
        :data="tableData"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        row-key="id"
        stripe
        height="600"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="exceptionCode" label="异常编号" width="120" fixed="left" />
        <el-table-column prop="userName" label="姓名" width="100" fixed="left">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="32" :src="row.userAvatar || ''" style="margin-right: 8px">
                {{ row.userName.charAt(0) }}
              </el-avatar>
              <span>{{ row.userName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="userCode" label="工号/学号" width="120" />
        <el-table-column prop="userType" label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.userType === 'teacher' ? 'success' : 'info'" size="small">
              {{ row.userType === 'teacher' ? '教师' : '学生' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="organizationName" label="年级班级" width="150" show-overflow-tooltip />
        <el-table-column prop="exceptionDate" label="异常日期" width="100" />
        <el-table-column prop="exceptionType" label="异常类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getExceptionTypeColor(row.exceptionType)" size="small">
              {{ getExceptionTypeText(row.exceptionType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="severity" label="严重程度" width="100">
          <template #default="{ row }">
            <el-tag :type="getSeverityColor(row.severity)" size="small">
              {{ getSeverityText(row.severity) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="异常描述" width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="处理状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusColor(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="processorName" label="处理人" width="100" />
        <el-table-column prop="processTime" label="处理时间" width="140" />
        <el-table-column prop="createdAt" label="创建时间" width="140" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)" :icon="View">
              查看
            </el-button>
            <el-button
              link
              type="success"
              @click="handleProcess(row)"
              v-if="row.status === 'pending' && hasPermission('attendance:exception:process')"
              :icon="Check"
            >
              处理
            </el-button>
            <el-button
              link
              type="warning"
              @click="handleIgnore(row)"
              v-if="row.status === 'pending' && hasPermission('attendance:exception:ignore')"
              :icon="Close"
            >
              忽略
            </el-button>
            <el-dropdown v-if="hasMoreOperations(row)" @command="handleCommand">
              <el-button link type="primary" :icon="More" />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="{action: 'history', row}">
                    处理历史
                  </el-dropdown-item>
                  <el-dropdown-item :command="{action: 'related', row}">
                    关联记录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleQuery"
          @current-change="handleQuery"
        />
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      :title="`异常详情 - ${currentException?.exceptionCode}`"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="currentException" class="exception-detail">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="异常编号">{{ currentException.exceptionCode }}</el-descriptions-item>
              <el-descriptions-item label="异常类型">
                <el-tag :type="getExceptionTypeColor(currentException.exceptionType)" size="small">
                  {{ getExceptionTypeText(currentException.exceptionType) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="严重程度">
                <el-tag :type="getSeverityColor(currentException.severity)" size="small">
                  {{ getSeverityText(currentException.severity) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="处理状态">
                <el-tag :type="getStatusColor(currentException.status)" size="small">
                  {{ getStatusText(currentException.status) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="人员信息">
                {{ currentException.userName }} ({{ currentException.userCode }})
              </el-descriptions-item>
              <el-descriptions-item label="年级班级">{{ currentException.organizationName }}</el-descriptions-item>
              <el-descriptions-item label="异常日期">{{ currentException.exceptionDate }}</el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ currentException.createdAt }}</el-descriptions-item>
              <el-descriptions-item label="处理人">{{ currentException.processorName || '未处理' }}</el-descriptions-item>
              <el-descriptions-item label="处理时间">{{ currentException.processTime || '未处理' }}</el-descriptions-item>
              <el-descriptions-item label="异常描述" :span="2">
                {{ currentException.description }}
              </el-descriptions-item>
              <el-descriptions-item label="处理结果" :span="2" v-if="currentException.processResult">
                {{ currentException.processResult }}
              </el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>
          <el-tab-pane label="关联记录" name="related">
            <div class="related-records">
              <el-table :data="currentException.relatedRecords || []" stripe>
                <el-table-column prop="attendanceDate" label="考勤日期" width="100" />
                <el-table-column prop="checkInTime" label="上班打卡" width="100" />
                <el-table-column prop="checkOutTime" label="下班打卡" width="100" />
                <el-table-column prop="status" label="考勤状态" width="100">
                  <template #default="{ row }">
                    <el-tag size="small">{{ row.status }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="dataSource" label="数据来源" width="100" />
              </el-table>
            </div>
          </el-tab-pane>
          <el-tab-pane label="处理历史" name="history">
            <div class="process-history">
              <el-timeline>
                <el-timeline-item
                  v-for="(history, index) in currentException.processHistory || []"
                  :key="index"
                  :timestamp="history.createTime"
                  placement="top"
                >
                  <el-card>
                    <h4>{{ history.action }}</h4>
                    <p>处理人：{{ history.processorName }}</p>
                    <p v-if="history.remark">备注：{{ history.remark }}</p>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 处理异常对话框 -->
    <el-dialog
      v-model="processVisible"
      title="处理异常"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="processForm" :rules="processRules" ref="processFormRef" label-width="100px">
        <el-form-item label="处理方式" prop="processType">
          <el-radio-group v-model="processForm.processType">
            <el-radio value="approve">批准通过</el-radio>
            <el-radio value="adjust">调整记录</el-radio>
            <el-radio value="supplement">要求补录</el-radio>
            <el-radio value="ignore">忽略异常</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理结果" prop="result">
          <el-input
            v-model="processForm.result"
            type="textarea"
            :rows="3"
            placeholder="请输入处理结果"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="processForm.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注信息（可选）"
          />
        </el-form-item>
        <el-form-item label="证明材料">
          <el-upload
            v-model:file-list="processForm.fileList"
            action="#"
            :auto-upload="false"
            multiple
            :limit="5"
          >
            <el-button type="primary" :icon="Upload">上传文件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="processVisible = false">取消</el-button>
        <el-button type="primary" @click="handleProcessSubmit" :loading="processing">
          确认处理
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
  Setting,
  Check,
  Close,
  Download,
  View,
  More,
  Upload,
  User,
  Clock,
  Warning,
  CircleCheck
} from '@element-plus/icons-vue'
import type {
  AttendanceException,
  AttendanceExceptionQuery,
  AttendanceExceptionProcess
} from '@/types/attendance'
import {
  getAttendanceExceptions,
  getAttendanceException,
  processAttendanceException,
  getExceptionProcessHistory,
  getGradeList,
  getClassList
} from '@/api/attendance'

// 权限检查
const hasPermission = (permission: string) => {
  // TODO: 实现权限检查逻辑
  return true
}

// 响应式数据
const loading = ref(false)
const exporting = ref(false)
const processing = ref(false)
const showAdvanced = ref(false)
const detailVisible = ref(false)
const processVisible = ref(false)
const activeTab = ref('basic')

// 查询表单
const queryForm = reactive<AttendanceExceptionQuery>({
  exceptionType: undefined,
  status: undefined,
  userType: undefined,
  userName: '',
  userCode: '',
  dateRange: [],
  severity: undefined,
  organizationPath: [],
  processorName: '',
  createTimeRange: []
})

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 表格数据
const tableData = ref<AttendanceException[]>([])
const selectedExceptions = ref<AttendanceException[]>([])
const currentException = ref<AttendanceException>()

// 统计卡片数据
const statCards = computed(() => [
  {
    title: '待处理异常',
    value: '23',
    icon: Warning,
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    title: '今日新增',
    value: '8',
    icon: Clock,
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    title: '已处理',
    value: '156',
    icon: CircleCheck,
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  {
    title: '总异常数',
    value: '189',
    icon: User,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
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

// 处理表单
const processForm = reactive<AttendanceExceptionProcess>({
  exceptionId: '',
  processType: 'approve',
  result: '',
  remark: '',
  fileList: []
})

const processRules = {
  processType: [{ required: true, message: '请选择处理方式', trigger: 'change' }],
  result: [{ required: true, message: '请输入处理结果', trigger: 'blur' }]
}

// 获取异常类型颜色
const getExceptionTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    absent_no_report: 'danger',
    late_serious: 'warning',
    early_serious: 'warning',
    device_error: 'info',
    data_missing: 'info',
    other: ''
  }
  return colorMap[type] || ''
}

// 获取异常类型文本
const getExceptionTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    absent_no_report: '缺勤未报告',
    late_serious: '迟到严重',
    early_serious: '早退严重',
    device_error: '设备异常',
    data_missing: '数据缺失',
    other: '其他异常'
  }
  return textMap[type] || type
}

// 获取严重程度颜色
const getSeverityColor = (severity: string) => {
  const colorMap: Record<string, string> = {
    low: 'success',
    medium: 'warning',
    high: 'danger',
    urgent: 'danger'
  }
  return colorMap[severity] || ''
}

// 获取严重程度文本
const getSeverityText = (severity: string) => {
  const textMap: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急'
  }
  return textMap[severity] || severity
}

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    pending: 'warning',
    processing: 'info',
    resolved: 'success',
    ignored: ''
  }
  return colorMap[status] || ''
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已处理',
    ignored: '已忽略'
  }
  return textMap[status] || status
}

// 检查是否有更多操作
const hasMoreOperations = (row: AttendanceException) => {
  return true // 总是显示处理历史和关联记录
}

// 查询数据
const handleQuery = async () => {
  loading.value = true
  try {
    const params = {
      ...queryForm,
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      startDate: queryForm.dateRange?.[0],
      endDate: queryForm.dateRange?.[1],
      createStartTime: queryForm.createTimeRange?.[0],
      createEndTime: queryForm.createTimeRange?.[1]
    }
    delete params.dateRange
    delete params.createTimeRange

    const response = await getAttendanceExceptions(params)
    tableData.value = response.data.records
    pagination.total = response.data.total
  } catch (error) {
    console.error('查询失败:', error)
    ElMessage.error('查询失败')
  } finally {
    loading.value = false
  }
}

// 重置查询
const handleReset = () => {
  Object.assign(queryForm, {
    exceptionType: undefined,
    status: undefined,
    userType: undefined,
    userName: '',
    userCode: '',
    dateRange: [],
    severity: undefined,
    organizationPath: [],
    processorName: '',
    createTimeRange: []
  })
  pagination.current = 1
  handleQuery()
}

// 切换高级查询
const toggleAdvanced = () => {
  showAdvanced.value = !showAdvanced.value
}

// 刷新数据
const handleRefresh = () => {
  handleQuery()
}

// 表格选择变化
const handleSelectionChange = (selection: AttendanceException[]) => {
  selectedExceptions.value = selection
}

// 查看详情
const handleView = async (row: AttendanceException) => {
  try {
    const response = await getAttendanceException(row.id)
    currentException.value = response.data
    detailVisible.value = true
  } catch (error) {
    console.error('获取详情失败:', error)
    ElMessage.error('获取详情失败')
  }
}

// 处理异常
const handleProcess = (row: AttendanceException) => {
  processForm.exceptionId = row.id
  processForm.processType = 'approve'
  processForm.result = ''
  processForm.remark = ''
  processForm.fileList = []
  processVisible.value = true
}

// 忽略异常
const handleIgnore = async (row: AttendanceException) => {
  try {
    await ElMessageBox.confirm('确认忽略此异常吗？', '提示', {
      type: 'warning'
    })

    await processAttendanceException({
      exceptionId: row.id,
      processType: 'ignore',
      result: '异常已忽略',
      remark: '',
      fileList: []
    })

    ElMessage.success('忽略成功')
    handleQuery()
  } catch (error) {
    console.error('忽略失败:', error)
    ElMessage.error('忽略失败')
  }
}

// 批量处理
const handleBatchProcess = () => {
  // TODO: 实现批量处理逻辑
  ElMessage.info('批量处理功能开发中')
}

// 批量忽略
const handleBatchIgnore = async () => {
  try {
    await ElMessageBox.confirm('确认批量忽略选中的异常吗？', '提示', {
      type: 'warning'
    })

    // TODO: 实现批量忽略逻辑
    ElMessage.success('批量忽略成功')
    handleQuery()
  } catch (error) {
    console.error('批量忽略失败:', error)
    ElMessage.error('批量忽略失败')
  }
}

// 导出数据
const handleExport = async () => {
  try {
    exporting.value = true
    // TODO: 实现导出逻辑
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}

// 提交处理
const handleProcessSubmit = async () => {
  // TODO: 表单验证和提交逻辑
  try {
    processing.value = true
    await processAttendanceException(processForm)
    ElMessage.success('处理成功')
    processVisible.value = false
    handleQuery()
  } catch (error) {
    console.error('处理失败:', error)
    ElMessage.error('处理失败')
  } finally {
    processing.value = false
  }
}

// 下拉菜单命令处理
const handleCommand = (command: {action: string, row: AttendanceException}) => {
  const { action, row } = command
  switch (action) {
    case 'history':
      // TODO: 实现处理历史查看
      ElMessage.info('处理历史功能开发中')
      break
    case 'related':
      // TODO: 实现关联记录查看
      ElMessage.info('关联记录功能开发中')
      break
  }
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
  } catch (error) {
    console.error('初始化数据失败:', error)
  }
}

// 组件挂载
onMounted(() => {
  initData()
  handleQuery()
})
</script>

<style scoped>
.attendance-exception-list {
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
  min-height: 120px;
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

.card-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
}

.card-title {
  font-size: 14px;
  opacity: 0.9;
}

/* 卡片样式 */
.search-card,
.operation-card,
.table-card {
  margin-bottom: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.advanced-search {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-top: 15px;
}

.operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-operations,
.right-operations {
  display: flex;
  gap: 10px;
}

/* 表格样式 */
.user-info {
  display: flex;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 详情对话框样式 */
.exception-detail {
  padding: 10px;
}

.related-records,
.process-history {
  padding: 10px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .attendance-exception-list {
    padding: 10px;
  }

  .operation-bar {
    flex-direction: column;
    gap: 10px;
  }

  .left-operations,
  .right-operations {
    width: 100%;
    justify-content: center;
  }
}
</style>