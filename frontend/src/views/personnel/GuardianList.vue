<template>
  <div class="guardian-list-container">
    <el-card>
      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :inline="true" :model="queryParams" ref="queryFormRef">
          <el-form-item label="监护人姓名">
            <el-input
              v-model="queryParams.guardianName"
              placeholder="请输入监护人姓名"
              clearable
              @keyup.enter="handleSearch"
              style="width: 160px"
            />
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input
              v-model="queryParams.phone"
              placeholder="请输入联系电话"
              clearable
              @keyup.enter="handleSearch"
              style="width: 160px"
            />
          </el-form-item>
          <el-form-item label="学生姓名">
            <el-input
              v-model="queryParams.studentName"
              placeholder="请输入学生姓名"
              clearable
              @keyup.enter="handleSearch"
              style="width: 160px"
            />
          </el-form-item>
          <el-form-item label="关系">
            <el-select
              v-model="queryParams.relation"
              placeholder="请选择关系"
              clearable
              style="width: 120px"
            >
              <el-option label="父亲" value="father" />
              <el-option label="母亲" value="mother" />
              <el-option label="祖父" value="grandfather" />
              <el-option label="祖母" value="grandmother" />
              <el-option label="叔叔" value="uncle" />
              <el-option label="阿姨" value="aunt" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
          <el-form-item label="年级">
            <el-select
              v-model="queryParams.gradeId"
              placeholder="请选择年级"
              clearable
              @change="handleGradeChange"
              style="width: 120px"
            >
              <el-option
                v-for="grade in gradeList"
                :key="grade.gradeId"
                :label="grade.gradeName"
                :value="grade.gradeId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="班级" v-if="queryParams.gradeId">
            <el-select
              v-model="queryParams.classId"
              placeholder="请选择班级"
              clearable
              style="width: 120px"
            >
              <el-option
                v-for="cls in classList"
                :key="cls.classId"
                :label="cls.className"
                :value="cls.classId"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :icon="Search">查询</el-button>
            <el-button @click="handleReset" :icon="Refresh">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 操作按钮 -->
      <div class="action-bar">
        <div class="action-bar-left">
          <!-- 左侧留空或放置其他内容 -->
        </div>
        <div class="action-bar-right">
          <el-button type="primary" @click="handleAdd" :icon="Plus">新增监护人</el-button>
          <el-button
            type="danger"
            @click="handleBatchDelete"
            :disabled="selectedRows.length === 0"
            :icon="Delete"
          >
            批量删除
          </el-button>
          <el-button @click="handleImport" :icon="Upload">导入</el-button>
          <el-button @click="handleExport" :icon="Download">导出</el-button>
        </div>
      </div>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        @selection-change="handleSelectionChange"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="guardianId" label="监护人ID" width="100" align="center" />
        <el-table-column prop="guardianName" label="姓名" width="100" align="center" />
        <el-table-column prop="relation" label="关系" width="80" align="center">
          <template #default="{ row }">
            <el-tag>{{ getRelationText(row.relation) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="idCardNumber" label="身份证号" width="180" align="center">
          <template #default="{ row }">
            {{ maskIdCard(row.idCardNumber) }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="联系电话" width="120" align="center" />
        <el-table-column prop="occupation" label="职业" width="100" align="center" />
        <el-table-column prop="homeAddress" label="家庭住址" min-width="200" show-overflow-tooltip />
        <el-table-column label="标记" width="150" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.isEmergencyContact" type="warning" size="small">紧急联系人</el-tag>
            <el-tag v-if="row.isLegalGuardian" type="primary" size="small">法定监护人</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="关联学生" width="150" align="center">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="handleViewStudents(row)"
            >
              {{ row.students?.length || 0 }}名学生
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="280" align="center" fixed="right">
          <template #default="{ row }">
            <div class="operation-buttons">
              <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
              <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button link type="primary" size="small" @click="handleBindStudent(row)">关联学生</el-button>
              <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 导入对话框 -->
    <el-dialog v-model="importDialogVisible" title="导入监护人数据" width="500px">
      <el-upload
        ref="uploadRef"
        :auto-upload="false"
        :limit="1"
        accept=".xlsx,.xls"
        :on-exceed="handleExceed"
        :on-change="handleFileChange"
      >
        <template #trigger>
          <el-button type="primary">选择文件</el-button>
        </template>
        <template #tip>
          <div class="el-upload__tip">
            只能上传 Excel 文件，且不超过 10MB
            <el-button link type="primary" @click="downloadTemplate">下载模板</el-button>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleImportConfirm">确定导入</el-button>
      </template>
    </el-dialog>

    <!-- 关联学生对话框 -->
    <el-dialog v-model="bindDialogVisible" title="关联学生" width="600px">
      <el-form :model="bindForm" ref="bindFormRef" label-width="100px">
        <el-form-item label="选择学生" prop="studentIds" required>
          <el-select
            v-model="bindForm.studentIds"
            multiple
            filterable
            remote
            reserve-keyword
            placeholder="请输入学生姓名或学号搜索"
            :remote-method="searchStudents"
            :loading="searchLoading"
            style="width: 100%"
          >
            <el-option
              v-for="student in studentOptions"
              :key="student.studentId"
              :label="`${student.studentName} (${student.studentId})`"
              :value="student.studentId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关系" prop="relation" required>
          <el-select v-model="bindForm.relation" placeholder="请选择关系">
            <el-option label="父亲" value="father" />
            <el-option label="母亲" value="mother" />
            <el-option label="祖父" value="grandfather" />
            <el-option label="祖母" value="grandmother" />
            <el-option label="叔叔" value="uncle" />
            <el-option label="阿姨" value="aunt" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="关系说明" v-if="bindForm.relation === 'other'">
          <el-input v-model="bindForm.relationOther" placeholder="请输入具体关系" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="bindDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBindConfirm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 查看关联学生对话框 -->
    <el-dialog v-model="studentsDialogVisible" title="关联学生列表" width="700px">
      <el-table :data="relatedStudents" border stripe>
        <el-table-column prop="studentId" label="学号" width="100" align="center" />
        <el-table-column prop="studentName" label="姓名" width="100" align="center" />
        <el-table-column prop="gradeName" label="年级" width="100" align="center" />
        <el-table-column prop="className" label="班级" width="100" align="center" />
        <el-table-column label="关系" width="100" align="center">
          <template #default="{ row }">
            <el-tag>{{ getRelationText(currentGuardian?.relation) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row }">
            <el-button
              link
              type="danger"
              size="small"
              @click="handleUnbind(row)"
            >
              解除关联
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UploadInstance, UploadRawFile } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Delete,
  Upload,
  Download
} from '@element-plus/icons-vue'
import {
  getGuardianList,
  deleteGuardian,
  batchDeleteGuardian,
  importGuardianData,
  exportGuardianData,
  getGuardianStudents,
  batchBindStudentGuardian,
  unbindStudentGuardian
} from '@/api/personnel'
import { getStudentList, getGradeClassCascade } from '@/api/personnel'
import type { GuardianInfo, GuardianQuery, StudentInfo } from '@/types/personnel'

const router = useRouter()
const loading = ref(false)
const tableData = ref<GuardianInfo[]>([])
const total = ref(0)
const selectedRows = ref<GuardianInfo[]>([])
const importDialogVisible = ref(false)
const bindDialogVisible = ref(false)
const studentsDialogVisible = ref(false)
const uploadRef = ref<UploadInstance>()
const uploadFile = ref<UploadRawFile>()
const searchLoading = ref(false)
const studentOptions = ref<StudentInfo[]>([])
const relatedStudents = ref<StudentInfo[]>([])
const currentGuardian = ref<GuardianInfo>()
const gradeList = ref<Array<{ gradeId: string; gradeName: string }>>([])
const classList = ref<Array<{ classId: string; className: string }>>([])
const gradeClassData = ref<Array<{
  gradeId: string;
  gradeName: string;
  classList: Array<{ classId: string; className: string }>;
}>>([])

// 查询参数
const queryParams = reactive<GuardianQuery>({
  pageNum: 1,
  pageSize: 10
})

// 绑定表单
const bindForm = reactive({
  guardianId: '',
  studentIds: [] as string[],
  relation: '' as any,
  relationOther: ''
})

// 获取关系文本
const getRelationText = (relation: string) => {
  const relationMap: Record<string, string> = {
    father: '父亲',
    mother: '母亲',
    grandfather: '祖父',
    grandmother: '祖母',
    uncle: '叔叔',
    aunt: '阿姨',
    other: '其他'
  }
  return relationMap[relation] || relation
}

// 身份证号脱敏
const maskIdCard = (idCard: string) => {
  if (!idCard || idCard.length < 15) return idCard
  return idCard.substring(0, 6) + '********' + idCard.substring(14)
}

// 获取年级班级数据
const fetchGradeClassData = async () => {
  try {
    const res = await getGradeClassCascade()
    if (res && res.data) {
      gradeClassData.value = res.data
      gradeList.value = res.data.map(item => ({
        gradeId: item.gradeId,
        gradeName: item.gradeName
      }))
    }
  } catch (error) {
    console.error('获取年级班级数据失败:', error)
  }
}

// 年级变化
const handleGradeChange = () => {
  queryParams.classId = ''
  const grade = gradeClassData.value.find(item => item.gradeId === queryParams.gradeId)
  classList.value = grade?.classList || []
}

// 获取监护人列表
const fetchGuardianList = async () => {
  loading.value = true
  try {
    console.log('开始获取监护人列表，参数:', queryParams)
    const res = await getGuardianList(queryParams)
    console.log('监护人列表响应:', res)
    if (res && res.data) {
      tableData.value = res.data.list
      total.value = res.data.total
      console.log('设置表格数据:', tableData.value)
      console.log('总数:', total.value)
    }
  } catch (error) {
    console.error('获取监护人列表错误:', error)
    ElMessage.error('获取监护人列表失败')
  } finally {
    loading.value = false
  }
}


// 搜索学生
const searchStudents = async (query: string) => {
  if (query) {
    searchLoading.value = true
    try {
      const res = await getStudentList({
        keyword: query,
        pageNum: 1,
        pageSize: 20
      })
      if (res && res.data) {
        studentOptions.value = res.data.list
      }
    } catch (error) {
      ElMessage.error('搜索学生失败')
    } finally {
      searchLoading.value = false
    }
  }
}

// 查询
const handleSearch = () => {
  queryParams.pageNum = 1
  fetchGuardianList()
}

// 重置
const handleReset = () => {
  queryParams.guardianName = undefined
  queryParams.phone = undefined
  queryParams.studentName = undefined
  queryParams.studentId = undefined
  queryParams.gradeId = undefined
  queryParams.classId = undefined
  queryParams.relation = undefined
  queryParams.pageNum = 1
  fetchGuardianList()
}

// 新增
const handleAdd = () => {
  router.push('/personnel/guardian/add')
}

// 查看
const handleView = (row: GuardianInfo) => {
  router.push(`/personnel/guardian/detail/${row.guardianId}`)
}

// 编辑
const handleEdit = (row: GuardianInfo) => {
  router.push(`/personnel/guardian/edit/${row.guardianId}`)
}

// 删除
const handleDelete = async (row: GuardianInfo) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除监护人 ${row.guardianName} 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await deleteGuardian(row.guardianId)
    ElMessage.success('删除成功')
    fetchGuardianList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个监护人吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    const guardianIds = selectedRows.value.map(row => row.guardianId)
    await batchDeleteGuardian(guardianIds)
    ElMessage.success('批量删除成功')
    fetchGuardianList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '批量删除失败')
    }
  }
}

