<template>
  <div class="role-permission-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="title">
          <el-icon><UserFilled /></el-icon>
          角色权限管理
        </h2>
        <p class="description">管理系统角色和权限，配置菜单权限和数据权限</p>
      </div>
      <div class="header-right">
        <el-button type="primary" :icon="Plus" @click="handleAddRole">
          新增角色
        </el-button>
        <el-button :icon="Refresh" @click="refreshData">刷新</el-button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <el-row :gutter="20">
        <!-- 左侧角色列表 -->
        <el-col :span="8">
          <el-card shadow="never" class="role-list-card">
            <template #header>
              <div class="card-header">
                <span class="title">角色列表</span>
                <el-input
                  v-model="roleSearchText"
                  placeholder="搜索角色"
                  :prefix-icon="Search"
                  clearable
                  size="small"
                  style="width: 200px"
                />
              </div>
            </template>

            <div class="role-list">
              <div
                v-for="role in filteredRoles"
                :key="role.id"
                class="role-item"
                :class="{ active: selectedRole?.id === role.id }"
                @click="selectRole(role)"
              >
                <div class="role-info">
                  <div class="role-name">
                    <el-tag
                      type="danger"
                      size="small"
                      style="margin-right: 8px"
                      v-if="role.code === 'ADMIN'"
                    >
                      内置
                    </el-tag>
                    <span :style="role.code === 'ADMIN' ? 'color: #f56c6c; font-weight: bold;' : ''">
                      {{ role.name }}
                    </span>
                  </div>
                  <div class="role-desc">{{ role.description }}</div>
                  <div class="role-meta">
                    <span class="user-count">{{ role.userCount }}个用户</span>
                    <span class="permission-count">{{ role.permissions.length }}个权限</span>
                  </div>
                </div>
                <div class="role-actions">
                  <el-dropdown trigger="click" placement="bottom-end">
                    <el-button type="text" :icon="MoreFilled" />
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item @click.stop="handleEditRole(role)" :disabled="role.code === 'ADMIN'">
                          <el-icon><Edit /></el-icon>编辑
                        </el-dropdown-item>
                        <el-dropdown-item @click.stop="handleCopyRole(role)" :disabled="role.code === 'ADMIN'">
                          <el-icon><CopyDocument /></el-icon>复制
                        </el-dropdown-item>
                        <el-dropdown-item
                          v-if="role.code !== 'ADMIN'"
                          divided
                          @click.stop="handleDeleteRole(role)"
                        >
                          <el-icon><Delete /></el-icon>删除
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧权限配置 -->
        <el-col :span="16">
          <el-card shadow="never" class="permission-config-card">
            <template #header>
              <div class="card-header">
                <span class="title">
                  {{ selectedRole ? `${selectedRole.name} - 权限配置` : '请选择角色' }}
                </span>
                <div v-if="selectedRole" class="header-actions">
                  <el-button size="small" @click="expandAllMenus">展开全部</el-button>
                  <el-button size="small" @click="collapseAllMenus">收起全部</el-button>
                  <el-button type="primary" size="small" @click="savePermissions">
                    保存权限
                  </el-button>
                </div>
              </div>
            </template>

            <div v-if="!selectedRole" class="no-selection">
              <el-empty description="请从左侧选择一个角色进行权限配置" />
            </div>

            <div v-else class="permission-content">
              <el-tabs v-model="activeTab" type="border-card">
                <!-- 菜单权限 -->
                <el-tab-pane label="菜单权限" name="menu">
                  <div class="menu-permissions">
                    <div class="toolbar">
                      <div class="toolbar-left">
                        <el-checkbox
                          v-model="selectAllMenus"
                          :indeterminate="isMenuIndeterminate"
                          @change="handleCheckAllMenus"
                        >
                          全选
                        </el-checkbox>
                        <div class="tip" style="color: #f56c6c;">
                          <el-icon><InfoFilled /></el-icon>
                          勾选菜单项将授予对应的页面访问权限
                        </div>
                      </div>
                    </div>
                    <el-tree
                      ref="menuTreeRef"
                      :data="menuTree"
                      :props="treeProps"
                      node-key="id"
                      show-checkbox
                      :default-checked-keys="checkedMenus"
                      @check="handleMenuCheck"
                      class="menu-tree"
                    >
                      <template #default="{ node, data }">
                        <div class="menu-node">
                          <el-icon>
                            <component :is="data.icon" />
                          </el-icon>
                          <span class="menu-name">{{ data.name }}</span>
                          <span v-if="data.path" class="menu-path">{{ data.path }}</span>
                        </div>
                      </template>
                    </el-tree>
                  </div>
                </el-tab-pane>

                <!-- 功能权限 -->
                <el-tab-pane label="功能权限" name="action" disabled>
                  <div class="action-permissions">
                    <div class="permission-groups">
                      <div
                        v-for="group in permissionGroups"
                        :key="group.id"
                        class="permission-group"
                      >
                        <div class="group-header">
                          <el-checkbox
                            :model-value="isGroupChecked(group)"
                            :indeterminate="isGroupIndeterminate(group)"
                            @change="(val) => handleGroupCheck(group, val)"
                          >
                            {{ group.name }}
                          </el-checkbox>
                          <span class="group-desc">{{ group.description }}</span>
                        </div>
                        <div class="group-permissions">
                          <el-checkbox-group
                            :model-value="getGroupCheckedPermissions(group)"
                            @change="(val) => handlePermissionCheck(group, val)"
                          >
                            <el-checkbox
                              v-for="permission in group.permissions"
                              :key="permission.id"
                              :label="permission.id"
                              :value="permission.id"
                            >
                              <div class="permission-item">
                                <span class="permission-name">{{ permission.name }}</span>
                                <span class="permission-code">{{ permission.code }}</span>
                              </div>
                            </el-checkbox>
                          </el-checkbox-group>
                        </div>
                      </div>
                    </div>
                  </div>
                </el-tab-pane>

                <!-- 数据权限 -->
                <el-tab-pane label="数据权限" name="data" disabled>
                  <div class="data-permissions">
                    <el-form :model="dataPermissionForm" label-width="120px">
                      <el-form-item label="数据范围">
                        <el-radio-group v-model="dataPermissionForm.dataScope">
                          <el-radio value="all">全部数据</el-radio>
                          <el-radio value="self">仅本人数据</el-radio>
                          <el-radio value="department">本部门数据</el-radio>
                          <el-radio value="department_and_sub">本部门及下级部门数据</el-radio>
                          <el-radio value="custom">自定义数据权限</el-radio>
                        </el-radio-group>
                      </el-form-item>

                      <el-form-item
                        v-if="dataPermissionForm.dataScope === 'custom'"
                        label="部门权限"
                      >
                        <el-tree
                          ref="deptTreeRef"
                          :data="departmentTree"
                          :props="{ label: 'name', children: 'children' }"
                          node-key="id"
                          show-checkbox
                          :default-checked-keys="dataPermissionForm.departments"
                          @check="handleDeptCheck"
                        />
                      </el-form-item>

                      <el-form-item label="客户权限">
                        <el-checkbox-group v-model="dataPermissionForm.customerPermissions">
                          <el-checkbox value="own">仅自己创建的客户</el-checkbox>
                          <el-checkbox value="department">部门内客户</el-checkbox>
                          <el-checkbox value="shared">共享客户</el-checkbox>
                          <el-checkbox value="public">公共客户池</el-checkbox>
                        </el-checkbox-group>
                      </el-form-item>

                      <el-form-item label="营销活动权限">
                        <el-checkbox-group v-model="dataPermissionForm.campaignPermissions">
                          <el-checkbox value="create">创建活动</el-checkbox>
                          <el-checkbox value="edit_own">编辑自己的活动</el-checkbox>
                          <el-checkbox value="edit_all">编辑所有活动</el-checkbox>
                          <el-checkbox value="delete_own">删除自己的活动</el-checkbox>
                          <el-checkbox value="delete_all">删除所有活动</el-checkbox>
                        </el-checkbox-group>
                      </el-form-item>

                      <el-form-item label="数据导出权限">
                        <el-switch
                          v-model="dataPermissionForm.allowExport"
                          active-text="允许导出数据"
                          inactive-text="禁止导出数据"
                        />
                      </el-form-item>
                    </el-form>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 角色编辑对话框 -->
    <el-dialog
      v-model="roleDialogVisible"
      :title="isEditMode ? '编辑角色' : '新增角色'"
      width="600px"
      @close="resetRoleForm"
    >
      <el-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="roleRules"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input
            v-model="roleForm.name"
            placeholder="请输入角色名称"
            @input="generateRoleCode"
          />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input
            v-model="roleForm.code"
            placeholder="系统自动生成"
            disabled
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="roleForm.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input
            v-model="roleForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRole" :loading="saveLoading">
          {{ isEditMode ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Refresh,
  Search,
  Edit,
  Delete,
  CopyDocument,
  MoreFilled,
  UserFilled,
  InfoFilled
} from '@element-plus/icons-vue'
import {
  getRoleList,
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
  checkRoleCode,
  getRoleMenus,
  saveRoleMenus
} from '@/api/system/role'

// 响应式数据
const roleSearchText = ref('')
const selectedRole = ref(null)
const activeTab = ref('menu')
const roleDialogVisible = ref(false)
const isEditMode = ref(false)
const saveLoading = ref(false)
const selectAllMenus = ref(false)
const isMenuIndeterminate = ref(false)

// 表单引用
const roleFormRef = ref()
const menuTreeRef = ref()
const deptTreeRef = ref()

// 角色数据
const roles = ref([])

// 角色表单
const roleForm = reactive({
  name: '',
  code: '',
  description: '',
  status: 1
})

// 表单验证规则
const roleRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '角色名称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '角色编码不能为空', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入角色描述', trigger: 'blur' }
  ]
}

