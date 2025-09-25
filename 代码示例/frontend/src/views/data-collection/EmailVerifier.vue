<template>
  <div class="email-verifier">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h2>✅ 邮箱验证</h2>
          <span class="subtitle">验证邮箱地址的有效性和可投递性</span>
        </div>
        <div class="header-stats">
          <div class="stat-item">
            <span class="label">今日验证</span>
            <span class="value">{{ todayVerified }}</span>
          </div>
          <div class="stat-item">
            <span class="label">成功率</span>
            <span class="value">{{ successRate }}%</span>
          </div>
          <div class="stat-item">
            <span class="label">剩余额度</span>
            <span class="value">{{ remainingCredits }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 验证输入 -->
    <el-tabs v-model="verifyMode" class="verify-tabs">
      <el-tab-pane label="单个验证" name="single">
        <el-card>
          <div class="single-verify">
            <el-input
              v-model="singleEmail"
              placeholder="输入要验证的邮箱地址"
              size="large"
              clearable
              @keyup.enter="verifySingle"
            >
              <template #append>
                <el-button type="primary" @click="verifySingle" :loading="verifying">
                  立即验证
                </el-button>
              </template>
            </el-input>

            <!-- 单个验证结果 -->
            <div v-if="singleResult" class="single-result">
              <div class="result-status">
                <el-icon :size="48" :color="getStatusColor(singleResult.status)">
                  <CircleCheck v-if="singleResult.status === 'valid'" />
                  <CircleClose v-else-if="singleResult.status === 'invalid'" />
                  <Warning v-else />
                </el-icon>
                <div class="status-info">
                  <h3>{{ getStatusText(singleResult.status) }}</h3>
                  <p>{{ singleResult.email }}</p>
                </div>
              </div>

              <el-descriptions :column="2" border>
                <el-descriptions-item label="状态">
                  <el-tag :type="getStatusType(singleResult.status)">
                    {{ singleResult.status }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="评分">
                  <el-progress
                    :percentage="singleResult.score"
                    :color="getScoreColor(singleResult.score)"
                  />
                </el-descriptions-item>
                <el-descriptions-item label="格式检查">
                  <el-icon v-if="singleResult.regexp" color="#67c23a"><Check /></el-icon>
                  <el-icon v-else color="#f56c6c"><Close /></el-icon>
                  {{ singleResult.regexp ? '有效' : '无效' }}
                </el-descriptions-item>
                <el-descriptions-item label="MX记录">
                  <el-icon v-if="singleResult.mx_records" color="#67c23a"><Check /></el-icon>
                  <el-icon v-else color="#f56c6c"><Close /></el-icon>
                  {{ singleResult.mx_records ? '存在' : '不存在' }}
                </el-descriptions-item>
                <el-descriptions-item label="SMTP检查">
                  <el-icon v-if="singleResult.smtp_check" color="#67c23a"><Check /></el-icon>
                  <el-icon v-else color="#f56c6c"><Close /></el-icon>
                  {{ singleResult.smtp_check ? '通过' : '未通过' }}
                </el-descriptions-item>
                <el-descriptions-item label="是否为Webmail">
                  {{ singleResult.webmail ? '是' : '否' }}
                </el-descriptions-item>
                <el-descriptions-item label="一次性邮箱">
                  {{ singleResult.disposable ? '是' : '否' }}
                </el-descriptions-item>
                <el-descriptions-item label="接收所有邮件">
                  {{ singleResult.accept_all ? '是' : '否' }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="批量验证" name="batch">
        <el-card>
          <div class="batch-verify">
            <el-upload
              class="upload-area"
              drag
              action="#"
              :before-upload="handleFileUpload"
              accept=".txt,.csv,.xlsx"
            >
              <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
              <div class="el-upload__text">
                拖拽文件到此处或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  支持 TXT/CSV/Excel 文件，每行一个邮箱地址，最多1000个
                </div>
              </template>
            </el-upload>

            <div class="or-divider">或者</div>

            <el-input
              v-model="batchEmails"
              type="textarea"
              :rows="8"
              placeholder="直接粘贴邮箱地址，每行一个"
            />

            <div class="batch-actions">
              <div class="batch-info">
                已输入 <strong>{{ emailCount }}</strong> 个邮箱
              </div>
              <el-button type="primary" @click="verifyBatch" :disabled="emailCount === 0">
                开始批量验证
              </el-button>
            </div>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 批量验证结果 -->
    <el-card v-if="batchResults.length > 0" class="results-card">
      <template #header>
        <div class="results-header">
          <span>验证结果</span>
          <div class="results-summary">
            <el-tag type="success">有效: {{ validCount }}</el-tag>
            <el-tag type="danger">无效: {{ invalidCount }}</el-tag>
            <el-tag type="warning">风险: {{ riskyCount }}</el-tag>
            <el-tag>未知: {{ unknownCount }}</el-tag>
          </div>
          <el-button-group>
            <el-button size="small" @click="exportResults">导出结果</el-button>
            <el-button size="small" @click="filterResults">筛选</el-button>
          </el-button-group>
        </div>
      </template>

      <el-table :data="batchResults" style="width: 100%">
        <el-table-column prop="email" label="邮箱地址" min-width="200" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="评分" width="120">
          <template #default="{ row }">
            <el-progress
              :percentage="row.score"
              :stroke-width="6"
              :color="getScoreColor(row.score)"
            />
          </template>
        </el-table-column>
        <el-table-column label="详细信息" width="300">
          <template #default="{ row }">
            <div class="detail-tags">
              <el-tag v-if="row.regexp" size="small" type="success">格式有效</el-tag>
              <el-tag v-if="row.mx_records" size="small" type="success">MX记录</el-tag>
              <el-tag v-if="row.smtp_check" size="small" type="success">SMTP通过</el-tag>
              <el-tag v-if="row.webmail" size="small">Webmail</el-tag>
              <el-tag v-if="row.disposable" size="small" type="warning">一次性</el-tag>
              <el-tag v-if="row.accept_all" size="small" type="warning">接收所有</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button size="small" text @click="viewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[20, 50, 100]"
          :total="batchResults.length"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>

    <!-- 验证进度对话框 -->
    <el-dialog
      v-model="progressVisible"
      title="批量验证进度"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="progress-content">
        <el-progress :percentage="verifyProgress" :status="progressStatus" />
        <div class="progress-info">
          正在验证第 {{ currentVerifying }} / {{ totalToVerify }} 个邮箱
        </div>
        <div class="current-email">
          {{ currentEmail }}
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  CircleCheck,
  CircleClose,
  Warning,
  Check,
  Close,
  UploadFilled
} from '@element-plus/icons-vue'

// 数据状态
const verifyMode = ref('single')
const singleEmail = ref('')
const batchEmails = ref('')
const verifying = ref(false)
const singleResult = ref(null)
const batchResults = ref([])
const currentPage = ref(1)
const pageSize = ref(20)

// 统计数据
const todayVerified = ref(126)
const successRate = ref(87.5)
const remainingCredits = ref(874)

// 进度相关
const progressVisible = ref(false)
const verifyProgress = ref(0)
const progressStatus = ref('')
const currentVerifying = ref(0)
const totalToVerify = ref(0)
const currentEmail = ref('')

// 计算属性
const emailCount = computed(() => {
  return batchEmails.value.split('\n').filter(e => e.trim()).length
})

const validCount = computed(() => {
  return batchResults.value.filter(r => r.status === 'valid').length
})

const invalidCount = computed(() => {
  return batchResults.value.filter(r => r.status === 'invalid').length
})

const riskyCount = computed(() => {
  return batchResults.value.filter(r => ['accept_all', 'webmail', 'disposable'].includes(r.status)).length
})

const unknownCount = computed(() => {
  return batchResults.value.filter(r => r.status === 'unknown').length
})

// 单个验证
const verifySingle = async () => {
  if (!singleEmail.value) {
    ElMessage.warning('请输入邮箱地址')
    return
  }

  verifying.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))

    singleResult.value = {
      email: singleEmail.value,
      status: 'valid',
      result: 'deliverable',
      score: 95,
      regexp: true,
      gibberish: false,
      disposable: false,
      webmail: false,
      mx_records: true,
      smtp_server: true,
      smtp_check: true,
      accept_all: false,
      block: false
    }

    ElMessage.success('验证完成')
  } catch (error) {
    ElMessage.error('验证失败，请重试')
  } finally {
    verifying.value = false
  }
}

