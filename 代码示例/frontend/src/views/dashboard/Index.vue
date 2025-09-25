<template>
  <div class="dashboard-container">
    <!-- 数据概览卡片 -->
    <div class="stats-grid">
      <el-card class="stats-card hover-card" shadow="hover" @click="goToPage('/campaign/list')">
        <div class="stats-content">
          <div class="stats-icon">
            <el-icon size="32" color="#409EFF"><Promotion /></el-icon>
          </div>
          <div class="stats-info">
            <div class="stats-value">{{ stats.totalCampaigns }}</div>
            <div class="stats-label">总营销活动</div>
            <div class="stats-change">
              <span class="change-text" :class="{ 'positive': stats.campaignChange > 0, 'negative': stats.campaignChange < 0 }">
                <el-icon v-if="stats.campaignChange > 0"><CaretTop /></el-icon>
                <el-icon v-else-if="stats.campaignChange < 0"><CaretBottom /></el-icon>
                {{ Math.abs(stats.campaignChange) }}%
              </span>
              <span class="change-label">较上月</span>
            </div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stats-card hover-card" shadow="hover" @click="goToPage('/campaign/list')">
        <div class="stats-content">
          <div class="stats-icon">
            <el-icon size="32" color="#67C23A"><Flag /></el-icon>
          </div>
          <div class="stats-info">
            <div class="stats-value">{{ stats.activeCampaigns }}</div>
            <div class="stats-label">进行中活动</div>
            <div class="stats-change">
              <span class="change-text positive">
                <el-icon><CaretTop /></el-icon>
                {{ stats.activeChange }}%
              </span>
              <span class="change-label">较昨日</span>
            </div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stats-card hover-card" shadow="hover" @click="goToPage('/customer-center/list')">
        <div class="stats-content">
          <div class="stats-icon">
            <el-icon size="32" color="#E6A23C"><User /></el-icon>
          </div>
          <div class="stats-info">
            <div class="stats-value">{{ formatNumber(stats.totalCustomers) }}</div>
            <div class="stats-label">总客户数</div>
            <div class="stats-change">
              <span class="change-text positive">
                <el-icon><CaretTop /></el-icon>
                +{{ stats.newCustomersToday }}
              </span>
              <span class="change-label">今日新增</span>
            </div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stats-card hover-card" shadow="hover" @click="goToPage('/channel/email')">
        <div class="stats-content">
          <div class="stats-icon">
            <el-icon size="32" color="#F56C6C"><Message /></el-icon>
          </div>
          <div class="stats-info">
            <div class="stats-value">{{ formatNumber(stats.todayEmails) }}</div>
            <div class="stats-label">今日发送</div>
            <div class="stats-change">
              <span class="change-text" :class="{ 'positive': stats.emailChange > 0, 'negative': stats.emailChange < 0 }">
                <el-icon v-if="stats.emailChange > 0"><CaretTop /></el-icon>
                <el-icon v-else-if="stats.emailChange < 0"><CaretBottom /></el-icon>
                {{ Math.abs(stats.emailChange) }}%
              </span>
              <span class="change-label">较昨日</span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 新增统计卡片 -->
      <el-card class="stats-card hover-card" shadow="hover" @click="showDetailModal('openRate')">
        <div class="stats-content">
          <div class="stats-icon">
            <el-icon size="32" color="#9C27B0"><View /></el-icon>
          </div>
          <div class="stats-info">
            <div class="stats-value">{{ stats.openRate }}%</div>
            <div class="stats-label">邮件打开率</div>
            <div class="stats-change">
              <span class="change-text positive">
                <el-icon><CaretTop /></el-icon>
                {{ stats.openRateChange }}%
              </span>
              <span class="change-label">较上周</span>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="stats-card hover-card" shadow="hover" @click="showDetailModal('clickRate')">
        <div class="stats-content">
          <div class="stats-icon">
            <el-icon size="32" color="#FF9800"><Mouse /></el-icon>
          </div>
          <div class="stats-info">
            <div class="stats-value">{{ stats.clickRate }}%</div>
            <div class="stats-label">邮件点击率</div>
            <div class="stats-change">
              <span class="change-text" :class="{ 'positive': stats.clickRateChange > 0, 'negative': stats.clickRateChange < 0 }">
                <el-icon v-if="stats.clickRateChange > 0"><CaretTop /></el-icon>
                <el-icon v-else-if="stats.clickRateChange < 0"><CaretBottom /></el-icon>
                {{ Math.abs(stats.clickRateChange) }}%
              </span>
              <span class="change-label">较上周</span>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="stats-card hover-card" shadow="hover" @click="showDetailModal('conversion')">
        <div class="stats-content">
          <div class="stats-icon">
            <el-icon size="32" color="#4CAF50"><TrendCharts /></el-icon>
          </div>
          <div class="stats-info">
            <div class="stats-value">{{ stats.conversionRate }}%</div>
            <div class="stats-label">转化率</div>
            <div class="stats-change">
              <span class="change-text positive">
                <el-icon><CaretTop /></el-icon>
                {{ stats.conversionChange }}%
              </span>
              <span class="change-label">较上周</span>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="stats-card hover-card" shadow="hover" @click="showDetailModal('revenue')">
        <div class="stats-content">
          <div class="stats-icon">
            <el-icon size="32" color="#FF5722"><Money /></el-icon>
          </div>
          <div class="stats-info">
            <div class="stats-value">${{ formatRevenue(stats.revenue) }}</div>
            <div class="stats-label">营销收入</div>
            <div class="stats-change">
              <span class="change-text positive">
                <el-icon><CaretTop /></el-icon>
                +${{ formatRevenue(stats.revenueIncrease) }}
              </span>
              <span class="change-label">本月增长</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 实时监控 -->
    <el-row :gutter="20" class="mb-lg">
      <el-col :span="24">
        <el-card class="real-time-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>实时监控</span>
              <el-tag type="success" size="small">
                <el-icon><VideoCamera /></el-icon>
                实时更新
              </el-tag>
            </div>
          </template>
          
          <div class="real-time-grid">
            <div class="real-time-item">
              <div class="item-icon">
                <el-icon size="24" color="#409EFF"><View /></el-icon>
              </div>
              <div class="item-info">
                <div class="item-value">{{ realTimeData.onlineUsers }}</div>
                <div class="item-label">在线用户</div>
              </div>
            </div>
            
            <div class="real-time-item">
              <div class="item-icon">
                <el-icon size="24" color="#67C23A"><Promotion /></el-icon>
              </div>
              <div class="item-info">
                <div class="item-value">{{ realTimeData.emailsSent }}</div>
                <div class="item-label">邮件发送</div>
              </div>
            </div>
            
            <div class="real-time-item">
              <div class="item-icon">
                <el-icon size="24" color="#E6A23C"><Mouse /></el-icon>
              </div>
              <div class="item-info">
                <div class="item-value">{{ realTimeData.clicks }}</div>
                <div class="item-label">链接点击</div>
              </div>
            </div>
            
            <div class="real-time-item">
              <div class="item-icon">
                <el-icon size="24" color="#F56C6C"><TrendCharts /></el-icon>
              </div>
              <div class="item-info">
                <div class="item-value">{{ realTimeData.conversions }}</div>
                <div class="item-label">转化数量</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="mb-lg">
      <!-- 邮件效果趋势 -->
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>邮件效果趋势</span>
              <div class="chart-controls">
                <el-select v-model="selectedMetric" size="small" @change="updateChart">
                  <el-option label="发送量" value="sent" />
                  <el-option label="打开量" value="opened" />
                  <el-option label="点击量" value="clicked" />
                  <el-option label="打开率" value="openRate" />
                  <el-option label="点击率" value="clickRate" />
                </el-select>
                <el-radio-group v-model="trendPeriod" size="small" @change="updateChart">
                  <el-radio-button label="7">7天</el-radio-button>
                  <el-radio-button label="30">30天</el-radio-button>
                  <el-radio-button label="90">90天</el-radio-button>
                </el-radio-group>
                <el-button size="small" @click="exportChart">
                  <el-icon><Download /></el-icon>
                  导出
                </el-button>
              </div>
            </div>
          </template>
          
          <div class="chart-container">
            <div class="chart-metrics">
              <div class="metric-item">
                <span class="metric-label">平均打开率</span>
                <span class="metric-value">{{ averageMetrics.openRate }}%</span>
                <span class="metric-trend positive">+2.3%</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">平均点击率</span>
                <span class="metric-value">{{ averageMetrics.clickRate }}%</span>
                <span class="metric-trend positive">+1.8%</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">总发送量</span>
                <span class="metric-value">{{ formatNumber(averageMetrics.totalSent) }}</span>
                <span class="metric-trend positive">+12.5%</span>
              </div>
            </div>
            <div ref="emailTrendChart" class="chart"></div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 转化漏斗 -->
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <span>转化漏斗</span>
          </template>
          
          <div class="funnel-container">
            <div
              v-for="(item, index) in conversionFunnel"
              :key="index"
              class="funnel-item"
              :style="{ width: item.rate + '%' }"
            >
              <div class="funnel-label">{{ item.stage }}</div>
              <div class="funnel-value">{{ formatNumber(item.count) }} ({{ item.rate }}%)</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 热门产品和AI建议 -->
    <el-row :gutter="20" class="mb-lg">
      <!-- 热门产品排行 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>热门产品排行 TOP10</span>
          </template>
          
          <div class="product-ranking">
            <div
              v-for="(product, index) in topProducts.slice(0, 10)"
              :key="index"
              class="ranking-item"
            >
              <div class="ranking-number">{{ index + 1 }}</div>
              <div class="product-info">
                <div class="product-name">{{ product.name }}</div>
                <div class="product-stats">
                  点击：{{ product.clicks }} | 转化：{{ product.conversions }} | 转化率：{{ product.rate }}%
                </div>
              </div>
              <div class="product-progress">
                <el-progress
                  :percentage="(product.clicks / topProducts[0].clicks * 100)"
                  :show-text="false"
                  stroke-width="6"
                />
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- AI智能建议 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>AI智能建议</span>
              <div class="ai-header-actions">
                <el-badge :value="highPriorityCount" type="danger" :hidden="highPriorityCount === 0">
                  <el-button
                    size="small"
                    type="primary"
                    @click="refreshAiSuggestions"
                    :loading="aiLoading"
                  >
                    <el-icon><Refresh /></el-icon>
                  </el-button>
                </el-badge>
                <el-icon class="ai-icon"><MagicStick /></el-icon>
              </div>
            </div>
          </template>
          
          <div class="ai-suggestions">
            <div v-if="aiLoading" class="ai-loading">
              <el-skeleton :rows="3" animated />
            </div>
            <div v-else>
              <div
                v-for="suggestion in aiSuggestions.slice(0, 4)"
                :key="suggestion.id"
                class="suggestion-item"
                :class="`priority-${suggestion.priority}`"
              >
                <div class="suggestion-icon">
                  <el-icon><component :is="suggestion.icon" /></el-icon>
                </div>
                <div class="suggestion-content">
                  <div class="suggestion-title">{{ suggestion.title }}</div>
                  <div class="suggestion-desc">{{ suggestion.description }}</div>
                  <div v-if="suggestion.metrics" class="suggestion-metrics">
                    <span
                      v-for="metric in suggestion.metrics"
                      :key="metric.label"
                      class="metric-tag"
                    >
                      {{ metric.label }}: {{ metric.value }}
                    </span>
                  </div>
                </div>
                <div class="suggestion-action">
                  <el-button
                    size="small"
                    :type="suggestion.priority === 'high' ? 'primary' : 'default'"
                    @click="handleSuggestionAction(suggestion)"
                  >
                    {{ suggestion.action }}
                  </el-button>
                  <el-button
                    size="small"
                    type="text"
                    @click="dismissSuggestion(suggestion.id)"
                  >
                    忽略
                  </el-button>
                </div>
              </div>
              
              <div v-if="aiSuggestions.length > 4" class="more-suggestions">
                <el-button type="text" @click="showAllSuggestions">
                  查看全部{{ aiSuggestions.length }}条建议
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 客户增长趋势分析 -->
    <el-row :gutter="20" class="mb-lg">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>客户增长趋势</span>
              <el-select
                v-model="customerGrowthTimeRange"
                size="small"
                style="width: 120px"
                @change="handleCustomerGrowthRangeChange"
              >
                <el-option label="近6个月" value="6months" />
                <el-option label="近12个月" value="12months" />
                <el-option label="近24个月" value="24months" />
              </el-select>
            </div>
          </template>
          
          <div class="customer-growth-chart">
            <div ref="customerGrowthChartRef" style="height: 300px;"></div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card shadow="hover" class="mb-md">
          <template #header>
            <span>客户来源分析</span>
          </template>
          
          <div class="customer-source-chart">
            <div ref="customerSourceChartRef" style="height: 140px;"></div>
          </div>
        </el-card>
        
        <el-card shadow="hover">
          <template #header>
            <span>地域分布</span>
          </template>
          
          <div class="geo-distribution">
            <div
              v-for="region in geoDistribution"
              :key="region.name"
              class="geo-item"
            >
              <div class="geo-info">
                <span class="geo-name">{{ region.name }}</span>
                <span class="geo-count">{{ region.count }}</span>
              </div>
              <el-progress
                :percentage="region.percentage"
                :show-text="false"
                stroke-width="6"
                :color="region.color"
              />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 实时监控和系统状态 -->
    <el-row :gutter="20" class="mb-lg">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>实时监控</span>
              <el-tag :type="systemHealthType">{{ systemHealthText }}</el-tag>
            </div>
          </template>
          
          <div class="monitoring-container">
            <el-row :gutter="20">
              <el-col :span="6">
                <div class="monitor-item">
                  <div class="monitor-icon">
                    <el-icon size="24" :color="emailQueueStatus.color"><Message /></el-icon>
                  </div>
                  <div class="monitor-info">
                    <div class="monitor-value">{{ emailQueueStatus.count }}</div>
                    <div class="monitor-label">邮件队列</div>
                    <el-progress 
                      :percentage="emailQueueStatus.percentage" 
                      :color="emailQueueStatus.color"
                      :show-text="false"
                    />
                  </div>
                </div>
              </el-col>
              
              <el-col :span="6">
                <div class="monitor-item">
                  <div class="monitor-icon">
                    <el-icon size="24" :color="apiStatus.color"><Connection /></el-icon>
                  </div>
                  <div class="monitor-info">
                    <div class="monitor-value">{{ apiStatus.latency }}ms</div>
                    <div class="monitor-label">API延迟</div>
                    <el-progress 
                      :percentage="apiStatus.health" 
                      :color="apiStatus.color"
                      :show-text="false"
                    />
                  </div>
                </div>
              </el-col>
              
              <el-col :span="6">
                <div class="monitor-item">
                  <div class="monitor-icon">
                    <el-icon size="24" :color="errorRate.color"><WarningFilled /></el-icon>
                  </div>
                  <div class="monitor-info">
                    <div class="monitor-value">{{ errorRate.rate }}%</div>
                    <div class="monitor-label">错误率</div>
                    <el-progress 
                      :percentage="100 - errorRate.rate * 10" 
                      :color="errorRate.color"
                      :show-text="false"
                    />
                  </div>
                </div>
              </el-col>
              
              <el-col :span="6">
                <div class="monitor-item">
                  <div class="monitor-icon">
                    <el-icon size="24" :color="serverStatus.color"><Monitor /></el-icon>
                  </div>
                  <div class="monitor-info">
                    <div class="monitor-value">{{ serverStatus.cpu }}%</div>
                    <div class="monitor-label">CPU使用率</div>
                    <el-progress 
                      :percentage="serverStatus.cpu" 
                      :color="serverStatus.color"
                      :show-text="false"
                    />
                  </div>
                </div>
              </el-col>
            </el-row>
            
            <!-- 最近告警 -->
            <div class="recent-alerts mt-lg">
              <div class="alerts-header">
                <span class="alerts-title">最近告警</span>
                <el-button type="text" size="small" @click="viewAllAlerts">查看全部</el-button>
              </div>
              <div class="alerts-list">
                <div 
                  v-for="alert in recentAlerts" 
                  :key="alert.id"
                  class="alert-item"
                  :class="`alert-${alert.level}`"
                >
                  <el-icon :color="alert.color"><component :is="alert.icon" /></el-icon>
                  <span class="alert-message">{{ alert.message }}</span>
                  <span class="alert-time">{{ alert.time }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>数据导出</span>
              <el-icon><Download /></el-icon>
            </div>
          </template>
          
          <div class="export-container">
            <div class="export-section">
              <h4>快速导出</h4>
              <el-button-group class="full-width">
                <el-button @click="exportData('today')">今日数据</el-button>
                <el-button @click="exportData('week')">本周数据</el-button>
                <el-button @click="exportData('month')">本月数据</el-button>
              </el-button-group>
            </div>
            
            <el-divider />
            
            <div class="export-section">
              <h4>自定义导出</h4>
              <el-form :model="exportForm" label-width="70px" size="small">
                <el-form-item label="数据类型">
                  <el-select v-model="exportForm.type" placeholder="选择类型">
                    <el-option label="营销活动" value="campaign" />
                    <el-option label="客户数据" value="customer" />
                    <el-option label="产品数据" value="product" />
                    <el-option label="邮件统计" value="email" />
                  </el-select>
                </el-form-item>
                <el-form-item label="时间范围">
                  <el-date-picker
                    v-model="exportForm.dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    size="small"
                  />
                </el-form-item>
                <el-form-item label="导出格式">
                  <el-radio-group v-model="exportForm.format">
                    <el-radio label="excel">Excel</el-radio>
                    <el-radio label="csv">CSV</el-radio>
                    <el-radio label="pdf">PDF</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="customExport">导出数据</el-button>
                </el-form-item>
              </el-form>
            </div>
            
            <el-divider />
            
            <div class="export-section">
              <h4>定时报告</h4>
              <el-switch
                v-model="scheduledReport.enabled"
                active-text="已启用"
                inactive-text="已禁用"
              />
              <div v-if="scheduledReport.enabled" class="schedule-info">
                <p>每{{ scheduledReport.frequency }}发送至：</p>
                <p class="email-info">{{ scheduledReport.email }}</p>
                <el-button type="text" size="small" @click="configureSchedule">配置</el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
              <el-tag type="info">常用功能</el-tag>
            </div>
          </template>
          
          <div class="quick-actions-grid">
            <div class="action-card" @click="createCampaign">
              <el-icon size="32" color="#409EFF"><Plus /></el-icon>
              <h4>创建营销活动</h4>
              <p>快速创建新的邮件营销活动</p>
            </div>
            
            <div class="action-card" @click="importCustomers">
              <el-icon size="32" color="#67C23A"><Upload /></el-icon>
              <h4>导入客户</h4>
              <p>批量导入客户数据</p>
            </div>
            
            <div class="action-card" @click="sendEmails">
              <el-icon size="32" color="#E6A23C"><Message /></el-icon>
              <h4>群发邮件</h4>
              <p>一键发送营销邮件</p>
            </div>
            
            <div class="action-card" @click="viewReports">
              <el-icon size="32" color="#F56C6C"><Document /></el-icon>
              <h4>查看报表</h4>
              <p>查看详细数据报表</p>
            </div>
            
            <div class="action-card" @click="manageTemplates">
              <el-icon size="32" color="#909399"><Files /></el-icon>
              <h4>模板管理</h4>
              <p>管理邮件模板库</p>
            </div>
            
            <div class="action-card" @click="aiAssistant">
              <el-icon size="32" color="#B667F1"><MagicStick /></el-icon>
              <h4>AI助手</h4>
              <p>智能内容生成与优化</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import * as echarts from 'echarts'
import websocketService from '@/utils/websocket'

const store = useStore()
const router = useRouter()

// 响应式数据
const trendPeriod = ref('7')
const selectedMetric = ref('sent')
const customerGrowthTimeRange = ref('12months')
const aiLoading = ref(false)
const emailTrendChart = ref()
const customerGrowthChartRef = ref()
const customerSourceChartRef = ref()
let chartInstance = null
let customerGrowthChart = null
let customerSourceChart = null

// 平均指标数据
const averageMetrics = reactive({
  openRate: 32.5,
  clickRate: 8.7,
  totalSent: 8963
})

// 从store获取数据
const stats = computed(() => store.getters['dashboard/stats'])
const chartData = computed(() => store.getters['dashboard/chartData'])
const conversionFunnel = computed(() => store.getters['dashboard/chartData'].conversionFunnel)
const topProducts = computed(() => store.getters['dashboard/chartData'].topProducts)
const customerGrowthData = computed(() => store.getters['dashboard/chartData'].customerGrowth)
const aiSuggestions = computed(() => store.getters['dashboard/aiSuggestions'])
const realTimeData = computed(() => store.getters['dashboard/realTimeData'])

// 高优先级建议数量
const highPriorityCount = computed(() => {
  return aiSuggestions.value.filter(s => s.priority === 'high').length
})

// 客户来源分析数据
const customerSourceData = reactive([
  { name: '搜索引擎', value: 35, color: '#409EFF' },
  { name: '社交媒体', value: 28, color: '#67C23A' },
  { name: '邮件营销', value: 20, color: '#E6A23C' },
  { name: '直接访问', value: 12, color: '#F56C6C' },
  { name: '其他渠道', value: 5, color: '#909399' }
])

// 地域分布数据
const geoDistribution = reactive([
  { name: '北美', count: 3245, percentage: 35, color: '#409EFF' },
  { name: '欧洲', count: 2876, percentage: 31, color: '#67C23A' },
  { name: '亚洲', count: 2156, percentage: 23, color: '#E6A23C' },
  { name: '其他', count: 987, percentage: 11, color: '#909399' }
])

// 实时监控数据
const emailQueueStatus = reactive({
  count: 256,
  percentage: 75,
  color: '#67C23A'
})

const apiStatus = reactive({
  latency: 82,
  health: 95,
  color: '#409EFF'
})

const errorRate = reactive({
  rate: 0.8,
  color: '#67C23A'
})

const serverStatus = reactive({
  cpu: 68,
  color: '#E6A23C'
})

// 系统健康状态
const systemHealthType = computed(() => {
  if (errorRate.rate > 5) return 'danger'
  if (errorRate.rate > 2) return 'warning'
  return 'success'
})

const systemHealthText = computed(() => {
  if (errorRate.rate > 5) return '系统异常'
  if (errorRate.rate > 2) return '系统警告'
  return '系统正常'
})

// 最近告警
const recentAlerts = reactive([
  { id: 1, level: 'warning', icon: 'WarningFilled', message: '邮件发送队列积压超过阈值', time: '5分钟前', color: '#E6A23C' },
  { id: 2, level: 'info', icon: 'InfoFilled', message: 'API调用频率接近限制', time: '15分钟前', color: '#909399' },
  { id: 3, level: 'success', icon: 'CircleCheckFilled', message: '系统自动优化完成', time: '30分钟前', color: '#67C23A' }
])

// 数据导出表单
const exportForm = reactive({
  type: 'campaign',
  dateRange: [],
  format: 'excel'
})

// 定时报告设置
const scheduledReport = reactive({
  enabled: true,
  frequency: '周一',
  email: 'admin@example.com'
})

// 初始化页面
onMounted(async () => {
  await loadDashboardData()
  await nextTick()
  initCharts()
  
  // 启动WebSocket连接
  initWebSocket()
})

// 清理资源
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
  }
  if (customerGrowthChart) {
    customerGrowthChart.dispose()
  }
  if (customerSourceChart) {
    customerSourceChart.dispose()
  }
  
  // 关闭WebSocket连接
  websocketService.close()
})

