<template>
  <div class="class-detail-container">
    <el-page-header @back="handleBack">
      <template #title>
        <span>班级详情</span>
      </template>
      <template #extra>
        <el-button type="primary" @click="handleEdit">
          <el-icon><Edit /></el-icon>
          编辑
        </el-button>
      </template>
    </el-page-header>

    <!-- 基本信息 -->
    <el-card style="margin-top: 20px" v-loading="loading">
      <template #header>
        <span>基本信息</span>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="班级名称">
          {{ classInfo.className }}
        </el-descriptions-item>
        <el-descriptions-item label="所属年级">
          {{ classInfo.gradeName }}
        </el-descriptions-item>
        <el-descriptions-item label="班级位置">
          {{ classInfo.location || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="排序">
          {{ classInfo.sort }}
        </el-descriptions-item>
        <el-descriptions-item label="班级状态">
          <el-tag :type="getStatusType(classInfo.status)">
            {{ getStatusText(classInfo.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="学生人数">
          <el-tag type="info">{{ classInfo.studentCount }} 人</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="班主任">
          <span v-if="classInfo.teacherName">
            {{ classInfo.teacherName }}
            <el-text type="info" size="small">({{ classInfo.teacherCode }})</el-text>
          </span>
          <el-tag v-else type="warning" size="small">未分配</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDate(classInfo.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ classInfo.remark || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 学生列表 -->
    <el-card style="margin-top: 20px">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>学生列表</span>
          <div>
            <el-button size="small" @click="handleAddStudent">
              <el-icon><Plus /></el-icon>
              添加学生
            </el-button>
            <el-button size="small" @click="handleBatchTransfer">
              <el-icon><Switch /></el-icon>
              批量转班
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="studentList"
        stripe
        border
        v-loading="studentLoading"
        @selection-change="handleSelectionChange"
        style="width: 100%"
      >
        <el-table-column type="selection" width="60" align="center" />
        <el-table-column prop="studentCode" label="学号" width="140" />
        <el-table-column prop="studentName" label="姓名" width="120" />
        <el-table-column prop="gender" label="性别" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.gender === '男' ? 'primary' : 'danger'" size="small">
              {{ row.gender }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="age" label="年龄" width="80" align="center" />
        <el-table-column prop="contactPhone" label="联系电话" width="150" />
        <el-table-column prop="guardianName" label="监护人" width="120" />
        <el-table-column prop="guardianPhone" label="监护人电话" width="150" />
        <el-table-column prop="enrollmentDate" label="入学时间" width="120">
          <template #default="{ row }">
            {{ formatDateOnly(row.enrollmentDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === 'active' ? '在读' : '已离校' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div style="display: flex; gap: 5px;">
              <el-button link type="primary" size="small" @click="handleViewStudent(row)">查看</el-button>
              <el-button link type="primary" size="small" @click="handleTransferStudent(row)">转班</el-button>
              <el-button link type="danger" size="small" @click="handleRemoveStudent(row)">移除</el-button>
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
          :total="studentTotal"
          layout="total, sizes, prev, pager, next"
          @size-change="fetchStudentList"
          @current-change="fetchStudentList"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Plus, Switch } from '@element-plus/icons-vue'
import { getClassDetail, getClassStudents } from '@/api/class'
import type { ClassInfo } from '@/types/class'

const route = useRoute()
const router = useRouter()

const classId = computed(() => route.params.id as string)

// 班级信息
const classInfo = ref<ClassInfo>({} as ClassInfo)
const loading = ref(false)

// 学生列表
const studentList = ref<any[]>([])
const studentLoading = ref(false)
const studentTotal = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const selectedStudents = ref<any[]>([])


// 获取班级详情
const fetchClassDetail = async () => {
  loading.value = true
  try {
    const res = await getClassDetail(classId.value)
    classInfo.value = res.data
  } catch (error) {
    ElMessage.error('获取班级详情失败')
    router.back()
  } finally {
    loading.value = false
  }
}

// 获取学生列表
const fetchStudentList = async () => {
  studentLoading.value = true
  try {
    const res = await getClassStudents(classId.value)
    studentList.value = res.data
    studentTotal.value = res.data.length
  } catch (error) {
    ElMessage.error('获取学生列表失败')
  } finally {
    studentLoading.value = false
  }
}

// 返回
const handleBack = () => {
  router.push('/class/list')
}

// 编辑
const handleEdit = () => {
  router.push(`/class/edit/${classId.value}`)
}

// 添加学生
const handleAddStudent = () => {
  ElMessage.info('添加学生功能开发中')
}

// 批量转班
const handleBatchTransfer = () => {
  if (selectedStudents.value.length === 0) {
    ElMessage.warning('请先选择要转班的学生')
    return
  }
  ElMessage.info('批量转班功能开发中')
}

// 查看学生
const handleViewStudent = (row: any) => {
  router.push(`/personnel/student/detail/${row.id}`)
}

// 转班
const handleTransferStudent = (row: any) => {
  ElMessage.info('转班功能开发中')
}

// 移除学生
const handleRemoveStudent = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要将学生「${row.studentName}」移出本班级吗？`,
      '移除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    ElMessage.success('移除成功')
    fetchStudentList()
  } catch (error) {
    // 取消操作
  }
}

// 选择变化
const handleSelectionChange = (rows: any[]) => {
  selectedStudents.value = rows
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

// 格式化日期（年月日时分）
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

// 格式化日期（仅年月日）
const formatDateOnly = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

// 初始化
onMounted(() => {
  fetchClassDetail()
  fetchStudentList()
})
</script>

<style lang="scss" scoped>
.class-detail-container {
  padding: 20px;
}
</style>