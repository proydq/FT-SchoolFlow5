<template>
  <div class="main-layout">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '240px'" class="sidebar">
        <div class="sidebar-header">
          <div v-if="!isCollapse" class="logo">
            <el-icon size="24" color="#409EFF"><Platform /></el-icon>
            <span class="title">营销系统</span>
          </div>
          <el-icon v-else size="24" color="#409EFF" class="logo-collapsed">
            <Platform />
          </el-icon>
        </div>
        
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          :unique-opened="true"
          class="sidebar-menu"
          background-color="#001529"
          text-color="#ffffff"
          active-text-color="#409EFF"
          @select="handleMenuSelect"
        >
          <template v-for="item in menuList" :key="item.path">
            <el-sub-menu v-if="item.children" :index="item.path" class="smooth-submenu">
              <template #title>
                <el-icon><component :is="item.icon" /></el-icon>
                <span>{{ item.title }}</span>
              </template>
              <el-menu-item
                v-for="child in item.children.filter(c => !c.hidden)"
                :key="child.path"
                :index="child.path"
                class="smooth-menu-item"
              >
                <el-icon><component :is="child.icon" /></el-icon>
                <span>{{ child.title }}</span>
              </el-menu-item>
            </el-sub-menu>
            
            <el-menu-item v-else :index="item.path">
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.title }}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </el-aside>
      
      <!-- 主内容区 -->
      <el-container>
        <!-- 顶部导航 -->
        <el-header class="header">
          <div class="header-left">
            <el-button
              type="text"
              @click="toggleCollapse"
              class="collapse-btn"
            >
              <el-icon size="20">
                <component :is="isCollapse ? 'Expand' : 'Fold'" />
              </el-icon>
            </el-button>
            
            <!-- 面包屑导航 -->
            <el-breadcrumb separator="/" class="breadcrumb">
              <el-breadcrumb-item
                v-for="item in breadcrumbList"
                :key="item.path"
                :to="item.path === currentRoute ? '' : { path: item.path }"
              >
                {{ item.title }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          
          <div class="header-right">
            <!-- 通知 -->
            <NotificationPanel 
              v-model:visible="notificationVisible"
              @update:count="updateNotificationCount"
            />
            
            <!-- 用户下拉菜单 -->
            <el-dropdown @command="handleUserCommand" class="user-dropdown">
              <div class="user-info">
                <el-avatar size="small" :src="userInfo.avatar">
                  {{ userInfo.name.charAt(0) }}
                </el-avatar>
                <span class="username">{{ userInfo.name }}</span>
                <el-icon><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>
                    个人中心
                  </el-dropdown-item>
                  <el-dropdown-item command="settings">
                    <el-icon><Setting /></el-icon>
                    系统设置
                  </el-dropdown-item>
                  <el-dropdown-item command="logout" divided>
                    <el-icon><SwitchButton /></el-icon>
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        
        
        <!-- 主要内容 -->
        <el-main class="main-content">
          <router-view v-slot="{ Component }">
            <transition name="fade-transform" mode="out-in">
              <keep-alive :include="cachedViews">
                <component :is="Component" />
              </keep-alive>
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import NotificationPanel from '@/components/NotificationPanel.vue'

const router = useRouter()
const route = useRoute()
const store = useStore()

// 响应式数据
const isCollapse = ref(false)
const activeMenu = ref('')
const notificationCount = ref(3)
const notificationVisible = ref(false)

// 从store获取用户信息
const userInfo = computed(() => {
  const storeUserInfo = store.getters['user/userInfo']
  return {
    name: storeUserInfo.name || storeUserInfo.username || '未登录',
    avatar: storeUserInfo.avatar || '',
    role: storeUserInfo.role === 'admin' ? '系统管理员' :
          storeUserInfo.role === 'user' ? '普通用户' :
          storeUserInfo.role || '访客'
  }
})

// 缓存的视图
const cachedViews = ref(['Dashboard'])

// 当前路由
const currentRoute = computed(() => route.path)

// 面包屑列表
const breadcrumbList = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  return matched.map(item => ({
    path: item.path,
    title: item.meta.title
  }))
})