// 加载仪表板数据
const loadDashboardData = async () => {
  try {
    await Promise.all([
      store.dispatch('dashboard/fetchDashboardStats'),
      store.dispatch('dashboard/fetchEmailTrendData'),
      store.dispatch('dashboard/fetchConversionFunnelData'),
      store.dispatch('dashboard/fetchTopProductsData'),
      store.dispatch('dashboard/fetchCustomerGrowthData'),
      store.dispatch('dashboard/fetchAiSuggestions')
    ])
  } catch (error) {
    ElMessage.error('数据加载失败')
  }
}

// 初始化图表
const initCharts = () => {
  if (!emailTrendChart.value || !customerGrowthChartRef.value || !customerSourceChartRef.value) return
  
  chartInstance = echarts.init(emailTrendChart.value)
  customerGrowthChart = echarts.init(customerGrowthChartRef.value)
  customerSourceChart = echarts.init(customerSourceChartRef.value)
  
  updateChart()
  updateCustomerGrowthChart()
  updateCustomerSourceChart()
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    chartInstance?.resize()
    customerGrowthChart?.resize()
    customerSourceChart?.resize()
  })
}

// 更新图表
const updateChart = () => {
  if (!chartInstance || !chartData.value.emailTrend.length) return
  
  const data = chartData.value.emailTrend
  const option = getChartOption(data)
  
  chartInstance.setOption(option, true)
}

