<template>
  <div class="leave-type-edit-container">
    <!-- 标题与返回区 -->
    <el-page-header @back="handleBack">
      <template #title>
        <span>{{ isEdit ? `编辑类型 - ${originalTypeName}` : '新增请假类型' }}</span>
      </template>
      <template #extra>
        <el-button @click="handleBack">返回列表</el-button>
        <el-tooltip content="学生类型最长时长不可超过7天" placement="bottom">
          <el-button type="text" :icon="QuestionFilled" />
        </el-tooltip>
      </template>
    </el-page-header>

    <!-- 表单内容 -->
    <el-card style="margin-top: 20px">
      <!-- 标签页切换 -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="基础配置" name="basic">
          <el-form
            ref="basicFormRef"
            :model="formData"
            :rules="basicRules"
            label-width="130px"
            style="max-width: 800px"
          >
            <el-form-item label="类型名称" prop="typeName">
              <el-input
                v-model="formData.typeName"
                placeholder="格式：学生病假"
                maxlength="20"
                show-word-limit
                style="width: 320px"
                :disabled="isEdit"
                @blur="checkTypeName"
              />
              <div v-if="!isEdit" class="form-tip">
                类型名称一旦保存将无法修改
              </div>
            </el-form-item>

            <el-form-item label="适用人员类型" prop="applicablePersonType">
              <el-select
                v-model="formData.applicablePersonType"
                placeholder="请选择适用人员类型"
                style="width: 320px"
                :disabled="isEdit"
                @change="handlePersonTypeChange"
              >
                <el-option label="教师" value="teacher" />
                <el-option label="学生" value="student" />
              </el-select>
            </el-form-item>

            <el-form-item label="类型描述" prop="description">
              <el-input
                v-model="formData.description"
                type="textarea"
                :rows="2"
                placeholder="说明类型用途，如'学生因病请假'"
                maxlength="100"
                show-word-limit
                style="width: 500px"
              />
            </el-form-item>

            <el-form-item label="类型状态" prop="status">
              <el-select
                v-model="formData.status"
                placeholder="请选择类型状态"
                style="width: 320px"
              >
                <el-option label="启用" value="active" />
                <el-option label="停用" value="inactive" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="约束配置" name="constraints">
          <el-form
            ref="constraintsFormRef"
            :model="formData"
            :rules="constraintsRules"
            label-width="130px"
            style="max-width: 800px"
          >
            <el-form-item label="最长时长" prop="maxDuration">
              <div class="duration-input">
                <el-select
                  v-model="formData.durationUnit"
                  style="width: 100px"
                  @change="handleUnitChange"
                >
                  <el-option label="天" value="day" />
                  <el-option
                    v-if="formData.applicablePersonType === 'teacher'"
                    label="小时"
                    value="hour"
                  />
                </el-select>
                <el-input-number
                  v-model="formData.maxDuration"
                  :min="1"
                  :max="durationMax"
                  :step="durationStep"
                  :precision="durationUnit === 'hour' ? 1 : 0"
                  style="width: 100px; margin-left: 10px"
                />
              </div>
              <div class="form-tip">
                {{ durationTip }}
              </div>
            </el-form-item>

            <el-form-item label="是否需证明" prop="requiresProof">
              <el-radio-group v-model="formData.requiresProof">
                <el-radio :label="true">是</el-radio>
                <el-radio :label="false">否</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item
              v-if="formData.requiresProof"
              label="证明材料类型"
              prop="proofMaterialType"
            >
              <el-input
                v-model="formData.proofMaterialType"
                placeholder="如医院诊断书/家长说明"
                maxlength="50"
                style="width: 320px"
              />
              <div class="form-tip">
                申请时需上传对应证明材料，否则无法提交
              </div>
            </el-form-item>

            <el-form-item label="备注" prop="remark">
              <el-input
                v-model="formData.remark"
                type="textarea"
                :rows="3"
                placeholder="用于补充约束如'学生事假每月不超过2次'"
                maxlength="500"
                show-word-limit
                style="width: 500px"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button type="primary" @click="handleSaveAndReturn">
          保存并返回
        </el-button>
        <el-button type="primary" plain @click="handleSaveAndNew">
          保存并新增
        </el-button>
        <el-button @click="handlePreview">预览</el-button>
        <el-button @click="handleCancel">取消</el-button>
      </div>
    </el-card>

    <!-- 预览弹窗 -->
    <el-dialog v-model="previewDialogVisible" title="类型预览" width="500px">
      <div class="preview-content">
        <div class="preview-item">
          <label>类型名称：</label>
          <span>{{ formData.typeName || '-' }}</span>
        </div>
        <div class="preview-item">
          <label>适用人员：</label>
          <span>{{ formData.applicablePersonType === 'teacher' ? '教师' : '学生' }}</span>
        </div>
        <div class="preview-item">
          <label>最长时长：</label>
          <span>{{ formData.maxDuration }}{{ formData.durationUnit === 'day' ? '天' : '小时' }}</span>
        </div>
        <div class="preview-item">
          <label>是否需证明：</label>
          <span>{{ formData.requiresProof ? '是' : '否' }}</span>
          <span v-if="formData.requiresProof && formData.proofMaterialType">
            （{{ formData.proofMaterialType }}）
          </span>
        </div>
        <div class="preview-item">
          <label>类型状态：</label>
          <el-tag :type="formData.status === 'active' ? 'success' : 'info'">
            {{ formData.status === 'active' ? '启用' : '停用' }}
          </el-tag>
        </div>
        <div v-if="formData.description" class="preview-item">
          <label>类型描述：</label>
          <span>{{ formData.description }}</span>
        </div>
        <div v-if="formData.remark" class="preview-item">
          <label>备注：</label>
          <span>{{ formData.remark }}</span>
        </div>
      </div>

      <template #footer>
        <el-button @click="previewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { QuestionFilled } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getLeaveTypeDetail,
  addLeaveType,
  updateLeaveType,
  checkLeaveTypeName
} from '@/api/leave'
import type { LeaveTypeFormData } from '@/types/leave'

