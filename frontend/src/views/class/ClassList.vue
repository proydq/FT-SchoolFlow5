<template>
  <div class="class-list-container">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="年级">
          <el-select
            v-model="searchForm.gradeId"
            placeholder="请选择年级"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="grade in gradeList"
              :key="grade.id"
              :label="grade.gradeName"
              :value="grade.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="正常" value="normal" />
            <el-option label="拆分中" value="splitting" />
            <el-option label="已合并" value="merged" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级名称">
          <el-input
            v-model="searchForm.className"
            placeholder="请输入班级名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="班主任">
          <el-select
            v-model="searchForm.teacherId"
            placeholder="请选择班主任"
            clearable
            filterable
            style="width: 180px"
          >
            <el-option
              v-for="teacher in teacherList"
              :key="teacher.id"
              :label="`${teacher.name} (${teacher.code})`"
              :value="teacher.id"
            />
          </el-select>
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
            新增班级
          </el-button>
          <el-button @click="handleImport">
            <el-icon><Upload /></el-icon>
            批量导入
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
          <el-button
            :disabled="selectedRows.length === 0"
            @click="handleBatchUpdateTeacher"
          >
            <el-icon><User /></el-icon>
            批量分配班主任
          </el-button>
        </div>
        <div class="right-info">
          <el-tag>共 {{ total }} 个班级</el-tag>
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
        <el-table-column prop="className" label="班级名称" width="120" />
        <el-table-column prop="gradeName" label="所属年级" width="100" />
        <el-table-column prop="location" label="班级位置" min-width="150" />
        <el-table-column prop="studentCount" label="学生数" width="80" align="center">
          <template #default="{ row }">
            <el-tag>{{ row.studentCount }}人</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="teacherName" label="班主任" width="120">
          <template #default="{ row }">
            <span v-if="row.teacherName">
              {{ row.teacherName }}
              <el-text type="info" size="small">({{ row.teacherCode }})</el-text>
            </span>
            <el-tag v-else type="warning" size="small">未分配</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="getStatusType(row.status)"
              effect="plain"
            >
              {{ getStatusText(row.status) }}
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
              <el-button link type="primary" size="small" @click="handleAssignTeacher(row)">分配班主任</el-button>
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
        <el-form-item label="选中班级">
          <el-tag>已选择 {{ selectedRows.length }} 个班级</el-tag>
        </el-form-item>
        <el-form-item label="调整为" required>
          <el-select v-model="statusDialog.status" placeholder="请选择状态">
            <el-option label="正常" value="normal" />
            <el-option label="拆分中" value="splitting" />
            <el-option label="已合并" value="merged" />
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

    <!-- 批量分配班主任对话框 -->
    <el-dialog
      v-model="teacherDialog.visible"
      title="批量分配班主任"
      width="500px"
    >
      <el-form :model="teacherDialog" label-width="100px">
        <el-form-item label="选中班级">
          <el-tag>已选择 {{ selectedRows.length }} 个班级</el-tag>
        </el-form-item>
        <el-form-item label="班主任" required>
          <el-select
            v-model="teacherDialog.teacherId"
            placeholder="请选择班主任"
            filterable
          >
            <el-option
              v-for="teacher in availableTeachers"
              :key="teacher.id"
              :label="`${teacher.name} (${teacher.code})`"
              :value="teacher.id"
            >
              <div style="display: flex; justify-content: space-between;">
                <span>{{ teacher.name }}</span>
                <span style="color: #909399;">{{ teacher.code }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分配原因" required>
          <el-input
            v-model="teacherDialog.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入分配原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="teacherDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmBatchUpdateTeacher">确定</el-button>
      </template>
    </el-dialog>
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
  Delete,
  Edit,
  User
} from '@element-plus/icons-vue'
import {
  getClassList,
  deleteClass,
  batchDeleteClass,
  updateClassStatus,
  batchUpdateTeacher,
  getGradeList,
  getAvailableTeachers,
  exportClasses
} from '@/api/class'
import type { ClassInfo, ClassFilterParams, ClassStatus } from '@/types/class'

const router = useRouter()

// 搜索表单
const searchForm = reactive({
  gradeId: '',
  status: '',
  className: '',
  teacherId: ''
})

