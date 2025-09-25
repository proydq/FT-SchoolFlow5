import Mock from 'mockjs'

// 营销总览报表
Mock.mock('/api/reports/overview', 'get', (options) => {
  const query = Mock.parseQuery(options.url)
  const period = query.period || '7days'
  
  return Mock.responseTemplate.success({
    period,
    summary: {
      totalRevenue: Mock.mock('@float(50000, 500000, 2, 2)'),
      totalOrders: Mock.mock('@integer(500, 5000)'),
      totalCustomers: Mock.mock('@integer(1000, 10000)'),
      avgOrderValue: Mock.mock('@float(50, 500, 2, 2)'),
      conversionRate: Mock.mock('@float(1, 10, 2, 2)'),
      growthRate: Mock.mock('@float(-10, 30, 1, 1)')
    },
    trends: Mock.mock({
      'data|30': [{
        date: function() {
          const d = new Date()
          d.setDate(d.getDate() - Mock.mock('@integer(0, 29)'))
          return d.toISOString().split('T')[0]
        },
        revenue: '@float(1000, 20000, 2, 2)',
        orders: '@integer(10, 200)',
        customers: '@integer(20, 300)',
        conversion: '@float(1, 8, 2, 2)'
      }]
    }).data,
    channels: Mock.mock({
      'list|4-6': [{
        channel: '@pick(["Email", "Social", "WhatsApp", "SMS", "Direct"])',
        revenue: '@float(5000, 100000, 2, 2)',
        orders: '@integer(50, 1000)',
        customers: '@integer(100, 2000)',
        roi: '@float(100, 500, 1, 1)',
        percentage: '@float(10, 40, 1, 1)'
      }]
    }).list,
    products: Mock.mock({
      'list|10': [{
        id: '@id',
        name: '@ctitle(5, 15)',
        sales: '@integer(50, 1000)',
        revenue: '@float(1000, 50000, 2, 2)',
        units: '@integer(100, 2000)',
        growth: '@float(-20, 50, 1, 1)'
      }]
    }).list,
    regions: Mock.mock({
      'list|5-8': [{
        region: '@pick(["北美", "欧洲", "亚太", "中东", "南美", "非洲"])',
        revenue: '@float(5000, 150000, 2, 2)',
        customers: '@integer(100, 3000)',
        growth: '@float(-10, 40, 1, 1)',
        marketShare: '@float(5, 35, 1, 1)'
      }]
    }).list
  })
})

// 客户分析报表
Mock.mock('/api/reports/customer-analysis', 'get', (options) => {
  const query = Mock.parseQuery(options.url)
  
  return Mock.responseTemplate.success({
    overview: {
      totalCustomers: Mock.mock('@integer(8000, 15000)'),
      newCustomers: Mock.mock('@integer(500, 2000)'),
      activeCustomers: Mock.mock('@integer(3000, 8000)'),
      churnRate: Mock.mock('@float(2, 10, 1, 1)'),
      lifetimeValue: Mock.mock('@float(500, 5000, 2, 2)'),
      retentionRate: Mock.mock('@float(70, 95, 1, 1)')
    },
    segments: Mock.mock({
      'list|5-8': [{
        name: '@pick(["VIP客户", "新客户", "活跃客户", "沉睡客户", "流失风险"])',
        count: '@integer(500, 3000)',
        percentage: '@float(5, 30, 1, 1)',
        avgValue: '@float(100, 2000, 2, 2)',
        growth: '@float(-10, 30, 1, 1)',
        characteristics: {
          'list|3': ['@cparagraph(1, 1)']
        }
      }]
    }).list,
    cohortAnalysis: Mock.mock({
      'data|12': [{
        cohort: function() {
          const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
          return months[Mock.mock('@integer(0, 11)')]
        },
        'retention|12': ['@float(30, 100, 1, 1)']
      }]
    }).data,
    rfm: {
      recency: Mock.mock({
        'list|5': [{
          segment: '@pick(["0-30天", "31-60天", "61-90天", "91-180天", ">180天"])',
          count: '@integer(500, 2000)',
          percentage: '@float(10, 30, 1, 1)'
        }]
      }).list,
      frequency: Mock.mock({
        'list|5': [{
          segment: '@pick(["1次", "2-3次", "4-5次", "6-10次", ">10次"])',
          count: '@integer(300, 2500)',
          percentage: '@float(10, 35, 1, 1)'
        }]
      }).list,
      monetary: Mock.mock({
        'list|5': [{
          segment: '@pick(["<$100", "$100-500", "$500-1000", "$1000-5000", ">$5000"])',
          count: '@integer(200, 3000)',
          percentage: '@float(5, 40, 1, 1)'
        }]
      }).list
    }
  })
})

