import Mock from 'mockjs'

// 生成营销活动模拟数据
const generateCampaigns = (count = 50) => {
  return Mock.mock({
    [`list|${count}`]: [{
      id: '@id',
      name: '@ctitle(5, 15)',
      type: '@pick(["email", "sms", "push", "multi-channel"])',
      status: '@pick(["draft", "scheduled", "running", "paused", "completed", "failed"])',
      objective: '@pick(["品牌宣传", "产品推广", "用户留存", "转化提升", "客户获取"])',
      description: '@cparagraph(1, 3)',
      // 目标设置
      target: {
        totalCustomers: '@integer(1000, 50000)',
        selectedCustomers: '@integer(500, 30000)',
        estimatedReach: '@integer(400, 25000)',
        targetCountries: function() {
          const countries = ['美国', '英国', '德国', '法国', '日本', '韩国', '澳大利亚']
          const count = Mock.mock('@integer(1, 4)')
          return Mock.mock('@shuffle').slice(0, count)
        },
        customerSegments: function() {
          const segments = ['新客户', '老客户', 'VIP客户', '活跃用户', '沉睡用户']
          const count = Mock.mock('@integer(1, 3)')
          return Mock.mock('@shuffle').slice(0, count)
        }
      },
      // 内容配置
      content: {
        subject: '@ctitle(8, 20)',
        template: '@pick(["template_001", "template_002", "template_003", "custom"])',
        language: '@pick(["zh-CN", "en-US", "multi"])',
        personalization: '@boolean',
        attachments: function() {
          return Mock.mock('@integer(0, 3)') > 0 ? 
            Mock.mock({
              'list|1-3': [{
                name: '@word(5, 10).@pick(["pdf", "jpg", "zip"])',
                size: '@integer(1024, 5242880)',
                url: '@url'
              }]
            }).list : []
        }
      },
      // 渠道设置
      channels: function() {
        const allChannels = [
          { type: 'email', enabled: true, config: { provider: 'sendgrid', from: 'noreply@example.com' }},
          { type: 'sms', enabled: Mock.mock('@boolean'), config: { provider: 'twilio' }},
          { type: 'push', enabled: Mock.mock('@boolean'), config: { platform: 'firebase' }},
          { type: 'wechat', enabled: Mock.mock('@boolean'), config: { appId: 'wx1234567890' }}
        ]
        return allChannels.filter(c => c.enabled)
      },
      // 时间安排
      schedule: {
        type: '@pick(["immediate", "scheduled", "recurring"])',
        startTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
        endTime: '@datetime("yyyy-MM-dd HH:mm:ss", "2025-12-31 23:59:59")',
        timezone: '@pick(["UTC+8", "UTC+0", "UTC-5", "UTC+9"])',
        recurring: {
          frequency: '@pick(["daily", "weekly", "monthly"])',
          interval: '@integer(1, 7)',
          endDate: '@date("yyyy-MM-dd")'
        }
      },
      // 预算和成本
      budget: {
        total: '@float(1000, 100000, 2, 2)',
        spent: '@float(200, 80000, 2, 2)',
        currency: '@pick(["USD", "EUR", "CNY"])',
        costPerSend: '@float(0.01, 0.5, 3, 3)'
      },
      // 统计数据
      stats: {
        sent: '@integer(1000, 50000)',
        delivered: '@integer(900, 45000)',
        opened: '@integer(200, 20000)',
        clicked: '@integer(50, 5000)',
        converted: '@integer(5, 500)',
        unsubscribed: '@integer(0, 100)',
        bounced: '@integer(10, 1000)',
        deliveryRate: '@float(85, 98, 1, 1)',
        openRate: '@float(15, 35, 1, 1)',
        clickRate: '@float(2, 12, 1, 1)',
        conversionRate: '@float(0.5, 5, 1, 1)',
        revenue: '@float(5000, 200000, 2, 2)'
      },
      // 创建和更新信息
      createdAt: '@datetime',
      updatedAt: '@datetime',
      createdBy: '@cname',
      lastModifiedBy: '@cname'
    }]
  }).list
}

