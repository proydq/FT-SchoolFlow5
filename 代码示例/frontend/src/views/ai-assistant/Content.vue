<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="title">内容生成</h2>
      <p class="description">AI智能生成营销内容，支持邮件、社媒、广告等多场景</p>
    </div>

    <!-- AI配置面板 -->
    <el-card shadow="never" class="ai-config-card">
      <template #header>
        <div class="card-header">
          <span>AI配置</span>
          <div class="usage-info">
            <span>今日使用：{{ dailyUsage }}/{{ dailyLimit }}</span>
            <el-progress 
              :percentage="usagePercent" 
              :stroke-width="6" 
              style="width: 200px; margin-left: 16px;"
            />
          </div>
        </div>
      </template>

      <el-row :gutter="16">
        <el-col :span="8">
          <div class="config-item">
            <label>AI模型</label>
            <el-select v-model="aiConfig.model" @change="handleModelChange">
              <el-option label="GPT-4" value="gpt-4" />
              <el-option label="GPT-3.5 Turbo" value="gpt-3.5-turbo" />
              <el-option label="Claude-3" value="claude-3" />
              <el-option label="文心一言" value="ernie-bot" />
            </el-select>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="config-item">
            <label>创造性</label>
            <el-slider 
              v-model="aiConfig.temperature" 
              :min="0" 
              :max="2" 
              :step="0.1"
              show-input
            />
          </div>
        </el-col>
        <el-col :span="8">
          <div class="config-item">
            <label>输出长度</label>
            <el-input-number 
              v-model="aiConfig.maxTokens" 
              :min="100" 
              :max="4000" 
              :step="100"
            />
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="16">
      <!-- 左侧：生成参数 -->
      <el-col :span="12">
        <el-card shadow="never" class="generation-panel">
          <template #header>
            <span>生成参数设置</span>
          </template>

          <el-tabs v-model="activeContentType" @tab-change="handleContentTypeChange">
            <!-- 邮件内容 -->
            <el-tab-pane label="邮件内容" name="email">
              <el-form :model="emailForm" label-width="100px">
                <el-form-item label="邮件类型">
                  <el-select v-model="emailForm.type">
                    <el-option label="营销推广" value="marketing" />
                    <el-option label="产品介绍" value="product" />
                    <el-option label="活动通知" value="event" />
                    <el-option label="客户关怀" value="care" />
                    <el-option label="邀请函" value="invitation" />
                  </el-select>
                </el-form-item>
                
                <el-form-item label="目标客户">
                  <el-input 
                    v-model="emailForm.targetAudience" 
                    placeholder="例如：企业采购经理、IT决策者"
                  />
                </el-form-item>
                
                <el-form-item label="产品/服务">
                  <el-input 
                    v-model="emailForm.product" 
                    placeholder="请输入产品或服务名称"
                  />
                </el-form-item>
                
                <el-form-item label="核心卖点">
                  <el-input 
                    type="textarea" 
                    v-model="emailForm.keyPoints" 
                    placeholder="请输入3-5个核心卖点，用换行分隔"
                    :rows="3"
                  />
                </el-form-item>
                
                <el-form-item label="语言风格">
                  <el-select v-model="emailForm.tone">
                    <el-option label="专业正式" value="professional" />
                    <el-option label="友好亲切" value="friendly" />
                    <el-option label="热情活泼" value="enthusiastic" />
                    <el-option label="简洁直接" value="concise" />
                  </el-select>
                </el-form-item>

                <el-form-item label="包含元素">
                  <el-checkbox-group v-model="emailForm.elements">
                    <el-checkbox label="subject">邮件主题</el-checkbox>
                    <el-checkbox label="greeting">开场问候</el-checkbox>
                    <el-checkbox label="body">正文内容</el-checkbox>
                    <el-checkbox label="cta">行动号召</el-checkbox>
                    <el-checkbox label="signature">邮件签名</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <!-- 社媒内容 -->
            <el-tab-pane label="社媒内容" name="social">
              <el-form :model="socialForm" label-width="100px">
                <el-form-item label="平台选择">
                  <el-checkbox-group v-model="socialForm.platforms">
                    <el-checkbox label="linkedin">LinkedIn</el-checkbox>
                    <el-checkbox label="facebook">Facebook</el-checkbox>
                    <el-checkbox label="twitter">Twitter</el-checkbox>
                    <el-checkbox label="instagram">Instagram</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
                
                <el-form-item label="内容主题">
                  <el-input 
                    v-model="socialForm.topic" 
                    placeholder="请输入要发布的主题"
                  />
                </el-form-item>
                
                <el-form-item label="内容类型">
                  <el-select v-model="socialForm.contentType">
                    <el-option label="产品展示" value="product-showcase" />
                    <el-option label="行业见解" value="industry-insight" />
                    <el-option label="公司动态" value="company-news" />
                    <el-option label="用户案例" value="case-study" />
                    <el-option label="活动宣传" value="event-promotion" />
                  </el-select>
                </el-form-item>
                
                <el-form-item label="目标标签">
                  <el-input 
                    v-model="socialForm.hashtags" 
                    placeholder="请输入相关标签，用空格分隔"
                  />
                </el-form-item>
                
                <el-form-item label="字数限制">
                  <el-input-number 
                    v-model="socialForm.wordLimit" 
                    :min="50" 
                    :max="2000"
                  />
                </el-form-item>

                <el-form-item label="语言风格">
                  <el-select v-model="socialForm.tone">
                    <el-option label="专业权威" value="authoritative" />
                    <el-option label="轻松幽默" value="casual" />
                    <el-option label="激励鼓舞" value="inspiring" />
                    <el-option label="互动友好" value="engaging" />
                  </el-select>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <!-- 广告文案 -->
            <el-tab-pane label="广告文案" name="ad">
              <el-form :model="adForm" label-width="100px">
                <el-form-item label="广告平台">
                  <el-select v-model="adForm.platform">
                    <el-option label="Google Ads" value="google" />
                    <el-option label="Facebook Ads" value="facebook" />
                    <el-option label="LinkedIn Ads" value="linkedin" />
                    <el-option label="百度推广" value="baidu" />
                  </el-select>
                </el-form-item>
                
                <el-form-item label="广告目标">
                  <el-select v-model="adForm.objective">
                    <el-option label="品牌知名度" value="awareness" />
                    <el-option label="流量获取" value="traffic" />
                    <el-option label="潜客生成" value="leads" />
                    <el-option label="销售转化" value="conversions" />
                  </el-select>
                </el-form-item>
                
                <el-form-item label="产品名称">
                  <el-input 
                    v-model="adForm.productName" 
                    placeholder="请输入产品或服务名称"
                  />
                </el-form-item>
                
                <el-form-item label="竞争优势">
                  <el-input 
                    type="textarea" 
                    v-model="adForm.advantages" 
                    placeholder="请输入相比竞品的独特优势"
                    :rows="2"
                  />
                </el-form-item>

                <el-form-item label="广告规格">
                  <el-checkbox-group v-model="adForm.formats">
                    <el-checkbox label="headline">标题文案</el-checkbox>
                    <el-checkbox label="description">描述文案</el-checkbox>
                    <el-checkbox label="cta">行动按钮</el-checkbox>
                    <el-checkbox label="display">展示广告</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>

          <div class="generation-actions">
            <el-button 
              type="primary" 
              @click="generateContent" 
              :loading="generating"
              size="large"
            >
              <el-icon><MagicStick /></el-icon>
              生成内容
            </el-button>
            <el-button 
              @click="saveTemplate"
              :disabled="!generatedContent"
            >
              <el-icon><Collection /></el-icon>
              保存为模板
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：生成结果 -->
      <el-col :span="12">
        <el-card shadow="never" class="result-panel">
          <template #header>
            <div class="result-header">
              <span>生成结果</span>
              <div class="result-actions">
                <el-button 
                  type="text" 
                  @click="regenerateContent"
                  :disabled="!generatedContent"
                >
                  <el-icon><RefreshRight /></el-icon>
                  重新生成
                </el-button>
                <el-button 
                  type="text" 
                  @click="copyContent"
                  :disabled="!generatedContent"
                >
                  <el-icon><CopyDocument /></el-icon>
                  复制内容
                </el-button>
              </div>
            </div>
          </template>

          <div class="content-preview">
            <div v-if="!generatedContent && !generating" class="empty-state">
              <el-icon size="48" color="#C0C4CC"><Document /></el-icon>
              <p>请在左侧配置参数后点击生成内容</p>
            </div>

            <div v-if="generating" class="generating-state">
              <el-icon class="rotating" size="32" color="#409EFF"><Loading /></el-icon>
              <p>AI正在生成内容，请稍候...</p>
            </div>

            <div v-if="generatedContent" class="content-display">
              <div class="content-tabs">
                <el-tabs v-model="activeResultTab">
                  <el-tab-pane 
                    v-for="(result, index) in generationResults" 
                    :key="index"
                    :label="`方案${index + 1}`" 
                    :name="index.toString()"
                  >
                    <div class="content-section">
                      <div v-if="result.subject" class="content-item">
                        <h4>邮件主题</h4>
                        <div class="content-text">{{ result.subject }}</div>
                      </div>
                      
                      <div v-if="result.body" class="content-item">
                        <h4>正文内容</h4>
                        <div class="content-text">{{ result.body }}</div>
                      </div>
                      
                      <div v-if="result.cta" class="content-item">
                        <h4>行动号召</h4>
                        <div class="content-text">{{ result.cta }}</div>
                      </div>
                      
                      <div v-if="result.hashtags" class="content-item">
                        <h4>建议标签</h4>
                        <div class="hashtag-list">
                          <el-tag 
                            v-for="tag in result.hashtags" 
                            :key="tag"
                            class="hashtag-item"
                          >
                            {{ tag }}
                          </el-tag>
                        </div>
                      </div>
                    </div>
                  </el-tab-pane>
                </el-tabs>
              </div>

              <div class="content-actions">
                <el-rate v-model="currentRating" @change="rateContent" />
                <span class="rating-text">为这个结果评分</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 历史记录 -->
    <el-card shadow="never" class="history-panel">
      <template #header>
        <span>生成历史</span>
      </template>

      <el-table :data="generationHistory" max-height="300">
        <el-table-column prop="createTime" label="生成时间" width="150" />
        <el-table-column prop="contentType" label="内容类型" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ getContentTypeText(row.contentType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="prompt" label="生成提示" show-overflow-tooltip />
        <el-table-column prop="model" label="使用模型" width="120" />
        <el-table-column prop="rating" label="评分" width="120">
          <template #default="{ row }">
            <el-rate 
              v-model="row.rating" 
              disabled 
              size="small"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="text" size="small" @click="viewHistory(row)">
              查看
            </el-button>
            <el-button type="text" size="small" @click="reuseHistory(row)">
              复用
            </el-button>
            <el-button type="text" size="small" @click="shareHistory(row)">
              分享
            </el-button>
            <el-button 
              type="text" 
              size="small" 
              class="danger"
              @click="deleteHistory(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// AI配置
const aiConfig = reactive({
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 1000
})

// 使用统计
const dailyUsage = ref(127)
const dailyLimit = ref(500)
const usagePercent = computed(() => (dailyUsage.value / dailyLimit.value) * 100)

// 内容类型
const activeContentType = ref('email')

// 表单数据
const emailForm = reactive({
  type: 'marketing',
  targetAudience: '',
  product: '',
  keyPoints: '',
  tone: 'professional',
  elements: ['subject', 'body', 'cta']
})

const socialForm = reactive({
  platforms: ['linkedin'],
  topic: '',
  contentType: 'product-showcase',
  hashtags: '',
  wordLimit: 280,
  tone: 'professional'
})

const adForm = reactive({
  platform: 'google',
  objective: 'leads',
  productName: '',
  advantages: '',
  formats: ['headline', 'description', 'cta']
})

// 生成状态
const generating = ref(false)
const generatedContent = ref(false)
const activeResultTab = ref('0')
const currentRating = ref(0)

// 生成结果
const generationResults = ref([
  {
    subject: '🚀 提升您的业务效率，立即体验我们的创新解决方案',
    body: `尊敬的用户，

我希望这封邮件能为您带来价值。在当今竞争激烈的商业环境中，效率和创新是成功的关键。

我想向您介绍我们最新的产品解决方案，它已经帮助超过1000家企业：
• 提升工作效率高达40%
• 降低运营成本25%
• 增强团队协作能力
• 提供7x24小时技术支持

我们的客户包括知名企业如ABC公司、XYZ集团等，他们都从中获得了显著的业务改善。

如果您有兴趣了解更多详情，我很乐意为您安排一次15分钟的产品演示。`,
    cta: '立即预约免费演示 →',
    hashtags: []
  },
  {
    subject: '专为您定制的商业解决方案 - 免费咨询机会',
    body: `您好！

作为在贵行业深耕多年的专业服务商，我们深知您在日常经营中可能面临的挑战。

我们的解决方案特色：
✓ 量身定制的解决方案
✓ 行业领先的技术支持  
✓ 快速部署和实施
✓ 持续的优化和升级

目前我们正为类似规模的企业提供限时免费咨询服务，这是一个了解如何优化您业务流程的绝佳机会。

期待与您的进一步沟通！`,
    cta: '申请免费咨询 →',
    hashtags: []
  }
])

// 历史记录
const generationHistory = ref([
  {
    id: 1,
    createTime: '2024-01-15 10:30',
    contentType: 'email',
    prompt: '为IT服务公司生成营销邮件',
    model: 'GPT-3.5',
    rating: 4
  },
  {
    id: 2,
    createTime: '2024-01-15 09:15',
    contentType: 'social',
    prompt: 'LinkedIn产品发布文案',
    model: 'GPT-4',
    rating: 5
  }
])

// 方法
const handleModelChange = (model) => {
  ElMessage.info(`已切换到${model}模型`)
}

const handleContentTypeChange = (contentType) => {
  activeContentType.value = contentType
}

const generateContent = async () => {
  generating.value = true
  generatedContent.value = false
  
  try {
    // 模拟AI生成过程
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    generatedContent.value = true
    dailyUsage.value += 1
    
    // 添加到历史记录
    generationHistory.value.unshift({
      id: Date.now(),
      createTime: new Date().toLocaleString('zh-CN'),
      contentType: activeContentType.value,
      prompt: getPromptText(),
      model: aiConfig.model,
      rating: 0
    })
    
    ElMessage.success('内容生成完成')
    
  } catch (error) {
    ElMessage.error('生成失败，请重试')
  } finally {
    generating.value = false
  }
}

const regenerateContent = async () => {
  await generateContent()
  ElMessage.success('已重新生成内容')
}

const copyContent = () => {
  const currentResult = generationResults.value[parseInt(activeResultTab.value)]
  let textToCopy = ''
  
  if (currentResult.subject) {
    textToCopy += `主题：${currentResult.subject}\n\n`
  }
  if (currentResult.body) {
    textToCopy += `${currentResult.body}\n\n`
  }
  if (currentResult.cta) {
    textToCopy += `${currentResult.cta}`
  }
  
  navigator.clipboard.writeText(textToCopy)
  ElMessage.success('内容已复制到剪贴板')
}

const saveTemplate = () => {
  ElMessage.success('模板保存成功')
}

const rateContent = (rating) => {
  currentRating.value = rating
  const historyItem = generationHistory.value[0]
  if (historyItem) {
    historyItem.rating = rating
  }
  ElMessage.success(`感谢您的${rating}星评价`)
}

const viewHistory = (item) => {
  ElMessage.info(`查看历史记录：${item.prompt}`)
}

const reuseHistory = (item) => {
  ElMessage.success('已复用历史参数')
}

const shareHistory = (item) => {
  ElMessage.success('分享链接已生成')
}

const deleteHistory = (item) => {
  const index = generationHistory.value.findIndex(h => h.id === item.id)
  if (index > -1) {
    generationHistory.value.splice(index, 1)
    ElMessage.success('历史记录已删除')
  }
}

const getPromptText = () => {
  switch (activeContentType.value) {
    case 'email':
      return `为${emailForm.targetAudience}生成${emailForm.type}邮件`
    case 'social':
      return `为${socialForm.platforms.join(',')}生成${socialForm.topic}内容`
    case 'ad':
      return `为${adForm.platform}生成${adForm.productName}广告文案`
    default:
      return '生成营销内容'
  }
}

const getContentTypeText = (type) => {
  const typeMap = {
    email: '邮件',
    social: '社媒',
    ad: '广告'
  }
  return typeMap[type] || type
}

onMounted(() => {
  // 初始化
})
</script>

<style scoped lang="scss">
.ai-config-card {
  margin-bottom: $spacing-lg;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .usage-info {
      display: flex;
      align-items: center;
      font-size: $font-size-sm;
      color: $text-secondary;
    }
  }
  
  .config-item {
    label {
      display: block;
      margin-bottom: $spacing-xs;
      font-weight: 500;
      color: $text-primary;
    }
  }
}

