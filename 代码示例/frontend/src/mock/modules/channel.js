import Mock from 'mockjs'

// 邮件渠道配置
Mock.mock('/api/channels/email/config', 'get', () => {
  return Mock.responseTemplate.success({
    enabled: true,
    providers: Mock.mock({
      'list|2-4': [{
        id: '@id',
        name: '@pick(["SendGrid", "Mailgun", "AWS SES", "Postmark"])',
        type: '@pick(["sendgrid", "mailgun", "ses", "postmark"])',
        apiKey: /[A-Z0-9]{32}/,
        fromEmail: '@email',
        fromName: '@cname',
        dailyLimit: '@integer(5000, 50000)',
        monthlyLimit: '@integer(100000, 1000000)',
        sentToday: '@integer(0, 5000)',
        sentThisMonth: '@integer(0, 100000)',
        status: '@pick(["active", "inactive", "error"])',
        lastUsed: '@datetime',
        createdAt: '@datetime'
      }]
    }).list,
    templates: Mock.mock({
      'list|5-10': [{
        id: '@id',
        name: '@ctitle(5, 12)',
        subject: '@ctitle(8, 20)',
        content: '@cparagraph(3, 8)',
        variables: ['{{name}}', '{{company}}', '{{product}}'],
        category: '@pick(["welcome", "newsletter", "promotion", "notification"])',
        usageCount: '@integer(0, 500)',
        lastUsed: '@datetime'
      }]
    }).list,
    settings: {
      trackOpens: true,
      trackClicks: true,
      unsubscribeLink: true,
      footerText: '© 2025 营销系统',
      replyTo: 'support@example.com',
      bounceAddress: 'bounce@example.com'
    }
  })
})

// WhatsApp渠道配置
Mock.mock('/api/channels/whatsapp/config', 'get', () => {
  return Mock.responseTemplate.success({
    enabled: true,
    provider: 'twilio',
    accountSid: /AC[a-z0-9]{32}/,
    authToken: /[a-z0-9]{32}/,
    phoneNumber: '+1234567890',
    webhookUrl: 'https://api.example.com/webhooks/whatsapp',
    templates: Mock.mock({
      'list|5-8': [{
        id: '@id',
        name: '@ctitle(5, 10)',
        code: '@word(8, 12)',
        language: '@pick(["zh_CN", "en_US", "ja_JP"])',
        category: '@pick(["ACCOUNT_UPDATE", "PAYMENT_UPDATE", "SHIPPING_UPDATE", "MARKETING"])',
        status: '@pick(["approved", "pending", "rejected"])',
        content: '@cparagraph(1, 3)',
        variables: ['{{1}}', '{{2}}', '{{3}}'],
        createdAt: '@datetime'
      }]
    }).list,
    limits: {
      messagesPerDay: 1000,
      messagesPerHour: 100,
      messagesPerMinute: 10
    },
    statistics: {
      sentToday: '@integer(0, 1000)',
      deliveredToday: '@integer(0, 950)',
      readToday: '@integer(0, 800)',
      repliedToday: '@integer(0, 200)'
    }
  })
})

// 社交媒体渠道配置
Mock.mock('/api/channels/social/config', 'get', () => {
  return Mock.responseTemplate.success({
    platforms: Mock.mock({
      'list|3-5': [{
        id: '@id',
        platform: '@pick(["facebook", "twitter", "linkedin", "instagram"])',
        accountName: '@word(5, 10)',
        accountId: '@id',
        accessToken: /[A-Za-z0-9]{40,60}/,
        status: '@pick(["connected", "disconnected", "error"])',
        followers: '@integer(1000, 100000)',
        posts: '@integer(100, 5000)',
        engagement: '@float(1, 10, 1, 1)',
        lastSync: '@datetime',
        connectedAt: '@datetime'
      }]
    }).list,
    autoPost: {
      enabled: true,
      schedule: {
        monday: ['09:00', '14:00', '18:00'],
        tuesday: ['09:00', '14:00', '18:00'],
        wednesday: ['09:00', '14:00', '18:00'],
        thursday: ['09:00', '14:00', '18:00'],
        friday: ['09:00', '14:00', '18:00'],
        saturday: ['10:00', '15:00'],
        sunday: ['10:00', '15:00']
      },
      defaultHashtags: ['#marketing', '#business', '#growth', '#strategy'],
      autoReply: {
        enabled: true,
        keywords: ['info', 'price', 'contact'],
        template: '感谢您的关注，我们会尽快回复您！'
      }
    },
    statistics: {
      totalPosts: '@integer(500, 2000)',
      totalReach: '@integer(10000, 500000)',
      totalEngagement: '@integer(1000, 50000)',
      avgEngagementRate: '@float(2, 8, 1, 1)'
    }
  })
})

