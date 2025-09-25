<template>
  <div class="customer-group-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <h1>客户分组</h1>
        <p class="page-desc">创建和管理客户分组，支持静态分组和动态分组，提升营销精准度</p>
      </div>
      <div class="header-actions">
        <el-button @click="showCreateDialog = true" :icon="Plus" type="primary">
          创建分组
        </el-button>
        <el-button @click="showBatchOperationDialog = true" :icon="Operation">
          批量操作
        </el-button>
      </div>
    </div>

    <!-- 分组概览卡片 -->
    <div class="overview-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="overview-card">
            <el-statistic title="总分组数" :value="groupStats.totalGroups">
              <template #suffix>
                <el-icon class="statistic-icon"><Collection /></el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overview-card">
            <el-statistic title="静态分组" :value="groupStats.staticGroups">
              <template #suffix>
                <el-icon class="statistic-icon"><User /></el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overview-card">
            <el-statistic title="动态分组" :value="groupStats.dynamicGroups">
              <template #suffix>
                <el-icon class="statistic-icon"><Refresh /></el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="overview-card">
            <el-statistic title="总客户数" :value="groupStats.totalCustomers">
              <template #suffix>
                <el-icon class="statistic-icon"><UserFilled /></el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-row :gutter="24">
      <!-- 左侧分组列表 -->
      <el-col :span="8">
        <el-card class="group-list-card">
          <template #header>
            <div class="card-header">
              <span>分组列表</span>
              <div class="header-actions">
                <el-input
                  v-model="searchKeyword"
                  placeholder="搜索分组"
                  :prefix-icon="Search"
                  size="small"
                  style="width: 150px;"
                  clearable
                />
              </div>
            </div>
          </template>

          <!-- 分组筛选标签 -->
          <div class="group-filters">
            <el-radio-group v-model="groupTypeFilter" size="small">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="static">静态</el-radio-button>
              <el-radio-button label="dynamic">动态</el-radio-button>
              <el-radio-button label="system">系统</el-radio-button>
            </el-radio-group>
          </div>

          <!-- 分组树 -->
          <div class="group-tree-container">
            <el-tree
              :data="filteredGroups"
              :props="treeProps"
              :expand-on-click-node="false"
              :default-expand-all="true"
              node-key="id"
              class="group-tree"
              @node-click="selectGroup"
            >
              <template #default="{ node, data }">
                <div class="tree-node">
                  <div class="node-content">
                    <el-icon class="node-icon">
                      <component :is="getGroupIcon(data.type)" />
                    </el-icon>
                    <span class="node-label">{{ data.name }}</span>
                    <el-tag 
                      :type="getGroupTagType(data.type)" 
                      size="small"
                      class="node-tag"
                    >
                      {{ data.customerCount }}
                    </el-tag>
                  </div>
                  
                  <div class="node-actions">
                    <el-dropdown @command="(command) => handleGroupCommand(command, data)">
                      <el-button :icon="MoreFilled" size="small" text />
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item command="view">查看详情</el-dropdown-item>
                          <el-dropdown-item command="edit">编辑分组</el-dropdown-item>
                          <el-dropdown-item command="duplicate">复制分组</el-dropdown-item>
                          <el-dropdown-item command="refresh" v-if="data.type === 'dynamic'">
                            刷新数据
                          </el-dropdown-item>
                          <el-dropdown-item command="export">导出客户</el-dropdown-item>
                          <el-dropdown-item command="delete" divided>删除分组</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                </div>
              </template>
            </el-tree>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧分组详情 -->
      <el-col :span="16">
        <el-card class="group-detail-card" v-if="selectedGroup">
          <template #header>
            <div class="card-header">
              <div class="group-header-info">
                <el-icon class="group-icon">
                  <component :is="getGroupIcon(selectedGroup.type)" />
                </el-icon>
                <div class="group-info">
                  <h3 class="group-name">{{ selectedGroup.name }}</h3>
                  <div class="group-meta">
                    <el-tag :type="getGroupTagType(selectedGroup.type)" size="small">
                      {{ getGroupTypeLabel(selectedGroup.type) }}
                    </el-tag>
                    <span class="group-count">{{ selectedGroup.customerCount }}个客户</span>
                    <span class="group-update">更新于{{ formatDateTime(selectedGroup.updatedAt) }}</span>
                  </div>
                </div>
              </div>
              
              <div class="header-actions">
                <el-button @click="editGroup(selectedGroup)" :icon="Edit" size="small">
                  编辑
                </el-button>
                <el-button @click="refreshGroup(selectedGroup)" :icon="Refresh" size="small" v-if="selectedGroup.type === 'dynamic'">
                  刷新
                </el-button>
                <el-button @click="createCampaign(selectedGroup)" :icon="Promotion" type="primary" size="small">
                  创建营销活动
                </el-button>
              </div>
            </div>
          </template>

          <!-- 分组描述和规则 -->
          <div class="group-description" v-if="selectedGroup.description">
            <h4>分组描述</h4>
            <p>{{ selectedGroup.description }}</p>
          </div>

          <!-- 动态分组规则 -->
          <div class="group-rules" v-if="selectedGroup.type === 'dynamic' && selectedGroup.rules">
            <h4>筛选规则</h4>
            <div class="rule-display">
              <div 
                v-for="(rule, index) in selectedGroup.rules" 
                :key="index"
                class="rule-item"
              >
                <el-tag type="info" class="rule-field">{{ getRuleFieldLabel(rule.field) }}</el-tag>
                <span class="rule-operator">{{ getRuleOperatorLabel(rule.operator) }}</span>
                <el-tag class="rule-value">{{ rule.value }}</el-tag>
                <span v-if="index < selectedGroup.rules.length - 1" class="rule-connector">且</span>
              </div>
            </div>
          </div>

          <!-- 客户列表 -->
          <div class="group-customers">
            <div class="customers-header">
              <h4>分组客户</h4>
              <div class="customers-actions">
                <el-input
                  v-model="customerSearchKeyword"
                  placeholder="搜索客户"
                  :prefix-icon="Search"
                  size="small"
                  style="width: 200px;"
                  clearable
                />
                <el-button @click="addCustomersToGroup" :icon="Plus" size="small">
                  添加客户
                </el-button>
                <el-button @click="exportGroupCustomers" :icon="Download" size="small">
                  导出列表
                </el-button>
              </div>
            </div>

            <!-- 客户表格 -->
            <el-table 
              :data="filteredCustomers" 
              v-loading="loadingCustomers"
              @selection-change="handleCustomerSelection"
              height="400"
            >
              <el-table-column type="selection" width="50" />
              
              <el-table-column label="客户" width="200">
                <template #default="scope">
                  <div class="customer-info">
                    <el-avatar :src="scope.row.avatar" :size="32">
                      {{ scope.row.name.charAt(0) }}
                    </el-avatar>
                    <div class="customer-details">
                      <div class="customer-name">{{ scope.row.name }}</div>
                      <div class="customer-email">{{ scope.row.email }}</div>
                    </div>
                  </div>
                </template>
              </el-table-column>

              <el-table-column prop="company" label="公司" width="150" show-overflow-tooltip />
              
              <el-table-column label="状态" width="80">
                <template #default="scope">
                  <el-tag :type="getCustomerStatusType(scope.row.status)" size="small">
                    {{ getCustomerStatusLabel(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column label="等级" width="80">
                <template #default="scope">
                  <el-tag :type="getCustomerLevelType(scope.row.level)" size="small">
                    {{ getCustomerLevelLabel(scope.row.level) }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column prop="joinDate" label="加入时间" width="120">
                <template #default="scope">
                  {{ formatDate(scope.row.joinDate) }}
                </template>
              </el-table-column>

              <el-table-column label="操作" width="120" fixed="right">
                <template #default="scope">
                  <el-button @click="viewCustomer(scope.row)" size="small" text>查看</el-button>
                  <el-button 
                    @click="removeCustomerFromGroup(scope.row)" 
                    size="small" 
                    text 
                    type="danger"
                    v-if="selectedGroup.type === 'static'"
                  >
                    移除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 批量操作工具栏 -->
            <div v-if="selectedCustomers.length > 0" class="batch-toolbar">
              <span class="selected-count">已选择 {{ selectedCustomers.length }} 个客户</span>
              <el-button @click="batchRemoveFromGroup" size="small" type="danger">
                批量移除
              </el-button>
              <el-button @click="batchCreateCampaign" size="small" type="primary">
                创建活动
              </el-button>
            </div>

            <!-- 分页 -->
            <div class="pagination-wrapper">
              <el-pagination
                v-model:current-page="customerPagination.currentPage"
                v-model:page-size="customerPagination.pageSize"
                :page-sizes="[10, 20, 50]"
                :total="customerPagination.total"
                layout="total, sizes, prev, pager, next"
                @size-change="handleCustomerPageSizeChange"
                @current-change="handleCustomerPageChange"
              />
            </div>
          </div>
        </el-card>

        <!-- 空状态 -->
        <el-card class="empty-state-card" v-else>
          <el-empty description="请选择一个分组查看详情">
            <el-button @click="showCreateDialog = true" type="primary">创建第一个分组</el-button>
          </el-empty>
        </el-card>
      </el-col>
    </el-row>

    <!-- 创建/编辑分组对话框 -->
    <el-dialog 
      v-model="showCreateDialog"
      :title="editingGroup ? '编辑分组' : '创建分组'"
      width="60%"
      destroy-on-close
    >
      <el-form 
        :model="groupForm" 
        :rules="groupRules"
        ref="groupFormRef"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分组名称" prop="name">
              <el-input v-model="groupForm.name" placeholder="请输入分组名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分组类型" prop="type">
              <el-radio-group v-model="groupForm.type" @change="handleTypeChange">
                <el-radio label="static">静态分组</el-radio>
                <el-radio label="dynamic">动态分组</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="分组描述">
          <el-input 
            v-model="groupForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入分组描述"
          />
        </el-form-item>

        <!-- 动态分组规则配置 -->
        <div v-if="groupForm.type === 'dynamic'" class="dynamic-rules">
          <el-form-item label="筛选规则">
            <div class="rules-builder">
              <div 
                v-for="(rule, index) in groupForm.rules" 
                :key="index"
                class="rule-builder-item"
              >
                <el-select v-model="rule.field" placeholder="选择字段" style="width: 150px;">
                  <el-option label="客户状态" value="status" />
                  <el-option label="客户等级" value="level" />
                  <el-option label="客户来源" value="source" />
                  <el-option label="所属地区" value="region" />
                  <el-option label="注册时间" value="createTime" />
                  <el-option label="最后活跃" value="lastActive" />
                  <el-option label="订单数量" value="orderCount" />
                  <el-option label="总消费" value="totalSpent" />
                </el-select>

                <el-select v-model="rule.operator" placeholder="选择条件" style="width: 120px;">
                  <el-option label="等于" value="equals" />
                  <el-option label="不等于" value="not_equals" />
                  <el-option label="包含" value="contains" />
                  <el-option label="大于" value="greater" />
                  <el-option label="小于" value="less" />
                  <el-option label="大于等于" value="greater_equal" />
                  <el-option label="小于等于" value="less_equal" />
                </el-select>

                <el-input 
                  v-model="rule.value" 
                  placeholder="输入值" 
                  style="width: 150px;"
                />

                <el-button @click="removeRule(index)" :icon="Delete" size="small" text />
              </div>

              <el-button @click="addRule" :icon="Plus" size="small" type="primary" text>
                添加规则
              </el-button>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button @click="previewDynamicGroup" :loading="previewing">
              预览结果 ({{ previewCount }}个客户)
            </el-button>
          </el-form-item>
        </div>

        <!-- 静态分组客户选择 -->
        <div v-if="groupForm.type === 'static'" class="static-customers">
          <el-form-item label="选择客户">
            <el-transfer
              v-model="groupForm.customerIds"
              :data="availableCustomers"
              :titles="['可选客户', '已选客户']"
              :button-texts="['移除', '添加']"
              :format="{
                noChecked: '${total}',
                hasChecked: '${checked}/${total}'
              }"
              filterable
              :filter-placeholder="'搜索客户'"
              style="text-align: left; display: inline-block"
            />
          </el-form-item>
        </div>

        <!-- 分组共享设置 -->
        <el-form-item label="共享设置">
          <el-radio-group v-model="groupForm.shareType">
            <el-radio label="private">仅自己可见</el-radio>
            <el-radio label="team">团队共享</el-radio>
            <el-radio label="public">公开分组</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 团队成员选择 -->
        <el-form-item label="共享成员" v-if="groupForm.shareType === 'team'">
          <el-select 
            v-model="groupForm.sharedUsers" 
            multiple 
            placeholder="选择团队成员"
            style="width: 100%;"
          >
            <el-option 
              v-for="user in teamMembers" 
              :key="user.id"
              :label="user.name" 
              :value="user.id" 
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="saveGroup" :loading="saving">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量操作对话框 -->
    <el-dialog v-model="showBatchOperationDialog" title="批量操作" width="50%">
      <div class="batch-operations">
        <h4>选择操作类型</h4>
        <el-radio-group v-model="batchOperationType">
          <el-radio label="merge">合并分组</el-radio>
          <el-radio label="intersect">分组交集</el-radio>
          <el-radio label="union">分组并集</el-radio>
          <el-radio label="difference">分组差集</el-radio>
        </el-radio-group>

        <div class="operation-config" v-if="batchOperationType">
          <h4>选择分组</h4>
          <el-checkbox-group v-model="selectedGroupsForOperation">
            <el-checkbox 
              v-for="group in customerGroups" 
              :key="group.id"
              :label="group.id"
            >
              {{ group.name }} ({{ group.customerCount }}个客户)
            </el-checkbox>
          </el-checkbox-group>

          <div class="new-group-name">
            <h4>新分组名称</h4>
            <el-input 
              v-model="newGroupName" 
              placeholder="输入新分组名称"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showBatchOperationDialog = false">取消</el-button>
          <el-button type="primary" @click="executeBatchOperation">
            执行操作
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加客户到分组对话框 -->
    <el-dialog v-model="showAddCustomerDialog" title="添加客户到分组" width="70%">
      <div class="add-customer-content">
        <div class="search-section">
          <el-input
            v-model="customerSearchTerm"
            placeholder="搜索客户姓名、邮箱或公司"
            :prefix-icon="Search"
            style="margin-bottom: 20px;"
          />
        </div>

        <el-table 
          :data="searchCustomerResults" 
          @selection-change="handleAddCustomerSelection"
          height="400"
        >
          <el-table-column type="selection" width="50" />
          
          <el-table-column label="客户" width="250">
            <template #default="scope">
              <div class="customer-info">
                <el-avatar :src="scope.row.avatar" :size="32">
                  {{ scope.row.name.charAt(0) }}
                </el-avatar>
                <div class="customer-details">
                  <div class="customer-name">{{ scope.row.name }}</div>
                  <div class="customer-email">{{ scope.row.email }}</div>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="company" label="公司" show-overflow-tooltip />
          
          <el-table-column label="状态" width="80">
            <template #default="scope">
              <el-tag :type="getCustomerStatusType(scope.row.status)" size="small">
                {{ getCustomerStatusLabel(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="等级" width="80">
            <template #default="scope">
              <el-tag :type="getCustomerLevelType(scope.row.level)" size="small">
                {{ getCustomerLevelLabel(scope.row.level) }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddCustomerDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmAddCustomers">
            添加选中客户
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Search, Edit, Refresh, Delete, MoreFilled, Collection, User, 
  UserFilled, Promotion, Download, Operation
} from '@element-plus/icons-vue'

const router = useRouter()

// 页面状态
const showCreateDialog = ref(false)
const showBatchOperationDialog = ref(false)
const showAddCustomerDialog = ref(false)
const loadingCustomers = ref(false)
const saving = ref(false)
const previewing = ref(false)
const editingGroup = ref(null)

// 搜索关键词
const searchKeyword = ref('')
const customerSearchKeyword = ref('')
const customerSearchTerm = ref('')

// 筛选器
const groupTypeFilter = ref('all')

// 选中的分组和客户
const selectedGroup = ref(null)
const selectedCustomers = ref([])
const selectedGroupsForOperation = ref([])
const customersToAdd = ref([])

// 统计数据
const groupStats = ref({
  totalGroups: 24,
  staticGroups: 16,
  dynamicGroups: 8,
  totalCustomers: 1248
})

// 分组数据
const customerGroups = ref([
  {
    id: 1,
    name: 'VIP客户',
    type: 'static',
    customerCount: 156,
    description: '重要VIP客户群体',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-08-15'),
    shareType: 'team',
    sharedUsers: [1, 2],
    customerIds: [1, 2, 3, 4, 5]
  },
  {
    id: 2,
    name: '高价值客户',
    type: 'dynamic',
    customerCount: 89,
    description: '总消费超过$10000的客户',
    rules: [
      { field: 'totalSpent', operator: 'greater', value: '10000' },
      { field: 'status', operator: 'equals', value: 'active' }
    ],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-08-14'),
    shareType: 'public'
  },
  {
    id: 3,
    name: '新注册用户',
    type: 'dynamic',
    customerCount: 234,
    description: '最近30天注册的新用户',
    rules: [
      { field: 'createTime', operator: 'greater', value: '30' }
    ],
    createdAt: new Date('2024-07-15'),
    updatedAt: new Date('2024-08-15'),
    shareType: 'private'
  },
  {
    id: 4,
    name: '流失客户',
    type: 'dynamic',
    customerCount: 67,
    description: '180天内无活跃行为的客户',
    rules: [
      { field: 'lastActive', operator: 'less', value: '180' }
    ],
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-08-10'),
    shareType: 'team',
    sharedUsers: [1, 3]
  }
])

// 客户数据
const groupCustomers = ref([])

// 批量操作
const batchOperationType = ref('')
const newGroupName = ref('')
const previewCount = ref(0)

// 团队成员
const teamMembers = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' }
])

// 可选客户数据
const availableCustomers = ref([])
const searchCustomerResults = ref([])

// 分页
const customerPagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 表单数据
const groupForm = reactive({
  name: '',
  type: 'static',
  description: '',
  rules: [],
  customerIds: [],
  shareType: 'private',
  sharedUsers: []
})

// 表单验证规则
const groupRules = {
  name: [
    { required: true, message: '请输入分组名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择分组类型', trigger: 'change' }
  ]
}

// 树形结构配置
const treeProps = {
  children: 'children',
  label: 'name',
  value: 'id'
}

// 计算属性
const filteredGroups = computed(() => {
  let groups = customerGroups.value

  // 按类型筛选
  if (groupTypeFilter.value !== 'all') {
    groups = groups.filter(group => group.type === groupTypeFilter.value)
  }

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    groups = groups.filter(group => 
      group.name.toLowerCase().includes(keyword) ||
      (group.description && group.description.toLowerCase().includes(keyword))
    )
  }

  return groups
})

const filteredCustomers = computed(() => {
  if (!groupCustomers.value.length) return []
  
  if (customerSearchKeyword.value) {
    const keyword = customerSearchKeyword.value.toLowerCase()
    return groupCustomers.value.filter(customer => 
      customer.name.toLowerCase().includes(keyword) ||
      customer.email.toLowerCase().includes(keyword) ||
      (customer.company && customer.company.toLowerCase().includes(keyword))
    )
  }
  
  return groupCustomers.value
})

// 生成模拟客户数据
const generateMockCustomers = (count = 20) => {
  const customers = []
  const names = ['张伟', '李娜', '王强', 'John Smith', 'Mary Johnson', 'David Wilson']
  const companies = ['阿里巴巴', 'Google', 'Microsoft', 'Apple', 'Amazon', 'Facebook']
  const statuses = ['active', 'inactive', 'potential']
  const levels = ['vip', 'important', 'normal', 'new']

  for (let i = 0; i < count; i++) {
    customers.push({
      id: i + 1,
      name: names[Math.floor(Math.random() * names.length)],
      email: `user${i + 1}@example.com`,
      company: companies[Math.floor(Math.random() * companies.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      level: levels[Math.floor(Math.random() * levels.length)],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
      joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
    })
  }
  return customers
}

// 方法
const selectGroup = (group) => {
  selectedGroup.value = group
  loadGroupCustomers(group)
}

const loadGroupCustomers = async (group) => {
  loadingCustomers.value = true
  // 模拟加载客户数据
  setTimeout(() => {
    groupCustomers.value = generateMockCustomers(group.customerCount)
    customerPagination.total = group.customerCount
    loadingCustomers.value = false
  }, 500)
}

const getGroupIcon = (type) => {
  const icons = {
    'static': 'User',
    'dynamic': 'Refresh',
    'system': 'Setting'
  }
  return icons[type] || 'Collection'
}

const getGroupTagType = (type) => {
  const types = {
    'static': 'info',
    'dynamic': 'success',
    'system': 'warning'
  }
  return types[type] || 'info'
}

const getGroupTypeLabel = (type) => {
  const labels = {
    'static': '静态分组',
    'dynamic': '动态分组',
    'system': '系统分组'
  }
  return labels[type] || type
}

const getRuleFieldLabel = (field) => {
  const labels = {
    'status': '客户状态',
    'level': '客户等级',
    'source': '客户来源',
    'region': '所属地区',
    'createTime': '注册时间',
    'lastActive': '最后活跃',
    'orderCount': '订单数量',
    'totalSpent': '总消费'
  }
  return labels[field] || field
}

const getRuleOperatorLabel = (operator) => {
  const labels = {
    'equals': '等于',
    'not_equals': '不等于',
    'contains': '包含',
    'greater': '大于',
    'less': '小于',
    'greater_equal': '大于等于',
    'less_equal': '小于等于'
  }
  return labels[operator] || operator
}

const getCustomerStatusType = (status) => {
  const types = {
    'active': 'success',
    'inactive': 'warning',
    'potential': 'info'
  }
  return types[status] || 'info'
}

const getCustomerStatusLabel = (status) => {
  const labels = {
    'active': '活跃',
    'inactive': '非活跃',
    'potential': '潜在客户'
  }
  return labels[status] || status
}

const getCustomerLevelType = (level) => {
  const types = {
    'vip': 'danger',
    'important': 'warning',
    'normal': 'info',
    'new': 'success'
  }
  return types[level] || 'info'
}

const getCustomerLevelLabel = (level) => {
  const labels = {
    'vip': 'VIP',
    'important': '重要',
    'normal': '普通',
    'new': '新客户'
  }
  return labels[level] || level
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

// 分组操作
const handleGroupCommand = async (command, group) => {
  switch (command) {
    case 'view':
      selectGroup(group)
      break
    case 'edit':
      editGroup(group)
      break
    case 'duplicate':
      duplicateGroup(group)
      break
    case 'refresh':
      refreshGroup(group)
      break
    case 'export':
      exportGroupCustomers(group)
      break
    case 'delete':
      await deleteGroup(group)
      break
  }
}

const editGroup = (group) => {
  editingGroup.value = group
  Object.assign(groupForm, {
    name: group.name,
    type: group.type,
    description: group.description || '',
    rules: group.rules ? [...group.rules] : [],
    customerIds: group.customerIds || [],
    shareType: group.shareType || 'private',
    sharedUsers: group.sharedUsers || []
  })
  showCreateDialog.value = true
}

const duplicateGroup = (group) => {
  const newGroup = {
    ...group,
    id: Date.now(),
    name: `${group.name} - 副本`,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  customerGroups.value.push(newGroup)
  ElMessage.success('分组复制成功')
}

const refreshGroup = async (group) => {
  if (group.type === 'dynamic') {
    ElMessage.loading('正在刷新动态分组数据...')
    // 模拟刷新
    setTimeout(() => {
      group.updatedAt = new Date()
      group.customerCount = Math.floor(Math.random() * 200) + 50
      ElMessage.success('动态分组数据刷新成功')
    }, 2000)
  }
}

const deleteGroup = async (group) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除分组"${group.name}"吗？`,
      '确认删除',
      { type: 'warning' }
    )
    
    const index = customerGroups.value.findIndex(g => g.id === group.id)
    if (index > -1) {
      customerGroups.value.splice(index, 1)
    }
    
    if (selectedGroup.value && selectedGroup.value.id === group.id) {
      selectedGroup.value = null
      groupCustomers.value = []
    }
    
    ElMessage.success('分组删除成功')
  } catch {
    // 用户取消
  }
}

// 表单操作
const handleTypeChange = (type) => {
  if (type === 'dynamic') {
    groupForm.rules = [{ field: '', operator: '', value: '' }]
    groupForm.customerIds = []
  } else {
    groupForm.rules = []
  }
}

const addRule = () => {
  groupForm.rules.push({ field: '', operator: '', value: '' })
}

const removeRule = (index) => {
  groupForm.rules.splice(index, 1)
}

const previewDynamicGroup = async () => {
  previewing.value = true
  // 模拟预览
  setTimeout(() => {
    previewCount.value = Math.floor(Math.random() * 200) + 10
    previewing.value = false
  }, 1000)
}

const saveGroup = async () => {
  saving.value = true
  
  try {
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (editingGroup.value) {
      // 编辑模式
      Object.assign(editingGroup.value, groupForm)
      editingGroup.value.updatedAt = new Date()
      ElMessage.success('分组更新成功')
    } else {
      // 新建模式
      const newGroup = {
        ...groupForm,
        id: Date.now(),
        customerCount: groupForm.type === 'static' ? 
          groupForm.customerIds.length : previewCount.value,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      customerGroups.value.push(newGroup)
      ElMessage.success('分组创建成功')
    }
    
    showCreateDialog.value = false
    resetForm()
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const resetForm = () => {
  Object.assign(groupForm, {
    name: '',
    type: 'static',
    description: '',
    rules: [],
    customerIds: [],
    shareType: 'private',
    sharedUsers: []
  })
  editingGroup.value = null
  previewCount.value = 0
}

// 客户操作
const handleCustomerSelection = (selection) => {
  selectedCustomers.value = selection
}

const handleAddCustomerSelection = (selection) => {
  customersToAdd.value = selection
}

const addCustomersToGroup = () => {
  if (selectedGroup.value && selectedGroup.value.type === 'static') {
    searchCustomerResults.value = generateMockCustomers(50)
    showAddCustomerDialog.value = true
  } else {
    ElMessage.warning('只有静态分组可以手动添加客户')
  }
}

const confirmAddCustomers = () => {
  if (customersToAdd.value.length > 0) {
    // 添加客户到分组
    groupCustomers.value.push(...customersToAdd.value)
    selectedGroup.value.customerCount += customersToAdd.value.length
    customerPagination.total += customersToAdd.value.length
    
    showAddCustomerDialog.value = false
    customersToAdd.value = []
    ElMessage.success(`成功添加 ${customersToAdd.value.length} 个客户到分组`)
  }
}

const removeCustomerFromGroup = async (customer) => {
  try {
    await ElMessageBox.confirm(
      `确定要将"${customer.name}"从分组中移除吗？`,
      '确认移除',
      { type: 'warning' }
    )
    
    const index = groupCustomers.value.findIndex(c => c.id === customer.id)
    if (index > -1) {
      groupCustomers.value.splice(index, 1)
      selectedGroup.value.customerCount -= 1
      customerPagination.total -= 1
    }
    
    ElMessage.success('客户移除成功')
  } catch {
    // 用户取消
  }
}

const batchRemoveFromGroup = async () => {
  if (selectedCustomers.value.length === 0) return
  
  try {
    await ElMessageBox.confirm(
      `确定要移除选中的 ${selectedCustomers.value.length} 个客户吗？`,
      '批量移除',
      { type: 'warning' }
    )
    
    const removeIds = selectedCustomers.value.map(c => c.id)
    groupCustomers.value = groupCustomers.value.filter(c => !removeIds.includes(c.id))
    selectedGroup.value.customerCount -= selectedCustomers.value.length
    customerPagination.total -= selectedCustomers.value.length
    selectedCustomers.value = []
    
    ElMessage.success('批量移除成功')
  } catch {
    // 用户取消
  }
}

const viewCustomer = (customer) => {
  router.push(`/customer-center/detail/${customer.id}`)
}

const exportGroupCustomers = () => {
  ElMessage.success('客户列表导出成功')
}

const createCampaign = (group) => {
  ElMessage.info(`为分组"${group.name}"创建营销活动`)
}

const batchCreateCampaign = () => {
  ElMessage.info(`为选中的 ${selectedCustomers.value.length} 个客户创建营销活动`)
}

// 批量操作
const executeBatchOperation = async () => {
  if (!batchOperationType.value || selectedGroupsForOperation.value.length < 2) {
    ElMessage.warning('请选择操作类型和至少2个分组')
    return
  }
  
  if (!newGroupName.value.trim()) {
    ElMessage.warning('请输入新分组名称')
    return
  }
  
  // 模拟批量操作
  const selectedGroups = customerGroups.value.filter(g => 
    selectedGroupsForOperation.value.includes(g.id)
  )
  
  const newGroup = {
    id: Date.now(),
    name: newGroupName.value,
    type: 'static',
    customerCount: Math.floor(Math.random() * 100) + 20,
    description: `通过${getOperationLabel(batchOperationType.value)}生成`,
    createdAt: new Date(),
    updatedAt: new Date(),
    shareType: 'private'
  }
  
  customerGroups.value.push(newGroup)
  
  showBatchOperationDialog.value = false
  resetBatchOperation()
  ElMessage.success('批量操作执行成功')
}

const getOperationLabel = (operation) => {
  const labels = {
    'merge': '合并分组',
    'intersect': '分组交集',
    'union': '分组并集',
    'difference': '分组差集'
  }
  return labels[operation] || operation
}

const resetBatchOperation = () => {
  batchOperationType.value = ''
  selectedGroupsForOperation.value = []
  newGroupName.value = ''
}

// 分页处理
const handleCustomerPageSizeChange = (size) => {
  customerPagination.pageSize = size
  if (selectedGroup.value) {
    loadGroupCustomers(selectedGroup.value)
  }
}

const handleCustomerPageChange = (page) => {
  customerPagination.currentPage = page
  if (selectedGroup.value) {
    loadGroupCustomers(selectedGroup.value)
  }
}

// 监听搜索关键词变化
watch(customerSearchTerm, (newTerm) => {
  if (newTerm) {
    // 模拟搜索
    setTimeout(() => {
      searchCustomerResults.value = generateMockCustomers(20).filter(customer =>
        customer.name.toLowerCase().includes(newTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(newTerm.toLowerCase()) ||
        (customer.company && customer.company.toLowerCase().includes(newTerm.toLowerCase()))
      )
    }, 300)
  } else {
    searchCustomerResults.value = generateMockCustomers(50)
  }
})

onMounted(() => {
  // 初始化数据
  availableCustomers.value = generateMockCustomers(100).map(customer => ({
    key: customer.id,
    label: `${customer.name} (${customer.email})`,
    disabled: false
  }))
  
  // 默认选择第一个分组
  if (customerGroups.value.length > 0) {
    selectGroup(customerGroups.value[0])
  }
})

// 对话框关闭时重置表单
watch(showCreateDialog, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})

watch(showBatchOperationDialog, (newVal) => {
  if (!newVal) {
    resetBatchOperation()
  }
})
</script>

<style lang="scss" scoped>
.customer-group-page {
  padding: 20px;
  background-color: #f5f7fa;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  
  .header-left {
    h1 {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 8px 0;
    }
    
    .page-desc {
      color: #606266;
      font-size: 14px;
      margin: 0;
    }
  }
  
  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.overview-cards {
  margin-bottom: 24px;
  
  .overview-card {
    text-align: center;
    
    .statistic-icon {
      color: #409eff;
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .group-header-info {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .group-icon {
      font-size: 24px;
      color: #409eff;
    }
    
    .group-info {
      .group-name {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
        margin: 0 0 8px 0;
      }
      
      .group-meta {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .group-count, .group-update {
          color: #606266;
          font-size: 14px;
        }
      }
    }
  }
  
  .header-actions {
    display: flex;
    gap: 8px;
  }
}

.group-list-card {
  height: 800px;
  
  .group-filters {
    margin-bottom: 16px;
  }
  
  .group-tree-container {
    height: calc(100% - 120px);
    overflow-y: auto;
    
    .group-tree {
      .tree-node {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding-right: 8px;
        
        .node-content {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          
          .node-icon {
            color: #606266;
          }
          
          .node-label {
            font-weight: 500;
          }
          
          .node-tag {
            margin-left: auto;
          }
        }
        
        .node-actions {
          opacity: 0;
          transition: opacity 0.3s;
        }
        
        &:hover .node-actions {
          opacity: 1;
        }
      }
    }
  }
}

.group-detail-card {
  min-height: 800px;
  
  .group-description {
    margin-bottom: 24px;
    
    h4 {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 8px 0;
    }
    
    p {
      color: #606266;
      margin: 0;
      line-height: 1.6;
    }
  }
  
  .group-rules {
    margin-bottom: 24px;
    
    h4 {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 12px 0;
    }
    
    .rule-display {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      
      .rule-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background-color: #f5f7fa;
        border-radius: 6px;
        
        .rule-field {
          background-color: #409eff;
          color: white;
          border: none;
        }
        
        .rule-operator {
          font-size: 12px;
          color: #606266;
        }
        
        .rule-value {
          background-color: #67c23a;
          color: white;
          border: none;
        }
        
        .rule-connector {
          font-size: 12px;
          color: #909399;
          margin: 0 4px;
        }
      }
    }
  }
  
  .group-customers {
    .customers-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      
      h4 {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
        margin: 0;
      }
      
      .customers-actions {
        display: flex;
        gap: 8px;
      }
    }
    
    .customer-info {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .customer-details {
        .customer-name {
          font-weight: 500;
          color: #303133;
          margin-bottom: 4px;
        }
        
        .customer-email {
          font-size: 12px;
          color: #909399;
        }
      }
    }
    
    .batch-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background-color: #f0f9ff;
      border-radius: 6px;
      margin: 16px 0;
      
      .selected-count {
        color: #409eff;
        font-weight: 500;
      }
    }
    
    .pagination-wrapper {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
  }
}

.empty-state-card {
  height: 800px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dynamic-rules {
  .rules-builder {
    .rule-builder-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      padding: 12px;
      background-color: #f5f7fa;
      border-radius: 6px;
    }
  }
}

.static-customers {
  .el-transfer {
    .el-transfer-panel {
      width: 250px;
    }
  }
}

.batch-operations {
  .operation-config {
    margin-top: 20px;
    
    .new-group-name {
      margin-top: 20px;
    }
    
    h4 {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 12px 0;
    }
  }
}

.add-customer-content {
  .search-section {
    margin-bottom: 20px;
  }
  
  .customer-info {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .customer-details {
      .customer-name {
        font-weight: 500;
        color: #303133;
        margin-bottom: 4px;
      }
      
      .customer-email {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}

@media (max-width: 768px) {
  .customer-group-page {
    padding: 12px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    
    .header-actions {
      width: 100%;
      justify-content: flex-start;
    }
  }
  
  .overview-cards {
    .el-col {
      margin-bottom: 16px;
    }
  }
  
  .el-row {
    margin: 0 !important;
  }
  
  .el-col {
    padding: 0 !important;
    
    &:first-child {
      margin-bottom: 20px;
    }
  }
  
  .group-list-card, .group-detail-card {
    height: auto;
    min-height: 500px;
  }
  
  .customers-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start !important;
    
    .customers-actions {
      width: 100%;
      justify-content: flex-start;
      flex-wrap: wrap;
    }
  }
}
</style>