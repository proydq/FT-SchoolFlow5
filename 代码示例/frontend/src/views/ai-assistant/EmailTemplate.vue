<template>
  <div class="email-template-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>邮件模板生成</h1>
      <p class="page-desc">使用AI技术生成专业的邮件模板，支持多种业务场景和风格选择</p>
    </div>

    <el-row :gutter="24">
      <!-- 参数配置面板 -->
      <el-col :span="8">
        <el-card class="config-panel">
          <template #header>
            <div class="card-header">
              <span>生成配置</span>
              <el-tooltip content="配置邮件模板生成参数">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>

          <el-form :model="formData" label-width="120px" size="default">
            <!-- 邮件类型 -->
            <el-form-item label="邮件类型">
              <el-select v-model="formData.emailType" placeholder="请选择邮件类型" style="width: 100%">
                <el-option label="营销推广" value="marketing" />
                <el-option label="产品介绍" value="product" />
                <el-option label="活动通知" value="event" />
                <el-option label="节日祝福" value="holiday" />
                <el-option label="客户关怀" value="care" />
                <el-option label="邀请函" value="invitation" />
                <el-option label="确认通知" value="confirmation" />
                <el-option label="感谢信" value="thanks" />
              </el-select>
            </el-form-item>

            <!-- 目标受众 -->
            <el-form-item label="目标受众">
              <el-select v-model="formData.targetAudience" placeholder="请选择目标受众" style="width: 100%">
                <el-option label="新客户" value="new-customer" />
                <el-option label="老客户" value="existing-customer" />
                <el-option label="潜在客户" value="potential-customer" />
                <el-option label="VIP客户" value="vip-customer" />
                <el-option label="企业客户" value="business-customer" />
                <el-option label="个人客户" value="individual-customer" />
              </el-select>
            </el-form-item>

            <!-- 邮件主题 -->
            <el-form-item label="邮件主题">
              <el-input 
                v-model="formData.subject" 
                placeholder="请输入邮件主题或关键词"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>

            <!-- 产品/服务名称 -->
            <el-form-item label="产品名称">
              <el-input 
                v-model="formData.productName" 
                placeholder="请输入产品或服务名称"
                maxlength="50"
              />
            </el-form-item>

            <!-- 公司信息 -->
            <el-form-item label="公司名称">
              <el-input 
                v-model="formData.companyName" 
                placeholder="请输入公司名称"
                maxlength="50"
              />
            </el-form-item>

            <!-- 语言风格 -->
            <el-form-item label="语言风格">
              <el-select v-model="formData.tone" placeholder="请选择语言风格" style="width: 100%">
                <el-option label="专业正式" value="professional" />
                <el-option label="友好亲切" value="friendly" />
                <el-option label="热情活泼" value="enthusiastic" />
                <el-option label="简洁直接" value="concise" />
                <el-option label="幽默轻松" value="humorous" />
              </el-select>
            </el-form-item>

            <!-- 邮件长度 -->
            <el-form-item label="邮件长度">
              <el-radio-group v-model="formData.length">
                <el-radio label="short">简短 (200字以内)</el-radio>
                <el-radio label="medium">中等 (500字以内)</el-radio>
                <el-radio label="long">详细 (800字以内)</el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- 包含要素 -->
            <el-form-item label="包含要素">
              <el-checkbox-group v-model="formData.elements">
                <el-checkbox label="greeting">问候语</el-checkbox>
                <el-checkbox label="introduction">自我介绍</el-checkbox>
                <el-checkbox label="value-proposition">价值主张</el-checkbox>
                <el-checkbox label="call-to-action">行动号召</el-checkbox>
                <el-checkbox label="contact-info">联系方式</el-checkbox>
                <el-checkbox label="social-proof">社会证明</el-checkbox>
                <el-checkbox label="urgency">紧迫感</el-checkbox>
                <el-checkbox label="personalization">个性化</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <!-- AI模型选择 -->
            <el-form-item label="AI模型">
              <el-select v-model="formData.aiModel" style="width: 100%">
                <el-option label="GPT-4 (推荐)" value="gpt-4" />
                <el-option label="GPT-3.5 Turbo" value="gpt-3.5-turbo" />
                <el-option label="Claude-3" value="claude-3" />
                <el-option label="文心一言" value="ernie-bot" />
              </el-select>
            </el-form-item>

            <!-- 生成按钮 -->
            <el-form-item>
              <el-button 
                type="primary" 
                :loading="generating" 
                @click="generateTemplate"
                :disabled="!canGenerate"
                style="width: 100%"
                size="large"
              >
                <el-icon v-if="!generating"><MagicStick /></el-icon>
                {{ generating ? '生成中...' : '生成邮件模板' }}
              </el-button>
            </el-form-item>

            <!-- 使用统计 -->
            <div class="usage-stats">
              <el-divider>今日使用量</el-divider>
              <div class="stats-item">
                <span>已生成：</span>
                <el-tag type="success">{{ dailyUsage }}/50</el-tag>
              </div>
              <el-progress 
                :percentage="Math.round((dailyUsage / 50) * 100)" 
                :color="progressColor"
                :stroke-width="8"
              />
            </div>
          </el-form>
        </el-card>
      </el-col>

      <!-- 预览和结果面板 -->
      <el-col :span="16">
        <el-card class="preview-panel">
          <template #header>
            <div class="card-header">
              <span>模板预览</span>
              <div class="header-actions">
                <el-button-group>
                  <el-button 
                    :type="previewMode === 'desktop' ? 'primary' : ''"
                    @click="previewMode = 'desktop'"
                    size="small"
                  >
                    <el-icon><Monitor /></el-icon>
                    桌面版
                  </el-button>
                  <el-button 
                    :type="previewMode === 'mobile' ? 'primary' : ''"
                    @click="previewMode = 'mobile'"
                    size="small"
                  >
                    <el-icon><Cellphone /></el-icon>
                    手机版
                  </el-button>
                </el-button-group>
              </div>
            </div>
          </template>

          <!-- 加载状态 -->
          <div v-if="generating" class="loading-container">
            <el-skeleton :rows="8" animated />
            <div class="loading-text">
              <el-icon class="rotating"><Loading /></el-icon>
              AI正在生成邮件模板，请稍候...
            </div>
          </div>

          <!-- 生成结果 -->
          <div v-else-if="generatedTemplates.length > 0" class="templates-container">
            <!-- 模板切换标签 -->
            <el-tabs v-model="activeTemplate" type="border-card">
              <el-tab-pane 
                v-for="(template, index) in generatedTemplates" 
                :key="index"
                :label="`方案${index + 1}`"
                :name="`template-${index}`"
              >
                <!-- 模板信息 -->
                <div class="template-meta">
                  <el-row :gutter="16">
                    <el-col :span="12">
                      <el-statistic title="字符数" :value="template.content.length" />
                    </el-col>
                    <el-col :span="12">
                      <div class="rating-section">
                        <span class="rating-label">质量评分：</span>
                        <el-rate 
                          v-model="template.rating" 
                          allow-half 
                          @change="updateRating(index, $event)"
                        />
                      </div>
                    </el-col>
                  </el-row>
                </div>

                <!-- 邮件预览 -->
                <div :class="['email-preview', previewMode]">
                  <div class="email-header">
                    <div class="email-subject">{{ template.subject }}</div>
                    <div class="email-from">发件人：{{ formData.companyName || '您的公司' }} &lt;noreply@company.com&gt;</div>
                  </div>
                  
                  <div class="email-content" v-html="template.htmlContent"></div>
                  
                  <div class="email-footer">
                    <p class="signature">此致敬礼</p>
                    <p class="company-info">{{ formData.companyName || '您的公司' }}</p>
                  </div>
                </div>

                <!-- 操作按钮 -->
                <div class="template-actions">
                  <el-button @click="copyTemplate(template)" :icon="DocumentCopy">
                    复制模板
                  </el-button>
                  <el-button @click="saveTemplate(template)" :icon="Collection">
                    保存到模板库
                  </el-button>
                  <el-button @click="exportTemplate(template)" :icon="Download">
                    导出HTML
                  </el-button>
                  <el-button @click="sendTestEmail(template)" :icon="Message" type="primary">
                    发送测试邮件
                  </el-button>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>

          <!-- 空状态 -->
          <div v-else class="empty-state">
            <el-empty description="请配置参数并点击生成按钮">
              <el-icon class="empty-icon"><DocumentAdd /></el-icon>
              <p>配置左侧参数，AI将为您生成专业的邮件模板</p>
            </el-empty>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 模板历史 -->
    <el-card class="history-panel" v-if="templateHistory.length > 0">
      <template #header>
        <div class="card-header">
          <span>生成历史</span>
          <el-button @click="clearHistory" size="small" type="danger" text>
            <el-icon><Delete /></el-icon>
            清空历史
          </el-button>
        </div>
      </template>

      <div class="history-list">
        <div 
          v-for="(history, index) in templateHistory" 
          :key="index"
          class="history-item"
          @click="loadFromHistory(history)"
        >
          <div class="history-header">
            <span class="history-type">{{ getEmailTypeLabel(history.emailType) }}</span>
            <span class="history-time">{{ formatTime(history.timestamp) }}</span>
          </div>
          <div class="history-subject">{{ history.subject }}</div>
          <div class="history-params">
            <el-tag size="small">{{ getAudienceLabel(history.targetAudience) }}</el-tag>
            <el-tag size="small" type="success">{{ getToneLabel(history.tone) }}</el-tag>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  InfoFilled, MagicStick, Monitor, Cellphone, Loading, DocumentCopy, 
  Collection, Download, Message, DocumentAdd, Delete
} from '@element-plus/icons-vue'

