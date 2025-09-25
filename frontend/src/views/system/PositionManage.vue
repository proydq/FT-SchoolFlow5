<template>
  <div class="position-management-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h2>岗位管理</h2>
        <p class="page-description">管理系统岗位信息，支持跨部门岗位设置和人员关联</p>
        <div class="header-actions">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增岗位
          </el-button>
          <el-button
            type="success"
            @click="handleBatchAssign"
            :disabled="selectedRows.length === 0"
          >
            <el-icon><Link /></el-icon>
            批量关联部门
          </el-button>
          <el-button
            type="danger"
            @click="handleBatchDelete"
            :disabled="selectedRows.length === 0"
          >
            <el-icon><Delete /></el-icon>
            批量删除
          </el-button>
        </div>
      </div>
    </div>

    <!-- 筛选和搜索区域 -->
    <div class="filter-section">
      <div class="filter-content">
        <div class="filter-left">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索岗位名称/编码"
            prefix-icon="Search"
            style="width: 240px"
            @keyup.enter="handleSearch"
            @change="handleSearch"
          />
          <el-select
            v-model="searchForm.departmentId"
            placeholder="关联部门"
            style="width: 180px"
            @change="handleSearch"
            clearable
          >
            <el-option label="全部部门" value="" />
            <el-option
              v-for="dept in departmentList"
              :key="dept.id"
              :label="dept.deptName"
              :value="dept.id"
            />
          </el-select>
          <el-select
            v-model="searchForm.level"
            placeholder="岗位级别"
            style="width: 120px"
            @change="handleSearch"
            clearable
          >
            <el-option label="全部级别" value="" />
            <el-option label="初级" :value="1" />
            <el-option label="中级" :value="2" />
            <el-option label="高级" :value="3" />
            <el-option label="专家" :value="4" />
            <el-option label="管理" :value="5" />
          </el-select>
          <el-select
            v-model="searchForm.status"
            placeholder="状态"
            style="width: 100px"
            @change="handleSearch"
            clearable
          >
            <el-option label="全部" value="" />
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </div>
        <div class="filter-right">
          <div class="stats-item">
            <span class="label">总岗位:</span>
            <span class="value">{{ pagination.total }}</span>
          </div>
          <div class="stats-item">
            <span class="label">已关联部门:</span>
            <span class="value active">{{ linkedCount }}</span>
          </div>
          <div class="stats-item">
            <span class="label">未关联:</span>
            <span class="value inactive">{{ unlinkedCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 岗位列表 -->
    <div class="position-list-section">
      <el-table
        :data="tableData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        row-key="id"
        v-loading="loading"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="positionCode" label="岗位编码" width="140" />
        <el-table-column prop="positionName" label="岗位名称" width="160" />
        <el-table-column prop="level" label="岗位级别" width="100">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.level)" size="small">
              {{ getLevelText(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="关联部门" width="150">
          <template #default="{ row }">
            <span v-if="row.departmentId">{{ getDepartmentName(row.departmentId) }}</span>
            <el-button
              v-else
              type="primary"
              link
              size="small"
              @click="handleAssignDepartment(row)"
            >
              关联部门
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="在职人数" width="100" align="center">
          <template #default="{ row }">
            <el-link type="primary" @click="handleViewUsers(row)">
              {{ getUserCount(row.id) }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="!row.departmentId"
              type="success"
              size="small"
              @click="handleAssignDepartment(row)"
            >
              关联部门
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
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
    </div>

    <!-- 新增/编辑岗位对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="岗位名称" prop="positionName">
              <el-input v-model="form.positionName" placeholder="请输入岗位名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="岗位编码" prop="positionCode">
              <el-input v-model="form.positionCode" placeholder="请输入岗位编码">
                <template #append>
                  <el-button @click="generatePositionCode" title="自动生成编码">
                    <el-icon><Refresh /></el-icon>
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="岗位级别" prop="level">
              <el-select v-model="form.level" placeholder="请选择岗位级别" style="width: 100%">
                <el-option label="初级" :value="1" />
                <el-option label="中级" :value="2" />
                <el-option label="高级" :value="3" />
                <el-option label="专家" :value="4" />
                <el-option label="管理" :value="5" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关联部门">
              <el-cascader
                v-model="form.departmentId"
                :options="departmentTreeData"
                :props="{
                  value: 'id',
                  label: 'deptName',
                  children: 'children',
                  checkStrictly: true,
                  emitPath: false
                }"
                placeholder="请选择关联部门"
                clearable
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="排序号">
              <el-input-number
                v-model="form.sortOrder"
                :min="0"
                :max="9999"
                placeholder="排序号"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio :label="1">启用</el-radio>
                <el-radio :label="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="岗位描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入岗位描述"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 部门关联对话框 -->
    <el-dialog
      v-model="assignDialogVisible"
      title="关联部门"
      width="500px"
      destroy-on-close
    >
      <div class="assign-tip">
        <span>为岗位"{{ currentPosition.positionName }}"关联部门：</span>
      </div>

      <el-cascader
        v-model="selectedDepartment"
        :options="departmentTreeData"
        :props="{
          value: 'id',
          label: 'deptName',
          children: 'children',
          checkStrictly: true,
          emitPath: false
        }"
        placeholder="请选择部门"
        clearable
        style="width: 100%"
      />

      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="assignLoading" @click="handleAssignSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 批量关联部门对话框 -->
    <el-dialog
      v-model="batchAssignDialogVisible"
      title="批量关联部门"
      width="500px"
      destroy-on-close
    >
      <div class="assign-tip">
        <span>已选择 {{ selectedRows.length }} 个岗位，批量关联到部门：</span>
      </div>

      <el-cascader
        v-model="selectedBatchDepartment"
        :options="departmentTreeData"
        :props="{
          value: 'id',
          label: 'deptName',
          children: 'children',
          checkStrictly: true,
          emitPath: false
        }"
        placeholder="请选择部门"
        clearable
        style="width: 100%"
      />

      <div class="assign-hint">
        <el-icon><InfoFilled /></el-icon>
        <span>提示：批量关联会将选中的岗位统一关联到选定的部门</span>
      </div>

      <template #footer>
        <el-button @click="batchAssignDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="batchAssignLoading" @click="handleBatchAssignSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 在职人员对话框 -->
    <el-dialog
      v-model="usersDialogVisible"
      :title="`${currentPosition.positionName} - 在职人员`"
      width="800px"
      destroy-on-close
    >
      <el-table :data="positionUsers" style="width: 100%">
        <el-table-column prop="id" label="工号" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="departmentName" label="所属部门" width="150" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="joinTime" label="入职时间" width="120" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Edit, Delete, Link, InfoFilled } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import type { PositionInfo, PositionFormData, PositionQuery } from '@/types/position'
import type { DepartmentInfo } from '@/types/department'
import {
  getPositionList,
  createPosition,
  updatePosition,
  deletePosition,
  batchDeletePositions,
  updatePositionStatus,
  assignPositionToDepartment,
  batchAssignPositionsToDepartment,
  getPositionUsers
} from '@/api/system/position'
import { getDepartmentTree } from '@/api/system/department'

// 响应式数据
const loading = ref(false)
const tableData = ref<PositionInfo[]>([])
const departmentList = ref<DepartmentInfo[]>([])
const departmentTreeData = ref<DepartmentInfo[]>([])
const selectedRows = ref<PositionInfo[]>([])
const dialogVisible = ref(false)
const assignDialogVisible = ref(false)
const batchAssignDialogVisible = ref(false)
const usersDialogVisible = ref(false)
const submitLoading = ref(false)
const assignLoading = ref(false)
const batchAssignLoading = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const currentPosition = ref<PositionInfo>({} as PositionInfo)
const selectedDepartment = ref<number | null>(null)
const selectedBatchDepartment = ref<number | null>(null)
const positionUsers = ref<any[]>([])
const positionUserCounts = ref<Record<number, number>>({})

// 搜索表单
const searchForm = reactive<PositionQuery>({
  keyword: '',
  departmentId: null,
  level: null,
  status: null
})

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 表单数据
const form = reactive<PositionFormData & { id?: number }>({
  id: undefined,
  positionName: '',
  positionCode: '',
  level: 1,
  departmentId: null,
  description: '',
  sortOrder: 0,
  status: 1
})

// 表单验证规则
const rules = {
  positionName: [
    { required: true, message: '请输入岗位名称', trigger: 'blur' },
    { min: 2, max: 20, message: '岗位名称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  positionCode: [
    { required: true, message: '请输入岗位编码', trigger: 'blur' },
    { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '编码必须以字母开头，只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  level: [
    { required: true, message: '请选择岗位级别', trigger: 'change' }
  ]
}

// 模拟数据
const mockPositions: PositionInfo[] = [
  {
    id: 1,
    positionName: '前端开发工程师',
    positionCode: 'FE_DEV_001',
    level: 2,
    departmentId: 3,
    departmentName: '前端组',
    description: '负责前端页面开发和用户交互优化',
    sortOrder: 1,
    status: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
    userCount: 5
  },
  {
    id: 2,
    positionName: '后端开发工程师',
    positionCode: 'BE_DEV_001',
    level: 2,
    departmentId: 4,
    departmentName: '后端组',
    description: '负责后端API开发和数据库设计',
    sortOrder: 2,
    status: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
    userCount: 8
  },
  {
    id: 3,
    positionName: '产品经理',
    positionCode: 'PM_001',
    level: 3,
    departmentId: null,
    description: '负责产品规划和需求分析',
    sortOrder: 3,
    status: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
    userCount: 2
  },
  {
    id: 4,
    positionName: 'UI设计师',
    positionCode: 'UI_001',
    level: 2,
    departmentId: null,
    description: '负责用户界面设计和用户体验优化',
    sortOrder: 4,
    status: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
    userCount: 3
  },
  {
    id: 5,
    positionName: '技术总监',
    positionCode: 'TECH_DIRECTOR',
    level: 5,
    departmentId: 2,
    departmentName: '技术部',
    description: '负责技术团队管理和技术方向制定',
    sortOrder: 5,
    status: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
    userCount: 1
  }
]

const mockDepartmentTree: DepartmentInfo[] = [
  {
    id: 1,
    deptName: '总公司',
    deptCode: 'HQ',
    parentId: null,
    sortOrder: 1,
    status: 1,
    children: [
      {
        id: 2,
        deptName: '技术部',
        deptCode: 'TECH',
        parentId: 1,
        sortOrder: 1,
        status: 1,
        children: [
          {
            id: 3,
            deptName: '前端组',
            deptCode: 'FE',
            parentId: 2,
            sortOrder: 1,
            status: 1
          },
          {
            id: 4,
            deptName: '后端组',
            deptCode: 'BE',
            parentId: 2,
            sortOrder: 2,
            status: 1
          }
        ]
      },
      {
        id: 5,
        deptName: '人力资源部',
        deptCode: 'HR',
        parentId: 1,
        sortOrder: 2,
        status: 1
      }
    ]
  }
]

const mockPositionUsers = [
  { id: 1001, name: '张三', departmentName: '前端组', phone: '13800138001', email: 'zhangsan@example.com', joinTime: '2024-01-15' },
  { id: 1002, name: '李四', departmentName: '前端组', phone: '13800138002', email: 'lisi@example.com', joinTime: '2024-02-01' },
  { id: 1003, name: '王五', departmentName: '前端组', phone: '13800138003', email: 'wangwu@example.com', joinTime: '2024-03-01' }
]

// 计算属性
const dialogTitle = computed(() => isEdit.value ? '编辑岗位' : '新增岗位')

const linkedCount = computed(() => {
  return tableData.value.filter(item => item.departmentId).length
})

const unlinkedCount = computed(() => {
  return tableData.value.filter(item => !item.departmentId).length
})

// 方法
const loadData = async () => {
  loading.value = true
  try {
    // 使用模拟数据代替API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    // 应用搜索筛选
    let filteredData = [...mockPositions]

    if (searchForm.keyword) {
      filteredData = filteredData.filter(item =>
        item.positionName.includes(searchForm.keyword!) ||
        item.positionCode.includes(searchForm.keyword!)
      )
    }

    if (searchForm.departmentId) {
      filteredData = filteredData.filter(item => item.departmentId === searchForm.departmentId)
    }

    if (searchForm.level) {
      filteredData = filteredData.filter(item => item.level === searchForm.level)
    }

    if (searchForm.status !== null && searchForm.status !== undefined && searchForm.status !== '') {
      filteredData = filteredData.filter(item => item.status === searchForm.status)
    }

    tableData.value = filteredData
    pagination.total = filteredData.length

    ElMessage.success('数据加载成功')
  } catch (error) {
    ElMessage.error('加载数据失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const loadDepartmentData = async () => {
  try {
    // 使用模拟数据代替API调用
    await new Promise(resolve => setTimeout(resolve, 300))
    departmentTreeData.value = mockDepartmentTree
    departmentList.value = flattenDepartments(mockDepartmentTree)
  } catch (error) {
    console.error('加载部门数据失败:', error)
  }
}

const flattenDepartments = (departments: DepartmentInfo[]): DepartmentInfo[] => {
  const result: DepartmentInfo[] = []

  const flatten = (depts: DepartmentInfo[]) => {
    depts.forEach(dept => {
      result.push(dept)
      if (dept.children) {
        flatten(dept.children)
      }
    })
  }

  flatten(departments)
  return result
}

const getLevelType = (level: number) => {
  const types: Record<number, string> = {
    1: 'info',
    2: 'success',
    3: 'warning',
    4: 'danger',
    5: 'danger'
  }
  return types[level] || 'info'
}

const getLevelText = (level: number) => {
  const texts: Record<number, string> = {
    1: '初级',
    2: '中级',
    3: '高级',
    4: '专家',
    5: '管理'
  }
  return texts[level] || '未知'
}

const getDepartmentName = (departmentId: number) => {
  const dept = departmentList.value.find(d => d.id === departmentId)
  return dept?.deptName || '未知部门'
}

const getUserCount = (positionId: number) => {
  const position = tableData.value.find(p => p.id === positionId)
  return position?.userCount || 0
}

const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

const handleAdd = () => {
  resetForm()
  isEdit.value = false
  dialogVisible.value = true
}

const handleEdit = (row: PositionInfo) => {
  resetForm()
  form.id = row.id
  form.positionName = row.positionName
  form.positionCode = row.positionCode
  form.level = row.level
  form.departmentId = row.departmentId
  form.description = row.description || ''
  form.sortOrder = row.sortOrder
  form.status = row.status
  isEdit.value = true
  dialogVisible.value = true
}

const handleDelete = async (row: PositionInfo) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除岗位"${row.positionName}"吗？此操作不可恢复。`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 模拟删除操作
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }
}

const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的岗位')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个岗位吗？此操作不可恢复。`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 模拟批量删除操作
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('批量删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
      console.error(error)
    }
  }
}

const handleStatusChange = async (row: PositionInfo) => {
  try {
    // 模拟状态更新操作
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success(`岗位状态已${row.status ? '启用' : '禁用'}`)
  } catch (error) {
    ElMessage.error('状态更新失败')
    row.status = row.status ? 0 : 1 // 回滚状态
    console.error(error)
  }
}

const handleSelectionChange = (selection: PositionInfo[]) => {
  selectedRows.value = selection
}

const handleSearch = () => {
  pagination.currentPage = 1
  loadData()
}

const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    ;(searchForm as any)[key] = ''
  })
  loadData()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.currentPage = 1
  loadData()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  loadData()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    submitLoading.value = true

    // 模拟提交操作
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (isEdit.value) {
      ElMessage.success('编辑成功')
    } else {
      ElMessage.success('新增成功')
    }

    dialogVisible.value = false
    loadData()
  } catch (error) {
    ElMessage.error(isEdit.value ? '编辑失败' : '新增失败')
    console.error(error)
  } finally {
    submitLoading.value = false
  }
}

