<template>
  <div class="customer-selection">
    <div class="selection-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/campaign/list' }">活动列表</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/campaign/create' }">创建活动</el-breadcrumb-item>
        <el-breadcrumb-item>客户选择</el-breadcrumb-item>
      </el-breadcrumb>
      
      <div class="selection-actions">
        <el-button @click="previewAudience" :disabled="selectedCustomers.length === 0">
          预览名单 ({{ selectedCustomers.length }})
        </el-button>
        <el-button type="primary" @click="confirmSelection" :disabled="selectedCustomers.length === 0">
          确认选择
        </el-button>
      </div>
    </div>

    <div class="selection-content">
      <!-- 选择方式标签 -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="分组选择" name="group">
          <div class="group-selection">
            <div class="group-list">
              <div class="search-box">
                <el-input
                  v-model="groupSearchKeyword"
                  placeholder="搜索客户分组"
                  clearable
                  @input="filterGroups"
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
              </div>
              
              <div class="group-items">
                <div 
                  v-for="group in filteredGroups"
                  :key="group.id"
                  class="group-item"
                  :class="{ 'selected': selectedGroups.includes(group.id) }"
                  @click="toggleGroup(group)"
                >
                  <div class="group-info">
                    <el-icon class="group-icon">
                      <User v-if="group.type === 'static'" />
                      <MagicStick v-else />
                    </el-icon>
                    <div class="group-details">
                      <div class="group-name">{{ group.name }}</div>
                      <div class="group-meta">
                        <span class="group-type">{{ group.type === 'static' ? '静态分组' : '动态分组' }}</span>
                        <span class="group-count">{{ group.customerCount }}人</span>
                      </div>
                    </div>
                  </div>
                  <div class="group-actions">
                    <el-checkbox 
                      :model-value="selectedGroups.includes(group.id)"
                      @change="() => toggleGroup(group)"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- 分组运算 -->
            <div v-if="selectedGroups.length > 1" class="group-operations">
              <el-card>
                <template #header>
                  <span>分组运算</span>
                </template>
                <el-radio-group v-model="groupOperation" @change="calculateGroupResult">
                  <el-radio value="union">并集 (所有选中分组的客户)</el-radio>
                  <el-radio value="intersect">交集 (所有选中分组都包含的客户)</el-radio>
                  <el-radio value="difference">差集 (第一个分组减去其他分组的客户)</el-radio>
                </el-radio-group>
                <div class="operation-result">
                  <el-text type="info">运算结果: {{ calculatedCustomerCount }}人</el-text>
                </div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="条件筛选" name="filter">
          <div class="filter-selection">
            <el-card>
              <template #header>
                <div class="filter-header">
                  <span>筛选条件</span>
                  <el-button type="primary" link @click="addFilter">
                    <el-icon><Plus /></el-icon>
                    添加条件
                  </el-button>
                </div>
              </template>

              <div class="filter-conditions">
                <div 
                  v-for="(filter, index) in filterConditions"
                  :key="index"
                  class="filter-condition"
                >
                  <el-row :gutter="16" align="middle">
                    <el-col :span="1">
                      <el-text v-if="index === 0">若</el-text>
                      <el-select v-else v-model="filter.logic" size="small">
                        <el-option label="且" value="and" />
                        <el-option label="或" value="or" />
                      </el-select>
                    </el-col>
                    <el-col :span="6">
                      <el-select v-model="filter.field" placeholder="选择字段" @change="updateFilter(index)">
                        <el-option-group label="基础信息">
                          <el-option label="客户姓名" value="name" />
                          <el-option label="邮箱地址" value="email" />
                          <el-option label="电话号码" value="phone" />
                          <el-option label="公司名称" value="company" />
                        </el-option-group>
                        <el-option-group label="地理位置">
                          <el-option label="国家/地区" value="country" />
                          <el-option label="省份/州" value="state" />
                          <el-option label="城市" value="city" />
                        </el-option-group>
                        <el-option-group label="客户属性">
                          <el-option label="客户等级" value="level" />
                          <el-option label="注册时间" value="registerTime" />
                          <el-option label="最后活跃时间" value="lastActiveTime" />
                          <el-option label="客户价值" value="value" />
                        </el-option-group>
                        <el-option-group label="营销数据">
                          <el-option label="邮件打开率" value="openRate" />
                          <el-option label="邮件点击率" value="clickRate" />
                          <el-option label="购买次数" value="purchaseCount" />
                          <el-option label="消费金额" value="totalSpent" />
                        </el-option-group>
                      </el-select>
                    </el-col>
                    <el-col :span="4">
                      <el-select v-model="filter.operator" placeholder="条件">
                        <el-option 
                          v-for="op in getOperatorOptions(filter.field)"
                          :key="op.value"
                          :label="op.label"
                          :value="op.value"
                        />
                      </el-select>
                    </el-col>
                    <el-col :span="10">
                      <component 
                        :is="getValueComponent(filter.field)"
                        v-model="filter.value"
                        :placeholder="getValuePlaceholder(filter.field)"
                        :options="getValueOptions(filter.field)"
                      />
                    </el-col>
                    <el-col :span="2">
                      <el-button 
                        type="danger" 
                        link 
                        @click="removeFilter(index)"
                        :disabled="filterConditions.length <= 1"
                      >
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </el-col>
                  </el-row>
                </div>
              </div>

              <div class="filter-actions">
                <el-button @click="testFilter" :loading="testingFilter">
                  测试条件
                </el-button>
                <el-button type="primary" @click="applyFilter" :loading="applyingFilter">
                  应用筛选 (预计{{ estimatedCount }}人)
                </el-button>
              </div>
            </el-card>
          </div>
        </el-tab-pane>

        <el-tab-pane label="排除设置" name="exclude">
          <div class="exclude-selection">
            <el-card>
              <template #header>
                <span>排除设置</span>
              </template>

              <div class="exclude-options">
                <el-form :model="excludeSettings" label-width="120px">
                  <el-form-item label="排除分组">
                    <el-select
                      v-model="excludeSettings.groups"
                      multiple
                      collapse-tags
                      collapse-tags-tooltip
                      placeholder="选择要排除的客户分组"
                      style="width: 100%"
                    >
                      <el-option
                        v-for="group in customerGroups"
                        :key="group.id"
                        :label="group.name"
                        :value="group.id"
                      >
                        <span>{{ group.name }}</span>
                        <span style="float: right; color: #8492a6; font-size: 13px;">{{ group.customerCount }}人</span>
                      </el-option>
                    </el-select>
                  </el-form-item>

                  <el-form-item label="排除标签">
                    <el-select
                      v-model="excludeSettings.tags"
                      multiple
                      collapse-tags
                      collapse-tags-tooltip
                      placeholder="选择要排除的客户标签"
                      style="width: 100%"
                    >
                      <el-option
                        v-for="tag in customerTags"
                        :key="tag.id"
                        :label="tag.name"
                        :value="tag.id"
                      >
                        <el-tag :color="tag.color" size="small">{{ tag.name }}</el-tag>
                      </el-option>
                    </el-select>
                  </el-form-item>

                  <el-form-item label="排除状态">
                    <el-checkbox-group v-model="excludeSettings.statuses">
                      <el-checkbox value="inactive">非活跃客户</el-checkbox>
                      <el-checkbox value="blacklist">黑名单客户</el-checkbox>
                      <el-checkbox value="bounced">邮箱无效客户</el-checkbox>
                      <el-checkbox value="unsubscribed">已退订客户</el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>

                  <el-form-item label="自定义排除">
                    <el-input
                      v-model="excludeSettings.customEmails"
                      type="textarea"
                      :rows="4"
                      placeholder="手动输入要排除的邮箱地址，每行一个"
                    />
                  </el-form-item>
                </el-form>
              </div>
            </el-card>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 选择摘要 -->
    <div class="selection-summary">
      <el-card>
        <template #header>
          <span>选择摘要</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-statistic title="目标客户" :value="selectedCustomers.length" suffix="人" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="排除客户" :value="excludedCustomers.length" suffix="人" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="最终受众" :value="finalAudienceCount" suffix="人" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="预估触达率" :value="estimatedReachRate" suffix="%" />
          </el-col>
        </el-row>
      </el-card>
    </div>

    <!-- 预览弹窗 -->
    <el-dialog
      v-model="previewVisible"
      title="客户名单预览"
      width="80%"
      append-to-body
    >
      <div class="preview-content">
        <div class="preview-stats">
          <el-row :gutter="16">
            <el-col :span="8">
              <el-card>
                <el-statistic title="总数" :value="previewData.total" />
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card>
                <el-statistic title="有效邮箱" :value="previewData.validEmails" />
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card>
                <el-statistic title="活跃客户" :value="previewData.activeCustomers" />
              </el-card>
            </el-col>
          </el-row>
        </div>

        <div class="preview-table">
          <el-table :data="previewCustomers" height="400">
            <el-table-column prop="name" label="客户姓名" width="120" />
            <el-table-column prop="email" label="邮箱地址" width="200" />
            <el-table-column prop="company" label="公司" width="150" />
            <el-table-column prop="country" label="国家" width="100" />
            <el-table-column prop="level" label="等级" width="80">
              <template #default="{ row }">
                <el-tag :type="getLevelType(row.level)">{{ row.level }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="lastActive" label="最后活跃" />
          </el-table>
        </div>
      </div>

      <template #footer>
        <div class="preview-footer">
          <el-button @click="exportPreview">导出名单</el-button>
          <el-button @click="previewVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, User, MagicStick, Plus, Delete 
} from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const activeTab = ref('group')
const groupSearchKeyword = ref('')
const selectedGroups = ref([])
const selectedCustomers = ref([])
const excludedCustomers = ref([])
const filterConditions = reactive([
  {
    logic: 'and',
    field: '',
    operator: '',
    value: ''
  }
])
const excludeSettings = reactive({
  groups: [],
  tags: [],
  statuses: [],
  customEmails: ''
})

