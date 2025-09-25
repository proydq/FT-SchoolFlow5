<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="title">数据导入</h2>
      <p class="description">支持Excel、CSV格式文件导入，自动字段映射和数据验证</p>
    </div>

    <!-- 导入向导 -->
    <el-card shadow="never" class="import-wizard">
      <el-steps :active="currentStep" align-center finish-status="success">
        <el-step title="选择文件" description="上传Excel或CSV文件">
          <template #icon>
            <el-icon :size="28" :color="currentStep >= 0 ? '#409EFF' : '#C0C4CC'">
              <UploadFilled />
            </el-icon>
          </template>
        </el-step>
        <el-step title="字段映射" description="配置字段对应关系">
          <template #icon>
            <el-icon :size="28" :color="currentStep >= 1 ? '#409EFF' : '#C0C4CC'">
              <Connection />
            </el-icon>
          </template>
        </el-step>
        <el-step title="数据预览" description="预览并验证数据">
          <template #icon>
            <el-icon :size="28" :color="currentStep >= 2 ? '#409EFF' : '#C0C4CC'">
              <View />
            </el-icon>
          </template>
        </el-step>
        <el-step title="导入完成" description="查看导入结果">
          <template #icon>
            <el-icon :size="28" :color="currentStep >= 3 ? '#67C23A' : '#C0C4CC'">
              <CircleCheckFilled />
            </el-icon>
          </template>
        </el-step>
      </el-steps>
    </el-card>

    <!-- 步骤1：文件上传 -->
    <el-card v-show="currentStep === 0" shadow="never" class="step-card">
      <template #header>
        <div class="card-header">
          <span>步骤1：选择文件</span>
          <div class="header-actions">
            <el-button type="text" @click="downloadTemplate">
              <el-icon><Download /></el-icon>
              下载模板
            </el-button>
          </div>
        </div>
      </template>

      <div class="upload-section">
        <el-upload
          ref="uploadRef"
          class="upload-dragger"
          drag
          action="#"
          :before-upload="handleFileUpload"
          :show-file-list="false"
          accept=".xlsx,.xls,.csv"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">
            将Excel或CSV文件拖拽到此处，或<em>点击上传</em>
          </div>
          <div class="el-upload__tip">
            支持.xlsx、.xls、.csv格式，文件大小不超过10MB
          </div>
        </el-upload>

        <!-- 文件信息 -->
        <div v-if="uploadedFile" class="file-info">
          <div class="file-card">
            <div class="file-icon">
              <el-icon size="32">
                <component :is="getFileIcon(uploadedFile)" />
              </el-icon>
            </div>
            <div class="file-details">
              <div class="file-name">{{ uploadedFile.name }}</div>
              <div class="file-meta">
                <span>{{ formatFileSize(uploadedFile.size) }}</span>
                <span>{{ uploadedFile.type }}</span>
                <span>{{ fileData.length }} 行数据</span>
              </div>
            </div>
            <div class="file-actions">
              <el-button type="text" @click="removeFile">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
          </div>
        </div>

        <div class="step-actions">
          <el-button 
            type="primary" 
            @click="nextStep"
            :disabled="!uploadedFile"
          >
            下一步
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 步骤2：字段映射 -->
    <el-card v-show="currentStep === 1" shadow="never" class="step-card">
      <template #header>
        <div class="card-header">
          <span>步骤2：字段映射</span>
          <div class="header-actions">
            <el-button type="text" @click="autoMap">
              <el-icon><MagicStick /></el-icon>
              智能映射
            </el-button>
          </div>
        </div>
      </template>

      <div class="mapping-section">
        <div class="mapping-info">
          <el-alert
            title="请将Excel/CSV文件中的列与系统字段进行映射"
            type="info"
            :closable="false"
            show-icon
          />
        </div>

        <div class="mapping-table">
          <div class="table-header">
            <div class="column">文件列</div>
            <div class="column">系统字段</div>
            <div class="column">是否必填</div>
            <div class="column">数据示例</div>
          </div>

          <div class="table-body">
            <div 
              v-for="(column, index) in fileColumns" 
              :key="index"
              class="table-row"
            >
              <div class="column">
                <div class="file-column">
                  <el-icon><Grid /></el-icon>
                  {{ column }}
                </div>
              </div>
              <div class="column">
                <el-select
                  v-model="fieldMapping[column]"
                  placeholder="选择对应的系统字段"
                  clearable
                  filterable
                >
                  <el-option
                    v-for="field in systemFields"
                    :key="field.key"
                    :label="field.label"
                    :value="field.key"
                    :disabled="isMapped(field.key) && fieldMapping[column] !== field.key"
                  >
                    <div class="field-option">
                      <span>{{ field.label }}</span>
                      <el-tag v-if="field.required" size="small" type="danger">必填</el-tag>
                    </div>
                  </el-option>
                </el-select>
              </div>
              <div class="column">
                <el-tag 
                  v-if="getMappedField(column)?.required" 
                  size="small" 
                  type="danger"
                >
                  必填
                </el-tag>
                <span v-else class="text-secondary">可选</span>
              </div>
              <div class="column">
                <div class="data-sample">
                  {{ getColumnSample(column) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 映射统计 -->
        <div class="mapping-stats">
          <div class="stat-item">
            <span class="label">总列数：</span>
            <span class="value">{{ fileColumns.length }}</span>
          </div>
          <div class="stat-item">
            <span class="label">已映射：</span>
            <span class="value">{{ mappedCount }}</span>
          </div>
          <div class="stat-item">
            <span class="label">必填字段：</span>
            <span class="value">{{ requiredMappedCount }}/{{ requiredFields.length }}</span>
          </div>
        </div>

        <div class="step-actions">
          <el-button @click="prevStep">上一步</el-button>
          <el-button 
            type="primary" 
            @click="nextStep"
            :disabled="!isValidMapping"
          >
            下一步
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 步骤3：数据预览 -->
    <el-card v-show="currentStep === 2" shadow="never" class="step-card">
      <template #header>
        <div class="card-header">
          <span>步骤3：数据预览</span>
          <div class="header-actions">
            <el-switch
              v-model="showValidationErrors"
              active-text="显示错误"
            />
          </div>
        </div>
      </template>

      <div class="preview-section">
        <div class="preview-stats">
          <el-row :gutter="16">
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-number">{{ previewData.length }}</div>
                <div class="stat-label">总记录数</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card success">
                <div class="stat-number">{{ validRecords }}</div>
                <div class="stat-label">有效记录</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card error">
                <div class="stat-number">{{ errorRecords }}</div>
                <div class="stat-label">错误记录</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card warning">
                <div class="stat-number">{{ duplicateRecords }}</div>
                <div class="stat-label">重复记录</div>
              </div>
            </el-col>
          </el-row>
        </div>

        <div class="preview-table">
          <el-table 
            :data="displayData"
            :row-class-name="getRowClassName"
            height="400"
          >
            <el-table-column type="index" label="行号" width="60" />
            <el-table-column
              v-for="field in mappedSystemFields"
              :key="field.key"
              :prop="field.key"
              :label="field.label"
              :width="field.width || 120"
              show-overflow-tooltip
            >
              <template #default="{ row, $index }">
                <div class="cell-content">
                  <span :class="{ 'error-text': hasFieldError(row, field.key) }">
                    {{ row[field.key] || '-' }}
                  </span>
                  <el-tooltip
                    v-if="hasFieldError(row, field.key)"
                    :content="getFieldError(row, field.key)"
                    placement="top"
                  >
                    <el-icon class="error-icon"><Warning /></el-icon>
                  </el-tooltip>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100" fixed="right">
              <template #default="{ row }">
                <el-tag 
                  :type="getRowStatus(row).type"
                  size="small"
                >
                  {{ getRowStatus(row).text }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 错误详情 -->
        <div v-if="showValidationErrors && errorDetails.length" class="error-details">
          <h4>数据验证错误</h4>
          <el-collapse v-model="activeErrorCollapse">
            <el-collapse-item
              v-for="(error, index) in errorDetails.slice(0, 10)"
              :key="index"
              :title="`行 ${error.rowIndex + 1}: ${error.errors.length} 个错误`"
              :name="index"
            >
              <div class="error-list">
                <div 
                  v-for="(err, errIndex) in error.errors"
                  :key="errIndex"
                  class="error-item"
                >
                  <el-icon class="error-icon"><Warning /></el-icon>
                  <span class="error-field">{{ err.field }}:</span>
                  <span class="error-message">{{ err.message }}</span>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>

        <div class="step-actions">
          <el-button @click="prevStep">上一步</el-button>
          <el-button 
            type="primary" 
            @click="startImport"
            :disabled="validRecords === 0"
            :loading="importing"
          >
            开始导入 ({{ validRecords }} 条有效记录)
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 步骤4：导入结果 -->
    <el-card v-show="currentStep === 3" shadow="never" class="step-card">
      <template #header>
        <span>步骤4：导入完成</span>
      </template>

      <div class="result-section">
        <div class="result-icon">
          <el-icon 
            size="64" 
            :color="importResult.success ? '#67C23A' : '#F56C6C'"
          >
            <component :is="importResult.success ? 'CircleCheck' : 'CircleClose'" />
          </el-icon>
        </div>

        <div class="result-content">
          <h3>{{ importResult.success ? '导入成功' : '导入失败' }}</h3>
          <p class="result-summary">
            {{ importResult.message }}
          </p>

          <div class="result-stats">
            <el-row :gutter="16">
              <el-col :span="8">
                <div class="stat-item">
                  <span class="label">成功导入：</span>
                  <span class="value success">{{ importResult.successCount || 0 }}</span>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item">
                  <span class="label">失败记录：</span>
                  <span class="value error">{{ importResult.errorCount || 0 }}</span>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item">
                  <span class="label">重复跳过：</span>
                  <span class="value warning">{{ importResult.duplicateCount || 0 }}</span>
                </div>
              </el-col>
            </el-row>
          </div>

          <div class="result-actions">
            <el-button @click="reset">重新导入</el-button>
            <el-button type="primary" @click="viewCustomers">查看客户列表</el-button>
            <el-button 
              v-if="importResult.errorCount > 0"
              @click="downloadErrorReport"
            >
              下载错误报告
            </el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import * as XLSX from 'xlsx'
import { 
  UploadFilled, Connection, View, CircleCheckFilled,
  Download, Close, MagicStick, Grid, Document,
  CircleCheck, InfoFilled, WarningFilled, CircleCloseFilled
} from '@element-plus/icons-vue'

const router = useRouter()

// 当前步骤
const currentStep = ref(0)

// 上传的文件
const uploadedFile = ref(null)
const fileData = ref([])
const fileColumns = ref([])

// 字段映射
const fieldMapping = reactive({})

// 系统字段定义
const systemFields = [
  { key: 'name', label: '客户姓名', required: true, width: 120 },
  { key: 'company', label: '公司名称', required: true, width: 150 },
  { key: 'email', label: '邮箱地址', required: true, width: 180 },
  { key: 'phone', label: '联系电话', required: false, width: 130 },
  { key: 'country', label: '国家', required: false, width: 100 },
  { key: 'city', label: '城市', required: false, width: 100 },
  { key: 'industry', label: '行业', required: false, width: 120 },
  { key: 'position', label: '职位', required: false, width: 120 },
  { key: 'website', label: '网站', required: false, width: 150 },
  { key: 'source', label: '来源', required: false, width: 100 },
  { key: 'notes', label: '备注', required: false, width: 200 }
]

// 数据预览
const previewData = ref([])
const validationErrors = ref({})
const showValidationErrors = ref(false)
const activeErrorCollapse = ref([])

// 导入状态
const importing = ref(false)
const importResult = reactive({
  success: false,
  message: '',
  successCount: 0,
  errorCount: 0,
  duplicateCount: 0
})

// 计算属性
const mappedCount = computed(() => {
  return Object.values(fieldMapping).filter(Boolean).length
})

const requiredFields = computed(() => {
  return systemFields.filter(field => field.required)
})

const requiredMappedCount = computed(() => {
  const mappedFields = Object.values(fieldMapping).filter(Boolean)
  return requiredFields.value.filter(field => 
    mappedFields.includes(field.key)
  ).length
})

const isValidMapping = computed(() => {
  return requiredMappedCount.value === requiredFields.value.length
})

const mappedSystemFields = computed(() => {
  const mappedFields = Object.values(fieldMapping).filter(Boolean)
  return systemFields.filter(field => mappedFields.includes(field.key))
})

const validRecords = computed(() => {
  return previewData.value.filter(row => !hasRowErrors(row)).length
})

const errorRecords = computed(() => {
  return previewData.value.filter(row => hasRowErrors(row)).length
})

const duplicateRecords = computed(() => {
  // 简化的重复检测，基于邮箱
  const emails = previewData.value.map(row => row.email).filter(Boolean)
  const uniqueEmails = [...new Set(emails)]
  return emails.length - uniqueEmails.length
})

const displayData = computed(() => {
  if (showValidationErrors.value) {
    return previewData.value.filter(row => hasRowErrors(row))
  }
  return previewData.value
})

const errorDetails = computed(() => {
  return previewData.value
    .map((row, index) => ({
      rowIndex: index,
      errors: getRowErrors(row)
    }))
    .filter(item => item.errors.length > 0)
})

// 方法
const handleFileUpload = (file) => {
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过10MB')
    return false
  }

  uploadedFile.value = file
  parseFile(file)
  return false
}

const parseFile = (file) => {
  const reader = new FileReader()
  
  reader.onload = (e) => {
    try {
      const data = e.target.result
      let workbook
      
      if (file.name.endsWith('.csv')) {
        workbook = XLSX.read(data, { type: 'string' })
      } else {
        workbook = XLSX.read(data, { type: 'binary' })
      }
      
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 })
      
      if (jsonData.length < 2) {
        ElMessage.error('文件中没有有效数据')
        return
      }
      
      fileColumns.value = jsonData[0] || []
      fileData.value = jsonData.slice(1)
      
      ElMessage.success(`文件解析成功，共 ${fileData.value.length} 行数据`)
    } catch (error) {
      ElMessage.error('文件解析失败，请检查文件格式')
      console.error(error)
    }
  }
  
  if (file.name.endsWith('.csv')) {
    reader.readAsText(file, 'UTF-8')
  } else {
    reader.readAsBinaryString(file)
  }
}

