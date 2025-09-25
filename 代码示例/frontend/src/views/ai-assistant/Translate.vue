<template>
  <div class="translate-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>AI翻译助手</h1>
      <p class="page-desc">专业的多语言翻译工具，支持批量翻译、术语管理和翻译记忆功能</p>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="primary" @click="handleTranslate" :loading="translating">
          <el-icon><MagicStick /></el-icon>
          立即翻译
        </el-button>
        <el-button @click="clearAll">
          <el-icon><Refresh /></el-icon>
          清空内容
        </el-button>
        <el-button @click="swapLanguages" :disabled="!canSwap">
          <el-icon><Switch /></el-icon>
          切换语言
        </el-button>
      </div>
      <div class="toolbar-right">
        <el-button @click="showHistory">
          <el-icon><Clock /></el-icon>
          翻译历史
        </el-button>
        <el-button @click="showTermsDialog = true">
          <el-icon><Collection /></el-icon>
          术语库
        </el-button>
        <el-button @click="showSettings">
          <el-icon><Setting /></el-icon>
          设置
        </el-button>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="translate-container">
      <el-row :gutter="20">
        <!-- 源文本区域 -->
        <el-col :span="11">
          <div class="translate-panel source-panel">
            <div class="panel-header">
              <el-select 
                v-model="sourceLanguage" 
                placeholder="源语言"
                @change="handleSourceLanguageChange"
              >
                <el-option label="自动检测" value="auto" />
                <el-option
                  v-for="lang in languages"
                  :key="lang.code"
                  :label="lang.name"
                  :value="lang.code"
                >
                  <span style="float: left">{{ lang.flag }} {{ lang.name }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ lang.code }}</span>
                </el-option>
              </el-select>
              
              <div class="panel-actions">
                <el-tooltip content="上传文件">
                  <el-button text @click="uploadFile">
                    <el-icon><Upload /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="粘贴">
                  <el-button text @click="pasteText">
                    <el-icon><DocumentCopy /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="清空">
                  <el-button text @click="clearSource">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </div>
            
            <div class="panel-body">
              <el-input
                v-model="sourceText"
                type="textarea"
                :rows="15"
                placeholder="请输入要翻译的文本，支持批量翻译（每行一条）"
                @input="handleSourceInput"
              />
              
              <div class="text-counter">
                <span>{{ sourceText.length }} / 5000 字符</span>
                <span v-if="sourceLines > 1">（{{ sourceLines }} 行）</span>
              </div>
              
              <!-- 检测到的语言 -->
              <div v-if="detectedLanguage && sourceLanguage === 'auto'" class="detected-language">
                <el-icon><InfoFilled /></el-icon>
                检测到：{{ getLanguageName(detectedLanguage) }}
              </div>
            </div>
          </div>
        </el-col>

        <!-- 中间操作区 -->
        <el-col :span="2" class="translate-actions">
          <el-button
            type="primary"
            circle
            size="large"
            @click="handleTranslate"
            :loading="translating"
            :disabled="!sourceText.trim()"
          >
            <el-icon><Right /></el-icon>
          </el-button>
        </el-col>

        <!-- 目标文本区域 -->
        <el-col :span="11">
          <div class="translate-panel target-panel">
            <div class="panel-header">
              <el-select 
                v-model="targetLanguage" 
                placeholder="目标语言"
                @change="handleTargetLanguageChange"
              >
                <el-option
                  v-for="lang in targetLanguages"
                  :key="lang.code"
                  :label="lang.name"
                  :value="lang.code"
                >
                  <span style="float: left">{{ lang.flag }} {{ lang.name }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ lang.code }}</span>
                </el-option>
              </el-select>
              
              <div class="panel-actions">
                <el-tooltip content="复制">
                  <el-button text @click="copyTranslation" :disabled="!targetText">
                    <el-icon><DocumentCopy /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="下载">
                  <el-button text @click="downloadTranslation" :disabled="!targetText">
                    <el-icon><Download /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="分享">
                  <el-button text @click="shareTranslation" :disabled="!targetText">
                    <el-icon><Share /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </div>
            
            <div class="panel-body">
              <el-input
                v-model="targetText"
                type="textarea"
                :rows="15"
                placeholder="翻译结果将显示在这里"
                readonly
              />
              
              <div class="text-counter">
                <span>{{ targetText.length }} 字符</span>
                <span v-if="targetLines > 1">（{{ targetLines }} 行）</span>
              </div>
              
              <!-- 翻译质量评分 -->
              <div v-if="translationScore" class="translation-score">
                <span>翻译质量：</span>
                <el-rate
                  v-model="translationScore"
                  disabled
                  show-score
                  text-color="#ff9900"
                />
              </div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 高级功能区 -->
      <div class="advanced-features">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="批量翻译" name="batch">
            <div class="batch-translate">
              <el-upload
                class="upload-demo"
                drag
                action="#"
                :auto-upload="false"
                :on-change="handleBatchFile"
                accept=".txt,.csv,.xlsx"
              >
                <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
                <div class="el-upload__text">
                  将文件拖到此处，或<em>点击上传</em>
                </div>
                <template #tip>
                  <div class="el-upload__tip">
                    支持 txt/csv/xlsx 格式，文件大小不超过 10MB
                  </div>
                </template>
              </el-upload>
              
              <div v-if="batchItems.length > 0" class="batch-list">
                <el-table :data="batchItems" style="width: 100%" max-height="300">
                  <el-table-column prop="source" label="原文" min-width="200" />
                  <el-table-column prop="target" label="译文" min-width="200">
                    <template #default="{ row }">
                      <span v-if="row.target">{{ row.target }}</span>
                      <el-tag v-else-if="row.status === 'pending'" size="small">待翻译</el-tag>
                      <el-tag v-else-if="row.status === 'translating'" type="info" size="small">翻译中</el-tag>
                      <el-tag v-else-if="row.status === 'error'" type="danger" size="small">失败</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="status" label="状态" width="100">
                    <template #default="{ row }">
                      <el-icon v-if="row.status === 'completed'" color="#67C23A"><CircleCheck /></el-icon>
                      <el-icon v-else-if="row.status === 'translating'" color="#409EFF"><Loading /></el-icon>
                      <el-icon v-else-if="row.status === 'error'" color="#F56C6C"><CircleClose /></el-icon>
                      <el-icon v-else color="#909399"><Timer /></el-icon>
                    </template>
                  </el-table-column>
                </el-table>
                
                <div class="batch-actions">
                  <el-button type="primary" @click="startBatchTranslate" :loading="batchTranslating">
                    开始批量翻译
                  </el-button>
                  <el-button @click="exportBatchResults" :disabled="!hasBatchResults">
                    导出结果
                  </el-button>
                  <el-button @click="clearBatch">清空列表</el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="翻译记忆" name="memory">
            <div class="translation-memory">
              <div class="memory-stats">
                <el-row :gutter="20">
                  <el-col :span="6">
                    <el-statistic title="记忆库条目" :value="memoryStats.total" />
                  </el-col>
                  <el-col :span="6">
                    <el-statistic title="今日新增" :value="memoryStats.today" />
                  </el-col>
                  <el-col :span="6">
                    <el-statistic title="匹配率" :value="memoryStats.matchRate" suffix="%" />
                  </el-col>
                  <el-col :span="6">
                    <el-statistic title="节省字符" :value="memoryStats.saved" />
                  </el-col>
                </el-row>
              </div>
              
              <el-table :data="memoryList" style="width: 100%" max-height="300">
                <el-table-column prop="source" label="原文" min-width="150" />
                <el-table-column prop="target" label="译文" min-width="150" />
                <el-table-column prop="language" label="语言对" width="120" />
                <el-table-column prop="usageCount" label="使用次数" width="100" />
                <el-table-column prop="lastUsed" label="最后使用" width="150" />
                <el-table-column label="操作" width="100">
                  <template #default="{ row }">
                    <el-button type="text" size="small" @click="useMemory(row)">使用</el-button>
                    <el-button type="text" size="small" @click="deleteMemory(row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="翻译对比" name="compare">
            <div class="translation-compare">
              <el-row :gutter="20">
                <el-col :span="8" v-for="engine in translationEngines" :key="engine.id">
                  <el-card>
                    <template #header>
                      <div class="engine-header">
                        <span>{{ engine.name }}</span>
                        <el-tag :type="engine.status === 'active' ? 'success' : 'info'" size="small">
                          {{ engine.status === 'active' ? '可用' : '不可用' }}
                        </el-tag>
                      </div>
                    </template>
                    <div class="engine-result">
                      <div v-if="engine.result" class="result-text">
                        {{ engine.result }}
                      </div>
                      <div v-else class="no-result">
                        暂无翻译结果
                      </div>
                      <div class="result-meta">
                        <span v-if="engine.time">耗时：{{ engine.time }}ms</span>
                        <el-rate
                          v-if="engine.result"
                          v-model="engine.rating"
                          size="small"
                          @change="rateEngine(engine)"
                        />
                      </div>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 术语库对话框 -->
    <el-dialog
      v-model="showTermsDialog"
      title="术语库管理"
      width="800px"
    >
      <div class="terms-management">
        <div class="terms-toolbar">
          <el-button type="primary" size="small" @click="addTerm">
            <el-icon><Plus /></el-icon>
            添加术语
          </el-button>
          <el-button size="small" @click="importTerms">
            <el-icon><Upload /></el-icon>
            导入术语
          </el-button>
          <el-button size="small" @click="exportTerms">
            <el-icon><Download /></el-icon>
            导出术语
          </el-button>
          <el-input
            v-model="termSearchKeyword"
            placeholder="搜索术语"
            style="width: 200px; margin-left: auto"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        
        <el-table :data="filteredTerms" style="width: 100%" max-height="400">
          <el-table-column prop="source" label="原文" min-width="150" />
          <el-table-column prop="target" label="译文" min-width="150" />
          <el-table-column prop="category" label="分类" width="100" />
          <el-table-column prop="note" label="备注" min-width="150" />
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button type="text" size="small" @click="editTerm(row)">编辑</el-button>
              <el-button type="text" size="small" @click="deleteTerm(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 翻译历史对话框 -->
    <el-dialog
      v-model="showHistoryDialog"
      title="翻译历史"
      width="900px"
    >
      <div class="history-management">
        <el-table :data="translationHistory" style="width: 100%" max-height="500">
          <el-table-column prop="timestamp" label="时间" width="160">
            <template #default="{ row }">
              {{ formatTime(row.timestamp) }}
            </template>
          </el-table-column>
          <el-table-column prop="source" label="原文" min-width="200" show-overflow-tooltip />
          <el-table-column prop="target" label="译文" min-width="200" show-overflow-tooltip />
          <el-table-column prop="sourceLang" label="源语言" width="100" />
          <el-table-column prop="targetLang" label="目标语言" width="100" />
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button type="text" size="small" @click="reuseHistory(row)">使用</el-button>
              <el-button type="text" size="small" @click="deleteHistory(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="history-footer">
          <el-button @click="clearHistory" type="danger">清空历史</el-button>
          <el-button @click="exportHistory">导出历史</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  MagicStick, Refresh, Switch, Clock, Collection, Setting,
  Upload, DocumentCopy, Delete, InfoFilled, Right, Download,
  Share, UploadFilled, CircleCheck, Loading, CircleClose, Timer,
  Plus, Search
} from '@element-plus/icons-vue'