// 预览相关
const previewVisible = ref(false)
const previewData = ref({
  total: 0,
  validEmails: 0,
  activeCustomers: 0
})
const previewCustomers = ref([])

// 加载状态
const testingFilter = ref(false)
const applyingFilter = ref(false)
const estimatedCount = ref(0)
const groupOperation = ref('union')
const calculatedCustomerCount = ref(0)

// 模拟数据
const customerGroups = ref([
  { id: 1, name: '高价值客户', type: 'dynamic', customerCount: 1234 },
  { id: 2, name: '新注册用户', type: 'dynamic', customerCount: 856 },
  { id: 3, name: '活跃用户', type: 'dynamic', customerCount: 2341 },
  { id: 4, name: '美国客户', type: 'static', customerCount: 567 },
  { id: 5, name: 'VIP客户', type: 'static', customerCount: 123 },
  { id: 6, name: '企业客户', type: 'static', customerCount: 789 },
  { id: 7, name: '潜在客户', type: 'dynamic', customerCount: 1456 },
  { id: 8, name: '忠实客户', type: 'dynamic', customerCount: 678 }
])

const customerTags = ref([
  { id: 1, name: '高消费', color: '#f56c6c' },
  { id: 2, name: '技术爱好者', color: '#409eff' },
  { id: 3, name: '企业决策者', color: '#67c23a' },
  { id: 4, name: '价格敏感', color: '#e6a23c' },
  { id: 5, name: '早期采用者', color: '#909399' }
])