const removeFile = () => {
  uploadedFile.value = null
  fileData.value = []
  fileColumns.value = []
  Object.keys(fieldMapping).forEach(key => {
    delete fieldMapping[key]
  })
}

const nextStep = () => {
  if (currentStep.value === 1) {
    generatePreviewData()
  } else if (currentStep.value === 2) {
    // 开始导入在单独的方法中处理
    return
  }
  
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const autoMap = () => {
  const mapping = {}
  
  fileColumns.value.forEach(column => {
    const normalizedColumn = column.toLowerCase().trim()
    
    // 智能映射规则
    const mappingRules = {
      '姓名': 'name',
      'name': 'name',
      '客户姓名': 'name',
      '公司': 'company',
      'company': 'company',
      '公司名称': 'company',
      '邮箱': 'email',
      'email': 'email',
      '邮件': 'email',
      '电话': 'phone',
      'phone': 'phone',
      '联系电话': 'phone',
      '国家': 'country',
      'country': 'country',
      '城市': 'city',
      'city': 'city',
      '行业': 'industry',
      'industry': 'industry',
      '职位': 'position',
      'position': 'position',
      '网站': 'website',
      'website': 'website',
      '来源': 'source',
      'source': 'source',
      '备注': 'notes',
      'notes': 'notes',
      'remark': 'notes'
    }
    
    for (const [key, value] of Object.entries(mappingRules)) {
      if (normalizedColumn.includes(key.toLowerCase())) {
        if (!Object.values(mapping).includes(value)) {
          mapping[column] = value
          break
        }
      }
    }
  })
  
  Object.assign(fieldMapping, mapping)
  ElMessage.success(`智能映射完成，已映射 ${Object.keys(mapping).length} 个字段`)
}

const isMapped = (fieldKey) => {
  return Object.values(fieldMapping).includes(fieldKey)
}

const getMappedField = (column) => {
  const fieldKey = fieldMapping[column]
  return systemFields.find(field => field.key === fieldKey)
}

const getColumnSample = (column) => {
  const columnIndex = fileColumns.value.indexOf(column)
  const samples = fileData.value
    .slice(0, 3)
    .map(row => row[columnIndex])
    .filter(Boolean)
  
  return samples.length > 0 ? samples[0] : '无数据'
}

const generatePreviewData = () => {
  const mappedData = []
  
  fileData.value.forEach((row, rowIndex) => {
    const mappedRow = { _rowIndex: rowIndex }
    
    Object.entries(fieldMapping).forEach(([column, fieldKey]) => {
      if (fieldKey) {
        const columnIndex = fileColumns.value.indexOf(column)
        mappedRow[fieldKey] = row[columnIndex] || ''
      }
    })
    
    mappedData.push(mappedRow)
  })
  
  previewData.value = mappedData
  validateData()
}

const validateData = () => {
  const errors = {}
  
  previewData.value.forEach((row, index) => {
    const rowErrors = []
    
    // 验证必填字段
    requiredFields.value.forEach(field => {
      const value = row[field.key]
      if (!value || value.toString().trim() === '') {
        rowErrors.push({
          field: field.label,
          message: '不能为空'
        })
      }
    })
    
    // 邮箱格式验证
    if (row.email && !isValidEmail(row.email)) {
      rowErrors.push({
        field: '邮箱地址',
        message: '邮箱格式不正确'
      })
    }
    
    // 电话号码验证
    if (row.phone && !isValidPhone(row.phone)) {
      rowErrors.push({
        field: '联系电话',
        message: '电话号码格式不正确'
      })
    }
    
    if (rowErrors.length > 0) {
      errors[index] = rowErrors
    }
  })
  
  validationErrors.value = errors
}

const hasRowErrors = (row) => {
  const index = row._rowIndex
  return validationErrors.value[index] && validationErrors.value[index].length > 0
}

const hasFieldError = (row, field) => {
  const errors = getRowErrors(row)
  return errors.some(error => error.field === getFieldLabel(field))
}

const getFieldError = (row, field) => {
  const errors = getRowErrors(row)
  const error = errors.find(error => error.field === getFieldLabel(field))
  return error ? error.message : ''
}

const getRowErrors = (row) => {
  const index = row._rowIndex
  return validationErrors.value[index] || []
}

const getFieldLabel = (fieldKey) => {
  const field = systemFields.find(f => f.key === fieldKey)
  return field ? field.label : fieldKey
}

const getRowClassName = ({ rowIndex }) => {
  const row = previewData.value[rowIndex]
  if (hasRowErrors(row)) {
    return 'error-row'
  }
  return ''
}

const getRowStatus = (row) => {
  if (hasRowErrors(row)) {
    return { type: 'danger', text: '错误' }
  }
  return { type: 'success', text: '正常' }
}

const startImport = async () => {
  importing.value = true
  
  try {
    // 模拟导入过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const validData = previewData.value.filter(row => !hasRowErrors(row))
    
    importResult.success = true
    importResult.message = `成功导入 ${validData.length} 条客户记录`
    importResult.successCount = validData.length
    importResult.errorCount = errorRecords.value
    importResult.duplicateCount = duplicateRecords.value
    
    currentStep.value = 3
    
  } catch (error) {
    importResult.success = false
    importResult.message = '导入过程中发生错误，请稍后重试'
    
  } finally {
    importing.value = false
  }
}

const reset = () => {
  currentStep.value = 0
  uploadedFile.value = null
  fileData.value = []
  fileColumns.value = []
  previewData.value = []
  validationErrors.value = {}
  Object.keys(fieldMapping).forEach(key => {
    delete fieldMapping[key]
  })
  
  Object.keys(importResult).forEach(key => {
    importResult[key] = key === 'success' ? false : ''
  })
}

const viewCustomers = () => {
  router.push('/customer-center/list')
}

const downloadTemplate = () => {
  const templateData = [
    ['客户姓名', '公司名称', '邮箱地址', '联系电话', '国家', '城市', '行业', '职位', '网站', '来源', '备注'],
    ['张三', 'ABC公司', 'zhangsan@abc.com', '13800138000', '中国', '北京', 'IT', '经理', 'www.abc.com', '网站', '重要客户']
  ]
  
  const ws = XLSX.utils.aoa_to_sheet(templateData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '客户导入模板')
  
  XLSX.writeFile(wb, '客户导入模板.xlsx')
  ElMessage.success('模板下载完成')
}

const downloadErrorReport = () => {
  ElMessage.success('错误报告下载完成')
}

// 工具函数
const getFileIcon = (file) => {
  const name = file.name.toLowerCase()
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    return 'Document'
  } else if (name.endsWith('.csv')) {
    return 'Document'
  }
  return 'Document'
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const isValidPhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/
  return phone.length >= 7 && phoneRegex.test(phone)
}