// 批量验证
const verifyBatch = async () => {
  const emails = batchEmails.value.split('\n').filter(e => e.trim())
  if (emails.length === 0) {
    ElMessage.warning('请输入邮箱地址')
    return
  }

  progressVisible.value = true
  verifyProgress.value = 0
  currentVerifying.value = 0
  totalToVerify.value = emails.length
  batchResults.value = []

  for (let i = 0; i < emails.length; i++) {
    currentVerifying.value = i + 1
    currentEmail.value = emails[i]
    verifyProgress.value = Math.round(((i + 1) / emails.length) * 100)

    // 模拟验证
    await new Promise(resolve => setTimeout(resolve, 200))

    const statuses = ['valid', 'invalid', 'accept_all', 'unknown']
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]

    batchResults.value.push({
      email: emails[i],
      status: randomStatus,
      score: randomStatus === 'valid' ? 90 + Math.random() * 10 : Math.random() * 60,
      regexp: true,
      mx_records: randomStatus !== 'invalid',
      smtp_check: randomStatus === 'valid',
      webmail: Math.random() > 0.7,
      disposable: Math.random() > 0.9,
      accept_all: randomStatus === 'accept_all'
    })
  }

  progressStatus.value = 'success'
  setTimeout(() => {
    progressVisible.value = false
    ElMessage.success(`批量验证完成，共验证 ${emails.length} 个邮箱`)
  }, 500)
}

