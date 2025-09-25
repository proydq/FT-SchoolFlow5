<template>
  <div class="account-management-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h2>账号管理</h2>
        <div class="header-actions">
          <el-button @click="handleImport">
            <el-icon><Upload /></el-icon>
            批量导入
          </el-button>
          <el-button @click="handleExport">
            <el-icon><Download /></el-icon>
            导出账号
          </el-button>
          <el-button type="primary" @click="createAccount">
            <el-icon><Plus /></el-icon>
            新增账号
          </el-button>
        </div>
      </div>
    </div>

    <!-- 筛选和统计 -->
    <div class="filter-section">
      <div class="filter-content">
        <div class="filter-left">
          <el-input
            v-model="searchQuery"
            placeholder="搜索账号名"
            prefix-icon="Search"
            style="width: 300px"
            @keyup.enter="handleSearch"
            @change="handleSearch"
          />
          <el-select v-model="statusFilter" placeholder="状态" style="width: 120px" @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="正常" value="active" />
            <el-option label="禁用" value="disabled" />
            <el-option label="锁定" value="locked" />
          </el-select>
          <el-select v-model="roleFilter" placeholder="角色" style="width: 150px" @change="handleFilter">
            <el-option label="全部角色" value="" />
            <el-option v-for="role in roles" :key="role.id" :label="role.name" :value="role.id" />
          </el-select>
          <el-select v-model="assignmentFilter" placeholder="分配状态" style="width: 130px" @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="已分配" value="assigned" />
            <el-option label="未分配" value="unassigned" />
          </el-select>
        </div>
        <div class="filter-right">
          <div class="stats-item">
            <span class="label">总账号数:</span>
            <span class="value">{{ totalAccounts }}</span>
          </div>
          <div class="stats-item">
            <span class="label">已分配:</span>
            <span class="value assigned">{{ assignedCount }}</span>
          </div>
          <div class="stats-item">
            <span class="label">未分配:</span>
            <span class="value unassigned">{{ unassignedCount }}</span>
          </div>
          <div class="stats-item">
            <span class="label">禁用:</span>
            <span class="value disabled">{{ disabledCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 账号列表 -->
    <div class="account-list-section">
      <el-table
        :data="filteredAccounts"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        row-key="id"
        v-loading="loading"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" sortable />
        <el-table-column label="账号" min-width="180">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 10px;">
              <el-avatar
                :size="32"
                :src="row.avatar"
                shape="circle"
              >
                {{ !row.avatar ? row.username.charAt(0).toUpperCase() : '' }}
              </el-avatar>
              <span>{{ row.username }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="assignedPerson" label="分配人员" min-width="180">
          <template #default="{ row }">
            <div v-if="row.assignedPerson" class="assigned-person">
              <el-avatar :size="30" :src="row.assignedPerson.avatar">
                {{ row.assignedPerson.name.charAt(0) }}
              </el-avatar>
              <div class="person-info">
                <div class="name">{{ row.assignedPerson.name }}</div>
                <div class="department">{{ row.assignedPerson.department }}</div>
              </div>
            </div>
            <el-tag v-else type="info" size="small">未分配</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="roles" label="角色权限" min-width="200">
          <template #default="{ row }">
            <el-tag v-for="role in row.roles" :key="role.id" size="small" style="margin-right: 4px">
              {{ role.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLogin" label="最后登录" min-width="180" sortable />
        <el-table-column prop="createTime" label="创建时间" min-width="180" sortable />
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="{ row }">
            <div class="operation-buttons">
              <el-button size="small" @click="viewAccount(row)">查看</el-button>
              <el-button size="small" type="primary" @click="editAccount(row)">编辑</el-button>
              <el-button
                size="small"
                :type="row.assignedPerson ? 'warning' : 'success'"
                @click="manageAssignment(row)"
              >
                {{ row.assignedPerson ? '重新分配' : '分配人员' }}
              </el-button>
              <el-dropdown trigger="click">
                <el-button size="small" type="info">
                  更多<el-icon><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="showResetPasswordDialog(row)">重置密码</el-dropdown-item>
                    <el-dropdown-item @click="toggleAccountStatus(row)">
                      {{ row.status === 'active' ? '禁用' : '启用' }}
                    </el-dropdown-item>
                    <el-dropdown-item @click="viewLogs(row)">操作日志</el-dropdown-item>
                    <el-dropdown-item v-if="row.assignedPerson" @click="unassignAccount(row)">
                      解除分配
                    </el-dropdown-item>
                    <el-dropdown-item divided @click="deleteAccount(row)">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 批量操作 -->
      <div v-if="selectedAccounts.length > 0" class="batch-actions">
        <div class="batch-info">
          已选择 {{ selectedAccounts.length }} 个账号
        </div>
        <div class="batch-buttons">
          <el-button @click="batchEnable">批量启用</el-button>
          <el-button @click="batchDisable">批量禁用</el-button>
          <el-button @click="batchAssignRole">分配角色</el-button>
          <el-button @click="batchUnassign">批量解除分配</el-button>
          <el-button type="danger" @click="batchDelete">批量删除</el-button>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalAccounts"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 创建/编辑账号对话框 -->
    <el-dialog
      v-model="accountDialogVisible"
      :title="editingAccount ? '编辑账号' : '新增账号'"
      width="900px"
      :close-on-click-modal="false"
      destroy-on-close
      class="account-dialog"
    >
      <div class="account-form-layout">
        <el-form
          :model="accountForm"
          :rules="accountRules"
          ref="accountFormRef"
          label-width="100px"
          label-position="right"
        >
          <!-- 基本信息卡片 -->
          <div class="info-card">
            <div class="card-header">
              <el-icon class="card-icon"><User /></el-icon>
              <span class="card-title">基本信息</span>
            </div>
            <div class="card-content">
              <div class="content-with-avatar">
                <!-- 头像上传区域 -->
                <div class="avatar-section">
                  <el-upload
                    v-model:file-list="avatarFileList"
                    :action="uploadAction"
                    :show-file-list="false"
                    :before-upload="beforeAvatarUpload"
                    accept="image/*"
                    class="avatar-uploader"
                  >
                    <div class="avatar-container">
                      <el-avatar
                        v-if="accountForm.avatar"
                        :size="120"
                        :src="accountForm.avatar"
                        shape="circle"
                      />
                      <div v-else class="avatar-placeholder">
                        <el-icon :size="40"><User /></el-icon>
                        <span>点击上传头像</span>
                      </div>
                    </div>
                  </el-upload>
                  <div class="avatar-tips">建议尺寸：120x120px</div>
                </div>

                <!-- 基本信息表单 -->
                <div class="basic-form">
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="账号名" prop="username">
                        <el-input
                          v-model="accountForm.username"
                          placeholder="请输入账号名"
                          :disabled="editingAccount"
                        />
                      </el-form-item>
                    </el-col>
                    <el-col :span="12" v-if="!editingAccount">
                      <el-form-item label="密码" prop="password">
                        <el-input
                          v-model="accountForm.password"
                          type="password"
                          placeholder="请输入密码"
                          show-password
                        />
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-row :gutter="20">
                    <el-col :span="24">
                      <el-form-item label="状态">
                        <el-radio-group v-model="accountForm.status">
                          <el-radio label="active">正常</el-radio>
                          <el-radio label="disabled">禁用</el-radio>
                        </el-radio-group>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </div>
              </div>
            </div>
          </div>

          <!-- 权限配置卡片 -->
          <div class="info-card">
            <div class="card-header">
              <el-icon class="card-icon"><Key /></el-icon>
              <span class="card-title">权限配置</span>
            </div>
            <div class="card-content">
              <el-form-item label="角色分配" prop="roles">
                <el-checkbox-group v-model="accountForm.roles">
                  <el-checkbox v-for="role in roles" :key="role.id" :label="role.id">
                    {{ role.name }}
                    <el-tooltip :content="role.description" placement="top">
                      <el-icon class="role-info"><InfoFilled /></el-icon>
                    </el-tooltip>
                  </el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              <el-form-item label="分配人员">
                <el-select
                  v-model="accountForm.assignedPersonId"
                  placeholder="选择人员（可选）"
                  style="width: 50%"
                  clearable
                >
                  <el-option
                    v-for="person in availablePersons"
                    :key="person.id"
                    :label="`${person.name} (${person.department} - ${person.position})`"
                    :value="person.id"
                  />
                </el-select>
              </el-form-item>
            </div>
          </div>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="accountDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAccount">确定</el-button>
      </template>
    </el-dialog>

    <!-- 账号详情对话框 -->
    <el-dialog v-model="accountDetailVisible" title="账号详情" width="900px">
      <div class="account-detail" v-if="currentAccount">
        <div class="detail-header">
          <div class="account-info">
            <h3>{{ currentAccount.username }}</h3>
            <p>{{ currentAccount.email }}</p>
            <div class="account-tags">
              <el-tag v-for="role in currentAccount.roles" :key="role.id" size="small">
                {{ role.name }}
              </el-tag>
              <el-tag :type="getStatusTagType(currentAccount.status)" size="small">
                {{ getStatusLabel(currentAccount.status) }}
              </el-tag>
            </div>
          </div>
          <div class="assigned-info" v-if="currentAccount.assignedPerson">
            <h4>分配人员</h4>
            <div class="person-card">
              <el-avatar :size="50" :src="currentAccount.assignedPerson.avatar">
                {{ currentAccount.assignedPerson.name.charAt(0) }}
              </el-avatar>
              <div class="person-details">
                <div class="name">{{ currentAccount.assignedPerson.name }}</div>
                <div class="position">{{ currentAccount.assignedPerson.department }} - {{ currentAccount.assignedPerson.position }}</div>
                <div class="contact">{{ currentAccount.assignedPerson.email }}</div>
              </div>
            </div>
          </div>
        </div>

        <el-tabs v-model="detailActiveTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="账号名">{{ currentAccount.username }}</el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="getStatusTagType(currentAccount.status)">
                  {{ getStatusLabel(currentAccount.status) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="分配人员">
                {{ currentAccount.assignedPerson ? currentAccount.assignedPerson.name : '未分配' }}
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ currentAccount.createTime }}</el-descriptions-item>
              <el-descriptions-item label="最后登录">{{ currentAccount.lastLogin }}</el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>

          <el-tab-pane label="权限信息" name="permissions">
            <div class="permissions-info">
              <h4>角色权限</h4>
              <div class="role-permissions">
                <div v-for="role in currentAccount.roles" :key="role.id" class="role-item">
                  <h5>{{ role.name }}</h5>
                  <p class="role-description">{{ role.description }}</p>
                  <div class="permission-tags">
                    <el-tag v-for="permission in role.permissions" :key="permission" size="small" type="info">
                      {{ permission }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="登录记录" name="loginHistory">
            <el-table :data="currentAccount.loginHistory" style="width: 100%">
              <el-table-column prop="time" label="登录时间" width="180" />
              <el-table-column prop="ip" label="IP地址" width="150" />
              <el-table-column prop="location" label="地理位置" width="200" />
              <el-table-column prop="device" label="设备信息" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
                    {{ row.status === 'success' ? '成功' : '失败' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>

    <!-- 分配人员对话框 -->
    <el-dialog v-model="assignPersonVisible" title="分配人员" width="600px">
      <div class="assign-section">
        <div class="account-summary" v-if="assigningAccount">
          <h4>账号信息</h4>
          <div class="account-card">
            <div class="info">
              <div class="username">{{ assigningAccount.username }}</div>
              <div class="roles">
                <el-tag v-for="role in assigningAccount.roles" :key="role.id" size="small">
                  {{ role.name }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>

        <el-divider />

        <el-form :model="assignPersonForm" :rules="assignPersonRules" ref="assignPersonFormRef" label-width="100px">
          <el-form-item label="选择人员" prop="personId">
            <el-select v-model="assignPersonForm.personId" placeholder="请选择人员" style="width: 100%">
              <el-option
                v-for="person in availablePersons"
                :key="person.id"
                :label="`${person.name} (${person.department} - ${person.position})`"
                :value="person.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="分配说明">
            <el-input
              v-model="assignPersonForm.remark"
              type="textarea"
              :rows="2"
              placeholder="请输入分配说明"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="assignPersonVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAssignPerson">确定</el-button>
      </template>
    </el-dialog>

    <!-- 重置密码对话框 -->
    <el-dialog v-model="resetPasswordVisible" title="重置密码" width="500px">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
        <el-form-item label="新密码" prop="password">
          <el-input v-model="passwordForm.password" type="password" placeholder="请输入新密码" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入密码" show-password />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="passwordForm.forceChange">要求用户下次登录时修改密码</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetPasswordVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmResetPassword">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Upload,
  Download,
  Search,
  ArrowDown,
  InfoFilled,
  User,
  Key
} from '@element-plus/icons-vue'
import * as accountApi from '@/api/system/account'

// 基础数据
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const roleFilter = ref('')
const assignmentFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const selectedAccounts = ref([])
const sortField = ref('')
const sortOrder = ref('')

// 对话框状态
const accountDialogVisible = ref(false)
const accountDetailVisible = ref(false)
const assignPersonVisible = ref(false)
const resetPasswordVisible = ref(false)
const editingAccount = ref(false)

// Tab状态
const detailActiveTab = ref('basic')

// 当前操作的账号
const currentAccount = ref(null)
const assigningAccount = ref(null)

// 账号数据
const accounts = ref([])
const totalUsers = ref(0)

// 角色数据
const roles = ref([
  { id: 1, name: '管理员', description: '系统管理员，拥有所有权限' },
  { id: 2, name: '运营', description: '运营人员，可以管理营销活动' },
  { id: 3, name: '技术', description: '技术人员，可以管理系统配置' },
  { id: 4, name: '客服', description: '客服人员，可以查看客户信息' }
])

// 可用人员（在职且状态正常）
const availablePersons = ref([
  {
    id: 1,
    name: '张三',
    department: '营销部',
    position: '营销总监'
  },
  {
    id: 2,
    name: '李四',
    department: '技术部',
    position: '技术经理'
  },
  {
    id: 4,
    name: '赵六',
    department: '客服部',
    position: '客服主管'
  }
])

// 表单数据
const accountForm = ref({
  username: '',
  password: '',
  roles: [],
  assignedPersonId: '',
  status: 'active',
  avatar: ''
})

// 头像上传相关
const avatarFileList = ref([])
const uploadAction = '#' // 模拟上传，实际处理在 beforeAvatarUpload 中

// 头像上传前处理
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片格式的文件！')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('头像图片大小不能超过 2MB！')
    return false
  }

  // 读取图片并转换为base64
  const reader = new FileReader()
  reader.onload = e => {
    accountForm.value.avatar = e.target.result
  }
  reader.readAsDataURL(file)

  return false // 阻止默认上传行为
}

const accountRules = {
  username: [{ required: true, message: '请输入账号名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  roles: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const assignPersonForm = ref({
  personId: '',
  remark: ''
})

const assignPersonRules = {
  personId: [{ required: true, message: '请选择人员', trigger: 'change' }]
}

const passwordForm = ref({
  password: '',
  confirmPassword: '',
  forceChange: false
})

const passwordRules = {
  password: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 计算属性
const filteredAccounts = computed(() => {
  let filtered = accounts.value

  if (searchQuery.value) {
    filtered = filtered.filter(account =>
      account.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      account.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(account => account.status === statusFilter.value)
  }

  if (roleFilter.value) {
    filtered = filtered.filter(account => account.roles.some(role => role.id === roleFilter.value))
  }

  if (assignmentFilter.value) {
    if (assignmentFilter.value === 'assigned') {
      filtered = filtered.filter(account => account.assignedPerson)
    } else if (assignmentFilter.value === 'unassigned') {
      filtered = filtered.filter(account => !account.assignedPerson)
    }
  }

  // 排序
  if (sortField.value) {
    filtered.sort((a, b) => {
      const aVal = a[sortField.value]
      const bVal = b[sortField.value]
      if (sortOrder.value === 'ascending') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
  }

  return filtered
})

const totalAccounts = computed(() => accounts.value.length)
const assignedCount = computed(() => accounts.value.filter(a => a.assignedPerson).length)
const unassignedCount = computed(() => accounts.value.filter(a => !a.assignedPerson).length)
const disabledCount = computed(() => accounts.value.filter(a => a.status === 'disabled').length)

// 工具函数
const getStatusTagType = (status) => {
  const types = {
    active: 'success',
    disabled: 'danger',
    locked: 'warning'
  }
  return types[status] || 'info'
}

const getStatusLabel = (status) => {
  const labels = {
    active: '正常',
    disabled: '禁用',
    locked: '锁定'
  }
  return labels[status] || status
}

// 事件处理
const handleSearch = () => {
  currentPage.value = 1
  loadUsers()
}

const handleFilter = () => {
  currentPage.value = 1
  loadUsers()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  loadUsers()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  loadUsers()
}

const handleSelectionChange = (selection) => {
  selectedAccounts.value = selection
}

const handleSortChange = ({ prop, order }) => {
  sortField.value = prop
  sortOrder.value = order
}

// 模拟账号数据
const loadUsers = async () => {
  loading.value = true
  try {
    // 模拟API调用，使用模拟数据
    await new Promise(resolve => setTimeout(resolve, 500))

    const mockAccounts = [
      {
        id: 1,
        username: 'admin',
        avatar: '',
        assignedPerson: {
          name: '张三',
          department: '技术部',
          position: '技术总监',
          avatar: ''
        },
        roles: [
          { id: 1, name: '管理员', permissions: ['用户管理', '系统配置', '数据导出'] }
        ],
        status: 'active',
        lastLogin: '2024-01-15 14:30:25',
        createTime: '2024-01-01 09:00:00',
        loginHistory: [
          {
            time: '2024-01-15 14:30:25',
            ip: '192.168.1.100',
            location: '北京市',
            device: 'Chrome 120.0.0.0 / Windows 10',
            status: 'success'
          },
          {
            time: '2024-01-15 09:15:10',
            ip: '192.168.1.100',
            location: '北京市',
            device: 'Chrome 120.0.0.0 / Windows 10',
            status: 'success'
          }
        ]
      },
      {
        id: 2,
        username: 'operator',
        avatar: '',
        assignedPerson: {
          name: '李四',
          department: '运营部',
          position: '运营经理',
          avatar: ''
        },
        roles: [
          { id: 2, name: '运营', permissions: ['内容管理', '活动管理'] }
        ],
        status: 'active',
        lastLogin: '2024-01-15 11:20:15',
        createTime: '2024-01-02 10:30:00',
        loginHistory: []
      },
      {
        id: 3,
        username: 'developer',
        avatar: '',
        assignedPerson: null,
        roles: [
          { id: 3, name: '技术', permissions: ['代码管理', '系统监控'] }
        ],
        status: 'disabled',
        lastLogin: '2024-01-10 16:45:30',
        createTime: '2024-01-03 14:15:00',
        loginHistory: []
      },
      {
        id: 4,
        username: 'service',
        avatar: '',
        assignedPerson: {
          name: '王五',
          department: '客服部',
          position: '客服主管',
          avatar: ''
        },
        roles: [
          { id: 4, name: '客服', permissions: ['客户查看', '工单处理'] }
        ],
        status: 'active',
        lastLogin: '2024-01-14 17:30:45',
        createTime: '2024-01-04 11:20:00',
        loginHistory: []
      },
      {
        id: 5,
        username: 'test_user',
        avatar: '',
        assignedPerson: null,
        roles: [
          { id: 4, name: '客服', permissions: ['客户查看'] }
        ],
        status: 'locked',
        lastLogin: '从未登录',
        createTime: '2024-01-05 15:45:00',
        loginHistory: []
      }
    ]

    accounts.value = mockAccounts
    totalUsers.value = mockAccounts.length
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败，请检查网络连接')
  } finally {
    loading.value = false
  }
}

// 账号操作
const createAccount = () => {
  editingAccount.value = false
  accountForm.value = {
    username: '',
    password: '',
    roles: [],
    assignedPersonId: '',
    status: 'active',
    avatar: ''
  }
  avatarFileList.value = []
  accountDialogVisible.value = true
}

const editAccount = (account) => {
  editingAccount.value = true
  accountForm.value = {
    ...account,
    roles: account.roles.map(r => r.id),
    assignedPersonId: account.assignedPerson?.id || '',
    avatar: account.avatar || ''
  }
  avatarFileList.value = []
  accountDialogVisible.value = true
}

const viewAccount = (account) => {
  currentAccount.value = account
  detailActiveTab.value = 'basic'
  accountDetailVisible.value = true
}

const saveAccount = async () => {
  try {
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 1000))

    const formData = { ...accountForm.value }
    if (editingAccount.value) {
      ElMessage.success('账号更新成功')
    } else {
      ElMessage.success('账号创建成功')
    }
    accountDialogVisible.value = false
    loadUsers()
  } catch (error) {
    console.error('保存账号失败:', error)
    ElMessage.error('保存账号失败')
  }
}

const deleteAccount = (account) => {
  ElMessageBox.confirm(
    `确定要删除账号 "${account.username}" 吗？删除后将无法恢复。`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // 模拟删除
      ElMessage.success('删除成功')
      loadUsers()
    } catch (error) {
      console.error('删除账号失败:', error)
      ElMessage.error('删除账号失败')
    }
  })
}

const toggleAccountStatus = async (account) => {
  try {
    const newStatus = account.status === 'active' ? 'disabled' : 'active'
    // 模拟状态更新
    account.status = newStatus
    ElMessage.success(`账号已${newStatus === 'active' ? '启用' : '禁用'}`)
  } catch (error) {
    console.error('更新账号状态失败:', error)
    ElMessage.error('更新账号状态失败')
  }
}

const showResetPasswordDialog = (account) => {
  currentAccount.value = account
  passwordForm.value = {
    password: '',
    confirmPassword: '',
    forceChange: false
  }
  resetPasswordVisible.value = true
}

const confirmResetPassword = async () => {
  try {
    // 模拟重置密码
    ElMessage.success('密码重置成功')
    resetPasswordVisible.value = false
  } catch (error) {
    console.error('重置密码失败:', error)
    ElMessage.error('重置密码失败')
  }
}

const viewLogs = (account) => {
  ElMessage.info(`查看账号 ${account.username} 的操作日志`)
}

// 人员分配操作
const manageAssignment = (account) => {
  assigningAccount.value = account
  assignPersonForm.value = {
    personId: account.assignedPerson?.id || '',
    remark: ''
  }
  assignPersonVisible.value = true
}

const confirmAssignPerson = () => {
  ElMessage.success('人员分配成功')
  assignPersonVisible.value = false
  // 更新账号的分配人员信息
}

const unassignAccount = (account) => {
  ElMessageBox.confirm(
    `确定要解除账号 "${account.username}" 的人员分配吗？`,
    '确认解除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    account.assignedPerson = null
    ElMessage.success('已解除分配')
  })
}

// 批量操作
const batchEnable = () => {
  selectedAccounts.value.forEach(account => {
    account.status = 'active'
  })
  ElMessage.success(`已启用 ${selectedAccounts.value.length} 个账号`)
  selectedAccounts.value = []
}

const batchDisable = () => {
  selectedAccounts.value.forEach(account => {
    account.status = 'disabled'
  })
  ElMessage.success(`已禁用 ${selectedAccounts.value.length} 个账号`)
  selectedAccounts.value = []
}

const batchAssignRole = () => {
  ElMessage.info('批量分配角色功能开发中')
}

const batchUnassign = () => {
  ElMessageBox.confirm(
    `确定要解除选中的 ${selectedAccounts.value.length} 个账号的人员分配吗？`,
    '确认解除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    selectedAccounts.value.forEach(account => {
      account.assignedPerson = null
    })
    ElMessage.success('批量解除分配成功')
    selectedAccounts.value = []
  })
}

const batchDelete = () => {
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedAccounts.value.length} 个账号吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    selectedAccounts.value.forEach(account => {
      const index = accounts.value.findIndex(a => a.id === account.id)
      if (index > -1) {
        accounts.value.splice(index, 1)
      }
    })
    ElMessage.success('批量删除成功')
    selectedAccounts.value = []
  })
}

