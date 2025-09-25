<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="title">数据清洗</h2>
      <p class="description">检测重复数据、格式规范化、错误修复</p>
    </div>

    <!-- 数据概览 -->
    <el-row :gutter="16" class="overview-cards">
      <el-col :span="6">
        <el-card shadow="never">
          <div class="stat-item">
            <div class="stat-number">{{ totalRecords }}</div>
            <div class="stat-label">总记录数</div>
            <div class="stat-icon">
              <el-icon><DataBoard /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never">
          <div class="stat-item">
            <div class="stat-number warning">{{ duplicateRecords }}</div>
            <div class="stat-label">重复记录</div>
            <div class="stat-icon warning">
              <el-icon><Warning /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never">
          <div class="stat-item">
            <div class="stat-number error">{{ invalidRecords }}</div>
            <div class="stat-label">错误记录</div>
            <div class="stat-icon error">
              <el-icon><CircleClose /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never">
          <div class="stat-item">
            <div class="stat-number success">{{ cleanRecords }}</div>
            <div class="stat-label">清洁记录</div>
            <div class="stat-icon success">
              <el-icon><CircleCheck /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 清洗工具面板 -->
    <el-card shadow="never" class="cleaning-panel">
      <template #header>
        <div class="panel-header">
          <span>数据清洗工具</span>
          <div class="panel-actions">
            <el-button @click="refreshData">
              <el-icon><Refresh /></el-icon>
              刷新数据
            </el-button>
            <el-button type="primary" @click="startCleaning" :loading="cleaning">
              <el-icon><Magic /></el-icon>
              开始清洗
            </el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab" type="card">
        <!-- 重复数据检测 -->
        <el-tab-pane label="重复检测" name="duplicate">
          <div class="tab-content">
            <div class="section-header">
              <h3>重复数据检测</h3>
              <p class="description">基于邮箱、电话、公司名称等字段识别重复记录</p>
            </div>

            <!-- 检测规则设置 -->
            <div class="rule-settings">
              <h4>检测规则</h4>
              <el-checkbox-group v-model="duplicateRules">
                <el-checkbox label="email">邮箱地址相同</el-checkbox>
                <el-checkbox label="phone">联系电话相同</el-checkbox>
                <el-checkbox label="company_name">公司名称相似</el-checkbox>
                <el-checkbox label="name_phone">姓名+电话组合</el-checkbox>
              </el-checkbox-group>
            </div>

            <!-- 相似度阈值 -->
            <div class="similarity-settings">
              <h4>相似度设置</h4>
              <div class="slider-group">
                <label>公司名称相似度：{{ companySimilarity }}%</label>
                <el-slider 
                  v-model="companySimilarity"
                  :min="60"
                  :max="100"
                  show-stops
                />
              </div>
            </div>

            <!-- 重复数据列表 -->
            <div class="duplicate-results" v-if="duplicateGroups.length > 0">
              <h4>发现 {{ duplicateGroups.length }} 组重复数据</h4>
              <div class="duplicate-list">
                <div 
                  v-for="(group, index) in duplicateGroups"
                  :key="index"
                  class="duplicate-group"
                >
                  <div class="group-header">
                    <span class="group-title">重复组 {{ index + 1 }}</span>
                    <span class="group-info">{{ group.records.length }} 条记录</span>
                    <el-button 
                      type="primary" 
                      size="small"
                      @click="mergeDuplicates(group)"
                    >
                      合并
                    </el-button>
                  </div>
                  <div class="group-records">
                    <el-table 
                      :data="group.records"
                      size="small"
                      max-height="200"
                    >
                      <el-table-column prop="name" label="姓名" width="100" />
                      <el-table-column prop="company" label="公司" width="120" />
                      <el-table-column prop="email" label="邮箱" width="160" />
                      <el-table-column prop="phone" label="电话" width="120" />
                      <el-table-column label="操作" width="100">
                        <template #default="{ row }">
                          <el-button 
                            type="text" 
                            size="small"
                            @click="keepRecord(group, row)"
                          >
                            保留
                          </el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 格式规范化 -->
        <el-tab-pane label="格式规范" name="format">
          <div class="tab-content">
            <div class="section-header">
              <h3>数据格式规范化</h3>
              <p class="description">统一电话号码、邮箱地址、公司名称等字段格式</p>
            </div>

            <!-- 格式规则 -->
            <div class="format-rules">
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-card shadow="never" class="rule-card">
                    <h4>电话号码规范</h4>
                    <div class="rule-options">
                      <el-radio-group v-model="phoneFormat">
                        <el-radio label="unified">统一格式 (+86 138-0013-8000)</el-radio>
                        <el-radio label="clean">清理格式 (13800138000)</el-radio>
                        <el-radio label="hyphen">连字符格式 (138-0013-8000)</el-radio>
                      </el-radio-group>
                    </div>
                    <div class="rule-preview">
                      <span class="label">预览：</span>
                      <span class="preview-text">{{ getPhonePreview() }}</span>
                    </div>
                  </el-card>
                </el-col>
                <el-col :span="12">
                  <el-card shadow="never" class="rule-card">
                    <h4>邮箱地址规范</h4>
                    <div class="rule-options">
                      <el-checkbox-group v-model="emailRules">
                        <el-checkbox label="lowercase">转换为小写</el-checkbox>
                        <el-checkbox label="trim">去除空格</el-checkbox>
                        <el-checkbox label="validate">验证格式</el-checkbox>
                      </el-checkbox-group>
                    </div>
                    <div class="rule-preview">
                      <span class="label">预览：</span>
                      <span class="preview-text">{{ getEmailPreview() }}</span>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </div>

            <!-- 格式化结果预览 -->
            <div class="format-preview" v-if="formatPreview.length > 0">
              <h4>格式化预览</h4>
              <el-table :data="formatPreview" max-height="300">
                <el-table-column label="字段" prop="field" width="100" />
                <el-table-column label="原始值" prop="original" />
                <el-table-column label="格式化后" prop="formatted" />
                <el-table-column label="更改数量" prop="count" width="100" />
              </el-table>
            </div>
          </div>
        </el-tab-pane>

        <!-- 数据验证 -->
        <el-tab-pane label="数据验证" name="validate">
          <div class="tab-content">
            <div class="section-header">
              <h3>数据有效性验证</h3>
              <p class="description">检查必填字段、数据格式、逻辑一致性</p>
            </div>

            <!-- 验证规则 -->
            <div class="validation-rules">
              <el-row :gutter="16">
                <el-col :span="8">
                  <el-card shadow="never" class="rule-card">
                    <h4>必填字段检查</h4>
                    <el-checkbox-group v-model="requiredFields">
                      <el-checkbox label="name">客户姓名</el-checkbox>
                      <el-checkbox label="company">公司名称</el-checkbox>
                      <el-checkbox label="email">邮箱地址</el-checkbox>
                      <el-checkbox label="phone">联系电话</el-checkbox>
                    </el-checkbox-group>
                  </el-card>
                </el-col>
                <el-col :span="8">
                  <el-card shadow="never" class="rule-card">
                    <h4>格式验证</h4>
                    <el-checkbox-group v-model="formatValidation">
                      <el-checkbox label="email">邮箱格式</el-checkbox>
                      <el-checkbox label="phone">电话格式</el-checkbox>
                      <el-checkbox label="website">网站格式</el-checkbox>
                      <el-checkbox label="country">国家代码</el-checkbox>
                    </el-checkbox-group>
                  </el-card>
                </el-col>
                <el-col :span="8">
                  <el-card shadow="never" class="rule-card">
                    <h4>逻辑验证</h4>
                    <el-checkbox-group v-model="logicValidation">
                      <el-checkbox label="email_domain">邮箱域名匹配公司</el-checkbox>
                      <el-checkbox label="phone_country">电话号码国家匹配</el-checkbox>
                      <el-checkbox label="industry_check">行业合理性</el-checkbox>
                    </el-checkbox-group>
                  </el-card>
                </el-col>
              </el-row>
            </div>

            <!-- 验证结果 -->
            <div class="validation-results" v-if="validationIssues.length > 0">
              <h4>发现 {{ validationIssues.length }} 个数据问题</h4>
              <el-table :data="validationIssues" max-height="400">
                <el-table-column type="index" label="#" width="50" />
                <el-table-column prop="recordId" label="记录ID" width="80" />
                <el-table-column prop="field" label="字段" width="100" />
                <el-table-column prop="issue" label="问题描述" />
                <el-table-column prop="severity" label="严重程度" width="100">
                  <template #default="{ row }">
                    <el-tag 
                      :type="row.severity === 'error' ? 'danger' : 'warning'"
                      size="small"
                    >
                      {{ row.severity === 'error' ? '错误' : '警告' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120">
                  <template #default="{ row }">
                    <el-button 
                      type="text" 
                      size="small"
                      @click="fixIssue(row)"
                    >
                      修复
                    </el-button>
                    <el-button 
                      type="text" 
                      size="small"
                      @click="ignoreIssue(row)"
                    >
                      忽略
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>

        <!-- 清洗历史 -->
        <el-tab-pane label="清洗历史" name="history">
          <div class="tab-content">
            <div class="section-header">
              <h3>数据清洗历史</h3>
              <p class="description">查看历史清洗任务和结果</p>
            </div>

            <el-table :data="cleaningHistory">
              <el-table-column type="index" label="#" width="50" />
              <el-table-column prop="taskName" label="任务名称" />
              <el-table-column prop="type" label="清洗类型" width="100">
                <template #default="{ row }">
                  <el-tag size="small">{{ getCleaningTypeText(row.type) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag 
                    :type="row.status === 'completed' ? 'success' : row.status === 'failed' ? 'danger' : 'warning'"
                    size="small"
                  >
                    {{ getStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="processed" label="处理记录数" width="100" />
              <el-table-column prop="cleaned" label="清理记录数" width="100" />
              <el-table-column prop="createTime" label="创建时间" width="150" />
              <el-table-column label="操作" width="120">
                <template #default="{ row }">
                  <el-button 
                    type="text" 
                    size="small"
                    @click="viewResult(row)"
                  >
                    查看结果
                  </el-button>
                  <el-button 
                    type="text" 
                    size="small"
                    @click="downloadReport(row)"
                  >
                    下载报告
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 清洗进度对话框 -->
    <el-dialog v-model="progressDialogVisible" title="数据清洗进度" width="500px">
      <div class="progress-content">
        <div class="progress-info">
          <p>正在执行：{{ currentTask }}</p>
          <p>进度：{{ progressPercent }}%</p>
        </div>
        <el-progress 
          :percentage="progressPercent" 
          :status="progressPercent === 100 ? 'success' : ''"
        />
        <div class="progress-details">
          <div class="detail-item">
            <span>已处理：{{ processedCount }}</span>
            <span>总计：{{ totalCount }}</span>
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="cancelCleaning" :disabled="progressPercent === 100">
          {{ progressPercent === 100 ? '关闭' : '取消' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 响应式数据
const activeTab = ref('duplicate')
const totalRecords = ref(1250)
const duplicateRecords = ref(85)
const invalidRecords = ref(32)
const cleanRecords = ref(1133)

// 重复检测相关
const duplicateRules = ref(['email', 'phone'])
const companySimilarity = ref(80)
const duplicateGroups = ref([
  {
    id: 1,
    reason: 'email_same',
    records: [
      { id: 1, name: '张三', company: 'ABC公司', email: 'zhangsan@abc.com', phone: '13800138000' },
      { id: 45, name: '张三', company: 'ABC有限公司', email: 'zhangsan@abc.com', phone: '13800138001' }
    ]
  },
  {
    id: 2,
    reason: 'company_similar',
    records: [
      { id: 23, name: '李四', company: '北京科技公司', email: 'lisi@bjtech.com', phone: '13900139000' },
      { id: 67, name: '王五', company: '北京科技有限公司', email: 'wangwu@bjtech.com', phone: '13900139001' }
    ]
  }
])

// 格式规范相关
const phoneFormat = ref('unified')
const emailRules = ref(['lowercase', 'trim'])
const formatPreview = ref([
  { field: '电话', original: '+86 138 0013 8000', formatted: '+86 138-0013-8000', count: 125 },
  { field: '邮箱', original: 'Test@Example.COM', formatted: 'test@example.com', count: 89 }
])

// 数据验证相关
const requiredFields = ref(['name', 'email'])
const formatValidation = ref(['email', 'phone'])
const logicValidation = ref(['email_domain'])
const validationIssues = ref([
  { id: 1, recordId: 'C001', field: 'email', issue: '邮箱格式不正确', severity: 'error' },
  { id: 2, recordId: 'C002', field: 'phone', issue: '电话号码格式不标准', severity: 'warning' },
  { id: 3, recordId: 'C003', field: 'company', issue: '公司名称为空', severity: 'error' }
])

// 清洗历史
const cleaningHistory = ref([
  {
    id: 1,
    taskName: '2024年1月数据清洗',
    type: 'duplicate',
    status: 'completed',
    processed: 1250,
    cleaned: 85,
    createTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    taskName: '格式规范化任务',
    type: 'format',
    status: 'completed',
    processed: 1165,
    cleaned: 234,
    createTime: '2024-01-10 14:20:00'
  }
])

// 清洗进度相关
const cleaning = ref(false)
const progressDialogVisible = ref(false)
const currentTask = ref('')
const progressPercent = ref(0)
const processedCount = ref(0)
const totalCount = ref(0)

// 计算属性
const duplicateRate = computed(() => {
  return ((duplicateRecords.value / totalRecords.value) * 100).toFixed(1)
})

const invalidRate = computed(() => {
  return ((invalidRecords.value / totalRecords.value) * 100).toFixed(1)
})

// 方法
const refreshData = () => {
  ElMessage.success('数据已刷新')
  // 模拟数据刷新
  totalRecords.value = Math.floor(Math.random() * 500) + 1000
  duplicateRecords.value = Math.floor(Math.random() * 100) + 50
  invalidRecords.value = Math.floor(Math.random() * 50) + 20
  cleanRecords.value = totalRecords.value - duplicateRecords.value - invalidRecords.value
}

const startCleaning = async () => {
  cleaning.value = true
  progressDialogVisible.value = true
  currentTask.value = '正在分析数据...'
  progressPercent.value = 0
  processedCount.value = 0
  totalCount.value = totalRecords.value
  
  // 模拟清洗过程
  const tasks = [
    '检测重复数据...',
    '格式规范化处理...',
    '数据验证检查...',
    '生成清洗报告...'
  ]
  
  for (let i = 0; i < tasks.length; i++) {
    currentTask.value = tasks[i]
    
    // 模拟进度更新
    for (let progress = 0; progress <= 25; progress++) {
      progressPercent.value = i * 25 + progress
      processedCount.value = Math.floor((progressPercent.value / 100) * totalCount.value)
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }
  
  cleaning.value = false
  ElMessage.success('数据清洗完成')
  
  // 更新统计数据
  setTimeout(() => {
    duplicateRecords.value = Math.max(0, duplicateRecords.value - 20)
    invalidRecords.value = Math.max(0, invalidRecords.value - 10)
    cleanRecords.value = totalRecords.value - duplicateRecords.value - invalidRecords.value
  }, 1000)
}

const cancelCleaning = () => {
  if (progressPercent.value === 100) {
    progressDialogVisible.value = false
  } else {
    ElMessageBox.confirm('确定要取消清洗任务吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '继续清洗',
      type: 'warning'
    }).then(() => {
      cleaning.value = false
      progressDialogVisible.value = false
      ElMessage.info('清洗任务已取消')
    }).catch(() => {})
  }
}

const mergeDuplicates = (group) => {
  ElMessage.success(`已合并重复组，保留 1 条记录，删除 ${group.records.length - 1} 条记录`)
  // 从重复组列表中移除
  const index = duplicateGroups.value.findIndex(g => g.id === group.id)
  if (index > -1) {
    duplicateGroups.value.splice(index, 1)
  }
  duplicateRecords.value -= (group.records.length - 1)
}

const keepRecord = (group, record) => {
  ElMessage.success(`已保留记录：${record.name}，其他重复记录已删除`)
  const index = duplicateGroups.value.findIndex(g => g.id === group.id)
  if (index > -1) {
    duplicateGroups.value.splice(index, 1)
  }
  duplicateRecords.value -= (group.records.length - 1)
}

const fixIssue = (issue) => {
  ElMessage.success(`已修复问题：${issue.issue}`)
  const index = validationIssues.value.findIndex(i => i.id === issue.id)
  if (index > -1) {
    validationIssues.value.splice(index, 1)
  }
  if (issue.severity === 'error') {
    invalidRecords.value = Math.max(0, invalidRecords.value - 1)
  }
}

const ignoreIssue = (issue) => {
  ElMessage.info(`已忽略问题：${issue.issue}`)
  const index = validationIssues.value.findIndex(i => i.id === issue.id)
  if (index > -1) {
    validationIssues.value.splice(index, 1)
  }
}

const viewResult = (task) => {
  ElMessage.info(`查看清洗结果：${task.taskName}`)
}

const downloadReport = (task) => {
  ElMessage.success(`下载清洗报告：${task.taskName}`)
}

const getPhonePreview = () => {
  const sample = '13800138000'
  switch (phoneFormat.value) {
    case 'unified':
      return '+86 138-0013-8000'
    case 'clean':
      return '13800138000'
    case 'hyphen':
      return '138-0013-8000'
    default:
      return sample
  }
}

const getEmailPreview = () => {
  let sample = 'Test@Example.COM '
  if (emailRules.value.includes('trim')) {
    sample = sample.trim()
  }
  if (emailRules.value.includes('lowercase')) {
    sample = sample.toLowerCase()
  }
  return sample
}

const getCleaningTypeText = (type) => {
  const typeMap = {
    duplicate: '重复检测',
    format: '格式规范',
    validate: '数据验证',
    all: '全面清洗'
  }
  return typeMap[type] || type
}

const getStatusText = (status) => {
  const statusMap = {
    completed: '已完成',
    processing: '进行中',
    failed: '失败',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

onMounted(() => {
  // 初始化数据
})
</script>

<style scoped lang="scss">
.overview-cards {
  margin-bottom: $spacing-lg;
  
  .stat-item {
    position: relative;
    padding: $spacing-lg;
    
    .stat-number {
      font-size: 32px;
      font-weight: 600;
      color: $text-primary;
      margin-bottom: $spacing-xs;
      
      &.warning {
        color: $warning-color;
      }
      
      &.error {
        color: $danger-color;
      }
      
      &.success {
        color: $success-color;
      }
    }
    
    .stat-label {
      color: $text-secondary;
      font-size: $font-size-base;
    }
    
    .stat-icon {
      position: absolute;
      top: $spacing-lg;
      right: $spacing-lg;
      font-size: 32px;
      color: $primary-color;
      opacity: 0.3;
      
      &.warning {
        color: $warning-color;
      }
      
      &.error {
        color: $danger-color;
      }
      
      &.success {
        color: $success-color;
      }
    }
  }
}

.cleaning-panel {
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 500;
  }
}

.tab-content {
  padding: $spacing-lg 0;
  
  .section-header {
    margin-bottom: $spacing-lg;
    
    h3 {
      margin-bottom: $spacing-sm;
      color: $text-primary;
    }
    
    .description {
      color: $text-secondary;
      margin: 0;
    }
  }
}

.rule-settings,
.similarity-settings,
.format-rules,
.validation-rules {
  margin-bottom: $spacing-lg;
  
  h4 {
    margin-bottom: $spacing-md;
    color: $text-primary;
  }
  
  .slider-group {
    margin-bottom: $spacing-md;
    
    label {
      display: block;
      margin-bottom: $spacing-sm;
      color: $text-regular;
    }
  }
}

.rule-card {
  border: 1px solid $border-light;
  
  h4 {
    margin-bottom: $spacing-md;
    color: $text-primary;
  }
  
  .rule-options {
    margin-bottom: $spacing-md;
    
    :deep(.el-checkbox),
    :deep(.el-radio) {
      display: block;
      margin-bottom: $spacing-xs;
    }
  }
  
  .rule-preview {
    padding: $spacing-sm;
    background: $bg-color;
    border-radius: 4px;
    
    .label {
      color: $text-secondary;
      margin-right: $spacing-sm;
    }
    
    .preview-text {
      font-family: monospace;
      color: $primary-color;
    }
  }
}

.duplicate-results,
.format-preview,
.validation-results {
  margin-top: $spacing-lg;
  
  h4 {
    margin-bottom: $spacing-md;
    color: $text-primary;
  }
}

.duplicate-list {
  .duplicate-group {
    margin-bottom: $spacing-lg;
    border: 1px solid $border-light;
    border-radius: 6px;
    overflow: hidden;
    
    .group-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: $spacing-md;
      background: $bg-color;
      border-bottom: 1px solid $border-light;
      
      .group-title {
        font-weight: 500;
        color: $text-primary;
      }
      
      .group-info {
        color: $text-secondary;
        font-size: $font-size-sm;
      }
    }
    
    .group-records {
      padding: $spacing-sm;
    }
  }
}

.progress-content {
  .progress-info {
    margin-bottom: $spacing-lg;
    
    p {
      margin-bottom: $spacing-sm;
      color: $text-regular;
    }
  }
  
  .progress-details {
    margin-top: $spacing-md;
    
    .detail-item {
      display: flex;
      justify-content: space-between;
      color: $text-secondary;
      font-size: $font-size-sm;
    }
  }
}

:deep(.el-tabs__content) {
  padding: 0;
}

:deep(.el-table) {
  .el-table__row {
    &:hover {
      background-color: $bg-color;
    }
  }
}
</style>