// 关联学生
const handleBindStudent = (row: GuardianInfo) => {
  currentGuardian.value = row
  bindForm.guardianId = row.guardianId
  bindForm.studentIds = []
  bindForm.relation = row.relation
  bindForm.relationOther = row.relationOther || ''
  bindDialogVisible.value = true
}

// 确认关联
const handleBindConfirm = async () => {
  if (!bindForm.studentIds.length) {
    ElMessage.warning('请选择要关联的学生')
    return
  }
  if (!bindForm.relation) {
    ElMessage.warning('请选择关系')
    return
  }

  try {
    await batchBindStudentGuardian({
      guardianId: bindForm.guardianId,
      studentIds: bindForm.studentIds,
      relation: bindForm.relation,
      relationOther: bindForm.relationOther
    })
    ElMessage.success('关联成功')
    bindDialogVisible.value = false
    fetchGuardianList()
  } catch (error: any) {
    ElMessage.error(error.message || '关联失败')
  }
}

// 查看关联学生
const handleViewStudents = async (row: GuardianInfo) => {
  currentGuardian.value = row
  loading.value = true
  try {
    const res = await getGuardianStudents(row.guardianId)
    if (res && res.data) {
      relatedStudents.value = res.data
      studentsDialogVisible.value = true
    }
  } catch (error) {
    ElMessage.error('获取关联学生失败')
  } finally {
    loading.value = false
  }
}