const resetForm = () => {
  form.id = undefined
  form.positionName = ''
  form.positionCode = ''
  form.level = 1
  form.departmentId = null
  form.description = ''
  form.sortOrder = 0
  form.status = 1
  formRef.value?.clearValidate()
}

const generatePositionCode = () => {
  if (!form.positionName.trim()) {
    ElMessage.warning('请先输入岗位名称')
    return
  }

  const name = form.positionName.trim()
  const nameCode = generateNameCode(name)
  const randomSuffix = Math.random().toString(36).substr(2, 3).toUpperCase()

  form.positionCode = `${nameCode}_${randomSuffix}`
  ElMessage.success('已自动生成岗位编码')
}

const generateNameCode = (name: string) => {
  const nameMap: Record<string, string> = {
    '前端开发工程师': 'FE_DEV',
    '后端开发工程师': 'BE_DEV',
    '全栈开发工程师': 'FULL_DEV',
    '移动端开发工程师': 'MOBILE_DEV',
    '测试工程师': 'TEST_ENG',
    '产品经理': 'PM',
    'UI设计师': 'UI_DESIGNER',
    'UE设计师': 'UE_DESIGNER',
    '技术总监': 'TECH_DIRECTOR',
    '项目经理': 'PROJECT_MANAGER'
  }

  return nameMap[name] || name.substring(0, 2).toUpperCase()
}

