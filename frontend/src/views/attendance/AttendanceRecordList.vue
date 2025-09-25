<template>
  <div class="attendance-record-list">
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
        <el-form-item label="人员类型">
          <el-select v-model="queryForm.userType" placeholder="请选择" clearable style="width: 120px">
            <el-option label="教师" value="teacher" />
            <el-option label="学生" value="student" />
          </el-select>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="queryForm.userName" placeholder="请输入姓名" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="工号/学号">
          <el-input v-model="queryForm.userCode" placeholder="请输入工号/学号" clearable style="width: 150px" />
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
        <el-form-item label="考勤日期">
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
        <el-form-item label="考勤状态">
          <el-select v-model="queryForm.status" placeholder="请选择" clearable style="width: 120px">
            <el-option label="正常" value="normal" />
            <el-option label="迟到" value="late" />
            <el-option label="早退" value="early_leave" />
            <el-option label="缺勤" value="absent" />
            <el-option label="请假" value="leave" />
            <el-option label="异常" value="exception" />
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
          <el-form-item label="考勤规则">
            <el-select v-model="queryForm.ruleId" placeholder="请选择" clearable style="width: 200px">
              <el-option
                v-for="rule in attendanceRules"
                :key="rule.id"
                :label="rule.name"
                :value="rule.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="数据来源">
            <el-select v-model="queryForm.dataSource" placeholder="请选择" clearable style="width: 120px">
              <el-option label="设备打卡" value="device" />
              <el-option label="手动补录" value="manual" />
              <el-option label="系统导入" value="import" />
            </el-select>
          </el-form-item>
          <el-form-item label="是否异常">
            <el-select v-model="queryForm.hasException" placeholder="请选择" clearable style="width: 100px">
              <el-option label="是" :value="true" />
              <el-option label="否" :value="false" />
            </el-select>
          </el-form-item>
          <el-form-item label="设备编号">
            <el-input v-model="queryForm.deviceCode" placeholder="请输入设备编号" clearable style="width: 150px" />
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 操作栏 -->
    <el-card class="operation-card">
      <div class="operation-bar">
        <div class="left-operations">
          <el-button type="primary" @click="handleManualRecord" :icon="Plus" v-if="hasPermission('attendance:record:add')">
            手动补录
          </el-button>
          <el-button type="warning" @click="handleSyncDevice" :icon="Refresh" :loading="syncing">
            {{ syncing ? '同步中' : '同步设备' }}
          </el-button>
          <el-button
            type="danger"
            @click="handleMarkException"
            :disabled="!selectedRecords.length"
            :icon="Warning"
            v-if="hasPermission('attendance:record:exception')"
          >
            标记异常 ({{ selectedRecords.length }})
          </el-button>
        </div>
        <div class="right-operations">
          <el-button @click="handleExport" :icon="Download" :loading="exporting">
            {{ exporting ? '导出中' : '导出数据' }}
          </el-button>
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
        <el-table-column prop="attendanceDate" label="考勤日期" width="100" />
        <el-table-column prop="ruleName" label="考勤规则" width="150" show-overflow-tooltip />
        <el-table-column label="上班打卡" width="100">
          <template #default="{ row }">
            <span v-if="row.checkInTime" :class="getTimeClass(row.checkInStatus)">
              {{ row.checkInTime }}
            </span>
            <span v-else class="text-gray">--</span>
          </template>
        </el-table-column>
        <el-table-column label="下班打卡" width="100">
          <template #default="{ row }">
            <span v-if="row.checkOutTime" :class="getTimeClass(row.checkOutStatus)">
              {{ row.checkOutTime }}
            </span>
            <span v-else class="text-gray">--</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="考勤状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="workHours" label="工作时长" width="100">
          <template #default="{ row }">
            <span v-if="row.workHours">{{ row.workHours }}小时</span>
            <span v-else class="text-gray">--</span>
          </template>
        </el-table-column>
        <el-table-column prop="dataSource" label="数据来源" width="100">
          <template #default="{ row }">
            <el-tag
              :type="row.dataSource === 'device' ? 'success' : row.dataSource === 'manual' ? 'warning' : 'info'"
              size="small"
            >
              {{ getDataSourceText(row.dataSource) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="hasException" label="是否异常" width="100">
          <template #default="{ row }">
            <el-tag :type="row.hasException ? 'danger' : 'success'" size="small">
              {{ row.hasException ? '异常' : '正常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="deviceCode" label="设备编号" width="120" show-overflow-tooltip />
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <div class="operation-buttons">
              <el-button link type="primary" size="small" @click="handleView(row)" :icon="View">
                查看
              </el-button>
              <el-button
                link
                type="warning"
                size="small"
                @click="handleEdit(row)"
                :icon="Edit"
                v-if="hasPermission('attendance:record:edit')"
              >
                编辑
              </el-button>
              <el-button
                link
                type="danger"
                size="small"
                @click="handleMarkSingleException(row)"
                v-if="!row.hasException && hasPermission('attendance:record:exception')"
              >
                标记异常
              </el-button>
              <el-dropdown v-if="hasMoreOperations(row)" @command="handleCommand">
                <el-button link type="primary" size="small" :icon="More" />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="{action: 'supplement', row}" v-if="canSupplement(row)">
                      申请补录
                    </el-dropdown-item>
                    <el-dropdown-item :command="{action: 'history', row}">
                      操作历史
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
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
      :title="`考勤记录详情 - ${currentRecord?.userName}`"
      width="700px"
      :close-on-click-modal="false"
    >
      <div v-if="currentRecord" class="record-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="姓名">{{ currentRecord.userName }}</el-descriptions-item>
          <el-descriptions-item label="工号/学号">{{ currentRecord.userCode }}</el-descriptions-item>
          <el-descriptions-item label="人员类型">
            <el-tag :type="currentRecord.userType === 'teacher' ? 'success' : 'info'" size="small">
              {{ currentRecord.userType === 'teacher' ? '教师' : '学生' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="年级班级">{{ currentRecord.organizationName }}</el-descriptions-item>
          <el-descriptions-item label="考勤日期">{{ currentRecord.attendanceDate }}</el-descriptions-item>
          <el-descriptions-item label="考勤规则">{{ currentRecord.ruleName }}</el-descriptions-item>
          <el-descriptions-item label="上班打卡">
            <span v-if="currentRecord.checkInTime" :class="getTimeClass(currentRecord.checkInStatus)">
              {{ currentRecord.checkInTime }}
            </span>
            <span v-else>未打卡</span>
          </el-descriptions-item>
          <el-descriptions-item label="下班打卡">
            <span v-if="currentRecord.checkOutTime" :class="getTimeClass(currentRecord.checkOutStatus)">
              {{ currentRecord.checkOutTime }}
            </span>
            <span v-else>未打卡</span>
          </el-descriptions-item>
          <el-descriptions-item label="考勤状态">
            <el-tag :type="getStatusType(currentRecord.status)" size="small">
              {{ getStatusText(currentRecord.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="工作时长">
            {{ currentRecord.workHours ? currentRecord.workHours + '小时' : '--' }}
          </el-descriptions-item>
          <el-descriptions-item label="数据来源">
            <el-tag
              :type="currentRecord.dataSource === 'device' ? 'success' : currentRecord.dataSource === 'manual' ? 'warning' : 'info'"
              size="small"
            >
              {{ getDataSourceText(currentRecord.dataSource) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="设备编号">{{ currentRecord.deviceCode || '--' }}</el-descriptions-item>
          <el-descriptions-item label="是否异常">
            <el-tag :type="currentRecord.hasException ? 'danger' : 'success'" size="small">
              {{ currentRecord.hasException ? '异常' : '正常' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentRecord.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="更新时间" v-if="currentRecord.updatedAt">
            {{ currentRecord.updatedAt }}
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2" v-if="currentRecord.remark">
            {{ currentRecord.remark }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 手动补录对话框 -->
    <el-dialog
      v-model="manualRecordVisible"
      title="手动补录考勤记录"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="manualRecordForm" :rules="manualRecordRules" ref="manualRecordFormRef" label-width="100px">
        <el-form-item label="人员选择" prop="userId">
          <el-select
            v-model="manualRecordForm.userId"
            filterable
            remote
            placeholder="请输入姓名或工号搜索"
            :remote-method="searchUserList"
            :loading="searchLoading"
            style="width: 100%"
          >
            <el-option
              v-for="user in userOptions"
              :key="user.id"
              :label="`${user.name} (${user.code})`"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="考勤日期" prop="attendanceDate">
          <el-date-picker
            v-model="manualRecordForm.attendanceDate"
            type="date"
            placeholder="请选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="上班打卡" prop="checkInTime">
          <el-time-picker
            v-model="manualRecordForm.checkInTime"
            placeholder="请选择时间"
            format="HH:mm:ss"
            value-format="HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="下班打卡" prop="checkOutTime">
          <el-time-picker
            v-model="manualRecordForm.checkOutTime"
            placeholder="请选择时间"
            format="HH:mm:ss"
            value-format="HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="补录原因" prop="reason">
          <el-input
            v-model="manualRecordForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入补录原因"
          />
        </el-form-item>
        <el-form-item label="证明材料">
          <el-upload
            v-model:file-list="manualRecordForm.fileList"
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
        <el-button @click="manualRecordVisible = false">取消</el-button>
        <el-button type="primary" @click="handleManualRecordSubmit" :loading="submitting">
          确认补录
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
  Plus,
  Warning,
  Download,
  View,
  Edit,
  More,
  Upload,
  User,
  Clock,
  Check,
  WarningFilled
} from '@element-plus/icons-vue'
import type {
  AttendanceRecord,
  AttendanceRecordQuery,
  ManualCheckRecord
} from '@/types/attendance'
import {
  getAttendanceRecords,
  getAttendanceRecord,
  manualCheckRecord,
  syncDeviceRecords,
  exportAttendanceRecords,
  markRecordsAsException,
  updateAttendanceRecord,
  searchUsers,
  getAttendanceRules,
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
const syncing = ref(false)
const exporting = ref(false)
const submitting = ref(false)
const searchLoading = ref(false)
const showAdvanced = ref(false)
const detailVisible = ref(false)
const manualRecordVisible = ref(false)

// 查询表单
const queryForm = reactive<AttendanceRecordQuery>({
  userType: undefined,
  userName: '',
  userCode: '',
  organizationPath: [],
  dateRange: [],
  status: undefined,
  ruleId: undefined,
  dataSource: undefined,
  hasException: undefined,
  deviceCode: ''
})

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 表格数据
const tableData = ref<AttendanceRecord[]>([])
const selectedRecords = ref<AttendanceRecord[]>([])
const currentRecord = ref<AttendanceRecord>()

// 统计卡片数据
const statCards = computed(() => [
  {
    title: '总考勤数',
    value: '1,234',
    icon: User,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    title: '正常出勤',
    value: '1,089',
    icon: Check,
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    title: '异常记录',
    value: '89',
    icon: WarningFilled,
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    title: '今日打卡',
    value: '456',
    icon: Clock,
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  }
])

// 选项数据
const attendanceRules = ref([])
const organizationOptions = ref([])
const userOptions = ref([])

// 级联选择器配置
const cascaderProps = {
  value: 'id',
  label: 'name',
  children: 'children'
}

// 手动补录表单
const manualRecordForm = reactive<ManualCheckRecord>({
  userId: '',
  attendanceDate: '',
  checkInTime: '',
  checkOutTime: '',
  reason: '',
  fileList: []
})

const manualRecordRules = {
  userId: [{ required: true, message: '请选择人员', trigger: 'change' }],
  attendanceDate: [{ required: true, message: '请选择日期', trigger: 'change' }],
  reason: [{ required: true, message: '请输入补录原因', trigger: 'blur' }]
}

// 获取时间状态样式
const getTimeClass = (status?: string) => {
  switch (status) {
    case 'normal':
      return 'text-success'
    case 'late':
    case 'early':
      return 'text-warning'
    default:
      return ''
  }
}

// 获取状态类型
const getStatusType = (status: string) => {
  switch (status) {
    case 'normal':
      return 'success'
    case 'late':
    case 'early_leave':
      return 'warning'
    case 'absent':
    case 'exception':
      return 'danger'
    case 'leave':
      return 'info'
    default:
      return ''
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    normal: '正常',
    late: '迟到',
    early_leave: '早退',
    absent: '缺勤',
    leave: '请假',
    exception: '异常'
  }
  return statusMap[status] || status
}

// 获取数据来源文本
const getDataSourceText = (source: string) => {
  const sourceMap: Record<string, string> = {
    device: '设备打卡',
    manual: '手动补录',
    import: '系统导入'
  }
  return sourceMap[source] || source
}

// 检查是否有更多操作
const hasMoreOperations = (row: AttendanceRecord) => {
  return canSupplement(row) || true // 总是显示操作历史
}

// 检查是否可以补录
const canSupplement = (row: AttendanceRecord) => {
  return !row.checkInTime || !row.checkOutTime
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
      endDate: queryForm.dateRange?.[1]
    }
    delete params.dateRange

    const response = await getAttendanceRecords(params)
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
    userType: undefined,
    userName: '',
    userCode: '',
    organizationPath: [],
    dateRange: [],
    status: undefined,
    ruleId: undefined,
    dataSource: undefined,
    hasException: undefined,
    deviceCode: ''
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
const handleSelectionChange = (selection: AttendanceRecord[]) => {
  selectedRecords.value = selection
}

// 查看详情
const handleView = async (row: AttendanceRecord) => {
  try {
    const response = await getAttendanceRecord(row.id)
    currentRecord.value = response.data
    detailVisible.value = true
  } catch (error) {
    console.error('获取详情失败:', error)
    ElMessage.error('获取详情失败')
  }
}

// 编辑记录
const handleEdit = (row: AttendanceRecord) => {
  // TODO: 实现编辑功能
  ElMessage.info('编辑功能开发中')
}

// 手动补录
const handleManualRecord = () => {
  manualRecordVisible.value = true
}

// 提交手动补录
const handleManualRecordSubmit = async () => {
  // TODO: 表单验证和提交逻辑
  ElMessage.success('补录成功')
  manualRecordVisible.value = false
  handleQuery()
}

// 同步设备数据
const handleSyncDevice = async () => {
  try {
    syncing.value = true
    await syncDeviceRecords()
    ElMessage.success('同步成功')
    handleQuery()
  } catch (error) {
    console.error('同步失败:', error)
    ElMessage.error('同步失败')
  } finally {
    syncing.value = false
  }
}

// 标记异常
const handleMarkException = async () => {
  try {
    await ElMessageBox.confirm('确认将选中的记录标记为异常吗？', '提示', {
      type: 'warning'
    })

    await markRecordsAsException({
      ids: selectedRecords.value.map(r => r.id),
      operation: 'mark_exception'
    })

    ElMessage.success('标记成功')
    handleQuery()
  } catch (error) {
    console.error('标记失败:', error)
    ElMessage.error('标记失败')
  }
}

// 标记单个异常
const handleMarkSingleException = async (row: AttendanceRecord) => {
  try {
    await ElMessageBox.confirm('确认将此记录标记为异常吗？', '提示', {
      type: 'warning'
    })

    await markRecordsAsException({
      ids: [row.id],
      operation: 'mark_exception'
    })

    ElMessage.success('标记成功')
    handleQuery()
  } catch (error) {
    console.error('标记失败:', error)
    ElMessage.error('标记失败')
  }
}

// 导出数据
const handleExport = async () => {
  try {
    exporting.value = true
    await exportAttendanceRecords({
      ids: selectedRecords.value.map(r => r.id),
      operation: 'export'
    })
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}

// 下拉菜单命令处理
const handleCommand = (command: {action: string, row: AttendanceRecord}) => {
  const { action, row } = command
  switch (action) {
    case 'supplement':
      // TODO: 实现补录申请
      ElMessage.info('补录申请功能开发中')
      break
    case 'history':
      // TODO: 实现操作历史
      ElMessage.info('操作历史功能开发中')
      break
  }
}

// 搜索用户
const searchUserList = async (query: string) => {
  if (!query) {
    userOptions.value = []
    return
  }

  try {
    searchLoading.value = true
    const response = await searchUsers({
      userType: 'teacher', // 可以根据需要动态设置
      keyword: query
    })
    userOptions.value = response.data
  } catch (error) {
    console.error('搜索用户失败:', error)
  } finally {
    searchLoading.value = false
  }
}

// 初始化数据
const initData = async () => {
  try {
    // 获取考勤规则
    const rulesResponse = await getAttendanceRules({ pageNum: 1, pageSize: 100 })
    attendanceRules.value = rulesResponse.data.records

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
.attendance-record-list {
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

/* 操作按钮样式 */
.operation-buttons {
  display: flex;
  gap: 4px;
  align-items: center;
  white-space: nowrap;
}

.operation-buttons .el-button {
  margin-left: 0 !important;
}

.operation-buttons .el-button + .el-button {
  margin-left: 4px !important;
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

.text-success {
  color: #67c23a;
}

.text-warning {
  color: #e6a23c;
}

.text-gray {
  color: #909399;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 详情对话框样式 */
.record-detail {
  padding: 10px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .attendance-record-list {
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