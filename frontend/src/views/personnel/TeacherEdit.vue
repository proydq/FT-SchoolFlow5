<template>
  <div class="teacher-edit-container">
    <el-page-header @back="handleBack">
      <template #title>
        <span>{{ isEdit ? '编辑教师' : '新增教师' }}</span>
      </template>
    </el-page-header>

    <el-card style="margin-top: 20px">
      <!-- 标签页切换 -->
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基础信息" name="basic">
          <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            label-width="120px"
            style="max-width: 800px"
          >
            <el-form-item label="姓名" prop="teacherName">
              <el-input
                v-model="formData.teacherName"
                placeholder="请输入姓名"
                maxlength="10"
                show-word-limit
                style="width: 300px"
              />
            </el-form-item>
            <el-form-item label="工号" prop="teacherId">
              <el-input
                v-model="formData.teacherId"
                placeholder="格式：T+4位年份+3位序号"
                :disabled="isEdit"
                maxlength="8"
                style="width: 300px"
                @blur="checkTeacherId"
              >
                <template #append v-if="!isEdit">
                  <el-button @click="generateTeacherId">自动生成</el-button>
                </template>
              </el-input>
              <div class="form-tip" v-if="!isEdit">格式：T+4位年份+3位序号（如T2024001）</div>
            </el-form-item>
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="formData.gender">
                <el-radio value="male">男</el-radio>
                <el-radio value="female">女</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="手机号" prop="mobile">
              <el-input
                v-model="formData.mobile"
                placeholder="请输入11位手机号"
                maxlength="11"
                style="width: 300px"
              />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input
                v-model="formData.email"
                placeholder="请输入邮箱地址"
                style="width: 300px"
                @input="handleEmailInput"
              >
                <template #suffix v-if="emailSuggestions.length">
                  <el-dropdown trigger="click">
                    <el-icon><ArrowDown /></el-icon>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item
                          v-for="suffix in emailSuggestions"
                          :key="suffix"
                          @click="selectEmailSuffix(suffix)"
                        >
                          {{ formData.email.split('@')[0] }}{{ suffix }}
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </template>
              </el-input>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="工作信息" name="work">
          <el-form
            :model="formData"
            :rules="rules"
            label-width="120px"
            style="max-width: 800px"
          >
            <el-form-item label="部门" prop="department">
              <el-select
                v-model="formData.department"
                placeholder="请选择部门"
                style="width: 300px"
              >
                <el-option
                  v-for="dept in departmentList"
                  :key="dept.departmentId"
                  :label="dept.departmentName"
                  :value="dept.departmentId"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="职位" prop="position">
              <el-select
                v-model="formData.position"
                placeholder="请选择职位"
                style="width: 300px"
                @change="handlePositionChange"
              >
                <el-option label="校长" value="principal" />
                <el-option label="教务主任" value="academic_director" />
                <el-option label="年级主任" value="grade_director" />
                <el-option label="班主任" value="class_teacher" />
                <el-option label="普通教师" value="teacher" />
              </el-select>
            </el-form-item>
            <el-form-item
              v-if="formData.position === 'class_teacher'"
              label="关联班级"
              prop="relatedClass"
            >
              <el-select
                v-model="formData.relatedClass"
                placeholder="请选择班级"
                style="width: 300px"
              >
                <el-option
                  v-for="cls in availableClasses"
                  :key="cls.classId"
                  :label="cls.className"
                  :value="cls.classId"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              v-if="formData.position === 'grade_director'"
              label="关联年级"
              prop="relatedGrade"
            >
              <el-select
                v-model="formData.relatedGrade"
                placeholder="请选择年级"
                style="width: 300px"
              >
                <el-option
                  v-for="grade in gradeList"
                  :key="grade.gradeId"
                  :label="grade.gradeName"
                  :value="grade.gradeId"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="入职时间" prop="joinDate">
              <el-date-picker
                v-model="formData.joinDate"
                type="date"
                placeholder="选择日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :disabled-date="disabledDate"
                style="width: 300px"
              />
            </el-form-item>
            <el-form-item label="人员状态" prop="status">
              <el-radio-group v-model="formData.status" @change="handleStatusChange">
                <el-radio value="active">在职</el-radio>
                <el-radio value="resigned">离职</el-radio>
                <el-radio value="retired">退休</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              v-if="formData.status === 'resigned'"
              label="离职日期"
              prop="resignDate"
            >
              <el-date-picker
                v-model="formData.resignDate"
                type="date"
                placeholder="选择日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :disabled-date="disabledResignDate"
                style="width: 300px"
              />
            </el-form-item>
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
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <!-- 操作按钮 -->
      <div class="form-footer">
        <el-button type="primary" @click="handleSaveAndReturn">
          <el-icon><Check /></el-icon>
          保存并返回
        </el-button>
        <el-button type="primary" v-if="!isEdit" @click="handleSaveAndAdd">
          <el-icon><Plus /></el-icon>
          保存并新增
        </el-button>
        <el-button @click="handleCancel">
          <el-icon><Close /></el-icon>
          取消
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Check, Close, Plus, ArrowDown } from '@element-plus/icons-vue'
import {
  getTeacherDetail,
  addTeacher,
  updateTeacher,
  checkTeacherId,
  getAvailableClasses,
  getDepartmentList
} from '@/api/personnel'
import { getGradeList } from '@/api/grade'
import type { TeacherFormData, Department } from '@/types/personnel'

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()

