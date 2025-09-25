<template>
  <div class="grade-edit-container">
    <el-page-header @back="handleBack">
      <template #title>
        <span>{{ isEdit ? '编辑年级' : '新增年级' }}</span>
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
            <el-form-item label="年级名称" prop="gradeName">
              <el-input
                v-model="formData.gradeName"
                placeholder="请输入年级名称，如：高一年级"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年级层次" prop="gradeLevel">
              <el-input-number
                v-model="formData.gradeLevel"
                :min="1"
                :max="12"
                placeholder="请输入年级层次"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学段" prop="stage">
              <el-select
                v-model="formData.stage"
                placeholder="请选择学段"
                style="width: 100%"
                @change="handleStageChange"
              >
                <el-option label="小学" value="primary" />
                <el-option label="初中" value="junior" />
                <el-option label="高中" value="senior" />
              </el-select>
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
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="formData.status">
                <el-radio value="active">正常</el-radio>
                <el-radio value="inactive">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年级主任" prop="gradeDirectorId">
              <el-select
                v-model="formData.gradeDirectorId"
                placeholder="请选择年级主任"
                clearable
                filterable
                style="width: 100%"
              >
                <el-option
                  v-for="director in directorList"
                  :key="director.teacherId"
                  :label="`${director.teacherName} (${director.teacherCode})`"
                  :value="director.teacherId"
                  :disabled="director.currentGrade && director.currentGrade !== currentGradeName"
                >
                  <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <span>{{ director.teacherName }} ({{ director.teacherCode }})</span>
                    <el-tag v-if="director.currentGrade" size="small" type="warning">
                      已负责{{ director.currentGrade }}
                    </el-tag>
                    <el-tag v-else size="small" type="success">
                      可分配
                    </el-tag>
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

    <!-- 班级列表（仅编辑时显示） -->
    <el-card v-if="isEdit" style="margin-top: 20px">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>年级班级列表</span>
          <el-tag type="info">共 {{ classList.length }} 个班级</el-tag>
        </div>
      </template>
      <el-table :data="classList" stripe border max-height="400" style="width: 100%">
        <el-table-column prop="className" label="班级名称" width="150" />
        <el-table-column prop="location" label="班级位置" min-width="150" />
        <el-table-column prop="studentCount" label="学生数" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ row.studentCount }}人</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="teacherName" label="班主任" width="120">
          <template #default="{ row }">
            <span v-if="row.teacherName">{{ row.teacherName }}</span>
            <el-tag v-else type="warning" size="small">未分配</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'normal' ? 'success' : 'warning'" size="small">
              {{ row.status === 'normal' ? '正常' : '其他' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleViewClass(row)">
              查看
            </el-button>
            <el-button link type="primary" size="small" @click="handleEditClass(row)">
              编辑
            </el-button>
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
  getGradeDetail,
  addGrade,
  updateGrade,
  getAvailableDirectors,
  getGradeClasses
} from '@/api/grade'
import type { GradeFormData } from '@/types/grade'

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()

// 是否编辑模式
const isEdit = computed(() => !!route.params.id)
const gradeId = computed(() => route.params.id as string)

// 表单数据
const formData = reactive<GradeFormData>({
  gradeName: '',
  gradeLevel: 1,
  stage: 'senior',
  gradeDirectorId: '',
  sort: 0,
  status: 'active',
  remark: ''
})

// 当前年级名称（用于判断年级主任是否可选）
const currentGradeName = ref('')

// 加载状态
const loading = ref(false)

// 下拉列表数据
const directorList = ref<any[]>([])
const classList = ref<any[]>([])

// 表单验证规则
const rules = reactive<FormRules>({
  gradeName: [
    { required: true, message: '请输入年级名称', trigger: 'blur' },
    { min: 2, max: 50, message: '年级名称长度在 2 到 50 个字符', trigger: 'blur' },
    {
      pattern: /^[\u4e00-\u9fa5a-zA-Z0-9()（）]+$/,
      message: '年级名称只能包含中文、英文、数字和括号',
      trigger: 'blur'
    }
  ],
  gradeLevel: [
    { required: true, message: '请输入年级层次', trigger: 'blur' },
    { type: 'number', min: 1, max: 12, message: '年级层次范围 1-12', trigger: 'blur' }
  ],
  stage: [
    { required: true, message: '请选择学段', trigger: 'change' }
  ],
  sort: [
    { required: true, message: '请输入排序值', trigger: 'blur' },
    { type: 'number', min: 0, max: 9999, message: '排序值范围 0-9999', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
})

// 获取可用年级主任列表
const fetchDirectorList = async () => {
  try {
    const res = await getAvailableDirectors()
    directorList.value = res.data
  } catch (error) {
    console.error('获取年级主任列表失败', error)
  }
}

// 获取年级详情
const fetchGradeDetail = async () => {
  if (!isEdit.value) return

  loading.value = true
  try {
    const res = await getGradeDetail(gradeId.value)
    const data = res.data

    // 填充表单数据
    formData.gradeName = data.gradeName
    formData.gradeLevel = data.gradeLevel
    formData.stage = data.stage
    formData.gradeDirectorId = data.gradeDirectorId || ''
    formData.sort = data.sort
    formData.status = data.status
    formData.remark = data.remark || ''

    // 记录当前年级名称
    currentGradeName.value = data.gradeName

    // 获取年级下的班级列表
    fetchGradeClasses()
  } catch (error) {
    ElMessage.error('获取年级详情失败')
    router.back()
  } finally {
    loading.value = false
  }
}

// 获取年级班级列表
const fetchGradeClasses = async () => {
  if (!isEdit.value) return

  try {
    const res = await getGradeClasses(gradeId.value)
    classList.value = res.data
  } catch (error) {
    console.error('获取班级列表失败', error)
  }
}

// 学段变化处理
const handleStageChange = (value: string) => {
  // 根据学段自动调整年级层次范围的提示
  if (value === 'primary') {
    ElMessage.info('小学年级层次通常为1-6')
  } else if (value === 'junior') {
    ElMessage.info('初中年级层次通常为7-9')
  } else if (value === 'senior') {
    ElMessage.info('高中年级层次通常为10-12')
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      if (isEdit.value) {
        await updateGrade(gradeId.value, formData)
        ElMessage.success('修改成功')
      } else {
        await addGrade(formData)
        ElMessage.success('新增成功')
      }
      router.push('/class/grade')
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
    router.push('/class/grade')
  }).catch(() => {
    // 取消操作
  })
}

// 重置表单
const handleReset = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
}

// 查看班级
const handleViewClass = (row: any) => {
  router.push(`/class/detail/${row.id}`)
}

// 编辑班级
const handleEditClass = (row: any) => {
  router.push(`/class/edit/${row.id}`)
}

// 初始化
onMounted(() => {
  fetchDirectorList()
  fetchGradeDetail()
})
</script>

<style lang="scss" scoped>
.grade-edit-container {
  padding: 20px;
}
</style>