const route = useRoute()
const router = useRouter()
const basicFormRef = ref<FormInstance>()
const constraintsFormRef = ref<FormInstance>()
const loading = ref(false)
const activeTab = ref('basic')
const previewDialogVisible = ref(false)
const originalTypeName = ref('')

// 是否编辑模式
const isEdit = computed(() => !!route.params.id)
const typeId = computed(() => route.params.id as string)

// 表单数据
const formData = reactive<LeaveTypeFormData>({
  typeName: '',
  applicablePersonType: 'teacher',
  description: '',
  maxDuration: 1,
  durationUnit: 'day',
  requiresProof: false,
  proofMaterialType: '',
  status: 'active',
  remark: ''
})

// 时长限制
const durationMax = computed(() => {
  if (formData.applicablePersonType === 'student') {
    return formData.durationUnit === 'day' ? 7 : 24
  } else {
    return formData.durationUnit === 'day' ? 15 : 24
  }
})

const durationStep = computed(() => {
  return formData.durationUnit === 'hour' ? 0.5 : 1
})

const durationTip = computed(() => {
  if (formData.applicablePersonType === 'student') {
    return formData.durationUnit === 'day'
      ? '学生≤7天，学生仅支持天'
      : '学生≤7天，小时仅支持0.5的倍数'
  } else {
    return formData.durationUnit === 'day'
      ? '教师≤15天，学生≤7天'
      : '小时仅支持0.5的倍数（如2.5小时）'
  }
})

