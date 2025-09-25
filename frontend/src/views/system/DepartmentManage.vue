<template>
  <div class="department-management-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h2>部门管理</h2>
        <p class="page-description">管理组织架构，支持多级部门结构和层级管理</p>
      </div>
    </div>

    <!-- 部门树形管理区域 -->
    <div class="department-content">
      <el-row :gutter="20">
        <!-- 左侧部门树 -->
        <el-col :span="8">
          <el-card class="department-tree-card">
            <template #header>
              <div class="tree-header">
                <span>部门结构</span>
                <div class="header-actions">
                  <el-button type="primary" size="small" @click="handleAddRoot">
                    <el-icon><Plus /></el-icon>
                    添加根部门
                  </el-button>
                  <el-button size="small" @click="refreshTree">
                    <el-icon><Refresh /></el-icon>
                    刷新
                  </el-button>
                </div>
              </div>
            </template>

            <div class="tree-content" v-loading="treeLoading">
              <el-empty v-if="treeData.length === 0" description="暂无部门数据" />
              <el-tree
                v-else
                ref="treeRef"
                :data="treeData"
                :props="treeProps"
                node-key="id"
                :expand-on-click-node="false"
                :highlight-current="true"
                :default-expand-all="true"
                @node-click="handleNodeClick"
              >
                <template #default="{ node, data }">
                  <div class="tree-node">
                    <span class="node-label">{{ data.deptName || data.name }}</span>
                    <div class="node-actions">
                      <el-button
                        type="text"
                        size="small"
                        @click.stop="handleAddChild(data)"
                        title="添加子部门"
                      >
                        <el-icon><Plus /></el-icon>
                      </el-button>
                      <el-button
                        type="text"
                        size="small"
                        @click.stop="handleEdit(data)"
                        title="编辑"
                      >
                        <el-icon><Edit /></el-icon>
                      </el-button>
                      <el-button
                        type="text"
                        size="small"
                        @click.stop="handleDelete(data)"
                        title="删除"
                        :disabled="data.children && data.children.length > 0"
                      >
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                  </div>
                </template>
              </el-tree>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧表单区域 -->
        <el-col :span="16">
          <el-card class="department-form-card">
            <template #header>
              <span>{{ isEdit ? '编辑部门' : '新增部门' }}</span>
            </template>

            <div class="form-content" v-loading="formLoading">
              <el-form
                ref="formRef"
                :model="form"
                :rules="rules"
                label-width="100px"
                @submit.prevent="handleSubmit"
              >
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="部门名称" prop="deptName">
                      <el-input v-model="form.deptName" placeholder="请输入部门名称" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="部门编码" prop="deptCode">
                      <el-input v-model="form.deptCode" placeholder="请输入部门编码">
                        <template #append>
                          <el-button @click="generateDeptCode" title="自动生成编码">
                            <el-icon><Refresh /></el-icon>
                          </el-button>
                        </template>
                      </el-input>
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="上级部门">
                      <el-cascader
                        v-model="form.parentPath"
                        :options="cascaderOptions"
                        :props="cascaderProps"
                        placeholder="请选择上级部门"
                        clearable
                        style="width: 100%"
                        @change="handleParentChange"
                        :disabled="!isEdit && form.parentId !== null"
                      />
                      <div v-if="!isEdit && form.parentId !== null" class="form-hint">
                        为"{{ parentDeptName }}"添加子部门
                      </div>
                    </el-form-item>
                  </el-col>
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
                </el-row>

                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="部门负责人">
                      <el-select
                        v-model="form.managerId"
                        placeholder="请选择部门负责人"
                        clearable
                        filterable
                        style="width: 100%"
                        :loading="userListLoading"
                      >
                        <el-option
                          v-for="user in userList"
                          :key="user.id"
                          :label="user.name"
                          :value="user.id"
                        >
                          <span style="float: left">{{ user.name }}</span>
                          <span style="float: right; color: #8492a6; font-size: 13px">
                            {{ user.department || '未分配' }}
                          </span>
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="联系电话">
                      <el-input v-model="form.phone" placeholder="请输入联系电话" />
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-form-item label="部门描述">
                  <el-input
                    v-model="form.description"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入部门描述"
                  />
                </el-form-item>

                <el-form-item label="状态">
                  <el-radio-group v-model="form.status">
                    <el-radio :label="1">启用</el-radio>
                    <el-radio :label="0">禁用</el-radio>
                  </el-radio-group>
                </el-form-item>

                <el-form-item class="form-actions">
                  <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
                    保存
                  </el-button>
                  <el-button @click="handleCancel">
                    取消
                  </el-button>
                  <el-button v-if="isEdit" type="danger" @click="handleDeleteCurrent">
                    删除部门
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Edit, Delete } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import type { DepartmentInfo, DepartmentFormData } from '@/types/department'
import {
  getDepartmentTree,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  updateDepartmentStatus
} from '@/api/system/department'

