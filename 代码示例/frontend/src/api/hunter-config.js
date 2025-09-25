// Hunter API 配置文件
// 控制使用真实API还是Mock API

// 是否使用Mock数据
// 开发阶段设置为true，生产环境设置为false
const USE_MOCK = false

// 是否使用真实API（直接调用Hunter.io）
const USE_REAL_API = false

// 是否使用后端代理API（推荐，避免CORS问题）
const USE_BACKEND_API = true

// API配置
export const hunterConfig = {
  // 是否启用Mock模式
  useMock: USE_MOCK,

  // 是否使用真实API
  useRealAPI: USE_REAL_API,

  // API基础路径
  apiBase: '/api/hunter',

  // 默认配置
  defaults: {
    // 请求超时时间（毫秒）
    timeout: 20000,

    // 重试次数
    retryCount: 3,

    // 每页默认数量
    pageSize: 20,

    // 最小置信度
    minConfidence: 70,

    // 验证级别
    verificationLevel: 'standard',

    // 并发请求数
    concurrency: 5
  },

  // 速率限制配置
  rateLimit: {
    // 每秒最大请求数
    maxRequestsPerSecond: 15,

    // 批量操作的最大项目数
    maxBatchSize: 100
  },

  // 缓存配置
  cache: {
    // 是否启用缓存
    enabled: true,

    // 缓存过期时间（秒）
    ttl: 300,

    // 最大缓存项目数
    maxItems: 1000
  },

  // 日志配置
  logging: {
    // 是否启用日志
    enabled: true,

    // 日志级别: 'debug', 'info', 'warn', 'error'
    level: 'info'
  }
}

// 获取当前使用的API服务
export const getHunterAPI = async () => {
  if (hunterConfig.useMock) {
    const { default: mockAPI } = await import('./hunter-mock.js')
    console.log('🔧 Using Mock Hunter API')
    return mockAPI
  } else if (USE_BACKEND_API) {
    const { default: backendAPI } = await import('./hunter-backend.js')
    console.log('🔄 Using Backend Proxy Hunter API')
    return backendAPI
  } else if (hunterConfig.useRealAPI) {
    const { default: realAPI } = await import('./hunter-real.js')
    console.log('🚀 Using Real Hunter.io API')
    return realAPI
  } else {
    const { default: proxyAPI } = await import('./hunter.js')
    console.log('📡 Using Proxy Hunter API')
    return proxyAPI
  }
}

// 导出默认配置
export default hunterConfig