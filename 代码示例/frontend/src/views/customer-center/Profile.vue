<template>
  <div class="customer-profile-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>客户画像分析</h1>
        <p class="description">通过多维度数据分析，深入了解客户群体特征和行为模式</p>
      </div>
      <div class="header-actions">
        <el-button @click="exportReport" :icon="Download">导出报告</el-button>
        <el-button @click="refreshData" :icon="Refresh">刷新数据</el-button>
      </div>
    </div>

    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <div class="filter-header">
        <span class="filter-title">筛选条件</span>
        <el-button @click="resetFilters" text>重置</el-button>
      </div>
      <el-form :model="filters" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="filters.dateRange"
                type="daterange"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="客户级别">
              <el-select v-model="filters.level" placeholder="全部级别" clearable style="width: 100%">
                <el-option label="VIP客户" value="vip" />
                <el-option label="重要客户" value="important" />
                <el-option label="普通客户" value="normal" />
                <el-option label="潜在客户" value="potential" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="客户来源">
              <el-select v-model="filters.source" placeholder="全部来源" clearable style="width: 100%">
                <el-option label="官网注册" value="website" />
                <el-option label="社交媒体" value="social" />
                <el-option label="线下活动" value="offline" />
                <el-option label="推荐介绍" value="referral" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="活跃状态">
              <el-select v-model="filters.active" placeholder="全部状态" clearable style="width: 100%">
                <el-option label="高度活跃" value="high" />
                <el-option label="中度活跃" value="medium" />
                <el-option label="低度活跃" value="low" />
                <el-option label="沉睡客户" value="inactive" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 统计概览 -->
    <div class="stats-overview">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <el-icon><User /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ formatNumber(stats.totalCustomers) }}</div>
                <div class="stat-label">客户总数</div>
                <div class="stat-trend">
                  <span class="trend-value" :class="{ up: true }">
                    <el-icon><ArrowUp /></el-icon>
                    12.5%
                  </span>
                  <span class="trend-text">较上月</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ formatNumber(stats.activeCustomers) }}</div>
                <div class="stat-label">活跃客户</div>
                <div class="stat-trend">
                  <span class="trend-value" :class="{ up: true }">
                    <el-icon><ArrowUp /></el-icon>
                    8.3%
                  </span>
                  <span class="trend-text">较上月</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                <el-icon><ShoppingCart /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">￥{{ formatNumber(stats.avgOrderValue) }}</div>
                <div class="stat-label">平均订单价值</div>
                <div class="stat-trend">
                  <span class="trend-value" :class="{ up: true }">
                    <el-icon><ArrowUp /></el-icon>
                    15.2%
                  </span>
                  <span class="trend-text">较上月</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
                <el-icon><Star /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.satisfactionRate }}%</div>
                <div class="stat-label">客户满意度</div>
                <div class="stat-trend">
                  <span class="trend-value" :class="{ down: true }">
                    <el-icon><ArrowDown /></el-icon>
                    2.1%
                  </span>
                  <span class="trend-text">较上月</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 画像分析 -->
    <el-row :gutter="20" class="analysis-section">
      <!-- 客户分布 -->
      <el-col :span="12">
        <el-card class="analysis-card">
          <template #header>
            <div class="card-header">
              <span>客户级别分布</span>
              <el-button text @click="viewDetails('level')">查看详情</el-button>
            </div>
          </template>
          <div ref="levelChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 地域分布 -->
      <el-col :span="12">
        <el-card class="analysis-card">
          <template #header>
            <div class="card-header">
              <span>地域分布</span>
              <el-button text @click="viewDetails('region')">查看详情</el-button>
            </div>
          </template>
          <div ref="regionChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 行为分析 -->
    <el-row :gutter="20" class="analysis-section">
      <!-- 购买频率 -->
      <el-col :span="12">
        <el-card class="analysis-card">
          <template #header>
            <div class="card-header">
              <span>购买频率分析</span>
              <el-button text @click="viewDetails('frequency')">查看详情</el-button>
            </div>
          </template>
          <div ref="frequencyChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 消费能力 -->
      <el-col :span="12">
        <el-card class="analysis-card">
          <template #header>
            <div class="card-header">
              <span>消费能力分布</span>
              <el-button text @click="viewDetails('spending')">查看详情</el-button>
            </div>
          </template>
          <div ref="spendingChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 兴趣偏好 -->
    <el-card class="analysis-card full-width">
      <template #header>
        <div class="card-header">
          <span>兴趣偏好分析</span>
          <el-button text @click="viewDetails('interest')">查看详情</el-button>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="8">
          <div ref="categoryChartRef" class="chart-container"></div>
        </el-col>
        <el-col :span="8">
          <div ref="brandChartRef" class="chart-container"></div>
        </el-col>
        <el-col :span="8">
          <div ref="channelChartRef" class="chart-container"></div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 客户生命周期 -->
    <el-card class="analysis-card full-width">
      <template #header>
        <div class="card-header">
          <span>客户生命周期</span>
          <el-button text @click="viewDetails('lifecycle')">查看详情</el-button>
        </div>
      </template>
      <div ref="lifecycleChartRef" class="chart-container-large"></div>
    </el-card>

    <!-- RFM分析 -->
    <el-card class="analysis-card full-width">
      <template #header>
        <div class="card-header">
          <span>RFM分析</span>
          <el-button text @click="viewDetails('rfm')">查看详情</el-button>
        </div>
      </template>
      <el-table :data="rfmData" style="width: 100%">
        <el-table-column prop="segment" label="客户细分" width="150">
          <template #default="scope">
            <el-tag :type="getRFMType(scope.row.segment)">
              {{ scope.row.segment }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="count" label="客户数量" width="120">
          <template #default="scope">
            {{ formatNumber(scope.row.count) }}
          </template>
        </el-table-column>
        <el-table-column prop="percentage" label="占比" width="100">
          <template #default="scope">
            {{ scope.row.percentage }}%
          </template>
        </el-table-column>
        <el-table-column prop="recency" label="最近购买（天）" width="130" />
        <el-table-column prop="frequency" label="购买频率" width="100" />
        <el-table-column prop="monetary" label="消费金额" width="120">
          <template #default="scope">
            ￥{{ formatNumber(scope.row.monetary) }}
          </template>
        </el-table-column>
        <el-table-column prop="strategy" label="营销策略" min-width="200" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-button @click="createCampaign(scope.row)" text type="primary">
              创建活动
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 标签云 -->
    <el-card class="analysis-card full-width">
      <template #header>
        <div class="card-header">
          <span>客户标签云</span>
          <el-button text @click="viewDetails('tags')">查看详情</el-button>
        </div>
      </template>
      <div class="tag-cloud">
        <el-tag
          v-for="tag in tagCloud"
          :key="tag.name"
          :type="tag.type"
          :size="getTagSize(tag.count)"
          effect="plain"
          class="tag-item"
        >
          {{ tag.name }} ({{ tag.count }})
        </el-tag>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { 
  Download, Refresh, User, TrendCharts, ShoppingCart, Star,
  ArrowUp, ArrowDown
} from '@element-plus/icons-vue'

// 筛选条件
const filters = reactive({
  dateRange: [],
  level: '',
  source: '',
  active: ''
})

// 统计数据
const stats = reactive({
  totalCustomers: 15234,
  activeCustomers: 8956,
  avgOrderValue: 3580,
  satisfactionRate: 92.5
})

// RFM数据
const rfmData = ref([
  {
    segment: '重要价值客户',
    count: 1523,
    percentage: 10,
    recency: 7,
    frequency: 12,
    monetary: 25800,
    strategy: '提供VIP服务，维持忠诚度'
  },
  {
    segment: '重要发展客户',
    count: 2341,
    percentage: 15.4,
    recency: 15,
    frequency: 8,
    monetary: 15600,
    strategy: '增加购买频率，提升客户价值'
  },
  {
    segment: '重要保持客户',
    count: 1892,
    percentage: 12.4,
    recency: 30,
    frequency: 10,
    monetary: 18900,
    strategy: '主动关怀，防止流失'
  },
  {
    segment: '重要挽留客户',
    count: 892,
    percentage: 5.9,
    recency: 60,
    frequency: 9,
    monetary: 16700,
    strategy: '重点挽回，提供优惠激励'
  },
  {
    segment: '一般价值客户',
    count: 3421,
    percentage: 22.5,
    recency: 10,
    frequency: 5,
    monetary: 8900,
    strategy: '交叉销售，提升购买品类'
  },
  {
    segment: '一般发展客户',
    count: 2156,
    percentage: 14.2,
    recency: 20,
    frequency: 3,
    monetary: 5600,
    strategy: '培养忠诚度，提升购买频率'
  },
  {
    segment: '一般保持客户',
    count: 1789,
    percentage: 11.7,
    recency: 45,
    frequency: 4,
    monetary: 6700,
    strategy: '定期互动，维持关系'
  },
  {
    segment: '一般挽留客户',
    count: 1220,
    percentage: 8,
    recency: 90,
    frequency: 2,
    monetary: 3400,
    strategy: '唤醒沉睡，重新激活'
  }
])

// 标签云数据
const tagCloud = ref([
  { name: '高消费', count: 3421, type: 'danger' },
  { name: '活跃用户', count: 2890, type: 'success' },
  { name: '品牌忠诚', count: 2567, type: 'primary' },
  { name: '价格敏感', count: 2145, type: 'warning' },
  { name: '新客户', count: 1923, type: 'info' },
  { name: '社交达人', count: 1678, type: 'success' },
  { name: '技术爱好者', count: 1456, type: 'primary' },
  { name: '环保主义', count: 1234, type: 'success' },
  { name: '时尚追求', count: 1098, type: 'danger' },
  { name: '家庭用户', count: 987, type: 'warning' },
  { name: '商务人士', count: 876, type: 'primary' },
  { name: '学生群体', count: 765, type: 'info' },
  { name: '运动健身', count: 654, type: 'success' },
  { name: '美食爱好', count: 543, type: 'warning' },
  { name: '旅游达人', count: 432, type: 'danger' }
])

// 图表引用
const levelChartRef = ref(null)
const regionChartRef = ref(null)
const frequencyChartRef = ref(null)
const spendingChartRef = ref(null)
const categoryChartRef = ref(null)
const brandChartRef = ref(null)
const channelChartRef = ref(null)
const lifecycleChartRef = ref(null)

// 初始化图表
const initCharts = () => {
  // 客户级别分布
  const levelChart = echarts.init(levelChartRef.value)
  levelChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      bottom: 0,
      left: 'center'
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '16',
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: [
        { value: 1523, name: 'VIP客户', itemStyle: { color: '#f56c6c' } },
        { value: 3456, name: '重要客户', itemStyle: { color: '#e6a23c' } },
        { value: 6789, name: '普通客户', itemStyle: { color: '#409eff' } },
        { value: 3466, name: '潜在客户', itemStyle: { color: '#67c23a' } }
      ]
    }]
  })

  // 地域分布
  const regionChart = echarts.init(regionChartRef.value)
  regionChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: ['北美', '欧洲', '亚太', '南美', '中东', '非洲']
    },
    series: [{
      type: 'bar',
      data: [4523, 3890, 3456, 1234, 987, 1144],
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#667eea' },
          { offset: 1, color: '#764ba2' }
        ])
      }
    }]
  })

  // 购买频率
  const frequencyChart = echarts.init(frequencyChartRef.value)
  frequencyChart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['1-2次', '3-5次', '6-10次', '11-20次', '20次以上']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      type: 'line',
      smooth: true,
      data: [3456, 4567, 3234, 1890, 876],
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(250, 112, 154, 0.3)' },
          { offset: 1, color: 'rgba(254, 225, 64, 0.1)' }
        ])
      },
      itemStyle: {
        color: '#fa709a'
      }
    }]
  })

  // 消费能力
  const spendingChart = echarts.init(spendingChartRef.value)
  spendingChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}人'
    },
    radar: {
      indicator: [
        { name: '0-1000元', max: 5000 },
        { name: '1000-3000元', max: 5000 },
        { name: '3000-5000元', max: 5000 },
        { name: '5000-10000元', max: 5000 },
        { name: '10000元以上', max: 5000 }
      ]
    },
    series: [{
      type: 'radar',
      data: [{
        value: [1200, 3400, 2800, 1890, 1767],
        name: '消费分布',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(79, 172, 254, 0.3)' },
            { offset: 1, color: 'rgba(0, 242, 254, 0.1)' }
          ])
        }
      }]
    }]
  })

  // 品类偏好
  const categoryChart = echarts.init(categoryChartRef.value)
  categoryChart.setOption({
    title: {
      text: '品类偏好',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    series: [{
      type: 'pie',
      radius: '65%',
      data: [
        { value: 3456, name: '电子产品' },
        { value: 2890, name: '服装鞋包' },
        { value: 2345, name: '美妆护肤' },
        { value: 1890, name: '家居用品' },
        { value: 1653, name: '食品饮料' }
      ]
    }]
  })

  // 品牌偏好
  const brandChart = echarts.init(brandChartRef.value)
  brandChart.setOption({
    title: {
      text: '品牌偏好',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    series: [{
      type: 'pie',
      radius: '65%',
      data: [
        { value: 4567, name: '国际品牌' },
        { value: 3456, name: '国内品牌' },
        { value: 2345, name: '小众品牌' },
        { value: 1866, name: '自有品牌' }
      ]
    }]
  })

  // 渠道偏好
  const channelChart = echarts.init(channelChartRef.value)
  channelChart.setOption({
    title: {
      text: '渠道偏好',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    series: [{
      type: 'pie',
      radius: '65%',
      data: [
        { value: 5678, name: '官网' },
        { value: 3456, name: '移动APP' },
        { value: 2345, name: '社交媒体' },
        { value: 1755, name: '线下门店' }
      ]
    }]
  })

  // 客户生命周期
  const lifecycleChart = echarts.init(lifecycleChartRef.value)
  lifecycleChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['新客户', '成长期', '成熟期', '衰退期', '流失']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '新客户',
        type: 'line',
        smooth: true,
        data: [320, 302, 301, 334, 390, 330, 320, 340, 360, 380, 400, 420]
      },
      {
        name: '成长期',
        type: 'line',
        smooth: true,
        data: [820, 832, 901, 934, 1290, 1330, 1320, 1340, 1360, 1380, 1400, 1420]
      },
      {
        name: '成熟期',
        type: 'line',
        smooth: true,
        data: [1500, 1520, 1501, 1534, 1590, 1630, 1620, 1640, 1660, 1680, 1700, 1720]
      },
      {
        name: '衰退期',
        type: 'line',
        smooth: true,
        data: [620, 632, 601, 634, 690, 730, 720, 740, 760, 780, 800, 820]
      },
      {
        name: '流失',
        type: 'line',
        smooth: true,
        data: [120, 132, 101, 134, 90, 130, 120, 140, 160, 180, 200, 220]
      }
    ]
  })
}

