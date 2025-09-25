import Mock from 'mockjs'

// AI内容生成
Mock.mock('/api/ai/generate-content', 'post', (options) => {
  const { type, topic, keywords, tone, length } = Mock.parseBody(options.body)
  
  const content = Mock.mock({
    title: '@ctitle(10, 30)',
    content: '@cparagraph(5, 10)',
    summary: '@cparagraph(1, 2)',
    keywords: keywords || ['营销', '推广', '品牌', '客户', '增长'],
    suggestions: Mock.mock({
      'list|3-5': ['@ctitle(8, 20)']
    }).list,
    variants: Mock.mock({
      'list|2-3': [{
        title: '@ctitle(10, 30)',
        content: '@cparagraph(5, 10)'
      }]
    }).list,
    score: '@float(70, 95, 1, 1)',
    readingTime: '@integer(2, 10)',
    seoScore: '@float(60, 90, 1, 1)'
  })
  
  return Mock.responseTemplate.success(content, '内容生成成功')
})

// AI邮件模板生成
Mock.mock('/api/ai/generate-email-template', 'post', (options) => {
  const { purpose, audience, product, tone } = Mock.parseBody(options.body)
  
  return Mock.responseTemplate.success({
    subject: Mock.mock('@ctitle(8, 20)'),
    preheader: Mock.mock('@ctitle(10, 30)'),
    body: {
      greeting: '尊敬的客户',
      introduction: Mock.mock('@cparagraph(1, 2)'),
      mainContent: Mock.mock('@cparagraph(3, 5)'),
      callToAction: Mock.mock('@pick(["立即购买", "了解更多", "限时优惠", "马上体验"])'),
      closing: Mock.mock('@cparagraph(1, 1)'),
      signature: '营销团队'
    },
    htmlTemplate: '<html>...</html>',
    textTemplate: 'Plain text version...',
    personalizationTags: ['{{firstName}}', '{{company}}', '{{product}}'],
    estimatedOpenRate: Mock.mock('@float(25, 45, 1, 1)'),
    estimatedClickRate: Mock.mock('@float(5, 15, 1, 1)'),
    variants: Mock.mock({
      'list|2-3': [{
        subject: '@ctitle(8, 20)',
        body: '@cparagraph(3, 5)'
      }]
    }).list
  }, '邮件模板生成成功')
})

// AI社媒话术生成
Mock.mock('/api/ai/generate-social-content', 'post', (options) => {
  const { platform, topic, hashtags, length } = Mock.parseBody(options.body)
  
  const platformLimits = {
    twitter: 280,
    facebook: 5000,
    instagram: 2200,
    linkedin: 3000
  }
  
  return Mock.responseTemplate.success({
    platform,
    content: Mock.mock('@cparagraph(1, 3)'),
    hashtags: hashtags || Mock.mock({
      'list|3-6': ['#@word(4, 10)']
    }).list,
    emojis: Mock.mock({
      'list|2-5': ['@pick(["🎯", "🚀", "💡", "🌟", "📈", "🎉", "👍", "💪"])']
    }).list,
    characterCount: Mock.mock(`@integer(100, ${platformLimits[platform] || 1000})`),
    engagementPrediction: {
      likes: Mock.mock('@integer(50, 500)'),
      shares: Mock.mock('@integer(10, 100)'),
      comments: Mock.mock('@integer(5, 50)')
    },
    bestPostingTime: Mock.mock('@pick(["09:00", "12:00", "18:00", "20:00"])'),
    variants: Mock.mock({
      'list|2-3': [{
        content: '@cparagraph(1, 2)',
        hashtags: {
          'list|3-5': ['#@word(4, 10)']
        }
      }]
    }).list
  }, '社媒内容生成成功')
})

// AI多语言翻译
Mock.mock('/api/ai/translate', 'post', (options) => {
  const { text, sourceLang, targetLangs } = Mock.parseBody(options.body)
  
  const translations = {}
  targetLangs.forEach(lang => {
    translations[lang] = {
      text: Mock.mock('@paragraph(3, 8)'),
      confidence: Mock.mock('@float(85, 99, 1, 1)'),
      alternatives: Mock.mock({
        'list|1-2': ['@paragraph(3, 8)']
      }).list
    }
  })
  
  return Mock.responseTemplate.success({
    original: text,
    sourceLang,
    translations,
    glossary: Mock.mock({
      'list|3-5': [{
        term: '@word(3, 8)',
        translation: '@cword(2, 4)',
        context: '@sentence(5, 10)'
      }]
    }).list
  }, '翻译完成')
})

