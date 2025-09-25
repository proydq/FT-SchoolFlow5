<template>
  <div class="customer-detail-page">
    <!-- 页面头部 -->
    <div class="detail-header">
      <div class="back-navigation">
        <el-button @click="goBack" :icon="ArrowLeft" text>
          返回客户列表
        </el-button>
      </div>
      
      <div class="customer-info-header">
        <el-avatar :src="customer.avatar" :size="80" class="customer-avatar">
          {{ customer.name?.charAt(0) || 'N' }}
        </el-avatar>
        
        <div class="basic-info">
          <h1 class="customer-name">{{ customer.name }}</h1>
          <div class="customer-meta">
            <el-tag :type="getLevelType(customer.level)" size="large">
              {{ getLevelLabel(customer.level) }}
            </el-tag>
            <el-tag :type="getStatusType(customer.status)" size="large">
              {{ getStatusLabel(customer.status) }}
            </el-tag>
            <span class="customer-id">ID: {{ customer.id }}</span>
          </div>
          <div class="contact-info">
            <div class="contact-item">
              <el-icon><Message /></el-icon>
              <span>{{ customer.email }}</span>
              <el-button @click="sendEmail" size="small" text type="primary">发邮件</el-button>
            </div>
            <div class="contact-item" v-if="customer.phone">
              <el-icon><Phone /></el-icon>
              <span>{{ customer.phone }}</span>
              <el-button @click="makeCall" size="small" text type="primary">拨打</el-button>
            </div>
          </div>
        </div>
        
        <div class="header-actions">
          <el-button @click="editCustomer" :icon="Edit" type="primary">
            编辑客户
          </el-button>
          <el-dropdown @command="handleCommand">
            <el-button :icon="MoreFilled">
              更多操作
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="duplicate">复制客户</el-dropdown-item>
                <el-dropdown-item command="merge">合并客户</el-dropdown-item>
                <el-dropdown-item command="export">导出数据</el-dropdown-item>
                <el-dropdown-item command="delete" divided>删除客户</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <el-row :gutter="24">
      <!-- 左侧主要内容 -->
      <el-col :span="16">
        <!-- 360°客户画像 -->
        <el-card class="profile-card" title="客户画像">
          <template #header>
            <div class="card-header">
              <span>360°客户画像</span>
              <el-button @click="refreshProfile" :icon="Refresh" size="small" text>
                刷新
              </el-button>
            </div>
          </template>
          
          <!-- 客户评分雷达图 -->
          <div class="profile-section">
            <h3>客户价值评分</h3>
            <div class="score-overview">
              <div class="score-item">
                <div class="score-circle">
                  <el-progress 
                    type="circle" 
                    :percentage="customerScore.overall"
                    :color="getScoreColor(customerScore.overall)"
                  />
                </div>
                <div class="score-label">综合评分</div>
              </div>
              
              <div class="score-details">
                <div class="score-detail-item">
                  <span class="detail-label">活跃度</span>
                  <el-progress 
                    :percentage="customerScore.activity" 
                    :color="getScoreColor(customerScore.activity)"
                    :stroke-width="8"
                  />
                  <span class="score-value">{{ customerScore.activity }}</span>
                </div>
                
                <div class="score-detail-item">
                  <span class="detail-label">忠诚度</span>
                  <el-progress 
                    :percentage="customerScore.loyalty" 
                    :color="getScoreColor(customerScore.loyalty)"
                    :stroke-width="8"
                  />
                  <span class="score-value">{{ customerScore.loyalty }}</span>
                </div>
                
                <div class="score-detail-item">
                  <span class="detail-label">购买力</span>
                  <el-progress 
                    :percentage="customerScore.purchasing" 
                    :color="getScoreColor(customerScore.purchasing)"
                    :stroke-width="8"
                  />
                  <span class="score-value">{{ customerScore.purchasing }}</span>
                </div>
                
                <div class="score-detail-item">
                  <span class="detail-label">影响力</span>
                  <el-progress 
                    :percentage="customerScore.influence" 
                    :color="getScoreColor(customerScore.influence)"
                    :stroke-width="8"
                  />
                  <span class="score-value">{{ customerScore.influence }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 客户统计数据 -->
          <div class="profile-section">
            <h3>关键指标</h3>
            <el-row :gutter="20">
              <el-col :span="6">
                <el-statistic 
                  title="总订单数" 
                  :value="customerStats.totalOrders"
                  :value-style="{ color: '#1890ff' }"
                >
                  <template #suffix>
                    <el-icon><ShoppingBag /></el-icon>
                  </template>
                </el-statistic>
              </el-col>
              <el-col :span="6">
                <el-statistic 
                  title="总消费" 
                  :value="customerStats.totalSpent"
                  prefix="$"
                  :value-style="{ color: '#52c41a' }"
                />
              </el-col>
              <el-col :span="6">
                <el-statistic 
                  title="平均订单" 
                  :value="customerStats.avgOrderValue"
                  prefix="$"
                  :value-style="{ color: '#722ed1' }"
                />
              </el-col>
              <el-col :span="6">
                <el-statistic 
                  title="客户年限" 
                  :value="customerStats.customerYears"
                  suffix="年"
                  :value-style="{ color: '#fa8c16' }"
                />
              </el-col>
            </el-row>
          </div>

          <!-- 偏好分析 -->
          <div class="profile-section">
            <h3>购买偏好</h3>
            <div class="preferences">
              <div class="preference-item">
                <span class="preference-label">产品类别偏好</span>
                <div class="preference-tags">
                  <el-tag 
                    v-for="category in customerPreferences.categories" 
                    :key="category.name"
                    :type="category.level === 'high' ? 'danger' : category.level === 'medium' ? 'warning' : 'info'"
                    class="preference-tag"
                  >
                    {{ category.name }} ({{ category.percentage }}%)
                  </el-tag>
                </div>
              </div>
              
              <div class="preference-item">
                <span class="preference-label">价格敏感度</span>
                <el-rate 
                  v-model="customerPreferences.priceSensitivity" 
                  disabled 
                  show-score 
                  text-color="#ff9900"
                  score-template="敏感度: {value}"
                />
              </div>
              
              <div class="preference-item">
                <span class="preference-label">购买时间偏好</span>
                <div class="time-preferences">
                  <el-tag v-for="time in customerPreferences.timePreferences" :key="time">
                    {{ time }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 活动时间轴 -->
        <el-card class="timeline-card">
          <template #header>
            <div class="card-header">
              <span>活动时间轴</span>
              <div class="timeline-filters">
                <el-select v-model="timelineFilter" size="small" style="width: 120px;">
                  <el-option label="全部" value="all" />
                  <el-option label="邮件" value="email" />
                  <el-option label="订单" value="order" />
                  <el-option label="客服" value="service" />
                  <el-option label="营销" value="marketing" />
                </el-select>
                <el-button @click="refreshTimeline" :icon="Refresh" size="small" text>
                  刷新
                </el-button>
              </div>
            </div>
          </template>
          
          <el-timeline class="customer-timeline">
            <el-timeline-item 
              v-for="(event, index) in filteredTimeline" 
              :key="index"
              :timestamp="formatDateTime(event.timestamp)"
              :type="getEventType(event.type)"
              :icon="getEventIcon(event.type)"
            >
              <div class="timeline-event">
                <div class="event-header">
                  <span class="event-title">{{ event.title }}</span>
                  <el-tag :type="getEventTagType(event.type)" size="small">
                    {{ getEventTypeLabel(event.type) }}
                  </el-tag>
                </div>
                <div class="event-content">{{ event.description }}</div>
                <div v-if="event.details" class="event-details">
                  <el-descriptions :column="2" size="small">
                    <el-descriptions-item 
                      v-for="(value, key) in event.details" 
                      :key="key"
                      :label="key"
                    >
                      {{ value }}
                    </el-descriptions-item>
                  </el-descriptions>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
          
          <div v-if="filteredTimeline.length === 0" class="timeline-empty">
            <el-empty description="暂无活动记录" />
          </div>
          
          <div class="timeline-load-more">
            <el-button @click="loadMoreTimeline" :loading="loadingTimeline" text>
              加载更多
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧边栏 -->
      <el-col :span="8">
        <!-- 快速操作 -->
        <el-card class="quick-actions-card">
          <template #header>
            <span>快速操作</span>
          </template>
          
          <div class="quick-actions">
            <el-button @click="createCampaign" :icon="Promotion" type="primary" block>
              创建营销活动
            </el-button>
            <el-button @click="scheduleFollowup" :icon="Clock" block>
              安排跟进
            </el-button>
            <el-button @click="addNote" :icon="EditPen" block>
              添加备注
            </el-button>
            <el-button @click="assignTask" :icon="User" block>
              分配任务
            </el-button>
          </div>
        </el-card>

        <!-- 基本信息 -->
        <el-card class="basic-info-card">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
              <el-button @click="editBasicInfo" :icon="Edit" size="small" text>
                编辑
              </el-button>
            </div>
          </template>
          
          <el-descriptions :column="1" size="small" border>
            <el-descriptions-item label="公司名称">
              {{ customer.company || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="职位">
              {{ customer.position || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="所属行业">
              {{ customer.industry || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="公司规模">
              {{ customer.companySize || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="所属地区">
              {{ getRegionLabel(customer.region) }}
            </el-descriptions-item>
            <el-descriptions-item label="客户来源">
              {{ getSourceLabel(customer.source) }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatDateTime(customer.createTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="最后联系">
              {{ formatDateTime(customer.lastContact) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 标签管理 -->
        <el-card class="tags-card">
          <template #header>
            <div class="card-header">
              <span>客户标签</span>
              <el-button @click="showTagDialog = true" :icon="Plus" size="small" text>
                添加
              </el-button>
            </div>
          </template>
          
          <div class="customer-tags">
            <el-tag 
              v-for="tag in customer.tags" 
              :key="tag"
              closable
              @close="removeTag(tag)"
              class="tag-item"
            >
              {{ tag }}
            </el-tag>
            <el-tag v-if="!customer.tags || customer.tags.length === 0" type="info">
              暂无标签
            </el-tag>
          </div>
        </el-card>

        <!-- 相关联系人 -->
        <el-card class="related-contacts-card">
          <template #header>
            <div class="card-header">
              <span>相关联系人</span>
              <el-button @click="addRelatedContact" :icon="Plus" size="small" text>
                添加
              </el-button>
            </div>
          </template>
          
          <div class="related-contacts">
            <div 
              v-for="contact in relatedContacts" 
              :key="contact.id"
              class="contact-item"
            >
              <el-avatar :src="contact.avatar" :size="32">
                {{ contact.name.charAt(0) }}
              </el-avatar>
              <div class="contact-info">
                <div class="contact-name">{{ contact.name }}</div>
                <div class="contact-relation">{{ contact.relation }}</div>
              </div>
              <el-button @click="viewContact(contact)" size="small" text>
                查看
              </el-button>
            </div>
            
            <div v-if="relatedContacts.length === 0" class="no-contacts">
              暂无相关联系人
            </div>
          </div>
        </el-card>

        <!-- 最近订单 -->
        <el-card class="recent-orders-card">
          <template #header>
            <div class="card-header">
              <span>最近订单</span>
              <el-button @click="viewAllOrders" size="small" text type="primary">
                查看全部
              </el-button>
            </div>
          </template>
          
          <div class="recent-orders">
            <div 
              v-for="order in recentOrders" 
              :key="order.id"
              class="order-item"
            >
              <div class="order-info">
                <div class="order-number">#{{ order.orderNumber }}</div>
                <div class="order-amount">${{ order.amount }}</div>
              </div>
              <div class="order-meta">
                <div class="order-date">{{ formatDate(order.date) }}</div>
                <el-tag :type="getOrderStatusType(order.status)" size="small">
                  {{ getOrderStatusLabel(order.status) }}
                </el-tag>
              </div>
            </div>
            
            <div v-if="recentOrders.length === 0" class="no-orders">
              暂无订单记录
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 标签管理对话框 -->
    <el-dialog v-model="showTagDialog" title="管理客户标签" width="40%">
      <div class="tag-management">
        <div class="current-tags">
          <h4>当前标签</h4>
          <div class="tags-list">
            <el-tag 
              v-for="tag in customer.tags" 
              :key="tag"
              closable
              @close="removeTag(tag)"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
        
        <div class="add-tags">
          <h4>添加标签</h4>
          <el-select 
            v-model="selectedTags" 
            multiple 
            filterable 
            allow-create
            placeholder="选择或输入标签"
            style="width: 100%;"
          >
            <el-option 
              v-for="tag in availableTags" 
              :key="tag.value"
              :label="tag.label" 
              :value="tag.value" 
            />
          </el-select>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showTagDialog = false">取消</el-button>
          <el-button type="primary" @click="saveTags">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑基本信息对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑客户信息" width="50%">
      <el-form :model="editForm" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="客户姓名">
              <el-input v-model="editForm.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公司名称">
              <el-input v-model="editForm.company" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="职位">
              <el-input v-model="editForm.position" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="行业">
              <el-input v-model="editForm.industry" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="邮箱">
              <el-input v-model="editForm.email" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电话">
              <el-input v-model="editForm.phone" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="备注">
          <el-input 
            v-model="editForm.notes" 
            type="textarea" 
            :rows="3"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditDialog = false">取消</el-button>
          <el-button type="primary" @click="saveEdit">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft, Edit, MoreFilled, Refresh, Message, Phone, ShoppingBag,
  Promotion, Clock, EditPen, User, Plus
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 页面状态
const loadingTimeline = ref(false)
const showTagDialog = ref(false)
const showEditDialog = ref(false)
const timelineFilter = ref('all')
const selectedTags = ref([])

// 客户基本信息
const customer = ref({
  id: route.params.id || 1001,
  name: '张伟',
  company: '阿里巴巴集团',
  position: '产品经理',
  industry: '互联网',
  companySize: '10000+',
  email: 'zhangwei@alibaba.com',
  phone: '+86-138-0013-8000',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
  level: 'vip',
  status: 'active',
  region: 'asia',
  source: 'website',
  tags: ['高价值客户', '活跃用户', '重点关注'],
  createTime: new Date('2023-01-15'),
  lastContact: new Date('2024-08-15'),
  notes: '重要客户，需要重点维护'
})

// 客户评分
const customerScore = ref({
  overall: 85,
  activity: 92,
  loyalty: 78,
  purchasing: 88,
  influence: 82
})

// 客户统计
const customerStats = ref({
  totalOrders: 156,
  totalSpent: 125680,
  avgOrderValue: 805,
  customerYears: 1.5
})

// 客户偏好
const customerPreferences = ref({
  categories: [
    { name: '电子产品', percentage: 45, level: 'high' },
    { name: '服装配饰', percentage: 30, level: 'medium' },
    { name: '家居用品', percentage: 25, level: 'low' }
  ],
  priceSensitivity: 3,
  timePreferences: ['工作日晚上', '周末上午', '节假日']
})

// 活动时间轴
const timeline = ref([
  {
    type: 'order',
    title: '完成订单支付',
    description: '订单 #ORD-2024-0815-001，金额 $1,299',
    timestamp: new Date('2024-08-15 14:30:00'),
    details: { '订单金额': '$1,299', '支付方式': '信用卡', '配送地址': '上海市浦东新区' }
  },
  {
    type: 'email',
    title: '打开营销邮件',
    description: '打开了"夏季大促销"邮件并点击了产品链接',
    timestamp: new Date('2024-08-14 09:15:00'),
    details: { '邮件主题': '夏季大促销', '点击率': '25%', 'IP地址': '120.229.xxx.xxx' }
  },
  {
    type: 'service',
    title: '客服咨询',
    description: '通过在线客服咨询产品售后问题',
    timestamp: new Date('2024-08-10 16:45:00'),
    details: { '咨询时长': '15分钟', '问题类型': '售后服务', '满意度': '5星' }
  },
  {
    type: 'marketing',
    title: '参与营销活动',
    description: '参与了"会员专享"促销活动',
    timestamp: new Date('2024-08-05 20:20:00'),
    details: { '活动类型': '会员专享', '获得积分': '500', '优惠金额': '$50' }
  }
])

// 相关联系人
const relatedContacts = ref([
  {
    id: 1,
    name: '李娜',
    relation: '同事',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2'
  },
  {
    id: 2,
    name: '王强',
    relation: '推荐人',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3'
  }
])

// 最近订单
const recentOrders = ref([
  {
    id: 1,
    orderNumber: 'ORD-2024-0815-001',
    amount: 1299,
    date: new Date('2024-08-15'),
    status: 'completed'
  },
  {
    id: 2,
    orderNumber: 'ORD-2024-0801-002',
    amount: 599,
    date: new Date('2024-08-01'),
    status: 'shipped'
  },
  {
    id: 3,
    orderNumber: 'ORD-2024-0720-003',
    amount: 299,
    date: new Date('2024-07-20'),
    status: 'delivered'
  }
])

// 可用标签
const availableTags = ref([
  { label: '高价值客户', value: 'high-value' },
  { label: '活跃用户', value: 'active-user' },
  { label: '潜在客户', value: 'potential' },
  { label: '重点关注', value: 'focus' },
  { label: '新用户', value: 'new-user' },
  { label: '老客户', value: 'old-customer' },
  { label: '企业客户', value: 'enterprise' }
])

// 编辑表单
const editForm = reactive({
  name: '',
  company: '',
  position: '',
  industry: '',
  email: '',
  phone: '',
  notes: ''
})

// 计算属性
const filteredTimeline = computed(() => {
  if (timelineFilter.value === 'all') {
    return timeline.value
  }
  return timeline.value.filter(event => event.type === timelineFilter.value)
})

// 方法
const goBack = () => {
  router.push('/customer-center/list')
}

const getLevelType = (level) => {
  const types = { 'vip': 'danger', 'important': 'warning', 'normal': 'info', 'new': 'success' }
  return types[level] || ''
}

const getLevelLabel = (level) => {
  const labels = { 'vip': 'VIP客户', 'important': '重要客户', 'normal': '普通客户', 'new': '新客户' }
  return labels[level] || level
}

const getStatusType = (status) => {
  const types = { 'active': 'success', 'inactive': 'warning', 'potential': 'info', 'lost': 'danger' }
  return types[status] || ''
}

const getStatusLabel = (status) => {
  const labels = { 'active': '活跃', 'inactive': '非活跃', 'potential': '潜在客户', 'lost': '已流失' }
  return labels[status] || status
}

const getRegionLabel = (region) => {
  const labels = { 'north-america': '北美', 'europe': '欧洲', 'asia': '亚洲', 'other': '其他' }
  return labels[region] || region
}

const getSourceLabel = (source) => {
  const labels = { 'website': '网站注册', 'social': '社媒引流', 'email': '邮件营销', 'referral': '推荐介绍', 'offline': '线下活动' }
  return labels[source] || source
}

const getScoreColor = (score) => {
  if (score >= 80) return '#52c41a'
  if (score >= 60) return '#faad14'
  return '#f5222d'
}

const getEventType = (type) => {
  const types = { 'order': 'success', 'email': 'primary', 'service': 'warning', 'marketing': 'info' }
  return types[type] || 'info'
}

const getEventIcon = (type) => {
  const icons = { 'order': 'ShoppingBag', 'email': 'Message', 'service': 'Service', 'marketing': 'Promotion' }
  return icons[type] || 'InfoFilled'
}

const getEventTagType = (type) => {
  const types = { 'order': 'success', 'email': 'primary', 'service': 'warning', 'marketing': 'info' }
  return types[type] || 'info'
}

const getEventTypeLabel = (type) => {
  const labels = { 'order': '订单', 'email': '邮件', 'service': '客服', 'marketing': '营销' }
  return labels[type] || type
}

const getOrderStatusType = (status) => {
  const types = { 'completed': 'success', 'shipped': 'warning', 'delivered': 'info', 'cancelled': 'danger' }
  return types[status] || 'info'
}

const getOrderStatusLabel = (status) => {
  const labels = { 'completed': '已完成', 'shipped': '已发货', 'delivered': '已送达', 'cancelled': '已取消' }
  return labels[status] || status
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

// 操作方法
const sendEmail = () => {
  ElMessage.info(`发送邮件到 ${customer.value.email}`)
}

const makeCall = () => {
  ElMessage.info(`拨打电话 ${customer.value.phone}`)
}

const editCustomer = () => {
  Object.assign(editForm, customer.value)
  showEditDialog.value = true
}

const saveEdit = () => {
  Object.assign(customer.value, editForm)
  showEditDialog.value = false
  ElMessage.success('客户信息更新成功')
}

const handleCommand = (command) => {
  switch (command) {
    case 'duplicate':
      ElMessage.info('复制客户功能')
      break
    case 'merge':
      ElMessage.info('合并客户功能')
      break
    case 'export':
      ElMessage.info('导出客户数据')
      break
    case 'delete':
      ElMessageBox.confirm('确定要删除此客户吗？', '确认删除', {
        type: 'warning'
      }).then(() => {
        ElMessage.success('客户删除成功')
        goBack()
      }).catch(() => {})
      break
  }
}

const refreshProfile = () => {
  ElMessage.success('客户画像已刷新')
}

const refreshTimeline = () => {
  loadingTimeline.value = true
  setTimeout(() => {
    loadingTimeline.value = false
    ElMessage.success('时间轴已刷新')
  }, 1000)
}

const loadMoreTimeline = () => {
  loadingTimeline.value = true
  setTimeout(() => {
    loadingTimeline.value = false
    ElMessage.success('加载完成')
  }, 1000)
}

const removeTag = (tag) => {
  const index = customer.value.tags.indexOf(tag)
  if (index > -1) {
    customer.value.tags.splice(index, 1)
  }
}

const saveTags = () => {
  if (selectedTags.value.length > 0) {
    customer.value.tags = [...new Set([...customer.value.tags, ...selectedTags.value])]
    selectedTags.value = []
  }
  showTagDialog.value = false
  ElMessage.success('标签保存成功')
}

const editBasicInfo = () => {
  showEditDialog.value = true
}

const createCampaign = () => {
  ElMessage.info('创建营销活动')
}

const scheduleFollowup = () => {
  ElMessage.info('安排跟进')
}

const addNote = () => {
  ElMessage.info('添加备注')
}

const assignTask = () => {
  ElMessage.info('分配任务')
}

const addRelatedContact = () => {
  ElMessage.info('添加相关联系人')
}

const viewContact = (contact) => {
  ElMessage.info(`查看联系人: ${contact.name}`)
}

const viewAllOrders = () => {
  ElMessage.info('查看全部订单')
}

onMounted(() => {
  // 初始化数据
})
</script>

<style lang="scss" scoped>
.customer-detail-page {
  padding: 20px;
  background-color: #f5f7fa;
}

.detail-header {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  
  .back-navigation {
    margin-bottom: 20px;
  }
  
  .customer-info-header {
    display: flex;
    align-items: flex-start;
    gap: 24px;
    
    .customer-avatar {
      flex-shrink: 0;
    }
    
    .basic-info {
      flex: 1;
      
      .customer-name {
        font-size: 24px;
        font-weight: 600;
        color: #303133;
        margin: 0 0 12px 0;
      }
      
      .customer-meta {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
        
        .customer-id {
          color: #909399;
          font-size: 14px;
        }
      }
      
      .contact-info {
        display: flex;
        flex-direction: column;
        gap: 8px;
        
        .contact-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #606266;
          
          .el-icon {
            color: #909399;
          }
        }
      }
    }
    
    .header-actions {
      display: flex;
      gap: 12px;
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .timeline-filters {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.profile-card, .timeline-card, .quick-actions-card, 
.basic-info-card, .tags-card, .related-contacts-card, .recent-orders-card {
  margin-bottom: 24px;
}

.profile-section {
  margin-bottom: 32px;
  
  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 16px 0;
  }
}

.score-overview {
  display: flex;
  align-items: center;
  gap: 32px;
  
  .score-item {
    text-align: center;
    
    .score-circle {
      margin-bottom: 8px;
    }
    
    .score-label {
      font-size: 14px;
      color: #606266;
    }
  }
  
  .score-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    
    .score-detail-item {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .detail-label {
        min-width: 60px;
        font-size: 14px;
        color: #606266;
      }
      
      .el-progress {
        flex: 1;
      }
      
      .score-value {
        min-width: 30px;
        text-align: right;
        font-weight: 600;
      }
    }
  }
}

.preferences {
  .preference-item {
    margin-bottom: 20px;
    
    .preference-label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #303133;
    }
    
    .preference-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      
      .preference-tag {
        margin-bottom: 8px;
      }
    }
    
    .time-preferences {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }
}

.customer-timeline {
  .timeline-event {
    .event-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      
      .event-title {
        font-weight: 500;
        color: #303133;
      }
    }
    
    .event-content {
      color: #606266;
      margin-bottom: 12px;
    }
    
    .event-details {
      background-color: #f8f9fa;
      border-radius: 6px;
      padding: 12px;
    }
  }
}

.timeline-empty, .timeline-load-more {
  text-align: center;
  padding: 20px;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.customer-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  
  .tag-item {
    margin-bottom: 8px;
  }
}

.related-contacts {
  .contact-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .contact-info {
      flex: 1;
      
      .contact-name {
        font-weight: 500;
        color: #303133;
        margin-bottom: 4px;
      }
      
      .contact-relation {
        font-size: 12px;
        color: #909399;
      }
    }
  }
  
  .no-contacts {
    text-align: center;
    color: #909399;
    padding: 20px;
  }
}

.recent-orders {
  .order-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .order-info {
      .order-number {
        font-weight: 500;
        color: #303133;
        margin-bottom: 4px;
      }
      
      .order-amount {
        font-size: 16px;
        font-weight: 600;
        color: #52c41a;
      }
    }
    
    .order-meta {
      text-align: right;
      
      .order-date {
        font-size: 12px;
        color: #909399;
        margin-bottom: 4px;
      }
    }
  }
  
  .no-orders {
    text-align: center;
    color: #909399;
    padding: 20px;
  }
}

.tag-management {
  .current-tags, .add-tags {
    margin-bottom: 20px;
    
    h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }
  }
  
  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}

@media (max-width: 768px) {
  .customer-detail-page {
    padding: 12px;
  }
  
  .detail-header .customer-info-header {
    flex-direction: column;
    gap: 16px;
    
    .header-actions {
      align-self: flex-start;
    }
  }
  
  .score-overview {
    flex-direction: column;
    gap: 20px;
    
    .score-details {
      width: 100%;
    }
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
}
</style>