// 计算属性
const filteredGroups = computed(() => {
  if (!groupSearchKeyword.value) return customerGroups.value
  return customerGroups.value.filter(group => 
    group.name.includes(groupSearchKeyword.value)
  )
})

const finalAudienceCount = computed(() => {
  return Math.max(0, selectedCustomers.value.length - excludedCustomers.value.length)
})

const estimatedReachRate = computed(() => {
  if (selectedCustomers.value.length === 0) return 0
  return Math.round((finalAudienceCount.value / selectedCustomers.value.length) * 100)
})

// 方法
const handleTabChange = (tabName) => {
  console.log('切换到标签:', tabName)
}

const toggleGroup = (group) => {
  const index = selectedGroups.value.indexOf(group.id)
  if (index > -1) {
    selectedGroups.value.splice(index, 1)
  } else {
    selectedGroups.value.push(group.id)
  }
  calculateSelectedCustomers()
}

const calculateSelectedCustomers = () => {
  let count = 0
  selectedGroups.value.forEach(groupId => {
    const group = customerGroups.value.find(g => g.id === groupId)
    if (group) {
      if (groupOperation.value === 'union') {
        count += group.customerCount
      }
    }
  })
  
  // 模拟去重计算
  if (selectedGroups.value.length > 1) {
    count = Math.floor(count * 0.8) // 假设有20%重复
  }
  
  selectedCustomers.value = new Array(count).fill().map((_, index) => ({
    id: index + 1,
    name: `客户${index + 1}`,
    email: `customer${index + 1}@example.com`
  }))
}

