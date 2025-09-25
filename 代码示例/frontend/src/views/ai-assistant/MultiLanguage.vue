<template>
  <div class="multi-language-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>多语言内容生成</h1>
      <p class="page-desc">使用AI技术生成多语言营销内容，支持本地化调整和术语库管理</p>
    </div>

    <el-row :gutter="24">
      <!-- 配置面板 -->
      <el-col :span="8">
        <el-card class="config-panel">
          <template #header>
            <div class="card-header">
              <span>生成配置</span>
              <el-tooltip content="配置多语言内容生成参数">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>

          <el-form :model="formData" label-width="120px" size="default">
            <!-- 源语言 -->
            <el-form-item label="源语言">
              <el-select v-model="formData.sourceLanguage" style="width: 100%">
                <el-option-group label="常用语言">
                  <el-option label="中文 (简体)" value="zh-CN" />
                  <el-option label="英语" value="en" />
                  <el-option label="日语" value="ja" />
                  <el-option label="韩语" value="ko" />
                </el-option-group>
                <el-option-group label="欧洲语言">
                  <el-option label="德语" value="de" />
                  <el-option label="法语" value="fr" />
                  <el-option label="西班牙语" value="es" />
                  <el-option label="意大利语" value="it" />
                  <el-option label="俄语" value="ru" />
                </el-option-group>
              </el-select>
            </el-form-item>

            <!-- 目标语言 -->
            <el-form-item label="目标语言">
              <div class="language-selection">
                <el-checkbox-group v-model="formData.targetLanguages">
                  <div class="language-grid">
                    <el-checkbox label="en" class="language-item">
                      <div class="language-content">
                        <span class="flag">🇺🇸</span>
                        <span>English</span>
                      </div>
                    </el-checkbox>
                    <el-checkbox label="ja" class="language-item">
                      <div class="language-content">
                        <span class="flag">🇯🇵</span>
                        <span>日本語</span>
                      </div>
                    </el-checkbox>
                    <el-checkbox label="ko" class="language-item">
                      <div class="language-content">
                        <span class="flag">🇰🇷</span>
                        <span>한국어</span>
                      </div>
                    </el-checkbox>
                    <el-checkbox label="de" class="language-item">
                      <div class="language-content">
                        <span class="flag">🇩🇪</span>
                        <span>Deutsch</span>
                      </div>
                    </el-checkbox>
                    <el-checkbox label="fr" class="language-item">
                      <div class="language-content">
                        <span class="flag">🇫🇷</span>
                        <span>Français</span>
                      </div>
                    </el-checkbox>
                    <el-checkbox label="es" class="language-item">
                      <div class="language-content">
                        <span class="flag">🇪🇸</span>
                        <span>Español</span>
                      </div>
                    </el-checkbox>
                    <el-checkbox label="it" class="language-item">
                      <div class="language-content">
                        <span class="flag">🇮🇹</span>
                        <span>Italiano</span>
                      </div>
                    </el-checkbox>
                    <el-checkbox label="ru" class="language-item">
                      <div class="language-content">
                        <span class="flag">🇷🇺</span>
                        <span>Русский</span>
                      </div>
                    </el-checkbox>
                  </div>
                </el-checkbox-group>
              </div>
            </el-form-item>

            <!-- 源内容 -->
            <el-form-item label="源内容">
              <el-input 
                v-model="formData.sourceContent" 
                type="textarea"
                :rows="6"
                placeholder="请输入要翻译和本地化的原始内容"
                maxlength="2000"
                show-word-limit
              />
            </el-form-item>

            <!-- 内容类型 -->
            <el-form-item label="内容类型">
              <el-select v-model="formData.contentType" placeholder="请选择内容类型" style="width: 100%">
                <el-option label="产品描述" value="product-description" />
                <el-option label="营销文案" value="marketing-copy" />
                <el-option label="广告标语" value="advertisement" />
                <el-option label="邮件内容" value="email-content" />
                <el-option label="网站内容" value="website-content" />
                <el-option label="社媒内容" value="social-media" />
                <el-option label="新闻稿" value="press-release" />
                <el-option label="技术文档" value="technical-docs" />
              </el-select>
            </el-form-item>

            <!-- 目标市场 -->
            <el-form-item label="目标市场">
              <el-select v-model="formData.targetMarket" multiple placeholder="选择目标市场" style="width: 100%">
                <el-option label="北美市场" value="north-america" />
                <el-option label="欧洲市场" value="europe" />
                <el-option label="亚洲市场" value="asia" />
                <el-option label="日本市场" value="japan" />
                <el-option label="韩国市场" value="korea" />
                <el-option label="东南亚市场" value="southeast-asia" />
                <el-option label="南美市场" value="south-america" />
                <el-option label="中东市场" value="middle-east" />
              </el-select>
            </el-form-item>

            <!-- 本地化级别 -->
            <el-form-item label="本地化级别">
              <el-radio-group v-model="formData.localizationLevel">
                <el-radio label="basic">基础翻译</el-radio>
                <el-radio label="standard">标准本地化</el-radio>
                <el-radio label="advanced">深度本地化</el-radio>
              </el-radio-group>
              <div class="localization-hint">
                <p v-if="formData.localizationLevel === 'basic'">只进行语言翻译</p>
                <p v-if="formData.localizationLevel === 'standard'">翻译 + 文化适配</p>
                <p v-if="formData.localizationLevel === 'advanced'">翻译 + 文化适配 + 市场习惯调整</p>
              </div>
            </el-form-item>

            <!-- 语气调整 -->
            <el-form-item label="语气调整">
              <el-checkbox-group v-model="formData.toneAdjustments">
                <el-checkbox label="formal">正式化</el-checkbox>
                <el-checkbox label="casual">口语化</el-checkbox>
                <el-checkbox label="respectful">礼貌性</el-checkbox>
                <el-checkbox label="persuasive">说服性</el-checkbox>
                <el-checkbox label="emotional">情感化</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <!-- 术语库应用 -->
            <el-form-item label="术语库">
              <el-switch 
                v-model="formData.useGlossary"
                active-text="使用术语库"
                inactive-text="不使用"
              />
              <div v-if="formData.useGlossary" class="glossary-selection">
                <el-select v-model="formData.selectedGlossary" placeholder="选择术语库" style="width: 100%; margin-top: 8px;">
                  <el-option label="通用营销术语" value="marketing-general" />
                  <el-option label="科技产品术语" value="tech-products" />
                  <el-option label="金融服务术语" value="financial-services" />
                  <el-option label="医疗健康术语" value="healthcare" />
                  <el-option label="教育培训术语" value="education" />
                </el-select>
                <el-button 
                  @click="showGlossaryManager = true" 
                  size="small" 
                  text 
                  style="margin-top: 8px;"
                >
                  管理术语库
                </el-button>
              </div>
            </el-form-item>

            <!-- AI模型选择 -->
            <el-form-item label="AI模型">
              <el-select v-model="formData.aiModel" style="width: 100%">
                <el-option label="GPT-4 (推荐)" value="gpt-4" />
                <el-option label="Claude-3" value="claude-3" />
                <el-option label="谷歌翻译增强" value="google-translate-plus" />
                <el-option label="DeepL专业版" value="deepl-pro" />
              </el-select>
            </el-form-item>

            <!-- 生成按钮 -->
            <el-form-item>
              <el-button 
                type="primary" 
                :loading="generating" 
                @click="generateTranslations"
                :disabled="!canGenerate"
                style="width: 100%"
                size="large"
              >
                <el-icon v-if="!generating"><MagicStick /></el-icon>
                {{ generating ? '生成中...' : '生成多语言内容' }}
              </el-button>
            </el-form-item>

            <!-- 使用统计 -->
            <div class="usage-stats">
              <el-divider>今日使用量</el-divider>
              <div class="stats-item">
                <span>已翻译：</span>
                <el-tag type="success">{{ dailyUsage }}/200</el-tag>
              </div>
              <el-progress 
                :percentage="Math.round((dailyUsage / 200) * 100)" 
                :color="progressColor"
                :stroke-width="8"
              />
            </div>
          </el-form>
        </el-card>
      </el-col>

      <!-- 结果展示面板 -->
      <el-col :span="16">
        <el-card class="results-panel">
          <template #header>
            <div class="card-header">
              <span>翻译结果</span>
              <div class="header-actions" v-if="translations.length > 0">
                <el-button @click="compareMode = !compareMode" size="small">
                  {{ compareMode ? '列表视图' : '对比视图' }}
                </el-button>
                <el-button @click="exportTranslations" size="small" :icon="Download">
                  导出
                </el-button>
              </div>
            </div>
          </template>

          <!-- 加载状态 -->
          <div v-if="generating" class="loading-container">
            <el-skeleton :rows="8" animated />
            <div class="loading-text">
              <el-icon class="rotating"><Loading /></el-icon>
              正在生成{{ formData.targetLanguages.length }}种语言版本，请稍候...
            </div>
            <el-progress :percentage="generateProgress" :stroke-width="8" />
          </div>

          <!-- 对比视图 -->
          <div v-else-if="translations.length > 0 && compareMode" class="compare-view">
            <div class="source-content">
              <h3>原文 ({{ getLanguageLabel(formData.sourceLanguage) }})</h3>
              <div class="content-box source">{{ formData.sourceContent }}</div>
            </div>
            
            <div class="translations-grid">
              <div 
                v-for="translation in translations" 
                :key="translation.language"
                class="translation-item"
              >
                <div class="translation-header">
                  <span class="language-name">
                    {{ getLanguageFlag(translation.language) }} {{ getLanguageLabel(translation.language) }}
                  </span>
                  <div class="translation-actions">
                    <el-rate 
                      v-model="translation.rating" 
                      size="small"
                      @change="updateRating(translation.language, $event)"
                    />
                  </div>
                </div>
                
                <div class="content-box translation">
                  <div class="translation-content">{{ translation.content }}</div>
                  <div class="translation-meta">
                    <el-tag size="small">{{ translation.content.length }}字符</el-tag>
                    <el-tag size="small" :type="getQualityType(translation.quality)">
                      质量: {{ translation.quality }}%
                    </el-tag>
                  </div>
                </div>
                
                <div class="translation-tools">
                  <el-button-group size="small">
                    <el-button @click="copyTranslation(translation.content)" :icon="DocumentCopy">
                      复制
                    </el-button>
                    <el-button @click="editTranslation(translation)" :icon="Edit">
                      编辑
                    </el-button>
                    <el-button @click="regenerateTranslation(translation.language)" :icon="Refresh">
                      重新生成
                    </el-button>
                  </el-button-group>
                </div>
              </div>
            </div>
          </div>

          <!-- 列表视图 -->
          <div v-else-if="translations.length > 0" class="list-view">
            <el-tabs v-model="activeLanguage" type="border-card">
              <el-tab-pane 
                v-for="translation in translations" 
                :key="translation.language"
                :name="translation.language"
              >
                <template #label>
                  <span>
                    {{ getLanguageFlag(translation.language) }} {{ getLanguageLabel(translation.language) }}
                  </span>
                </template>
                
                <div class="translation-detail">
                  <!-- 翻译统计 -->
                  <div class="translation-stats">
                    <el-row :gutter="16">
                      <el-col :span="6">
                        <el-statistic title="字符数" :value="translation.content.length" />
                      </el-col>
                      <el-col :span="6">
                        <el-statistic title="翻译质量" :value="translation.quality" suffix="%" />
                      </el-col>
                      <el-col :span="6">
                        <el-statistic title="本地化程度" :value="translation.localization" suffix="%" />
                      </el-col>
                      <el-col :span="6">
                        <div class="rating-section">
                          <span class="rating-label">用户评分：</span>
                          <el-rate 
                            v-model="translation.rating" 
                            @change="updateRating(translation.language, $event)"
                          />
                        </div>
                      </el-col>
                    </el-row>
                  </div>

                  <!-- 翻译内容 -->
                  <div class="translation-content-section">
                    <h4>翻译内容</h4>
                    <div class="content-display">
                      <el-input 
                        v-model="translation.content"
                        type="textarea"
                        :rows="8"
                        readonly
                        class="translation-textarea"
                      />
                    </div>
                  </div>

                  <!-- 本地化建议 -->
                  <div v-if="translation.suggestions && translation.suggestions.length > 0" class="suggestions-section">
                    <h4>本地化建议</h4>
                    <el-alert 
                      v-for="(suggestion, index) in translation.suggestions" 
                      :key="index"
                      :title="suggestion.title"
                      :description="suggestion.description"
                      type="info"
                      show-icon
                      class="suggestion-item"
                    />
                  </div>

                  <!-- 关键词对照 -->
                  <div v-if="translation.keywords && translation.keywords.length > 0" class="keywords-section">
                    <h4>关键词对照</h4>
                    <el-table :data="translation.keywords" size="small">
                      <el-table-column prop="source" label="原文" width="200" />
                      <el-table-column prop="target" label="译文" width="200" />
                      <el-table-column prop="note" label="注释" />
                    </el-table>
                  </div>

                  <!-- 操作按钮 -->
                  <div class="translation-actions-full">
                    <el-button-group>
                      <el-button @click="copyTranslation(translation.content)" :icon="DocumentCopy">
                        复制翻译
                      </el-button>
                      <el-button @click="editTranslation(translation)" :icon="Edit">
                        编辑内容
                      </el-button>
                      <el-button @click="regenerateTranslation(translation.language)" :icon="Refresh">
                        重新翻译
                      </el-button>
                      <el-button @click="saveToLibrary(translation)" :icon="Collection">
                        保存到库
                      </el-button>
                      <el-button @click="applyTranslation(translation)" :icon="Check" type="primary">
                        应用翻译
                      </el-button>
                    </el-button-group>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>

          <!-- 空状态 -->
          <div v-else class="empty-state">
            <el-empty description="请配置参数并点击生成按钮">
              <el-icon class="empty-icon"><ChatLineRound /></el-icon>
              <p>输入源内容，AI将为您生成多语言版本</p>
            </el-empty>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 术语库管理对话框 -->
    <el-dialog 
      v-model="showGlossaryManager"
      title="术语库管理"
      width="80%"
      destroy-on-close
    >
      <div class="glossary-manager">
        <div class="glossary-header">
          <el-button @click="addGlossaryTerm" type="primary" :icon="Plus">
            添加术语
          </el-button>
        </div>
        
        <el-table :data="glossaryTerms" height="400">
          <el-table-column prop="source" label="源语言" width="200" />
          <el-table-column prop="target" label="目标语言" width="200" />
          <el-table-column prop="category" label="分类" width="120" />
          <el-table-column prop="note" label="备注" />
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button size="small" @click="editGlossaryTerm(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteGlossaryTerm(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog 
      v-model="editDialogVisible"
      title="编辑翻译内容"
      width="70%"
      destroy-on-close
    >
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="语言">
          <el-tag>{{ getLanguageLabel(editForm.language) }}</el-tag>
        </el-form-item>
        <el-form-item label="内容">
          <el-input 
            v-model="editForm.content"
            type="textarea"
            :rows="10"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveTranslationEdit">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  InfoFilled, MagicStick, Loading, DocumentCopy, Download, Edit, Refresh,
  ChatLineRound, Check, Collection, Plus
} from '@element-plus/icons-vue'

