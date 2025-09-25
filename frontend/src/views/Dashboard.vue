<template>
  <div class="dashboard-container">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <div class="welcome-left">
          <h1 class="welcome-title">欢迎回来，{{ userInfo?.name || '用户' }}！</h1>
          <p class="welcome-desc">{{ currentDate }} {{ greeting }}</p>
        </div>
        <div class="welcome-right">
          <div class="weather-info">
            <el-icon><Sunny /></el-icon>
            <span>晴朗 28°C</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片区域 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :xs="24" :sm="12" :md="6" v-for="card in statCards" :key="card.title">
        <div
          class="stat-card"
          :style="{ background: card.gradient }"
          @click="handleCardClick(card)"
        >
          <div class="card-header">
            <div class="card-icon">
              <el-icon :size="28">
                <component :is="card.icon" />
              </el-icon>
            </div>
            <el-tag v-if="card.trend" :type="card.trendType" size="small" effect="dark">
              {{ card.trend }}
            </el-tag>
          </div>
          <div class="card-value">{{ card.value }}</div>
          <div class="card-title">{{ card.title }}</div>
          <div class="card-footer">
            <span class="label">{{ card.label }}</span>
            <span class="percentage">{{ card.percentage }}</span>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 主内容区 - 四等分布局 -->
    <el-row :gutter="20" class="main-content">
      <!-- 趋势分析 -->
      <el-col :xs="24" :md="12">
        <el-card class="equal-height-card">
          <template #header>
            <div class="card-header">
              <span class="title">请假趋势分析</span>
              <el-button link type="primary">
                更多
                <el-icon class="el-icon--right"><ArrowRight /></el-icon>
              </el-button>
            </div>
          </template>
          <div class="trend-chart">
            <v-chart class="chart" :option="chartOption" autoresize />
          </div>
        </el-card>
      </el-col>

      <!-- 部门排行榜 -->
      <el-col :xs="24" :md="12">
        <el-card class="equal-height-card">
          <template #header>
            <div class="card-header">
              <span class="title">部门考勤排行</span>
              <el-button link type="primary">
                查看全部
                <el-icon class="el-icon--right"><ArrowRight /></el-icon>
              </el-button>
            </div>
          </template>
          <div class="ranking-list">
            <div
              v-for="(item, index) in rankingData"
              :key="item.name"
              class="ranking-item"
            >
              <div class="rank-info">
                <span
                  class="rank-badge"
                  :class="`rank-${index + 1}`"
                >
                  {{ index + 1 }}
                </span>
                <span class="rank-name">{{ item.name }}</span>
              </div>
              <div class="rank-value-wrapper">
                <el-progress
                  :percentage="item.value"
                  :color="getRankColor(index)"
                  :stroke-width="6"
                  :show-text="false"
                />
                <span class="rank-value">{{ item.value }}%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 最新动态 -->
      <el-col :xs="24" :md="12">
        <el-card class="equal-height-card">
          <template #header>
            <div class="card-header">
              <span class="title">最新动态</span>
              <el-button link type="primary">
                查看更多
                <el-icon class="el-icon--right"><ArrowRight /></el-icon>
              </el-button>
            </div>
          </template>
          <el-scrollbar max-height="350px">
            <el-timeline>
              <el-timeline-item
                v-for="activity in activities"
                :key="activity.id"
                :timestamp="activity.time"
                placement="top"
              >
                <div class="activity-content">
                  <div class="activity-text">{{ activity.content }}</div>
                  <div v-if="activity.detail" class="activity-detail">
                    {{ activity.detail }}
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </el-scrollbar>
        </el-card>
      </el-col>

      <!-- 待办事项 -->
      <el-col :xs="24" :md="12">
        <el-card class="equal-height-card">
          <template #header>
            <div class="card-header">
              <span class="title">待办事项</span>
              <el-button link type="primary">
                全部任务
                <el-icon class="el-icon--right"><ArrowRight /></el-icon>
              </el-button>
            </div>
          </template>
          <el-scrollbar max-height="350px">
            <div class="todo-list">
              <div
                v-for="todo in todoList"
                :key="todo.id"
                class="todo-item"
              >
                <el-checkbox v-model="todo.done" />
                <div class="todo-content">
                  <div class="todo-title">{{ todo.title }}</div>
                  <div class="todo-time">
                    <el-icon><Clock /></el-icon>
                    {{ todo.time }}
                  </div>
                </div>
                <el-tag
                  :type="todo.priority === 'high' ? 'danger' : todo.priority === 'medium' ? 'warning' : 'info'"
                  size="small"
                >
                  {{ todo.priorityText }}
                </el-tag>
              </div>
            </div>
          </el-scrollbar>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
} from 'echarts/components'
import {
  User,
  Calendar,
  Document,
  CircleCheck,
  Sunny,
  ArrowRight,
  DataAnalysis,
  Clock,
  TrendCharts,
  Warning
} from '@element-plus/icons-vue'