// 菜单树数据 - 基于真实路由结构
const menuTree = ref([
  {
    id: 'dashboard',
    name: '营销控制台',
    icon: 'Odometer',
    path: '/dashboard',
    children: [
      { id: 'dashboard-index', name: '数据概览', icon: 'Monitor', path: '/dashboard/index' }
    ]
  },
  {
    id: 'product',
    name: '产品管理',
    icon: 'Box',
    type: '菜单',
    path: '/product',
    children: [
      { id: 'product-category', name: '产品分类', icon: 'FolderOpened', path: '/product/category' },
      { id: 'product-list', name: '产品管理', icon: 'Goods', path: '/product/list' },
      { id: 'product-media', name: '多媒体管理', icon: 'Picture', path: '/product/media' },
      { id: 'product-multilang', name: '多语言内容', icon: 'ChatDotRound', path: '/product/multilang' },
      { id: 'product-price', name: '价格管理', icon: 'Coin', path: '/product/price' }
    ]
  },
  {
    id: 'customer',
    name: '客户采集管理',
    icon: 'Upload',
    type: '菜单',
    path: '/customer',
    children: [
      { id: 'customer-import', name: '数据导入', icon: 'Document', path: '/customer/import' },
      { id: 'customer-api', name: 'API采集', icon: 'Connection', path: '/customer/api' },
      { id: 'customer-clean', name: '数据清洗', icon: 'CircleCheck', path: '/customer/clean' }
    ]
  },
  {
    id: 'ai-assistant',
    name: 'AI营销助手',
    icon: 'MagicStick',
    type: '菜单',
    path: '/ai-assistant',
    children: [
      { id: 'ai-content', name: '内容生成', icon: 'EditPen', path: '/ai-assistant/content' },
      { id: 'ai-email-template', name: '邮件模板生成', icon: 'Message', path: '/ai-assistant/email-template' },
      { id: 'ai-social-content', name: '社媒话术生成', icon: 'ChatLineRound', path: '/ai-assistant/social-content' },
      { id: 'ai-multi-language', name: '多语言生成', icon: 'Grid', path: '/ai-assistant/multi-language' },
      { id: 'ai-translate', name: '多语言翻译', icon: 'Switch', path: '/ai-assistant/translate' },
      { id: 'ai-recommend', name: '智能推荐', icon: 'Star', path: '/ai-assistant/recommend' }
    ]
  },
  {
    id: 'customer-center',
    name: '客户管理中心',
    icon: 'User',
    type: '菜单',
    path: '/customer-center',
    children: [
      { id: 'customer-list', name: '客户列表', icon: 'UserFilled', path: '/customer-center/list' },
      { id: 'customer-detail', name: '客户详情', icon: 'View', path: '/customer-center/detail/:id' },
      { id: 'customer-profile', name: '客户画像', icon: 'Postcard', path: '/customer-center/profile' },
      { id: 'customer-group', name: '客户分组', icon: 'Collection', path: '/customer-center/group' }
    ]
  },
  {
    id: 'campaign',
    name: '营销活动管理',
    icon: 'Promotion',
    type: '菜单',
    path: '/campaign',
    children: [
      { id: 'campaign-list', name: '活动列表', icon: 'List', path: '/campaign/list' },
      { id: 'campaign-customer-selection', name: '客户选择', icon: 'Select', path: '/campaign/customer-selection' },
      { id: 'campaign-content-config', name: '内容配置', icon: 'Setting', path: '/campaign/content-config' },
      { id: 'campaign-channel-settings', name: '渠道设置', icon: 'Position', path: '/campaign/channel-settings' },
      { id: 'campaign-template', name: '活动模板', icon: 'Tickets', path: '/campaign/template' }
    ]
  },
  {
    id: 'channel',
    name: '渠道触达模块',
    icon: 'Guide',
    type: '菜单',
    path: '/channel',
    children: [
      { id: 'channel-email', name: '邮件营销', icon: 'Message', path: '/channel/email' },
      { id: 'channel-social', name: '社媒营销', icon: 'Share', path: '/channel/social' },
      { id: 'channel-whatsapp', name: 'WhatsApp营销', icon: 'ChatDotSquare', path: '/channel/whatsapp' }
    ]
  },
  {
    id: 'tracking',
    name: '行为追踪分析',
    icon: 'TrendCharts',
    type: '菜单',
    path: '/tracking',
    children: [
      { id: 'tracking-email', name: '邮件追踪', icon: 'DataAnalysis', path: '/tracking/email' },
      { id: 'tracking-website', name: '网站追踪', icon: 'DataBoard', path: '/tracking/website' },
      { id: 'tracking-funnel', name: '转化漏斗', icon: 'Histogram', path: '/tracking/funnel' }
    ]
  },
  {
    id: 'report',
    name: '报表中心',
    icon: 'Document',
    type: '菜单',
    path: '/report',
    children: [
      { id: 'report-overview', name: '营销总览', icon: 'Monitor', path: '/report/overview' },
      { id: 'report-customer', name: '客户分析', icon: 'Pie', path: '/report/customer' },
      { id: 'report-custom', name: '自定义报表', icon: 'SetUp', path: '/report/custom' }
    ]
  },
  {
    id: 'system',
    name: '系统管理',
    icon: 'Tools',
    type: '菜单',
    path: '/system',
    children: [
      { id: 'system-personnel', name: '人员信息', icon: 'Avatar', path: '/system/personnel' },
      { id: 'system-account', name: '账号管理', icon: 'User', path: '/system/account' },
      { id: 'system-role', name: '角色权限', icon: 'Key', path: '/system/role' },
      { id: 'system-department', name: '部门管理', icon: 'OfficeBuilding', path: '/system/department' },
      { id: 'system-position', name: '岗位管理', icon: 'Suitcase', path: '/system/position' },
      { id: 'system-personnel', name: '人员管理', icon: 'UserFilled', path: '/system/personnel' },
      { id: 'system-config', name: '系统配置', icon: 'Setting', path: '/system/config' },
      { id: 'system-log', name: '操作日志', icon: 'Notebook', path: '/system/log' },
      { id: 'system-notification', name: '消息管理', icon: 'Bell', path: '/system/notification' }
    ]
  }
])

