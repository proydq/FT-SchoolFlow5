<template>
  <div class="social-content-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>社媒话术生成</h1>
      <p class="page-desc">为不同社交媒体平台生成专业的营销话术，支持批量生成和多平台适配</p>
    </div>

    <el-row :gutter="24">
      <!-- 参数配置面板 -->
      <el-col :span="8">
        <el-card class="config-panel">
          <template #header>
            <div class="card-header">
              <span>生成配置</span>
              <el-tooltip content="配置社媒话术生成参数">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>

          <el-form :model="formData" label-width="120px" size="default">
            <!-- 社媒平台选择 -->
            <el-form-item label="目标平台">
              <el-checkbox-group v-model="formData.platforms">
                <div class="platform-grid">
                  <el-checkbox label="facebook" class="platform-item">
                    <div class="platform-content">
                      <el-icon class="platform-icon facebook"><Platform /></el-icon>
                      <span>Facebook</span>
                    </div>
                  </el-checkbox>
                  <el-checkbox label="instagram" class="platform-item">
                    <div class="platform-content">
                      <el-icon class="platform-icon instagram"><Camera /></el-icon>
                      <span>Instagram</span>
                    </div>
                  </el-checkbox>
                  <el-checkbox label="twitter" class="platform-item">
                    <div class="platform-content">
                      <el-icon class="platform-icon twitter"><ChatLineSquare /></el-icon>
                      <span>Twitter/X</span>
                    </div>
                  </el-checkbox>
                  <el-checkbox label="linkedin" class="platform-item">
                    <div class="platform-content">
                      <el-icon class="platform-icon linkedin"><Briefcase /></el-icon>
                      <span>LinkedIn</span>
                    </div>
                  </el-checkbox>
                  <el-checkbox label="tiktok" class="platform-item">
                    <div class="platform-content">
                      <el-icon class="platform-icon tiktok"><VideoPlay /></el-icon>
                      <span>TikTok</span>
                    </div>
                  </el-checkbox>
                  <el-checkbox label="youtube" class="platform-item">
                    <div class="platform-content">
                      <el-icon class="platform-icon youtube"><VideoCamera /></el-icon>
                      <span>YouTube</span>
                    </div>
                  </el-checkbox>
                </div>
              </el-checkbox-group>
            </el-form-item>

            <!-- 内容类型 -->
            <el-form-item label="内容类型">
              <el-select v-model="formData.contentType" placeholder="请选择内容类型" style="width: 100%">
                <el-option label="产品推广" value="product-promotion" />
                <el-option label="品牌宣传" value="brand-awareness" />
                <el-option label="活动推广" value="event-promotion" />
                <el-option label="用户教育" value="education" />
                <el-option label="客户故事" value="customer-story" />
                <el-option label="行业资讯" value="industry-news" />
                <el-option label="节日营销" value="holiday-marketing" />
                <el-option label="互动话题" value="engagement" />
              </el-select>
            </el-form-item>

            <!-- 核心信息 -->
            <el-form-item label="核心信息">
              <el-input 
                v-model="formData.coreMessage" 
                type="textarea"
                :rows="3"
                placeholder="请输入要传达的核心信息或关键词"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>

            <!-- 目标受众 -->
            <el-form-item label="目标受众">
              <el-select v-model="formData.targetAudience" placeholder="请选择目标受众" style="width: 100%">
                <el-option label="年轻消费者(18-30)" value="young-consumers" />
                <el-option label="职场人士(25-40)" value="professionals" />
                <el-option label="中年群体(35-50)" value="middle-aged" />
                <el-option label="企业决策者" value="decision-makers" />
                <el-option label="学生群体" value="students" />
                <el-option label="家庭主妇" value="housewives" />
                <el-option label="老年群体" value="seniors" />
                <el-option label="科技爱好者" value="tech-enthusiasts" />
              </el-select>
            </el-form-item>

            <!-- 语气风格 -->
            <el-form-item label="语气风格">
              <el-radio-group v-model="formData.tone">
                <el-radio label="professional">专业严肃</el-radio>
                <el-radio label="friendly">友好亲切</el-radio>
                <el-radio label="humorous">幽默风趣</el-radio>
                <el-radio label="inspiring">激励向上</el-radio>
                <el-radio label="casual">轻松随意</el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- 话术长度 -->
            <el-form-item label="话术长度">
              <div class="length-settings">
                <el-radio-group v-model="formData.lengthMode">
                  <el-radio label="auto">智能适配</el-radio>
                  <el-radio label="custom">自定义</el-radio>
                </el-radio-group>
                
                <div v-if="formData.lengthMode === 'custom'" class="custom-length">
                  <el-slider
                    v-model="formData.customLength"
                    :min="50"
                    :max="2000"
                    :step="50"
                    show-stops
                    show-input
                  />
                  <p class="length-hint">建议字数范围：{{ getRecommendedLength() }}</p>
                </div>
              </div>
            </el-form-item>

            <!-- 标签和话题 -->
            <el-form-item label="相关标签">
              <el-input 
                v-model="formData.hashtags" 
                placeholder="请输入相关标签，用逗号分隔"
                maxlength="100"
              />
              <div class="hashtag-suggestions">
                <el-tag 
                  v-for="tag in hashtagSuggestions" 
                  :key="tag"
                  size="small"
                  class="suggestion-tag"
                  @click="addHashtag(tag)"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </el-form-item>

            <!-- 互动元素 -->
            <el-form-item label="互动元素">
              <el-checkbox-group v-model="formData.interactionElements">
                <el-checkbox label="call-to-action">行动号召</el-checkbox>
                <el-checkbox label="question">提问互动</el-checkbox>
                <el-checkbox label="emoji">表情符号</el-checkbox>
                <el-checkbox label="mention">@提及</el-checkbox>
                <el-checkbox label="poll">投票功能</el-checkbox>
                <el-checkbox label="contest">抽奖活动</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <!-- 生成数量 -->
            <el-form-item label="生成数量">
              <el-radio-group v-model="formData.generateCount">
                <el-radio :label="3">3个版本</el-radio>
                <el-radio :label="5">5个版本</el-radio>
                <el-radio :label="10">10个版本</el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- AI模型 -->
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
                @click="generateContent"
                :disabled="!canGenerate"
                style="width: 100%"
                size="large"
              >
                <el-icon v-if="!generating"><MagicStick /></el-icon>
                {{ generating ? '生成中...' : '批量生成话术' }}
              </el-button>
            </el-form-item>

            <!-- 使用统计 -->
            <div class="usage-stats">
              <el-divider>今日使用量</el-divider>
              <div class="stats-item">
                <span>已生成：</span>
                <el-tag type="success">{{ dailyUsage }}/100</el-tag>
              </div>
              <el-progress 
                :percentage="Math.round((dailyUsage / 100) * 100)" 
                :color="progressColor"
                :stroke-width="8"
              />
            </div>
          </el-form>
        </el-card>
      </el-col>

      <!-- 生成结果面板 -->
      <el-col :span="16">
        <el-card class="results-panel">
          <template #header>
            <div class="card-header">
              <span>生成结果</span>
              <div class="header-actions" v-if="generatedResults.length > 0">
                <el-button @click="exportAll" size="small" :icon="Download">
                  导出全部
                </el-button>
                <el-button @click="clearResults" size="small" type="danger" text>
                  <el-icon><Delete /></el-icon>
                  清空结果
                </el-button>
              </div>
            </div>
          </template>

          <!-- 加载状态 -->
          <div v-if="generating" class="loading-container">
            <el-skeleton :rows="6" animated />
            <div class="loading-text">
              <el-icon class="rotating"><Loading /></el-icon>
              AI正在为{{ formData.platforms.length }}个平台生成{{ formData.generateCount }}个话术版本...
            </div>
            <el-progress :percentage="generateProgress" :stroke-width="8" />
          </div>

          <!-- 生成结果 -->
          <div v-else-if="generatedResults.length > 0" class="results-container">
            <!-- 平台标签切换 -->
            <el-tabs v-model="activePlatform" type="border-card">
              <el-tab-pane 
                v-for="platform in formData.platforms" 
                :key="platform"
                :label="getPlatformLabel(platform)"
                :name="platform"
              >
                <!-- 平台信息概览 -->
                <div class="platform-overview">
                  <el-row :gutter="16">
                    <el-col :span="6">
                      <el-statistic title="生成数量" :value="getPlatformResults(platform).length" />
                    </el-col>
                    <el-col :span="6">
                      <el-statistic title="平均字数" :value="getAverageLength(platform)" />
                    </el-col>
                    <el-col :span="6">
                      <el-statistic title="字数限制" :value="getPlatformLimit(platform)" />
                    </el-col>
                    <el-col :span="6">
                      <div class="quality-score">
                        <span class="score-label">整体评分：</span>
                        <el-rate 
                          :value="getAverageRating(platform)" 
                          disabled 
                          show-score
                          text-color="#ff9900"
                          score-template="{value} 分"
                        />
                      </div>
                    </el-col>
                  </el-row>
                </div>

                <!-- 话术列表 -->
                <div class="content-list">
                  <div 
                    v-for="(content, index) in getPlatformResults(platform)" 
                    :key="index"
                    class="content-item"
                  >
                    <div class="content-header">
                      <div class="content-meta">
                        <el-tag size="small">版本{{ index + 1 }}</el-tag>
                        <el-tag size="small" :type="getLengthType(content.length, platform)">
                          {{ content.length }}字
                        </el-tag>
                        <el-tag size="small" type="info" v-if="content.hashtags">
                          {{ content.hashtags.length }}个标签
                        </el-tag>
                      </div>
                      <div class="content-actions">
                        <el-rate 
                          v-model="content.rating" 
                          size="small"
                          @change="updateRating(platform, index, $event)"
                        />
                      </div>
                    </div>

                    <div class="content-body">
                      <div class="content-text">{{ content.text }}</div>
                      <div v-if="content.hashtags && content.hashtags.length > 0" class="content-hashtags">
                        <el-tag 
                          v-for="tag in content.hashtags" 
                          :key="tag"
                          size="small"
                          type="primary"
                          class="hashtag-item"
                        >
                          #{{ tag }}
                        </el-tag>
                      </div>
                    </div>

                    <div class="content-footer">
                      <el-button-group size="small">
                        <el-button @click="copyContent(content.text)" :icon="DocumentCopy">
                          复制
                        </el-button>
                        <el-button @click="editContent(platform, index)" :icon="Edit">
                          编辑
                        </el-button>
                        <el-button @click="shareContent(content)" :icon="Share">
                          分享
                        </el-button>
                        <el-button @click="publishContent(platform, content)" :icon="Promotion" type="primary">
                          发布到{{ getPlatformLabel(platform) }}
                        </el-button>
                      </el-button-group>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>

          <!-- 空状态 -->
          <div v-else class="empty-state">
            <el-empty description="请配置参数并点击生成按钮">
              <el-icon class="empty-icon"><ChatDotSquare /></el-icon>
              <p>选择目标平台，AI将为您生成专业的社媒话术</p>
            </el-empty>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 编辑对话框 -->
    <el-dialog 
      v-model="editDialogVisible"
      title="编辑话术内容"
      width="70%"
      destroy-on-close
    >
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="平台">
          <el-tag>{{ getPlatformLabel(editForm.platform) }}</el-tag>
        </el-form-item>
        <el-form-item label="内容">
          <el-input 
            v-model="editForm.text"
            type="textarea"
            :rows="8"
            :maxlength="getPlatformLimit(editForm.platform)"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="标签">
          <el-input 
            v-model="editForm.hashtagsText"
            placeholder="请输入标签，用逗号分隔"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEdit">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  InfoFilled, MagicStick, Loading, DocumentCopy, Download, Delete, Edit, 
  Share, Promotion, ChatDotSquare, Platform, Camera, ChatLineSquare,
  Briefcase, VideoPlay, VideoCamera
} from '@element-plus/icons-vue'

