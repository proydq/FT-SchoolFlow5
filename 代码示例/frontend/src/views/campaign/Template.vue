<template>
  <div class="template-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>活动模板</h1>
        <div class="header-actions">
          <el-button type="primary" @click="createTemplate" :icon="Plus">
            创建模板
          </el-button>
          <el-button @click="importTemplate" :icon="Upload">导入模板</el-button>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-section">
      <el-card>
        <el-form :model="filterForm" inline>
          <el-form-item label="模板名称">
            <el-input 
              v-model="filterForm.keyword" 
              placeholder="搜索模板名称"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item label="模板类型">
            <el-select v-model="filterForm.type" placeholder="全部类型" clearable>
              <el-option label="全部" value="" />
              <el-option label="促销活动" value="promotion" />
              <el-option label="节日营销" value="holiday" />
              <el-option label="新品发布" value="launch" />
              <el-option label="会员关怀" value="member" />
              <el-option label="内容营销" value="content" />
              <el-option label="调研问卷" value="survey" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="适用渠道">
            <el-select v-model="filterForm.channel" placeholder="全部渠道" clearable>
              <el-option label="全部" value="" />
              <el-option label="邮件" value="email" />
              <el-option label="短信" value="sms" />
              <el-option label="社媒" value="social" />
              <el-option label="WhatsApp" value="whatsapp" />
              <el-option label="多渠道" value="multi" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="模板标签">
            <el-select v-model="filterForm.tags" placeholder="选择标签" multiple clearable>
              <el-option label="热门" value="hot" />
              <el-option label="推荐" value="recommend" />
              <el-option label="官方" value="official" />
              <el-option label="自定义" value="custom" />
              <el-option label="行业模板" value="industry" />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :icon="Search">
              搜索
            </el-button>
            <el-button @click="resetFilter" :icon="RefreshLeft">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 模板分类标签 -->
    <div class="category-tabs">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="全部模板" name="all">
          <template #label>
            <span class="tab-label">
              全部模板
              <el-badge :value="stats.total" class="tab-badge" />
            </span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="我的模板" name="mine">
          <template #label>
            <span class="tab-label">
              我的模板
              <el-badge :value="stats.mine" class="tab-badge" />
            </span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="官方模板" name="official">
          <template #label>
            <span class="tab-label">
              官方模板
              <el-badge :value="stats.official" class="tab-badge" />
            </span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="收藏模板" name="favorite">
          <template #label>
            <span class="tab-label">
              收藏模板
              <el-badge :value="stats.favorite" class="tab-badge" />
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 模板展示 -->
    <div class="template-grid">
      <el-row :gutter="20">
        <el-col 
          v-for="template in templateList" 
          :key="template.id"
          :xs="24" :sm="12" :md="8" :lg="6"
        >
          <el-card class="template-card" :body-style="{ padding: '0' }">
            <!-- 模板预览图 -->
            <div class="template-preview" @click="previewTemplate(template)">
              <img :src="template.preview" :alt="template.name" />
              <div class="preview-overlay">
                <el-button type="primary" circle :icon="View" />
              </div>
              <div class="template-badges">
                <el-tag v-if="template.isHot" type="danger" size="small">热门</el-tag>
                <el-tag v-if="template.isNew" type="success" size="small">新品</el-tag>
                <el-tag v-if="template.isOfficial" type="primary" size="small">官方</el-tag>
              </div>
            </div>
            
            <!-- 模板信息 -->
            <div class="template-info">
              <h3 class="template-name">{{ template.name }}</h3>
              <p class="template-desc">{{ template.description }}</p>
              
              <div class="template-meta">
                <div class="meta-item">
                  <el-icon><Promotion /></el-icon>
                  <span>{{ getTypeLabel(template.type) }}</span>
                </div>
                <div class="meta-item">
                  <el-icon><Message /></el-icon>
                  <span>{{ getChannelLabel(template.channel) }}</span>
                </div>
                <div class="meta-item">
                  <el-icon><User /></el-icon>
                  <span>使用 {{ template.useCount }} 次</span>
                </div>
              </div>
              
              <div class="template-stats">
                <div class="stat-item">
                  <el-rate 
                    v-model="template.rating" 
                    disabled 
                    show-score 
                    text-color="#ff9900"
                    score-template="{value}"
                  />
                </div>
                <div class="stat-item">
                  <el-button 
                    :type="template.isFavorite ? 'warning' : 'default'"
                    :icon="template.isFavorite ? StarFilled : Star"
                    circle
                    size="small"
                    @click.stop="toggleFavorite(template)"
                  />
                </div>
              </div>
              
              <div class="template-actions">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="useTemplate(template)"
                  :icon="DocumentCopy"
                >
                  使用模板
                </el-button>
                <el-button 
                  size="small" 
                  @click="editTemplate(template)"
                  :icon="Edit"
                  v-if="template.canEdit"
                >
                  编辑
                </el-button>
                <el-dropdown v-if="template.canEdit">
                  <el-button size="small" :icon="More" />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="duplicateTemplate(template)">
                        <el-icon><CopyDocument /></el-icon>复制模板
                      </el-dropdown-item>
                      <el-dropdown-item @click="exportTemplate(template)">
                        <el-icon><Download /></el-icon>导出模板
                      </el-dropdown-item>
                      <el-dropdown-item @click="shareTemplate(template)">
                        <el-icon><Share /></el-icon>分享模板
                      </el-dropdown-item>
                      <el-dropdown-item 
                        divided 
                        @click="deleteTemplate(template)"
                        style="color: #f56c6c"
                      >
                        <el-icon><Delete /></el-icon>删除模板
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[12, 24, 48, 96]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 模板预览对话框 -->
    <el-dialog 
      v-model="previewDialog" 
      title="模板预览" 
      width="80%"
      top="5vh"
    >
      <div class="preview-container" v-if="currentTemplate">
        <div class="preview-header">
          <h2>{{ currentTemplate.name }}</h2>
          <p>{{ currentTemplate.description }}</p>
        </div>
        <div class="preview-content">
          <img :src="currentTemplate.fullPreview" style="width: 100%;" />
        </div>
        <div class="preview-details">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="模板类型">
              {{ getTypeLabel(currentTemplate.type) }}
            </el-descriptions-item>
            <el-descriptions-item label="适用渠道">
              {{ getChannelLabel(currentTemplate.channel) }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ currentTemplate.createTime }}
            </el-descriptions-item>
            <el-descriptions-item label="更新时间">
              {{ currentTemplate.updateTime }}
            </el-descriptions-item>
            <el-descriptions-item label="使用次数">
              {{ currentTemplate.useCount }} 次
            </el-descriptions-item>
            <el-descriptions-item label="平均转化率">
              {{ currentTemplate.avgConversion }}%
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
      <template #footer>
        <el-button @click="previewDialog = false">关闭</el-button>
        <el-button type="primary" @click="useCurrentTemplate">使用此模板</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, Upload, Search, RefreshLeft, View, Star, StarFilled,
  DocumentCopy, Edit, More, CopyDocument, Download, Share, Delete,
  Promotion, Message, User
} from '@element-plus/icons-vue'

