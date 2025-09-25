# Vue 3 项目配置约束条件（修订版）

## 目的

规范 Vue 3、Vite 和 Element Plus 项目配置，推荐主流版本和最佳实践，防止以下常见错误：

- 模块解析错误（如 `SyntaxError: The requested module does not provide an export named 'Play'`）
- Sass 未定义变量（如 `$color-danger`）
- 导航问题（展开速度不一致、2 像素缝隙、无法限制单一展开）
- 数据列表缺少查询条件、批量删除或分页样式不统一
- 响应式错误（如 `ReferenceError: Cannot access 'addTab' before initialization`）
- 路由导航或异步请求未处理错误
- 依赖版本冲突导致的构建失败

## 适用范围

适用于基于 Vue 3、Vite、Element Plus 和 @element-plus/icons-vue 的前端项目，涵盖 JavaScript 和 TypeScript 项目。

## 主流版本（2025 年 1 月）

| 依赖包                      | 版本     | 备注                                  |
| --------------------------- | -------- | ------------------------------------- |
| **vue**                     | ~3.5.20  | 最新稳定版，允许补丁更新              |
| **vite**                    | ~7.1.3   | 需要 Node.js 20.19+ 或 22.12+         |
| **@vitejs/plugin-vue**      | ~6.0.1   | 兼容 Vite 7                           |
| **element-plus**            | ~2.11.1  | 兼容 Vue 3.5+                         |
| **@element-plus/icons-vue** | ~2.3.2   |                                       |
| **vue-router**              | ~4.5.1   |                                       |
| **vuex**                    | ~4.1.0   |                                       |
| **sass**                    | ~1.90.0  | Element Plus 2.8.5+ 需要 Sass 1.79.0+ |
| **axios**                   | ~1.7.7   |                                       |
| **dayjs**                   | ~1.11.13 |                                       |
| **unplugin-auto-import**    | ~20.1.0  | 最新版本，更好的兼容性                |
| **unplugin-vue-components** | ~29.0.0  | 最新版本，更好的兼容性                |
| **@types/node**             | ~22.7.4  |                                       |
| **eslint**                  | ~9.14.0  |                                       |
| **eslint-plugin-vue**       | ~9.30.0  |                                       |
| **vitest**                  | ~3.2.0   | Vite 7 需要 Vitest 3.2+               |

**版本策略**：

- 使用 `~` 允许补丁版本更新（如 `~3.5.20` 允许 3.5.x）
- 获得安全修复和bug修复
- 主版本和次版本保持稳定

**重要提示**：

- Vite 7 需要 Node.js 20.19+ 或 22.12+，不再支持 Node.js 18
- Vitest 需要升级到 3.2+ 以支持 Vite 7
- unplugin 插件需要使用最新版本以确保兼容性

------

## 约束条件

### 1. 依赖管理

1. **版本管理策略**

   ```json
   {
     "dependencies": {
       "vue": "~3.5.20",
       "element-plus": "~2.11.1",
       "@element-plus/icons-vue": "~2.3.2",
       "vue-router": "~4.5.1",
       "vuex": "~4.1.0",
       "sass": "~1.90.0",
       "axios": "~1.7.7",
       "dayjs": "~1.11.13"
     },
     "devDependencies": {
       "vite": "~7.1.3",
       "@vitejs/plugin-vue": "~6.0.1",
       "unplugin-auto-import": "~20.1.0",
       "unplugin-vue-components": "~29.0.0",
       "@types/node": "~22.7.4",
       "eslint": "~9.14.0",
       "eslint-plugin-vue": "~9.30.0",
       "vitest": "~3.2.0"
     }
   }
   ```

2. **清理缓存**

   - 在模块错误或依赖更新后，清理缓存：

     ```bash
     rm -rf node_modules/.vite node_modules package-lock.json
     npm install
     ```

   - 添加脚本：

     ```json
     {
       "scripts": {
         "clean": "rm -rf node_modules/.vite node_modules package-lock.json",
         "install:clean": "npm run clean && npm install"
       }
     }
     ```

### 2. 图标使用

1. **按需导入**

   ```javascript
   import { Play } from '@element-plus/icons-vue';
   import { defineComponent } from 'vue';
   
   export default defineComponent({
     components: { Play }
   });
   ```

   **约束**：禁止全局导入（如 `import * as Icons`）。

