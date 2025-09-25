<template>
  <div class="device-monitor-container">
    <!-- 顶部标题栏 -->
    <div class="page-header">
      <div class="header-title">门禁设备管理</div>
    </div>

    <div class="main-content">
      <!-- 左侧分组树 -->
      <div class="left-sidebar">
        <div class="tree-header">
          <el-input
            v-model="filterText"
            placeholder="请输入分组名称"
            clearable
            size="small"
            prefix-icon="Search"
          />
        </div>

        <el-scrollbar class="tree-container">
          <el-tree
            ref="treeRef"
            :data="treeData"
            :props="treeProps"
            :filter-node-method="filterNode"
            default-expand-all
            highlight-current
            @node-click="handleNodeClick"
            @node-contextmenu="handleNodeContextMenu"
          >
            <template #default="{ node, data }">
              <span class="tree-node">
                <el-icon class="node-icon">
                  <Folder v-if="data.children" />
                  <Monitor v-else />
                </el-icon>
                <span class="node-label">{{ node.label }}</span>
                <span class="node-count" v-if="data.count">({{ data.count }})</span>
              </span>
            </template>
          </el-tree>
        </el-scrollbar>
      </div>

      <!-- 中间内容区 -->
      <div class="center-content">
        <!-- 顶部工具栏 -->
        <div class="toolbar">
          <div class="toolbar-left">
            <el-checkbox
              v-model="selectAll"
              :indeterminate="isIndeterminate"
              @change="handleSelectAll"
            >
              全选 ({{ selectedDevices.length }} / {{ deviceList.length }})
            </el-checkbox>
            <el-button
              type="primary"
              size="small"
              @click="handleAddDevice"
              style="margin-left: 20px"
            >
              <el-icon><Plus /></el-icon>
              新增终端
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleBatchDelete"
              :disabled="selectedDevices.length === 0"
              style="margin-left: 10px"
            >
              <el-icon><Delete /></el-icon>
              批量删除
            </el-button>
          </div>

          <div class="toolbar-right">
            <el-input
              v-model="searchKeyword"
              placeholder="请输入终端名称"
              clearable
              style="width: 200px"
              prefix-icon="Search"
            />
            <el-button-group style="margin-left: 10px">
              <el-button @click="viewMode = 'card'" :type="viewMode === 'card' ? 'primary' : 'default'">
                <el-icon><Grid /></el-icon>
              </el-button>
              <el-button @click="viewMode = 'list'" :type="viewMode === 'list' ? 'primary' : 'default'">
                <el-icon><List /></el-icon>
              </el-button>
            </el-button-group>
          </div>
        </div>

        <!-- 设备卡片/列表展示区 -->
        <el-scrollbar
          ref="scrollbarRef"
          class="device-content"
          @scroll="handleScroll"
        >
          <!-- 卡片视图 -->
          <div v-if="viewMode === 'card'" class="device-wrapper">
            <div class="device-grid">
            <div
              v-for="device in filteredDevices"
              :key="device.id"
              class="device-card"
              :class="{ 'selected': selectedDevices.includes(device.id) }"
              @click="toggleDeviceSelection(device.id)"
              style="cursor: pointer;"
            >
              <!-- 右上角摄像头按钮 -->
              <el-button
                class="camera-button"
                size="small"
                circle
                @click.stop="handleScreenshotClick(device)"
              >
                <el-icon><VideoCamera /></el-icon>
              </el-button>

              <div class="device-preview">
                <div class="preview-image" :style="{ backgroundColor: getDeviceColor(device.status) }">
                  <el-icon :size="48"><Monitor /></el-icon>
                </div>
              </div>

              <div class="device-info">
                <div class="device-name">{{ device.name }}</div>
                <div class="device-ip">IP地址：{{ device.ip || '未分配' }}</div>
                <el-tag
                  size="small"
                  :type="getStatusType(device.status)"
                  class="device-status"
                >
                  {{ getStatusText(device.status) }}
                </el-tag>
              </div>

              <div class="device-actions">
                <el-button
                  type="primary"
                  size="small"
                  plain
                  @click.stop="openDeviceDetail(device)"
                >
                  查看详情
                </el-button>
              </div>
            </div>
            </div>
            <!-- 加载提示 -->
            <div v-if="viewMode === 'card'" class="loading-more">
              <div v-if="isLoading" class="loading-container">
                <div class="loading-spinner">
                  <el-icon class="is-loading" :size="24"><Loading /></el-icon>
                </div>
                <el-text type="info">正在加载更多终端...</el-text>
              </div>
              <el-text v-else-if="noMore" type="info">
                <el-icon><InfoFilled /></el-icon>
                已加载全部 {{ totalCount }} 个终端
              </el-text>
              <el-text v-else-if="filteredDevices.length > 0 && loadedCount < totalCount" type="info">
                下滑加载更多
              </el-text>
            </div>
          </div>

          <!-- 列表视图 -->
          <el-table v-else :data="filteredDevices" style="width: 100%" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="id" label="设备编号" width="120" />
            <el-table-column prop="name" label="设备名称" min-width="200" />
            <el-table-column prop="ip" label="IP地址" width="150">
              <template #default="{ row }">
                {{ row.ip || '未分配' }}
              </template>
            </el-table-column>
            <el-table-column prop="location" label="位置" min-width="150" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="lastSync" label="最后同步时间" width="180">
              <template #default="{ row }">
                {{ row.lastSync || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  size="small"
                  plain
                  @click="openDeviceDetail(row)"
                >
                  查看详情
                </el-button>
                <el-button
                  size="small"
                  @click="handleScreenshotClick(row)"
                >
                  终端截图
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-scrollbar>

        <!-- 列表模式分页器 -->
        <div v-if="viewMode === 'list'" class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="pageSizes"
            :total="totalCount"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>

        <!-- 回到顶部按钮 -->
        <transition name="fade">
          <div
            v-show="showBackTop"
            class="back-to-top"
            @click="backToTop"
          >
            <el-icon :size="20"><Top /></el-icon>
          </div>
        </transition>
      </div>

      <!-- 右侧操作面板 -->
      <div class="right-sidebar">
        <div class="operation-panel">
          <!-- 基础控制按钮 -->
          <div class="button-row">
            <el-button type="primary" plain class="op-button" :disabled="selectedDevices.length === 0">
              开机
            </el-button>
            <el-button type="primary" plain class="op-button" :disabled="selectedDevices.length === 0">
              关机
            </el-button>
          </div>

          <div class="button-row">
            <el-button type="primary" plain class="op-button long-button" :disabled="selectedDevices.length === 0">
              重启
            </el-button>
          </div>

          <div class="divider"></div>

          <!-- 门禁控制按钮 -->
          <div class="button-row">
            <el-button type="primary" plain class="op-button" :disabled="selectedDevices.length === 0">
              常开
            </el-button>
            <el-button type="primary" plain class="op-button" :disabled="selectedDevices.length === 0">
              取消常开
            </el-button>
          </div>

          <div class="button-row">
            <el-button type="primary" plain class="op-button long-button" :disabled="selectedDevices.length === 0">
              远程开门
            </el-button>
          </div>

          <div class="button-row">
            <el-button type="primary" plain class="op-button long-button" :disabled="selectedDevices.length === 0">
              设置定时开门
            </el-button>
          </div>

          <div class="button-row">
            <el-button type="primary" plain class="op-button long-button" :disabled="selectedDevices.length === 0">
              取消新增定时开门任务
            </el-button>
          </div>

          <div class="divider"></div>

          <!-- 其他功能按钮 -->
          <div class="button-row">
            <el-button type="primary" plain class="op-button" :disabled="selectedDevices.length === 0">
              禁用触控
            </el-button>
            <el-button type="primary" plain class="op-button" :disabled="selectedDevices.length === 0">
              启用触控
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 分组管理弹窗 -->
  <el-dialog
    v-model="showGroupDialog"
    :title="groupAction === 'addChild' ? '新增子分组' : (groupForm.id === 'root' ? '重命名根节点' : '编辑分组')"
    width="400px"
    :close-on-click-modal="false"
  >
    <el-form :model="groupForm" label-width="80px">
      <el-form-item label="上级分组" v-if="groupAction === 'addChild'">
        <el-input v-model="groupForm.parentLabel" disabled />
      </el-form-item>
      <el-form-item label="分组名称" required>
        <el-input
          v-model="groupForm.label"
          placeholder="请输入分组名称"
          maxlength="20"
          show-word-limit
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="showGroupDialog = false">取消</el-button>
      <el-button type="primary" @click="handleSaveGroup">确定</el-button>
    </template>
  </el-dialog>

  <!-- 右键菜单 -->
  <div
    v-show="contextMenuVisible"
    class="context-menu"
    :style="contextMenuStyle"
  >
    <div
      v-if="contextMenuTarget?.id !== 'root'"
      class="menu-item"
      @click="handleAddGroup()"
    >
      <el-icon><Plus /></el-icon>
      <span>新增子分组</span>
    </div>
    <div
      class="menu-item"
      @click="handleEditGroup()"
    >
      <el-icon><Edit /></el-icon>
      <span>{{ contextMenuTarget?.id === 'root' ? '重命名' : '编辑' }}</span>
    </div>
    <div
      v-if="contextMenuTarget?.id !== 'root'"
      class="menu-item"
      @click="handleDeleteGroup()"
    >
      <el-icon><Delete /></el-icon>
      <span>删除</span>
    </div>
  </div>

  <!-- 新增终端弹窗 -->
  <el-dialog
    v-model="showDeviceDialog"
    title="新增终端"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form :model="deviceForm" label-width="100px">
      <el-form-item label="所属分组" required>
        <el-select
          v-model="deviceForm.groupId"
          placeholder="请选择所属分组"
          style="width: 100%"
          @change="handleGroupChange"
        >
          <el-option
            v-for="group in flatGroups"
            :key="group.id"
            :label="group.label"
            :value="group.id"
            :style="{ paddingLeft: `${group.level * 20 + 10}px` }"
          >
            <span>{{ '　'.repeat(group.level) }}{{ group.label }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="终端名称" required>
        <el-input
          v-model="deviceForm.name"
          placeholder="请输入终端名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="showDeviceDialog = false">取消</el-button>
      <el-button type="primary" @click="handleSaveDevice">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search,
  Monitor,
  Folder,
  Grid,
  List,
  VideoPlay,
  VideoPause,
  Refresh,
  Unlock,
  Lock,
  Key,
  Clock,
  CircleClose,
  View,
  TurnOff,
  VideoCamera,
  Plus,
  Edit,
  Delete,
  Loading,
  InfoFilled,
  Top
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deviceGroups as sharedDeviceGroups, allDevices as sharedAllDevices } from '@/utils/deviceData'

const router = useRouter()

// 树形控件引用
const treeRef = ref()
const scrollbarRef = ref()
const filterText = ref('')

// 使用共享的设备数据
const treeData = ref(sharedDeviceGroups)
const deviceList = ref([...sharedAllDevices])

// 当前选中的节点
const selectedNode = ref<any>(null)
// 是否显示分组管理弹窗
const showGroupDialog = ref(false)
// 分组表单数据
const groupForm = ref({
  id: '',
  label: '',
  parentId: '',
  parentLabel: ''
})
// 分组操作类型
const groupAction = ref<'edit' | 'addChild'>('addChild')

// 右键菜单相关
const contextMenuVisible = ref(false)
const contextMenuStyle = ref({
  left: '0px',
  top: '0px'
})
const contextMenuTarget = ref<any>(null)

// 新增终端相关
const showDeviceDialog = ref(false)
const deviceForm = ref({
  name: '',
  groupId: '',
  groupName: ''
})

const treeProps = {
  children: 'children',
  label: 'label'
}

// 搜索和过滤
const searchKeyword = ref('')
const viewMode = ref('card') // card | list

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const pageSizes = [10, 20, 50, 100]
const loadedCount = ref(10) // 卡片模式已加载的数量，初始加载10条
const isLoading = ref(false)
const noMore = ref(false)
const showBackTop = ref(false) // 是否显示回到顶部按钮

// 选择相关
const selectedDevices = ref<string[]>([]) // 不设置默认选中
const selectAll = ref(false)
const isIndeterminate = computed(() =>
  selectedDevices.value.length > 0 && selectedDevices.value.length < filteredDevices.value.length
)

// 设备详情弹窗

// 过滤后的设备列表
const filteredDevices = computed(() => {
  const filtered = deviceList.value.filter(device =>
    !searchKeyword.value || device.name.includes(searchKeyword.value)
  )

  // 卡片模式：返回已加载的部分
  if (viewMode.value === 'card') {
    return filtered.slice(0, loadedCount.value)
  }

  // 列表模式：返回当前页的数据
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filtered.slice(start, end)
})

// 总数
const totalCount = computed(() => {
  return deviceList.value.filter(device =>
    !searchKeyword.value || device.name.includes(searchKeyword.value)
  ).length
})

// 树节点过滤
watch(filterText, (val) => {
  treeRef.value?.filter(val)
})

function filterNode(value: string, data: any) {
  if (!value) return true
  return data.label.includes(value)
}

// 处理树节点点击
function handleNodeClick(data: any, node: any) {
  selectedNode.value = data
  // 根据选中的节点过滤设备
  filterDevicesByGroup(data)
  // 关闭右键菜单
  contextMenuVisible.value = false
}

// 处理树节点右键点击
function handleNodeContextMenu(event: MouseEvent, data: any, node: any) {
  // 阻止默认右键菜单
  event.preventDefault()

  // 设置当前右键点击的节点
  contextMenuTarget.value = data
  selectedNode.value = data

  // 计算菜单位置
  contextMenuStyle.value = {
    left: `${event.clientX}px`,
    top: `${event.clientY}px`
  }

  // 显示右键菜单
  contextMenuVisible.value = true

  // 添加全局点击事件监听，点击其他地方关闭菜单
  document.addEventListener('click', hideContextMenu)
}

// 隐藏右键菜单
function hideContextMenu() {
  contextMenuVisible.value = false
  document.removeEventListener('click', hideContextMenu)
}

// 根据分组过滤设备
function filterDevicesByGroup(group: any) {
  // 这里可以根据分组ID过滤设备列表
  console.log('过滤分组：', group.label)
}

// 新增子分组
function handleAddGroup(node?: any) {
  const targetNode = node || contextMenuTarget.value || selectedNode.value
  if (!targetNode) return

  groupAction.value = 'addChild'
  groupForm.value = {
    id: '',
    label: '',
    parentId: targetNode.id,
    parentLabel: targetNode.label
  }
  showGroupDialog.value = true
  contextMenuVisible.value = false
}

// 编辑分组
function handleEditGroup(node?: any) {
  const targetNode = node || contextMenuTarget.value || selectedNode.value
  if (!targetNode) return

  groupAction.value = 'edit'
  groupForm.value = {
    id: targetNode.id,
    label: targetNode.label,
    parentId: targetNode.parentId || '',
    parentLabel: targetNode.parentLabel || ''
  }
  showGroupDialog.value = true
  contextMenuVisible.value = false
}

// 删除分组
function handleDeleteGroup(node?: any) {
  const targetNode = node || contextMenuTarget.value || selectedNode.value
  if (!targetNode || targetNode.id === 'root') return

  contextMenuVisible.value = false

  ElMessageBox.confirm(
    `确定要删除分组“${targetNode.label}”吗？删除后其下所有子分组和设备也将被删除。`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 递归删除节点
    removeNode(treeData.value[0], targetNode.id)
    if (selectedNode.value?.id === targetNode.id) {
      selectedNode.value = null
    }
    ElMessage.success('删除成功')
  }).catch(() => {
    // 取消删除
  })
}

// 递归删除节点
function removeNode(parent: any, nodeId: string): boolean {
  if (!parent.children) return false

  const index = parent.children.findIndex((child: any) => child.id === nodeId)
  if (index > -1) {
    parent.children.splice(index, 1)
    parent.count = parent.children.reduce((sum: number, child: any) => sum + (child.count || 0), 0)
    return true
  }

  for (const child of parent.children) {
    if (removeNode(child, nodeId)) {
      parent.count = parent.children.reduce((sum: number, child: any) => sum + (child.count || 0), 0)
      return true
    }
  }

  return false
}

// 保存分组
function handleSaveGroup() {
  if (!groupForm.value.label) {
    ElMessage.warning('请输入分组名称')
    return
  }

  if (groupAction.value === 'addChild') {
    // 新增子节点
    const parent = findNode(treeData.value[0], groupForm.value.parentId)
    if (parent) {
      if (!parent.children) parent.children = []
      parent.children.push({
        id: `group_${Date.now()}`,
        label: groupForm.value.label,
        count: 0,
        children: []
      })
    }
  } else if (groupAction.value === 'edit') {
    // 编辑节点
    const node = findNode(treeData.value[0], groupForm.value.id)
    if (node) {
      node.label = groupForm.value.label
    }
  }

  showGroupDialog.value = false
  ElMessage.success('操作成功')
}

// 递归查找节点
function findNode(root: any, nodeId: string): any {
  if (root.id === nodeId) return root

  if (root.children) {
    for (const child of root.children) {
      const found = findNode(child, nodeId)
      if (found) return found
    }
  }

  return null
}

// 处理分组选择变化
function handleGroupChange(groupId: string) {
  const group = flatGroups.value.find(g => g.id === groupId)
  if (group) {
    deviceForm.value.groupName = group.label
  }
}

// 处理全选
function handleSelectAll(val: boolean) {
  if (val) {
    selectedDevices.value = filteredDevices.value.map(d => d.id)
  } else {
    selectedDevices.value = []
  }
  // 更新全选框状态
  selectAll.value = val
}

// 切换设备选择
function toggleDeviceSelection(deviceId: string) {
  const index = selectedDevices.value.indexOf(deviceId)
  if (index > -1) {
    selectedDevices.value.splice(index, 1)
  } else {
    selectedDevices.value.push(deviceId)
  }
}

// 表格选择变化
function handleSelectionChange(selection: any[]) {
  selectedDevices.value = selection.map(item => item.id)
}

// 批量删除终端
function handleBatchDelete() {
  if (selectedDevices.value.length === 0) {
    ElMessage.warning('请先选择要删除的终端')
    return
  }

  const deviceNames = selectedDevices.value
    .map(id => {
      const device = deviceList.value.find(d => d.id === id)
      return device ? device.name : ''
    })
    .filter(name => name)

  const message = deviceNames.length === 1
    ? `确定要删除终端“${deviceNames[0]}”吗？`
    : `确定要删除选中的 ${deviceNames.length} 个终端吗？`

  ElMessageBox.confirm(
    message,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      distinguishCancelAndClose: true,
      beforeClose: (action, instance, done) => {
        if (action === 'confirm') {
          // 执行删除操作
          const deletedCount = selectedDevices.value.length

          // 从列表中移除选中的设备
          deviceList.value = deviceList.value.filter(
            device => !selectedDevices.value.includes(device.id)
          )

          // 更新分组设备数量（这里简化处理，实际应根据设备所属分组更新）
          if (treeData.value.length > 0) {
            updateGroupCount(treeData.value[0], treeData.value[0].id, -deletedCount)
          }

          // 清空选中状态
          selectedDevices.value = []
          selectAll.value = false

          ElMessage.success(`已成功删除 ${deletedCount} 个终端`)
          done()
        } else {
          done()
        }
      }
    }
  ).catch(() => {
    // 用户取消删除
  })
}