// 表单数据
const formData = reactive({
  platforms: [],
  contentType: '',
  coreMessage: '',
  targetAudience: '',
  tone: 'friendly',
  lengthMode: 'auto',
  customLength: 280,
  hashtags: '',
  interactionElements: ['call-to-action', 'emoji'],
  generateCount: 3,
  aiModel: 'gpt-4'
})

// 生成状态
const generating = ref(false)
const generateProgress = ref(0)
const dailyUsage = ref(24)
const activePlatform = ref('')
const generatedResults = ref([])

// 编辑对话框
const editDialogVisible = ref(false)
const editForm = reactive({
  platform: '',
  index: -1,
  text: '',
  hashtagsText: ''
})

// 标签建议
const hashtagSuggestions = ref([
  '营销', '推广', '品牌', '产品', '优惠', '限时', '新品', '热门', 
  '专业', '服务', '质量', '创新', '体验', '推荐', '必买', '好物'
])

// 计算属性
const canGenerate = computed(() => {
  return formData.platforms.length > 0 && 
         formData.contentType && 
         formData.coreMessage.trim() && 
         dailyUsage.value < 100
})

const progressColor = computed(() => {
  const percentage = (dailyUsage.value / 100) * 100
  if (percentage < 50) return '#67c23a'
  if (percentage < 80) return '#e6a23c'
  return '#f56c6c'
})

