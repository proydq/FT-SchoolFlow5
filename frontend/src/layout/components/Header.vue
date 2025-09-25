<template>
  <div class="header-container">
    <div class="header-left">
      <!-- 折叠按钮 -->
      <div class="hamburger" @click="toggleSidebar">
        <el-icon :size="20">
          <Fold v-if="!isCollapse" />
          <Expand v-else />
        </el-icon>
      </div>

      <!-- 面包屑导航 -->
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item v-for="item in breadcrumbList" :key="item.path">
          {{ item.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="header-right">
      <!-- 消息通知 -->
      <div class="header-item">
        <el-badge :value="12" class="notification">
          <el-icon :size="20">
            <Bell />
          </el-icon>
        </el-badge>
      </div>

      <!-- 用户信息下拉 -->
      <el-dropdown class="user-dropdown" trigger="click" @command="handleCommand">
        <div class="user-info">
          <el-avatar :size="32" class="user-avatar">
            {{ userInfo?.name?.charAt(0) || 'U' }}
          </el-avatar>
          <span class="user-name">{{ userInfo?.name || '用户' }}</span>
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              个人中心
            </el-dropdown-item>
            <el-dropdown-item command="setting">
              <el-icon><Setting /></el-icon>
              系统设置
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Fold,
  Expand,
  Bell,
  ArrowDown,
  User,
  Setting,
  SwitchButton
} from '@element-plus/icons-vue'

const props = defineProps<{
  isCollapse: boolean
}>()

const emit = defineEmits<{
  'toggle-sidebar': []
}>()

const route = useRoute()
const router = useRouter()
const store = useStore()

// 用户信息
const userInfo = computed(() => store.state.userInfo)

// 面包屑列表
const breadcrumbList = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  return matched.slice(1).map(item => ({
    path: item.path,
    title: item.meta.title
  }))
})

// 切换侧边栏
const toggleSidebar = () => {
  emit('toggle-sidebar')
}

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'setting':
      router.push('/setting')
      break
    case 'logout':
      handleLogout()
      break
  }
}

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    store.dispatch('logout')
    ElMessage.success('已退出登录')
    router.push('/login')
  }).catch(() => {
    // 取消操作
  })
}
</script>

<style lang="scss" scoped>
.header-container {
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background-color: white;
}

.header-left {
  display: flex;
  align-items: center;

  .hamburger {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 15px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb {
    margin-left: 15px;
  }
}

.header-right {
  display: flex;
  align-items: center;

  .header-item {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 60px;
    padding: 0 12px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: rgba(0, 0, 0, 0.025);
    }
  }

  .notification {
    display: flex;
    align-items: center;
  }

  .user-dropdown {
    height: 60px;
    padding: 0 12px;
    cursor: pointer;

    .user-info {
      display: flex;
      align-items: center;
      height: 100%;

      .user-avatar {
        background-color: $primary-color;
        color: white;
        font-weight: 600;
      }

      .user-name {
        margin-left: 8px;
        margin-right: 8px;
        font-size: 14px;
        color: $text-primary;
      }
    }

    &:hover {
      background-color: rgba(0, 0, 0, 0.025);
    }
  }
}

:deep(.el-dropdown-menu__item) {
  padding: 8px 20px;

  .el-icon {
    margin-right: 5px;
  }
}
</style>