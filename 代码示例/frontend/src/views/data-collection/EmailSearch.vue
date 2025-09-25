<template>
  <div class="email-search">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h2>📧 邮箱搜索</h2>
          <span class="subtitle">根据公司域名批量获取该公司的邮箱地址</span>
        </div>
        <div class="header-stats">
          <el-statistic title="本月搜索" :value="monthlySearches" />
          <el-divider direction="vertical" />
          <el-statistic title="找到邮箱" :value="totalEmailsFound" />
          <el-divider direction="vertical" />
          <el-statistic title="剩余额度" :value="remainingCredits" suffix="次" />
        </div>
      </div>
    </div>

    <!-- 搜索输入区 -->
    <el-card class="search-card">
      <div class="search-input-section">
        <el-tabs v-model="searchMode">
          <el-tab-pane label="单个域名搜索" name="single">
            <div class="single-search">
              <el-input
                v-model="singleDomain"
                placeholder="输入公司域名，如: stripe.com"
                size="large"
                clearable
                @keyup.enter="handleSingleSearch"
              >
                <template #append>
                  <el-button type="primary" @click="handleSingleSearch">
                    搜索邮箱
                  </el-button>
                </template>
              </el-input>
            </div>
          </el-tab-pane>

          <el-tab-pane label="批量域名搜索" name="batch">
            <div class="batch-search">
              <el-input
                v-model="batchDomains"
                type="textarea"
                :rows="5"
                placeholder="每行输入一个域名，如：&#10;stripe.com&#10;shopify.com&#10;slack.com"
              />
              <div class="batch-actions">
                <el-upload
                  :show-file-list="false"
                  :before-upload="handleFileUpload"
                  accept=".txt,.csv"
                >
                  <el-button icon="Upload">上传文件</el-button>
                </el-upload>
                <span class="batch-count">已输入 {{ batchDomainsCount }} 个域名</span>
                <el-button type="primary" @click="handleBatchSearch">
                  批量搜索
                </el-button>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>

        <!-- 高级筛选 -->
        <el-collapse v-model="activeCollapse" class="filter-collapse">
          <el-collapse-item title="高级筛选" name="filters">
            <el-form :model="filterOptions" label-width="100px">
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="邮箱类型">
                    <el-select v-model="filterOptions.type" placeholder="全部">
                      <el-option label="全部" value="" />
                      <el-option label="个人邮箱" value="personal" />
                      <el-option label="通用邮箱" value="generic" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="部门">
                    <el-select v-model="filterOptions.department" multiple placeholder="全部部门">
                      <el-option label="管理层" value="executive" />
                      <el-option label="销售" value="sales" />
                      <el-option label="市场" value="marketing" />
                      <el-option label="技术" value="it" />
                      <el-option label="人力资源" value="hr" />
                      <el-option label="财务" value="finance" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="职级">
                    <el-select v-model="filterOptions.seniority" multiple placeholder="全部职级">
                      <el-option label="高管" value="executive" />
                      <el-option label="高级" value="senior" />
                      <el-option label="初级" value="junior" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="置信度">
                    <el-slider
                      v-model="filterOptions.confidence"
                      :min="0"
                      :max="100"
                      :marks="{ 0: '0%', 50: '50%', 100: '100%' }"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="必填字段">
                    <el-checkbox-group v-model="filterOptions.requiredFields">
                      <el-checkbox label="full_name">完整姓名</el-checkbox>
                      <el-checkbox label="position">职位</el-checkbox>
                      <el-checkbox label="phone">电话</el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-card>

    <!-- 搜索结果 -->
    <div class="results-section" v-show="searchResults.length > 0">
      <el-card>
        <template #header>
          <div class="results-header">
            <div class="results-title">
              <span>搜索结果</span>
              <el-tag type="success">找到 {{ totalResults }} 个邮箱</el-tag>
            </div>
            <div class="results-actions">
              <el-button size="small" icon="Filter" @click="showFilterDialog = true">
                筛选
              </el-button>
              <el-button size="small" icon="Download" @click="exportResults">
                导出
              </el-button>
              <el-button size="small" icon="Check" type="primary" @click="verifyEmails">
                验证邮箱
              </el-button>
            </div>
          </div>
        </template>

        <el-table
          :data="searchResults"
          v-loading="loading"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="50" />
          <el-table-column prop="email" label="邮箱地址" min-width="200">
            <template #default="{ row }">
              <div class="email-cell">
                <span class="email">{{ row.email }}</span>
                <el-button size="small" text icon="CopyDocument" @click="copyEmail(row.email)" />
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="姓名" width="150">
            <template #default="{ row }">
              <div v-if="row.firstName || row.lastName">
                {{ row.firstName }} {{ row.lastName }}
              </div>
              <span v-else class="unknown">未知</span>
            </template>
          </el-table-column>
          <el-table-column prop="position" label="职位" width="180">
            <template #default="{ row }">
              <span v-if="row.position">{{ row.position }}</span>
              <span v-else class="unknown">未知</span>
            </template>
          </el-table-column>
          <el-table-column prop="department" label="部门" width="120">
            <template #default="{ row }">
              <el-tag v-if="row.department" size="small">
                {{ departmentMap[row.department] || row.department }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="confidence" label="置信度" width="120">
            <template #default="{ row }">
              <div class="confidence">
                <el-progress
                  :percentage="row.confidence"
                  :stroke-width="6"
                  :color="getConfidenceColor(row.confidence)"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag :type="row.type === 'personal' ? 'primary' : 'info'" size="small">
                {{ row.type === 'personal' ? '个人' : '通用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="sources" label="来源" width="100">
            <template #default="{ row }">
              <el-button
                size="small"
                text
                @click="showSources(row)"
              >
                {{ row.sources?.length || 0 }} 个
              </el-button>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button size="small" text icon="User" @click="enrichPerson(row)">
                丰富信息
              </el-button>
              <el-button size="small" text icon="Check" @click="verifySingle(row)">
                验证
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[20, 50, 100]"
            :total="totalResults"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 来源对话框 -->
    <el-dialog v-model="sourceDialogVisible" title="邮箱来源" width="600px">
      <el-timeline>
        <el-timeline-item
          v-for="(source, index) in currentSources"
          :key="index"
          :timestamp="source.extracted_on"
        >
          <div class="source-item">
            <a :href="source.uri" target="_blank">{{ source.domain }}</a>
            <div class="source-meta">
              最后更新: {{ source.last_seen_on }}
            </div>
          </div>
        </el-timeline-item>
      </el-timeline>
    </el-dialog>

    <!-- 批量操作状态 -->
    <el-dialog v-model="batchProgressVisible" title="批量搜索进度" width="600px" :close-on-click-modal="false">
      <div class="batch-progress">
        <el-progress :percentage="batchProgress" :status="batchStatus">
          <span>{{ batchProcessed }} / {{ batchTotal }}</span>
        </el-progress>
        <div class="progress-details">
          <div v-for="domain in batchDomainsList" :key="domain" class="domain-status">
            <span>{{ domain }}</span>
            <el-icon v-if="domainStatus[domain] === 'success'" color="#67c23a"><CircleCheck /></el-icon>
            <el-icon v-else-if="domainStatus[domain] === 'error'" color="#f56c6c"><CircleClose /></el-icon>
            <el-icon v-else-if="domainStatus[domain] === 'processing'" color="#409eff" class="is-loading">
              <Loading />
            </el-icon>
            <el-icon v-else color="#909399"><Remove /></el-icon>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CopyDocument, CircleCheck, CircleClose, Loading, Remove } from '@element-plus/icons-vue'

// 数据状态
const loading = ref(false)
const searchMode = ref('single')
const singleDomain = ref('')
const batchDomains = ref('')
const searchResults = ref([])
const selectedEmails = ref([])
const totalResults = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const activeCollapse = ref([])

// 统计数据
const monthlySearches = ref(256)
const totalEmailsFound = ref(3420)
const remainingCredits = ref(744)

// 筛选选项
const filterOptions = reactive({
  type: '',
  department: [],
  seniority: [],
  confidence: 50,
  requiredFields: []
})

// 批量搜索相关
const batchProgressVisible = ref(false)
const batchProgress = ref(0)
const batchStatus = ref('')
const batchProcessed = ref(0)
const batchTotal = ref(0)
const domainStatus = ref({})

// 对话框
const sourceDialogVisible = ref(false)
const currentSources = ref([])
const showFilterDialog = ref(false)

// 部门映射
const departmentMap = {
  executive: '管理层',
  sales: '销售',
  marketing: '市场',
  it: '技术',
  hr: '人力资源',
  finance: '财务',
  support: '客服',
  legal: '法务'
}

// 计算属性
const batchDomainsCount = computed(() => {
  return batchDomains.value.split('\n').filter(d => d.trim()).length
})

const batchDomainsList = computed(() => {
  return batchDomains.value.split('\n').filter(d => d.trim())
})

// 单个搜索
const handleSingleSearch = async () => {
  if (!singleDomain.value) {
    ElMessage.warning('请输入域名')
    return
  }

  loading.value = true
  try {
    // 调用API搜索
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 模拟数据
    searchResults.value = [
      {
        email: 'john.smith@' + singleDomain.value,
        firstName: 'John',
        lastName: 'Smith',
        position: 'CEO',
        department: 'executive',
        confidence: 95,
        type: 'personal',
        sources: [
          { domain: 'linkedin.com', uri: 'https://linkedin.com/in/johnsmith', extracted_on: '2024-01-15', last_seen_on: '2024-01-20' }
        ]
      },
      {
        email: 'sarah.jones@' + singleDomain.value,
        firstName: 'Sarah',
        lastName: 'Jones',
        position: 'Marketing Director',
        department: 'marketing',
        confidence: 88,
        type: 'personal',
        sources: []
      },
      {
        email: 'contact@' + singleDomain.value,
        firstName: '',
        lastName: '',
        position: '',
        department: '',
        confidence: 100,
        type: 'generic',
        sources: []
      }
    ]
    totalResults.value = searchResults.value.length
    ElMessage.success(`找到 ${totalResults.value} 个邮箱地址`)
  } catch (error) {
    ElMessage.error('搜索失败，请重试')
  } finally {
    loading.value = false
  }
}

// 批量搜索
const handleBatchSearch = async () => {
  const domains = batchDomainsList.value
  if (domains.length === 0) {
    ElMessage.warning('请输入至少一个域名')
    return
  }

  if (domains.length > 50) {
    ElMessage.warning('批量搜索最多支持50个域名')
    return
  }

  batchProgressVisible.value = true
  batchProgress.value = 0
  batchProcessed.value = 0
  batchTotal.value = domains.length
  domainStatus.value = {}

  for (let i = 0; i < domains.length; i++) {
    const domain = domains[i]
    domainStatus.value[domain] = 'processing'

    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      domainStatus.value[domain] = 'success'
      batchProcessed.value++
      batchProgress.value = Math.round((batchProcessed.value / batchTotal.value) * 100)
    } catch (error) {
      domainStatus.value[domain] = 'error'
      batchProcessed.value++
      batchProgress.value = Math.round((batchProcessed.value / batchTotal.value) * 100)
    }
  }

  batchStatus.value = 'success'
  ElMessage.success(`批量搜索完成，成功处理 ${batchProcessed.value} 个域名`)
}

// 文件上传
const handleFileUpload = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    batchDomains.value = e.target.result
    ElMessage.success('文件上传成功')
  }
  reader.readAsText(file)
  return false
}

