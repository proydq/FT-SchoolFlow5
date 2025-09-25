import Mock from 'mockjs'

// 邮件追踪数据
Mock.mock('/api/tracking/email', 'get', (options) => {
  const query = Mock.parseQuery(options.url)
  const startDate = query.startDate
  const endDate = query.endDate
  const campaignId = query.campaignId
  
  return Mock.responseTemplate.success({
    summary: {
      totalSent: Mock.mock('@integer(8000, 15000)'),
      totalOpened: Mock.mock('@integer(3000, 8000)'),
      totalClicked: Mock.mock('@integer(500, 2000)'),
      totalBounced: Mock.mock('@integer(50, 200)'),
      totalUnsubscribed: Mock.mock('@integer(10, 50)'),
      openRate: Mock.mock('@float(25, 55, 1, 1)'),
      clickRate: Mock.mock('@float(5, 20, 1, 1)'),
      bounceRate: Mock.mock('@float(0.5, 3, 1, 1)'),
      unsubscribeRate: Mock.mock('@float(0.1, 1, 1, 1)')
    },
    timeline: Mock.mock({
      'data|30': [{
        date: function() {
          const d = new Date()
          d.setDate(d.getDate() - Mock.mock('@integer(0, 29)'))
          return d.toISOString().split('T')[0]
        },
        sent: '@integer(200, 500)',
        opened: '@integer(50, 250)',
        clicked: '@integer(10, 80)',
        bounced: '@integer(0, 10)',
        unsubscribed: '@integer(0, 3)'
      }]
    }).data,
    campaigns: Mock.mock({
      'list|5-10': [{
        id: '@id',
        name: '@ctitle(5, 15)',
        sent: '@integer(1000, 5000)',
        opened: '@integer(300, 2500)',
        clicked: '@integer(50, 500)',
        openRate: '@float(20, 60, 1, 1)',
        clickRate: '@float(3, 20, 1, 1)',
        status: '@pick(["completed", "running", "scheduled"])'
      }]
    }).list,
    devices: {
      desktop: Mock.mock('@integer(30, 50)'),
      mobile: Mock.mock('@integer(35, 55)'),
      tablet: Mock.mock('@integer(5, 15)')
    },
    topLinks: Mock.mock({
      'list|5-8': [{
        url: '@url',
        clicks: '@integer(50, 500)',
        uniqueClicks: '@integer(30, 400)',
        clickRate: '@float(1, 10, 1, 1)'
      }]
    }).list
  })
})

// 网站追踪配置
Mock.mock('/api/tracking/website/setup', 'post', (options) => {
  const { domain } = Mock.parseBody(options.body)
  
  const trackingId = Mock.mock('@guid')
  const scriptCode = `<!-- Marketing Tracking Code -->
<script>
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://tracking.marketing-system.com/track.js?id='+i+dl;
  f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','${trackingId}');
</script>
<!-- End Marketing Tracking Code -->`
  
  return Mock.responseTemplate.success({
    trackingId,
    domain,
    scriptCode,
    status: 'active',
    createdAt: new Date().toISOString()
  }, '配置成功')
})

// 网站追踪数据
Mock.mock('/api/tracking/website', 'get', (options) => {
  const query = Mock.parseQuery(options.url)
  const startDate = query.startDate
  const endDate = query.endDate
  
  return Mock.responseTemplate.success({
    visits: {
      totalVisits: Mock.mock('@integer(10000, 50000)'),
      uniqueVisitors: Mock.mock('@integer(5000, 30000)'),
      pageViews: Mock.mock('@integer(30000, 150000)'),
      avgDuration: Mock.mock('@integer(60, 300)'),
      bounceRate: Mock.mock('@float(20, 60, 1, 1)'),
      conversionRate: Mock.mock('@float(1, 10, 1, 1)')
    },
    topPages: Mock.mock({
      'list|10': [{
        path: function() {
          const paths = ['/', '/products', '/about', '/contact', '/blog', '/services', '/pricing']
          return Mock.mock(`@pick([${paths.map(p => `"${p}"`).join(',')}])`)
        },
        views: '@integer(500, 10000)',
        uniqueViews: '@integer(300, 8000)',
        avgDuration: '@integer(30, 300)',
        bounceRate: '@float(10, 70, 1, 1)',
        exitRate: '@float(10, 50, 1, 1)'
      }]
    }).list,
    sources: {
      direct: Mock.mock('@integer(20, 40)'),
      organic: Mock.mock('@integer(25, 35)'),
      social: Mock.mock('@integer(15, 25)'),
      referral: Mock.mock('@integer(10, 20)'),
      email: Mock.mock('@integer(5, 15)'),
      paid: Mock.mock('@integer(5, 10)')
    },
    conversions: Mock.mock({
      'list|5': [{
        goal: '@pick(["注册", "下载", "购买", "咨询", "订阅"])',
        count: '@integer(50, 1000)',
        rate: '@float(0.5, 8, 1, 1)',
        value: '@float(1000, 50000, 2, 2)'
      }]
    }).list,
    userFlow: Mock.mock({
      'list|5-8': [{
        step: '@integer(1, 8)',
        page: '@pick(["/", "/products", "/cart", "/checkout", "/success"])',
        users: '@integer(100, 5000)',
        dropoff: '@float(5, 30, 1, 1)'
      }]
    }).list,
    heatmapData: {
      clicks: Mock.mock({
        'list|20-30': [{
          x: '@float(0, 100, 1, 1)',
          y: '@float(0, 100, 1, 1)',
          count: '@integer(1, 100)'
        }]
      }).list,
      scrollDepth: {
        '25%': Mock.mock('@integer(70, 95)'),
        '50%': Mock.mock('@integer(50, 80)'),
        '75%': Mock.mock('@integer(30, 60)'),
        '100%': Mock.mock('@integer(10, 40)')
      }
    }
  })
})

