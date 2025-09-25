<template>
  <div class="student-edit-container">
    <el-page-header @back="handleBack">
      <template #title>
        <span>{{ isEdit ? '编辑学生' : '新增学生' }}</span>
      </template>
    </el-page-header>

    <el-card style="margin-top: 20px">
      <!-- 进度条 -->
      <el-steps
        :active="currentStep"
        finish-status="success"
        align-center
        class="custom-steps"
      >
        <el-step title="基础信息">
          <template #icon>
            <el-icon><User /></el-icon>
          </template>
          <template #description>
            <span v-if="currentStep === 0">填写学生基本信息</span>
          </template>
        </el-step>
        <el-step title="在校信息">
          <template #icon>
            <el-icon><Reading /></el-icon>
          </template>
          <template #description>
            <span v-if="currentStep === 1">选择年级班级和状态</span>
          </template>
        </el-step>
        <el-step title="联系信息">
          <template #icon>
            <el-icon><Phone /></el-icon>
          </template>
          <template #description>
            <span v-if="currentStep === 2">填写监护人联系方式</span>
          </template>
        </el-step>
      </el-steps>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        style="max-width: 800px; margin-top: 30px"
      >
        <!-- 步骤1：基础信息 -->
        <div v-show="currentStep === 0">
          <el-row :gutter="40">
            <el-col :span="10">
              <el-form-item label="学生照片" prop="photo">
                <el-upload
                  class="avatar-uploader"
                  :action="uploadUrl"
                  :show-file-list="false"
                  :on-success="handleAvatarSuccess"
                  :before-upload="beforeAvatarUpload"
                  accept=".jpg,.jpeg,.png"
                  :headers="uploadHeaders"
                >
                  <div v-if="formData.photoUrl" class="avatar-container">
                    <img :src="formData.photoUrl" class="avatar" />
                    <div class="avatar-overlay">
                      <el-icon class="avatar-icon"><Edit /></el-icon>
                      <span>更换照片</span>
                    </div>
                  </div>
                  <div v-else class="avatar-uploader-icon">
                    <el-icon class="avatar-icon"><Plus /></el-icon>
                    <div class="upload-text">上传照片</div>
                  </div>
                </el-upload>
                <div class="upload-tip">
                  支持 JPG/PNG 格式<br>
                  建议尺寸 295×413 像素<br>
                  文件大小不超过 2MB
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="14">
              <el-form-item label="姓名" prop="studentName">
                <el-input
                  v-model="formData.studentName"
                  placeholder="请输入姓名"
                  maxlength="10"
                  show-word-limit
                  style="width: 300px"
                />
              </el-form-item>
              <el-form-item label="学号" prop="studentId">
                <el-input
                  v-model="formData.studentId"
                  placeholder="格式：4位入学年份+2位年级+2位班级+2位序号"
                  :disabled="isEdit"
                  maxlength="10"
                  style="width: 300px"
                  @blur="checkStudentId"
                >
                  <template #append v-if="!isEdit">
                    <el-button @click="generateStudentId">自动生成</el-button>
                  </template>
                </el-input>
                <div class="form-tip" v-if="!isEdit">如：2024010101</div>
              </el-form-item>
              <el-form-item label="性别" prop="gender">
                <el-radio-group v-model="formData.gender">
                  <el-radio value="male">男</el-radio>
                  <el-radio value="female">女</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 步骤2：在校信息 -->
        <div v-show="currentStep === 1">
          <el-form-item label="年级" prop="gradeId">
            <el-select
              v-model="formData.gradeId"
              placeholder="请选择年级"
              style="width: 300px"
              @change="handleGradeChange"
            >
              <el-option
                v-for="grade in gradeList"
                :key="grade.gradeId"
                :label="grade.gradeName"
                :value="grade.gradeId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="班级" prop="classId">
            <el-select
              v-model="formData.classId"
              placeholder="请选择班级"
              style="width: 300px"
              :disabled="!formData.gradeId"
            >
              <el-option
                v-for="cls in classList"
                :key="cls.classId"
                :label="cls.className"
                :value="cls.classId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="入学日期" prop="enrollDate">
            <el-select
              v-model="formData.enrollDate"
              placeholder="请选择入学日期"
              style="width: 300px"
            >
              <el-option label="9月1日（新学期开学）" :value="getCurrentYear() + '-09-01'" />
              <el-option label="2月15日（插班）" :value="getCurrentYear() + '-02-15'" />
            </el-select>
          </el-form-item>
          <el-form-item label="学生状态" prop="status">
            <el-radio-group v-model="formData.status" @change="handleStatusChange">
              <el-radio value="enrolled">在校</el-radio>
              <el-radio value="graduated">毕业</el-radio>
              <el-radio value="transferred">转学</el-radio>
              <el-radio value="suspended">休学</el-radio>
              <el-radio value="dropped">肄业</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            v-if="formData.status === 'suspended'"
            label="休学原因"
            prop="suspendReason"
          >
            <el-input
              v-model="formData.suspendReason"
              type="textarea"
              :rows="3"
              placeholder="请输入休学原因（10-200字）"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </div>

        <!-- 步骤3：联系信息 -->
        <div v-show="currentStep === 2">
          <el-form-item label="主监护人" prop="guardianName">
            <el-input
              v-model="formData.guardianName"
              placeholder="请输入主监护人姓名"
              maxlength="10"
              style="width: 300px"
            />
          </el-form-item>
          <el-form-item label="监护人电话" prop="guardianPhone">
            <el-input
              v-model="formData.guardianPhone"
              placeholder="请输入11位手机号"
              maxlength="11"
              style="width: 300px"
            />
          </el-form-item>
          <el-form-item label="副联系方式" prop="secondaryPhone">
            <el-input
              v-model="formData.secondaryPhone"
              placeholder="选填，11位手机号"
              maxlength="11"
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
        </div>

        <!-- 操作按钮 -->
        <el-form-item>
          <el-button v-if="currentStep > 0" @click="prevStep">上一步</el-button>
          <el-button v-if="currentStep < 2" type="primary" @click="nextStep">下一步</el-button>
          <el-button v-if="currentStep === 2" type="primary" @click="handleSubmit">
            <el-icon><Check /></el-icon>
            提交
          </el-button>
          <el-button @click="handleCancel">
            <el-icon><Close /></el-icon>
            取消
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Check, Close, User, Reading, Phone, Edit, Plus } from '@element-plus/icons-vue'
import {
  getStudentDetail,
  addStudent,
  updateStudent,
  checkStudentId as apiCheckStudentId,
  generateStudentId as apiGenerateStudentId,
  getGradeClassCascade
} from '@/api/personnel'
import type { StudentFormData } from '@/types/personnel'

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()

