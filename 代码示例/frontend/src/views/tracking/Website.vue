<template>
  <div class="website-tracking-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>网站追踪</h1>
      <div class="header-actions">
        <el-button type="primary" @click="showTrackingSetup">
          <el-icon><Plus /></el-icon>
          添加追踪代码
        </el-button>
        <el-button @click="exportData">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-icon visitors">
                <el-icon><User /></el-icon>
              </div>
              <div class="stat-content">
                <h3>{{ websiteStats.visitors.toLocaleString() }}</h3>
                <p>独立访客</p>
                <span class="growth-rate positive">+{{ websiteStats.visitorsGrowth }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-icon pageviews">
                <el-icon><Document /></el-icon>
              </div>
              <div class="stat-content">
                <h3>{{ websiteStats.pageviews.toLocaleString() }}</h3>
                <p>页面浏览</p>
                <span class="growth-rate positive">+{{ websiteStats.pageviewsGrowth }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-icon duration">
                <el-icon><Timer /></el-icon>
              </div>
              <div class="stat-content">
                <h3>{{ websiteStats.avgDuration }}</h3>
                <p>平均停留</p>
                <span class="growth-rate" :class="websiteStats.durationGrowth > 0 ? 'positive' : 'negative'">
                  {{ websiteStats.durationGrowth > 0 ? '+' : '' }}{{ websiteStats.durationGrowth }}%
                </span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-icon bounce">
                <el-icon><Position /></el-icon>
              </div>
              <div class="stat-content">
                <h3>{{ websiteStats.bounceRate }}%</h3>
                <p>跳出率</p>
                <span class="growth-rate" :class="websiteStats.bounceGrowth > 0 ? 'negative' : 'positive'">
                  {{ websiteStats.bounceGrowth > 0 ? '+' : '' }}{{ websiteStats.bounceGrowth }}%
                </span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 网站访问记录列表 -->
    <el-card class="tracking-list-card">
      <template #header>
        <div class="card-header">
          <span>访问记录</span>
          <div class="header-filters">
            <el-select v-model="filters.source" placeholder="来源筛选" size="small" style="width: 120px">
              <el-option label="全部来源" value="" />
              <el-option label="直接访问" value="direct" />
              <el-option label="搜索引擎" value="search" />
              <el-option label="社交媒体" value="social" />
              <el-option label="邮件链接" value="email" />
              <el-option label="广告投放" value="ads" />
            </el-select>
            <el-select v-model="filters.device" placeholder="设备筛选" size="small" style="width: 100px">
              <el-option label="全部设备" value="" />
              <el-option label="桌面端" value="desktop" />
              <el-option label="移动端" value="mobile" />
              <el-option label="平板" value="tablet" />
            </el-select>
            <el-date-picker
              v-model="filters.dateRange"
              type="daterange"
              size="small"
              format="YYYY/MM/DD"
              value-format="YYYY-MM-DD"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 240px"
            />
          </div>
        </div>
      </template>

      <el-table 
        :data="paginatedTrackingData" 
        v-loading="loading"
        style="width: 100%"
        :row-class-name="tableRowClassName"
      >
        <el-table-column prop="sessionId" label="会话ID" min-width="120" />
        <el-table-column prop="visitorId" label="访客ID" min-width="140" show-overflow-tooltip />
        <el-table-column prop="ip" label="IP地址" min-width="130" />
        <el-table-column prop="location" label="地理位置" min-width="150" show-overflow-tooltip />
        <el-table-column prop="referrer" label="来源" min-width="120" show-overflow-tooltip />
        <el-table-column label="设备" min-width="100">
          <template #default="scope">
            <el-tag :type="getDeviceTagType(scope.row.device)" size="small">
              {{ getDeviceText(scope.row.device) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="browser" label="浏览器" min-width="100" show-overflow-tooltip />
        <el-table-column prop="pageviews" label="页面数" min-width="80" />
        <el-table-column prop="duration" label="停留时长" min-width="100" />
        <el-table-column prop="visitTime" label="访问时间" min-width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <div class="operation-buttons">
              <el-button size="small" @click="viewDetails(scope.row)">详情</el-button>
              <el-button size="small" type="primary" @click="viewPath(scope.row)">路径</el-button>
              <el-button size="small" @click="viewEvents(scope.row)">事件</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.current"
          :page-size="pagination.size"
          :total="filteredTrackingData.length"
          layout="total, prev, pager, next, jumper"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 追踪设置对话框 -->
    <el-dialog v-model="trackingSetupDialog.visible" title="添加网站追踪代码" width="700px">
      <el-form :model="trackingSetupDialog.form" :rules="setupFormRules" ref="setupFormRef" label-width="100px">
        <el-form-item label="网站名称" prop="name" required>
          <el-input v-model="trackingSetupDialog.form.name" placeholder="输入网站名称" />
        </el-form-item>
        <el-form-item label="网站域名" prop="domain" required>
          <el-input v-model="trackingSetupDialog.form.domain" placeholder="例如: www.example.com" />
        </el-form-item>
        <el-form-item label="追踪事件" prop="events" required>
          <el-checkbox-group v-model="trackingSetupDialog.form.events">
            <el-checkbox value="pageview">页面浏览</el-checkbox>
            <el-checkbox value="click">点击事件</el-checkbox>
            <el-checkbox value="scroll">滚动事件</el-checkbox>
            <el-checkbox value="form">表单提交</el-checkbox>
            <el-checkbox value="download">文件下载</el-checkbox>
            <el-checkbox value="outbound">外链点击</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="追踪代码">
          <el-input
            v-model="generatedCode"
            type="textarea"
            :rows="8"
            readonly
            placeholder="追踪代码将在填写完成后自动生成"
          />
          <div class="code-actions" v-if="generatedCode">
            <el-button size="small" @click="copyCode">
              <el-icon><CopyDocument /></el-icon>
              复制代码
            </el-button>
            <el-button size="small" type="primary" @click="downloadCode">
              <el-icon><Download /></el-icon>
              下载文件
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="trackingSetupDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="saveTrackingSetup" :loading="saving">保存设置</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 访问详情对话框 -->
    <el-dialog v-model="detailsDialog.visible" title="访问详情" width="800px">
      <div class="details-content" v-if="detailsDialog.record">
        <div class="details-header">
          <h3>访问会话: {{ detailsDialog.record.sessionId }}</h3>
          <el-tag :type="getDeviceTagType(detailsDialog.record.device)" size="large">
            {{ getDeviceText(detailsDialog.record.device) }}
          </el-tag>
        </div>
        
        <el-descriptions :column="2" border class="details-info">
          <el-descriptions-item label="访客ID">{{ detailsDialog.record.visitorId }}</el-descriptions-item>
          <el-descriptions-item label="IP地址">{{ detailsDialog.record.ip }}</el-descriptions-item>
          <el-descriptions-item label="地理位置">{{ detailsDialog.record.location }}</el-descriptions-item>
          <el-descriptions-item label="来源">{{ detailsDialog.record.referrer }}</el-descriptions-item>
          <el-descriptions-item label="浏览器">{{ detailsDialog.record.browser }}</el-descriptions-item>
          <el-descriptions-item label="操作系统">{{ detailsDialog.record.os || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="屏幕分辨率">{{ detailsDialog.record.screenResolution || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="语言">{{ detailsDialog.record.language || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="页面浏览数">{{ detailsDialog.record.pageviews }}</el-descriptions-item>
          <el-descriptions-item label="停留时长">{{ detailsDialog.record.duration }}</el-descriptions-item>
          <el-descriptions-item label="访问时间">{{ detailsDialog.record.visitTime }}</el-descriptions-item>
          <el-descriptions-item label="是否新访客">{{ detailsDialog.record.isNewVisitor ? '是' : '否' }}</el-descriptions-item>
        </el-descriptions>

        <div class="page-views" v-if="detailsDialog.record.pages?.length">
          <h4>访问页面</h4>
          <el-table :data="detailsDialog.record.pages" size="small">
            <el-table-column prop="url" label="页面URL" show-overflow-tooltip />
            <el-table-column prop="title" label="页面标题" show-overflow-tooltip />
            <el-table-column prop="visitTime" label="访问时间" width="160" />
            <el-table-column prop="duration" label="停留时长" width="100" />
          </el-table>
        </div>
      </div>
    </el-dialog>

    <!-- 访问路径对话框 -->
    <el-dialog v-model="pathDialog.visible" title="用户访问路径" width="900px">
      <div class="path-content" v-if="pathDialog.record">
        <div class="path-summary">
          <h3>访问会话: {{ pathDialog.record.sessionId }}</h3>
          <p>总访问页面: {{ pathDialog.record.pageviews }} | 总停留时长: {{ pathDialog.record.duration }}</p>
        </div>
        <div class="path-flow">
          <div v-for="(page, index) in pathDialog.record.pathFlow" :key="index" class="path-step">
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-content">
              <div class="page-info">
                <div class="page-title">{{ page.title }}</div>
                <div class="page-url">{{ page.url }}</div>
              </div>
              <div class="step-meta">
                <span class="visit-time">{{ page.visitTime }}</span>
                <span class="duration">停留 {{ page.duration }}</span>
              </div>
            </div>
            <div v-if="index < pathDialog.record.pathFlow.length - 1" class="step-arrow">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 事件追踪对话框 -->
    <el-dialog v-model="eventsDialog.visible" title="事件追踪" width="800px">
      <div class="events-content" v-if="eventsDialog.record">
        <div class="events-summary">
          <h3>会话事件: {{ eventsDialog.record.sessionId }}</h3>
          <p>共触发 {{ eventsDialog.record.events?.length || 0 }} 个事件</p>
        </div>
        <el-timeline>
          <el-timeline-item
            v-for="event in eventsDialog.record.events"
            :key="event.id"
            :timestamp="event.time"
            :type="getEventType(event.type)"
          >
            <div class="event-content">
              <div class="event-title">{{ getEventText(event.type) }}</div>
              <div class="event-details" v-if="event.details">{{ event.details }}</div>
              <div class="event-page" v-if="event.page">页面: {{ event.page }}</div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Download, User, Document, Timer, Position, View, DataAnalysis,
  CopyDocument, ArrowRight
} from '@element-plus/icons-vue'

// 响应式数据
const websiteStats = ref({
  visitors: 8934,
  visitorsGrowth: 18.2,
  pageviews: 23567,
  pageviewsGrowth: 14.7,
  avgDuration: '3:42',
  durationGrowth: -5.3,
  bounceRate: 38.5,
  bounceGrowth: 2.1
})

const filters = ref({
  source: '',
  device: '',
  dateRange: null
})

const pagination = ref({
  current: 1,
  size: 10,
  total: 0
})

const loading = ref(false)

// 生成访问追踪数据
const generateTrackingData = () => {
  const sources = ['direct', 'search', 'social', 'email', 'ads']
  const devices = ['desktop', 'mobile', 'tablet']
  const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge', 'Opera']
  const locations = ['北京, 中国', '上海, 中国', '广州, 中国', '深圳, 中国', '杭州, 中国', '成都, 中国', 
                    '南京, 中国', '武汉, 中国', '西安, 中国', '重庆, 中国', '天津, 中国', '苏州, 中国',
                    '青岛, 中国', '长沙, 中国', '大连, 中国']
  
  const pages = [
    { url: '/', title: '首页' },
    { url: '/products', title: '产品中心' },
    { url: '/about', title: '关于我们' },
    { url: '/contact', title: '联系我们' },
    { url: '/blog', title: '博客' },
    { url: '/help', title: '帮助中心' },
    { url: '/pricing', title: '价格方案' },
    { url: '/features', title: '功能特性' },
    { url: '/login', title: '用户登录' },
    { url: '/register', title: '用户注册' }
  ]

  const data = []
  
  for (let i = 1; i <= 32; i++) {
    const randomSource = sources[Math.floor(Math.random() * sources.length)]
    const randomDevice = devices[Math.floor(Math.random() * devices.length)]
    const randomBrowser = browsers[Math.floor(Math.random() * browsers.length)]
    const randomLocation = locations[Math.floor(Math.random() * locations.length)]
    
    const visitDate = new Date(2024, 2, Math.floor(Math.random() * 30) + 1, 
                              Math.floor(Math.random() * 24), 
                              Math.floor(Math.random() * 60))
    
    const pageviews = Math.floor(Math.random() * 10) + 1
    const durationMinutes = Math.floor(Math.random() * 20) + 1
    const durationSeconds = Math.floor(Math.random() * 60)
    const duration = `${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`
    
    // 生成访问的页面列表
    const visitedPages = []
    const shuffledPages = [...pages].sort(() => Math.random() - 0.5)
    
    for (let j = 0; j < Math.min(pageviews, shuffledPages.length); j++) {
      const pageVisitTime = new Date(visitDate.getTime() + j * 2 * 60 * 1000) // 每页间隔2分钟
      const pageDuration = Math.floor(Math.random() * 180) + 30 // 30-210秒
      const pageDurationFormatted = `${Math.floor(pageDuration / 60)}:${(pageDuration % 60).toString().padStart(2, '0')}`
      
      visitedPages.push({
        url: shuffledPages[j].url,
        title: shuffledPages[j].title,
        visitTime: pageVisitTime.toLocaleString('zh-CN'),
        duration: pageDurationFormatted
      })
    }
    
    // 生成访问路径
    const pathFlow = visitedPages.map((page, index) => ({
      ...page,
      step: index + 1
    }))
    
    // 生成事件追踪
    const events = []
    let eventId = 1
    
    visitedPages.forEach((page, pageIndex) => {
      // 页面浏览事件
      events.push({
        id: eventId++,
        type: 'pageview',
        time: page.visitTime,
        details: `浏览页面: ${page.title}`,
        page: page.url
      })
      
      // 随机生成其他事件
      if (Math.random() > 0.5) {
        const eventTime = new Date(new Date(page.visitTime).getTime() + Math.random() * 60000)
        const eventTypes = ['click', 'scroll', 'form', 'download', 'outbound']
        const randomEventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
        
        let details = ''
        switch (randomEventType) {
          case 'click':
            details = `点击按钮: ${['购买', '联系我们', '了解更多', '立即体验'][Math.floor(Math.random() * 4)]}`
            break
          case 'scroll':
            details = `滚动到页面 ${Math.floor(Math.random() * 80) + 20}% 位置`
            break
          case 'form':
            details = `提交表单: ${['联系表单', '注册表单', '订阅表单'][Math.floor(Math.random() * 3)]}`
            break
          case 'download':
            details = `下载文件: ${['产品手册.pdf', '价格表.xlsx', '软件安装包.zip'][Math.floor(Math.random() * 3)]}`
            break
          case 'outbound':
            details = `点击外链: ${['合作伙伴官网', '社交媒体', '第三方工具'][Math.floor(Math.random() * 3)]}`
            break
        }
        
        events.push({
          id: eventId++,
          type: randomEventType,
          time: eventTime.toLocaleString('zh-CN'),
          details,
          page: page.url
        })
      }
    })
    
    data.push({
      sessionId: `S${String(i).padStart(6, '0')}`,
      visitorId: `V${Math.floor(Math.random() * 900000) + 100000}`,
      ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      location: randomLocation,
      referrer: randomSource,
      device: randomDevice,
      browser: randomBrowser,
      os: randomDevice === 'mobile' ? 'iOS/Android' : 'Windows/MacOS',
      screenResolution: randomDevice === 'mobile' ? '375x667' : '1920x1080',
      language: 'zh-CN',
      pageviews,
      duration,
      visitTime: visitDate.toLocaleString('zh-CN'),
      isNewVisitor: Math.random() > 0.3,
      pages: visitedPages,
      pathFlow,
      events: events.sort((a, b) => new Date(a.time) - new Date(b.time))
    })
  }
  
  return data.sort((a, b) => new Date(b.visitTime) - new Date(a.visitTime))
}

const trackingData = ref(generateTrackingData())

const trackingSetupDialog = ref({
  visible: false,
  form: {
    name: '',
    domain: '',
    events: []
  }
})

const setupFormRef = ref()
const setupFormRules = {
  name: [
    { required: true, message: '请输入网站名称', trigger: 'blur' }
  ],
  domain: [
    { required: true, message: '请输入网站域名', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/, message: '请输入有效的域名', trigger: 'blur' }
  ],
  events: [
    { required: true, type: 'array', min: 1, message: '请选择至少一种追踪事件', trigger: 'change' }
  ]
}

const detailsDialog = ref({
  visible: false,
  record: null
})

const pathDialog = ref({
  visible: false,
  record: null
})

const eventsDialog = ref({
  visible: false,
  record: null
})

const generatedCode = ref('')
const saving = ref(false)

// 计算属性
const filteredTrackingData = computed(() => {
  return trackingData.value.filter(item => {
    const sourceMatch = !filters.value.source || item.referrer === filters.value.source
    const deviceMatch = !filters.value.device || item.device === filters.value.device
    
    let dateMatch = true
    if (filters.value.dateRange && filters.value.dateRange.length === 2) {
      const itemDate = new Date(item.visitTime)
      const startDate = new Date(filters.value.dateRange[0])
      const endDate = new Date(filters.value.dateRange[1])
      endDate.setHours(23, 59, 59, 999)
      dateMatch = itemDate >= startDate && itemDate <= endDate
    }
    
    return sourceMatch && deviceMatch && dateMatch
  })
})

const paginatedTrackingData = computed(() => {
  const start = (pagination.value.current - 1) * pagination.value.size
  const end = start + pagination.value.size
  return filteredTrackingData.value.slice(start, end)
})

// 监听表单变化生成追踪代码
watch(() => trackingSetupDialog.value.form, (newForm) => {
  if (newForm.name && newForm.domain && newForm.events.length > 0) {
    generatedCode.value = generateTrackingCode(newForm)
  } else {
    generatedCode.value = ''
  }
}, { deep: true })

// 方法
const generateTrackingCode = (form) => {
  const trackingId = `TRK_${Date.now()}`
  return `<!-- 网站追踪代码 - ${form.name} -->
<${'script'}>
(function() {
  var trackingConfig = {
    trackingId: '${trackingId}',
    domain: '${form.domain}',
    events: ${JSON.stringify(form.events)}
  };
  
  // 追踪函数
  function track(event, data) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://api.yourtracking.com/track', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
      trackingId: trackingConfig.trackingId,
      event: event,
      data: data,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent
    }));
  }
  
  // 页面浏览追踪
  if (trackingConfig.events.includes('pageview')) {
    track('pageview', {
      title: document.title,
      url: window.location.href
    });
  }
  
  // 点击事件追踪
  if (trackingConfig.events.includes('click')) {
    document.addEventListener('click', function(e) {
      track('click', {
        element: e.target.tagName,
        text: e.target.innerText || e.target.value,
        x: e.clientX,
        y: e.clientY
      });
    });
  }
  
  // 滚动事件追踪
  if (trackingConfig.events.includes('scroll')) {
    var scrollTimer = null;
    window.addEventListener('scroll', function() {
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function() {
        var scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        track('scroll', { percent: scrollPercent });
      }, 250);
    });
  }
  
  // 表单提交追踪
  if (trackingConfig.events.includes('form')) {
    document.addEventListener('submit', function(e) {
      track('form', {
        formId: e.target.id || 'unknown',
        formAction: e.target.action || 'unknown'
      });
    });
  }
})();
</${'script'}>`
}

const showTrackingSetup = () => {
  trackingSetupDialog.value.visible = true
  trackingSetupDialog.value.form = {
    name: '',
    domain: '',
    events: []
  }
  generatedCode.value = ''
}

const saveTrackingSetup = async () => {
  try {
    await setupFormRef.value.validate()
    saving.value = true
    
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('追踪设置已保存')
    trackingSetupDialog.value.visible = false
  } catch (error) {
    ElMessage.error('请完善必填信息')
  } finally {
    saving.value = false
  }
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(generatedCode.value)
    ElMessage.success('追踪代码已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败，请手动复制')
  }
}

const downloadCode = () => {
  const blob = new Blob([generatedCode.value], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `tracking-code-${trackingSetupDialog.value.form.domain}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('追踪代码文件下载成功')
}

const exportData = () => {
  ElMessage.success('数据导出已开始，请稍候...')
}

const getDeviceTagType = (device) => {
  const types = {
    desktop: 'primary',
    mobile: 'success',
    tablet: 'warning'
  }
  return types[device] || 'default'
}

const getDeviceText = (device) => {
  const texts = {
    desktop: '桌面端',
    mobile: '移动端',
    tablet: '平板'
  }
  return texts[device] || device
}

const tableRowClassName = ({ row, rowIndex }) => {
  if (row.isNewVisitor) {
    return 'new-visitor-row'
  }
  return ''
}

const viewDetails = (record) => {
  detailsDialog.value.record = record
  detailsDialog.value.visible = true
}

const viewPath = (record) => {
  pathDialog.value.record = record
  pathDialog.value.visible = true
}

const viewEvents = (record) => {
  eventsDialog.value.record = record
  eventsDialog.value.visible = true
}

const handlePageChange = (page) => {
  pagination.value.current = page
}

const getEventType = (type) => {
  const types = {
    pageview: 'primary',
    click: 'success',
    scroll: 'info',
    form: 'warning',
    download: 'success',
    outbound: 'danger'
  }
  return types[type] || 'default'
}

const getEventText = (type) => {
  const texts = {
    pageview: '页面浏览',
    click: '点击事件',
    scroll: '滚动事件',
    form: '表单提交',
    download: '文件下载',
    outbound: '外链点击'
  }
  return texts[type] || type
}

onMounted(() => {
  pagination.value.total = trackingData.value.length
})
</script>

<style scoped lang="scss">
.website-tracking-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  height: 120px;
}

.stat-item {
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  color: white;
}

.stat-icon.visitors {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.pageviews {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.duration {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.bounce {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-content h3 {
  margin: 0 0 4px 0;
  font-size: 28px;
  font-weight: 600;
}

.stat-content p {
  margin: 0 0 4px 0;
  color: #666;
  font-size: 14px;
}

.growth-rate {
  font-size: 12px;
  font-weight: 500;
}

.growth-rate.positive {
  color: #67c23a;
}

.growth-rate.negative {
  color: #f56c6c;
}

.tracking-list-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-filters {
  display: flex;
  gap: 12px;
  align-items: center;
}

.operation-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: nowrap;
  
  .el-button {
    margin: 0;
  }
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

// 表格行样式
:deep(.new-visitor-row) {
  background-color: #f0f9ff;
}

// 对话框样式
.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.details-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.details-info {
  margin-bottom: 24px;
}

.page-views h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.path-summary {
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.path-summary h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 500;
}

.path-summary p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.path-flow {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.path-step {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 16px;
}

.step-content {
  flex: 1;
}

.page-info {
  .page-title {
    font-weight: 500;
    color: #333;
    margin-bottom: 4px;
  }
  
  .page-url {
    color: #666;
    font-size: 14px;
  }
}

.step-meta {
  margin-top: 8px;
  display: flex;
  gap: 16px;
  
  .visit-time,
  .duration {
    color: #999;
    font-size: 12px;
  }
}

.step-arrow {
  margin-left: 16px;
  color: #409eff;
  font-size: 18px;
}

.events-summary {
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.events-summary h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 500;
}

.events-summary p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.event-content {
  .event-title {
    font-weight: 500;
    color: #409eff;
    margin-bottom: 4px;
  }
  
  .event-details {
    color: #666;
    font-size: 14px;
    margin-bottom: 4px;
  }
  
  .event-page {
    color: #999;
    font-size: 12px;
  }
}

.code-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}

.dialog-footer {
  text-align: right;
}
</style>