<template>
  <div class="permission-form">
    <!-- 标题与返回区 -->
    <div class="header-section">
      <div class="page-title">
        <h2>手动创建通行权限</h2>
      </div>
      <div class="header-actions">
        <el-button @click="handleBack">返回列表</el-button>
        <el-tooltip content="手动创建权限规则：学生仅可选择校门/宿舍区闸机" placement="bottom">
          <el-icon class="help-icon"><QuestionFilled /></el-icon>
        </el-tooltip>
      </div>
    </div>

    <!-- 表单内容区 -->
    <div class="form-container">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="130px"
        label-position="right"
      >
        <!-- 基础配置区域 -->
        <div class="form-section">
          <h3 class="section-title">基础配置</h3>

          <el-row :gutter="24">
            <el-col :span="6">
              <el-form-item label="人员类型" prop="userType" required>
                <el-select
                  v-model="formData.userType"
                  placeholder="请选择人员类型"
                  style="width: 100%"
                  @change="handleUserTypeChange"
                >
                  <el-option label="教师" value="teacher" />
                  <el-option label="学生" value="student" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item label="关联人员" prop="userId" required>
                <el-select
                  v-model="formData.userId"
                  filterable
                  remote
                  placeholder="支持输入姓名/工号/学号搜索"
                  style="width: 100%"
                  :remote-method="searchUsers"
                  :loading="searchLoading"
                  :disabled="!formData.userType"
                >
                  <el-option
                    v-for="user in userOptions"
                    :key="user.id"
                    :label="`${user.name}（${user.code}）- ${user.department}`"
                    :value="user.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="6">
              <el-form-item label="权限来源" prop="source" required>
                <el-select
                  v-model="formData.source"
                  placeholder="请选择权限来源"
                  style="width: 100%"
                  @change="handleSourceChange"
                >
                  <el-option label="手动创建" value="manual" />
                  <el-option label="通勤默认" value="commute" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item label="关联业务ID" prop="businessId">
                <el-input
                  v-model="formData.businessId"
                  placeholder="通勤默认填COMMUTE，其他填业务标识"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="6">
              <el-form-item label="开始时间" prop="startTime" required>
                <el-date-picker
                  v-model="formData.startTime"
                  type="datetime"
                  placeholder="请选择开始时间"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  style="width: 100%"
                  :disabled-date="disabledStartDate"
                />
                <div class="field-tip">
                  {{ getValidPeriodTip() }}
                </div>
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item label="结束时间" prop="endTime" required>
                <el-date-picker
                  v-model="formData.endTime"
                  type="datetime"
                  placeholder="请选择结束时间"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  style="width: 100%"
                  :disabled-date="disabledEndDate"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 通行区域配置 -->
        <div class="form-section">
          <h3 class="section-title">通行区域配置</h3>

          <el-row :gutter="24">
            <el-col :span="6">
              <el-form-item label="快速选择" prop="quickSelect">
                <el-select
                  v-model="quickSelectValue"
                  placeholder="选择预设权限模板"
                  style="width: 100%"
                  @change="handleQuickSelect"
                  clearable
                >
                  <el-option
                    v-if="formData.userType === 'teacher'"
                    label="🏫 教师默认权限（校门+办公楼）"
                    value="teacher_default"
                  />
                  <el-option
                    v-if="formData.userType === 'student'"
                    label="🏠 学生默认权限（校门+宿舍）"
                    value="student_default"
                  />
                  <el-option label="🚪 仅校门权限" value="gate_only" />
                  <el-option label="🏢 全部权限" value="all_access" />
                  <el-option label="✏️ 自定义选择" value="custom" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="已选终端">
                <div class="selected-count">
                  <el-tag type="primary" size="large">
                    已选择 {{ formData.deviceIds.length }} 个终端
                  </el-tag>
                  <el-button
                    v-if="formData.deviceIds.length > 0"
                    type="danger"
                    size="small"
                    plain
                    @click="clearAllSelection"
                  >
                    清空
                  </el-button>
                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 自定义选择时显示设备列表 -->
          <el-row :gutter="24" v-if="showCustomSelection">
            <el-col :span="24">
              <el-form-item label="自定义选择" prop="deviceIds" required>
                <div class="device-selection-grid">
                  <!-- 校门区域 -->
                  <div class="device-group" v-if="devicesByType.gate.length > 0">
                    <div class="group-header">
                      <el-icon><Lock /></el-icon>
                      <span>校门区域</span>
                      <el-tag size="small" type="info">{{ getAvailableCount(devicesByType.gate) }}台</el-tag>
                    </div>
                    <div class="device-list-horizontal">
                      <div
                        v-for="device in devicesByType.gate.filter(d => ['online', 'offline'].includes(d.status)).slice(0, 10)"
                        :key="device.id"
                        class="device-item"
                        :class="{
                          'selected': formData.deviceIds.includes(device.id),
                          'disabled': device.status === 'offline'
                        }"
                        @click="toggleDevice(device)"
                      >
                        <el-checkbox
                          :model-value="formData.deviceIds.includes(device.id)"
                          :disabled="device.status === 'offline'"
                          @click.stop
                          @change="(val) => handleDeviceToggle(device.id, val)"
                        >
                          <div class="device-content">
                            <span class="device-name">{{ device.name }}</span>
                            <el-tag
                              :type="device.status === 'online' ? 'success' : 'danger'"
                              size="small"
                            >
                              {{ device.status === 'online' ? '✓' : '✗' }}
                            </el-tag>
                          </div>
                        </el-checkbox>
                      </div>
                    </div>
                  </div>

                  <!-- 办公楼区域 -->
                  <div class="device-group" v-if="formData.userType === 'teacher' && devicesByType.office.length > 0">
                    <div class="group-header">
                      <el-icon><School /></el-icon>
                      <span>办公楼</span>
                      <el-tag size="small" type="info">{{ getAvailableCount(devicesByType.office) }}台</el-tag>
                    </div>
                    <div class="device-list-horizontal">
                      <div
                        v-for="device in devicesByType.office.filter(d => ['online', 'offline'].includes(d.status)).slice(0, 10)"
                        :key="device.id"
                        class="device-item"
                        :class="{
                          'selected': formData.deviceIds.includes(device.id),
                          'disabled': device.status === 'offline'
                        }"
                        @click="toggleDevice(device)"
                      >
                        <el-checkbox
                          :model-value="formData.deviceIds.includes(device.id)"
                          :disabled="device.status === 'offline'"
                          @click.stop
                          @change="(val) => handleDeviceToggle(device.id, val)"
                        >
                          <div class="device-content">
                            <span class="device-name">{{ device.name }}</span>
                            <el-tag
                              :type="device.status === 'online' ? 'success' : 'danger'"
                              size="small"
                            >
                              {{ device.status === 'online' ? '✓' : '✗' }}
                            </el-tag>
                          </div>
                        </el-checkbox>
                      </div>
                    </div>
                  </div>

                  <!-- 宿舍区域 -->
                  <div class="device-group" v-if="devicesByType.dormitory.length > 0">
                    <div class="group-header">
                      <el-icon><House /></el-icon>
                      <span>宿舍区</span>
                      <el-tag size="small" type="info">{{ getAvailableCount(devicesByType.dormitory) }}台</el-tag>
                    </div>
                    <div class="device-list-horizontal">
                      <div
                        v-for="device in devicesByType.dormitory.filter(d => ['online', 'offline'].includes(d.status)).slice(0, 10)"
                        :key="device.id"
                        class="device-item"
                        :class="{
                          'selected': formData.deviceIds.includes(device.id),
                          'disabled': device.status === 'offline'
                        }"
                        @click="toggleDevice(device)"
                      >
                        <el-checkbox
                          :model-value="formData.deviceIds.includes(device.id)"
                          :disabled="device.status === 'offline'"
                          @click.stop
                          @change="(val) => handleDeviceToggle(device.id, val)"
                        >
                          <div class="device-content">
                            <span class="device-name">{{ device.name }}</span>
                            <el-tag
                              :type="device.status === 'online' ? 'success' : 'danger'"
                              size="small"
                            >
                              {{ device.status === 'online' ? '✓' : '✗' }}
                            </el-tag>
                          </div>
                        </el-checkbox>
                      </div>
                    </div>
                  </div>

                  <!-- 其他区域 -->
                  <div class="device-group" v-if="devicesByType.other.length > 0">
                    <div class="group-header">
                      <el-icon><Grid /></el-icon>
                      <span>其他区域</span>
                      <el-tag size="small" type="info">{{ getAvailableCount(devicesByType.other) }}台</el-tag>
                    </div>
                    <div class="device-list-horizontal">
                      <div
                        v-for="device in devicesByType.other.filter(d => ['online', 'offline'].includes(d.status)).slice(0, 10)"
                        :key="device.id"
                        class="device-item"
                        :class="{
                          'selected': formData.deviceIds.includes(device.id),
                          'disabled': device.status === 'offline'
                        }"
                        @click="toggleDevice(device)"
                      >
                        <el-checkbox
                          :model-value="formData.deviceIds.includes(device.id)"
                          :disabled="device.status === 'offline'"
                          @click.stop
                          @change="(val) => handleDeviceToggle(device.id, val)"
                        >
                          <div class="device-content">
                            <span class="device-name">{{ device.name }}</span>
                            <el-tag
                              :type="device.status === 'online' ? 'success' : 'danger'"
                              size="small"
                            >
                              {{ device.status === 'online' ? '✓' : '✗' }}
                            </el-tag>
                          </div>
                        </el-checkbox>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="formData.userType === 'student'" class="field-tip error">
                  学生权限不可选择办公楼终端
                </div>
                <div class="field-tip">
                  点击选择终端，离线终端无法选择
                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="备注">
                <el-input
                  v-model="formData.remark"
                  type="textarea"
                  :rows="3"
                  placeholder="如：临时权限用于参加校外活动"
                  style="width: 100%"
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
    </div>

    <!-- 操作按钮区 -->
    <div class="action-section">
      <el-button type="success" size="large" @click="handleSaveAndBack" :loading="saving">
        保存并返回
      </el-button>
      <el-button type="primary" size="large" @click="handleSaveAndNew" :loading="saving">
        保存并新增
      </el-button>
      <el-button size="large" @click="handlePreview">
        预览权限
      </el-button>
      <el-button size="large" @click="handleCancel">
        取消
      </el-button>
    </div>

    <!-- 权限预览弹窗 -->
    <el-dialog
      v-model="previewVisible"
      title="权限预览"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="previewData" class="preview-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="权限ID">{{ previewData.id }}</el-descriptions-item>
          <el-descriptions-item label="关联人员">{{ previewData.user }}</el-descriptions-item>
          <el-descriptions-item label="权限来源">{{ previewData.source }}</el-descriptions-item>
          <el-descriptions-item label="关联业务ID">{{ previewData.businessId || '-' }}</el-descriptions-item>
          <el-descriptions-item label="有效期" :span="2">{{ previewData.validPeriod }}</el-descriptions-item>
          <el-descriptions-item label="权限状态">
            <el-tag type="warning">待生效</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="闸机数量">{{ previewData.deviceCount }}台</el-descriptions-item>
        </el-descriptions>

        <div class="device-list">
          <h4>可通行闸机：</h4>
          <el-tag
            v-for="device in previewData.devices"
            :key="device.id"
            class="device-preview-tag"
            :type="device.status === 'online' ? 'success' : 'danger'"
          >
            {{ device.name }}
          </el-tag>
        </div>

        <div v-if="previewData.remark" class="remark-section">
          <h4>备注信息：</h4>
          <p>{{ previewData.remark }}</p>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="previewVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleConfirmCreate">确认创建</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { QuestionFilled, Lock, School, House, Grid } from '@element-plus/icons-vue'