// 获取图表配置
const getChartOption = (data) => {
  const baseOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: (params) => {
        let result = `${params[0].name}<br/>`
        params.forEach(param => {
          const value = selectedMetric.value.includes('Rate') 
            ? `${param.value}%` 
            : formatNumber(param.value)
          result += `${param.marker} ${param.seriesName}: ${value}<br/>`
        })
        return result
      }
    },
    legend: {
      data: getSeriesNames(),
      top: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.date.slice(-5)),
      axisLine: {
        lineStyle: {
          color: '#E4E7ED'
        }
      },
      axisLabel: {
        color: '#606266'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#E4E7ED'
        }
      },
      axisLabel: {
        color: '#606266',
        formatter: (value) => {
          return selectedMetric.value.includes('Rate') 
            ? `${value}%` 
            : formatNumber(value)
        }
      },
      splitLine: {
        lineStyle: {
          color: '#F2F6FC'
        }
      }
    },
    series: getSeries(data),
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        start: 0,
        end: 100,
        height: 20,
        bottom: 10
      }
    ]
  }
  
  return baseOption
}

// 获取系列名称
const getSeriesNames = () => {
  switch (selectedMetric.value) {
    case 'sent':
      return ['发送量']
    case 'opened':
      return ['打开量']
    case 'clicked':
      return ['点击量']
    case 'openRate':
      return ['打开率']
    case 'clickRate':
      return ['点击率']
    default:
      return ['发送量', '打开量', '点击量']
  }
}