// 表单数据
const formData = reactive({
  sourceLanguage: 'zh-CN',
  targetLanguages: [],
  sourceContent: '',
  contentType: '',
  targetMarket: [],
  localizationLevel: 'standard',
  toneAdjustments: ['respectful'],
  useGlossary: false,
  selectedGlossary: '',
  aiModel: 'gpt-4'
})

// 生成状态
const generating = ref(false)
const generateProgress = ref(0)
const dailyUsage = ref(36)
const compareMode = ref(false)
const activeLanguage = ref('')
const translations = ref([])

// 对话框状态
const showGlossaryManager = ref(false)
const editDialogVisible = ref(false)
const editForm = reactive({
  language: '',
  content: ''
})

// 术语库数据
const glossaryTerms = ref([
  { source: '产品', target: 'Product', category: '营销', note: '通用产品术语' },
  { source: '服务', target: 'Service', category: '营销', note: '服务类术语' },
  { source: '优惠', target: 'Discount', category: '营销', note: '促销相关' }
])

// 计算属性
const canGenerate = computed(() => {
  return formData.sourceContent.trim() && 
         formData.targetLanguages.length > 0 && 
         dailyUsage.value < 200
})

const progressColor = computed(() => {
  const percentage = (dailyUsage.value / 200) * 100
  if (percentage < 50) return '#67c23a'
  if (percentage < 80) return '#e6a23c'
  return '#f56c6c'
})

