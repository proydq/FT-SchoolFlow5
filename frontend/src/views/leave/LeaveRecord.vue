<template>
  <div class="leave-record-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>请假记录</h2>
      <p class="page-description">查询和统计请假申请记录，支持多条件筛选和数据导出</p>
    </div>

    <!-- 统计卡片区域 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :xs="24" :sm="12" :md="6" v-for="card in statCards" :key="card.title">
        <div
          class="stat-card"
          :style="{ background: card.gradient }"
        >
          <div class="card-header">
            <div class="card-icon">
              <el-icon :size="28">
                <component :is="card.icon" />
              </el-icon>
            </div>
            <el-tag v-if="card.trend" :type="card.trendType" size="small" effect="dark">
              {{ card.trend }}
            </el-tag>
          </div>
          <div class="card-value">{{ card.value }}</div>
          <div class="card-title">{{ card.title }}</div>
          <div class="card-footer">
            <span class="label">{{ card.label }}</span>
            <span class="percentage">{{ card.percentage }}</span>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 筛选卡片 -->
    <el-card class="filter-card">
      <div class="filter-row">
        <div class="filter-left">
          <el-select
            v-model="filterForm.applicantType"
            placeholder="申请人类型"
            style="width: 120px"
            @change="handleSearch"
          >
            <el-option label="全部" value="" />
            <el-option label="学生" value="student" />
            <el-option label="教师" value="teacher" />
          </el-select>

          <el-select
            v-model="filterForm.leaveTypeId"
            placeholder="请假类型"
            style="width: 120px"
            @change="handleSearch"
          >
            <el-option label="全部" value="" />
            <el-option label="病假" value="LT001" />
            <el-option label="事假" value="LT002" />
            <el-option label="丧假" value="LT003" />
            <el-option label="短时请假" value="LT005" />
          </el-select>

          <el-select
            v-model="filterForm.status"
            placeholder="状态"
            style="width: 120px"
            @change="handleSearch"
          >
            <el-option label="全部" value="" />
            <el-option label="待审批" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
            <el-option label="已撤回" value="withdrawn" />
          </el-select>

          <el-input
            v-model="filterForm.applicantName"
            placeholder="申请人姓名"
            style="width: 140px"
            clearable
            @keyup.enter="handleSearch"
          />

          <el-date-picker
            v-model="filterForm.applicationDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
            @change="handleSearch"
          />
        </div>

        <div class="filter-right">
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="text" @click="showAdvancedFilter = !showAdvancedFilter">
            {{ showAdvancedFilter ? '收起' : '高级筛选' }}
          </el-button>
        </div>
      </div>

      <!-- 高级筛选 -->
      <div v-if="showAdvancedFilter" class="advanced-filter">
        <el-form :model="filterForm" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="请假时长范围">
                <el-slider
                  v-model="filterForm.durationRange"
                  range
                  :min="0"
                  :max="30"
                  :step="1"
                  show-stops
                  style="width: 200px"
                />
                <span style="margin-left: 15px; font-size: 12px; color: #606266;">
                  {{ filterForm.durationRange[0] }} - {{ filterForm.durationRange[1] }} 天
                </span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="部门/年级">
                <el-select v-model="filterForm.organizationId" placeholder="请选择" style="width: 200px">
                  <el-option label="全部" value="" />
                  <el-option label="高一年级" value="grade_1" />
                  <el-option label="高二年级" value="grade_2" />
                  <el-option label="高三年级" value="grade_3" />
                  <el-option label="教务处" value="dept_1" />
                  <el-option label="学生处" value="dept_2" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </el-card>

    <!-- 操作按钮区 -->
    <div class="action-bar">
      <el-button type="warning" @click="handleExportAll">导出全部</el-button>
      <el-button
        type="success"
        :disabled="selectedRows.length === 0"
        @click="handleBatchExport"
      >
        批量导出
      </el-button>
      <el-button
        type="danger"
        :disabled="selectedRows.length === 0"
        @click="handleBatchWithdraw"
      >
        批量撤回
      </el-button>
    </div>

    <!-- 数据表格 -->
    <el-card>
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />

        <el-table-column prop="applicationId" label="申请编号" width="140">
          <template #default="{ row }">
            <el-link type="primary" @click="handleViewDetail(row)">
              {{ row.applicationId }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column prop="applicantName" label="申请人" width="100" />

        <el-table-column prop="applicantType" label="类型" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.applicantType === 'teacher' ? 'primary' : 'success'" size="small">
              {{ row.applicantType === 'teacher' ? '教师' : '学生' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="leaveTypeName" label="请假类型" width="120" />

        <el-table-column prop="reason" label="请假事由" min-width="150" show-overflow-tooltip />

        <el-table-column prop="duration" label="请假时长" width="120" align="center">
          <template #default="{ row }">
            {{ row.duration }}{{ row.durationUnit === 'day' ? '天' : '小时' }}
          </template>
        </el-table-column>

        <el-table-column prop="leaveTime" label="请假时间" width="200">
          <template #default="{ row }">
            <div class="time-range">
              <div>{{ formatDate(row.startTime) }}</div>
              <div>{{ formatDate(row.endTime) }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="applicationTime" label="申请时间" width="140">
          <template #default="{ row }">
            {{ formatDateTime(row.applicationTime) }}
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="approvalTime" label="审批时间" width="140">
          <template #default="{ row }">
            {{ row.approvalTime ? formatDateTime(row.approvalTime) : '-' }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleViewDetail(row)">
              查看
            </el-button>
            <el-button link type="info" size="small" @click="handleViewHistory(row)">
              历史
            </el-button>
            <el-button
              v-if="row.status === 'pending' && row.applicantId === currentUserId"
              link
              type="warning"
              size="small"
              @click="handleWithdraw(row)"
            >
              撤回
            </el-button>
            <el-button link type="success" size="small" @click="handleExportSingle(row)">
              导出
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 申请详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="申请详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="currentApplication" class="application-detail">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h4>基本信息</h4>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="detail-item">
                <label>申请编号：</label>
                <span>{{ currentApplication.applicationId }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <label>申请人：</label>
                <span>{{ currentApplication.applicantName }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <label>申请类型：</label>
                <el-tag :type="currentApplication.applicantType === 'teacher' ? 'primary' : 'success'">
                  {{ currentApplication.applicantType === 'teacher' ? '教师' : '学生' }}
                </el-tag>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 请假信息 -->
        <div class="detail-section">
          <h4>请假信息</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="detail-item">
                <label>请假类型：</label>
                <span>{{ currentApplication.leaveTypeName }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="detail-item">
                <label>请假时长：</label>
                <span>{{ currentApplication.duration }}{{ currentApplication.durationUnit === 'day' ? '天' : '小时' }}</span>
              </div>
            </el-col>
            <el-col :span="24">
              <div class="detail-item">
                <label>请假事由：</label>
                <span>{{ currentApplication.reason }}</span>
              </div>
            </el-col>
            <el-col :span="24" v-if="currentApplication.description">
              <div class="detail-item">
                <label>详细说明：</label>
                <p class="description">{{ currentApplication.description }}</p>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 状态信息 -->
        <div class="detail-section">
          <h4>状态信息</h4>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="detail-item">
                <label>当前状态：</label>
                <el-tag :type="getStatusTagType(currentApplication.status)">
                  {{ getStatusText(currentApplication.status) }}
                </el-tag>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <label>申请时间：</label>
                <span>{{ formatDateTime(currentApplication.applicationTime) }}</span>
              </div>
            </el-col>
            <el-col :span="8" v-if="currentApplication.approvalTime">
              <div class="detail-item">
                <label>审批时间：</label>
                <span>{{ formatDateTime(currentApplication.approvalTime) }}</span>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button
            v-if="currentApplication?.status === 'pending' && currentApplication.applicantId === currentUserId"
            type="warning"
            @click="handleWithdraw(currentApplication)"
          >
            撤回申请
          </el-button>
          <el-button type="success" @click="handleExportSingle(currentApplication!)">
            导出记录
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 审批历史弹窗 -->
    <el-dialog v-model="historyDialogVisible" title="审批历史" width="600px">
      <div v-loading="historyLoading">
        <el-timeline v-if="approvalHistory.length > 0">
          <el-timeline-item
            v-for="record in approvalHistory"
            :key="record.id"
            :type="getTimelineType(record.result)"
            :timestamp="formatDateTime(record.approvalTime)"
            placement="top"
          >
            <div class="history-item">
              <div class="history-header">
                <span class="approver">{{ record.approverName }}</span>
                <el-tag :type="getStatusTagType(record.result)" size="small">
                  {{ getStatusText(record.result) }}
                </el-tag>
              </div>
              <div class="history-content">
                {{ record.comment }}
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-else description="暂无审批历史" />
      </div>

      <template #footer>
        <el-button @click="historyDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document,
  Select,
  CloseBold,
  Clock
} from '@element-plus/icons-vue'
import {
  getLeaveRecords,
  getLeaveStatistics,
  exportLeaveRecords,
  exportApplicationDetail,
  withdrawLeaveApplication,
  batchWithdrawApplications,
  getApprovalHistory
} from '@/api/leave'
import type {
  LeaveApplicationInfo,
  LeaveRecordQuery,
  ApprovalRecord
} from '@/types/leave'

const route = useRoute()
const loading = ref(false)
const historyLoading = ref(false)
const showAdvancedFilter = ref(false)
const detailDialogVisible = ref(false)
const historyDialogVisible = ref(false)
const selectedRows = ref<LeaveApplicationInfo[]>([])
const tableData = ref<LeaveApplicationInfo[]>([])
const currentApplication = ref<LeaveApplicationInfo>()
const approvalHistory = ref<ApprovalRecord[]>([])
const currentUserId = ref('STU001') // 假设当前用户ID

// 筛选表单
const filterForm = reactive<LeaveRecordQuery>({
  applicantType: '',
  leaveTypeId: '',
  status: '',
  applicantName: '',
  applicationDateRange: null,
  durationRange: [0, 30],
  organizationId: '',
  pageNum: 1,
  pageSize: 10
})

// 分页
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 统计数据
const statistics = reactive({
  totalApplications: 0,
  approvedApplications: 0,
  rejectedApplications: 0,
  pendingApplications: 0
})

// 统计卡片数据
const statCards = computed(() => [
  {
    icon: 'Document',
    title: '总申请数',
    value: statistics.totalApplications.toString(),
    gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
    trend: null,
    trendType: null,
    label: '本月总计',
    percentage: `${statistics.totalApplications}条`
  },
  {
    icon: 'Select',
    title: '已通过',
    value: statistics.approvedApplications.toString(),
    gradient: 'linear-gradient(135deg, #11998e, #38ef7d)',
    trend: '通过率',
    trendType: 'success',
    label: '审批通过',
    percentage: `${statistics.totalApplications > 0 ? Math.round((statistics.approvedApplications / statistics.totalApplications) * 100) : 0}%`
  },
  {
    icon: 'CloseBold',
    title: '已拒绝',
    value: statistics.rejectedApplications.toString(),
    gradient: 'linear-gradient(135deg, #fa709a, #fee140)',
    trend: '拒绝率',
    trendType: 'danger',
    label: '审批拒绝',
    percentage: `${statistics.totalApplications > 0 ? Math.round((statistics.rejectedApplications / statistics.totalApplications) * 100) : 0}%`
  },
  {
    icon: 'Clock',
    title: '待审批',
    value: statistics.pendingApplications.toString(),
    gradient: 'linear-gradient(135deg, #ffecd2, #fcb69f)',
    trend: '待处理',
    trendType: 'warning',
    label: '需要处理',
    percentage: `${statistics.pendingApplications}条`
  }
])

// 格式化日期时间
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化日期
const formatDate = (dateTime: string) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  const typeMap: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    withdrawn: 'info'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已拒绝',
    withdrawn: '已撤回'
  }
  return textMap[status] || status
}

// 获取时间线类型
const getTimelineType = (result: string) => {
  const typeMap: Record<string, string> = {
    approved: 'success',
    rejected: 'danger',
    pending: 'warning'
  }
  return typeMap[result] || 'info'
}

// 获取统计数据
const fetchStatistics = async () => {
  try {
    const params = {
      applicantType: filterForm.applicantType,
      dateRange: filterForm.applicationDateRange,
      organizationId: filterForm.organizationId
    }

    const res = await getLeaveStatistics(params)
    if (res && res.data) {
      Object.assign(statistics, res.data)
    }
  } catch (error) {
    console.error('获取统计数据失败', error)
  }
}

// 获取列表数据
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      ...filterForm,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    }

    // 过滤空值
    Object.keys(params).forEach(key => {
      if (params[key as keyof typeof params] === '' || params[key as keyof typeof params] === null) {
        delete params[key as keyof typeof params]
      }
    })

    const res = await getLeaveRecords(params)
    if (res && res.data) {
      tableData.value = res.data.list || res.data
      pagination.total = res.data.total || res.data.length
    }

    // 获取统计数据
    await fetchStatistics()
  } catch (error) {
    ElMessage.error('获取数据失败')
    console.error('获取请假记录失败', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  fetchData()
}

// 重置
const handleReset = () => {
  Object.assign(filterForm, {
    applicantType: '',
    leaveTypeId: '',
    status: '',
    applicantName: '',
    applicationDateRange: null,
    durationRange: [0, 30],
    organizationId: '',
    pageNum: 1,
    pageSize: 10
  })
  pagination.pageNum = 1
  fetchData()
}

// 查看详情
const handleViewDetail = (row: LeaveApplicationInfo) => {
  currentApplication.value = row
  detailDialogVisible.value = true
}

// 查看审批历史
const handleViewHistory = async (row: LeaveApplicationInfo) => {
  historyDialogVisible.value = true
  historyLoading.value = true

  try {
    const res = await getApprovalHistory(row.id)
    if (res && res.data) {
      approvalHistory.value = res.data
    }
  } catch (error) {
    ElMessage.error('获取审批历史失败')
  } finally {
    historyLoading.value = false
  }
}

// 撤回申请
const handleWithdraw = async (row: LeaveApplicationInfo) => {
  try {
    const reason = await ElMessageBox.prompt(
      '请输入撤回原因',
      '撤回申请',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: '请输入撤回原因',
        inputValidator: (value: string) => {
          if (!value || value.trim().length < 5) {
            return '撤回原因不能少于5个字符'
          }
          return true
        }
      }
    )

    await withdrawLeaveApplication(row.id, reason.value)
    ElMessage.success('撤回成功')
    detailDialogVisible.value = false
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('撤回失败')
    }
  }
}

// 批量撤回
const handleBatchWithdraw = async () => {
  const pendingRows = selectedRows.value.filter(row =>
    row.status === 'pending' && row.applicantId === currentUserId.value
  )

  if (pendingRows.length === 0) {
    ElMessage.warning('只能撤回自己的待审批申请')
    return
  }

  try {
    const reason = await ElMessageBox.prompt(
      `确认撤回选中的 ${pendingRows.length} 条申请？`,
      '批量撤回',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: '请输入撤回原因',
        inputValidator: (value: string) => {
          if (!value || value.trim().length < 5) {
            return '撤回原因不能少于5个字符'
          }
          return true
        }
      }
    )

    const ids = pendingRows.map(row => row.id)
    await batchWithdrawApplications({
      applicationIds: ids,
      reason: reason.value
    })

    ElMessage.success('批量撤回成功')
    selectedRows.value = []
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('批量撤回失败')
    }
  }
}

