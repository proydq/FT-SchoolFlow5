import Mock from 'mockjs'

// 生成产品模拟数据
const generateProducts = (count = 50) => {
  return Mock.mock({
    [`list|${count}`]: [{
      id: '@id',
      name: '@ctitle(5, 15)',
      nameEn: '@title(3, 8)',
      category: '@pick(["电子产品", "服装配饰", "家居用品", "运动户外", "美妆个护", "食品饮料", "母婴用品", "图书文具"])',
      categoryId: '@id',
      brand: '@pick(["Apple", "Samsung", "Nike", "Adidas", "Sony", "华为", "小米", "OPPO"])',
      price: '@float(10, 1000, 2, 2)',
      currency: '@pick(["USD", "EUR", "GBP", "JPY", "CNY"])',
      description: '@cparagraph(1, 3)',
      descriptionEn: '@paragraph(1, 2)',
      images: function() {
        return Array.from({ length: Mock.mock('@integer(1, 5)') }, () => 
          Mock.mock('@image("400x400", "@color", "#FFF", "png", "@word(3,5)")')
        )
      },
      videos: function() {
        return Array.from({ length: Mock.mock('@integer(0, 2)') }, () => ({
          url: 'https://example.com/video/' + Mock.mock('@id') + '.mp4',
          thumbnail: Mock.mock('@image("400x300")')
        }))
      },
      status: '@pick(["active", "inactive", "draft"])',
      stock: '@integer(0, 1000)',
      sales: '@integer(0, 5000)',
      rating: '@float(3, 5, 1, 1)',
      reviewCount: '@integer(0, 1000)',
      tags: function() {
        return Mock.mock('@pick(["热销", "新品", "促销", "精选"])').split('')
      },
      weight: '@float(0.1, 50, 2, 2)',
      dimensions: {
        length: '@float(5, 100, 1, 1)',
        width: '@float(5, 100, 1, 1)',
        height: '@float(5, 100, 1, 1)'
      },
      createdAt: '@datetime',
      updatedAt: '@datetime',
      createdBy: '@cname',
      updatedBy: '@cname'
    }]
  }).list
}

// 产品列表
Mock.mock(/\/api\/products(\?.*)?/, 'get', (options) => {
  const query = Mock.parseQuery(options.url)
  const page = parseInt(query.page) || 1
  const size = parseInt(query.size) || 20
  const category = query.category
  const status = query.status
  const keyword = query.keyword
  
  let allProducts = generateProducts(100)
  
  // 筛选逻辑
  if (category) {
    allProducts = allProducts.filter(p => p.category === category)
  }
  if (status) {
    allProducts = allProducts.filter(p => p.status === status)
  }
  if (keyword) {
    allProducts = allProducts.filter(p => 
      p.name.includes(keyword) || 
      p.nameEn.toLowerCase().includes(keyword.toLowerCase())
    )
  }
  
  const total = allProducts.length
  const start = (page - 1) * size
  const list = allProducts.slice(start, start + size)
  
  return Mock.pageTemplate(list, total, page, size)
})

// 获取产品详情
Mock.mock(/\/api\/products\/(\d+)/, 'get', (options) => {
  const id = options.url.match(/\/api\/products\/(\d+)/)[1]
  return Mock.responseTemplate.success({
    ...generateProducts(1)[0],
    id: id,
    variants: Mock.mock({
      'list|3-8': [{
        id: '@id',
        sku: '@word(8, 12).toUpperCase()',
        color: '@color',
        size: '@pick(["S", "M", "L", "XL", "XXL"])',
        price: '@float(10, 1000, 2, 2)',
        stock: '@integer(0, 100)'
      }]
    }).list
  })
})

// 创建产品
Mock.mock('/api/products', 'post', (options) => {
  const productData = Mock.parseBody(options.body)
  return Mock.responseTemplate.success({
    id: Mock.mock('@id'),
    ...productData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }, '产品创建成功')
})

// 更新产品
Mock.mock(/\/api\/products\/(\d+)/, 'put', (options) => {
  const id = options.url.match(/\/api\/products\/(\d+)/)[1]
  const productData = Mock.parseBody(options.body)
  return Mock.responseTemplate.success({
    id: id,
    ...productData,
    updatedAt: new Date().toISOString()
  }, '产品更新成功')
})

// 删除产品
Mock.mock(/\/api\/products\/(\d+)/, 'delete', () => {
  return Mock.responseTemplate.success(null, '产品删除成功')
})

// 批量操作产品
Mock.mock('/api/products/batch', 'post', (options) => {
  const { action, ids } = Mock.parseBody(options.body)
  return Mock.responseTemplate.success({
    action,
    affectedCount: ids.length
  }, `批量${action}成功`)
})

// 产品分类列表
Mock.mock('/api/product-categories', 'get', () => {
  return Mock.responseTemplate.success(
    Mock.mock({
      'list|8-15': [{
        id: '@id',
        name: '@ctitle(2, 6)',
        nameEn: '@word(3, 8)',
        parentId: '@pick([null, "@id"])',
        sort: '@integer(1, 100)',
        productCount: '@integer(0, 500)',
        status: '@pick(["active", "inactive"])',
        createdAt: '@datetime'
      }]
    }).list
  )
})

// 产品价格管理
Mock.mock(/\/api\/products\/(\d+)\/prices/, 'get', () => {
  return Mock.responseTemplate.success(
    Mock.mock({
      'list|5-10': [{
        id: '@id',
        region: '@pick(["美国", "欧盟", "英国", "日本", "中国", "东南亚"])',
        currency: '@pick(["USD", "EUR", "GBP", "JPY", "CNY"])',
        price: '@float(10, 1000, 2, 2)',
        discountPrice: '@float(8, 800, 2, 2)',
        startDate: '@datetime',
        endDate: '@datetime("yyyy-MM-dd HH:mm:ss", "2025-12-31 23:59:59")'
      }]
    }).list
  )
})

// 产品多语言内容
Mock.mock(/\/api\/products\/(\d+)\/i18n/, 'get', () => {
  return Mock.responseTemplate.success({
    'en': {
      name: Mock.mock('@title(3, 8)'),
      description: Mock.mock('@paragraph(2, 4)')
    },
    'es': {
      name: Mock.mock('@title(3, 8)'),
      description: Mock.mock('@paragraph(2, 4)')
    },
    'fr': {
      name: Mock.mock('@title(3, 8)'),
      description: Mock.mock('@paragraph(2, 4)')
    },
    'de': {
      name: Mock.mock('@title(3, 8)'),
      description: Mock.mock('@paragraph(2, 4)')
    },
    'ja': {
      name: Mock.mock('@title(3, 8)'),
      description: Mock.mock('@paragraph(2, 4)')
    }
  })
})

// 产品媒体文件上传
Mock.mock('/api/products/media/upload', 'post', () => {
  return Mock.responseTemplate.success({
    id: Mock.mock('@id'),
    filename: Mock.mock('@word(5, 10)') + '.' + Mock.mock('@pick(["jpg", "png", "mp4", "pdf"])'),
    url: Mock.mock('@image("600x400")'),
    size: Mock.mock('@integer(1024, 10485760)'),
    type: Mock.mock('@pick(["image", "video", "document"])'),
    uploadTime: new Date().toISOString()
  }, '文件上传成功')
})