// 获取图表系列数据
const getSeries = (data) => {
  const commonStyle = {
    type: 'line',
    smooth: true,
    symbol: 'circle',
    symbolSize: 6,
    lineStyle: {
      width: 3
    },
    areaStyle: {
      opacity: 0.1
    }
  }
  
  switch (selectedMetric.value) {
    case 'sent':
      return [{
        name: '发送量',
        data: data.map(item => item.sent),
        itemStyle: { color: '#409EFF' },
        ...commonStyle
      }]
    case 'opened':
      return [{
        name: '打开量',
        data: data.map(item => item.opened),
        itemStyle: { color: '#67C23A' },
        ...commonStyle
      }]
    case 'clicked':
      return [{
        name: '点击量',
        data: data.map(item => item.clicked),
        itemStyle: { color: '#E6A23C' },
        ...commonStyle
      }]
    case 'openRate':
      return [{
        name: '打开率',
        data: data.map(item => ((item.opened / item.sent) * 100).toFixed(2)),
        itemStyle: { color: '#9C27B0' },
        ...commonStyle
      }]
    case 'clickRate':
      return [{
        name: '点击率',
        data: data.map(item => ((item.clicked / item.sent) * 100).toFixed(2)),
        itemStyle: { color: '#FF9800' },
        ...commonStyle
      }]
    default:
      return [
        {
          name: '发送量',
          data: data.map(item => item.sent),
          itemStyle: { color: '#409EFF' },
          ...commonStyle
        },
        {
          name: '打开量',
          data: data.map(item => item.opened),
          itemStyle: { color: '#67C23A' },
          ...commonStyle
        },
        {
          name: '点击量',
          data: data.map(item => item.clicked),
          itemStyle: { color: '#E6A23C' },
          ...commonStyle
        }
      ]
  }
}

