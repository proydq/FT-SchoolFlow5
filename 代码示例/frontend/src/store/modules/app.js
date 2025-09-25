const state = {
  // 侧边栏状态
  sidebar: {
    opened: true,
    withoutAnimation: false
  },
  
  // 设备类型
  device: 'desktop',
  
  // 主题
  theme: 'light',
  
  // 语言
  language: 'zh-cn',
  
  // 标签页列表
  visitedViews: [],
  cachedViews: [],
  
  // 系统配置
  systemConfig: {
    title: '海外营销管理系统',
    logo: '',
    copyright: 'Copyright © 2024',
    version: '1.0.0'
  }
}

const mutations = {
  // 切换侧边栏
  TOGGLE_SIDEBAR(state) {
    state.sidebar.opened = !state.sidebar.opened
    state.sidebar.withoutAnimation = false
  },
  
  // 关闭侧边栏
  CLOSE_SIDEBAR(state, withoutAnimation) {
    state.sidebar.opened = false
    state.sidebar.withoutAnimation = withoutAnimation
  },
  
  // 设置设备类型
  SET_DEVICE(state, device) {
    state.device = device
  },
  
  // 设置主题
  SET_THEME(state, theme) {
    state.theme = theme
    localStorage.setItem('theme', theme)
  },
  
  // 设置语言
  SET_LANGUAGE(state, language) {
    state.language = language
    localStorage.setItem('language', language)
  },
  
  // 添加访问的视图
  ADD_VISITED_VIEW(state, view) {
    if (state.visitedViews.some(v => v.path === view.path)) return
    state.visitedViews.push(
      Object.assign({}, view, {
        title: view.meta.title || 'no-name'
      })
    )
  },
  
  // 添加缓存的视图
  ADD_CACHED_VIEW(state, view) {
    if (state.cachedViews.includes(view.name)) return
    if (view.meta.keepAlive) {
      state.cachedViews.push(view.name)
    }
  },
  
  // 删除访问的视图
  DEL_VISITED_VIEW(state, view) {
    for (const [i, v] of state.visitedViews.entries()) {
      if (v.path === view.path) {
        state.visitedViews.splice(i, 1)
        break
      }
    }
  },
  
  // 删除缓存的视图
  DEL_CACHED_VIEW(state, view) {
    const index = state.cachedViews.indexOf(view.name)
    index > -1 && state.cachedViews.splice(index, 1)
  },
  
  // 删除其他访问的视图
  DEL_OTHERS_VISITED_VIEWS(state, view) {
    state.visitedViews = state.visitedViews.filter(v => {
      return v.meta.affix || v.path === view.path
    })
  },
  
  // 删除其他缓存的视图
  DEL_OTHERS_CACHED_VIEWS(state, view) {
    const index = state.cachedViews.indexOf(view.name)
    if (index > -1) {
      state.cachedViews = state.cachedViews.slice(index, index + 1)
    } else {
      state.cachedViews = []
    }
  },
  
  // 删除所有访问的视图
  DEL_ALL_VISITED_VIEWS(state) {
    const affixTags = state.visitedViews.filter(tag => tag.meta.affix)
    state.visitedViews = affixTags
  },
  
  // 删除所有缓存的视图
  DEL_ALL_CACHED_VIEWS(state) {
    state.cachedViews = []
  },
  
  // 更新访问的视图
  UPDATE_VISITED_VIEW(state, view) {
    for (let v of state.visitedViews) {
      if (v.path === view.path) {
        v = Object.assign(v, view)
        break
      }
    }
  },
  
  // 设置系统配置
  SET_SYSTEM_CONFIG(state, config) {
    state.systemConfig = { ...state.systemConfig, ...config }
  }
}