const calculateGroupResult = () => {
  let count = 0
  if (selectedGroups.value.length === 0) {
    calculatedCustomerCount.value = 0
    return
  }

  const groups = selectedGroups.value.map(id => 
    customerGroups.value.find(g => g.id === id)
  )

  switch (groupOperation.value) {
    case 'union':
      count = groups.reduce((sum, group) => sum + group.customerCount, 0)
      count = Math.floor(count * 0.8) // 模拟去重
      break
    case 'intersect':
      count = Math.min(...groups.map(g => g.customerCount))
      count = Math.floor(count * 0.3) // 模拟交集
      break
    case 'difference':
      count = groups[0].customerCount
      for (let i = 1; i < groups.length; i++) {
        count -= Math.floor(groups[i].customerCount * 0.2) // 模拟差集
      }
      count = Math.max(0, count)
      break
  }

  calculatedCustomerCount.value = count
}

const addFilter = () => {
  filterConditions.push({
    logic: 'and',
    field: '',
    operator: '',
    value: ''
  })
}

const removeFilter = (index) => {
  if (filterConditions.length > 1) {
    filterConditions.splice(index, 1)
  }
}

const updateFilter = (index) => {
  const condition = filterConditions[index]
  condition.operator = ''
  condition.value = ''
}

const getOperatorOptions = (field) => {
  const textOperators = [
    { label: '等于', value: 'equals' },
    { label: '包含', value: 'contains' },
    { label: '不等于', value: 'not_equals' },
    { label: '不包含', value: 'not_contains' }
  ]
  
  const numberOperators = [
    { label: '等于', value: 'equals' },
    { label: '大于', value: 'greater' },
    { label: '小于', value: 'less' },
    { label: '大于等于', value: 'greater_equal' },
    { label: '小于等于', value: 'less_equal' }
  ]
  
  const dateOperators = [
    { label: '在日期', value: 'on' },
    { label: '在日期之前', value: 'before' },
    { label: '在日期之后', value: 'after' },
    { label: '在日期范围', value: 'between' }
  ]

  if (['registerTime', 'lastActiveTime'].includes(field)) {
    return dateOperators
  } else if (['value', 'openRate', 'clickRate', 'purchaseCount', 'totalSpent'].includes(field)) {
    return numberOperators
  } else {
    return textOperators
  }
}

