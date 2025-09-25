const state = {
  // 用户信息
  userInfo: {
    id: null,
    username: '',
    name: '',
    email: '',
    phone: '',
    avatar: '',
    role: '',
    permissions: []
  },
  
  // 登录状态
  isLoggedIn: false,
  
  // token
  token: localStorage.getItem('token') || ''
}

const mutations = {
  // 设置用户信息
  SET_USER_INFO(state, userInfo) {
    state.userInfo = { ...state.userInfo, ...userInfo }
  },
  
  // 设置登录状态
  SET_LOGIN_STATUS(state, status) {
    state.isLoggedIn = status
  },
  
  // 设置token
  SET_TOKEN(state, token) {
    state.token = token
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  },
  
  // 清除用户信息
  CLEAR_USER_INFO(state) {
    state.userInfo = {
      id: null,
      username: '',
      name: '',
      email: '',
      phone: '',
      avatar: '',
      role: '',
      permissions: []
    }
    state.isLoggedIn = false
    state.token = ''
    localStorage.removeItem('token')
    sessionStorage.clear()
  }
}

const actions = {
  // 登录
  async login({ commit }, loginData) {
    try {
      // 模拟登录请求 - 使用真实的用户名
      const userDisplayName = loginData.username === 'admin' ? '管理员' :
                             loginData.username || loginData.phone || '用户'

      const mockResponse = {
        token: 'mock-jwt-token-' + Date.now(),
        userInfo: {
          id: 1,
          username: loginData.username || loginData.phone,
          name: userDisplayName,
          email: `${loginData.username || 'user'}@company.com`,
          phone: loginData.phone || '13800138000',
          avatar: '',
          role: loginData.username === 'admin' ? 'admin' : 'user',
          permissions: loginData.username === 'admin' ? ['*'] : ['view', 'edit']
        }
      }
      
      // 设置token和用户信息
      commit('SET_TOKEN', mockResponse.token)
      commit('SET_USER_INFO', mockResponse.userInfo)
      commit('SET_LOGIN_STATUS', true)
      
      return Promise.resolve(mockResponse)
    } catch (error) {
      return Promise.reject(error)
    }
  },
  
  // 获取用户信息
  async getUserInfo({ commit, state }) {
    try {
      // 模拟获取用户信息 - 基于当前存储的username
      const currentUsername = state.userInfo.username || 'admin'
      const userDisplayName = currentUsername === 'admin' ? '管理员' : currentUsername

      const mockUserInfo = {
        id: 1,
        username: currentUsername,
        name: userDisplayName,
        email: `${currentUsername}@company.com`,
        phone: '13800138000',
        avatar: '',
        role: currentUsername === 'admin' ? 'admin' : 'user',
        permissions: currentUsername === 'admin' ? ['*'] : ['view', 'edit']
      }
      
      commit('SET_USER_INFO', mockUserInfo)
      commit('SET_LOGIN_STATUS', true)
      
      return Promise.resolve(mockUserInfo)
    } catch (error) {
      return Promise.reject(error)
    }
  },
  
  // 退出登录
  async logout({ commit }) {
    try {
      // 这里可以调用退出登录API
      commit('CLEAR_USER_INFO')
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },
  
  // 更新用户信息
  updateUserInfo({ commit }, userInfo) {
    commit('SET_USER_INFO', userInfo)
  }
}

const getters = {
  userInfo: state => state.userInfo,
  isLoggedIn: state => state.isLoggedIn,
  token: state => state.token,
  userName: state => state.userInfo.name,
  userRole: state => state.userInfo.role,
  userPermissions: state => state.userInfo.permissions,
  
  // 检查是否有特定权限
  hasPermission: (state) => (permission) => {
    const { permissions } = state.userInfo
    if (permissions.includes('*')) return true
    return permissions.includes(permission)
  },
  
  // 检查是否有特定角色
  hasRole: (state) => (role) => {
    return state.userInfo.role === role
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}