// 监听平台变化，设置默认激活平台
watch(() => formData.platforms, (newPlatforms) => {
  if (newPlatforms.length > 0 && !activePlatform.value) {
    activePlatform.value = newPlatforms[0]
  }
}, { immediate: true })

// 获取推荐长度
const getRecommendedLength = () => {
  const ranges = {
    twitter: '50-280字',
    instagram: '125-2200字',
    facebook: '40-80字（最佳），最多2000字',
    linkedin: '150-300字',
    tiktok: '100-150字',
    youtube: '125-1000字'
  }
  
  const selectedPlatforms = formData.platforms
  if (selectedPlatforms.length === 1) {
    return ranges[selectedPlatforms[0]] || '50-500字'
  }
  return '根据平台自动调整'
}

// 生成内容
const generateContent = async () => {
  if (!canGenerate.value) {
    ElMessage.warning('请完善必填参数或检查今日使用量')
    return
  }

  generating.value = true
  generateProgress.value = 0
  
  try {
    const results = []
    
    // 为每个平台生成内容
    for (let platformIndex = 0; platformIndex < formData.platforms.length; platformIndex++) {
      const platform = formData.platforms[platformIndex]
      
      for (let i = 0; i < formData.generateCount; i++) {
        // 模拟生成进度
        generateProgress.value = Math.round(((platformIndex * formData.generateCount + i + 1) / 
          (formData.platforms.length * formData.generateCount)) * 100)
        
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 生成内容
        const content = generatePlatformContent(platform, i)
        results.push({
          platform,
          ...content,
          rating: 4 + Math.random()
        })
      }
    }
    
    generatedResults.value = results
    activePlatform.value = formData.platforms[0]
    dailyUsage.value += formData.platforms.length * formData.generateCount
    
    ElMessage.success(`成功生成${results.length}条话术内容！`)
  } catch (error) {
    ElMessage.error('生成失败，请重试')
  } finally {
    generating.value = false
    generateProgress.value = 0
  }
}

