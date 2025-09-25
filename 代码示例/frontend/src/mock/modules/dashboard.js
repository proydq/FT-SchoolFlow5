import Mock from 'mockjs'

// 获取仪表板统计数据
Mock.mock('/api/dashboard/stats', 'get', () => {
  return Mock.responseTemplate.success({
    totalCampaigns: Mock.mock('@integer(100, 200)'),
    activeCampaigns: Mock.mock('@integer(10, 30)'),
    totalCustomers: Mock.mock('@integer(8000, 15000)'),
    todayEmails: Mock.mock('@integer(1000, 2000)'),
    openRate: Mock.mock('@float(25, 40, 1, 1)'),
    clickRate: Mock.mock('@float(6, 12, 1, 1)'),
    conversionRate: Mock.mock('@float(1, 5, 1, 1)'),
    revenue: Mock.mock('@integer(100000, 200000)'),
    
    // 变化趋势数据
    campaignChange: Mock.mock('@float(-20, 20, 1, 1)'),
    activeChange: Mock.mock('@float(-15, 25, 1, 1)'),
    newCustomersToday: Mock.mock('@integer(30, 80)'),
    emailChange: Mock.mock('@float(-10, 15, 1, 1)'),
    openRateChange: Mock.mock('@float(-5, 5, 1, 1)'),
    clickRateChange: Mock.mock('@float(-3, 3, 1, 1)'),
    conversionChange: Mock.mock('@float(-2, 8, 1, 1)'),
    revenueIncrease: Mock.mock('@integer(5000, 25000)')
  })
})

// 获取邮件趋势数据
Mock.mock('/api/dashboard/email-trend', 'get', (options) => {
  const query = Mock.parseQuery(options.url)
  const days = parseInt(query.days) || 7
  
  const data = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toISOString().split('T')[0],
      sent: Mock.mock('@integer(1000, 1500)'),
      opened: Mock.mock('@integer(300, 600)'),
      clicked: Mock.mock('@integer(60, 150)'),
      bounced: Mock.mock('@integer(5, 20)'),
      unsubscribed: Mock.mock('@integer(0, 5)')
    })
  }
  
  return Mock.responseTemplate.success(data)
})

// 获取转化漏斗数据
Mock.mock('/api/dashboard/funnel', 'get', () => {
  return Mock.responseTemplate.success([
    { stage: '邮件发送', count: 10000, rate: 100 },
    { stage: '邮件打开', count: 3250, rate: 32.5 },
    { stage: '链接点击', count: 870, rate: 8.7 },
    { stage: '页面访问', count: 652, rate: 6.52 },
    { stage: '询盘提交', count: 156, rate: 1.56 },
    { stage: '成交转化', count: 28, rate: 0.28 }
  ])
})

// 获取热门产品数据
Mock.mock('/api/dashboard/top-products', 'get', () => {
  return Mock.responseTemplate.success(
    Mock.mock({
      'list|10': [{
        name: '@ctitle(3, 8)',
        clicks: '@integer(400, 1500)',
        conversions: '@integer(15, 100)',
        rate: function() {
          return (this.conversions / this.clicks * 100).toFixed(1)
        }
      }]
    }).list
  )
})

// 获取客户增长数据
Mock.mock('/api/dashboard/customer-growth', 'get', (options) => {
  const query = Mock.parseQuery(options.url)
  const months = parseInt(query.months) || 12
  
  const data = []
  let totalCustomers = 5000
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const newCustomers = Mock.mock('@integer(200, 500)')
    totalCustomers += newCustomers
    
    data.push({
      month: date.toISOString().slice(0, 7),
      newCustomers,
      totalCustomers
    })
  }
  
  return Mock.responseTemplate.success(data)
})

// 获取AI建议
Mock.mock('/api/dashboard/ai-suggestions', 'get', () => {
  return Mock.responseTemplate.success(
    Mock.mock({
      'list|6': [{
        id: '@id',
        type: '@pick(["customer", "timing", "content", "product", "automation", "segmentation"])',
        title: '@ctitle(6, 12)',
        description: '@cparagraph(1, 2)',
        action: '@pick(["查看详情", "应用建议", "查看示例", "创建流程", "查看分群"])',
        priority: '@pick(["high", "medium", "low"])',
        icon: '@pick(["User", "Clock", "EditPen", "Star", "Setting", "CollectionTag"])',
        'metrics|2': [{
          label: '@pick(["预期价值", "转化率", "提升幅度", "节省时间", "覆盖用户"])',
          value: '@pick(["$2.5K", "65%", "+32%", "8h/周", "2.1K"])'
        }]
      }]
    }).list
  )
})

// 获取实时数据
Mock.mock('/api/dashboard/realtime', 'get', () => {
  return Mock.responseTemplate.success({
    onlineUsers: Mock.mock('@integer(50, 200)'),
    emailsSent: Mock.mock('@integer(5, 50)'),
    clicks: Mock.mock('@integer(1, 20)'),
    conversions: Mock.mock('@integer(0, 8)')
  })
})