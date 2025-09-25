<template>
  <div class="collection-settings">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h2>⚙️ 采集配置</h2>
          <span class="subtitle">API配置、数据质量设置和工具管理</span>
        </div>
        <el-button type="primary" @click="saveSettings">保存配置</el-button>
      </div>
    </div>

    <!-- 配置标签页 -->
    <el-tabs v-model="activeTab">
      <el-tab-pane label="API配置" name="api">
        <el-card>
          <el-form :model="apiConfig" label-width="150px">
            <el-form-item label="Hunter API密钥">
              <el-input
                v-model="apiConfig.hunterKey"
                placeholder="输入您的Hunter.io API密钥"
                show-password
              >
                <template #append>
                  <el-button @click="testAPIKey">测试连接</el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="API调用限制">
              <el-input-number
                v-model="apiConfig.rateLimit"
                :min="1"
                :max="100"
                label="每秒请求数"
              />
              <span style="margin-left: 12px">请求/秒</span>
            </el-form-item>
            <el-form-item label="超时设置">
              <el-input-number
                v-model="apiConfig.timeout"
                :min="5"
                :max="60"
                label="超时时间"
              />
              <span style="margin-left: 12px">秒</span>
            </el-form-item>
            <el-form-item label="重试次数">
              <el-input-number
                v-model="apiConfig.retryCount"
                :min="0"
                :max="5"
              />
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="数据质量" name="quality">
        <el-card>
          <el-form :model="qualityConfig" label-width="150px">
            <el-form-item label="最小置信度">
              <el-slider
                v-model="qualityConfig.minConfidence"
                :min="0"
                :max="100"
                :marks="{ 0: '0%', 50: '50%', 100: '100%' }"
                show-input
              />
            </el-form-item>
            <el-form-item label="验证级别">
              <el-radio-group v-model="qualityConfig.verificationLevel">
                <el-radio label="basic">基础验证</el-radio>
                <el-radio label="standard">标准验证</el-radio>
                <el-radio label="strict">严格验证</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="自动去重">
              <el-switch v-model="qualityConfig.autoDedup" />
            </el-form-item>
            <el-form-item label="过滤选项">
              <el-checkbox-group v-model="qualityConfig.filters">
                <el-checkbox label="disposable">过滤一次性邮箱</el-checkbox>
                <el-checkbox label="webmail">过滤Webmail邮箱</el-checkbox>
                <el-checkbox label="generic">过滤通用邮箱</el-checkbox>
                <el-checkbox label="invalid">过滤无效格式</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="自动化规则" name="automation">
        <el-card>
          <div class="automation-rules">
            <div class="rules-header">
              <span>自动化规则可以帮助您自动执行重复性任务</span>
              <el-button size="small" type="primary" @click="addRule">添加规则</el-button>
            </div>
            <el-table :data="automationRules" stripe>
              <el-table-column prop="name" label="规则名称" width="200" />
              <el-table-column prop="trigger" label="触发条件" width="150" />
              <el-table-column prop="action" label="执行动作" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-switch v-model="row.enabled" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="{ row }">
                  <el-button size="small" text @click="editRule(row)">编辑</el-button>
                  <el-button size="small" text type="danger" @click="deleteRule(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="数据保留" name="retention">
        <el-card>
          <el-form :model="retentionConfig" label-width="150px">
            <el-form-item label="数据保留期限">
              <el-radio-group v-model="retentionConfig.period">
                <el-radio :label="30">30天</el-radio>
                <el-radio :label="90">90天</el-radio>
                <el-radio :label="180">180天</el-radio>
                <el-radio :label="365">365天</el-radio>
                <el-radio :label="-1">永久保存</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="自动清理">
              <el-switch v-model="retentionConfig.autoClean" />
            </el-form-item>
            <el-form-item label="清理策略" v-if="retentionConfig.autoClean">
              <el-checkbox-group v-model="retentionConfig.cleanPolicy">
                <el-checkbox label="invalid">清理无效数据</el-checkbox>
                <el-checkbox label="duplicate">清理重复数据</el-checkbox>
                <el-checkbox label="outdated">清理过期数据</el-checkbox>
                <el-checkbox label="unverified">清理未验证数据</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="存储位置">
              <el-select v-model="retentionConfig.storage" placeholder="选择存储位置">
                <el-option label="本地数据库" value="local" />
                <el-option label="云存储" value="cloud" />
                <el-option label="混合存储" value="hybrid" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 规则编辑对话框 -->
    <el-dialog v-model="ruleDialogVisible" :title="ruleForm.id ? '编辑规则' : '添加规则'" width="600px">
      <el-form :model="ruleForm" label-width="100px">
        <el-form-item label="规则名称">
          <el-input v-model="ruleForm.name" placeholder="输入规则名称" />
        </el-form-item>
        <el-form-item label="触发条件">
          <el-select v-model="ruleForm.trigger" placeholder="选择触发条件">
            <el-option label="新邮箱发现" value="new_email" />
            <el-option label="验证完成" value="verification_done" />
            <el-option label="额度不足" value="low_credits" />
            <el-option label="定时执行" value="scheduled" />
          </el-select>
        </el-form-item>
        <el-form-item label="执行动作">
          <el-select v-model="ruleForm.action" placeholder="选择执行动作">
            <el-option label="自动验证" value="auto_verify" />
            <el-option label="发送通知" value="send_notification" />
            <el-option label="导出数据" value="export_data" />
            <el-option label="同步到CRM" value="sync_crm" />
          </el-select>
        </el-form-item>
        <el-form-item label="启用状态">
          <el-switch v-model="ruleForm.enabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="ruleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRule">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 当前标签页
