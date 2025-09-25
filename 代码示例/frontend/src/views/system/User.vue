<template>
  <div class="user-management-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h2>用户管理</h2>
        <div class="header-actions">
          <el-button @click="handleImport">
            <el-icon><Upload /></el-icon>
            批量导入
          </el-button>
          <el-button @click="handleExport">
            <el-icon><Download /></el-icon>
            导出用户
          </el-button>
          <el-button type="primary" @click="createUser">
            <el-icon><Plus /></el-icon>
            新增用户
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
            placeholder="搜索用户名称、邮箱"
            prefix-icon="Search"
            style="width: 300px"
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
          <el-select v-model="departmentFilter" placeholder="部门" style="width: 150px" @change="handleFilter">
            <el-option label="全部部门" value="" />
            <el-option v-for="dept in departments" :key="dept.id" :label="dept.name" :value="dept.id" />
          </el-select>
        </div>
        <div class="filter-right">
          <div class="stats-item">
            <span class="label">总用户数:</span>
            <span class="value">{{ totalUsers }}</span>
          </div>
          <div class="stats-item">
            <span class="label">在线:</span>
            <span class="value online">{{ onlineCount }}</span>
          </div>
          <div class="stats-item">
            <span class="label">禁用:</span>
            <span class="value disabled">{{ disabledCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="user-list-section">
      <el-table 
        :data="filteredUsers" 
        style="width: 100%"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" sortable />
        <el-table-column prop="avatar" label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :size="40" :src="row.avatar">{{ row.name.charAt(0) }}</el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" width="120" sortable />
        <el-table-column prop="username" label="用户名" width="130" sortable />
        <el-table-column prop="email" label="邮箱" width="200" sortable />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="roles" label="角色" width="150">
          <template #default="{ row }">
            <el-tag v-for="role in row.roles" :key="role.id" size="small" style="margin-right: 4px">
              {{ role.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLogin" label="最后登录" width="160" sortable />
        <el-table-column prop="createTime" label="创建时间" width="160" sortable />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewUser(row)">查看</el-button>
            <el-button size="small" type="primary" @click="editUser(row)">编辑</el-button>
            <el-dropdown trigger="click">
              <el-button size="small" type="info">
                更多<el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="resetPassword(row)">重置密码</el-dropdown-item>
                  <el-dropdown-item @click="toggleUserStatus(row)">
                    {{ row.status === 'active' ? '禁用' : '启用' }}
                  </el-dropdown-item>
                  <el-dropdown-item @click="viewLogs(row)">操作日志</el-dropdown-item>
                  <el-dropdown-item divided @click="deleteUser(row)">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 批量操作 -->
      <div v-if="selectedUsers.length > 0" class="batch-actions">
        <div class="batch-info">
          已选择 {{ selectedUsers.length }} 个用户
        </div>
        <div class="batch-buttons">
          <el-button @click="batchEnable">批量启用</el-button>
          <el-button @click="batchDisable">批量禁用</el-button>
          <el-button @click="batchAssignRole">分配角色</el-button>
          <el-button @click="batchExport">批量导出</el-button>
          <el-button type="danger" @click="batchDelete">批量删除</el-button>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalUsers"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 创建/编辑用户对话框 -->
    <el-dialog
      v-model="userDialogVisible"
      :title="editingUser ? '编辑用户' : '新增用户'"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form :model="userForm" :rules="userRules" ref="userFormRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="头像">
              <el-upload
                class="avatar-uploader"
                action="/api/upload/avatar"
                :show-file-list="false"
                :on-success="handleAvatarSuccess"
                :before-upload="beforeAvatarUpload"
              >
                <img v-if="userForm.avatar" :src="userForm.avatar" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="userForm.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="userForm.username" placeholder="请输入用户名" :disabled="editingUser" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="userForm.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="userForm.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="!editingUser">
          <el-col :span="12">
            <el-form-item label="密码" prop="password">
              <el-input v-model="userForm.password" type="password" placeholder="请输入密码" show-password />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="userForm.confirmPassword" type="password" placeholder="请再次输入密码" show-password />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="部门" prop="department">
              <el-tree-select
                v-model="userForm.department"
                :data="departmentTree"
                :render-after-expand="false"
                placeholder="选择部门"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职位">
              <el-input v-model="userForm.position" placeholder="请输入职位" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="角色分配" prop="roles">
              <el-checkbox-group v-model="userForm.roles">
                <el-checkbox v-for="role in roles" :key="role.id" :label="role.id">
                  {{ role.name }}
                  <el-tooltip :content="role.description" placement="top">
                    <el-icon class="role-info"><InfoFilled /></el-icon>
                  </el-tooltip>
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="userForm.status">
                <el-radio label="active">正常</el-radio>
                <el-radio label="disabled">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input
                v-model="userForm.remark"
                type="textarea"
                :rows="3"
                placeholder="请输入备注信息"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="userDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveUser">确定</el-button>
      </template>
    </el-dialog>

    <!-- 用户详情对话框 -->
    <el-dialog v-model="userDetailVisible" title="用户详情" width="900px">
      <div class="user-detail" v-if="currentUser">
        <div class="detail-header">
          <el-avatar :size="80" :src="currentUser.avatar">{{ currentUser.name.charAt(0) }}</el-avatar>
          <div class="user-info">
            <h3>{{ currentUser.name }}</h3>
            <p>{{ currentUser.email }}</p>
            <div class="user-tags">
              <el-tag v-for="role in currentUser.roles" :key="role.id" size="small">{{ role.name }}</el-tag>
              <el-tag :type="getStatusTagType(currentUser.status)" size="small">{{ getStatusLabel(currentUser.status) }}</el-tag>
            </div>
          </div>
        </div>
        
        <el-tabs v-model="detailActiveTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
              <el-descriptions-item label="姓名">{{ currentUser.name }}</el-descriptions-item>
              <el-descriptions-item label="邮箱">{{ currentUser.email }}</el-descriptions-item>
              <el-descriptions-item label="手机号">{{ currentUser.phone }}</el-descriptions-item>
              <el-descriptions-item label="部门">{{ currentUser.department }}</el-descriptions-item>
              <el-descriptions-item label="职位">{{ currentUser.position }}</el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ currentUser.createTime }}</el-descriptions-item>
              <el-descriptions-item label="最后登录">{{ currentUser.lastLogin }}</el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>
          
          <el-tab-pane label="权限信息" name="permissions">
            <div class="permissions-info">
              <h4>角色权限</h4>
              <div class="role-permissions">
                <div v-for="role in currentUser.roles" :key="role.id" class="role-item">
                  <h5>{{ role.name }}</h5>
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
            <el-table :data="currentUser.loginHistory" style="width: 100%">
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

    <!-- 批量分配角色对话框 -->
    <el-dialog v-model="batchRoleVisible" title="批量分配角色" width="600px">
      <div class="batch-role-section">
        <div class="selected-users">
          <h4>选中用户 ({{ selectedUsers.length }})</h4>
          <div class="user-list">
            <el-tag v-for="user in selectedUsers" :key="user.id" closable @close="removeSelectedUser(user)">
              {{ user.name }} ({{ user.username }})
            </el-tag>
          </div>
        </div>
        <div class="role-assignment">
          <h4>角色分配</h4>
          <el-radio-group v-model="batchRoleAction">
            <el-radio label="add">添加角色</el-radio>
            <el-radio label="replace">替换角色</el-radio>
            <el-radio label="remove">移除角色</el-radio>
          </el-radio-group>
          <el-checkbox-group v-model="selectedRoles" style="margin-top: 16px;">
            <el-checkbox v-for="role in roles" :key="role.id" :label="role.id">
              {{ role.name }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
      <template #footer>
        <el-button @click="batchRoleVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmBatchRole">确定</el-button>
      </template>
    </el-dialog>

    <!-- 导入用户对话框 -->
    <el-dialog v-model="importDialogVisible" title="批量导入用户" width="600px">
      <div class="import-section">
        <el-steps :active="importStep" align-center>
          <el-step title="下载模板" />
          <el-step title="上传文件" />
          <el-step title="数据预览" />
          <el-step title="导入完成" />
        </el-steps>
        
        <div class="import-content">
          <div v-if="importStep === 0" class="template-download">
            <p>请先下载导入模板，填写用户数据后上传</p>
            <el-button type="primary" @click="downloadTemplate">下载模板</el-button>
          </div>
          
          <div v-else-if="importStep === 1" class="file-upload">
            <el-upload
              drag
              action="/api/users/import"
              :on-success="handleImportSuccess"
              :on-error="handleImportError"
              :before-upload="beforeImportUpload"
              accept=".xlsx,.xls"
            >
              <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
              <template #tip>
                <div class="el-upload__tip">只能上传xlsx/xls文件，且不超过2MB</div>
              </template>
            </el-upload>
          </div>
          
          <div v-else-if="importStep === 2" class="data-preview">
            <p>数据预览 (共{{ importData.length }}条记录)</p>
            <el-table :data="importData.slice(0, 5)" style="width: 100%">
              <el-table-column prop="name" label="姓名" />
              <el-table-column prop="username" label="用户名" />
              <el-table-column prop="email" label="邮箱" />
              <el-table-column prop="phone" label="手机号" />
              <el-table-column prop="department" label="部门" />
            </el-table>
            <div class="import-actions">
              <el-button @click="importStep = 1">重新上传</el-button>
              <el-button type="primary" @click="confirmImport">确认导入</el-button>
            </div>
          </div>
          
          <div v-else-if="importStep === 3" class="import-result">
            <el-result
              icon="success"
              title="导入完成"
              :sub-title="`成功导入${importResult.success}条记录，失败${importResult.failed}条`"
            >
              <template #extra>
                <el-button type="primary" @click="finishImport">完成</el-button>
              </template>
            </el-result>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Upload,
  Download,
  Search,
  ArrowDown,
  InfoFilled,
  UploadFilled
} from '@element-plus/icons-vue'
import {
  getUserList,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  resetPassword,
  assignRoles,
  getUserRoles,
  checkUsername,
  checkEmail
} from '@/api/system/user'
import { getAllRoles } from '@/api/system/role'

// 基础数据
const searchQuery = ref('')
const statusFilter = ref('')
const roleFilter = ref('')
const departmentFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const selectedUsers = ref([])
const sortField = ref('')
const sortOrder = ref('')

// 对话框状态
const userDialogVisible = ref(false)
const userDetailVisible = ref(false)
const resetPasswordVisible = ref(false)
const batchRoleVisible = ref(false)
const importDialogVisible = ref(false)
const editingUser = ref(false)

// Tab状态
const detailActiveTab = ref('basic')
const importStep = ref(0)

// 用户数据
const users = ref([])
const totalElements = ref(0)

// 角色数据
const roles = ref([])

// 部门数据
const departments = ref([
  { id: 1, name: '营销部' },
  { id: 2, name: '技术部' },
  { id: 3, name: '客服部' },
  { id: 4, name: '财务部' }
])

const departmentTree = ref([
  {
    value: '营销部',
    label: '营销部',
    children: [
      { value: '数字营销', label: '数字营销' },
      { value: '内容营销', label: '内容营销' }
    ]
  },
  {
    value: '技术部',
    label: '技术部',
    children: [
      { value: '前端开发', label: '前端开发' },
      { value: '后端开发', label: '后端开发' }
    ]
  },
  {
    value: '客服部',
    label: '客服部'
  },
  {
    value: '财务部',
    label: '财务部'
  }
])

// 表单数据
const userForm = ref({
  name: '',
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  avatar: '',
  department: '',
  position: '',
  roles: [],
  status: 'active',
  remark: ''
})

const userRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== userForm.value.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  roles: [{ required: true, message: '请选择角色', trigger: 'change' }]
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

// 批量操作
const batchRoleAction = ref('add')
const selectedRoles = ref([])

// 导入相关
const importData = ref([])
const importResult = ref({ success: 0, failed: 0 })

// 当前用户
const currentUser = ref(null)

// 计算属性
const filteredUsers = computed(() => {
  return users.value
})

const totalUsers = computed(() => totalElements.value)
const onlineCount = computed(() => users.value.filter(u => u.status === 1).length)
const disabledCount = computed(() => users.value.filter(u => u.status === 0).length)

// 工具函数
const getStatusTagType = (status) => {
  return status === 1 ? 'success' : 'danger'
}

const getStatusLabel = (status) => {
  return status === 1 ? '正常' : '禁用'
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
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  loadUsers()
}

const handleSelectionChange = (selection) => {
  selectedUsers.value = selection
}

const handleSortChange = ({ prop, order }) => {
  sortField.value = prop
  sortOrder.value = order
}

// 用户操作
const createUser = () => {
  editingUser.value = false
  userForm.value = {
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    avatar: '',
    department: '',
    position: '',
    roles: [],
    status: 'active',
    remark: ''
  }
  userDialogVisible.value = true
}

const editUser = (user) => {
  editingUser.value = true
  userForm.value = {
    ...user,
    roles: user.roles.map(r => r.id),
    confirmPassword: ''
  }
  userDialogVisible.value = true
}

const viewUser = (user) => {
  currentUser.value = user
  userDetailVisible.value = true
}

const saveUser = async () => {
  try {
    const userData = {
      ...userForm.value,
      status: userForm.value.status === 'active' ? 1 : 0
    }
    delete userData.confirmPassword

    if (editingUser.value) {
      await updateUser(userData.id, userData)
      ElMessage.success('用户更新成功')
    } else {
      await createUser(userData)
      ElMessage.success('用户创建成功')
    }
    userDialogVisible.value = false
    await loadUsers()
  } catch (error) {
    console.error('保存用户失败:', error)
    ElMessage.error(error.response?.data?.message || '保存用户失败')
  }
}

// 删除用户
const deleteUserHandler = async (user) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 ${user.nickname || user.username} 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deleteUser(user.id)
    ElMessage.success('删除成功')
    await loadUsers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
      ElMessage.error(error.response?.data?.message || '删除用户失败')
    }
  }
}