// 表单数据
const formData = reactive({
  emailType: '',
  targetAudience: '',
  subject: '',
  productName: '',
  companyName: '',
  tone: 'professional',
  length: 'medium',
  elements: ['greeting', 'value-proposition', 'call-to-action', 'contact-info'],
  aiModel: 'gpt-4'
})

// 生成状态
const generating = ref(false)
const dailyUsage = ref(12)
const previewMode = ref('desktop')
const activeTemplate = ref('template-0')
const generatedTemplates = ref([])
const templateHistory = ref([])

// 计算属性
const canGenerate = computed(() => {
  return formData.emailType && formData.targetAudience && formData.subject && dailyUsage.value < 50
})

const progressColor = computed(() => {
  const percentage = (dailyUsage.value / 50) * 100
  if (percentage < 50) return '#67c23a'
  if (percentage < 80) return '#e6a23c'
  return '#f56c6c'
})

// 生成邮件模板
const generateTemplate = async () => {
  if (!canGenerate.value) {
    ElMessage.warning('请完善必填参数或检查今日使用量')
    return
  }

  generating.value = true
  
  try {
    // 模拟AI生成过程
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // 生成多个模板变体
    const templates = []
    for (let i = 0; i < 3; i++) {
      templates.push({
        subject: generateSubject(formData.subject, i),
        content: generateContent(formData, i),
        htmlContent: generateHtmlContent(formData, i),
        rating: 4 + Math.random(),
        style: ['modern', 'classic', 'minimal'][i]
      })
    }
    
    generatedTemplates.value = templates
    activeTemplate.value = 'template-0'
    dailyUsage.value += 1
    
    // 添加到历史记录
    templateHistory.value.unshift({
      ...formData,
      templates: templates,
      timestamp: Date.now()
    })
    
    ElMessage.success('邮件模板生成成功！')
  } catch (error) {
    ElMessage.error('生成失败，请重试')
  } finally {
    generating.value = false
  }
}