// 导入导出
const handleImport = () => {
  ElMessage.info('导入功能开发中')
}

const handleExport = () => {
  ElMessage.success('正在导出账号数据')
}

// 引用
const accountFormRef = ref(null)
const assignPersonFormRef = ref(null)
const passwordFormRef = ref(null)

onMounted(() => {
  loadUsers()
})
</script>

<style scoped lang="scss">
.account-management-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }
}

.filter-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;

  .filter-content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .filter-left {
      display: flex;
      gap: 12px;
    }

    .filter-right {
      display: flex;
      gap: 20px;

      .stats-item {
        display: flex;
        align-items: center;
        gap: 4px;

        .label {
          color: #606266;
          font-size: 14px;
        }

        .value {
          font-weight: 600;

          &.assigned {
            color: #67C23A;
          }

          &.unassigned {
            color: #E6A23C;
          }

          &.disabled {
            color: #F56C6C;
          }
        }
      }
    }
  }
}

.account-list-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.assigned-person {
  display: flex;
  align-items: center;
  gap: 8px;

  .person-info {
    .name {
      font-size: 13px;
      font-weight: 500;
      line-height: 1.2;
    }

    .department {
      font-size: 12px;
      color: #909399;
      line-height: 1.2;
    }
  }
}

.batch-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  margin: 16px 0;

  .batch-info {
    color: #606266;
    font-size: 14px;
  }

  .batch-buttons {
    display: flex;
    gap: 8px;
  }
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.role-info {
  margin-left: 4px;
  color: #909399;
  cursor: help;
}