// 为特定平台生成内容
const generatePlatformContent = (platform, variant) => {
  const platformLimits = {
    twitter: 280,
    instagram: 2200,
    facebook: 500,
    linkedin: 700,
    tiktok: 150,
    youtube: 1000
  }
  
  const limit = platformLimits[platform] || 500
  const targetLength = formData.lengthMode === 'custom' ? 
    formData.customLength : Math.round(limit * 0.7)
  
  // 基础内容生成
  let content = generateBaseContent(platform, variant, targetLength)
  
  // 添加互动元素
  if (formData.interactionElements.includes('emoji')) {
    content = addEmojis(content, platform)
  }
  
  if (formData.interactionElements.includes('call-to-action')) {
    content = addCallToAction(content, platform)
  }
  
  if (formData.interactionElements.includes('question')) {
    content = addQuestion(content, platform)
  }
  
  // 生成标签
  const hashtags = generateHashtags(platform)
  
  return {
    text: content,
    length: content.length,
    hashtags: hashtags,
    variant: variant + 1
  }
}

// 生成基础内容
const generateBaseContent = (platform, variant, targetLength) => {
  const coreMessage = formData.coreMessage
  const contentType = formData.contentType
  const tone = formData.tone
  
  let content = ''
  
  // 根据平台特点调整开头
  const openings = {
    twitter: ['💡 ', '🔥 ', '⚡ '],
    instagram: ['✨ 想要', '💫 发现', '🌟 分享'],
    facebook: ['朋友们，', '大家好！', '和大家分享一个'],
    linkedin: ['在这个行业中，', '作为专业人士，', '根据最新趋势，'],
    tiktok: ['哇！', '太赞了！', '必须安利！'],
    youtube: ['今天和大家聊聊', '这期视频为大家介绍', '很多人问我关于']
  }
  
  const opening = openings[platform] ? 
    openings[platform][variant % openings[platform].length] : ''
  
  content = opening + coreMessage
  
  // 根据语气调整内容
  if (tone === 'professional') {
    content += '，这是一个值得关注的专业解决方案。'
  } else if (tone === 'friendly') {
    content += '，真的超级推荐给大家！'
  } else if (tone === 'humorous') {
    content += '，不试试你会后悔的哦😄'
  }
  
  // 调整到目标长度
  if (content.length < targetLength * 0.8) {
    content += getAdditionalContent(platform, contentType)
  }
  
  return content.substring(0, targetLength)
}

