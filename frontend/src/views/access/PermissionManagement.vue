<template>
  <div class="permission-management">
    <div class="permission-header">
      <div class="header-content">
        <h2>通行权限管理</h2>
        <p class="page-description">管理终端设备与人员的通行权限关系</p>
      </div>
    </div>

    <div class="permission-content">
      <el-row :gutter="20" style="height: 100%;">
        <!-- 左侧：终端分组目录 -->
        <el-col :span="6" style="height: 100%;">
          <div class="terminal-tree-container">
            <div class="tree-header">
              <el-input
                v-model="terminalSearch"
                placeholder="查询终端名称"
                size="default"
                prefix-icon="Search"
                clearable
              />
            </div>
            <el-tree
              :data="terminalTreeData"
              :props="treeProps"
              node-key="id"
              :default-expanded-keys="getDefaultExpandedKeys(terminalTreeData)"
              :expand-on-click-node="false"
              @node-click="handleTreeNodeClick"
              :filter-node-method="filterNode"
              style="height: calc(100% - 60px); overflow-y: auto; padding: 10px 0;"
            >
              <template #default="{ node, data }">
                <div class="tree-node-content">
                  <span class="node-label">{{ data.isTerminal ? data.label : node.label }}</span>
                  <el-tag 
                    size="small" 
                    :type="data.isTerminal ? (data.status === 'online' ? 'success' : 'danger') : (node.childNodes && node.childNodes.length ? 'info' : 'warning')"
                  >
                    {{ data.isTerminal ? (data.status === 'online' ? '在线' : '离线') : (data.count || 0) }}
                  </el-tag>
                </div>
              </template>
            </el-tree>
          </div>
        </el-col>

        <!-- 右侧：人员信息列表 -->
        <el-col :span="18" style="height: 100%;">
          <div class="personnel-list-container">
            <div class="list-header">
              <div class="header-left">
                <span class="terminal-name" v-if="selectedTerminal">{{ selectedTerminal }}</span>
              </div>
              
            </div>

            <div class="list-filters">
              <el-form :inline="true" :model="personnelFilter" class="filter-form">
                <el-form-item label="人员姓名">
                  <el-input
                    v-model="personnelFilter.name"
                    placeholder="请输入人员姓名"
                    clearable
                  />
                </el-form-item>
                <el-form-item label="类型">
                  <el-select v-model="personnelFilter.type" placeholder="请选择类型" clearable style="width: 120px">
                    <el-option label="教师" value="teacher" />
                    <el-option label="学生" value="student" />
                  </el-select>
                </el-form-item>
                <el-form-item label="部门/班级">
                  <el-input
                    v-model="personnelFilter.department"
                    placeholder="请输入部门或班级"
                    clearable
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="searchPersonnel">查询</el-button>
                  <el-button @click="resetPersonnelFilter">重置</el-button>
                  <el-button 
                    type="danger" 
                    :disabled="selectedPersonnel.length === 0"
                    @click="batchRemovePermission"
                  >
                    批量解除权限
                  </el-button>
                </el-form-item>
              </el-form>
            </div>

            <el-table
              :data="paginatedPersonnelList"
              height="calc(100vh - 350px)"
              @selection-change="handleSelectionChange"
              style="width: 100%"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column prop="name" label="姓名" width="120" />
              <el-table-column prop="code" label="工号/学号" width="120" />
              <el-table-column prop="type" label="类型" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.type === 'teacher' ? 'primary' : 'success'">
                    {{ scope.row.type === 'teacher' ? '教师' : '学生' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="department" label="部门/班级" />
              <el-table-column prop="terminal" label="终端设备" />
              <el-table-column prop="permissionType" label="权限类型" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.permissionType === 'permanent' ? 'success' : 'warning'">
                    {{ scope.row.permissionType === 'permanent' ? '永久' : '临时' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="validPeriod" label="有效期" width="180" />
              <el-table-column label="操作" width="100" fixed="right">
                <template #default="scope">
                  <el-button
                    link
                    type="danger"
                    size="small"
                    @click="removePermission(scope.row)"
                  >
                    解除授权
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
              <el-pagination
                v-model:current-page="personnelCurrentPage"
                v-model:page-size="personnelPageSize"
                :page-sizes="[10, 20, 50]"
                :total="filteredPersonnelList.length"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 解除权限确认弹窗 -->
    <el-dialog
      v-model="showRemoveConfirm"
      title="解除权限确认"
      width="400px"
      :close-on-click-modal="false"
    >
      <p>确定要解除{{ removeConfirmType === 'single' ? '该人员' : '这些人员' }}的通行权限吗？</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showRemoveConfirm = false">取消</el-button>
          <el-button type="primary" @click="confirmRemovePermission">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

// 响应式数据
const terminalSearch = ref('')
const selectedTerminal = ref('')
const showRemoveConfirm = ref(false)
const removeConfirmType = ref<'single' | 'batch'>('single') // 单个或批量
const personnelToBeRemoved = ref<any[]>([]) // 待移除的人员

// 分页相关
const personnelCurrentPage = ref(1)
const personnelPageSize = ref(10)
const selectedPersonnel = ref<any[]>([])

// 构建终端树数据，将设备作为叶子节点
const terminalTreeData = ref([
  {
    id: 'T001',
    label: '校园区域',
    count: 25,
    children: [
      {
        id: 'T002',
        label: '校门',
        count: 10,
        children: [
          { 
            id: 'T003', 
            label: '东门', 
            count: 3,
            children: [
              { id: 'D001', label: '东门A闸机', type: 'gate', status: 'online', location: '东门', isTerminal: true },
              { id: 'D002', label: '东门B闸机', type: 'gate', status: 'online', location: '东门', isTerminal: true },
              { id: 'D003', label: '东门C闸机', type: 'gate', status: 'offline', location: '东门', isTerminal: true }
            ]
          },
          { 
            id: 'T004', 
            label: '西门', 
            count: 4,
            children: [
              { id: 'D004', label: '西门闸机', type: 'gate', status: 'online', location: '西门', isTerminal: true },
              { id: 'D005', label: '西门侧门闸机', type: 'gate', status: 'online', location: '西门', isTerminal: true },
              { id: 'D006', label: '西门教师通道', type: 'gate', status: 'online', location: '西门', isTerminal: true },
              { id: 'D007', label: '西门应急通道', type: 'gate', status: 'offline', location: '西门', isTerminal: true }
            ]
          },
          { 
            id: 'T005', 
            label: '南门', 
            count: 3,
            children: [
              { id: 'D008', label: '南门主闸机', type: 'gate', status: 'online', location: '南门', isTerminal: true },
              { id: 'D009', label: '南门副闸机', type: 'gate', status: 'online', location: '南门', isTerminal: true },
              { id: 'D010', label: '南门教职工通道', type: 'gate', status: 'offline', location: '南门', isTerminal: true }
            ]
          },
        ]
      },
      {
        id: 'T006',
        label: '教学楼',
        count: 8,
        children: [
          { 
            id: 'T007', 
            label: 'A栋教学楼', 
            count: 4,
            children: [
              { id: 'D011', label: 'A栋1楼闸机', type: 'office', status: 'online', location: 'A栋1楼', isTerminal: true },
              { id: 'D012', label: 'A栋2楼闸机', type: 'office', status: 'online', location: 'A栋2楼', isTerminal: true },
              { id: 'D013', label: 'A栋3楼闸机', type: 'office', status: 'online', location: 'A栋3楼', isTerminal: true },
              { id: 'D014', label: 'A栋电梯口', type: 'office', status: 'offline', location: 'A栋', isTerminal: true }
            ]
          },
          { 
            id: 'T008', 
            label: 'B栋教学楼', 
            count: 4,
            children: [
              { id: 'D015', label: 'B栋主入口', type: 'office', status: 'online', location: 'B栋1楼', isTerminal: true },
              { id: 'D016', label: 'B栋侧门', type: 'office', status: 'online', location: 'B栋1楼', isTerminal: true },
              { id: 'D017', label: 'B栋实验室入口', type: 'office', status: 'online', location: 'B栋3楼', isTerminal: true },
              { id: 'D018', label: 'B栋教师休息室', type: 'office', status: 'offline', location: 'B栋2楼', isTerminal: true }
            ]
          }
        ]
      },
      {
        id: 'T009',
        label: '宿舍区',
        count: 7,
        children: [
          { 
            id: 'T010', 
            label: '男生宿舍', 
            count: 3,
            children: [
              { id: 'D019', label: '男生宿舍A区入口', type: 'dormitory', status: 'online', location: '男生宿舍A区', isTerminal: true },
              { id: 'D020', label: '男生宿舍B区入口', type: 'dormitory', status: 'online', location: '男生宿舍B区', isTerminal: true },
              { id: 'D021', label: '男生宿舍C区入口', type: 'dormitory', status: 'online', location: '男生宿舍C区', isTerminal: true }
            ]
          },
          { 
            id: 'T011', 
            label: '女生宿舍', 
            count: 4,
            children: [
              { id: 'D022', label: '女生宿舍主入口', type: 'dormitory', status: 'online', location: '女生宿舍', isTerminal: true },
              { id: 'D023', label: '女生宿舍A区', type: 'dormitory', status: 'online', location: '女生宿舍A区', isTerminal: true },
              { id: 'D024', label: '女生宿舍B区', type: 'dormitory', status: 'online', location: '女生宿舍B区', isTerminal: true },
              { id: 'D025', label: '女生宿舍C区', type: 'dormitory', status: 'offline', location: '女生宿舍C区', isTerminal: true }
            ]
          }
        ]
      }
    ]
  }
])

// 人员列表数据
const allPersonnelList = ref([
  { id: 'P001', name: '张老师', code: 'T001', type: 'teacher', department: '数学组', terminal: '东门', permissionType: 'permanent', validPeriod: '永久有效' },
  { id: 'P002', name: '李老师', code: 'T002', type: 'teacher', department: '语文组', terminal: '西门', permissionType: 'temporary', validPeriod: '2024-01-01 至 2024-12-31' },
  { id: 'P003', name: '王老师', code: 'T003', type: 'teacher', department: '英语组', terminal: '南门', permissionType: 'permanent', validPeriod: '永久有效' },
  { id: 'P004', name: '李小明', code: 'S001', type: 'student', department: '三年级一班', terminal: '东门', permissionType: 'temporary', validPeriod: '2024-01-01 至 2024-06-30' },
  { id: 'P005', name: '王小红', code: 'S002', type: 'student', department: '三年级二班', terminal: '西门', permissionType: 'permanent', validPeriod: '永久有效' },
  { id: 'P006', name: '张小刚', code: 'S003', type: 'student', department: '三年级一班', terminal: '南门', permissionType: 'temporary', validPeriod: '2024-03-01 至 2024-08-31' },
  { id: 'P007', name: '刘老师', code: 'T004', type: 'teacher', department: '物理组', terminal: 'A栋教学楼', permissionType: 'permanent', validPeriod: '永久有效' },
  { id: 'P008', name: '陈老师', code: 'T005', type: 'teacher', department: '化学组', terminal: 'B栋教学楼', permissionType: 'temporary', validPeriod: '2024-01-01 至 2024-12-31' },
  { id: 'P009', name: '赵老师', code: 'T006', type: 'teacher', department: '生物组', terminal: '实验楼', permissionType: 'permanent', validPeriod: '永久有效' },
  { id: 'P100', name: '孙小丽', code: 'S004', type: 'student', department: '二年级三班', terminal: '男生宿舍', permissionType: 'temporary', validPeriod: '2024-09-01 至 2025-01-15' }
])

// 人员查询条件
const personnelFilter = reactive({
  name: '',
  type: '',
  department: ''
})

// 树节点配置
const treeProps = {
  children: 'children',
  label: 'label'
}

// 分页后的人员列表
const paginatedPersonnelList = computed(() => {
  const start = (personnelCurrentPage.value - 1) * personnelPageSize.value
  const end = start + personnelPageSize.value
  return filteredPersonnelList.value.slice(start, end)
})

// 过滤后的人员列表
const filteredPersonnelList = computed(() => {
  return allPersonnelList.value.filter(person => {
    const matchesName = !personnelFilter.name || person.name.includes(personnelFilter.name)
    const matchesType = !personnelFilter.type || person.type === personnelFilter.type
    const matchesDepartment = !personnelFilter.department || person.department.includes(personnelFilter.department)
    
    return matchesName && matchesType && matchesDepartment
  })
})

// 监听终端搜索框变化
watch(terminalSearch, (val) => {
  // 过滤树节点
})

// 过滤节点方法
const filterNode = (value: string, data: any) => {
  if (!value) return true
  return data.label.includes(value)
}

// 获取默认展开的节点键值
const getDefaultExpandedKeys = (treeData: any[], keys: string[] = []) => {
  treeData.forEach(node => {
    keys.push(node.id);
    if (node.children) {
      getDefaultExpandedKeys(node.children, keys);
    }
  });
  return keys;
};

// 处理树节点点击
const handleTreeNodeClick = (data: any) => {
  selectedTerminal.value = data.label
  
  // 检查是否为终端设备节点
  if (data.isTerminal) {
    // 如果是终端设备节点，加载该设备的人员权限
    console.log('选中的终端设备:', data)
  } else {
    // 如果是分组节点，加载该分组下的所有设备的人员权限
    console.log('选中的分组:', data)
  }
}

// 处理表格选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedPersonnel.value = selection
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  personnelPageSize.value = size
  personnelCurrentPage.value = 1
}

// 分页当前页变化
const handleCurrentChange = (page: number) => {
  personnelCurrentPage.value = page
}

// 查询人员
const searchPersonnel = () => {
  personnelCurrentPage.value = 1
}

// 重置人员过滤条件
const resetPersonnelFilter = () => {
  personnelFilter.name = ''
  personnelFilter.type = ''
  personnelFilter.department = ''
  personnelCurrentPage.value = 1
}

// 解除权限（单个）
const removePermission = (row: any) => {
  personnelToBeRemoved.value = [row]
  removeConfirmType.value = 'single'
  showRemoveConfirm.value = true
}

// 批量解除权限
const batchRemovePermission = () => {
  if (selectedPersonnel.value.length === 0) {
    ElMessage.warning('请至少选择一个人员')
    return
  }
  
  personnelToBeRemoved.value = [...selectedPersonnel.value]
  removeConfirmType.value = 'batch'
  showRemoveConfirm.value = true
}

// 确认解除权限
const confirmRemovePermission = () => {
  // 模拟API调用移除权限
  const ids = personnelToBeRemoved.value.map(p => p.id)
  
  // 从列表中移除
  allPersonnelList.value = allPersonnelList.value.filter(p => !ids.includes(p.id))
  
  ElMessage.success(`${removeConfirmType.value === 'single' ? '已解除' : '已批量解除'} ${personnelToBeRemoved.value.length} 个用户的权限`)
  
  showRemoveConfirm.value = false
  personnelToBeRemoved.value = []
  selectedPersonnel.value = []
}
</script>

<style lang="scss" scoped>
.permission-management {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);

  .permission-header {
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

  .permission-content {
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 20px;
    min-height: calc(100vh - 150px);

    .terminal-tree-container {
      height: 100%;
      border-right: 1px solid #e4e7ed;
      padding-right: 20px;

      .tree-header {
        margin-bottom: 20px;
      }

      .tree-node-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;

        .node-label {
          flex: 1;
        }
      }
      
      .terminal-list {
        margin-left: 20px;
        margin-top: 5px;
        padding-left: 10px;
        border-left: 1px solid #ebeef5;
        
        .terminal-item {
          padding: 5px 0;
          cursor: pointer;
          border-radius: 4px;
          transition: background-color 0.2s;
          
          &:hover {
            background-color: #f5f7fa;
          }
          
          .terminal-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            
            .terminal-name {
              font-size: 13px;
              color: #606266;
            }
          }
          
          .terminal-details {
            font-size: 12px;
            color: #909399;
            margin-top: 2px;
            margin-left: 10px;
          }
        }
      }
    }

    .personnel-list-container {
      height: 100%;
      padding-left: 20px;

      .list-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        .header-left {
          display: flex;
          align-items: center;
          gap: 10px;

          h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 500;
            color: #333;
          }

          .terminal-name {
            background: #ecf5ff;
            color: #409eff;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
          }
        }
      }

      .list-filters {
        margin-bottom: 20px;

        .filter-form {
          :deep(.el-form-item) {
            margin-bottom: 12px;
            margin-right: 20px;

            &:last-child {
              margin-right: 0;
            }
          }
        }
      }
    }
  }
}
</style>