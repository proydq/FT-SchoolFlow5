<template>
  <div class="layout-container">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="sidebarWidth" class="layout-sidebar">
        <Sidebar :collapse="isCollapse" />
      </el-aside>

      <el-container>
        <!-- 顶部导航栏 -->
        <el-header class="layout-header">
          <Header @toggle-sidebar="toggleSidebar" :is-collapse="isCollapse" />
        </el-header>

        <!-- 主体内容区 -->
        <el-main class="layout-main">
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

<script setup lang="ts">
import { ref, computed } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'

// 侧边栏折叠状态
const isCollapse = ref(false)

// 侧边栏宽度
const sidebarWidth = computed(() => isCollapse.value ? '64px' : '210px')

// 缓存的视图
const cachedViews = ref<string[]>(['Dashboard'])

// 切换侧边栏折叠状态
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}
</script>

<style lang="scss" scoped>
.layout-container {
  width: 100%;
  height: 100vh;

  .el-container {
    height: 100%;
  }
}

.layout-sidebar {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;

  &::-webkit-scrollbar {
    width: 0;
  }
}

.layout-header {
  height: 60px;
  padding: 0;
  background-color: white;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.layout-main {
  background-color: #f5f7fa;
  padding: 20px;
  overflow: auto;
}

// 路由切换动画
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>