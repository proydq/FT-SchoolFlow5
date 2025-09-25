<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="title">多媒体管理</h2>
      <p class="description">管理产品图片、视频、文档等多媒体资源</p>
    </div>

    <!-- 操作工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button-group>
          <el-button
            v-for="type in mediaTypes"
            :key="type.key"
            :type="activeTab === type.key ? 'primary' : ''"
            @click="switchTab(type.key)"
          >
            <el-icon><component :is="type.icon" /></el-icon>
            {{ type.label }}
          </el-button>
        </el-button-group>
      </div>
      
      <div class="toolbar-right">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索文件名"
          style="width: 200px; margin-right: 10px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-button type="primary" @click="showUploadDialog">
          <el-icon><Upload /></el-icon>
          上传文件
        </el-button>
        
        <el-button @click="createFolder">
          <el-icon><FolderAdd /></el-icon>
          新建文件夹
        </el-button>
        
        <el-button 
          :disabled="!selectedFiles.length"
          @click="batchDelete"
        >
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
      </div>
    </div>

    <!-- 文件路径导航 -->
    <div class="breadcrumb-nav">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item @click="navigateToPath('')">
          <el-icon><House /></el-icon>
          根目录
        </el-breadcrumb-item>
        <el-breadcrumb-item
          v-for="(path, index) in currentPathArray"
          :key="index"
          @click="navigateToPath(getCurrentPath(index))"
        >
          {{ path }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 文件列表 -->
    <el-card shadow="never" class="file-list-card">
      <!-- 视图切换 -->
      <div class="view-controls">
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button label="grid">
            <el-icon><Grid /></el-icon>
            网格视图
          </el-radio-button>
          <el-radio-button label="list">
            <el-icon><List /></el-icon>
            列表视图
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- 网格视图 -->
      <div v-if="viewMode === 'grid'" class="grid-view">
        <div class="file-grid">
          <div
            v-for="file in filteredFiles"
            :key="file.id"
            class="file-item"
            :class="{ selected: selectedFiles.includes(file.id) }"
            @click="selectFile(file)"
            @dblclick="handleDoubleClick(file)"
          >
            <!-- 选择框 -->
            <el-checkbox
              v-model="file.selected"
              class="file-checkbox"
              @click.stop
              @change="handleFileSelect(file)"
            />
            
            <!-- 文件预览 -->
            <div class="file-preview">
              <!-- 文件夹 -->
              <div v-if="file.type === 'folder'" class="folder-icon">
                <el-icon size="64"><Folder /></el-icon>
              </div>
              
              <!-- 图片预览 -->
              <div v-else-if="isImage(file)" class="image-preview">
                <el-image
                  :src="file.url"
                  fit="cover"
                  :preview-src-list="[file.url]"
                />
              </div>
              
              <!-- 视频预览 -->
              <div v-else-if="isVideo(file)" class="video-preview">
                <video
                  :src="file.url"
                  controls
                  preload="metadata"
                  @loadedmetadata="updateVideoDuration(file, $event)"
                />
                <div class="video-overlay">
                  <el-icon size="32"><VideoPlay /></el-icon>
                </div>
              </div>
              
              <!-- 文档图标 -->
              <div v-else class="file-icon">
                <el-icon size="64">
                  <component :is="getFileIcon(file)" />
                </el-icon>
              </div>
            </div>
            
            <!-- 文件信息 -->
            <div class="file-info">
              <div class="file-name" :title="file.name">
                {{ file.name }}
              </div>
              <div class="file-meta">
                <span v-if="file.type !== 'folder'">{{ formatFileSize(file.size) }}</span>
                <span>{{ formatDate(file.updateTime) }}</span>
              </div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="file-actions">
              <el-dropdown trigger="click" @command="handleFileAction">
                <el-button type="text" size="small">
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="{ action: 'preview', file }">
                      <el-icon><View /></el-icon>
                      预览
                    </el-dropdown-item>
                    <el-dropdown-item :command="{ action: 'download', file }">
                      <el-icon><Download /></el-icon>
                      下载
                    </el-dropdown-item>
                    <el-dropdown-item :command="{ action: 'rename', file }">
                      <el-icon><Edit /></el-icon>
                      重命名
                    </el-dropdown-item>
                    <el-dropdown-item 
                      :command="{ action: 'crop', file }"
                      v-if="isImage(file)"
                    >
                      <el-icon><Crop /></el-icon>
                      裁剪
                    </el-dropdown-item>
                    <el-dropdown-item :command="{ action: 'move', file }">
                      <el-icon><FolderOpened /></el-icon>
                      移动
                    </el-dropdown-item>
                    <el-dropdown-item 
                      :command="{ action: 'delete', file }"
                      class="danger-item"
                    >
                      <el-icon><Delete /></el-icon>
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-else class="list-view">
        <el-table
          :data="filteredFiles"
          @selection-change="handleSelectionChange"
          @row-dblclick="handleDoubleClick"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="文件名" min-width="200">
            <template #default="{ row }">
              <div class="file-name-cell">
                <el-icon class="file-type-icon">
                  <component :is="getFileIcon(row)" />
                </el-icon>
                <span>{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="大小" width="100">
            <template #default="{ row }">
              {{ row.type === 'folder' ? '-' : formatFileSize(row.size) }}
            </template>
          </el-table-column>
          <el-table-column label="类型" width="100">
            <template #default="{ row }">
              {{ getFileTypeText(row) }}
            </template>
          </el-table-column>
          <el-table-column label="修改时间" width="150">
            <template #default="{ row }">
              {{ formatDate(row.updateTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button type="text" size="small" @click="previewFile(row)">
                预览
              </el-button>
              <el-button type="text" size="small" @click="downloadFile(row)">
                下载
              </el-button>
              <el-button 
                type="text" 
                size="small" 
                @click="cropImage(row)"
                v-if="isImage(row)"
              >
                裁剪
              </el-button>
              <el-button type="text" size="small" @click="renameFile(row)">
                重命名
              </el-button>
              <el-button 
                type="text" 
                size="small" 
                class="danger"
                @click="deleteFile(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 空状态 -->
      <el-empty v-if="filteredFiles.length === 0" description="暂无文件" />
    </el-card>

    <!-- 上传对话框 -->
    <el-dialog v-model="uploadDialogVisible" title="上传文件" width="600px">
      <el-tabs v-model="uploadTab">
        <!-- 本地上传 -->
        <el-tab-pane label="本地上传" name="local">
          <el-upload
            ref="uploadRef"
            v-model:file-list="uploadFileList"
            drag
            multiple
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :before-upload="beforeUpload"
          >
            <el-icon class="el-icon--upload"><Upload /></el-icon>
            <div class="el-upload__text">
              将文件拖拽到此处，或<em>点击选择文件</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持图片、视频、文档等格式，单个文件不超过100MB
              </div>
            </template>
          </el-upload>
          
          <div v-if="uploadFileList.length" class="upload-list">
            <div class="upload-item" v-for="file in uploadFileList" :key="file.uid">
              <div class="upload-info">
                <span>{{ file.name }}</span>
                <span class="file-size">{{ formatFileSize(file.size) }}</span>
              </div>
              <el-progress 
                v-if="file.status === 'uploading'"
                :percentage="file.percentage"
                status="success"
              />
            </div>
          </div>
        </el-tab-pane>
        
        <!-- URL上传 -->
        <el-tab-pane label="URL上传" name="url">
          <el-form :model="urlUploadForm" label-width="80px">
            <el-form-item label="文件URL">
              <el-input
                v-model="urlUploadForm.url"
                placeholder="请输入文件URL"
              />
            </el-form-item>
            <el-form-item label="文件名">
              <el-input
                v-model="urlUploadForm.filename"
                placeholder="自动从URL获取"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="executeUpload"
            :loading="uploading"
          >
            开始上传
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 图片裁剪对话框 -->
    <el-dialog v-model="cropDialogVisible" title="图片裁剪" width="800px">
      <div class="crop-container" v-if="currentCropFile">
        <div class="crop-preview">
          <img ref="cropImg" :src="currentCropFile.url" />
        </div>
        <div class="crop-controls">
          <div class="crop-presets">
            <h4>预设比例</h4>
            <el-button-group>
              <el-button @click="setCropRatio(1)">1:1</el-button>
              <el-button @click="setCropRatio(4/3)">4:3</el-button>
              <el-button @click="setCropRatio(16/9)">16:9</el-button>
              <el-button @click="setCropRatio(0)">自由</el-button>
            </el-button-group>
          </div>
          
          <div class="crop-tools">
            <h4>裁剪工具</h4>
            <el-button @click="rotateCrop(90)">
              <el-icon><RefreshRight /></el-icon>
              顺时针90°
            </el-button>
            <el-button @click="rotateCrop(-90)">
              <el-icon><RefreshLeft /></el-icon>
              逆时针90°
            </el-button>
            <el-button @click="flipCrop('horizontal')">
              <el-icon><Sort /></el-icon>
              水平翻转
            </el-button>
            <el-button @click="flipCrop('vertical')">
              <el-icon><DCaret /></el-icon>
              垂直翻转
            </el-button>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cropDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveCroppedImage">
            保存裁剪
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 文件预览对话框 -->
    <el-dialog 
      v-model="previewDialogVisible" 
      :title="previewFile?.name"
      width="80%"
      class="preview-dialog"
    >
      <div class="preview-content" v-if="previewFile">
        <!-- 图片预览 -->
        <div v-if="isImage(previewFile)" class="image-preview-large">
          <el-image
            :src="previewFile.url"
            fit="contain"
            :preview-src-list="[previewFile.url]"
          />
        </div>
        
        <!-- 视频预览 -->
        <div v-else-if="isVideo(previewFile)" class="video-preview-large">
          <video :src="previewFile.url" controls />
        </div>
        
        <!-- 文档预览 -->
        <div v-else class="document-preview">
          <div class="document-info">
            <el-icon size="64">
              <component :is="getFileIcon(previewFile)" />
            </el-icon>
            <h3>{{ previewFile.name }}</h3>
            <p>大小：{{ formatFileSize(previewFile.size) }}</p>
            <p>类型：{{ getFileTypeText(previewFile) }}</p>
            <p>修改时间：{{ formatDate(previewFile.updateTime) }}</p>
          </div>
          <el-button type="primary" @click="downloadFile(previewFile)">
            <el-icon><Download /></el-icon>
            下载文件
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 媒体类型
const mediaTypes = [
  { key: 'all', label: '全部', icon: 'Grid' },
  { key: 'image', label: '图片', icon: 'Picture' },
  { key: 'video', label: '视频', icon: 'VideoPlay' },
  { key: 'document', label: '文档', icon: 'Document' }
]

// 响应式数据
const activeTab = ref('all')
const viewMode = ref('grid')
const searchKeyword = ref('')
const currentPath = ref('')
const selectedFiles = ref([])

// 对话框状态
const uploadDialogVisible = ref(false)
const cropDialogVisible = ref(false)
const previewDialogVisible = ref(false)

// 上传相关
const uploadTab = ref('local')
const uploadFileList = ref([])
const uploading = ref(false)
const urlUploadForm = reactive({
  url: '',
  filename: ''
})

// 当前文件
const currentCropFile = ref(null)
const currentPreviewFile = ref(null)

// 模拟文件数据
const fileList = ref([
  {
    id: 1,
    name: '产品展示图1.jpg',
    type: 'image',
    extension: 'jpg',
    size: 2048576,
    url: 'https://via.placeholder.com/400x300',
    path: '/images/',
    updateTime: '2024-01-15 10:30:00',
    selected: false
  },
  {
    id: 2,
    name: '产品视频介绍.mp4',
    type: 'video',
    extension: 'mp4',
    size: 52428800,
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    path: '/videos/',
    updateTime: '2024-01-16 14:20:00',
    duration: 120,
    selected: false
  },
  {
    id: 3,
    name: '产品规格书.pdf',
    type: 'document',
    extension: 'pdf',
    size: 1024000,
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    path: '/documents/',
    updateTime: '2024-01-17 09:15:00',
    selected: false
  },
  {
    id: 4,
    name: '图片文件夹',
    type: 'folder',
    path: '/images/',
    updateTime: '2024-01-18 16:45:00',
    selected: false
  }
])

// 计算属性
const currentPathArray = computed(() => {
  return currentPath.value ? currentPath.value.split('/').filter(Boolean) : []
})

const filteredFiles = computed(() => {
  let files = fileList.value.filter(file => {
    // 路径过滤
    const inCurrentPath = file.path === currentPath.value || 
                         (currentPath.value === '' && file.path === '/')
    
    // 类型过滤
    const typeMatch = activeTab.value === 'all' || file.type === activeTab.value
    
    // 关键词过滤
    const keywordMatch = !searchKeyword.value || 
                        file.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
    
    return inCurrentPath && typeMatch && keywordMatch
  })
  
  return files
})

// 方法
const switchTab = (tab) => {
  activeTab.value = tab
}

const selectFile = (file) => {
  file.selected = !file.selected
  handleFileSelect(file)
}

const handleFileSelect = (file) => {
  if (file.selected) {
    if (!selectedFiles.value.includes(file.id)) {
      selectedFiles.value.push(file.id)
    }
  } else {
    const index = selectedFiles.value.indexOf(file.id)
    if (index > -1) {
      selectedFiles.value.splice(index, 1)
    }
  }
}

const handleSelectionChange = (selection) => {
  selectedFiles.value = selection.map(item => item.id)
}

const handleDoubleClick = (file) => {
  if (file.type === 'folder') {
    navigateToPath(file.path + file.name)
  } else {
    previewFile(file)
  }
}

const navigateToPath = (path) => {
  currentPath.value = path
}

const getCurrentPath = (index) => {
  return currentPathArray.value.slice(0, index + 1).join('/')
}

const showUploadDialog = () => {
  uploadFileList.value = []
  uploadDialogVisible.value = true
}

const createFolder = async () => {
  try {
    const { value } = await ElMessageBox.prompt('请输入文件夹名称', '新建文件夹', {
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    
    if (value) {
      // 创建文件夹逻辑
      ElMessage.success(`文件夹 "${value}" 创建成功`)
    }
  } catch {
    // 用户取消
  }
}

const batchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedFiles.value.length} 个文件吗？`,
      '批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    ElMessage.success(`已删除 ${selectedFiles.value.length} 个文件`)
    selectedFiles.value = []
  } catch {
    // 用户取消
  }
}

const handleFileAction = ({ action, file }) => {
  switch (action) {
    case 'preview':
      previewFile(file)
      break
    case 'download':
      downloadFile(file)
      break
    case 'rename':
      renameFile(file)
      break
    case 'crop':
      cropImage(file)
      break
    case 'move':
      moveFile(file)
      break
    case 'delete':
      deleteFile(file)
      break
  }
}

const previewFile = (file) => {
  currentPreviewFile.value = file
  previewDialogVisible.value = true
}

const downloadFile = (file) => {
  // 模拟下载
  const link = document.createElement('a')
  link.href = file.url
  link.download = file.name
  link.click()
  ElMessage.success(`开始下载 ${file.name}`)
}

const renameFile = async (file) => {
  try {
    const { value } = await ElMessageBox.prompt('请输入新的文件名', '重命名', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: file.name
    })
    
    if (value && value !== file.name) {
      file.name = value
      ElMessage.success('重命名成功')
    }
  } catch {
    // 用户取消
  }
}

const cropImage = (file) => {
  if (!isImage(file)) {
    ElMessage.warning('只能裁剪图片文件')
    return
  }
  
  currentCropFile.value = file
  cropDialogVisible.value = true
}

const moveFile = async (file) => {
  ElMessage.info('移动文件功能开发中...')
}

const deleteFile = async (file) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 "${file.name}" 吗？`,
      '删除文件',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const index = fileList.value.findIndex(f => f.id === file.id)
    if (index > -1) {
      fileList.value.splice(index, 1)
    }
    
    ElMessage.success('文件已删除')
  } catch {
    // 用户取消
  }
}

const handleFileChange = (file) => {
  // 处理文件变化
}

const beforeUpload = (file) => {
  const maxSize = 100 * 1024 * 1024 // 100MB
  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过100MB')
    return false
  }
  return true
}

const executeUpload = async () => {
  if (uploadTab.value === 'local') {
    if (!uploadFileList.value.length) {
      ElMessage.warning('请选择要上传的文件')
      return
    }
    
    uploading.value = true
    
    try {
      // 模拟上传过程
      for (let i = 0; i < uploadFileList.value.length; i++) {
        const file = uploadFileList.value[i]
        file.status = 'uploading'
        file.percentage = 0
        
        // 模拟上传进度
        for (let progress = 0; progress <= 100; progress += 10) {
          file.percentage = progress
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        
        file.status = 'success'
      }
      
      ElMessage.success('上传完成')
      uploadDialogVisible.value = false
      
    } catch (error) {
      ElMessage.error('上传失败')
    } finally {
      uploading.value = false
    }
    
  } else {
    // URL上传
    if (!urlUploadForm.url) {
      ElMessage.warning('请输入文件URL')
      return
    }
    
    ElMessage.success('URL上传功能开发中...')
  }
}

const setCropRatio = (ratio) => {
  ElMessage.info(`设置裁剪比例: ${ratio || '自由'}`)
}

const rotateCrop = (angle) => {
  ElMessage.info(`旋转 ${angle}°`)
}

const flipCrop = (direction) => {
  ElMessage.info(`${direction === 'horizontal' ? '水平' : '垂直'}翻转`)
}

const saveCroppedImage = () => {
  ElMessage.success('图片裁剪保存成功')
  cropDialogVisible.value = false
}

const updateVideoDuration = (file, event) => {
  file.duration = Math.floor(event.target.duration)
}

// 工具函数
const isImage = (file) => {
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(file.extension?.toLowerCase())
}

const isVideo = (file) => {
  return ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(file.extension?.toLowerCase())
}

const getFileIcon = (file) => {
  if (file.type === 'folder') return 'Folder'
  if (isImage(file)) return 'Picture'
  if (isVideo(file)) return 'VideoPlay'
  
  const iconMap = {
    pdf: 'Document',
    doc: 'Document',
    docx: 'Document',
    xls: 'Document',
    xlsx: 'Document',
    ppt: 'Document',
    pptx: 'Document',
    txt: 'Document'
  }
  
  return iconMap[file.extension?.toLowerCase()] || 'Document'
}

const getFileTypeText = (file) => {
  if (file.type === 'folder') return '文件夹'
  
  const typeMap = {
    image: '图片',
    video: '视频',
    document: '文档'
  }
  
  return typeMap[file.type] || '文件'
}

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatDate = (dateStr) => {
  return dateStr.replace(/-/g, '/')
}

onMounted(() => {
  // 初始化
})
</script>

<style scoped lang="scss">
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-lg;
  padding: $spacing-md;
  background: $bg-white;
  border-radius: 4px;
  box-shadow: $box-shadow-base;
  
  .toolbar-left {
    .el-button-group {
      margin-right: $spacing-md;
    }
  }
  
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }
}

.breadcrumb-nav {
  margin-bottom: $spacing-md;
  
  :deep(.el-breadcrumb__item) {
    cursor: pointer;
    
    &:hover .el-breadcrumb__inner {
      color: $primary-color;
    }
  }
}

.file-list-card {
  min-height: 600px;
  
  .view-controls {
    display: flex;
    justify-content: flex-end;
    margin-bottom: $spacing-lg;
  }
}

.grid-view {
  .file-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: $spacing-lg;
    
    .file-item {
      position: relative;
      padding: $spacing-md;
      border: 2px solid transparent;
      border-radius: 8px;
      background: $bg-white;
      box-shadow: $box-shadow-base;
      cursor: pointer;
      transition: all $transition-duration;
      
      &:hover {
        box-shadow: $box-shadow-light;
        transform: translateY(-2px);
        
        .file-actions {
          opacity: 1;
        }
      }
      
      &.selected {
        border-color: $primary-color;
        background: rgba(64, 158, 255, 0.05);
      }
      
      .file-checkbox {
        position: absolute;
        top: 8px;
        left: 8px;
        z-index: 2;
      }
      
      .file-preview {
        position: relative;
        height: 120px;
        margin-bottom: $spacing-sm;
        display: flex;
        align-items: center;
        justify-content: center;
        background: $bg-color;
        border-radius: 4px;
        overflow: hidden;
        
        .folder-icon {
          color: $warning-color;
        }
        
        .image-preview {
          width: 100%;
          height: 100%;
          
          :deep(.el-image) {
            width: 100%;
            height: 100%;
          }
        }
        
        .video-preview {
          position: relative;
          width: 100%;
          height: 100%;
          
          video {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .video-overlay {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 50%;
            padding: $spacing-sm;
            pointer-events: none;
          }
        }
        
        .file-icon {
          color: $text-secondary;
        }
      }
      
      .file-info {
        .file-name {
          font-weight: 500;
          color: $text-primary;
          margin-bottom: $spacing-xs;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .file-meta {
          font-size: $font-size-sm;
          color: $text-secondary;
          
          span {
            margin-right: $spacing-sm;
          }
        }
      }
      
      .file-actions {
        position: absolute;
        top: 8px;
        right: 8px;
        opacity: 0;
        transition: opacity $transition-duration;
      }
    }
  }
}

.list-view {
  .file-name-cell {
    display: flex;
    align-items: center;
    
    .file-type-icon {
      margin-right: $spacing-sm;
      color: $text-secondary;
    }
  }
}

.upload-list {
  margin-top: $spacing-lg;
  
  .upload-item {
    padding: $spacing-sm;
    border: 1px solid $border-light;
    border-radius: 4px;
    margin-bottom: $spacing-sm;
    
    .upload-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: $spacing-xs;
      
      .file-size {
        color: $text-secondary;
        font-size: $font-size-sm;
      }
    }
  }
}

.crop-container {
  display: flex;
  gap: $spacing-xl;
  
  .crop-preview {
    flex: 1;
    text-align: center;
    
    img {
      max-width: 100%;
      max-height: 400px;
    }
  }
  
  .crop-controls {
    width: 200px;
    
    h4 {
      margin-bottom: $spacing-sm;
      color: $text-primary;
    }
    
    .crop-presets,
    .crop-tools {
      margin-bottom: $spacing-lg;
      
      .el-button-group,
      .el-button {
        margin-bottom: $spacing-xs;
      }
    }
  }
}

.preview-content {
  text-align: center;
  
  .image-preview-large,
  .video-preview-large {
    :deep(.el-image),
    video {
      max-width: 100%;
      max-height: 70vh;
    }
  }
  
  .document-preview {
    padding: $spacing-xl;
    
    .document-info {
      margin-bottom: $spacing-lg;
      
      h3 {
        margin: $spacing-md 0;
        color: $text-primary;
      }
      
      p {
        margin: $spacing-xs 0;
        color: $text-regular;
      }
    }
  }
}

:deep(.danger-item) {
  color: $danger-color;
}

.danger {
  color: $danger-color !important;
}

:deep(.preview-dialog) {
  .el-dialog__body {
    padding: 0;
  }
}
</style>