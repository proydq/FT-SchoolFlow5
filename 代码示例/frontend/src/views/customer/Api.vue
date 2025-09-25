<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="title">API采集</h2>
      <p class="description">第三方API接入、数据同步、错误处理</p>
    </div>

    <!-- API配置管理 -->
    <el-card shadow="never" class="api-config-card">
      <template #header>
        <div class="card-header">
          <span>API配置管理</span>
          <div class="header-actions">
            <el-button @click="refreshConfigs">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
            <el-button type="primary" @click="showAddDialog">
              <el-icon><Plus /></el-icon>
              新增API
            </el-button>
          </div>
        </div>
      </template>

      <div class="api-list">
        <el-row :gutter="16">
          <el-col 
            v-for="api in apiConfigs" 
            :key="api.id"
            :span="8"
          >
            <el-card shadow="hover" class="api-item">
              <div class="api-header">
                <div class="api-info">
                  <div class="api-name">{{ api.name }}</div>
                  <div class="api-type">{{ getApiTypeText(api.type) }}</div>
                </div>
                <div class="api-status">
                  <el-tag 
                    :type="api.status === 'active' ? 'success' : api.status === 'error' ? 'danger' : 'warning'"
                    size="small"
                  >
                    {{ getStatusText(api.status) }}
                  </el-tag>
                </div>
              </div>

              <div class="api-details">
                <div class="detail-item">
                  <span class="label">数据源：</span>
                  <span class="value">{{ api.source }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">同步频率：</span>
                  <span class="value">{{ api.syncInterval }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">上次同步：</span>
                  <span class="value">{{ api.lastSync || '从未同步' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">同步记录：</span>
                  <span class="value">{{ api.totalRecords }} 条</span>
                </div>
              </div>

              <div class="api-actions">
                <el-button 
                  type="text" 
                  size="small"
                  @click="testConnection(api)"
                  :loading="testing === api.id"
                >
                  <el-icon><Connection /></el-icon>
                  测试连接
                </el-button>
                <el-button 
                  type="text" 
                  size="small"
                  @click="syncData(api)"
                  :loading="syncing === api.id"
                >
                  <el-icon><RefreshRight /></el-icon>
                  立即同步
                </el-button>
                <el-button 
                  type="text" 
                  size="small"
                  @click="editApi(api)"
                >
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button 
                  type="text" 
                  size="small"
                  class="danger"
                  @click="deleteApi(api)"
                >
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 同步任务监控 -->
    <el-card shadow="never" class="sync-monitor">
      <template #header>
        <span>同步任务监控</span>
      </template>

      <el-table :data="syncTasks">
        <el-table-column prop="taskName" label="任务名称" />
        <el-table-column prop="apiName" label="API名称" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag 
              :type="row.status === 'completed' ? 'success' : row.status === 'failed' ? 'danger' : row.status === 'running' ? 'warning' : ''"
              size="small"
            >
              {{ getTaskStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="150">
          <template #default="{ row }">
            <el-progress 
              :percentage="row.progress" 
              :status="row.status === 'completed' ? 'success' : row.status === 'failed' ? 'exception' : ''"
              :stroke-width="6"
            />
          </template>
        </el-table-column>
        <el-table-column prop="records" label="同步记录数" width="120" />
        <el-table-column prop="startTime" label="开始时间" width="150" />
        <el-table-column prop="duration" label="耗时" width="80" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button 
              type="text" 
              size="small"
              @click="viewTaskLog(row)"
            >
              查看日志
            </el-button>
            <el-button 
              v-if="row.status === 'running'"
              type="text" 
              size="small"
              class="danger"
              @click="cancelTask(row)"
            >
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- API配置对话框 -->
    <el-dialog 
      v-model="configDialogVisible" 
      :title="editingApi ? '编辑API配置' : '新增API配置'"
      width="600px"
      @close="resetForm"
    >
      <el-form 
        :model="apiForm" 
        :rules="formRules" 
        ref="formRef"
        label-width="120px"
      >
        <el-form-item label="API名称" prop="name">
          <el-input v-model="apiForm.name" placeholder="请输入API名称" />
        </el-form-item>
        
        <el-form-item label="API类型" prop="type">
          <el-select v-model="apiForm.type" placeholder="请选择API类型">
            <el-option label="Google Maps API" value="google_maps" />
            <el-option label="LinkedIn API" value="linkedin" />
            <el-option label="Salesforce API" value="salesforce" />
            <el-option label="HubSpot API" value="hubspot" />
            <el-option label="自定义API" value="custom" />
          </el-select>
        </el-form-item>

        <el-form-item label="数据源" prop="source">
          <el-input v-model="apiForm.source" placeholder="请输入数据源名称" />
        </el-form-item>

        <el-form-item label="API端点" prop="endpoint">
          <el-input v-model="apiForm.endpoint" placeholder="https://api.example.com/v1/data" />
        </el-form-item>

        <el-form-item label="认证方式" prop="authType">
          <el-select v-model="apiForm.authType" placeholder="请选择认证方式">
            <el-option label="API Key" value="api_key" />
            <el-option label="OAuth 2.0" value="oauth2" />
            <el-option label="Bearer Token" value="bearer" />
            <el-option label="Basic Auth" value="basic" />
          </el-select>
        </el-form-item>

        <el-form-item 
          :label="getAuthLabel()" 
          prop="authValue"
          v-if="apiForm.authType"
        >
          <el-input 
            v-model="apiForm.authValue" 
            :type="apiForm.authType === 'basic' ? 'password' : 'text'"
            :placeholder="getAuthPlaceholder()"
            show-password
          />
        </el-form-item>

        <el-form-item label="同步频率" prop="syncInterval">
          <el-select v-model="apiForm.syncInterval" placeholder="请选择同步频率">
            <el-option label="每小时" value="hourly" />
            <el-option label="每天" value="daily" />
            <el-option label="每周" value="weekly" />
            <el-option label="手动" value="manual" />
          </el-select>
        </el-form-item>

        <el-form-item label="字段映射">
          <div class="field-mapping">
            <div 
              v-for="(mapping, index) in apiForm.fieldMappings"
              :key="index"
              class="mapping-item"
            >
              <el-input 
                v-model="mapping.source" 
                placeholder="API字段名"
                style="width: 200px; margin-right: 10px;"
              />
              <span style="margin: 0 10px;">→</span>
              <el-select 
                v-model="mapping.target"
                placeholder="系统字段"
                style="width: 200px; margin-right: 10px;"
              >
                <el-option label="客户姓名" value="name" />
                <el-option label="公司名称" value="company" />
                <el-option label="邮箱地址" value="email" />
                <el-option label="联系电话" value="phone" />
                <el-option label="国家" value="country" />
                <el-option label="城市" value="city" />
                <el-option label="行业" value="industry" />
                <el-option label="职位" value="position" />
              </el-select>
              <el-button 
                type="text" 
                @click="removeMapping(index)"
                :disabled="apiForm.fieldMappings.length <= 1"
              >
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
            <el-button type="text" @click="addMapping">
              <el-icon><Plus /></el-icon>
              添加字段映射
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="高级设置">
          <el-checkbox v-model="apiForm.enableRetry">启用重试机制</el-checkbox>
          <el-checkbox v-model="apiForm.enableLog">启用详细日志</el-checkbox>
          <el-checkbox v-model="apiForm.deduplication">启用去重</el-checkbox>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="configDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="saveApiConfig"
            :loading="saving"
          >
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 任务日志对话框 -->
    <el-dialog 
      v-model="logDialogVisible" 
      :title="`同步日志 - ${currentTask?.taskName}`"
      width="800px"
    >
      <div class="log-content">
        <div class="log-header">
          <div class="log-info">
            <span>任务状态：</span>
            <el-tag :type="currentTask?.status === 'completed' ? 'success' : currentTask?.status === 'failed' ? 'danger' : 'warning'">
              {{ getTaskStatusText(currentTask?.status) }}
            </el-tag>
            <span style="margin-left: 20px;">同步记录：{{ currentTask?.records }} 条</span>
          </div>
          <el-button @click="refreshLog">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
        
        <div class="log-viewer">
          <pre class="log-text">{{ taskLogs }}</pre>
        </div>
      </div>
    </el-dialog>

    <!-- 连接测试结果对话框 -->
    <el-dialog 
      v-model="testResultDialogVisible" 
      title="连接测试结果"
      width="500px"
    >
      <div class="test-result">
        <div class="result-icon">
          <el-icon 
            :size="48"
            :color="testResult.success ? '#67C23A' : '#F56C6C'"
          >
            <component :is="testResult.success ? 'CircleCheck' : 'CircleClose'" />
          </el-icon>
        </div>
        <div class="result-content">
          <h3>{{ testResult.success ? '连接成功' : '连接失败' }}</h3>
          <p>{{ testResult.message }}</p>
          <div v-if="testResult.details" class="result-details">
            <h4>详细信息：</h4>
            <pre>{{ testResult.details }}</pre>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 响应式数据
const testing = ref(null)
const syncing = ref(null)
const saving = ref(false)

// 对话框状态
const configDialogVisible = ref(false)
const logDialogVisible = ref(false)
const testResultDialogVisible = ref(false)

// 编辑状态
const editingApi = ref(null)

// API配置列表
const apiConfigs = ref([
  {
    id: 1,
    name: 'Google Places API',
    type: 'google_maps',
    source: 'Google Business',
    endpoint: 'https://maps.googleapis.com/maps/api/place',
    status: 'active',
    syncInterval: 'daily',
    lastSync: '2024-01-15 10:30:00',
    totalRecords: 1250
  },
  {
    id: 2,
    name: 'LinkedIn Sales Navigator',
    type: 'linkedin',
    source: 'LinkedIn',
    endpoint: 'https://api.linkedin.com/v2/people',
    status: 'error',
    syncInterval: 'weekly',
    lastSync: '2024-01-12 14:20:00',
    totalRecords: 850
  },
  {
    id: 3,
    name: 'Salesforce CRM',
    type: 'salesforce',
    source: 'Salesforce',
    endpoint: 'https://your-instance.salesforce.com/services/data/v57.0',
    status: 'inactive',
    syncInterval: 'hourly',
    lastSync: null,
    totalRecords: 0
  }
])

// 同步任务
const syncTasks = ref([
  {
    id: 1,
    taskName: '每日Google数据同步',
    apiName: 'Google Places API',
    status: 'completed',
    progress: 100,
    records: 125,
    startTime: '2024-01-15 10:30:00',
    duration: '2m 30s'
  },
  {
    id: 2,
    taskName: 'LinkedIn数据同步',
    apiName: 'LinkedIn Sales Navigator',
    status: 'failed',
    progress: 45,
    records: 0,
    startTime: '2024-01-15 11:00:00',
    duration: '1m 15s'
  },
  {
    id: 3,
    taskName: '客户数据更新',
    apiName: 'Salesforce CRM',
    status: 'running',
    progress: 65,
    records: 89,
    startTime: '2024-01-15 11:30:00',
    duration: '3m 20s'
  }
])

// 表单数据
const apiForm = reactive({
  name: '',
  type: '',
  source: '',
  endpoint: '',
  authType: '',
  authValue: '',
  syncInterval: '',
  fieldMappings: [
    { source: '', target: '' }
  ],
  enableRetry: true,
  enableLog: true,
  deduplication: false
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入API名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择API类型', trigger: 'change' }
  ],
  source: [
    { required: true, message: '请输入数据源', trigger: 'blur' }
  ],
  endpoint: [
    { required: true, message: '请输入API端点', trigger: 'blur' },
    { type: 'url', message: '请输入有效的URL', trigger: 'blur' }
  ],
  authType: [
    { required: true, message: '请选择认证方式', trigger: 'change' }
  ],
  authValue: [
    { required: true, message: '请输入认证信息', trigger: 'blur' }
  ],
  syncInterval: [
    { required: true, message: '请选择同步频率', trigger: 'change' }
  ]
}

// 当前任务和测试结果
const currentTask = ref(null)
const taskLogs = ref('')
const testResult = reactive({
  success: false,
  message: '',
  details: ''
})

const formRef = ref()

// 方法
const refreshConfigs = () => {
  ElMessage.success('配置已刷新')
  // 模拟刷新数据
}

const showAddDialog = () => {
  editingApi.value = null
  resetForm()
  configDialogVisible.value = true
}

const editApi = (api) => {
  editingApi.value = api
  Object.assign(apiForm, {
    ...api,
    fieldMappings: api.fieldMappings || [{ source: '', target: '' }]
  })
  configDialogVisible.value = true
}

const resetForm = () => {
  Object.assign(apiForm, {
    name: '',
    type: '',
    source: '',
    endpoint: '',
    authType: '',
    authValue: '',
    syncInterval: '',
    fieldMappings: [{ source: '', target: '' }],
    enableRetry: true,
    enableLog: true,
    deduplication: false
  })
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

const testConnection = async (api) => {
  testing.value = api.id
  
  try {
    // 模拟连接测试
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const isSuccess = Math.random() > 0.3 // 70% 成功率
    
    testResult.success = isSuccess
    testResult.message = isSuccess 
      ? `成功连接到 ${api.name}，API响应正常` 
      : `连接失败：认证错误或网络超时`
    testResult.details = isSuccess 
      ? `状态码：200\n响应时间：235ms\n可用端点：${api.endpoint}`
      : `错误码：401\n错误信息：Authentication failed\n建议：检查API密钥是否正确`
    
    testResultDialogVisible.value = true
    
  } catch (error) {
    ElMessage.error('连接测试失败')
  } finally {
    testing.value = null
  }
}

const syncData = async (api) => {
  syncing.value = api.id
  
  try {
    // 模拟同步过程
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // 更新最后同步时间
    api.lastSync = new Date().toLocaleString('zh-CN')
    api.totalRecords += Math.floor(Math.random() * 50) + 10
    
    ElMessage.success(`${api.name} 数据同步完成`)
    
    // 添加新的同步任务记录
    syncTasks.value.unshift({
      id: Date.now(),
      taskName: `手动同步 - ${api.name}`,
      apiName: api.name,
      status: 'completed',
      progress: 100,
      records: Math.floor(Math.random() * 50) + 10,
      startTime: new Date().toLocaleString('zh-CN'),
      duration: '3s'
    })
    
  } catch (error) {
    ElMessage.error('数据同步失败')
  } finally {
    syncing.value = null
  }
}

const deleteApi = async (api) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 "${api.name}" 吗？删除后无法恢复。`,
      '删除API配置',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const index = apiConfigs.value.findIndex(item => item.id === api.id)
    if (index > -1) {
      apiConfigs.value.splice(index, 1)
    }
    
    ElMessage.success('API配置已删除')
    
  } catch {
    // 用户取消
  }
}

const saveApiConfig = async () => {
  try {
    await formRef.value.validate()
    
    saving.value = true
    
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (editingApi.value) {
      // 更新现有配置
      Object.assign(editingApi.value, apiForm)
      ElMessage.success('API配置已更新')
    } else {
      // 创建新配置
      const newApi = {
        id: Date.now(),
        ...apiForm,
        status: 'inactive',
        lastSync: null,
        totalRecords: 0
      }
      apiConfigs.value.push(newApi)
      ElMessage.success('API配置已创建')
    }
    
    configDialogVisible.value = false
    
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    saving.value = false
  }
}

const addMapping = () => {
  apiForm.fieldMappings.push({ source: '', target: '' })
}

const removeMapping = (index) => {
  apiForm.fieldMappings.splice(index, 1)
}

const viewTaskLog = (task) => {
  currentTask.value = task
  logDialogVisible.value = true
  
  // 模拟日志内容
  taskLogs.value = `
[2024-01-15 11:30:00] 开始同步任务: ${task.taskName}
[2024-01-15 11:30:05] 连接API端点...
[2024-01-15 11:30:08] 认证成功
[2024-01-15 11:30:10] 开始拉取数据...
[2024-01-15 11:31:15] 已处理 25 条记录
[2024-01-15 11:32:20] 已处理 50 条记录
[2024-01-15 11:33:25] 已处理 75 条记录
[2024-01-15 11:34:30] 已处理 ${task.records} 条记录
${task.status === 'completed' 
  ? '[2024-01-15 11:34:35] 同步完成' 
  : task.status === 'failed' 
    ? '[2024-01-15 11:32:30] 错误: 认证失败，请检查API密钥' 
    : '[2024-01-15 11:34:35] 同步进行中...'}
`.trim()
}

const refreshLog = () => {
  ElMessage.success('日志已刷新')
}

const cancelTask = async (task) => {
  try {
    await ElMessageBox.confirm(
      '确定要取消这个同步任务吗？',
      '取消任务',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    task.status = 'cancelled'
    ElMessage.success('任务已取消')
    
  } catch {
    // 用户取消
  }
}

// 工具函数
const getApiTypeText = (type) => {
  const typeMap = {
    google_maps: 'Google Maps',
    linkedin: 'LinkedIn',
    salesforce: 'Salesforce',
    hubspot: 'HubSpot',
    custom: '自定义API'
  }
  return typeMap[type] || type
}

const getStatusText = (status) => {
  const statusMap = {
    active: '活跃',
    inactive: '未激活',
    error: '错误'
  }
  return statusMap[status] || status
}

const getTaskStatusText = (status) => {
  const statusMap = {
    completed: '已完成',
    failed: '失败',
    running: '进行中',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

const getAuthLabel = () => {
  const labelMap = {
    api_key: 'API Key',
    oauth2: 'OAuth Token',
    bearer: 'Bearer Token',
    basic: '用户名:密码'
  }
  return labelMap[apiForm.authType] || '认证信息'
}

const getAuthPlaceholder = () => {
  const placeholderMap = {
    api_key: '请输入API密钥',
    oauth2: '请输入OAuth令牌',
    bearer: '请输入Bearer令牌',
    basic: '用户名:密码'
  }
  return placeholderMap[apiForm.authType] || '请输入认证信息'
}

onMounted(() => {
  // 初始化
})
</script>

<style scoped lang="scss">
.api-config-card {
  margin-bottom: $spacing-lg;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 500;
  }
}

.api-list {
  .api-item {
    margin-bottom: $spacing-md;
    height: 100%;
    
    .api-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: $spacing-md;
      
      .api-info {
        .api-name {
          font-size: 16px;
          font-weight: 500;
          color: $text-primary;
          margin-bottom: $spacing-xs;
        }
        
        .api-type {
          font-size: $font-size-sm;
          color: $text-secondary;
        }
      }
    }
    
    .api-details {
      margin-bottom: $spacing-md;
      
      .detail-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: $spacing-xs;
        font-size: $font-size-sm;
        
        .label {
          color: $text-secondary;
        }
        
        .value {
          color: $text-regular;
          font-weight: 500;
        }
      }
    }
    
    .api-actions {
      display: flex;
      flex-wrap: wrap;
      gap: $spacing-xs;
      
      .el-button {
        padding: 4px 8px;
        font-size: $font-size-sm;
      }
    }
  }
}

.sync-monitor {
  :deep(.el-table) {
    .el-progress {
      width: 100%;
    }
  }
}

.field-mapping {
  .mapping-item {
    display: flex;
    align-items: center;
    margin-bottom: $spacing-sm;
  }
}

.log-content {
  .log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-md;
    padding-bottom: $spacing-sm;
    border-bottom: 1px solid $border-light;
    
    .log-info {
      display: flex;
      align-items: center;
      font-size: $font-size-sm;
      color: $text-regular;
    }
  }
  
  .log-viewer {
    background: #1e1e1e;
    border-radius: 4px;
    padding: $spacing-md;
    max-height: 400px;
    overflow-y: auto;
    
    .log-text {
      color: #d4d4d4;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 12px;
      line-height: 1.4;
      margin: 0;
      white-space: pre-wrap;
    }
  }
}

.test-result {
  text-align: center;
  padding: $spacing-lg;
  
  .result-icon {
    margin-bottom: $spacing-lg;
  }
  
  .result-content {
    h3 {
      margin-bottom: $spacing-md;
      color: $text-primary;
    }
    
    p {
      margin-bottom: $spacing-lg;
      color: $text-regular;
    }
    
    .result-details {
      text-align: left;
      
      h4 {
        margin-bottom: $spacing-sm;
        color: $text-primary;
      }
      
      pre {
        background: $bg-color;
        padding: $spacing-sm;
        border-radius: 4px;
        font-size: $font-size-sm;
        color: $text-secondary;
      }
    }
  }
}

.danger {
  color: $danger-color !important;
}

:deep(.el-card__body) {
  padding: $spacing-lg;
}

:deep(.el-dialog__body) {
  padding: $spacing-md $spacing-lg;
}
</style>