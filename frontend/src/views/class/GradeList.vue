<template>
  <div class="grade-list-container">
    <!-- 统计卡片 -->
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

    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="学段">
          <el-select
            v-model="searchForm.stage"
            placeholder="请选择学段"
            clearable
            style="width: 120px"
          >
            <el-option label="小学" value="primary" />
            <el-option label="初中" value="junior" />
            <el-option label="高中" value="senior" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="正常" value="active" />
            <el-option label="停用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item label="年级名称">
          <el-input
            v-model="searchForm.gradeName"
            placeholder="请输入年级名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮区域 -->
    <el-card class="action-card">
      <div class="action-buttons">
        <div class="left-buttons">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增年级
          </el-button>
          <el-button @click="handleExport">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
          <el-button
            type="danger"
            :disabled="selectedRows.length === 0"
            @click="handleBatchDelete"
          >
            <el-icon><Delete /></el-icon>
            批量删除
          </el-button>
          <el-button
            :disabled="selectedRows.length === 0"
            @click="handleBatchUpdateStatus"
          >
            <el-icon><Edit /></el-icon>
            批量调整状态
          </el-button>
        </div>
        <div class="right-info">
          <el-tag>共 {{ total }} 个年级</el-tag>
          <el-tag v-if="selectedRows.length > 0" type="warning">
            已选择 {{ selectedRows.length }} 项
          </el-tag>
        </div>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card>
      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="gradeName" label="年级名称" width="120" />
        <el-table-column prop="gradeLevel" label="年级层次" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ row.gradeLevel }}年级</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="stageText" label="学段" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="getStageType(row.stage)"
              size="small"
            >
              {{ row.stageText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="classCount" label="班级数" width="100" align="center">
          <template #default="{ row }">
            <el-link type="primary" @click="handleViewClasses(row)">
              {{ row.classCount }}个班
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="studentCount" label="学生数" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="info">{{ row.studentCount }}人</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="gradeDirectorName" label="年级主任" min-width="150">
          <template #default="{ row }">
            <span v-if="row.gradeDirectorName">
              {{ row.gradeDirectorName }}
            </span>
            <el-tag v-else type="warning" size="small">未分配</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 'active' ? 'success' : 'danger'"
              size="small"
            >
              {{ row.status === 'active' ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <div style="display: flex; gap: 5px;">
              <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
              <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button link type="primary" size="small" @click="handleAssignDirector(row)">分配主任</el-button>
              <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 批量调整状态对话框 -->
    <el-dialog
      v-model="statusDialog.visible"
      title="批量调整状态"
      width="500px"
    >
      <el-form :model="statusDialog" label-width="100px">
        <el-form-item label="选中年级">
          <el-tag>已选择 {{ selectedRows.length }} 个年级</el-tag>
        </el-form-item>
        <el-form-item label="调整为" required>
          <el-select v-model="statusDialog.status" placeholder="请选择状态">
            <el-option label="正常" value="active" />
            <el-option label="停用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item label="调整原因" required>
          <el-input
            v-model="statusDialog.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入调整原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmBatchUpdateStatus">确定</el-button>
      </template>
    </el-dialog>

    <!-- 分配年级主任对话框 -->
    <el-dialog
      v-model="directorDialog.visible"
      title="分配年级主任"
      width="500px"
    >
      <el-form :model="directorDialog" label-width="100px">
        <el-form-item label="年级名称">
          <el-text>{{ directorDialog.gradeName }}</el-text>
        </el-form-item>
        <el-form-item label="当前主任">
          <el-text v-if="directorDialog.currentDirector">
            {{ directorDialog.currentDirector }}
          </el-text>
          <el-tag v-else type="warning" size="small">未分配</el-tag>
        </el-form-item>
        <el-form-item label="选择主任" required>
          <el-select
            v-model="directorDialog.teacherId"
            placeholder="请选择年级主任"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="teacher in availableDirectors"
              :key="teacher.teacherId"
              :label="`${teacher.teacherName} (${teacher.teacherCode})`"
              :value="teacher.teacherId"
              :disabled="teacher.currentGrade && teacher.currentGrade !== directorDialog.gradeId"
            >
              <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <span>{{ teacher.teacherName }} ({{ teacher.teacherCode }})</span>
                <el-tag v-if="teacher.currentGrade" type="warning" size="small">
                  已负责{{ teacher.currentGrade }}
                </el-tag>
                <el-tag v-else type="success" size="small">
                  可分配
                </el-tag>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分配原因" required>
          <el-input
            v-model="directorDialog.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入分配原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="directorDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmAssignDirector">确定分配</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Download,
  Delete,
  Edit,
  Grid,
  CircleCheck,
  School,
  User
} from '@element-plus/icons-vue'
import {
  getGradeList,
  deleteGrade,
  batchDeleteGrade,
  updateGradeStatus,
  assignGradeDirector,
  getAvailableDirectors,
  getGradeStatistics,
  exportGrades
} from '@/api/grade'
import type { GradeInfo, GradeFilterParams } from '@/types/grade'

const router = useRouter()

// 搜索表单
const searchForm = reactive({
  stage: '',
  status: '',
  gradeName: ''
})

// 统计数据
const statistics = reactive({
  totalCount: 0,
  activeCount: 0,
  inactiveCount: 0,
  stageDistribution: []
})

// 统计卡片数据
const statCards = computed(() => [
  {
    icon: 'Grid',
    title: '年级总数',
    value: statistics.totalCount.toString(),
    gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
    trend: '全部',
    trendType: 'primary',
    label: '学段覆盖',
    percentage: '小初高'
  },
  {
    icon: 'CircleCheck',
    title: '活跃年级',
    value: statistics.activeCount.toString(),
    gradient: 'linear-gradient(135deg, #11998e, #38ef7d)',
    trend: '正常',
    trendType: 'success',
    label: '占比',
    percentage: statistics.totalCount > 0 ? `${((statistics.activeCount / statistics.totalCount) * 100).toFixed(1)}%` : '0%'
  },
  {
    icon: 'School',
    title: '班级总数',
    value: totalClasses.value.toString(),
    gradient: 'linear-gradient(135deg, #fa709a, #fee140)',
    trend: '共计',
    trendType: 'warning',
    label: '平均每年级',
    percentage: statistics.totalCount > 0 ? `${(totalClasses.value / statistics.totalCount).toFixed(1)}个` : '0个'
  },
  {
    icon: 'User',
    title: '学生总数',
    value: totalStudents.value.toString(),
    gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
    trend: '在读',
    trendType: 'info',
    label: '平均每班',
    percentage: totalClasses.value > 0 ? `${(totalStudents.value / totalClasses.value).toFixed(1)}人` : '0人'
  }
])

// 表格数据
const tableData = ref<GradeInfo[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const selectedRows = ref<GradeInfo[]>([])

// 下拉数据
const availableDirectors = ref<any[]>([])

// 对话框
const statusDialog = reactive({
  visible: false,
  status: '',
  reason: ''
})

const directorDialog = reactive({
  visible: false,
  gradeId: '',
  gradeName: '',
  currentDirector: '',
  teacherId: '',
  reason: ''
})

// 计算总班级数和总学生数
const totalClasses = computed(() => {
  return tableData.value.reduce((sum, item) => sum + item.classCount, 0)
})

const totalStudents = computed(() => {
  return tableData.value.reduce((sum, item) => sum + item.studentCount, 0)
})

// 获取年级列表
const fetchGradeList = async () => {
  loading.value = true
  try {
    const params: GradeFilterParams = {
      ...searchForm,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    const res = await getGradeList(params)
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    ElMessage.error('获取年级列表失败')
  } finally {
    loading.value = false
  }
}

// 获取统计数据
const fetchStatistics = async () => {
  try {
    const res = await getGradeStatistics()
    Object.assign(statistics, res.data)
  } catch (error) {
    console.error('获取统计数据失败', error)
  }
}

// 获取可用年级主任
const fetchAvailableDirectors = async () => {
  try {
    const res = await getAvailableDirectors()
    availableDirectors.value = res.data
  } catch (error) {
    console.error('获取年级主任列表失败', error)
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchGradeList()
}

// 重置
const handleReset = () => {
  searchForm.stage = ''
  searchForm.status = ''
  searchForm.gradeName = ''
  handleSearch()
}

// 新增
const handleAdd = () => {
  router.push('/class/grade/add')
}

// 查看
const handleView = (row: GradeInfo) => {
  router.push(`/class/grade/detail/${row.id}`)
}

// 编辑
const handleEdit = (row: GradeInfo) => {
  router.push(`/class/grade/edit/${row.id}`)
}

// 查看班级
const handleViewClasses = (row: GradeInfo) => {
  router.push(`/class/list?gradeId=${row.id}`)
}

// 删除
const handleDelete = async (row: GradeInfo) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除年级「${row.gradeName}」吗？删除后该年级下的所有班级也将被删除！`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deleteGrade(row.id)
    ElMessage.success('删除成功')
    fetchGradeList()
    fetchStatistics()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个年级吗？删除后年级下的所有班级也将被删除！`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const ids = selectedRows.value.map(row => row.id)
    await batchDeleteGrade(ids)
    ElMessage.success('批量删除成功')
    fetchGradeList()
    fetchStatistics()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

// 导出
const handleExport = async () => {
  try {
    const params: GradeFilterParams = {
      ...searchForm,
      pageNum: 1,
      pageSize: 9999
    }
    const res = await exportGrades(params)

    // 创建下载链接
    const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `年级信息_${new Date().getTime()}.xlsx`
    link.click()

    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 批量调整状态
const handleBatchUpdateStatus = () => {
  statusDialog.visible = true
  statusDialog.status = ''
  statusDialog.reason = ''
}

// 确认批量调整状态
const confirmBatchUpdateStatus = async () => {
  if (!statusDialog.status) {
    ElMessage.warning('请选择状态')
    return
  }
  if (!statusDialog.reason) {
    ElMessage.warning('请输入调整原因')
    return
  }

  try {
    const promises = selectedRows.value.map(row =>
      updateGradeStatus(row.id, statusDialog.status, statusDialog.reason)
    )
    await Promise.all(promises)

    ElMessage.success('批量调整状态成功')
    statusDialog.visible = false
    fetchGradeList()
    fetchStatistics()
  } catch (error) {
    ElMessage.error('批量调整状态失败')
  }
}

// 分配年级主任
const handleAssignDirector = (row: GradeInfo) => {
  directorDialog.visible = true
  directorDialog.gradeId = row.id
  directorDialog.gradeName = row.gradeName
  directorDialog.currentDirector = row.gradeDirectorName || ''
  directorDialog.teacherId = ''
  directorDialog.reason = ''
}

// 确认分配年级主任
const confirmAssignDirector = async () => {
  if (!directorDialog.teacherId) {
    ElMessage.warning('请选择年级主任')
    return
  }
  if (!directorDialog.reason) {
    ElMessage.warning('请输入分配原因')
    return
  }

  try {
    await assignGradeDirector(
      directorDialog.gradeId,
      directorDialog.teacherId,
      directorDialog.reason
    )

    ElMessage.success('分配年级主任成功')
    directorDialog.visible = false
    fetchGradeList()
  } catch (error) {
    ElMessage.error('分配年级主任失败')
  }
}

// 选择变化
const handleSelectionChange = (rows: GradeInfo[]) => {
  selectedRows.value = rows
}

// 分页大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchGradeList()
}

// 页码变化
const handlePageChange = (val: number) => {
  currentPage.value = val
  fetchGradeList()
}

// 获取学段类型
const getStageType = (stage: string) => {
  const map: Record<string, string> = {
    primary: 'success',
    junior: 'warning',
    senior: 'danger'
  }
  return map[stage] || ''
}

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 初始化
onMounted(() => {
  fetchGradeList()
  fetchStatistics()
  fetchAvailableDirectors()
})
</script>

<style lang="scss" scoped>
.grade-list-container {
  padding: 20px;
}

.search-card {
  margin-top: 20px;

  .el-form-item {
    margin-bottom: 0;
  }
}

.action-card {
  margin-top: 20px;

  .action-buttons {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .left-buttons {
      display: flex;
      gap: 10px;
    }

    .right-info {
      display: flex;
      gap: 10px;
    }
  }
}

// 统计卡片样式
.stat-cards {
  margin-bottom: 20px;

  .stat-card {
    border-radius: 12px;
    padding: 20px;
    color: white;
    min-height: 140px;
    transition: all 0.3s;
    cursor: pointer;
    margin-bottom: 20px;

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
</style>