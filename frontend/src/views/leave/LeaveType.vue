<template>
  <div class="leave-type-container">
    <!-- 顶部筛选栏 -->
    <el-card class="filter-card">
      <div class="filter-row">
        <div class="filter-left">
          <el-select
            v-model="filterForm.applicablePersonType"
            placeholder="全部"
            style="width: 180px"
            @change="handleSearch"
          >
            <el-option label="全部" value="all" />
            <el-option label="教师" value="teacher" />
            <el-option label="学生" value="student" />
          </el-select>

          <el-select
            v-model="filterForm.status"
            placeholder="全部"
            style="width: 180px"
            @change="handleSearch"
          >
            <el-option label="全部" value="all" />
            <el-option label="启用" value="active" />
            <el-option label="停用" value="inactive" />
          </el-select>

          <el-input
            v-model="filterForm.typeName"
            placeholder="请输入类型名称搜索"
            style="width: 220px"
            clearable
            @keyup.enter="handleSearch"
          />
        </div>

        <div class="filter-right">
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="text" @click="showAdvancedFilter = !showAdvancedFilter">
            高级筛选
          </el-button>
        </div>
      </div>

      <!-- 高级筛选 -->
      <div v-if="showAdvancedFilter" class="advanced-filter">
        <el-form :model="filterForm" label-width="120px">
          <el-form-item label="最长时长范围">
            <el-slider
              v-model="filterForm.maxDurationRange"
              range
              :min="1"
              :max="30"
              show-stops
              :step="1"
              style="width: 300px"
            />
            <span style="margin-left: 15px">
              {{ filterForm.maxDurationRange[0] }} - {{ filterForm.maxDurationRange[1] }} 天
            </span>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 操作按钮区 -->
    <div class="action-bar">
      <el-button type="primary" @click="handleAdd">新增类型</el-button>
      <el-button type="warning" @click="handleBatchExport">批量导出</el-button>
      <el-button
        type="success"
        :disabled="selectedRows.length === 0"
        @click="handleBatchStatus('active')"
      >
        批量启用
      </el-button>
      <el-button
        type="danger"
        :disabled="selectedRows.length === 0"
        @click="handleBatchStatus('inactive')"
      >
        批量停用
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

        <el-table-column prop="typeName" label="类型名称" min-width="180">
          <template #default="{ row }">
            <el-tooltip :content="getTypeTooltip(row)" placement="top">
              <span class="type-name">{{ row.typeName }}</span>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column prop="applicablePersonType" label="适用人员类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.applicablePersonType === 'teacher' ? 'primary' : 'success'">
              {{ row.applicablePersonType === 'teacher' ? '教师' : '学生' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="description" label="类型描述" min-width="200" show-overflow-tooltip />

        <el-table-column prop="maxDuration" label="最长时长" width="120" align="center">
          <template #default="{ row }">
            {{ row.maxDuration }} {{ row.durationUnit === 'day' ? '天' : '小时' }}
          </template>
        </el-table-column>

        <el-table-column prop="requiresProof" label="是否需证明" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.requiresProof ? 'success' : 'info'">
              {{ row.requiresProof ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="类型状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="info" size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button
              link
              :type="row.status === 'active' ? 'warning' : 'success'"
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'active' ? '停用' : '启用' }}
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

    <!-- 类型应用详情弹窗 -->
    <el-dialog v-model="usageDialogVisible" title="类型应用详情" width="600px">
      <div v-loading="usageLoading">
        <div class="usage-section">
          <h4>适用人群统计</h4>
          <div class="usage-stats">
            <div v-for="stat in usageData.applicablePersons" :key="stat.type" class="stat-item">
              <span>{{ stat.type === 'student' ? '学生' : '教师' }}：{{ stat.count }} 个年级/部门</span>
            </div>
          </div>
        </div>

        <div class="usage-section">
          <h4>近30天使用次数</h4>
          <p class="usage-count">{{ usageData.totalApplications || 0 }} 次申请</p>
        </div>
      </div>

      <template #footer>
        <el-button @click="usageDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleViewApplications">查看申请记录</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getLeaveTypeList,
  batchUpdateLeaveTypeStatus,
  exportLeaveTypes,
  getLeaveTypeUsage
} from '@/api/leave'
import type { LeaveTypeInfo, LeaveTypeListQuery } from '@/types/leave'

const router = useRouter()
const loading = ref(false)
const usageLoading = ref(false)
const showAdvancedFilter = ref(false)
const usageDialogVisible = ref(false)
const selectedRows = ref<LeaveTypeInfo[]>([])
const tableData = ref<LeaveTypeInfo[]>([])
const currentViewType = ref<LeaveTypeInfo>()

// 筛选表单
const filterForm = reactive<LeaveTypeListQuery>({
  applicablePersonType: 'all',
  status: 'all',
  typeName: '',
  maxDurationRange: [1, 15],
  pageNum: 1,
  pageSize: 10
})

// 分页
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 使用统计数据
const usageData = ref<{
  applicablePersons: { type: string; count: number }[]
  recentUsage: { date: string; count: number }[]
  totalApplications: number
}>({
  applicablePersons: [],
  recentUsage: [],
  totalApplications: 0
})

// 获取类型详情提示
const getTypeTooltip = (row: LeaveTypeInfo) => {
  return `最长时长：${row.maxDuration}${row.durationUnit === 'day' ? '天' : '小时'}
是否需证明：${row.requiresProof ? '是' : '否'}
适用人群：${row.applicablePersonType === 'teacher' ? '教师' : '学生'}`
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

    // 处理筛选参数
    if (params.applicablePersonType === 'all') {
      delete params.applicablePersonType
    }
    if (params.status === 'all') {
      delete params.status
    }
    if (!params.typeName) {
      delete params.typeName
    }

    const res = await getLeaveTypeList(params)
    if (res && res.data) {
      tableData.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (error) {
    ElMessage.error('获取请假类型列表失败')
    console.error('获取请假类型列表失败', error)
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
    applicablePersonType: 'all',
    status: 'all',
    typeName: '',
    maxDurationRange: [1, 15],
    pageNum: 1,
    pageSize: 10
  })
  pagination.pageNum = 1
  fetchData()
}

// 新增
const handleAdd = () => {
  router.push('/leave/type/add')
}

// 编辑
const handleEdit = (row: LeaveTypeInfo) => {
  router.push(`/leave/type/edit/${row.id}`)
}

// 查看应用详情
const handleView = async (row: LeaveTypeInfo) => {
  currentViewType.value = row
  usageDialogVisible.value = true
  usageLoading.value = true

  try {
    const res = await getLeaveTypeUsage(row.id)
    if (res && res.data) {
      usageData.value = res.data
    }
  } catch (error) {
    ElMessage.error('获取应用详情失败')
  } finally {
    usageLoading.value = false
  }
}

// 查看申请记录
const handleViewApplications = () => {
  if (currentViewType.value) {
    router.push({
      path: '/leave/record',
      query: {
        leaveTypeId: currentViewType.value.id
      }
    })
    usageDialogVisible.value = false
  }
}

// 切换状态
const handleToggleStatus = async (row: LeaveTypeInfo) => {
  const newStatus = row.status === 'active' ? 'inactive' : 'active'
  const action = newStatus === 'active' ? '启用' : '停用'

  try {
    await ElMessageBox.confirm(
      `确认${action}类型"${row.typeName}"？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await batchUpdateLeaveTypeStatus([row.id], newStatus)
    ElMessage.success(`${action}成功`)
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(`${action}失败`)
    }
  }
}

// 批量操作状态
const handleBatchStatus = async (status: 'active' | 'inactive') => {
  const action = status === 'active' ? '启用' : '停用'
  const ids = selectedRows.value.map(row => row.id)

  try {
    await ElMessageBox.confirm(
      `确认${action}选中的 ${selectedRows.value.length} 条类型？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await batchUpdateLeaveTypeStatus(ids, status)
    ElMessage.success(`批量${action}成功`)
    selectedRows.value = []
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(`批量${action}失败`)
    }
  }
}

// 批量导出
const handleBatchExport = async () => {
  try {
    const params = { ...filterForm }
    await exportLeaveTypes(params)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 选择变化
const handleSelectionChange = (selection: LeaveTypeInfo[]) => {
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
.leave-type-container {
  padding: 20px;

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
      gap: 20px;
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
    justify-content: flex-end;
    gap: 15px;
  }

  .type-name {
    font-weight: 600;
    color: #303133;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .usage-section {
    margin-bottom: 20px;

    h4 {
      margin-bottom: 10px;
      color: #303133;
    }

    .usage-stats {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;

      .stat-item {
        padding: 8px 12px;
        background: #f5f7fa;
        border-radius: 4px;
        color: #606266;
      }
    }

    .usage-count {
      font-size: 18px;
      font-weight: 600;
      color: #409eff;
      margin: 0;
    }
  }
}
</style>