// 生成邮件主题
const generateSubject = (baseSubject, variant) => {
  const prefixes = ['🎉 ', '⭐ ', '🔥 ']
  const suffixes = [' - 限时优惠', ' - 专属推荐', ' - 不容错过']
  
  if (variant === 0) return baseSubject
  if (variant === 1) return prefixes[variant % prefixes.length] + baseSubject
  return baseSubject + suffixes[variant % suffixes.length]
}

// 生成邮件内容
const generateContent = (data, variant) => {
  let content = ''
  
  if (data.elements.includes('greeting')) {
    content += `亲爱的客户，\n\n`
  }
  
  if (data.elements.includes('introduction')) {
    content += `我是来自${data.companyName || '公司'}的市场代表，`
  }
  
  content += `很高兴向您介绍我们的${data.productName || '产品'}。`
  
  if (data.elements.includes('value-proposition')) {
    const values = [
      '我们致力于为客户提供最优质的服务和产品。',
      '这款产品具有卓越的性能和创新的设计。',
      '我们的解决方案已经帮助数千家企业实现了业务增长。'
    ]
    content += `\n\n${values[variant % values.length]}`
  }
  
  if (data.elements.includes('call-to-action')) {
    const ctas = [
      '点击了解更多详情，或直接联系我们获取专属报价。',
      '现在就体验我们的产品，享受限时优惠。',
      '立即预约演示，让我们为您展示产品的强大功能。'
    ]
    content += `\n\n${ctas[variant % ctas.length]}`
  }
  
  if (data.elements.includes('contact-info')) {
    content += `\n\n如有任何疑问，请随时联系我们：\n电话：400-123-4567\n邮箱：contact@company.com`
  }
  
  return content
}