// 基础配置验证规则
const basicRules = reactive<FormRules>({
  typeName: [
    { required: true, message: '请输入类型名称', trigger: 'blur' },
    { min: 2, max: 20, message: '类型名称长度在2到20个字符', trigger: 'blur' },
    {
      pattern: /^[^\@\#\￥\%]+$/,
      message: '类型名称不可含特殊符号（@#￥%等）',
      trigger: 'blur'
    }
  ],
  applicablePersonType: [
    { required: true, message: '请选择适用人员类型', trigger: 'change' }
  ],
  description: [
    { max: 100, message: '类型描述不可超过100字', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择类型状态', trigger: 'change' }
  ]
})

// 约束配置验证规则
const constraintsRules = reactive<FormRules>({
  maxDuration: [
    { required: true, message: '请填写最长时长', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (formData.applicablePersonType === 'student' && value > 7) {
          callback(new Error('学生类型最长时长不可超过7天'))
        } else if (formData.applicablePersonType === 'teacher' && value > 15) {
          callback(new Error('教师类型最长时长不可超过15天'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  requiresProof: [
    { required: true, message: '请选择是否需要证明材料', trigger: 'change' }
  ],
  proofMaterialType: [
    {
      required: formData.requiresProof,
      message: '请输入证明材料类型',
      trigger: 'blur'
    }
  ],
  remark: [
    { max: 500, message: '备注不可超过500字', trigger: 'blur' }
  ]
})

// 人员类型变化处理
const handlePersonTypeChange = (value: 'teacher' | 'student') => {
  // 学生类型仅支持天
  if (value === 'student') {
    formData.durationUnit = 'day'
    if (formData.maxDuration > 7) {
      formData.maxDuration = 7
    }
  }
}

// 单位变化处理
const handleUnitChange = (value: 'day' | 'hour') => {
  // 重置时长
  formData.maxDuration = 1
}

// 标签页切换
const handleTabChange = (tabName: string) => {
  // 切换到约束配置时验证基础配置
  if (tabName === 'constraints' && basicFormRef.value) {
    basicFormRef.value.validate()
  }
}

// 检查类型名称
const checkTypeName = async () => {
  if (!formData.typeName || isEdit.value) return

  try {
    const res = await checkLeaveTypeName(formData.typeName)
    if (res && res.data && res.data.exists) {
      ElMessage.warning(`类型名称'${formData.typeName}'已存在，请重新命名`)
      formData.typeName = ''
    }
  } catch (error) {
    console.error('检查类型名称失败', error)
  }
}

// 获取类型详情
const fetchTypeDetail = async () => {
  if (!isEdit.value) return

  loading.value = true
  try {
    const res = await getLeaveTypeDetail(typeId.value)
    if (res && res.data) {
      const data = res.data
      originalTypeName.value = data.typeName
      Object.assign(formData, {
        typeName: data.typeName,
        applicablePersonType: data.applicablePersonType,
        description: data.description || '',
        maxDuration: data.maxDuration,
        durationUnit: data.durationUnit,
        requiresProof: data.requiresProof,
        proofMaterialType: data.proofMaterialType || '',
        status: data.status,
        remark: data.remark || ''
      })
    }
  } catch (error) {
    ElMessage.error('获取类型详情失败')
    console.error('获取类型详情失败', error)
    router.back()
  } finally {
    loading.value = false
  }
}

// 验证全部表单
const validateAllForms = async (): Promise<boolean> => {
  const basicValid = await basicFormRef.value?.validate().catch(() => false)
  const constraintsValid = await constraintsFormRef.value?.validate().catch(() => false)
  return !!(basicValid && constraintsValid)
}

// 保存并返回
const handleSaveAndReturn = async () => {
  if (!(await validateAllForms())) {
    ElMessage.warning('请检查表单填写')
    return
  }

  try {
    const data = { ...formData }

    if (isEdit.value) {
      await updateLeaveType(typeId.value, data)
      ElMessage.success('修改成功')
    } else {
      await addLeaveType(data)
      ElMessage.success('新增成功')
    }

    router.push('/leave/type')
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

// 保存并新增
const handleSaveAndNew = async () => {
  if (!(await validateAllForms())) {
    ElMessage.warning('请检查表单填写')
    return
  }

  try {
    const data = { ...formData }
    await addLeaveType(data)
    ElMessage.success('新增成功')

    // 清空表单
    Object.assign(formData, {
      typeName: '',
      applicablePersonType: 'teacher',
      description: '',
      maxDuration: 1,
      durationUnit: 'day',
      requiresProof: false,
      proofMaterialType: '',
      status: 'active',
      remark: ''
    })

    activeTab.value = 'basic'
  } catch (error: any) {
    ElMessage.error(error.message || '新增失败')
  }
}

// 预览
const handlePreview = () => {
  previewDialogVisible.value = true
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
    router.push('/leave/type')
  }).catch(() => {
    // 取消操作
  })
}

// 返回
const handleBack = () => {
  router.push('/leave/type')
}

// 初始化
onMounted(() => {
  fetchTypeDetail()
})
</script>

<style lang="scss" scoped>
.leave-type-edit-container {
  padding: 20px;

  .duration-input {
    display: flex;
    align-items: center;
  }

  .form-tip {
    margin-top: 5px;
    margin-left: 15px;
    font-size: 12px;
    color: #f56c6c;
  }

  .action-buttons {
    margin-top: 40px;
    text-align: left;
    display: flex;
    gap: 15px;
  }

  .preview-content {
    .preview-item {
      display: flex;
      margin-bottom: 15px;

      label {
        width: 120px;
        font-weight: 600;
        color: #606266;
      }

      span {
        flex: 1;
        color: #303133;
      }
    }
  }
}
</style>