// 获取设备颜色
function getDeviceColor(status: string) {
  const colors: Record<string, string> = {
    online: '#67C23A',
    offline: '#E6A23C',
    shutdown: '#909399',
    unbind: '#F56C6C'
  }
  return colors[status] || '#909399'
}

// 获取状态标签类型
function getStatusType(status: string) {
  const types: Record<string, string> = {
    online: 'success',
    offline: 'warning',
    shutdown: 'info',
    unbind: 'danger'
  }
  return types[status] || 'info'
}

// 获取状态文本
function getStatusText(status: string) {
  const texts: Record<string, string> = {
    online: '在线',
    offline: '离线',
    shutdown: '关机',
    unbind: '未绑定'
  }
  return texts[status] || '未知'
}

// 处理截图按钮点击
function handleScreenshotClick(device: any) {
  ElMessage.info(`查看设备 ${device.name} 的终端截图`)
  // 这里可以打开终端截图查看弹窗
}

// 打开设备详情
function openDeviceDetail(device: any) {
  // 跳转到设备详情页面
  router.push(`/access/device/${device.id}`)
}

// 新增终端
function handleAddDevice() {
  // 如果当前有选中的分组，自动填充；否则默认选择根节点
  if (selectedNode.value) {
    deviceForm.value.groupId = selectedNode.value.id
    deviceForm.value.groupName = selectedNode.value.label
  } else if (treeData.value.length > 0) {
    // 默认选择根节点
    deviceForm.value.groupId = treeData.value[0].id
    deviceForm.value.groupName = treeData.value[0].label
  } else {
    deviceForm.value.groupId = ''
    deviceForm.value.groupName = ''
  }
  deviceForm.value.name = ''
  showDeviceDialog.value = true
}

