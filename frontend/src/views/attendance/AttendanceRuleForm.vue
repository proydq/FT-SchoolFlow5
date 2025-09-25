<template>
  <div class="attendance-rule-form-container">
    <!-- 标题与返回区 -->
    <div class="page-header">
      <div class="header-left">
        <h2>{{ isEdit ? `编辑规则 - ${ruleForm.ruleName}` : '新增考勤规则' }}</h2>
      </div>
      <div class="header-right">
        <el-button @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
        </el-button>
        <el-tooltip content="规则配置说明：学生规则需关联年级，教师规则无需关联" placement="top">
          <el-icon class="help-icon"><QuestionFilled /></el-icon>
        </el-tooltip>
      </div>
    </div>

    <!-- 标签页切换区 -->
    <div class="tab-container">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="基础配置" name="basic">
          <div class="tab-content">
            <!-- 基础配置表单 -->
            <el-form
              ref="basicFormRef"
              :model="ruleForm"
              :rules="basicRules"
              label-width="130px"
              class="rule-form"
            >
              <el-row :gutter="20">
                <!-- 第一行：规则名称、打卡类型 -->
                <el-col :span="12">
                  <el-form-item label="规则名称" prop="ruleName">
                    <el-input
                      v-model="ruleForm.ruleName"
                      placeholder="格式：学生上学打卡规则"
                      :disabled="isEdit"
                      maxlength="30"
                      show-word-limit
                      style="width: 300px"
                    />
                  </el-form-item>
                </el-col>

                <el-col :span="12">
                  <el-form-item label="打卡类型" prop="checkType">
                    <el-select v-model="ruleForm.checkType" placeholder="请选择" style="width: 200px">
                      <el-option label="上班/上学打卡" value="work_checkin" />
                      <el-option label="下班/放学打卡" value="work_checkout" />
                      <el-option label="午休外出打卡" value="lunch_break" />
                    </el-select>
                  </el-form-item>
                </el-col>

                <!-- 第二行：适用人员类型、关联年级 -->
                <el-col :span="12">
                  <el-form-item label="适用人员类型" prop="applicableType">
                    <el-select
                      v-model="ruleForm.applicableType"
                      placeholder="请选择"
                      :disabled="isEdit"
                      @change="handleTypeChange"
                      style="width: 150px"
                    >
                      <el-option label="教师" value="teacher" />
                      <el-option label="学生" value="student" />
                    </el-select>
                  </el-form-item>
                </el-col>

                <el-col :span="12" v-if="ruleForm.applicableType === 'student'">
                  <el-form-item label="关联年级" prop="relatedGrades">
                    <el-select
                      v-model="ruleForm.relatedGrades"
                      placeholder="请选择年级（可多选）"
                      multiple
                      style="width: 350px"
                    >
                      <el-option
                        v-for="grade in gradeList"
                        :key="grade.id"
                        :label="grade.name"
                        :value="grade.id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>

                <el-col :span="12" v-else>
                  <!-- 占位，保持布局一致 -->
                </el-col>

                <el-col :span="24">
                  <el-form-item label="时段配置" prop="timeSlots">
                    <div class="time-slots-container">
                      <div
                        v-for="(slot, index) in ruleForm.timeSlots"
                        :key="slot.id || index"
                        class="time-slot-item"
                      >
                        <el-input
                          v-model="slot.name"
                          placeholder="时段名称（如：上午、下午）"
                          style="width: 150px; margin-right: 10px"
                        />
                        <el-time-picker
                          v-model="slot.startTime"
                          placeholder="开始时间"
                          format="HH:mm"
                          value-format="HH:mm"
                          style="width: 120px"
                        />
                        <span style="margin: 0 8px">至</span>
                        <el-time-picker
                          v-model="slot.endTime"
                          placeholder="结束时间"
                          format="HH:mm"
                          value-format="HH:mm"
                          style="width: 120px; margin-right: 10px"
                        />
                        <el-button
                          v-if="ruleForm.timeSlots.length > 1"
                          type="danger"
                          size="small"
                          @click="removeTimeSlot(index)"
                        >
                          删除
                        </el-button>
                        <span v-if="index === 0" class="form-tip">
                          支持多时段配置，单时段时长需≥30分钟，最多支持3个时段
                        </span>
                      </div>
                      <el-button
                        v-if="ruleForm.timeSlots.length < 3"
                        type="primary"
                        size="small"
                        @click="addTimeSlot"
                      >
                        + 新增时段
                      </el-button>
                    </div>
                  </el-form-item>
                </el-col>

                <el-col :span="12">
                  <el-form-item label="允许迟到" prop="allowedDeviation.lateMinutes">
                    <el-input-number
                      v-model="ruleForm.allowedDeviation.lateMinutes"
                      :min="0"
                      :max="30"
                      :step="1"
                      style="width: 200px"
                    />
                    <span class="form-tip">允许迟到时长（0-30分钟）</span>
                  </el-form-item>
                </el-col>

                <el-col :span="12">
                  <el-form-item label="允许早退" prop="allowedDeviation.earlyMinutes">
                    <el-input-number
                      v-model="ruleForm.allowedDeviation.earlyMinutes"
                      :min="0"
                      :max="30"
                      :step="1"
                      style="width: 200px"
                    />
                    <span class="form-tip">允许早退时长（0-30分钟）</span>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>
        </el-tab-pane>

        <el-tab-pane label="生效配置" name="effective">
          <div class="tab-content">
            <!-- 生效配置表单 -->
            <el-form
              ref="effectiveFormRef"
              :model="ruleForm"
              :rules="effectiveRules"
              label-width="130px"
              class="rule-form"
            >
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="规则状态" prop="status">
                    <el-select v-model="ruleForm.status" @change="handleStatusChange" style="width: 150px">
                      <el-option label="生效中" value="active" />
                      <el-option label="待生效" value="pending" />
                      <el-option label="已失效" value="inactive" />
                    </el-select>
                  </el-form-item>
                </el-col>

                <el-col :span="12" v-if="ruleForm.status === 'pending'">
                  <el-form-item label="生效日期" prop="effectiveDate">
                    <el-date-picker
                      v-model="ruleForm.effectiveDate"
                      type="date"
                      placeholder="选择生效日期"
                      :disabled-date="disabledDate"
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD"
                      style="width: 200px"
                    />
                  </el-form-item>
                </el-col>

                <el-col :span="12" v-if="ruleForm.status === 'active' || ruleForm.status === 'pending'">
                  <el-form-item label="失效日期" prop="expiryDate">
                    <el-date-picker
                      v-model="ruleForm.expiryDate"
                      type="date"
                      placeholder="选择失效日期（可选）"
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD"
                      style="width: 200px"
                    />
                  </el-form-item>
                </el-col>

                <el-col :span="24">
                  <el-form-item label="规则备注" prop="remark">
                    <el-input
                      v-model="ruleForm.remark"
                      type="textarea"
                      :rows="4"
                      placeholder="请输入规则用途说明，如：仅适用于小学部学生"
                      maxlength="200"
                      show-word-limit
                      style="width: 500px"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 操作按钮区 -->
    <div class="action-bar">
      <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
        <el-icon><Check /></el-icon>
        保存并返回
      </el-button>
      <el-button type="success" @click="handleSubmitAndNew" :loading="submitLoading">
        <el-icon><Plus /></el-icon>
        保存并新增
      </el-button>
      <el-button @click="handlePreview">
        <el-icon><View /></el-icon>
        预览
      </el-button>
      <el-button @click="handleBack">
        <el-icon><Close /></el-icon>
        取消
      </el-button>
    </div>

    <!-- 预览弹窗 -->
    <el-dialog v-model="previewVisible" title="规则预览" width="600px">
      <div class="rule-preview">
        <div class="preview-section">
          <h4>基础信息</h4>
          <div class="preview-item">
            <label>规则名称：</label>
            <span>{{ ruleForm.ruleName }}</span>
          </div>
          <div class="preview-item">
            <label>适用类型：</label>
            <span>{{ ruleForm.applicableType === 'teacher' ? '教师' : '学生' }}</span>
          </div>
          <div v-if="ruleForm.relatedGrades?.length" class="preview-item">
            <label>关联年级：</label>
            <span>{{ getGradeNames(ruleForm.relatedGrades).join('、') }}</span>
          </div>
        </div>

        <div class="preview-section">
          <h4>打卡配置</h4>
          <div class="preview-item">
            <label>打卡类型：</label>
            <span>{{ getCheckTypeText(ruleForm.checkType) }}</span>
          </div>
          <div class="preview-item">
            <label>时段配置：</label>
            <div>
              <div v-for="slot in ruleForm.timeSlots" :key="slot.id" class="time-slot-preview">
                {{ slot.name }}：{{ slot.startTime }} - {{ slot.endTime }}
              </div>
            </div>
          </div>
          <div class="preview-item">
            <label>允许偏差：</label>
            <span>迟到≤{{ ruleForm.allowedDeviation.lateMinutes }}分钟，早退≤{{ ruleForm.allowedDeviation.earlyMinutes }}分钟</span>
          </div>
        </div>

        <div class="preview-section">
          <h4>生效配置</h4>
          <div class="preview-item">
            <label>规则状态：</label>
            <el-tag :type="getStatusTagType(ruleForm.status)">
              {{ getStatusText(ruleForm.status) }}
            </el-tag>
          </div>
          <div v-if="ruleForm.effectiveDate" class="preview-item">
            <label>生效日期：</label>
            <span>{{ ruleForm.effectiveDate }}</span>
          </div>
          <div v-if="ruleForm.expiryDate" class="preview-item">
            <label>失效日期：</label>
            <span>{{ ruleForm.expiryDate }}</span>
          </div>
          <div v-if="ruleForm.remark" class="preview-item">
            <label>规则备注：</label>
            <span>{{ ruleForm.remark }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  ArrowLeft,
  QuestionFilled,
  Check,
  Plus,
  View,
  Close
} from '@element-plus/icons-vue'
import {
  getAttendanceRule,
  createAttendanceRule,
  updateAttendanceRule,
  getGradeList
} from '@/api/attendance'
import type { AttendanceRule, TimeSlot } from '@/types/attendance'

