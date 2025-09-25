import request from '@/utils/request'

/**
 * 获取角色分页列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getRoleList(params) {
  return request({
    url: '/system/roles',
    method: 'get',
    params
  })
}

/**
 * 获取所有角色列表
 * @returns {Promise}
 */
export function getAllRoles() {
  return request({
    url: '/system/roles/all',
    method: 'get'
  })
}

/**
 * 获取启用的角色列表
 * @returns {Promise}
 */
export function getActiveRoles() {
  return request({
    url: '/system/roles/active',
    method: 'get'
  })
}

/**
 * 获取角色详情
 * @param {String} id 角色ID
 * @returns {Promise}
 */
export function getRoleDetail(id) {
  return request({
    url: `/system/roles/${id}`,
    method: 'get'
  })
}

/**
 * 创建角色
 * @param {Object} data 角色信息
 * @returns {Promise}
 */
export function createRole(data) {
  return request({
    url: '/system/roles',
    method: 'post',
    data
  })
}

/**
 * 更新角色
 * @param {String} id 角色ID
 * @param {Object} data 角色信息
 * @returns {Promise}
 */
export function updateRole(id, data) {
  return request({
    url: `/system/roles/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除角色
 * @param {String} id 角色ID
 * @returns {Promise}
 */
export function deleteRole(id) {
  return request({
    url: `/system/roles/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除角色
 * @param {Array} ids 角色ID列表
 * @returns {Promise}
 */
export function batchDeleteRoles(ids) {
  return request({
    url: '/system/roles/batch',
    method: 'delete',
    data: ids
  })
}

/**
 * 更新角色状态
 * @param {String} id 角色ID
 * @param {String} status 状态
 * @returns {Promise}
 */
export function updateRoleStatus(id, status) {
  return request({
    url: `/system/roles/${id}/status`,
    method: 'patch',
    params: { status }
  })
}

/**
 * 检查角色编码是否存在
 * @param {String} roleCode 角色编码
 * @param {String} excludeId 排除的ID
 * @returns {Promise}
 */
export function checkRoleCode(roleCode, excludeId) {
  return request({
    url: '/system/roles/check-code',
    method: 'get',
    params: {
      roleCode,
      excludeId
    }
  })
}

/**
 * 获取角色菜单权限
 * @param {String} roleId 角色ID
 * @returns {Promise}
 */
export function getRoleMenus(roleId) {
  return request({
    url: `/system/roles/${roleId}/menus`,
    method: 'get'
  })
}

/**
 * 保存角色菜单权限
 * @param {String} roleId 角色ID
 * @param {Array} menuIds 菜单ID列表
 * @returns {Promise}
 */
export function saveRoleMenus(roleId, menuIds) {
  return request({
    url: `/system/roles/${roleId}/menus`,
    method: 'post',
    data: menuIds
  })
}