// 解除关联
const handleUnbind = async (student: StudentInfo) => {
  try {
    await ElMessageBox.confirm(
      `确定要解除与学生 ${student.studentName} 的关联吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await unbindStudentGuardian(student.studentId, currentGuardian.value!.guardianId)
    ElMessage.success('解除关联成功')
    handleViewStudents(currentGuardian.value!)
    fetchGuardianList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '解除关联失败')
    }
  }
}

// 导入
const handleImport = () => {
  importDialogVisible.value = true
}

// 文件变化
const handleFileChange = (file: any) => {
  uploadFile.value = file.raw
}

// 文件超出限制
const handleExceed = () => {
  ElMessage.warning('只能上传一个文件')
}

// 下载模板
const downloadTemplate = () => {
  const link = document.createElement('a')
  link.href = '/api/guardian/template'
  link.download = '监护人导入模板.xlsx'
  link.click()
}

// 确认导入
const handleImportConfirm = async () => {
  if (!uploadFile.value) {
    ElMessage.warning('请选择要导入的文件')
    return
  }

  try {
    const res = await importGuardianData(uploadFile.value as File)
    if (res && res.data) {
      const { success, failed, errors } = res.data
      if (failed > 0) {
        ElMessage.warning(`导入完成：成功 ${success} 条，失败 ${failed} 条`)
        console.error('导入错误详情:', errors)
      } else {
        ElMessage.success(`导入成功：共 ${success} 条数据`)
      }
      importDialogVisible.value = false
      fetchGuardianList()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '导入失败')
  }
}

// 导出
const handleExport = async () => {
  try {
    const res = await exportGuardianData(queryParams)
    const blob = new Blob([res as any], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `监护人数据_${new Date().getTime()}.xlsx`
    link.click()
    ElMessage.success('导出成功')
  } catch (error: any) {
    ElMessage.error(error.message || '导出失败')
  }
}

// 选择变化
const handleSelectionChange = (selection: GuardianInfo[]) => {
  selectedRows.value = selection
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  queryParams.pageSize = size
  fetchGuardianList()
}

// 页码变化
const handleCurrentChange = (page: number) => {
  queryParams.pageNum = page
  fetchGuardianList()
}

// 初始化
onMounted(() => {
  console.log('GuardianList组件已挂载')
  fetchGradeClassData()
  fetchGuardianList()
})
</script>

<style lang="scss" scoped>
.guardian-list-container {
  padding: 20px;

  .search-bar {
    margin-bottom: 20px;
  }

  .action-bar {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .action-bar-left {
      flex: 1;
    }

    .action-bar-right {
      display: flex;
      gap: 10px;
    }
  }

  .operation-buttons {
    display: flex;
    justify-content: center;
    gap: 5px;
    white-space: nowrap;
  }

  .el-pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>