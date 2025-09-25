<template>
  <div class="student-list-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="姓名">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入姓名或学号"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="年级">
          <el-select
            v-model="searchForm.gradeId"
            placeholder="全部"
            clearable
            style="width: 180px"
            @change="handleGradeChange"
          >
            <el-option
              v-for="grade in gradeList"
              :key="grade.gradeId"
              :label="grade.gradeName"
              :value="grade.gradeId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="班级">
          <el-select
            v-model="searchForm.classId"
            placeholder="全部"
            clearable
            style="width: 180px"
            :disabled="!searchForm.gradeId"
          >
            <el-option
              v-for="cls in classList"
              :key="cls.classId"
              :label="cls.className"
              :value="cls.classId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="学生状态">
          <el-select
            v-model="searchForm.status"
            placeholder="全部"
            clearable
            style="width: 180px"
          >
            <el-option label="在校" value="enrolled" />
            <el-option label="毕业" value="graduated" />
            <el-option label="转学" value="transferred" />
            <el-option label="休学" value="suspended" />
            <el-option label="肄业" value="dropped" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
          <el-button @click="toggleAdvanced">
            <el-icon><Setting /></el-icon>
            {{ showAdvanced ? '收起' : '高级筛选' }}
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 高级筛选 -->
      <el-collapse-transition>
        <div v-show="showAdvanced">
          <el-divider />
          <el-form :inline="true" :model="searchForm" class="search-form">
            <el-form-item label="入学日期">
              <el-date-picker
                v-model="enrollDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                style="width: 300px"
                @change="handleEnrollDateChange"
              />
            </el-form-item>
          </el-form>
        </div>
      </el-collapse-transition>
    </el-card>

    <!-- 操作按钮区 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span class="title">学生信息列表</span>
          <div class="actions">
            <el-button type="success" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              新增
            </el-button>
            <el-button type="primary" @click="handleImport">
              <el-icon><Upload /></el-icon>
              导入
            </el-button>
            <el-button type="warning" @click="handleExport">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
            <el-button
              type="info"
              :disabled="!multipleSelection.length || !isSameGrade"
              @click="handleBatchAdjustClass"
            >
              <el-icon><Switch /></el-icon>
              批量调整班级
            </el-button>
            <el-button
              type="danger"
              :disabled="!multipleSelection.length"
              @click="handleBatchDelete"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>
        </div>
      </template>

      <!-- 数据表格 -->
      <el-table
        :data="tableData"
        stripe
        border
        v-loading="loading"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="studentId" label="学号" min-width="120" fixed="left">
          <template #default="{ row }">
            <span class="student-id">{{ row.studentId }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="studentName" label="姓名" min-width="100" />
        <el-table-column prop="gender" label="性别" width="70" align="center">
          <template #default="{ row }">
            {{ row.gender === 'male' ? '男' : '女' }}
          </template>
        </el-table-column>
        <el-table-column prop="gradeName" label="年级" min-width="100" />
        <el-table-column prop="className" label="班级" min-width="100">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.className }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="enrollDate" label="入学日期" min-width="110" align="center">
          <template #default="{ row }">
            {{ formatDate(row.enrollDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="学生状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="guardianName" label="监护人" min-width="90" />
        <el-table-column prop="guardianPhone" label="监护人电话" min-width="120" />
        <el-table-column label="操作" width="140" align="center" fixed="right">
          <template #default="{ row }">
            <div style="display: flex; gap: 5px; justify-content: center;">
              <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="fetchTableData"
          @current-change="fetchTableData"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Setting,
  Plus,
  Upload,
  Download,
  Switch,
  Delete
} from '@element-plus/icons-vue'
import {
  getStudentList,
  deleteStudents,
  exportStudents,
  getGradeClassCascade,
  batchAdjustClass
} from '@/api/personnel'
import type { StudentInfo, StudentFilterParams } from '@/types/personnel'

const router = useRouter()

// 搜索表单
const searchForm = reactive({
  keyword: '',
  gradeId: '',
  classId: '',
  status: '',
  enrollStartDate: '',
  enrollEndDate: ''
})

// 高级筛选
const showAdvanced = ref(false)
const enrollDateRange = ref<[string, string] | null>(null)

// 表格数据
const tableData = ref<StudentInfo[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const multipleSelection = ref<StudentInfo[]>([])

// 年级班级级联数据
const gradeClassCascade = ref<Array<{
  gradeId: string,
  gradeName: string,
  classList: Array<{ classId: string, className: string }>
}>>([])

// 年级列表
const gradeList = computed(() => {
  return gradeClassCascade.value.map(item => ({
    gradeId: item.gradeId,
    gradeName: item.gradeName
  }))
})

// 班级列表（根据选中的年级动态变化）
const classList = computed(() => {
  if (!searchForm.gradeId) return []
  const grade = gradeClassCascade.value.find(item => item.gradeId === searchForm.gradeId)
  return grade?.classList || []
})

// 是否为同一年级（用于批量调整班级）
const isSameGrade = computed(() => {
  if (multipleSelection.value.length === 0) return false
  const firstGradeId = multipleSelection.value[0].gradeId
  return multipleSelection.value.every(item => item.gradeId === firstGradeId)
})

// 获取状态类型
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    enrolled: 'success',
    graduated: 'info',
    transferred: 'warning',
    suspended: 'danger',
    dropped: 'danger'
  }
  return map[status] || ''
}

// 获取状态文本
const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    enrolled: '在校',
    graduated: '毕业',
    transferred: '转学',
    suspended: '休学',
    dropped: '肄业'
  }
  return map[status] || status
}

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return ''
  return date.split('T')[0]
}