// 添加表情符号
const addEmojis = (content, platform) => {
  const emojis = {
    twitter: ['🚀', '💎', '🔥', '⭐', '💡'],
    instagram: ['✨', '💫', '🌟', '💖', '🎉'],
    facebook: ['👍', '❤️', '🔥', '💯', '🎯'],
    linkedin: ['📈', '💼', '🎯', '🚀', '💡'],
    tiktok: ['🔥', '💖', '✨', '🎉', '💯'],
    youtube: ['👀', '📺', '👇', '🔔', '❤️']
  }
  
  const platformEmojis = emojis[platform] || emojis.facebook
  const randomEmoji = platformEmojis[Math.floor(Math.random() * platformEmojis.length)]
  
  return content + ' ' + randomEmoji
}

// 添加行动号召
const addCallToAction = (content, platform) => {
  const ctas = {
    twitter: ['点击了解更多', '转发分享', '关注我们'],
    instagram: ['点赞收藏', '关注了解更多', '评论区见'],
    facebook: ['分享给朋友', '点击查看详情', '留言讨论'],
    linkedin: ['了解更多信息', '联系我们', '关注获取更新'],
    tiktok: ['双击小心心', '关注不迷路', '评论区讨论'],
    youtube: ['点赞订阅', '评论互动', '开启小铃铛']
  }
  
  const platformCTAs = ctas[platform] || ctas.facebook
  const randomCTA = platformCTAs[Math.floor(Math.random() * platformCTAs.length)]
  
  return content + ` ${randomCTA}！`
}

// 添加问题互动
const addQuestion = (content, platform) => {
  const questions = [
    '你们觉得呢？',
    '有同感的吗？',
    '你会选择哪个？',
    '评论区聊聊吧！',
    '大家怎么看？'
  ]
  
  const randomQuestion = questions[Math.floor(Math.random() * questions.length)]
  return content + ` ${randomQuestion}`
}

