<template>
  <div class="exception-handling">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>异常通行处理</span>
        </div>
      </template>

      <div class="page-content">
        <el-alert
          title="功能开发中"
          type="info"
          description="异常通行处理功能正在开发中，敬请期待..."
          show-icon
          :closable="false"
        />

        <div class="placeholder-content">
          <h3>主要功能预览：</h3>
          <ul>
            <li>异常事件检测 - 自动检测和识别异常通行事件</li>
            <li>异常处理流程 - 标准化的异常事件处理流程</li>
            <li>处理结果记录 - 记录异常事件的处理过程和结果</li>
            <li>异常统计分析 - 统计分析异常事件的类型和频率</li>
            <li>预警机制配置 - 配置异常事件的预警规则和通知</li>
          </ul>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// 异常通行处理页面占位符
</script>

<style lang="scss" scoped>
.exception-handling {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
}

.page-content {
  padding: 20px 0;
}

.placeholder-content {
  margin-top: 30px;

  h3 {
    color: #409EFF;
    margin-bottom: 15px;
  }

  ul {
    li {
      margin-bottom: 8px;
      color: #666;
    }
  }
}
</style>