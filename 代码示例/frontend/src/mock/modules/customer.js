import Mock from 'mockjs'

// 生成客户模拟数据
const generateCustomers = (count = 100) => {
  return Mock.mock({
    [`list|${count}`]: [{
      id: '@id',
      name: '@cname',
      nameEn: '@name',
      email: '@email',
      phone: /1[3-9]\d{9}/,
      company: '@ctitle(3, 10) + 公司',
      companyEn: '@title(2, 5) + Company',
      industry: '@pick(["制造业", "贸易", "科技", "服务业", "金融", "教育", "医疗", "房地产"])',
      country: '@pick(["美国", "英国", "德国", "法国", "日本", "韩国", "澳大利亚", "加拿大", "意大利", "西班牙"])',
      city: '@city',
      address: '@county(true)',
      website: '@url',
      avatar: '@image("80x80", "@color", "#FFF", "png", "@first")',
      status: '@pick(["active", "inactive", "potential", "blacklist"])',
      source: '@pick(["官网", "广告", "推荐", "展会", "社媒", "搜索引擎"])',
      tags: function() {
        const allTags = ['VIP', '高价值', '新客户', '老客户', '活跃', '沉睡', '意向高', '预算充足']
        const count = Mock.mock('@integer(1, 3)')
        return Mock.mock(`@pick([${allTags.map(t => `"${t}"`).join(',')}])`).split(',').slice(0, count)
      },
      totalOrders: '@integer(0, 50)',
      totalAmount: '@float(0, 100000, 2, 2)',
      lastContactAt: '@datetime',
      lastOrderAt: '@datetime',
      createdAt: '@datetime',
      updatedAt: '@datetime',
      // 详细信息
      birthday: '@date',
      gender: '@pick(["male", "female", ""])',
      position: '@pick(["CEO", "CTO", "市场总监", "采购经理", "销售经理", "运营主管"])',
      interests: function() {
        const allInterests = ['科技产品', '时尚服装', '家居用品', '运动健身', '旅游', '美食', '汽车', '数码产品']
        return Mock.mock('@shuffle').slice(0, Mock.mock('@integer(1, 4)'))
      },
      socialMedia: {
        facebook: '@url("facebook")',
        linkedin: '@url("linkedin")', 
        twitter: '@url("twitter")',
        wechat: /^[a-zA-Z][a-zA-Z\d_-]{5,19}$/
      },
      preferences: {
        contactMethod: '@pick(["email", "phone", "wechat", "facebook"])',
        contactTime: '@pick(["morning", "afternoon", "evening"])',
        language: '@pick(["zh-CN", "en-US", "ja-JP", "ko-KR", "de-DE"])'
      }
    }]
  }).list
}

// 客户列表
Mock.mock(/\/api\/customers(\?.*)?/, 'get', (options) => {
  const query = Mock.parseQuery(options.url)
  const page = parseInt(query.page) || 1
  const size = parseInt(query.size) || 20
  const status = query.status
  const source = query.source
  const keyword = query.keyword
  const country = query.country
  
  let allCustomers = generateCustomers(500)
  
  // 筛选逻辑
  if (status) {
    allCustomers = allCustomers.filter(c => c.status === status)
  }
  if (source) {
    allCustomers = allCustomers.filter(c => c.source === source)
  }
  if (country) {
    allCustomers = allCustomers.filter(c => c.country === country)
  }
  if (keyword) {
    allCustomers = allCustomers.filter(c => 
      c.name.includes(keyword) || 
      c.email.includes(keyword) ||
      c.company.includes(keyword) ||
      c.nameEn.toLowerCase().includes(keyword.toLowerCase())
    )
  }
  
  const total = allCustomers.length
  const start = (page - 1) * size
  const list = allCustomers.slice(start, start + size)
  
  return Mock.pageTemplate(list, total, page, size)
})

// 获取客户详情
Mock.mock(/\/api\/customers\/(\d+)/, 'get', (options) => {
  const id = options.url.match(/\/api\/customers\/(\d+)/)[1]
  const customer = generateCustomers(1)[0]
  customer.id = id
  
  // 添加详细的行为数据
  customer.behaviors = Mock.mock({
    'emailStats': {
      sent: '@integer(50, 500)',
      opened: '@integer(20, 300)',
      clicked: '@integer(5, 100)',
      openRate: '@float(20, 80, 1, 1)',
      clickRate: '@float(5, 30, 1, 1)'
    },
    'websiteStats': {
      visits: '@integer(10, 200)',
      pageViews: '@integer(50, 1000)',
      avgDuration: '@integer(60, 600)',
      bounceRate: '@float(20, 80, 1, 1)'
    },
    'orderHistory|10-30': [{
      id: '@id',
      orderNo: /ORD\d{10}/,
      amount: '@float(100, 5000, 2, 2)',
      currency: '@pick(["USD", "EUR", "GBP"])',
      status: '@pick(["pending", "paid", "shipped", "delivered", "refunded"])',
      products: function() {
        return Mock.mock({
          'list|1-3': [{
            name: '@ctitle(3, 8)',
            quantity: '@integer(1, 5)',
            price: '@float(50, 1000, 2, 2)'
          }]
        }).list
      },
      createdAt: '@datetime'
    }],
    'contactHistory|5-15': [{
      id: '@id',
      type: '@pick(["email", "phone", "meeting", "wechat"])',
      subject: '@ctitle(5, 15)',
      content: '@cparagraph(1, 3)',
      result: '@pick(["successful", "failed", "pending"])',
      createdAt: '@datetime',
      createdBy: '@cname'
    }]
  })
  
  return Mock.responseTemplate.success(customer)
})