// 语言列表
const languages = [
  { code: 'zh-CN', name: '中文（简体）', flag: '🇨🇳' },
  { code: 'zh-TW', name: '中文（繁体）', flag: '🇹🇼' },
  { code: 'en', name: '英语', flag: '🇺🇸' },
  { code: 'ja', name: '日语', flag: '🇯🇵' },
  { code: 'ko', name: '韩语', flag: '🇰🇷' },
  { code: 'es', name: '西班牙语', flag: '🇪🇸' },
  { code: 'fr', name: '法语', flag: '🇫🇷' },
  { code: 'de', name: '德语', flag: '🇩🇪' },
  { code: 'ru', name: '俄语', flag: '🇷🇺' },
  { code: 'ar', name: '阿拉伯语', flag: '🇸🇦' },
  { code: 'pt', name: '葡萄牙语', flag: '🇵🇹' },
  { code: 'it', name: '意大利语', flag: '🇮🇹' },
  { code: 'nl', name: '荷兰语', flag: '🇳🇱' },
  { code: 'pl', name: '波兰语', flag: '🇵🇱' },
  { code: 'th', name: '泰语', flag: '🇹🇭' },
  { code: 'vi', name: '越南语', flag: '🇻🇳' },
  { code: 'id', name: '印尼语', flag: '🇮🇩' },
  { code: 'ms', name: '马来语', flag: '🇲🇾' },
  { code: 'hi', name: '印地语', flag: '🇮🇳' },
  { code: 'tr', name: '土耳其语', flag: '🇹🇷' }
]

