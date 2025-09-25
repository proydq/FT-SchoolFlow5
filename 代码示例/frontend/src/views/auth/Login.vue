<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="shape shape-1"></div>
    <div class="shape shape-2"></div>
    <div class="shape shape-3"></div>
    
    <div class="login-card">
      <!-- 左侧品牌区域 -->
      <div class="brand-section">
        <div class="brand-content">
          <div class="logo">
            <el-icon size="60" color="white"><Platform /></el-icon>
          </div>
          <h1 class="brand-title">海外营销管理系统</h1>
          <p class="brand-subtitle">一站式海外营销解决方案，助力企业全球化发展</p>
          
          <div class="features">
            <div class="feature-item">
              <el-icon color="white"><CircleCheck /></el-icon>
              <span>智能客户管理</span>
            </div>
            <div class="feature-item">
              <el-icon color="white"><CircleCheck /></el-icon>
              <span>多渠道营销推广</span>
            </div>
            <div class="feature-item">
              <el-icon color="white"><CircleCheck /></el-icon>
              <span>实时数据分析</span>
            </div>
            <div class="feature-item">
              <el-icon color="white"><CircleCheck /></el-icon>
              <span>自动化营销流程</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧表单区域 -->
      <div class="form-section">
        <div class="form-header">
          <h2>欢迎回来</h2>
          <p>请登录您的账户继续操作</p>
        </div>
        
        <!-- Tab切换按钮 -->
        <div class="tab-buttons">
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'account' }"
            @click="activeTab = 'account'"
          >
            账号登录
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'phone' }"
            @click="activeTab = 'phone'"
          >
            短信登录
          </button>
        </div>
        
        <!-- 账号登录表单 -->
        <div v-show="activeTab === 'account'" class="login-form">
          <el-form
            ref="accountFormRef"
            :model="accountForm"
            :rules="accountRules"
            size="large"
          >
            <el-form-item prop="username">
              <el-input
                v-model="accountForm.username"
                placeholder="请输入用户名/邮箱"
                prefix-icon="User"
                clearable
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input
                v-model="accountForm.password"
                type="password"
                placeholder="请输入密码"
                prefix-icon="Lock"
                show-password
                clearable
              />
            </el-form-item>
            
            <div class="form-options">
              <el-checkbox v-model="accountForm.remember">记住我</el-checkbox>
              <el-link type="primary" :underline="false">忘记密码？</el-link>
            </div>
            
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="login-btn"
                :loading="loading"
                @click="handleAccountLogin"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 短信登录表单 -->
        <div v-show="activeTab === 'phone'" class="login-form">
          <el-form
            ref="phoneFormRef"
            :model="phoneForm"
            :rules="phoneRules"
            size="large"
          >
            <el-form-item prop="phone">
              <el-input
                v-model="phoneForm.phone"
                placeholder="请输入手机号"
                prefix-icon="Phone"
                clearable
              />
            </el-form-item>
            
            <el-form-item prop="captcha">
              <div class="captcha-input">
                <el-input
                  v-model="phoneForm.captcha"
                  placeholder="请输入验证码"
                  prefix-icon="Message"
                  clearable
                />
                <el-button
                  :disabled="countdown > 0"
                  @click="sendCaptcha"
                >
                  {{ countdown > 0 ? `${countdown}s后重发` : '获取验证码' }}
                </el-button>
              </div>
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="login-btn"
                :loading="loading"
                @click="handlePhoneLogin"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 其他登录方式 -->
        <div class="third-party-login">
          <el-divider>其他登录方式</el-divider>
          <div class="third-party-icons">
            <el-button circle size="large" class="wechat-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.378c-.049.173.05.347.221.347.053 0 .111-.014.175-.042l1.923-.769a.59.59 0 0 1 .476 0 9.368 9.368 0 0 0 3.071.518c-.093-.31-.141-.638-.141-.979 0-3.936 3.617-7.133 8.068-7.133.062 0 .124.002.187.004C16.25 4.181 12.881 2.188 8.691 2.188z"/>
                <path d="M16.096 10.803c-4.054 0-7.33 2.804-7.33 6.26 0 .638.173 1.245.474 1.794l-.537 1.963a.25.25 0 0 0 .09.282.25.25 0 0 0 .137.042.25.25 0 0 0 .084-.014l2.226-.89a9.368 9.368 0 0 0 2.856.455c4.054 0 7.33-2.804 7.33-6.26s-3.276-6.26-7.33-6.26z"/>
              </svg>
            </el-button>
            <el-button circle size="large" class="google-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </el-button>
            <el-button circle size="large" class="github-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Platform, CircleCheck } from '@element-plus/icons-vue'
