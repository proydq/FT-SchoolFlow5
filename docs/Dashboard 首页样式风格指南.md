# Dashboard 首页样式风格指南

## 页面概述
Dashboard 首页采用现代化的数据可视化设计，通过渐变色彩、卡片布局和动态交互效果，打造专业且富有活力的管理控制台界面。

## 1. 页面布局结构

### 1.1 整体容器
```scss
.dashboard-container {
  padding: 24px;
  background: #F5F7FA;  // 浅灰色背景
  min-height: calc(100vh - 60px);  // 减去顶部导航高度
}
```

### 1.2 页面分区
- **欢迎区域**：顶部渐变背景的问候模块
- **统计概览**：4个并列的统计卡片
- **主内容区**：2x2 四等分网格布局
  - 趋势分析（左上）
  - 排行（右上）
  - 最新动态（左下）
  - 待办事项（右下）

## 2. 欢迎区域设计

### 2.1 渐变背景
```scss
.welcome-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
  color: white;
}
```

### 2.2 布局特点
- 左侧：欢迎标题 + 日期描述
- 右侧：天气信息卡片
- 标题字号：28px，font-weight: 500
- 描述文字：14px，opacity: 0.9

### 2.3 天气信息卡片
```scss
.weather-info {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);  // 半透明白色背景
  padding: 8px 16px;
  border-radius: 20px;  // 胶囊形状
  font-size: 14px;
}
```

## 3. 统计卡片设计

### 3.1 卡片样式
```scss
.stat-card {
  border-radius: 12px;
  padding: 20px;
  color: white;
  min-height: 140px;
  transition: all 0.3s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);  // 悬浮上移效果
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
}
```

### 3.2 卡片渐变配色
```javascript
// 四种渐变背景色
'linear-gradient(135deg, #667eea, #764ba2)'  // 紫色渐变
'linear-gradient(135deg, #11998e, #38ef7d)'  // 绿色渐变
'linear-gradient(135deg, #fa709a, #fee140)'  // 橙粉渐变
'linear-gradient(135deg, #f093fb, #f5576c)'  // 粉红渐变
```

### 3.3 卡片内容结构
- **头部**：图标（28px）+ 趋势标签
- **数值**：32px 加粗字体
- **标题**：14px，opacity: 0.9
- **底部**：标签文字 + 百分比

### 3.4 图标设计
```scss
.el-icon {
  background: rgba(255, 255, 255, 0.3);  // 半透明白色背景
  border-radius: 8px;
  padding: 8px;
}
```

## 4. 主内容区四等分布局

### 4.1 统一卡片高度
```scss
.equal-height-card {
  height: 450px;  // 固定高度确保对齐
  
  :deep(.el-card__body) {
    height: calc(100% - 60px);  // 减去卡片头部高度
    padding: 20px;
  }
}
```

### 4.2 卡片头部设计
```scss
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .title {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
  }
}
```

## 5. 特色组件设计

### 5.1 部门排行榜
```scss
.ranking-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #EBEEF5;
  
  .rank-badge {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    font-size: 12px;
    font-weight: bold;
    
    &.rank-1 { background: #ffd700; color: #fff; }  // 金牌
    &.rank-2 { background: #c0c0c0; color: #fff; }  // 银牌
    &.rank-3 { background: #cd7f32; color: #fff; }  // 铜牌
  }
  
  .rank-value {
    font-size: 14px;
    font-weight: bold;
    color: #409EFF;
  }
}
```

### 5.2 进度条配色
```javascript
getRankColor(index) {
  const colors = ['#67C23A', '#409EFF', '#E6A23C']
  return colors[index] || '#909399'
}
```

### 5.3 最新动态时间轴
```scss
.activity-content {
  display: flex;
  gap: 8px;
  
  .activity-text {
    font-size: 13px;
    color: #303133;
    line-height: 1.4;
  }
  
  .activity-detail {
    font-size: 11px;
    color: #909399;
    background: #F5F7FA;
    padding: 6px 8px;
    border-radius: 4px;
    margin-top: 6px;
  }
}
```

### 5.4 待办事项列表
```scss
.todo-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #EBEEF5;
  
  .todo-title {
    font-size: 13px;
    color: #303133;
    line-height: 1.4;
  }
  
  .todo-time {
    font-size: 11px;
    color: #909399;
    display: flex;
    align-items: center;
    gap: 4px;
  }
}
```

### 5.5 优先级标签配色
- **高优先级**：danger (#F56C6C)
- **中优先级**：warning (#E6A23C)
- **低优先级**：info (#909399)

## 6. 交互效果

### 6.1 卡片悬浮效果
```scss
// 统计卡片
transform: translateY(-5px);
box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);

// 快捷操作
transform: translateY(-2px);
background: #F5F7FA;
```

### 6.2 过渡动画
```scss
transition: all 0.3s;  // 统一过渡时间
```

### 6.3 图标缩放
```scss
.action-icon {
  transition: all 0.3s;
  
  &:hover {
    transform: scale(1.1);
  }
}
```

## 7. 滚动条美化
```scss
el-scrollbar {
  max-height: 350px;  // 动态列表最大高度
}
```

## 8. 响应式设计

### 8.1 平板端 (≤768px)
```scss
@media (max-width: 768px) {
  // 欢迎区域改为垂直布局
  .welcome-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  // 卡片高度自适应
  .equal-height-card {
    height: auto;
    min-height: 300px;
  }
  
  // 快捷操作改为3列
  .quick-actions {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### 8.2 手机端 (≤576px)
```scss
@media (max-width: 576px) {
  // 快捷操作改为2列
  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

### 8.3 栅格响应
- xs (手机): 单列布局，每个卡片占满宽度
- sm (平板): 双列布局，每个卡片占50%
- md+ (桌面): 四等分布局，每个卡片占25%

## 9. 视觉层次

### 9.1 颜色层级
1. **主要内容**：#303133 (深灰)
2. **次要内容**：#606266 (中灰)
3. **辅助信息**：#909399 (浅灰)
4. **背景层**：#F5F7FA (超浅灰)

### 9.2 字号层级
- **欢迎标题**：28px
- **统计数值**：32px
- **卡片标题**：16px
- **正文内容**：13-14px
- **辅助信息**：11-12px

### 9.3 间距规范
- **页面边距**：24px
- **卡片间距**：20px (gutter)
- **卡片内边距**：20px
- **元素间距**：8-12px

## 10. 设计理念

### 10.1 核心特色
- **渐变美学**：紫色系渐变营造科技感
- **卡片化**：信息模块化，边界清晰
- **数据可视化**：直观展示关键指标
- **扁平化**：简洁现代的视觉风格

### 10.2 用户体验
- **信息密度适中**：避免信息过载
- **视觉引导**：通过颜色和大小突出重点
- **交互反馈**：悬浮效果增强可点击感
- **响应式适配**：多端体验一致

## 11. 实施建议

### 11.1 复用此风格时
1. 保持渐变色的角度一致 (135deg)
2. 统计卡片保持相同的高度和间距
3. 使用相同的悬浮动画效果
4. 保持字号和颜色的层级关系

### 11.2 自定义调整
- 可更换渐变色组合，但保持色彩饱和度
- 可调整卡片高度，但保持四等分对齐
- 可增减统计指标，但保持4个一组
- 可自定义图标，但保持尺寸一致

### 11.3 性能优化
- 使用 CSS transform 而非 position 实现动画
- 列表数据使用虚拟滚动（如数据量大）
- 图表组件按需加载
- 响应式断点合理设置

---

**此样式指南专门针对 Dashboard 首页设计，可直接用于类似的数据管理后台首页开发。**