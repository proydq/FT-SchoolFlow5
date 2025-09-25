<template>
  <div class="teacher-import-container">
    <el-page-header @back="handleBack">
      <template #title>
        <span>批量导入教师</span>
      </template>
    </el-page-header>

    <el-card style="margin-top: 20px">
      <el-steps :active="activeStep" align-center>
        <el-step title="下载模板" />
        <el-step title="填写数据" />
        <el-step title="上传文件" />
        <el-step title="完成导入" />
      </el-steps>

      <!-- 步骤1：下载模板 -->
      <div v-if="activeStep === 0" class="step-content">
        <el-alert type="info" :closable="false">
          <template #title>
            请下载标准模板填写数据，必填字段标红，不可修改列顺序，支持单次导入200条
          </template>
        </el-alert>
        <div class="template-download">
          <el-button type="primary" size="large" @click="handleDownloadTemplate">
            <el-icon><Download /></el-icon>
            下载教师导入模板 V1.0
          </el-button>
        </div>
        <el-button type="primary" @click="activeStep++">下一步</el-button>
      </div>

      <!-- 步骤2：填写数据 -->
      <div v-if="activeStep === 1" class="step-content">
        <el-alert type="warning" :closable="false">
          <template #title>
            填写规则提示
          </template>
          <div>
            <p>1. 工号格式：T+4位年份+3位序号（如T2024001）</p>
            <p>2. 性别仅填"男/女"</p>
            <p>3. 职位仅填"校长/教务主任/年级主任/班主任/普通教师"</p>
            <p>4. 入职时间格式"YYYY-MM-DD"</p>
            <p>5. 人员状态填"在职/离职/退休"</p>
          </div>
        </el-alert>
        <div class="button-group">
          <el-button @click="activeStep--">上一步</el-button>
          <el-button type="primary" @click="activeStep++">下一步</el-button>
        </div>
      </div>

      <!-- 步骤3：上传文件 -->
      <div v-if="activeStep === 2" class="step-content">
        <el-upload
          class="upload-demo"
          drag
          :action="'#'"
          :auto-upload="false"
          :on-change="handleFileChange"
          :before-upload="beforeUpload"
          :limit="1"
          accept=".xlsx,.xls"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持.xlsx格式，单个文件最大5MB，不可上传加密文件
            </div>
          </template>
        </el-upload>
        <div class="button-group">
          <el-button @click="activeStep--">上一步</el-button>
          <el-button type="primary" @click="handleImport" :loading="importing">开始导入</el-button>
        </div>
      </div>

      <!-- 步骤4：完成导入 -->
      <div v-if="activeStep === 3" class="step-content">
        <el-result
          v-if="importResult.success > 0"
          icon="success"
          :title="`成功导入 ${importResult.success} 条数据`"
        >
          <template #sub-title>
            <div v-if="importResult.failed > 0">
              失败 {{ importResult.failed }} 条
              <el-button type="text" @click="showErrors = true">查看失败详情</el-button>
            </div>
          </template>
          <template #extra>
            <el-button type="primary" @click="handleBack">返回列表</el-button>
            <el-button @click="handleReset">重新导入</el-button>
          </template>
        </el-result>
        <el-result
          v-else
          icon="error"
          title="导入失败"
          sub-title="所有数据都未能成功导入"
        >
          <template #extra>
            <el-button type="primary" @click="handleReset">重新导入</el-button>
            <el-button @click="handleBack">返回列表</el-button>
          </template>
        </el-result>

        <!-- 错误详情对话框 -->
        <el-dialog v-model="showErrors" title="导入失败详情" width="60%">
          <el-table :data="importResult.errors" border>
            <el-table-column prop="row" label="行号" width="80" />
            <el-table-column prop="message" label="错误信息" />
          </el-table>
          <template #footer>
            <el-button @click="showErrors = false">关闭</el-button>
            <el-button type="primary" @click="handleDownloadErrors">下载错误报告</el-button>
          </template>
        </el-dialog>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Download, UploadFilled } from '@element-plus/icons-vue'
import { downloadTeacherTemplate, importTeachers } from '@/api/personnel'

const router = useRouter()

// 当前步骤
const activeStep = ref(0)

// 上传的文件
const uploadFile = ref<File | null>(null)

// 导入状态
const importing = ref(false)

// 导入结果
const importResult = ref({
  success: 0,
  failed: 0,
  errors: [] as Array<{ row: number, message: string }>
})

// 显示错误详情
const showErrors = ref(false)

// 下载模板
const handleDownloadTemplate = async () => {
  try {
    await downloadTeacherTemplate()
    ElMessage.success('模板下载成功')
  } catch (error) {
    ElMessage.error('模板下载失败')
  }
}

// 文件变化
const handleFileChange = (file: any) => {
  uploadFile.value = file.raw
}

// 上传前校验
const beforeUpload = (file: File) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                  file.type === 'application/vnd.ms-excel'
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isExcel) {
    ElMessage.error('只能上传 Excel 文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('文件大小不能超过 5MB!')
    return false
  }
  return true
}

// 开始导入
const handleImport = async () => {
  if (!uploadFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }

  importing.value = true
  try {
    const res = await importTeachers(uploadFile.value)
    importResult.value = res.data
    activeStep.value = 3

    if (res.data.success > 0) {
      ElMessage.success(`成功导入 ${res.data.success} 条数据`)
    }
    if (res.data.failed > 0) {
      ElMessage.warning(`${res.data.failed} 条数据导入失败`)
    }
  } catch (error) {
    ElMessage.error('导入失败')
  } finally {
    importing.value = false
  }
}

// 下载错误报告
const handleDownloadErrors = () => {
  // 实际应该调用后端接口下载错误报告
  ElMessage.info('下载错误报告功能待实现')
}

// 重置
const handleReset = () => {
  activeStep.value = 0
  uploadFile.value = null
  importResult.value = {
    success: 0,
    failed: 0,
    errors: []
  }
  showErrors.value = false
}

// 返回
const handleBack = () => {
  router.push('/personnel/teacher')
}
</script>

<style lang="scss" scoped>
.teacher-import-container {
  padding: 20px;
}

.step-content {
  margin-top: 40px;
  min-height: 300px;
}

.template-download {
  display: flex;
  justify-content: center;
  margin: 40px 0;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 40px;
}

.upload-demo {
  display: flex;
  justify-content: center;
  margin: 40px 0;

  :deep(.el-upload-dragger) {
    width: 400px;
  }
}
</style>