// 更新客户增长图表
const updateCustomerGrowthChart = () => {
  if (!customerGrowthChart || !customerGrowthData.value.length) return
  
  const data = customerGrowthData.value
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['新增客户', '累计客户'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.month),
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '新增客户',
        position: 'left',
        axisLabel: {
          formatter: '{value}'
        }
      },
      {
        type: 'value',
        name: '累计客户',
        position: 'right',
        axisLabel: {
          formatter: '{value}'
        }
      }
    ],
    series: [
      {
        name: '新增客户',
        type: 'bar',
        data: data.map(item => item.newCustomers),
        itemStyle: {
          color: '#409EFF'
        }
      },
      {
        name: '累计客户',
        type: 'line',
        yAxisIndex: 1,
        data: data.map(item => item.totalCustomers),
        itemStyle: {
          color: '#67C23A'
        },
        lineStyle: {
          width: 3
        },
        smooth: true
      }
    ]
  }
  
  customerGrowthChart.setOption(option)
}

// 更新客户来源图表
const updateCustomerSourceChart = () => {
  if (!customerSourceChart) return
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}% ({d}%)'
    },
    series: [
      {
        name: '客户来源',
        type: 'pie',
        radius: '65%',
        center: ['50%', '50%'],
        data: customerSourceData.map(item => ({
          name: item.name,
          value: item.value,
          itemStyle: {
            color: item.color
          }
        })),
        label: {
          fontSize: 12
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  
  customerSourceChart.setOption(option)
}

// 处理客户增长时间范围变化
const handleCustomerGrowthRangeChange = (value) => {
  // 这里可以根据选择的时间范围重新获取数据
  console.log('客户增长时间范围变化:', value)
  // 重新更新图表
  updateCustomerGrowthChart()
}

// 导出图表
const exportChart = () => {
  if (!chartInstance) return
  
  const base64 = chartInstance.getDataURL({
    type: 'png',
    pixelRatio: 2,
    backgroundColor: '#fff'
  })
  
  // 创建下载链接
  const link = document.createElement('a')
  link.download = `邮件效果趋势-${selectedMetric.value}-${trendPeriod.value}天.png`
  link.href = base64
  link.click()
  
  ElMessage.success('图表导出成功')
}

// 格式化数字
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// 格式化收入
const formatRevenue = (amount) => {
  if (!amount && amount !== 0) return '0'
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1) + 'M'
  }
  if (amount >= 1000) {
    return (amount / 1000).toFixed(0) + 'K'
  }
  return amount.toString()
}