// 复制邮箱
const copyEmail = (email) => {
  navigator.clipboard.writeText(email)
  ElMessage.success('邮箱已复制到剪贴板')
}

// 显示来源
const showSources = (row) => {
  currentSources.value = row.sources || []
  sourceDialogVisible.value = true
}

// 丰富个人信息
const enrichPerson = (row) => {
  ElMessage.info('即将跳转到信息丰富化页面')
}

// 验证单个邮箱
const verifySingle = (row) => {
  ElMessage.info('正在验证邮箱: ' + row.email)
}

// 批量验证邮箱
const verifyEmails = () => {
  if (selectedEmails.value.length === 0) {
    ElMessage.warning('请先选择要验证的邮箱')
    return
  }
  ElMessage.info('即将跳转到邮箱验证页面')
}

// 导出结果
const exportResults = async () => {
  const format = await ElMessageBox.prompt('请选择导出格式', '导出数据', {
    confirmButtonText: '导出',
    cancelButtonText: '取消',
    inputPattern: /csv|xlsx|json/,
    inputPlaceholder: '输入: csv, xlsx 或 json',
    inputErrorMessage: '格式无效'
  })

  ElMessage.success(`正在导出为 ${format.value} 格式...`)
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedEmails.value = selection
}

// 获取置信度颜色
const getConfidenceColor = (confidence) => {
  if (confidence >= 80) return '#67c23a'
  if (confidence >= 60) return '#e6a23c'
  return '#f56c6c'
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
}