// 获取渠道列表
Mock.mock('/api/channels', 'get', () => {
  return Mock.responseTemplate.success([
    {
      id: '1',
      name: '邮件营销',
      type: 'email',
      icon: 'Message',
      enabled: true,
      description: '通过邮件发送营销内容',
      stats: {
        sent: Mock.mock('@integer(10000, 100000)'),
        delivered: Mock.mock('@integer(9000, 95000)'),
        opened: Mock.mock('@integer(2000, 30000)'),
        clicked: Mock.mock('@integer(200, 5000)')
      }
    },
    {
      id: '2',
      name: 'WhatsApp营销',
      type: 'whatsapp',
      icon: 'ChatDotRound',
      enabled: true,
      description: '通过WhatsApp发送即时消息',
      stats: {
        sent: Mock.mock('@integer(5000, 50000)'),
        delivered: Mock.mock('@integer(4500, 48000)'),
        read: Mock.mock('@integer(3000, 40000)'),
        replied: Mock.mock('@integer(500, 5000)')
      }
    },
    {
      id: '3',
      name: '社交媒体营销',
      type: 'social',
      icon: 'Share',
      enabled: true,
      description: '在社交媒体平台发布内容',
      stats: {
        posts: Mock.mock('@integer(500, 5000)'),
        reach: Mock.mock('@integer(10000, 500000)'),
        engagement: Mock.mock('@integer(1000, 50000)'),
        followers: Mock.mock('@integer(5000, 100000)')
      }
    },
    {
      id: '4',
      name: '短信营销',
      type: 'sms',
      icon: 'Iphone',
      enabled: false,
      description: '通过短信发送营销内容',
      stats: {
        sent: Mock.mock('@integer(5000, 30000)'),
        delivered: Mock.mock('@integer(4800, 29000)'),
        clicked: Mock.mock('@integer(100, 1000)')
      }
    }
  ])
})

// 发送测试消息
Mock.mock('/api/channels/test', 'post', (options) => {
  const { channel, recipient, content } = Mock.parseBody(options.body)
  
  return Mock.responseTemplate.success({
    channel,
    recipient,
    messageId: Mock.mock('@id'),
    status: 'sent',
    sentAt: new Date().toISOString(),
    message: '测试消息发送成功'
  }, '测试发送成功')
})

// 更新渠道配置
Mock.mock(/\/api\/channels\/(email|whatsapp|social)\/config/, 'put', (options) => {
  const channel = options.url.match(/\/api\/channels\/(email|whatsapp|social)\/config/)[1]
  const config = Mock.parseBody(options.body)
  
  return Mock.responseTemplate.success({
    channel,
    ...config,
    updatedAt: new Date().toISOString()
  }, '配置更新成功')
})

// 获取渠道统计
Mock.mock(/\/api\/channels\/(email|whatsapp|social)\/stats/, 'get', (options) => {
  const channel = options.url.match(/\/api\/channels\/(email|whatsapp|social)\/stats/)[1]
  const query = Mock.parseQuery(options.url)
  const days = parseInt(query.days) || 7
  
  const stats = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    stats.push({
      date: date.toISOString().split('T')[0],
      sent: Mock.mock('@integer(500, 2000)'),
      delivered: Mock.mock('@integer(450, 1900)'),
      opened: channel === 'email' ? Mock.mock('@integer(100, 600)') : null,
      clicked: channel === 'email' ? Mock.mock('@integer(20, 150)') : null,
      read: channel === 'whatsapp' ? Mock.mock('@integer(300, 1500)') : null,
      replied: channel === 'whatsapp' ? Mock.mock('@integer(20, 200)') : null,
      posts: channel === 'social' ? Mock.mock('@integer(1, 10)') : null,
      reach: channel === 'social' ? Mock.mock('@integer(1000, 50000)') : null,
      engagement: channel === 'social' ? Mock.mock('@integer(50, 5000)') : null
    })
  }
  
  return Mock.responseTemplate.success({
    channel,
    period: `${days} days`,
    stats
  })
})