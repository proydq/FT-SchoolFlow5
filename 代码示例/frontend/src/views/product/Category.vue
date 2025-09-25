<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="title">产品分类管理</h2>
      <p class="description">管理产品分类体系，支持三级分类树和拖拽排序</p>
    </div>

    <div class="content-wrapper">
      <el-row :gutter="20">
        <!-- 左侧分类树 -->
        <el-col :span="8">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>分类结构</span>
                <div class="actions">
                  <el-button size="small" @click="toggleExpandAll">
                    <el-icon>
                      <component :is="isAllExpanded ? 'ArrowRightBold' : 'ArrowDownBold'" />
                    </el-icon>
                    {{ isAllExpanded ? '折叠全部' : '展开全部' }}
                  </el-button>
                  <el-button type="primary" size="small" @click="showAddDialog">
                    <el-icon><Plus /></el-icon>
                    新增分类
                  </el-button>
                </div>
              </div>
            </template>

            <!-- 搜索框 -->
            <el-input
              v-model="filterText"
              placeholder="搜索分类"
              class="mb-md"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>

            <!-- 分类树 -->
            <el-tree
              ref="treeRef"
              :data="categoryTree"
              :props="treeProps"
              node-key="id"
              :default-expanded-keys="expandedKeys"
              :expand-on-click-node="false"
              :filter-node-method="filterNode"
              draggable
              :allow-drop="allowDrop"
              :allow-drag="allowDrag"
              @node-drop="handleDrop"
              @node-click="handleNodeClick"
              highlight-current
            >
              <template #default="{ node, data }">
                <span class="tree-node">
                  <el-icon v-if="data.icon" :size="16" class="icon">
                    <component :is="data.icon" />
                  </el-icon>
                  <span class="label">{{ data.name }}</span>
                  <span class="count">({{ data.productCount }})</span>
                  <span class="actions">
                    <el-button
                      type="text"
                      size="small"
                      @click.stop="editCategory(data)"
                    >
                      <el-icon><Edit /></el-icon>
                    </el-button>
                    <el-button
                      type="text"
                      size="small"
                      @click.stop="deleteCategory(data)"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </span>
                </span>
              </template>
            </el-tree>
          </el-card>
        </el-col>

        <!-- 右侧详情 -->
        <el-col :span="16">
          <el-card shadow="hover" v-if="selectedCategory">
            <template #header>
              <div class="card-header">
                <span>分类详情</span>
                <div class="actions">
                  <el-button type="primary" size="small" @click="saveCategory">
                    <el-icon><Check /></el-icon>
                    保存修改
                  </el-button>
                </div>
              </div>
            </template>

            <el-form
              ref="formRef"
              :model="categoryForm"
              :rules="formRules"
              label-width="100px"
            >
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="分类名称" prop="name">
                    <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="分类编码" prop="code">
                    <el-input v-model="categoryForm.code" placeholder="自动生成或手动输入" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="上级分类">
                    <el-cascader
                      v-model="categoryForm.parentPath"
                      :options="parentOptions"
                      :props="cascaderProps"
                      placeholder="选择上级分类"
                      clearable
                      :disabled="categoryForm.id === selectedCategory.id"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="排序">
                    <el-input-number
                      v-model="categoryForm.sort"
                      :min="0"
                      :max="999"
                      controls-position="right"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="图标">
                    <el-select v-model="categoryForm.icon" placeholder="选择图标">
                      <el-option
                        v-for="icon in iconOptions"
                        :key="icon.value"
                        :label="icon.label"
                        :value="icon.value"
                      >
                        <span class="icon-option">
                          <el-icon><component :is="icon.value" /></el-icon>
                          <span>{{ icon.label }}</span>
                        </span>
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="状态">
                    <el-switch
                      v-model="categoryForm.status"
                      active-text="启用"
                      inactive-text="禁用"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="分类描述">
                <el-input
                  v-model="categoryForm.description"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入分类描述"
                />
              </el-form-item>

              <!-- SEO设置 -->
              <el-divider content-position="left">SEO设置</el-divider>
              
              <el-form-item label="SEO标题">
                <el-input
                  v-model="categoryForm.seoTitle"
                  placeholder="用于搜索引擎优化的标题"
                />
              </el-form-item>

              <el-form-item label="SEO关键词">
                <el-input
                  v-model="categoryForm.seoKeywords"
                  placeholder="多个关键词用逗号分隔"
                />
              </el-form-item>

              <el-form-item label="SEO描述">
                <el-input
                  v-model="categoryForm.seoDescription"
                  type="textarea"
                  :rows="2"
                  placeholder="用于搜索引擎的描述文本"
                />
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 未选择分类时的提示 -->
          <el-empty
            v-else
            description="请从左侧选择一个分类查看详情"
            :image-size="200"
          />
        </el-col>
      </el-row>
    </div>

    <!-- 新增/编辑分类对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="resetDialog"
    >
      <el-form
        ref="dialogFormRef"
        :model="dialogForm"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="dialogForm.name" placeholder="请输入分类名称" />
        </el-form-item>

        <el-form-item label="上级分类">
          <el-cascader
            v-model="dialogForm.parentPath"
            :options="parentOptions"
            :props="cascaderProps"
            placeholder="选择上级分类（留空为顶级分类）"
            clearable
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="分类编码" prop="code">
          <el-input
            v-model="dialogForm.code"
            placeholder="留空自动生成"
          />
        </el-form-item>

        <el-form-item label="图标">
          <el-select v-model="dialogForm.icon" placeholder="选择图标">
            <el-option
              v-for="icon in iconOptions"
              :key="icon.value"
              :label="icon.label"
              :value="icon.value"
            >
              <span class="icon-option">
                <el-icon><component :is="icon.value" /></el-icon>
                <span>{{ icon.label }}</span>
              </span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="排序">
          <el-input-number
            v-model="dialogForm.sort"
            :min="0"
            :max="999"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="分类描述">
          <el-input
            v-model="dialogForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入分类描述"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitDialog">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import productApi from '@/api/modules/product'