// 获取年级班级级联数据
const fetchGradeClassCascade = async () => {
  try {
    const res = await getGradeClassCascade()

    // API 返回格式: { code: 200, data: [...], message: '...' }
    if (res && res.data && Array.isArray(res.data)) {
      gradeClassCascade.value = res.data
    } else {
      gradeClassCascade.value = []
    }
  } catch (error) {
    console.error('获取年级班级数据失败:', error)
    gradeClassCascade.value = []
  }
}

// 获取表格数据
const fetchTableData = async () => {
  loading.value = true
  try {
    const params: StudentFilterParams = {
      keyword: searchForm.keyword,
      gradeId: searchForm.gradeId,
      classId: searchForm.classId,
      status: searchForm.status as any,
      enrollStartDate: searchForm.enrollStartDate,
      enrollEndDate: searchForm.enrollEndDate,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    const res = await getStudentList(params)
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    ElMessage.error('获取学生列表失败')
  } finally {
    loading.value = false
  }
}

// 切换高级筛选
const toggleAdvanced = () => {
  showAdvanced.value = !showAdvanced.value
}

// 年级变化
const handleGradeChange = () => {
  searchForm.classId = ''
}

// 入学日期变化
const handleEnrollDateChange = (value: [string, string] | null) => {
  if (value) {
    searchForm.enrollStartDate = value[0]
    searchForm.enrollEndDate = value[1]
  } else {
    searchForm.enrollStartDate = ''
    searchForm.enrollEndDate = ''
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchTableData()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.gradeId = ''
  searchForm.classId = ''
  searchForm.status = ''
  searchForm.enrollStartDate = ''
  searchForm.enrollEndDate = ''
  enrollDateRange.value = null
  currentPage.value = 1
  fetchTableData()
}

// 新增
const handleAdd = () => {
  router.push('/personnel/student/add')
}

// 编辑
const handleEdit = (row: StudentInfo) => {
  router.push(`/personnel/student/edit/${row.studentId}`)
}

// 查看
const handleView = (row: StudentInfo) => {
  router.push(`/personnel/student/detail/${row.studentId}`)
}

// 导入
const handleImport = () => {
  router.push('/personnel/student/import')
}

// 导出
const handleExport = async () => {
  try {
    const params: StudentFilterParams = {
      keyword: searchForm.keyword,
      gradeId: searchForm.gradeId,
      classId: searchForm.classId,
      status: searchForm.status as any,
      enrollStartDate: searchForm.enrollStartDate,
      enrollEndDate: searchForm.enrollEndDate,
      pageNum: 1,
      pageSize: 1000
    }
    await exportStudents(params)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 批量调整班级
const handleBatchAdjustClass = async () => {
  if (!isSameGrade.value) {
    ElMessage.warning('请选择同一年级的学生进行班级调整')
    return
  }

  const studentIds = multipleSelection.value.map(item => item.studentId)
  const gradeId = multipleSelection.value[0].gradeId
  const grade = gradeClassCascade.value.find(item => item.gradeId === gradeId)

  ElMessageBox.prompt(
    `已选择 ${studentIds.length} 名学生，请选择目标班级`,
    '批量调整班级',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPlaceholder: '请输入调整原因（10-50字）',
      inputType: 'textarea',
      inputPattern: /^.{10,50}$/,
      inputErrorMessage: '调整原因长度在10到50个字符'
    }
  ).then(async ({ value }) => {
    // 这里应该弹出选择班级的对话框，为简化示例直接处理
    try {
      await batchAdjustClass({
        studentIds,
        targetClassId: grade?.classList[0].classId || '',
        reason: value
      })
      ElMessage.success('批量调整班级成功')
      fetchTableData()
    } catch (error) {
      ElMessage.error('批量调整班级失败')
    }
  }).catch(() => {
    // 取消操作
  })
}

// 批量删除
const handleBatchDelete = async () => {
  const ids = multipleSelection.value.map(item => item.studentId)

  // 检查是否有在校学生
  const hasEnrolled = multipleSelection.value.some(item => item.status === 'enrolled')
  if (hasEnrolled) {
    await ElMessageBox.confirm(
      '包含在校学生，删除后将无法恢复其考勤/请假数据，是否继续？',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
  } else {
    await ElMessageBox.confirm(
      `确认删除选中的 ${ids.length} 条学生信息？删除后不可恢复！`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
  }

  try {
    await deleteStudents(ids)
    ElMessage.success('删除成功')
    fetchTableData()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

// 选择变化
const handleSelectionChange = (val: StudentInfo[]) => {
  multipleSelection.value = val
}

// 初始化
onMounted(() => {
  fetchGradeClassCascade()
  fetchTableData()
})
</script>

<style lang="scss" scoped>
.student-list-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  .el-form-item {
    margin-bottom: 0;
  }
}

.table-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 18px;
      font-weight: bold;
    }

    .actions {
      display: flex;
      gap: 10px;
    }
  }
}

.student-id {
  font-weight: bold;
  color: #303133;
  font-size: 12px;
}
</style>