// 转化漏斗数据
Mock.mock('/api/tracking/funnel', 'get', (options) => {
  const query = Mock.parseQuery(options.url)
  const funnelId = query.funnelId
  
  return Mock.responseTemplate.success({
    funnelId: funnelId || Mock.mock('@id'),
    name: Mock.mock('@ctitle(5, 12)'),
    steps: [
      { name: '访问网站', users: 10000, rate: 100 },
      { name: '浏览产品', users: 6500, rate: 65 },
      { name: '加入购物车', users: 2600, rate: 26 },
      { name: '开始结账', users: 1560, rate: 15.6 },
      { name: '填写信息', users: 1248, rate: 12.48 },
      { name: '确认订单', users: 936, rate: 9.36 },
      { name: '支付成功', users: 780, rate: 7.8 }
    ],
    conversionRate: 7.8,
    avgTimeToConvert: Mock.mock('@integer(300, 3600)'),
    dropoffAnalysis: Mock.mock({
      'list|6': [{
        step: '@pick(["访问->浏览", "浏览->购物车", "购物车->结账", "结账->信息", "信息->确认", "确认->支付"])',
        dropoffRate: '@float(10, 40, 1, 1)',
        reasons: {
          'list|3-5': ['@cparagraph(1, 1)']
        }
      }]
    }).list,
    optimization: Mock.mock({
      'list|3-5': [{
        step: '@pick(["浏览产品", "加入购物车", "开始结账", "填写信息"])',
        suggestion: '@cparagraph(1, 2)',
        expectedImprovement: '@float(5, 25, 1, 1)',
        priority: '@pick(["high", "medium", "low"])'
      }]
    }).list
  })
})

// 行为追踪
Mock.mock('/api/tracking/behavior', 'get', (options) => {
  const query = Mock.parseQuery(options.url)
  const userId = query.userId
  
  return Mock.responseTemplate.success({
    userId: userId || Mock.mock('@id'),
    sessions: Mock.mock({
      'list|5-10': [{
        sessionId: '@id',
        startTime: '@datetime',
        duration: '@integer(60, 1800)',
        pages: '@integer(1, 20)',
        events: '@integer(5, 50)',
        device: '@pick(["desktop", "mobile", "tablet"])',
        browser: '@pick(["Chrome", "Firefox", "Safari", "Edge"])',
        location: '@city',
        referrer: '@url'
      }]
    }).list,
    events: Mock.mock({
      'list|20-30': [{
        eventId: '@id',
        type: '@pick(["pageview", "click", "scroll", "form_submit", "video_play", "download"])',
        page: '@url',
        element: '@pick(["button", "link", "form", "video", "image"])',
        value: '@word(3, 8)',
        timestamp: '@datetime'
      }]
    }).list,
    patterns: Mock.mock({
      'list|3-5': [{
        pattern: '@pick(["频繁访问产品页", "多次查看价格", "重复访问购物车", "浏览竞品对比"])',
        frequency: '@integer(3, 20)',
        lastOccurrence: '@datetime',
        significance: '@pick(["high", "medium", "low"])'
      }]
    }).list,
    score: {
      engagement: Mock.mock('@float(30, 90, 1, 1)'),
      interest: Mock.mock('@float(40, 95, 1, 1)'),
      likelihood: Mock.mock('@float(20, 80, 1, 1)')
    }
  })
})

// 追踪数据上报
Mock.mock('/api/tracking/track', 'post', (options) => {
  const trackData = Mock.parseBody(options.body)
  
  return Mock.responseTemplate.success({
    trackId: Mock.mock('@id'),
    received: true,
    timestamp: new Date().toISOString()
  }, '追踪成功')
})

// A/B测试追踪
Mock.mock('/api/tracking/abtest', 'get', (options) => {
  const query = Mock.parseQuery(options.url)
  const testId = query.testId
  
  return Mock.responseTemplate.success({
    testId: testId || Mock.mock('@id'),
    name: Mock.mock('@ctitle(5, 15)'),
    status: Mock.mock('@pick(["running", "completed", "paused"])'),
    variants: Mock.mock({
      'list|2-4': [{
        id: '@id',
        name: '@pick(["版本A", "版本B", "版本C", "版本D"])',
        traffic: '@integer(20, 50)',
        visitors: '@integer(1000, 5000)',
        conversions: '@integer(50, 500)',
        conversionRate: '@float(2, 15, 2, 2)',
        confidence: '@float(60, 99, 1, 1)',
        improvement: '@float(-10, 30, 1, 1)'
      }]
    }).list,
    winner: Mock.mock('@pick(["版本A", "版本B", "尚无明显优胜者"])'),
    duration: Mock.mock('@integer(1, 30)'),
    sampleSize: Mock.mock('@integer(5000, 20000)'),
    statisticalSignificance: Mock.mock('@float(85, 99, 1, 1)')
  })
})