<template>
  <div class="permission-management">
    <!-- 顶部筛选栏 -->
    <div class="filter-bar">
      <el-form inline>
        <el-form-item label="人员类型">
          <el-select v-model="filterForm.userType" style="width: 150px" @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="教师" value="teacher" />
            <el-option label="学生" value="student" />
          </el-select>
        </el-form-item>

        <el-form-item label="权限来源">
          <el-select v-model="filterForm.source" style="width: 180px" @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="请假触发" value="leave" />
            <el-option label="手动创建" value="manual" />
            <el-option label="通勤默认" value="commute" />
          </el-select>
        </el-form-item>

        <el-form-item label="权限状态">
          <el-select v-model="filterForm.status" style="width: 150px" @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="待生效" value="pending" />
            <el-option label="生效中" value="active" />
            <el-option label="已失效" value="expired" />
            <el-option label="已注销" value="revoked" />
          </el-select>
        </el-form-item>

        <el-form-item label="人员搜索">
          <el-input
            v-model="filterForm.keyword"
            placeholder="姓名或工学号"
            style="width: 220px"
            clearable
            @clear="handleFilter"
            @keyup.enter="handleFilter"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleFilter">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
          <el-button type="text" @click="showAdvancedFilter = !showAdvancedFilter">
            高级筛选
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 高级筛选 -->
      <div v-show="showAdvancedFilter" class="advanced-filter">
        <el-form inline>
          <el-form-item label="权限有效期">
            <el-date-picker
              v-model="filterForm.validPeriod"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              style="width: 350px"
              @change="handleFilter"
            />
          </el-form-item>

          <el-form-item label="通行区域">
            <el-select v-model="filterForm.devices" multiple style="width: 300px" @change="handleFilter" placeholder="选择通行设备">
              <el-option-group label="校门区域">
                <el-option
                  v-for="device in devicesByType.gate"
                  :key="device.id"
                  :label="device.name"
                  :value="device.id"
                />
              </el-option-group>
              <el-option-group label="办公楼">
                <el-option
                  v-for="device in devicesByType.office"
                  :key="device.id"
                  :label="device.name"
                  :value="device.id"
                />
              </el-option-group>
              <el-option-group label="宿舍区">
                <el-option
                  v-for="device in devicesByType.dormitory"
                  :key="device.id"
                  :label="device.name"
                  :value="device.id"
                />
              </el-option-group>
              <el-option-group label="其他区域">
                <el-option
                  v-for="device in devicesByType.other"
                  :key="device.id"
                  :label="device.name"
                  :value="device.id"
                />
              </el-option-group>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 操作按钮区 -->
    <div class="action-bar">
      <el-button type="success" @click="handleCreate">手动创建</el-button>
      <el-button type="warning" @click="handleBatchExport">批量导出</el-button>
      <el-button
        type="danger"
        :disabled="selectedPermissions.length === 0"
        @click="handleBatchRevoke"
      >
        批量注销
      </el-button>
      <el-button type="info" @click="handleSyncPermissions">同步权限</el-button>
    </div>

    <!-- 数据表格区 -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="permissionList"
        @selection-change="handleSelectionChange"
        row-key="id"
        stripe
      >
        <el-table-column type="selection" width="60" />

        <el-table-column prop="id" label="权限ID" min-width="150">
          <template #default="{ row }">
            <el-link type="primary" @click="handleViewDetail(row)">
              {{ row.id }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column prop="user" label="关联人员" min-width="160">
          <template #default="{ row }">
            <div>{{ row.user.name }}（{{ row.user.code }}）</div>
            <div class="user-dept">{{ row.user.department }}</div>
          </template>
        </el-table-column>

        <el-table-column prop="source" label="权限来源" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getSourceTagType(row.source)" size="small">
              {{ getSourceText(row.source) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="businessId" label="关联业务ID" min-width="120" align="center">
          <template #default="{ row }">
            <span>{{ row.businessId || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="deviceScope" label="通行区域" min-width="150">
          <template #default="{ row }">
            <el-tooltip effect="dark" :content="row.deviceScope.join('、')" placement="top">
              <span>{{ row.deviceScope.slice(0, 2).join('、') }}{{ row.deviceScope.length > 2 ? '...' : '' }}</span>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column prop="validPeriod" label="有效期" min-width="280" align="center">
          <template #default="{ row }">
            {{ formatDateRange(row.validPeriod) }}
          </template>
        </el-table-column>

        <el-table-column prop="status" label="权限状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button type="text" size="small" @click="handleViewDetail(row)">
                查看详情
              </el-button>
              <el-button
                v-if="['pending', 'active'].includes(row.status)"
                type="text"
                size="small"
                @click="handleSync(row)"
              >
                手动同步
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 权限详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="通行权限详情"
      width="650px"
      @close="handleCloseDetail"
    >
      <div v-if="currentPermission" class="permission-detail">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基础信息" name="basic">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="权限ID">{{ currentPermission.id }}</el-descriptions-item>
              <el-descriptions-item label="关联人员">{{ currentPermission.user.name }}（{{ currentPermission.user.code }}）</el-descriptions-item>
              <el-descriptions-item label="权限来源">{{ getSourceText(currentPermission.source) }}</el-descriptions-item>
              <el-descriptions-item label="关联业务ID">{{ currentPermission.businessId || '-' }}</el-descriptions-item>
              <el-descriptions-item label="有效期" :span="2">{{ formatDateRange(currentPermission.validPeriod) }}</el-descriptions-item>
              <el-descriptions-item label="权限状态">
                <el-tag :type="getStatusTagType(currentPermission.status)">
                  {{ getStatusText(currentPermission.status) }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>

          <el-tab-pane label="通行区域" name="device">
            <el-table :data="currentPermission.devices" size="small">
              <el-table-column prop="id" label="闸机编号" width="100" />
              <el-table-column prop="name" label="闸机位置" />
              <el-table-column prop="status" label="在线状态" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'online' ? 'success' : 'danger'" size="small">
                    {{ row.status === 'online' ? '在线' : '离线' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="操作日志" name="log">
            <el-timeline>
              <el-timeline-item
                v-for="log in currentPermission.logs"
                :key="log.id"
                :timestamp="log.time"
                placement="top"
              >
                <h4>{{ log.action }}</h4>
                <p>操作人：{{ log.operator }}</p>
                <p v-if="log.remark">备注：{{ log.remark }}</p>
              </el-timeline-item>
            </el-timeline>
          </el-tab-pane>
        </el-tabs>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handlePrintDetail">打印详情</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量注销确认弹窗 -->
    <el-dialog
      v-model="revokeDialogVisible"
      title="批量注销权限"
      width="500px"
    >
      <div class="revoke-confirm">
        <el-alert
          title="注意"
          type="warning"
          description="确认注销选中的权限？注销后权限立即失效，不可恢复"
          show-icon
          :closable="false"
        />

        <div class="selected-list">
          <h4>选中的权限（{{ selectedPermissions.length }}条）：</h4>
          <ul>
            <li v-for="item in selectedPermissions" :key="item.id">
              {{ item.id }} - {{ item.user.name }}
            </li>
          </ul>
        </div>

        <el-form>
          <el-form-item label="操作人密码" required>
            <el-input
              v-model="revokeForm.password"
              type="password"
              placeholder="请输入操作人密码"
              show-password
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="revokeDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmBatchRevoke">确认注销</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDevicesByType, getOnlineDevices, type Device } from '@/utils/deviceData'

const router = useRouter()

// 获取设备数据
const devicesByType = computed(() => getDevicesByType())
const onlineDevices = computed(() => getOnlineDevices())

// 筛选表单
const filterForm = reactive({
  userType: '',
  source: '',
  status: '',
  keyword: '',
  validPeriod: null,
  devices: []
})

// 控制状态
const loading = ref(false)
const showAdvancedFilter = ref(false)
const detailDialogVisible = ref(false)
const revokeDialogVisible = ref(false)
const activeTab = ref('basic')

// 列表数据
const permissionList = ref([])
const selectedPermissions = ref([])
const currentPermission = ref(null)

// 分页
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 注销表单
const revokeForm = reactive({
  password: ''
})

// 模拟数据
const mockData = [
  {
    id: 'ACCESS202409001',
    user: {
      name: '张老师',
      code: 'T001',
      department: '数学组'
    },
    source: 'manual',
    businessId: 'COMMUTE',
    deviceScope: ['校门1号闸机', '办公楼1号闸机'],
    validPeriod: ['2024-09-10 07:00:00', '2024-09-12 18:15:00'],
    status: 'active',
    devices: [
      { id: 'DEV-001', name: '校门1号闸机', status: 'online' },
      { id: 'DEV-003', name: '办公楼1号闸机', status: 'online' }
    ],
    logs: [
      { id: 1, action: '权限创建', operator: '系统管理员', time: '2024-09-10 06:30:00' },
      { id: 2, action: '权限同步', operator: '系统', time: '2024-09-10 06:31:00' }
    ]
  },
  {
    id: 'ACCESS202409002',
    user: {
      name: '李小明',
      code: 'S001',
      department: '三年级一班'
    },
    source: 'leave',
    businessId: 'LEAVE202409001',
    deviceScope: ['校门1号闸机'],
    validPeriod: ['2024-09-11 08:00:00', '2024-09-11 17:30:00'],
    status: 'pending',
    devices: [
      { id: 'DEV-001', name: '校门1号闸机', status: 'online' }
    ],
    logs: [
      { id: 1, action: '权限自动生成', operator: '请假系统', time: '2024-09-10 15:30:00', remark: '请假申请审批通过自动生成' }
    ]
  }
]

// 初始化
onMounted(() => {
  loadPermissionList()
})

// 加载权限列表
const loadPermissionList = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    permissionList.value = mockData
    pagination.total = mockData.length
  } catch (error) {
    ElMessage.error('加载权限列表失败')
  } finally {
    loading.value = false
  }
}

// 筛选处理
const handleFilter = () => {
  console.log('执行筛选:', filterForm)
  loadPermissionList()
}

// 重置筛选
const resetFilter = () => {
  Object.assign(filterForm, {
    userType: '',
    source: '',
    status: '',
    keyword: '',
    validPeriod: null,
    devices: []
  })
  loadPermissionList()
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedPermissions.value = selection
}

// 分页变化
const handleSizeChange = (size) => {
  pagination.size = size
  loadPermissionList()
}

const handlePageChange = (page) => {
  pagination.page = page
  loadPermissionList()
}

// 手动创建权限
const handleCreate = () => {
  router.push('/access/permission/create')
}

// 批量导出
const handleBatchExport = () => {
  ElMessage.success('导出功能开发中...')
}

// 批量注销
const handleBatchRevoke = () => {
  if (selectedPermissions.value.length === 0) {
    ElMessage.warning('请选择要注销的权限')
    return
  }
  revokeDialogVisible.value = true
}

// 确认批量注销
const confirmBatchRevoke = () => {
  if (!revokeForm.password) {
    ElMessage.warning('请输入操作人密码')
    return
  }

  ElMessage.success(`已注销 ${selectedPermissions.value.length} 条权限`)
  revokeDialogVisible.value = false
  revokeForm.password = ''
  selectedPermissions.value = []
  loadPermissionList()
}

// 同步权限
const handleSyncPermissions = () => {
  ElMessage.success('权限同步功能开发中...')
}

// 单个同步
const handleSync = (row) => {
  ElMessage.success(`权限 ${row.id} 同步成功`)
}

// 查看详情
const handleViewDetail = (row) => {
  currentPermission.value = row
  detailDialogVisible.value = true
  activeTab.value = 'basic'
}

// 关闭详情
const handleCloseDetail = () => {
  currentPermission.value = null
}

// 打印详情
const handlePrintDetail = () => {
  ElMessage.success('打印功能开发中...')
}

// 辅助方法
const getSourceTagType = (source) => {
  const types = {
    leave: 'primary',
    manual: 'success',
    commute: 'info'
  }
  return types[source] || 'info'
}

const getSourceText = (source) => {
  const texts = {
    leave: '请假触发',
    manual: '手动创建',
    commute: '通勤默认'
  }
  return texts[source] || source
}

const getStatusTagType = (status) => {
  const types = {
    pending: 'warning',
    active: 'success',
    expired: 'info',
    revoked: 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    pending: '待生效',
    active: '生效中',
    expired: '已失效',
    revoked: '已注销'
  }
  return texts[status] || status
}

const formatDateRange = (range) => {
  if (!range || !Array.isArray(range)) return '-'
  return `${range[0]} - ${range[1]}`
}
</script>

<style lang="scss" scoped>
.permission-management {
  padding: 20px;
}

.filter-bar {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .advanced-filter {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid #ebeef5;
  }
}

.action-bar {
  background: #fff;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .el-table {
    border-radius: 8px 8px 0 0;
  }
}

.user-dept {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.pagination-container {
  padding: 20px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #ebeef5;
}

.permission-detail {
  .el-descriptions {
    margin-bottom: 20px;
  }
}

.revoke-confirm {
  .selected-list {
    margin: 20px 0;

    h4 {
      margin-bottom: 10px;
      color: #409EFF;
    }

    ul {
      background: #f5f7fa;
      padding: 15px;
      border-radius: 4px;
      max-height: 200px;
      overflow-y: auto;

      li {
        list-style: none;
        padding: 5px 0;
        border-bottom: 1px solid #eee;

        &:last-child {
          border-bottom: none;
        }
      }
    }
  }
}

:deep(.el-table tr.el-table__row--striped) {
  background-color: #fafafa;
}

:deep(.el-table__row) {
  &:hover {
    background-color: #f8f9fa !important;
  }
}

:deep(.el-table .cell) {
  padding: 8px 0;
}

:deep(.el-table .el-table__cell:first-child .cell) {
  padding-left: 16px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  white-space: nowrap;

  .el-button {
    margin: 0;
    padding: 4px 8px;
  }
}
</style>