.account-detail {
  .detail-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 24px;

    .account-info {
      h3 {
        margin: 0 0 8px 0;
        font-size: 20px;
        font-weight: 600;
      }

      p {
        margin: 0 0 12px 0;
        color: #606266;
      }

      .account-tags {
        display: flex;
        gap: 8px;
      }
    }

    .assigned-info {
      h4 {
        margin: 0 0 12px 0;
        font-size: 16px;
        font-weight: 600;
      }

      .person-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border: 1px solid #ebeef5;
        border-radius: 8px;
        background: #f9f9f9;

        .person-details {
          .name {
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 4px;
          }

          .position {
            font-size: 12px;
            color: #909399;
            margin-bottom: 4px;
          }

          .contact {
            font-size: 12px;
            color: #409EFF;
          }
        }
      }
    }
  }
}

.permissions-info {
  .role-permissions {
    .role-item {
      margin-bottom: 20px;
      padding: 16px;
      border: 1px solid #ebeef5;
      border-radius: 8px;

      h5 {
        margin: 0 0 8px 0;
        font-size: 14px;
        font-weight: 600;
      }

      .role-description {
        margin: 0 0 12px 0;
        font-size: 13px;
        color: #606266;
        line-height: 1.4;
      }

      .permission-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }
    }
  }
}