onMounted(() => {
  // 初始化
})
</script>

<style scoped lang="scss">
.import-wizard {
  margin-bottom: $spacing-lg;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  
  :deep(.el-card__body) {
    padding: 0;
  }
  
  :deep(.el-steps) {
    padding: $spacing-xl $spacing-lg;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    
    .el-step__head {
      .el-step__icon {
        width: 60px;
        height: 60px;
        border: none;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        transition: all 0.3s ease;
        
        &:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
        
        .el-icon {
          color: white !important;
        }
      }
      
      &.is-finish .el-step__icon {
        background: linear-gradient(135deg, #67C23A 0%, #52c41a 100%);
        box-shadow: 0 4px 15px rgba(103, 194, 58, 0.3);
      }
      
      &.is-process .el-step__icon {
        background: linear-gradient(135deg, #409EFF 0%, #1890ff 100%);
        box-shadow: 0 4px 15px rgba(64, 158, 255, 0.4);
        animation: pulse 2s infinite;
      }
      
      &.is-wait .el-step__icon {
        background: #F2F6FC;
        box-shadow: none;
        
        .el-icon {
          color: #C0C4CC !important;
        }
      }
    }
    
    .el-step__title {
      font-size: 16px;
      font-weight: 500;
      margin-top: 12px;
    }
    
    .el-step__description {
      font-size: 13px;
      color: #909399;
      margin-top: 4px;
    }
    
    .el-step__line {
      top: 30px;
      background-color: #E4E7ED;
      height: 2px;
      
      .el-step__line-inner {
        height: 2px;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        transition: all 0.3s ease;
      }
    }
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 4px 15px rgba(64, 158, 255, 0.4);
  }
  50% {
    box-shadow: 0 4px 25px rgba(64, 158, 255, 0.6);
  }
  100% {
    box-shadow: 0 4px 15px rgba(64, 158, 255, 0.4);
  }
}

.step-card {
  min-height: 500px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 500;
  }
}

.upload-section {
  .upload-dragger {
    width: 100%;
    margin-bottom: $spacing-lg;
    
    :deep(.el-upload-dragger) {
      padding: $spacing-xl * 2;
    }
  }
  
  .file-info {
    margin-bottom: $spacing-lg;
    
    .file-card {
      display: flex;
      align-items: center;
      padding: $spacing-md;
      border: 1px solid $border-light;
      border-radius: 6px;
      background: $bg-white;
      
      .file-icon {
        margin-right: $spacing-md;
        color: $primary-color;
      }
      
      .file-details {
        flex: 1;
        
        .file-name {
          font-weight: 500;
          margin-bottom: $spacing-xs;
        }
        
        .file-meta {
          font-size: $font-size-sm;
          color: $text-secondary;
          
          span {
            margin-right: $spacing-md;
          }
        }
      }
    }
  }
  
  .step-actions {
    text-align: center;
  }
}

.mapping-section {
  .mapping-info {
    margin-bottom: $spacing-lg;
  }
  
  .mapping-table {
    border: 1px solid $border-light;
    border-radius: 4px;
    margin-bottom: $spacing-lg;
    
    .table-header,
    .table-row {
      display: grid;
      grid-template-columns: 200px 300px 100px 1fr;
      border-bottom: 1px solid $border-light;
      
      &:last-child {
        border-bottom: none;
      }
      
      .column {
        padding: $spacing-md;
        border-right: 1px solid $border-light;
        
        &:last-child {
          border-right: none;
        }
      }
    }
    
    .table-header {
      background: $bg-color;
      font-weight: 500;
      
      .column {
        color: $text-primary;
      }
    }
    
    .table-row {
      .file-column {
        display: flex;
        align-items: center;
        
        .el-icon {
          margin-right: $spacing-xs;
          color: $text-secondary;
        }
      }
      
      .field-option {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .data-sample {
        color: $text-secondary;
        font-size: $font-size-sm;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
  
  .mapping-stats {
    display: flex;
    gap: $spacing-lg;
    margin-bottom: $spacing-lg;
    
    .stat-item {
      .label {
        color: $text-secondary;
      }
      
      .value {
        font-weight: 500;
        color: $primary-color;
      }
    }
  }
  
  .step-actions {
    text-align: center;
  }
}

.preview-section {
  .preview-stats {
    margin-bottom: $spacing-lg;
    
    .stat-card {
      text-align: center;
      padding: $spacing-md;
      border: 1px solid $border-light;
      border-radius: 4px;
      
      &.success {
        border-color: $success-color;
        background: rgba(103, 194, 58, 0.1);
      }
      
      &.error {
        border-color: $danger-color;
        background: rgba(245, 108, 108, 0.1);
      }
      
      &.warning {
        border-color: $warning-color;
        background: rgba(230, 162, 60, 0.1);
      }
      
      .stat-number {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: $spacing-xs;
      }
      
      .stat-label {
        font-size: $font-size-sm;
        color: $text-secondary;
      }
    }
  }
  
  .preview-table {
    margin-bottom: $spacing-lg;
    
    .cell-content {
      display: flex;
      align-items: center;
      
      .error-text {
        color: $danger-color;
      }
      
      .error-icon {
        margin-left: $spacing-xs;
        color: $danger-color;
      }
    }
    
    :deep(.error-row) {
      background-color: rgba(245, 108, 108, 0.05);
    }
  }
  
  .error-details {
    margin-bottom: $spacing-lg;
    
    h4 {
      margin-bottom: $spacing-md;
      color: $text-primary;
    }
    
    .error-list {
      .error-item {
        display: flex;
        align-items: center;
        margin-bottom: $spacing-xs;
        
        .error-icon {
          margin-right: $spacing-xs;
          color: $danger-color;
        }
        
        .error-field {
          font-weight: 500;
          margin-right: $spacing-xs;
          color: $text-primary;
        }
        
        .error-message {
          color: $danger-color;
        }
      }
    }
  }
  
  .step-actions {
    text-align: center;
  }
}

.result-section {
  text-align: center;
  padding: $spacing-xl 0;
  
  .result-icon {
    margin-bottom: $spacing-lg;
  }
  
  .result-content {
    h3 {
      margin-bottom: $spacing-md;
      color: $text-primary;
    }
    
    .result-summary {
      margin-bottom: $spacing-lg;
      color: $text-regular;
      font-size: 16px;
    }
    
    .result-stats {
      margin-bottom: $spacing-xl;
      
      .stat-item {
        text-align: center;
        
        .label {
          color: $text-secondary;
          margin-right: $spacing-xs;
        }
        
        .value {
          font-weight: 600;
          font-size: 18px;
          
          &.success {
            color: $success-color;
          }
          
          &.error {
            color: $danger-color;
          }
          
          &.warning {
            color: $warning-color;
          }
        }
      }
    }
    
    .result-actions {
      display: flex;
      justify-content: center;
      gap: $spacing-md;
    }
  }
}

.text-secondary {
  color: $text-secondary;
}
</style>