// 监听目标语言变化
watch(() => formData.targetLanguages, (newLanguages) => {
  if (newLanguages.length > 0 && !activeLanguage.value) {
    activeLanguage.value = newLanguages[0]
  }
}, { immediate: true })

// 语言标签映射
const languageLabels = {
  'zh-CN': '中文(简体)',
  'en': 'English',
  'ja': '日本語',
  'ko': '한국어',
  'de': 'Deutsch',
  'fr': 'Français',
  'es': 'Español',
  'it': 'Italiano',
  'ru': 'Русский'
}

// 语言旗帜映射
const languageFlags = {
  'zh-CN': '🇨🇳',
  'en': '🇺🇸',
  'ja': '🇯🇵',
  'ko': '🇰🇷',
  'de': '🇩🇪',
  'fr': '🇫🇷',
  'es': '🇪🇸',
  'it': '🇮🇹',
  'ru': '🇷🇺'
}

// 获取语言标签
const getLanguageLabel = (language) => {
  return languageLabels[language] || language
}

// 获取语言旗帜
const getLanguageFlag = (language) => {
  return languageFlags[language] || '🌍'
}

// 获取质量类型
const getQualityType = (quality) => {
  if (quality >= 90) return 'success'
  if (quality >= 75) return 'warning'
  return 'danger'
}