.assign-section {
  .account-summary {
    h4 {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
    }

    .account-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border: 1px solid #ebeef5;
      border-radius: 8px;
      background: #f9f9f9;

      .info {
        .username {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .roles {
          display: flex;
          gap: 4px;
        }
      }
    }
  }
}

.operation-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: nowrap;

  .el-button {
    margin: 0;
  }
}

// 账号对话框样式
.account-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
    max-height: 70vh;
    overflow-y: auto;
  }
}

.account-form-layout {
  padding: 0 10px;

  .info-card {
    background: #fff;
    border-radius: 8px;
    margin-bottom: 20px;
    border: 1px solid #e6e8eb;
    overflow: hidden;

    .card-header {
      display: flex;
      align-items: center;
      padding: 15px 20px;
      background: #f8f9fb;
      border-bottom: 1px solid #e6e8eb;

      .card-icon {
        font-size: 20px;
        color: #5e7ce0;
        margin-right: 10px;
      }

      .card-title {
        font-size: 16px;
        font-weight: 600;
        color: #1d2129;
      }
    }

    .card-content {
      padding: 20px;

      .content-with-avatar {
        display: flex;
        gap: 40px;

        .avatar-section {
          flex-shrink: 0;
          text-align: center;

          .avatar-uploader {
            .avatar-container {
              width: 120px;
              height: 120px;
              border-radius: 50%;
              overflow: hidden;
              border: 2px solid #e6e8eb;
              cursor: pointer;
              transition: all 0.3s;

              &:hover {
                border-color: #5e7ce0;
                box-shadow: 0 0 8px rgba(94, 124, 224, 0.3);
              }

              .el-avatar {
                width: 100%;
                height: 100%;
              }

              .avatar-placeholder {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: #f5f6f8;
                color: #86909c;

                .el-icon {
                  margin-bottom: 8px;
                  color: #c9cdd4;
                }

                span {
                  font-size: 12px;
                }
              }
            }
          }

          .avatar-tips {
            margin-top: 10px;
            font-size: 12px;
            color: #86909c;
          }
        }

        .basic-form {
          flex: 1;
        }
      }

      // 修复输入框样式
      :deep(.el-input__wrapper) {
        box-shadow: 0 0 0 1px #dcdfe6 inset;
        border-radius: 4px;

        .el-input__inner {
          border: none;
          box-shadow: none;
        }

        &:hover {
          box-shadow: 0 0 0 1px #c0c4cc inset;
        }

        &.is-focus {
          box-shadow: 0 0 0 1px #409eff inset;
        }
      }

      // 角色复选框样式
      :deep(.el-checkbox-group) {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;

        .el-checkbox {
          margin-right: 0;
        }
      }

      .role-info {
        margin-left: 4px;
        color: #909399;
        cursor: help;
      }
    }
  }
}
</style>