// 是否编辑模式
const isEdit = computed(() => !!route.params.id)
const studentId = computed(() => route.params.id as string)

// 当前步骤
const currentStep = ref(0)

// 表单数据
const formData = reactive<StudentFormData & { studentId?: string; photoUrl?: string }>({
  studentName: '',
  studentId: '',
  gender: 'male',
  gradeId: '',
  classId: '',
  enrollDate: '',
  status: 'enrolled',
  suspendReason: '',
  guardianName: '',
  guardianPhone: '',
  secondaryPhone: '',
  remark: '',
  photoUrl: ''
})

// 上传相关配置
const uploadUrl = ref('/api/upload/avatar')
const uploadHeaders = ref({
  Authorization: 'Bearer ' + localStorage.getItem('token')
})

// 年级班级级联数据
interface GradeClass {
  gradeId: string;
  gradeName: string;
  classList: Array<{ classId: string; className: string }>;
}

const gradeClassCascadeData = ref<GradeClass[]>([])

// 年级列表
const gradeList = computed(() => {
  if (!gradeClassCascadeData.value || !Array.isArray(gradeClassCascadeData.value)) return []
  return gradeClassCascadeData.value.map(item => ({
    gradeId: item.gradeId,
    gradeName: item.gradeName
  }))
})

// 班级列表
const classList = computed(() => {
  if (!formData.gradeId) return []
  if (!gradeClassCascadeData.value || !Array.isArray(gradeClassCascadeData.value)) return []
  const grade = gradeClassCascadeData.value.find(item => item.gradeId === formData.gradeId)
  return grade?.classList || []
})

