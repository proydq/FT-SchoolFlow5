<template>
  <div class="leave-apply-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>请假申请</h2>
      <p class="page-description">填写请假申请信息，系统将根据请假类型和时长自动匹配审批流程</p>
    </div>

    <!-- 申请表单 -->
    <el-card>
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        label-position="left"
      >
        <!-- 基本信息 -->
        <div class="form-section">
          <h3 class="section-title">基本信息</h3>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="请假类型" prop="leaveTypeId" required>
                <el-select
                  v-model="formData.leaveTypeId"
                  placeholder="请选择请假类型"
                  style="width: 100%"
                  @change="handleLeaveTypeChange"
                >
                  <el-option
                    v-for="type in availableLeaveTypes"
                    :key="type.id"
                    :label="type.typeName"
                    :value="type.id"
                  >
                    <div style="display: flex; justify-content: space-between;">
                      <span>{{ type.typeName }}</span>
                      <span style="color: #8492a6; font-size: 13px;">
                        最长{{ type.maxDuration }}{{ type.durationUnit === 'day' ? '天' : '小时' }}
                      </span>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="请假事由" prop="reason" required>
                <el-input
                  v-model="formData.reason"
                  placeholder="请简要说明请假原因"
                  maxlength="100"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 时间信息 -->
        <div class="form-section">
          <h3 class="section-title">时间信息</h3>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="开始时间" prop="startTime" required>
                <el-date-picker
                  v-model="formData.startTime"
                  type="datetime"
                  placeholder="选择开始时间"
                  style="width: 100%"
                  :disabled-date="disabledStartDate"
                  @change="handleStartTimeChange"
                />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="结束时间" prop="endTime" required>
                <el-date-picker
                  v-model="formData.endTime"
                  type="datetime"
                  placeholder="选择结束时间"
                  style="width: 100%"
                  :disabled-date="disabledEndDate"
                  @change="handleEndTimeChange"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row v-if="duration.isValid">
            <el-col :span="24">
              <el-alert
                :title="`请假时长：${duration.days}天${duration.hours}小时${duration.minutes}分钟`"
                type="info"
                :closable="false"
                show-icon
              />
            </el-col>
          </el-row>
        </div>

        <!-- 详细说明 -->
        <div class="form-section">
          <h3 class="section-title">详细说明</h3>

          <el-form-item label="请假详情" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="4"
              placeholder="请详细说明请假事由、去向等信息"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </div>

        <!-- 证明材料 -->
        <div v-if="currentLeaveType?.requiresProof" class="form-section">
          <h3 class="section-title">证明材料</h3>

          <el-form-item label="上传证明" prop="proofFiles">
            <el-upload
              ref="uploadRef"
              v-model:file-list="formData.proofFiles"
              :action="uploadAction"
              :before-upload="beforeUpload"
              :on-success="handleUploadSuccess"
              :on-remove="handleRemoveFile"
              :limit="5"
              multiple
              drag
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                将文件拖到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  支持 jpg/png/pdf 格式，单个文件不超过 10MB，最多上传 5 个文件
                </div>
              </template>
            </el-upload>
          </el-form-item>
        </div>

        <!-- 紧急联系人 -->
        <div class="form-section">
          <h3 class="section-title">紧急联系人</h3>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="联系人姓名" prop="emergencyContactName">
                <el-input
                  v-model="formData.emergencyContactName"
                  placeholder="请输入紧急联系人姓名"
                />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="联系人电话" prop="emergencyContactPhone">
                <el-input
                  v-model="formData.emergencyContactPhone"
                  placeholder="请输入联系人电话"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 审批流程预览 -->
        <div v-if="approvalFlow.length > 0" class="form-section">
          <h3 class="section-title">审批流程</h3>

          <div class="approval-flow">
            <div
              v-for="(level, index) in approvalFlow"
              :key="level.level"
              class="flow-step"
            >
              <div class="step-number">{{ index + 1 }}</div>
              <div class="step-content">
                <div class="step-title">{{ level.roleName }}</div>
                <div class="step-desc">{{ level.description }}</div>
              </div>
              <div v-if="index < approvalFlow.length - 1" class="step-arrow">
                <el-icon><arrow-right /></el-icon>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="info" @click="handleSaveDraft" :loading="savingDraft">
            保存草稿
          </el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            提交申请
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled, ArrowRight } from '@element-plus/icons-vue'
import {
  getAvailableLeaveTypes,
  submitLeaveApplication,
  saveLeaveApplicationDraft,
  uploadProofMaterial,
  getApprovalFlow
} from '@/api/leave'
import type {
  LeaveTypeInfo,
  LeaveApplicationFormData,
  UploadFile
} from '@/types/leave'

