// Hunter.io API - 通过后端代理调用
import axios from 'axios'

// 后端代理路径
const API_BASE = 'http://localhost:10083/api/hunter'

// 创建axios实例
const hunterAxios = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 响应拦截器
hunterAxios.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('Hunter Backend API Error:', error)
    return Promise.reject(error)
  }
)

const hunterBackendAPI = {
  // 公司发现
  companyDiscovery: {
    search: async (params) => {
      try {
        // 发送所有参数到后端，包括分页参数
        const response = await hunterAxios.post('/discover', params)

        // 后端已经处理好了数据格式，直接返回
        if (response.code === 200 && response.data) {
          return response
        }

        return response
      } catch (error) {
        console.error('Company search error:', error)
        throw error
      }
    }
  },

  // 域名搜索 - 用于查看邮箱功能
  domainSearch: async (params) => {
    try {
      const response = await hunterAxios.get('/domain-search', {
        params: {
          domain: params.domain,
          limit: params.limit || 10,
          offset: params.offset || 0
        }
      })

      return response
    } catch (error) {
      console.error('Domain search error:', error)
      throw error
    }
  },

  // 邮箱搜索
  emailSearch: {
    searchByDomain: async (params) => {
      try {
        const response = await hunterAxios.get('/domain-search', {
          params: {
            domain: params.domain,
            limit: params.limit || 10,
            offset: params.offset || 0
          }
        })
        
        if (response.code === 200 && response.data) {
          return {
            code: 200,
            data: {
              emails: response.data.data?.emails || [],
              total: response.data.meta?.results || 0
            }
          }
        }
        
        return response
      } catch (error) {
        console.error('Email search error:', error)
        throw error
      }
    }
  },

  // 邮箱查找
  emailFinder: {
    findEmail: async (params) => {
      try {
        const response = await hunterAxios.get('/email-finder', {
          params: {
            domain: params.domain,
            firstName: params.firstName,
            lastName: params.lastName,
            fullName: params.fullName
          }
        })
        
        return response
      } catch (error) {
        console.error('Email finder error:', error)
        throw error
      }
    }
  },

  // 邮箱验证
  emailVerifier: {
    verifyEmail: async (email) => {
      try {
        const response = await hunterAxios.get('/email-verifier', {
          params: { email }
        })
        
        return response
      } catch (error) {
        console.error('Email verification error:', error)
        throw error
      }
    }
  },

  // 账户信息
  monitor: {
    getAccountInfo: async () => {
      try {
        const response = await hunterAxios.get('/account')
        return response
      } catch (error) {
        console.error('Get account info error:', error)
        throw error
      }
    }
  },

  // 设置管理 - 使用本地存储
  settings: {
    getSettings: async () => {
      const settings = localStorage.getItem('hunterSettings')
      return {
        code: 200,
        data: settings ? JSON.parse(settings) : {
          apiKey: '4874ed4ca6c8df6beb70ec56c1d2289bcf923d15',
          rateLimit: 15,
          timeout: 20,
          retryCount: 3,
          minConfidence: 70,
          verificationLevel: 'standard',
          autoDedup: true,
          filters: ['disposable', 'invalid']
        }
      }
    },

    saveSettings: async (settings) => {
      localStorage.setItem('hunterSettings', JSON.stringify(settings))
      return {
        code: 200,
        message: '设置保存成功',
        data: settings
      }
    }
  }
}

export default hunterBackendAPI