import request from '../request'

const productApi = {
  // 获取产品列表
  getProducts: (params) => {
    return request.get('/products', { params })
  },

  // 获取产品详情
  getProduct: (id) => {
    return request.get(`/products/${id}`)
  },

  // 创建产品
  createProduct: (data) => {
    return request.post('/products', data)
  },

  // 更新产品
  updateProduct: (id, data) => {
    return request.put(`/products/${id}`, data)
  },

  // 删除产品
  deleteProduct: (id) => {
    return request.delete(`/products/${id}`)
  },

  // 批量操作产品
  batchOperation: (data) => {
    return request.post('/products/batch', data)
  },

  // 获取产品分类
  getCategories: () => {
    return request.get('/products/categories')
  },

  // 创建产品分类
  createCategory: (data) => {
    return request.post('/products/categories', data)
  },

  // 更新产品分类
  updateCategory: (id, data) => {
    return request.put(`/products/categories/${id}`, data)
  },

  // 删除产品分类
  deleteCategory: (id) => {
    return request.delete(`/products/categories/${id}`)
  },

  // 获取产品价格
  getProductPrices: (id) => {
    return request.get(`/products/${id}/prices`)
  },

  // 更新产品价格
  updateProductPrices: (id, data) => {
    return request.put(`/products/${id}/prices`, data)
  },

  // 获取产品多语言内容
  getProductI18n: (id) => {
    return request.get(`/products/${id}/i18n`)
  },

  // 更新产品多语言内容
  updateProductI18n: (id, data) => {
    return request.put(`/products/${id}/i18n`, data)
  },

  // 上传产品媒体文件
  uploadMedia: (file, onProgress) => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/products/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: onProgress
    })
  }
}

export default productApi