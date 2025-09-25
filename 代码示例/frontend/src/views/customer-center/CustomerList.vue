<template>
  <div class="customer-list-page">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <h1>客户列表</h1>
        <div class="page-stats">
          <el-statistic title="总客户数" :value="totalCustomers" />
          <el-statistic title="活跃客户" :value="activeCustomers" />
          <el-statistic title="本月新增" :value="newThisMonth" />
        </div>
      </div>
      <div class="header-actions">
        <el-button @click="showImportDialog = true" :icon="Upload" type="success">
          导入客户
        </el-button>
        <el-button @click="showAddDialog = true" :icon="Plus" type="primary">
          添加客户
        </el-button>
        <el-button @click="exportCustomers" :icon="Download">
          导出客户
        </el-button>
      </div>
    </div>

    <!-- 高级搜索面板 -->
    <el-card class="search-panel" v-show="showSearchPanel">
      <template #header>
        <div class="search-header">
          <span>高级搜索</span>
          <el-button @click="resetSearch" size="small" text>重置条件</el-button>
        </div>
      </template>
      
      <el-form :model="searchForm" :inline="true" label-width="80px">
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="客户姓名">
              <el-input 
                v-model="searchForm.name" 
                placeholder="输入客户姓名"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="公司名称">
              <el-input 
                v-model="searchForm.company" 
                placeholder="输入公司名称"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="邮箱">
              <el-input 
                v-model="searchForm.email" 
                placeholder="输入邮箱地址"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="16">
          <el-col :span="6">
            <el-form-item label="客户状态">
              <el-select v-model="searchForm.status" placeholder="选择状态" clearable>
                <el-option label="活跃" value="active" />
                <el-option label="非活跃" value="inactive" />
                <el-option label="潜在客户" value="potential" />
                <el-option label="已流失" value="lost" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="客户等级">
              <el-select v-model="searchForm.level" placeholder="选择等级" clearable>
                <el-option label="VIP" value="vip" />
                <el-option label="重要客户" value="important" />
                <el-option label="普通客户" value="normal" />
                <el-option label="新客户" value="new" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="客户来源">
              <el-select v-model="searchForm.source" placeholder="选择来源" clearable>
                <el-option label="网站注册" value="website" />
                <el-option label="社媒引流" value="social" />
                <el-option label="邮件营销" value="email" />
                <el-option label="推荐介绍" value="referral" />
                <el-option label="线下活动" value="offline" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="所属区域">
              <el-select v-model="searchForm.region" placeholder="选择区域" clearable>
                <el-option label="北美" value="north-america" />
                <el-option label="欧洲" value="europe" />
                <el-option label="亚洲" value="asia" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="创建时间">
              <el-date-picker
                v-model="searchForm.createTimeRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="标签">
              <el-select 
                v-model="searchForm.tags" 
                placeholder="选择标签" 
                multiple 
                collapse-tags
                collapse-tags-tooltip
              >
                <el-option 
                  v-for="tag in availableTags" 
                  :key="tag.value"
                  :label="tag.label" 
                  :value="tag.value" 
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item>
              <el-button type="primary" @click="handleSearch" :icon="Search">
                搜索
              </el-button>
              <el-button @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <!-- 快速筛选 -->
        <div class="quick-filters">
          <el-button-group>
            <el-button 
              :type="currentFilter === 'all' ? 'primary' : ''"
              @click="setQuickFilter('all')"
            >
              全部客户
            </el-button>
            <el-button 
              :type="currentFilter === 'active' ? 'primary' : ''"
              @click="setQuickFilter('active')"
            >
              活跃客户
            </el-button>
            <el-button 
              :type="currentFilter === 'vip' ? 'primary' : ''"
              @click="setQuickFilter('vip')"
            >
              VIP客户
            </el-button>
            <el-button 
              :type="currentFilter === 'new' ? 'primary' : ''"
              @click="setQuickFilter('new')"
            >
              新客户
            </el-button>
          </el-button-group>
        </div>

        <!-- 批量操作 -->
        <div v-if="selectedCustomers.length > 0" class="batch-actions">
          <span class="selected-count">已选择 {{ selectedCustomers.length }} 个客户</span>
          <el-button @click="batchAddTags" size="small" :icon="PriceTag">
            批量标签
          </el-button>
          <el-button @click="batchChangeStatus" size="small" :icon="Switch">
            批量状态
          </el-button>
          <el-button @click="batchExport" size="small" :icon="Download">
            批量导出
          </el-button>
          <el-button @click="batchDelete" size="small" type="danger" :icon="Delete">
            批量删除
          </el-button>
        </div>
      </div>

      <div class="toolbar-right">
        <el-tooltip content="高级搜索">
          <el-button 
            :type="showSearchPanel ? 'primary' : ''"
            @click="showSearchPanel = !showSearchPanel" 
            :icon="Search"
          />
        </el-tooltip>
        <el-tooltip content="刷新列表">
          <el-button @click="refreshList" :icon="Refresh" />
        </el-tooltip>
        <el-tooltip content="列设置">
          <el-button @click="showColumnSettings = true" :icon="Setting" />
        </el-tooltip>
      </div>
    </div>

    <!-- 客户列表 -->
    <el-card class="table-card">
      <el-table 
        :data="customerList" 
        v-loading="loading"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        height="calc(100vh - 400px)"
        stripe
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="avatar" label="头像" width="70">
          <template #default="scope">
            <el-avatar 
              :src="scope.row.avatar" 
              :alt="scope.row.name"
              size="small"
            >
              {{ scope.row.name?.charAt(0) || 'N' }}
            </el-avatar>
          </template>
        </el-table-column>

        <el-table-column prop="name" label="姓名" width="120" sortable>
          <template #default="scope">
            <div class="customer-name">
              <span @click="viewCustomerDetail(scope.row)" class="name-link">
                {{ scope.row.name }}
              </span>
              <div class="customer-level">
                <el-tag 
                  :type="getLevelType(scope.row.level)" 
                  size="small"
                >
                  {{ getLevelLabel(scope.row.level) }}
                </el-tag>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="company" label="公司" width="150" show-overflow-tooltip />
        
        <el-table-column prop="email" label="邮箱" width="180" show-overflow-tooltip />
        
        <el-table-column prop="phone" label="电话" width="130" show-overflow-tooltip />

        <el-table-column prop="region" label="地区" width="100">
          <template #default="scope">
            <span>{{ getRegionLabel(scope.row.region) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag 
              :type="getStatusType(scope.row.status)"
              size="small"
            >
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="source" label="来源" width="120">
          <template #default="scope">
            <el-tag 
              type="info" 
              size="small"
              :icon="getSourceIcon(scope.row.source)"
            >
              {{ getSourceLabel(scope.row.source) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="tags" label="标签" width="150">
          <template #default="scope">
            <div class="tags-container">
              <el-tag 
                v-for="tag in scope.row.tags?.slice(0, 2)" 
                :key="tag"
                size="small"
                class="tag-item"
              >
                {{ tag }}
              </el-tag>
              <el-popover 
                v-if="scope.row.tags?.length > 2"
                placement="top-start"
                trigger="hover"
                :content="scope.row.tags.slice(2).join(', ')"
              >
                <template #reference>
                  <el-tag size="small" type="info">+{{ scope.row.tags.length - 2 }}</el-tag>
                </template>
              </el-popover>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="lastContact" label="最后联系" width="120" sortable>
          <template #default="scope">
            <span>{{ formatDate(scope.row.lastContact) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" width="120" sortable>
          <template #default="scope">
            <span>{{ formatDate(scope.row.createTime) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button @click="viewCustomerDetail(scope.row)" size="small" text>
                查看
              </el-button>
              <el-button @click="editCustomer(scope.row)" size="small" text type="primary">
                编辑
              </el-button>
              <el-dropdown @command="(command) => handleCommand(command, scope.row)">
                <el-button size="small" text>
                  更多<el-icon><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="addTag">添加标签</el-dropdown-item>
                    <el-dropdown-item command="changeStatus">修改状态</el-dropdown-item>
                    <el-dropdown-item command="sendEmail">发送邮件</el-dropdown-item>
                    <el-dropdown-item command="duplicate">复制客户</el-dropdown-item>
                    <el-dropdown-item command="delete" divided>删除客户</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑客户对话框 -->
    <el-dialog 
      v-model="showAddDialog"
      :title="editingCustomer ? '编辑客户' : '添加客户'"
      width="60%"
      destroy-on-close
    >
      <el-form 
        :model="customerForm" 
        :rules="customerRules"
        ref="customerFormRef"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户姓名" prop="name">
              <el-input v-model="customerForm.name" placeholder="请输入客户姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公司名称" prop="company">
              <el-input v-model="customerForm.company" placeholder="请输入公司名称" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮箱地址" prop="email">
              <el-input v-model="customerForm.email" placeholder="请输入邮箱地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电话号码" prop="phone">
              <el-input v-model="customerForm.phone" placeholder="请输入电话号码" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户状态" prop="status">
              <el-select v-model="customerForm.status" placeholder="请选择状态">
                <el-option label="活跃" value="active" />
                <el-option label="非活跃" value="inactive" />
                <el-option label="潜在客户" value="potential" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户等级" prop="level">
              <el-select v-model="customerForm.level" placeholder="请选择等级">
                <el-option label="VIP客户" value="vip" />
                <el-option label="重要客户" value="important" />
                <el-option label="普通客户" value="normal" />
                <el-option label="新客户" value="new" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户来源" prop="source">
              <el-select v-model="customerForm.source" placeholder="请选择来源">
                <el-option label="网站注册" value="website" />
                <el-option label="社媒引流" value="social" />
                <el-option label="邮件营销" value="email" />
                <el-option label="推荐介绍" value="referral" />
                <el-option label="线下活动" value="offline" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属区域" prop="region">
              <el-select v-model="customerForm.region" placeholder="请选择区域">
                <el-option label="北美" value="north-america" />
                <el-option label="欧洲" value="europe" />
                <el-option label="亚洲" value="asia" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="标签">
              <el-select 
                v-model="customerForm.tags" 
                placeholder="请选择标签" 
                multiple
                filterable
                allow-create
              >
                <el-option 
                  v-for="tag in availableTags" 
                  :key="tag.value"
                  :label="tag.label" 
                  :value="tag.value" 
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="备注信息">
          <el-input 
            v-model="customerForm.notes" 
            type="textarea" 
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="saveCustomer" :loading="saving">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 导入客户对话框 -->
    <el-dialog v-model="showImportDialog" title="导入客户" width="50%" destroy-on-close>
      <div class="import-content">
        <el-upload
          class="upload-demo"
          drag
          :action="uploadUrl"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :before-remove="beforeRemove"
          multiple
          accept=".xlsx,.xls,.csv"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持xlsx/xls/csv格式，文件大小不超过10MB
            </div>
          </template>
        </el-upload>
        
        <div class="import-template">
          <el-button @click="downloadTemplate" :icon="Download" text>
            下载导入模板
          </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 列设置对话框 -->
    <el-dialog v-model="showColumnSettings" title="列设置" width="30%">
      <el-checkbox-group v-model="visibleColumns">
        <el-checkbox 
          v-for="column in allColumns" 
          :key="column.prop"
          :label="column.prop"
          :disabled="column.required"
        >
          {{ column.label }}
        </el-checkbox>
      </el-checkbox-group>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, Upload, Download, Search, Refresh, Setting, Delete, Switch, 
  PriceTag, ArrowDown, UploadFilled
} from '@element-plus/icons-vue'

const router = useRouter()

// 页面状态
const loading = ref(false)
const saving = ref(false)
const showSearchPanel = ref(false)
const showAddDialog = ref(false)
const showImportDialog = ref(false)
const showColumnSettings = ref(false)
const currentFilter = ref('all')
const editingCustomer = ref(null)

// 统计数据
const totalCustomers = ref(1248)
const activeCustomers = ref(892)
const newThisMonth = ref(156)

// 搜索表单
const searchForm = reactive({
  name: '',
  company: '',
  email: '',
  status: '',
  level: '',
  source: '',
  region: '',
  createTimeRange: null,
  tags: []
})

// 客户表单
const customerForm = reactive({
  name: '',
  company: '',
  email: '',
  phone: '',
  status: '',
  level: '',
  source: '',
  region: '',
  tags: [],
  notes: ''
})

// 表单验证规则
const customerRules = {
  name: [
    { required: true, message: '请输入客户姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择客户状态', trigger: 'change' }
  ],
  level: [
    { required: true, message: '请选择客户等级', trigger: 'change' }
  ]
}

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 1248
})

// 选中的客户
const selectedCustomers = ref([])

// 客户列表
const customerList = ref([])

// 可用标签
const availableTags = ref([
  { label: '高价值客户', value: 'high-value' },
  { label: '活跃用户', value: 'active-user' },
  { label: '潜在客户', value: 'potential' },
  { label: '重点关注', value: 'focus' },
  { label: '新用户', value: 'new-user' }
])

// 列配置
const allColumns = ref([
  { prop: 'avatar', label: '头像', required: true },
  { prop: 'name', label: '姓名', required: true },
  { prop: 'company', label: '公司', required: false },
  { prop: 'email', label: '邮箱', required: true },
  { prop: 'phone', label: '电话', required: false },
  { prop: 'region', label: '地区', required: false },
  { prop: 'status', label: '状态', required: false },
  { prop: 'source', label: '来源', required: false },
  { prop: 'tags', label: '标签', required: false },
  { prop: 'lastContact', label: '最后联系', required: false },
  { prop: 'createTime', label: '创建时间', required: false }
])

const visibleColumns = ref(['avatar', 'name', 'company', 'email', 'phone', 'region', 'status', 'source', 'tags', 'lastContact', 'createTime'])

const uploadUrl = computed(() => '/api/customers/import')

// 生成模拟客户数据
const generateMockCustomers = () => {
  const customers = []
  const names = ['张伟', '李娜', '王强', 'John Smith', 'Mary Johnson', 'David Wilson', 'Sarah Brown', '田中太郎', '佐藤花子']
  const companies = ['阿里巴巴', 'Google', 'Microsoft', 'Apple', 'Amazon', 'Facebook', 'Tesla', 'Netflix', '腾讯']
  const regions = ['north-america', 'europe', 'asia', 'other']
  const statuses = ['active', 'inactive', 'potential', 'lost']
  const levels = ['vip', 'important', 'normal', 'new']
  const sources = ['website', 'social', 'email', 'referral', 'offline']
  const tags = ['高价值客户', '活跃用户', '潜在客户', '重点关注', '新用户']

  for (let i = 0; i < 50; i++) {
    customers.push({
      id: i + 1,
      name: names[Math.floor(Math.random() * names.length)],
      company: companies[Math.floor(Math.random() * companies.length)],
      email: `user${i + 1}@example.com`,
      phone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      region: regions[Math.floor(Math.random() * regions.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      level: levels[Math.floor(Math.random() * levels.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      tags: tags.slice(0, Math.floor(Math.random() * 3) + 1),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
      lastContact: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      createTime: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      notes: `客户备注信息 ${i + 1}`
    })
  }
  return customers
}

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    'active': 'success',
    'inactive': 'warning',
    'potential': 'info',
    'lost': 'danger'
  }
  return types[status] || ''
}

// 获取状态标签
const getStatusLabel = (status) => {
  const labels = {
    'active': '活跃',
    'inactive': '非活跃',
    'potential': '潜在客户',
    'lost': '已流失'
  }
  return labels[status] || status
}

// 获取等级类型
const getLevelType = (level) => {
  const types = {
    'vip': 'danger',
    'important': 'warning',
    'normal': 'info',
    'new': 'success'
  }
  return types[level] || ''
}

// 获取等级标签
const getLevelLabel = (level) => {
  const labels = {
    'vip': 'VIP',
    'important': '重要',
    'normal': '普通',
    'new': '新客户'
  }
  return labels[level] || level
}

// 获取地区标签
const getRegionLabel = (region) => {
  const labels = {
    'north-america': '北美',
    'europe': '欧洲',
    'asia': '亚洲',
    'other': '其他'
  }
  return labels[region] || region
}

// 获取来源标签
const getSourceLabel = (source) => {
  const labels = {
    'website': '网站',
    'social': '社媒',
    'email': '邮件',
    'referral': '推荐',
    'offline': '线下'
  }
  return labels[source] || source
}

// 获取来源图标
const getSourceIcon = (source) => {
  const icons = {
    'website': 'Monitor',
    'social': 'ChatLineSquare',
    'email': 'Message',
    'referral': 'UserFilled',
    'offline': 'OfficeBuilding'
  }
  return icons[source] || 'QuestionFilled'
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

// 搜索客户
const handleSearch = () => {
  loading.value = true
  // 模拟搜索
  setTimeout(() => {
    loadCustomerList()
    loading.value = false
    ElMessage.success('搜索完成')
  }, 1000)
}

// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    if (Array.isArray(searchForm[key])) {
      searchForm[key] = []
    } else {
      searchForm[key] = ''
    }
  })
  searchForm.createTimeRange = null
  handleSearch()
}

// 快速筛选
const setQuickFilter = (filter) => {
  currentFilter.value = filter
  loading.value = true
  
  setTimeout(() => {
    let filteredData = generateMockCustomers()
    
    if (filter === 'active') {
      filteredData = filteredData.filter(customer => customer.status === 'active')
    } else if (filter === 'vip') {
      filteredData = filteredData.filter(customer => customer.level === 'vip')
    } else if (filter === 'new') {
      filteredData = filteredData.filter(customer => customer.level === 'new')
    }
    
    customerList.value = filteredData
    pagination.total = filteredData.length
    loading.value = false
  }, 500)
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedCustomers.value = selection
}

// 排序变化
const handleSortChange = ({ column, prop, order }) => {
  loading.value = true
  // 模拟排序
  setTimeout(() => {
    if (order === 'ascending') {
      customerList.value.sort((a, b) => a[prop] > b[prop] ? 1 : -1)
    } else if (order === 'descending') {
      customerList.value.sort((a, b) => a[prop] < b[prop] ? 1 : -1)
    }
    loading.value = false
  }, 500)
}

// 分页变化
const handleSizeChange = (size) => {
  pagination.pageSize = size
  loadCustomerList()
}

const handleCurrentChange = (page) => {
  pagination.currentPage = page
  loadCustomerList()
}

// 查看客户详情
const viewCustomerDetail = (customer) => {
  router.push(`/customer-center/detail/${customer.id}`)
}

// 编辑客户
const editCustomer = (customer) => {
  editingCustomer.value = customer
  Object.assign(customerForm, customer)
  showAddDialog.value = true
}

// 保存客户
const saveCustomer = async () => {
  try {
    saving.value = true
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (editingCustomer.value) {
      // 编辑模式
      Object.assign(editingCustomer.value, customerForm)
      ElMessage.success('客户信息更新成功')
    } else {
      // 新增模式
      const newCustomer = {
        ...customerForm,
        id: Date.now(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
        createTime: new Date(),
        lastContact: new Date()
      }
      customerList.value.unshift(newCustomer)
      ElMessage.success('客户添加成功')
    }
    
    showAddDialog.value = false
    editingCustomer.value = null
    resetCustomerForm()
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 重置客户表单
const resetCustomerForm = () => {
  Object.keys(customerForm).forEach(key => {
    if (Array.isArray(customerForm[key])) {
      customerForm[key] = []
    } else {
      customerForm[key] = ''
    }
  })
}

// 处理命令
const handleCommand = async (command, customer) => {
  switch (command) {
    case 'addTag':
      ElMessage.info(`为 ${customer.name} 添加标签`)
      break
    case 'changeStatus':
      ElMessage.info(`修改 ${customer.name} 状态`)
      break
    case 'sendEmail':
      ElMessage.info(`给 ${customer.name} 发送邮件`)
      break
    case 'duplicate':
      ElMessage.info(`复制客户 ${customer.name}`)
      break
    case 'delete':
      try {
        await ElMessageBox.confirm(`确定要删除客户 ${customer.name} 吗？`, '确认删除', {
          type: 'warning'
        })
        const index = customerList.value.findIndex(item => item.id === customer.id)
        if (index > -1) {
          customerList.value.splice(index, 1)
        }
        ElMessage.success('删除成功')
      } catch {
        // 用户取消
      }
      break
  }
}

// 批量操作
const batchAddTags = () => {
  ElMessage.info(`为 ${selectedCustomers.value.length} 个客户批量添加标签`)
}

const batchChangeStatus = () => {
  ElMessage.info(`批量修改 ${selectedCustomers.value.length} 个客户状态`)
}

const batchExport = () => {
  ElMessage.info(`导出 ${selectedCustomers.value.length} 个客户`)
}

const batchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedCustomers.value.length} 个客户吗？`,
      '批量删除',
      { type: 'warning' }
    )
    
    const selectedIds = selectedCustomers.value.map(customer => customer.id)
    customerList.value = customerList.value.filter(customer => !selectedIds.includes(customer.id))
    selectedCustomers.value = []
    ElMessage.success('批量删除成功')
  } catch {
    // 用户取消
  }
}

// 导出客户
const exportCustomers = () => {
  ElMessage.info('导出客户数据')
}

// 刷新列表
const refreshList = () => {
  loadCustomerList()
}

// 加载客户列表
const loadCustomerList = () => {
  loading.value = true
  setTimeout(() => {
    customerList.value = generateMockCustomers()
    loading.value = false
  }, 500)
}

// 文件上传相关
const handlePreview = (file) => {
  console.log(file)
}

const handleRemove = (file, fileList) => {
  console.log(file, fileList)
}

const beforeRemove = (file, fileList) => {
  return ElMessageBox.confirm(`确定移除 ${file.name}？`)
}

const downloadTemplate = () => {
  ElMessage.success('模板下载成功')
}

// 初始化
onMounted(() => {
  loadCustomerList()
})
</script>

<style lang="scss" scoped>
.customer-list-page {
  padding: 20px;
  background-color: #f5f7fa;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  
  .header-left {
    h1 {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 16px 0;
    }
    
    .page-stats {
      display: flex;
      gap: 32px;
    }
  }
  
  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.search-panel {
  margin-bottom: 20px;
  
  .search-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  
  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .quick-filters {
      display: flex;
    }
    
    .batch-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .selected-count {
        color: #409eff;
        font-size: 14px;
      }
    }
  }
  
  .toolbar-right {
    display: flex;
    gap: 8px;
  }
}

.table-card {
  .customer-name {
    .name-link {
      color: #409eff;
      cursor: pointer;
      
      &:hover {
        text-decoration: underline;
      }
    }
    
    .customer-level {
      margin-top: 4px;
    }
  }
  
  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    
    .tag-item {
      margin-bottom: 4px;
    }
  }
  
  .action-buttons {
    display: flex;
    gap: 8px;
  }
  
  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
    padding: 16px 0;
  }
}

.import-content {
  .upload-demo {
    margin-bottom: 20px;
  }
  
  .import-template {
    text-align: center;
    padding-top: 16px;
    border-top: 1px solid #ebeef5;
  }
}

@media (max-width: 768px) {
  .customer-list-page {
    padding: 12px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    
    .header-left .page-stats {
      flex-direction: column;
      gap: 16px;
    }
    
    .header-actions {
      width: 100%;
      justify-content: flex-start;
      flex-wrap: wrap;
    }
  }
  
  .toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
    
    .toolbar-left {
      width: 100%;
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;
    }
  }
  
  .search-panel {
    :deep(.el-form-item) {
      margin-bottom: 16px;
    }
  }
}
</style>