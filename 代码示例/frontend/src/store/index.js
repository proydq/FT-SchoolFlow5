import { createStore } from 'vuex'

// 导入各个模块
import user from './modules/user'
import app from './modules/app'
import dashboard from './modules/dashboard'

const store = createStore({
  modules: {
    user,
    app,
    dashboard
  },
  
  // 全局状态
  state: {
    // 全局loading状态
    globalLoading: false
  },
  
  // 全局mutations
  mutations: {
    SET_GLOBAL_LOADING(state, loading) {
      state.globalLoading = loading
    }
  },
  
  // 全局actions
  actions: {
    setGlobalLoading({ commit }, loading) {
      commit('SET_GLOBAL_LOADING', loading)
    }
  },
  
  // 全局getters
  getters: {
    globalLoading: state => state.globalLoading
  }
})

export default store