// 创建客户
Mock.mock('/api/customers', 'post', (options) => {
  const customerData = Mock.parseBody(options.body)
  return Mock.responseTemplate.success({
    id: Mock.mock('@id'),
    ...customerData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }, '客户创建成功')
})

// 更新客户
Mock.mock(/\/api\/customers\/(\d+)/, 'put', (options) => {
  const id = options.url.match(/\/api\/customers\/(\d+)/)[1]
  const customerData = Mock.parseBody(options.body)
  return Mock.responseTemplate.success({
    id: id,
    ...customerData,
    updatedAt: new Date().toISOString()
  }, '客户信息更新成功')
})

// 删除客户
Mock.mock(/\/api\/customers\/(\d+)/, 'delete', () => {
  return Mock.responseTemplate.success(null, '客户删除成功')
})

// 批量操作客户
Mock.mock('/api/customers/batch', 'post', (options) => {
  const { action, ids } = Mock.parseBody(options.body)
  return Mock.responseTemplate.success({
    action,
    affectedCount: ids.length
  }, `批量${action}成功`)
})

// 客户分组列表
Mock.mock('/api/customer-groups', 'get', () => {
  return Mock.responseTemplate.success(
    Mock.mock({
      'list|8-15': [{
        id: '@id',
        name: '@ctitle(3, 8)',
        description: '@cparagraph(1, 2)',
        conditions: {
          country: '@pick(["美国", "英国", "德国", "日本", ""])',
          totalAmount: '@integer(1000, 50000)',
          orderCount: '@integer(5, 50)',
          status: '@pick(["active", "inactive", ""])'
        },
        customerCount: '@integer(10, 500)',
        createdAt: '@datetime',
        updatedAt: '@datetime'
      }]
    }).list
  )
})

// 数据导入历史
Mock.mock('/api/customers/import-history', 'get', () => {
  return Mock.responseTemplate.success(
    Mock.mock({
      'list|10-20': [{
        id: '@id',
        filename: '@word(5, 10).@pick(["xlsx", "csv", "txt"])',
        source: '@pick(["文件上传", "API同步", "CRM导入", "Excel导入"])',
        totalCount: '@integer(100, 5000)',
        successCount: '@integer(80, 4800)',
        failedCount: function() {
          return this.totalCount - this.successCount
        },
        status: '@pick(["completed", "processing", "failed"])',
        errorMessage: '@pick(["", "格式错误", "数据重复", "字段缺失"])',
        createdAt: '@datetime',
        createdBy: '@cname'
      }]
    }).list
  )
})

// 数据清洗任务
Mock.mock('/api/customers/clean-tasks', 'get', () => {
  return Mock.responseTemplate.success(
    Mock.mock({
      'list|5-10': [{
        id: '@id',
        name: '@ctitle(5, 12)',
        type: '@pick(["去重", "格式化", "补全", "验证"])',
        rules: '@cparagraph(1, 2)',
        totalCount: '@integer(1000, 10000)',
        processedCount: '@integer(800, 9500)',
        cleanedCount: '@integer(100, 2000)',
        status: '@pick(["running", "completed", "paused", "failed"])',
        progress: '@integer(0, 100)',
        startedAt: '@datetime',
        completedAt: '@datetime'
      }]
    }).list
  )
})

// 客户画像分析
Mock.mock('/api/customers/profile-analysis', 'get', () => {
  return Mock.responseTemplate.success({
    demographics: {
      ageDistribution: [
        { range: '18-25', count: 1250, percentage: 15.6 },
        { range: '26-35', count: 2800, percentage: 35.0 },
        { range: '36-45', count: 2240, percentage: 28.0 },
        { range: '46-55', count: 1360, percentage: 17.0 },
        { range: '55+', count: 350, percentage: 4.4 }
      ],
      genderDistribution: [
        { gender: '男性', count: 4200, percentage: 52.5 },
        { gender: '女性', count: 3800, percentage: 47.5 }
      ],
      countryDistribution: [
        { country: '美国', count: 2400, percentage: 30.0 },
        { country: '英国', count: 1600, percentage: 20.0 },
        { country: '德国', count: 1200, percentage: 15.0 },
        { country: '法国', count: 800, percentage: 10.0 },
        { country: '日本', count: 600, percentage: 7.5 },
        { country: '其他', count: 1400, percentage: 17.5 }
      ]
    },
    behavior: {
      purchaseFrequency: [
        { frequency: '高频(>10次/月)', count: 320, percentage: 4.0 },
        { frequency: '中频(5-10次/月)', count: 1200, percentage: 15.0 },
        { frequency: '低频(1-4次/月)', count: 3200, percentage: 40.0 },
        { frequency: '偶尔(<1次/月)', count: 3280, percentage: 41.0 }
      ],
      valueDistribution: [
        { level: '高价值(>$5000)', count: 800, percentage: 10.0 },
        { level: '中价值($1000-$5000)', count: 2400, percentage: 30.0 },
        { level: '低价值(<$1000)', count: 4800, percentage: 60.0 }
      ]
    }
  })
})