// 保存终端
function handleSaveDevice() {
  if (!deviceForm.value.name) {
    ElMessage.warning('请输入终端名称')
    return
  }
  if (!deviceForm.value.groupId) {
    ElMessage.warning('请选择所属分组')
    return
  }

  // 添加新设备到列表（新增的终端默认为未绑定状态）
  const newDevice = {
    id: `DEV${Date.now()}`,
    name: deviceForm.value.name,
    ip: '', // 未绑定设备没有IP
    location: deviceForm.value.groupName,
    status: 'unbind', // 默认未绑定状态
    lastSync: '-' // 未绑定设备没有同步时间
  }
  deviceList.value.push(newDevice)

  // 更新分组设备数量
  if (treeData.value.length > 0) {
    updateGroupCount(treeData.value[0], deviceForm.value.groupId, 1)
  }

  ElMessage.success('终端添加成功')
  showDeviceDialog.value = false
}

// 更新分组设备数量
function updateGroupCount(node: any, groupId: string, delta: number): boolean {
  if (node.id === groupId) {
    node.count = (node.count || 0) + delta
    return true
  }

  if (node.children) {
    for (const child of node.children) {
      if (updateGroupCount(child, groupId, delta)) {
        node.count = (node.count || 0) + delta
        return true
      }
    }
  }

  return false
}

