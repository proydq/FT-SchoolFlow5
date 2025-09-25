<template>
  <div class="student-detail-container">
    <el-page-header @back="handleBack">
      <template #title>
        <span>学生详情</span>
      </template>
      <template #extra>
        <el-button type="primary" @click="handleEdit">
          <el-icon><Edit /></el-icon>
          编辑
        </el-button>
      </template>
    </el-page-header>

    <el-card style="margin-top: 20px" v-loading="loading">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="学号">
          <span class="student-id">{{ studentInfo.studentId }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="姓名">
          {{ studentInfo.studentName }}
        </el-descriptions-item>
        <el-descriptions-item label="性别">
          {{ studentInfo.gender === 'male' ? '男' : '女' }}
        </el-descriptions-item>
        <el-descriptions-item label="年级">
          {{ studentInfo.gradeName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="班级">
          {{ studentInfo.className || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="入学日期">
          {{ formatDate(studentInfo.enrollDate) }}
        </el-descriptions-item>
        <el-descriptions-item label="学生状态">
          <el-tag :type="getStatusType(studentInfo.status)">
            {{ getStatusText(studentInfo.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="休学原因" :span="2" v-if="studentInfo.status === 'suspended'">
          {{ studentInfo.suspendReason || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="主监护人">
          {{ studentInfo.guardianName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="监护人电话">
          {{ studentInfo.guardianPhone || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="副联系方式">
          {{ studentInfo.secondaryPhone || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDateTime(studentInfo.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ formatDateTime(studentInfo.updateTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ studentInfo.remark || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 操作历史 -->
    <el-card style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>操作历史</span>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in activities"
          :key="index"
          :timestamp="activity.timestamp"
          :type="activity.type"
        >
          {{ activity.content }}
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Edit } from '@element-plus/icons-vue'
import { getStudentDetail } from '@/api/personnel'
import type { StudentInfo } from '@/types/personnel'

const route = useRoute()
const router = useRouter()

const studentId = computed(() => route.params.id as string)
const studentInfo = ref<StudentInfo>({} as StudentInfo)
const loading = ref(false)

// 操作历史
const activities = ref([
  {
    timestamp: '2024-03-15 14:23:00',
    content: '学生信息更新：修改联系方式',
    type: 'primary'
  },
  {
    timestamp: '2024-02-20 10:15:00',
    content: '分配到：三年级二班',
    type: 'success'
  },
  {
    timestamp: '2024-01-10 09:00:00',
    content: '创建学生档案',
    type: 'success'
  }
])

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

// 格式化日期时间
const formatDateTime = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

// 获取学生详情
const fetchStudentDetail = async () => {
  loading.value = true
  try {
    const res = await getStudentDetail(studentId.value)
    studentInfo.value = res.data
  } catch (error) {
    ElMessage.error('获取学生详情失败')
    router.back()
  } finally {
    loading.value = false
  }
}

// 返回
const handleBack = () => {
  router.push('/personnel/student')
}

// 编辑
const handleEdit = () => {
  router.push(`/personnel/student/edit/${studentId.value}`)
}

// 初始化
onMounted(() => {
  fetchStudentDetail()
})
</script>

<style lang="scss" scoped>
.student-detail-container {
  padding: 20px;
}

.student-id {
  font-weight: bold;
  color: #303133;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>