<template>
  <div class="teacher-list-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="姓名">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入姓名或工号"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="工号">
          <el-input
            v-model="searchForm.teacherId"
            placeholder="请输入工号"
            clearable
            style="width: 180px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="部门">
          <el-select
            v-model="searchForm.department"
            placeholder="全部"
            clearable
            style="width: 180px"
          >
            <el-option
              v-for="dept in departmentList"
              :key="dept.departmentId"
              :label="dept.departmentName"
              :value="dept.departmentId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="职位">
          <el-select
            v-model="searchForm.position"
            placeholder="全部"
            clearable
            style="width: 180px"
          >
            <el-option label="校长" value="principal" />
            <el-option label="教务主任" value="academic_director" />
            <el-option label="年级主任" value="grade_director" />
            <el-option label="班主任" value="class_teacher" />
            <el-option label="普通教师" value="teacher" />
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
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮区 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span class="title">教师信息列表</span>
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
        <el-table-column prop="teacherId" label="工号" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="teacher-id">{{ row.teacherId }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="teacherName" label="姓名" min-width="100" />
        <el-table-column prop="gender" label="性别" width="70" align="center">
          <template #default="{ row }">
            {{ row.gender === 'male' ? '男' : '女' }}
          </template>
        </el-table-column>
        <el-table-column prop="department" label="部门" min-width="120" show-overflow-tooltip />
        <el-table-column prop="position" label="职位" min-width="140">
          <template #default="{ row }">
            <span>{{ getPositionText(row.position) }}</span>
            <span v-if="row.relatedClass" class="related-info">
              ({{ row.relatedClass }})
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="joinDate" label="入职时间" min-width="110" align="center">
          <template #default="{ row }">
            {{ formatDate(row.joinDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="人员状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Upload,
  Download,
  Delete
} from '@element-plus/icons-vue'
import {
  getTeacherList,
  deleteTeachers,
  exportTeachers,
  getDepartmentList
} from '@/api/personnel'
import type { TeacherInfo, TeacherFilterParams, Department } from '@/types/personnel'

const router = useRouter()

// 搜索表单
const searchForm = reactive({
  keyword: '',
  teacherId: '',
  department: '',
  position: ''
})

// 表格数据
const tableData = ref<TeacherInfo[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const multipleSelection = ref<TeacherInfo[]>([])

// 部门列表
const departmentList = ref<Department[]>([])

// 获取职位文本
const getPositionText = (position: string) => {
  const map: Record<string, string> = {
    principal: '校长',
    academic_director: '教务主任',
    grade_director: '年级主任',
    class_teacher: '班主任',
    teacher: '普通教师'
  }
  return map[position] || position
}

// 获取状态类型
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    active: 'success',
    resigned: 'warning',
    retired: 'info'
  }
  return map[status] || ''
}

// 获取状态文本
const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    active: '在职',
    resigned: '离职',
    retired: '退休'
  }
  return map[status] || status
}

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return ''
  return date.split('T')[0]
}

// 获取表格数据
const fetchTableData = async () => {
  loading.value = true
  try {
    const params: TeacherFilterParams = {
      keyword: searchForm.keyword,
      teacherId: searchForm.teacherId,
      department: searchForm.department,
      position: searchForm.position as any,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    const res = await getTeacherList(params)
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    ElMessage.error('获取教师列表失败')
  } finally {
    loading.value = false
  }
}

// 获取部门列表
const fetchDepartmentList = async () => {
  try {
    const res = await getDepartmentList()
    departmentList.value = res.data
  } catch (error) {
    console.error('获取部门列表失败', error)
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
  searchForm.teacherId = ''
  searchForm.department = ''
  searchForm.position = ''
  currentPage.value = 1
  fetchTableData()
}

// 新增
const handleAdd = () => {
  router.push('/personnel/teacher/add')
}

// 编辑
const handleEdit = (row: TeacherInfo) => {
  router.push(`/personnel/teacher/edit/${row.teacherId}`)
}

// 查看
const handleView = (row: TeacherInfo) => {
  router.push(`/personnel/teacher/detail/${row.teacherId}`)
}

// 导入
const handleImport = () => {
  router.push('/personnel/teacher/import')
}

// 导出
const handleExport = async () => {
  try {
    const params: TeacherFilterParams = {
      keyword: searchForm.keyword,
      teacherId: searchForm.teacherId,
      department: searchForm.department,
      position: searchForm.position as any,
      pageNum: 1,
      pageSize: 1000
    }
    await exportTeachers(params)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 批量删除
const handleBatchDelete = async () => {
  const ids = multipleSelection.value.map(item => item.teacherId)

  // 检查是否有在职教师
  const hasActive = multipleSelection.value.some(item => item.status === 'active')
  if (hasActive) {
    await ElMessageBox.confirm(
      '包含在职教师，删除后将无法恢复其考勤/请假数据，是否继续？',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
  } else {
    await ElMessageBox.confirm(
      `确认删除选中的 ${ids.length} 条教师信息？删除后不可恢复！`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
  }

  try {
    await deleteTeachers(ids)
    ElMessage.success('删除成功')
    fetchTableData()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

// 选择变化
const handleSelectionChange = (val: TeacherInfo[]) => {
  multipleSelection.value = val
}

// 初始化
onMounted(() => {
  fetchDepartmentList()
  fetchTableData()
})
</script>

<style lang="scss" scoped>
.teacher-list-container {
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

.teacher-id {
  font-weight: bold;
  color: #303133;
}

.related-info {
  color: #909399;
  font-size: 12px;
  margin-left: 4px;
}
</style>