const getValueComponent = (field) => {
  if (['country', 'state', 'level'].includes(field)) {
    return 'el-select'
  } else if (['registerTime', 'lastActiveTime'].includes(field)) {
    return 'el-date-picker'
  } else if (['value', 'openRate', 'clickRate', 'purchaseCount', 'totalSpent'].includes(field)) {
    return 'el-input-number'
  } else {
    return 'el-input'
  }
}

const getValuePlaceholder = (field) => {
  const placeholders = {
    name: '请输入客户姓名',
    email: '请输入邮箱地址',
    phone: '请输入电话号码',
    company: '请输入公司名称',
    city: '请输入城市名称',
    value: '请输入客户价值',
    openRate: '请输入打开率（%）',
    clickRate: '请输入点击率（%）',
    purchaseCount: '请输入购买次数',
    totalSpent: '请输入消费金额'
  }
  return placeholders[field] || '请输入值'
}

const getValueOptions = (field) => {
  const options = {
    country: [
      { label: '美国', value: 'US' },
      { label: '加拿大', value: 'CA' },
      { label: '英国', value: 'UK' },
      { label: '德国', value: 'DE' },
      { label: '法国', value: 'FR' }
    ],
    level: [
      { label: '普通客户', value: 'normal' },
      { label: '银牌客户', value: 'silver' },
      { label: '金牌客户', value: 'gold' },
      { label: 'VIP客户', value: 'vip' }
    ]
  }
  return options[field] || []
}

const testFilter = async () => {
  testingFilter.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    estimatedCount.value = Math.floor(Math.random() * 5000) + 100
    ElMessage.success(`筛选条件有效，预计匹配 ${estimatedCount.value} 位客户`)
  } catch (error) {
    ElMessage.error('测试筛选条件失败')
  } finally {
    testingFilter.value = false
  }
}

const applyFilter = async () => {
  applyingFilter.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 生成模拟客户数据
    selectedCustomers.value = new Array(estimatedCount.value).fill().map((_, index) => ({
      id: index + 1,
      name: `筛选客户${index + 1}`,
      email: `filtered${index + 1}@example.com`
    }))
    
    ElMessage.success(`已应用筛选条件，共筛选出 ${estimatedCount.value} 位客户`)
  } catch (error) {
    ElMessage.error('应用筛选条件失败')
  } finally {
    applyingFilter.value = false
  }
}

const previewAudience = async () => {
  if (selectedCustomers.value.length === 0) {
    ElMessage.warning('请先选择客户')
    return
  }

  previewVisible.value = true
  
  // 模拟生成预览数据
  previewData.value = {
    total: finalAudienceCount.value,
    validEmails: Math.floor(finalAudienceCount.value * 0.95),
    activeCustomers: Math.floor(finalAudienceCount.value * 0.78)
  }

  // 生成预览客户列表（前100条）
  previewCustomers.value = new Array(Math.min(100, finalAudienceCount.value)).fill().map((_, index) => ({
    id: index + 1,
    name: `客户${index + 1}`,
    email: `customer${index + 1}@example.com`,
    company: `公司${index + 1}`,
    country: ['美国', '加拿大', '英国', '德国', '法国'][index % 5],
    level: ['普通', '银牌', '金牌', 'VIP'][index % 4],
    status: ['活跃', '不活跃'][index % 2],
    lastActive: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toLocaleDateString()
  }))
}

const exportPreview = () => {
  ElMessage.success('客户名单导出功能开发中...')
}