// 文件上传
const handleFileUpload = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    batchEmails.value = e.target.result
    ElMessage.success('文件上传成功')
  }
  reader.readAsText(file)
  return false
}

// 导出结果
const exportResults = async () => {
  const format = await ElMessageBox.prompt('请选择导出格式', '导出验证结果', {
    confirmButtonText: '导出',
    cancelButtonText: '取消',
    inputPattern: /csv|xlsx|json/,
    inputPlaceholder: '输入: csv, xlsx 或 json',
    inputErrorMessage: '格式无效'
  })

  ElMessage.success(`正在导出为 ${format.value} 格式...`)
}

// 筛选结果
const filterResults = () => {
  ElMessage.info('打开筛选面板')
}

// 查看详情
const viewDetail = (row) => {
  singleResult.value = row
  verifyMode.value = 'single'
  singleEmail.value = row.email
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colors = {
    valid: '#67c23a',
    invalid: '#f56c6c',
    accept_all: '#e6a23c',
    unknown: '#909399',
    webmail: '#409eff',
    disposable: '#e6a23c'
  }
  return colors[status] || '#909399'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    valid: '邮箱有效',
    invalid: '邮箱无效',
    accept_all: '接收所有邮件',
    unknown: '无法确定',
    webmail: 'Webmail邮箱',
    disposable: '一次性邮箱'
  }
  return texts[status] || '未知状态'
}

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    valid: 'success',
    invalid: 'danger',
    accept_all: 'warning',
    unknown: 'info',
    webmail: 'primary',
    disposable: 'warning'
  }
  return types[status] || 'info'
}

// 获取分数颜色
const getScoreColor = (score) => {
  if (score >= 80) return '#67c23a'
  if (score >= 60) return '#e6a23c'
  return '#f56c6c'
}
</script>

<style lang="scss" scoped>
.email-verifier {
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
        gap: 32px;
        padding: 16px 24px;
        background: #f5f7fa;
        border-radius: 8px;

        .stat-item {
          text-align: center;

          .label {
            display: block;
            font-size: 12px;
            color: #909399;
            margin-bottom: 4px;
          }

          .value {
            font-size: 20px;
            font-weight: 600;
            color: #303133;
          }
        }
      }
    }
  }

  .verify-tabs {
    margin-bottom: 24px;

    .single-verify {
      .single-result {
        margin-top: 24px;

        .result-status {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 24px;
          background: #f5f7fa;
          border-radius: 8px;
          margin-bottom: 24px;

          .status-info {
            h3 {
              margin: 0 0 8px 0;
              font-size: 20px;
              color: #303133;
            }

            p {
              margin: 0;
              color: #606266;
              font-family: 'Courier New', monospace;
            }
          }
        }
      }
    }

    .batch-verify {
      .upload-area {
        margin-bottom: 24px;
      }

      .or-divider {
        text-align: center;
        margin: 20px 0;
        color: #909399;
        position: relative;

        &::before,
        &::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 45%;
          height: 1px;
          background: #dcdfe6;
        }

        &::before {
          left: 0;
        }

        &::after {
          right: 0;
        }
      }

      .batch-actions {
        margin-top: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .batch-info {
          color: #606266;

          strong {
            color: $primary-color;
            font-size: 18px;
          }
        }
      }
    }
  }

  .results-card {
    .results-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;

      .results-summary {
        flex: 1;
        display: flex;
        gap: 8px;
      }
    }

    .detail-tags {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }

    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }
  }

  .progress-content {
    text-align: center;

    .progress-info {
      margin: 16px 0 8px;
      color: #606266;
    }

    .current-email {
      color: #909399;
      font-family: 'Courier New', monospace;
    }
  }
}
</style>