// AI智能推荐
Mock.mock('/api/ai/recommend', 'post', (options) => {
  const { type, context, userId } = Mock.parseBody(options.body)
  
  const recommendations = {
    products: Mock.mock({
      'list|5-10': [{
        id: '@id',
        name: '@ctitle(5, 15)',
        reason: '@cparagraph(1, 2)',
        score: '@float(70, 95, 1, 1)',
        price: '@float(10, 1000, 2, 2)',
        image: '@image("200x200")'
      }]
    }).list,
    customers: Mock.mock({
      'list|5-10': [{
        id: '@id',
        name: '@cname',
        company: '@ctitle(3, 8)',
        reason: '@cparagraph(1, 2)',
        score: '@float(70, 95, 1, 1)',
        value: '@float(1000, 50000, 2, 2)'
      }]
    }).list,
    campaigns: Mock.mock({
      'list|3-5': [{
        id: '@id',
        name: '@ctitle(5, 12)',
        type: '@pick(["email", "social", "whatsapp"])',
        reason: '@cparagraph(1, 2)',
        expectedROI: '@float(150, 500, 1, 1)',
        confidence: '@float(70, 90, 1, 1)'
      }]
    }).list,
    content: Mock.mock({
      'list|3-5': [{
        id: '@id',
        title: '@ctitle(8, 20)',
        type: '@pick(["article", "video", "infographic"])',
        topic: '@ctitle(3, 8)',
        reason: '@cparagraph(1, 2)',
        engagementScore: '@float(60, 90, 1, 1)'
      }]
    }).list
  }
  
  return Mock.responseTemplate.success({
    type,
    recommendations: recommendations[type] || recommendations.products,
    totalCount: Mock.mock('@integer(20, 100)'),
    timestamp: new Date().toISOString()
  }, '推荐生成成功')
})

// AI营销建议
Mock.mock('/api/ai/marketing-suggestions', 'get', () => {
  return Mock.responseTemplate.success(
    Mock.mock({
      'list|5-8': [{
        id: '@id',
        category: '@pick(["content", "timing", "audience", "channel", "budget"])',
        title: '@ctitle(8, 20)',
        description: '@cparagraph(2, 4)',
        impact: '@pick(["high", "medium", "low"])',
        effort: '@pick(["high", "medium", "low"])',
        expectedResult: '@cparagraph(1, 2)',
        metrics: {
          expectedIncrease: '@float(10, 50, 1, 1)',
          timeToResult: '@integer(7, 90)',
          confidence: '@float(60, 90, 1, 1)'
        },
        actions: Mock.mock({
          'list|2-4': ['@ctitle(5, 15)']
        }).list,
        resources: Mock.mock({
          'list|2-3': [{
            type: '@pick(["article", "video", "tool", "template"])',
            title: '@ctitle(5, 15)',
            url: '@url'
          }]
        }).list,
        priority: '@integer(1, 5)',
        createdAt: '@datetime'
      }]
    }).list
  )
})

// AI对话助手
Mock.mock('/api/ai/chat', 'post', (options) => {
  const { message, context, sessionId } = Mock.parseBody(options.body)
  
  return Mock.responseTemplate.success({
    sessionId: sessionId || Mock.mock('@id'),
    reply: Mock.mock('@cparagraph(2, 5)'),
    suggestions: Mock.mock({
      'list|2-4': ['@ctitle(5, 15)']
    }).list,
    relatedTopics: Mock.mock({
      'list|3-5': [{
        topic: '@ctitle(3, 8)',
        url: '@url'
      }]
    }).list,
    confidence: Mock.mock('@float(70, 95, 1, 1)'),
    timestamp: new Date().toISOString()
  }, '回复生成成功')
})

// AI分析报告
Mock.mock('/api/ai/analysis-report', 'post', (options) => {
  const { type, dateRange, metrics } = Mock.parseBody(options.body)
  
  return Mock.responseTemplate.success({
    type,
    dateRange,
    summary: {
      title: Mock.mock('@ctitle(10, 20)'),
      description: Mock.mock('@cparagraph(3, 5)'),
      keyFindings: Mock.mock({
        'list|3-5': ['@cparagraph(1, 2)']
      }).list,
      score: Mock.mock('@float(60, 90, 1, 1)')
    },
    insights: Mock.mock({
      'list|5-8': [{
        category: '@pick(["performance", "opportunity", "risk", "trend"])',
        title: '@ctitle(8, 15)',
        description: '@cparagraph(2, 3)',
        impact: '@pick(["high", "medium", "low"])',
        recommendation: '@cparagraph(1, 2)',
        metrics: {
          current: '@float(10, 100, 1, 1)',
          target: '@float(50, 150, 1, 1)',
          change: '@float(-20, 50, 1, 1)'
        }
      }]
    }).list,
    predictions: Mock.mock({
      'list|3-5': [{
        metric: '@pick(["revenue", "customers", "engagement", "conversion"])',
        current: '@float(1000, 10000, 2, 2)',
        predicted: '@float(1500, 15000, 2, 2)',
        confidence: '@float(60, 90, 1, 1)',
        factors: {
          'list|2-3': ['@ctitle(5, 10)']
        }
      }]
    }).list,
    recommendations: Mock.mock({
      'list|5-7': [{
        priority: '@pick(["critical", "high", "medium", "low"])',
        action: '@ctitle(8, 20)',
        reason: '@cparagraph(1, 2)',
        expectedImpact: '@cparagraph(1, 1)',
        timeframe: '@pick(["immediate", "1 week", "1 month", "3 months"])'
      }]
    }).list,
    generatedAt: new Date().toISOString()
  }, '分析报告生成成功')
})