// 菜单列表
const menuList = ref([
  {
    path: '/dashboard',
    title: '营销控制台',
    icon: 'DataAnalysis'
  },
  {
    path: '/product',
    title: '产品中心',
    icon: 'Box',
    children: [
      { path: '/product/category', title: '产品分类', icon: 'FolderOpened' },
      { path: '/product/list', title: '产品管理', icon: 'Goods' },
      { path: '/product/media', title: '多媒体管理', icon: 'Picture' },
      { path: '/product/multilang', title: '多语言内容', icon: 'ChatLineRound' },
      { path: '/product/price', title: '价格管理', icon: 'Money' }
    ]
  },
  // 保留原有的客户采集管理（已注释，可随时恢复）
  // {
  //   path: '/customer',
  //   title: '客户采集管理（旧）',
  //   icon: 'User',
  //   children: [
  //     { path: '/customer/import', title: '数据导入', icon: 'Upload' },
  //     { path: '/customer/api', title: 'API采集', icon: 'Connection' },
  //     { path: '/customer/clean', title: '数据清洗', icon: 'Brush' }
  //   ]
  // },

  // 新的客户采集管理模块
  {
    path: '/data-collection',
    title: '客户采集管理',
    icon: 'DataAnalysis',
    children: [
      { path: '/data-collection/company-discovery', title: '🎯 公司发现', icon: 'Search' },
      { path: '/data-collection/company-lists', title: '📋 我的公司列表', icon: 'List' },
      { path: '/data-collection/email-search', title: '📧 邮箱搜索', icon: 'Message', hidden: true },
      { path: '/data-collection/email-finder', title: '🔍 精准查找', icon: 'ZoomIn', hidden: true },
      { path: '/data-collection/email-verifier', title: '✅ 邮箱验证', icon: 'CircleCheck', hidden: true },
      { path: '/data-collection/enrichment', title: '💎 信息丰富化', icon: 'Star', hidden: true },
      { path: '/data-collection/monitor', title: '📊 采集监控', icon: 'DataLine' },
      { path: '/data-collection/settings', title: '⚙️ 采集配置', icon: 'Setting' }
    ]
  },
  {
    path: '/ai-assistant',
    title: 'AI营销助手',
    icon: 'MagicStick',
    children: [
      { path: '/ai-assistant/content', title: '内容生成', icon: 'EditPen' },
      { path: '/ai-assistant/email-template', title: '邮件模板生成', icon: 'Message' },
      { path: '/ai-assistant/social-content', title: '社媒话术生成', icon: 'ChatDotSquare' },
      { path: '/ai-assistant/multi-language', title: '多语言生成', icon: 'ChatLineRound' },
      { path: '/ai-assistant/translate', title: 'AI翻译助手', icon: 'Connection' },
      { path: '/ai-assistant/recommend', title: '智能推荐', icon: 'Star' }
    ]
  },
  {
    path: '/customer-center',
    title: '客户管理中心',
    icon: 'UserFilled',
    children: [
      { path: '/customer-center/list', title: '客户列表', icon: 'List' },
      { path: '/customer-center/profile', title: '客户画像', icon: 'Avatar' },
      { path: '/customer-center/group', title: '客户分组', icon: 'CollectionTag' }
    ]
  },
  {
    path: '/campaign',
    title: '营销活动管理',
    icon: 'Promotion',
    children: [
      { path: '/campaign/list', title: '活动列表', icon: 'List' },
      { path: '/campaign/template', title: '活动模板', icon: 'Document' }
    ]
  },
  {
    path: '/channel',
    title: '渠道触达模块',
    icon: 'Message',
    children: [
      { path: '/channel/email', title: '邮件营销', icon: 'Message' },
      { path: '/channel/social', title: '社媒营销', icon: 'ChatLineSquare' },
      { path: '/channel/whatsapp', title: 'WhatsApp', icon: 'ChatDotSquare' }
    ]
  },
  {
    path: '/tracking',
    title: '行为追踪分析',
    icon: 'View',
    children: [
      { path: '/tracking/email', title: '邮件追踪', icon: 'View' },
      { path: '/tracking/website', title: '网站追踪', icon: 'Monitor' },
      { path: '/tracking/funnel', title: '转化漏斗', icon: 'TrendCharts' }
    ]
  },
  {
    path: '/report',
    title: '报表中心',
    icon: 'Document',
    children: [
      { path: '/report/overview', title: '营销总览', icon: 'PieChart' },
      { path: '/report/customer', title: '客户分析', icon: 'TrendCharts' },
      { path: '/report/custom', title: '自定义报表', icon: 'Document' }
    ]
  },
  {
    path: '/system',
    title: '系统管理',
    icon: 'Setting',
    children: [
      { path: '/system/personnel', title: '人员信息', icon: 'User' },
      { path: '/system/account', title: '账号管理', icon: 'Key' },
      { path: '/system/role', title: '角色权限', icon: 'UserFilled' },
      { path: '/system/department', title: '部门管理', icon: 'OfficeBuilding' },
      { path: '/system/position', title: '岗位管理', icon: 'Suitcase' },
      { path: '/system/config', title: '系统配置', icon: 'Setting' },
      { path: '/system/log', title: '操作日志', icon: 'Document' },
      { path: '/system/notification', title: '消息管理', icon: 'Message' },
      { path: '/system/scheduled-tasks', title: '定时任务管理', icon: 'Timer' }
    ]
  }
])


// 切换侧边栏折叠
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 菜单选择
const handleMenuSelect = (path) => {
  router.push(path)
}

// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    activeMenu.value = newPath
  },
  { immediate: true }
)