// 表单验证规则
const rules = reactive<FormRules>({
  studentName: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 1, max: 10, message: '姓名长度在 1 到 10 个字符', trigger: 'blur' }
  ],
  studentId: [
    { required: !isEdit.value, message: '请输入学号', trigger: 'blur' },
    {
      pattern: /^\d{10}$/,
      message: '学号格式错误（需为10位数字）',
      trigger: 'blur'
    }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  gradeId: [
    { required: true, message: '请选择年级', trigger: 'change' }
  ],
  classId: [
    { required: true, message: '请选择班级', trigger: 'change' }
  ],
  enrollDate: [
    { required: true, message: '请选择入学日期', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择学生状态', trigger: 'change' }
  ],
  suspendReason: [
    {
      required: formData.status === 'suspended',
      message: '休学学生需填写休学原因',
      trigger: 'blur'
    },
    {
      min: 10,
      max: 200,
      message: '休学原因长度在10到200个字符',
      trigger: 'blur'
    }
  ],
  guardianPhone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '手机号格式错误',
      trigger: 'blur'
    }
  ],
  secondaryPhone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '手机号格式错误',
      trigger: 'blur'
    }
  ]
})

// 获取当前年份
const getCurrentYear = () => {
  return new Date().getFullYear()
}

// 生成学号
const generateStudentId = async () => {
  if (!formData.gradeId || !formData.classId) {
    ElMessage.warning('请先选择年级和班级')
    return
  }

  try {
    const res = await apiGenerateStudentId(formData.gradeId, formData.classId)
    formData.studentId = res.data.studentId
    ElMessage.success('学号生成成功')
  } catch (error) {
    ElMessage.error('学号生成失败')
  }
}

// 检查学号是否存在
const checkStudentId = async () => {
  if (!formData.studentId || isEdit.value) return

  try {
    const res = await apiCheckStudentId(formData.studentId)
    if (res && res.data && res.data.exists) {
      ElMessage.warning(`学号 ${formData.studentId} 已存在，请重新输入`)
      formData.studentId = ''
    }
  } catch (error) {
    console.error('检查学号失败', error)
  }
}

// 年级变化
const handleGradeChange = () => {
  formData.classId = ''
}

// 状态变化
const handleStatusChange = (value: string) => {
  if (value !== 'suspended') {
    formData.suspendReason = ''
  }
}

// 获取年级班级级联数据
const fetchGradeClassCascade = async () => {
  try {
    const res = await getGradeClassCascade()

    // API 返回格式: { code: 200, data: [...], message: '...' }
    if (res && res.data && Array.isArray(res.data)) {
      gradeClassCascadeData.value = res.data
    } else {
      gradeClassCascadeData.value = []
    }
  } catch (error) {
    console.error('获取年级班级数据失败:', error)
    gradeClassCascadeData.value = []
  }
}

// 获取学生详情
const fetchStudentDetail = async () => {
  if (!isEdit.value) return

  try {
    const res = await getStudentDetail(studentId.value)
    if (res && res.data) {
      const data = res.data
      // 填充表单数据
      Object.assign(formData, {
        studentName: data.studentName,
        studentId: data.studentId,
        gender: data.gender,
        gradeId: data.gradeId,
        classId: data.classId,
        enrollDate: data.enrollDate,
        status: data.status,
        suspendReason: data.suspendReason || '',
        guardianName: data.guardianName || '',
        guardianPhone: data.guardianPhone || '',
        secondaryPhone: data.secondaryPhone || '',
        remark: data.remark || '',
        photoUrl: data.photoUrl || ''
      })
    }
  } catch (error) {
    ElMessage.error('获取学生详情失败')
    console.error('获取学生详情失败', error)
    router.back()
  }
}