// 切换用户状态
const toggleUserStatus = async (user) => {
  const action = user.status === 1 ? '禁用' : '启用'
  const newStatus = user.status === 1 ? 0 : 1

  try {
    await ElMessageBox.confirm(
      `确定要${action}用户 ${user.nickname || user.username} 吗？`,
      `${action}确认`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await updateUserStatus(user.id, newStatus)
    ElMessage.success(`${action}成功`)
    await loadUsers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('切换用户状态失败:', error)
      ElMessage.error(error.response?.data?.message || '切换状态失败')
    }
  }
}

// 重置密码弹窗
const resetPasswordDialog = (user) => {
  currentUser.value = user
  passwordForm.value = {
    password: '',
    confirmPassword: '',
    forceChange: false
  }
  resetPasswordVisible.value = true
}

// 确认重置密码
const confirmResetPassword = async () => {
  try {
    await resetPassword(currentUser.value.id, passwordForm.value.password)
    ElMessage.success('密码重置成功')
    resetPasswordVisible.value = false
    passwordForm.value = {
      password: '',
      confirmPassword: '',
      forceChange: false
    }
  } catch (error) {
    console.error('重置密码失败:', error)
    ElMessage.error(error.response?.data?.message || '重置密码失败')
  }
}

const deleteUser = (user) => {
  ElMessageBox.confirm(
    `确定要删除用户 "${user.name}" 吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = users.value.findIndex(u => u.id === user.id)
    if (index > -1) {
      users.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  })
}

const resetPassword = (user) => {
  currentUser.value = user
  passwordForm.value = {
    password: '',
    confirmPassword: '',
    forceChange: false
  }
  resetPasswordVisible.value = true
}

const confirmResetPassword = () => {
  ElMessage.success('密码重置成功')
  resetPasswordVisible.value = false
}

const toggleUserStatus = (user) => {
  const newStatus = user.status === 'active' ? 'disabled' : 'active'
  user.status = newStatus
  ElMessage.success(`用户已${newStatus === 'active' ? '启用' : '禁用'}`)
}

const viewLogs = (user) => {
  ElMessage.info(`查看用户 ${user.name} 的操作日志`)
}

// 批量操作
const batchEnable = () => {
  selectedUsers.value.forEach(user => {
    user.status = 'active'
  })
  ElMessage.success(`已启用 ${selectedUsers.value.length} 个用户`)
  selectedUsers.value = []
}

const batchDisable = () => {
  selectedUsers.value.forEach(user => {
    user.status = 'disabled'
  })
  ElMessage.success(`已禁用 ${selectedUsers.value.length} 个用户`)
  selectedUsers.value = []
}

const batchAssignRole = () => {
  batchRoleAction.value = 'add'
  selectedRoles.value = []
  batchRoleVisible.value = true
}

const batchExport = () => {
  ElMessage.success(`正在导出 ${selectedUsers.value.length} 个用户数据`)
}

const batchDelete = () => {
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    selectedUsers.value.forEach(user => {
      const index = users.value.findIndex(u => u.id === user.id)
      if (index > -1) {
        users.value.splice(index, 1)
      }
    })
    ElMessage.success('批量删除成功')
    selectedUsers.value = []
  })
}

const confirmBatchRole = () => {
  ElMessage.success('批量角色分配成功')
  batchRoleVisible.value = false
}

const removeSelectedUser = (user) => {
  const index = selectedUsers.value.findIndex(u => u.id === user.id)
  if (index > -1) {
    selectedUsers.value.splice(index, 1)
  }
}

// 导入导出
const handleImport = () => {
  importStep.value = 0
  importDialogVisible.value = true
}

const handleExport = () => {
  ElMessage.success('正在导出用户数据')
}

const downloadTemplate = () => {
  ElMessage.success('模板下载完成')
  importStep.value = 1
}

const beforeImportUpload = (file) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isExcel) {
    ElMessage.error('只能上传Excel文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('文件大小不能超过2MB!')
    return false
  }
  return true
}

const handleImportSuccess = (response) => {
  importData.value = response.data
  importStep.value = 2
}

const handleImportError = () => {
  ElMessage.error('文件上传失败')
}

const confirmImport = () => {
  importResult.value = { success: importData.value.length, failed: 0 }
  importStep.value = 3
}

const finishImport = () => {
  importDialogVisible.value = false
  // 刷新用户列表
}

// 头像上传
const handleAvatarSuccess = (response) => {
  userForm.value.avatar = response.data.url
}

const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2MB!')
    return false
  }
  return true
}

// 引用
const userFormRef = ref(null)
const passwordFormRef = ref(null)

// 加载用户列表
const loadUsers = async () => {
  try {
    const params = {
      page: currentPage.value - 1,
      size: pageSize.value
    }

    if (searchQuery.value) {
      params.username = searchQuery.value
      params.nickname = searchQuery.value
      params.email = searchQuery.value
    }

    if (statusFilter.value) {
      params.status = statusFilter.value === 'active' ? 1 : 0
    }

    const response = await getUserList(params)
    const data = response.data || response

    users.value = data.content || []
    totalElements.value = data.totalElements || 0
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('加载用户列表失败')
  }
}

// 加载角色列表
const loadRoles = async () => {
  try {
    const response = await getAllRoles()
    const data = response.data || response
    roles.value = data || []
  } catch (error) {
    console.error('加载角色列表失败:', error)
    ElMessage.error('加载角色列表失败')
  }
}

onMounted(() => {
  loadUsers()
  loadRoles()
})
</script>

<style scoped lang="scss">
.user-management-container {
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
          
          &.online {
            color: #67C23A;
          }
          
          &.disabled {
            color: #F56C6C;
          }
        }
      }
    }
  }
}

.user-list-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
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

.avatar-uploader {
  .avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
  }
  
  .avatar-uploader-icon {
    width: 100px;
    height: 100px;
    border: 2px dashed #d9d9d9;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    color: #8c939d;
    cursor: pointer;
    
    &:hover {
      border-color: #409EFF;
      color: #409EFF;
    }
  }
}

.role-info {
  margin-left: 4px;
  color: #909399;
  cursor: help;
}

.user-detail {
  .detail-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 24px;
    
    .user-info {
      h3 {
        margin: 0 0 8px 0;
        font-size: 20px;
        font-weight: 600;
      }
      
      p {
        margin: 0 0 12px 0;
        color: #606266;
      }
      
      .user-tags {
        display: flex;
        gap: 8px;
      }
    }
  }
}

.permissions-info {
  .role-permissions {
    .role-item {
      margin-bottom: 20px;
      
      h5 {
        margin: 0 0 8px 0;
        font-size: 14px;
        font-weight: 600;
      }
      
      .permission-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }
    }
  }
}

.batch-role-section {
  .selected-users {
    margin-bottom: 24px;
    
    h4 {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
    }
    
    .user-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }
  
  .role-assignment {
    h4 {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
    }
  }
}

.import-section {
  .import-content {
    margin-top: 24px;
    
    .template-download,
    .file-upload,
    .data-preview,
    .import-result {
      text-align: center;
      padding: 20px;
    }
    
    .import-actions {
      margin-top: 16px;
      display: flex;
      justify-content: center;
      gap: 12px;
    }
  }
}
</style>