// 更新通知数量
const updateNotificationCount = (count) => {
  notificationCount.value = count
}

// 用户操作
const handleUserCommand = async (command) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人中心功能开发中...')
      break
    case 'settings':
      ElMessage.info('系统设置功能开发中...')
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
        
        // 通过store清除登录状态
        await store.dispatch('user/logout')

        ElMessage.success('已退出登录')
        router.push('/login')
      } catch {
        // 用户取消
      }
      break
  }
}

// 初始化时获取用户信息
onMounted(async () => {
  // 如果没有用户信息，尝试获取
  if (!store.getters['user/userInfo'].username) {
    try {
      await store.dispatch('user/getUserInfo')
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }
})
</script>

<style scoped lang="scss">
.main-layout {
  height: 100vh;
  
  .el-container {
    height: 100%;
  }
}

.sidebar {
  background-color: #001529;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateZ(0);
  will-change: width;
  
  .sidebar-header {
    height: $header-height;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid #1f1f1f;
    
    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
      color: white;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      
      .title {
        font-size: 18px;
        font-weight: 500;
        white-space: nowrap;
        opacity: 1;
        transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
    }
    
    .logo-collapsed {
      color: #409EFF;
      
      .title {
        opacity: 0;
      }
    }
  }
  
  .sidebar-menu {
    border-right: none;
    height: calc(100vh - #{$header-height});
    overflow-y: auto;
    overflow-x: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:not(.el-menu--collapse) {
      width: 240px;
    }
    
    // 优化菜单项过渡
    .el-menu-item,
    .el-sub-menu {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    // 子菜单展开优化
    .el-sub-menu__title {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .el-menu--popup {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
  }
}

.header {
  background: $bg-white;
  border-bottom: 1px solid $border-light;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $spacing-lg;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  
  .header-left {
    display: flex;
    align-items: center;
    gap: $spacing-lg;
    
    .collapse-btn {
      color: $text-primary;
      
      &:hover {
        background-color: $bg-color;
      }
    }
    
    .breadcrumb {
      font-size: $font-size-base;
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    
    .el-button {
      color: $text-primary;
      
      &:hover {
        background-color: $bg-color;
      }
    }
    
    .user-dropdown {
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
}


.main-content {
  background: $bg-page;
  padding: $spacing-lg;
  overflow-y: auto;
}

// 页面切换动画
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all $transition-duration;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

// 全局优化Element Plus菜单动画
::deep(.el-menu) {
  .el-menu-item,
  .el-sub-menu {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  
  .el-sub-menu__title {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  
  .el-menu--collapse {
    .el-menu-item [class^=el-icon] {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    
    .el-sub-menu {
      .el-sub-menu__title {
        .el-sub-menu__icon-arrow {
          opacity: 0;
          transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
      }
    }
  }
  
  // 优化子菜单弹出动画
  .el-menu--popup {
    .el-menu-item {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
  }
  
  // 全局子菜单动画优化 - 统一的快速响应
  .el-sub-menu .el-menu {
    transition: height 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
    transform: translateZ(0);
    will-change: height;
    contain: layout;
    backface-visibility: hidden;
  }
  
  // 通用的平滑子菜单样式 - 应用到所有子菜单
  .smooth-submenu {
    .el-sub-menu__title {
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      transform: translateZ(0);
      will-change: background-color, color;
      backface-visibility: hidden;
    }
    
    // 子菜单内容区域
    .el-menu--inline {
      transition: height 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      transform: translateZ(0);
      will-change: height;
      contain: layout style;
      backface-visibility: hidden;
    }
    
    // 展开状态
    &.is-opened {
      .el-menu--inline {
        transform: translateZ(0);
      }
      
      .el-menu-item {
        animation: fadeInUp 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }
    }
    
    // 收起状态
    &:not(.is-opened) {
      .el-menu--inline {
        overflow: hidden;
      }
    }
  }
  
  // 子菜单项样式
  .smooth-menu-item {
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1) !important;
    transform: translateZ(0);
    will-change: background-color, color, transform;
    backface-visibility: hidden;
    
    &:hover {
      transform: translateZ(0) translateX(2px);
      transition-duration: 0.1s;
    }
  }
  
  // 展开动画关键帧
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

// 优化折叠时的文字淡出效果
::deep(.el-menu--collapse) {
  .el-menu-item-group__title,
  .el-menu-item span,
  .el-sub-menu__title span {
    opacity: 0;
    transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
}

::deep(.el-menu:not(.el-menu--collapse)) {
  .el-menu-item-group__title,
  .el-menu-item span,
  .el-sub-menu__title span {
    opacity: 1;
    transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
}

// 优化滚动条样式
.sidebar-menu::-webkit-scrollbar {
  width: 6px;
}

.sidebar-menu::-webkit-scrollbar-track {
  background: #001529;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}

</style>