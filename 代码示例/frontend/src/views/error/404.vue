<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-image">
        <el-icon size="120" color="#409EFF"><WarningFilled /></el-icon>
      </div>
      
      <div class="error-info">
        <h1 class="error-title">404</h1>
        <h2 class="error-subtitle">页面不存在</h2>
        <p class="error-description">
          抱歉，您访问的页面不存在或已被移动。
        </p>
        
        <div class="error-actions">
          <el-button type="primary" size="large" @click="goBack">
            <el-icon><Back /></el-icon>
            返回上页
          </el-button>
          <el-button size="large" @click="goHome">
            <el-icon><HomeFilled /></el-icon>
            回到首页
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.go(-1)
}

const goHome = () => {
  router.push('/dashboard')
}
</script>

<style scoped lang="scss">
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.error-content {
  text-align: center;
  background: white;
  border-radius: 12px;
  padding: 60px 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.error-image {
  margin-bottom: 30px;
}

.error-info {
  .error-title {
    font-size: 72px;
    font-weight: 700;
    color: $primary-color;
    margin: 0 0 10px 0;
    line-height: 1;
  }
  
  .error-subtitle {
    font-size: 24px;
    color: $text-primary;
    margin: 0 0 16px 0;
    font-weight: 500;
  }
  
  .error-description {
    color: $text-secondary;
    font-size: 16px;
    margin: 0 0 40px 0;
    line-height: 1.6;
  }
  
  .error-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .error-content {
    padding: 40px 20px;
  }
  
  .error-info {
    .error-title {
      font-size: 48px;
    }
    
    .error-subtitle {
      font-size: 20px;
    }
    
    .error-actions {
      flex-direction: column;
      
      .el-button {
        width: 100%;
      }
    }
  }
}
</style>