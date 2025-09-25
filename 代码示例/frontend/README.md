# 海外营销管理系统 - 前端

基于 Vue 3 + Element Plus 的现代化海外营销管理系统前端应用。

## 技术栈

- **框架**: Vue 3.3.4
- **构建工具**: Vite 5.0.8
- **UI组件库**: Element Plus 2.4.3
- **状态管理**: Vuex 4.1.0
- **路由**: Vue Router 4.2.5
- **样式**: Sass 1.69.5
- **图表**: ECharts 5.4.3
- **HTTP请求**: Axios 1.6.2
- **日期处理**: Day.js 1.11.10

## 功能模块

### 第一阶段（已完成）
- ✅ 登录认证（账号密码 + 手机验证码）
- ✅ 系统框架布局
- ✅ 系统选择页面
- ✅ 营销控制台（Dashboard）
- ✅ 路由配置和权限控制

### 开发计划
- 🚧 产品内容中心
- 🚧 客户采集管理
- 🚧 AI营销助手
- 🚧 客户管理中心
- 🚧 营销活动管理
- 🚧 渠道触达模块
- 🚧 行为追踪分析
- 🚧 报表中心
- 🚧 系统管理

## 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖
```bash
cd frontend
npm install
```

### 启动开发服务器
```bash
npm run dev
```

应用将在 http://localhost:3000 启动

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

## 项目结构

```
frontend/
├── public/                 # 静态资源
├── src/
│   ├── api/               # API接口
│   ├── assets/            # 资源文件
│   │   ├── images/        # 图片
│   │   └── styles/        # 样式文件
│   ├── components/        # 组件
│   │   ├── business/      # 业务组件
│   │   └── common/        # 通用组件
│   ├── layouts/           # 布局组件
│   ├── router/            # 路由配置
│   ├── store/             # 状态管理
│   │   └── modules/       # Vuex模块
│   ├── utils/             # 工具函数
│   ├── views/             # 页面视图
│   │   ├── auth/          # 认证相关
│   │   ├── dashboard/     # 营销控制台
│   │   ├── product/       # 产品管理
│   │   ├── customer/      # 客户管理
│   │   └── ...
│   ├── App.vue            # 根组件
│   └── main.js            # 入口文件
├── index.html             # HTML模板
├── vite.config.js         # Vite配置
└── package.json           # 项目配置
```

## 开发指南

### 代码规范
- 使用 2 个空格缩进
- 使用单引号
- 组件使用 `<script setup>` 语法
- 优先使用 Composition API
- 遵循 BEM CSS 命名规范

### 样式规范
- 使用 SCSS 预处理器
- 全局变量定义在 `assets/styles/variables.scss`
- 组件样式使用 `scoped` 属性
- 响应式设计断点：768px (移动端), 1024px (桌面端)

### 组件开发
```vue
<template>
  <div class="component-name">
    <!-- 模板内容 -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 组件逻辑
</script>

<style scoped lang="scss">
.component-name {
  // 样式
}
</style>
```

### 路由配置
```javascript
{
  path: '/example',
  component: Layout,
  children: [
    {
      path: 'index',
      name: 'Example',
      component: () => import('@/views/example/Index.vue'),
      meta: {
        title: '示例页面',
        requiresAuth: true,
        keepAlive: true
      }
    }
  ]
}
```

### 状态管理
```javascript
// store/modules/example.js
const state = {
  data: []
}

const mutations = {
  SET_DATA(state, data) {
    state.data = data
  }
}

const actions = {
  async fetchData({ commit }) {
    // API 调用
    const data = await api.getData()
    commit('SET_DATA', data)
  }
}

const getters = {
  data: state => state.data
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
```

## 功能特性

### 登录系统
- 支持账号密码登录
- 支持手机验证码登录
- 记住我功能
- 第三方登录（微信、Google、GitHub）

### 系统框架
- 响应式侧边栏导航
- 多标签页管理
- 面包屑导航
- 全屏模式
- 主题切换（预留）

### 营销控制台
- 实时数据监控
- 邮件效果分析
- 转化漏斗图
- 热门产品排行
- AI智能建议
- 快捷操作入口

## 浏览器支持

- Chrome >= 88
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 部署

### Docker 部署
```bash
# 构建镜像
docker build -t marketing-frontend .

# 运行容器
docker run -p 3000:80 marketing-frontend
```

### Nginx 配置
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

如有问题或建议，请通过以下方式联系：

- 项目地址: [GitHub Repository]
- 问题反馈: [GitHub Issues]
- 邮箱: dev@example.com

## 更新日志

### v1.0.0 (2024-08-19)
- ✨ 初始版本发布
- ✨ 完成登录认证系统
- ✨ 完成系统框架和导航
- ✨ 完成营销控制台基础功能
- ✨ 集成 Element Plus UI 组件库
- ✨ 配置路由和状态管理