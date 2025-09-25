<template>
  <div class="teacher-detail-container">
    <el-page-header @back="handleBack">
      <template #title>
        <span>教师详情</span>
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
        <el-descriptions-item label="工号">
          <span class="teacher-id">{{ teacherInfo.teacherId }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="姓名">
          {{ teacherInfo.teacherName }}
        </el-descriptions-item>
        <el-descriptions-item label="性别">
          {{ teacherInfo.gender === 'male' ? '男' : '女' }}
        </el-descriptions-item>
        <el-descriptions-item label="手机号">
          {{ teacherInfo.mobile || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="邮箱">
          {{ teacherInfo.email || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="部门">
          {{ teacherInfo.department }}
        </el-descriptions-item>
        <el-descriptions-item label="职位">
          {{ getPositionText(teacherInfo.position) }}
          <span v-if="teacherInfo.relatedClass" class="related-info">
            ({{ teacherInfo.relatedClass }})
          </span>
          <span v-if="teacherInfo.relatedGrade" class="related-info">
            ({{ teacherInfo.relatedGrade }})
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="入职时间">
          {{ formatDate(teacherInfo.joinDate) }}
        </el-descriptions-item>
        <el-descriptions-item label="人员状态">
          <el-tag :type="getStatusType(teacherInfo.status)">
            {{ getStatusText(teacherInfo.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="离职日期" v-if="teacherInfo.status === 'resigned'">
          {{ formatDate(teacherInfo.resignDate) }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDateTime(teacherInfo.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ formatDateTime(teacherInfo.updateTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ teacherInfo.remark || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Edit } from '@element-plus/icons-vue'
import { getTeacherDetail } from '@/api/personnel'
import type { TeacherInfo } from '@/types/personnel'

const route = useRoute()
const router = useRouter()

const teacherId = computed(() => route.params.id as string)
const teacherInfo = ref<TeacherInfo>({} as TeacherInfo)
const loading = ref(false)

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

// 格式化日期时间
const formatDateTime = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

// 获取教师详情
const fetchTeacherDetail = async () => {
  loading.value = true
  try {
    const res = await getTeacherDetail(teacherId.value)
    teacherInfo.value = res.data
  } catch (error) {
    ElMessage.error('获取教师详情失败')
    router.back()
  } finally {
    loading.value = false
  }
}

// 返回
const handleBack = () => {
  router.push('/personnel/teacher')
}

// 编辑
const handleEdit = () => {
  router.push(`/personnel/teacher/edit/${teacherId.value}`)
}

// 初始化
onMounted(() => {
  fetchTeacherDetail()
})
</script>

<style lang="scss" scoped>
.teacher-detail-container {
  padding: 20px;
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