// 注册 ECharts 组件
use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
])

const store = useStore()
const router = useRouter()

// 用户信息
const userInfo = computed(() => store.state.userInfo)

// 当前日期和问候语
const currentDate = computed(() => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekday = weekdays[date.getDay()]
  return `${year}年${month}月${day}日 ${weekday}`
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '凌晨好！'
  if (hour < 9) return '早上好！'
  if (hour < 12) return '上午好！'
  if (hour < 14) return '中午好！'
  if (hour < 17) return '下午好！'
  if (hour < 19) return '傍晚好！'
  return '晚上好！'
})

// 统计卡片数据
const statCards = ref([
  {
    icon: 'User',
    title: '今日请假',
    value: '12',
    gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
    trend: '+12%',
    trendType: 'success',
    label: '较昨日',
    percentage: '增长12%',
    path: '/leave/record'
  },
  {
    icon: 'Calendar',
    title: '待审批',
    value: '8',
    gradient: 'linear-gradient(135deg, #11998e, #38ef7d)',
    trend: '待处理',
    trendType: 'warning',
    label: '紧急',
    percentage: '3条',
    path: '/leave/approval'
  },
  {
    icon: 'Document',
    title: '本月请假',
    value: '256',
    gradient: 'linear-gradient(135deg, #fa709a, #fee140)',
    trend: '-5%',
    trendType: 'info',
    label: '较上月',
    percentage: '减少5%',
    path: '/leave/record'
  },
  {
    icon: 'CircleCheck',
    title: '考勤率',
    value: '96.8%',
    gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
    trend: '优秀',
    trendType: 'success',
    label: '本月',
    percentage: '全校平均',
    path: '/attendance/statistics'
  }
])

// 部门排行数据
const rankingData = ref([
  { name: '高中部', value: 98 },
  { name: '初中部', value: 95 },
  { name: '小学部', value: 92 },
  { name: '后勤部', value: 88 },
  { name: '行政部', value: 85 }
])

// 最新动态
const activities = ref([
  {
    id: 1,
    content: '张三老师提交了请假申请',
    detail: '事假 2天',
    time: '2分钟前'
  },
  {
    id: 2,
    content: '李四同学的请假申请已通过',
    detail: '病假 1天',
    time: '15分钟前'
  },
  {
    id: 3,
    content: '王五老师完成了今日考勤',
    detail: '高三(1)班',
    time: '1小时前'
  },
  {
    id: 4,
    content: '系统自动生成了月度考勤报表',
    detail: '查看报表',
    time: '3小时前'
  }
])

// 待办事项
const todoList = ref([
  {
    id: 1,
    title: '审批张三的请假申请',
    time: '截止今天 18:00',
    done: false,
    priority: 'high',
    priorityText: '高'
  },
  {
    id: 2,
    title: '完成本周考勤统计',
    time: '截止明天 12:00',
    done: false,
    priority: 'medium',
    priorityText: '中'
  },
  {
    id: 3,
    title: '查看系统更新说明',
    time: '本周内',
    done: false,
    priority: 'low',
    priorityText: '低'
  }
])