const router = useRouter()
const formRef = ref()
const uploadRef = ref()
const submitting = ref(false)
const savingDraft = ref(false)
const availableLeaveTypes = ref<LeaveTypeInfo[]>([])
const approvalFlow = ref<any[]>([])

// 表单数据
const formData = reactive<LeaveApplicationFormData>({
  leaveTypeId: '',
  reason: '',
  description: '',
  startTime: '',
  endTime: '',
  proofFiles: [],
  emergencyContactName: '',
  emergencyContactPhone: ''
})

// 当前选中的请假类型
const currentLeaveType = computed(() => {
  return availableLeaveTypes.value.find(type => type.id === formData.leaveTypeId)
})

// 计算请假时长
const duration = computed(() => {
  if (!formData.startTime || !formData.endTime) {
    return { isValid: false, days: 0, hours: 0, minutes: 0, total: 0 }
  }

  const start = new Date(formData.startTime)
  const end = new Date(formData.endTime)

  if (end <= start) {
    return { isValid: false, days: 0, hours: 0, minutes: 0, total: 0 }
  }

  const diffMs = end.getTime() - start.getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  return {
    isValid: true,
    days,
    hours,
    minutes,
    total: diffMs / (1000 * 60 * 60 * 24)
  }
})

// 上传地址
const uploadAction = '/api/leave/application/upload-proof'