const handleAssignDepartment = (row: PositionInfo) => {
  currentPosition.value = row
  selectedDepartment.value = null
  assignDialogVisible.value = true
}

const handleAssignSubmit = async () => {
  if (!selectedDepartment.value) {
    ElMessage.warning('请选择部门')
    return
  }

  try {
    assignLoading.value = true
    // 模拟关联操作
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('关联成功')
    assignDialogVisible.value = false
    loadData()
  } catch (error) {
    ElMessage.error('关联失败')
    console.error(error)
  } finally {
    assignLoading.value = false
  }
}

const handleBatchAssign = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要关联的岗位')
    return
  }
  selectedBatchDepartment.value = null
  batchAssignDialogVisible.value = true
}

const handleBatchAssignSubmit = async () => {
  if (!selectedBatchDepartment.value) {
    ElMessage.warning('请选择部门')
    return
  }

  try {
    batchAssignLoading.value = true
    // 模拟批量关联操作
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('批量关联成功')
    batchAssignDialogVisible.value = false
    loadData()
  } catch (error) {
    ElMessage.error('批量关联失败')
    console.error(error)
  } finally {
    batchAssignLoading.value = false
  }
}

const handleViewUsers = async (row: PositionInfo) => {
  currentPosition.value = row
  positionUsers.value = mockPositionUsers
  usersDialogVisible.value = true
}