// 生成标签
const generateHashtags = (platform) => {
  const baseHashtags = formData.hashtags ? formData.hashtags.split(',').map(h => h.trim()) : []
  const contentTypeHashtags = {
    'product-promotion': ['产品推荐', '新品上市', '限时优惠'],
    'brand-awareness': ['品牌故事', '企业文化', '价值理念'],
    'event-promotion': ['活动预告', '报名参与', '限时活动'],
    'education': ['干货分享', '知识普及', '技能提升'],
    'customer-story': ['用户分享', '成功案例', '真实体验'],
    'industry-news': ['行业资讯', '趋势分析', '专业解读']
  }
  
  const typeHashtags = contentTypeHashtags[formData.contentType] || []
  const platformHashtags = {
    twitter: ['热门话题', '实时更新'],
    instagram: ['美图分享', '生活方式'],
    facebook: ['社区互动', '朋友分享'],
    linkedin: ['职场分享', '专业见解'],
    tiktok: ['创意内容', '热门挑战'],
    youtube: ['视频推荐', '订阅关注']
  }
  
  const allHashtags = [...baseHashtags, ...typeHashtags, ...(platformHashtags[platform] || [])]
  
  // 随机选择3-5个标签
  const selectedCount = Math.min(allHashtags.length, Math.floor(Math.random() * 3) + 3)
  return allHashtags.slice(0, selectedCount)
}

// 获取额外内容
const getAdditionalContent = (platform, contentType) => {
  const additions = {
    'product-promotion': '产品经过严格测试，品质有保障，现在购买还有专属优惠！',
    'brand-awareness': '我们致力于为用户提供最优质的服务体验，期待与您一同成长！',
    'event-promotion': '活动名额有限，先到先得，不要错过这个难得的机会！'
  }
  
  return additions[contentType] || '欢迎关注我们，获取更多精彩内容！'
}

// 获取平台结果
const getPlatformResults = (platform) => {
  return generatedResults.value.filter(result => result.platform === platform)
}

// 获取平台标签
const getPlatformLabel = (platform) => {
  const labels = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    twitter: 'Twitter/X',
    linkedin: 'LinkedIn',
    tiktok: 'TikTok',
    youtube: 'YouTube'
  }
  return labels[platform] || platform
}

// 获取平台限制
const getPlatformLimit = (platform) => {
  const limits = {
    twitter: 280,
    instagram: 2200,
    facebook: 2000,
    linkedin: 1300,
    tiktok: 150,
    youtube: 5000
  }
  return limits[platform] || 500
}

// 获取长度类型
const getLengthType = (length, platform) => {
  const limit = getPlatformLimit(platform)
  if (length < limit * 0.5) return 'success'
  if (length < limit * 0.8) return 'warning'
  return 'danger'
}

// 获取平均长度
const getAverageLength = (platform) => {
  const results = getPlatformResults(platform)
  if (results.length === 0) return 0
  const total = results.reduce((sum, result) => sum + result.length, 0)
  return Math.round(total / results.length)
}

// 获取平均评分
const getAverageRating = (platform) => {
  const results = getPlatformResults(platform)
  if (results.length === 0) return 0
  const total = results.reduce((sum, result) => sum + result.rating, 0)
  return Math.round((total / results.length) * 10) / 10
}

// 添加标签
const addHashtag = (tag) => {
  const currentTags = formData.hashtags ? formData.hashtags.split(',').map(h => h.trim()) : []
  if (!currentTags.includes(tag)) {
    formData.hashtags = currentTags.concat(tag).join(', ')
  }
}