// 跳转到指定页面
const goToPage = (path) => {
  router.push(path)
}

// 显示详情模态框
const showDetailModal = (type) => {
  const typeMap = {
    openRate: '邮件打开率详情',
    clickRate: '邮件点击率详情', 
    conversion: '转化率详情',
    revenue: '营销收入详情'
  }
  
  ElMessage.info(`正在查看${typeMap[type]}...`)
  
  // 这里可以打开详情弹窗或跳转到详情页面
  switch (type) {
    case 'openRate':
    case 'clickRate':
      router.push('/tracking/email')
      break
    case 'conversion':
      router.push('/tracking/funnel')
      break
    case 'revenue':
      router.push('/report/overview')
      break
  }
}

// 处理AI建议操作
const handleSuggestionAction = (suggestion) => {
  ElMessage.success(`正在${suggestion.action}...`)
  
  // 根据建议类型跳转到相应页面
  switch (suggestion.type) {
    case 'customer':
      router.push('/customer-center/list')
      break
    case 'timing':
      router.push('/campaign/create')
      break
    case 'content':
      router.push('/ai-assistant/content')
      break
    case 'product':
      router.push('/product/list')
      break
    case 'automation':
      router.push('/campaign/template')
      break
    case 'segmentation':
      router.push('/customer-center/group')
      break
  }
}

// 刷新AI建议
const refreshAiSuggestions = async () => {
  aiLoading.value = true
  try {
    await store.dispatch('dashboard/fetchAiSuggestions')
    ElMessage.success('AI建议已更新')
  } catch (error) {
    ElMessage.error('更新失败，请重试')
  } finally {
    aiLoading.value = false
  }
}

// 忽略建议
const dismissSuggestion = (suggestionId) => {
  // 这里可以调用API将建议标记为已忽略
  ElMessage.success('建议已忽略')
  console.log('忽略建议:', suggestionId)
}

// 显示所有建议
const showAllSuggestions = () => {
  router.push('/ai-assistant')
}

// 快捷操作
const createCampaign = () => {
  router.push('/campaign/create')
}

const importCustomers = () => {
  router.push('/customer/import')
}

const generateContent = () => {
  router.push('/ai-assistant/content')
}

const viewReports = () => {
  router.push('/report/overview')
}

// 新增的快捷操作方法
const sendEmails = () => {
  ElMessage.info('正在进入群发邮件...')
  router.push('/channel/email')
}

const manageTemplates = () => {
  router.push('/campaign/template')
}

const aiAssistant = () => {
  router.push('/ai-assistant')
}

// 查看所有告警
const viewAllAlerts = () => {
  router.push('/system/log')
}

// 数据导出方法
const exportData = (period) => {
  ElMessage.success(`正在导出${period === 'today' ? '今日' : period === 'week' ? '本周' : '本月'}数据...`)
  // 这里可以调用实际的导出API
  setTimeout(() => {
    ElMessage.success('数据导出成功，已开始下载')
  }, 1500)
}

// 自定义导出
const customExport = () => {
  if (!exportForm.type) {
    ElMessage.warning('请选择数据类型')
    return
  }
  if (!exportForm.dateRange || exportForm.dateRange.length === 0) {
    ElMessage.warning('请选择时间范围')
    return
  }
  
  ElMessage.success('正在生成导出文件...')
  console.log('导出配置:', exportForm)
  
  // 模拟导出
  setTimeout(() => {
    ElMessage.success(`${exportForm.format.toUpperCase()}文件导出成功`)
  }, 2000)
}

// 配置定时报告
const configureSchedule = () => {
  ElMessage.info('正在打开定时报告配置...')
  // 这里可以打开配置弹窗
}

// 初始化WebSocket
const initWebSocket = () => {
  // 订阅实时数据更新
  websocketService.subscribe('realTimeData', (data) => {
    store.dispatch('dashboard/updateRealTimeData', data)
  })
  
  // 订阅邮件事件
  websocketService.subscribe('emailEvent', (eventData) => {
    handleEmailEvent(eventData)
  })
  
  // 订阅系统状态
  websocketService.subscribe('systemStatus', (statusData) => {
    handleSystemStatus(statusData)
  })
  
  // 订阅连接状态
  websocketService.subscribe('connected', () => {
    // 静默处理连接成功，不显示通知
    console.log('WebSocket连接已建立')
  })
  
  // 订阅连接错误
  websocketService.subscribe('error', (error) => {
    // 静默处理连接错误，不显示通知
    console.warn('WebSocket连接异常:', error)
  })
  
  // 启动连接
  websocketService.connect()
}