const handlePageChange = (val) => {
  currentPage.value = val
}
</script>

<style lang="scss" scoped>
.email-search {
  padding: 20px;

  .page-header {
    margin-bottom: 24px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      .title-section {
        h2 {
          font-size: 24px;
          margin: 0 0 8px 0;
          color: #303133;
        }

        .subtitle {
          color: #909399;
          font-size: 14px;
        }
      }

      .header-stats {
        display: flex;
        gap: 24px;
        padding: 12px 24px;
        background: #f5f7fa;
        border-radius: 8px;

        :deep(.el-statistic) {
          text-align: center;

          .el-statistic__head {
            font-size: 12px;
            color: #909399;
          }

          .el-statistic__content {
            font-size: 20px;
          }
        }
      }
    }
  }

  .search-card {
    margin-bottom: 24px;

    .single-search {
      padding: 20px 0;
    }

    .batch-search {
      padding: 20px 0;

      .batch-actions {
        margin-top: 16px;
        display: flex;
        align-items: center;
        gap: 12px;

        .batch-count {
          flex: 1;
          color: #909399;
          font-size: 14px;
        }
      }
    }

    .filter-collapse {
      margin-top: 20px;
      border: none;

      :deep(.el-collapse-item__header) {
        background: #f5f7fa;
        padding: 0 16px;
        border-radius: 4px;
      }

      :deep(.el-collapse-item__content) {
        padding-top: 20px;
      }
    }
  }

  .results-section {
    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .results-title {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 16px;
        font-weight: 500;
      }

      .results-actions {
        display: flex;
        gap: 8px;
      }
    }

    .email-cell {
      display: flex;
      align-items: center;
      gap: 8px;

      .email {
        font-family: 'Courier New', monospace;
        color: $primary-color;
      }
    }

    .unknown {
      color: #c0c4cc;
      font-style: italic;
    }

    .confidence {
      width: 100%;
    }

    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }
  }

  .source-item {
    a {
      color: $primary-color;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    .source-meta {
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
    }
  }

  .batch-progress {
    .progress-details {
      margin-top: 20px;
      max-height: 300px;
      overflow-y: auto;

      .domain-status {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        border-bottom: 1px solid #ebeef5;

        &:last-child {
          border-bottom: none;
        }

        .is-loading {
          animation: rotating 2s linear infinite;
        }
      }
    }
  }

  @keyframes rotating {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
}
</style>