// 响应式数据
const treeRef = ref()
const formRef = ref<FormInstance>()
const treeData = ref<DepartmentInfo[]>([])
const userList = ref<any[]>([])
const currentDept = ref<DepartmentInfo | null>(null)
const treeLoading = ref(false)
const formLoading = ref(false)
const userListLoading = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)

// 树配置
const treeProps = {
  children: 'children',
  label: 'deptName'
}

// 级联选择器配置
const cascaderProps = {
  value: 'id',
  label: 'deptName',
  children: 'children',
  checkStrictly: true
}

// 表单数据
const form = reactive<DepartmentFormData & { id?: number; parentPath: number[] }>({
  id: undefined,
  deptName: '',
  deptCode: '',
  parentId: null,
  parentPath: [],
  managerId: null,
  phone: '',
  description: '',
  sortOrder: 0,
  status: 1
})

// 表单验证规则
const rules = {
  deptName: [
    { required: true, message: '请输入部门名称', trigger: 'blur' },
    { min: 2, max: 20, message: '部门名称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  deptCode: [
    { required: true, message: '请输入部门编码', trigger: 'blur' },
    { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '编码必须以字母开头，只能包含字母、数字和下划线', trigger: 'blur' }
  ]
}

// 计算属性
const cascaderOptions = computed(() => {
  const buildOptions = (data: DepartmentInfo[]): any[] => {
    return data.map(item => ({
      id: item.id,
      deptName: item.deptName,
      children: item.children && item.children.length > 0 ? buildOptions(item.children) : undefined
    }))
  }
  return buildOptions(treeData.value)
})

const parentDeptName = computed(() => {
  if (!form.parentId) return ''
  const findDeptName = (data: DepartmentInfo[], id: number): string => {
    for (const item of data) {
      if (item.id === id) {
        return item.deptName
      }
      if (item.children) {
        const found = findDeptName(item.children, id)
        if (found) return found
      }
    }
    return ''
  }
  return findDeptName(treeData.value, form.parentId)
})

// 模拟数据
const mockDepartmentTree: DepartmentInfo[] = [
  {
    id: 1,
    deptName: '总公司',
    deptCode: 'HQ',
    parentId: null,
    managerId: 1,
    managerName: '张三',
    phone: '010-12345678',
    description: '总公司',
    sortOrder: 1,
    status: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
    children: [
      {
        id: 2,
        deptName: '技术部',
        deptCode: 'TECH',
        parentId: 1,
        managerId: 2,
        managerName: '李四',
        phone: '010-12345679',
        description: '技术研发部门',
        sortOrder: 1,
        status: 1,
        createTime: '2024-01-01 10:00:00',
        updateTime: '2024-01-01 10:00:00',
        children: [
          {
            id: 3,
            deptName: '前端组',
            deptCode: 'FE',
            parentId: 2,
            managerId: 3,
            managerName: '王五',
            phone: '010-12345680',
            description: '前端开发组',
            sortOrder: 1,
            status: 1,
            createTime: '2024-01-01 10:00:00',
            updateTime: '2024-01-01 10:00:00'
          },
          {
            id: 4,
            deptName: '后端组',
            deptCode: 'BE',
            parentId: 2,
            managerId: 4,
            managerName: '赵六',
            phone: '010-12345681',
            description: '后端开发组',
            sortOrder: 2,
            status: 1,
            createTime: '2024-01-01 10:00:00',
            updateTime: '2024-01-01 10:00:00'
          }
        ]
      },
      {
        id: 5,
        deptName: '人力资源部',
        deptCode: 'HR',
        parentId: 1,
        managerId: 5,
        managerName: '钱七',
        phone: '010-12345682',
        description: '人力资源管理部门',
        sortOrder: 2,
        status: 1,
        createTime: '2024-01-01 10:00:00',
        updateTime: '2024-01-01 10:00:00'
      }
    ]
  }
]

const mockUserList = [
  { id: 1, name: '张三', department: '总公司' },
  { id: 2, name: '李四', department: '技术部' },
  { id: 3, name: '王五', department: '前端组' },
  { id: 4, name: '赵六', department: '后端组' },
  { id: 5, name: '钱七', department: '人力资源部' },
  { id: 6, name: '孙八', department: '未分配' },
  { id: 7, name: '周九', department: '未分配' }
]

// 方法
const loadTreeData = async () => {
  treeLoading.value = true
  try {
    // 使用模拟数据代替API调用
    // const data = await getDepartmentTree()
    await new Promise(resolve => setTimeout(resolve, 500)) // 模拟网络延迟
    treeData.value = mockDepartmentTree
    ElMessage.success('部门数据加载成功')
  } catch (error) {
    ElMessage.error('加载部门数据失败')
    console.error(error)
    treeData.value = []
  } finally {
    treeLoading.value = false
  }
}

const loadUserList = async () => {
  userListLoading.value = true
  try {
    // 使用模拟数据代替API调用
    await new Promise(resolve => setTimeout(resolve, 300))
    userList.value = mockUserList
  } catch (error) {
    console.error('加载用户列表失败:', error)
    userList.value = []
  } finally {
    userListLoading.value = false
  }
}

const refreshTree = () => {
  loadTreeData()
}

const handleNodeClick = (data: DepartmentInfo) => {
  currentDept.value = data
  loadDeptDetail(data.id)
}

const loadDeptDetail = async (id: number) => {
  formLoading.value = true
  try {
    // 使用模拟数据代替API调用
    // const dept = await getDepartmentById(id)
    await new Promise(resolve => setTimeout(resolve, 300))
    const dept = findDeptById(treeData.value, id)
    if (dept) {
      form.id = dept.id
      form.deptName = dept.deptName
      form.deptCode = dept.deptCode || ''
      form.parentId = dept.parentId || null
      form.parentPath = dept.parentId ? getParentPath(dept.parentId) : []
      form.managerId = dept.managerId || null
      form.phone = dept.phone || ''
      form.description = dept.description || ''
      form.sortOrder = dept.sortOrder || 0
      form.status = dept.status ?? 1
      isEdit.value = true
    }
  } catch (error) {
    ElMessage.error('加载部门详情失败')
    console.error(error)
  } finally {
    formLoading.value = false
  }
}

const findDeptById = (data: DepartmentInfo[], id: number): DepartmentInfo | null => {
  for (const item of data) {
    if (item.id === id) {
      return item
    }
    if (item.children) {
      const found = findDeptById(item.children, id)
      if (found) return found
    }
  }
  return null
}

const getParentPath = (parentId: number): number[] => {
  const findPath = (data: DepartmentInfo[], targetId: number, path: number[] = []): number[] => {
    for (const item of data) {
      const currentPath = [...path, item.id]
      if (item.id === targetId) {
        return currentPath
      }
      if (item.children) {
        const found = findPath(item.children, targetId, currentPath)
        if (found.length > 0) return found
      }
    }
    return []
  }
  return findPath(treeData.value, parentId)
}

const handleAddRoot = () => {
  resetForm()
  isEdit.value = false
}

const handleAddChild = (data: DepartmentInfo) => {
  resetForm()
  form.parentId = data.id
  form.parentPath = [...getParentPath(data.id), data.id]
  isEdit.value = false
  currentDept.value = data
}

const handleEdit = (data: DepartmentInfo) => {
  handleNodeClick(data)
}

const handleDelete = async (data: DepartmentInfo) => {
  if (data.children && data.children.length > 0) {
    ElMessage.warning('请先删除子部门')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除部门"${data.deptName}"吗？删除后该部门下的所有用户将被移至上级部门。`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 使用模拟删除代替API调用
    // await deleteDepartment(data.id)
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('删除成功')
    loadTreeData()
    resetForm()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }
}

const handleDeleteCurrent = () => {
  if (currentDept.value && currentDept.value.id) {
    handleDelete(currentDept.value)
  }
}

const handleParentChange = (value: number[]) => {
  form.parentId = value && value.length > 0 ? value[value.length - 1] : null
}

const resetForm = () => {
  form.id = undefined
  form.deptName = ''
  form.deptCode = ''
  form.parentId = null
  form.parentPath = []
  form.managerId = null
  form.phone = ''
  form.description = ''
  form.sortOrder = 0
  form.status = 1
  currentDept.value = null
  isEdit.value = false
  formRef.value?.clearValidate()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    submitLoading.value = true

    const submitData: DepartmentFormData = {
      deptName: form.deptName,
      deptCode: form.deptCode,
      parentId: form.parentId,
      managerId: form.managerId || null,
      phone: form.phone,
      description: form.description,
      sortOrder: form.sortOrder || 0,
      status: form.status
    }

    // 使用模拟操作代替API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (isEdit.value && form.id) {
      // await updateDepartment(form.id, submitData)
      ElMessage.success('编辑成功')
    } else {
      // await createDepartment(submitData)
      ElMessage.success('新增成功')
      resetForm()
    }

    loadTreeData()
  } catch (error) {
    ElMessage.error(isEdit.value ? '编辑失败' : '新增失败')
    console.error(error)
  } finally {
    submitLoading.value = false
  }
}

const handleCancel = () => {
  resetForm()
}

// 自动生成部门编码
const generateDeptCode = () => {
  if (!form.deptName.trim()) {
    ElMessage.warning('请先输入部门名称')
    return
  }

  const deptName = form.deptName.trim()
  const nameCode = generateNameCode(deptName)
  const randomSuffix = Math.random().toString(36).substr(2, 3).toUpperCase()

  let finalCode = nameCode
  if (form.parentId) {
    const parentDept = findDeptById(treeData.value, form.parentId)
    if (parentDept && parentDept.deptCode) {
      finalCode = parentDept.deptCode + '_' + nameCode
    }
  }

  if (!/^[a-zA-Z]/.test(finalCode)) {
    finalCode = 'DEPT_' + finalCode
  }

  form.deptCode = finalCode + '_' + randomSuffix
  ElMessage.success('已自动生成部门编码')
}

const generateNameCode = (name: string) => {
  const deptNameMap: Record<string, string> = {
    '总公司': 'HQ',
    '总部': 'HQ',
    '技术部': 'TECH',
    '信息技术部': 'IT',
    '人力资源部': 'HR',
    '市场营销部': 'MKT',
    '市场部': 'MKT',
    '销售部': 'SALES',
    '财务部': 'FIN',
    '行政部': 'ADMIN',
    '运营部': 'OPS',
    '研发部': 'RD',
    '客服部': 'CS',
    '采购部': 'PUR',
    '质量部': 'QA',
    '生产部': 'PROD',
    '物流部': 'LOG',
    '法务部': 'LEGAL',
    '前端组': 'FE',
    '前端开发组': 'FE',
    '后端组': 'BE',
    '后端开发组': 'BE',
    '测试组': 'TEST',
    '产品组': 'PROD',
    '设计组': 'DESIGN'
  }

  return deptNameMap[name] || name.substr(0, 2).toUpperCase()
}

// 监听部门名称变化，自动生成编码
watch(() => form.deptName, (newName) => {
  if (!isEdit.value && newName && newName.trim() && !form.deptCode) {
    setTimeout(() => {
      if (form.deptName === newName) {
        generateDeptCode()
      }
    }, 500)
  }
})

// 生命周期
onMounted(() => {
  loadTreeData()
  loadUserList()
})
</script>

<style scoped lang="scss">
.department-management-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  margin-bottom: 20px;

  .header-content {
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
  }
}

.department-content {
  .department-tree-card, .department-form-card {
    height: 700px;

    :deep(.el-card__header) {
      padding: 16px 20px;
      border-bottom: 1px solid #e4e7ed;

      .tree-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .header-actions {
          display: flex;
          gap: 8px;
        }
      }
    }

    :deep(.el-card__body) {
      padding: 20px;
      height: calc(100% - 57px);
      overflow-y: auto;
    }
  }

  .tree-content {
    height: 100%;
    overflow-y: auto;
  }

  .form-content {
    height: 100%;
    overflow-y: auto;
  }
}

.tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 8px;

  .node-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .node-actions {
    display: none;
    align-items: center;
    gap: 4px;

    .el-button {
      padding: 4px;

      &:hover {
        background-color: transparent;
      }
    }
  }

  &:hover .node-actions {
    display: flex;
  }
}

.form-hint {
  color: #909399;
  font-size: 12px;
  margin-top: 4px;
}

.form-actions {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;

  .el-button {
    margin-right: 12px;
  }
}

:deep(.el-tree-node__content) {
  height: 36px;

  &:hover {
    background-color: #f5f7fa;
  }
}

:deep(.el-tree-node__content .is-current) {
  background-color: #e6f7ff;
  color: #1890ff;
}

// 级联选择器样式修复
:deep(.el-cascader-panel .el-cascader-node) {
  color: #303133;

  &:hover {
    background-color: #f5f7fa;
  }

  &.is-active {
    background-color: #409eff;
    color: #ffffff;
  }
}

:deep(.el-cascader__dropdown) {
  .el-cascader-panel .el-cascader-node {
    color: #303133;

    .el-cascader-node__label {
      color: #303133;
    }

    &:hover {
      background-color: #f5f7fa;

      .el-cascader-node__label {
        color: #303133;
      }
    }

    &.is-active {
      background-color: #409eff;
      color: #ffffff;

      .el-cascader-node__label {
        color: #ffffff;
      }
    }
  }
}
</style>