const router = useRouter()

// 数据状态
const filterForm = reactive({
  keyword: '',
  type: '',
  channel: '',
  tags: []
})

const stats = reactive({
  total: 156,
  mine: 23,
  official: 48,
  favorite: 12
})

const activeTab = ref('all')
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(156)
const previewDialog = ref(false)
const currentTemplate = ref(null)

// 模板数据
const templateList = ref([
  {
    id: 1,
    name: '春节促销活动模板',
    description: '适用于春节期间的促销活动，包含红包、优惠券等元素',
    type: 'holiday',
    channel: 'multi',
    preview: 'https://via.placeholder.com/400x300/FF6B6B/ffffff?text=Spring+Festival',
    fullPreview: 'https://via.placeholder.com/800x1200/FF6B6B/ffffff?text=Spring+Festival+Template',
    useCount: 1256,
    rating: 4.8,
    isFavorite: true,
    isHot: true,
    isNew: false,
    isOfficial: true,
    canEdit: false,
    createTime: '2024-01-01 10:00',
    updateTime: '2024-01-10 15:30',
    avgConversion: 12.5
  },
  {
    id: 2,
    name: '新品发布邮件模板',
    description: '专为新产品发布设计的邮件模板，突出产品特点',
    type: 'launch',
    channel: 'email',
    preview: 'https://via.placeholder.com/400x300/4ECDC4/ffffff?text=New+Product',
    fullPreview: 'https://via.placeholder.com/800x1200/4ECDC4/ffffff?text=New+Product+Template',
    useCount: 892,
    rating: 4.6,
    isFavorite: false,
    isHot: true,
    isNew: true,
    isOfficial: true,
    canEdit: false,
    createTime: '2024-01-05 09:00',
    updateTime: '2024-01-12 14:20',
    avgConversion: 10.8
  },
  {
    id: 3,
    name: '会员生日祝福',
    description: '温馨的会员生日祝福模板，包含专属优惠',
    type: 'member',
    channel: 'sms',
    preview: 'https://via.placeholder.com/400x300/95E1D3/ffffff?text=Birthday',
    fullPreview: 'https://via.placeholder.com/800x1200/95E1D3/ffffff?text=Birthday+Template',
    useCount: 2341,
    rating: 4.9,
    isFavorite: true,
    isHot: false,
    isNew: false,
    isOfficial: true,
    canEdit: false,
    createTime: '2023-12-20 11:00',
    updateTime: '2024-01-08 16:45',
    avgConversion: 18.2
  },
  {
    id: 4,
    name: '双11购物狂欢节',
    description: '双11大促销活动模板，包含倒计时、秒杀等元素',
    type: 'promotion',
    channel: 'multi',
    preview: 'https://via.placeholder.com/400x300/F38181/ffffff?text=Double+11',
    fullPreview: 'https://via.placeholder.com/800x1200/F38181/ffffff?text=Double+11+Template',
    useCount: 5678,
    rating: 4.7,
    isFavorite: false,
    isHot: true,
    isNew: false,
    isOfficial: false,
    canEdit: true,
    createTime: '2023-10-15 10:00',
    updateTime: '2023-11-01 09:30',
    avgConversion: 15.3
  },
  {
    id: 5,
    name: '客户满意度调研',
    description: '简洁专业的满意度调研问卷模板',
    type: 'survey',
    channel: 'email',
    preview: 'https://via.placeholder.com/400x300/AA96DA/ffffff?text=Survey',
    fullPreview: 'https://via.placeholder.com/800x1200/AA96DA/ffffff?text=Survey+Template',
    useCount: 456,
    rating: 4.5,
    isFavorite: false,
    isHot: false,
    isNew: true,
    isOfficial: true,
    canEdit: false,
    createTime: '2024-01-08 14:00',
    updateTime: '2024-01-15 10:15',
    avgConversion: 22.6
  },
  {
    id: 6,
    name: '社媒内容营销',
    description: '适用于社交媒体的内容营销模板，包含多种布局',
    type: 'content',
    channel: 'social',
    preview: 'https://via.placeholder.com/400x300/FCBAD3/ffffff?text=Social+Media',
    fullPreview: 'https://via.placeholder.com/800x1200/FCBAD3/ffffff?text=Social+Media+Template',
    useCount: 789,
    rating: 4.4,
    isFavorite: false,
    isHot: false,
    isNew: false,
    isOfficial: false,
    canEdit: true,
    createTime: '2023-12-01 09:00',
    updateTime: '2023-12-28 15:30',
    avgConversion: 8.9
  },
  {
    id: 7,
    name: 'WhatsApp营销模板',
    description: 'WhatsApp群发消息模板，支持富媒体内容',
    type: 'promotion',
    channel: 'whatsapp',
    preview: 'https://via.placeholder.com/400x300/A8E6CF/ffffff?text=WhatsApp',
    fullPreview: 'https://via.placeholder.com/800x1200/A8E6CF/ffffff?text=WhatsApp+Template',
    useCount: 1123,
    rating: 4.6,
    isFavorite: true,
    isHot: true,
    isNew: false,
    isOfficial: true,
    canEdit: false,
    createTime: '2023-11-15 10:00',
    updateTime: '2024-01-02 11:20',
    avgConversion: 11.5
  },
  {
    id: 8,
    name: '圣诞节营销活动',
    description: '圣诞节主题营销模板，充满节日氛围',
    type: 'holiday',
    channel: 'email',
    preview: 'https://via.placeholder.com/400x300/FFD3B6/ffffff?text=Christmas',
    fullPreview: 'https://via.placeholder.com/800x1200/FFD3B6/ffffff?text=Christmas+Template',
    useCount: 3456,
    rating: 4.8,
    isFavorite: false,
    isHot: false,
    isNew: false,
    isOfficial: true,
    canEdit: false,
    createTime: '2023-11-20 09:00',
    updateTime: '2023-12-15 14:00',
    avgConversion: 13.7
  }
])