// 状态数据
const sourceLanguage = ref('auto')
const targetLanguage = ref('en')
const sourceText = ref('')
const targetText = ref('')
const translating = ref(false)
const detectedLanguage = ref('')
const translationScore = ref(0)
const activeTab = ref('batch')
const showTermsDialog = ref(false)
const showHistoryDialog = ref(false)
const termSearchKeyword = ref('')

// 批量翻译数据
const batchItems = ref([])
const batchTranslating = ref(false)

// 翻译记忆数据
const memoryStats = reactive({
  total: 1258,
  today: 42,
  matchRate: 78.5,
  saved: 52300
})

const memoryList = ref([
  {
    source: '产品介绍',
    target: 'Product Introduction',
    language: 'zh-CN → en',
    usageCount: 25,
    lastUsed: '2024-01-20 14:30'
  },
  {
    source: '联系我们',
    target: 'Contact Us',
    language: 'zh-CN → en',
    usageCount: 18,
    lastUsed: '2024-01-20 13:15'
  }
])

// 翻译引擎对比
const translationEngines = ref([
  { id: 1, name: 'Google翻译', status: 'active', result: '', time: 0, rating: 4 },
  { id: 2, name: 'DeepL', status: 'active', result: '', time: 0, rating: 5 },
  { id: 3, name: '百度翻译', status: 'active', result: '', time: 0, rating: 3 }
])

