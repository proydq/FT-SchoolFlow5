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
                    <el-button :icon="MoreFilled" text />
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
                            <component :is="data.icon || 'Document'" />
                          </el-icon>
                          <span class="menu-name">{{ data.name }}</span>
                          <span v-if="data.path" class="menu-path">{{ data.path }}</span>
                        </div>
                      </template>
                    </el-tree>
                  </div>
                </el-tab-pane>

                <!-- 功能权限 -->
                <el-tab-pane label="功能权限" name="action">
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
                            @change="(val) => handleGroupCheck(group, val as boolean)"
                          >
                            {{ group.name }}
                          </el-checkbox>
                          <span class="group-desc">{{ group.description }}</span>
                        </div>
                        <div class="group-permissions">
                          <el-checkbox-group
                            :model-value="getGroupCheckedPermissions(group)"
                            @change="(val) => handlePermissionCheck(group, val as string[])"
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
                <el-tab-pane label="数据权限" name="data">
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
        <el-form-item label="角色名称" prop="roleName">
          <el-input
            v-model="roleForm.roleName"
            placeholder="请输入角色名称"
            @input="generateRoleCode"
          />
        </el-form-item>
        <el-form-item label="角色编码" prop="roleCode">
          <el-input
            v-model="roleForm.roleCode"
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

<script setup lang="ts">
import { ref, reactive, computed, nextTick, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox, ElTree } from 'element-plus'
import type { FormInstance } from 'element-plus'
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
import type {
  RoleInfo,
  RoleFormData,
  MenuNode,
  PermissionGroup,
  DepartmentNode,
  DataPermissionForm
} from '@/types/role'

// 响应式数据
const roleSearchText = ref('')
const selectedRole = ref<RoleInfo | null>(null)
const activeTab = ref('menu')
const roleDialogVisible = ref(false)
const isEditMode = ref(false)
const saveLoading = ref(false)
const selectAllMenus = ref(false)
const isMenuIndeterminate = ref(false)

// 表单引用
const roleFormRef = ref<FormInstance>()
const menuTreeRef = ref<InstanceType<typeof ElTree>>()
const deptTreeRef = ref<InstanceType<typeof ElTree>>()

// 角色数据
const roles = ref<RoleInfo[]>([])

// 角色表单
const roleForm = reactive<RoleFormData>({
  roleName: '',
  roleCode: '',
  description: '',
  status: 1
})

// 表单验证规则
const roleRules = {
  roleName: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '角色名称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  roleCode: [
    { required: true, message: '角色编码不能为空', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入角色描述', trigger: 'blur' }
  ]
}

