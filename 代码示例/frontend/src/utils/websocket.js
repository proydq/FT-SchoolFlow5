// WebSocket 实时数据推送服务
class WebSocketService {
  constructor() {
    this.ws = null
    this.url = 'wss://localhost:3001/ws' // 模拟WebSocket地址
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectInterval = 3000
    this.heartbeatInterval = 30000
    this.heartbeatTimer = null
    this.messageHandlers = new Map()
  }

  // 连接WebSocket
  connect() {
    try {
      // 由于这是演示环境，我们不实际连接WebSocket
      // 而是模拟WebSocket的行为
      this.simulateConnection()
    } catch (error) {
      console.error('WebSocket连接失败:', error)
      this.handleReconnect()
    }
  }

  // 模拟WebSocket连接
  simulateConnection() {
    console.log('🔗 模拟WebSocket连接已建立')
    
    // 模拟连接成功
    this.onOpen()
    
    // 模拟定时推送数据
    this.startSimulation()
  }

  // 连接打开
  onOpen() {
    console.log('✅ WebSocket连接已打开')
    this.reconnectAttempts = 0
    this.startHeartbeat()
    
    // 触发连接成功事件
    this.emit('connected', { status: 'connected' })
  }

  // 接收消息
  onMessage(event) {
    try {
      const data = JSON.parse(event.data)
      console.log('📨 收到WebSocket消息:', data)
      
      // 根据消息类型分发到不同的处理器
      if (data.type && this.messageHandlers.has(data.type)) {
        this.messageHandlers.get(data.type)(data.payload)
      }
    } catch (error) {
      console.error('解析WebSocket消息失败:', error)
    }
  }

  // 连接关闭
  onClose() {
    console.log('❌ WebSocket连接已关闭')
    this.stopHeartbeat()
    this.handleReconnect()
  }

  // 连接错误
  onError(error) {
    console.error('WebSocket连接错误:', error)
    this.emit('error', error)
  }

  // 发送消息
  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket未连接，无法发送消息')
    }
  }

  // 订阅消息类型
  subscribe(type, handler) {
    this.messageHandlers.set(type, handler)
  }

  // 取消订阅
  unsubscribe(type) {
    this.messageHandlers.delete(type)
  }

  // 触发事件
  emit(type, data) {
    if (this.messageHandlers.has(type)) {
      this.messageHandlers.get(type)(data)
    }
  }

  // 开始心跳
  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      this.send({ type: 'ping', timestamp: Date.now() })
    }, this.heartbeatInterval)
  }

  // 停止心跳
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  // 处理重连
  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`🔄 尝试第${this.reconnectAttempts}次重连...`)
      
      setTimeout(() => {
        this.connect()
      }, this.reconnectInterval)
    } else {
      console.error('❌ WebSocket重连失败，已达到最大重试次数')
      this.emit('reconnectFailed', { attempts: this.reconnectAttempts })
    }
  }

  // 开始模拟数据推送
  startSimulation() {
    // 模拟实时数据推送
    setInterval(() => {
      // 模拟实时统计数据
      const realTimeData = {
        onlineUsers: Math.floor(Math.random() * 100) + 50,
        emailsSent: Math.floor(Math.random() * 20) + 5,
        clicks: Math.floor(Math.random() * 10) + 1,
        conversions: Math.floor(Math.random() * 3)
      }
      
      this.emit('realTimeData', realTimeData)
    }, 5000)

    // 模拟邮件事件推送
    setInterval(() => {
      const events = ['email_sent', 'email_opened', 'email_clicked', 'email_replied']
      const event = events[Math.floor(Math.random() * events.length)]
      
      const eventData = {
        type: event,
        timestamp: Date.now(),
        campaignId: Math.floor(Math.random() * 100) + 1,
        customerId: Math.floor(Math.random() * 1000) + 1,
        details: this.generateEventDetails(event)
      }
      
      this.emit('emailEvent', eventData)
    }, 3000)

    // 模拟系统状态更新
    setInterval(() => {
      const systemStatus = {
        serverHealth: Math.random() > 0.1 ? 'healthy' : 'warning',
        apiLatency: Math.floor(Math.random() * 100) + 50,
        queueSize: Math.floor(Math.random() * 500),
        errorRate: (Math.random() * 2).toFixed(2)
      }
      
      this.emit('systemStatus', systemStatus)
    }, 10000)
  }

  // 生成事件详情
  generateEventDetails(eventType) {
    const details = {
      email_sent: {
        subject: '最新产品推荐',
        recipient: 'customer@example.com'
      },
      email_opened: {
        subject: '最新产品推荐',
        location: ['北京', '上海', '深圳', '广州'][Math.floor(Math.random() * 4)],
        device: ['Desktop', 'Mobile', 'Tablet'][Math.floor(Math.random() * 3)]
      },
      email_clicked: {
        subject: '最新产品推荐',
        linkUrl: 'https://example.com/product/123',
        linkText: '查看详情'
      },
      email_replied: {
        subject: 'Re: 最新产品推荐',
        replyType: 'inquiry'
      }
    }
    
    return details[eventType] || {}
  }

  // 关闭连接
  close() {
    this.stopHeartbeat()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    console.log('🔌 WebSocket连接已断开')
  }

  // 获取连接状态
  getReadyState() {
    if (!this.ws) return 'CLOSED'
    
    const states = {
      0: 'CONNECTING',
      1: 'OPEN', 
      2: 'CLOSING',
      3: 'CLOSED'
    }
    
    return states[this.ws.readyState] || 'UNKNOWN'
  }
}

// 创建单例实例
const websocketService = new WebSocketService()

export default websocketService