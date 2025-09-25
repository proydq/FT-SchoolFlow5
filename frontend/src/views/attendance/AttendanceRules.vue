<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <span>考勤规则</span>
      </template>
      <div class="placeholder">
        <el-icon :size="60" color="#909399"><SetUp /></el-icon>
        <p>考勤规则页面</p>
        <p class="desc">该功能正在开发中...</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { SetUp } from '@element-plus/icons-vue'
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