import { login } from '@/api/auth'

const router = useRouter()

// 表单引用
const accountFormRef = ref()
const phoneFormRef = ref()

// 当前激活的标签
const activeTab = ref('account')
const loading = ref(false)
const countdown = ref(0)

// 账号登录表单
const accountForm = reactive({
  username: 'admin',
  password: '123456',
  remember: false
})

// 手机登录表单
const phoneForm = reactive({
  phone: '',
  captcha: ''
})

// 账号登录验证规则
const accountRules = {
  username: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' },
    { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

// 手机登录验证规则
const phoneRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' }
  ]
}

// 账号登录
const handleAccountLogin = async () => {
  if (!accountFormRef.value) return
  
  try {
    const valid = await accountFormRef.value.validate()
    if (valid) {
      loading.value = true
      
      try {
        // 调用真实的后端登录API
        const response = await login({
          username: accountForm.username,
          password: accountForm.password
        })
        
        // 登录成功
        if (response.code === 200) {
          const { token, user } = response.data
          
          // 保存token和用户信息
          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(user))
          
          ElMessage.success('登录成功！')
          
          // 跳转到营销控制台
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('登录失败:', error)
        // 错误信息已在request拦截器中处理，这里不需要再显示
      } finally {
        loading.value = false
      }
    }
  } catch (error) {
    console.log('表单验证失败:', error)
  }
}

// 手机登录
const handlePhoneLogin = async () => {
  if (!phoneFormRef.value) return
  
  try {
    const valid = await phoneFormRef.value.validate()
    if (valid) {
      loading.value = true
      
      // 模拟登录请求
      setTimeout(() => {
        loading.value = false
        
        // 设置登录状态
        localStorage.setItem('token', 'demo-token')
        localStorage.setItem('user', JSON.stringify({
          name: phoneForm.phone || '用户',
          role: '系统管理员'
        }))
        
        // 跳转到营销控制台（移除消息提示）
        router.push('/dashboard')
      }, 1000)
    }
  } catch (error) {
    console.log('表单验证失败:', error)
  }
}

// 发送验证码
const sendCaptcha = async () => {
  if (!phoneForm.phone) {
    return
  }
  
  if (!/^1[3-9]\d{9}$/.test(phoneForm.phone)) {
    return
  }
  
  // 开始倒计时（移除消息提示）
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}
</script>

<style scoped lang="scss">
// 动画定义
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
  
  // 背景装饰形状
  .shape {
    position: absolute;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    animation: float 6s ease-in-out infinite;
    
    &.shape-1 {
      width: 80px;
      height: 80px;
      top: 10%;
      left: 10%;
      animation-delay: 0s;
    }
    
    &.shape-2 {
      width: 120px;
      height: 120px;
      bottom: 10%;
      right: 10%;
      animation-delay: 2s;
    }
    
    &.shape-3 {
      width: 60px;
      height: 60px;
      top: 50%;
      right: 20%;
      animation-delay: 4s;
    }
  }
}

.login-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  width: 100%;
  max-width: 900px;
  min-height: 600px;
}

// 左侧品牌区域
.brand-section {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50" font-size="100" fill="white" opacity="0.03">M</text></svg>');
    opacity: 0.3;
  }
  
  .brand-content {
    text-align: center;
    color: white;
    position: relative;
    z-index: 1;
    
    .logo {
      margin-bottom: 30px;
      
      .el-icon {
        background: rgba(255, 255, 255, 0.2);
        padding: 15px;
        border-radius: 15px;
      }
    }
    
    .brand-title {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 15px;
      line-height: 1.2;
    }
    
    .brand-subtitle {
      font-size: 16px;
      opacity: 0.9;
      margin-bottom: 40px;
      line-height: 1.5;
    }
    
    .features {
      display: flex;
      flex-direction: column;
      gap: 15px;
      text-align: left;
      max-width: 280px;
      margin: 0 auto;
      
      .feature-item {
        display: flex;
        align-items: center;
        font-size: 14px;
        
        .el-icon {
          margin-right: 10px;
          background: rgba(255, 255, 255, 0.2);
          padding: 5px;
          border-radius: 50%;
          font-size: 12px;
        }
      }
    }
  }
}

