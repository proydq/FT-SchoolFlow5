<template>
  <div class="attendance-rule-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>考勤规则管理</h2>
      <p class="page-description">配置和管理教师、学生的考勤打卡规则，支持多时段和差异化设置</p>
    </div>

    <!-- 顶部筛选栏 -->
    <el-card class="filter-card">
      <div class="filter-row">
        <div class="filter-left">
          <el-select
            v-model="filterForm.applicableType"
            placeholder="适用人员类型"
            style="width: 180px"
            @change="handleSearch"
          >
            <el-option label="全部" value="" />
            <el-option label="教师" value="teacher" />
            <el-option label="学生" value="student" />
          </el-select>

          <el-select
            v-model="filterForm.status"
            placeholder="规则状态"
            style="width: 180px"
            @change="handleSearch"
          >
            <el-option label="全部" value="" />
            <el-option label="生效中" value="active" />
            <el-option label="待生效" value="pending" />
            <el-option label="已失效" value="inactive" />
          </el-select>

          <el-input
            v-model="filterForm.ruleName"
            placeholder="规则名称搜索"
            style="width: 220px"
            clearable
            @keyup.enter="handleSearch"
          />

          <el-date-picker
            v-model="filterForm.effectiveDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="生效开始日期"
            end-placeholder="生效结束日期"
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
              <el-form-item label="创建时间范围">
                <el-date-picker
                  v-model="filterForm.createdDateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </el-card>

    <!-- 操作按钮区 -->
    <div class="action-bar">
      <div class="action-left">
        <!-- 这里可以放置其他左侧操作按钮，如果需要的话 -->
      </div>
      <div class="action-right">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新增规则
        </el-button>
        <el-button type="warning" @click="handleBatchExport">
          <el-icon><Download /></el-icon>
          批量导出
        </el-button>
        <el-button
          type="success"
          :disabled="selectedRows.length === 0"
          @click="handleBatchActivate"
        >
          <el-icon><Check /></el-icon>
          批量生效
        </el-button>
        <el-button
          type="danger"
          :disabled="selectedRows.length === 0"
          @click="handleBatchDeactivate"
        >
          <el-icon><Close /></el-icon>
          批量失效
        </el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <el-card>
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        @selection-change="handleSelectionChange"
        row-key="id"
      >
        <el-table-column type="selection" width="55" />

        <el-table-column prop="ruleName" label="规则名称" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <el-link type="primary" @click="handleViewDetail(row)">
              {{ row.ruleName }}
            </el-link>
            <el-tooltip
              effect="dark"
              placement="top"
              :content="`适用人群：${getRuleDescription(row)}`"
            >
              <el-icon class="rule-info-icon"><InfoFilled /></el-icon>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column prop="applicableType" label="适用人员类型" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="row.applicableType === 'teacher' ? 'primary' : 'success'" size="small">
              {{ row.applicableType === 'teacher' ? '教师' : '学生' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="checkType" label="打卡类型" width="130" align="center">
          <template #default="{ row }">
            {{ getCheckTypeText(row.checkType) }}
          </template>
        </el-table-column>

        <el-table-column prop="timeSlots" label="时段配置" min-width="180">
          <template #default="{ row }">
            <div class="time-slots">
              <div v-for="slot in row.timeSlots" :key="slot.id" class="time-slot">
                {{ slot.name || '时段' }}：{{ slot.startTime }}-{{ slot.endTime }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="allowedDeviation" label="允许偏差" width="100" align="center">
          <template #default="{ row }">
            <div class="deviation-info">
              <div>迟到≤{{ row.allowedDeviation.lateMinutes }}分钟</div>
              <div>早退≤{{ row.allowedDeviation.earlyMinutes }}分钟</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="规则状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="effectiveDate" label="生效日期" width="110" align="center">
          <template #default="{ row }">
            {{ row.effectiveDate ? formatDate(row.effectiveDate) : '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="创建时间" width="140" align="center">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="info" size="small" @click="handleViewDetail(row)">
              查看
            </el-button>
            <el-button
              v-if="row.status === 'inactive'"
              link
              type="success"
              size="small"
              @click="handleActivate(row)"
            >
              生效
            </el-button>
            <el-button
              v-if="row.status === 'active'"
              link
              type="warning"
              size="small"
              @click="handleDeactivate(row)"
            >
              失效
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">
              删除
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

    <!-- 规则应用详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="规则应用详情"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="currentRule" class="rule-detail">
        <div class="detail-section">
          <h4>基本信息</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="detail-item">
                <label>规则名称：</label>
                <span>{{ currentRule.ruleName }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="detail-item">
                <label>适用类型：</label>
                <el-tag :type="currentRule.applicableType === 'teacher' ? 'primary' : 'success'">
                  {{ currentRule.applicableType === 'teacher' ? '教师' : '学生' }}
                </el-tag>
              </div>
            </el-col>
            <el-col :span="24" v-if="currentRule.remark">
              <div class="detail-item">
                <label>规则备注：</label>
                <span>{{ currentRule.remark }}</span>
              </div>
            </el-col>
          </el-row>
        </div>

        <div class="detail-section">
          <h4>应用统计</h4>
          <div v-loading="applicationLoading" class="application-stats">
            <div v-if="applicationDetail" class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">{{ applicationDetail.applicableCount }}</div>
                <div class="stat-label">适用人数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ applicationDetail.recentMatchCount }}</div>
                <div class="stat-label">近7天匹配记录</div>
              </div>
            </div>
            <div v-else class="no-data">暂无应用数据</div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleViewMatchedRecords(currentRule!)">
            查看匹配记录
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Download,
  Check,
  Close,
  InfoFilled
} from '@element-plus/icons-vue'
import {
  getAttendanceRules,
  deleteAttendanceRule,
  batchUpdateRuleStatus,
  exportAttendanceRules,
  getRuleApplicationDetail
} from '@/api/attendance'
import type {
  AttendanceRule,
  AttendanceRuleQuery
} from '@/types/attendance'

const router = useRouter()
const loading = ref(false)
const applicationLoading = ref(false)
const showAdvancedFilter = ref(false)
const detailDialogVisible = ref(false)
const selectedRows = ref<AttendanceRule[]>([])
const tableData = ref<AttendanceRule[]>([])
const currentRule = ref<AttendanceRule>()
const applicationDetail = ref<any>()

// 筛选表单
const filterForm = reactive<AttendanceRuleQuery>({
  applicableType: '',
  status: '',
  ruleName: '',
  effectiveDateRange: null,
  createdDateRange: null,
  pageNum: 1,
  pageSize: 10
})

// 分页
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 获取打卡类型文本
const getCheckTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    work_checkin: '上班/上学打卡',
    work_checkout: '下班/放学打卡',
    lunch_break: '午休外出打卡'
  }
  return typeMap[type] || type
}

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  const typeMap: Record<string, string> = {
    active: 'success',
    pending: 'warning',
    inactive: 'info'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    active: '生效中',
    pending: '待生效',
    inactive: '已失效'
  }
  return textMap[status] || status
}