// 获取所有分组的平铺数组（用于下拉选择）
function getFlatGroups(node: any, result: any[] = [], level: number = 0): any[] {
  result.push({
    id: node.id,
    label: node.label,
    level,
    disabled: false
  })

  if (node.children) {
    for (const child of node.children) {
      getFlatGroups(child, result, level + 1)
    }
  }

  return result
}

// 计算分组列表
const flatGroups = computed(() => {
  if (treeData.value.length === 0) return []
  return getFlatGroups(treeData.value[0])
})

// 处理页面大小变化
function handleSizeChange(val: number) {
  pageSize.value = val
  currentPage.value = 1 // 重置到第一页
}

// 处理页码变化
function handleCurrentChange(val: number) {
  currentPage.value = val
}

// 加载更多（卡片模式）
function loadMore() {
  if (isLoading.value || noMore.value) return

  isLoading.value = true

  // 模拟异步加载，实际项目中这里会是API请求
  setTimeout(() => {
    const currentTotal = deviceList.value.filter(device =>
      !searchKeyword.value || device.name.includes(searchKeyword.value)
    ).length

    if (loadedCount.value >= currentTotal) {
      noMore.value = true
    } else {
      // 每次加载10条
      loadedCount.value = Math.min(loadedCount.value + 10, currentTotal)
    }

    isLoading.value = false
  }, 800) // 模拟网络延迟
}