// 上一步
const prevStep = () => {
  currentStep.value--
}

// 下一步
const nextStep = async () => {
  if (!formRef.value) return

  // 根据当前步骤验证相应字段
  const fieldsToValidate = currentStep.value === 0
    ? ['studentName', 'studentId', 'gender']
    : ['gradeId', 'classId', 'enrollDate', 'status', 'suspendReason']

  try {
    await formRef.value.validateField(fieldsToValidate)
    currentStep.value++
  } catch (error) {
    ElMessage.warning('请完善当前步骤的信息')
  }
}

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      const data = { ...formData }
      delete data.studentId // 编辑时不传学号

      if (isEdit.value) {
        await updateStudent(studentId.value, data as StudentFormData)
        ElMessage.success('修改成功')
      } else {
        await addStudent(data as StudentFormData)
        ElMessage.success('新增成功')
      }
      router.push('/personnel/student')
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
    router.push('/personnel/student')
  }).catch(() => {
    // 取消操作
  })
}

// 返回
const handleBack = () => {
  router.push('/personnel/student')
}

// 头像上传成功处理
const handleAvatarSuccess = (response: any) => {
  if (response.code === 200) {
    formData.photoUrl = response.data.url
    ElMessage.success('照片上传成功')
  } else {
    ElMessage.error(response.message || '照片上传失败')
  }
}

// 上传前的校验
const beforeAvatarUpload = (file: File) => {
  const isJPGorPNG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPGorPNG) {
    ElMessage.error('只能上传 JPG/PNG 格式的图片!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 初始化
onMounted(() => {
  fetchGradeClassCascade()
  fetchStudentDetail()
})
</script>

<style lang="scss" scoped>
.student-edit-container {
  padding: 20px;
}

.form-tip {
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
}

.custom-steps {
  padding: 20px 50px;

  :deep(.el-step__title) {
    font-size: 16px;
    font-weight: 600;
    margin-top: 10px;
  }

  :deep(.el-step__description) {
    font-size: 13px;
    margin-top: 8px;
    color: #909399;
  }

  :deep(.el-step__icon) {
    width: 48px;
    height: 48px;
  }

  :deep(.el-step__icon-inner) {
    font-size: 24px;
  }

  :deep(.el-step__icon.is-icon) {
    width: 48px;
    height: 48px;
    font-size: 24px;
    border-width: 2px;
  }

  :deep(.el-step__head.is-finish) {
    color: #67c23a;
    border-color: #67c23a;
  }

  :deep(.el-step__head.is-process) {
    color: #409eff;
    border-color: #409eff;
  }

  :deep(.el-step__head.is-wait) {
    color: #c0c4cc;
    border-color: #c0c4cc;
  }

  :deep(.el-step__line) {
    background-color: #e4e7ed;
  }

  :deep(.el-step.is-finish .el-step__line) {
    background-color: #67c23a;
  }
}

// 照片上传样式
.avatar-uploader {
  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: border-color 0.3s;
    width: 148px;
    height: 200px;

    &:hover {
      border-color: #409eff;
    }
  }
}

.avatar-container {
  width: 148px;
  height: 200px;
  position: relative;
  overflow: hidden;

  .avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;

    &:hover {
      opacity: 1;
    }

    .avatar-icon {
      font-size: 28px;
      color: #fff;
      margin-bottom: 8px;
    }

    span {
      color: #fff;
      font-size: 14px;
    }
  }
}

.avatar-uploader-icon {
  width: 148px;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8c939d;

  .avatar-icon {
    font-size: 28px;
    margin-bottom: 8px;
  }

  .upload-text {
    font-size: 14px;
  }
}

.upload-tip {
  margin-top: 10px;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}
</style>