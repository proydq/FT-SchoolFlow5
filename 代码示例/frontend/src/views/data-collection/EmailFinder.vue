<template>
  <div class="email-finder">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h2>🔍 精准查找</h2>
          <span class="subtitle">通过姓名+公司精确查找特定人员的邮箱</span>
        </div>
        <div class="quick-templates">
          <el-button
            v-for="template in quickTemplates"
            :key="template.title"
            size="small"
            @click="useTemplate(template)"
          >
            {{ template.title }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 查找表单 -->
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card class="finder-card">
          <template #header>
            <span>查找参数</span>
          </template>

          <el-form
            ref="finderFormRef"
            :model="finderForm"
            :rules="finderRules"
            label-width="100px"
          >
            <el-form-item label="公司信息">
              <el-radio-group v-model="companyInputType" style="margin-bottom: 12px;">
                <el-radio label="domain">使用域名</el-radio>
                <el-radio label="name">使用公司名</el-radio>
              </el-radio-group>
              <el-input
                v-if="companyInputType === 'domain'"
                v-model="finderForm.domain"
                placeholder="输入公司域名，如: stripe.com"
                clearable
              />
              <el-input
                v-else
                v-model="finderForm.company"
                placeholder="输入公司名称，如: Stripe"
                clearable
              />
            </el-form-item>

            <el-form-item label="人员姓名">
              <el-radio-group v-model="nameInputType" style="margin-bottom: 12px;">
                <el-radio label="separate">分别输入</el-radio>
                <el-radio label="full">完整姓名</el-radio>
              </el-radio-group>
              <div v-if="nameInputType === 'separate'" class="name-inputs">
                <el-input
                  v-model="finderForm.firstName"
                  placeholder="名字 (First Name)"
                  style="width: 48%"
                />
                <el-input
                  v-model="finderForm.lastName"
                  placeholder="姓氏 (Last Name)"
                  style="width: 48%"
                />
              </div>
              <el-input
                v-else
                v-model="finderForm.fullName"
                placeholder="输入完整姓名，如: John Smith"
              />
            </el-form-item>

            <el-form-item label="查找时长">
              <el-slider
                v-model="finderForm.maxDuration"
                :min="3"
                :max="20"
                :marks="{ 3: '3秒', 10: '10秒', 20: '20秒' }"
                show-input
              />
              <div class="tip">更长的查找时间可以提供更准确的结果</div>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleFind" :loading="finding">
                开始查找
              </el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>

          <!-- 批量查找 -->
          <el-divider />
          <div class="batch-section">
            <h4>批量查找</h4>
            <el-upload
              class="upload-demo"
              drag
              action="#"
              :before-upload="handleBatchUpload"
              accept=".csv,.xlsx"
            >
              <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
              <div class="el-upload__text">
                拖拽CSV/Excel文件到此处或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  文件格式：域名,名字,姓氏 或 公司名,完整姓名
                </div>
              </template>
            </el-upload>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <!-- 查找结果 -->
        <el-card class="result-card" v-if="findResult">
          <template #header>
            <div class="result-header">
              <span>查找结果</span>
              <el-tag :type="findResult.email ? 'success' : 'warning'">
                {{ findResult.email ? '找到邮箱' : '未找到' }}
              </el-tag>
            </div>
          </template>

          <div class="result-content" v-if="findResult.email">
            <div class="email-display">
              <el-icon><Message /></el-icon>
              <span class="email">{{ findResult.email }}</span>
              <el-button
                size="small"
                text
                icon="CopyDocument"
                @click="copyEmail(findResult.email)"
              />
            </div>

            <el-descriptions :column="1" size="small">
              <el-descriptions-item label="置信度">
                <el-progress
                  :percentage="findResult.score"
                  :color="getScoreColor(findResult.score)"
                />
              </el-descriptions-item>
              <el-descriptions-item label="姓名">
                {{ findResult.firstName }} {{ findResult.lastName }}
              </el-descriptions-item>
              <el-descriptions-item label="职位" v-if="findResult.position">
                {{ findResult.position }}
              </el-descriptions-item>
              <el-descriptions-item label="部门" v-if="findResult.department">
                {{ findResult.department }}
              </el-descriptions-item>
              <el-descriptions-item label="验证状态" v-if="findResult.verification">
                <el-tag :type="getVerificationTagType(findResult.verification.status)">
                  {{ findResult.verification.status }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>

            <div class="result-actions">
              <el-button size="small" @click="verifyEmail(findResult)">
                验证邮箱
              </el-button>
              <el-button size="small" @click="enrichInfo(findResult)">
                丰富信息
              </el-button>
              <el-button size="small" type="primary" @click="saveToList(findResult)">
                保存到列表
              </el-button>
            </div>
          </div>

          <el-empty v-else description="未找到匹配的邮箱地址">
            <el-button size="small" @click="tryAlternatives">
              尝试其他方法
            </el-button>
          </el-empty>
        </el-card>

        <!-- 查找历史 -->
        <el-card class="history-card">
          <template #header>
            <div class="history-header">
              <span>最近查找</span>
              <el-button text size="small" @click="clearHistory">清空</el-button>
            </div>
          </template>

          <div class="history-list">
            <div
              v-for="item in searchHistory"
              :key="item.id"
              class="history-item"
              @click="useHistory(item)"
            >
              <div class="history-info">
                <div class="person">{{ item.name }}</div>
                <div class="company">{{ item.company }}</div>
              </div>
              <el-icon v-if="item.found" color="#67c23a"><CircleCheck /></el-icon>
              <el-icon v-else color="#f56c6c"><CircleClose /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 关键人员快速查找 -->
    <el-card class="key-persons-card">
      <template #header>
        <span>关键人员快速查找</span>
      </template>

      <el-tabs v-model="keyPersonTab">
        <el-tab-pane label="C-Level高管" name="clevel">
          <div class="person-grid">
            <div
              v-for="role in cLevelRoles"
              :key="role.code"
              class="person-card"
              @click="findByRole(role)"
            >
              <el-icon :size="24"><User /></el-icon>
              <div class="role-name">{{ role.name }}</div>
              <div class="role-code">{{ role.code }}</div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="部门负责人" name="department">
          <div class="person-grid">
            <div
              v-for="dept in departmentHeads"
              :key="dept.code"
              class="person-card"
              @click="findByDepartment(dept)"
            >
              <el-icon :size="24"><UserFilled /></el-icon>
              <div class="role-name">{{ dept.name }}</div>
              <div class="role-code">{{ dept.title }}</div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="技术团队" name="tech">
          <div class="person-grid">
            <div
              v-for="tech in techRoles"
              :key="tech.code"
              class="person-card"
              @click="findByRole(tech)"
            >
              <el-icon :size="24"><Monitor /></el-icon>
              <div class="role-name">{{ tech.name }}</div>
              <div class="role-code">{{ tech.code }}</div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Message,
  CopyDocument,
  CircleCheck,
  CircleClose,
  User,
  UserFilled,
  Monitor,
  UploadFilled
} from '@element-plus/icons-vue'

// 表单数据
const finderFormRef = ref()
const finderForm = reactive({
  domain: '',
  company: '',
  firstName: '',
  lastName: '',
  fullName: '',
  maxDuration: 10
})

// 表单验证规则
const finderRules = {
  // 动态验证规则
}

// 状态数据
const finding = ref(false)
const companyInputType = ref('domain')
const nameInputType = ref('separate')
const findResult = ref(null)
const keyPersonTab = ref('clevel')

// 查找历史
const searchHistory = ref([
  {
    id: 1,
    name: 'John Smith',
    company: 'stripe.com',
    found: true,
    email: 'john.smith@stripe.com'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    company: 'shopify.com',
    found: true,
    email: 'sarah.j@shopify.com'
  },
  {
    id: 3,
    name: 'Michael Chen',
    company: 'tesla.com',
    found: false
  }
])

// 快速模板
const quickTemplates = [
  { title: 'CEO查找', role: 'CEO', firstName: '', lastName: '' },
  { title: 'CTO查找', role: 'CTO', firstName: '', lastName: '' },
  { title: '销售负责人', role: 'Sales Director', firstName: '', lastName: '' },
  { title: '市场负责人', role: 'Marketing Director', firstName: '', lastName: '' }
]

// C-Level角色
const cLevelRoles = [
  { code: 'CEO', name: '首席执行官' },
  { code: 'CTO', name: '首席技术官' },
  { code: 'CFO', name: '首席财务官' },
  { code: 'COO', name: '首席运营官' },
  { code: 'CMO', name: '首席营销官' },
  { code: 'CPO', name: '首席产品官' }
]

// 部门负责人
const departmentHeads = [
  { code: 'sales', name: '销售部', title: 'Sales Director' },
  { code: 'marketing', name: '市场部', title: 'Marketing Director' },
  { code: 'hr', name: '人力资源', title: 'HR Director' },
  { code: 'finance', name: '财务部', title: 'Finance Director' },
  { code: 'operations', name: '运营部', title: 'Operations Director' },
  { code: 'legal', name: '法务部', title: 'Legal Director' }
]

// 技术团队
const techRoles = [
  { code: 'Engineering Manager', name: '工程经理' },
  { code: 'DevOps Engineer', name: 'DevOps工程师' },
  { code: 'Data Scientist', name: '数据科学家' },
  { code: 'Product Manager', name: '产品经理' },
  { code: 'QA Lead', name: '测试负责人' },
  { code: 'Security Engineer', name: '安全工程师' }
]

// 开始查找
const handleFind = async () => {
  finding.value = true

  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 模拟结果
    findResult.value = {
      email: 'john.smith@stripe.com',
      firstName: 'John',
      lastName: 'Smith',
      position: 'Chief Technology Officer',
      department: 'Engineering',
      score: 95,
      verification: {
        status: 'valid',
        score: 100
      },
      sources: [
        { domain: 'linkedin.com', uri: 'https://linkedin.com/in/johnsmith' }
      ]
    }

    // 添加到历史
    searchHistory.value.unshift({
      id: Date.now(),
      name: `${finderForm.firstName} ${finderForm.lastName}`,
      company: finderForm.domain || finderForm.company,
      found: true,
      email: findResult.value.email
    })

    ElMessage.success('查找成功！')
  } catch (error) {
    ElMessage.error('查找失败，请重试')
    findResult.value = { email: null }
  } finally {
    finding.value = false
  }
}