// 监听滚动（卡片模式无限滚动）
function handleScroll(e: any) {
  // 获取实际的滚动容器元素
  const wrap = scrollbarRef.value?.wrapRef || scrollbarRef.value?.$refs?.wrap
  if (!wrap) return

  const scrollTop = wrap.scrollTop
  const scrollHeight = wrap.scrollHeight
  const clientHeight = wrap.clientHeight

  // 检查参数是否有效
  if (!scrollHeight || !clientHeight) return

  // 控制回到顶部按钮显示（滚动超过300px时显示）
  showBackTop.value = scrollTop > 300

  // 卡片模式下的无限滚动
  if (viewMode.value === 'card') {
    // 距离底部100px时触发加载
    if (scrollHeight - scrollTop - clientHeight < 100) {
      loadMore()
    }
  }
}

// 回到顶部
function backToTop() {
  const wrap = scrollbarRef.value?.wrapRef || scrollbarRef.value?.$refs?.wrap
  if (!wrap) return

  // 平滑滚动到顶部
  wrap.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 重置分页状态
watch([searchKeyword, viewMode], () => {
  currentPage.value = 1
  loadedCount.value = 10  // 重置时也是10条
  noMore.value = false
  showBackTop.value = false  // 重置回到顶部按钮状态
})
</script>

<style lang="scss" scoped>
.device-monitor-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

// 顶部标题栏
.page-header {
  height: 60px;
  background: white;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e4e7ed;

  .header-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
}

// 主内容区
.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

// 左侧分组树
.left-sidebar {
  width: 220px;
  background: white;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;

  .tree-header {
    padding: 12px;
    border-bottom: 1px solid #e4e7ed;
  }

  .tree-container {
    flex: 1;
    padding: 12px;

    .tree-node {
      display: flex;
      align-items: center;
      font-size: 14px;

      .node-icon {
        margin-right: 6px;
        color: #409eff;
      }

      .node-label {
        flex: 1;
      }

      .node-count {
        color: #909399;
        font-size: 12px;
        margin-left: 4px;
      }
    }
  }
}

// 中间内容区
.center-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;

  .toolbar {
    height: 50px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #e4e7ed;

    .toolbar-left {
      display: flex;
      align-items: center;
    }

    .toolbar-right {
      display: flex;
      align-items: center;
    }
  }

  .device-content {
    flex: 1;
    padding: 20px;
    padding-top: 24px; // 增加顶部内边距，防止第一排卡片hover时被遮挡
  }

  // 卡片容器
  .device-wrapper {
    min-height: 100%;
  }

  // 卡片视图
  .device-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  .device-card {
    background: white;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    padding: 16px;
    cursor: pointer;
    transition: box-shadow 0.3s, border-color 0.3s;
    position: relative;

    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      border-color: #c0c4cc;
    }

    &.selected {
      border-color: #409eff;
      background: #f0f9ff;
    }

    .camera-button {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 32px;
      height: 32px;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid #dcdfe6;
      z-index: 1;

      &:hover {
        background: #409eff;
        border-color: #409eff;
        color: white;
      }

      .el-icon {
        font-size: 16px;
      }
    }

    .device-preview {
      margin-bottom: 12px;

      .preview-image {
        height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        color: white;

        .el-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }

    .device-info {
      .device-name {
        font-size: 14px;
        font-weight: 500;
        color: #303133;
        margin-bottom: 4px;
      }

      .device-ip {
        font-size: 12px;
        color: #909399;
        margin-bottom: 8px;
      }

      .device-status {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 22px;
        line-height: 22px;
      }
    }

    .device-actions {
      margin-top: 12px;
      text-align: center;

      .el-button {
        width: 100%;
      }
    }
  }

  // 加载更多提示
  .loading-more {
    padding: 30px 20px;
    text-align: center;
    color: #909399;

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;

      .loading-spinner {
        width: 40px;
        height: 40px;
        background: #f0f2f5;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

        .is-loading {
          animation: rotating 1s linear infinite;
          color: #409eff;
        }
      }
    }

    .el-text {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 14px;
    }
  }

  // 分页器
  .pagination-wrapper {
    padding: 20px;
    background: white;
    border-top: 1px solid #e4e7ed;
    display: flex;
    justify-content: flex-end;
  }

  // 回到顶部按钮
  .back-to-top {
    position: fixed;
    right: 40px;
    bottom: 80px;
    width: 48px;
    height: 48px;
    background: #409eff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 999;
    box-shadow: 0 2px 12px rgba(64, 158, 255, 0.4);
    transition: all 0.3s ease;

    &:hover {
      background: #337ecc;
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(64, 158, 255, 0.6);
    }

    .el-icon {
      color: white;
      font-weight: bold;
    }
  }
}

// 右侧操作面板
.right-sidebar {
  width: 220px;
  background: white;
  border-left: 1px solid #e4e7ed;
  padding: 16px 12px;
  overflow-y: auto;

  .operation-panel {
    .button-row {
      display: flex;
      gap: 8px;
      margin-bottom: 10px;

      :deep(.op-button) {
        flex: 1;
        height: 36px;
        font-size: 14px;

        &.long-button {
          flex: 0 0 100%;
        }
      }
    }

    .divider {
      height: 1px;
      background-color: #e4e7ed;
      margin: 16px 0;
    }
  }
}

// 右键菜单样式
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 3000;
  padding: 5px 0;
  min-width: 120px;

  .menu-item {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    font-size: 14px;
    color: #606266;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover:not(.disabled) {
      background-color: #f5f7fa;
      color: #409eff;
    }

    &.disabled {
      color: #c0c4cc;
      cursor: not-allowed;
    }

    .el-icon {
      margin-right: 8px;
      font-size: 16px;
    }
  }
}

// 加载动画
@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 淡入淡出过渡
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>