const route = useRoute()
const router = useRouter()
const basicFormRef = ref<FormInstance>()
const effectiveFormRef = ref<FormInstance>()
const submitLoading = ref(false)
const previewVisible = ref(false)
const activeTab = ref('basic')
const gradeList = ref<any[]>([])

const isEdit = computed(() => route.params.id !== undefined)

// 表单数据
const ruleForm = reactive<Partial<AttendanceRule>>({
  ruleName: '',
  applicableType: 'student',
  relatedGrades: [],
  checkType: 'work_checkin',
  timeSlots: [
    {
      id: '1',
      name: '上午',
      startTime: '07:30',
      endTime: '08:30'
    }
  ],
  allowedDeviation: {
    lateMinutes: 10,
    earlyMinutes: 0
  },
  status: 'pending',
  effectiveDate: '',
  expiryDate: '',
  remark: ''
})

// 基础配置验证规则
const basicRules: FormRules = {
  ruleName: [
    { required: true, message: '请输入规则名称', trigger: 'blur' },
    { min: 5, max: 30, message: '长度在 5 到 30 个字符', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9\u4e00-\u9fa5]+$/,
      message: '规则名称不能包含特殊符号',
      trigger: 'blur'
    }
  ],
  applicableType: [
    { required: true, message: '请选择适用人员类型', trigger: 'change' }
  ],
  relatedGrades: [
    {
      validator: (rule, value, callback) => {
        if (ruleForm.applicableType === 'student' && (!value || value.length === 0)) {
          callback(new Error('学生规则需关联至少1个年级'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  checkType: [
    { required: true, message: '请选择打卡类型', trigger: 'change' }
  ],
  timeSlots: [
    {
      validator: (rule, value, callback) => {
        if (!value || value.length === 0) {
          callback(new Error('请配置至少1个打卡时段'))
        } else {
          // 验证时段配置
          for (const slot of value) {
            if (!slot.startTime || !slot.endTime) {
              callback(new Error('请完整配置时段时间'))
              return
            }

            const start = new Date(`2000-01-01 ${slot.startTime}`)
            const end = new Date(`2000-01-01 ${slot.endTime}`)
            const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60)

            if (diffMinutes < 30) {
              callback(new Error('单时段时长不可少于30分钟'))
              return
            }

            if (start >= end) {
              callback(new Error('时段开始时间不可晚于结束时间'))
              return
            }
          }
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// 生效配置验证规则
const effectiveRules: FormRules = {
  status: [
    { required: true, message: '请选择规则状态', trigger: 'change' }
  ],
  effectiveDate: [
    {
      validator: (rule, value, callback) => {
        if (ruleForm.status === 'pending' && !value) {
          callback(new Error('待生效规则需设置生效日期'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// 获取打卡类型文本
const getCheckTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    work_checkin: '上班/上学打卡',
    work_checkout: '下班/放学打卡',
    lunch_break: '午休外出打卡'
  }
  return typeMap[type] || type
}

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  const typeMap: Record<string, string> = {
    active: 'success',
    pending: 'warning',
    inactive: 'info'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    active: '生效中',
    pending: '待生效',
    inactive: '已失效'
  }
  return textMap[status] || status
}

// 获取年级名称
const getGradeNames = (gradeIds: string[]) => {
  return gradeIds.map(id => {
    const grade = gradeList.value.find(g => g.id === id)
    return grade ? grade.name : id
  })
}

// 禁用日期（生效日期不可早于当前日期）
const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
}

// 人员类型变化
const handleTypeChange = (type: string) => {
  if (type === 'teacher') {
    ruleForm.relatedGrades = []
  }
}

// 状态变化
const handleStatusChange = (status: string) => {
  if (status === 'active') {
    ruleForm.effectiveDate = ''
  }
}

// 添加时段
const addTimeSlot = () => {
  if (ruleForm.timeSlots && ruleForm.timeSlots.length < 3) {
    ruleForm.timeSlots.push({
      id: Date.now().toString(),
      name: '',
      startTime: '',
      endTime: ''
    })
  }
}

// 删除时段
const removeTimeSlot = (index: number) => {
  if (ruleForm.timeSlots && ruleForm.timeSlots.length > 1) {
    ruleForm.timeSlots.splice(index, 1)
  }
}

// 预览
const handlePreview = () => {
  previewVisible.value = true
}

// 返回
const handleBack = () => {
  router.push('/attendance/rules')
}

// 表单验证
const validateForm = async () => {
  try {
    await basicFormRef.value?.validate()
    await effectiveFormRef.value?.validate()
    return true
  } catch (error) {
    return false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!(await validateForm())) {
    ElMessage.error('请检查表单填写')
    return
  }

  submitLoading.value = true
  try {
    const formData = { ...ruleForm }

    if (isEdit.value) {
      await updateAttendanceRule(route.params.id as string, formData)
      ElMessage.success('规则更新成功')
    } else {
      await createAttendanceRule(formData)
      ElMessage.success('规则创建成功')
    }

    handleBack()
  } catch (error) {
    ElMessage.error(isEdit.value ? '规则更新失败' : '规则创建失败')
  } finally {
    submitLoading.value = false
  }
}

// 保存并新增
const handleSubmitAndNew = async () => {
  if (!(await validateForm())) {
    ElMessage.error('请检查表单填写')
    return
  }

  submitLoading.value = true
  try {
    const formData = { ...ruleForm }
    await createAttendanceRule(formData)
    ElMessage.success('规则创建成功')

    // 重置表单
    Object.assign(ruleForm, {
      ruleName: '',
      applicableType: 'student',
      relatedGrades: [],
      checkType: 'work_checkin',
      timeSlots: [
        {
          id: '1',
          name: '上午',
          startTime: '07:30',
          endTime: '08:30'
        }
      ],
      allowedDeviation: {
        lateMinutes: 10,
        earlyMinutes: 0
      },
      status: 'pending',
      effectiveDate: '',
      expiryDate: '',
      remark: ''
    })

    activeTab.value = 'basic'
  } catch (error) {
    ElMessage.error('规则创建失败')
  } finally {
    submitLoading.value = false
  }
}

// 获取年级列表
const fetchGradeList = async () => {
  try {
    const res = await getGradeList()
    if (res && res.data) {
      gradeList.value = res.data
    }
  } catch (error) {
    console.error('获取年级列表失败', error)
  }
}

// 获取规则详情（编辑模式）
const fetchRuleDetail = async () => {
  if (!isEdit.value) return

  try {
    const res = await getAttendanceRule(route.params.id as string)
    if (res && res.data) {
      Object.assign(ruleForm, res.data)
    }
  } catch (error) {
    ElMessage.error('获取规则详情失败')
    handleBack()
  }
}

// 初始化
onMounted(() => {
  fetchGradeList()
  fetchRuleDetail()
})
</script>

<style lang="scss" scoped>
.attendance-rule-form-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .header-left h2 {
      margin: 0;
      color: #303133;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 15px;

      .help-icon {
        color: #909399;
        cursor: pointer;

        &:hover {
          color: #409eff;
        }
      }
    }
  }

  .tab-container {
    margin-bottom: 30px;

    :deep(.el-tabs--border-card) {
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      background-color: #ffffff;
      border: none;
    }

    :deep(.el-tabs__header) {
      background-color: #f5f7fa;
      border-bottom: 1px solid #e4e7ed;
      border-radius: 8px 8px 0 0;
    }

    :deep(.el-tabs__item) {
      font-size: 14px;
      height: 40px;
      line-height: 40px;
    }

    :deep(.el-tabs__item.is-active) {
      color: #409EFF;
      background-color: #ffffff;
      border-right-color: #e4e7ed;
      border-left-color: #e4e7ed;
    }

    .tab-content {
      padding: 20px;
    }
  }

  .rule-form {
    .form-tip {
      margin-left: 10px;
      font-size: 12px;
      color: #909399;
    }

    .time-slots-container {
      .time-slot-item {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
      }
    }
  }

  .action-bar {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    padding: 20px 0;
    border-top: 1px solid #ebeef5;
  }

  .rule-preview {
    .preview-section {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #ebeef5;

      &:last-child {
        border-bottom: none;
        margin-bottom: 0;
      }

      h4 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }

      .preview-item {
        margin-bottom: 12px;
        display: flex;
        align-items: flex-start;

        label {
          min-width: 80px;
          color: #606266;
          font-weight: 500;
        }

        span {
          color: #303133;
        }

        .time-slot-preview {
          margin-bottom: 4px;
          font-size: 14px;
        }
      }
    }
  }
}

:deep(.el-form-item__error) {
  color: #f56c6c;
  font-size: 12px;
  line-height: 1.2;
  margin-top: 4px;
}

:deep(.el-tabs__content) {
  overflow: visible;
}
</style>