import request from '../request'

const customerApi = {
  // 获取客户列表
  getCustomers: (params) => {
    return request.get('/customers', { params })
  },

  // 获取客户详情
  getCustomer: (id) => {
    return request.get(`/customers/${id}`)
  },

  // 创建客户
  createCustomer: (data) => {
    return request.post('/customers', data)
  },

  // 更新客户信息
  updateCustomer: (id, data) => {
    return request.put(`/customers/${id}`, data)
  },

  // 删除客户
  deleteCustomer: (id) => {
    return request.delete(`/customers/${id}`)
  },

  // 批量操作客户
  batchOperation: (data) => {
    return request.post('/customers/batch', data)
  },

  // 获取客户分组
  getCustomerGroups: () => {
    return request.get('/customer-groups')
  },

  // 创建客户分组
  createCustomerGroup: (data) => {
    return request.post('/customer-groups', data)
  },

  // 更新客户分组
  updateCustomerGroup: (id, data) => {
    return request.put(`/customer-groups/${id}`, data)
  },

  // 删除客户分组
  deleteCustomerGroup: (id) => {
    return request.delete(`/customer-groups/${id}`)
  },

  // 获取数据导入历史
  getImportHistory: (params) => {
    return request.get('/customers/import-history', { params })
  },

  // 导入客户数据
  importCustomers: (file, onProgress) => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/customers/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: onProgress
    })
  },

  // 获取数据清洗任务
  getCleanTasks: () => {
    return request.get('/customers/clean-tasks')
  },

  // 创建数据清洗任务
  createCleanTask: (data) => {
    return request.post('/customers/clean-tasks', data)
  },

  // 执行数据清洗
  executeCleanTask: (id) => {
    return request.post(`/customers/clean-tasks/${id}/execute`)
  },

  // 获取客户画像分析
  getProfileAnalysis: (params) => {
    return request.get('/customers/profile-analysis', { params })
  },

  // API数据采集
  collectFromApi: (data) => {
    return request.post('/customers/api-collect', data)
  }
}

export default customerApi