// 右侧表单区域
.form-section {
  flex: 1;
  padding: 60px 50px;
  
  .form-header {
    text-align: center;
    margin-bottom: 40px;
    
    h2 {
      font-size: 24px;
      color: $text-primary;
      margin-bottom: 8px;
      font-weight: 600;
    }
    
    p {
      color: $text-secondary;
      font-size: 14px;
    }
  }
  
  // Tab切换按钮
  .tab-buttons {
    display: flex;
    background: $bg-color;
    border-radius: 10px;
    padding: 4px;
    margin-bottom: 30px;
    
    .tab-btn {
      flex: 1;
      padding: 12px;
      border: none;
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 14px;
      font-weight: 500;
      color: $text-secondary;
      
      &:hover {
        color: $text-primary;
      }
      
      &.active {
        background: white;
        color: $primary-color;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
    }
  }
}


// 表单样式
.login-form {
  .el-form-item {
    margin-bottom: 24px;
  }
  
  // 输入框样式
  .el-input {
    height: 48px;
    
    .el-input__wrapper {
      border-radius: 10px;
      box-shadow: 0 0 0 1px $border-base;
      transition: all 0.3s ease;
      
      &.is-focus {
        box-shadow: 0 0 0 2px $primary-color;
      }
    }
    
    .el-input__inner {
      height: 46px;
      line-height: 46px;
      font-size: 14px;
    }
  }
  
  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    font-size: 14px;
    
    .el-checkbox {
      color: $text-secondary;
    }
    
    .el-link {
      font-size: 14px;
    }
  }
  
  .captcha-input {
    display: flex;
    gap: 12px;
    
    .el-input {
      flex: 1;
    }
    
    .el-button {
      width: 120px;
      height: 48px;
      border-radius: 10px;
      white-space: nowrap;
      font-weight: 500;
    }
  }
}

// 登录按钮
.login-btn {
  width: 100%;
  height: 48px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(135deg, $primary-color 0%, #5dade2 100%);
  border: none;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(64, 158, 255, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
}

// 第三方登录
.third-party-login {
  margin-top: 40px;
  
  .el-divider {
    margin: 20px 0;
    
    .el-divider__text {
      color: $text-secondary;
      font-size: 13px;
      background: white;
      padding: 0 15px;
    }
  }
  
  .third-party-icons {
    display: flex;
    justify-content: center;
    gap: 20px;
    
    .el-button {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px) scale(1.05);
      }
      
      &.wechat-btn {
        border-color: #07c160;
        color: #07c160;
        
        &:hover {
          background-color: #07c160;
          color: white;
          box-shadow: 0 8px 20px rgba(7, 193, 96, 0.3);
        }
      }
      
      &.google-btn {
        border-color: #4285f4;
        color: #4285f4;
        
        &:hover {
          background-color: #4285f4;
          color: white;
          box-shadow: 0 8px 20px rgba(66, 133, 244, 0.3);
        }
      }
      
      &.github-btn {
        border-color: #333;
        color: #333;
        
        &:hover {
          background-color: #333;
          color: white;
          box-shadow: 0 8px 20px rgba(51, 51, 51, 0.3);
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .login-card {
    flex-direction: column;
    max-width: 400px;
    min-height: auto;
  }
  
  .brand-section {
    padding: 40px 30px;
    text-align: center;
    
    .brand-content {
      .brand-title {
        font-size: 24px;
      }
      
      .brand-subtitle {
        font-size: 14px;
      }
      
      .features {
        max-width: 100%;
      }
    }
  }
  
  .form-section {
    padding: 40px 30px;
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 10px;
    
    .shape {
      display: none;
    }
  }
  
  .brand-section {
    padding: 30px 20px;
    
    .brand-content {
      .brand-title {
        font-size: 20px;
      }
      
      .features {
        flex-direction: column;
        gap: 10px;
      }
    }
  }
  
  .form-section {
    padding: 30px 20px;
    
    .form-header h2 {
      font-size: 20px;
    }
  }
}
</style>