// 菜单树数据
const menuTree = ref<MenuNode[]>([
  {
    id: 'dashboard',
    name: '工作台',
    icon: 'Monitor',
    path: '/dashboard',
    children: []
  },
  {
    id: 'personnel',
    name: '人员管理',
    icon: 'User',
    path: '/personnel',
    children: [
      { id: 'teacher-list', name: '教师列表', icon: 'UserFilled', path: '/personnel/teacher' },
      { id: 'student-list', name: '学生列表', icon: 'Avatar', path: '/personnel/student' }
    ]
  },
  {
    id: 'class',
    name: '班级管理',
    icon: 'Collection',
    path: '/class',
    children: [
      { id: 'class-list', name: '班级列表', icon: 'List', path: '/class/list' },
      { id: 'grade-list', name: '年级管理', icon: 'Grid', path: '/class/grade' }
    ]
  },
  {
    id: 'attendance',
    name: '考勤管理',
    icon: 'Calendar',
    path: '/attendance',
    children: [
      { id: 'attendance-rules', name: '考勤规则', icon: 'Setting', path: '/attendance/rules' },
      { id: 'attendance-record', name: '考勤记录', icon: 'Document', path: '/attendance/record' },
      { id: 'attendance-statistics', name: '考勤统计', icon: 'DataAnalysis', path: '/attendance/statistics' }
    ]
  },
  {
    id: 'leave',
    name: '请假管理',
    icon: 'Clock',
    path: '/leave',
    children: [
      { id: 'leave-type', name: '请假类型', icon: 'List', path: '/leave/type' },
      { id: 'leave-application', name: '请假申请', icon: 'Edit', path: '/leave/application' },
      { id: 'leave-approval', name: '请假审批', icon: 'Check', path: '/leave/approval' },
      { id: 'leave-record', name: '请假记录', icon: 'Document', path: '/leave/record' }
    ]
  },
  {
    id: 'space',
    name: '场地管理',
    icon: 'OfficeBuilding',
    path: '/space',
    children: [
      { id: 'space-list', name: '场地列表', icon: 'Place', path: '/space/list' },
      { id: 'space-booking', name: '场地预订', icon: 'Calendar', path: '/space/booking' },
      { id: 'space-usage', name: '使用记录', icon: 'Clock', path: '/space/usage' }
    ]
  },
  {
    id: 'system',
    name: '系统管理',
    icon: 'Tools',
    path: '/system',
    children: [
      { id: 'role-permission', name: '角色权限', icon: 'Key', path: '/role/permission' },
      { id: 'department', name: '部门管理', icon: 'OfficeBuilding', path: '/department/list' },
      { id: 'position', name: '职位管理', icon: 'Suitcase', path: '/position/list' },
      { id: 'system-log', name: '操作日志', icon: 'Notebook', path: '/log/operation' },
      { id: 'system-message', name: '消息通知', icon: 'Bell', path: '/message/list' }
    ]
  }
])

// 权限分组数据
const permissionGroups = ref<PermissionGroup[]>([
  {
    id: 1,
    name: '人员管理',
    description: '教师和学生相关操作权限',
    permissions: [
      { id: 'teacher:read', name: '查看教师', code: 'teacher:read' },
      { id: 'teacher:create', name: '创建教师', code: 'teacher:create' },
      { id: 'teacher:update', name: '编辑教师', code: 'teacher:update' },
      { id: 'teacher:delete', name: '删除教师', code: 'teacher:delete' },
      { id: 'student:read', name: '查看学生', code: 'student:read' },
      { id: 'student:create', name: '创建学生', code: 'student:create' },
      { id: 'student:update', name: '编辑学生', code: 'student:update' },
      { id: 'student:delete', name: '删除学生', code: 'student:delete' }
    ]
  },
  {
    id: 2,
    name: '班级管理',
    description: '班级和年级相关操作权限',
    permissions: [
      { id: 'class:read', name: '查看班级', code: 'class:read' },
      { id: 'class:create', name: '创建班级', code: 'class:create' },
      { id: 'class:update', name: '编辑班级', code: 'class:update' },
      { id: 'class:delete', name: '删除班级', code: 'class:delete' },
      { id: 'grade:manage', name: '管理年级', code: 'grade:manage' }
    ]
  },
  {
    id: 3,
    name: '考勤管理',
    description: '考勤相关操作权限',
    permissions: [
      { id: 'attendance:read', name: '查看考勤', code: 'attendance:read' },
      { id: 'attendance:create', name: '记录考勤', code: 'attendance:create' },
      { id: 'attendance:update', name: '修改考勤', code: 'attendance:update' },
      { id: 'attendance:delete', name: '删除考勤', code: 'attendance:delete' },
      { id: 'attendance:export', name: '导出考勤', code: 'attendance:export' }
    ]
  },
  {
    id: 4,
    name: '请假管理',
    description: '请假相关操作权限',
    permissions: [
      { id: 'leave:read', name: '查看请假', code: 'leave:read' },
      { id: 'leave:apply', name: '申请请假', code: 'leave:apply' },
      { id: 'leave:approve', name: '审批请假', code: 'leave:approve' },
      { id: 'leave:reject', name: '驳回请假', code: 'leave:reject' },
      { id: 'leave:cancel', name: '撤销请假', code: 'leave:cancel' }
    ]
  },
  {
    id: 5,
    name: '系统管理',
    description: '系统设置和配置权限',
    permissions: [
      { id: 'system:config', name: '系统配置', code: 'system:config' },
      { id: 'system:log', name: '查看日志', code: 'system:log' },
      { id: 'role:manage', name: '角色管理', code: 'role:manage' },
      { id: 'department:manage', name: '部门管理', code: 'department:manage' }
    ]
  }
])

