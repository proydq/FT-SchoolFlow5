const state = {
  // 仪表板数据
  stats: {
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalCustomers: 0,
    todayEmails: 0,
    openRate: 0,
    clickRate: 0
  },
  
  // 图表数据
  chartData: {
    emailTrend: [],
    conversionFunnel: [],
    topProducts: [],
    customerGrowth: []
  },
  
  // AI建议
  aiSuggestions: [],
  
  // 实时数据
  realTimeData: {
    onlineUsers: 0,
    emailsSent: 0,
    clicks: 0,
    conversions: 0
  }
}

const mutations = {
  // 设置统计数据
  SET_STATS(state, stats) {
    state.stats = { ...state.stats, ...stats }
  },
  
  // 设置图表数据
  SET_CHART_DATA(state, { type, data }) {
    state.chartData[type] = data
  },
  
  // 设置AI建议
  SET_AI_SUGGESTIONS(state, suggestions) {
    state.aiSuggestions = suggestions
  },
  
  // 更新实时数据
  UPDATE_REAL_TIME_DATA(state, data) {
    state.realTimeData = { ...state.realTimeData, ...data }
  }
}

const actions = {
  // 获取仪表板统计数据
  async fetchDashboardStats({ commit }) {
    try {
      // 模拟API请求
      const mockStats = {
        totalCampaigns: 128,
        activeCampaigns: 15,
        totalCustomers: 8642,
        todayEmails: 1256,
        openRate: 32.5,
        clickRate: 8.7,
        conversionRate: 2.3,
        revenue: 125600,
        
        // 变化趋势数据
        campaignChange: 12.5,
        activeChange: 8.3,
        newCustomersToday: 45,
        emailChange: -5.2,
        openRateChange: 2.8,
        clickRateChange: -1.5,
        conversionChange: 4.2,
        revenueIncrease: 18200
      }
      
      commit('SET_STATS', mockStats)
      return Promise.resolve(mockStats)
    } catch (error) {
      return Promise.reject(error)
    }
  },
  
  // 获取邮件趋势数据
  async fetchEmailTrendData({ commit }) {
    try {
      const mockData = [
        { date: '2024-01-01', sent: 1200, opened: 420, clicked: 89 },
        { date: '2024-01-02', sent: 1350, opened: 486, clicked: 112 },
        { date: '2024-01-03', sent: 1180, opened: 398, clicked: 76 },
        { date: '2024-01-04', sent: 1420, opened: 511, clicked: 128 },
        { date: '2024-01-05', sent: 1256, opened: 439, clicked: 95 },
        { date: '2024-01-06', sent: 1380, opened: 497, clicked: 118 },
        { date: '2024-01-07', sent: 1290, opened: 452, clicked: 101 }
      ]
      
      commit('SET_CHART_DATA', { type: 'emailTrend', data: mockData })
      return Promise.resolve(mockData)
    } catch (error) {
      return Promise.reject(error)
    }
  },
  
  // 获取转化漏斗数据
  async fetchConversionFunnelData({ commit }) {
    try {
      const mockData = [
        { stage: '邮件发送', count: 10000, rate: 100 },
        { stage: '邮件打开', count: 3250, rate: 32.5 },
        { stage: '链接点击', count: 870, rate: 8.7 },
        { stage: '页面访问', count: 652, rate: 6.52 },
        { stage: '询盘提交', count: 156, rate: 1.56 },
        { stage: '成交转化', count: 28, rate: 0.28 }
      ]
      
      commit('SET_CHART_DATA', { type: 'conversionFunnel', data: mockData })
      return Promise.resolve(mockData)
    } catch (error) {
      return Promise.reject(error)
    }
  },
  
  // 获取热门产品数据
  async fetchTopProductsData({ commit }) {
    try {
      const mockData = [
        { name: '智能手表Pro', clicks: 1256, conversions: 89, rate: 7.1 },
        { name: '无线耳机Max', clicks: 1128, conversions: 76, rate: 6.7 },
        { name: '运动相机4K', clicks: 986, conversions: 65, rate: 6.6 },
        { name: '智能音箱', clicks: 854, conversions: 52, rate: 6.1 },
        { name: '平板电脑', clicks: 742, conversions: 41, rate: 5.5 },
        { name: '游戏手柄', clicks: 689, conversions: 36, rate: 5.2 },
        { name: '充电宝', clicks: 625, conversions: 28, rate: 4.5 },
        { name: '蓝牙键盘', clicks: 578, conversions: 25, rate: 4.3 },
        { name: '手机支架', clicks: 512, conversions: 19, rate: 3.7 },
        { name: '数据线', clicks: 456, conversions: 15, rate: 3.3 }
      ]
      
      commit('SET_CHART_DATA', { type: 'topProducts', data: mockData })
      return Promise.resolve(mockData)
    } catch (error) {
      return Promise.reject(error)
    }
  },
  
  // 获取客户增长数据
  async fetchCustomerGrowthData({ commit }) {
    try {
      const mockData = [
        { month: '2023-07', newCustomers: 245, totalCustomers: 5420 },
        { month: '2023-08', newCustomers: 312, totalCustomers: 5732 },
        { month: '2023-09', newCustomers: 289, totalCustomers: 6021 },
        { month: '2023-10', newCustomers: 356, totalCustomers: 6377 },
        { month: '2023-11', newCustomers: 423, totalCustomers: 6800 },
        { month: '2023-12', newCustomers: 398, totalCustomers: 7198 },
        { month: '2024-01', newCustomers: 445, totalCustomers: 7643 },
        { month: '2024-02', newCustomers: 387, totalCustomers: 8030 },
        { month: '2024-03', newCustomers: 412, totalCustomers: 8442 },
        { month: '2024-04', newCustomers: 356, totalCustomers: 8798 },
        { month: '2024-05', newCustomers: 389, totalCustomers: 9187 },
        { month: '2024-06', newCustomers: 425, totalCustomers: 9612 }
      ]
      
      commit('SET_CHART_DATA', { type: 'customerGrowth', data: mockData })
      return Promise.resolve(mockData)
    } catch (error) {
      return Promise.reject(error)
    }
  },
  
  // 获取AI建议
  async fetchAiSuggestions({ commit }) {
    try {
      const mockSuggestions = [
        {
          id: 1,
          type: 'customer',
          title: '高价值客户推荐',
          description: '基于消费行为分析，发现518位潜在高价值客户',
          action: '查看详情',
          priority: 'high',
          icon: 'User',
          metrics: [
            { label: '预期价值', value: '$2.5K' },
            { label: '转化率', value: '65%' }
          ]
        },
        {
          id: 2,
          type: 'timing',
          title: '最佳发送时间',
          description: '数据显示，周二上午10点发送邮件打开率最高',
          action: '应用建议',
          priority: 'high',
          icon: 'Clock',
          metrics: [
            { label: '打开率', value: '45.2%' },
            { label: '点击率', value: '12.8%' }
          ]
        },
        {
          id: 3,
          type: 'content',
          title: '内容优化建议',
          description: '建议在邮件标题中加入个性化元素，可提升32%打开率',
          action: '查看示例',
          priority: 'medium',
          icon: 'EditPen',
          metrics: [
            { label: '提升幅度', value: '+32%' },
            { label: '适用比例', value: '78%' }
          ]
        },
        {
          id: 4,
          type: 'product',
          title: '产品推荐策略',
          description: '根据季节性分析，建议主推智能手表和运动相机',
          action: '查看分析',
          priority: 'medium',
          icon: 'Star',
          metrics: [
            { label: '预期增长', value: '+28%' },
            { label: '季节性指数', value: '8.5' }
          ]
        },
        {
          id: 5,
          type: 'automation',
          title: '自动化营销流程',
          description: '建议为新客户设置7天欢迎邮件序列，提升留存率',
          action: '创建流程',
          priority: 'medium',
          icon: 'Setting',
          metrics: [
            { label: '留存提升', value: '+42%' },
            { label: '节省时间', value: '8h/周' }
          ]
        },
        {
          id: 6,
          type: 'segmentation',
          title: '客户分群优化',
          description: '发现3个高价值客户群体，建议创建专门的营销策略',
          action: '查看分群',
          priority: 'low',
          icon: 'CollectionTag',
          metrics: [
            { label: '群体数量', value: '3' },
            { label: '覆盖用户', value: '2.1K' }
          ]
        }
      ]
      
      commit('SET_AI_SUGGESTIONS', mockSuggestions)
      return Promise.resolve(mockSuggestions)
    } catch (error) {
      return Promise.reject(error)
    }
  },
  
  // 更新实时数据
  updateRealTimeData({ commit }, data) {
    commit('UPDATE_REAL_TIME_DATA', data)
  },
  
  // 模拟实时数据更新
  startRealTimeDataUpdate({ commit }) {
    setInterval(() => {
      const randomData = {
        onlineUsers: Math.floor(Math.random() * 100) + 50,
        emailsSent: Math.floor(Math.random() * 20) + 5,
        clicks: Math.floor(Math.random() * 10) + 1,
        conversions: Math.floor(Math.random() * 3)
      }
      commit('UPDATE_REAL_TIME_DATA', randomData)
    }, 5000)
  }
}

const getters = {
  stats: state => state.stats,
  chartData: state => state.chartData,
  aiSuggestions: state => state.aiSuggestions,
  realTimeData: state => state.realTimeData,
  
  // 计算总转化率
  totalConversionRate: state => {
    const { todayEmails, clickRate } = state.stats
    if (todayEmails === 0) return 0
    return ((todayEmails * clickRate / 100) / todayEmails * 100).toFixed(2)
  },
  
  // 获取高优先级AI建议
  highPriorityAiSuggestions: state => {
    return state.aiSuggestions.filter(suggestion => suggestion.priority === 'high')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}