// 图表配置
const chartOption = ref({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985'
      }
    }
  },
  legend: {
    data: ['事假', '病假', '调休', '其他'],
    bottom: 0
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '10%',
    top: '5%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '事假',
      type: 'line',
      smooth: true,
      stack: '总量',
      areaStyle: {
        opacity: 0.3
      },
      emphasis: {
        focus: 'series'
      },
      data: [12, 13, 10, 13, 9, 23, 21]
    },
    {
      name: '病假',
      type: 'line',
      smooth: true,
      stack: '总量',
      areaStyle: {
        opacity: 0.3
      },
      emphasis: {
        focus: 'series'
      },
      data: [22, 18, 19, 23, 29, 33, 31]
    },
    {
      name: '调休',
      type: 'line',
      smooth: true,
      stack: '总量',
      areaStyle: {
        opacity: 0.3
      },
      emphasis: {
        focus: 'series'
      },
      data: [15, 23, 20, 15, 19, 33, 41]
    },
    {
      name: '其他',
      type: 'line',
      smooth: true,
      stack: '总量',
      areaStyle: {
        opacity: 0.3
      },
      emphasis: {
        focus: 'series'
      },
      data: [8, 9, 9, 12, 15, 21, 18]
    }
  ]
})

// 获取排行榜颜色
const getRankColor = (index: number) => {
  const colors = ['#67C23A', '#409EFF', '#E6A23C']
  return colors[index] || '#909399'
}

// 处理卡片点击
const handleCardClick = (card: any) => {
  if (card.path) {
    router.push(card.path)
  }
}

onMounted(() => {
  // 可以在这里加载真实数据
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 24px;
  background: #F5F7FA;
  min-height: calc(100vh - 60px);
}

// 欢迎区域
.welcome-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
  color: white;

  .welcome-content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .welcome-left {
      .welcome-title {
        font-size: 28px;
        font-weight: 500;
        margin-bottom: 8px;
      }

      .welcome-desc {
        font-size: 14px;
        opacity: 0.9;
      }
    }

    .weather-info {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.2);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
    }
  }
}

// 统计卡片
.stat-cards {
  margin-bottom: 24px;

  .stat-card {
    border-radius: 12px;
    padding: 20px;
    color: white;
    min-height: 140px;
    transition: all 0.3s;
    cursor: pointer;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .card-icon {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 8px;
        padding: 8px;
        display: inline-flex;
      }
    }

    .card-value {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .card-title {
      font-size: 14px;
      opacity: 0.9;
      margin-bottom: 12px;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      opacity: 0.8;
    }
  }
}

// 主内容区
.main-content {
  .equal-height-card {
    height: 450px;
    margin-bottom: 20px;

    :deep(.el-card__body) {
      height: calc(100% - 60px);
      padding: 20px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title {
        font-size: 16px;
        font-weight: 500;
        color: #303133;
      }
    }
  }
}

// 趋势图表
.trend-chart {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .chart {
    width: 100%;
    height: 100%;
    min-height: 350px;
  }
}

// 排行榜
.ranking-list {
  .ranking-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid #EBEEF5;

    &:last-child {
      border-bottom: none;
    }

    .rank-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .rank-badge {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        font-size: 12px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #909399;
        color: white;

        &.rank-1 { background: #ffd700; }
        &.rank-2 { background: #c0c0c0; }
        &.rank-3 { background: #cd7f32; }
      }

      .rank-name {
        font-size: 14px;
        color: #303133;
      }
    }

    .rank-value-wrapper {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      max-width: 200px;

      .el-progress {
        flex: 1;
      }

      .rank-value {
        font-size: 14px;
        font-weight: bold;
        color: #409EFF;
        min-width: 40px;
      }
    }
  }
}

// 最新动态
.activity-content {
  .activity-text {
    font-size: 13px;
    color: #303133;
    line-height: 1.4;
  }

  .activity-detail {
    font-size: 11px;
    color: #909399;
    background: #F5F7FA;
    padding: 6px 8px;
    border-radius: 4px;
    margin-top: 6px;
    display: inline-block;
  }
}

// 待办事项
.todo-list {
  .todo-item {
    display: flex;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #EBEEF5;
    gap: 12px;

    &:last-child {
      border-bottom: none;
    }

    .todo-content {
      flex: 1;

      .todo-title {
        font-size: 13px;
        color: #303133;
        line-height: 1.4;
        margin-bottom: 4px;
      }

      .todo-time {
        font-size: 11px;
        color: #909399;
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .welcome-content {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 16px;
  }

  .equal-height-card {
    height: auto !important;
    min-height: 300px;
  }
}
</style>