// 营销活动列表
Mock.mock(/\/api\/campaigns(\?.*)?/, 'get', (options) => {
  const query = Mock.parseQuery(options.url)
  const page = parseInt(query.page) || 1
  const size = parseInt(query.size) || 20
  const status = query.status
  const type = query.type
  const keyword = query.keyword
  
  let allCampaigns = generateCampaigns(200)
  
  // 筛选逻辑
  if (status) {
    allCampaigns = allCampaigns.filter(c => c.status === status)
  }
  if (type) {
    allCampaigns = allCampaigns.filter(c => c.type === type)
  }
  if (keyword) {
    allCampaigns = allCampaigns.filter(c => 
      c.name.includes(keyword) || 
      c.description.includes(keyword)
    )
  }
  
  const total = allCampaigns.length
  const start = (page - 1) * size
  const list = allCampaigns.slice(start, start + size)
  
  return Mock.pageTemplate(list, total, page, size)
})

// 获取活动详情
Mock.mock(/\/api\/campaigns\/(\d+)/, 'get', (options) => {
  const id = options.url.match(/\/api\/campaigns\/(\d+)/)[1]
  const campaign = generateCampaigns(1)[0]
  campaign.id = id
  
  // 添加详细的执行记录
  campaign.executionLogs = Mock.mock({
    'list|5-15': [{
      id: '@id',
      action: '@pick(["started", "paused", "resumed", "content_updated", "targets_updated"])',
      description: '@cparagraph(1, 2)',
      result: '@pick(["success", "failed", "warning"])',
      details: '@cparagraph(1, 1)',
      createdAt: '@datetime',
      createdBy: '@cname'
    }]
  }).list
  
  return Mock.responseTemplate.success(campaign)
})

// 创建营销活动
Mock.mock('/api/campaigns', 'post', (options) => {
  const campaignData = Mock.parseBody(options.body)
  return Mock.responseTemplate.success({
    id: Mock.mock('@id'),
    ...campaignData,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }, '营销活动创建成功')
})

// 更新营销活动
Mock.mock(/\/api\/campaigns\/(\d+)/, 'put', (options) => {
  const id = options.url.match(/\/api\/campaigns\/(\d+)/)[1]
  const campaignData = Mock.parseBody(options.body)
  return Mock.responseTemplate.success({
    id: id,
    ...campaignData,
    updatedAt: new Date().toISOString()
  }, '营销活动更新成功')
})

// 删除营销活动
Mock.mock(/\/api\/campaigns\/(\d+)/, 'delete', () => {
  return Mock.responseTemplate.success(null, '营销活动删除成功')
})

// 启动活动
Mock.mock(/\/api\/campaigns\/(\d+)\/start/, 'post', (options) => {
  const id = options.url.match(/\/api\/campaigns\/(\d+)/)[1]
  return Mock.responseTemplate.success({
    campaignId: id,
    status: 'running',
    startedAt: new Date().toISOString(),
    estimatedCompletion: new Date(Date.now() + 3600000).toISOString()
  }, '活动启动成功')
})

// 暂停活动
Mock.mock(/\/api\/campaigns\/(\d+)\/pause/, 'post', (options) => {
  const id = options.url.match(/\/api\/campaigns\/(\d+)/)[1]
  return Mock.responseTemplate.success({
    campaignId: id,
    status: 'paused',
    pausedAt: new Date().toISOString()
  }, '活动已暂停')
})

// 停止活动
Mock.mock(/\/api\/campaigns\/(\d+)\/stop/, 'post', (options) => {
  const id = options.url.match(/\/api\/campaigns\/(\d+)/)[1]
  return Mock.responseTemplate.success({
    campaignId: id,
    status: 'stopped',
    stoppedAt: new Date().toISOString()
  }, '活动已停止')
})

