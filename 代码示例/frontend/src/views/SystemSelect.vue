<template>
  <div class="system-select-container">
    <div class="header">
      <div class="header-left">
        <div class="logo">
          <el-icon size="32" color="#409EFF"><Platform /></el-icon>
          <span class="company-name">海外营销管理平台</span>
        </div>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="goToHelp">帮助中心</el-button>
        <el-dropdown @command="handleUserAction">
          <div class="user-info">
            <el-avatar size="small" :src="userInfo.avatar">
              {{ userInfo.name.charAt(0) }}
            </el-avatar>
            <span class="username">{{ userInfo.name }}</span>
            <el-icon><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人设置</el-dropdown-item>
              <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <div class="content">
      <div class="system-grid">
        <div
          v-for="system in systemList"
          :key="system.id"
          :class="['system-card', { 'disabled': !system.enabled }]"
          @click="handleSystemClick(system)"
        >
          <div class="system-icon">
            <el-icon :size="48" :class="{ 'gray-icon': !system.enabled }">
              <component :is="system.icon" />
            </el-icon>
          </div>
          <h3 class="system-name">{{ system.name }}</h3>
          <p class="system-description">{{ system.description }}</p>
          <div v-if="!system.enabled" class="disabled-tag">
            <el-tag type="info" size="small">未对接</el-tag>
          </div>
          <div v-else class="status-tag">
            <el-tag type="success" size="small">已启用</el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

// 用户信息
const userInfo = reactive({
  name: '张三',
  avatar: ''
})

// 系统列表
const systemList = ref([
  {
    id: 'dashboard',
    name: '营销控制台',
    description: '实时数据监控、活动概览、AI智能建议',
    icon: 'DataAnalysis',
    enabled: true,
    route: '/dashboard'
  },
  {
    id: 'product',
    name: '产品内容中心',
    description: '产品管理、多媒体资源、价格体系管理',
    icon: 'Box',
    enabled: true,
    route: '/product'
  },
  {
    id: 'customer',
    name: '客户采集管理',
    description: '数据导入、API采集、客户清洗与去重',
    icon: 'User',
    enabled: true,
    route: '/customer'
  },
  {
    id: 'ai-assistant',
    name: 'AI营销助手',
    description: '智能内容生成、多语言翻译、营销建议',
    icon: 'MagicStick',
    enabled: true,
    route: '/ai-assistant'
  },
  {
    id: 'customer-center',
    name: '客户管理中心',
    description: '客户360°画像、分组标签、评分分级',
    icon: 'UserFilled',
    enabled: true,
    route: '/customer-center'
  },
  {
    id: 'campaign',
    name: '营销活动管理',
    description: '活动创建、多渠道编排、执行监控',
    icon: 'Promotion',
    enabled: true,
    route: '/campaign'
  },
  {
    id: 'channel',
    name: '渠道触达模块',
    description: '邮件营销、社媒营销、WhatsApp集成',
    icon: 'Message',
    enabled: true,
    route: '/channel'
  },
  {
    id: 'tracking',
    name: '行为追踪分析',
    description: '邮件追踪、网站追踪、转化漏斗分析',
    icon: 'View',
    enabled: true,
    route: '/tracking'
  },
  {
    id: 'report',
    name: '报表中心',
    description: '营销分析、客户分析、自定义报表',
    icon: 'Document',
    enabled: true,
    route: '/report'
  },
  {
    id: 'system',
    name: '系统管理',
    description: '用户管理、角色权限、系统配置',
    icon: 'Setting',
    enabled: true,
    route: '/system'
  },
  {
    id: 'crm',
    name: 'CRM集成',
    description: '与第三方CRM系统数据同步',
    icon: 'Connection',
    enabled: false,
    route: '/crm'
  },
  {
    id: 'api',
    name: 'API管理',
    description: '开放API接口、SDK文档',
    icon: 'Link',
    enabled: false,
    route: '/api'
  }
])

// 处理系统卡片点击
const handleSystemClick = (system) => {
  if (!system.enabled) {
    ElMessage.warning('该模块暂未开放，敬请期待')
    return
  }
  
  ElMessage.success(`正在进入${system.name}...`)
  
  // 模拟跳转延迟
  setTimeout(() => {
    router.push(system.route)
  }, 500)
}

// 处理用户操作
const handleUserAction = async (command) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人设置功能开发中...')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm(
          '确定要退出登录吗？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        )
        
        ElMessage.success('已退出登录')
        router.push('/login')
      } catch {
        // 用户取消退出
      }
      break
  }
}

// 前往帮助中心
const goToHelp = () => {
  ElMessage.info('帮助中心功能开发中...')
}
</script>

<style scoped lang="scss">
.system-select-container {
  min-height: 100vh;
  background-color: $bg-page;
}

.header {
  height: $header-height;
  background: $bg-white;
  border-bottom: 1px solid $border-light;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $spacing-lg;
  
  .header-left {
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .company-name {
        font-size: 18px;
        font-weight: 500;
        color: $text-primary;
      }
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: $spacing-lg;
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color $transition-duration;
      
      &:hover {
        background-color: $bg-color;
      }
      
      .username {
        font-size: $font-size-base;
        color: $text-primary;
      }
    }
  }
}

.content {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
}


.system-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: $spacing-lg;
}

.system-card {
  background: $bg-white;
  padding: $spacing-xl;
  border-radius: 8px;
  box-shadow: $box-shadow-light;
  transition: all $transition-duration;
  cursor: pointer;
  position: relative;
  text-align: center;
  
  &:not(.disabled):hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }
  
  &.disabled {
    cursor: not-allowed;
    
    .system-icon,
    .system-name,
    .system-description {
      color: $text-placeholder;
    }
  }
  
  .system-icon {
    margin-bottom: $spacing-lg;
    color: $primary-color;
    
    &.gray-icon {
      color: $text-placeholder;
    }
  }
  
  .system-name {
    font-size: 20px;
    color: $text-primary;
    margin-bottom: $spacing-sm;
    font-weight: 500;
  }
  
  .system-description {
    font-size: $font-size-base;
    color: $text-secondary;
    line-height: 1.5;
    margin-bottom: $spacing-md;
  }
  
  .status-tag,
  .disabled-tag {
    position: absolute;
    top: 12px;
    right: 12px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .header {
    padding: 0 $spacing-md;
    
    .header-left .logo .company-name {
      display: none;
    }
    
    .header-right {
      gap: $spacing-sm;
    }
  }
  
  .content {
    padding: $spacing-lg;
  }
  
  .system-grid {
    grid-template-columns: 1fr;
    gap: $spacing-md;
  }
  
  .system-card {
    padding: $spacing-lg;
  }
}

@media (max-width: 480px) {
  .system-grid {
    grid-template-columns: 1fr;
  }
}
</style>