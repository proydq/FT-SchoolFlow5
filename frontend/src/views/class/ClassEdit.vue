<template>
  <div class="class-edit-container">
    <el-page-header @back="handleBack">
      <template #title>
        <span>{{ isEdit ? '编辑班级' : '新增班级' }}</span>
      </template>
    </el-page-header>

    <el-card style="margin-top: 20px">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        :disabled="loading"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="班级名称" prop="className">
              <el-input
                v-model="formData.className"
                placeholder="请输入班级名称"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属年级" prop="gradeId">
              <el-select
                v-model="formData.gradeId"
                placeholder="请选择所属年级"
                style="width: 100%"
              >
                <el-option
                  v-for="grade in gradeList"
                  :key="grade.id"
                  :label="grade.gradeName"
                  :value="grade.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="班级位置" prop="location">
              <el-input
                v-model="formData.location"
                placeholder="请输入班级位置，如：教学楼3楼301室"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number
                v-model="formData.sort"
                :min="0"
                :max="9999"
                placeholder="请输入排序值"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="班级状态" prop="status">
              <el-select
                v-model="formData.status"
                placeholder="请选择班级状态"
                style="width: 100%"
              >
                <el-option label="正常" value="normal" />
                <el-option label="拆分中" value="splitting" />
                <el-option label="已合并" value="merged" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="班主任" prop="teacherId">
              <el-select
                v-model="formData.teacherId"
                placeholder="请选择班主任"
                clearable
                filterable
                style="width: 100%"
              >
                <el-option
                  v-for="teacher in teacherList"
                  :key="teacher.id"
                  :label="`${teacher.name} (${teacher.code})`"
                  :value="teacher.id"
                  :disabled="teacher.disabled"
                >
                  <div style="display: flex; justify-content: space-between;">
                    <span>{{ teacher.name }}</span>
                    <span style="color: #909399;">
                      {{ teacher.code }}
                      <el-tag v-if="teacher.classCount > 0" size="small" type="warning">
                        已担任{{ teacher.classCount }}个班
                      </el-tag>
                    </span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item v-if="isEdit && formData.status !== originalStatus" label="状态变更原因" prop="statusChangeReason">
          <el-input
            v-model="formData.statusChangeReason"
            type="textarea"
            :rows="2"
            placeholder="请输入状态变更原因"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit">
            <el-icon><Check /></el-icon>
            {{ isEdit ? '保存' : '提交' }}
          </el-button>
          <el-button @click="handleBack">
            <el-icon><Close /></el-icon>
            取消
          </el-button>
          <el-button v-if="!isEdit" @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 班级学生列表（仅编辑时显示） -->
    <el-card v-if="isEdit" style="margin-top: 20px">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>班级学生列表</span>
          <el-tag type="info">共 {{ studentList.length }} 名学生</el-tag>
        </div>
      </template>
      <el-table :data="studentList" stripe border max-height="400" style="width: 100%">
        <el-table-column prop="studentCode" label="学号" width="110" />
        <el-table-column prop="studentName" label="姓名" width="100" />
        <el-table-column prop="gender" label="性别" width="70" align="center">
          <template #default="{ row }">
            <el-tag :type="row.gender === '男' ? 'primary' : 'danger'" size="small">
              {{ row.gender }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="contactPhone" label="联系电话" width="130" />
        <el-table-column prop="guardianName" label="监护人" width="100" />
        <el-table-column prop="guardianPhone" label="监护人电话" width="130" />
        <el-table-column prop="enrollmentDate" label="入学时间" width="110">
          <template #default="{ row }">
            {{ formatDate(row.enrollmentDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === 'active' ? '在读' : '已离校' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Check, Close, Refresh } from '@element-plus/icons-vue'
import {
  getClassDetail,
  addClass,
  updateClass,
  getGradeList,
  getAvailableTeachers,
  getClassStudents
} from '@/api/class'
import type { ClassFormData, ClassStatus } from '@/types/class'

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()

// 是否编辑模式
const isEdit = computed(() => !!route.params.id)
const classId = computed(() => route.params.id as string)

// 表单数据
const formData = reactive<ClassFormData>({
  className: '',
  gradeId: '',
  location: '',
  sort: 0,
  status: 'normal' as ClassStatus,
  teacherId: '',
  remark: '',
  statusChangeReason: ''
})

// 原始状态（用于判断是否状态变更）
const originalStatus = ref<string>('')

// 加载状态
const loading = ref(false)

// 下拉列表数据
const gradeList = ref<any[]>([])
const teacherList = ref<any[]>([])
const studentList = ref<any[]>([])

// 表单验证规则
const rules = reactive<FormRules>({
  className: [
    { required: true, message: '请输入班级名称', trigger: 'blur' },
    { min: 2, max: 50, message: '班级名称长度在 2 到 50 个字符', trigger: 'blur' },
    {
      pattern: /^[\u4e00-\u9fa5a-zA-Z0-9]+$/,
      message: '班级名称只能包含中文、英文和数字',
      trigger: 'blur'
    }
  ],
  gradeId: [
    { required: true, message: '请选择所属年级', trigger: 'change' }
  ],
  sort: [
    { required: true, message: '请输入排序值', trigger: 'blur' },
    { type: 'number', min: 0, max: 9999, message: '排序值范围 0-9999', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择班级状态', trigger: 'change' }
  ],
  statusChangeReason: [
    { required: true, message: '请输入状态变更原因', trigger: 'blur' },
    { min: 5, max: 200, message: '变更原因长度在 5 到 200 个字符', trigger: 'blur' }
  ]
})

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
    const res = await getAvailableTeachers(formData.gradeId)
    teacherList.value = res.data
  } catch (error) {
    console.error('获取教师列表失败', error)
  }
}

// 获取班级详情
const fetchClassDetail = async () => {
  if (!isEdit.value) return

  loading.value = true
  try {
    const res = await getClassDetail(classId.value)
    const data = res.data

    // 填充表单数据
    formData.className = data.className
    formData.gradeId = data.gradeId
    formData.location = data.location || ''
    formData.sort = data.sort
    formData.status = data.status
    formData.teacherId = data.teacherId || ''
    formData.remark = data.remark || ''

    // 记录原始状态
    originalStatus.value = data.status

    // 获取班级学生列表
    fetchClassStudents()
  } catch (error) {
    ElMessage.error('获取班级详情失败')
    router.back()
  } finally {
    loading.value = false
  }
}

// 获取班级学生列表
const fetchClassStudents = async () => {
  if (!isEdit.value) return

  try {
    const res = await getClassStudents(classId.value)
    studentList.value = res.data
  } catch (error) {
    console.error('获取学生列表失败', error)
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    // 状态变更时必须填写原因
    if (isEdit.value && formData.status !== originalStatus.value && !formData.statusChangeReason) {
      ElMessage.warning('状态变更时必须填写变更原因')
      return
    }

    loading.value = true
    try {
      if (isEdit.value) {
        await updateClass(classId.value, formData)
        ElMessage.success('修改成功')
      } else {
        await addClass(formData)
        ElMessage.success('新增成功')
      }
      router.push('/class/list')
    } catch (error: any) {
      ElMessage.error(error.message || (isEdit.value ? '修改失败' : '新增失败'))
    } finally {
      loading.value = false
    }
  })
}

// 返回
const handleBack = () => {
  ElMessageBox.confirm(
    '确定要离开当前页面吗？未保存的数据将会丢失。',
    '离开确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    router.push('/class/list')
  }).catch(() => {
    // 取消操作
  })
}

// 重置表单
const handleReset = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
}

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

// 监听年级变化，重新获取教师列表
const handleGradeChange = () => {
  formData.teacherId = ''
  fetchTeacherList()
}

// 初始化
onMounted(() => {
  fetchGradeList()
  fetchTeacherList()
  fetchClassDetail()
})
</script>

<style lang="scss" scoped>
.class-edit-container {
  padding: 20px;
}
</style>