// 重置表单
const resetForm = () => {
  finderFormRef.value?.resetFields()
  findResult.value = null
}

// 使用模板
const useTemplate = (template) => {
  finderForm.firstName = template.firstName
  finderForm.lastName = template.lastName
  ElMessage.success(`已应用${template.title}模板`)
}

// 使用历史记录
const useHistory = (item) => {
  finderForm.domain = item.company
  const names = item.name.split(' ')
  finderForm.firstName = names[0]
  finderForm.lastName = names[1] || ''
}

// 清空历史
const clearHistory = () => {
  ElMessageBox.confirm('确定要清空查找历史吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    searchHistory.value = []
    ElMessage.success('历史已清空')
  })
}

// 批量上传处理
const handleBatchUpload = (file) => {
  ElMessage.info('正在处理批量文件...')
  // 处理文件逻辑
  return false
}

// 复制邮箱
const copyEmail = (email) => {
  navigator.clipboard.writeText(email)
  ElMessage.success('邮箱已复制到剪贴板')
}

// 验证邮箱
const verifyEmail = (result) => {
  ElMessage.info('即将跳转到邮箱验证页面')
}

// 丰富信息
const enrichInfo = (result) => {
  ElMessage.info('即将跳转到信息丰富化页面')
}

// 保存到列表
const saveToList = (result) => {
  ElMessage.success('已保存到线索列表')
}