// 格式化数字
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 获取RFM类型
const getRFMType = (segment) => {
  if (segment.includes('重要')) return 'danger'
  if (segment.includes('发展')) return 'warning'
  if (segment.includes('保持')) return 'primary'
  return 'info'
}

// 获取标签大小
const getTagSize = (count) => {
  if (count > 3000) return 'large'
  if (count > 2000) return 'default'
  return 'small'
}

// 重置筛选
const resetFilters = () => {
  filters.dateRange = []
  filters.level = ''
  filters.source = ''
  filters.active = ''
  refreshData()
}

// 刷新数据
const refreshData = () => {
  ElMessage.success('数据已刷新')
  // 重新加载图表数据
  initCharts()
}

// 导出报告
const exportReport = () => {
  ElMessage.success('报告导出中...')
}

// 查看详情
const viewDetails = (type) => {
  ElMessage.info(`查看${type}详情`)
}

// 创建营销活动
const createCampaign = (row) => {
  ElMessage.success(`为${row.segment}创建营销活动`)
}

onMounted(() => {
  nextTick(() => {
    initCharts()
  })
})
</script>

<style scoped lang="scss">
@use "@/assets/styles/variables.scss" as *;

.customer-profile-page {
  padding: $spacing-lg;
  background: #f5f7fa;
  min-height: 100vh;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: $spacing-xl;
    background: white;
    padding: $spacing-xl;
    border-radius: $border-radius-lg;

    .header-content {
      h1 {
        font-size: 24px;
        margin-bottom: $spacing-xs;
      }

      .description {
        color: $text-secondary;
        font-size: 14px;
      }
    }

    .header-actions {
      display: flex;
      gap: $spacing-sm;
    }
  }

  .filter-card {
    margin-bottom: $spacing-xl;

    .filter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: $spacing-md;

      .filter-title {
        font-weight: 500;
      }
    }
  }

  .stats-overview {
    margin-bottom: $spacing-xl;

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: $spacing-lg;

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
        }

        .stat-info {
          flex: 1;

          .stat-value {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: $spacing-xs;
          }

          .stat-label {
            color: $text-secondary;
            font-size: 14px;
            margin-bottom: $spacing-xs;
          }

          .stat-trend {
            display: flex;
            align-items: center;
            gap: $spacing-xs;
            font-size: 12px;

            .trend-value {
              display: flex;
              align-items: center;
              gap: 2px;

              &.up {
                color: $success;
              }

              &.down {
                color: $danger;
              }
            }

            .trend-text {
              color: $text-secondary;
            }
          }
        }
      }
    }
  }

  .analysis-section {
    margin-bottom: $spacing-xl;
  }

  .analysis-card {
    margin-bottom: $spacing-xl;

    &.full-width {
      width: 100%;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chart-container {
      height: 300px;
    }

    .chart-container-large {
      height: 400px;
    }
  }

  .tag-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-sm;
    padding: $spacing-md;

    .tag-item {
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        transform: scale(1.1);
      }
    }
  }
}
</style>