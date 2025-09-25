<template>
  <div class="campaign-list-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>活动列表</h1>
        <div class="header-actions">
          <el-button type="primary" @click="createCampaign" :icon="Plus">
            创建活动
          </el-button>
          <el-button @click="exportData" :icon="Download">导出数据</el-button>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-section">
      <el-card>
        <el-form :model="filterForm" inline>
          <el-form-item label="活动名称">
            <el-input 
              v-model="filterForm.keyword" 
              placeholder="搜索活动名称或ID"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item label="活动状态">
            <el-select v-model="filterForm.status" placeholder="全部状态" clearable>
              <el-option label="全部" value="" />
              <el-option label="草稿" value="draft" />
              <el-option label="待审核" value="pending" />
              <el-option label="进行中" value="active" />
              <el-option label="已暂停" value="paused" />
              <el-option label="已完成" value="completed" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="活动类型">
            <el-select v-model="filterForm.type" placeholder="全部类型" clearable>
              <el-option label="全部" value="" />
              <el-option label="邮件营销" value="email" />
              <el-option label="短信营销" value="sms" />
              <el-option label="社媒推广" value="social" />
              <el-option label="WhatsApp" value="whatsapp" />
              <el-option label="多渠道" value="multi" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="filterForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :icon="Search">
              搜索
            </el-button>
            <el-button @click="resetFilter" :icon="RefreshLeft">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon active">
                <el-icon><Timer /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.active }}</div>
                <div class="stat-label">进行中活动</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon scheduled">
                <el-icon><Calendar /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.scheduled }}</div>
                <div class="stat-label">计划中活动</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon completed">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.completed }}</div>
                <div class="stat-label">已完成活动</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon total">
                <el-icon><DataAnalysis /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.total }}</div>
                <div class="stat-label">活动总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 活动列表 -->
    <div class="campaign-table">
      <el-card>
        <div class="table-header">
          <div class="table-title">活动列表</div>
          <div class="table-actions">
            <el-button-group>
              <el-button 
                :type="viewMode === 'table' ? 'primary' : 'default'"
                @click="viewMode = 'table'"
                :icon="List"
              >
                列表
              </el-button>
              <el-button 
                :type="viewMode === 'card' ? 'primary' : 'default'"
                @click="viewMode = 'card'"
                :icon="Grid"
              >
                卡片
              </el-button>
            </el-button-group>
          </div>
        </div>

        <!-- 表格视图 -->
        <el-table 
          v-if="viewMode === 'table'"
          :data="tableData" 
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="活动ID" width="100" />
          <el-table-column prop="name" label="活动名称" min-width="200">
            <template #default="{ row }">
              <div class="campaign-name">
                <span class="name-text">{{ row.name }}</span>
                <el-tag v-if="row.isNew" size="small" type="danger">New</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="活动类型" width="120">
            <template #default="{ row }">
              <el-tag :type="getTypeTagType(row.type)">
                {{ getTypeLabel(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)">
                {{ getStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="target" label="目标客户" width="120">
            <template #default="{ row }">
              <span>{{ row.targetCount.toLocaleString() }} 人</span>
            </template>
          </el-table-column>
          <el-table-column prop="sent" label="已发送" width="120">
            <template #default="{ row }">
              <div class="progress-cell">
                <span>{{ row.sentCount.toLocaleString() }}</span>
                <el-progress 
                  :percentage="row.sentRate" 
                  :stroke-width="4"
                  :show-text="false"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="conversion" label="转化率" width="100">
            <template #default="{ row }">
              <span :class="getConversionClass(row.conversionRate)">
                {{ row.conversionRate }}%
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="startTime" label="开始时间" width="180" />
          <el-table-column prop="endTime" label="结束时间" width="180" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button link type="primary" size="small" @click="viewDetail(row)">
                  查看
                </el-button>
                <el-button link type="primary" size="small" @click="editCampaign(row)">
                  编辑
                </el-button>
                <el-button 
                  v-if="row.status === 'active'"
                  link type="warning" size="small" 
                  @click="pauseCampaign(row)"
                >
                  暂停
                </el-button>
                <el-button 
                  v-else-if="row.status === 'paused'"
                  link type="success" size="small" 
                  @click="resumeCampaign(row)"
                >
                  恢复
                </el-button>
                <el-dropdown>
                  <el-button link type="primary" size="small">
                    更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="copyCampaign(row)">
                        <el-icon><CopyDocument /></el-icon>复制活动
                      </el-dropdown-item>
                      <el-dropdown-item @click="viewReport(row)">
                        <el-icon><DataAnalysis /></el-icon>查看报告
                      </el-dropdown-item>
                      <el-dropdown-item divided @click="deleteCampaign(row)">
                        <el-icon><Delete /></el-icon>删除活动
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 卡片视图 -->
        <div v-else class="campaign-cards">
          <el-row :gutter="20">
            <el-col 
              v-for="item in tableData" 
              :key="item.id"
              :xs="24" :sm="12" :md="8" :lg="6"
            >
              <el-card class="campaign-card">
                <div class="card-header">
                  <div class="card-title">
                    <span>{{ item.name }}</span>
                    <el-tag v-if="item.isNew" size="small" type="danger">New</el-tag>
                  </div>
                  <el-tag :type="getStatusTagType(item.status)" size="small">
                    {{ getStatusLabel(item.status) }}
                  </el-tag>
                </div>
                
                <div class="card-content">
                  <div class="info-item">
                    <span class="label">类型：</span>
                    <el-tag :type="getTypeTagType(item.type)" size="small">
                      {{ getTypeLabel(item.type) }}
                    </el-tag>
                  </div>
                  <div class="info-item">
                    <span class="label">目标客户：</span>
                    <span>{{ item.targetCount.toLocaleString() }} 人</span>
                  </div>
                  <div class="info-item">
                    <span class="label">发送进度：</span>
                    <el-progress :percentage="item.sentRate" />
                  </div>
                  <div class="info-item">
                    <span class="label">转化率：</span>
                    <span :class="getConversionClass(item.conversionRate)">
                      {{ item.conversionRate }}%
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="label">开始时间：</span>
                    <span>{{ item.startTime }}</span>
                  </div>
                </div>
                
                <div class="card-actions">
                  <el-button size="small" @click="viewDetail(item)">查看详情</el-button>
                  <el-button size="small" type="primary" @click="editCampaign(item)">
                    编辑
                  </el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- 批量操作 -->
        <div v-if="selectedRows.length > 0" class="batch-actions">
          <span>已选择 {{ selectedRows.length }} 项</span>
          <el-button size="small" @click="batchPause">批量暂停</el-button>
          <el-button size="small" @click="batchResume">批量恢复</el-button>
          <el-button size="small" type="danger" @click="batchDelete">批量删除</el-button>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrapper">
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
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, Download, Search, RefreshLeft, Timer, Calendar, 
  CircleCheck, DataAnalysis, List, Grid, ArrowDown,
  CopyDocument, Delete
} from '@element-plus/icons-vue'

const router = useRouter()

// 数据状态
const filterForm = reactive({
  keyword: '',
  status: '',
  type: '',
  dateRange: []
})

const stats = reactive({
  active: 12,
  scheduled: 8,
  completed: 156,
  total: 189
})

const viewMode = ref('table')
const selectedRows = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(85)

// 表格数据
const tableData = ref([
  {
    id: 'C202401001',
    name: '春节促销活动',
    type: 'multi',
    status: 'active',
    targetCount: 50000,
    sentCount: 35000,
    sentRate: 70,
    conversionRate: 12.5,
    startTime: '2024-01-15 09:00',
    endTime: '2024-02-15 23:59',
    isNew: true
  },
  {
    id: 'C202401002',
    name: '新品发布邮件营销',
    type: 'email',
    status: 'active',
    targetCount: 30000,
    sentCount: 28500,
    sentRate: 95,
    conversionRate: 8.3,
    startTime: '2024-01-10 10:00',
    endTime: '2024-01-31 23:59',
    isNew: false
  },
  {
    id: 'C202401003',
    name: '会员专享优惠',
    type: 'sms',
    status: 'completed',
    targetCount: 15000,
    sentCount: 15000,
    sentRate: 100,
    conversionRate: 15.6,
    startTime: '2024-01-05 09:00',
    endTime: '2024-01-12 23:59',
    isNew: false
  },
  {
    id: 'C202401004',
    name: 'Instagram品牌推广',
    type: 'social',
    status: 'paused',
    targetCount: 100000,
    sentCount: 45000,
    sentRate: 45,
    conversionRate: 6.2,
    startTime: '2024-01-08 14:00',
    endTime: '2024-02-08 23:59',
    isNew: false
  },
  {
    id: 'C202401005',
    name: 'WhatsApp客户关怀',
    type: 'whatsapp',
    status: 'active',
    targetCount: 25000,
    sentCount: 18000,
    sentRate: 72,
    conversionRate: 10.8,
    startTime: '2024-01-12 09:00',
    endTime: '2024-01-30 23:59',
    isNew: true
  },
  {
    id: 'C202401006',
    name: '情人节特惠活动',
    type: 'multi',
    status: 'draft',
    targetCount: 60000,
    sentCount: 0,
    sentRate: 0,
    conversionRate: 0,
    startTime: '2024-02-10 00:00',
    endTime: '2024-02-14 23:59',
    isNew: true
  },
  {
    id: 'C202401007',
    name: '老客户召回计划',
    type: 'email',
    status: 'pending',
    targetCount: 20000,
    sentCount: 0,
    sentRate: 0,
    conversionRate: 0,
    startTime: '2024-01-20 09:00',
    endTime: '2024-02-20 23:59',
    isNew: false
  },
  {
    id: 'C202401008',
    name: '产品满意度调研',
    type: 'email',
    status: 'completed',
    targetCount: 10000,
    sentCount: 10000,
    sentRate: 100,
    conversionRate: 25.3,
    startTime: '2023-12-25 09:00',
    endTime: '2024-01-05 23:59',
    isNew: false
  }
])

// 获取状态标签类型
const getStatusTagType = (status) => {
  const map = {
    draft: 'info',
    pending: 'warning',
    active: 'success',
    paused: 'warning',
    completed: '',
    cancelled: 'danger'
  }
  return map[status] || ''
}

// 获取状态标签文本
const getStatusLabel = (status) => {
  const map = {
    draft: '草稿',
    pending: '待审核',
    active: '进行中',
    paused: '已暂停',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || status
}

// 获取类型标签类型
const getTypeTagType = (type) => {
  const map = {
    email: '',
    sms: 'success',
    social: 'warning',
    whatsapp: 'success',
    multi: 'danger'
  }
  return map[type] || ''
}

// 获取类型标签文本
const getTypeLabel = (type) => {
  const map = {
    email: '邮件',
    sms: '短信',
    social: '社媒',
    whatsapp: 'WhatsApp',
    multi: '多渠道'
  }
  return map[type] || type
}

// 获取转化率样式类
const getConversionClass = (rate) => {
  if (rate >= 15) return 'conversion-high'
  if (rate >= 10) return 'conversion-medium'
  return 'conversion-low'
}

// 搜索
const handleSearch = () => {
  ElMessage.success('搜索活动')
}

// 重置筛选
const resetFilter = () => {
  filterForm.keyword = ''
  filterForm.status = ''
  filterForm.type = ''
  filterForm.dateRange = []
  handleSearch()
}

// 创建活动
const createCampaign = () => {
  router.push('/campaign/create')
}

// 导出数据
const exportData = () => {
  ElMessage.success('导出活动数据')
}

// 查看详情
const viewDetail = (row) => {
  ElMessage.info(`查看活动详情: ${row.name}`)
}

// 编辑活动
const editCampaign = (row) => {
  ElMessage.info(`编辑活动: ${row.name}`)
}

// 暂停活动
const pauseCampaign = (row) => {
  ElMessageBox.confirm(
    `确定要暂停活动"${row.name}"吗？`,
    '暂停活动',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    row.status = 'paused'
    ElMessage.success('活动已暂停')
  })
}

// 恢复活动
const resumeCampaign = (row) => {
  ElMessageBox.confirm(
    `确定要恢复活动"${row.name}"吗？`,
    '恢复活动',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    row.status = 'active'
    ElMessage.success('活动已恢复')
  })
}

// 复制活动
const copyCampaign = (row) => {
  ElMessage.success(`复制活动: ${row.name}`)
}

// 查看报告
const viewReport = (row) => {
  ElMessage.info(`查看活动报告: ${row.name}`)
}

// 删除活动
const deleteCampaign = (row) => {
  ElMessageBox.confirm(
    `确定要删除活动"${row.name}"吗？此操作不可恢复。`,
    '删除活动',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = tableData.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      tableData.value.splice(index, 1)
    }
    ElMessage.success('活动已删除')
  })
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 批量暂停
const batchPause = () => {
  ElMessage.success(`批量暂停 ${selectedRows.value.length} 个活动`)
}

// 批量恢复
const batchResume = () => {
  ElMessage.success(`批量恢复 ${selectedRows.value.length} 个活动`)
}

// 批量删除
const batchDelete = () => {
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedRows.value.length} 个活动吗？`,
    '批量删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('批量删除成功')
  })
}

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val
  handleSearch()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  handleSearch()
}
</script>

<style scoped lang="scss">
@use "@/assets/styles/variables.scss" as *;

.campaign-list-page {
  padding: $spacing-lg;
  background: #f5f7fa;
  min-height: 100vh;

  .page-header {
    margin-bottom: $spacing-lg;
    background: white;
    padding: $spacing-lg;
    border-radius: $border-radius-lg;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h1 {
        font-size: 24px;
        margin: 0;
      }

      .header-actions {
        display: flex;
        gap: $spacing-sm;
      }
    }
  }

  .filter-section {
    margin-bottom: $spacing-lg;

    .el-form-item {
      margin-bottom: 0;
    }
  }

  .stats-cards {
    margin-bottom: $spacing-lg;

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: $spacing-md;

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: $border-radius-lg;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;

          &.active {
            background: rgba($success-color, 0.1);
            color: $success-color;
          }

          &.scheduled {
            background: rgba($primary-color, 0.1);
            color: $primary-color;
          }

          &.completed {
            background: rgba($info-color, 0.1);
            color: $info-color;
          }

          &.total {
            background: rgba($warning-color, 0.1);
            color: $warning-color;
          }
        }

        .stat-info {
          flex: 1;

          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: $text-primary;
          }

          .stat-label {
            color: $text-secondary;
            font-size: 14px;
            margin-top: 4px;
          }
        }
      }
    }
  }

  .campaign-table {
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: $spacing-md;

      .table-title {
        font-size: 16px;
        font-weight: 500;
      }
    }

    .campaign-name {
      display: flex;
      align-items: center;
      gap: $spacing-xs;

      .name-text {
        font-weight: 500;
      }
    }

    .progress-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .conversion-high {
      color: $success-color;
      font-weight: bold;
    }

    .conversion-medium {
      color: $warning-color;
      font-weight: bold;
    }

    .conversion-low {
      color: $text-secondary;
    }

    .action-buttons {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
    }

    .campaign-cards {
      .campaign-card {
        margin-bottom: $spacing-md;

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: $spacing-md;

          .card-title {
            display: flex;
            align-items: center;
            gap: $spacing-xs;
            font-weight: 500;
            flex: 1;
          }
        }

        .card-content {
          .info-item {
            display: flex;
            align-items: center;
            margin-bottom: $spacing-sm;

            .label {
              color: $text-secondary;
              margin-right: $spacing-xs;
              min-width: 80px;
            }
          }
        }

        .card-actions {
          margin-top: $spacing-md;
          padding-top: $spacing-md;
          border-top: 1px solid $border-light;
          display: flex;
          gap: $spacing-sm;
        }
      }
    }

    .batch-actions {
      display: flex;
      align-items: center;
      gap: $spacing-md;
      padding: $spacing-md;
      background: #f5f7fa;
      border-radius: $border-radius-base;
      margin-top: $spacing-md;
    }

    .pagination-wrapper {
      margin-top: $spacing-lg;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>