// 权限分组数据
const permissionGroups = ref([
  {
    id: 1,
    name: '用户管理',
    description: '用户账户相关操作权限',
    permissions: [
      { id: 'user:read', name: '查看用户', code: 'user:read' },
      { id: 'user:create', name: '创建用户', code: 'user:create' },
      { id: 'user:update', name: '编辑用户', code: 'user:update' },
      { id: 'user:delete', name: '删除用户', code: 'user:delete' },
      { id: 'user:import', name: '导入用户', code: 'user:import' },
      { id: 'user:export', name: '导出用户', code: 'user:export' }
    ]
  },
  {
    id: 2,
    name: '角色管理',
    description: '角色和权限相关操作',
    permissions: [
      { id: 'role:read', name: '查看角色', code: 'role:read' },
      { id: 'role:create', name: '创建角色', code: 'role:create' },
      { id: 'role:update', name: '编辑角色', code: 'role:update' },
      { id: 'role:delete', name: '删除角色', code: 'role:delete' },
      { id: 'permission:assign', name: '分配权限', code: 'permission:assign' }
    ]
  },
  {
    id: 3,
    name: '客户管理',
    description: '客户信息相关操作权限',
    permissions: [
      { id: 'customer:read', name: '查看客户', code: 'customer:read' },
      { id: 'customer:create', name: '创建客户', code: 'customer:create' },
      { id: 'customer:update', name: '编辑客户', code: 'customer:update' },
      { id: 'customer:delete', name: '删除客户', code: 'customer:delete' },
      { id: 'customer:import', name: '导入客户', code: 'customer:import' },
      { id: 'customer:export', name: '导出客户', code: 'customer:export' },
      { id: 'customer:assign', name: '分配客户', code: 'customer:assign' }
    ]
  },
  {
    id: 4,
    name: '产品管理',
    description: '产品信息相关操作权限',
    permissions: [
      { id: 'product:read', name: '查看产品', code: 'product:read' },
      { id: 'product:create', name: '创建产品', code: 'product:create' },
      { id: 'product:update', name: '编辑产品', code: 'product:update' },
      { id: 'product:delete', name: '删除产品', code: 'product:delete' },
      { id: 'product:category', name: '管理分类', code: 'product:category' },
      { id: 'product:price', name: '管理价格', code: 'product:price' }
    ]
  },
  {
    id: 5,
    name: '营销活动',
    description: '营销活动相关操作权限',
    permissions: [
      { id: 'campaign:read', name: '查看活动', code: 'campaign:read' },
      { id: 'campaign:create', name: '创建活动', code: 'campaign:create' },
      { id: 'campaign:update', name: '编辑活动', code: 'campaign:update' },
      { id: 'campaign:delete', name: '删除活动', code: 'campaign:delete' },
      { id: 'campaign:execute', name: '执行活动', code: 'campaign:execute' },
      { id: 'campaign:stop', name: '停止活动', code: 'campaign:stop' }
    ]
  },
  {
    id: 6,
    name: '数据分析',
    description: '数据分析和报表权限',
    permissions: [
      { id: 'analytics:read', name: '查看分析', code: 'analytics:read' },
      { id: 'report:read', name: '查看报表', code: 'report:read' },
      { id: 'report:create', name: '创建报表', code: 'report:create' },
      { id: 'report:export', name: '导出报表', code: 'report:export' },
      { id: 'dashboard:config', name: '配置仪表板', code: 'dashboard:config' }
    ]
  },
  {
    id: 7,
    name: '系统配置',
    description: '系统设置和配置权限',
    permissions: [
      { id: 'system:config', name: '系统配置', code: 'system:config' },
      { id: 'system:backup', name: '数据备份', code: 'system:backup' },
      { id: 'system:log', name: '查看日志', code: 'system:log' },
      { id: 'system:monitor', name: '系统监控', code: 'system:monitor' }
    ]
  }
])