// 是否编辑模式
const isEdit = computed(() => !!route.params.id)
const teacherId = computed(() => route.params.id as string)

// 当前标签页
const activeTab = ref('basic')

// 表单数据
const formData = reactive<TeacherFormData & { teacherId?: string }>({
  teacherName: '',
  teacherId: '',
  gender: 'male',
  mobile: '',
  email: '',
  department: '',
  position: 'teacher',
  relatedClass: '',
  relatedGrade: '',
  joinDate: '',
  status: 'active',
  resignDate: '',
  remark: ''
})

// 下拉列表数据
const departmentList = ref<Department[]>([])
const availableClasses = ref<Array<{ classId: string, className: string }>>([])  
const gradeList = ref<Array<{ gradeId: string, gradeName: string }>>([])  

// 邮箱后缀建议
const emailSuggestions = ref<string[]>([])

// 表单验证规则
const rules = reactive<FormRules>({
  teacherName: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 1, max: 10, message: '姓名长度在 1 到 10 个字符', trigger: 'blur' },
    {
      pattern: /^[\u4e00-\u9fa5a-zA-Z]+$/,
      message: '姓名只能包含中文或英文',
      trigger: 'blur'
    }
  ],
  teacherId: [
    { required: !isEdit.value, message: '请输入工号', trigger: 'blur' },
    {
      pattern: /^T\d{7}$/,
      message: '工号格式错误（需为T+4位年份+3位序号）',
      trigger: 'blur'
    }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  mobile: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '手机号格式错误',
      trigger: 'blur'
    }
  ],
  email: [
    {
      type: 'email',
      message: '邮箱格式错误',
      trigger: 'blur'
    }
  ],
  department: [
    { required: true, message: '请选择部门', trigger: 'change' }
  ],
  position: [
    { required: true, message: '请选择职位', trigger: 'change' }
  ],
  relatedClass: [
    {
      required: formData.position === 'class_teacher',
      message: '班主任需关联班级',
      trigger: 'change'
    }
  ],
  relatedGrade: [
    {
      required: formData.position === 'grade_director',
      message: '年级主任需关联年级',
      trigger: 'change'
    }
  ],
  joinDate: [
    { required: true, message: '请选择入职时间', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择人员状态', trigger: 'change' }
  ],
  resignDate: [
    {
      required: formData.status === 'resigned',
      message: '离职人员需填写离职日期',
      trigger: 'change'
    }
  ]
})

// 生成工号
const generateTeacherId = () => {
  const year = new Date().getFullYear()
  const randomNum = String(Math.floor(Math.random() * 1000)).padStart(3, '0')
  formData.teacherId = `T${year}${randomNum}`
}

// 检查工号是否存在
const checkTeacherId = async () => {
  if (!formData.teacherId || isEdit.value) return
  
  try {
    const res = await checkTeacherId(formData.teacherId)
    if (res.data.exists) {
      ElMessage.warning(`工号 ${formData.teacherId} 已存在，请重新输入`)
      formData.teacherId = ''
    } else {
      ElMessage.success('工号可用')
    }
  } catch (error) {
    console.error('检查工号失败', error)
  }
}