// 生命周期
onMounted(() => {
  loadData()
  loadDepartmentData()
})
</script>

<style scoped lang="scss">
.position-management-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  margin-bottom: 20px;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    h2 {
      margin: 0 0 8px 0;
      color: #303133;
      font-size: 24px;
      font-weight: 600;
    }

    .page-description {
      margin: 0;
      color: #909399;
      font-size: 14px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }
}

.filter-section {
  margin-bottom: 20px;
  padding: 16px 20px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .filter-content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .filter-left {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .filter-right {
      display: flex;
      gap: 20px;

      .stats-item {
        display: flex;
        align-items: center;
        gap: 4px;

        .label {
          color: #909399;
          font-size: 14px;
        }

        .value {
          font-weight: 600;
          font-size: 16px;

          &.active {
            color: #67c23a;
          }

          &.inactive {
            color: #f56c6c;
          }
        }
      }
    }
  }
}

.position-list-section {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  .pagination-wrapper {
    padding: 16px 20px;
    display: flex;
    justify-content: flex-end;
  }
}

.assign-tip {
  margin-bottom: 16px;
  color: #303133;
  font-size: 14px;
}

.assign-hint {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
  font-size: 12px;
}

:deep(.el-table) {
  .el-table__header {
    th {
      background-color: #fafafa;
      color: #303133;
      font-weight: 600;
    }
  }
}

:deep(.el-tag) {
  border-radius: 4px;
}

:deep(.el-dialog__header) {
  padding: 20px 20px 0 20px;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog__footer) {
  padding: 0 20px 20px 20px;
}
</style>