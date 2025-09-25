import request from '../request'

const systemApi = {
  // 部门管理API
  department: {
    // 获取部门树
    getTree() {
      return request.get('/departments/tree')
    },

    // 分页获取部门列表
    getPage(params) {
      return request.get('/departments', { params })
    },

    // 获取部门详情
    getById(id) {
      return request.get(`/departments/${id}`)
    },

    // 新增部门
    create(data) {
      return request.post('/departments', data)
    },

    // 更新部门
    update(id, data) {
      return request.put(`/departments/${id}`, data)
    },

    // 删除部门
    delete(id) {
      return request.delete(`/departments/${id}`)
    },

    // 批量删除部门
    batchDelete(ids) {
      return request.delete('/departments/batch', { data: { ids } })
    },

    // 检查部门编码是否存在
    checkCode(code, excludeId) {
      return request.get('/departments/check-code', { params: { code, excludeId } })
    },

    // 获取子部门列表
    getChildren(parentId) {
      return request.get(`/departments/${parentId}/children`)
    },

    // 获取部门统计信息
    getStatistics() {
      return request.get('/departments/statistics')
    }
  },

  // 岗位管理API
  position: {
    // 分页获取岗位列表
    getPage(params) {
      return request.get('/positions', { params })
    },

    // 获取所有岗位列表
    getAll() {
      return request.get('/positions', { params: { page: 1, size: 1000 } })
    },

    // 获取岗位详情
    getById(id) {
      return request.get(`/positions/${id}`)
    },

    // 新增岗位
    create(data) {
      return request.post('/positions', data)
    },

    // 更新岗位
    update(id, data) {
      return request.put(`/positions/${id}`, data)
    },

    // 删除岗位
    delete(id) {
      return request.delete(`/positions/${id}`)
    },

    // 批量删除岗位
    batchDelete(ids) {
      return request.delete('/positions/batch', { data: { ids } })
    },

    // 检查岗位编码是否存在
    checkCode(code, excludeId) {
      return request.get('/positions/check-code', { params: { code, excludeId } })
    },

    // 根据部门ID获取岗位列表
    getByDepartmentId(departmentId) {
      return request.get(`/positions/department/${departmentId}`)
    },

    // 批量更新岗位部门
    batchUpdateDepartment(ids, departmentId) {
      return request.put('/positions/batch-department', { ids, departmentId })
    },

    // 更新岗位状态
    updateStatus(id, status) {
      return request.put(`/positions/${id}/status`, { status })
    },

    // 生成岗位编码
    generateCode(positionName, departmentId) {
      return request.post('/positions/generate-code', { positionName, departmentId })
    },

    // 获取岗位统计信息
    getStatistics() {
      return request.get('/positions/statistics')
    },

    // 根据岗位ID获取人员数量
    getPersonnelCount(id) {
      return request.get(`/positions/${id}/personnel-count`)
    }
  },

  // 人员管理API
  personnel: {
    // 分页获取人员列表
    getPage(params) {
      return request.get('/personnel', { params })
    },

    // 获取人员详情
    getById(id) {
      return request.get(`/personnel/${id}`)
    },

    // 新增人员
    create(data) {
      return request.post('/personnel', data)
    },

    // 更新人员
    update(id, data) {
      return request.put(`/personnel/${id}`, data)
    },

    // 删除人员
    delete(id) {
      return request.delete(`/personnel/${id}`)
    },

    // 批量删除人员
    batchDelete(ids) {
      return request.delete('/personnel/batch', { data: { ids } })
    },

    // 检查员工编号是否存在
    checkEmployeeId(employeeId, excludeId) {
      return request.get('/personnel/check-employee-id', { params: { employeeId, excludeId } })
    },

    // 检查身份证号是否存在
    checkIdCard(idCard, excludeId) {
      return request.get('/personnel/check-id-card', { params: { idCard, excludeId } })
    },

    // 根据部门ID获取人员列表
    getByDepartmentId(departmentId) {
      return request.get(`/personnel/department/${departmentId}`)
    },

    // 根据岗位ID获取人员列表
    getByPositionId(positionId) {
      return request.get(`/personnel/position/${positionId}`)
    },

    // 批量更新人员部门
    batchUpdateDepartment(ids, departmentId) {
      return request.put('/personnel/batch-department', { ids, departmentId })
    },

    // 批量更新人员状态
    batchUpdateStatus(ids, status) {
      return request.put('/personnel/batch-status', { ids, status })
    },

    // 生成员工编号
    generateEmployeeId(departmentId, name) {
      return request.post('/personnel/generate-employee-id', { departmentId, name })
    },

    // 获取人员统计信息
    getStatistics() {
      return request.get('/personnel/statistics')
    }
  }
}

export default systemApi
