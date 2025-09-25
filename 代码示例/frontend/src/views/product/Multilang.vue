<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="title">多语言内容管理</h2>
      <p class="description">管理产品多语言版本，支持翻译管理和内容同步</p>
    </div>

    <!-- 语言切换和操作栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-select
          v-model="currentLanguage"
          placeholder="选择语言"
          style="width: 150px"
          @change="changeLanguage"
        >
          <el-option
            v-for="lang in supportedLanguages"
            :key="lang.code"
            :label="lang.name"
            :value="lang.code"
          >
            <span class="language-option">
              <img :src="lang.flag" class="flag-icon" />
              {{ lang.name }}
            </span>
          </el-option>
        </el-select>

        <el-button-group style="margin-left: 15px">
          <el-button
            v-for="view in viewModes"
            :key="view.key"
            :type="currentView === view.key ? 'primary' : ''"
            @click="switchView(view.key)"
          >
            <el-icon><component :is="view.icon" /></el-icon>
            {{ view.label }}
          </el-button>
        </el-button-group>
      </div>

      <div class="toolbar-right">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索产品"
          style="width: 200px; margin-right: 10px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-button type="primary" @click="showTranslateDialog">
          <el-icon><ChatLineRound /></el-icon>
          AI翻译
        </el-button>

        <el-button @click="showImportDialog">
          <el-icon><Upload /></el-icon>
          导入翻译
        </el-button>

        <el-button @click="exportTranslation">
          <el-icon><Download /></el-icon>
          导出翻译
        </el-button>

        <el-button @click="syncContent">
          <el-icon><Refresh /></el-icon>
          同步内容
        </el-button>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover" class="stats-card">
            <div class="stats-content">
              <div class="stats-icon">
                <el-icon size="24" color="#409EFF"><Document /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ totalProducts }}</div>
                <div class="stats-label">总产品数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stats-card">
            <div class="stats-content">
              <div class="stats-icon">
                <el-icon size="24" color="#67C23A"><Check /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ translatedProducts }}</div>
                <div class="stats-label">已翻译</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stats-card">
            <div class="stats-content">
              <div class="stats-icon">
                <el-icon size="24" color="#E6A23C"><Clock /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ pendingProducts }}</div>
                <div class="stats-label">待翻译</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stats-card">
            <div class="stats-content">
              <div class="stats-icon">
                <el-icon size="24" color="#F56C6C"><WarningFilled /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ outdatedProducts }}</div>
                <div class="stats-label">需更新</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 内容列表 -->
    <el-card shadow="never">
      <!-- 对比视图 -->
      <div v-if="currentView === 'compare'" class="compare-view">
        <div class="language-headers">
          <div class="base-language">
            <h3>中文（基础语言）</h3>
          </div>
          <div class="target-language">
            <h3>{{ getCurrentLanguageName() }}</h3>
          </div>
        </div>

        <div class="product-compare-list">
          <div
            v-for="product in filteredProducts"
            :key="product.id"
            class="product-compare-item"
          >
            <div class="product-info">
              <img :src="product.image" class="product-image" />
              <div class="product-meta">
                <div class="product-name">{{ product.name }}</div>
                <div class="product-sku">SKU: {{ product.sku }}</div>
                <div class="translation-status">
                  <el-tag
                    :type="getStatusType(product.translationStatus)"
                    size="small"
                  >
                    {{ getStatusText(product.translationStatus) }}
                  </el-tag>
                </div>
              </div>
            </div>

            <div class="content-compare">
              <div class="base-content">
                <div class="field-group">
                  <label>产品名称</label>
                  <div class="field-content">{{ product.name }}</div>
                </div>
                <div class="field-group">
                  <label>产品描述</label>
                  <div class="field-content">{{ product.description }}</div>
                </div>
                <div class="field-group">
                  <label>规格参数</label>
                  <div class="field-content">{{ product.specifications }}</div>
                </div>
              </div>

              <div class="target-content">
                <div class="field-group">
                  <label>产品名称</label>
                  <el-input
                    :model-value="product.translations[currentLanguage]?.name || ''"
                    @update:model-value="(val) => updateFieldValue(product, 'name', val)"
                    placeholder="待翻译"
                    @blur="updateTranslation(product, 'name')"
                  />
                </div>
                <div class="field-group">
                  <label>产品描述</label>
                  <el-input
                    :model-value="product.translations[currentLanguage]?.description || ''"
                    @update:model-value="(val) => updateFieldValue(product, 'description', val)"
                    type="textarea"
                    :rows="3"
                    placeholder="待翻译"
                    @blur="updateTranslation(product, 'description')"
                  />
                </div>
                <div class="field-group">
                  <label>规格参数</label>
                  <el-input
                    :model-value="product.translations[currentLanguage]?.specifications || ''"
                    @update:model-value="(val) => updateFieldValue(product, 'specifications', val)"
                    placeholder="待翻译"
                    @blur="updateTranslation(product, 'specifications')"
                  />
                </div>
              </div>

              <div class="actions-column">
                <el-button
                  type="primary"
                  size="small"
                  @click="translateProduct(product)"
                  :loading="product.translating"
                >
                  <el-icon><ChatLineRound /></el-icon>
                  AI翻译
                </el-button>
                <el-button
                  size="small"
                  @click="copyFromBase(product)"
                >
                  <el-icon><CopyDocument /></el-icon>
                  复制原文
                </el-button>
                <el-button
                  size="small"
                  @click="previewTranslation(product)"
                >
                  <el-icon><View /></el-icon>
                  预览
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-else class="list-view">
        <el-table
          :data="filteredProducts"
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="产品信息" min-width="200">
            <template #default="{ row }">
              <div class="product-info-cell">
                <img :src="row.image" class="product-image-small" />
                <div>
                  <div class="product-name">{{ row.name }}</div>
                  <div class="product-sku">SKU: {{ row.sku }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="翻译状态" width="120">
            <template #default="{ row }">
              <el-tag
                :type="getStatusType(row.translationStatus)"
                size="small"
              >
                {{ getStatusText(row.translationStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="完成度" width="100">
            <template #default="{ row }">
              <el-progress
                :percentage="getTranslationProgress(row)"
                :color="getProgressColor(getTranslationProgress(row))"
                :stroke-width="8"
              />
            </template>
          </el-table-column>
          <el-table-column label="最后更新" width="150">
            <template #default="{ row }">
              {{ formatDate(row.lastUpdated) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="250" fixed="right">
            <template #default="{ row }">
              <el-button
                type="text"
                size="small"
                @click="editTranslation(row)"
              >
                编辑翻译
              </el-button>
              <el-button
                type="text"
                size="small"
                @click="translateProduct(row)"
                :loading="row.translating"
              >
                AI翻译
              </el-button>
              <el-button
                type="text"
                size="small"
                @click="previewTranslation(row)"
              >
                预览
              </el-button>
              <el-button
                type="text"
                size="small"
                @click="viewHistory(row)"
              >
                历史版本
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- AI翻译对话框 -->
    <el-dialog v-model="translateDialogVisible" title="AI批量翻译" width="600px">
      <el-form :model="translateForm" label-width="100px">
        <el-form-item label="目标语言">
          <el-select
            v-model="translateForm.targetLanguages"
            multiple
            placeholder="选择要翻译的语言"
            style="width: 100%"
          >
            <el-option
              v-for="lang in supportedLanguages"
              :key="lang.code"
              :label="lang.name"
              :value="lang.code"
              :disabled="lang.code === 'zh'"
            >
              <span class="language-option">
                <img :src="lang.flag" class="flag-icon" />
                {{ lang.name }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="翻译内容">
          <el-checkbox-group v-model="translateForm.fields">
            <el-checkbox label="name">产品名称</el-checkbox>
            <el-checkbox label="description">产品描述</el-checkbox>
            <el-checkbox label="specifications">规格参数</el-checkbox>
            <el-checkbox label="features">产品特色</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="翻译质量">
          <el-radio-group v-model="translateForm.quality">
            <el-radio label="fast">快速翻译</el-radio>
            <el-radio label="balance">平衡质量</el-radio>
            <el-radio label="high">高质量</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="产品范围">
          <el-radio-group v-model="translateForm.scope">
            <el-radio label="selected">仅选中产品</el-radio>
            <el-radio label="untranslated">未翻译产品</el-radio>
            <el-radio label="all">所有产品</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="translateDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="startBatchTranslation"
            :loading="batchTranslating"
          >
            开始翻译
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑翻译对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="`编辑 ${currentProduct?.name} - ${getCurrentLanguageName()}`"
      width="800px"
    >
      <el-form
        v-if="currentProduct"
        :model="editForm"
        label-width="100px"
      >
        <el-tabs v-model="editActiveTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-form-item label="产品名称">
              <el-input v-model="editForm.name" />
            </el-form-item>
            
            <el-form-item label="产品描述">
              <el-input
                v-model="editForm.description"
                type="textarea"
                :rows="5"
              />
            </el-form-item>

            <el-form-item label="简短描述">
              <el-input
                v-model="editForm.shortDescription"
                type="textarea"
                :rows="2"
              />
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="详细规格" name="specs">
            <el-form-item label="规格参数">
              <el-input
                v-model="editForm.specifications"
                type="textarea"
                :rows="4"
              />
            </el-form-item>

            <el-form-item label="产品特色">
              <el-input
                v-model="editForm.features"
                type="textarea"
                :rows="4"
              />
            </el-form-item>

            <el-form-item label="使用说明">
              <el-input
                v-model="editForm.instructions"
                type="textarea"
                :rows="4"
              />
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="SEO信息" name="seo">
            <el-form-item label="SEO标题">
              <el-input v-model="editForm.seoTitle" />
            </el-form-item>

            <el-form-item label="SEO描述">
              <el-input
                v-model="editForm.seoDescription"
                type="textarea"
                :rows="3"
              />
            </el-form-item>

            <el-form-item label="关键词">
              <el-input
                v-model="editForm.keywords"
                placeholder="多个关键词用逗号分隔"
              />
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button @click="aiTranslateCurrentProduct" :loading="currentProductTranslating">
            AI翻译
          </el-button>
          <el-button type="primary" @click="saveTranslation">
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 导入翻译对话框 -->
    <el-dialog v-model="importDialogVisible" title="导入翻译文件" width="600px">
      <el-upload
        ref="uploadRef"
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleImportFile"
        accept=".xlsx,.csv,.json"
      >
        <el-icon class="el-icon--upload"><Upload /></el-icon>
        <div class="el-upload__text">
          将翻译文件拖拽到此处，或<em>点击选择文件</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 Excel、CSV、JSON 格式的翻译文件
          </div>
        </template>
      </el-upload>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="executeImport">
            确认导入
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      :title="`预览 - ${getCurrentLanguageName()}`"
      width="80%"
    >
      <div v-if="previewProduct" class="preview-content">
        <div class="preview-header">
          <img :src="previewProduct.image" class="preview-image" />
          <div class="preview-info">
            <h2>{{ getTranslatedField(previewProduct, 'name') }}</h2>
            <p class="preview-description">
              {{ getTranslatedField(previewProduct, 'description') }}
            </p>
          </div>
        </div>

        <div class="preview-details">
          <el-descriptions title="产品信息" :column="2" border>
            <el-descriptions-item label="产品名称">
              {{ getTranslatedField(previewProduct, 'name') }}
            </el-descriptions-item>
            <el-descriptions-item label="SKU">
              {{ previewProduct.sku }}
            </el-descriptions-item>
            <el-descriptions-item label="规格参数" span="2">
              {{ getTranslatedField(previewProduct, 'specifications') }}
            </el-descriptions-item>
            <el-descriptions-item label="产品特色" span="2">
              {{ getTranslatedField(previewProduct, 'features') }}
            </el-descriptions-item>
            <el-descriptions-item label="产品描述" span="2">
              {{ getTranslatedField(previewProduct, 'description') }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 支持的语言列表
const supportedLanguages = [
  { code: 'zh', name: '中文', flag: 'https://flagcdn.com/w20/cn.png' },
  { code: 'en', name: 'English', flag: 'https://flagcdn.com/w20/us.png' },
  { code: 'es', name: 'Español', flag: 'https://flagcdn.com/w20/es.png' },
  { code: 'fr', name: 'Français', flag: 'https://flagcdn.com/w20/fr.png' },
  { code: 'ar', name: 'العربية', flag: 'https://flagcdn.com/w20/sa.png' }
]

// 视图模式
const viewModes = [
  { key: 'compare', label: '对比视图', icon: 'Operation' },
  { key: 'list', label: '列表视图', icon: 'List' }
]

// 响应式数据
const currentLanguage = ref('en')
const currentView = ref('compare')
const searchKeyword = ref('')

// 对话框状态
const translateDialogVisible = ref(false)
const editDialogVisible = ref(false)
const importDialogVisible = ref(false)
const previewDialogVisible = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 选中的产品
const selectedProducts = ref([])

// 表单数据
const translateForm = reactive({
  targetLanguages: [],
  fields: ['name', 'description'],
  quality: 'balance',
  scope: 'selected'
})

const editForm = reactive({
  name: '',
  description: '',
  shortDescription: '',
  specifications: '',
  features: '',
  instructions: '',
  seoTitle: '',
  seoDescription: '',
  keywords: ''
})

// 当前编辑的产品
const currentProduct = ref(null)
const previewProduct = ref(null)
const editActiveTab = ref('basic')

// 加载状态
const batchTranslating = ref(false)
const currentProductTranslating = ref(false)

// 模拟产品数据
const products = ref([
  {
    id: 1,
    sku: 'SW-001',
    name: 'Apple Watch Series 9',
    description: '先进的健康监测功能，全天候显示，强大的应用生态系统',
    shortDescription: '最新款智能手表',
    specifications: '45mm表盘,GPS+蜂窝网络,血氧监测,心率监测',
    features: '全天候显示,快速充电,防水设计,多种表带可选',
    instructions: '长按侧边按钮开机，通过Digital Crown导航',
    image: 'https://via.placeholder.com/100x100',
    translationStatus: 'completed',
    lastUpdated: '2024-01-15',
    translating: false,
    translations: {
      en: {
        name: 'Apple Watch Series 9',
        description: 'Advanced health monitoring, Always-On display, powerful app ecosystem',
        shortDescription: 'Latest smartwatch',
        specifications: '45mm case, GPS+Cellular, Blood Oxygen, Heart Rate monitoring',
        features: 'Always-On display, Fast charging, Water resistant, Multiple band options',
        instructions: 'Press and hold side button to power on, navigate with Digital Crown',
        seoTitle: 'Apple Watch Series 9 - Advanced Smartwatch',
        seoDescription: 'Experience the most advanced Apple Watch with health monitoring and connectivity features',
        keywords: 'smartwatch, health monitoring, Apple Watch, fitness tracker'
      },
      es: {
        name: 'Apple Watch Series 9',
        description: 'Monitoreo avanzado de salud, pantalla siempre activa, ecosistema de aplicaciones potente',
        shortDescription: 'Último smartwatch',
        specifications: '45mm caja, GPS+Celular, Oxígeno en sangre, Monitor de frecuencia cardíaca',
        features: 'Pantalla siempre activa, carga rápida, resistente al agua, múltiples opciones de correa'
      }
    }
  },
  {
    id: 2,
    sku: 'SW-002',
    name: 'Samsung Galaxy Watch 6',
    description: '全新的健康传感器，更长的电池续航，无缝的生态系统集成',
    shortDescription: '三星旗舰智能手表',
    specifications: '44mm表盘,蓝牙/WiFi,睡眠追踪,运动检测',
    features: '旋转表圈,无线充电,IP68防水,多种运动模式',
    instructions: '触摸屏幕或按压按钮唤醒，旋转表圈进行导航',
    image: 'https://via.placeholder.com/100x100',
    translationStatus: 'pending',
    lastUpdated: '2024-01-20',
    translating: false,
    translations: {
      en: {
        name: 'Samsung Galaxy Watch 6',
        description: 'New health sensors, longer battery life, seamless ecosystem integration'
      }
    }
  },
  {
    id: 3,
    sku: 'CAM-001',
    name: 'Sony Alpha 7R V',
    description: '6100万像素全画幅传感器，AI智能对焦，8K视频录制能力',
    shortDescription: '专业无反相机',
    specifications: '61MP全画幅,15级动态范围,8K/24p视频,双卡槽',
    features: 'AI智能对焦,图像稳定,高分辨率模式,专业控制',
    instructions: '安装电池和存储卡，按电源键开机，通过菜单设置拍摄参数',
    image: 'https://via.placeholder.com/100x100',
    translationStatus: 'outdated',
    lastUpdated: '2024-02-01',
    translating: false,
    translations: {}
  }
])

// 计算属性
const filteredProducts = computed(() => {
  return products.value.filter(product => {
    const matchesKeyword = !searchKeyword.value ||
      product.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchKeyword.value.toLowerCase())
    
    return matchesKeyword
  })
})

const totalProducts = computed(() => products.value.length)
const translatedProducts = computed(() => 
  products.value.filter(p => p.translationStatus === 'completed').length
)
const pendingProducts = computed(() => 
  products.value.filter(p => p.translationStatus === 'pending').length
)
const outdatedProducts = computed(() => 
  products.value.filter(p => p.translationStatus === 'outdated').length
)

// 方法
const changeLanguage = (lang) => {
  ElMessage.info(`切换到${getCurrentLanguageName()}`)
}

const switchView = (view) => {
  currentView.value = view
}

const getCurrentLanguageName = () => {
  const lang = supportedLanguages.find(l => l.code === currentLanguage.value)
  return lang ? lang.name : '未知语言'
}

const getStatusType = (status) => {
  const typeMap = {
    completed: 'success',
    pending: 'warning',
    outdated: 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    completed: '已完成',
    pending: '待翻译',
    outdated: '需更新'
  }
  return textMap[status] || '未知'
}

const getTranslationProgress = (product) => {
  const translation = product.translations[currentLanguage.value]
  if (!translation) return 0
  
  const fields = ['name', 'description', 'specifications', 'features']
  const completedFields = fields.filter(field => translation[field])
  return Math.round((completedFields.length / fields.length) * 100)
}

const getProgressColor = (percentage) => {
  if (percentage >= 80) return '#67C23A'
  if (percentage >= 50) return '#E6A23C'
  return '#F56C6C'
}

const getTranslatedField = (product, field) => {
  const translation = product.translations[currentLanguage.value]
  return translation?.[field] || product[field] || `[待翻译: ${field}]`
}

const handleSelectionChange = (selection) => {
  selectedProducts.value = selection
}

const handleSizeChange = (size) => {
  pagination.size = size
}

const handlePageChange = (page) => {
  pagination.page = page
}

const showTranslateDialog = () => {
  translateDialogVisible.value = true
}

const showImportDialog = () => {
  importDialogVisible.value = true
}

const updateFieldValue = (product, field, value) => {
  if (!product.translations[currentLanguage.value]) {
    product.translations[currentLanguage.value] = {}
  }
  product.translations[currentLanguage.value][field] = value
}

const updateTranslation = (product, field) => {
  if (!product.translations[currentLanguage.value]) {
    product.translations[currentLanguage.value] = {}
  }
  
  // 更新翻译状态
  updateProductStatus(product)
  ElMessage.success('翻译已保存')
}

const updateProductStatus = (product) => {
  const translation = product.translations[currentLanguage.value]
  if (!translation) {
    product.translationStatus = 'pending'
    return
  }
  
  const requiredFields = ['name', 'description']
  const hasAllRequired = requiredFields.every(field => translation[field])
  
  if (hasAllRequired) {
    product.translationStatus = 'completed'
  } else {
    product.translationStatus = 'pending'
  }
}

const translateProduct = async (product) => {
  product.translating = true
  
  try {
    // 模拟AI翻译
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    if (!product.translations[currentLanguage.value]) {
      product.translations[currentLanguage.value] = {}
    }
    
    // 模拟翻译结果
    const translation = product.translations[currentLanguage.value]
    if (currentLanguage.value === 'en') {
      translation.name = `[AI Translated] ${product.name}`
      translation.description = `[AI Translated] ${product.description}`
      translation.specifications = `[AI Translated] ${product.specifications}`
    }
    
    updateProductStatus(product)
    ElMessage.success('AI翻译完成')
    
  } catch (error) {
    ElMessage.error('翻译失败')
  } finally {
    product.translating = false
  }
}

const copyFromBase = (product) => {
  if (!product.translations[currentLanguage.value]) {
    product.translations[currentLanguage.value] = {}
  }
  
  const translation = product.translations[currentLanguage.value]
  translation.name = product.name
  translation.description = product.description
  translation.specifications = product.specifications
  
  ElMessage.success('已复制原文')
}

const editTranslation = (product) => {
  currentProduct.value = product
  
  const translation = product.translations[currentLanguage.value] || {}
  Object.assign(editForm, {
    name: translation.name || '',
    description: translation.description || '',
    shortDescription: translation.shortDescription || '',
    specifications: translation.specifications || '',
    features: translation.features || '',
    instructions: translation.instructions || '',
    seoTitle: translation.seoTitle || '',
    seoDescription: translation.seoDescription || '',
    keywords: translation.keywords || ''
  })
  
  editDialogVisible.value = true
}

const saveTranslation = () => {
  if (!currentProduct.value.translations[currentLanguage.value]) {
    currentProduct.value.translations[currentLanguage.value] = {}
  }
  
  Object.assign(currentProduct.value.translations[currentLanguage.value], editForm)
  updateProductStatus(currentProduct.value)
  
  editDialogVisible.value = false
  ElMessage.success('翻译已保存')
}

const aiTranslateCurrentProduct = async () => {
  currentProductTranslating.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 模拟AI翻译填充表单
    if (currentLanguage.value === 'en') {
      editForm.name = `[AI] ${currentProduct.value.name}`
      editForm.description = `[AI] ${currentProduct.value.description}`
      editForm.specifications = `[AI] ${currentProduct.value.specifications}`
    }
    
    ElMessage.success('AI翻译完成')
    
  } catch (error) {
    ElMessage.error('翻译失败')
  } finally {
    currentProductTranslating.value = false
  }
}

const previewTranslation = (product) => {
  previewProduct.value = product
  previewDialogVisible.value = true
}

const viewHistory = (product) => {
  ElMessage.info('查看翻译历史功能开发中...')
}

const startBatchTranslation = async () => {
  if (translateForm.targetLanguages.length === 0) {
    ElMessage.warning('请选择目标语言')
    return
  }
  
  if (translateForm.fields.length === 0) {
    ElMessage.warning('请选择要翻译的字段')
    return
  }
  
  batchTranslating.value = true
  
  try {
    // 模拟批量翻译
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    ElMessage.success('批量翻译完成')
    translateDialogVisible.value = false
    
  } catch (error) {
    ElMessage.error('批量翻译失败')
  } finally {
    batchTranslating.value = false
  }
}

const exportTranslation = () => {
  ElMessage.success('正在导出翻译文件...')
}

const syncContent = () => {
  ElMessage.success('内容同步完成')
}

const handleImportFile = (file) => {
  ElMessage.info(`选择了文件: ${file.name}`)
}

const executeImport = () => {
  ElMessage.success('翻译文件导入完成')
  importDialogVisible.value = false
}

const formatDate = (dateStr) => {
  return dateStr.replace(/-/g, '/')
}

onMounted(() => {
  pagination.total = products.value.length
})
</script>

<style scoped lang="scss">
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-lg;
  padding: $spacing-md;
  background: $bg-white;
  border-radius: 4px;
  box-shadow: $box-shadow-base;
  
  .toolbar-left {
    display: flex;
    align-items: center;
  }
  
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }
}

.language-option {
  display: flex;
  align-items: center;
  
  .flag-icon {
    width: 16px;
    height: 12px;
    margin-right: 8px;
    border-radius: 2px;
  }
}

.stats-cards {
  margin-bottom: $spacing-lg;
  
  .stats-card {
    .stats-content {
      display: flex;
      align-items: center;
      
      .stats-icon {
        margin-right: $spacing-md;
      }
      
      .stats-info {
        .stats-number {
          font-size: 24px;
          font-weight: bold;
          color: $text-primary;
          line-height: 1;
        }
        
        .stats-label {
          font-size: $font-size-sm;
          color: $text-secondary;
          margin-top: 4px;
        }
      }
    }
  }
}

.compare-view {
  .language-headers {
    display: grid;
    grid-template-columns: 300px 1fr 1fr 120px;
    gap: $spacing-lg;
    margin-bottom: $spacing-md;
    padding: $spacing-md;
    background: $bg-color;
    border-radius: 4px;
    
    h3 {
      margin: 0;
      color: $text-primary;
    }
    
    .base-language,
    .target-language {
      text-align: center;
    }
  }
  
  .product-compare-list {
    .product-compare-item {
      display: grid;
      grid-template-columns: 300px 1fr 1fr 120px;
      gap: $spacing-lg;
      padding: $spacing-lg;
      margin-bottom: $spacing-md;
      background: $bg-white;
      border: 1px solid $border-light;
      border-radius: 8px;
      
      .product-info {
        display: flex;
        align-items: flex-start;
        
        .product-image {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 4px;
          margin-right: $spacing-md;
        }
        
        .product-meta {
          flex: 1;
          
          .product-name {
            font-weight: 500;
            margin-bottom: $spacing-xs;
            color: $text-primary;
          }
          
          .product-sku {
            font-size: $font-size-sm;
            color: $text-secondary;
            margin-bottom: $spacing-sm;
          }
          
          .translation-status {
            margin-top: $spacing-sm;
          }
        }
      }
      
      .content-compare {
        display: contents;
        
        .base-content,
        .target-content {
          .field-group {
            margin-bottom: $spacing-md;
            
            label {
              display: block;
              font-size: $font-size-sm;
              color: $text-secondary;
              margin-bottom: $spacing-xs;
            }
            
            .field-content {
              font-size: $font-size-base;
              color: $text-primary;
              line-height: 1.5;
            }
          }
        }
        
        .actions-column {
          display: flex;
          flex-direction: column;
          gap: $spacing-sm;
        }
      }
    }
  }
}

.list-view {
  .product-info-cell {
    display: flex;
    align-items: center;
    
    .product-image-small {
      width: 40px;
      height: 40px;
      object-fit: cover;
      border-radius: 4px;
      margin-right: $spacing-md;
    }
    
    .product-name {
      font-weight: 500;
      color: $text-primary;
    }
    
    .product-sku {
      font-size: $font-size-sm;
      color: $text-secondary;
    }
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: $spacing-lg 0;
}

.preview-content {
  .preview-header {
    display: flex;
    margin-bottom: $spacing-xl;
    
    .preview-image {
      width: 200px;
      height: 200px;
      object-fit: cover;
      border-radius: 8px;
      margin-right: $spacing-xl;
    }
    
    .preview-info {
      flex: 1;
      
      h2 {
        color: $text-primary;
        margin-bottom: $spacing-md;
      }
      
      .preview-description {
        color: $text-regular;
        line-height: 1.6;
      }
    }
  }
  
  .preview-details {
    margin-top: $spacing-xl;
  }
}

:deep(.el-descriptions__label) {
  font-weight: 500;
}
</style>