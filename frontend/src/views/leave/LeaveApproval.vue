<template>
  <div class="leave-approval-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>请假审批</h2>
      <p class="page-description">处理学生请假申请，进行审批决策</p>
    </div>

    <!-- 筛选卡片 -->
    <el-card class="filter-card">
      <div class="filter-row">
        <div class="filter-left">
          <el-tabs v-model="activeTab" @tab-change="handleTabChange">
            <el-tab-pane label="待审批" name="pending" />
            <el-tab-pane label="已审批" name="processed" />
          </el-tabs>
        </div>

        <div class="filter-right">
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

          <el-date-picker
            v-model="filterForm.applicationDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
            @change="handleSearch"
          />

          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </div>
    </el-card>

    <!-- 操作按钮区（仅待审批显示） -->
    <div v-if="activeTab === 'pending'" class="action-bar">
      <el-button
        type="success"
        :disabled="selectedRows.length === 0"
        @click="handleBatchApproval('approved')"
      >
        批量通过
      </el-button>
      <el-button
        type="danger"
        :disabled="selectedRows.length === 0"
        @click="handleBatchApproval('rejected')"
      >
        批量拒绝
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
        <el-table-column v-if="activeTab === 'pending'" type="selection" width="55" />

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
            <el-tag :type="row.applicantType === 'teacher' ? 'primary' : 'success'">
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
              <div>{{ formatDateTime(row.startTime) }}</div>
              <div>{{ formatDateTime(row.endTime) }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="applicationTime" label="申请时间" width="140">
          <template #default="{ row }">
            {{ formatDateTime(row.applicationTime) }}
          </template>
        </el-table-column>

        <el-table-column v-if="activeTab === 'processed'" prop="status" label="审批状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column v-if="activeTab === 'processed'" prop="approvalTime" label="审批时间" width="140">
          <template #default="{ row }">
            {{ formatDateTime(row.approvalTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleViewDetail(row)">
              查看
            </el-button>
            <el-button
              v-if="activeTab === 'pending'"
              link
              type="success"
              size="small"
              @click="handleApprove(row, 'approved')"
            >
              通过
            </el-button>
            <el-button
              v-if="activeTab === 'pending'"
              link
              type="danger"
              size="small"
              @click="handleApprove(row, 'rejected')"
            >
              拒绝
            </el-button>
            <el-button
              v-if="activeTab === 'processed'"
              link
              type="info"
              size="small"
              @click="handleViewHistory(row)"
            >
              历史
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

        <!-- 时间信息 -->
        <div class="detail-section">
          <h4>时间信息</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="detail-item">
                <label>开始时间：</label>
                <span>{{ formatDateTime(currentApplication.startTime) }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="detail-item">
                <label>结束时间：</label>
                <span>{{ formatDateTime(currentApplication.endTime) }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="detail-item">
                <label>申请时间：</label>
                <span>{{ formatDateTime(currentApplication.applicationTime) }}</span>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 证明材料 -->
        <div v-if="currentApplication.proofFiles && currentApplication.proofFiles.length > 0" class="detail-section">
          <h4>证明材料</h4>
          <div class="proof-files">
            <div
              v-for="file in currentApplication.proofFiles"
              :key="file.fileId"
              class="file-item"
            >
              <el-link type="primary" @click="handlePreviewFile(file)">
                <el-icon><Document /></el-icon>
                {{ file.fileName }}
              </el-link>
            </div>
          </div>
        </div>

        <!-- 紧急联系人 -->
        <div v-if="currentApplication.emergencyContactName" class="detail-section">
          <h4>紧急联系人</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="detail-item">
                <label>联系人：</label>
                <span>{{ currentApplication.emergencyContactName }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="detail-item">
                <label>联系电话：</label>
                <span>{{ currentApplication.emergencyContactPhone }}</span>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button
            v-if="activeTab === 'pending'"
            type="success"
            @click="handleApprove(currentApplication!, 'approved')"
          >
            通过
          </el-button>
          <el-button
            v-if="activeTab === 'pending'"
            type="danger"
            @click="handleApprove(currentApplication!, 'rejected')"
          >
            拒绝
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 审批弹窗 -->
    <el-dialog
      v-model="approvalDialogVisible"
      :title="approvalAction === 'approved' ? '通过申请' : '拒绝申请'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form ref="approvalFormRef" :model="approvalForm" :rules="approvalRules" label-width="100px">
        <el-form-item label="审批意见" prop="comment" required>
          <el-input
            v-model="approvalForm.comment"
            type="textarea"
            :rows="4"
            :placeholder="approvalAction === 'approved' ? '请填写通过意见' : '请填写拒绝原因'"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item v-if="approvalAction === 'approved'" label="调整时间">
          <el-switch v-model="approvalForm.adjustTime" />
          <span style="margin-left: 10px; color: #606266; font-size: 12px;">
            是否需要调整请假时间
          </span>
        </el-form-item>

        <div v-if="approvalForm.adjustTime && approvalAction === 'approved'" style="margin-left: 100px;">
          <el-form-item label="调整后开始时间">
            <el-date-picker
              v-model="approvalForm.adjustedStartTime"
              type="datetime"
              placeholder="选择开始时间"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="调整后结束时间">
            <el-date-picker
              v-model="approvalForm.adjustedEndTime"
              type="datetime"
              placeholder="选择结束时间"
              style="width: 100%"
            />
          </el-form-item>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="approvalDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="approving"
            @click="handleConfirmApproval"
          >
            确定
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document } from '@element-plus/icons-vue'
import {
  getPendingApprovalList,
  getProcessedApprovalList,
  submitApproval,
  batchApproval,
  getApprovalHistory,
  previewFile
} from '@/api/leave'
import type {
  LeaveApplicationInfo,
  ApprovalFormData,
  ApprovalRecord
} from '@/types/leave'

const loading = ref(false)
const approving = ref(false)
const historyLoading = ref(false)
const activeTab = ref('pending')
const detailDialogVisible = ref(false)
const approvalDialogVisible = ref(false)
const historyDialogVisible = ref(false)
const selectedRows = ref<LeaveApplicationInfo[]>([])
const tableData = ref<LeaveApplicationInfo[]>([])
const currentApplication = ref<LeaveApplicationInfo>()
const approvalHistory = ref<ApprovalRecord[]>([])
const approvalAction = ref<'approved' | 'rejected'>('approved')

// 筛选表单
const filterForm = reactive({
  applicantType: '',
  leaveTypeId: '',
  applicationDateRange: null as [string, string] | null,
  pageNum: 1,
  pageSize: 10
})

// 分页
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 审批表单
const approvalFormRef = ref()
const approvalForm = reactive<ApprovalFormData>({
  result: 'approved',
  comment: '',
  adjustTime: false,
  adjustedStartTime: '',
  adjustedEndTime: ''
})

// 审批表单验证规则
const approvalRules = {
  comment: [
    { required: true, message: '请填写审批意见', trigger: 'blur' },
    { min: 5, max: 200, message: '审批意见长度在 5 到 200 个字符', trigger: 'blur' }
  ]
}

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

// 获取列表数据
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      ...filterForm,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      applicationDateRange: filterForm.applicationDateRange
    }

    // 过滤空值
    Object.keys(params).forEach(key => {
      if (params[key as keyof typeof params] === '' || params[key as keyof typeof params] === null) {
        delete params[key as keyof typeof params]
      }
    })

    let res
    if (activeTab.value === 'pending') {
      res = await getPendingApprovalList(params)
    } else {
      res = await getProcessedApprovalList(params)
    }

    if (res && res.data) {
      tableData.value = res.data.list || res.data
      pagination.total = res.data.total || res.data.length
    }
  } catch (error) {
    ElMessage.error('获取数据失败')
    console.error('获取审批列表失败', error)
  } finally {
    loading.value = false
  }
}

// 标签页切换
const handleTabChange = () => {
  pagination.pageNum = 1
  selectedRows.value = []
  fetchData()
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
    applicationDateRange: null,
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

// 审批操作
const handleApprove = (row: LeaveApplicationInfo, action: 'approved' | 'rejected') => {
  currentApplication.value = row
  approvalAction.value = action

  // 重置表单
  Object.assign(approvalForm, {
    result: action,
    comment: '',
    adjustTime: false,
    adjustedStartTime: row.startTime,
    adjustedEndTime: row.endTime
  })

  approvalDialogVisible.value = true
}

// 确认审批
const handleConfirmApproval = async () => {
  try {
    await approvalFormRef.value.validate()

    approving.value = true
    await submitApproval(currentApplication.value!.id, approvalForm)

    ElMessage.success(approvalAction.value === 'approved' ? '审批通过' : '审批拒绝')
    approvalDialogVisible.value = false
    detailDialogVisible.value = false
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('审批失败')
    }
  } finally {
    approving.value = false
  }
}

// 批量审批
const handleBatchApproval = async (action: 'approved' | 'rejected') => {
  const actionText = action === 'approved' ? '通过' : '拒绝'

  try {
    const comment = await ElMessageBox.prompt(
      `确认${actionText}选中的 ${selectedRows.value.length} 条申请？`,
      `批量${actionText}`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: `请填写${actionText}意见`,
        inputValidator: (value: string) => {
          if (!value || value.trim().length < 5) {
            return `${actionText}意见不能少于5个字符`
          }
          return true
        }
      }
    )

    const ids = selectedRows.value.map(row => row.id)
    await batchApproval({
      applicationIds: ids,
      result: action,
      comment: comment.value
    })

    ElMessage.success(`批量${actionText}成功`)
    selectedRows.value = []
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(`批量${actionText}失败`)
    }
  }
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

// 预览文件
const handlePreviewFile = async (file: any) => {
  try {
    const res = await previewFile(file.fileId)
    if (res && res.data && res.data.previewUrl) {
      window.open(res.data.previewUrl, '_blank')
    }
  } catch (error) {
    ElMessage.error('预览文件失败')
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
  fetchData()
})
</script>

<style lang="scss" scoped>
.leave-approval-container {
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
      align-items: flex-start;

      .filter-left {
        :deep(.el-tabs__header) {
          margin-bottom: 0;
        }
      }

      .filter-right {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-top: 8px;
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

    .proof-files {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;

      .file-item {
        .el-link {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          background: #f5f7fa;
          border-radius: 4px;
          transition: background-color 0.2s;

          &:hover {
            background: #e6f7ff;
          }
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

:deep(.el-tabs__content) {
  display: none;
}
</style>