// 术语库
const terms = ref([
  { id: 1, source: 'API', target: '应用程序接口', category: '技术', note: '不翻译缩写' },
  { id: 2, source: 'Dashboard', target: '控制台', category: '界面', note: '统一术语' }
])

// 翻译历史
const translationHistory = ref([
  {
    timestamp: Date.now() - 3600000,
    source: 'Hello World',
    target: '你好世界',
    sourceLang: 'en',
    targetLang: 'zh-CN'
  }
])

// 计算属性
const sourceLines = computed(() => sourceText.value.split('\n').filter(line => line.trim()).length)
const targetLines = computed(() => targetText.value.split('\n').filter(line => line.trim()).length)
const canSwap = computed(() => sourceLanguage.value !== 'auto' && sourceText.value.trim())
const targetLanguages = computed(() => languages.filter(lang => lang.code !== sourceLanguage.value))
const filteredTerms = computed(() => {
  if (!termSearchKeyword.value) return terms.value
  return terms.value.filter(term => 
    term.source.includes(termSearchKeyword.value) || 
    term.target.includes(termSearchKeyword.value)
  )
})
const hasBatchResults = computed(() => batchItems.value.some(item => item.status === 'completed'))

// 方法
const handleTranslate = async () => {
  if (!sourceText.value.trim()) {
    ElMessage.warning('请输入要翻译的内容')
    return
  }
  
  translating.value = true
  
  // 模拟翻译
  setTimeout(() => {
    // 检测语言
    if (sourceLanguage.value === 'auto') {
      detectedLanguage.value = detectLanguage(sourceText.value)
    }
    
    // 生成翻译
    targetText.value = mockTranslate(sourceText.value, sourceLanguage.value, targetLanguage.value)
    translationScore.value = 4.5
    
    // 更新翻译引擎结果
    translationEngines.value.forEach((engine, index) => {
      setTimeout(() => {
        engine.result = mockTranslate(sourceText.value, sourceLanguage.value, targetLanguage.value) + ` (${engine.name})`
        engine.time = 200 + index * 100
      }, index * 300)
    })
    
    // 添加到历史
    translationHistory.value.unshift({
      timestamp: Date.now(),
      source: sourceText.value,
      target: targetText.value,
      sourceLang: sourceLanguage.value === 'auto' ? detectedLanguage.value : sourceLanguage.value,
      targetLang: targetLanguage.value
    })
    
    translating.value = false
    ElMessage.success('翻译完成')
  }, 1500)
}

