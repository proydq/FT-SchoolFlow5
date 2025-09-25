<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="title">客户列表</h2>
      <p class="description">客户管理和查看</p>
    </div>
    
    <div class="coming-soon">
      <el-result
        icon="info"
        title="功能开发中"
        sub-title="客户列表功能正在开发中，敬请期待"
      >
        <template #extra>
          <el-button type="primary" @click="$router.go(-1)">返回</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup>
// 客户列表页面 - 占位页面
</script>

<style scoped lang="scss">
.coming-soon {
  margin-top: 100px;
}
</style>
