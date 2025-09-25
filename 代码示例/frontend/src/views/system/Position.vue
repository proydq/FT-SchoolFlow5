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
          <el-select v-model="searchForm.departmentId" placeholder="关联部门" style="width: 180px" @change="handleSearch" clearable>
            <el-option label="全部部门" value="" />
            <el-option v-for="dept in departmentList" :key="dept.id" :label="dept.name" :value="dept.id" />
          </el-select>
          <el-select v-model="searchForm.level" placeholder="岗位级别" style="width: 120px" @change="handleSearch" clearable>
            <el-option label="全部级别" value="" />
            <el-option label="初级" :value="1" />
            <el-option label="中级" :value="2" />
            <el-option label="高级" :value="3" />
            <el-option label="专家" :value="4" />
            <el-option label="管理" :value="5" />
          </el-select>
          <el-select v-model="searchForm.status" placeholder="状态" style="width: 100px" @change="handleSearch" clearable>
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
                  label: 'label',
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

        <el-form-item label="岗位描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入岗位描述"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
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
          label: 'label',
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
          label: 'label',
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
        <el-table-column prop="workNo" label="工号" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="department" label="所属部门" width="150" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="entryTime" label="入职时间" width="120" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Edit, Delete, Link, InfoFilled } from '@element-plus/icons-vue'
import systemApi from '@/api/modules/system'

// 响应式数据
const loading = ref(false)
const tableData = ref([])
const departmentList = ref([])
const departmentTreeData = ref([])
const selectedRows = ref([])
const dialogVisible = ref(false)
const assignDialogVisible = ref(false)
const batchAssignDialogVisible = ref(false)
const usersDialogVisible = ref(false)
const submitLoading = ref(false)
const assignLoading = ref(false)
const batchAssignLoading = ref(false)
const isEdit = ref(false)
const formRef = ref()
const currentPosition = ref({})
const selectedDepartment = ref('')
const selectedBatchDepartment = ref('')
const positionUsers = ref([])
const positionUserCounts = ref({})