.generation-panel,
.result-panel {
  height: 600px;
  
  .generation-actions {
    text-align: center;
    padding-top: $spacing-lg;
    border-top: 1px solid $border-light;
    
    .el-button {
      margin-right: $spacing-md;
    }
  }
}

.result-panel {
  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .content-preview {
    height: 500px;
    
    .empty-state,
    .generating-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: $text-secondary;
      
      p {
        margin-top: $spacing-md;
        color: $text-secondary;
      }
    }
    
    .rotating {
      animation: rotate 2s linear infinite;
    }
    
    .content-display {
      height: 100%;
      display: flex;
      flex-direction: column;
      
      .content-tabs {
        flex: 1;
        overflow-y: auto;
      }
      
      .content-section {
        .content-item {
          margin-bottom: $spacing-lg;
          
          h4 {
            margin-bottom: $spacing-sm;
            color: $text-primary;
            font-size: $font-size-base;
            font-weight: 500;
          }
          
          .content-text {
            padding: $spacing-md;
            background: $bg-color;
            border-radius: 4px;
            line-height: 1.6;
            white-space: pre-wrap;
            color: $text-regular;
          }
          
          .hashtag-list {
            display: flex;
            flex-wrap: wrap;
            gap: $spacing-xs;
            
            .hashtag-item {
              cursor: pointer;
            }
          }
        }
      }
      
      .content-actions {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: $spacing-md;
        border-top: 1px solid $border-light;
        
        .rating-text {
          margin-left: $spacing-md;
          color: $text-secondary;
          font-size: $font-size-sm;
        }
      }
    }
  }
}

.history-panel {
  margin-top: $spacing-lg;
}

.danger {
  color: $danger-color !important;
}

:deep(.el-tabs__content) {
  padding: $spacing-md 0;
}

:deep(.el-form-item) {
  margin-bottom: $spacing-md;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>