// 获取类型标签
const getTypeLabel = (type) => {
  const map = {
    promotion: '促销活动',
    holiday: '节日营销',
    launch: '新品发布',
    member: '会员关怀',
    content: '内容营销',
    survey: '调研问卷'
  }
  return map[type] || type
}

// 获取渠道标签
const getChannelLabel = (channel) => {
  const map = {
    email: '邮件',
    sms: '短信',
    social: '社媒',
    whatsapp: 'WhatsApp',
    multi: '多渠道'
  }
  return map[channel] || channel
}

// 搜索
const handleSearch = () => {
  ElMessage.success('搜索模板')
}

// 重置筛选
const resetFilter = () => {
  filterForm.keyword = ''
  filterForm.type = ''
  filterForm.channel = ''
  filterForm.tags = []
  handleSearch()
}

// 切换标签页
const handleTabClick = (tab) => {
  ElMessage.info(`切换到: ${tab.props.label}`)
  handleSearch()
}

// 创建模板
const createTemplate = () => {
  ElMessage.success('创建新模板')
}

// 导入模板
const importTemplate = () => {
  ElMessage.success('导入模板')
}

// 预览模板
const previewTemplate = (template) => {
  currentTemplate.value = template
  previewDialog.value = true
}

// 使用模板
const useTemplate = (template) => {
  ElMessage.success(`使用模板: ${template.name}`)
  router.push('/campaign/create')
}