// 获取活动模板
Mock.mock('/api/campaign-templates', 'get', () => {
  return Mock.responseTemplate.success(
    Mock.mock({
      'list|10-20': [{
        id: '@id',
        name: '@ctitle(5, 12)',
        type: '@pick(["email", "sms", "multi-channel"])',
        category: '@pick(["促销活动", "新品发布", "节日营销", "会员关怀", "客户挽回"])',
        description: '@cparagraph(1, 2)',
        thumbnail: '@image("300x200", "@color", "#FFF", "png", "@word(3,5)")',
        content: {
          subject: '@ctitle(8, 20)',
          body: '@cparagraph(3, 8)',
          variables: ['{{name}}', '{{company}}', '{{product}}', '{{discount}}']
        },
        usageCount: '@integer(0, 500)',
        rating: '@float(3, 5, 1, 1)',
        isDefault: '@boolean',
        createdAt: '@datetime'
      }]
    }).list
  )
})

// 复制活动
Mock.mock(/\/api\/campaigns\/(\d+)\/duplicate/, 'post', (options) => {
  const originalId = options.url.match(/\/api\/campaigns\/(\d+)/)[1]
  const newCampaign = generateCampaigns(1)[0]
  newCampaign.id = Mock.mock('@id')
  newCampaign.name = newCampaign.name + ' (副本)'
  newCampaign.status = 'draft'
  newCampaign.createdAt = new Date().toISOString()
  
  return Mock.responseTemplate.success(newCampaign, '活动复制成功')
})

// 获取活动统计报告
Mock.mock(/\/api\/campaigns\/(\d+)\/report/, 'get', (options) => {
  const id = options.url.match(/\/api\/campaigns\/(\d+)/)[1]
  return Mock.responseTemplate.success({
    campaignId: id,
    overview: {
      totalSent: Mock.mock('@integer(10000, 100000)'),
      totalDelivered: Mock.mock('@integer(9000, 95000)'),
      totalOpened: Mock.mock('@integer(2000, 30000)'),
      totalClicked: Mock.mock('@integer(200, 8000)'),
      totalConverted: Mock.mock('@integer(20, 800)'),
      revenue: Mock.mock('@float(10000, 500000, 2, 2)')
    },
    timeline: Mock.mock({
      'data|10': [{
        date: '@date',
        sent: '@integer(800, 1200)',
        opened: '@integer(200, 500)',
        clicked: '@integer(20, 150)',
        converted: '@integer(2, 50)'
      }]
    }).data,
    demographics: {
      byCountry: Mock.mock({
        'data|5': [{
          country: '@pick(["美国", "英国", "德国", "法国", "日本"])',
          sent: '@integer(1000, 20000)',
          openRate: '@float(15, 40, 1, 1)',
          clickRate: '@float(2, 15, 1, 1)'
        }]
      }).data,
      byAge: Mock.mock({
        'data|5': [{
          ageRange: '@pick(["18-25", "26-35", "36-45", "46-55", "55+"])',
          count: '@integer(500, 5000)',
          openRate: '@float(15, 40, 1, 1)',
          conversionRate: '@float(1, 8, 1, 1)'
        }]
      }).data
    },
    topPerformingContent: Mock.mock({
      'data|5': [{
        subject: '@ctitle(8, 20)',
        openRate: '@float(25, 50, 1, 1)',
        clickRate: '@float(5, 20, 1, 1)',
        sent: '@integer(1000, 10000)'
      }]
    }).data
  })
})

// 测试活动发送
Mock.mock(/\/api\/campaigns\/(\d+)\/test/, 'post', (options) => {
  const id = options.url.match(/\/api\/campaigns\/(\d+)/)[1]
  const { recipients } = Mock.parseBody(options.body)
  
  return Mock.responseTemplate.success({
    campaignId: id,
    testSent: recipients.length,
    sentAt: new Date().toISOString(),
    recipients: recipients
  }, '测试邮件发送成功')
})