import { getDevicesByType, getOnlineDevices, getFlatGroups, type Device } from '@/utils/deviceData'

const router = useRouter()

// 获取设备数据
const devicesByType = getDevicesByType()
const onlineDevices = getOnlineDevices()
const deviceGroups = getFlatGroups()

// 响应式数据
const saving = ref(false)
const searchLoading = ref(false)
const previewVisible = ref(false)

// 表单数据
const formData = reactive({
  userType: '',
  userId: '',
  source: '',
  businessId: '',
  startTime: '',
  endTime: '',
  deviceIds: [],
  remark: ''
})

// Tab和快速选择相关
const activeTab = ref('gate')
const quickSelectValue = ref('')
const showCustomSelection = computed(() => quickSelectValue.value === 'custom')

// 表单验证规则
const formRules = {
  userType: [{ required: true, message: '请选择人员类型', trigger: 'change' }],
  userId: [{ required: true, message: '请选择关联人员', trigger: 'change' }],
  source: [{ required: true, message: '请选择权限来源', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  deviceIds: [
    {
      validator: (rule, value, callback) => {
        if (!value || value.length === 0) {
          callback(new Error('请选择至少1个在线终端设备'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// 选项数据
const userOptions = ref([])
const previewData = ref(null)
const formRef = ref()

// 可用设备计算
const availableDevices = computed(() => {
  let devices: Device[] = []

  if (formData.userType === 'student') {
    // 学生不可选择办公楼闸机
    devices = [
      ...devicesByType.gate,
      ...devicesByType.dormitory,
      ...devicesByType.other
    ]
  } else if (formData.userType === 'teacher') {
    // 教师可以选择所有设备
    devices = [
      ...devicesByType.gate,
      ...devicesByType.office,
      ...devicesByType.dormitory,
      ...devicesByType.other
    ]
  }

  // 只返回在线和离线设备，排除关机和未绑定的设备
  return devices.filter(device => ['online', 'offline'].includes(device.status))
})

// 人员类型变化处理
const handleUserTypeChange = () => {
  formData.userId = ''
  formData.deviceIds = []
  userOptions.value = []
}

// 搜索用户
const searchUsers = async (query) => {
  if (!query || !formData.userType) {
    userOptions.value = []
    return
  }

  searchLoading.value = true
  // 模拟搜索
  setTimeout(() => {
    const mockUsers = formData.userType === 'teacher' ? [
      { id: 'T001', name: '张老师', code: 'T001', department: '数学组' },
      { id: 'T002', name: '李老师', code: 'T002', department: '语文组' },
      { id: 'T003', name: '王老师', code: 'T003', department: '英语组' }
    ] : [
      { id: 'S001', name: '李小明', code: 'S001', department: '三年级一班' },
      { id: 'S002', name: '王小红', code: 'S002', department: '三年级一班' },
      { id: 'S003', name: '张小刚', code: 'S003', department: '三年级二班' }
    ]

    userOptions.value = mockUsers.filter(user =>
      user.name.includes(query) || user.code.includes(query)
    )
    searchLoading.value = false
  }, 500)
}

// 权限来源变化
const handleSourceChange = () => {
  if (formData.source === 'commute') {
    formData.businessId = 'COMMUTE'
    // 通勤默认权限自动设置1年有效期
    const now = new Date()
    formData.startTime = formatDate(now)
    const oneYearLater = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
    formData.endTime = formatDate(oneYearLater)
  } else {
    formData.businessId = ''
  }
}

// 获取可用设备数量
const getAvailableCount = (devices: Device[]) => {
  return devices.filter(d => d.status === 'online').length
}

// 清空选择
const clearAllSelection = () => {
  formData.deviceIds = []
}

// 快速选择处理
const handleQuickSelect = (value: string) => {
  switch (value) {
    case 'teacher_default':
      // 教师默认：校门+办公楼
      formData.deviceIds = [
        ...devicesByType.gate.filter(d => d.status === 'online').map(d => d.id),
        ...devicesByType.office.filter(d => d.status === 'online').map(d => d.id)
      ]
      break
    case 'student_default':
      // 学生默认：校门+宿舍
      formData.deviceIds = [
        ...devicesByType.gate.filter(d => d.status === 'online').map(d => d.id),
        ...devicesByType.dormitory.filter(d => d.status === 'online').map(d => d.id)
      ]
      break
    case 'gate_only':
      // 仅校门
      formData.deviceIds = devicesByType.gate
        .filter(d => d.status === 'online')
        .map(d => d.id)
      break
    case 'all_access':
      // 全部权限（根据用户类型）
      if (formData.userType === 'teacher') {
        formData.deviceIds = [
          ...devicesByType.gate,
          ...devicesByType.office,
          ...devicesByType.dormitory,
          ...devicesByType.other
        ].filter(d => d.status === 'online').map(d => d.id)
      } else {
        formData.deviceIds = [
          ...devicesByType.gate,
          ...devicesByType.dormitory,
          ...devicesByType.other
        ].filter(d => d.status === 'online').map(d => d.id)
      }
      break
    case 'custom':
      // 自定义选择，不改变当前选择
      break
    default:
      // 清空选择
      formData.deviceIds = []
  }
}

// 切换设备选择
const toggleDevice = (device: Device) => {
  if (device.status === 'offline') return

  const index = formData.deviceIds.indexOf(device.id)
  if (index > -1) {
    formData.deviceIds.splice(index, 1)
  } else {
    formData.deviceIds.push(device.id)
  }
}

// 处理复选框变化
const handleDeviceToggle = (deviceId: string, checked: boolean) => {
  if (checked) {
    if (!formData.deviceIds.includes(deviceId)) {
      formData.deviceIds.push(deviceId)
    }
  } else {
    const index = formData.deviceIds.indexOf(deviceId)
    if (index > -1) {
      formData.deviceIds.splice(index, 1)
    }
  }
}

// 获取有效期提示
const getValidPeriodTip = () => {
  if (formData.source === 'commute') {
    return '通勤默认权限有效期固定1年，到期自动续期'
  }
  return '手动创建权限最长有效期30天'
}


// 获取默认设备
const getDefaultDevices = () => {
  if (formData.userType === 'teacher') {
    // 教师默认：校门 + 办公楼
    return [
      ...devicesByType.gate.filter(d => d.status === 'online'),
      ...devicesByType.office.filter(d => d.status === 'online')
    ]
  } else if (formData.userType === 'student') {
    // 学生默认：校门 + 宿舍区
    return [
      ...devicesByType.gate.filter(d => d.status === 'online'),
      ...devicesByType.dormitory.filter(d => d.status === 'online')
    ]
  }
  return []
}

// 日期禁用
const disabledStartDate = (time) => {
  return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
}

const disabledEndDate = (time) => {
  if (!formData.startTime) return false
  const startTime = new Date(formData.startTime).getTime()
  const maxTime = formData.source === 'commute'
    ? startTime + 365 * 24 * 60 * 60 * 1000  // 通勤默认1年
    : startTime + 30 * 24 * 60 * 60 * 1000   // 手动创建30天

  return time.getTime() < startTime || time.getTime() > maxTime
}

// 预览权限
const handlePreview = () => {
  // 生成预览数据
  const selectedUser = userOptions.value.find(u => u.id === formData.userId)
  const selectedDevices = availableDevices.value.filter(d => formData.deviceIds.includes(d.id))

  previewData.value = {
    id: `ACCESS${Date.now()}`,
    user: selectedUser ? `${selectedUser.name}（${selectedUser.code}）- ${selectedUser.department}` : '',
    source: formData.source === 'manual' ? '手动创建' : '通勤默认',
    businessId: formData.businessId,
    validPeriod: `${formData.startTime} - ${formData.endTime}`,
    deviceCount: selectedDevices.length,
    devices: selectedDevices,
    remark: formData.remark
  }

  previewVisible.value = true
}

// 确认创建
const handleConfirmCreate = async () => {
  await handleSaveAndBack()
  previewVisible.value = false
}

// 保存并返回
const handleSaveAndBack = async () => {
  const valid = await formRef.value.validate()
  if (!valid) return

  saving.value = true
  try {
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('权限创建成功')
    router.push('/access/permission')
  } catch (error) {
    ElMessage.error('权限创建失败')
  } finally {
    saving.value = false
  }
}

// 保存并新增
const handleSaveAndNew = async () => {
  const valid = await formRef.value.validate()
  if (!valid) return

  saving.value = true
  try {
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('权限创建成功')
    // 重置表单
    resetForm()
  } catch (error) {
    ElMessage.error('权限创建失败')
  } finally {
    saving.value = false
  }
}

// 取消
const handleCancel = () => {
  ElMessageBox.confirm('确定要取消创建吗？未保存的数据将丢失', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    router.push('/access/permission')
  })
}

// 返回列表
const handleBack = () => {
  router.push('/access/permission')
}

// 重置表单
const resetForm = () => {
  formData.userType = ''
  formData.userId = ''
  formData.source = ''
  formData.businessId = ''
  formData.startTime = ''
  formData.endTime = ''
  formData.deviceIds = []
  formData.remark = ''
  userOptions.value = []
  activeTab.value = 'gate'
  quickSelectValue.value = ''
  formRef.value?.clearValidate()
}

// 格式化日期
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

onMounted(() => {
  // 初始化逻辑
})
</script>

<style lang="scss" scoped>
.permission-form {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;

  .header-section {
    background: #fff;
    padding: 20px 24px;
    margin-bottom: 20px;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;

    .page-title {
      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #333;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;

      .help-icon {
        font-size: 18px;
        color: #909399;
        cursor: pointer;

        &:hover {
          color: #409eff;
        }
      }
    }
  }

  .form-container {
    background: #fff;
    padding: 24px;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;

    .form-section {
      margin-bottom: 32px;

      &:last-child {
        margin-bottom: 0;
      }

      .section-title {
        font-size: 16px;
        font-weight: 500;
        color: #333;
        margin-bottom: 20px;
        padding-left: 10px;
        border-left: 3px solid #409eff;
      }
    }

    .field-tip {
      font-size: 12px;
      color: #909399;
      margin-top: 5px;

      &.error {
        color: #f56c6c;
      }
    }

    .selected-count {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .device-selection-tabs {
      .tab-label {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      :deep(.el-tabs) {
        .el-tabs__content {
          padding: 16px;
          min-height: 200px;
          max-height: 400px;
          overflow-y: auto;
        }
      }

      /* 设备选择网格布局 */
      .device-selection-grid {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .device-group {
        background: #f9f9f9;
        border-radius: 8px;
        padding: 16px;
        border: 1px solid #e4e7ed;
      }

      .group-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid #e4e7ed;
      }

      .group-header .el-icon {
        font-size: 18px;
        color: #409eff;
      }

      .group-header span {
        font-weight: 600;
        font-size: 15px;
        color: #303133;
      }

      .group-header .el-tag {
        margin-left: auto;
      }

      /* 横向设备列表 */
      .device-list-horizontal {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 10px;
        max-height: 180px;
        overflow-y: auto;
        padding-right: 8px;
      }

      .device-list-horizontal::-webkit-scrollbar {
        width: 6px;
      }

      .device-list-horizontal::-webkit-scrollbar-track {
        background: #f0f2f5;
        border-radius: 3px;
      }

      .device-list-horizontal::-webkit-scrollbar-thumb {
        background: #c0c4cc;
        border-radius: 3px;
      }

      .device-list-horizontal::-webkit-scrollbar-thumb:hover {
        background: #909399;
      }

      .device-item-horizontal {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        background: white;
        border: 1px solid #e4e7ed;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        min-height: 44px;
      }

      .device-item-horizontal:hover:not(.disabled) {
        border-color: #409eff;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        transform: translateY(-1px);
      }

      .device-item-horizontal.selected {
        background: #ecf5ff;
        border-color: #409eff;
      }

      .device-item-horizontal.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: #f5f7fa;
      }

      .device-item-horizontal .el-checkbox {
        flex-shrink: 0;
      }

      .device-info-compact {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .device-name-compact {
        font-size: 13px;
        font-weight: 500;
        color: #303133;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .device-location-compact {
        font-size: 11px;
        color: #909399;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .device-status-icon {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .device-status-icon.online {
        background: #67c23a;
        box-shadow: 0 0 4px rgba(103, 194, 58, 0.5);
      }

      .device-status-icon.offline {
        background: #909399;
      }

      .device-cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 12px;

        .device-card {
          border: 2px solid #e4e7ed;
          border-radius: 8px;
          padding: 12px;
          background: #fff;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;

          &:hover {
            border-color: #409eff;
            box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
          }

          &.selected {
            border-color: #409eff;
            background: #f0f9ff;
            box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
          }

          &.disabled {
            opacity: 0.6;
            cursor: not-allowed;
            background: #f5f5f5;

            &:hover {
              border-color: #e4e7ed;
              box-shadow: none;
            }
          }

          .device-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
          }

          .device-name {
            font-size: 14px;
            font-weight: 500;
            color: #333;
            margin-bottom: 4px;
            line-height: 1.3;
          }

          .device-location {
            font-size: 12px;
            color: #666;
            line-height: 1.2;
          }
        }
      }
    }

    .default-devices {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;

      .device-tag {
        margin: 0;
      }
    }
  }

  .action-section {
    background: #fff;
    padding: 20px 24px;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: center;
    gap: 16px;

    .el-button {
      min-width: 120px;
    }
  }

  .preview-content {
    .device-list {
      margin-top: 20px;

      h4 {
        margin-bottom: 10px;
        color: #333;
        font-size: 14px;
      }

      .device-preview-tag {
        margin-right: 10px;
        margin-bottom: 10px;
      }
    }

    .remark-section {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e4e7ed;

      h4 {
        margin-bottom: 10px;
        color: #333;
        font-size: 14px;
      }

      p {
        color: #666;
        line-height: 1.6;
      }
    }
  }
}
</style>