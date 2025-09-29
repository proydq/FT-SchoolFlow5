<template>
  <div class="permission-form">
    <!-- 标题与返回区 -->
    <div class="header-section">
      <div class="page-title">
        <h2>手动创建通行权限</h2>
      </div>
      <div class="header-actions">
        <el-button @click="handleBack">返回列表</el-button>
        <el-tooltip content="手动创建权限规则：学生仅可选择校门/宿舍区闸机" placement="bottom">
          <el-icon class="help-icon"><QuestionFilled /></el-icon>
        </el-tooltip>
      </div>
    </div>

    

    <!-- 中间部分：人员信息列表和房间信息列表 -->
    <div class="content-section">
      <el-row :gutter="20">
        <!-- 左侧：人员信息列表 -->
        <el-col :span="12">
          <div class="list-section">
            <div class="section-header">
              <h3 class="section-title">人员信息列表</h3>
              <div class="header-actions">
                <el-button type="primary" size="small" @click="showSelectUserDialog = true">
                  <el-icon><Plus /></el-icon>
                  添加人员
                </el-button>
                <el-button 
                  type="danger" 
                  size="small" 
                  :disabled="selectedUsersTableSelection.length === 0"
                  @click="batchRemoveSelectedUsers"
                >
                  <el-icon><Delete /></el-icon>
                  批量移除
                </el-button>
                <el-button 
                  type="warning" 
                  size="small"
                  :disabled="selectedUsers.length === 0"
                  @click="clearAllSelectedUsers"
                >
                  <el-icon><DeleteFilled /></el-icon>
                  清空全部
                </el-button>
                <el-input
                  v-model="userSearch"
                  placeholder="搜索已选人员..."
                  size="small"
                  prefix-icon="Search"
                  style="width: 200px"
                />
              </div>
            </div>
            <el-table
              :data="paginatedSelectedUsers"
              height="300"
              @selection-change="handleSelectedUserSelectionChange"
              style="width: 100%"
              :row-class-name="tableRowClassName"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column prop="name" label="姓名" width="100" />
              <el-table-column prop="code" label="工号/学号" width="120" />
              <el-table-column prop="type" label="类型" width="80">
                <template #default="scope">
                  <el-tag :type="scope.row.type === 'teacher' ? 'primary' : 'success'">
                    {{ scope.row.type === 'teacher' ? '教师' : '学生' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="department" label="部门/班级" />
              <el-table-column label="操作" width="80" fixed="right">
                <template #default="scope">
                  <el-button
                    link
                    type="danger"
                    size="small"
                    @click="removeSelectedUser(scope.row)"
                  >
                    移除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <!-- 分页 -->
            <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
              <el-pagination
                v-model:current-page="userCurrentPage"
                v-model:page-size="userPageSize"
                :page-sizes="[5, 10, 20]"
                :total="selectedUsers.length"
                layout="total, sizes, prev, pager, next"
                @size-change="handleUserSizeChange"
                @current-change="handleUserCurrentChange"
              />
            </div>
          </div>
        </el-col>

        <!-- 右侧：设备信息列表 -->
        <el-col :span="12">
          <div class="list-section">
            <div class="section-header">
              <h3 class="section-title">设备信息列表</h3>
              <div class="header-actions">
                <el-button type="primary" size="small" @click="showSelectDeviceDialog = true">
                  <el-icon><Plus /></el-icon>
                  添加设备
                </el-button>
                <el-button 
                  type="danger" 
                  size="small" 
                  :disabled="selectedDevicesTableSelection.length === 0"
                  @click="batchRemoveSelectedDevices"
                >
                  <el-icon><Delete /></el-icon>
                  批量移除
                </el-button>
                <el-button 
                  type="warning" 
                  size="small"
                  :disabled="selectedDevices.length === 0"
                  @click="clearAllSelectedDevices"
                >
                  <el-icon><DeleteFilled /></el-icon>
                  清空全部
                </el-button>
                <el-input
                  v-model="deviceSearch"
                  placeholder="搜索已选设备..."
                  size="small"
                  prefix-icon="Search"
                  style="width: 200px"
                />
              </div>
            </div>
            <el-table
              :data="paginatedSelectedDevices"
              height="300"
              @selection-change="handleSelectedDeviceSelectionChange"
              style="width: 100%"
              :row-class-name="deviceTableRowClassName"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column prop="name" label="设备名称" width="120" />
              <el-table-column prop="location" label="位置" width="100" />
              <el-table-column prop="type" label="类型" width="100">
                <template #default="scope">
                  <el-tag :type="getDeviceTypeTag(scope.row.type)">
                    {{ getDeviceTypeText(scope.row.type) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" />
              <el-table-column label="操作" width="80" fixed="right">
                <template #default="scope">
                  <el-button
                    link
                    type="danger"
                    size="small"
                    @click="removeSelectedDevice(scope.row)"
                  >
                    移除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <!-- 分页 -->
            <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
              <el-pagination
                v-model:current-page="deviceCurrentPage"
                v-model:page-size="devicePageSize"
                :page-sizes="[5, 10, 20]"
                :total="selectedDevices.length"
                layout="total, sizes, prev, pager, next"
                @size-change="handleDeviceSizeChange"
                @current-change="handleDeviceCurrentChange"
              />
            </div>
          </div>
        </el-col>
      </el-row>
      
      <!-- 选择人员弹窗 -->
      <el-dialog
        v-model="showSelectUserDialog"
        title="选择人员"
        width="800px"
        :close-on-click-modal="false"
      >
        <div class="user-selection-dialog">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="department-tree-container">
                <h4>部门结构</h4>
                <el-tree
                  :data="departmentTree"
                  :props="treeProps"
                  node-key="value"
                  default-expand-all
                  :expand-on-click-node="false"
                  @node-click="handleDepartmentNodeClick"
                />
              </div>
            </el-col>
            <el-col :span="16">
              <div class="user-list-container">
                <div class="user-list-header">
                  <el-input
                    v-model="dialogUserSearch"
                    placeholder="搜索人员..."
                    size="small"
                    prefix-icon="Search"
                    style="width: 200px; margin-bottom: 10px;"
                  />
                </div>
                <el-table
                  :data="filteredDialogUsers"
                  height="300"
                  @selection-change="handleDialogUserSelectionChange"
                  style="width: 100%"
                >
                  <el-table-column type="selection" width="55" />
                  <el-table-column prop="name" label="姓名" />
                  <el-table-column prop="code" label="工号/学号" />
                  <el-table-column prop="type" label="类型">
                    <template #default="scope">
                      <el-tag :type="scope.row.type === 'teacher' ? 'primary' : 'success'">
                        {{ scope.row.type === 'teacher' ? '教师' : '学生' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="department" label="部门/班级" />
                </el-table>
              </div>
            </el-col>
          </el-row>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showSelectUserDialog = false">取消</el-button>
            <el-button type="primary" @click="confirmSelectUsers">确认选择</el-button>
          </span>
        </template>
      </el-dialog>
      
      <!-- 选择设备弹窗 -->
      <el-dialog
        v-model="showSelectDeviceDialog"
        title="选择设备"
        width="800px"
        :close-on-click-modal="false"
      >
        <div class="device-selection-dialog">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="location-tree-container">
                <h4>位置结构</h4>
                <el-tree
                  :data="locationTree"
                  :props="treeProps"
                  node-key="value"
                  default-expand-all
                  :expand-on-click-node="false"
                  @node-click="handleLocationNodeClick"
                />
              </div>
            </el-col>
            <el-col :span="16">
              <div class="device-list-container">
                <div class="device-list-header">
                  <el-input
                    v-model="dialogDeviceSearch"
                    placeholder="搜索设备..."
                    size="small"
                    prefix-icon="Search"
                    style="width: 200px; margin-bottom: 10px;"
                  />
                </div>
                <el-table
                  :data="filteredDialogDevices"
                  height="300"
                  @selection-change="handleDialogDeviceSelectionChange"
                  style="width: 100%"
                >
                  <el-table-column type="selection" width="55" />
                  <el-table-column prop="name" label="设备名称" />
                  <el-table-column prop="location" label="位置" />
                  <el-table-column prop="type" label="类型">
                    <template #default="scope">
                      <el-tag :type="getDeviceTypeTag(scope.row.type)">
                        {{ getDeviceTypeText(scope.row.type) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="status" label="状态">
                    <template #default="scope">
                      <el-tag :type="scope.row.status === 'online' ? 'success' : 'danger'">
                        {{ scope.row.status === 'online' ? '在线' : '离线' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-col>
          </el-row>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showSelectDeviceDialog = false">取消</el-button>
            <el-button type="primary" @click="confirmSelectDevices">确认选择</el-button>
          </span>
        </template>
      </el-dialog>
    </div>

    <!-- 下部分：通行权限有效期设置 -->
    <div class="form-container">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="130px"
        label-position="right"
      >
        <div class="form-section">
          <h3 class="section-title">通行权限有效期设置</h3>
          
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="权限类型" prop="permissionType" required>
                <el-radio-group v-model="formData.permissionType" @change="handlePermissionTypeChange">
                  <el-radio label="permanent">永久权限</el-radio>
                  <el-radio label="temporary">临时权限</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 临时权限日期选择 -->
          <el-row :gutter="24" v-if="formData.permissionType === 'temporary'">
            <el-col :span="6">
              <el-form-item label="开始时间" prop="startTime">
                <el-date-picker
                  v-model="formData.startTime"
                  type="datetime"
                  placeholder="请选择开始时间"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  style="width: 100%"
                  :disabled-date="disabledStartDate"
                />
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item label="结束时间" prop="endTime">
                <el-date-picker
                  v-model="formData.endTime"
                  type="datetime"
                  placeholder="请选择结束时间"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  style="width: 100%"
                  :disabled-date="disabledEndDate"
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          
        </div>
      </el-form>
    </div>

    <!-- 操作按钮区 -->
    <div class="action-section">
      <el-button type="primary" size="large" @click="handleSaveAndBack" :loading="saving">
        保存并返回
      </el-button>
      <el-button size="large" @click="handleCancel">
        取消
      </el-button>
    </div>

    <!-- 权限预览弹窗 -->
    <el-dialog
      v-model="previewVisible"
      title="权限预览"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="previewData" class="preview-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="权限ID">{{ previewData.id }}</el-descriptions-item>
          <el-descriptions-item label="关联人员">{{ previewData.user }}</el-descriptions-item>
          <el-descriptions-item label="权限来源">{{ previewData.source }}</el-descriptions-item>
          <el-descriptions-item label="关联业务ID">{{ previewData.businessId || '-' }}</el-descriptions-item>
          <el-descriptions-item label="有效期" :span="2">{{ previewData.validPeriod }}</el-descriptions-item>
          <el-descriptions-item label="权限状态">
            <el-tag type="warning">待生效</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="闸机数量">{{ previewData.deviceCount }}台</el-descriptions-item>
        </el-descriptions>

        <div class="device-list">
          <h4>可通行闸机：</h4>
          <el-tag
            v-for="device in previewData.devices"
            :key="device.id"
            class="device-preview-tag"
            :type="device.status === 'online' ? 'success' : 'danger'"
          >
            {{ device.name }}
          </el-tag>
        </div>

        <div v-if="previewData.remark" class="remark-section">
          <h4>备注信息：</h4>
          <p>{{ previewData.remark }}</p>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="previewVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleConfirmCreate">确认创建</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { QuestionFilled, Search, Plus, Delete, DeleteFilled } from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const saving = ref(false)
const searchLoading = ref(false)
const previewVisible = ref(false)

// 搜索相关
const userSearch = ref('')
const deviceSearch = ref('')
const dialogUserSearch = ref('') // 弹窗中搜索人员
const dialogDeviceSearch = ref('') // 弹窗中搜索设备
const selectedLocationFilter = ref('') // 选中的位置过滤
const showSelectUserDialog = ref(false) // 显示选择人员弹窗
const showSelectDeviceDialog = ref(false) // 显示选择设备弹窗
const selectedDialogUsers = ref([]) // 弹窗中选择的人员
const selectedDialogDevices = ref([]) // 弹窗中选择的设备
const userCurrentPage = ref(1) // 人员列表当前页
const userPageSize = ref(10) // 人员列表每页数量
const deviceCurrentPage = ref(1) // 设备列表当前页
const devicePageSize = ref(10) // 设备列表每页数量
const selectedUsersTableSelection = ref([]) // 已选人员表格的选中项
const selectedDevicesTableSelection = ref([]) // 已选设备表格的选中项

// 表单数据
const formData = reactive({
  permissionType: 'permanent', // 新增：权限类型
  startTime: '',
  endTime: ''
})

// 已选择的人员和设备
const selectedUsers = ref([]) // 页面上的已选人员列表
const selectedDevices = ref([])

// 模拟人员数据
const allUsers = ref([
  { id: 'T001', name: '张老师', code: 'T001', type: 'teacher', department: '数学组' },
  { id: 'T002', name: '李老师', code: 'T002', type: 'teacher', department: '语文组' },
  { id: 'T003', name: '王老师', code: 'T003', type: 'teacher', department: '英语组' },
  { id: 'S001', name: '李小明', code: 'S001', type: 'student', department: '三年级一班' },
  { id: 'S002', name: '王小红', code: 'S002', type: 'student', department: '三年级一班' },
  { id: 'S003', name: '张小刚', code: 'S003', type: 'student', department: '三年级二班' }
])

// 模拟设备数据
const allDevices = ref([
  { id: 'D001', name: '校门A闸机', location: '校门口', type: 'gate', status: 'online' },
  { id: 'D002', name: '办公楼入口', location: '办公楼1楼', type: 'office', status: 'online' },
  { id: 'D003', name: '宿舍区入口', location: '宿舍楼', type: 'dormitory', status: 'offline' },
  { id: 'D004', name: '实验楼入口', location: '实验楼', type: 'lab', status: 'online' },
  { id: 'D005', name: '图书馆入口', location: '图书馆', type: 'library', status: 'online' },
  { id: 'D006', name: '体育馆入口', location: '体育馆', type: 'gym', status: 'offline' }
])

// 模拟部门数据
const departmentTree = ref([
  {
    id: 'D001',
    label: '教学部',
    value: 'D001',
    children: [
      {
        id: 'D002',
        label: '数学组',
        value: 'D002',
      },
      {
        id: 'D003',
        label: '语文组',
        value: 'D003',
      },
      {
        id: 'D004',
        label: '英语组',
        value: 'D004',
      }
    ]
  },
  {
    id: 'D005',
    label: '学生处',
    value: 'D005',
    children: [
      {
        id: 'D006',
        label: '一年级',
        value: 'D006',
        children: [
          { id: 'D007', label: '一年级一班', value: 'D007' },
          { id: 'D008', label: '一年级二班', value: 'D008' },
        ]
      },
      {
        id: 'D009',
        label: '三年级',
        value: 'D009',
        children: [
          { id: 'D010', label: '三年级一班', value: 'D010' },
          { id: 'D011', label: '三年级二班', value: 'D011' },
        ]
      }
    ]
  }
])

// 设备位置树结构
const locationTree = ref([
  {
    id: 'L001',
    label: '校园区域',
    value: 'L001',
    children: [
      {
        id: 'L002',
        label: '校门',
        value: 'L002',
        children: [
          { id: 'L003', label: '东门', value: 'L003' },
          { id: 'L004', label: '西门', value: 'L004' },
          { id: 'L005', label: '南门', value: 'L005' },
        ]
      },
      {
        id: 'L006',
        label: '教学楼',
        value: 'L006',
        children: [
          { id: 'L007', label: 'A栋教学楼', value: 'L007' },
          { id: 'L008', label: 'B栋教学楼', value: 'L008' },
          { id: 'L009', label: '实验楼', value: 'L009' },
        ]
      },
      {
        id: 'L010',
        label: '宿舍区',
        value: 'L010',
        children: [
          { id: 'L011', label: '男生宿舍', value: 'L011' },
          { id: 'L012', label: '女生宿舍', value: 'L012' },
        ]
      },
      {
        id: 'L013',
        label: '办公区',
        value: 'L013',
        children: [
          { id: 'L014', label: '行政楼', value: 'L014' },
          { id: 'L015', label: '教师办公楼', value: 'L015' },
        ]
      }
    ]
  }
])

// 树形控件配置
const treeProps = {
  children: 'children',
  label: 'label'
}

// 表单验证规则
const formRules = {
  permissionType: [{ required: true, message: '请选择权限类型', trigger: 'change' }],
  startTime: [
    {
      validator: (rule, value, callback) => {
        if (formData.permissionType === 'temporary' && !value) {
          callback(new Error('请选择开始时间'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  endTime: [
    {
      validator: (rule, value, callback) => {
        if (formData.permissionType === 'temporary' && !value) {
          callback(new Error('请选择结束时间'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// 选项数据
const previewData = ref(null)
const formRef = ref()

// 过滤弹窗中的用户数据
const filteredDialogUsers = computed(() => {
  let filtered = allUsers.value
  
  // 搜索关键词过滤
  if (dialogUserSearch.value) {
    filtered = filtered.filter(user =>
      user.name.toLowerCase().includes(dialogUserSearch.value.toLowerCase()) ||
      user.code.toLowerCase().includes(dialogUserSearch.value.toLowerCase()) ||
      user.department.toLowerCase().includes(dialogUserSearch.value.toLowerCase())
    )
  }
  
  // 过滤掉已经添加的用户
  filtered = filtered.filter(user => 
    !selectedUsers.value.some(selected => selected.id === user.id)
  )
  
  return filtered
})

// 分页后的已选用户数据
const paginatedSelectedUsers = computed(() => {
  const start = (userCurrentPage.value - 1) * userPageSize.value
  const end = start + userPageSize.value
  return selectedUsers.value.slice(start, end)
})

// 过滤弹窗中的设备数据
const filteredDialogDevices = computed(() => {
  let filtered = allDevices.value
  
  // 位置过滤
  if (selectedLocationFilter.value) {
    // 获取位置标签路径
    const findLocationPath = (data, id) => {
      for (const item of data) {
        if (item.value === id) {
          return [item.label]
        }
        if (item.children) {
          const found = findLocationPath(item.children, id)
          if (found) {
            return [item.label, ...found]
          }
        }
      }
      return null
    }
    
    const locationPath = findLocationPath(locationTree.value, selectedLocationFilter.value)
    if (locationPath && locationPath.length > 0) {
      const locationFilter = locationPath.join('/')
      filtered = filtered.filter(device => 
        device.location.includes(locationFilter)
      )
    }
  }
  
  // 搜索关键词过滤
  if (dialogDeviceSearch.value) {
    filtered = filtered.filter(device =>
      device.name.toLowerCase().includes(dialogDeviceSearch.value.toLowerCase()) ||
      device.location.toLowerCase().includes(dialogDeviceSearch.value.toLowerCase())
    )
  }
  
  // 过滤掉已经添加的设备
  filtered = filtered.filter(device => 
    !selectedDevices.value.some(selected => selected.id === device.id)
  )
  
  return filtered
})

// 分页后的已选设备数据（用于显示已选择的设备）
const paginatedSelectedDevices = computed(() => {
  const start = (deviceCurrentPage.value - 1) * devicePageSize.value
  const end = start + devicePageSize.value
  return selectedDevices.value.slice(start, end)
})

// 过滤后的设备数据
const filteredDevices = computed(() => {
  if (!deviceSearch.value) return allDevices.value
  return allDevices.value.filter(device =>
    device.name.toLowerCase().includes(deviceSearch.value.toLowerCase()) ||
    device.location.toLowerCase().includes(deviceSearch.value.toLowerCase())
  )
})

// 人员选择变化处理
const handleUserSelectionChange = (selection) => {
  selectedUsers.value = selection
}

// 人员表格行样式
const tableRowClassName = ({ row }) => {
  return selectedUsers.value.some(user => user.id === row.id) ? 'selected-row' : ''
}

// 设备表格行样式
const deviceTableRowClassName = ({ row }) => {
  return selectedDevices.value.some(device => device.id === row.id) ? 'selected-row' : ''
}

// 获取设备类型标签
const getDeviceTypeTag = (type: string) => {
  switch (type) {
    case 'gate': return 'primary'
    case 'office': return 'success'
    case 'dormitory': return 'warning'
    case 'lab': return 'danger'
    case 'library': return 'info'
    case 'gym': return 'primary'
    default: return 'info'
  }
}

// 获取设备类型文本
const getDeviceTypeText = (type: string) => {
  switch (type) {
    case 'gate': return '校门闸机'
    case 'office': return '办公楼'
    case 'dormitory': return '宿舍区'
    case 'lab': return '实验室'
    case 'library': return '图书馆'
    case 'gym': return '体育馆'
    default: return type
  }
}

// 选择人员弹窗中用户选择变化处理
const handleDialogUserSelectionChange = (selection) => {
  selectedDialogUsers.value = selection
}

// 确认选择用户
const confirmSelectUsers = () => {
  if (selectedDialogUsers.value.length === 0) {
    ElMessage.warning('请至少选择一个人员')
    return
  }
  
  // 将选中的用户添加到主列表
  selectedDialogUsers.value.forEach(user => {
    // 检查是否已存在
    const exists = selectedUsers.value.some(selected => selected.id === user.id)
    if (!exists) {
      selectedUsers.value.push(user)
    }
  })
  
  // 清空弹窗选择
  selectedDialogUsers.value = []
  dialogUserSearch.value = ''
  
  // 关闭弹窗
  showSelectUserDialog.value = false
  
  ElMessage.success(`成功添加 ${selectedDialogUsers.value.length} 个用户`)
}

// 选中主列表中的用户变化处理
const handleSelectedUserSelectionChange = (selection) => {
  selectedUsersTableSelection.value = selection
}

// 选中已选设备列表中的变化处理
const handleSelectedDeviceSelectionChange = (selection) => {
  selectedDevicesTableSelection.value = selection
}

// 选中弹窗中设备的变化处理
const handleDialogDeviceSelectionChange = (selection) => {
  selectedDialogDevices.value = selection
}

// 点击部门节点处理
const handleDepartmentNodeClick = (data) => {
  // 可以根据点击的部门节点过滤用户列表
  // 暂时留空，可以根据需要实现
}

// 点击位置节点处理
const handleLocationNodeClick = (data) => {
  selectedLocationFilter.value = data.value
}

// 移除已选用户
const removeSelectedUser = (user) => {
  const index = selectedUsers.value.findIndex(u => u.id === user.id)
  if (index > -1) {
    selectedUsers.value.splice(index, 1)
    ElMessage.success('已移除用户')
  }
}

// 移除已选设备
const removeSelectedDevice = (device) => {
  const index = selectedDevices.value.findIndex(d => d.id === device.id)
  if (index > -1) {
    selectedDevices.value.splice(index, 1)
    ElMessage.success('已移除设备')
  }
}

// 批量移除已选用户
const batchRemoveSelectedUsers = () => {
  if (selectedUsersTableSelection.value.length === 0) {
    ElMessage.warning('请至少选择一个用户')
    return
  }
  
  ElMessageBox.confirm(
    `确定要移除选中的 ${selectedUsersTableSelection.value.length} 个用户吗？`,
    '移除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    selectedUsersTableSelection.value.forEach(user => {
      const index = selectedUsers.value.findIndex(u => u.id === user.id)
      if (index > -1) {
        selectedUsers.value.splice(index, 1)
      }
    })
    
    selectedUsersTableSelection.value = []
    ElMessage.success(`已移除 ${selectedUsersTableSelection.value.length} 个用户`)
  }).catch(() => {
    // 用户取消操作
  })
}

// 批量移除已选设备
const batchRemoveSelectedDevices = () => {
  if (selectedDevicesTableSelection.value.length === 0) {
    ElMessage.warning('请至少选择一个设备')
    return
  }
  
  ElMessageBox.confirm(
    `确定要移除选中的 ${selectedDevicesTableSelection.value.length} 个设备吗？`,
    '移除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    selectedDevicesTableSelection.value.forEach(device => {
      const index = selectedDevices.value.findIndex(d => d.id === device.id)
      if (index > -1) {
        selectedDevices.value.splice(index, 1)
      }
    })
    
    selectedDevicesTableSelection.value = []
    ElMessage.success(`已移除 ${selectedDevicesTableSelection.value.length} 个设备`)
  }).catch(() => {
    // 用户取消操作
  })
}

// 清空所有已选用户
const clearAllSelectedUsers = () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('当前没有可清空的用户')
    return
  }
  
  ElMessageBox.confirm(
    '确定要清空所有已选用户吗？',
    '清空确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    selectedUsers.value = []
    selectedUsersTableSelection.value = []
    ElMessage.success('已清空所有用户')
  }).catch(() => {
    // 用户取消操作
  })
}

// 清空所有已选设备
const clearAllSelectedDevices = () => {
  if (selectedDevices.value.length === 0) {
    ElMessage.warning('当前没有可清空的设备')
    return
  }
  
  ElMessageBox.confirm(
    '确定要清空所有已选设备吗？',
    '清空确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    selectedDevices.value = []
    selectedDevicesTableSelection.value = []
    ElMessage.success('已清空所有设备')
  }).catch(() => {
    // 用户取消操作
  })
}

// 确认选择设备
const confirmSelectDevices = () => {
  if (selectedDialogDevices.value.length === 0) {
    ElMessage.warning('请至少选择一个设备')
    return
  }
  
  // 将选中的设备添加到主列表
  selectedDialogDevices.value.forEach(device => {
    // 检查是否已存在
    const exists = selectedDevices.value.some(selected => selected.id === device.id)
    if (!exists) {
      selectedDevices.value.push(device)
    }
  })
  
  // 清空弹窗选择
  selectedDialogDevices.value = []
  dialogDeviceSearch.value = ''
  
  // 关闭弹窗
  showSelectDeviceDialog.value = false
  
  ElMessage.success(`成功添加 ${selectedDialogDevices.value.length} 个设备`)
}

// 分页大小改变
const handleUserSizeChange = (size) => {
  userPageSize.value = size
  userCurrentPage.value = 1
}

// 分页当前页改变
const handleUserCurrentChange = (page) => {
  userCurrentPage.value = page
}

// 设备分页大小改变
const handleDeviceSizeChange = (size) => {
  devicePageSize.value = size
  deviceCurrentPage.value = 1
}

// 设备分页当前页改变
const handleDeviceCurrentChange = (page) => {
  deviceCurrentPage.value = page
}

// 权限类型变化处理
const handlePermissionTypeChange = () => {
  if (formData.permissionType === 'permanent') {
    formData.startTime = ''
    formData.endTime = ''
  }
}

// 日期禁用
const disabledStartDate = (time) => {
  return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
}

const disabledEndDate = (time) => {
  if (!formData.startTime) return false
  const startTime = new Date(formData.startTime).getTime()
  // 临时权限最长30天
  const maxTime = startTime + 30 * 24 * 60 * 60 * 1000

  return time.getTime() < startTime || time.getTime() > maxTime
}





// 保存并返回
const handleSaveAndBack = async () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.error('请选择至少一个人员')
    return
  }
  
  if (selectedDevices.value.length === 0) {
    ElMessage.error('请选择至少一个设备')
    return
  }
  
  const valid = await formRef.value.validate()
  if (!valid) return

  saving.value = true
  try {
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('权限创建成功')
    router.push('/access/permission')
  } catch (error) {
    ElMessage.error('权限创建失败')
  } finally {
    saving.value = false
  }
}



// 取消
const handleCancel = () => {
  ElMessageBox.confirm('确定要取消创建吗？未保存的数据将丢失', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    router.push('/access/permission')
  })
}

// 返回列表
const handleBack = () => {
  router.push('/access/permission')
}

// 重置表单
const resetForm = () => {
  formData.permissionType = 'permanent'
  formData.startTime = ''
  formData.endTime = ''
  selectedUsers.value = []
  selectedDevices.value = []
  formRef.value?.clearValidate()
}

onMounted(() => {
  // 初始化逻辑
})
</script>

<style lang="scss" scoped>
.permission-form {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;

  .header-section {
    background: #fff;
    padding: 20px 24px;
    margin-bottom: 20px;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;

    .page-title {
      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #333;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;

      .help-icon {
        font-size: 18px;
        color: #909399;
        cursor: pointer;

        &:hover {
          color: #409eff;
        }
      }
    }
  }
  
  .search-section {
    background: #fff;
    padding: 16px 24px;
    margin-bottom: 20px;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .content-section {
    background: #fff;
    padding: 24px;
    margin-bottom: 20px;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    .list-section {
      height: 100%;

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .section-title {
          font-size: 16px;
          font-weight: 500;
          color: #333;
          margin: 0;
          padding-left: 10px;
          border-left: 3px solid #409eff;
        }
        
        .header-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }
      }

      :deep(.el-table) {
        .selected-row {
          background: #f0f9ff;
        }
      }
    }
    
    .user-selection-dialog {
      .department-tree-container {
        border-right: 1px solid #e4e7ed;
        padding-right: 10px;
        
        h4 {
          margin: 0 0 10px 0;
          font-size: 14px;
          font-weight: 500;
          color: #606266;
        }
        
        :deep(.el-tree) {
          height: 300px;
          overflow-y: auto;
        }
      }
      
      .user-list-container {
        padding-left: 10px;
        
        .user-list-header {
          margin-bottom: 10px;
        }
      }
    }
    
    .device-selection-dialog {
      .location-tree-container {
        border-right: 1px solid #e4e7ed;
        padding-right: 10px;
        
        h4 {
          margin: 0 0 10px 0;
          font-size: 14px;
          font-weight: 500;
          color: #606266;
        }
        
        :deep(.el-tree) {
          height: 300px;
          overflow-y: auto;
        }
      }
      
      .device-list-container {
        padding-left: 10px;
        
        .device-list-header {
          margin-bottom: 10px;
        }
      }
    }
  }

  .form-container {
    background: #fff;
    padding: 24px;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;

    .form-section {
      margin-bottom: 32px;

      &:last-child {
        margin-bottom: 0;
      }

      .section-title {
        font-size: 16px;
        font-weight: 500;
        color: #333;
        margin-bottom: 20px;
        padding-left: 10px;
        border-left: 3px solid #409eff;
      }
    }

    .field-tip {
      font-size: 12px;
      color: #909399;
      margin-top: 5px;

      &.error {
        color: #f56c6c;
      }
    }

    .selected-count {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .action-section {
    background: #fff;
    padding: 20px 24px;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: flex-end;
    gap: 16px;

    .el-button {
      min-width: 120px;
    }
  }

  .preview-content {
    .device-list {
      margin-top: 20px;

      h4 {
        margin-bottom: 10px;
        color: #333;
        font-size: 14px;
      }

      .device-preview-tag {
        margin-right: 10px;
        margin-bottom: 10px;
      }
    }

    .remark-section {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e4e7ed;

      h4 {
        margin-bottom: 10px;
        color: #333;
        font-size: 14px;
      }

      p {
        color: #666;
        line-height: 1.6;
      }
    }
  }
}
</style>