// 自定义报表
Mock.mock('/api/reports/custom', 'post', (options) => {
  const { metrics, dimensions, filters, dateRange } = Mock.parseBody(options.body)
  
  const data = []
  for (let i = 0; i < 50; i++) {
    const row = {}
    dimensions.forEach(dim => {
      row[dim] = Mock.mock('@ctitle(3, 8)')
    })
    metrics.forEach(metric => {
      row[metric] = Mock.mock('@float(10, 10000, 2, 2)')
    })
    data.push(row)
  }
  
  return Mock.responseTemplate.success({
    query: { metrics, dimensions, filters, dateRange },
    data,
    total: data.length,
    executionTime: Mock.mock('@integer(100, 2000)'),
    cacheHit: Mock.mock('@boolean')
  })
})

// 报表模板
Mock.mock('/api/reports/templates', 'get', () => {
  return Mock.responseTemplate.success(
    Mock.mock({
      'list|10-15': [{
        id: '@id',
        name: '@ctitle(5, 12)',
        description: '@cparagraph(1, 2)',
        category: '@pick(["销售", "营销", "客户", "产品", "财务"])',
        metrics: {
          'list|3-5': ['@pick(["revenue", "orders", "customers", "conversion", "roi"])']
        },
        dimensions: {
          'list|2-3': ['@pick(["date", "channel", "product", "region", "segment"])']
        },
        schedule: '@pick(["daily", "weekly", "monthly", ""])',
        recipients: {
          'list|1-3': ['@email']
        },
        lastRun: '@datetime',
        createdAt: '@datetime'
      }]
    }).list
  )
})

// 导出报表
Mock.mock('/api/reports/export', 'post', (options) => {
  const { format, reportId } = Mock.parseBody(options.body)
  
  return Mock.responseTemplate.success({
    reportId: reportId || Mock.mock('@id'),
    format,
    filename: Mock.mock('@word(5, 10)') + '.' + format,
    size: Mock.mock('@integer(1024, 10485760)'),
    url: Mock.mock('@url'),
    expiresAt: new Date(Date.now() + 3600000).toISOString()
  }, '报表导出成功')
})

// 报表调度
Mock.mock('/api/reports/schedule', 'post', (options) => {
  const scheduleData = Mock.parseBody(options.body)
  
  return Mock.responseTemplate.success({
    id: Mock.mock('@id'),
    ...scheduleData,
    status: 'active',
    nextRun: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date().toISOString()
  }, '调度创建成功')
})

// 报表历史
Mock.mock('/api/reports/history', 'get', () => {
  return Mock.responseTemplate.success(
    Mock.mock({
      'list|20': [{
        id: '@id',
        reportName: '@ctitle(5, 12)',
        type: '@pick(["overview", "customer", "product", "campaign", "custom"])',
        generatedBy: '@cname',
        generatedAt: '@datetime',
        format: '@pick(["PDF", "Excel", "CSV", "JSON"])',
        size: '@integer(1024, 5242880)',
        status: '@pick(["completed", "processing", "failed"])',
        downloadUrl: '@url'
      }]
    }).list
  )
})

// 实时仪表板数据
Mock.mock('/api/reports/realtime', 'get', () => {
  return Mock.responseTemplate.success({
    timestamp: new Date().toISOString(),
    metrics: {
      activeUsers: Mock.mock('@integer(50, 500)'),
      pageViews: Mock.mock('@integer(100, 2000)'),
      transactions: Mock.mock('@integer(0, 50)'),
      revenue: Mock.mock('@float(0, 10000, 2, 2)'),
      avgSessionDuration: Mock.mock('@integer(60, 600)'),
      bounceRate: Mock.mock('@float(20, 60, 1, 1)')
    },
    activities: Mock.mock({
      'list|10': [{
        user: '@cname',
        action: '@pick(["viewed_product", "added_to_cart", "completed_purchase", "signed_up"])',
        details: '@ctitle(5, 15)',
        timestamp: function() {
          return new Date(Date.now() - Mock.mock('@integer(0, 3600000)')).toISOString()
        }
      }]
    }).list,
    topPages: Mock.mock({
      'list|5': [{
        path: '@pick(["/", "/products", "/cart", "/checkout", "/account"])',
        views: '@integer(10, 200)',
        users: '@integer(5, 100)'
      }]
    }).list,
    topProducts: Mock.mock({
      'list|5': [{
        name: '@ctitle(3, 8)',
        views: '@integer(20, 300)',
        addedToCart: '@integer(5, 50)',
        purchased: '@integer(0, 20)'
      }]
    }).list
  })
})