// 复制内容
const copyContent = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('内容已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 编辑内容
const editContent = (platform, index) => {
  const result = getPlatformResults(platform)[index]
  editForm.platform = platform
  editForm.index = index
  editForm.text = result.text
  editForm.hashtagsText = result.hashtags ? result.hashtags.join(', ') : ''
  editDialogVisible.value = true
}

// 保存编辑
const saveEdit = () => {
  const results = getPlatformResults(editForm.platform)
  const result = results[editForm.index]
  
  result.text = editForm.text
  result.length = editForm.text.length
  result.hashtags = editForm.hashtagsText ? 
    editForm.hashtagsText.split(',').map(h => h.trim()) : []
  
  editDialogVisible.value = false
  ElMessage.success('编辑保存成功')
}

// 分享内容
const shareContent = (content) => {
  ElMessage.info('分享功能开发中...')
}

// 发布内容
const publishContent = async (platform, content) => {
  try {
    await ElMessageBox.confirm(
      `确定要将此内容发布到${getPlatformLabel(platform)}吗？`,
      '确认发布',
      {
        confirmButtonText: '确定发布',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    // 模拟发布过程
    ElMessage.success(`内容已成功发布到${getPlatformLabel(platform)}！`)
  } catch {
    // 用户取消
  }
}

// 更新评分
const updateRating = (platform, index, rating) => {
  const results = getPlatformResults(platform)
  results[index].rating = rating
}

// 导出全部
const exportAll = () => {
  const data = generatedResults.value.map(result => ({
    平台: getPlatformLabel(result.platform),
    内容: result.text,
    字数: result.length,
    标签: result.hashtags ? result.hashtags.join(', ') : '',
    评分: result.rating
  }))
  
  const csv = convertToCSV(data)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `社媒话术_${new Date().toISOString().split('T')[0]}.csv`)
  link.click()
  URL.revokeObjectURL(url)
  
  ElMessage.success('导出成功')
}

// 转换为CSV
const convertToCSV = (data) => {
  if (!data.length) return ''
  
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
  ].join('\n')
  
  return '\uFEFF' + csvContent // 添加BOM以支持中文
}

// 清空结果
const clearResults = () => {
  generatedResults.value = []
  activePlatform.value = ''
  ElMessage.success('结果已清空')
}
</script>

<style lang="scss" scoped>
.social-content-page {
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
  
  .platform-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    
    .platform-item {
      border: 1px solid #dcdfe6;
      border-radius: 8px;
      padding: 12px;
      transition: all 0.3s;
      
      &:hover {
        border-color: #409eff;
      }
      
      .platform-content {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .platform-icon {
          font-size: 20px;
          
          &.facebook { color: #1877f2; }
          &.instagram { color: #e4405f; }
          &.twitter { color: #1da1f2; }
          &.linkedin { color: #0077b5; }
          &.tiktok { color: #ff0050; }
          &.youtube { color: #ff0000; }
        }
      }
    }
  }
  
  .length-settings {
    .custom-length {
      margin-top: 16px;
      
      .length-hint {
        margin: 8px 0 0 0;
        font-size: 12px;
        color: #909399;
      }
    }
  }
  
  .hashtag-suggestions {
    margin-top: 8px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    
    .suggestion-tag {
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        background-color: #409eff;
        color: white;
      }
    }
  }
  
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

.results-panel {
  min-height: 600px;
}

.loading-container {
  text-align: center;
  padding: 40px 20px;
  
  .loading-text {
    margin: 20px 0;
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

.results-container {
  .platform-overview {
    margin-bottom: 24px;
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 8px;
    
    .quality-score {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .score-label {
        font-size: 14px;
        color: #606266;
      }
    }
  }
  
  .content-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .content-item {
    border: 1px solid #e4e7ed;
    border-radius: 12px;
    padding: 20px;
    background-color: white;
    transition: all 0.3s;
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .content-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      
      .content-meta {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
    }
    
    .content-body {
      margin-bottom: 16px;
      
      .content-text {
        line-height: 1.6;
        color: #303133;
        font-size: 15px;
        margin-bottom: 12px;
      }
      
      .content-hashtags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        
        .hashtag-item {
          font-size: 12px;
        }
      }
    }
    
    .content-footer {
      display: flex;
      justify-content: flex-end;
    }
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

@media (max-width: 768px) {
  .social-content-page {
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
  
  .platform-grid {
    grid-template-columns: 1fr !important;
  }
  
  .content-footer {
    .el-button-group {
      flex-wrap: wrap;
      gap: 8px;
    }
  }
}
</style>