// 部门树数据
const departmentTree = ref([
  {
    id: 1,
    name: '总公司',
    children: [
      {
        id: 11,
        name: '营销部',
        children: [
          { id: 111, name: '市场推广组' },
          { id: 112, name: '品牌营销组' },
          { id: 113, name: '数字营销组' }
        ]
      },
      {
        id: 12,
        name: '销售部',
        children: [
          { id: 121, name: '国内销售组' },
          { id: 122, name: '海外销售组' },
          { id: 123, name: '大客户销售组' }
        ]
      },
      {
        id: 13,
        name: '技术部',
        children: [
          { id: 131, name: '产品开发组' },
          { id: 132, name: '运维支持组' }
        ]
      },
      { id: 14, name: '人事行政部' },
      { id: 15, name: '财务部' }
    ]
  }
])

// 数据权限表单
const dataPermissionForm = reactive({
  dataScope: 'department',
  departments: [],
  customerPermissions: ['own', 'department'],
  campaignPermissions: ['create', 'edit_own'],
  allowExport: false
})

// 当前角色的权限状态
const checkedMenus = ref([])
const checkedPermissions = ref([])

// 树形组件属性
const treeProps = {
  children: 'children',
  label: 'name'
}

// 计算属性
const filteredRoles = computed(() => {
  let filtered = roles.value
  if (roleSearchText.value) {
    const searchLower = roleSearchText.value.toLowerCase()
    filtered = filtered.filter(role =>
      role.name.toLowerCase().includes(searchLower) ||
      (role.description && role.description.toLowerCase().includes(searchLower)) ||
      role.code.toLowerCase().includes(searchLower)
    )
  }
  // 按类型排序，系统角色排在前面
  return filtered.sort((a, b) => {
    if (a.type === 'system' && b.type !== 'system') return -1
    if (a.type !== 'system' && b.type === 'system') return 1
    // 如果都是系统角色，admin角色排在最前面
    if (a.type === 'system' && b.type === 'system') {
      if (a.code === 'admin') return -1
      if (b.code === 'admin') return 1
    }
    return 0
  })
})

