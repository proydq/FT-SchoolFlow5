// 公司列表管理API
import axios from 'axios'

const API_BASE = 'http://localhost:10083/api/company-lists'

// 创建axios实例
const listAxios = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'User-Id': 'c8d8488df5764d6a8814aa0a382d4114' // 默认用户ID
  }
})

// 响应拦截器
listAxios.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('Company Lists API Error:', error)
    return Promise.reject(error)
  }
)

const companyListsAPI = {
  // 获取用户的所有列表
  getUserLists: async () => {
    return await listAxios.get('')
  },

  // 创建新列表
  createList: async (name, description) => {
    return await listAxios.post('', { name, description })
  },

  // 添加公司到指定列表
  addCompaniesToList: async (listId, companies) => {
    return await listAxios.post(`/${listId}/companies`, { companies })
  },

  // 添加公司到默认列表（快速收藏）
  addToDefaultList: async (company) => {
    return await listAxios.post('/default/companies', company)
  },

  // 获取列表中的公司
  getListCompanies: async (listId, page = 0, size = 10, keyword = '') => {
    return await listAxios.get(`/${listId}/companies`, {
      params: { page, size, keyword }
    })
  },

  // 从列表中删除公司
  removeCompaniesFromList: async (listId, domains) => {
    return await listAxios.delete(`/${listId}/companies`, {
      data: { domains }
    })
  },

  // 更新列表信息
  updateList: async (listId, name, description) => {
    return await listAxios.put(`/${listId}`, { name, description })
  },

  // 删除列表
  deleteList: async (listId) => {
    return await listAxios.delete(`/${listId}`)
  }
}

export default companyListsAPI