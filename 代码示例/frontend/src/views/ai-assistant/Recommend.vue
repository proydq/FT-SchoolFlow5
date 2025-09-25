<template>
  <div class="recommend-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>智能推荐</h1>
      <p class="page-desc">基于AI的智能推荐系统，为您提供精准的产品、客户、内容和策略推荐</p>
    </div>

    <!-- 推荐类型选择 -->
    <div class="recommend-tabs">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 产品推荐 -->
        <el-tab-pane name="product">
          <template #label>
            <span class="tab-label">
              <el-icon><Goods /></el-icon>
              产品推荐
            </span>
          </template>
          
          <div class="tab-content">
            <!-- 推荐条件设置 -->
            <el-card class="condition-card">
              <template #header>
                <div class="card-header">
                  <span>推荐条件</span>
                  <el-button type="primary" size="small" @click="generateProductRecommend">
                    <el-icon><MagicStick /></el-icon>
                    生成推荐
                  </el-button>
                </div>
              </template>
              
              <el-form :model="productForm" label-width="120px">
                <el-row :gutter="20">
                  <el-col :span="8">
                    <el-form-item label="客户类型">
                      <el-select v-model="productForm.customerType" placeholder="请选择">
                        <el-option label="新客户" value="new" />
                        <el-option label="老客户" value="existing" />
                        <el-option label="VIP客户" value="vip" />
                        <el-option label="潜在客户" value="potential" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="行业领域">
                      <el-select v-model="productForm.industry" placeholder="请选择">
                        <el-option label="电子商务" value="ecommerce" />
                        <el-option label="制造业" value="manufacturing" />
                        <el-option label="服务业" value="service" />
                        <el-option label="科技" value="tech" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="预算范围">
                      <el-select v-model="productForm.budget" placeholder="请选择">
                        <el-option label="$0-1000" value="low" />
                        <el-option label="$1000-5000" value="medium" />
                        <el-option label="$5000-10000" value="high" />
                        <el-option label="$10000+" value="premium" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </el-card>

            <!-- 推荐结果 -->
            <div class="recommend-results" v-loading="productLoading">
              <el-row :gutter="20">
                <el-col :span="6" v-for="product in recommendedProducts" :key="product.id">
                  <el-card class="product-card">
                    <div class="product-image">
                      <img :src="product.image" :alt="product.name" />
                      <el-tag class="match-score" type="success">
                        {{ product.matchScore }}% 匹配
                      </el-tag>
                    </div>
                    <div class="product-info">
                      <h4>{{ product.name }}</h4>
                      <p class="price">${{ product.price }}</p>
                      <div class="tags">
                        <el-tag v-for="tag in product.tags" :key="tag" size="small">
                          {{ tag }}
                        </el-tag>
                      </div>
                      <div class="reason">
                        <el-icon><InfoFilled /></el-icon>
                        <span>{{ product.reason }}</span>
                      </div>
                    </div>
                    <div class="product-actions">
                      <el-button size="small" @click="viewProductDetail(product)">查看详情</el-button>
                      <el-button size="small" type="primary" @click="addToRecommendList(product)">
                        加入推荐
                      </el-button>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-tab-pane>

        <!-- 客户推荐 -->
        <el-tab-pane name="customer">
          <template #label>
            <span class="tab-label">
              <el-icon><User /></el-icon>
              客户推荐
            </span>
          </template>
          
          <div class="tab-content">
            <!-- 推荐条件 -->
            <el-card class="condition-card">
              <template #header>
                <div class="card-header">
                  <span>推荐条件</span>
                  <el-button type="primary" size="small" @click="generateCustomerRecommend">
                    <el-icon><MagicStick /></el-icon>
                    生成推荐
                  </el-button>
                </div>
              </template>
              
              <el-form :model="customerForm" label-width="120px">
                <el-row :gutter="20">
                  <el-col :span="8">
                    <el-form-item label="产品类型">
                      <el-select v-model="customerForm.productType" placeholder="请选择">
                        <el-option label="软件产品" value="software" />
                        <el-option label="硬件产品" value="hardware" />
                        <el-option label="服务产品" value="service" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="营销目标">
                      <el-select v-model="customerForm.goal" placeholder="请选择">
                        <el-option label="提高销量" value="sales" />
                        <el-option label="品牌推广" value="branding" />
                        <el-option label="客户维护" value="retention" />
                        <el-option label="新客获取" value="acquisition" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="地区范围">
                      <el-select v-model="customerForm.region" placeholder="请选择">
                        <el-option label="北美" value="north_america" />
                        <el-option label="欧洲" value="europe" />
                        <el-option label="亚太" value="asia_pacific" />
                        <el-option label="全球" value="global" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </el-card>

            <!-- 客户推荐列表 -->
            <div class="customer-list" v-loading="customerLoading">
              <el-table :data="recommendedCustomers" style="width: 100%">
                <el-table-column label="客户信息" min-width="200">
                  <template #default="{ row }">
                    <div class="customer-info">
                      <el-avatar :src="row.avatar" />
                      <div>
                        <div class="name">{{ row.name }}</div>
                        <div class="company">{{ row.company }}</div>
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="industry" label="行业" width="120" />
                <el-table-column prop="potential" label="潜力值" width="100">
                  <template #default="{ row }">
                    <el-progress :percentage="row.potential" :color="getPotentialColor(row.potential)" />
                  </template>
                </el-table-column>
                <el-table-column prop="matchScore" label="匹配度" width="100">
                  <template #default="{ row }">
                    <el-tag :type="getMatchType(row.matchScore)">
                      {{ row.matchScore }}%
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="推荐理由" min-width="200">
                  <template #default="{ row }">
                    <div class="reason-list">
                      <div v-for="reason in row.reasons" :key="reason" class="reason-item">
                        <el-icon><CircleCheck /></el-icon>
                        {{ reason }}
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="150" fixed="right">
                  <template #default="{ row }">
                    <el-button type="text" size="small" @click="viewCustomerDetail(row)">
                      查看详情
                    </el-button>
                    <el-button type="text" size="small" @click="contactCustomer(row)">
                      联系客户
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>

        <!-- 内容推荐 -->
        <el-tab-pane name="content">
          <template #label>
            <span class="tab-label">
              <el-icon><Document /></el-icon>
              内容推荐
            </span>
          </template>
          
          <div class="tab-content">
            <el-row :gutter="20">
              <!-- 推荐设置 -->
              <el-col :span="8">
                <el-card class="settings-card">
                  <template #header>
                    <span>推荐设置</span>
                  </template>
                  
                  <el-form :model="contentForm" label-position="top">
                    <el-form-item label="内容类型">
                      <el-checkbox-group v-model="contentForm.types">
                        <el-checkbox label="article">文章</el-checkbox>
                        <el-checkbox label="email">邮件</el-checkbox>
                        <el-checkbox label="social">社媒</el-checkbox>
                        <el-checkbox label="video">视频</el-checkbox>
                      </el-checkbox-group>
                    </el-form-item>
                    
                    <el-form-item label="目标受众">
                      <el-select v-model="contentForm.audience" placeholder="请选择">
                        <el-option label="B2B企业" value="b2b" />
                        <el-option label="B2C消费者" value="b2c" />
                        <el-option label="技术人员" value="tech" />
                        <el-option label="决策者" value="decision_maker" />
                      </el-select>
                    </el-form-item>
                    
                    <el-form-item label="发布时间">
                      <el-date-picker
                        v-model="contentForm.publishTime"
                        type="datetime"
                        placeholder="选择发布时间"
                        style="width: 100%"
                      />
                    </el-form-item>
                    
                    <el-form-item label="内容风格">
                      <el-radio-group v-model="contentForm.style">
                        <el-radio label="professional">专业</el-radio>
                        <el-radio label="casual">轻松</el-radio>
                        <el-radio label="formal">正式</el-radio>
                        <el-radio label="creative">创意</el-radio>
                      </el-radio-group>
                    </el-form-item>
                    
                    <el-button type="primary" @click="generateContentRecommend" :loading="contentLoading">
                      生成内容推荐
                    </el-button>
                  </el-form>
                </el-card>
              </el-col>

              <!-- 推荐内容展示 -->
              <el-col :span="16">
                <div class="content-results">
                  <div v-for="content in recommendedContents" :key="content.id" class="content-item">
                    <el-card>
                      <div class="content-header">
                        <el-tag :type="getContentTypeTag(content.type)">
                          {{ getContentTypeText(content.type) }}
                        </el-tag>
                        <el-rate v-model="content.rating" disabled show-score />
                      </div>
                      
                      <h3 class="content-title">{{ content.title }}</h3>
                      <p class="content-summary">{{ content.summary }}</p>
                      
                      <div class="content-meta">
                        <span><el-icon><Clock /></el-icon> {{ content.readTime }} 分钟阅读</span>
                        <span><el-icon><View /></el-icon> 预计 {{ content.expectedViews }} 浏览</span>
                        <span><el-icon><ChatDotSquare /></el-icon> {{ content.engagement }}% 互动率</span>
                      </div>
                      
                      <div class="content-keywords">
                        <el-tag v-for="keyword in content.keywords" :key="keyword" size="small">
                          {{ keyword }}
                        </el-tag>
                      </div>
                      
                      <div class="content-actions">
                        <el-button size="small" @click="previewContent(content)">
                          <el-icon><View /></el-icon>
                          预览
                        </el-button>
                        <el-button size="small" @click="editContent(content)">
                          <el-icon><Edit /></el-icon>
                          编辑
                        </el-button>
                        <el-button size="small" type="primary" @click="useContent(content)">
                          <el-icon><Check /></el-icon>
                          使用
                        </el-button>
                      </div>
                    </el-card>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- 策略推荐 -->
        <el-tab-pane name="strategy">
          <template #label>
            <span class="tab-label">
              <el-icon><TrendCharts /></el-icon>
              策略推荐
            </span>
          </template>
          
          <div class="tab-content">
            <!-- 当前业务状况 -->
            <el-card class="business-status">
              <template #header>
                <span>业务状况分析</span>
              </template>
              
              <el-row :gutter="20">
                <el-col :span="6">
                  <el-statistic title="转化率" :value="businessMetrics.conversionRate" suffix="%" />
                </el-col>
                <el-col :span="6">
                  <el-statistic title="客户生命周期价值" :value="businessMetrics.ltv" prefix="$" />
                </el-col>
                <el-col :span="6">
                  <el-statistic title="获客成本" :value="businessMetrics.cac" prefix="$" />
                </el-col>
                <el-col :span="6">
                  <el-statistic title="月活跃客户" :value="businessMetrics.activeCustomers" />
                </el-col>
              </el-row>
            </el-card>

            <!-- 策略推荐卡片 -->
            <div class="strategy-cards">
              <el-row :gutter="20">
                <el-col :span="8" v-for="strategy in recommendedStrategies" :key="strategy.id">
                  <el-card class="strategy-card">
                    <div class="strategy-header">
                      <el-icon :size="32" :color="strategy.color">
                        <component :is="strategy.icon" />
                      </el-icon>
                      <el-tag :type="strategy.priority">{{ strategy.priorityText }}</el-tag>
                    </div>
                    
                    <h3>{{ strategy.title }}</h3>
                    <p class="strategy-desc">{{ strategy.description }}</p>
                    
                    <div class="strategy-metrics">
                      <div class="metric">
                        <span class="label">预期提升</span>
                        <span class="value">{{ strategy.expectedImprovement }}%</span>
                      </div>
                      <div class="metric">
                        <span class="label">实施难度</span>
                        <el-rate v-model="strategy.difficulty" disabled :max="5" />
                      </div>
                      <div class="metric">
                        <span class="label">投资回报</span>
                        <span class="value">{{ strategy.roi }}x</span>
                      </div>
                    </div>
                    
                    <div class="strategy-steps">
                      <h4>实施步骤</h4>
                      <el-timeline>
                        <el-timeline-item
                          v-for="(step, index) in strategy.steps"
                          :key="index"
                          :timestamp="step.time"
                        >
                          {{ step.action }}
                        </el-timeline-item>
                      </el-timeline>
                    </div>
                    
                    <el-button type="primary" @click="viewStrategyDetail(strategy)">
                      查看详细方案
                    </el-button>
                  </el-card>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-tab-pane>

        <!-- 实时推荐 -->
        <el-tab-pane name="realtime">
          <template #label>
            <span class="tab-label">
              <el-icon><Lightning /></el-icon>
              实时推荐
            </span>
          </template>
          
          <div class="tab-content">
            <div class="realtime-container">
              <!-- 实时推荐流 -->
              <div class="realtime-stream">
                <div class="stream-header">
                  <h3>实时推荐流</h3>
                  <el-switch
                    v-model="realtimeEnabled"
                    active-text="开启"
                    inactive-text="关闭"
                    @change="toggleRealtime"
                  />
                </div>
                
                <div class="stream-content" v-loading="realtimeLoading">
                  <transition-group name="list" tag="div">
                    <div
                      v-for="item in realtimeItems"
                      :key="item.id"
                      class="realtime-item"
                      :class="{ 'new-item': item.isNew }"
                    >
                      <div class="item-icon">
                        <el-icon :size="24" :color="item.color">
                          <component :is="item.icon" />
                        </el-icon>
                      </div>
                      
                      <div class="item-content">
                        <div class="item-title">{{ item.title }}</div>
                        <div class="item-desc">{{ item.description }}</div>
                        <div class="item-time">{{ formatTime(item.timestamp) }}</div>
                      </div>
                      
                      <div class="item-action">
                        <el-button size="small" @click="handleRealtimeAction(item)">
                          {{ item.actionText }}
                        </el-button>
                      </div>
                    </div>
                  </transition-group>
                </div>
              </div>

              <!-- 推荐统计 -->
              <div class="realtime-stats">
                <el-card>
                  <template #header>
                    <span>今日推荐统计</span>
                  </template>
                  
                  <div class="stats-grid">
                    <div class="stat-item">
                      <div class="stat-value">{{ todayStats.total }}</div>
                      <div class="stat-label">总推荐数</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-value">{{ todayStats.accepted }}</div>
                      <div class="stat-label">已采纳</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-value">{{ todayStats.pending }}</div>
                      <div class="stat-label">待处理</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-value">{{ todayStats.accuracy }}%</div>
                      <div class="stat-label">准确率</div>
                    </div>
                  </div>
                  
                  <div class="chart-container">
                    <div ref="realtimeChart" style="height: 200px"></div>
                  </div>
                </el-card>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 推荐历史抽屉 -->
    <el-drawer
      v-model="historyDrawer"
      title="推荐历史"
      size="50%"
    >
      <div class="history-content">
        <el-table :data="recommendHistory" style="width: 100%">
          <el-table-column prop="timestamp" label="时间" width="160">
            <template #default="{ row }">
              {{ formatDateTime(row.timestamp) }}
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag>{{ getRecommendTypeText(row.type) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="推荐内容" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button type="text" size="small" @click="viewHistoryDetail(row)">
                查看
              </el-button>
              <el-button type="text" size="small" @click="reuseRecommend(row)">
                复用
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import {
  MagicStick, Goods, User, Document, TrendCharts, Lightning,
  InfoFilled, CircleCheck, Clock, View, ChatDotSquare, Edit, Check
} from '@element-plus/icons-vue'

// 当前标签页
const activeTab = ref('product')

// 产品推荐
const productForm = reactive({
  customerType: '',
  industry: '',
  budget: ''
})
const productLoading = ref(false)
const recommendedProducts = ref([
  {
    id: 1,
    name: 'Premium Software Suite',
    image: 'https://picsum.photos/200/150?random=1',
    price: 2999,
    matchScore: 95,
    tags: ['企业级', '高性能', '易集成'],
    reason: '基于客户行业和预算的最佳匹配'
  },
  {
    id: 2,
    name: 'Cloud Platform Pro',
    image: 'https://picsum.photos/200/150?random=2',
    price: 1999,
    matchScore: 88,
    tags: ['云服务', '可扩展', '安全'],
    reason: '符合技术需求和扩展性要求'
  },
  {
    id: 3,
    name: 'Data Analytics Tool',
    image: 'https://picsum.photos/200/150?random=3',
    price: 1499,
    matchScore: 82,
    tags: ['数据分析', 'AI驱动', '实时'],
    reason: '提升业务洞察力的理想选择'
  },
  {
    id: 4,
    name: 'Marketing Automation',
    image: 'https://picsum.photos/200/150?random=4',
    price: 899,
    matchScore: 76,
    tags: ['自动化', '营销', '集成'],
    reason: '优化营销流程的高效工具'
  }
])

// 客户推荐
const customerForm = reactive({
  productType: '',
  goal: '',
  region: ''
})
const customerLoading = ref(false)
const recommendedCustomers = ref([
  {
    id: 1,
    name: 'John Smith',
    company: 'Tech Corp',
    avatar: 'https://picsum.photos/50/50?random=1',
    industry: '科技',
    potential: 85,
    matchScore: 92,
    reasons: ['有明确采购需求', '预算充足', '决策周期短']
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    company: 'Global Trade Inc',
    avatar: 'https://picsum.photos/50/50?random=2',
    industry: '贸易',
    potential: 78,
    matchScore: 85,
    reasons: ['正在寻找解决方案', '对产品感兴趣', '有扩展计划']
  }
])

// 内容推荐
const contentForm = reactive({
  types: ['article', 'email'],
  audience: '',
  publishTime: '',
  style: 'professional'
})
const contentLoading = ref(false)
const recommendedContents = ref([
  {
    id: 1,
    type: 'article',
    title: '2024年数字化转型趋势解析',
    summary: '深入探讨企业数字化转型的关键趋势和最佳实践，帮助您制定有效的转型策略...',
    rating: 4.5,
    readTime: 8,
    expectedViews: 5000,
    engagement: 12,
    keywords: ['数字化', '转型', '趋势', '企业']
  },
  {
    id: 2,
    type: 'email',
    title: '新品发布邮件模板',
    summary: '专业设计的新品发布邮件模板，包含吸引人的标题和清晰的产品介绍...',
    rating: 4.8,
    readTime: 3,
    expectedViews: 2000,
    engagement: 25,
    keywords: ['新品', '发布', '邮件营销']
  }
])

// 策略推荐
const businessMetrics = reactive({
  conversionRate: 3.5,
  ltv: 15000,
  cac: 500,
  activeCustomers: 1250
})

const recommendedStrategies = ref([
  {
    id: 1,
    title: '个性化营销策略',
    description: '基于客户行为数据，实施精准的个性化营销，提升转化率和客户满意度',
    icon: 'User',
    color: '#409EFF',
    priority: 'danger',
    priorityText: '高优先级',
    expectedImprovement: 35,
    difficulty: 3,
    roi: 4.2,
    steps: [
      { time: '第1周', action: '收集和分析客户数据' },
      { time: '第2周', action: '建立客户细分模型' },
      { time: '第3周', action: '设计个性化内容' },
      { time: '第4周', action: '实施和监控效果' }
    ]
  },
  {
    id: 2,
    title: '内容营销优化',
    description: '优化内容创作和分发策略，提高品牌曝光度和用户参与度',
    icon: 'Document',
    color: '#67C23A',
    priority: 'warning',
    priorityText: '中优先级',
    expectedImprovement: 28,
    difficulty: 2,
    roi: 3.5,
    steps: [
      { time: '第1周', action: '内容审计和分析' },
      { time: '第2周', action: '制定内容日历' },
      { time: '第3周', action: '优化SEO策略' },
      { time: '第4周', action: '多渠道分发' }
    ]
  },
  {
    id: 3,
    title: '客户留存计划',
    description: '实施全面的客户留存策略，降低流失率，提高客户生命周期价值',
    icon: 'TrendCharts',
    color: '#E6A23C',
    priority: 'success',
    priorityText: '重要',
    expectedImprovement: 42,
    difficulty: 4,
    roi: 5.1,
    steps: [
      { time: '第1周', action: '识别流失风险客户' },
      { time: '第2周', action: '设计留存激励方案' },
      { time: '第3周', action: '建立客户成功体系' },
      { time: '第4周', action: '持续跟踪和优化' }
    ]
  }
])

// 实时推荐
const realtimeEnabled = ref(true)
const realtimeLoading = ref(false)
const realtimeItems = ref([
  {
    id: 1,
    icon: 'User',
    color: '#409EFF',
    title: '潜在高价值客户',
    description: '检测到客户John Doe在网站停留超过10分钟，浏览了5个产品页面',
    timestamp: Date.now() - 60000,
    actionText: '立即联系',
    isNew: true
  },
  {
    id: 2,
    icon: 'ShoppingCart',
    color: '#67C23A',
    title: '交叉销售机会',
    description: '客户最近购买了产品A，推荐相关产品B和C',
    timestamp: Date.now() - 180000,
    actionText: '发送推荐',
    isNew: false
  }
])

const todayStats = reactive({
  total: 156,
  accepted: 42,
  pending: 28,
  accuracy: 87
})

// 推荐历史
const historyDrawer = ref(false)
const recommendHistory = ref([])

// 图表实例
let realtimeChart = null

// 生成产品推荐
const generateProductRecommend = async () => {
  productLoading.value = true
  setTimeout(() => {
    ElMessage.success('产品推荐已生成')
    productLoading.value = false
  }, 1500)
}

// 生成客户推荐
const generateCustomerRecommend = async () => {
  customerLoading.value = true
  setTimeout(() => {
    ElMessage.success('客户推荐已生成')
    customerLoading.value = false
  }, 1500)
}

// 生成内容推荐
const generateContentRecommend = async () => {
  contentLoading.value = true
  setTimeout(() => {
    ElMessage.success('内容推荐已生成')
    contentLoading.value = false
  }, 1500)
}

// 切换实时推荐
const toggleRealtime = (val) => {
  if (val) {
    startRealtimeUpdates()
    ElMessage.success('实时推荐已开启')
  } else {
    stopRealtimeUpdates()
    ElMessage.info('实时推荐已关闭')
  }
}

// 实时更新定时器
let realtimeTimer = null

const startRealtimeUpdates = () => {
  realtimeTimer = setInterval(() => {
    if (Math.random() > 0.5) {
      const newItem = {
        id: Date.now(),
        icon: ['User', 'Goods', 'Document'][Math.floor(Math.random() * 3)],
        color: ['#409EFF', '#67C23A', '#E6A23C'][Math.floor(Math.random() * 3)],
        title: '新的推荐',
        description: '系统检测到新的推荐机会',
        timestamp: Date.now(),
        actionText: '查看',
        isNew: true
      }
      realtimeItems.value.unshift(newItem)
      if (realtimeItems.value.length > 10) {
        realtimeItems.value.pop()
      }
      
      // 更新统计
      todayStats.total++
      todayStats.pending++
    }
  }, 5000)
}

const stopRealtimeUpdates = () => {
  if (realtimeTimer) {
    clearInterval(realtimeTimer)
    realtimeTimer = null
  }
}

// 初始化图表
const initChart = () => {
  const chartDom = document.querySelector('.chart-container > div')
  if (chartDom) {
    realtimeChart = echarts.init(chartDom)
    
    const option = {
      xAxis: {
        type: 'category',
        data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00']
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        data: [20, 35, 55, 80, 65, 45, 30],
        type: 'line',
        smooth: true,
        areaStyle: {
          color: 'rgba(64, 158, 255, 0.2)'
        }
      }]
    }
    
    realtimeChart.setOption(option)
  }
}

// 工具函数
const getPotentialColor = (val) => {
  if (val >= 80) return '#67C23A'
  if (val >= 60) return '#E6A23C'
  return '#909399'
}

const getMatchType = (score) => {
  if (score >= 90) return 'success'
  if (score >= 70) return 'warning'
  return 'info'
}

const getContentTypeTag = (type) => {
  const map = {
    article: 'success',
    email: 'primary',
    social: 'warning',
    video: 'danger'
  }
  return map[type] || 'info'
}

const getContentTypeText = (type) => {
  const map = {
    article: '文章',
    email: '邮件',
    social: '社媒',
    video: '视频'
  }
  return map[type] || type
}

const formatTime = (timestamp) => {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  return `${Math.floor(hours / 24)}天前`
}

const formatDateTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

// 事件处理
const handleTabChange = (tab) => {
  if (tab === 'realtime' && realtimeEnabled.value) {
    setTimeout(initChart, 100)
  }
}

const viewProductDetail = (product) => {
  ElMessage.info(`查看产品：${product.name}`)
}

const addToRecommendList = (product) => {
  ElMessage.success(`已添加到推荐列表：${product.name}`)
}

const viewCustomerDetail = (customer) => {
  ElMessage.info(`查看客户：${customer.name}`)
}

const contactCustomer = (customer) => {
  ElMessage.success(`准备联系：${customer.name}`)
}

const previewContent = (content) => {
  ElMessage.info(`预览内容：${content.title}`)
}

const editContent = (content) => {
  ElMessage.info(`编辑内容：${content.title}`)
}

const useContent = (content) => {
  ElMessage.success(`已选择使用：${content.title}`)
}

const viewStrategyDetail = (strategy) => {
  ElMessage.info(`查看策略详情：${strategy.title}`)
}

const handleRealtimeAction = (item) => {
  ElMessage.success(`处理推荐：${item.title}`)
  todayStats.pending--
  todayStats.accepted++
}

// 生命周期
onMounted(() => {
  if (realtimeEnabled.value) {
    startRealtimeUpdates()
  }
})

onUnmounted(() => {
  stopRealtimeUpdates()
  if (realtimeChart) {
    realtimeChart.dispose()
  }
})
</script>

<style scoped lang="scss">
@use "@/assets/styles/variables.scss" as *;

.recommend-page {
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
  
  .recommend-tabs {
    .tab-label {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
    }
    
    .tab-content {
      padding: $spacing-lg 0;
    }
  }
  
  // 条件卡片
  .condition-card {
    margin-bottom: $spacing-lg;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  
  // 产品推荐
  .product-card {
    .product-image {
      position: relative;
      height: 150px;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .match-score {
        position: absolute;
        top: $spacing-sm;
        right: $spacing-sm;
      }
    }
    
    .product-info {
      padding: $spacing-md;
      
      h4 {
        margin: 0 0 $spacing-sm 0;
      }
      
      .price {
        font-size: 20px;
        color: $primary-color;
        font-weight: bold;
        margin: $spacing-sm 0;
      }
      
      .tags {
        display: flex;
        gap: $spacing-xs;
        flex-wrap: wrap;
        margin: $spacing-sm 0;
      }
      
      .reason {
        display: flex;
        align-items: center;
        gap: $spacing-xs;
        color: $text-secondary;
        font-size: 12px;
        margin-top: $spacing-sm;
      }
    }
    
    .product-actions {
      padding: $spacing-md;
      border-top: 1px solid $border-color;
      display: flex;
      gap: $spacing-sm;
    }
  }
  
  // 客户列表
  .customer-info {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    
    .name {
      font-weight: 500;
    }
    
    .company {
      font-size: 12px;
      color: $text-secondary;
    }
  }
  
  .reason-list {
    .reason-item {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
      font-size: 12px;
      color: $text-regular;
      margin-bottom: $spacing-xs;
      
      .el-icon {
        color: $success-color;
      }
    }
  }
  
  // 内容推荐
  .settings-card {
    height: 100%;
  }
  
  .content-results {
    .content-item {
      margin-bottom: $spacing-lg;
      
      .content-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: $spacing-md;
      }
      
      .content-title {
        margin: 0 0 $spacing-sm 0;
        font-size: 18px;
      }
      
      .content-summary {
        color: $text-regular;
        line-height: 1.6;
        margin-bottom: $spacing-md;
      }
      
      .content-meta {
        display: flex;
        gap: $spacing-lg;
        color: $text-secondary;
        font-size: 13px;
        margin-bottom: $spacing-md;
        
        span {
          display: flex;
          align-items: center;
          gap: $spacing-xs;
        }
      }
      
      .content-keywords {
        display: flex;
        gap: $spacing-xs;
        flex-wrap: wrap;
        margin-bottom: $spacing-md;
      }
      
      .content-actions {
        display: flex;
        gap: $spacing-sm;
      }
    }
  }
  
  // 策略推荐
  .business-status {
    margin-bottom: $spacing-xl;
  }
  
  .strategy-card {
    height: 100%;
    
    .strategy-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: $spacing-md;
    }
    
    h3 {
      margin: 0 0 $spacing-sm 0;
      font-size: 18px;
    }
    
    .strategy-desc {
      color: $text-regular;
      line-height: 1.6;
      margin-bottom: $spacing-lg;
    }
    
    .strategy-metrics {
      background: $bg-color;
      padding: $spacing-md;
      border-radius: 4px;
      margin-bottom: $spacing-lg;
      
      .metric {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: $spacing-sm;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .label {
          color: $text-secondary;
          font-size: 13px;
        }
        
        .value {
          font-weight: bold;
          color: $primary-color;
        }
      }
    }
    
    .strategy-steps {
      margin-bottom: $spacing-lg;
      
      h4 {
        margin: 0 0 $spacing-md 0;
        font-size: 14px;
      }
    }
  }
  
  // 实时推荐
  .realtime-container {
    display: flex;
    gap: $spacing-lg;
    
    .realtime-stream {
      flex: 1;
      
      .stream-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: $spacing-lg;
        
        h3 {
          margin: 0;
        }
      }
      
      .stream-content {
        .realtime-item {
          display: flex;
          align-items: center;
          gap: $spacing-md;
          padding: $spacing-md;
          background: white;
          border: 1px solid $border-color;
          border-radius: 4px;
          margin-bottom: $spacing-sm;
          transition: all 0.3s;
          
          &.new-item {
            border-color: $primary-color;
            box-shadow: 0 0 10px rgba(64, 158, 255, 0.2);
          }
          
          .item-icon {
            flex-shrink: 0;
          }
          
          .item-content {
            flex: 1;
            
            .item-title {
              font-weight: 500;
              margin-bottom: $spacing-xs;
            }
            
            .item-desc {
              font-size: 13px;
              color: $text-regular;
              margin-bottom: $spacing-xs;
            }
            
            .item-time {
              font-size: 12px;
              color: $text-secondary;
            }
          }
          
          .item-action {
            flex-shrink: 0;
          }
        }
      }
    }
    
    .realtime-stats {
      width: 350px;
      
      .stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: $spacing-md;
        margin-bottom: $spacing-lg;
        
        .stat-item {
          text-align: center;
          
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: $primary-color;
          }
          
          .stat-label {
            font-size: 12px;
            color: $text-secondary;
            margin-top: $spacing-xs;
          }
        }
      }
      
      .chart-container {
        margin-top: $spacing-lg;
      }
    }
  }
  
  // 动画
  .list-enter-active,
  .list-leave-active {
    transition: all 0.5s;
  }
  
  .list-enter-from {
    opacity: 0;
    transform: translateX(-30px);
  }
  
  .list-leave-to {
    opacity: 0;
    transform: translateX(30px);
  }
}
</style>