// 尝试其他方法
const tryAlternatives = () => {
  ElMessage.info('尝试使用邮箱搜索功能')
}

// 按角色查找
const findByRole = (role) => {
  finderForm.firstName = ''
  finderForm.lastName = ''
  finderForm.fullName = role.code
  ElMessage.info(`正在查找${role.name}`)
}

// 按部门查找
const findByDepartment = (dept) => {
  finderForm.fullName = dept.title
  ElMessage.info(`正在查找${dept.name}负责人`)
}

// 获取分数颜色
const getScoreColor = (score) => {
  if (score >= 80) return '#67c23a'
  if (score >= 60) return '#e6a23c'
  return '#f56c6c'
}

// 获取验证状态标签类型
const getVerificationTagType = (status) => {
  const types = {
    valid: 'success',
    invalid: 'danger',
    accept_all: 'warning',
    unknown: 'info'
  }
  return types[status] || 'info'
}
</script>

<style lang="scss" scoped>
.email-finder {
  padding: 20px;

  .page-header {
    margin-bottom: 24px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

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

      .quick-templates {
        display: flex;
        gap: 8px;
      }
    }
  }

  .finder-card {
    height: 100%;

    .name-inputs {
      display: flex;
      justify-content: space-between;
    }

    .tip {
      font-size: 12px;
      color: #909399;
      margin-top: 8px;
    }

    .batch-section {
      h4 {
        margin: 0 0 16px 0;
        font-size: 16px;
        color: #303133;
      }
    }
  }

  .result-card {
    margin-bottom: 20px;

    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .result-content {
      .email-display {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 16px;
        background: #f5f7fa;
        border-radius: 8px;
        margin-bottom: 20px;

        .email {
          flex: 1;
          font-size: 16px;
          font-weight: 500;
          color: $primary-color;
          font-family: 'Courier New', monospace;
        }
      }

      .result-actions {
        margin-top: 20px;
        display: flex;
        gap: 8px;
      }
    }
  }

  .history-card {
    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .history-list {
      max-height: 300px;
      overflow-y: auto;

      .history-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: #f5f7fa;
        }

        .history-info {
          .person {
            font-weight: 500;
            color: #303133;
          }

          .company {
            font-size: 12px;
            color: #909399;
            margin-top: 4px;
          }
        }
      }
    }
  }

  .key-persons-card {
    margin-top: 20px;

    .person-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 12px;

      .person-card {
        padding: 16px;
        border: 1px solid #e4e7ed;
        border-radius: 8px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          border-color: $primary-color;
          box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .role-name {
          margin: 8px 0 4px;
          font-weight: 500;
          color: #303133;
        }

        .role-code {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }
}
</style>