// 表格数据
const tableData = ref<ClassInfo[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const selectedRows = ref<ClassInfo[]>([])

// 下拉列表数据
const gradeList = ref<any[]>([])
const teacherList = ref<any[]>([])
const availableTeachers = ref<any[]>([])

// 对话框
const statusDialog = reactive({
  visible: false,
  status: '',
  reason: ''
})

const teacherDialog = reactive({
  visible: false,
  teacherId: '',
  reason: ''
})

// 获取班级列表
const fetchClassList = async () => {
  loading.value = true
  try {
    const params: ClassFilterParams = {
      ...searchForm,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    const res = await getClassList(params)
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    ElMessage.error('获取班级列表失败')
  } finally {
    loading.value = false
  }
}

// 获取年级列表
const fetchGradeList = async () => {
  try {
    const res = await getGradeList()
    gradeList.value = res.data
  } catch (error) {
    console.error('获取年级列表失败', error)
  }
}

// 获取教师列表
const fetchTeacherList = async () => {
  try {
    const res = await getAvailableTeachers()
    teacherList.value = res.data
    availableTeachers.value = res.data
  } catch (error) {
    console.error('获取教师列表失败', error)
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchClassList()
}

// 重置
const handleReset = () => {
  searchForm.gradeId = ''
  searchForm.status = ''
  searchForm.className = ''
  searchForm.teacherId = ''
  handleSearch()
}

// 新增
const handleAdd = () => {
  router.push('/class/add')
}

// 查看
const handleView = (row: ClassInfo) => {
  router.push(`/class/detail/${row.id}`)
}

// 编辑
const handleEdit = (row: ClassInfo) => {
  router.push(`/class/edit/${row.id}`)
}

// 分配班主任
const handleAssignTeacher = (row: ClassInfo) => {
  router.push(`/class/assign-teacher/${row.id}`)
}

// 删除
const handleDelete = async (row: ClassInfo) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除班级「${row.className}」吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deleteClass(row.id)
    ElMessage.success('删除成功')
    fetchClassList()
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
      `确定要删除选中的 ${selectedRows.value.length} 个班级吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const ids = selectedRows.value.map(row => row.id)
    await batchDeleteClass(ids)
    ElMessage.success('批量删除成功')
    fetchClassList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

// 导入
const handleImport = () => {
  router.push('/class/import')
}

// 导出
const handleExport = async () => {
  try {
    const params: ClassFilterParams = {
      ...searchForm,
      pageNum: 1,
      pageSize: 9999
    }
    const res = await exportClasses(params)

    // 创建下载链接
    const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `班级信息_${new Date().getTime()}.xlsx`
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
      updateClassStatus(row.id, statusDialog.status, statusDialog.reason)
    )
    await Promise.all(promises)

    ElMessage.success('批量调整状态成功')
    statusDialog.visible = false
    fetchClassList()
  } catch (error) {
    ElMessage.error('批量调整状态失败')
  }
}

// 批量分配班主任
const handleBatchUpdateTeacher = () => {
  teacherDialog.visible = true
  teacherDialog.teacherId = ''
  teacherDialog.reason = ''
}

// 确认批量分配班主任
const confirmBatchUpdateTeacher = async () => {
  if (!teacherDialog.teacherId) {
    ElMessage.warning('请选择班主任')
    return
  }
  if (!teacherDialog.reason) {
    ElMessage.warning('请输入分配原因')
    return
  }

  try {
    const classIds = selectedRows.value.map(row => row.id)
    await batchUpdateTeacher(classIds, teacherDialog.teacherId, teacherDialog.reason)

    ElMessage.success('批量分配班主任成功')
    teacherDialog.visible = false
    fetchClassList()
  } catch (error) {
    ElMessage.error('批量分配班主任失败')
  }
}

// 选择变化
const handleSelectionChange = (rows: ClassInfo[]) => {
  selectedRows.value = rows
}

// 分页大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchClassList()
}

// 页码变化
const handlePageChange = (val: number) => {
  currentPage.value = val
  fetchClassList()
}

// 获取状态类型
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    normal: 'success',
    splitting: 'warning',
    merged: 'info'
  }
  return map[status] || ''
}

// 获取状态文本
const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    normal: '正常',
    splitting: '拆分中',
    merged: '已合并'
  }
  return map[status] || status
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
  fetchClassList()
  fetchGradeList()
  fetchTeacherList()
})
</script>

<style lang="scss" scoped>
.class-list-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;

  .el-form-item {
    margin-bottom: 0;
  }
}

.action-card {
  margin-bottom: 20px;

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
</style>