// 获取规则描述
const getRuleDescription = (rule: AttendanceRule) => {
  let desc = rule.applicableType === 'teacher' ? '教师' : '学生'
  if (rule.relatedGrades && rule.relatedGrades.length > 0) {
    desc += `（${rule.relatedGrades.join('、')}）`
  }
  return desc
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

// 格式化日期
const formatDate = (dateTime: string) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  return date.toLocaleDateString('zh-CN')
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

    const res = await getAttendanceRules(params)
    if (res && res.data) {
      tableData.value = res.data.list || res.data
      pagination.total = res.data.total || res.data.length
    }
  } catch (error) {
    ElMessage.error('获取数据失败')
    console.error('获取考勤规则失败', error)
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
    applicableType: '',
    status: '',
    ruleName: '',
    effectiveDateRange: null,
    createdDateRange: null,
    pageNum: 1,
    pageSize: 10
  })
  pagination.pageNum = 1
  fetchData()
}

// 新增规则
const handleCreate = () => {
  router.push('/attendance/rule/create')
}

// 编辑规则
const handleEdit = (row: AttendanceRule) => {
  router.push(`/attendance/rule/edit/${row.id}`)
}

// 查看详情
const handleViewDetail = async (row: AttendanceRule) => {
  currentRule.value = row
  detailDialogVisible.value = true

  // 获取应用详情
  applicationLoading.value = true
  try {
    const res = await getRuleApplicationDetail(row.id)
    if (res && res.data) {
      applicationDetail.value = res.data
    }
  } catch (error) {
    console.error('获取规则应用详情失败', error)
  } finally {
    applicationLoading.value = false
  }
}