// 导出单条记录
const handleExportSingle = async (row: LeaveApplicationInfo) => {
  try {
    await exportApplicationDetail(row.id, 'pdf')
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 批量导出
const handleBatchExport = async () => {
  try {
    const ids = selectedRows.value.map(row => row.id)
    await exportLeaveRecords({
      applicationIds: ids,
      format: 'excel'
    })
    ElMessage.success('批量导出成功')
  } catch (error) {
    ElMessage.error('批量导出失败')
  }
}

// 导出全部
const handleExportAll = async () => {
  try {
    const params = { ...filterForm }
    await exportLeaveRecords({
      ...params,
      format: 'excel'
    })
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 选择变化
const handleSelectionChange = (selection: LeaveApplicationInfo[]) => {
  selectedRows.value = selection
}

// 分页变化
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  pagination.pageNum = 1
  fetchData()
}

const handleCurrentChange = (val: number) => {
  pagination.pageNum = val
  fetchData()
}

// 初始化
onMounted(() => {
  // 检查路由参数
  if (route.query.leaveTypeId) {
    filterForm.leaveTypeId = route.query.leaveTypeId as string
  }

  fetchData()
})
</script>

<style lang="scss" scoped>
.leave-record-container {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;

    h2 {
      margin: 0 0 8px 0;
      color: #303133;
    }

    .page-description {
      margin: 0;
      color: #606266;
      font-size: 14px;
    }
  }

  .filter-card {
    margin-bottom: 20px;

    .filter-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 15px;
    }

    .filter-left {
      display: flex;
      align-items: center;
      gap: 15px;
      flex-wrap: wrap;
    }

    .filter-right {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .advanced-filter {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #ebeef5;
    }
  }

  .stat-cards {
    margin-bottom: 24px;

    .stat-card {
      border-radius: 12px;
      padding: 20px;
      color: white;
      min-height: 140px;
      transition: all 0.3s;
      cursor: pointer;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .card-icon {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          padding: 8px;
          display: inline-flex;
        }
      }

      .card-value {
        font-size: 32px;
        font-weight: bold;
        margin-bottom: 8px;
      }

      .card-title {
        font-size: 14px;
        opacity: 0.9;
        margin-bottom: 12px;
      }

      .card-footer {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        opacity: 0.8;
      }
    }
  }

  .action-bar {
    margin-bottom: 20px;
    display: flex;
    justify-content: flex-end;
    gap: 15px;
  }

  .time-range {
    font-size: 12px;
    line-height: 1.4;

    div:first-child {
      color: #606266;
    }

    div:last-child {
      color: #909399;
    }
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .application-detail {
    .detail-section {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #ebeef5;

      &:last-child {
        border-bottom: none;
        margin-bottom: 0;
      }

      h4 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }

      .detail-item {
        margin-bottom: 12px;
        display: flex;
        align-items: flex-start;

        label {
          min-width: 80px;
          color: #606266;
          font-weight: 500;
        }

        span {
          color: #303133;
        }

        .description {
          margin: 0;
          line-height: 1.6;
          color: #303133;
          background: #f5f7fa;
          padding: 12px;
          border-radius: 4px;
        }
      }
    }
  }

  .history-item {
    .history-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;

      .approver {
        font-weight: 600;
        color: #303133;
      }
    }

    .history-content {
      color: #606266;
      line-height: 1.5;
    }
  }
}

:deep(.el-dialog__body) {
  padding: 20px 20px 10px;
}
</style>