const actions = {
  // 切换侧边栏
  toggleSideBar({ commit }) {
    commit('TOGGLE_SIDEBAR')
  },
  
  // 关闭侧边栏
  closeSideBar({ commit }, { withoutAnimation }) {
    commit('CLOSE_SIDEBAR', withoutAnimation)
  },
  
  // 切换设备
  toggleDevice({ commit }, device) {
    commit('SET_DEVICE', device)
  },
  
  // 设置主题
  setTheme({ commit }, theme) {
    commit('SET_THEME', theme)
  },
  
  // 设置语言
  setLanguage({ commit }, language) {
    commit('SET_LANGUAGE', language)
  },
  
  // 添加视图
  addView({ dispatch }, view) {
    dispatch('addVisitedView', view)
    dispatch('addCachedView', view)
  },
  
  // 添加访问的视图
  addVisitedView({ commit }, view) {
    commit('ADD_VISITED_VIEW', view)
  },
  
  // 添加缓存的视图
  addCachedView({ commit }, view) {
    commit('ADD_CACHED_VIEW', view)
  },
  
  // 删除视图
  delView({ dispatch, state }, view) {
    return new Promise(resolve => {
      dispatch('delVisitedView', view)
      dispatch('delCachedView', view)
      resolve({
        visitedViews: [...state.visitedViews],
        cachedViews: [...state.cachedViews]
      })
    })
  },
  
  // 删除访问的视图
  delVisitedView({ commit, state }, view) {
    return new Promise(resolve => {
      commit('DEL_VISITED_VIEW', view)
      resolve([...state.visitedViews])
    })
  },
  
  // 删除缓存的视图
  delCachedView({ commit, state }, view) {
    return new Promise(resolve => {
      commit('DEL_CACHED_VIEW', view)
      resolve([...state.cachedViews])
    })
  },
  
  // 删除其他视图
  delOthersViews({ dispatch, state }, view) {
    return new Promise(resolve => {
      dispatch('delOthersVisitedViews', view)
      dispatch('delOthersCachedViews', view)
      resolve({
        visitedViews: [...state.visitedViews],
        cachedViews: [...state.cachedViews]
      })
    })
  },
  
  // 删除其他访问的视图
  delOthersVisitedViews({ commit, state }, view) {
    return new Promise(resolve => {
      commit('DEL_OTHERS_VISITED_VIEWS', view)
      resolve([...state.visitedViews])
    })
  },
  
  // 删除其他缓存的视图
  delOthersCachedViews({ commit, state }, view) {
    return new Promise(resolve => {
      commit('DEL_OTHERS_CACHED_VIEWS', view)
      resolve([...state.cachedViews])
    })
  },
  
  // 删除所有视图
  delAllViews({ dispatch, state }, view) {
    return new Promise(resolve => {
      dispatch('delAllVisitedViews', view)
      dispatch('delAllCachedViews', view)
      resolve({
        visitedViews: [...state.visitedViews],
        cachedViews: [...state.cachedViews]
      })
    })
  },
  
  // 删除所有访问的视图
  delAllVisitedViews({ commit, state }) {
    return new Promise(resolve => {
      commit('DEL_ALL_VISITED_VIEWS')
      resolve([...state.visitedViews])
    })
  },
  
  // 删除所有缓存的视图
  delAllCachedViews({ commit, state }) {
    return new Promise(resolve => {
      commit('DEL_ALL_CACHED_VIEWS')
      resolve([...state.cachedViews])
    })
  },
  
  // 更新访问的视图
  updateVisitedView({ commit }, view) {
    commit('UPDATE_VISITED_VIEW', view)
  },
  
  // 获取系统配置
  async getSystemConfig({ commit }) {
    try {
      // 模拟获取系统配置
      const config = {
        title: '海外营销管理系统',
        logo: '',
        copyright: 'Copyright © 2024 营销系统',
        version: '1.0.0'
      }
      
      commit('SET_SYSTEM_CONFIG', config)
      return Promise.resolve(config)
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

const getters = {
  sidebar: state => state.sidebar,
  device: state => state.device,
  theme: state => state.theme,
  language: state => state.language,
  visitedViews: state => state.visitedViews,
  cachedViews: state => state.cachedViews,
  systemConfig: state => state.systemConfig
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}