// 处理邮件事件
const handleEmailEvent = (eventData) => {
  const eventMessages = {
    email_sent: '📧 邮件发送',
    email_opened: '👁️ 邮件打开', 
    email_clicked: '🖱️ 链接点击',
    email_replied: '💬 邮件回复'
  }
  
  const message = eventMessages[eventData.type] || '📨 邮件事件'
  
  // 静默处理邮件事件，不显示通知
  // 事件信息会在控制台中记录
  console.log(message, `客户ID: ${eventData.customerId}`)
  
  // 更新相关统计数据
  updateStatsFromEvent(eventData.type)
}

// 处理系统状态
const handleSystemStatus = (statusData) => {
  if (statusData.serverHealth === 'warning') {
    // 系统状态异常时静默处理，避免频繁弹出通知
    console.warn(`服务器状态异常，错误率: ${statusData.errorRate}%`)
  }
}

// 根据事件更新统计数据
const updateStatsFromEvent = (eventType) => {
  // 模拟更新统计数据
  const currentStats = store.getters['dashboard/stats']
  const updates = {}
  
  switch (eventType) {
    case 'email_sent':
      updates.todayEmails = currentStats.todayEmails + 1
      break
    case 'email_opened':
      // 可以更新打开率相关数据
      break
    case 'email_clicked':
      // 可以更新点击率相关数据
      break
  }
  
  if (Object.keys(updates).length > 0) {
    store.commit('dashboard/SET_STATS', updates)
  }
}
</script>

