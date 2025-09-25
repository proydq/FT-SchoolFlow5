import Mock from 'mockjs'

// 设置Mock响应延时(模拟真实网络环境)
Mock.setup({
  timeout: '200-800'
})

// 响应模板
const responseTemplate = {
  success: (data = null, message = '操作成功') => ({
    code: 200,
    message,
    data,
    timestamp: new Date().toISOString()
  }),
  error: (message = '操作失败', code = 500) => ({
    code,
    message,
    data: null,
    timestamp: new Date().toISOString()
  })
}

// 分页响应模板
const pageTemplate = (data, total, page = 1, size = 20) => ({
  code: 200,
  message: '查询成功',
  data: {
    list: data,
    total,
    page: parseInt(page),
    size: parseInt(size),
    pages: Math.ceil(total / size)
  },
  timestamp: new Date().toISOString()
})

// 导出工具函数
Mock.responseTemplate = responseTemplate
Mock.pageTemplate = pageTemplate

// 工具函数：解析URL参数
Mock.parseQuery = (url) => {
  const query = {}
  const queryStr = url.split('?')[1]
  if (queryStr) {
    queryStr.split('&').forEach(item => {
      const [key, value] = item.split('=')
      query[key] = decodeURIComponent(value)
    })
  }
  return query
}

// 工具函数：解析请求体
Mock.parseBody = (body) => {
  try {
    return JSON.parse(body)
  } catch (e) {
    return {}
  }
}

// 导入各模块mock
import './modules/auth'
import './modules/dashboard'
import './modules/product'
import './modules/customer'
import './modules/campaign'
import './modules/channel'
import './modules/tracking'
import './modules/report'
import './modules/system'
import './modules/ai'

console.log('🎭 Mock服务已启动')

export default Mock