import { createStore } from 'vuex'

export interface UserInfo {
  username: string
  name: string
  role: string
}

export interface State {
  token: string | null
  userInfo: UserInfo | null
}

export default createStore<State>({
  state: {
    token: localStorage.getItem('token'),
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null')
  },
  mutations: {
    SET_TOKEN(state, token: string | null) {
      state.token = token
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    },
    SET_USER_INFO(state, userInfo: UserInfo | null) {
      state.userInfo = userInfo
      if (userInfo) {
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
      } else {
        localStorage.removeItem('userInfo')
      }
    }
  },
  actions: {
    login({ commit }, { token, userInfo }) {
      commit('SET_TOKEN', token)
      commit('SET_USER_INFO', userInfo)
    },
    logout({ commit }) {
      commit('SET_TOKEN', null)
      commit('SET_USER_INFO', null)
    }
  },
  getters: {
    isAuthenticated: state => !!state.token,
    currentUser: state => state.userInfo
  }
})