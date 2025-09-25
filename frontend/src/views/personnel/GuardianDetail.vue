<template>
  <div class="guardian-detail-container">
    <el-page-header @back="handleBack">
      <template #title>
        <span>监护人详情</span>
      </template>
      <template #extra>
        <el-button type="primary" @click="handleEdit">编辑</el-button>
      </template>
    </el-page-header>

    <el-card style="margin-top: 20px" v-loading="loading">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="监护人ID" :span="1">
          {{ guardianInfo?.guardianId }}
        </el-descriptions-item>
        <el-descriptions-item label="姓名" :span="1">
          {{ guardianInfo?.guardianName }}
        </el-descriptions-item>
        <el-descriptions-item label="关系" :span="1">
          <el-tag>{{ getRelationText(guardianInfo?.relation) }}</el-tag>
          <span v-if="guardianInfo?.relationOther" style="margin-left: 10px">
            （{{ guardianInfo.relationOther }}）
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="身份证号" :span="1">
          {{ maskIdCard(guardianInfo?.idCardNumber) }}
        </el-descriptions-item>
        <el-descriptions-item label="手机号码" :span="1">
          {{ guardianInfo?.phone }}
        </el-descriptions-item>
        <el-descriptions-item label="备用电话" :span="1">
          {{ guardianInfo?.alternatePhone || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="电子邮箱" :span="2">
          {{ guardianInfo?.email || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="职业" :span="1">
          {{ guardianInfo?.occupation || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="工作单位" :span="1">
          {{ guardianInfo?.workplace || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="单位地址" :span="2">
          {{ guardianInfo?.workAddress || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="家庭住址" :span="2">
          {{ guardianInfo?.homeAddress }}
        </el-descriptions-item>
        <el-descriptions-item label="标记" :span="2">
          <el-tag v-if="guardianInfo?.isEmergencyContact" type="warning" style="margin-right: 10px">
            紧急联系人
          </el-tag>
          <el-tag v-if="guardianInfo?.isLegalGuardian" type="primary">
            法定监护人
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ guardianInfo?.remark || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="1">
          {{ formatDate(guardianInfo?.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间" :span="1">
          {{ formatDate(guardianInfo?.updateTime) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 关联学生信息 -->
    <el-card style="margin-top: 20px" v-if="relatedStudents.length > 0">
      <template #header>
        <div class="card-header">
          <span>关联学生信息（{{ relatedStudents.length }}人）</span>
          <el-button type="primary" size="small" @click="handleAddStudent">添加学生</el-button>
        </div>
      </template>
      <el-table :data="relatedStudents" border stripe>
        <el-table-column prop="studentId" label="学号" width="120" align="center" />
        <el-table-column prop="studentName" label="姓名" width="100" align="center" />
        <el-table-column prop="gender" label="性别" width="80" align="center">
          <template #default="{ row }">
            {{ row.gender === 'male' ? '男' : '女' }}
          </template>
        </el-table-column>
        <el-table-column prop="gradeName" label="年级" width="100" align="center" />
        <el-table-column prop="className" label="班级" width="100" align="center" />
        <el-table-column prop="enrollDate" label="入学日期" width="120" align="center">
          <template #default="{ row }">
            {{ formatDate(row.enrollDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="guardianPhone" label="主监护人电话" width="120" align="center" />
        <el-table-column label="操作" width="180" align="center">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="handleViewStudent(row)"
            >
              查看详情
            </el-button>
            <el-button
              link
              type="danger"
              size="small"
              @click="handleUnbindStudent(row)"
            >
              解除关联
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 无关联学生提示 -->
    <el-card style="margin-top: 20px" v-else>
      <el-empty description="暂无关联学生">
        <el-button type="primary" @click="handleAddStudent">添加关联学生</el-button>
      </el-empty>
    </el-card>

    <!-- 添加学生对话框 -->
    <el-dialog v-model="addStudentDialogVisible" title="添加关联学生" width="600px">
      <el-form :model="addStudentForm" label-width="100px">
        <el-form-item label="选择学生" required>
          <el-select
            v-model="addStudentForm.studentIds"
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
              :label="`${student.studentName} (${student.studentId}) - ${student.gradeName}${student.className}`"
              :value="student.studentId"
              :disabled="isStudentRelated(student.studentId)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关系" required>
          <el-select v-model="addStudentForm.relation" placeholder="请选择关系">
            <el-option label="父亲" value="father" />
            <el-option label="母亲" value="mother" />
            <el-option label="祖父" value="grandfather" />
            <el-option label="祖母" value="grandmother" />
            <el-option label="叔叔" value="uncle" />
            <el-option label="阿姨" value="aunt" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="关系说明" v-if="addStudentForm.relation === 'other'">
          <el-input v-model="addStudentForm.relationOther" placeholder="请输入具体关系" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addStudentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddStudentConfirm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getGuardianDetail,
  getGuardianStudents,
  batchBindStudentGuardian,
  unbindStudentGuardian
} from '@/api/personnel'
import { getStudentList } from '@/api/personnel'
import type { GuardianInfo, StudentInfo, GuardianRelation } from '@/types/personnel'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const searchLoading = ref(false)
const guardianInfo = ref<GuardianInfo>()
const relatedStudents = ref<StudentInfo[]>([])
const studentOptions = ref<StudentInfo[]>([])
const addStudentDialogVisible = ref(false)

const guardianId = route.params.id as string

// 添加学生表单
const addStudentForm = reactive({
  studentIds: [] as string[],
  relation: '' as GuardianRelation,
  relationOther: ''
})

// 获取关系文本
const getRelationText = (relation?: string) => {
  if (!relation) return '-'
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
const maskIdCard = (idCard?: string) => {
  if (!idCard || idCard.length < 15) return idCard || '-'
  return idCard.substring(0, 6) + '********' + idCard.substring(14)
}

// 格式化日期
const formatDate = (date?: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取状态类型
const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    enrolled: 'success',
    suspended: 'warning',
    transferred: 'info',
    graduated: '',
    expelled: 'danger'
  }
  return statusMap[status] || ''
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    enrolled: '在校',
    suspended: '休学',
    transferred: '转学',
    graduated: '毕业',
    expelled: '退学'
  }
  return statusMap[status] || status
}

// 检查学生是否已关联
const isStudentRelated = (studentId: string) => {
  return relatedStudents.value.some(s => s.studentId === studentId)
}

// 获取监护人详情
const fetchGuardianDetail = async () => {
  loading.value = true
  try {
    const res = await getGuardianDetail(guardianId)
    if (res && res.data) {
      guardianInfo.value = res.data
    }
  } catch (error) {
    ElMessage.error('获取监护人详情失败')
    console.error('获取监护人详情失败', error)
    router.back()
  } finally {
    loading.value = false
  }
}

// 获取关联的学生
const fetchRelatedStudents = async () => {
  try {
    const res = await getGuardianStudents(guardianId)
    if (res && res.data) {
      relatedStudents.value = res.data
    }
  } catch (error) {
    console.error('获取关联学生失败', error)
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

// 返回
const handleBack = () => {
  router.push('/personnel/guardian')
}

// 编辑
const handleEdit = () => {
  router.push(`/personnel/guardian/edit/${guardianId}`)
}

// 查看学生
const handleViewStudent = (student: StudentInfo) => {
  router.push(`/personnel/student/detail/${student.studentId}`)
}

// 添加学生
const handleAddStudent = () => {
  addStudentForm.studentIds = []
  addStudentForm.relation = guardianInfo.value?.relation || ('father' as GuardianRelation)
  addStudentForm.relationOther = guardianInfo.value?.relationOther || ''
  addStudentDialogVisible.value = true
}

// 确认添加学生
const handleAddStudentConfirm = async () => {
  if (!addStudentForm.studentIds.length) {
    ElMessage.warning('请选择要关联的学生')
    return
  }
  if (!addStudentForm.relation) {
    ElMessage.warning('请选择关系')
    return
  }

  try {
    await batchBindStudentGuardian({
      guardianId: guardianId,
      studentIds: addStudentForm.studentIds,
      relation: addStudentForm.relation,
      relationOther: addStudentForm.relationOther
    })
    ElMessage.success('关联成功')
    addStudentDialogVisible.value = false
    fetchRelatedStudents()
  } catch (error: any) {
    ElMessage.error(error.message || '关联失败')
  }
}

// 解除学生关联
const handleUnbindStudent = async (student: StudentInfo) => {
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
    await unbindStudentGuardian(student.studentId, guardianId)
    ElMessage.success('解除关联成功')
    fetchRelatedStudents()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '解除关联失败')
    }
  }
}

// 初始化
onMounted(() => {
  fetchGuardianDetail()
  fetchRelatedStudents()
})
</script>

<style lang="scss" scoped>
.guardian-detail-container {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>