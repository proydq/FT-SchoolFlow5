import request from '../request'

const authApi = {
  // 用户登录
  login: (data) => {
    return request.post('/auth/login', data)
  },

  // 用户登出
  logout: () => {
    return request.post('/auth/logout')
  },

  // 获取用户信息
  getUserInfo: () => {
    return request.get('/user/info')
  },

  // 更新用户信息
  updateProfile: (data) => {
    return request.put('/user/profile', data)
  },

  // 修改密码
  changePassword: (data) => {
    return request.put('/user/password', data)
  },

  // 发送短信验证码
  sendSmsCode: (data) => {
    return request.post('/auth/sms', data)
  }
}

export default authApi