<style scoped lang="scss">
.dashboard-container {
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: $spacing-lg;
    margin-bottom: $spacing-lg;
    
    .stats-card {
      cursor: pointer;
      transition: all $transition-duration;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      }
      
      .stats-content {
        display: flex;
        align-items: flex-start;
        gap: $spacing-md;
        
        .stats-icon {
          flex-shrink: 0;
          margin-top: 4px;
        }
        
        .stats-info {
          flex: 1;
          
          .stats-value {
            font-size: 28px;
            font-weight: 700;
            color: $text-primary;
            line-height: 1;
            margin-bottom: 6px;
          }
          
          .stats-label {
            font-size: $font-size-base;
            color: $text-secondary;
            margin-bottom: 8px;
            font-weight: 500;
          }
          
          .stats-change {
            display: flex;
            align-items: center;
            gap: 8px;
            
            .change-text {
              display: flex;
              align-items: center;
              gap: 2px;
              font-size: $font-size-sm;
              font-weight: 600;
              
              &.positive {
                color: $success-color;
              }
              
              &.negative {
                color: $danger-color;
              }
              
              .el-icon {
                font-size: 12px;
              }
            }
            
            .change-label {
              font-size: $font-size-xs;
              color: $text-placeholder;
            }
          }
        }
      }
    }
  }
  
  .real-time-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .real-time-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: $spacing-lg;
      
      .real-time-item {
        display: flex;
        align-items: center;
        gap: $spacing-md;
        padding: $spacing-md;
        border-radius: 8px;
        background: $bg-color;
        
        .item-icon {
          flex-shrink: 0;
        }
        
        .item-info {
          .item-value {
            font-size: 20px;
            font-weight: 600;
            color: $text-primary;
            line-height: 1;
            margin-bottom: 2px;
          }
          
          .item-label {
            font-size: $font-size-sm;
            color: $text-secondary;
          }
        }
      }
    }
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .ai-icon {
      color: $primary-color;
    }
    
    .chart-controls {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
    }
  }
  
  .chart-container {
    .chart-metrics {
      display: flex;
      justify-content: space-around;
      margin-bottom: $spacing-lg;
      padding: $spacing-md;
      background: $bg-color;
      border-radius: 6px;
      
      .metric-item {
        text-align: center;
        
        .metric-label {
          display: block;
          font-size: $font-size-xs;
          color: $text-secondary;
          margin-bottom: 4px;
        }
        
        .metric-value {
          display: block;
          font-size: $font-size-lg;
          font-weight: 600;
          color: $text-primary;
          margin-bottom: 2px;
        }
        
        .metric-trend {
          font-size: $font-size-xs;
          font-weight: 500;
          
          &.positive {
            color: $success-color;
          }
          
          &.negative {
            color: $danger-color;
          }
        }
      }
    }
    
    .chart {
      width: 100%;
      height: 350px;
    }
  }
  
  .funnel-container {
    .funnel-item {
      margin-bottom: $spacing-md;
      background: linear-gradient(135deg, #409EFF, #67C23A);
      color: white;
      padding: $spacing-sm $spacing-md;
      border-radius: 4px;
      margin-left: auto;
      text-align: center;
      
      .funnel-label {
        font-size: $font-size-sm;
        margin-bottom: 2px;
      }
      
      .funnel-value {
        font-weight: 600;
      }
      
      &:nth-child(even) {
        background: linear-gradient(135deg, #E6A23C, #F56C6C);
      }
    }
  }
  
  .product-ranking {
    .ranking-item {
      display: flex;
      align-items: center;
      gap: $spacing-md;
      padding: $spacing-sm 0;
      border-bottom: 1px solid $border-lighter;
      
      &:last-child {
        border-bottom: none;
      }
      
      .ranking-number {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: $primary-color;
        color: white;
        font-size: $font-size-sm;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      
      .product-info {
        flex: 1;
        min-width: 0;
        
        .product-name {
          font-weight: 500;
          color: $text-primary;
          margin-bottom: 2px;
        }
        
        .product-stats {
          font-size: $font-size-xs;
          color: $text-secondary;
        }
      }
      
      .product-progress {
        width: 60px;
        flex-shrink: 0;
      }
    }
  }
  
  .ai-suggestions {
    .ai-loading {
      padding: $spacing-lg;
    }
    
    .suggestion-item {
      display: flex;
      align-items: flex-start;
      gap: $spacing-md;
      padding: $spacing-md;
      border-radius: 8px;
      margin-bottom: $spacing-md;
      border-left: 4px solid transparent;
      transition: all $transition-duration;
      
      &:hover {
        background: $bg-color;
        transform: translateX(2px);
      }
      
      &.priority-high {
        background: rgba(245, 108, 108, 0.1);
        border-left-color: $danger-color;
      }
      
      &.priority-medium {
        background: rgba(230, 162, 60, 0.1);
        border-left-color: $warning-color;
      }
      
      &.priority-low {
        background: rgba(144, 147, 153, 0.1);
        border-left-color: $info-color;
      }
      
      .suggestion-icon {
        flex-shrink: 0;
        margin-top: 2px;
      }
      
      .suggestion-content {
        flex: 1;
        
        .suggestion-title {
          font-weight: 500;
          color: $text-primary;
          margin-bottom: 4px;
        }
        
        .suggestion-desc {
          font-size: $font-size-sm;
          color: $text-secondary;
          line-height: 1.4;
          margin-bottom: 8px;
        }
        
        .suggestion-metrics {
          display: flex;
          gap: $spacing-sm;
          flex-wrap: wrap;
          
          .metric-tag {
            background: $bg-white;
            border: 1px solid $border-light;
            border-radius: 4px;
            padding: 2px 6px;
            font-size: $font-size-xs;
            color: $text-primary;
            font-weight: 500;
          }
        }
      }
      
      .suggestion-action {
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
    }
    
    .more-suggestions {
      text-align: center;
      padding: $spacing-md 0;
      border-top: 1px solid $border-light;
      margin-top: $spacing-md;
    }
  }
  
  .ai-header-actions {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    
    .ai-icon {
      color: $primary-color;
    }
  }
  
  .quick-actions {
    display: flex;
    gap: $spacing-lg;
    flex-wrap: wrap;
  }
  
  // 增强的快捷操作网格
  .quick-actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: $spacing-lg;
    
    .action-card {
      background: $bg-color;
      border: 1px solid $border-light;
      border-radius: 8px;
      padding: $spacing-lg;
      text-align: center;
      cursor: pointer;
      transition: all $transition-duration;
      
      &:hover {
        transform: translateY(-3px);
        box-shadow: $box-shadow-base;
        border-color: $primary-color;
        
        .el-icon {
          transform: scale(1.1);
        }
      }
      
      .el-icon {
        margin-bottom: $spacing-md;
        transition: transform $transition-duration;
      }
      
      h4 {
        margin: 0 0 $spacing-sm 0;
        font-size: $font-size-base;
        font-weight: 500;
        color: $text-primary;
      }
      
      p {
        margin: 0;
        font-size: $font-size-sm;
        color: $text-secondary;
      }
    }
  }
  
  // 实时监控样式
  .monitoring-container {
    .monitor-item {
      display: flex;
      align-items: center;
      gap: $spacing-md;
      padding: $spacing-md;
      background: $bg-color;
      border-radius: 6px;
      
      .monitor-icon {
        flex-shrink: 0;
      }
      
      .monitor-info {
        flex: 1;
        
        .monitor-value {
          font-size: $font-size-lg;
          font-weight: 600;
          color: $text-primary;
          margin-bottom: 4px;
        }
        
        .monitor-label {
          font-size: $font-size-sm;
          color: $text-secondary;
          margin-bottom: 8px;
        }
      }
    }
    
    .recent-alerts {
      .alerts-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: $spacing-md;
        
        .alerts-title {
          font-weight: 500;
          color: $text-primary;
        }
      }
      
      .alerts-list {
        .alert-item {
          display: flex;
          align-items: center;
          gap: $spacing-sm;
          padding: $spacing-sm;
          margin-bottom: $spacing-sm;
          border-radius: 4px;
          font-size: $font-size-sm;
          
          &.alert-warning {
            background: rgba(230, 162, 60, 0.1);
          }
          
          &.alert-info {
            background: rgba(144, 147, 153, 0.1);
          }
          
          &.alert-success {
            background: rgba(103, 194, 58, 0.1);
          }
          
          .alert-message {
            flex: 1;
            color: $text-primary;
          }
          
          .alert-time {
            color: $text-secondary;
            font-size: $font-size-xs;
          }
        }
      }
    }
  }
  
  // 数据导出样式
  .export-container {
    .export-section {
      h4 {
        margin: 0 0 $spacing-md 0;
        font-size: $font-size-base;
        font-weight: 500;
        color: $text-primary;
      }
      
      .full-width {
        width: 100%;
        
        .el-button {
          flex: 1;
        }
      }
      
      .schedule-info {
        margin-top: $spacing-md;
        padding: $spacing-md;
        background: $bg-color;
        border-radius: 4px;
        font-size: $font-size-sm;
        
        p {
          margin: 0 0 $spacing-sm 0;
          color: $text-secondary;
        }
        
        .email-info {
          color: $text-primary;
          font-weight: 500;
        }
      }
    }
  }
  
  // 客户增长趋势样式
  .customer-growth-chart {
    .el-select {
      float: right;
    }
  }

  .customer-source-chart {
    height: 140px;
  }

  .geo-distribution {
    .geo-item {
      display: flex;
      flex-direction: column;
      margin-bottom: $spacing-md;
      
      .geo-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
        
        .geo-name {
          font-size: $font-size-sm;
          color: $text-primary;
        }
        
        .geo-count {
          font-size: $font-size-sm;
          font-weight: 500;
          color: $text-secondary;
        }
      }
      
      .el-progress {
        margin-bottom: 0;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .dashboard-container {
    .stats-grid {
      grid-template-columns: 1fr;
    }
    
    .real-time-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .quick-actions {
      flex-direction: column;
      gap: $spacing-md;
      
      .el-button {
        width: 100%;
      }
    }
  }
}
</style>