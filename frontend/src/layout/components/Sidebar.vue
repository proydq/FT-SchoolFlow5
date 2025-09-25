<template>
  <div class="sidebar-container">
    <!-- Logo区域 -->
    <div class="sidebar-logo">
      <transition name="sidebar-logo-fade">
        <router-link to="/dashboard" class="sidebar-logo-link">
          <el-icon :size="collapse ? 24 : 28" class="logo-icon">
            <School />
          </el-icon>
          <h1 v-if="!collapse" class="sidebar-title">福田林校</h1>
        </router-link>
      </transition>
    </div>

    <!-- 菜单区域 -->
    <el-scrollbar class="sidebar-scrollbar">
      <el-menu
        :default-active="activeMenu"
        :collapse="collapse"
        :unique-opened="true"
        :collapse-transition="false"
        mode="vertical"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        @select="handleSelect"
      >
        <!-- 首页 -->
        <el-menu-item index="/dashboard">
          <el-icon><HomeFilled /></el-icon>
          <template #title>首页</template>
        </el-menu-item>

        <!-- 人员信息管理 -->
        <el-sub-menu index="personnel">
          <template #title>
            <el-icon><UserFilled /></el-icon>
            <span>人员信息管理</span>
          </template>
          <el-menu-item index="/personnel/teacher">
            <el-icon><User /></el-icon>
            <span>教师信息</span>
          </el-menu-item>
          <el-menu-item index="/personnel/student">
            <el-icon><User /></el-icon>
            <span>学生信息</span>
          </el-menu-item>
          <el-menu-item index="/personnel/guardian">
            <el-icon><Avatar /></el-icon>
            <span>监护人信息</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 班级信息管理 -->
        <el-sub-menu index="class">
          <template #title>
            <el-icon><School /></el-icon>
            <span>班级信息管理</span>
          </template>
          <el-menu-item index="/class/grade">
            <el-icon><Grid /></el-icon>
            <span>年级管理</span>
          </el-menu-item>
          <el-menu-item index="/class/list">
            <el-icon><List /></el-icon>
            <span>班级列表</span>
          </el-menu-item>
          <el-menu-item index="/class/assignment">
            <el-icon><Connection /></el-icon>
            <span>班主任分配</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 请假管理 -->
        <el-sub-menu index="leave">
          <template #title>
            <el-icon><Calendar /></el-icon>
            <span>请假管理</span>
          </template>
          <el-menu-item index="/leave/type">
            <el-icon><Setting /></el-icon>
            <span>请假类型配置</span>
          </el-menu-item>
          <el-menu-item index="/leave/apply">
            <el-icon><DocumentAdd /></el-icon>
            <span>请假申请</span>
          </el-menu-item>
          <el-menu-item index="/leave/approval">
            <el-icon><CircleCheck /></el-icon>
            <span>请假审批</span>
          </el-menu-item>
          <el-menu-item index="/leave/record">
            <el-icon><Document /></el-icon>
            <span>请假记录</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 考勤管理 -->
        <el-sub-menu index="attendance">
          <template #title>
            <el-icon><Clock /></el-icon>
            <span>考勤管理</span>
          </template>
          <el-menu-item index="/attendance/rules">
            <el-icon><SetUp /></el-icon>
            <span>考勤规则</span>
          </el-menu-item>
          <el-menu-item index="/attendance/record">
            <el-icon><Tickets /></el-icon>
            <span>考勤记录</span>
          </el-menu-item>
          <el-menu-item index="/attendance/statistics">
            <el-icon><DataAnalysis /></el-icon>
            <span>考勤统计</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 门禁通行管理 -->
        <el-sub-menu index="access">
          <template #title>
            <el-icon><Lock /></el-icon>
            <span>门禁通行管理</span>
          </template>
          <el-menu-item index="/access/device">
            <el-icon><Monitor /></el-icon>
            <span>设备管理</span>
          </el-menu-item>
          <el-menu-item index="/access/permission">
            <el-icon><Key /></el-icon>
            <span>通行权限</span>
          </el-menu-item>
          <el-menu-item index="/access/record">
            <el-icon><Document /></el-icon>
            <span>通行记录</span>
          </el-menu-item>
          <el-menu-item index="/access/exception">
            <el-icon><Warning /></el-icon>
            <span>异常通行处理</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 系统配置 -->
        <el-sub-menu index="system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统配置</span>
          </template>
          <el-menu-item index="/system/account">
            <el-icon><User /></el-icon>
            <span>账号管理</span>
          </el-menu-item>
          <el-menu-item index="/system/role-permission">
            <el-icon><Key /></el-icon>
            <span>角色权限</span>
          </el-menu-item>
          <el-menu-item index="/system/department">
            <el-icon><OfficeBuilding /></el-icon>
            <span>部门管理</span>
          </el-menu-item>
          <el-menu-item index="/system/position">
            <el-icon><Suitcase /></el-icon>
            <span>岗位管理</span>
          </el-menu-item>
          <el-menu-item index="/system/operation-log">
            <el-icon><Document /></el-icon>
            <span>操作日志</span>
          </el-menu-item>
          <el-menu-item index="/system/message">
            <el-icon><Message /></el-icon>
            <span>消息管理</span>
          </el-menu-item>
          <el-menu-item index="/system/scheduled-tasks">
            <el-icon><Timer /></el-icon>
            <span>定时任务</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  HomeFilled,
  UserFilled,
  User,
  Avatar,
  School,
  Grid,
  List,
  Connection,
  Calendar,
  Setting,
  DocumentAdd,
  CircleCheck,
  Document,
  Clock,
  SetUp,
  Tickets,
  DataAnalysis,
  Key,
  OfficeBuilding,
  Suitcase,
  Message,
  Timer,
  Lock,
  Monitor,
  Warning
} from '@element-plus/icons-vue'

