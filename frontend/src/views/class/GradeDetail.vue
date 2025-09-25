<template>
  <div class="grade-detail-container">
    <el-page-header @back="handleBack">
      <template #title>
        <span>年级详情</span>
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
        <el-descriptions-item label="年级名称">
          {{ gradeInfo.gradeName }}
        </el-descriptions-item>
        <el-descriptions-item label="年级层次">
          <el-tag>{{ gradeInfo.gradeLevel }}年级</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="学段">
          <el-tag :type="getStageType(gradeInfo.stage)">
            {{ gradeInfo.stageText }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="班级数量">
          <el-tag type="info">{{ gradeInfo.classCount }} 个班</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="学生总数">
          <el-tag type="warning">{{ gradeInfo.studentCount }} 人</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="年级主任">
          <span v-if="gradeInfo.gradeDirectorName">
            {{ gradeInfo.gradeDirectorName }}
          </span>
          <el-tag v-else type="warning" size="small">未分配</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="gradeInfo.status === 'active' ? 'success' : 'danger'">
            {{ gradeInfo.status === 'active' ? '正常' : '停用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="排序">
          {{ gradeInfo.sort }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDate(gradeInfo.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ formatDate(gradeInfo.updateTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ gradeInfo.remark || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 班级列表 -->
    <el-card style="margin-top: 20px">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>班级列表</span>
          <div>
            <el-button size="small" @click="handleAddClass">
              <el-icon><Plus /></el-icon>
              添加班级
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="classList"
        stripe
        border
        v-loading="classLoading"
        style="width: 100%"
      >
        <el-table-column prop="className" label="班级名称" width="150" />
        <el-table-column prop="location" label="班级位置" min-width="180" />
        <el-table-column prop="studentCount" label="学生数" width="100" align="center">
          <template #default="{ row }">
            <el-tag>{{ row.studentCount }}人</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="teacherName" label="班主任" width="150">
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
              :type="getClassStatusType(row.status)"
              size="small"
            >
              {{ getClassStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div style="display: flex; gap: 5px;">
              <el-button link type="primary" size="small" @click="handleViewClass(row)">查看</el-button>
              <el-button link type="primary" size="small" @click="handleEditClass(row)">编辑</el-button>
              <el-button link type="danger" size="small" @click="handleDeleteClass(row)">删除</el-button>
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
          :total="classTotal"
          layout="total, sizes, prev, pager, next"
          @size-change="fetchClassList"
          @current-change="fetchClassList"
        />
      </div>
    </el-card>

    <!-- 统计信息 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>班级分布</span>
          </template>
          <div class="stat-content">
            <el-progress
              type="dashboard"
              :percentage="Math.round((gradeInfo.classCount / 10) * 100)"
              :width="120"
            >
              <template #default>
                <div>
                  <div style="font-size: 24px; font-weight: bold;">{{ gradeInfo.classCount }}</div>
                  <div style="font-size: 12px; color: #909399;">个班级</div>
                </div>
              </template>
            </el-progress>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>学生分布</span>
          </template>
          <div class="stat-content">
            <el-progress
              type="dashboard"
              :percentage="Math.round((gradeInfo.studentCount / 500) * 100)"
              :width="120"
              status="warning"
            >
              <template #default>
                <div>
                  <div style="font-size: 24px; font-weight: bold;">{{ gradeInfo.studentCount }}</div>
                  <div style="font-size: 12px; color: #909399;">名学生</div>
                </div>
              </template>
            </el-progress>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>平均班级人数</span>
          </template>
          <div class="stat-content">
            <el-progress
              type="dashboard"
              :percentage="Math.round((avgStudents / 50) * 100)"
              :width="120"
              status="success"
            >
              <template #default>
                <div>
                  <div style="font-size: 24px; font-weight: bold;">{{ avgStudents }}</div>
                  <div style="font-size: 12px; color: #909399;">人/班</div>
                </div>
              </template>
            </el-progress>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Plus } from '@element-plus/icons-vue'
import { getGradeDetail, getGradeClasses } from '@/api/grade'
import { deleteClass } from '@/api/class'
import type { GradeInfo } from '@/types/grade'

const route = useRoute()
const router = useRouter()

const gradeId = computed(() => route.params.id as string)

// 年级信息
const gradeInfo = ref<GradeInfo>({} as GradeInfo)
const loading = ref(false)

// 班级列表
const classList = ref<any[]>([])
const classLoading = ref(false)
const classTotal = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

// 计算平均班级人数
const avgStudents = computed(() => {
  if (!gradeInfo.value.classCount) return 0
  return Math.round(gradeInfo.value.studentCount / gradeInfo.value.classCount)
})

// 获取年级详情
const fetchGradeDetail = async () => {
  loading.value = true
  try {
    const res = await getGradeDetail(gradeId.value)
    gradeInfo.value = res.data
  } catch (error) {
    ElMessage.error('获取年级详情失败')
    router.back()
  } finally {
    loading.value = false
  }
}

// 获取班级列表
const fetchClassList = async () => {
  classLoading.value = true
  try {
    const res = await getGradeClasses(gradeId.value)
    classList.value = res.data
    classTotal.value = res.data.length
  } catch (error) {
    ElMessage.error('获取班级列表失败')
  } finally {
    classLoading.value = false
  }
}

// 返回
const handleBack = () => {
  router.push('/class/grade')
}

// 编辑
const handleEdit = () => {
  router.push(`/class/grade/edit/${gradeId.value}`)
}

// 添加班级
const handleAddClass = () => {
  router.push(`/class/add?gradeId=${gradeId.value}`)
}

// 查看班级
const handleViewClass = (row: any) => {
  router.push(`/class/detail/${row.id}`)
}

// 编辑班级
const handleEditClass = (row: any) => {
  router.push(`/class/edit/${row.id}`)
}

// 删除班级
const handleDeleteClass = async (row: any) => {
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
    fetchGradeDetail()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
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

// 获取班级状态类型
const getClassStatusType = (status: string) => {
  const map: Record<string, string> = {
    normal: 'success',
    splitting: 'warning',
    merged: 'info'
  }
  return map[status] || ''
}

// 获取班级状态文本
const getClassStatusText = (status: string) => {
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
  fetchGradeDetail()
  fetchClassList()
})
</script>

<style lang="scss" scoped>
.grade-detail-container {
  padding: 20px;
}

.stat-content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
}
</style>