2. **验证图标名称**

   - 导入前参考 [Element Plus 图标文档](https://element-plus.org/en-US/component/icon.html)，确认图标（如 `Play`、`Stop`、`VideoPlay`）存在。
   - **约束**：提交代码前验证图标名称。

### 3. Vite 配置

1. **依赖预打包与 SCSS 配置**

   ```javascript
   import { defineConfig } from 'vite';
   import vue from '@vitejs/plugin-vue';
   import AutoImport from 'unplugin-auto-import/vite';
   import Components from 'unplugin-vue-components/vite';
   import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
   import path from 'path';
   
   export default defineConfig({
     plugins: [
       vue(),
       AutoImport({ 
         resolvers: [ElementPlusResolver()] 
       }),
       Components({ 
         resolvers: [ElementPlusResolver()] 
       })
     ],
     resolve: { 
       alias: { 
         '@': path.resolve(__dirname, 'src') 
       } 
     },
     optimizeDeps: { 
       include: ['@element-plus/icons-vue', 'element-plus'] 
     },
     css: {
       preprocessorOptions: {
         scss: {
           additionalData: `@use 'element-plus/dist/index.scss' as *;`
         }
       }
     }
   });
   ```

   **约束**：注入 Element Plus SCSS 变量，防止 `$color-danger` 未定义。

2. **HMR 管理**

   - HMR 错误时，临时禁用：

     ```javascript
     server: { hmr: false }
     ```

   - **约束**：记录 HMR 问题，必要时升级 Vite。

### 4. 环境配置与路由加载

1. **环境配置管理**

   - **推荐**：使用 Vite 标准的环境变量文件管理不同环境的配置。

   - 环境文件结构：

     ```
     .env                # 所有环境共享
     .env.development    # 开发环境
     .env.production     # 生产环境
     .env.staging        # 测试环境（可选）
     ```

   - `.env.development` 示例：

     ```env
     VITE_API_BASE_URL=http://localhost:3000/api
     VITE_APP_TITLE=My App (Dev)
     VITE_UPLOAD_URL=http://localhost:3000/upload
     ```

   - `.env.production` 示例：

     ```env
     VITE_API_BASE_URL=https://api.example.com
     VITE_APP_TITLE=My App
     VITE_UPLOAD_URL=https://cdn.example.com/upload
     ```

   - 在代码中使用：

     ```javascript
     // src/api/index.js
     import axios from 'axios';
     
     const apiClient = axios.create({
       baseURL: import.meta.env.VITE_API_BASE_URL,
       timeout: 10000,
       headers: {
         'Content-Type': 'application/json'
       }
     });
     
     export default apiClient;
     ```

   - TypeScript 类型声明：

     ```typescript
     // src/vite-env.d.ts
     /// <reference types="vite/client" />
     
     interface ImportMetaEnv {
       readonly VITE_API_BASE_URL: string
       readonly VITE_APP_TITLE: string
       readonly VITE_UPLOAD_URL: string
     }
     
     interface ImportMeta {
       readonly env: ImportMetaEnv
     }
     ```

2. **路由懒加载策略**

   - **推荐**：对大型页面组件使用懒加载，小型组件可以静态导入。

   - 路由配置示例：

     ```javascript
     // router/index.js
     import { createRouter, createWebHistory } from 'vue-router';
     
     // 静态导入（常用页面）
     import Home from '@/views/Home.vue';
     import Login from '@/views/Login.vue';
     
     const routes = [
       { 
         path: '/', 
         component: Home  // 首页静态导入，避免首屏延迟
       },
       { 
         path: '/login', 
         component: Login  // 登录页静态导入
       },
       {
         path: '/dashboard',
         component: () => import('@/views/Dashboard.vue')  // 懒加载
       },
       {
         path: '/users',
         component: () => import('@/views/user/List.vue')  // 懒加载
       },
       {
         path: '/users/:id',
         component: () => import('@/views/user/Detail.vue')  // 懒加载
       },
       {
         path: '/settings',
         component: () => import('@/views/Settings.vue'),  // 懒加载
         children: [
           {
             path: 'profile',
             component: () => import('@/views/settings/Profile.vue')
           },
           {
             path: 'security',
             component: () => import('@/views/settings/Security.vue')
           }
         ]
       }
     ];
     
     export default createRouter({
       history: createWebHistory(import.meta.env.BASE_URL),
       routes
     });
     ```

   - **懒加载建议**：

     - 首页、登录页等核心页面使用静态导入
     - 大型功能模块使用懒加载
     - 管理后台、设置页面等使用懒加载
     - 使用路由级别的代码分割，而不是组件级别

3. **组件导入规范**

   - 页面组件根据需要选择静态或动态导入：

     ```vue
     <script setup>
     // 核心组件：静态导入
     import Header from '@/components/Header.vue';
     import Footer from '@/components/Footer.vue';
     
     // 条件加载的大型组件：动态导入
     import { defineAsyncComponent } from 'vue';
     
     const HeavyChart = defineAsyncComponent(() => 
       import('@/components/HeavyChart.vue')
     );
     
     // 小型通用组件：静态导入
     import UserCard from '@/components/UserCard.vue';
     </script>
     ```

### 5. TypeScript 配置（若适用）

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "moduleResolution": "node",
    "isolatedModules": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "strict": true,
    "jsx": "preserve",
    "types": ["vite/client", "element-plus/global"]
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "exclude": ["node_modules", "dist"]
}
```

### 6. 组件规范

1. **数据列表页面**

   - 使用 `ElTable`，包含：

     - 查询条件（`ElForm` + `ElInput`/`ElSelect`）
     - 批量删除（checkbox + `ElButton`）
     - 每页 10 条，3 页演示数据（mock 数据数组长度 30）

   - 示例：

     ```vue
     <template>
       <el-form inline>
         <el-form-item label="查询">
           <el-input v-model="query" placeholder="请输入关键词"></el-input>
         </el-form-item>
         <el-button type="primary" @click="search">搜索</el-button>
       </el-form>
       
       <el-table 
         :data="filteredData.slice((currentPage-1)*10, currentPage*10)" 
         row-key="id" 
         @selection-change="handleSelection"
       >
         <el-table-column type="selection" width="55"></el-table-column>
         <el-table-column prop="name" label="名称"></el-table-column>
       </el-table>
       
       <el-button 
         type="danger" 
         :disabled="!selected.length" 
         @click="batchDelete"
       >
         批量删除
       </el-button>
       
       <el-pagination
         v-model:current-page="currentPage"
         :page-size="10"
         :total="filteredData.length"
         layout="prev, pager, next, jumper, ->, total"
         @current-change="handlePageChange"
       />
     </template>
     
     <script setup>
     import { ref, computed } from 'vue';
     import { ElMessage } from 'element-plus';
     
     const query = ref('');
     const tableData = ref(Array.from({ length: 30 }, (_, i) => ({ 
       id: i, 
       name: `Item ${i}` 
     })));
     const filteredData = computed(() => 
       tableData.value.filter(item => item.name.includes(query.value))
     );
     const currentPage = ref(1);
     const selected = ref([]);
     
     const handleSelection = (val) => { selected.value = val; };
     
     const batchDelete = () => {
       selected.value.forEach(item => {
         const index = tableData.value.findIndex(data => data.id === item.id);
         if (index > -1) tableData.value.splice(index, 1);
       });
       ElMessage.success('删除成功');
       selected.value = [];
     };
     
     const handlePageChange = (page) => { currentPage.value = page; };
     const search = () => { currentPage.value = 1; };
     </script>
     
     <style scoped>
     @import '@/styles/index.scss';
     </style>
     ```

2. **左侧导航**

   - 使用 `ElMenu`：

     - `unique-opened="true"`（一次只打开一个一级分类）
     - `collapse-transition="false"`（统一展开/折叠速度）
     - 无缝隙：设置 `border-right: none; padding: 0; margin: 0;`

   - 示例：

     ```vue
     <template>
       <el-menu 
         :unique-opened="true" 
         :collapse-transition="false" 
         :default-active="$route.path" 
         router
       >
         <el-sub-menu index="1">
           <template #title>一级菜单</template>
           <el-menu-item index="/sub1">子菜单1</el-menu-item>
         </el-sub-menu>
       </el-menu>
     </template>
     
     <style scoped>
     @import '@/styles/index.scss';
     </style>
     ```

3. **响应式与路由**

   - 定义函数后再使用 `watch` 或 `watchEffect`，避免时间死区（TDZ）错误

   - 在路由导航和异步请求中添加错误处理

   - 示例：

     ```vue
     <!-- SystemSelect.vue -->
     <template>
       <el-menu-item @click="handleSystemClick">系统选择</el-menu-item>
     </template>
     
     <script setup>
     import { useRouter } from 'vue-router';
     import { ElMessage } from 'element-plus';
     
     const router = useRouter();
     
     async function handleSystemClick() {
       try {
         await router.push('/target-route');
       } catch (error) {
         ElMessage.error('导航失败：' + error.message);
       }
     }
     </script>
     ```

     ```vue
     <!-- MainLayout.vue -->
     <template>
       <router-view />
     </template>
     
     <script setup>
     import { watch, ref } from 'vue';
     import { useRoute } from 'vue-router';
     
     const route = useRoute();
     const tabs = ref([]);
     
     // 函数定义在 watch 之前
     function addTab(path) {
       if (!tabs.value.includes(path)) {
         tabs.value.push(path);
       }
     }
     
     watch(() => route.path, (newPath) => {
       try {
         addTab(newPath);
       } catch (error) {
         console.error('添加标签页失败：', error);
       }
     }, { immediate: true });
     </script>
     ```

     ```javascript
     // src/api/index.js
     import axios from 'axios';
     import { ElMessage } from 'element-plus';
     
     const apiClient = axios.create({
       baseURL: import.meta.env.VITE_API_BASE_URL,
       timeout: 10000
     });
     
     apiClient.interceptors.response.use(
       response => response,
       error => {
         ElMessage.error('请求失败：' + error.message);
         return Promise.reject(error);
       }
     );
     
     export default apiClient;
     ```

### 7. 全局样式

- 创建 `src/styles/index.scss`：

  ```scss
  @use 'element-plus/dist/index.scss' as *;
  
  .el-pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
  
  .el-menu {
    border-right: none;
    padding: 0;
    margin: 0;
  }
  ```

- **约束**：所有组件导入 `src/styles/index.scss`，禁止重复定义分页或导航样式

### 8. 代码质量

1. **ESLint 配置**

   ```json
   {
     "env": { 
       "browser": true, 
       "es2021": true,
       "node": true
     },
     "extends": [
       "plugin:vue/vue3-essential",
       "plugin:@typescript-eslint/recommended"
     ],
     "rules": {
       "no-unused-vars": "warn",
       "@typescript-eslint/no-unused-vars": "error",
       "no-undef": "error",
       "vue/no-async-in-computed-properties": "error"
     }
   }
   ```

2. **单元测试**

   - 使用 `vitest` 和 `@vue/test-utils`：

     ```bash
     npm install --save-dev vitest @vue/test-utils
     ```

   - 测试示例：

     ```javascript
     import { describe, test, expect } from 'vitest';
     import { mount } from '@vue/test-utils';
     import { createRouter, createWebHistory } from 'vue-router';
     import DataList from '@/views/DataList.vue';
     
     describe('DataList', () => {
       test('pagination and selection', () => {
         const wrapper = mount(DataList);
         expect(wrapper.findComponent({ name: 'ElTable' }).exists()).toBe(true);
         expect(wrapper.findComponent({ name: 'ElPagination' }).props('pageSize')).toBe(10);
       });
     });
     ```

3. **自动化工具**

   - 配置 Husky 和 lint-staged：

     ```bash
     npm install --save-dev husky lint-staged
     npx husky install
     ```

     ```json
     {
       "scripts": {
         "prepare": "husky install"
       },
       "lint-staged": {
         "*.{vue,js,ts}": [
           "eslint --fix"
         ]
       }
     }
     ```

### 9. 开发流程

1. **代码审查**

   - 图标导入是否正确
   - 数据列表功能完整性
   - 导航配置是否规范
   - 环境变量使用是否正确
   - 路由懒加载是否合理

2. **错误排查**

   - **模块错误**：验证图标名称，清理缓存
   - **Sass 变量未定义**：检查 Vite SCSS 配置
   - **导航问题**：验证属性设置和 CSS
   - **响应式错误**：检查函数定义顺序
   - **环境变量错误**：确认 `.env` 文件存在且格式正确

3. **文档记录**

   ```markdown
   ## 项目配置
   
   ### 环境变量
   - 开发环境：.env.development
   - 生产环境：.env.production
   - API 地址通过 VITE_API_BASE_URL 配置
   
   ### 路由策略
   - 核心页面：静态导入
   - 功能模块：懒加载
   - 代码分割：按路由级别
   
   ### 依赖版本
   - 使用 ~ 允许补丁更新
   - 定期检查更新
   ```

## 迁移指南

如果从旧版本（严格限制版）迁移：

1. **环境配置迁移**
   - 创建 `.env.development` 和 `.env.production`
   - 将硬编码的配置移至环境变量
   - 更新 API 配置使用 `import.meta.env`
2. **路由配置迁移**
   - 保留核心页面的静态导入
   - 将大型模块改为懒加载
   - 测试首屏加载性能
3. **依赖版本迁移**
   - 将固定版本改为 `~` 前缀
   - 运行 `npm update` 获取补丁更新
   - 测试兼容性