// 监听选中的角色变化
watch(selectedRole, (newRole) => {
  if (newRole) {
    loadRolePermissions(newRole)
  }
})

// 方法定义
const selectRole = async (role) => {
  selectedRole.value = role
  await loadRoleMenuPermissions(role)
}

// 加载角色菜单权限
const loadRoleMenuPermissions = async (role) => {
  try {
    if (role.code === 'ADMIN') {
      // 系统管理员拥有所有权限
      checkedMenus.value = getAllMenuIds()
    } else {
      // 从后端加载角色菜单权限
      const response = await getRoleMenus(role.id)
      // 确保返回的是数组
      const result = response?.data || response || []
      checkedMenus.value = Array.isArray(result) ? result : []
    }

    // 更新树组件的选中状态
    nextTick(() => {
      menuTreeRef.value?.setCheckedKeys(checkedMenus.value)
      updateMenuSelectState()
    })
  } catch (error) {
    console.error('加载角色菜单权限失败:', error)
    ElMessage.error('加载角色菜单权限失败')
    checkedMenus.value = []
  }
}

// 保存角色菜单权限
const saveRoleMenuPermissions = async () => {
  if (!selectedRole.value) {
    ElMessage.warning('请先选择角色')
    return
  }

  if (selectedRole.value.code === 'ADMIN') {
    ElMessage.warning('系统管理员角色权限不可修改')
    return
  }

  try {
    const response = await fetch(`/api/system/roles/${selectedRole.value.id}/menus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(checkedMenus.value)
    })

    const result = await response.json()
    if (result.success) {
      ElMessage.success('保存菜单权限成功')
    } else {
      ElMessage.error(result.message || '保存菜单权限失败')
    }
  } catch (error) {
    console.error('保存菜单权限失败:', error)
    ElMessage.error('保存菜单权限失败')
  }
}

const loadRolePermissions = (role) => {
  // 加载角色的菜单权限
  if (role.id === 1) { // 超级管理员
    checkedMenus.value = getAllMenuIds()
    checkedPermissions.value = getAllPermissionIds()
  } else {
    // 根据角色权限加载对应的菜单和功能权限
    checkedMenus.value = role.permissions.includes('*') ? getAllMenuIds() : 
      getMenuIdsByPermissions(role.permissions)
    checkedPermissions.value = role.permissions.includes('*') ? getAllPermissionIds() : 
      role.permissions
  }
  
  // 更新数据权限表单
  updateDataPermissionForm(role)
  
  // 更新菜单全选状态
  updateMenuSelectState()
}

const getAllMenuIds = () => {
  const ids = []
  const traverse = (nodes) => {
    nodes.forEach(node => {
      ids.push(node.id)
      if (node.children) {
        traverse(node.children)
      }
    })
  }
  traverse(menuTree.value)
  return ids
}

const getAllPermissionIds = () => {
  const ids = []
  permissionGroups.value.forEach(group => {
    group.permissions.forEach(permission => {
      ids.push(permission.id)
    })
  })
  return ids
}

const getMenuIdsByPermissions = (permissions) => {
  // 根据权限码映射到菜单ID的逻辑
  const menuMapping = {
    'marketing:read': [1],
    'product:read': [2, 21, 22, 23, 24, 25],
    'customer:read': [5, 51, 52, 53, 54],
    'customer:write': [5, 51, 52, 53, 54],
    'campaign:read': [6, 61, 62, 63, 64],
    'report:read': [9, 91, 92, 93],
    'analytics:read': [8, 81, 82, 83]
  }
  
  const menuIds = new Set()
  permissions.forEach(permission => {
    if (menuMapping[permission]) {
      menuMapping[permission].forEach(id => menuIds.add(id))
    }
  })
  
  return Array.from(menuIds)
}

const updateDataPermissionForm = (role) => {
  // 根据角色更新数据权限表单
  if (role.id === 1) {
    dataPermissionForm.dataScope = 'all'
    dataPermissionForm.customerPermissions = ['own', 'department', 'shared', 'public']
    dataPermissionForm.campaignPermissions = ['create', 'edit_all', 'delete_all']
    dataPermissionForm.allowExport = true
  } else {
    // 根据具体角色设置默认值
    dataPermissionForm.dataScope = 'department'
    dataPermissionForm.customerPermissions = ['own', 'department']
    dataPermissionForm.campaignPermissions = ['create', 'edit_own']
    dataPermissionForm.allowExport = role.permissions.includes('report:export')
  }
}

const updateMenuSelectState = () => {
  const allMenuIds = getAllMenuIds()
  const checkedCount = checkedMenus.value.length
  const totalCount = allMenuIds.length
  
  selectAllMenus.value = checkedCount === totalCount
  isMenuIndeterminate.value = checkedCount > 0 && checkedCount < totalCount
}

const handleCheckAllMenus = (val) => {
  if (val) {
    checkedMenus.value = getAllMenuIds()
    menuTreeRef.value?.setCheckedKeys(checkedMenus.value)
  } else {
    checkedMenus.value = []
    menuTreeRef.value?.setCheckedKeys([])
  }
  updateMenuSelectState()
}

const handleMenuCheck = (data, checked) => {
  checkedMenus.value = checked.checkedKeys
  updateMenuSelectState()
}

const expandAllMenus = () => {
  const allKeys = getAllMenuIds()
  allKeys.forEach(key => {
    menuTreeRef.value?.getNode(key)?.expand()
  })
}

const collapseAllMenus = () => {
  const allKeys = getAllMenuIds()
  allKeys.forEach(key => {
    menuTreeRef.value?.getNode(key)?.collapse()
  })
}

// 保存菜单权限配置
const saveMenuPermissions = async () => {
  if (!selectedRole.value) {
    ElMessage.warning('请先选择一个角色')
    return
  }

  // 系统管理员角色不允许修改权限
  if (selectedRole.value.code === 'ADMIN') {
    ElMessage.warning('系统管理员角色权限不可修改')
    return
  }

  try {
    // 获取当前选中的菜单权限
    const selectedMenus = menuTreeRef.value?.getCheckedKeys() || []
    const halfCheckedMenus = menuTreeRef.value?.getHalfCheckedKeys() || []

    // 将菜单权限转换为路径形式，便于后续路由权限控制
    const menuPaths = []
    const traverse = (nodes) => {
      nodes.forEach(node => {
        if (selectedMenus.includes(node.id) && node.path) {
          menuPaths.push(node.path)
        }
        if (node.children) {
          traverse(node.children)
        }
      })
    }
    traverse(menuTree.value)

    console.log('保存角色菜单权限:', {
      roleId: selectedRole.value.id,
      roleName: selectedRole.value.name,
      menuPermissions: selectedMenus,
      halfChecked: halfCheckedMenus,
      menuPaths: menuPaths
    })

    // 这里可以调用后端API保存权限
    // await roleApi.updateMenuPermissions(selectedRole.value.id, {
    //   menuPermissions: selectedMenus,
    //   menuPaths: menuPaths
    // })

    ElMessage.success(`已成功保存角色"${selectedRole.value.name}"的菜单权限配置`)
  } catch (error) {
    console.error('保存菜单权限失败:', error)
    ElMessage.error('保存菜单权限失败，请重试')
  }
}

const isGroupChecked = (group) => {
  return group.permissions.every(permission => 
    checkedPermissions.value.includes(permission.id)
  )
}

const isGroupIndeterminate = (group) => {
  const checkedCount = group.permissions.filter(permission => 
    checkedPermissions.value.includes(permission.id)
  ).length
  return checkedCount > 0 && checkedCount < group.permissions.length
}

const getGroupCheckedPermissions = (group) => {
  return group.permissions
    .filter(permission => checkedPermissions.value.includes(permission.id))
    .map(permission => permission.id)
}

const handleGroupCheck = (group, checked) => {
  if (checked) {
    group.permissions.forEach(permission => {
      if (!checkedPermissions.value.includes(permission.id)) {
        checkedPermissions.value.push(permission.id)
      }
    })
  } else {
    group.permissions.forEach(permission => {
      const index = checkedPermissions.value.indexOf(permission.id)
      if (index > -1) {
        checkedPermissions.value.splice(index, 1)
      }
    })
  }
}

const handlePermissionCheck = (group, checkedValues) => {
  // 移除该组的所有权限
  group.permissions.forEach(permission => {
    const index = checkedPermissions.value.indexOf(permission.id)
    if (index > -1) {
      checkedPermissions.value.splice(index, 1)
    }
  })
  
  // 添加新选中的权限
  checkedValues.forEach(permissionId => {
    if (!checkedPermissions.value.includes(permissionId)) {
      checkedPermissions.value.push(permissionId)
    }
  })
}

const handleDeptCheck = (data, checked) => {
  dataPermissionForm.departments = checked.checkedKeys
}

const savePermissions = async () => {
  if (!selectedRole.value) return

  try {
    // 去重菜单ID，避免重复插入
    const uniqueMenuIds = [...new Set(checkedMenus.value)]

    console.log('保存菜单权限:', {
      roleId: selectedRole.value.id,
      menuIds: uniqueMenuIds,
      originalCount: checkedMenus.value.length,
      uniqueCount: uniqueMenuIds.length
    })

    // 调用API保存菜单权限
    await saveRoleMenus(selectedRole.value.id, uniqueMenuIds)

    // 更新本地数据
    selectedRole.value.permissions = checkedPermissions.value

    ElMessage.success('权限保存成功')
  } catch (error) {
    console.error('保存权限失败:', error)
    ElMessage.error('权限保存失败: ' + (error.response?.data?.message || error.message))
  }
}

const handleAddRole = () => {
  isEditMode.value = false
  roleDialogVisible.value = true
  resetRoleForm()
}

const handleEditRole = (role) => {
  isEditMode.value = true
  roleDialogVisible.value = true
  selectedRole.value = role

  // 填充表单数据
  Object.assign(roleForm, {
    name: role.name,
    code: role.code,
    description: role.description,
    status: role.status
  })
}

const handleCopyRole = (role) => {
  isEditMode.value = false
  roleDialogVisible.value = true
  
  // 复制角色数据
  Object.assign(roleForm, {
    name: role.name + '_副本',
    code: role.code + '_copy',
    description: role.description,
    status: role.status
  })
}

const handleDeleteRole = async (role) => {
  if (role.type === 'system') {
    ElMessage.warning('系统内置角色不能删除')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除角色"${role.name}"吗？删除后无法恢复。`,
      '删除确认',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }
    )

    // 调用删除API
    await deleteRole(role.id)

    // 重新加载角色列表
    await loadRoles()

    // 如果删除的是当前选中的角色，清空选择
    if (selectedRole.value?.id === role.id) {
      selectedRole.value = null
    }

    ElMessage.success('角色删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 将中文转换为拼音（简单实现，只处理常见字符）
const toPinyin = (chinese) => {
  // 简单的中文到拼音映射表（可以根据需要扩展）
  const pinyinMap = {
    '管理': 'guanli',
    '管': 'guan',
    '理': 'li',
    '员': 'yuan',
    '营销': 'yingxiao',
    '营': 'ying',
    '销': 'xiao',
    '售': 'shou',
    '销售': 'xiaoshou',
    '经理': 'jingli',
    '经': 'jing',
    '主管': 'zhuguan',
    '主': 'zhu',
    '专员': 'zhuanyuan',
    '专': 'zhuan',
    '助理': 'zhuli',
    '助': 'zhu',
    '总监': 'zongjian',
    '总': 'zong',
    '监': 'jian',
    '财务': 'caiwu',
    '财': 'cai',
    '务': 'wu',
    '人事': 'renshi',
    '人': 'ren',
    '事': 'shi',
    '技术': 'jishu',
    '技': 'ji',
    '术': 'shu',
    '运维': 'yunwei',
    '运': 'yun',
    '维': 'wei',
    '开发': 'kaifa',
    '开': 'kai',
    '发': 'fa',
    '测试': 'ceshi',
    '测': 'ce',
    '试': 'shi',
    '设计': 'sheji',
    '设': 'she',
    '计': 'ji',
    '产品': 'chanpin',
    '产': 'chan',
    '品': 'pin',
    '市场': 'shichang',
    '市': 'shi',
    '场': 'chang',
    '客服': 'kefu',
    '客': 'ke',
    '服': 'fu',
    '行政': 'xingzheng',
    '行': 'xing',
    '政': 'zheng',
    '审核': 'shenhe',
    '审': 'shen',
    '核': 'he',
    '超级': 'chaoji',
    '超': 'chao',
    '级': 'ji',
    '普通': 'putong',
    '普': 'pu',
    '通': 'tong',
    '高级': 'gaoji',
    '高': 'gao',
    '中级': 'zhongji',
    '中': 'zhong',
    '初级': 'chuji',
    '初': 'chu',
    '访客': 'fangke',
    '访': 'fang',
    '游客': 'youke',
    '游': 'you'
  }

  let result = ''
  let i = 0
  while (i < chinese.length) {
    let matched = false
    // 先尝试匹配两个字的词
    if (i < chinese.length - 1) {
      const twoChars = chinese.substring(i, i + 2)
      if (pinyinMap[twoChars]) {
        result += pinyinMap[twoChars]
        i += 2
        matched = true
      }
    }
    // 如果没匹配到，尝试单个字
    if (!matched) {
      const char = chinese[i]
      if (pinyinMap[char]) {
        result += pinyinMap[char]
      } else if (/[a-zA-Z0-9]/.test(char)) {
        // 如果是英文或数字，直接保留
        result += char.toLowerCase()
      }
      i++
    }
    // 添加下划线分隔符
    if (i < chinese.length && result && !result.endsWith('_')) {
      result += '_'
    }
  }

  // 清理结果：移除末尾的下划线，确保以字母开头
  result = result.replace(/_+$/, '').replace(/^[^a-zA-Z]+/, '').replace(/_+/g, '_')

  // 如果结果为空或不以字母开头，添加前缀
  if (!result || !/^[a-zA-Z]/.test(result)) {
    result = 'role_' + (result || Date.now())
  }

  return result
}

// 生成角色编码
const generateRoleCode = () => {
  if (!isEditMode.value && roleForm.name) {
    // 将中文角色名称转换为拼音编码
    const code = toPinyin(roleForm.name)
    roleForm.code = code.toLowerCase()
  }
}

const resetRoleForm = () => {
  Object.assign(roleForm, {
    name: '',
    code: '',
    description: '',
    status: 1
  })

  nextTick(() => {
    roleFormRef.value?.clearValidate()
  })
}

const saveRole = async () => {
  if (!roleFormRef.value) return

  try {
    await roleFormRef.value.validate()
    saveLoading.value = true

    // 准备提交数据
    const submitData = {
      roleName: roleForm.name,
      roleCode: roleForm.code,
      description: roleForm.description,
      status: roleForm.status,
      roleType: 'custom'
    }

    if (isEditMode.value) {
      // 更新角色
      await updateRole(selectedRole.value.id, submitData)
      ElMessage.success('角色更新成功')
    } else {
      // 创建角色
      await createRole(submitData)
      ElMessage.success('角色创建成功')
    }

    // 重新加载角色列表
    await loadRoles()
    roleDialogVisible.value = false
  } catch (error) {
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else if (error.message && !error.message.includes('验证')) {
      ElMessage.error(error.message || '操作失败')
    }
  } finally {
    saveLoading.value = false
  }
}

const refreshData = async () => {
  try {
    await loadRoles()
    ElMessage.success('数据刷新成功')
  } catch (error) {
    ElMessage.error('刷新失败')
  }
}

// 加载角色列表
const loadRoles = async () => {
  try {
    const response = await getAllRoles()
    // 将后端数据适配为前端格式
    roles.value = response.data.map(role => ({
      id: role.id,
      name: role.roleName,
      code: role.roleCode,
      description: role.description,
      type: role.roleType,
      status: role.status,
      userCount: 0, // 暂时设置为0，后续可以从后端获取
      permissions: [], // 暂时设置为空，后续可以从后端获取
      createTime: role.createTime
    }))

    // 如果有角色且没有选中角色，默认选择第一个
    if (roles.value.length > 0 && !selectedRole.value) {
      selectRole(roles.value[0])
    }
  } catch (error) {
    console.error('加载角色失败:', error)
    ElMessage.error('加载角色列表失败')
  }
}

// 初始化
const init = () => {
  loadRoles()
}

// 组件挂载后初始化
onMounted(init)
</script>

<style scoped lang="scss">
.role-permission-container {
  padding: 20px;
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
    
    .header-left {
      .title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 24px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin-bottom: 8px;
      }
      
      .description {
        color: var(--el-text-color-regular);
        margin: 0;
      }
    }
    
    .header-right {
      display: flex;
      gap: 12px;
    }
  }
  
  .main-content {
    .role-list-card {
      height: calc(100vh - 200px);
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .title {
          font-weight: 600;
        }
      }
      
      .role-list {
        max-height: calc(100vh - 300px);
        overflow-y: auto;
        
        .role-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          margin-bottom: 8px;
          border: 1px solid var(--el-border-color-light);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          
          &:hover {
            border-color: var(--el-color-primary);
            box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
          }
          
          &.active {
            border-color: var(--el-color-primary);
            background-color: var(--el-color-primary-light-9);
          }
          
          .role-info {
            flex: 1;
            
            .role-name {
              display: flex;
              align-items: center;
              font-weight: 600;
              margin-bottom: 4px;
            }
            
            .role-desc {
              color: var(--el-text-color-regular);
              font-size: 13px;
              margin-bottom: 8px;
            }
            
            .role-meta {
              display: flex;
              gap: 16px;
              font-size: 12px;
              color: var(--el-text-color-secondary);
            }
          }
          
          .role-actions {
            opacity: 0;
            transition: opacity 0.3s;
          }
          
          &:hover .role-actions {
            opacity: 1;
          }
        }
      }
    }
    
    .permission-config-card {
      height: calc(100vh - 200px);
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .title {
          font-weight: 600;
        }
        
        .header-actions {
          display: flex;
          gap: 8px;
        }
      }
      
      .no-selection {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 400px;
      }
      
      .permission-content {
        height: calc(100vh - 320px);
        
        .menu-permissions {
          .toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            padding: 12px;
            background-color: var(--el-fill-color-light);
            border-radius: 6px;

            .toolbar-left {
              display: flex;
              align-items: center;
              gap: 16px;

              .tip {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 13px;
                color: var(--el-text-color-regular);
              }
            }

            .toolbar-right {
              display: flex;
              align-items: center;
              gap: 8px;
            }
          }
          
          .menu-tree {
            max-height: calc(100vh - 450px);
            overflow-y: auto;
            
            .menu-node {
              display: flex;
              align-items: center;
              gap: 8px;

              .menu-name {
                flex: 1;
              }

              .menu-path {
                font-size: 12px;
                color: #909399;
                font-family: 'Monaco', 'Consolas', monospace;
                margin: 0 8px;
              }
            }
          }
        }
        
        .action-permissions {
          max-height: calc(100vh - 400px);
          overflow-y: auto;
          
          .permission-groups {
            .permission-group {
              margin-bottom: 24px;
              border: 1px solid var(--el-border-color-light);
              border-radius: 8px;
              overflow: hidden;
              
              .group-header {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 16px;
                background-color: var(--el-fill-color-light);
                border-bottom: 1px solid var(--el-border-color-light);
                
                .group-desc {
                  color: var(--el-text-color-regular);
                  font-size: 13px;
                }
              }
              
              .group-permissions {
                padding: 16px;
                
                .el-checkbox {
                  display: block;
                  margin-bottom: 12px;
                  margin-right: 0;
                  
                  .permission-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    
                    .permission-name {
                      flex: 1;
                    }
                    
                    .permission-code {
                      font-size: 12px;
                      color: var(--el-text-color-secondary);
                      font-family: monospace;
                    }
                  }
                }
              }
            }
          }
        }
        
        .data-permissions {
          max-height: calc(100vh - 400px);
          overflow-y: auto;
          padding: 20px;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .role-permission-container {
    .main-content {
      .el-col:first-child {
        margin-bottom: 20px;
      }
    }
  }
}
</style>