// 生成翻译
const generateTranslations = async () => {
  if (!canGenerate.value) {
    ElMessage.warning('请完善必填参数或检查今日使用量')
    return
  }

  generating.value = true
  generateProgress.value = 0
  
  try {
    const results = []
    
    // 为每种目标语言生成翻译
    for (let i = 0; i < formData.targetLanguages.length; i++) {
      const language = formData.targetLanguages[i]
      
      generateProgress.value = Math.round(((i + 1) / formData.targetLanguages.length) * 100)
      
      // 模拟AI翻译过程
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const translation = await generateTranslation(language)
      results.push(translation)
    }
    
    translations.value = results
    activeLanguage.value = formData.targetLanguages[0]
    dailyUsage.value += formData.targetLanguages.length
    
    ElMessage.success(`成功生成${results.length}种语言版本！`)
  } catch (error) {
    ElMessage.error('生成失败，请重试')
  } finally {
    generating.value = false
    generateProgress.value = 0
  }
}

// 生成单个语言的翻译
const generateTranslation = async (language) => {
  const sourceContent = formData.sourceContent
  
  // 模拟翻译内容生成
  let translatedContent = translateContent(sourceContent, language)
  
  // 根据本地化级别调整内容
  if (formData.localizationLevel === 'standard') {
    translatedContent = applyCulturalAdaptation(translatedContent, language)
  } else if (formData.localizationLevel === 'advanced') {
    translatedContent = applyAdvancedLocalization(translatedContent, language)
  }
  
  // 应用语气调整
  translatedContent = applyToneAdjustments(translatedContent, language, formData.toneAdjustments)
  
  return {
    language,
    content: translatedContent,
    quality: Math.round(85 + Math.random() * 10),
    localization: Math.round(75 + Math.random() * 20),
    rating: 4 + Math.random(),
    suggestions: generateSuggestions(language),
    keywords: generateKeywords(sourceContent, translatedContent)
  }
}

