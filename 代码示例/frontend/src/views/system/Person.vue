<template>
  <div class="person-management-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h2>人员管理</h2>
        <div class="header-actions">
          <el-button @click="handleImport">
            <el-icon><Upload /></el-icon>
            批量导入
          </el-button>
          <el-button @click="handleExport">
            <el-icon><Download /></el-icon>
            导出人员
          </el-button>
          <el-button type="primary" @click="createPerson">
            <el-icon><Plus /></el-icon>
            新增人员
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
            placeholder="搜索姓名、邮箱、手机号"
            prefix-icon="Search"
            style="width: 300px"
            @change="handleSearch"
          />
          <el-select v-model="statusFilter" placeholder="状态" style="width: 120px" @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="在职" value="active" />
            <el-option label="离职" value="inactive" />
            <el-option label="停用" value="disabled" />
          </el-select>
          <el-select v-model="departmentFilter" placeholder="部门" style="width: 150px" @change="handleFilter">
            <el-option label="全部部门" value="" />
            <el-option v-for="dept in departments" :key="dept.id" :label="dept.name" :value="dept.id" />
          </el-select>
        </div>
        <div class="filter-right">
          <div class="stats-item">
            <span class="label">总人数:</span>
            <span class="value">{{ totalPersons }}</span>
          </div>
          <div class="stats-item">
            <span class="label">在职:</span>
            <span class="value active">{{ activeCount }}</span>
          </div>
          <div class="stats-item">
            <span class="label">离职:</span>
            <span class="value inactive">{{ inactiveCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 人员列表 -->
    <div class="person-list-section">
      <el-table 
        :data="filteredPersons" 
        style="width: 100%"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        row-key="id"
        v-loading="loading"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="员工号" width="100" sortable />
        <el-table-column prop="avatar" label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :size="40" :src="row.avatar">{{ row.name.charAt(0) }}</el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" width="120" sortable />
        <el-table-column prop="email" label="邮箱" width="200" sortable />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column prop="position" label="职位" width="120" />
        <el-table-column prop="accounts" label="关联账号" width="180">
          <template #default="{ row }">
            <el-tag 
              v-for="account in row.accounts" 
              :key="account.id" 
              size="small" 
              style="margin: 2px"
              :type="account.status === 'active' ? 'success' : 'info'"
            >
              {{ account.username }}
            </el-tag>
            <el-button 
              v-if="row.accounts.length === 0" 
              size="small" 
              type="primary" 
              link
              @click="assignAccount(row)"
            >
              分配账号
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="joinDate" label="入职日期" width="120" sortable />
        <el-table-column prop="createTime" label="创建时间" width="160" sortable />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <div class="operation-buttons">
              <el-button size="small" @click="viewPerson(row)">查看</el-button>
              <el-button size="small" type="primary" @click="editPerson(row)">编辑</el-button>
              <el-button size="small" @click="manageAccounts(row)">账号管理</el-button>
              <el-dropdown trigger="click">
                <el-button size="small" type="info">
                  更多<el-icon><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="viewHistory(row)">查看历史</el-dropdown-item>
                    <el-dropdown-item @click="toggleStatus(row)">
                      {{ row.status === 'active' ? '停用' : '启用' }}
                    </el-dropdown-item>
                    <el-dropdown-item divided @click="deletePerson(row)">删除</el-dropdown-item>
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
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalPersons"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 创建/编辑人员对话框 -->
    <el-dialog
      v-model="personDialogVisible"
      :title="editingPerson ? '编辑人员' : '新增人员'"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form :model="personForm" :rules="personRules" ref="personFormRef" label-width="100px">
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
                <img v-if="personForm.avatar" :src="personForm.avatar" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="员工号" prop="employeeId">
              <el-input v-model="personForm.employeeId" placeholder="请输入员工号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="personForm.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="personForm.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="personForm.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="部门" prop="department">
              <el-tree-select
                v-model="personForm.department"
                :data="departmentTree"
                :render-after-expand="false"
                placeholder="选择部门"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职位" prop="position">
              <el-input v-model="personForm.position" placeholder="请输入职位" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="入职日期" prop="joinDate">
              <el-date-picker
                v-model="personForm.joinDate"
                type="date"
                placeholder="选择入职日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="personForm.status">
                <el-radio label="active">在职</el-radio>
                <el-radio label="inactive">离职</el-radio>
                <el-radio label="disabled">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input
                v-model="personForm.remark"
                type="textarea"
                :rows="3"
                placeholder="请输入备注信息"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="personDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="savePerson">确定</el-button>
      </template>
    </el-dialog>

    <!-- 人员详情对话框 -->
    <el-dialog v-model="personDetailVisible" title="人员详情" width="900px">
      <div class="person-detail" v-if="currentPerson">
        <div class="detail-header">
          <el-avatar :size="80" :src="currentPerson.avatar">{{ currentPerson.name.charAt(0) }}</el-avatar>
          <div class="person-info">
            <h3>{{ currentPerson.name }}</h3>
            <p>{{ currentPerson.email }}</p>
            <div class="person-tags">
              <el-tag :type="getStatusTagType(currentPerson.status)" size="small">
                {{ getStatusLabel(currentPerson.status) }}
              </el-tag>
              <el-tag size="small">{{ currentPerson.department }}</el-tag>
              <el-tag size="small">{{ currentPerson.position }}</el-tag>
            </div>
          </div>
        </div>
        
        <el-tabs v-model="detailActiveTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="员工号">{{ currentPerson.employeeId }}</el-descriptions-item>
              <el-descriptions-item label="姓名">{{ currentPerson.name }}</el-descriptions-item>
              <el-descriptions-item label="邮箱">{{ currentPerson.email }}</el-descriptions-item>
              <el-descriptions-item label="手机号">{{ currentPerson.phone }}</el-descriptions-item>
              <el-descriptions-item label="部门">{{ currentPerson.department }}</el-descriptions-item>
              <el-descriptions-item label="职位">{{ currentPerson.position }}</el-descriptions-item>
              <el-descriptions-item label="入职日期">{{ currentPerson.joinDate }}</el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ currentPerson.createTime }}</el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>
          
          <el-tab-pane label="账号信息" name="accounts">
            <div class="accounts-section">
              <div class="accounts-header">
                <h4>关联账号列表</h4>
                <el-button size="small" type="primary" @click="addAccountToPerson">添加账号</el-button>
              </div>
              <el-table :data="currentPerson.accountDetails" style="width: 100%">
                <el-table-column prop="username" label="账号名" width="150" />
                <el-table-column prop="roles" label="角色权限" width="200">
                  <template #default="{ row }">
                    <el-tag v-for="role in row.roles" :key="role.id" size="small" style="margin: 2px">
                      {{ role.name }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
                      {{ row.status === 'active' ? '正常' : '禁用' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="lastLogin" label="最后登录" width="160" />
                <el-table-column label="操作" width="150">
                  <template #default="{ row }">
                    <el-button size="small" @click="viewAccountDetail(row)">查看</el-button>
                    <el-button size="small" type="danger" @click="removeAccountFromPerson(row)">移除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="操作记录" name="history">
            <el-timeline>
              <el-timeline-item v-for="item in currentPerson.history" :key="item.id" :timestamp="item.time">
                {{ item.action }}
              </el-timeline-item>
            </el-timeline>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>

    <!-- 账号管理对话框 -->
    <el-dialog v-model="accountManageVisible" title="账号管理" width="900px">
      <div class="account-manage-section" v-if="managingPerson">
        <div class="person-summary">
          <el-avatar :size="50" :src="managingPerson.avatar">{{ managingPerson.name.charAt(0) }}</el-avatar>
          <div class="info">
            <h4>{{ managingPerson.name }}</h4>
            <p>{{ managingPerson.department }} - {{ managingPerson.position }}</p>
          </div>
        </div>
        
        <el-divider />
        
        <div class="existing-accounts">
          <h4>现有账号</h4>
          <el-table :data="managingPerson.accountDetails" style="width: 100%">
            <el-table-column prop="username" label="账号名" width="150" />
            <el-table-column prop="roles" label="角色" width="200">
              <template #default="{ row }">
                <el-tag v-for="role in row.roles" :key="role.id" size="small" style="margin: 2px">
                  {{ role.name }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-switch
                  v-model="row.status"
                  active-value="active"
                  inactive-value="disabled"
                  @change="toggleAccountStatus(row)"
                />
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="160" />
            <el-table-column label="操作" width="180">
              <template #default="{ row }">
                <el-button size="small" @click="editAccount(row)">编辑</el-button>
                <el-button size="small" @click="resetAccountPassword(row)">重置密码</el-button>
                <el-button size="small" type="danger" @click="removeAccount(row)">移除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <div class="add-account-section">
          <el-button type="primary" @click="showAddAccountDialog">
            <el-icon><Plus /></el-icon>
            分配新账号
          </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 分配账号对话框 -->
    <el-dialog v-model="assignAccountVisible" title="分配账号" width="600px">
      <el-form :model="assignForm" :rules="assignRules" ref="assignFormRef" label-width="100px">
        <el-form-item label="选择账号" prop="accountId">
          <el-select v-model="assignForm.accountId" placeholder="请选择未分配的账号" style="width: 100%">
            <el-option
              v-for="account in availableAccounts"
              :key="account.id"
              :label="`${account.username} (${account.roles.map(r => r.name).join(', ')})`"
              :value="account.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="说明">
          <el-input
            v-model="assignForm.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入分配说明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignAccountVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAssignAccount">确定</el-button>
      </template>
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
  ArrowDown
} from '@element-plus/icons-vue'

// 基础数据
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const departmentFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const selectedPersons = ref([])
const sortField = ref('')
const sortOrder = ref('')

// 对话框状态
const personDialogVisible = ref(false)
const personDetailVisible = ref(false)
const accountManageVisible = ref(false)
const assignAccountVisible = ref(false)
const editingPerson = ref(false)

// Tab状态
const detailActiveTab = ref('basic')

// 当前操作的人员
const currentPerson = ref(null)
const managingPerson = ref(null)

// 人员数据
const persons = ref([
  {
    id: 1,
    employeeId: 'EMP001',
    name: '张三',
    email: 'zhangsan@company.com',
    phone: '13812345678',
    avatar: '',
    department: '营销部',
    position: '营销总监',
    status: 'active',
    joinDate: '2023-01-15',
    createTime: '2023-01-15 09:00:00',
    remark: '营销部门负责人',
    accounts: [
      { id: 1, username: 'zhangsan_admin', status: 'active' },
      { id: 2, username: 'zhangsan_ops', status: 'active' }
    ],
    accountDetails: [
      {
        id: 1,
        username: 'zhangsan_admin',
        roles: [{ id: 1, name: '管理员' }],
        status: 'active',
        lastLogin: '2024-01-16 10:30:00',
        createTime: '2023-01-15 09:30:00'
      },
      {
        id: 2,
        username: 'zhangsan_ops',
        roles: [{ id: 2, name: '运营' }],
        status: 'active',
        lastLogin: '2024-01-16 14:20:00',
        createTime: '2023-06-10 10:00:00'
      }
    ],
    history: [
      { id: 1, time: '2024-01-16 10:30:00', action: '登录系统' },
      { id: 2, time: '2024-01-15 16:45:00', action: '修改个人信息' }
    ]
  },
  {
    id: 2,
    employeeId: 'EMP002',
    name: '李四',
    email: 'lisi@company.com',
    phone: '13987654321',
    avatar: '',
    department: '技术部',
    position: '技术经理',
    status: 'active',
    joinDate: '2023-02-01',
    createTime: '2023-02-01 10:00:00',
    remark: '技术团队负责人',
    accounts: [
      { id: 3, username: 'lisi_tech', status: 'active' }
    ],
    accountDetails: [
      {
        id: 3,
        username: 'lisi_tech',
        roles: [{ id: 3, name: '技术' }],
        status: 'active',
        lastLogin: '2024-01-16 09:15:00',
        createTime: '2023-02-01 10:30:00'
      }
    ],
    history: []
  },
  {
    id: 3,
    employeeId: 'EMP003',
    name: '王五',
    email: 'wangwu@company.com',
    phone: '13765432109',
    avatar: '',
    department: '客服部',
    position: '客服专员',
    status: 'inactive',
    joinDate: '2023-03-01',
    createTime: '2023-03-01 11:00:00',
    remark: '已离职',
    accounts: [],
    accountDetails: [],
    history: []
  },
  {
    id: 4,
    employeeId: 'EMP004',
    name: '赵六',
    email: 'zhaoliu@company.com',
    phone: '13698745632',
    avatar: '',
    department: '财务部',
    position: '财务经理',
    status: 'active',
    joinDate: '2023-03-15',
    createTime: '2023-03-15 14:00:00',
    remark: '财务部门负责人',
    accounts: [
      { id: 4, username: 'zhaoliu_finance', status: 'active' }
    ],
    accountDetails: [
      {
        id: 4,
        username: 'zhaoliu_finance',
        roles: [{ id: 4, name: '财务' }],
        status: 'active',
        lastLogin: '2024-01-16 08:30:00',
        createTime: '2023-03-15 14:30:00'
      }
    ],
    history: []
  },
  {
    id: 5,
    employeeId: 'EMP005',
    name: '孙七',
    email: 'sunqi@company.com',
    phone: '13587426398',
    avatar: '',
    department: '营销部',
    position: '营销专员',
    status: 'active',
    joinDate: '2023-04-01',
    createTime: '2023-04-01 09:30:00',
    remark: '营销部门成员',
    accounts: [
      { id: 5, username: 'sunqi_marketing', status: 'active' }
    ],
    accountDetails: [
      {
        id: 5,
        username: 'sunqi_marketing',
        roles: [{ id: 2, name: '运营' }],
        status: 'active',
        lastLogin: '2024-01-15 16:20:00',
        createTime: '2023-04-01 10:00:00'
      }
    ],
    history: []
  },
  {
    id: 6,
    employeeId: 'EMP006',
    name: '周八',
    email: 'zhouba@company.com',
    phone: '13476523841',
    avatar: '',
    department: '技术部',
    position: '前端开发',
    status: 'active',
    joinDate: '2023-05-10',
    createTime: '2023-05-10 10:15:00',
    remark: '前端开发工程师',
    accounts: [],
    accountDetails: [],
    history: []
  },
  {
    id: 7,
    employeeId: 'EMP007',
    name: '吴九',
    email: 'wujiu@company.com',
    phone: '13365417293',
    avatar: '',
    department: '技术部',
    position: '后端开发',
    status: 'active',
    joinDate: '2023-05-15',
    createTime: '2023-05-15 11:00:00',
    remark: '后端开发工程师',
    accounts: [
      { id: 6, username: 'wujiu_backend', status: 'active' }
    ],
    accountDetails: [
      {
        id: 6,
        username: 'wujiu_backend',
        roles: [{ id: 3, name: '技术' }],
        status: 'active',
        lastLogin: '2024-01-16 12:45:00',
        createTime: '2023-05-15 11:30:00'
      }
    ],
    history: []
  },
  {
    id: 8,
    employeeId: 'EMP008',
    name: '郑十',
    email: 'zhengshi@company.com',
    phone: '13254186375',
    avatar: '',
    department: '客服部',
    position: '客服专员',
    status: 'active',
    joinDate: '2023-06-01',
    createTime: '2023-06-01 09:20:00',
    remark: '客服部门成员',
    accounts: [
      { id: 7, username: 'zhengshi_service', status: 'disabled' }
    ],
    accountDetails: [
      {
        id: 7,
        username: 'zhengshi_service',
        roles: [{ id: 5, name: '客服' }],
        status: 'disabled',
        lastLogin: '2024-01-10 14:30:00',
        createTime: '2023-06-01 09:50:00'
      }
    ],
    history: []
  },
  {
    id: 9,
    employeeId: 'EMP009',
    name: '陈十一',
    email: 'chenshiyi@company.com',
    phone: '13143057264',
    avatar: '',
    department: '财务部',
    position: '会计',
    status: 'active',
    joinDate: '2023-06-15',
    createTime: '2023-06-15 14:10:00',
    remark: '财务部会计',
    accounts: [],
    accountDetails: [],
    history: []
  },
  {
    id: 10,
    employeeId: 'EMP010',
    name: '林十二',
    email: 'linshier@company.com',
    phone: '13932147865',
    avatar: '',
    department: '营销部',
    position: '市场分析师',
    status: 'active',
    joinDate: '2023-07-01',
    createTime: '2023-07-01 08:45:00',
    remark: '市场分析专员',
    accounts: [
      { id: 8, username: 'linshier_analyst', status: 'active' }
    ],
    accountDetails: [
      {
        id: 8,
        username: 'linshier_analyst',
        roles: [{ id: 2, name: '运营' }],
        status: 'active',
        lastLogin: '2024-01-15 13:20:00',
        createTime: '2023-07-01 09:15:00'
      }
    ],
    history: []
  },
  {
    id: 11,
    employeeId: 'EMP011',
    name: '黄十三',
    email: 'huangshisan@company.com',
    phone: '13821463759',
    avatar: '',
    department: '技术部',
    position: '测试工程师',
    status: 'active',
    joinDate: '2023-07-10',
    createTime: '2023-07-10 09:30:00',
    remark: '软件测试工程师',
    accounts: [],
    accountDetails: [],
    history: []
  },
  {
    id: 12,
    employeeId: 'EMP012',
    name: '何十四',
    email: 'heshisi@company.com',
    phone: '13710258496',
    avatar: '',
    department: '客服部',
    position: '客服主管',
    status: 'active',
    joinDate: '2023-07-20',
    createTime: '2023-07-20 10:00:00',
    remark: '客服部门主管',
    accounts: [
      { id: 9, username: 'heshisi_supervisor', status: 'active' }
    ],
    accountDetails: [
      {
        id: 9,
        username: 'heshisi_supervisor',
        roles: [{ id: 5, name: '客服' }, { id: 6, name: '主管' }],
        status: 'active',
        lastLogin: '2024-01-16 15:10:00',
        createTime: '2023-07-20 10:30:00'
      }
    ],
    history: []
  },
  {
    id: 13,
    employeeId: 'EMP013',
    name: '罗十五',
    email: 'luoshiwu@company.com',
    phone: '13603947521',
    avatar: '',
    department: '财务部',
    position: '出纳',
    status: 'disabled',
    joinDate: '2023-08-01',
    createTime: '2023-08-01 11:15:00',
    remark: '财务部出纳，已停用',
    accounts: [],
    accountDetails: [],
    history: []
  },
  {
    id: 14,
    employeeId: 'EMP014',
    name: '高十六',
    email: 'gaoshiliu@company.com',
    phone: '13592836471',
    avatar: '',
    department: '营销部',
    position: '品牌经理',
    status: 'active',
    joinDate: '2023-08-10',
    createTime: '2023-08-10 09:45:00',
    remark: '品牌推广经理',
    accounts: [
      { id: 10, username: 'gaoshiliu_brand', status: 'active' }
    ],
    accountDetails: [
      {
        id: 10,
        username: 'gaoshiliu_brand',
        roles: [{ id: 2, name: '运营' }],
        status: 'active',
        lastLogin: '2024-01-16 11:30:00',
        createTime: '2023-08-10 10:15:00'
      }
    ],
    history: []
  },
  {
    id: 15,
    employeeId: 'EMP015',
    name: '梁十七',
    email: 'liangshiqi@company.com',
    phone: '13481725369',
    avatar: '',
    department: '技术部',
    position: '架构师',
    status: 'active',
    joinDate: '2023-08-20',
    createTime: '2023-08-20 14:20:00',
    remark: '系统架构师',
    accounts: [
      { id: 11, username: 'liangshiqi_arch', status: 'active' }
    ],
    accountDetails: [
      {
        id: 11,
        username: 'liangshiqi_arch',
        roles: [{ id: 1, name: '管理员' }, { id: 3, name: '技术' }],
        status: 'active',
        lastLogin: '2024-01-16 16:45:00',
        createTime: '2023-08-20 14:50:00'
      }
    ],
    history: []
  },
  {
    id: 16,
    employeeId: 'EMP016',
    name: '韩十八',
    email: 'hanshiba@company.com',
    phone: '13370614258',
    avatar: '',
    department: '客服部',
    position: '客服专员',
    status: 'inactive',
    joinDate: '2023-09-01',
    createTime: '2023-09-01 08:30:00',
    remark: '已离职',
    accounts: [],
    accountDetails: [],
    history: []
  },
  {
    id: 17,
    employeeId: 'EMP017',
    name: '冯十九',
    email: 'fengshijiu@company.com',
    phone: '13265039748',
    avatar: '',
    department: '财务部',
    position: '税务专员',
    status: 'active',
    joinDate: '2023-09-10',
    createTime: '2023-09-10 13:40:00',
    remark: '税务处理专员',
    accounts: [],
    accountDetails: [],
    history: []
  },
  {
    id: 18,
    employeeId: 'EMP018',
    name: '于二十',
    email: 'yuershi@company.com',
    phone: '13154728369',
    avatar: '',
    department: '营销部',
    position: '销售代表',
    status: 'active',
    joinDate: '2023-09-20',
    createTime: '2023-09-20 10:25:00',
    remark: '销售代表',
    accounts: [
      { id: 12, username: 'yuershi_sales', status: 'active' }
    ],
    accountDetails: [
      {
        id: 12,
        username: 'yuershi_sales',
        roles: [{ id: 7, name: '销售' }],
        status: 'active',
        lastLogin: '2024-01-15 17:20:00',
        createTime: '2023-09-20 10:55:00'
      }
    ],
    history: []
  },
  {
    id: 19,
    employeeId: 'EMP019',
    name: '邓二十一',
    email: 'dengershi@company.com',
    phone: '13043617258',
    avatar: '',
    department: '技术部',
    position: 'UI设计师',
    status: 'active',
    joinDate: '2023-10-01',
    createTime: '2023-10-01 09:10:00',
    remark: 'UI/UX设计师',
    accounts: [],
    accountDetails: [],
    history: []
  },
  {
    id: 20,
    employeeId: 'EMP020',
    name: '许二十二',
    email: 'xuerershier@company.com',
    phone: '13932506184',
    avatar: '',
    department: '客服部',
    position: '培训专员',
    status: 'active',
    joinDate: '2023-10-10',
    createTime: '2023-10-10 14:50:00',
    remark: '客服培训专员',
    accounts: [
      { id: 13, username: 'xuerershier_train', status: 'active' }
    ],
    accountDetails: [
      {
        id: 13,
        username: 'xuerershier_train',
        roles: [{ id: 5, name: '客服' }],
        status: 'active',
        lastLogin: '2024-01-14 12:15:00',
        createTime: '2023-10-10 15:20:00'
      }
    ],
    history: []
  },
  {
    id: 21,
    employeeId: 'EMP021',
    name: '傅二十三',
    email: 'fuershisan@company.com',
    phone: '13821475963',
    avatar: '',
    department: '财务部',
    position: '审计员',
    status: 'active',
    joinDate: '2023-10-20',
    createTime: '2023-10-20 11:30:00',
    remark: '内部审计员',
    accounts: [],
    accountDetails: [],
    history: []
  },
  {
    id: 22,
    employeeId: 'EMP022',
    name: '沈二十四',
    email: 'shenershisi@company.com',
    phone: '13710368529',
    avatar: '',
    department: '营销部',
    position: '内容编辑',
    status: 'active',
    joinDate: '2023-11-01',
    createTime: '2023-11-01 08:40:00',
    remark: '内容营销编辑',
    accounts: [
      { id: 14, username: 'shenershisi_editor', status: 'active' }
    ],
    accountDetails: [
      {
        id: 14,
        username: 'shenershisi_editor',
        roles: [{ id: 2, name: '运营' }],
        status: 'active',
        lastLogin: '2024-01-16 09:45:00',
        createTime: '2023-11-01 09:10:00'
      }
    ],
    history: []
  },
  {
    id: 23,
    employeeId: 'EMP023',
    name: '姚二十五',
    email: 'yaoershiwu@company.com',
    phone: '13603728146',
    avatar: '',
    department: '技术部',
    position: '运维工程师',
    status: 'active',
    joinDate: '2023-11-10',
    createTime: '2023-11-10 15:20:00',
    remark: '系统运维工程师',
    accounts: [
      { id: 15, username: 'yaoershiwu_ops', status: 'active' }
    ],
    accountDetails: [
      {
        id: 15,
        username: 'yaoershiwu_ops',
        roles: [{ id: 3, name: '技术' }],
        status: 'active',
        lastLogin: '2024-01-16 18:00:00',
        createTime: '2023-11-10 15:50:00'
      }
    ],
    history: []
  },
  {
    id: 24,
    employeeId: 'EMP024',
    name: '卢二十六',
    email: 'luershiliu@company.com',
    phone: '13492517386',
    avatar: '',
    department: '客服部',
    position: '质检员',
    status: 'active',
    joinDate: '2023-11-20',
    createTime: '2023-11-20 12:00:00',
    remark: '客服质量检查员',
    accounts: [],
    accountDetails: [],
    history: []
  },
  {
    id: 25,
    employeeId: 'EMP025',
    name: '龚二十七',
    email: 'gongerqi@company.com',
    phone: '13381406275',
    avatar: '',
    department: '财务部',
    position: '成本分析师',
    status: 'disabled',
    joinDate: '2023-12-01',
    createTime: '2023-12-01 10:45:00',
    remark: '成本控制分析师，已停用',
    accounts: [],
    accountDetails: [],
    history: []
  },
  {
    id: 26,
    employeeId: 'EMP026',
    name: '汤二十八',
    email: 'tangerba@company.com',
    phone: '13270195384',
    avatar: '',
    department: '营销部',
    position: '数据分析师',
    status: 'active',
    joinDate: '2023-12-10',
    createTime: '2023-12-10 09:15:00',
    remark: '营销数据分析师',
    accounts: [
      { id: 16, username: 'tangerba_data', status: 'active' }
    ],
    accountDetails: [
      {
        id: 16,
        username: 'tangerba_data',
        roles: [{ id: 2, name: '运营' }],
        status: 'active',
        lastLogin: '2024-01-15 20:30:00',
        createTime: '2023-12-10 09:45:00'
      }
    ],
    history: []
  },
  {
    id: 27,
    employeeId: 'EMP027',
    name: '董二十九',
    email: 'dongerjiui@company.com',
    phone: '13163284957',
    avatar: '',
    department: '技术部',
    position: '安全工程师',
    status: 'active',
    joinDate: '2023-12-20',
    createTime: '2023-12-20 14:30:00',
    remark: '信息安全工程师',
    accounts: [
      { id: 17, username: 'dongerjiui_sec', status: 'active' }
    ],
    accountDetails: [
      {
        id: 17,
        username: 'dongerjiui_sec',
        roles: [{ id: 3, name: '技术' }, { id: 8, name: '安全' }],
        status: 'active',
        lastLogin: '2024-01-16 07:45:00',
        createTime: '2023-12-20 15:00:00'
      }
    ],
    history: []
  },
  {
    id: 28,
    employeeId: 'EMP028',
    name: '薛三十',
    email: 'xuesanshi@company.com',
    phone: '13054173628',
    avatar: '',
    department: '客服部',
    position: '投诉处理专员',
    status: 'active',
    joinDate: '2024-01-05',
    createTime: '2024-01-05 08:20:00',
    remark: '客户投诉处理专员',
    accounts: [],
    accountDetails: [],
    history: []
  },
  {
    id: 29,
    employeeId: 'EMP029',
    name: '雷三十一',
    email: 'leisanshiyi@company.com',
    phone: '13945062183',
    avatar: '',
    department: '财务部',
    position: '预算分析师',
    status: 'active',
    joinDate: '2024-01-10',
    createTime: '2024-01-10 11:10:00',
    remark: '预算规划分析师',
    accounts: [
      { id: 18, username: 'leisanshiyi_budget', status: 'active' }
    ],
    accountDetails: [
      {
        id: 18,
        username: 'leisanshiyi_budget',
        roles: [{ id: 4, name: '财务' }],
        status: 'active',
        lastLogin: '2024-01-16 13:50:00',
        createTime: '2024-01-10 11:40:00'
      }
    ],
    history: []
  },
  {
    id: 30,
    employeeId: 'EMP030',
    name: '贺三十二',
    email: 'hesanshier@company.com',
    phone: '13836295174',
    avatar: '',
    department: '营销部',
    position: '社媒运营',
    status: 'active',
    joinDate: '2024-01-15',
    createTime: '2024-01-15 16:30:00',
    remark: '社交媒体运营专员',
    accounts: [
      { id: 19, username: 'hesanshier_social', status: 'active' }
    ],
    accountDetails: [
      {
        id: 19,
        username: 'hesanshier_social',
        roles: [{ id: 2, name: '运营' }],
        status: 'active',
        lastLogin: '2024-01-16 19:20:00',
        createTime: '2024-01-15 17:00:00'
      }
    ],
    history: []
  }
])

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

// 可用账号（未分配的）
const availableAccounts = ref([
  {
    id: 10,
    username: 'test_account1',
    roles: [{ id: 2, name: '运营' }]
  },
  {
    id: 11,
    username: 'test_account2',
    roles: [{ id: 3, name: '技术' }]
  }
])

// 表单数据
const personForm = ref({
  employeeId: '',
  name: '',
  email: '',
  phone: '',
  avatar: '',
  department: '',
  position: '',
  joinDate: '',
  status: 'active',
  remark: ''
})

const personRules = {
  employeeId: [{ required: true, message: '请输入员工号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
  position: [{ required: true, message: '请输入职位', trigger: 'blur' }]
}

const assignForm = ref({
  accountId: '',
  remark: ''
})

const assignRules = {
  accountId: [{ required: true, message: '请选择账号', trigger: 'change' }]
}

// 计算属性
const filteredPersons = computed(() => {
  let filtered = persons.value

  if (searchQuery.value) {
    filtered = filtered.filter(person => 
      person.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      person.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      person.phone.includes(searchQuery.value) ||
      person.employeeId.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(person => person.status === statusFilter.value)
  }

  if (departmentFilter.value) {
    filtered = filtered.filter(person => person.department === departmentFilter.value)
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

  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filtered.slice(start, end)
})

const totalPersons = computed(() => persons.value.length)
const activeCount = computed(() => persons.value.filter(p => p.status === 'active').length)
const inactiveCount = computed(() => persons.value.filter(p => p.status === 'inactive').length)

// 工具函数
const getStatusTagType = (status) => {
  const types = {
    active: 'success',
    inactive: 'info',
    disabled: 'danger'
  }
  return types[status] || 'info'
}

const getStatusLabel = (status) => {
  const labels = {
    active: '在职',
    inactive: '离职',
    disabled: '停用'
  }
  return labels[status] || status
}

// 事件处理
const handleSearch = () => {
  currentPage.value = 1
}

const handleFilter = () => {
  currentPage.value = 1
}

const handleSizeChange = (size) => {
  pageSize.value = size
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

const handleSelectionChange = (selection) => {
  selectedPersons.value = selection
}

const handleSortChange = ({ prop, order }) => {
  sortField.value = prop
  sortOrder.value = order
}

// 人员操作
const createPerson = () => {
  editingPerson.value = false
  personForm.value = {
    employeeId: '',
    name: '',
    email: '',
    phone: '',
    avatar: '',
    department: '',
    position: '',
    joinDate: '',
    status: 'active',
    remark: ''
  }
  personDialogVisible.value = true
}

const editPerson = (person) => {
  editingPerson.value = true
  personForm.value = {
    ...person
  }
  personDialogVisible.value = true
}

const viewPerson = (person) => {
  currentPerson.value = person
  detailActiveTab.value = 'basic'
  personDetailVisible.value = true
}

const savePerson = () => {
  ElMessage.success(editingPerson.value ? '人员更新成功' : '人员创建成功')
  personDialogVisible.value = false
}

const deletePerson = (person) => {
  ElMessageBox.confirm(
    `确定要删除人员 "${person.name}" 吗？删除后其关联的账号将被解绑。`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = persons.value.findIndex(p => p.id === person.id)
    if (index > -1) {
      persons.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  })
}

const toggleStatus = (person) => {
  const newStatus = person.status === 'active' ? 'disabled' : 'active'
  person.status = newStatus
  ElMessage.success(`人员已${newStatus === 'active' ? '启用' : '停用'}`)
}

const viewHistory = (person) => {
  currentPerson.value = person
  detailActiveTab.value = 'history'
  personDetailVisible.value = true
}

// 账号管理
const manageAccounts = (person) => {
  managingPerson.value = person
  accountManageVisible.value = true
}

const assignAccount = (person) => {
  managingPerson.value = person
  assignForm.value = {
    accountId: '',
    remark: ''
  }
  assignAccountVisible.value = true
}

const confirmAssignAccount = () => {
  ElMessage.success('账号分配成功')
  assignAccountVisible.value = false
  // 更新人员账号列表
  if (managingPerson.value) {
    // 这里应该更新数据
  }
}

const addAccountToPerson = () => {
  assignForm.value = {
    accountId: '',
    remark: ''
  }
  assignAccountVisible.value = true
}

const removeAccountFromPerson = (account) => {
  ElMessageBox.confirm(
    `确定要移除账号 "${account.username}" 吗？`,
    '确认移除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('账号已移除')
  })
}

const viewAccountDetail = (account) => {
  ElMessage.info(`查看账号 ${account.username} 详情`)
}

const toggleAccountStatus = (account) => {
  ElMessage.success(`账号状态已更新`)
}

const editAccount = (account) => {
  ElMessage.info(`编辑账号 ${account.username}`)
}

const resetAccountPassword = (account) => {
  ElMessageBox.confirm(
    `确定要重置账号 "${account.username}" 的密码吗？`,
    '重置密码',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('密码已重置，新密码已发送至人员邮箱')
  })
}

const removeAccount = (account) => {
  ElMessageBox.confirm(
    `确定要从该人员移除账号 "${account.username}" 吗？`,
    '确认移除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('账号已移除')
  })
}

const showAddAccountDialog = () => {
  assignForm.value = {
    accountId: '',
    remark: ''
  }
  assignAccountVisible.value = true
}

// 导入导出
const handleImport = () => {
  ElMessage.info('导入功能开发中')
}

const handleExport = () => {
  ElMessage.success('正在导出人员数据')
}

// 头像上传
const handleAvatarSuccess = (response) => {
  personForm.value.avatar = response.data.url
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
const personFormRef = ref(null)
const assignFormRef = ref(null)

onMounted(() => {
  // 初始化数据
})
</script>

<style scoped lang="scss">
.person-management-container {
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
          
          &.active {
            color: #67C23A;
          }
          
          &.inactive {
            color: #909399;
          }
        }
      }
    }
  }
}

.person-list-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
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

.person-detail {
  .detail-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 24px;
    
    .person-info {
      h3 {
        margin: 0 0 8px 0;
        font-size: 20px;
        font-weight: 600;
      }
      
      p {
        margin: 0 0 12px 0;
        color: #606266;
      }
      
      .person-tags {
        display: flex;
        gap: 8px;
      }
    }
  }
}

.accounts-section {
  .accounts-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }
}

.account-manage-section {
  .person-summary {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .info {
      h4 {
        margin: 0 0 4px 0;
        font-size: 18px;
        font-weight: 600;
      }
      
      p {
        margin: 0;
        color: #909399;
        font-size: 14px;
      }
    }
  }
  
  .existing-accounts {
    h4 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  .add-account-section {
    margin-top: 20px;
    text-align: center;
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
</style>