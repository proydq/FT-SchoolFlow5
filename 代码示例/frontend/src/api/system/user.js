import request from '@/utils/request'

/**
 * 获取用户列表
 */
export function getUserList(params) {
  return request({
    url: '/system/users',
    method: 'get',
    params
  })
}

/**
 * 获取所有用户
 */
export function getAllUsers() {
  return request({
    url: '/system/users/all',
    method: 'get'
  })
}

/**
 * 获取用户详情
 */
export function getUserById(id) {
  return request({
    url: `/system/users/${id}`,
    method: 'get'
  })
}

/**
 * 创建用户
 */
export function createUser(data) {
  return request({
    url: '/system/users',
    method: 'post',
    data
  })
}

/**
 * 更新用户
 */
export function updateUser(id, data) {
  return request({
    url: `/system/users/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除用户
 */
export function deleteUser(id) {
  return request({
    url: `/system/users/${id}`,
    method: 'delete'
  })
}

/**
 * 更新用户状态
 */
export function updateUserStatus(id, status) {
  return request({
    url: `/system/users/${id}/status`,
    method: 'put',
    params: { status }
  })
}

/**
 * 重置密码
 */
export function resetPassword(id, newPassword) {
  return request({
    url: `/system/users/${id}/password`,
    method: 'put',
    params: { newPassword }
  })
}

/**
 * 分配角色
 */
export function assignRoles(id, roleIds) {
  return request({
    url: `/system/users/${id}/roles`,
    method: 'post',
    data: roleIds
  })
}

/**
 * 获取用户角色
 */
export function getUserRoles(id) {
  return request({
    url: `/system/users/${id}/roles`,
    method: 'get'
  })
}

/**
 * 检查用户名是否存在
 */
export function checkUsername(username) {
  return request({
    url: '/system/users/check-username',
    method: 'get',
    params: { username }
  })
}

/**
 * 检查邮箱是否存在
 */
export function checkEmail(email) {
  return request({
    url: '/system/users/check-email',
    method: 'get',
    params: { email }
  })
}