// 部门树数据
const departmentTree = ref<DepartmentNode[]>([
  {
    id: 1,
    name: '学校总部',
    children: [
      {
        id: 11,
        name: '教学部',
        children: [
          { id: 111, name: '小学部' },
          { id: 112, name: '初中部' },
          { id: 113, name: '高中部' }
        ]
      },
      {
        id: 12,
        name: '行政部',
        children: [
          { id: 121, name: '人事处' },
          { id: 122, name: '财务处' },
          { id: 123, name: '后勤处' }
        ]
      },
      { id: 13, name: '教研部' }
    ]
  }
])

// 数据权限表单
const dataPermissionForm = reactive<DataPermissionForm>({
  dataScope: 'department',
  departments: [],
  customerPermissions: [],
  campaignPermissions: [],
  allowExport: false
})

// 当前角色的权限状态
const checkedMenus = ref<string[]>([])
const checkedPermissions = ref<string[]>([])

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
      if (a.code === 'ADMIN') return -1
      if (b.code === 'ADMIN') return 1
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
const selectRole = async (role: RoleInfo) => {
  selectedRole.value = role
  await loadRoleMenuPermissions(role)
}

// 加载角色菜单权限
const loadRoleMenuPermissions = async (role: RoleInfo) => {
  try {
    if (role.code === 'ADMIN') {
      // 系统管理员拥有所有权限
      checkedMenus.value = getAllMenuIds()
    } else {
      // 从后端加载角色菜单权限
      const response = await getRoleMenus(role.id)
      // 确保返回的是数组
      const result = response?.data || []
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

const loadRolePermissions = (role: RoleInfo) => {
  // 加载角色的菜单权限
  if (role.code === 'ADMIN') {
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

const getAllMenuIds = (): string[] => {
  const ids: string[] = []
  const traverse = (nodes: MenuNode[]) => {
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

const getAllPermissionIds = (): string[] => {
  const ids: string[] = []
  permissionGroups.value.forEach(group => {
    group.permissions.forEach(permission => {
      ids.push(permission.id)
    })
  })
  return ids
}

const getMenuIdsByPermissions = (permissions: string[]): string[] => {
  // 根据权限码映射到菜单ID的逻辑
  const menuMapping: Record<string, string[]> = {
    'teacher:read': ['personnel', 'teacher-list'],
    'student:read': ['personnel', 'student-list'],
    'class:read': ['class', 'class-list'],
    'grade:read': ['class', 'grade-list'],
    'attendance:read': ['attendance', 'attendance-rules', 'attendance-record', 'attendance-statistics'],
    'leave:read': ['leave', 'leave-type', 'leave-application', 'leave-approval', 'leave-record']
  }

  const menuIds = new Set<string>()
  permissions.forEach(permission => {
    if (menuMapping[permission]) {
      menuMapping[permission].forEach(id => menuIds.add(id))
    }
  })

  return Array.from(menuIds)
}

const updateDataPermissionForm = (role: RoleInfo) => {
  // 根据角色更新数据权限表单
  if (role.code === 'ADMIN') {
    dataPermissionForm.dataScope = 'all'
    dataPermissionForm.allowExport = true
  } else {
    // 根据具体角色设置默认值
    dataPermissionForm.dataScope = 'department'
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

const handleCheckAllMenus = (val: boolean) => {
  if (val) {
    checkedMenus.value = getAllMenuIds()
    menuTreeRef.value?.setCheckedKeys(checkedMenus.value)
  } else {
    checkedMenus.value = []
    menuTreeRef.value?.setCheckedKeys([])
  }
  updateMenuSelectState()
}

const handleMenuCheck = (_data: MenuNode, checked: any) => {
  checkedMenus.value = checked.checkedKeys
  updateMenuSelectState()
}

const expandAllMenus = () => {
  const allKeys = getAllMenuIds()
  allKeys.forEach(key => {
    const node = menuTreeRef.value?.getNode(key)
    if (node) node.expand()
  })
}

const collapseAllMenus = () => {
  const allKeys = getAllMenuIds()
  allKeys.forEach(key => {
    const node = menuTreeRef.value?.getNode(key)
    if (node) node.collapse()
  })
}

const isGroupChecked = (group: PermissionGroup): boolean => {
  return group.permissions.every(permission =>
    checkedPermissions.value.includes(permission.id)
  )
}

const isGroupIndeterminate = (group: PermissionGroup): boolean => {
  const checkedCount = group.permissions.filter(permission =>
    checkedPermissions.value.includes(permission.id)
  ).length
  return checkedCount > 0 && checkedCount < group.permissions.length
}

const getGroupCheckedPermissions = (group: PermissionGroup): string[] => {
  return group.permissions
    .filter(permission => checkedPermissions.value.includes(permission.id))
    .map(permission => permission.id)
}

const handleGroupCheck = (group: PermissionGroup, checked: boolean) => {
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

const handlePermissionCheck = (group: PermissionGroup, checkedValues: string[]) => {
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

const handleDeptCheck = (_data: any, checked: any) => {
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
    ElMessage.error('权限保存失败')
  }
}

const handleAddRole = () => {
  isEditMode.value = false
  roleDialogVisible.value = true
  resetRoleForm()
}

const handleEditRole = (role: RoleInfo) => {
  isEditMode.value = true
  roleDialogVisible.value = true
  selectedRole.value = role

  // 填充表单数据
  Object.assign(roleForm, {
    roleName: role.name,
    roleCode: role.code,
    description: role.description,
    status: role.status
  })
}

const handleCopyRole = (role: RoleInfo) => {
  isEditMode.value = false
  roleDialogVisible.value = true

  // 复制角色数据
  Object.assign(roleForm, {
    roleName: role.name + '_副本',
    roleCode: role.code + '_copy',
    description: role.description,
    status: role.status
  })
}

const handleDeleteRole = async (role: RoleInfo) => {
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
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 将中文转换为拼音（简单实现，只处理常见字符）
const toPinyin = (chinese: string): string => {
  // 简单的中文到拼音映射表
  const pinyinMap: Record<string, string> = {
    '管理': 'guanli',
    '管': 'guan',
    '理': 'li',
    '员': 'yuan',
    '教师': 'jiaoshi',
    '教': 'jiao',
    '师': 'shi',
    '学生': 'xuesheng',
    '学': 'xue',
    '生': 'sheng',
    '班主任': 'banzhuren',
    '班': 'ban',
    '主': 'zhu',
    '任': 'ren',
    '校长': 'xiaozhang',
    '校': 'xiao',
    '长': 'zhang',
    '主任': 'zhuren',
    '老师': 'laoshi',
    '老': 'lao',
    '超级': 'chaoji',
    '超': 'chao',
    '级': 'ji',
    '普通': 'putong',
    '普': 'pu',
    '通': 'tong',
    '系统': 'xitong',
    '系': 'xi',
    '统': 'tong',
    '访客': 'fangke',
    '访': 'fang',
    '客': 'ke'
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
  if (!isEditMode.value && roleForm.roleName) {
    // 将中文角色名称转换为拼音编码
    const code = toPinyin(roleForm.roleName)
    roleForm.roleCode = code.toLowerCase()
  }
}

const resetRoleForm = () => {
  Object.assign(roleForm, {
    roleName: '',
    roleCode: '',
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

    if (isEditMode.value && selectedRole.value) {
      // 更新角色
      await updateRole(selectedRole.value.id, roleForm)
      ElMessage.success('角色更新成功')
    } else {
      // 创建角色
      await createRole(roleForm)
      ElMessage.success('角色创建成功')
    }

    // 重新加载角色列表
    await loadRoles()
    roleDialogVisible.value = false
  } catch (error: any) {
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

    // 检查响应数据格式
    let roleList = []
    if (Array.isArray(response)) {
      roleList = response
    } else if (response && Array.isArray(response.data)) {
      roleList = response.data
    } else if (response && response.data && Array.isArray(response.data.data)) {
      roleList = response.data.data
    } else {
      // 如果没有获取到数据，使用模拟数据
      roleList = [
        {
          id: 1,
          roleName: '超级管理员',
          roleCode: 'ADMIN',
          description: '系统超级管理员，拥有所有权限',
          roleType: 'system',
          status: 1,
          createTime: '2024-01-01'
        },
        {
          id: 2,
          roleName: '校长',
          roleCode: 'xiaozhang',
          description: '学校校长，拥有全校管理权限',
          roleType: 'custom',
          status: 1,
          createTime: '2024-01-02'
        },
        {
          id: 3,
          roleName: '教务主任',
          roleCode: 'jiaowu_zhuren',
          description: '教务处主任，负责教学管理',
          roleType: 'custom',
          status: 1,
          createTime: '2024-01-03'
        },
        {
          id: 4,
          roleName: '班主任',
          roleCode: 'banzhuren',
          description: '班级管理员，负责班级日常管理',
          roleType: 'custom',
          status: 1,
          createTime: '2024-01-04'
        },
        {
          id: 5,
          roleName: '任课教师',
          roleCode: 'jiaoshi',
          description: '普通任课教师，负责课程教学',
          roleType: 'custom',
          status: 1,
          createTime: '2024-01-05'
        }
      ]
    }

    // 将后端数据适配为前端格式
    roles.value = roleList.map((role: any) => ({
      id: role.id,
      name: role.roleName,
      code: role.roleCode,
      description: role.description,
      type: role.roleType || 'custom',
      status: role.status || 1,
      userCount: role.userCount || Math.floor(Math.random() * 50), // 模拟用户数
      permissions: role.permissions || [], // 暂时设置为空，后续可以从后端获取
      createTime: role.createTime
    }))

    // 如果有角色且没有选中角色，默认选择第一个
    if (roles.value.length > 0 && !selectedRole.value) {
      selectRole(roles.value[0])
    }
  } catch (error) {
    console.error('加载角色失败:', error)
    // 使用模拟数据作为后备
    roles.value = [
      {
        id: 1,
        name: '超级管理员',
        code: 'ADMIN',
        description: '系统超级管理员，拥有所有权限',
        type: 'system',
        status: 1,
        userCount: 1,
        permissions: ['*'],
        createTime: '2024-01-01'
      },
      {
        id: 2,
        name: '校长',
        code: 'xiaozhang',
        description: '学校校长，拥有全校管理权限',
        type: 'custom',
        status: 1,
        userCount: 2,
        permissions: [],
        createTime: '2024-01-02'
      },
      {
        id: 3,
        name: '教务主任',
        code: 'jiaowu_zhuren',
        description: '教务处主任，负责教学管理',
        type: 'custom',
        status: 1,
        userCount: 5,
        permissions: [],
        createTime: '2024-01-03'
      },
      {
        id: 4,
        name: '班主任',
        code: 'banzhuren',
        description: '班级管理员，负责班级日常管理',
        type: 'custom',
        status: 1,
        userCount: 30,
        permissions: [],
        createTime: '2024-01-04'
      },
      {
        id: 5,
        name: '任课教师',
        code: 'jiaoshi',
        description: '普通任课教师，负责课程教学',
        type: 'custom',
        status: 1,
        userCount: 45,
        permissions: [],
        createTime: '2024-01-05'
      }
    ]

    if (roles.value.length > 0 && !selectedRole.value) {
      selectRole(roles.value[0])
    }
  }
}

// 初始化
const init = () => {
  loadRoles()
}

// 组件挂载后初始化
onMounted(init)
</script>

<style lang="scss" scoped>
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