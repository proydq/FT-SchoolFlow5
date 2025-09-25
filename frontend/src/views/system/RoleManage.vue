<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <span>角色管理</span>
      </template>
      <div class="placeholder">
        <el-icon :size="60" color="#909399"><UserFilled /></el-icon>
        <p>角色管理页面</p>
        <p class="desc">该功能正在开发中...</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { UserFilled } from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
.page-container {
  padding: 20px;
}

.placeholder {
  text-align: center;
  padding: 60px 0;

  p {
    margin-top: 20px;
    font-size: 16px;
    color: #303133;

    &.desc {
      font-size: 14px;
      color: #909399;
    }
  }
}
</style>
