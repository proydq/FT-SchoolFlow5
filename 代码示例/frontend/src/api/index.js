// API统一入口
import request from './request'

// 导入各模块API
import authApi from './modules/auth'
import productApi from './modules/product'
import customerApi from './modules/customer'
import campaignApi from './modules/campaign'
import channelApi from './modules/channel'
import trackingApi from './modules/tracking'
import reportApi from './modules/report'
import systemApi from './modules/system'
import aiApi from './modules/ai'

// 统一导出所有API
const api = {
  auth: authApi,
  product: productApi,
  customer: customerApi,
  campaign: campaignApi,
  channel: channelApi,
  tracking: trackingApi,
  report: reportApi,
  system: systemApi,
  ai: aiApi
}

// 为每个API模块注入request实例
Object.keys(api).forEach(moduleName => {
  const moduleApi = api[moduleName]
  Object.keys(moduleApi).forEach(apiName => {
    if (typeof moduleApi[apiName] === 'function') {
      moduleApi[apiName].request = request
    }
  })
})

export default api
export { request }

// 便捷导出
export const {
  auth: authApi,
  product: productApi,
  customer: customerApi,
  campaign: campaignApi,
  channel: channelApi,
  tracking: trackingApi,
  report: reportApi,
  system: systemApi,
  ai: aiApi
} = api