// 表单验证规则
const formRules = {
  leaveTypeId: [
    { required: true, message: '请选择请假类型', trigger: 'change' }
  ],
  reason: [
    { required: true, message: '请输入请假事由', trigger: 'blur' },
    { min: 2, max: 100, message: '请假事由长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  startTime: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  endTime: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ],
  emergencyContactPhone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

// 禁用日期函数
const disabledStartDate = (time: Date) => {
  return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
}

const disabledEndDate = (time: Date) => {
  if (!formData.startTime) return true
  return time.getTime() <= new Date(formData.startTime).getTime()
}

// 获取可用的请假类型
const fetchAvailableLeaveTypes = async () => {
  try {
    const res = await getAvailableLeaveTypes()
    if (res && res.data) {
      availableLeaveTypes.value = res.data
    }
  } catch (error) {
    ElMessage.error('获取请假类型失败')
  }
}

// 获取审批流程
const fetchApprovalFlow = async () => {
  if (!currentLeaveType.value || !duration.value.isValid) {
    approvalFlow.value = []
    return
  }

  try {
    const res = await getApprovalFlow(
      'student', // 假设当前用户是学生，实际应该从用户信息获取
      duration.value.total,
      'day'
    )
    if (res && res.data) {
      approvalFlow.value = res.data.levels
    }
  } catch (error) {
    console.error('获取审批流程失败', error)
  }
}

// 请假类型变化处理
const handleLeaveTypeChange = () => {
  formData.proofFiles = []
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
  fetchApprovalFlow()
}

// 开始时间变化处理
const handleStartTimeChange = () => {
  if (formData.endTime && new Date(formData.endTime) <= new Date(formData.startTime)) {
    formData.endTime = ''
  }
  fetchApprovalFlow()
}

// 结束时间变化处理
const handleEndTimeChange = () => {
  fetchApprovalFlow()
}

// 文件上传前检查
const beforeUpload = (file: File) => {
  const isValidType = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isValidType) {
    ElMessage.error('只能上传 JPG/PNG/PDF 格式的文件!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('上传文件大小不能超过 10MB!')
    return false
  }
  return true
}

// 文件上传成功处理
const handleUploadSuccess = (response: any, file: UploadFile) => {
  if (response.data) {
    const fileInfo = {
      fileId: response.data.fileId,
      fileName: response.data.fileName,
      filePath: response.data.filePath,
      url: response.data.filePath
    }

    // 更新文件列表
    const index = formData.proofFiles.findIndex(f => f.uid === file.uid)
    if (index > -1) {
      formData.proofFiles[index] = { ...formData.proofFiles[index], ...fileInfo }
    }
  }
}

// 移除文件处理
const handleRemoveFile = (file: UploadFile) => {
  const index = formData.proofFiles.findIndex(f => f.uid === file.uid)
  if (index > -1) {
    formData.proofFiles.splice(index, 1)
  }
}

// 验证表单数据
const validateForm = async () => {
  try {
    await formRef.value.validate()

    // 额外验证
    if (!duration.value.isValid) {
      ElMessage.error('请正确选择请假时间')
      return false
    }

    if (currentLeaveType.value) {
      const maxDuration = currentLeaveType.value.maxDuration
      const unit = currentLeaveType.value.durationUnit
      const actualDuration = unit === 'day' ? duration.value.total : duration.value.total * 24

      if (actualDuration > maxDuration) {
        ElMessage.error(`请假时长不能超过 ${maxDuration} ${unit === 'day' ? '天' : '小时'}`)
        return false
      }

      if (currentLeaveType.value.requiresProof && formData.proofFiles.length === 0) {
        ElMessage.error('该请假类型需要上传证明材料')
        return false
      }
    }

    return true
  } catch (error) {
    return false
  }
}

// 保存草稿
const handleSaveDraft = async () => {
  savingDraft.value = true
  try {
    const res = await saveLeaveApplicationDraft(formData)
    if (res && res.data) {
      ElMessage.success('草稿保存成功')
    }
  } catch (error) {
    ElMessage.error('保存草稿失败')
  } finally {
    savingDraft.value = false
  }
}

// 提交申请
const handleSubmit = async () => {
  const isValid = await validateForm()
  if (!isValid) return

  try {
    await ElMessageBox.confirm(
      '确认提交请假申请？提交后将进入审批流程，无法修改。',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    submitting.value = true
    const res = await submitLeaveApplication(formData)
    if (res && res.data) {
      ElMessage.success('申请提交成功')
      router.push('/leave/record')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('提交申请失败')
    }
  } finally {
    submitting.value = false
  }
}

// 取消
const handleCancel = () => {
  router.back()
}

// 初始化
onMounted(() => {
  fetchAvailableLeaveTypes()
})
</script>

<style lang="scss" scoped>
.leave-apply-container {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;

    h2 {
      margin: 0 0 8px 0;
      color: #303133;
    }

    .page-description {
      margin: 0;
      color: #606266;
      font-size: 14px;
    }
  }

  .form-section {
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid #ebeef5;

    &:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }

    .section-title {
      margin: 0 0 20px 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      position: relative;
      padding-left: 12px;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 16px;
        background: #409eff;
        border-radius: 2px;
      }
    }
  }

  .approval-flow {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;

    .flow-step {
      display: flex;
      align-items: center;
      gap: 12px;

      .step-number {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #409eff;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 14px;
      }

      .step-content {
        .step-title {
          font-weight: 600;
          color: #303133;
          margin-bottom: 4px;
        }

        .step-desc {
          font-size: 12px;
          color: #909399;
        }
      }

      .step-arrow {
        color: #c0c4cc;
        font-size: 16px;
      }
    }
  }

  .form-actions {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #ebeef5;
    display: flex;
    justify-content: flex-end;
    gap: 15px;
  }
}

:deep(.el-upload-dragger) {
  width: 100%;
  height: 120px;
}

:deep(.el-date-editor) {
  width: 100%;
}

:deep(.el-alert) {
  margin-top: 10px;
}
</style>
