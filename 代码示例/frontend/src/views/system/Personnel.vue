<template>
  <div class="personnel-management-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h2>人员管理</h2>
          <p class="page-description">管理企业人员信息，包括员工档案、部门分配和岗位管理</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增人员
          </el-button>
          <el-button
            type="success"
            @click="handleImport"
          >
            <el-icon><Upload /></el-icon>
            导入人员
          </el-button>
          <el-button
            @click="handleExport"
          >
            <el-icon><Download /></el-icon>
            导出人员
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
            placeholder="搜索姓名/工号/手机号"
            prefix-icon="Search"
            style="width: 240px"
            @keyup.enter="handleSearch"
            clearable
          />
          <el-cascader
            v-model="searchForm.departmentId"
            :options="departmentTreeData"
            :props="{
              value: 'id',
              label: 'label',
              children: 'children',
              checkStrictly: true,
              emitPath: false
            }"
            placeholder="选择部门"
            clearable
            style="width: 180px"
            @change="handleSearchDepartmentChange"
          />
          <el-select
            v-model="searchForm.positionId"
            placeholder="选择岗位"
            style="width: 180px"
            clearable
            @change="handleSearch"
          >
            <el-option
              v-for="position in searchFilteredPositions"
              :key="position.id"
              :label="position.name || position.positionName"
              :value="position.id"
            />
          </el-select>
          <el-select
            v-model="searchForm.status"
            placeholder="在职状态"
            style="width: 120px"
            clearable
            @change="handleSearch"
          >
            <el-option label="在职" value="在职" />
            <el-option label="离职" value="离职" />
            <el-option label="试用" value="试用" />
            <el-option label="停职" value="停职" />
          </el-select>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </div>
      </div>
    </div>

    <!-- 人员列表 -->
    <div class="personnel-list-section">
      <el-table
        :data="tableData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        row-key="id"
        v-loading="loading"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="employeeId" label="员工编号" min-width="100" />
        <el-table-column prop="name" label="姓名" min-width="80" />
        <el-table-column prop="gender" label="性别" width="70">
          <template #default="{ row }">
            <el-tag :type="row.gender === '男' ? 'primary' : 'danger'" size="small">
              {{ row.gender }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" min-width="110" />
        <el-table-column prop="email" label="邮箱" min-width="150" show-overflow-tooltip />
        <el-table-column prop="departmentName" label="所属部门" min-width="100" show-overflow-tooltip />
        <el-table-column prop="positionName" label="岗位" min-width="100" show-overflow-tooltip />
        <el-table-column prop="hireDate" label="入职日期" width="100">
          <template #default="{ row }">
            {{ formatDate(row.hireDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              size="small"
              @click="handleView(row)"
            >
              查看
            </el-button>
            <el-button
              type="success"
              link
              size="small"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              link
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

    <!-- 新增/编辑人员对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="900px"
      destroy-on-close
      class="personnel-dialog"
    >
      <div class="resume-layout">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="80px"
        >
          <!-- 分组信息卡片 -->
          <div class="resume-content">
            <!-- 基本信息 -->
            <div class="info-card">
              <div class="card-header">
                <el-icon class="card-icon"><InfoFilled /></el-icon>
                <span class="card-title">基本信息</span>
              </div>
              <div class="card-content">
                <div class="basic-info-layout">
                  <!-- 照片区域 -->
                  <div class="photo-section">
                    <div class="photo-upload">
                      <el-upload
                        v-model:file-list="photoFileList"
                        :action="uploadAction"
                        :show-file-list="false"
                        :before-upload="beforePhotoUpload"
                        :on-success="handlePhotoSuccess"
                        :on-error="handlePhotoError"
                        accept="image/*"
                        class="photo-uploader"
                      >
                        <div class="photo-container">
                          <img
                            v-if="form.photo"
                            :src="form.photo"
                            class="photo-preview"
                            alt="员工照片"
                          />
                          <div v-else class="photo-placeholder">
                            <el-icon class="photo-icon"><Plus /></el-icon>
                            <div class="photo-text">上传照片</div>
                          </div>
                        </div>
                      </el-upload>
                      <div class="photo-tips">建议上传一寸照片</div>
                    </div>
                  </div>

                  <!-- 基本信息表单 -->
                  <div class="basic-form">
                    <el-row :gutter="20">
                      <el-col :span="12">
                        <el-form-item label="姓名" prop="name">
                          <el-input
                            v-model="form.name"
                            placeholder="请输入姓名"
                          />
                        </el-form-item>
                      </el-col>
                      <el-col :span="12">
                        <el-form-item label="员工编号" prop="employeeId">
                          <el-input
                            v-model="form.employeeId"
                            placeholder="请输入员工编号"
                            :disabled="isEdit"
                          >
                            <template #append v-if="!isEdit">
                              <el-button @click="generateEmployeeId">
                                <el-icon><Refresh /></el-icon>
                              </el-button>
                            </template>
                          </el-input>
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-row :gutter="20">
                      <el-col :span="12">
                        <el-form-item label="性别" prop="gender" class="gender-form-item">
                          <el-radio-group v-model="form.gender">
                            <el-radio label="男">男</el-radio>
                            <el-radio label="女">女</el-radio>
                          </el-radio-group>
                        </el-form-item>
                      </el-col>
                      <el-col :span="12">
                        <el-form-item label="身份证号" prop="idCard">
                          <el-input
                            v-model="form.idCard"
                            placeholder="请输入身份证号"
                            @input="handleIdCardInput"
                            maxlength="18"
                          />
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-row :gutter="20">
                      <el-col :span="12">
                        <el-form-item label="生日" prop="birthday">
                          <el-date-picker
                            v-model="form.birthday"
                            type="date"
                            placeholder="选择生日或输入身份证号自动提取"
                            value-format="YYYY-MM-DD"
                            style="width: 100%"
                          />
                        </el-form-item>
                      </el-col>
                    </el-row>
                  </div>
                </div>
              </div>
            </div>

            <!-- 联系方式 -->
            <div class="info-card">
              <div class="card-header">
                <el-icon class="card-icon"><Phone /></el-icon>
                <span class="card-title">联系方式</span>
              </div>
              <div class="card-content">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="手机号" prop="phone">
                      <el-input v-model="form.phone" placeholder="请输入手机号" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="邮箱" prop="email">
                      <el-input v-model="form.email" placeholder="请输入邮箱" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="24">
                    <el-form-item label="地址">
                      <el-input v-model="form.address" placeholder="请输入地址" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>
            </div>

            <!-- 工作信息 -->
            <div class="info-card">
              <div class="card-header">
                <el-icon class="card-icon"><Briefcase /></el-icon>
                <span class="card-title">工作信息</span>
              </div>
              <div class="card-content">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="所属部门" prop="departmentId">
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
                        placeholder="请选择部门"
                        clearable
                        style="width: 100%"
                        @change="handleDepartmentChange"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="岗位" prop="positionId">
                      <el-select
                        v-model="form.positionId"
                        placeholder="请选择岗位"
                        style="width: 100%"
                      >
                        <el-option
                          v-for="position in filteredPositions"
                          :key="position.id"
                          :label="position.name || position.positionName"
                          :value="position.id"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="入职日期" prop="hireDate">
                      <el-date-picker
                        v-model="form.hireDate"
                        type="date"
                        placeholder="选择入职日期"
                        value-format="YYYY-MM-DD"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="状态" prop="status">
                      <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
                        <el-option label="在职" value="在职" />
                        <el-option label="离职" value="离职" />
                        <el-option label="试用" value="试用" />
                        <el-option label="停职" value="停职" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>
            </div>
          </div>

        </el-form>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 查看人员详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="人员详情"
      width="700px"
      destroy-on-close
    >
      <el-descriptions :column="2" border v-if="currentPersonnel">
        <el-descriptions-item label="员工编号">{{ currentPersonnel.employeeId }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ currentPersonnel.name }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ currentPersonnel.gender }}</el-descriptions-item>
        <el-descriptions-item label="生日">{{ currentPersonnel.birthday }}</el-descriptions-item>
        <el-descriptions-item label="身份证号">{{ currentPersonnel.idCard }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ currentPersonnel.phone }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ currentPersonnel.email }}</el-descriptions-item>
        <el-descriptions-item label="入职日期">{{ currentPersonnel.hireDate }}</el-descriptions-item>
        <el-descriptions-item label="所属部门">{{ currentPersonnel.departmentName }}</el-descriptions-item>
        <el-descriptions-item label="岗位">{{ currentPersonnel.positionName }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentPersonnel.status)">
            {{ getStatusText(currentPersonnel.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="年龄">{{ currentPersonnel.age }}岁</el-descriptions-item>
        <el-descriptions-item label="工龄">{{ currentPersonnel.workYears }}年</el-descriptions-item>
        <el-descriptions-item label="地址" :span="2">{{ currentPersonnel.address }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Download, Delete, Refresh, Search, User, InfoFilled, Phone, Briefcase, Edit } from '@element-plus/icons-vue'
import systemApi from '@/api/modules/system'

// 响应式数据
const loading = ref(false)
const tableData = ref([])
const departmentList = ref([])
const departmentTreeData = ref([])
const positionList = ref([])
const selectedRows = ref([])
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)
const formRef = ref()
const currentPersonnel = ref(null)

// 照片上传相关
const photoFileList = ref([])
const uploadAction = ref('#')

// 搜索表单
const searchForm = reactive({
  keyword: '',
  departmentId: '',
  positionId: '',
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
  employeeId: '',
  name: '',
  gender: '男',
  birthday: '',
  idCard: '',
  phone: '',
  email: '',
  departmentId: '',
  positionId: '',
  hireDate: '',
  status: '在职',
  address: '',
  remark: '',
  photo: ''
})

// 表单验证规则
const rules = {
  employeeId: [
    { required: true, message: '请输入员工编号', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  idCard: [
    { pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, message: '请输入正确的身份证号', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  departmentId: [
    { required: true, message: '请选择部门', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 计算属性
const dialogTitle = computed(() => {
  return isEdit.value ? '编辑人员' : '新增人员'
})

const filteredPositions = computed(() => {
  if (!form.departmentId) {
    return positionList.value
  }

  // 基础过滤：根据部门ID过滤岗位
  let filtered = positionList.value.filter(p => p.departmentId === form.departmentId)

  // 编辑模式下的特殊处理：确保当前人员的岗位始终在列表中
  if (isEdit.value && form.positionId) {
    const currentPosition = positionList.value.find(p => p.id === form.positionId)
    if (currentPosition && !filtered.find(p => p.id === form.positionId)) {
      // 如果当前岗位不在过滤列表中，则添加它
      filtered.unshift(currentPosition)
    }
  }

  return filtered
})

// 查询条件中的岗位过滤
const searchFilteredPositions = computed(() => {
  if (!searchForm.departmentId) {
    return positionList.value
  }
  return positionList.value.filter(p => p.departmentId === searchForm.departmentId)
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
      positionId: searchForm.positionId || undefined,
      status: searchForm.status || undefined
    }

    const data = await systemApi.personnel.getPage(params)
    tableData.value = data.records || data.content || []
    pagination.total = data.total || data.totalElements || 0
  } catch (error) {
    ElMessage.error('加载人员数据失败')
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

const loadPositions = async () => {
  try {
    const data = await systemApi.position.getAll()
    positionList.value = data.records || data.content || []
  } catch (error) {
    console.error('加载岗位数据失败:', error)
    positionList.value = []
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

const handleView = async (row) => {
  try {
    const data = await systemApi.personnel.getById(row.id)
    currentPersonnel.value = data
    detailDialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取人员详情失败')
    console.error(error)
  }
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.keys(form).forEach(key => {
    form[key] = row[key] || (key === 'gender' ? '男' : key === 'status' ? '在职' : '')
  })

  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除员工"${row.name}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await systemApi.personnel.delete(row.id)
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
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个员工吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const ids = selectedRows.value.map(row => row.id)
    await systemApi.personnel.batchDelete(ids)
    ElMessage.success('批量删除成功')
    selectedRows.value = []
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
      console.error(error)
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    submitLoading.value = true

    const submitData = { ...form }

    if (isEdit.value && form.id) {
      await systemApi.personnel.update(form.id, submitData)
      ElMessage.success('编辑成功')
    } else {
      await systemApi.personnel.create(submitData)
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

const handleImport = () => {
  ElMessage.info('导入功能开发中')
}

const handleExport = () => {
  ElMessage.info('导出功能开发中')
}

const handleDepartmentChange = () => {
  // 部门改变时，清空岗位选择
  form.positionId = ''
}

const handleSearchDepartmentChange = () => {
  // 查询条件部门改变时，清空岗位选择
  searchForm.positionId = ''
  handleSearch()
}

const generateEmployeeId = async () => {
  try {
    const data = await systemApi.personnel.generateEmployeeId(form.departmentId, form.name)
    form.employeeId = data
    ElMessage.success('已自动生成员工编号')
  } catch (error) {
    // 如果API失败，使用本地生成
    const prefix = 'EMP'
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substr(2, 3).toUpperCase()
    form.employeeId = `${prefix}-${timestamp}-${random}`
    ElMessage.success('已自动生成员工编号')
  }
}

// 照片上传相关方法
const beforePhotoUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('上传照片只能是 JPG/PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('上传照片大小不能超过 2MB!')
    return false
  }

  // 使用FileReader预览图片
  const reader = new FileReader()
  reader.onload = (e) => {
    form.photo = e.target.result
  }
  reader.readAsDataURL(file)

  return false // 阻止自动上传
}

const handlePhotoSuccess = (response, file) => {
  form.photo = URL.createObjectURL(file.raw)
  ElMessage.success('照片上传成功')
}

const handlePhotoError = () => {
  ElMessage.error('照片上传失败')
}

// 身份证号处理方法
const handleIdCardInput = (value) => {
  if (value && value.length === 18) {
    const birthday = extractBirthdayFromIdCard(value)
    if (birthday) {
      form.birthday = birthday
      ElMessage.success('已自动提取生日信息')
    }
  }
}

// 从身份证号提取生日
const extractBirthdayFromIdCard = (idCard) => {
  if (!idCard || idCard.length !== 18) {
    return null
  }

  // 验证身份证号格式
  const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
  if (!idCardRegex.test(idCard)) {
    return null
  }

  // 提取生日
  const year = idCard.substring(6, 10)
  const month = idCard.substring(10, 12)
  const day = idCard.substring(12, 14)

  return `${year}-${month}-${day}`
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
  form.employeeId = ''
  form.name = ''
  form.gender = '男'
  form.birthday = ''
  form.idCard = ''
  form.phone = ''
  form.email = ''
  form.departmentId = ''
  form.positionId = ''
  form.hireDate = ''
  form.status = '在职'
  form.address = ''
  form.remark = ''
  form.photo = ''
  photoFileList.value = []

  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

const getStatusType = (status) => {
  // 处理数字状态值
  const statusTextMap = {
    '1': '在职',
    '0': '离职',
    '2': '试用',
    '3': '停职'
  }

  const actualStatus = statusTextMap[status] || status

  const typeMap = {
    '在职': 'success',
    '离职': 'danger',
    '试用': 'warning',
    '停职': 'info'
  }
  return typeMap[actualStatus] || 'info'
}

const getStatusText = (status) => {
  // 处理数字状态值
  const statusTextMap = {
    '1': '在职',
    '0': '离职',
    '2': '试用',
    '3': '停职'
  }
  return statusTextMap[status] || status || '未知'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return dateString
}

// 生命周期
onMounted(() => {
  loadData()
  loadDepartments()
  loadPositions()
})
</script>

<style scoped lang="scss">
.personnel-management-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
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

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }
}

.filter-section {
  background: white;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .filter-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .filter-left {
    display: flex;
    gap: 12px;
    align-items: center;
  }
}

.personnel-list-section {
  background: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table) {
  th {
    background: #f5f7fa !important;
    color: #303133;
    font-weight: 600;
  }

  .el-table__fixed-right-patch {
    background: #f5f7fa !important;
  }
}

:deep(.el-dialog) {
  .el-dialog__header {
    border-bottom: 1px solid #e4e7ed;
    padding: 16px 20px;
  }

  .el-dialog__body {
    padding: 20px;
  }

  .el-dialog__footer {
    border-top: 1px solid #e4e7ed;
    padding: 16px 20px;
  }
}

/* 简历风格样式 */
.personnel-dialog {
  :deep(.el-dialog) {
    border-radius: 12px;
    overflow: hidden;
  }

  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.resume-layout {
  background: #f8fafc;
  min-height: 600px;
}

/* 基本信息布局样式 */
.basic-info-layout {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.photo-section {
  flex-shrink: 0;

  .photo-upload {
    text-align: center;

    .photo-uploader {
      .photo-container {
        width: 102px;  /* 一寸照片宽度 */
        height: 126px; /* 一寸照片高度 */
        border: 2px dashed #d9d9d9;
        border-radius: 8px;
        overflow: hidden;
        position: relative;
        transition: all 0.3s ease;
        cursor: pointer;

        &:hover {
          border-color: #667eea;
        }

        .photo-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .photo-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #8c8c8c;
          background: #fafafa;

          .photo-icon {
            font-size: 24px;
            margin-bottom: 8px;
          }

          .photo-text {
            font-size: 12px;
          }
        }
      }
    }

    .photo-tips {
      margin-top: 8px;
      font-size: 12px;
      color: #999;
    }
  }
}

.basic-form {
  flex: 1;
  min-width: 0;

  /* 性别表单项特殊样式 */
  .gender-form-item {
    :deep(.el-form-item__label) {
      line-height: 32px;
    }

    :deep(.el-form-item__content) {
      line-height: 32px;
    }

    :deep(.el-radio-group) {
      display: inline-flex;
      align-items: center;
      height: 32px;
    }
  }
}

.resume-content {
  padding: 30px;

  .info-card {
    background: white;
    border-radius: 12px;
    margin-bottom: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
    }

    .card-header {
      display: flex;
      align-items: center;
      padding: 20px 24px 0;
      margin-bottom: 20px;

      .card-icon {
        font-size: 20px;
        color: #667eea;
        margin-right: 12px;
      }

      .card-title {
        font-size: 18px;
        font-weight: 600;
        color: #2d3748;
        position: relative;

        &::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          width: 40px;
          height: 3px;
          background: linear-gradient(to right, #667eea, #764ba2);
          border-radius: 2px;
        }
      }
    }

    .card-content {
      padding: 0 24px 24px;

      :deep(.el-form-item) {
        margin-bottom: 18px;

        .el-form-item__label {
          color: #4a5568;
          font-weight: 500;
          line-height: 1.6;
        }

        .el-input {
          .el-input__wrapper {
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            box-shadow: none;
            transition: all 0.3s ease;

            &:hover {
              border-color: #c0c4cc;
            }

            &.is-focus {
              border-color: #667eea;
              box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
            }
          }

          input {
            border: none;
            box-shadow: none;
            border-radius: 0;
          }
        }

        .el-select {
          .el-select__wrapper {
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            box-shadow: none;
            transition: all 0.3s ease;

            &:hover {
              border-color: #c0c4cc;
            }

            &.is-focus {
              border-color: #667eea;
              box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
            }
          }
        }

        .el-cascader {
          .el-cascader__inner {
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            box-shadow: none;
            transition: all 0.3s ease;

            &:hover {
              border-color: #c0c4cc;
            }

            &.is-focus {
              border-color: #667eea;
              box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
            }
          }
        }

        .el-date-editor {
          &.el-input {
            .el-input__wrapper {
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              box-shadow: none;

              &:hover {
                border-color: #c0c4cc;
              }

              &.is-focus {
                border-color: #667eea;
                box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
              }
            }
          }
        }

        .el-radio-group {
          .el-radio {
            margin-right: 24px;

            .el-radio__input.is-checked .el-radio__inner {
              background: #667eea;
              border-color: #667eea;
            }
          }
        }
      }
    }
  }
}
</style>