const confirmSelection = async () => {
  if (finalAudienceCount.value === 0) {
    ElMessage.warning('没有选择任何客户')
    return
  }

  try {
    const result = await ElMessageBox.confirm(
      `确定选择这 ${finalAudienceCount.value} 位客户作为活动目标受众吗？`,
      '确认客户选择',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    if (result === 'confirm') {
      ElMessage.success('客户选择已确认，正在跳转到内容配置...')
      // 跳转到下一步：内容配置
      setTimeout(() => {
        router.push('/campaign/content-config')
      }, 1000)
    }
  } catch {
    // 用户取消
  }
}

const getLevelType = (level) => {
  const types = {
    '普通': '',
    '银牌': 'info',
    '金牌': 'warning',
    'VIP': 'danger'
  }
  return types[level] || ''
}

const getStatusType = (status) => {
  return status === '活跃' ? 'success' : 'info'
}

const filterGroups = () => {
  // 搜索功能已在计算属性中实现
}

// 监听选中分组变化
watch(selectedGroups, () => {
  calculateGroupResult()
}, { deep: true })

// 监听排除设置变化
watch(excludeSettings, () => {
  // 重新计算排除的客户数量
  let excludeCount = 0
  
  // 计算排除分组的客户数
  excludeSettings.groups.forEach(groupId => {
    const group = customerGroups.value.find(g => g.id === groupId)
    if (group) {
      excludeCount += Math.floor(group.customerCount * 0.1) // 模拟10%的重叠
    }
  })
  
  // 加上其他排除条件的客户数
  excludeCount += excludeSettings.statuses.length * 50 // 每个状态排除50人
  
  // 自定义邮箱排除
  if (excludeSettings.customEmails) {
    const emails = excludeSettings.customEmails.split('\n').filter(e => e.trim())
    excludeCount += emails.length
  }
  
  excludedCustomers.value = new Array(excludeCount).fill().map((_, index) => ({
    id: `exclude_${index}`,
    reason: '排除条件匹配'
  }))
}, { deep: true })

// 组件挂载
onMounted(() => {
  // 初始化数据
})
</script>

<style lang="scss" scoped>
.customer-selection {
  padding: 20px;

  .selection-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .selection-actions {
      display: flex;
      gap: 10px;
    }
  }

  .selection-content {
    margin-bottom: 20px;

    .group-selection {
      .group-list {
        .search-box {
          margin-bottom: 20px;
        }

        .group-items {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 15px;
          margin-bottom: 20px;

          .group-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            border: 2px solid var(--el-border-color-light);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
              border-color: var(--el-color-primary);
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }

            &.selected {
              border-color: var(--el-color-primary);
              background-color: var(--el-color-primary-light-9);
            }

            .group-info {
              display: flex;
              align-items: center;
              flex: 1;

              .group-icon {
                margin-right: 12px;
                font-size: 24px;
                color: var(--el-color-primary);
              }

              .group-details {
                .group-name {
                  font-weight: 500;
                  margin-bottom: 4px;
                }

                .group-meta {
                  display: flex;
                  gap: 12px;
                  font-size: 12px;
                  color: var(--el-text-color-secondary);

                  .group-type {
                    padding: 2px 6px;
                    background: var(--el-fill-color-light);
                    border-radius: 4px;
                  }
                }
              }
            }
          }
        }
      }

      .group-operations {
        margin-top: 20px;

        .operation-result {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid var(--el-border-color-lighter);
        }
      }
    }

    .filter-selection {
      .filter-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .filter-conditions {
        .filter-condition {
          margin-bottom: 15px;
          padding: 15px;
          background: var(--el-fill-color-lighter);
          border-radius: 6px;

          &:last-child {
            margin-bottom: 0;
          }
        }
      }

      .filter-actions {
        margin-top: 20px;
        text-align: center;
      }
    }

    .exclude-selection {
      .exclude-options {
        .el-form-item {
          margin-bottom: 20px;
        }
      }
    }
  }

  .selection-summary {
    margin-bottom: 20px;

    .el-statistic {
      text-align: center;
    }
  }

  .preview-content {
    .preview-stats {
      margin-bottom: 20px;

      .el-statistic {
        text-align: center;
      }
    }

    .preview-table {
      .el-table {
        border: 1px solid var(--el-border-color-lighter);
        border-radius: 6px;
      }
    }
  }

  .preview-footer {
    text-align: right;
  }
}
</style>