// 处理邮箱输入
const handleEmailInput = (value: string) => {
  if (value.includes('@') && !value.endsWith('@')) {
    emailSuggestions.value = []
  } else if (value.endsWith('@')) {
    emailSuggestions.value = ['@qq.com', '@163.com', '@ftschool.com']
  }
}

// 选择邮箱后缀
const selectEmailSuffix = (suffix: string) => {
  formData.email = formData.email.split('@')[0] + suffix
  emailSuggestions.value = []
}

// 处理职位变化
const handlePositionChange = (value: string) => {
  // 清空之前的关联
  formData.relatedClass = ''
  formData.relatedGrade = ''
  
  // 如果是班主任，加载可用班级
  if (value === 'class_teacher') {
    fetchAvailableClasses()
  }
  // 如果是年级主任，加载年级列表
  else if (value === 'grade_director') {
    fetchGradeList()
  }
}

// 处理状态变化
const handleStatusChange = (value: string) => {
  if (value !== 'resigned') {
    formData.resignDate = ''
  } else if (!formData.resignDate) {
    // 默认设置为今天
    formData.resignDate = new Date().toISOString().split('T')[0]
  }
}

// 禁用日期（不可选择未来日期）
const disabledDate = (date: Date) => {
  return date.getTime() > Date.now()
}

// 禁用离职日期（不可早于入职日期）
const disabledResignDate = (date: Date) => {
  if (!formData.joinDate) return false
  return date.getTime() < new Date(formData.joinDate).getTime()
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

// 获取可用班级列表
const fetchAvailableClasses = async () => {
  try {
    const res = await getAvailableClasses()
    availableClasses.value = res.data
  } catch (error) {
    console.error('获取班级列表失败', error)
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

// 获取教师详情
const fetchTeacherDetail = async () => {
  if (!isEdit.value) return
  
  try {
    const res = await getTeacherDetail(teacherId.value)
    const data = res.data
    
    // 填充表单数据
    Object.assign(formData, {
      teacherName: data.teacherName,
      teacherId: data.teacherId,
      gender: data.gender,
      mobile: data.mobile || '',
      email: data.email || '',
      department: data.department,
      position: data.position,
      relatedClass: data.relatedClass || '',
      relatedGrade: data.relatedGrade || '',
      joinDate: data.joinDate,
      status: data.status,
      resignDate: data.resignDate || '',
      remark: data.remark || ''
    })
    
    // 如果是班主任或年级主任，加载相关数据
    if (data.position === 'class_teacher') {
      await fetchAvailableClasses()
    } else if (data.position === 'grade_director') {
      await fetchGradeList()
    }
  } catch (error) {
    ElMessage.error('获取教师详情失败')
    router.back()
  }
}

// 保存并返回
const handleSaveAndReturn = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      const data = { ...formData }
      delete data.teacherId // 编辑时不传工号
      
      if (isEdit.value) {
        await updateTeacher(teacherId.value, data as TeacherFormData)
        ElMessage.success('修改成功')
      } else {
        await addTeacher(data as TeacherFormData)
        ElMessage.success('新增成功')
      }
      router.push('/personnel/teacher')
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
    }
  })
}

// 保存并新增
const handleSaveAndAdd = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      await addTeacher(formData as TeacherFormData)
      ElMessage.success('保存成功，可继续新增')
      
      // 清空表单
      formRef.value?.resetFields()
      Object.assign(formData, {
        teacherName: '',
        teacherId: '',
        gender: 'male',
        mobile: '',
        email: '',
        department: '',
        position: 'teacher',
        relatedClass: '',
        relatedGrade: '',
        joinDate: '',
        status: 'active',
        resignDate: '',
        remark: ''
      })
      activeTab.value = 'basic'
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
    }
  })
}

// 取消
const handleCancel = () => {
  ElMessageBox.confirm(
    '确定要离开当前页面吗？未保存的数据将会丢失。',
    '离开确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    router.push('/personnel/teacher')
  }).catch(() => {
    // 取消操作
  })
}

// 返回
const handleBack = () => {
  router.push('/personnel/teacher')
}

// 初始化
onMounted(() => {
  fetchDepartmentList()
  fetchTeacherDetail()
})
</script>

<style lang="scss" scoped>
.teacher-edit-container {
  padding: 20px;
}

.form-tip {
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
}

.form-footer {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
  display: flex;
  gap: 10px;
}
</style>