const detectLanguage = (text) => {
  // 简单的语言检测逻辑
  if (/[\u4e00-\u9fa5]/.test(text)) return 'zh-CN'
  if (/[ぁ-ん]|[ァ-ヴ]/.test(text)) return 'ja'
  if (/[가-힣]/.test(text)) return 'ko'
  return 'en'
}

const mockTranslate = (text, from, to) => {
  // 模拟翻译
  const translations = {
    'Hello World': '你好世界',
    '你好世界': 'Hello World',
    '产品介绍': 'Product Introduction',
    'Product Introduction': '产品介绍'
  }
  
  return translations[text] || `[Translated from ${from} to ${to}]: ${text}`
}

const clearAll = () => {
  sourceText.value = ''
  targetText.value = ''
  detectedLanguage.value = ''
  translationScore.value = 0
}

const clearSource = () => {
  sourceText.value = ''
  detectedLanguage.value = ''
}

const swapLanguages = () => {
  if (sourceLanguage.value === 'auto') return
  
  const temp = sourceLanguage.value
  sourceLanguage.value = targetLanguage.value
  targetLanguage.value = temp
  
  const tempText = sourceText.value
  sourceText.value = targetText.value
  targetText.value = tempText
}

const copyTranslation = () => {
  navigator.clipboard.writeText(targetText.value)
  ElMessage.success('已复制到剪贴板')
}

