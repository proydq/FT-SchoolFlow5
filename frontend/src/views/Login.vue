<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="shape shape-1"></div>
    <div class="shape shape-2"></div>
    <div class="shape shape-3"></div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <!-- 左侧品牌区域 -->
      <div class="brand-section">
        <div class="brand-content">
          <div class="logo">
            <el-icon :size="60" color="white">
              <School />
            </el-icon>
          </div>
          <h1 class="brand-title">福田林校请假管理系统</h1>
          <p class="brand-subtitle">智能化校园请假管理，提升管理效率</p>

          <div class="features">
            <div class="feature-item">
              <el-icon><Check /></el-icon>
              <span>多级审批流程</span>
            </div>
            <div class="feature-item">
              <el-icon><Clock /></el-icon>
              <span>实时考勤联动</span>
            </div>
            <div class="feature-item">
              <el-icon><DataAnalysis /></el-icon>
              <span>数据统计分析</span>
            </div>
            <div class="feature-item">
              <el-icon><Lock /></el-icon>
              <span>安全权限管理</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧表单区域 -->
      <div class="form-section">
        <div class="form-wrapper">
          <div class="form-header">
            <h2>欢迎登录</h2>
            <p>请输入您的账号信息</p>
          </div>

          <!-- Tab切换 -->
          <div class="tab-buttons">
            <button
              class="tab-btn"
              :class="{ active: loginType === 'account' }"
              @click="loginType = 'account'"
            >
              账号密码登录
            </button>
            <button
              class="tab-btn"
              :class="{ active: loginType === 'qrcode' }"
              @click="loginType = 'qrcode'"
            >
              扫码登录
            </button>
          </div>

          <!-- 登录表单 -->
          <el-form
            v-if="loginType === 'account'"
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
          >
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                size="large"
                :prefix-icon="User"
              />
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                :prefix-icon="Lock"
                show-password
                @keyup.enter="handleLogin"
              />
            </el-form-item>

            <el-form-item>
              <div class="form-options">
                <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
                <a href="#" class="forgot-link">忘记密码？</a>
              </div>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="login-btn"
                @click="handleLogin"
                :loading="loading"
              >
                立即登录
              </el-button>
            </el-form-item>
          </el-form>

          <!-- 扫码登录 -->
          <div v-else class="qrcode-container">
            <div class="qrcode-placeholder">
              <el-icon :size="120" color="#909399">
                <Connection />
              </el-icon>
              <p>扫码功能暂未开放</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, School, Check, Clock, DataAnalysis, Connection } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const loginFormRef = ref<FormInstance>()
const loading = ref(false)
const loginType = ref('account')

// 登录表单数据 - 预填充用户名密码方便测试
const loginForm = reactive({
  username: 'admin',
  password: '123456',
  remember: true
})

// 表单验证规则
const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true

      // 模拟登录请求
      setTimeout(() => {
        loading.value = false

        // 这里应该调用实际的登录API
        // 现在模拟登录成功
        if (loginForm.username === 'admin' && loginForm.password === '123456') {
          ElMessage.success('登录成功！')

          // 保存登录信息到localStorage或vuex
          localStorage.setItem('token', 'mock-token-123456')
          localStorage.setItem('userInfo', JSON.stringify({
            username: loginForm.username,
            role: 'admin',
            name: '系统管理员'
          }))

          // 跳转到首页
          router.push('/dashboard')
        } else {
          ElMessage.error('用户名或密码错误')
        }
      }, 1000)
    }
  })
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;

  // 背景装饰
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
      top: 70%;
      right: 10%;
      animation-delay: 2s;
    }

    &.shape-3 {
      width: 60px;
      height: 60px;
      bottom: 10%;
      left: 30%;
      animation-delay: 4s;
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.login-card {
  background: white;
  border-radius: $radius-card;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  width: 100%;
  max-width: 900px;
  min-height: 600px;
  position: relative;
  z-index: 1;
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
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="white" opacity="0.3"/><circle cx="80" cy="80" r="2" fill="white" opacity="0.3"/><circle cx="50" cy="50" r="2" fill="white" opacity="0.3"/></svg>');
    opacity: 0.3;
  }

  .brand-content {
    position: relative;
    z-index: 1;
    color: white;
    text-align: center;
  }

  .logo {
    margin-bottom: 30px;

    .el-icon {
      background: rgba(255, 255, 255, 0.2);
      padding: 15px;
      border-radius: 15px;
    }
  }

  .brand-title {
    font-size: $font-size-title;
    font-weight: 600;
    margin-bottom: 15px;
    line-height: 1.2;
  }

  .brand-subtitle {
    font-size: $font-size-subtitle;
    opacity: 0.9;
    margin-bottom: 40px;
    line-height: 1.5;
  }

  .features {
    display: flex;
    flex-direction: column;
    gap: 15px;
    text-align: left;
  }

  .feature-item {
    display: flex;
    align-items: center;
    font-size: $font-size-base;

    .el-icon {
      margin-right: 10px;
      background: rgba(255, 255, 255, 0.2);
      padding: 5px;
      border-radius: 50%;
      font-size: 12px;
    }
  }
}

// 右侧表单区域
.form-section {
  flex: 1;
  padding: 60px 50px;
  display: flex;
  align-items: center;
  justify-content: center;

  .form-wrapper {
    width: 100%;
    max-width: 400px;
  }

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
      font-size: $font-size-base;
    }
  }
}

// Tab切换
.tab-buttons {
  display: flex;
  background: $bg-color;
  border-radius: $radius-button;
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
    font-size: $font-size-base;
    font-weight: 500;
    color: $text-secondary;

    &:hover {
      color: $primary-color;
    }

    &.active {
      background: white;
      color: $primary-color;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }
}

// 登录表单
.login-form {
  :deep(.el-input) {
    height: 48px;

    .el-input__wrapper {
      border-radius: $radius-input;
      transition: all 0.3s ease;

      &.is-focus {
        box-shadow: 0 0 0 2px rgba($primary-color, 0.2);
      }
    }

    .el-input__inner {
      height: 46px;
      line-height: 46px;
    }
  }

  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .forgot-link {
      color: $primary-color;
      text-decoration: none;
      font-size: $font-size-base;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.login-btn {
  width: 100%;
  height: 48px;
  border-radius: $radius-button;
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

// 扫码登录
.qrcode-container {
  padding: 40px 0;

  .qrcode-placeholder {
    text-align: center;

    p {
      margin-top: 20px;
      color: $text-secondary;
      font-size: $font-size-base;
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

    .brand-title {
      font-size: 20px;
    }

    .features {
      display: none;
    }
  }

  .form-section {
    padding: 40px 30px;
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 10px;
  }

  .brand-section {
    padding: 30px 20px;
  }

  .form-section {
    padding: 30px 20px;
  }
}
</style>