// Hunter.io 真实API直接调用
// 使用代理服务器避免CORS问题

const HUNTER_API_KEY = '4874ed4ca6c8df6beb70ec56c1d2289bcf923d15'

// 使用代理服务器或后端转发来避免CORS
const hunterRealAPI = {
  companyDiscovery: {
    search: async (params) => {
      try {
        // 构建请求体
        const requestBody = {
          query: params.query
        }

        // 通过代理调用Hunter.io API以避免CORS问题
        const response = await fetch(`/hunter-api/discover?api_key=${HUNTER_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        })

        const data = await response.json()

        // 转换成统一格式
        return {
          code: 200,
          data: {
            companies: data.data || [],
            total: data.meta?.results || 0,
            page: params.page || 1,
            pageSize: params.pageSize || 100
          }
        }
      } catch (error) {
        console.error('Hunter API 调用失败:', error)
        // 如果遇到CORS问题，返回错误信息
        if (error.message.includes('CORS')) {
          throw new Error('CORS错误：请使用后端代理或配置跨域访问')
        }
        throw error
      }
    }
  }
}

export default hunterRealAPI