// 使用当前模板
const useCurrentTemplate = () => {
  if (currentTemplate.value) {
    useTemplate(currentTemplate.value)
  }
}

// 编辑模板
const editTemplate = (template) => {
  ElMessage.info(`编辑模板: ${template.name}`)
}

// 切换收藏
const toggleFavorite = (template) => {
  template.isFavorite = !template.isFavorite
  if (template.isFavorite) {
    ElMessage.success('已收藏模板')
  } else {
    ElMessage.info('已取消收藏')
  }
}

// 复制模板
const duplicateTemplate = (template) => {
  ElMessage.success(`复制模板: ${template.name}`)
}

// 导出模板
const exportTemplate = (template) => {
  ElMessage.success(`导出模板: ${template.name}`)
}

// 分享模板
const shareTemplate = (template) => {
  ElMessage.success(`分享模板: ${template.name}`)
}

// 删除模板
const deleteTemplate = (template) => {
  ElMessageBox.confirm(
    `确定要删除模板"${template.name}"吗？`,
    '删除模板',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = templateList.value.findIndex(item => item.id === template.id)
    if (index > -1) {
      templateList.value.splice(index, 1)
    }
    ElMessage.success('模板已删除')
  })
}

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val
  handleSearch()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  handleSearch()
}
</script>

<style scoped lang="scss">
@use "@/assets/styles/variables.scss" as *;

.template-page {
  padding: $spacing-lg;
  background: #f5f7fa;
  min-height: 100vh;

  .page-header {
    margin-bottom: $spacing-lg;
    background: white;
    padding: $spacing-lg;
    border-radius: $border-radius-lg;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h1 {
        font-size: 24px;
        margin: 0;
      }

      .header-actions {
        display: flex;
        gap: $spacing-sm;
      }
    }
  }

  .filter-section {
    margin-bottom: $spacing-lg;

    .el-form-item {
      margin-bottom: 0;
    }
  }

  .category-tabs {
    margin-bottom: $spacing-lg;
    background: white;
    padding: 0 $spacing-lg;
    border-radius: $border-radius-lg;

    .tab-label {
      display: flex;
      align-items: center;
      gap: $spacing-xs;

      .tab-badge {
        ::v-deep(.el-badge__content) {
          transform: translateY(0) translateX(8px) scale(0.9);
        }
      }
    }
  }

  .template-grid {
    .template-card {
      margin-bottom: $spacing-lg;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

        .preview-overlay {
          opacity: 1;
        }
      }

      .template-preview {
        position: relative;
        height: 200px;
        overflow: hidden;
        background: #f5f7fa;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .preview-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .template-badges {
          position: absolute;
          top: $spacing-sm;
          left: $spacing-sm;
          display: flex;
          gap: $spacing-xs;
        }
      }

      .template-info {
        padding: $spacing-md;

        .template-name {
          font-size: 16px;
          font-weight: 500;
          margin: 0 0 $spacing-xs;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .template-desc {
          color: $text-secondary;
          font-size: 14px;
          margin: 0 0 $spacing-md;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          line-height: 1.4;
          height: 2.8em;
        }

        .template-meta {
          display: flex;
          gap: $spacing-md;
          margin-bottom: $spacing-md;
          font-size: 12px;
          color: $text-secondary;

          .meta-item {
            display: flex;
            align-items: center;
            gap: 4px;

            .el-icon {
              font-size: 14px;
            }
          }
        }

        .template-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: $spacing-md;

          .stat-item {
            ::v-deep(.el-rate) {
              height: 20px;

              .el-rate__text {
                font-size: 14px;
                margin-left: $spacing-xs;
              }
            }
          }
        }

        .template-actions {
          display: flex;
          gap: $spacing-xs;

          .el-button {
            flex: 1;
          }

          .el-dropdown {
            .el-button {
              width: 32px;
              padding: 0;
            }
          }
        }
      }
    }
  }

  .pagination-wrapper {
    margin-top: $spacing-lg;
    display: flex;
    justify-content: center;
  }

  .preview-container {
    .preview-header {
      margin-bottom: $spacing-lg;

      h2 {
        margin: 0 0 $spacing-sm;
      }

      p {
        color: $text-secondary;
        margin: 0;
      }
    }

    .preview-content {
      margin-bottom: $spacing-lg;
      border: 1px solid $border-light;
      border-radius: $border-radius-base;
      overflow: hidden;
    }

    .preview-details {
      ::v-deep(.el-descriptions) {
        .el-descriptions__label {
          font-weight: 500;
        }
      }
    }
  }
}
</style>