// 基础翻译功能
const translateContent = (content, targetLanguage) => {
  // 简化的翻译逻辑，实际应该调用翻译API
  const translations = {
    'en': translateToEnglish(content),
    'ja': translateToJapanese(content),
    'ko': translateToKorean(content),
    'de': translateToGerman(content),
    'fr': translateToFrench(content),
    'es': translateToSpanish(content),
    'it': translateToItalian(content),
    'ru': translateToRussian(content)
  }
  
  return translations[targetLanguage] || content
}

// 各语言翻译函数（示例）
const translateToEnglish = (content) => {
  return `Discover our innovative products and services that will transform your business experience. We are committed to providing the highest quality solutions to meet your needs.`
}

const translateToJapanese = (content) => {
  return `革新的な製品とサービスを発見し、ビジネス体験を変革しましょう。お客様のニーズにお応えする最高品質のソリューションを提供することをお約束いたします。`
}

const translateToKorean = (content) => {
  return `혁신적인 제품과 서비스를 발견하고 비즈니스 경험을 혁신하세요. 고객의 요구사항을 충족하는 최고 품질의 솔루션을 제공하는 것을 약속드립니다.`
}

const translateToGerman = (content) => {
  return `Entdecken Sie unsere innovativen Produkte und Dienstleistungen, die Ihr Geschäftserlebnis transformieren werden. Wir verpflichten uns, Ihnen qualitativ hochwertige Lösungen zu bieten.`
}

