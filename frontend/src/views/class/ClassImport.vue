<template>
  <div class="class-import-container">
    <el-page-header @back="handleBack">
      <template #title>
        <span>批量导入班级</span>
      </template>
    </el-page-header>

    <!-- 导入步骤 -->
    <el-card style="margin-top: 20px">
      <el-steps :active="currentStep" align-center>
        <el-step title="下载模板" description="下载Excel导入模板" />
        <el-step title="填写数据" description="按模板格式填写班级数据" />
        <el-step title="上传文件" description="上传填写好的Excel文件" />
        <el-step title="数据校验" description="系统校验数据格式" />
        <el-step title="导入完成" description="数据导入成功" />
      </el-steps>
    </el-card>

    <!-- 操作区域 -->
    <el-card style="margin-top: 20px">
      <div class="import-actions">
        <!-- Step 1: 下载模板 -->
        <div v-if="currentStep === 0" class="step-content">
          <el-alert
            title="导入说明"
            type="info"
            :closable="false"
            show-icon
          >
            <template #default>
              <ul>
                <li>请先下载Excel模板，按照模板格式填写班级信息</li>
                <li>班级名称为必填项，且不能与现有班级重复</li>
                <li>年级必须是系统中已存在的年级</li>
                <li>班主任信息可选填，系统会自动匹配教师</li>
                <li>单次导入不超过500条数据</li>
              </ul>
            </template>
          </el-alert>
          <div style="margin-top: 30px; text-align: center;">
            <el-button type="primary" size="large" @click="handleDownloadTemplate">
              <el-icon><Download /></el-icon>
              下载导入模板
            </el-button>
            <el-button size="large" @click="currentStep = 2">
              已有模板，直接上传
              <el-icon><Right /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- Step 2: 上传文件 -->
        <div v-if="currentStep === 2" class="step-content">
          <el-upload
            ref="uploadRef"
            class="upload-area"
            drag
            action="#"
            :auto-upload="false"
            :limit="1"
            accept=".xlsx,.xls"
            :on-change="handleFileChange"
            :on-exceed="handleExceed"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                只支持 .xlsx、.xls 格式的Excel文件，文件大小不超过10MB
              </div>
            </template>
          </el-upload>

          <div v-if="uploadFile" class="file-info">
            <el-card>
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <el-icon><Document /></el-icon>
                  {{ uploadFile.name }}
                  <el-text type="info" size="small">
                    ({{ (uploadFile.size / 1024).toFixed(2) }} KB)
                  </el-text>
                </div>
                <el-button type="danger" link @click="handleRemoveFile">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </el-card>
          </div>

          <div style="margin-top: 30px; text-align: center;">
            <el-button @click="currentStep = 0">
              <el-icon><Back /></el-icon>
              上一步
            </el-button>
            <el-button
              type="primary"
              :disabled="!uploadFile"
              @click="handleUpload"
            >
              开始导入
              <el-icon><Right /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- Step 3: 数据校验 -->
        <div v-if="currentStep === 3" class="step-content">
          <div v-loading="validating" element-loading-text="正在校验数据...">
            <el-alert
              v-if="validationResult.success"
              title="数据校验通过"
              type="success"
              :closable="false"
              show-icon
            >
              <template #default>
                <div>共检测到 {{ validationResult.totalCount }} 条数据，全部校验通过</div>
              </template>
            </el-alert>

            <el-alert
              v-else-if="validationResult.errors.length > 0"
              title="数据校验失败"
              type="error"
              :closable="false"
              show-icon
            >
              <template #default>
                <div>发现以下错误，请修正后重新上传：</div>
              </template>
            </el-alert>

            <!-- 错误列表 -->
            <el-table
              v-if="validationResult.errors.length > 0"
              :data="validationResult.errors"
              stripe
              border
              style="margin-top: 20px"
              max-height="400"
            >
              <el-table-column prop="row" label="行号" width="80" align="center" />
              <el-table-column prop="field" label="字段" width="120" />
              <el-table-column prop="value" label="值" width="150" />
              <el-table-column prop="message" label="错误信息" min-width="200" />
            </el-table>

            <!-- 预览数据 -->
            <div v-if="validationResult.success && previewData.length > 0" style="margin-top: 20px">
              <h4>数据预览（前10条）</h4>
              <el-table
                :data="previewData"
                stripe
                border
                max-height="400"
              >
                <el-table-column prop="className" label="班级名称" min-width="120" />
                <el-table-column prop="gradeName" label="年级" width="100" />
                <el-table-column prop="location" label="位置" width="150" />
                <el-table-column prop="sort" label="排序" width="80" align="center" />
                <el-table-column prop="status" label="状态" width="100" align="center">
                  <template #default="{ row }">
                    <el-tag :type="row.status === '正常' ? 'success' : 'warning'" size="small">
                      {{ row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="teacherName" label="班主任" width="120" />
              </el-table>
            </div>

            <div style="margin-top: 30px; text-align: center;">
              <el-button @click="handleReupload">
                <el-icon><Refresh /></el-icon>
                重新上传
              </el-button>
              <el-button
                v-if="validationResult.success"
                type="primary"
                @click="handleConfirmImport"
              >
                确认导入
                <el-icon><Check /></el-icon>
              </el-button>
            </div>
          </div>
        </div>

        <!-- Step 4: 导入结果 -->
        <div v-if="currentStep === 4" class="step-content">
          <el-result
            :icon="importResult.success ? 'success' : 'error'"
            :title="importResult.success ? '导入成功' : '导入失败'"
          >
            <template #sub-title>
              <div v-if="importResult.success">
                成功导入 {{ importResult.successCount }} 条班级数据
              </div>
              <div v-else>
                {{ importResult.message }}
              </div>
            </template>
            <template #extra>
              <el-button type="primary" @click="handleViewList">查看班级列表</el-button>
              <el-button @click="handleContinueImport">继续导入</el-button>
            </template>
          </el-result>

          <!-- 导入详情 -->
          <el-card v-if="importResult.details" style="margin-top: 20px">
            <template #header>
              <span>导入详情</span>
            </template>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="总条数">
                {{ importResult.details.total }}
              </el-descriptions-item>
              <el-descriptions-item label="成功条数">
                <el-text type="success">{{ importResult.details.success }}</el-text>
              </el-descriptions-item>
              <el-descriptions-item label="失败条数">
                <el-text type="danger">{{ importResult.details.failed }}</el-text>
              </el-descriptions-item>
              <el-descriptions-item label="跳过条数">
                <el-text type="warning">{{ importResult.details.skipped }}</el-text>
              </el-descriptions-item>
              <el-descriptions-item label="导入时间">
                {{ formatDate(importResult.details.importTime) }}
              </el-descriptions-item>
              <el-descriptions-item label="操作人">
                {{ importResult.details.operator }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </div>
      </div>
    </el-card>

    <!-- 导入记录 -->
    <el-card style="margin-top: 20px">
      <template #header>
        <span>历史导入记录</span>
      </template>
      <el-table :data="importHistory" stripe border>
        <el-table-column prop="fileName" label="文件名" min-width="150" />
        <el-table-column prop="importTime" label="导入时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.importTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="totalCount" label="总条数" width="80" align="center" />
        <el-table-column prop="successCount" label="成功" width="80" align="center">
          <template #default="{ row }">
            <el-text type="success">{{ row.successCount }}</el-text>
          </template>
        </el-table-column>
        <el-table-column prop="failedCount" label="失败" width="80" align="center">
          <template #default="{ row }">
            <el-text type="danger">{{ row.failedCount }}</el-text>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
              {{ row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewDetail(row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UploadFile, UploadFiles, UploadInstance } from 'element-plus'
import {
  Download,
  Right,
  Back,
  UploadFilled,
  Document,
  Delete,
  Refresh,
  Check
} from '@element-plus/icons-vue'
import { downloadTemplate, importClasses } from '@/api/class'

const router = useRouter()
const uploadRef = ref<UploadInstance>()

// 当前步骤
const currentStep = ref(0)

// 上传文件
const uploadFile = ref<File | null>(null)

// 校验状态
const validating = ref(false)
const validationResult = reactive({
  success: false,
  totalCount: 0,
  errors: [] as any[]
})

// 预览数据
const previewData = ref<any[]>([])

// 导入结果
const importResult = reactive({
  success: false,
  message: '',
  successCount: 0,
  details: null as any
})

// 导入历史
const importHistory = ref([
  {
    id: '1',
    fileName: '班级信息_20240115.xlsx',
    importTime: '2024-01-15 10:30:00',
    totalCount: 50,
    successCount: 48,
    failedCount: 2,
    operator: '张老师',
    status: 'success'
  },
  {
    id: '2',
    fileName: '班级信息_20240110.xlsx',
    importTime: '2024-01-10 14:20:00',
    totalCount: 30,
    successCount: 30,
    failedCount: 0,
    operator: '李老师',
    status: 'success'
  }
])

// 返回
const handleBack = () => {
  router.push('/class/list')
}

// 下载模板
const handleDownloadTemplate = async () => {
  try {
    const res = await downloadTemplate()
    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = '班级导入模板.xlsx'
    link.click()
    ElMessage.success('模板下载成功')
    currentStep.value = 2
  } catch (error) {
    ElMessage.error('模板下载失败')
  }
}

// 文件改变
const handleFileChange = (file: UploadFile, files: UploadFiles) => {
  if (!file.raw) return

  // 检查文件大小
  if (file.size! > 10 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过10MB')
    uploadRef.value?.clearFiles()
    return
  }

  uploadFile.value = file.raw
}

// 超出限制
const handleExceed = () => {
  ElMessage.warning('只能上传一个文件')
}

// 删除文件
const handleRemoveFile = () => {
  uploadFile.value = null
  uploadRef.value?.clearFiles()
}

// 上传文件
const handleUpload = async () => {
  if (!uploadFile.value) return

  currentStep.value = 3
  validating.value = true

  // 模拟数据校验
  setTimeout(() => {
    validating.value = false

    // 模拟校验成功
    validationResult.success = true
    validationResult.totalCount = 25
    validationResult.errors = []

    // 设置预览数据
    previewData.value = [
      {
        className: '高一（1）班',
        gradeName: '高一年级',
        location: '教学楼3楼301室',
        sort: 1,
        status: '正常',
        teacherName: '张老师'
      },
      {
        className: '高一（2）班',
        gradeName: '高一年级',
        location: '教学楼3楼302室',
        sort: 2,
        status: '正常',
        teacherName: '李老师'
      }
    ]
  }, 2000)
}

// 重新上传
const handleReupload = () => {
  currentStep.value = 2
  validationResult.success = false
  validationResult.errors = []
  previewData.value = []
}

// 确认导入
const handleConfirmImport = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要导入这 ${validationResult.totalCount} 条班级数据吗？`,
      '导入确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 执行导入
    const res = await importClasses(uploadFile.value!)

    currentStep.value = 4
    importResult.success = true
    importResult.successCount = validationResult.totalCount
    importResult.details = {
      total: validationResult.totalCount,
      success: validationResult.totalCount,
      failed: 0,
      skipped: 0,
      importTime: new Date().toISOString(),
      operator: '当前用户'
    }

    ElMessage.success('数据导入成功')
  } catch (error) {
    if (error !== 'cancel') {
      currentStep.value = 4
      importResult.success = false
      importResult.message = '导入过程中发生错误'
      ElMessage.error('导入失败')
    }
  }
}

// 查看列表
const handleViewList = () => {
  router.push('/class/list')
}

// 继续导入
const handleContinueImport = () => {
  currentStep.value = 0
  uploadFile.value = null
  uploadRef.value?.clearFiles()
  validationResult.success = false
  validationResult.errors = []
  previewData.value = []
}

// 查看详情
const handleViewDetail = (row: any) => {
  ElMessage.info('查看导入详情功能开发中')
}

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style lang="scss" scoped>
.class-import-container {
  padding: 20px;
}

.step-content {
  padding: 20px;
}

.upload-area {
  width: 100%;

  :deep(.el-upload) {
    width: 100%;
  }

  :deep(.el-upload-dragger) {
    width: 100%;
    padding: 40px;
  }
}

.file-info {
  margin-top: 20px;
}

.import-actions {
  min-height: 400px;
}

ul {
  margin: 10px 0;
  padding-left: 20px;

  li {
    margin: 5px 0;
    list-style: disc;
  }
}
</style>