// 生成HTML内容
const generateHtmlContent = (data, variant) => {
  const styles = {
    modern: 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;',
    classic: 'background: #f8f9fa; color: #333; border-left: 4px solid #007bff;',
    minimal: 'background: white; color: #333; border: 1px solid #e9ecef;'
  }
  
  const styleKey = ['modern', 'classic', 'minimal'][variant]
  const style = styles[styleKey]
  
  return `
    <div style="${style} padding: 30px; font-family: 'Helvetica Neue', Arial, sans-serif;">
      <h2 style="margin-top: 0;">${generateSubject(data.subject, variant)}</h2>
      <div style="line-height: 1.6;">
        ${generateContent(data, variant).replace(/\n/g, '<br>')}
      </div>
    </div>
  `
}

// 复制模板
const copyTemplate = async (template) => {
  try {
    await navigator.clipboard.writeText(template.content)
    ElMessage.success('模板已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 保存模板
const saveTemplate = (template) => {
  ElMessage.success('模板已保存到模板库')
}

// 导出模板
const exportTemplate = (template) => {
  const blob = new Blob([template.htmlContent], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `email-template-${Date.now()}.html`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('模板已导出')
}

// 发送测试邮件
const sendTestEmail = async (template) => {
  try {
    const { value: email } = await ElMessageBox.prompt('请输入测试邮箱地址', '发送测试邮件', {
      confirmButtonText: '发送',
      cancelButtonText: '取消',
      inputPattern: /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/,
      inputErrorMessage: '邮箱格式不正确'
    })
    
    // 模拟发送邮件
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success(`测试邮件已发送到 ${email}`)
  } catch {
    // 用户取消
  }
}

// 更新评分
const updateRating = (index, rating) => {
  generatedTemplates.value[index].rating = rating
}

// 清空历史
const clearHistory = () => {
  templateHistory.value = []
  ElMessage.success('历史记录已清空')
}

// 从历史记录加载
const loadFromHistory = (history) => {
  Object.assign(formData, history)
  generatedTemplates.value = history.templates
  activeTemplate.value = 'template-0'
}

// 获取标签
const getEmailTypeLabel = (type) => {
  const labels = {
    marketing: '营销推广',
    product: '产品介绍',
    event: '活动通知',
    holiday: '节日祝福',
    care: '客户关怀',
    invitation: '邀请函',
    confirmation: '确认通知',
    thanks: '感谢信'
  }
  return labels[type] || type
}

const getAudienceLabel = (audience) => {
  const labels = {
    'new-customer': '新客户',
    'existing-customer': '老客户',
    'potential-customer': '潜在客户',
    'vip-customer': 'VIP客户',
    'business-customer': '企业客户',
    'individual-customer': '个人客户'
  }
  return labels[audience] || audience
}

const getToneLabel = (tone) => {
  const labels = {
    professional: '专业正式',
    friendly: '友好亲切',
    enthusiastic: '热情活泼',
    concise: '简洁直接',
    humorous: '幽默轻松'
  }
  return labels[tone] || tone
}

// 格式化时间
const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

onMounted(() => {
  // 初始化示例数据
  formData.companyName = '海外营销公司'
})
</script>

<style lang="scss" scoped>
.email-template-page {
  padding: 20px;
  background-color: #f5f7fa;
}

.page-header {
  margin-bottom: 24px;
  
  h1 {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 8px 0;
  }
  
  .page-desc {
    color: #606266;
    font-size: 14px;
    margin: 0;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  span {
    font-weight: 600;
    color: #303133;
  }
}

.config-panel {
  height: fit-content;
  
  .usage-stats {
    margin-top: 24px;
    padding: 16px;
    background-color: #f8f9fa;
    border-radius: 8px;
    
    .stats-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
  }
}

.preview-panel {
  min-height: 600px;
  
  .header-actions {
    display: flex;
    gap: 8px;
  }
}

.loading-container {
  text-align: center;
  padding: 40px 20px;
  
  .loading-text {
    margin-top: 20px;
    color: #606266;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    
    .rotating {
      animation: rotate 1s linear infinite;
    }
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.templates-container {
  .template-meta {
    margin-bottom: 20px;
    padding: 16px;
    background-color: #f8f9fa;
    border-radius: 8px;
    
    .rating-section {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .rating-label {
        font-size: 14px;
        color: #606266;
      }
    }
  }
  
  .email-preview {
    border: 1px solid #dcdfe6;
    border-radius: 8px;
    margin-bottom: 20px;
    overflow: hidden;
    
    &.desktop {
      max-width: 100%;
    }
    
    &.mobile {
      max-width: 375px;
      margin: 0 auto 20px auto;
    }
    
    .email-header {
      padding: 16px;
      background-color: #f5f7fa;
      border-bottom: 1px solid #e4e7ed;
      
      .email-subject {
        font-weight: 600;
        font-size: 16px;
        color: #303133;
        margin-bottom: 8px;
      }
      
      .email-from {
        font-size: 12px;
        color: #909399;
      }
    }
    
    .email-content {
      padding: 20px;
      min-height: 200px;
      line-height: 1.6;
    }
    
    .email-footer {
      padding: 16px;
      border-top: 1px solid #e4e7ed;
      background-color: #fafafa;
      
      .signature, .company-info {
        margin: 0;
        color: #606266;
        font-size: 14px;
      }
    }
  }
  
  .template-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  
  .empty-icon {
    font-size: 48px;
    color: #c0c4cc;
    margin-bottom: 16px;
  }
  
  p {
    color: #909399;
    margin: 16px 0 0 0;
  }
}

.history-panel {
  margin-top: 24px;
  
  .history-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }
  
  .history-item {
    padding: 16px;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      border-color: #409eff;
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
    }
    
    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      
      .history-type {
        font-weight: 600;
        color: #409eff;
      }
      
      .history-time {
        font-size: 12px;
        color: #909399;
      }
    }
    
    .history-subject {
      font-size: 14px;
      color: #303133;
      margin-bottom: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .history-params {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
  }
}

@media (max-width: 768px) {
  .email-template-page {
    padding: 12px;
  }
  
  .el-row {
    margin: 0 !important;
  }
  
  .el-col {
    padding: 0 !important;
    
    &:first-child {
      margin-bottom: 20px;
    }
  }
  
  .template-actions {
    justify-content: center;
  }
  
  .history-list {
    grid-template-columns: 1fr;
  }
}
</style>