const translateToFrench = (content) => {
  return `Découvrez nos produits et services innovants qui transformeront votre expérience commerciale. Nous nous engageons à fournir des solutions de la plus haute qualité.`
}

const translateToSpanish = (content) => {
  return `Descubra nuestros productos y servicios innovadores que transformarán su experiencia empresarial. Estamos comprometidos a brindar soluciones de la más alta calidad.`
}

const translateToItalian = (content) => {
  return `Scoprite i nostri prodotti e servizi innovativi che trasformeranno la vostra esperienza aziendale. Ci impegniamo a fornire soluzioni di altissima qualità.`
}

const translateToRussian = (content) => {
  return `Откройте для себя наши инновационные продукты и услуги, которые преобразят ваш бизнес-опыт. Мы стремимся предоставлять решения высочайшего качества.`
}

// 文化适配
const applyCulturalAdaptation = (content, language) => {
  // 根据文化特点调整内容
  const culturalAdaptations = {
    'ja': (text) => text.replace(/您/g, 'お客様').replace(/我们/g, '私ども'),
    'ko': (text) => text.replace(/您/g, '고객님').replace(/我们/g, '저희'),
    'de': (text) => text.replace(/你好/g, 'Guten Tag'),
    'fr': (text) => text.replace(/你好/g, 'Bonjour')
  }
  
  return culturalAdaptations[language] ? culturalAdaptations[language](content) : content
}

// 高级本地化
const applyAdvancedLocalization = (content, language) => {
  // 深度本地化调整
  content = applyCulturalAdaptation(content, language)
  
  // 添加市场特色调整
  if (language === 'ja') {
    content = content + ' どうぞよろしくお願いいたします。'
  } else if (language === 'ko') {
    content = content + ' 감사합니다.'
  }
  
  return content
}

// 语气调整
const applyToneAdjustments = (content, language, adjustments) => {
  adjustments.forEach(adjustment => {
    switch (adjustment) {
      case 'formal':
        // 增加正式感
        if (language === 'en') {
          content = content.replace(/we're/g, 'we are').replace(/don't/g, 'do not')
        }
        break
      case 'respectful':
        // 增加礼貌性
        if (language === 'ja') {
          content = content.replace(/です/g, 'でございます')
        }
        break
    }
  })
  
  return content
}

// 生成本地化建议
const generateSuggestions = (language) => {
  const suggestions = {
    'ja': [
      { title: '敬语使用', description: '建议在商业环境中使用更多敬语表达' },
      { title: '文化适应', description: '考虑日本商务文化的含蓄特点' }
    ],
    'ko': [
      { title: '尊敬语', description: '使用适当的尊敬语形式' },
      { title: '文化敏感', description: '注意韩国商业文化的层级关系' }
    ],
    'de': [
      { title: '正式性', description: '德语商务交流倾向于更加正式' },
      { title: '准确性', description: '德语重视准确和详细的信息' }
    ]
  }
  
  return suggestions[language] || []
}

// 生成关键词对照
const generateKeywords = (sourceContent, translatedContent) => {
  return [
    { source: '产品', target: 'Product', note: '核心业务术语' },
    { source: '服务', target: 'Service', note: '服务类别' },
    { source: '质量', target: 'Quality', note: '品质相关' }
  ]
}

