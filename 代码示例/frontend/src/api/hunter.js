import request from '@/utils/request'

// Hunter API 配置
const HUNTER_API_BASE = '/api/hunter'

// Hunter API 服务层
const hunterAPI = {
  // ============= 公司发现 API =============
  /**
   * AI智能搜索公司
   * @param {Object} params 搜索参数
   * @returns {Promise}
   */
  companyDiscovery: {
    // 自然语言搜索
    search: (params) => {
      return request({
        url: `${HUNTER_API_BASE}/companies/search`,
        method: 'post',
        data: params
      })
    },

    // 获取公司详情
    getCompanyDetails: (domain) => {
      return request({
        url: `${HUNTER_API_BASE}/companies/${domain}`,
        method: 'get'
      })
    },

    // 批量查询公司
    batchSearch: (domains) => {
      return request({
        url: `${HUNTER_API_BASE}/companies/batch`,
        method: 'post',
        data: { domains }
      })
    }
  },

  // ============= 邮箱搜索 API (Domain Search) =============
  /**
   * 域名搜索 - 根据公司域名批量查找邮箱
   */
  emailSearch: {
    // 单个域名搜索
    searchByDomain: (params) => {
      const { domain, department, seniority, limit = 100, offset = 0 } = params
      return request({
        url: `${HUNTER_API_BASE}/domain-search`,
        method: 'get',
        params: {
          domain,
          department,
          seniority,
          limit,
          offset
        }
      })
    },

    // 批量域名搜索
    batchSearchByDomain: (domains, filters = {}) => {
      return request({
        url: `${HUNTER_API_BASE}/domain-search/batch`,
        method: 'post',
        data: {
          domains,
          ...filters
        }
      })
    },

    // 获取部门列表
    getDepartments: () => {
      return request({
        url: `${HUNTER_API_BASE}/departments`,
        method: 'get'
      })
    },

    // 获取资历级别列表
    getSeniorities: () => {
      return request({
        url: `${HUNTER_API_BASE}/seniorities`,
        method: 'get'
      })
    }
  },

  // ============= 邮箱查找 API (Email Finder) =============
  /**
   * 精准查找 - 根据人名和公司查找邮箱
   */
  emailFinder: {
    // 查找个人邮箱
    findEmail: (params) => {
      const { firstName, lastName, domain, company } = params
      return request({
        url: `${HUNTER_API_BASE}/email-finder`,
        method: 'get',
        params: {
          first_name: firstName,
          last_name: lastName,
          domain,
          company
        }
      })
    },

    // 批量查找
    batchFindEmails: (people) => {
      return request({
        url: `${HUNTER_API_BASE}/email-finder/batch`,
        method: 'post',
        data: { people }
      })
    },

    // 按职位查找
    findByRole: (company, role) => {
      return request({
        url: `${HUNTER_API_BASE}/email-finder/role`,
        method: 'get',
        params: {
          company,
          role
        }
      })
    },

    // 获取搜索历史
    getSearchHistory: () => {
      return request({
        url: `${HUNTER_API_BASE}/email-finder/history`,
        method: 'get'
      })
    }
  },

  // ============= 邮箱验证 API (Email Verifier) =============
  /**
   * 邮箱验证 - 验证邮箱有效性
   */
  emailVerifier: {
    // 单个邮箱验证
    verifyEmail: (email) => {
      return request({
        url: `${HUNTER_API_BASE}/email-verifier`,
        method: 'get',
        params: { email }
      })
    },

    // 批量邮箱验证
    batchVerifyEmails: (emails) => {
      return request({
        url: `${HUNTER_API_BASE}/email-verifier/batch`,
        method: 'post',
        data: { emails }
      })
    },

    // 获取验证历史
    getVerificationHistory: (params = {}) => {
      return request({
        url: `${HUNTER_API_BASE}/email-verifier/history`,
        method: 'get',
        params
      })
    },

    // 导出验证结果
    exportVerificationResults: (ids) => {
      return request({
        url: `${HUNTER_API_BASE}/email-verifier/export`,
        method: 'post',
        data: { ids },
        responseType: 'blob'
      })
    }
  },

  // ============= 信息丰富化 API (Enrichment) =============
  /**
   * 数据丰富化 - 基于邮箱或LinkedIn获取详细信息
   */
  enrichment: {
    // 个人信息丰富化
    enrichPerson: (params) => {
      const { email, linkedin } = params
      return request({
        url: `${HUNTER_API_BASE}/enrichment/person`,
        method: 'get',
        params: {
          email,
          linkedin_url: linkedin
        }
      })
    },

    // 公司信息丰富化
    enrichCompany: (domain) => {
      return request({
        url: `${HUNTER_API_BASE}/enrichment/company`,
        method: 'get',
        params: { domain }
      })
    },

    // 组合查询
    enrichCombined: (email) => {
      return request({
        url: `${HUNTER_API_BASE}/enrichment/combined`,
        method: 'get',
        params: { email }
      })
    },

    // 批量丰富化
    batchEnrich: (items, type = 'person') => {
      return request({
        url: `${HUNTER_API_BASE}/enrichment/batch`,
        method: 'post',
        data: {
          items,
          type
        }
      })
    }
  },

  // ============= 监控和统计 API =============
  /**
   * API使用监控
   */
  monitor: {
    // 获取使用统计
    getUsageStats: (params = {}) => {
      const { startDate, endDate, groupBy = 'day' } = params
      return request({
        url: `${HUNTER_API_BASE}/stats/usage`,
        method: 'get',
        params: {
          start_date: startDate,
          end_date: endDate,
          group_by: groupBy
        }
      })
    },

    // 获取账户信息
    getAccountInfo: () => {
      return request({
        url: `${HUNTER_API_BASE}/account`,
        method: 'get'
      })
    },

    // 获取额度信息
    getCreditsInfo: () => {
      return request({
        url: `${HUNTER_API_BASE}/account/credits`,
        method: 'get'
      })
    },

    // 获取API调用历史
    getAPIHistory: (params = {}) => {
      return request({
        url: `${HUNTER_API_BASE}/history`,
        method: 'get',
        params
      })
    },

    // 获取成本分析
    getCostAnalysis: (params = {}) => {
      return request({
        url: `${HUNTER_API_BASE}/stats/cost`,
        method: 'get',
        params
      })
    }
  },

  // ============= 设置管理 API =============
  /**
   * 配置管理
   */
  settings: {
    // 获取配置
    getSettings: () => {
      return request({
        url: `${HUNTER_API_BASE}/settings`,
        method: 'get'
      })
    },

    // 保存配置
    saveSettings: (settings) => {
      return request({
        url: `${HUNTER_API_BASE}/settings`,
        method: 'put',
        data: settings
      })
    },

    // 测试API密钥
    testAPIKey: (apiKey) => {
      return request({
        url: `${HUNTER_API_BASE}/settings/test-key`,
        method: 'post',
        data: { api_key: apiKey }
      })
    },

    // 获取自动化规则
    getAutomationRules: () => {
      return request({
        url: `${HUNTER_API_BASE}/settings/automation-rules`,
        method: 'get'
      })
    },

    // 保存自动化规则
    saveAutomationRule: (rule) => {
      return request({
        url: `${HUNTER_API_BASE}/settings/automation-rules`,
        method: rule.id ? 'put' : 'post',
        data: rule
      })
    },

    // 删除自动化规则
    deleteAutomationRule: (ruleId) => {
      return request({
        url: `${HUNTER_API_BASE}/settings/automation-rules/${ruleId}`,
        method: 'delete'
      })
    },

    // 获取数据保留策略
    getRetentionPolicy: () => {
      return request({
        url: `${HUNTER_API_BASE}/settings/retention`,
        method: 'get'
      })
    },

    // 保存数据保留策略
    saveRetentionPolicy: (policy) => {
      return request({
        url: `${HUNTER_API_BASE}/settings/retention`,
        method: 'put',
        data: policy
      })
    }
  },

  // ============= 工具函数 =============
  /**
   * 辅助工具
   */
  utils: {
    // 验证域名格式
    validateDomain: (domain) => {
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/
      return domainRegex.test(domain)
    },

    // 验证邮箱格式
    validateEmail: (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    },

    // 格式化置信度分数
    formatConfidence: (score) => {
      if (score >= 95) return { text: '非常高', color: '#67c23a' }
      if (score >= 80) return { text: '高', color: '#409eff' }
      if (score >= 60) return { text: '中等', color: '#e6a23c' }
      return { text: '低', color: '#f56c6c' }
    },

    // 解析CSV文件
    parseCSV: (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const text = e.target.result
          const lines = text.split('\n')
          const result = []
          const headers = lines[0].split(',').map(h => h.trim())

          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
              const values = lines[i].split(',').map(v => v.trim())
              const obj = {}
              headers.forEach((header, index) => {
                obj[header] = values[index]
              })
              result.push(obj)
            }
          }
          resolve(result)
        }
        reader.onerror = reject
        reader.readAsText(file)
      })
    },

    // 导出为CSV
    exportToCSV: (data, filename = 'export.csv') => {
      if (!data || data.length === 0) return

      const headers = Object.keys(data[0])
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => row[header] || '').join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      link.click()
    },

    // 批量处理工具
    batchProcessor: async (items, processor, concurrency = 5) => {
      const results = []
      for (let i = 0; i < items.length; i += concurrency) {
        const batch = items.slice(i, i + concurrency)
        const batchResults = await Promise.all(
          batch.map(item => processor(item).catch(err => ({ error: err, item })))
        )
        results.push(...batchResults)
      }
      return results
    }
  }
}

export default hunterAPI

// 导出独立的API模块
export const {
  companyDiscovery,
  emailSearch,
  emailFinder,
  emailVerifier,
  enrichment,
  monitor,
  settings,
  utils
} = hunterAPI