const props = defineProps<{
  collapse: boolean
}>()

const route = useRoute()
const router = useRouter()

// 当前激活的菜单
const activeMenu = computed(() => {
  const { path } = route

  // 根据路径匹配对应的菜单项
  if (path.startsWith('/class/')) {
    // 班级相关页面，根据具体路径返回对应菜单
    if (path.includes('/grade')) {
      return '/class/grade'
    }
    if (path.includes('/assignment')) {
      return '/class/assignment'
    }
    // 其他班级页面（详情、编辑、导入等）都归到班级列表
    return '/class/list'
  }

  if (path.startsWith('/personnel/')) {
    if (path.includes('/teacher')) {
      return '/personnel/teacher'
    }
    if (path.includes('/student')) {
      return '/personnel/student'
    }
    if (path.includes('/guardian')) {
      return '/personnel/guardian'
    }
  }

  if (path.startsWith('/leave/')) {
    if (path.includes('/type')) {
      return '/leave/type'
    }
    if (path.includes('/apply')) {
      return '/leave/apply'
    }
    if (path.includes('/approval')) {
      return '/leave/approval'
    }
    if (path.includes('/record')) {
      return '/leave/record'
    }
  }

  if (path.startsWith('/attendance/')) {
    if (path.includes('/rule')) {
      return '/attendance/rules'
    }
    if (path.includes('/record')) {
      return '/attendance/record'
    }
    if (path.includes('/statistics')) {
      return '/attendance/statistics'
    }
  }

  if (path.startsWith('/access/')) {
    if (path.includes('/permission')) {
      return '/access/permission'
    }
    if (path.includes('/record')) {
      return '/access/record'
    }
    if (path.includes('/device')) {
      return '/access/device'
    }
    if (path.includes('/exception')) {
      return '/access/exception'
    }
  }

  if (path.startsWith('/system/')) {
    if (path.includes('/account')) {
      return '/system/account'
    }
    if (path.includes('/role-permission')) {
      return '/system/role-permission'
    }
    if (path.includes('/department')) {
      return '/system/department'
    }
    if (path.includes('/position')) {
      return '/system/position'
    }
    if (path.includes('/role')) {
      return '/system/role'
    }
    if (path.includes('/operation-log')) {
      return '/system/operation-log'
    }
    if (path.includes('/message')) {
      return '/system/message'
    }
    if (path.includes('/scheduled-tasks')) {
      return '/system/scheduled-tasks'
    }
  }

  return path
})

// 处理菜单选择
const handleSelect = (index: string) => {
  // 如果index是路径，则跳转
  if (index.startsWith('/')) {
    router.push(index)
  }
}
</script>

<style lang="scss" scoped>
.sidebar-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

// Logo区域
.sidebar-logo {
  height: 60px;
  background-color: #2b3548;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  .sidebar-logo-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    text-decoration: none;

    .logo-icon {
      color: #409EFF;
      transition: all 0.3s;
    }

    .sidebar-title {
      color: white;
      margin: 0 0 0 12px;
      font-size: 18px;
      font-weight: 600;
      white-space: nowrap;
      transition: all 0.3s;
    }

    &:hover {
      .logo-icon {
        transform: rotate(360deg);
      }
    }
  }
}

// 滚动区域
.sidebar-scrollbar {
  flex: 1;
  overflow: hidden;

  :deep(.el-scrollbar__wrap) {
    overflow-x: hidden;
  }
}

// 菜单样式
:deep(.el-menu) {
  border: none;
  width: 100%;

  // 菜单项
  .el-menu-item {
    &:hover {
      background-color: #263445 !important;
    }

    &.is-active {
      background-color: rgba(64, 158, 255, 0.1) !important;
    }
  }

  // 子菜单
  .el-sub-menu {
    .el-sub-menu__title {
      &:hover {
        background-color: #263445 !important;
      }
    }

    // 子菜单项
    .el-menu-item {
      min-width: 210px;
      padding-left: 50px !important;

      &:hover {
        background-color: #001528 !important;
      }

      &.is-active {
        background-color: rgba(64, 158, 255, 0.2) !important;
      }
    }
  }

  // 折叠时的样式
  &.el-menu--collapse {
    .el-sub-menu {
      &.is-active {
        .el-sub-menu__title {
          color: #409EFF !important;
        }
      }
    }

    .el-menu-item {
      padding-left: 20px !important;
    }
  }

  // 图标样式
  .el-icon {
    margin-right: 5px;
    width: 20px;
    text-align: center;
    font-size: 16px;
    vertical-align: middle;
  }
}

// Logo过渡动画
.sidebar-logo-fade-enter-active,
.sidebar-logo-fade-leave-active {
  transition: opacity 0.3s;
}

.sidebar-logo-fade-enter-from,
.sidebar-logo-fade-leave-to {
  opacity: 0;
}
</style>