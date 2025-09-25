import Mock from 'mockjs'

// 用户登录
Mock.mock('/api/auth/login', 'post', (options) => {
  const { username, password, phone, captcha } = Mock.parseBody(options.body)
  
  // 模拟登录验证
  if (username || phone) {
    return Mock.responseTemplate.success({
      token: Mock.mock('@guid'),
      userInfo: {
        id: Mock.mock('@id'),
        username: username || phone,
        name: Mock.mock('@cname'),
        email: Mock.mock('@email'),
        phone: phone || Mock.mock(/1[3-9]\d{9}/),
        avatar: Mock.mock('@image("100x100", "#409EFF", "#FFF", "avatar")'),
        role: 'admin',
        permissions: ['*']
      }
    }, '登录成功')
  } else {
    return Mock.responseTemplate.error('用户名或密码错误', 400)
  }
})

// 用户登出
Mock.mock('/api/auth/logout', 'post', () => {
  return Mock.responseTemplate.success(null, '退出登录成功')
})

// 获取用户信息
Mock.mock('/api/user/info', 'get', () => {
  return Mock.responseTemplate.success({
    id: Mock.mock('@id'),
    username: 'admin',
    name: Mock.mock('@cname'),
    email: Mock.mock('@email'),
    phone: Mock.mock(/1[3-9]\d{9}/),
    avatar: Mock.mock('@image("100x100", "#409EFF", "#FFF", "avatar")'),
    role: 'admin',
    permissions: ['*'],
    lastLogin: Mock.mock('@datetime'),
    createdAt: Mock.mock('@datetime'),
    department: Mock.mock('@pick(["市场部", "销售部", "运营部", "技术部"])'),
    position: Mock.mock('@pick(["经理", "主管", "专员", "总监"])')
  })
})

// 更新用户信息
Mock.mock('/api/user/profile', 'put', (options) => {
  const userData = Mock.parseBody(options.body)
  return Mock.responseTemplate.success({
    ...userData,
    updatedAt: Mock.mock('@datetime')
  }, '更新成功')
})

// 修改密码
Mock.mock('/api/user/password', 'put', (options) => {
  const { oldPassword, newPassword } = Mock.parseBody(options.body)
  
  // 模拟密码验证
  if (oldPassword && newPassword) {
    return Mock.responseTemplate.success(null, '密码修改成功')
  } else {
    return Mock.responseTemplate.error('密码不能为空', 400)
  }
})

// 发送短信验证码
Mock.mock('/api/auth/sms', 'post', (options) => {
  const { phone } = Mock.parseBody(options.body)
  
  if (phone && /1[3-9]\d{9}/.test(phone)) {
    return Mock.responseTemplate.success({
      code: Mock.mock('@integer(100000, 999999)'),
      expireTime: 300 // 5分钟过期
    }, '验证码发送成功')
  } else {
    return Mock.responseTemplate.error('手机号格式错误', 400)
  }
})