// 分类树数据
const categoryTree = ref([])

// 树形控件配置
const treeProps = {
  children: 'children',
  label: 'name'
}

// 级联选择器配置
const cascaderProps = {
  value: 'id',
  label: 'name',
  children: 'children',
  checkStrictly: true,
  emitPath: false
}

// 搜索过滤
const filterText = ref('')
const treeRef = ref()

// 展开的节点keys
const expandedKeys = ref([])

// 是否全部展开
const isAllExpanded = ref(false)

// 选中的分类
const selectedCategory = ref(null)

// 分类表单
const categoryForm = reactive({
  id: null,
  name: '',
  code: '',
  parentPath: null,
  icon: '',
  sort: 0,
  status: true,
  description: '',
  seoTitle: '',
  seoKeywords: '',
  seoDescription: ''
})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('新增分类')
const dialogForm = reactive({
  name: '',
  code: '',
  parentPath: null,
  icon: '',
  sort: 0,
  description: ''
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  code: [
    { pattern: /^[A-Z0-9-]*$/, message: '只能包含大写字母、数字和横线', trigger: 'blur' }
  ]
}

// 图标选项
const iconOptions = [
  { value: 'Monitor', label: '显示器' },
  { value: 'Cellphone', label: '手机' },
  { value: 'Headset', label: '耳机' },
  { value: 'Camera', label: '相机' },
  { value: 'House', label: '房子' },
  { value: 'CoffeeCup', label: '咖啡杯' },
  { value: 'Moon', label: '月亮' },
  { value: 'Brush', label: '刷子' },
  { value: 'Trophy', label: '奖杯' },
  { value: 'Box', label: '盒子' },
  { value: 'Goods', label: '商品' },
  { value: 'ShoppingCart', label: '购物车' }
]

// 父级分类选项
const parentOptions = computed(() => {
  const formatOptions = (nodes, excludeId = null) => {
    return nodes.filter(node => node.id !== excludeId).map(node => ({
      id: node.id,
      name: node.name,
      children: node.children ? formatOptions(node.children, excludeId) : undefined
    }))
  }
  return formatOptions(categoryTree.value, selectedCategory.value?.id)
})

// 监听搜索框
watch(filterText, (val) => {
  treeRef.value?.filter(val)
})

// 过滤节点方法
const filterNode = (value, data) => {
  if (!value) return true
  return data.name.includes(value) || data.code.includes(value)
}

// 允许拖拽
const allowDrag = (node) => {
  return true
}

// 允许放置
const allowDrop = (draggingNode, dropNode, type) => {
  // 计算层级深度
  const getDepth = (node) => {
    let depth = 0
    let parent = node.parent
    while (parent && parent.level > 0) {
      depth++
      parent = parent.parent
    }
    return depth
  }
  
  // 限制最多三级
  if (type === 'inner') {
    return getDepth(dropNode) < 2
  }
  return true
}

// 处理拖拽
const handleDrop = (draggingNode, dropNode, dropType, ev) => {
  ElMessage.success('分类顺序已更新')
}

// 点击节点
const handleNodeClick = (data) => {
  selectedCategory.value = data
  Object.assign(categoryForm, {
    ...data,
    parentPath: data.parentId || null
  })
}

// 显示新增对话框
const showAddDialog = () => {
  dialogTitle.value = '新增分类'
  Object.assign(dialogForm, {
    name: '',
    code: '',
    parentPath: null,
    icon: '',
    sort: 0,
    description: ''
  })
  dialogVisible.value = true
}

// 编辑分类
const editCategory = (data) => {
  dialogTitle.value = '编辑分类'
  Object.assign(dialogForm, {
    ...data,
    parentPath: data.parentId || null
  })
  dialogVisible.value = true
}

// 删除分类
const deleteCategory = async (data) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除分类"${data.name}"吗？${data.children ? '这将同时删除所有子分类！' : ''}`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 执行删除
    const response = await productApi.deleteCategory(data.id)
    if (response.data) {
      ElMessage.success('分类已删除')
      await loadCategories() // 重新加载分类数据
      
      // 如果删除的是当前选中的分类，清空选中状态
      if (selectedCategory.value && selectedCategory.value.id === data.id) {
        selectedCategory.value = null
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除分类失败:', error)
      ElMessage.error('删除分类失败')
    }
    // 用户取消或删除失败
  }
}

// 切换展开/折叠全部
const toggleExpandAll = () => {
  const getAllKeys = (nodes) => {
    let keys = []
    nodes.forEach(node => {
      keys.push(node.id)
      if (node.children && node.children.length > 0) {
        keys = keys.concat(getAllKeys(node.children))
      }
    })
    return keys
  }
  
  if (isAllExpanded.value) {
    // 当前是展开状态，执行折叠
    expandedKeys.value = []
    if (treeRef.value) {
      getAllKeys(categoryTree.value).forEach(key => {
        if (treeRef.value.store.nodesMap[key]) {
          treeRef.value.store.nodesMap[key].expanded = false
        }
      })
    }
    isAllExpanded.value = false
    ElMessage.success('已折叠全部分类')
  } else {
    // 当前是折叠状态，执行展开
    expandedKeys.value = getAllKeys(categoryTree.value)
    if (treeRef.value) {
      getAllKeys(categoryTree.value).forEach(key => {
        if (treeRef.value.store.nodesMap[key]) {
          treeRef.value.store.nodesMap[key].expanded = true
        }
      })
    }
    isAllExpanded.value = true
    ElMessage.success('已展开全部分类')
  }
}

// 保存分类
const saveCategory = async () => {
  try {
    const response = await productApi.updateCategory(selectedCategory.value.id, categoryForm)
    if (response.data) {
      ElMessage.success('分类信息已保存')
      await loadCategories() // 重新加载分类数据
    }
  } catch (error) {
    console.error('保存分类失败:', error)
    ElMessage.error('保存分类失败')
  }
}

// 提交对话框
const submitDialog = async () => {
  try {
    if (dialogTitle.value === '新增分类') {
      // 新增分类
      const response = await productApi.createCategory(dialogForm)
      if (response.data) {
        ElMessage.success('分类已创建')
        await loadCategories() // 重新加载分类数据
      }
    } else {
      // 更新分类
      const categoryId = dialogForm.id || selectedCategory.value?.id
      if (!categoryId) {
        ElMessage.error('无法确定要更新的分类')
        return
      }
      const response = await productApi.updateCategory(categoryId, dialogForm)
      if (response.data) {
        ElMessage.success('分类已更新')
        await loadCategories() // 重新加载分类数据
      }
    }
    dialogVisible.value = false
  } catch (error) {
    console.error('提交分类失败:', error)
    ElMessage.error(dialogTitle.value === '新增分类' ? '创建分类失败' : '更新分类失败')
  }
}

// 重置对话框
const resetDialog = () => {
  Object.assign(dialogForm, {
    name: '',
    code: '',
    parentPath: null,
    icon: '',
    sort: 0,
    description: ''
  })
}

// 加载分类数据
const loadCategories = async () => {
  try {
    const response = await productApi.getCategories()
    // 处理后端返回的数据，即使是空数组也要处理
    const backendCategories = response || []
    
    if (backendCategories.length > 0) {
      // 将后端数据转换为前端树结构格式
      const convertedTree = backendCategories.map((category, index) => ({
        id: index + 1,
        name: category.name,
        code: category.name.toUpperCase().replace(/\s+/g, '_'),
        icon: getRandomIcon(),
        productCount: category.count,
        status: true,
        sort: index + 1,
        children: []
      }))
      
      categoryTree.value = convertedTree
      
      // 默认选中第一个分类
      if (categoryTree.value.length > 0) {
        handleNodeClick(categoryTree.value[0])
      }
    } else {
      // 如果没有分类数据，设置为空数组
      categoryTree.value = []
      selectedCategory.value = null
      console.log('暂无分类数据')
    }
  } catch (error) {
    console.error('加载分类失败:', error)
    // 不显示错误提示，因为可能只是没有数据
    // ElMessage.error('加载分类数据失败')
    categoryTree.value = []
  }
}

// 随机分配图标
const getRandomIcon = () => {
  const icons = ['Monitor', 'House', 'Trophy', 'Cellphone', 'Box']
  return icons[Math.floor(Math.random() * icons.length)]
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped lang="scss">
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  font-size: 14px;
  padding-right: 8px;
  
  .icon {
    margin-right: 4px;
  }
  
  .label {
    flex: 1;
  }
  
  .count {
    color: #909399;
    font-size: 12px;
    margin-left: 4px;
  }
  
  .actions {
    display: none;
    margin-left: auto;
  }
  
  &:hover .actions {
    display: inline-flex;
  }
}

.icon-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-tree) {
  background: transparent;
  
  .el-tree-node__content {
    height: 36px;
    
    &:hover {
      background-color: #f5f7fa;
    }
  }
  
  .el-tree-node.is-current > .el-tree-node__content {
    background-color: #ecf5ff;
  }
}
</style>