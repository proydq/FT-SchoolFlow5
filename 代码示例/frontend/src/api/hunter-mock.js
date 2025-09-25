// Hunter API Mock数据服务层
// 用于开发和测试阶段，在实际Hunter API集成之前提供模拟数据

const mockDelay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms))

const hunterMockAPI = {
  // ============= 公司发现 Mock =============
  companyDiscovery: {
    search: async (params) => {
      await mockDelay()
      // 模拟Hunter.io真实API返回的数据结构
      const mockCompanies = [
        {
          domain: 'salesforce.com',
          organization: 'Salesforce',
          emails_count: {
            personal: 156,
            generic: 24,
            total: 180
          }
        },
        {
          domain: 'hubspot.com',
          organization: 'HubSpot',
          emails_count: {
            personal: 89,
            generic: 15,
            total: 104
          }
        },
        {
          domain: 'slack.com',
          organization: 'Slack Technologies',
          emails_count: {
            personal: 67,
            generic: 12,
            total: 79
          }
        },
        {
          domain: 'zoom.us',
          organization: 'Zoom Video Communications',
          emails_count: {
            personal: 234,
            generic: 18,
            total: 252
          }
        },
        {
          domain: 'notion.so',
          organization: 'Notion',
          emails_count: {
            personal: 45,
            generic: 8,
            total: 53
          }
        },
        {
          domain: 'stripe.com',
          organization: 'Stripe',
          emails_count: {
            personal: 178,
            generic: 22,
            total: 200
          }
        },
        {
          domain: 'dropbox.com',
          organization: 'Dropbox',
          emails_count: {
            personal: 145,
            generic: 19,
            total: 164
          }
        },
        {
          domain: 'atlassian.com',
          organization: 'Atlassian',
          emails_count: {
            personal: 267,
            generic: 31,
            total: 298
          }
        },
        {
          domain: 'monday.com',
          organization: 'Monday.com',
          emails_count: {
            personal: 89,
            generic: 11,
            total: 100
          }
        },
        {
          domain: 'asana.com',
          organization: 'Asana',
          emails_count: {
            personal: 76,
            generic: 9,
            total: 85
          }
        }
      ]

      // 根据分页返回数据
      const page = params.page || 1
      const pageSize = params.pageSize || 10
      const start = (page - 1) * pageSize
      const end = start + pageSize

      return {
        code: 200,
        data: {
          companies: mockCompanies.slice(start, end),
          total: mockCompanies.length,
          page: page,
          pageSize: pageSize
        }
      }
    },

    getCompanyDetails: async (domain) => {
      await mockDelay()
      return {
        code: 200,
        data: {
          domain,
          name: 'Example Corporation',
          industry: 'Technology',
          size: '1000-5000',
          founded: 2010,
          description: '领先的技术解决方案提供商',
          headquarters: 'San Francisco, CA',
          website: `https://${domain}`,
          social: {
            linkedin: `https://linkedin.com/company/${domain.split('.')[0]}`,
            twitter: `@${domain.split('.')[0]}`
          }
        }
      }
    }
  },

  // ============= 邮箱搜索 Mock =============
  emailSearch: {
    searchByDomain: async (params) => {
      await mockDelay()
      const mockEmails = [
        {
          email: 'john.smith@' + params.domain,
          firstName: 'John',
          lastName: 'Smith',
          position: 'Chief Executive Officer',
          department: 'Executive',
          seniority: 'C-Level',
          confidence: 95,
          linkedin: 'https://linkedin.com/in/johnsmith',
          verified: true
        },
        {
          email: 'sarah.johnson@' + params.domain,
          firstName: 'Sarah',
          lastName: 'Johnson',
          position: 'Chief Technology Officer',
          department: 'Engineering',
          seniority: 'C-Level',
          confidence: 93,
          linkedin: 'https://linkedin.com/in/sarahjohnson',
          verified: true
        },
        {
          email: 'michael.chen@' + params.domain,
          firstName: 'Michael',
          lastName: 'Chen',
          position: 'VP of Sales',
          department: 'Sales',
          seniority: 'VP',
          confidence: 88,
          linkedin: 'https://linkedin.com/in/michaelchen',
          verified: false
        }
      ]

      return {
        code: 200,
        data: {
          emails: mockEmails,
          domain: params.domain,
          company: 'Example Corp',
          total: 25,
          available: mockEmails.length
        }
      }
    },

    getDepartments: async () => {
      await mockDelay(200)
      return {
        code: 200,
        data: [
          'Executive',
          'Sales',
          'Marketing',
          'Engineering',
          'Product',
          'Customer Success',
          'Human Resources',
          'Finance',
          'Operations',
          'Legal'
        ]
      }
    },

    getSeniorities: async () => {
      await mockDelay(200)
      return {
        code: 200,
        data: [
          'C-Level',
          'VP',
          'Director',
          'Manager',
          'Senior',
          'Junior',
          'Entry'
        ]
      }
    }
  },

  // ============= 邮箱查找 Mock =============
  emailFinder: {
    findEmail: async (params) => {
      await mockDelay()
      const email = `${params.firstName?.toLowerCase()}.${params.lastName?.toLowerCase()}@${params.domain}`
      return {
        code: 200,
        data: {
          email,
          firstName: params.firstName,
          lastName: params.lastName,
          domain: params.domain,
          position: 'Senior Software Engineer',
          confidence: 85,
          sources: [
            { domain: 'github.com', extracted_on: '2024-01-15' },
            { domain: 'linkedin.com', extracted_on: '2024-01-10' }
          ],
          verified: true
        }
      }
    },

    findByRole: async (company, role) => {
      await mockDelay()
      return {
        code: 200,
        data: {
          results: [
            {
              email: `${role.toLowerCase().replace(/\s+/g, '')}@${company}.com`,
              name: `John ${role}`,
              position: role,
              confidence: 90,
              verified: true
            }
          ]
        }
      }
    },

    getSearchHistory: async () => {
      await mockDelay()
      return {
        code: 200,
        data: [
          {
            id: 1,
            query: 'John Smith @ example.com',
            result: 'john.smith@example.com',
            timestamp: '2024-01-20 10:30:00',
            confidence: 92
          },
          {
            id: 2,
            query: 'Jane Doe @ company.com',
            result: 'jane.doe@company.com',
            timestamp: '2024-01-20 09:15:00',
            confidence: 88
          }
        ]
      }
    }
  },

  // ============= 邮箱验证 Mock =============
  emailVerifier: {
    verifyEmail: async (email) => {
      await mockDelay()
      const random = Math.random()
      const status = random > 0.7 ? 'valid' : random > 0.4 ? 'accept_all' : 'invalid'

      return {
        code: 200,
        data: {
          email,
          status,
          result: status === 'valid' ? 'deliverable' : status === 'invalid' ? 'undeliverable' : 'risky',
          score: status === 'valid' ? 95 : status === 'invalid' ? 10 : 50,
          regexp: true,
          gibberish: false,
          disposable: false,
          webmail: email.includes('gmail') || email.includes('yahoo'),
          mx_records: true,
          smtp_server: true,
          smtp_check: status === 'valid',
          accept_all: status === 'accept_all',
          block: false,
          sources: ['company_website', 'linkedin']
        }
      }
    },

    batchVerifyEmails: async (emails) => {
      await mockDelay(1500)
      const results = []
      for (const email of emails) {
        const random = Math.random()
        const status = random > 0.6 ? 'valid' : random > 0.3 ? 'accept_all' : 'invalid'
        results.push({
          email,
          status,
          result: status === 'valid' ? 'deliverable' : status === 'invalid' ? 'undeliverable' : 'risky',
          score: status === 'valid' ? 90 + Math.floor(Math.random() * 10) : status === 'invalid' ? Math.floor(Math.random() * 30) : 40 + Math.floor(Math.random() * 20)
        })
      }
      return {
        code: 200,
        data: { results }
      }
    }
  },

  // ============= 信息丰富化 Mock =============
  enrichment: {
    enrichPerson: async (params) => {
      await mockDelay()
      return {
        code: 200,
        data: {
          email: params.email,
          firstName: 'John',
          lastName: 'Smith',
          fullName: 'John Smith',
          position: 'Chief Technology Officer',
          company: 'Example Corporation',
          location: 'San Francisco, CA',
          phone: '+1 415-555-0123',
          linkedin: 'https://linkedin.com/in/johnsmith',
          twitter: '@johnsmith',
          bio: 'Experienced technology leader with 15+ years in software development',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
        }
      }
    },

    enrichCompany: async (domain) => {
      await mockDelay()
      return {
        code: 200,
        data: {
          domain,
          name: 'Example Corporation',
          industry: 'Technology',
          size: '1000-5000',
          location: 'San Francisco, CA',
          founded: '2010',
          type: 'Private',
          description: '领先的技术解决方案提供商，专注于云计算和人工智能',
          technologies: ['AWS', 'Python', 'React', 'Node.js'],
          socialProfiles: {
            linkedin: `https://linkedin.com/company/${domain.split('.')[0]}`,
            twitter: `@${domain.split('.')[0]}`,
            facebook: `https://facebook.com/${domain.split('.')[0]}`
          }
        }
      }
    },

    enrichCombined: async (email) => {
      await mockDelay()
      return {
        code: 200,
        data: {
          person: {
            email,
            firstName: 'John',
            lastName: 'Smith',
            position: 'CTO',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
          },
          company: {
            name: 'Example Corp',
            domain: email.split('@')[1],
            industry: 'Technology',
            size: '1000+',
            location: 'San Francisco'
          }
        }
      }
    }
  },

  // ============= 监控统计 Mock =============
  monitor: {
    getUsageStats: async (params) => {
      await mockDelay()
      return {
        code: 200,
        data: {
          stats: {
            totalCalls: 12458,
            successRate: 94.5,
            avgResponseTime: 230,
            periodCost: 234.56
          },
          timeline: [
            { date: '2024-01-14', calls: 1523, cost: 28.45 },
            { date: '2024-01-15', calls: 1876, cost: 35.12 },
            { date: '2024-01-16', calls: 2134, cost: 39.88 },
            { date: '2024-01-17', calls: 1987, cost: 37.15 },
            { date: '2024-01-18', calls: 2234, cost: 41.76 },
            { date: '2024-01-19', calls: 1456, cost: 27.23 },
            { date: '2024-01-20', calls: 1248, cost: 23.34 }
          ]
        }
      }
    },

    getAccountInfo: async () => {
      await mockDelay()
      return {
        code: 200,
        data: {
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          planName: 'Professional',
          planType: 'monthly',
          createdAt: '2023-06-15',
          status: 'active'
        }
      }
    },

    getCreditsInfo: async () => {
      await mockDelay()
      return {
        code: 200,
        data: {
          available: 7542,
          used: 2458,
          total: 10000,
          resetDate: '2024-02-01'
        }
      }
    }
  },

  // ============= 设置管理 Mock =============
  settings: {
    getSettings: async () => {
      await mockDelay()
      return {
        code: 200,
        data: {
          apiKey: 'hunter_api_key_xxxxx',
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
      await mockDelay()
      return {
        code: 200,
        message: '设置保存成功',
        data: settings
      }
    },

    testAPIKey: async (apiKey) => {
      await mockDelay()
      return {
        code: 200,
        data: {
          valid: true,
          message: 'API密钥有效',
          credits: 10000
        }
      }
    }
  }
}

export default hunterMockAPI