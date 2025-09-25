<template>
  <div class="company-lists">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h2>📋 我的公司列表</h2>
          <span class="subtitle">管理和查看您收藏的公司信息</span>
        </div>
        <div class="header-actions">
          <el-button type="primary" icon="Plus" @click="showCreateDialog">
            创建新列表
          </el-button>
        </div>
      </div>
    </div>

    <!-- 列表卡片 -->
    <el-row :gutter="20" v-loading="loading">
      <el-col :span="6" v-for="list in companyLists" :key="list.id">
        <el-card class="list-card" @click="viewListDetail(list)">
          <template #header>
            <div class="card-header">
              <div class="list-title">
                <span>{{ list.name }}</span>
                <el-tag v-if="list.isDefault" type="primary" size="small">默认</el-tag>
              </div>
              <el-dropdown @command="handleCommand($event, list)" @click.stop>
                <el-button text icon="More" />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="edit">编辑</el-dropdown-item>
                    <el-dropdown-item command="delete" :disabled="list.isDefault">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
          <div class="list-content">
            <p class="description">{{ list.description || '暂无描述' }}</p>
            <div class="stats">
              <div class="stat-item">
                <el-icon><Document /></el-icon>
                <span>{{ list.companyCount || 0 }} 个公司</span>
              </div>
              <div class="stat-item">
                <el-icon><Calendar /></el-icon>
                <span>{{ formatDate(list.createdAt) }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 空状态 -->
      <el-col :span="24" v-if="!loading && companyLists.length === 0">
        <el-empty description="暂无列表">
          <el-button type="primary" @click="showCreateDialog">创建第一个列表</el-button>
        </el-empty>
      </el-col>
    </el-row>

    <!-- 列表详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="currentList?.name"
      width="90%"
      top="5vh"
    >
      <div class="list-detail" v-if="currentList">
        <!-- 搜索栏 -->
        <div class="search-bar">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索公司名称、域名、备注或标签"
            prefix-icon="Search"
            clearable
            @clear="loadListCompanies"
            @keyup.enter="loadListCompanies"
          />
          <el-button type="primary" @click="loadListCompanies">搜索</el-button>
        </div>

        <!-- 公司列表表格 -->
        <el-table
          :data="listCompanies"
          v-loading="detailLoading"
          stripe
          style="width: 100%"
        >
          <el-table-column type="selection" width="50" />
          <el-table-column prop="organization" label="公司名称" min-width="200">
            <template #default="{ row }">
              <div>
                <div class="company-name">{{ row.organization || '未知公司' }}</div>
                <el-link type="primary" :href="`https://${row.domain}`" target="_blank">
                  {{ row.domain }}
                </el-link>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="notes" label="备注" width="200">
            <template #default="{ row }">
              <el-input
                v-if="editingNote === row.id"
                v-model="row.notes"
                @blur="saveNote(row)"
                @keyup.enter="saveNote(row)"
                size="small"
              />
              <span v-else @click="editNote(row)" class="editable-note">
                {{ row.notes || '点击添加备注' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="tags" label="标签" width="200">
            <template #default="{ row }">
              <div class="tags-wrapper">
                <el-tag
                  v-for="tag in (row.tags || '').split(',').filter(t => t)"
                  :key="tag"
                  size="small"
                  closable
                  @close="removeTag(row, tag)"
                >
                  {{ tag }}
                </el-tag>
                <el-input
                  v-if="editingTag === row.id"
                  v-model="newTag"
                  size="small"
                  @blur="addTag(row)"
                  @keyup.enter="addTag(row)"
                  style="width: 80px"
                />
                <el-button
                  v-else
                  size="small"
                  icon="Plus"
                  @click="startAddTag(row)"
                  text
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="添加时间" width="160">
            <template #default="{ row }">
              {{ formatDateTime(row.addedAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button
                text
                type="danger"
                icon="Delete"
                @click="removeFromList(row)"
              >
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="totalCompanies"
            layout="total, sizes, prev, pager, next"
            @size-change="loadListCompanies"
            @current-change="loadListCompanies"
          />
        </div>
      </div>
    </el-dialog>

    <!-- 创建/编辑列表对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      :title="editingList ? '编辑列表' : '创建新列表'"
      width="500px"
    >
      <el-form :model="listForm" label-width="80px">
        <el-form-item label="列表名称" required>
          <el-input
            v-model="listForm.name"
            placeholder="请输入列表名称"
            maxlength="100"
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="listForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入列表描述"
            maxlength="500"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveList">
          {{ editingList ? '保存' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, Calendar, Search, Plus, Delete, More } from '@element-plus/icons-vue'
import companyListsAPI from '@/api/company-lists'

// 数据状态
const loading = ref(false)
const detailLoading = ref(false)
const companyLists = ref([])
const currentList = ref(null)
const listCompanies = ref([])
const totalCompanies = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchKeyword = ref('')

// 对话框状态
const detailDialogVisible = ref(false)
const createDialogVisible = ref(false)
const editingList = ref(null)

// 表单数据
const listForm = reactive({
  name: '',
  description: ''
})

// 编辑状态
const editingNote = ref(null)
const editingTag = ref(null)
const newTag = ref('')

// 加载列表
const loadLists = async () => {
  loading.value = true
  try {
    const response = await companyListsAPI.getUserLists()
    if (response.code === 200) {
      companyLists.value = response.data || []
    }
  } catch (error) {
    ElMessage.error('加载列表失败')
  } finally {
    loading.value = false
  }
}

// 查看列表详情
const viewListDetail = async (list) => {
  currentList.value = list
  currentPage.value = 1
  searchKeyword.value = ''
  detailDialogVisible.value = true
  await loadListCompanies()
}

// 加载列表中的公司
const loadListCompanies = async () => {
  if (!currentList.value) return

  detailLoading.value = true
  try {
    const response = await companyListsAPI.getListCompanies(
      currentList.value.id,
      currentPage.value - 1,
      pageSize.value,
      searchKeyword.value
    )
    if (response.code === 200 && response.data) {
      listCompanies.value = response.data.companies || []
      totalCompanies.value = response.data.total || 0
    }
  } catch (error) {
    ElMessage.error('加载公司列表失败')
  } finally {
    detailLoading.value = false
  }
}

// 显示创建对话框
const showCreateDialog = () => {
  editingList.value = null
  listForm.name = ''
  listForm.description = ''
  createDialogVisible.value = true
}

// 保存列表
const saveList = async () => {
  if (!listForm.name) {
    ElMessage.warning('请输入列表名称')
    return
  }

  try {
    let response
    if (editingList.value) {
      response = await companyListsAPI.updateList(
        editingList.value.id,
        listForm.name,
        listForm.description
      )
    } else {
      response = await companyListsAPI.createList(
        listForm.name,
        listForm.description
      )
    }

    if (response.code === 200) {
      ElMessage.success(editingList.value ? '更新成功' : '创建成功')
      createDialogVisible.value = false
      await loadLists()
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 处理下拉菜单命令
const handleCommand = (command, list) => {
  if (command === 'edit') {
    editingList.value = list
    listForm.name = list.name
    listForm.description = list.description
    createDialogVisible.value = true
  } else if (command === 'delete') {
    deleteList(list)
  }
}

// 删除列表
const deleteList = async (list) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除列表"${list.name}"吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await companyListsAPI.deleteList(list.id)
    if (response.code === 200) {
      ElMessage.success('删除成功')
      await loadLists()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 从列表中移除公司
const removeFromList = async (company) => {
  try {
    await ElMessageBox.confirm(
      `确定要从列表中移除"${company.organization || company.domain}"吗？`,
      '移除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await companyListsAPI.removeCompaniesFromList(
      currentList.value.id,
      [company.domain]
    )
    if (response.code === 200) {
      ElMessage.success('移除成功')
      await loadListCompanies()
      // 更新列表的公司数量
      currentList.value.companyCount--
      const list = companyLists.value.find(l => l.id === currentList.value.id)
      if (list) {
        list.companyCount = currentList.value.companyCount
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('移除失败')
    }
  }
}

// 编辑备注
const editNote = (row) => {
  editingNote.value = row.id
}

const saveNote = async (row) => {
  editingNote.value = null
  // TODO: 调用API保存备注
  ElMessage.success('备注已保存')
}

// 添加标签
const startAddTag = (row) => {
  editingTag.value = row.id
  newTag.value = ''
}

const addTag = async (row) => {
  if (newTag.value) {
    const tags = row.tags ? row.tags.split(',') : []
    tags.push(newTag.value)
    row.tags = tags.join(',')
    // TODO: 调用API保存标签
    ElMessage.success('标签已添加')
  }
  editingTag.value = null
  newTag.value = ''
}

const removeTag = async (row, tag) => {
  const tags = row.tags.split(',').filter(t => t !== tag)
  row.tags = tags.join(',')
  // TODO: 调用API保存标签
  ElMessage.success('标签已移除')
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

// 初始化
onMounted(() => {
  loadLists()
})
</script>

<style lang="scss" scoped>
.company-lists {
  padding: 20px;

  .page-header {
    margin-bottom: 24px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title-section {
        h2 {
          font-size: 24px;
          margin: 0 0 8px 0;
          color: #303133;
        }

        .subtitle {
          color: #909399;
          font-size: 14px;
        }
      }
    }
  }

  .list-card {
    margin-bottom: 20px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .list-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
      }
    }

    .list-content {
      .description {
        color: #606266;
        margin-bottom: 12px;
        min-height: 40px;
      }

      .stats {
        display: flex;
        gap: 16px;

        .stat-item {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #909399;
          font-size: 13px;
        }
      }
    }
  }

  .list-detail {
    .search-bar {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;

      .el-input {
        flex: 1;
      }
    }

    .company-name {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .editable-note {
      cursor: pointer;
      color: #606266;

      &:hover {
        color: $primary-color;
      }
    }

    .tags-wrapper {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
      align-items: center;
    }

    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>