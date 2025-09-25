<template>
  <div class="record-query-container">
    <!-- 顶部筛选栏 -->
    <div class="filter-section">
      <el-form :model="filterForm" inline>
        <el-form-item label="人员类型">
          <el-select v-model="filterForm.personnelType" placeholder="请选择" clearable>
            <el-option label="全部" value="" />
            <el-option label="教师" value="teacher" />
            <el-option label="学生" value="student" />
          </el-select>
        </el-form-item>

        <el-form-item label="通行时间">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            :default-time="[new Date(0, 0, 0, 0, 0, 0), new Date(0, 0, 0, 23, 59, 59)]"
          />
        </el-form-item>

        <el-form-item label="通行结果">
          <el-select v-model="filterForm.passResult" placeholder="请选择" clearable>
            <el-option label="全部" value="" />
            <el-option label="成功" value="success" />
            <el-option label="失败" value="fail" />
          </el-select>
        </el-form-item>

        <el-form-item label="关联设备">
          <el-select v-model="filterForm.deviceId" placeholder="请选择" clearable>
            <el-option label="全部" value="" />
            <el-option label="校门1号闸机" value="DEV-001" />
            <el-option label="校门2号闸机" value="DEV-002" />
            <el-option label="办公楼1号闸机" value="DEV-003" />
            <el-option label="办公楼2号闸机" value="DEV-004" />
            <el-option label="宿舍区1号闸机" value="DEV-005" />
            <el-option label="宿舍区2号闸机" value="DEV-006" />
          </el-select>
        </el-form-item>

        <el-form-item label="通行方式">
          <el-select v-model="filterForm.passMethod" placeholder="请选择" clearable>
            <el-option label="全部" value="" />
            <el-option label="人脸打卡" value="face" />
            <el-option label="刷卡" value="card" />
            <el-option label="权限远程开门" value="remote" />
          </el-select>
        </el-form-item>

        <el-form-item label="人员搜索">
          <el-input
            v-model="filterForm.keyword"
            placeholder="姓名/工号/学号"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="warning" @click="handleExport">导出记录</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格 -->
    <el-table
      :data="tableData"
      v-loading="loading"
      border
      stripe
      style="width: 100%"
      :row-class-name="tableRowClassName"
    >
      <el-table-column prop="recordId" label="记录ID" min-width="140">
        <template #default="{ row }">
          <span class="clickable-text" @click="viewDetail(row)">{{ row.recordId }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="personName" label="关联人员" min-width="180">
        <template #default="{ row }">
          <div>{{ row.personName }}（{{ row.personCode }}）</div>
          <div class="sub-text">{{ row.department || row.classInfo }}</div>
        </template>
      </el-table-column>

      <el-table-column prop="passTime" label="通行时间" min-width="160" />

      <el-table-column prop="deviceName" label="关联设备" min-width="150">
        <template #default="{ row }">
          <div>{{ row.deviceName }}</div>
          <div class="sub-text">{{ row.deviceCode }}</div>
        </template>
      </el-table-column>

      <el-table-column prop="passMethod" label="通行方式" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="getMethodTagType(row.passMethod)">
            {{ getMethodText(row.passMethod) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="passResult" label="通行结果" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="row.passResult === 'success' ? 'success' : 'danger'">
            {{ row.passResult === 'success' ? '成功' : '失败' }}
          </el-tag>
          <div v-if="row.passResult === 'fail'" class="fail-reason">
            {{ row.failReason }}
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="permissionId" label="关联权限ID" min-width="140" align="center">
        <template #default="{ row }">
          {{ row.permissionId || '-' }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="100" fixed="right" align="center">
        <template #default="{ row }">
          <el-button type="primary" link @click="viewDetail(row)">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 记录详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      title="通行记录详情"
      width="650px"
      :close-on-click-modal="false"
    >
      <div class="detail-container" v-if="currentRecord">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="记录ID" :span="2">
            {{ currentRecord.recordId }}
          </el-descriptions-item>

          <el-descriptions-item label="姓名">
            {{ currentRecord.personName }}
          </el-descriptions-item>
          <el-descriptions-item label="工号/学号">
            {{ currentRecord.personCode }}
          </el-descriptions-item>

          <el-descriptions-item label="归属">
            {{ currentRecord.department || currentRecord.classInfo }}
          </el-descriptions-item>
          <el-descriptions-item label="人员状态">
            <el-tag>{{ currentRecord.personStatus || '正常' }}</el-tag>
          </el-descriptions-item>

          <el-descriptions-item label="通行时间" :span="2">
            {{ currentRecord.passTime }}
          </el-descriptions-item>

          <el-descriptions-item label="设备名称">
            {{ currentRecord.deviceName }}
          </el-descriptions-item>
          <el-descriptions-item label="设备编号">
            {{ currentRecord.deviceCode }}
          </el-descriptions-item>

          <el-descriptions-item label="通行方式">
            <el-tag :type="getMethodTagType(currentRecord.passMethod)">
              {{ getMethodText(currentRecord.passMethod) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="通行结果">
            <el-tag :type="currentRecord.passResult === 'success' ? 'success' : 'danger'">
              {{ currentRecord.passResult === 'success' ? '成功' : '失败' }}
            </el-tag>
          </el-descriptions-item>

          <el-descriptions-item v-if="currentRecord.passResult === 'fail'" label="失败原因" :span="2">
            <span class="fail-text">{{ currentRecord.failReason }}</span>
          </el-descriptions-item>

          <el-descriptions-item label="关联权限ID" :span="2">
            {{ currentRecord.permissionId || '无' }}
          </el-descriptions-item>

          <el-descriptions-item v-if="currentRecord.permissionId" label="权限来源">
            {{ currentRecord.permissionSource || '-' }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentRecord.permissionId" label="权限有效期">
            {{ currentRecord.permissionValidPeriod || '-' }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="operation-log" v-if="currentRecord.logs && currentRecord.logs.length > 0">
          <h4>操作日志</h4>
          <el-timeline>
            <el-timeline-item
              v-for="(log, index) in currentRecord.logs"
              :key="index"
              :timestamp="log.time"
              placement="top"
            >
              {{ log.content }}
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="primary" @click="printDetail">打印详情</el-button>
      </template>
    </el-dialog>

    <!-- 导出进度 -->
    <div v-if="exportProgress.visible" class="export-progress">
      <el-progress :percentage="exportProgress.percentage" />
      <div class="progress-text">
        {{ exportProgress.text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 筛选表单
const filterForm = reactive({
  personnelType: '',
  dateRange: [] as string[],
  passResult: '',
  deviceId: '',
  passMethod: '',
  keyword: ''
})

// 表格数据
const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

// 详情弹窗
const detailVisible = ref(false)
const currentRecord = ref<any>(null)

// 导出进度
const exportProgress = reactive({
  visible: false,
  percentage: 0,
  text: ''
})

// 初始化数据
onMounted(() => {
  // 设置默认时间范围为近24小时
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  filterForm.dateRange = [
    formatDateTime(yesterday),
    formatDateTime(now)
  ]

  loadData()
})

// 格式化日期时间
function formatDateTime(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 加载数据
async function loadData() {
  loading.value = true
  try {
    // 模拟数据
    const mockData = []
    for (let i = 0; i < 15; i++) {
      const isSuccess = Math.random() > 0.2
      const isTeacher = Math.random() > 0.5
      mockData.push({
        recordId: `REC20240910${String(i + 1).padStart(3, '0')}`,
        personName: isTeacher ? `教师${i + 1}` : `学生${i + 1}`,
        personCode: isTeacher ? `T00${i + 1}` : `S202400${i + 1}`,
        department: isTeacher ? '信息技术部' : null,
        classInfo: !isTeacher ? '2024级1班' : null,
        passTime: `2024-09-10 ${String(7 + Math.floor(i/2)).padStart(2, '0')}:${String(i * 4 % 60).padStart(2, '0')}:00`,
        deviceName: ['校门1号闸机', '校门2号闸机', '办公楼1号闸机'][i % 3],
        deviceCode: `DEV-00${(i % 3) + 1}`,
        passMethod: ['face', 'card', 'remote'][i % 3],
        passResult: isSuccess ? 'success' : 'fail',
        failReason: !isSuccess ? ['无权限', '设备故障', '无效卡'][i % 3] : null,
        permissionId: isSuccess ? `ACCESS20240910${String(i + 1).padStart(3, '0')}` : null,
        permissionSource: isSuccess ? ['请假触发', '手动创建', '通勤默认'][i % 3] : null,
        permissionValidPeriod: isSuccess ? '2024-09-10 07:00 - 2024-09-10 18:00' : null,
        personStatus: '正常',
        logs: [
          { time: '2024-09-10 07:00:00', content: '创建通行记录' },
          { time: '2024-09-10 07:00:01', content: '权限验证通过' },
          { time: '2024-09-10 07:00:02', content: '设备开门成功' }
        ]
      })
    }

    tableData.value = mockData
    total.value = 120

    await new Promise(resolve => setTimeout(resolve, 500))
  } finally {
    loading.value = false
  }
}

// 查询
function handleSearch() {
  currentPage.value = 1
  loadData()
}

// 重置
function handleReset() {
  filterForm.personnelType = ''
  filterForm.dateRange = []
  filterForm.passResult = ''
  filterForm.deviceId = ''
  filterForm.passMethod = ''
  filterForm.keyword = ''

  // 重新设置默认时间
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  filterForm.dateRange = [
    formatDateTime(yesterday),
    formatDateTime(now)
  ]

  handleSearch()
}

// 导出
async function handleExport() {
  try {
    const result = await ElMessageBox({
      title: '导出记录',
      message: `
        <div>
          <p>导出格式：</p>
          <el-radio-group v-model="exportFormat">
            <el-radio label="excel">Excel</el-radio>
            <el-radio label="pdf">PDF</el-radio>
          </el-radio-group>
          <p style="margin-top: 10px;">导出内容：</p>
          <el-radio-group v-model="exportContent">
            <el-radio label="core">仅核心字段</el-radio>
            <el-radio label="full">含详情描述</el-radio>
          </el-radio-group>
        </div>
      `,
      dangerouslyUseHTMLString: true,
      showCancelButton: true,
      confirmButtonText: '确认',
      cancelButtonText: '取消',
    })

    if (result === 'confirm') {
      // 显示进度
      exportProgress.visible = true
      exportProgress.percentage = 0
      exportProgress.text = '导出中...'

      // 模拟导出进度
      for (let i = 0; i <= 100; i += 10) {
        exportProgress.percentage = i
        exportProgress.text = `导出中...（${i}%），预计剩余 ${10 - i/10} 秒`
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      exportProgress.text = '记录导出成功，共 120 条，点击下载'

      // 3秒后自动隐藏
      setTimeout(() => {
        exportProgress.visible = false
      }, 3000)

      ElMessage.success('导出成功')
    }
  } catch (error) {
    // 用户取消
  }
}

// 查看详情
function viewDetail(row: any) {
  currentRecord.value = row
  detailVisible.value = true
}

// 打印详情
function printDetail() {
  window.print()
  ElMessage.success('打印任务已发送')
}

// 获取通行方式标签类型
function getMethodTagType(method: string) {
  const map: Record<string, string> = {
    face: 'success',
    card: '',
    remote: 'warning'
  }
  return map[method] || 'info'
}

// 获取通行方式文本
function getMethodText(method: string) {
  const map: Record<string, string> = {
    face: '人脸打卡',
    card: '刷卡',
    remote: '远程开门'
  }
  return map[method] || method
}

// 表格行样式
function tableRowClassName({ row }: { row: any }) {
  return row.passResult === 'fail' ? 'fail-row' : ''
}

// 分页
function handleSizeChange(val: number) {
  pageSize.value = val
  loadData()
}

function handleCurrentChange(val: number) {
  currentPage.value = val
  loadData()
}
</script>

<style lang="scss" scoped>
.record-query-container {
  padding: 20px;
  background-color: #fff;
  min-height: calc(100vh - 120px);
}

// 筛选区域
.filter-section {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;

  :deep(.el-form) {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;

    .el-form-item {
      margin-bottom: 0;

      .el-date-editor {
        width: 280px !important;
      }

      .el-select {
        width: 150px;
      }

      .el-input {
        width: 220px;
      }
    }
  }
}

// 表格样式
:deep(.el-table) {
  .clickable-text {
    color: #409eff;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  .sub-text {
    font-size: 12px;
    color: #909399;
    margin-top: 2px;
  }

  .fail-reason {
    font-size: 12px;
    color: #f56c6c;
    margin-top: 4px;
  }

  .fail-row {
    background-color: #fff3cd !important;
  }
}

// 分页容器
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding-right: 20px;
}

// 详情弹窗
.detail-container {
  .fail-text {
    color: #f56c6c;
    font-weight: 500;
  }

  .operation-log {
    margin-top: 20px;

    h4 {
      margin-bottom: 10px;
      color: #303133;
      font-size: 14px;
    }
  }
}

// 导出进度
.export-progress {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  z-index: 2000;
  width: 320px;

  .progress-text {
    margin-top: 10px;
    text-align: center;
    color: #606266;
    font-size: 14px;
  }
}
</style>