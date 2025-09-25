<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="title">产品管理</h2>
      <p class="description">管理系统中的产品信息，包括SKU、规格、价格等</p>
    </div>

    <!-- 搜索筛选区域 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="产品名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入产品名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="SKU">
          <el-input
            v-model="searchForm.sku"
            placeholder="请输入SKU"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="产品分类">
          <el-cascader
            v-model="searchForm.categoryPath"
            :options="categoryOptions"
            :props="cascaderProps"
            placeholder="选择产品分类"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="在售" value="active" />
            <el-option label="停售" value="inactive" />
            <el-option label="缺货" value="out_of_stock" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮区域 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="primary" @click="showAddDialog">
          <el-icon><Plus /></el-icon>
          新增产品
        </el-button>
        <el-button @click="showBatchImportDialog">
          <el-icon><Upload /></el-icon>
          批量导入
        </el-button>
        <el-button @click="downloadTemplate">
          <el-icon><Download /></el-icon>
          下载模板
        </el-button>
        <el-button @click="exportData" :disabled="!selectedProducts.length">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
      <div class="toolbar-right">
        <el-button
          type="danger"
          @click="batchDelete"
          :disabled="!selectedProducts.length"
        >
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
        <el-button
          @click="batchUpdateStatus"
          :disabled="!selectedProducts.length"
        >
          <el-icon><Edit /></el-icon>
          批量上下架
        </el-button>
      </div>
    </div>

    <!-- 产品列表 -->
    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="productList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="产品图片" width="80">
          <template #default="{ row }">
            <el-image
              :src="row.image"
              :preview-src-list="[row.image]"
              style="width: 50px; height: 50px"
              fit="cover"
            >
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column prop="sku" label="SKU" width="120" sortable="custom" />
        <el-table-column prop="name" label="产品名称" min-width="200" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="price" label="价格" width="100" sortable="custom">
          <template #default="{ row }">
            ${{ row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" sortable="custom">
          <template #default="{ row }">
            <span :class="{ 'low-stock': row.stock < 10 }">
              {{ row.stock }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="sales" label="销量" width="80" sortable="custom" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="getStatusType(row.status)"
              size="small"
            >
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="120">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button type="text" size="small" @click="viewProduct(row)">
                查看
              </el-button>
              <el-button type="text" size="small" @click="editProduct(row)">
                编辑
              </el-button>
              <el-button type="text" size="small" @click="manageSKU(row)">
                SKU管理
              </el-button>
              <el-button
                type="text"
                size="small"
                class="danger"
                @click="deleteProduct(row)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑产品对话框 -->
    <el-dialog
      v-model="productDialogVisible"
      :title="productDialogTitle"
      width="800px"
      @close="resetProductForm"
    >
      <el-form
        ref="productFormRef"
        :model="productForm"
        :rules="productRules"
        label-width="100px"
      >
        <el-tabs v-model="activeTab">
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="basic">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="产品名称" prop="name">
                  <el-input v-model="productForm.name" placeholder="请输入产品名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="SKU" prop="sku">
                  <el-input v-model="productForm.sku" placeholder="留空自动生成" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="产品分类" prop="categoryPath">
                  <el-cascader
                    v-model="productForm.categoryPath"
                    :options="categoryOptions"
                    :props="cascaderProps"
                    placeholder="选择产品分类"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="品牌">
                  <el-input v-model="productForm.brand" placeholder="请输入品牌" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="产品描述">
              <el-input
                v-model="productForm.description"
                type="textarea"
                :rows="4"
                placeholder="请输入产品描述"
              />
            </el-form-item>

            <el-form-item label="产品图片">
              <el-upload
                v-model:file-list="productForm.images"
                action="#"
                list-type="picture-card"
                :auto-upload="false"
                :limit="5"
              >
                <el-icon><Plus /></el-icon>
                <template #tip>
                  <div class="el-upload__tip">最多上传5张图片</div>
                </template>
              </el-upload>
            </el-form-item>
          </el-tab-pane>

          <!-- 价格库存 -->
          <el-tab-pane label="价格库存" name="pricing">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="销售价格" prop="price">
                  <el-input-number
                    v-model="productForm.price"
                    :min="0"
                    :precision="2"
                    controls-position="right"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="成本价格">
                  <el-input-number
                    v-model="productForm.costPrice"
                    :min="0"
                    :precision="2"
                    controls-position="right"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="市场价格">
                  <el-input-number
                    v-model="productForm.marketPrice"
                    :min="0"
                    :precision="2"
                    controls-position="right"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="库存数量" prop="stock">
                  <el-input-number
                    v-model="productForm.stock"
                    :min="0"
                    controls-position="right"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="安全库存">
                  <el-input-number
                    v-model="productForm.safeStock"
                    :min="0"
                    controls-position="right"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="重量(kg)">
                  <el-input-number
                    v-model="productForm.weight"
                    :min="0"
                    :precision="2"
                    controls-position="right"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>

          <!-- 其他信息 -->
          <el-tab-pane label="其他信息" name="other">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="产品状态">
                  <el-select v-model="productForm.status" style="width: 100%">
                    <el-option label="在售" value="active" />
                    <el-option label="停售" value="inactive" />
                    <el-option label="缺货" value="out_of_stock" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="排序">
                  <el-input-number
                    v-model="productForm.sort"
                    :min="0"
                    controls-position="right"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="产品标签">
              <el-select
                v-model="productForm.tags"
                multiple
                filterable
                allow-create
                placeholder="选择或输入标签"
                style="width: 100%"
              >
                <el-option
                  v-for="tag in tagOptions"
                  :key="tag"
                  :label="tag"
                  :value="tag"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="备注">
              <el-input
                v-model="productForm.remarks"
                type="textarea"
                :rows="3"
                placeholder="请输入备注信息"
              />
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="productDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitProduct">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量导入对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="批量导入产品"
      width="600px"
    >
      <div class="import-steps">
        <el-steps :active="importStep" align-center>
          <el-step title="上传文件" />
          <el-step title="数据预览" />
          <el-step title="导入完成" />
        </el-steps>

        <!-- 步骤1：上传文件 -->
        <div v-if="importStep === 0" class="step-content">
          <el-upload
            v-model:file-list="importFileList"
            drag
            action="#"
            :auto-upload="false"
            :limit="1"
            accept=".xlsx,.xls,.csv"
            @change="handleFileChange"
          >
            <el-icon class="el-icon--upload"><Upload /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                只能上传 xlsx/xls/csv 文件，且不超过 10MB
              </div>
            </template>
          </el-upload>

          <div class="import-tips">
            <h4>导入说明：</h4>
            <ul>
              <li>支持 Excel (.xlsx, .xls) 和 CSV 格式文件</li>
              <li>文件大小不能超过 10MB</li>
              <li>请确保数据格式正确，必填字段不能为空</li>
              <li>建议先下载模板文件，按照模板格式填写数据</li>
            </ul>
          </div>
        </div>

        <!-- 步骤2：数据预览 -->
        <div v-if="importStep === 1" class="step-content">
          <div class="preview-info">
            <p>共解析到 <strong>{{ importData.length }}</strong> 条数据，其中：</p>
            <p>有效数据：<span class="success">{{ validCount }}</span> 条</p>
            <p>无效数据：<span class="error">{{ errorCount }}</span> 条</p>
          </div>

          <el-table :data="importData.slice(0, 10)" style="width: 100%" max-height="400">
            <el-table-column prop="sku" label="SKU" width="120" />
            <el-table-column prop="name" label="产品名称" />
            <el-table-column prop="price" label="价格" width="80" />
            <el-table-column prop="stock" label="库存" width="80" />
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.valid ? 'success' : 'danger'" size="small">
                  {{ row.valid ? '有效' : '无效' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>

          <div v-if="importData.length > 10" class="preview-more">
            仅显示前 10 条数据预览...
          </div>
        </div>

        <!-- 步骤3：导入完成 -->
        <div v-if="importStep === 2" class="step-content">
          <el-result
            icon="success"
            title="导入完成"
            :sub-title="`成功导入 ${importResult.success} 条数据，失败 ${importResult.failed} 条`"
          >
            <template #extra>
              <el-button type="primary" @click="closeImportDialog">
                确定
              </el-button>
            </template>
          </el-result>
        </div>
      </div>

      <template #footer v-if="importStep < 2">
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button
            v-if="importStep === 0"
            type="primary"
            @click="parseImportFile"
            :disabled="!importFileList.length"
          >
            下一步
          </el-button>
          <el-button
            v-if="importStep === 1"
            @click="importStep = 0"
          >
            上一步
          </el-button>
          <el-button
            v-if="importStep === 1"
            type="primary"
            @click="executeImport"
            :disabled="!validCount"
          >
            开始导入
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- SKU管理对话框 -->
    <el-dialog
      v-model="skuDialogVisible"
      title="SKU管理"
      width="900px"
    >
      <div class="sku-management">
        <div class="sku-header">
          <h4>{{ currentProduct?.name }} - SKU管理</h4>
          <el-button type="primary" size="small" @click="addSKU">
            <el-icon><Plus /></el-icon>
            新增SKU
          </el-button>
        </div>

        <el-table :data="skuList" style="width: 100%">
          <el-table-column prop="sku" label="SKU编码" width="150" />
          <el-table-column prop="specifications" label="规格" width="200">
            <template #default="{ row }">
              <el-tag
                v-for="spec in row.specifications"
                :key="spec"
                size="small"
                class="spec-tag"
              >
                {{ spec }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="price" label="价格" width="100">
            <template #default="{ row }">
              ${{ row.price }}
            </template>
          </el-table-column>
          <el-table-column prop="stock" label="库存" width="80" />
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
                {{ row.status === 'active' ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button type="text" size="small" @click="editSKU(row)">
                编辑
              </el-button>
              <el-button
                type="text"
                size="small"
                class="danger"
                @click="deleteSKU(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import productApi from '@/api/modules/product'

// 搜索表单
const searchForm = reactive({
  name: '',
  sku: '',
  categoryPath: null,
  status: ''
})

// 分页信息
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 表格数据
const loading = ref(false)
const productList = ref([])
const selectedProducts = ref([])

// 对话框状态
const productDialogVisible = ref(false)
const productDialogTitle = ref('新增产品')
const importDialogVisible = ref(false)
const skuDialogVisible = ref(false)

// 表单数据
const activeTab = ref('basic')
const productForm = reactive({
  id: null,
  name: '',
  sku: '',
  categoryPath: null,
  brand: '',
  description: '',
  images: [],
  price: 0,
  costPrice: 0,
  marketPrice: 0,
  stock: 0,
  safeStock: 0,
  weight: 0,
  status: 'active',
  sort: 0,
  tags: [],
  remarks: ''
})

// 导入相关
const importStep = ref(0)
const importFileList = ref([])
const importData = ref([])
const importResult = reactive({
  success: 0,
  failed: 0
})

// SKU管理
const currentProduct = ref(null)
const skuList = ref([])

// 分类选项
const categoryOptions = ref([
  {
    id: 1,
    name: '电子产品',
    children: [
      { id: 11, name: '智能设备' },
      { id: 12, name: '音频设备' }
    ]
  },
  {
    id: 2,
    name: '家居用品',
    children: [
      { id: 21, name: '厨房用品' },
      { id: 22, name: '卧室用品' }
    ]
  }
])

// 级联选择器配置
const cascaderProps = {
  value: 'id',
  label: 'name',
  children: 'children',
  checkStrictly: true,
  emitPath: false
}

// 标签选项
const tagOptions = ref(['热销', '新品', '限量', '特价', '推荐'])

// 表单验证规则
const productRules = {
  name: [
    { required: true, message: '请输入产品名称', trigger: 'blur' }
  ],
  categoryPath: [
    { required: true, message: '请选择产品分类', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入销售价格', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入库存数量', trigger: 'blur' }
  ]
}

// 计算属性
const validCount = computed(() => importData.value.filter(item => item.valid).length)
const errorCount = computed(() => importData.value.filter(item => !item.valid).length)

// 模拟数据
// 移除mock数据，使用真实API

// 方法
const handleSearch = () => {
  loadData()
}

const resetSearch = () => {
  Object.assign(searchForm, {
    name: '',
    sku: '',
    categoryPath: null,
    status: ''
  })
  loadData()
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      size: pagination.size,
      keyword: searchForm.name || searchForm.sku,
      category: searchForm.categoryPath ? searchForm.categoryPath[searchForm.categoryPath.length - 1] : null,
      status: searchForm.status === 'active' ? 1 : searchForm.status === 'inactive' ? 0 : null
    }
    
    // 过滤掉空值参数
    Object.keys(params).forEach(key => {
      if (params[key] === null || params[key] === undefined || params[key] === '') {
        delete params[key]
      }
    })
    
    const response = await productApi.getProducts(params)
    if (response) {
      // 转换数据格式以适配前端表格
      productList.value = response.list.map(item => ({
        id: item.id,
        sku: item.productCode,
        name: item.productName,
        category: item.category,
        brand: item.brand,
        price: item.salePrice,
        stock: item.stockQuantity,
        sales: 0, // 后端暂无销量字段
        status: item.status === 1 ? 'active' : 'inactive',
        image: item.imageUrl || 'https://via.placeholder.com/50',
        createTime: new Date(item.createTime).toLocaleDateString()
      }))
      pagination.total = response.total
    }
  } catch (error) {
    console.error('加载产品列表失败:', error)
    ElMessage.error('加载产品列表失败')
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (selection) => {
  selectedProducts.value = selection
}

const handleSortChange = ({ prop, order }) => {
  ElMessage.info(`按${prop}${order === 'ascending' ? '升序' : '降序'}排序`)
}

const handleSizeChange = (size) => {
  pagination.size = size
  loadData()
}

const handlePageChange = (page) => {
  pagination.page = page
  loadData()
}

const showAddDialog = () => {
  productDialogTitle.value = '新增产品'
  resetProductForm()
  productDialogVisible.value = true
}

const editProduct = (row) => {
  productDialogTitle.value = '编辑产品'
  Object.assign(productForm, row)
  productDialogVisible.value = true
}

const viewProduct = (row) => {
  ElMessage.info(`查看产品：${row.name}`)
}

const deleteProduct = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除产品"${row.name}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    ElMessage.success('产品已删除')
    loadData()
  } catch {
    // 用户取消
  }
}

const submitProduct = () => {
  productDialogVisible.value = false
  ElMessage.success(productDialogTitle.value === '新增产品' ? '产品已创建' : '产品已更新')
  loadData()
}

const resetProductForm = () => {
  Object.assign(productForm, {
    id: null,
    name: '',
    sku: '',
    categoryPath: null,
    brand: '',
    description: '',
    images: [],
    price: 0,
    costPrice: 0,
    marketPrice: 0,
    stock: 0,
    safeStock: 0,
    weight: 0,
    status: 'active',
    sort: 0,
    tags: [],
    remarks: ''
  })
  activeTab.value = 'basic'
}

const showBatchImportDialog = () => {
  importStep.value = 0
  importFileList.value = []
  importData.value = []
  importDialogVisible.value = true
}

const downloadTemplate = () => {
  ElMessage.success('模板下载中...')
}

const exportData = () => {
  ElMessage.success(`导出${selectedProducts.value.length}条数据`)
}

const batchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的${selectedProducts.value.length}个产品吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    ElMessage.success(`已删除${selectedProducts.value.length}个产品`)
    loadData()
  } catch {
    // 用户取消
  }
}

const batchUpdateStatus = () => {
  ElMessage.success(`已更新${selectedProducts.value.length}个产品状态`)
}

const handleFileChange = (file) => {
  // 处理文件上传
}

const parseImportFile = () => {
  // 模拟解析文件
  importData.value = [
    { sku: 'TEST-001', name: '测试产品1', price: 100, stock: 50, valid: true },
    { sku: 'TEST-002', name: '测试产品2', price: 200, stock: 30, valid: true },
    { sku: '', name: '测试产品3', price: 0, stock: 0, valid: false }
  ]
  importStep.value = 1
}

const executeImport = () => {
  importResult.success = validCount.value
  importResult.failed = errorCount.value
  importStep.value = 2
  loadData()
}

const closeImportDialog = () => {
  importDialogVisible.value = false
}

const manageSKU = (row) => {
  currentProduct.value = row
  skuList.value = [
    {
      id: 1,
      sku: `${row.sku}-S`,
      specifications: ['小号', '黑色'],
      price: row.price,
      stock: 50,
      status: 'active'
    },
    {
      id: 2,
      sku: `${row.sku}-M`,
      specifications: ['中号', '白色'],
      price: row.price + 10,
      stock: 30,
      status: 'active'
    }
  ]
  skuDialogVisible.value = true
}

const addSKU = () => {
  ElMessage.info('新增SKU功能')
}

const editSKU = (row) => {
  ElMessage.info(`编辑SKU：${row.sku}`)
}

const deleteSKU = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除SKU"${row.sku}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    ElMessage.success('SKU已删除')
  } catch {
    // 用户取消
  }
}

const getStatusType = (status) => {
  const typeMap = {
    active: 'success',
    inactive: 'info',
    out_of_stock: 'warning'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    active: '在售',
    inactive: '停售',
    out_of_stock: '缺货'
  }
  return textMap[status] || '未知'
}

const formatDate = (dateStr) => {
  return dateStr.replace(/-/g, '/')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.search-card {
  margin-bottom: $spacing-lg;
  
  :deep(.el-card__body) {
    padding: $spacing-lg $spacing-xl;
  }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-lg;
  
  .toolbar-left,
  .toolbar-right {
    display: flex;
    gap: $spacing-sm;
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: $spacing-lg 0;
}

.low-stock {
  color: $danger-color;
  font-weight: bold;
}

.danger {
  color: $danger-color !important;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  white-space: nowrap;
  
  .el-button {
    margin: 0;
  }
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  background: $bg-color;
  color: $text-placeholder;
}

.import-steps {
  .step-content {
    margin-top: $spacing-xl;
    padding: $spacing-lg;
  }
  
  .import-tips {
    margin-top: $spacing-lg;
    padding: $spacing-md;
    background: $bg-color;
    border-radius: 4px;
    
    h4 {
      margin: 0 0 $spacing-sm 0;
      color: $text-primary;
    }
    
    ul {
      margin: 0;
      padding-left: $spacing-lg;
      
      li {
        margin-bottom: $spacing-xs;
        color: $text-regular;
      }
    }
  }
  
  .preview-info {
    margin-bottom: $spacing-md;
    
    .success {
      color: $success-color;
      font-weight: bold;
    }
    
    .error {
      color: $danger-color;
      font-weight: bold;
    }
  }
  
  .preview-more {
    text-align: center;
    padding: $spacing-md;
    color: $text-regular;
  }
}

.sku-management {
  .sku-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-lg;
    
    h4 {
      margin: 0;
      color: $text-primary;
    }
  }
  
  .spec-tag {
    margin-right: $spacing-xs;
  }
}

:deep(.el-tabs__content) {
  padding: $spacing-lg 0;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 80px;
  height: 80px;
}

:deep(.el-upload--picture-card) {
  width: 80px;
  height: 80px;
}
</style>