const activeTab = ref('api')

// API配置
const apiConfig = reactive({
  hunterKey: '',
  rateLimit: 15,
  timeout: 20,
  retryCount: 3
})

// 数据质量配置
const qualityConfig = reactive({
  minConfidence: 70,
  verificationLevel: 'standard',
  autoDedup: true,
  filters: ['disposable', 'invalid']
})

// 数据保留配置
const retentionConfig = reactive({
  period: 90,
  autoClean: true,
  cleanPolicy: ['invalid', 'duplicate'],
  storage: 'local'
})

// 自动化规则
const automationRules = ref([
  {
    id: 1,
    name: '新邮箱自动验证',
    trigger: 'new_email',
    action: '自动验证新发现的邮箱',
    enabled: true
  },
  {
    id: 2,
    name: '额度预警',
    trigger: 'low_credits',
    action: '发送邮件通知管理员',
    enabled: true
  }
])

// 规则对话框
const ruleDialogVisible = ref(false)
const ruleForm = reactive({
  id: null,
  name: '',
  trigger: '',
  action: '',
  enabled: true
})

// 保存配置
const saveSettings = () => {
  ElMessage.success('配置已保存')
}

// 测试API密钥
const testAPIKey = async () => {
  if (!apiConfig.hunterKey) {
    ElMessage.warning('请输入API密钥')
    return
  }

  ElMessage.info('正在测试连接...')
  // 模拟测试
  setTimeout(() => {
    ElMessage.success('连接成功！')
  }, 1500)
}

// 添加规则
const addRule = () => {
  Object.keys(ruleForm).forEach(key => {
    if (key !== 'enabled') {
      ruleForm[key] = key === 'id' ? null : ''
    }
  })
  ruleForm.enabled = true
  ruleDialogVisible.value = true
}

// 编辑规则
const editRule = (row) => {
  Object.assign(ruleForm, row)
  ruleDialogVisible.value = true
}

// 保存规则
const saveRule = () => {
  if (!ruleForm.name || !ruleForm.trigger || !ruleForm.action) {
    ElMessage.warning('请填写完整信息')
    return
  }

  if (ruleForm.id) {
    // 编辑
    const index = automationRules.value.findIndex(r => r.id === ruleForm.id)
    if (index > -1) {
      automationRules.value[index] = { ...ruleForm }
    }
  } else {
    // 新增
    automationRules.value.push({
      ...ruleForm,
      id: Date.now()
    })
  }

  ruleDialogVisible.value = false
  ElMessage.success('规则已保存')
}

// 删除规则
const deleteRule = (row) => {
  ElMessageBox.confirm('确定要删除这个规则吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = automationRules.value.findIndex(r => r.id === row.id)
    if (index > -1) {
      automationRules.value.splice(index, 1)
      ElMessage.success('规则已删除')
    }
  })
}
</script>

<style lang="scss" scoped>
.collection-settings {
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
    }
  }

  .automation-rules {
    .rules-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      color: #606266;
    }
  }
}
</style>