// 查看匹配记录
const handleViewMatchedRecords = (rule: AttendanceRule) => {
  router.push({
    path: '/attendance/records',
    query: { ruleId: rule.id }
  })
}

// 激活规则
const handleActivate = async (row: AttendanceRule) => {
  try {
    await ElMessageBox.confirm(
      `确认将规则"${row.ruleName}"设为生效中？生效后将立即应用于打卡记录匹配`,
      '激活规则',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await batchUpdateRuleStatus({
      ids: [row.id],
      operation: 'activate'
    })

    ElMessage.success('规则已激活')
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('规则激活失败')
    }
  }
}

// 停用规则
const handleDeactivate = async (row: AttendanceRule) => {
  try {
    await ElMessageBox.confirm(
      `确认将规则"${row.ruleName}"设为已失效？失效后将不再匹配新的打卡记录`,
      '停用规则',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await batchUpdateRuleStatus({
      ids: [row.id],
      operation: 'deactivate'
    })

    ElMessage.success('规则已停用')
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('规则停用失败')
    }
  }
}

// 删除规则
const handleDelete = async (row: AttendanceRule) => {
  try {
    await ElMessageBox.confirm(
      `确认删除规则"${row.ruleName}"？删除后相关的历史记录将无法追溯规则信息`,
      '删除规则',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    )

    await deleteAttendanceRule(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 批量激活
const handleBatchActivate = async () => {
  const pendingRules = selectedRows.value.filter(row => row.status === 'inactive' || row.status === 'pending')

  if (pendingRules.length === 0) {
    ElMessage.warning('只能激活已失效或待生效的规则')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确认激活选中的 ${pendingRules.length} 条规则？`,
      '批量激活',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const ids = pendingRules.map(row => row.id)
    await batchUpdateRuleStatus({
      ids,
      operation: 'activate'
    })

    ElMessage.success('批量激活成功')
    selectedRows.value = []
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('批量激活失败')
    }
  }
}

// 批量停用
const handleBatchDeactivate = async () => {
  const activeRules = selectedRows.value.filter(row => row.status === 'active')

  if (activeRules.length === 0) {
    ElMessage.warning('只能停用生效中的规则')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确认停用选中的 ${activeRules.length} 条规则？`,
      '批量停用',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const ids = activeRules.map(row => row.id)
    await batchUpdateRuleStatus({
      ids,
      operation: 'deactivate'
    })

    ElMessage.success('批量停用成功')
    selectedRows.value = []
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('批量停用失败')
    }
  }
}

// 批量导出
const handleBatchExport = async () => {
  try {
    const params = { ...filterForm }
    await exportAttendanceRules(params)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 选择变化
const handleSelectionChange = (selection: AttendanceRule[]) => {
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
.attendance-rule-container {
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

  .action-bar {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .action-left {
      display: flex;
      gap: 15px;
    }

    .action-right {
      display: flex;
      gap: 15px;
    }
  }

  .rule-info-icon {
    margin-left: 5px;
    color: #909399;
    cursor: pointer;

    &:hover {
      color: #409eff;
    }
  }

  .time-slots {
    .time-slot {
      font-size: 12px;
      margin-bottom: 2px;
    }
  }

  .deviation-info {
    font-size: 12px;

    div {
      margin-bottom: 2px;
    }
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .rule-detail {
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
        align-items: center;

        label {
          min-width: 80px;
          color: #606266;
          font-weight: 500;
        }

        span {
          color: #303133;
        }
      }
    }

    .application-stats {
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
      }

      .stat-item {
        text-align: center;
        padding: 20px;
        background: #f5f7fa;
        border-radius: 8px;

        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #409eff;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: #606266;
        }
      }

      .no-data {
        text-align: center;
        color: #909399;
        padding: 20px;
      }
    }
  }
}

:deep(.el-table__row:hover) {
  background-color: #f8f9fa;
}

:deep(.el-table__row.el-table__row--selected) {
  background-color: #e3f2fd;
}
</style>