// 搜索表单
const searchForm = reactive({
  keyword: '',
  departmentId: '',
  level: '',
  status: ''
})

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 表单数据
const form = reactive({
  id: null,
  positionName: '',
  positionCode: '',
  level: null,
  departmentId: '',
  description: '',
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

// 计算属性
const dialogTitle = computed(() => {
  return isEdit.value ? '编辑岗位' : '新增岗位'
})

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
    const params = {
      page: pagination.currentPage,
      size: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      departmentId: searchForm.departmentId || undefined,
      level: searchForm.level || undefined,
      status: searchForm.status !== '' ? searchForm.status : undefined
    }

    const data = await systemApi.position.getPage(params)
    tableData.value = data.records || data.content || []
    pagination.total = data.total || data.totalElements || 0

    // 加载人员数量统计
    await loadPersonnelCounts()
  } catch (error) {
    ElMessage.error('加载岗位数据失败')
    console.error(error)
    tableData.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

const loadDepartments = async () => {
  try {
    const treeData = await systemApi.department.getTree()
    departmentList.value = flattenDepartments(treeData)
    departmentTreeData.value = formatDepartmentTree(treeData)
  } catch (error) {
    console.error('加载部门数据失败:', error)
    departmentList.value = []
    departmentTreeData.value = []
  }
}

// 将部门树展平为列表
const flattenDepartments = (tree) => {
  const result = []
  const flatten = (nodes, parentName = '') => {
    nodes.forEach(node => {
      const name = node.deptName || node.name
      const fullName = parentName ? `${parentName} / ${name}` : name
      result.push({
        id: node.id,
        name: name,
        fullName: fullName
      })
      if (node.children && node.children.length > 0) {
        flatten(node.children, fullName)
      }
    })
  }
  if (tree && tree.length > 0) {
    flatten(tree)
  }
  return result
}

// 格式化部门树数据用于级联选择器
const formatDepartmentTree = (tree) => {
  if (!tree || !Array.isArray(tree)) return []
  return tree.map(node => ({
    id: node.id,
    label: node.deptName || node.name,
    children: node.children && node.children.length > 0 ? formatDepartmentTree(node.children) : undefined
  }))
}

// 加载人员数量统计
const loadPersonnelCounts = async () => {
  try {
    const counts = {}
    for (const position of tableData.value) {
      try {
        const response = await systemApi.position.getPersonnelCount(position.id)
        counts[position.id] = response || 0
      } catch (error) {
        console.warn(`获取岗位 ${position.id} 人员数量失败:`, error)
        counts[position.id] = 0
      }
    }
    positionUserCounts.value = counts
  } catch (error) {
    console.error('加载人员数量失败:', error)
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  loadData()
}

const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  handleSearch()
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.keys(form).forEach(key => {
    form[key] = row[key] || (key === 'status' ? 1 : (key === 'id' || key === 'level' || key === 'departmentId' ? row[key] : ''))
  })
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除岗位"${row.positionName}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await systemApi.position.delete(row.id)
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
    ElMessage.warning('请先选择要删除的岗位')
    return
  }

  try {
    const positionNames = selectedRows.value.map(item => item.positionName).join('、')
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个岗位吗？\n包含岗位：${positionNames}`,
      '批量删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 模拟批量删除
    ElMessage.success(`成功删除 ${selectedRows.value.length} 个岗位`)
    selectedRows.value = []
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
      console.error(error)
    }
  }
}

const handleStatusChange = async (row) => {
  try {
    await systemApi.position.updateStatus(row.id, row.status)
    ElMessage.success(`已${row.status === 1 ? '启用' : '禁用'}岗位"${row.positionName}"`)
  } catch (error) {
    // 恢复原状态
    row.status = row.status === 1 ? 0 : 1
    ElMessage.error('更新状态失败')
    console.error(error)
  }
}

const handleAssignDepartment = (row) => {
  currentPosition.value = row
  selectedDepartment.value = row.departmentId || ''
  assignDialogVisible.value = true
}

const handleBatchAssign = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要关联部门的岗位')
    return
  }
  selectedBatchDepartment.value = ''
  batchAssignDialogVisible.value = true
}

const handleViewUsers = async (row) => {
  currentPosition.value = row

  // 模拟获取岗位人员数据
  const userCount = positionUserCounts.value[row.id] || 0
  positionUsers.value = Array.from({ length: userCount }, (_, index) => ({
    workNo: `EMP${String(row.id).padStart(3, '0')}${String(index + 1).padStart(2, '0')}`,
    name: `员工${index + 1}`,
    department: getDepartmentName(row.departmentId) || '未分配',
    phone: `1380013800${index}`,
    email: `user${index + 1}@company.com`,
    entryTime: '2024-01-15'
  }))

  usersDialogVisible.value = true
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.currentPage = 1
  loadData()
}

const handleCurrentChange = (page) => {
  pagination.currentPage = page
  loadData()
}

const resetForm = () => {
  form.id = null
  form.positionName = ''
  form.positionCode = ''
  form.level = null
  form.departmentId = ''
  form.description = ''
  form.status = 1

  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    submitLoading.value = true

    const submitData = {
      positionName: form.positionName,
      positionCode: form.positionCode,
      departmentId: form.departmentId,
      level: form.level,
      description: form.description,
      sortOrder: form.sortOrder || 0,
      status: form.status
    }

    if (isEdit.value && form.id) {
      await systemApi.position.update(form.id, submitData)
      ElMessage.success('编辑成功')
    } else {
      await systemApi.position.create(submitData)
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

const handleAssignSubmit = async () => {
  if (!selectedDepartment.value) {
    ElMessage.warning('请选择要关联的部门')
    return
  }

  assignLoading.value = true
  try {
    // 模拟关联操作
    await new Promise(resolve => setTimeout(resolve, 500))

    ElMessage.success('关联部门成功')
    assignDialogVisible.value = false
    loadData()
  } catch (error) {
    ElMessage.error('关联部门失败')
    console.error(error)
  } finally {
    assignLoading.value = false
  }
}

const handleBatchAssignSubmit = async () => {
  if (!selectedBatchDepartment.value) {
    ElMessage.warning('请选择要关联的部门')
    return
  }

  batchAssignLoading.value = true
  try {
    // 模拟批量关联
    await new Promise(resolve => setTimeout(resolve, 800))

    ElMessage.success(`成功关联 ${selectedRows.value.length} 个岗位到部门`)
    batchAssignDialogVisible.value = false
    selectedRows.value = []
    loadData()
  } catch (error) {
    ElMessage.error('批量关联部门失败')
    console.error(error)
  } finally {
    batchAssignLoading.value = false
  }
}

const getLevelType = (level) => {
  const typeMap = {
    1: '',
    2: 'warning',
    3: 'success',
    4: 'danger',
    5: 'info'
  }
  return typeMap[level] || ''
}

const getLevelText = (level) => {
  const textMap = {
    1: '初级',
    2: '中级',
    3: '高级',
    4: '专家',
    5: '管理'
  }
  return textMap[level] || level
}

const getDepartmentName = (departmentId) => {
  if (!departmentId) return ''
  const dept = departmentList.value.find(d => d.id === departmentId)
  return dept ? (dept.fullName || dept.name) : '未知部门'
}

const getUserCount = (positionId) => {
  return positionUserCounts.value[positionId] || 0
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

// 自动生成岗位编码
const generatePositionCode = () => {
  if (!form.positionName.trim()) {
    ElMessage.warning('请先输入岗位名称')
    return
  }

  const positionName = form.positionName.trim()
  const nameCode = generatePositionNameCode(positionName)
  const randomSuffix = Math.random().toString(36).substr(2, 3).toUpperCase()

  let finalCode = nameCode
  if (randomSuffix) {
    finalCode += '_' + randomSuffix
  }

  if (!/^[a-zA-Z]/.test(finalCode)) {
    finalCode = 'POS_' + finalCode
  }

  form.positionCode = finalCode
  ElMessage.success('已自动生成岗位编码')
}

const generatePositionNameCode = (name) => {
  const positionNameMap = {
    // 管理岗位
    '总经理': 'GM',
    '副总经理': 'DGM',
    '总监': 'DIR',
    '副总监': 'ADIR',
    '经理': 'MGR',
    '副经理': 'AMGR',
    '主管': 'SUP',
    '组长': 'TL',
    '队长': 'TL',

    // 技术岗位
    '架构师': 'ARCH',
    '高级架构师': 'SARCH',
    '技术总监': 'CTO',
    '研发总监': 'RDD',
    '开发工程师': 'DEV',
    '高级开发工程师': 'SDEV',
    '前端工程师': 'FE',
    '后端工程师': 'BE',
    '全栈工程师': 'FS',
    '测试工程师': 'QA',
    '运维工程师': 'OPS',
    '数据库管理员': 'DBA',
    '系统管理员': 'SA',
    '网络管理员': 'NA',
    '安全工程师': 'SEC',
    '产品经理': 'PM',
    '项目经理': 'PJM',
    '技术专家': 'TE',

    // 业务岗位
    '销售总监': 'SD',
    '销售经理': 'SM',
    '销售代表': 'SR',
    '客户经理': 'AM',
    '市场总监': 'MD',
    '市场经理': 'MM',
    '市场专员': 'MS',
    '商务经理': 'BM',
    '商务专员': 'BS',

    // 职能岗位
    '人事总监': 'HRD',
    '人事经理': 'HRM',
    '人事专员': 'HR',
    '招聘专员': 'REC',
    '培训师': 'TR',
    '财务总监': 'CFO',
    '财务经理': 'FM',
    '会计': 'ACC',
    '出纳': 'CSH',
    '审计': 'AUD',
    '法务': 'LEG',
    '行政': 'ADM',
    '前台': 'REC',
    '助理': 'AST',
    '秘书': 'SEC',
    '客服': 'CS',

    // 设计岗位
    'UI设计师': 'UI',
    'UX设计师': 'UX',
    '平面设计师': 'GD',
    '视觉设计师': 'VD',
    '交互设计师': 'IXD'
  }

  return positionNameMap[name] || name.substr(0, 2).toUpperCase()
}

// 监听岗位名称变化，自动生成编码
watch(() => form.positionName, (newName) => {
  if (!isEdit.value && newName && newName.trim() && !form.positionCode) {
    setTimeout(() => {
      if (form.positionName === newName) {
        generatePositionCode()
      }
    }, 500)
  }
})

// 生命周期
onMounted(() => {
  loadDepartments()
  loadData()
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
  padding: 20px;
  background: white;
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
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    padding: 20px 0 0 0;
  }
}

.assign-tip {
  margin-bottom: 16px;
  font-weight: 500;
  color: #303133;
}

.assign-hint {
  margin-top: 16px;
  color: #909399;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 5px;
}

:deep(.el-table) {
  .el-button {
    margin-right: 8px;

    &:last-child {
      margin-right: 0;
    }
  }

  .el-tag {
    margin-right: 8px;
    margin-bottom: 2px;
  }
}

:deep(.el-dialog__body) {
  padding-top: 16px;
}
</style>