const downloadTranslation = () => {
  const blob = new Blob([targetText.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'translation.txt'
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('下载成功')
}

const shareTranslation = () => {
  ElMessage.info('分享功能开发中')
}

const handleSourceInput = () => {
  // 自动检测语言
  if (sourceLanguage.value === 'auto' && sourceText.value.length > 5) {
    detectedLanguage.value = detectLanguage(sourceText.value)
  }
}

const handleSourceLanguageChange = () => {
  detectedLanguage.value = ''
}

const handleTargetLanguageChange = () => {
  // 目标语言改变时的处理
}

const uploadFile = () => {
  ElMessage.info('文件上传功能开发中')
}

const pasteText = async () => {
  try {
    const text = await navigator.clipboard.readText()
    sourceText.value = text
    ElMessage.success('已粘贴文本')
  } catch (err) {
    ElMessage.error('无法访问剪贴板')
  }
}

const handleBatchFile = (file) => {
  // 处理批量文件
  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target.result
    const lines = content.split('\n').filter(line => line.trim())
    batchItems.value = lines.map(line => ({
      source: line,
      target: '',
      status: 'pending'
    }))
    ElMessage.success(`已加载 ${lines.length} 条待翻译内容`)
  }
  reader.readAsText(file.raw)
}

const startBatchTranslate = async () => {
  batchTranslating.value = true
  
  for (let i = 0; i < batchItems.value.length; i++) {
    const item = batchItems.value[i]
    item.status = 'translating'
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    item.target = mockTranslate(item.source, sourceLanguage.value, targetLanguage.value)
    item.status = 'completed'
  }
  
  batchTranslating.value = false
  ElMessage.success('批量翻译完成')
}

const exportBatchResults = () => {
  const content = batchItems.value
    .filter(item => item.status === 'completed')
    .map(item => `${item.source}\t${item.target}`)
    .join('\n')
  
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'batch_translation.txt'
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

const clearBatch = () => {
  batchItems.value = []
}

const showHistory = () => {
  showHistoryDialog.value = true
}

const showSettings = () => {
  ElMessage.info('设置功能开发中')
}

const addTerm = () => {
  ElMessage.info('添加术语功能开发中')
}

const importTerms = () => {
  ElMessage.info('导入术语功能开发中')
}

const exportTerms = () => {
  ElMessage.info('导出术语功能开发中')
}

const editTerm = (term) => {
  ElMessage.info('编辑术语功能开发中')
}

const deleteTerm = (term) => {
  terms.value = terms.value.filter(t => t.id !== term.id)
  ElMessage.success('删除成功')
}

const useMemory = (memory) => {
  sourceText.value = memory.source
  targetText.value = memory.target
  ElMessage.success('已应用翻译记忆')
}

const deleteMemory = (memory) => {
  memoryList.value = memoryList.value.filter(m => m !== memory)
  ElMessage.success('删除成功')
}

const rateEngine = (engine) => {
  ElMessage.success(`已评价 ${engine.name}`)
}

const reuseHistory = (history) => {
  sourceText.value = history.source
  targetText.value = history.target
  sourceLanguage.value = history.sourceLang
  targetLanguage.value = history.targetLang
  showHistoryDialog.value = false
  ElMessage.success('已加载历史记录')
}

const deleteHistory = (history) => {
  translationHistory.value = translationHistory.value.filter(h => h !== history)
  ElMessage.success('删除成功')
}

const clearHistory = async () => {
  await ElMessageBox.confirm('确定要清空所有翻译历史吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  translationHistory.value = []
  ElMessage.success('已清空历史')
}

const exportHistory = () => {
  const content = translationHistory.value
    .map(h => `${formatTime(h.timestamp)}\t${h.source}\t${h.target}\t${h.sourceLang}\t${h.targetLang}`)
    .join('\n')
  
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'translation_history.txt'
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

const getLanguageName = (code) => {
  const lang = languages.find(l => l.code === code)
  return lang ? lang.name : code
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN')
}
</script>

<style scoped lang="scss">
@use "@/assets/styles/variables.scss" as *;

.translate-page {
  padding: $spacing-lg;
  
  .page-header {
    margin-bottom: $spacing-xl;
    
    h1 {
      font-size: 24px;
      margin: 0 0 $spacing-sm 0;
    }
    
    .page-desc {
      color: $text-secondary;
      font-size: 14px;
    }
  }
  
  .toolbar {
    display: flex;
    justify-content: space-between;
    margin-bottom: $spacing-lg;
    
    .toolbar-left,
    .toolbar-right {
      display: flex;
      gap: $spacing-sm;
    }
  }
  
  .translate-container {
    .translate-panel {
      background: white;
      border: 1px solid $border-color;
      border-radius: 8px;
      overflow: hidden;
      
      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: $spacing-md;
        border-bottom: 1px solid $border-color;
        background: $bg-color;
        
        .panel-actions {
          display: flex;
          gap: $spacing-xs;
        }
      }
      
      .panel-body {
        padding: $spacing-md;
        
        :deep(.el-textarea__inner) {
          font-size: 16px;
          line-height: 1.6;
          border: none;
          box-shadow: none;
          resize: none;
        }
        
        .text-counter {
          margin-top: $spacing-sm;
          font-size: 12px;
          color: $text-secondary;
        }
        
        .detected-language {
          margin-top: $spacing-sm;
          padding: $spacing-sm;
          background: $primary-light;
          border-radius: 4px;
          font-size: 12px;
          color: $primary-color;
          display: inline-flex;
          align-items: center;
          gap: $spacing-xs;
        }
        
        .translation-score {
          margin-top: $spacing-md;
          display: flex;
          align-items: center;
          gap: $spacing-sm;
          font-size: 14px;
        }
      }
    }
    
    .translate-actions {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 400px;
    }
    
    .advanced-features {
      margin-top: $spacing-xl;
      
      .batch-translate {
        .batch-list {
          margin-top: $spacing-lg;
          
          .batch-actions {
            margin-top: $spacing-md;
            display: flex;
            gap: $spacing-sm;
          }
        }
      }
      
      .translation-memory {
        .memory-stats {
          margin-bottom: $spacing-lg;
        }
      }
      
      .translation-compare {
        .engine-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .engine-result {
          .result-text {
            min-height: 100px;
            padding: $spacing-sm;
            background: $bg-color;
            border-radius: 4px;
            margin-bottom: $spacing-sm;
          }
          
          .no-result {
            min-height: 100px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: $text-secondary;
            background: $bg-color;
            border-radius: 4px;
            margin-bottom: $spacing-sm;
          }
          
          .result-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: $text-secondary;
          }
        }
      }
    }
  }
  
  .terms-management {
    .terms-toolbar {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      margin-bottom: $spacing-md;
    }
  }
  
  .history-management {
    .history-footer {
      margin-top: $spacing-md;
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>