// 复制翻译
const copyTranslation = async (content) => {
  try {
    await navigator.clipboard.writeText(content)
    ElMessage.success('翻译内容已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 编辑翻译
const editTranslation = (translation) => {
  editForm.language = translation.language
  editForm.content = translation.content
  editDialogVisible.value = true
}

// 保存编辑
const saveTranslationEdit = () => {
  const translation = translations.value.find(t => t.language === editForm.language)
  if (translation) {
    translation.content = editForm.content
    editDialogVisible.value = false
    ElMessage.success('编辑保存成功')
  }
}

// 重新生成翻译
const regenerateTranslation = async (language) => {
  const index = translations.value.findIndex(t => t.language === language)
  if (index >= 0) {
    ElMessage.loading('正在重新生成翻译...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const newTranslation = await generateTranslation(language)
    translations.value[index] = newTranslation
    
    ElMessage.success('翻译已重新生成')
  }
}

// 更新评分
const updateRating = (language, rating) => {
  const translation = translations.value.find(t => t.language === language)
  if (translation) {
    translation.rating = rating
  }
}

// 保存到库
const saveToLibrary = (translation) => {
  ElMessage.success('翻译已保存到翻译库')
}

// 应用翻译
const applyTranslation = (translation) => {
  ElMessage.success(`${getLanguageLabel(translation.language)}版本已应用`)
}

// 导出翻译
const exportTranslations = () => {
  const data = translations.value.map(translation => ({
    语言: getLanguageLabel(translation.language),
    内容: translation.content,
    质量: translation.quality + '%',
    本地化程度: translation.localization + '%',
    评分: translation.rating
  }))
  
  const csv = convertToCSV(data)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `多语言翻译_${new Date().toISOString().split('T')[0]}.csv`)
  link.click()
  URL.revokeObjectURL(url)
  
  ElMessage.success('翻译结果已导出')
}

// 转换为CSV
const convertToCSV = (data) => {
  if (!data.length) return ''
  
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
  ].join('\n')
  
  return '\uFEFF' + csvContent
}

// 术语库管理
const addGlossaryTerm = () => {
  glossaryTerms.value.push({
    source: '',
    target: '',
    category: '',
    note: ''
  })
}

const editGlossaryTerm = (term) => {
  // 编辑术语逻辑
}

const deleteGlossaryTerm = (index) => {
  glossaryTerms.value.splice(index, 1)
}
</script>

<style lang="scss" scoped>
.multi-language-page {
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
  
  .language-selection {
    .language-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      
      .language-item {
        border: 1px solid #dcdfe6;
        border-radius: 8px;
        padding: 12px;
        transition: all 0.3s;
        
        &:hover {
          border-color: #409eff;
        }
        
        .language-content {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .flag {
            font-size: 18px;
          }
        }
      }
    }
  }
  
  .localization-hint {
    margin-top: 8px;
    
    p {
      margin: 0;
      font-size: 12px;
      color: #909399;
    }
  }
  
  .glossary-selection {
    margin-top: 8px;
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

.compare-view {
  .source-content {
    margin-bottom: 24px;
    
    h3 {
      margin: 0 0 12px 0;
      color: #303133;
    }
    
    .content-box.source {
      background-color: #f0f9ff;
      border: 1px solid #bfdbfe;
    }
  }
  
  .translations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 20px;
  }
  
  .translation-item {
    border: 1px solid #e4e7ed;
    border-radius: 12px;
    padding: 16px;
    background-color: white;
    
    .translation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      
      .language-name {
        font-weight: 600;
        color: #303133;
      }
    }
    
    .content-box {
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      
      &.translation {
        background-color: #f8f9fa;
        border: 1px solid #e9ecef;
      }
      
      .translation-content {
        line-height: 1.6;
        margin-bottom: 8px;
      }
      
      .translation-meta {
        display: flex;
        gap: 8px;
      }
    }
    
    .translation-tools {
      display: flex;
      justify-content: center;
    }
  }
}

.list-view {
  .translation-detail {
    .translation-stats {
      margin-bottom: 24px;
      padding: 20px;
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
    
    .translation-content-section,
    .suggestions-section,
    .keywords-section {
      margin-bottom: 24px;
      
      h4 {
        margin: 0 0 12px 0;
        color: #303133;
        font-size: 16px;
      }
    }
    
    .content-display {
      .translation-textarea {
        :deep(.el-textarea__inner) {
          background-color: #fafafa;
          border: 1px solid #e4e7ed;
        }
      }
    }
    
    .suggestion-item {
      margin-bottom: 8px;
    }
    
    .translation-actions-full {
      display: flex;
      justify-content: center;
      padding-top: 20px;
      border-top: 1px solid #e4e7ed;
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

.glossary-manager {
  .glossary-header {
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

@media (max-width: 768px) {
  .multi-language-page {
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
  
  .language-grid {
    grid-template-columns: 1fr !important;
  }
  
  .translations-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>