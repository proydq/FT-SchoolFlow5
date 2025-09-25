<template>
  <div class="guardian-edit-container">
    <el-page-header @back="handleBack">
      <template #title>
        <span>{{ isEdit ? '编辑监护人' : '新增监护人' }}</span>
      </template>
    </el-page-header>

    <el-card style="margin-top: 20px">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        style="max-width: 800px"
      >
        <el-divider content-position="left">基本信息</el-divider>

        <el-form-item label="姓名" prop="guardianName">
          <el-input
            v-model="formData.guardianName"
            placeholder="请输入监护人姓名"
            maxlength="20"
            show-word-limit
            style="width: 300px"
          />
        </el-form-item>

        <el-form-item label="关系" prop="relation">
          <el-select
            v-model="formData.relation"
            placeholder="请选择与学生的关系"
            style="width: 300px"
            @change="handleRelationChange"
          >
            <el-option label="父亲" value="father" />
            <el-option label="母亲" value="mother" />
            <el-option label="祖父" value="grandfather" />
            <el-option label="祖母" value="grandmother" />
            <el-option label="叔叔" value="uncle" />
            <el-option label="阿姨" value="aunt" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item
          label="关系说明"
          prop="relationOther"
          v-if="formData.relation === 'other'"
        >
          <el-input
            v-model="formData.relationOther"
            placeholder="请输入具体关系说明"
            maxlength="20"
            style="width: 300px"
          />
        </el-form-item>

        <el-form-item label="身份证号" prop="idCardNumber">
          <el-input
            v-model="formData.idCardNumber"
            placeholder="请输入身份证号"
            :disabled="isEdit"
            maxlength="18"
            style="width: 300px"
            @blur="checkIdCard"
          />
          <div class="form-tip" v-if="!isEdit">身份证号一旦保存将无法修改</div>
        </el-form-item>

        <el-divider content-position="left">联系方式</el-divider>

        <el-form-item label="手机号码" prop="phone">
          <el-input
            v-model="formData.phone"
            placeholder="请输入手机号码"
            maxlength="11"
            style="width: 300px"
          />
        </el-form-item>

        <el-form-item label="备用电话" prop="alternatePhone">
          <el-input
            v-model="formData.alternatePhone"
            placeholder="请输入备用电话"
            maxlength="20"
            style="width: 300px"
          />
        </el-form-item>

        <el-form-item label="电子邮箱" prop="email">
          <el-input
            v-model="formData.email"
            placeholder="请输入电子邮箱"
            maxlength="50"
            style="width: 300px"
          />
        </el-form-item>

        <el-form-item label="家庭住址" prop="homeAddress">
          <el-input
            v-model="formData.homeAddress"
            placeholder="请输入家庭住址"
            type="textarea"
            :rows="2"
            maxlength="200"
            show-word-limit
            style="width: 500px"
          />
        </el-form-item>

        <el-divider content-position="left">工作信息</el-divider>

        <el-form-item label="职业" prop="occupation">
          <el-input
            v-model="formData.occupation"
            placeholder="请输入职业"
            maxlength="30"
            style="width: 300px"
          />
        </el-form-item>

        <el-form-item label="工作单位" prop="workplace">
          <el-input
            v-model="formData.workplace"
            placeholder="请输入工作单位"
            maxlength="50"
            style="width: 300px"
          />
        </el-form-item>

        <el-form-item label="单位地址" prop="workAddress">
          <el-input
            v-model="formData.workAddress"
            placeholder="请输入单位地址"
            type="textarea"
            :rows="2"
            maxlength="200"
            show-word-limit
            style="width: 500px"
          />
        </el-form-item>

        <el-divider content-position="left">其他信息</el-divider>

        <el-form-item label="紧急联系人">
          <el-switch v-model="formData.isEmergencyContact" />
          <span style="margin-left: 10px; color: #909399">
            设为紧急联系人后，学校将在紧急情况下优先联系
          </span>
        </el-form-item>

        <el-form-item label="法定监护人">
          <el-switch v-model="formData.isLegalGuardian" />
          <span style="margin-left: 10px; color: #909399">
            是否为学生的法定监护人
          </span>
        </el-form-item>

        <el-form-item label="关联学生" v-if="!isEdit">
          <el-select
            v-model="formData.studentIds"
            multiple
            filterable
            remote
            reserve-keyword
            placeholder="请输入学生姓名或学号搜索（可选）"
            :remote-method="searchStudents"
            :loading="searchLoading"
            style="width: 500px"
          >
            <el-option
              v-for="student in studentOptions"
              :key="student.studentId"
              :label="`${student.studentName} (${student.studentId}) - ${student.gradeName}${student.className}`"
              :value="student.studentId"
            />
          </el-select>
          <div class="form-tip">可以先保存监护人信息，后续再关联学生</div>
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData.remark"
            placeholder="请输入备注信息"
            type="textarea"
            :rows="3"
            maxlength="500"
            show-word-limit
            style="width: 500px"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit">
            {{ isEdit ? '保存' : '新增' }}
          </el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 关联学生信息（编辑模式） -->
    <el-card style="margin-top: 20px" v-if="isEdit && relatedStudents.length > 0">
      <template #header>
        <div class="card-header">
          <span>关联学生信息</span>
          <el-button type="primary" size="small" @click="handleAddStudent">添加学生</el-button>
        </div>
      </template>
      <el-table :data="relatedStudents" border stripe>
        <el-table-column prop="studentId" label="学号" min-width="120" align="center" />
        <el-table-column prop="studentName" label="姓名" min-width="100" align="center" />
        <el-table-column prop="gradeName" label="年级" min-width="100" align="center" />
        <el-table-column prop="className" label="班级" min-width="120" align="center" />
        <el-table-column prop="status" label="状态" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="150" align="center">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="handleViewStudent(row)"
            >
              查看
            </el-button>
            <el-button
              link
              type="danger"
              size="small"
              @click="handleUnbindStudent(row)"
            >
              解除关联
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加学生对话框 -->
    <el-dialog v-model="addStudentDialogVisible" title="添加关联学生" width="600px">
      <el-form :model="addStudentForm" label-width="100px">
        <el-form-item label="选择学生" required>
          <el-select
            v-model="addStudentForm.studentIds"
            multiple
            filterable
            remote
            reserve-keyword
            placeholder="请输入学生姓名或学号搜索"
            :remote-method="searchStudentsForAdd"
            :loading="searchLoading"
            style="width: 100%"
          >
            <el-option
              v-for="student in studentOptionsForAdd"
              :key="student.studentId"
              :label="`${student.studentName} (${student.studentId}) - ${student.gradeName}${student.className}`"
              :value="student.studentId"
              :disabled="isStudentRelated(student.studentId)"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addStudentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddStudentConfirm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getGuardianDetail,
  addGuardian,
  updateGuardian,
  checkIdCardNumber,
  getGuardianStudents,
  batchBindStudentGuardian,
  unbindStudentGuardian
} from '@/api/personnel'
import { getStudentList } from '@/api/personnel'
import type { GuardianFormData, StudentInfo } from '@/types/personnel'

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const searchLoading = ref(false)
const studentOptions = ref<StudentInfo[]>([])
const studentOptionsForAdd = ref<StudentInfo[]>([])
const relatedStudents = ref<StudentInfo[]>([])
const addStudentDialogVisible = ref(false)

// 是否编辑模式
const isEdit = computed(() => !!route.params.id)
const guardianId = computed(() => route.params.id as string)

// 表单数据
const formData = reactive<GuardianFormData>({
  guardianName: '',
  relation: 'father' as any,
  relationOther: '',
  idCardNumber: '',
  phone: '',
  alternatePhone: '',
  email: '',
  occupation: '',
  workplace: '',
  workAddress: '',
  homeAddress: '',
  isEmergencyContact: false,
  isLegalGuardian: true,
  studentIds: [],
  remark: ''
})

// 添加学生表单
const addStudentForm = reactive({
  studentIds: [] as string[]
})

// 表单验证规则
const rules = reactive<FormRules>({
  guardianName: [
    { required: true, message: '请输入监护人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  relation: [
    { required: true, message: '请选择与学生的关系', trigger: 'change' }
  ],
  relationOther: [
    {
      required: formData.relation === 'other',
      message: '请输入具体关系说明',
      trigger: 'blur'
    }
  ],
  idCardNumber: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    {
      pattern: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dX]$/,
      message: '身份证号格式错误',
      trigger: 'blur'
    }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '手机号格式错误',
      trigger: 'blur'
    }
  ],
  alternatePhone: [
    {
      pattern: /^(\d{3,4}-?)?\d{7,8}$|^1[3-9]\d{9}$/,
      message: '电话号码格式错误',
      trigger: 'blur'
    }
  ],
  email: [
    {
      type: 'email',
      message: '邮箱格式错误',
      trigger: 'blur'
    }
  ],
  homeAddress: [
    { required: true, message: '请输入家庭住址', trigger: 'blur' },
    { min: 5, max: 200, message: '地址长度在 5 到 200 个字符', trigger: 'blur' }
  ]
})

// 获取状态类型
const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    enrolled: 'success',
    suspended: 'warning',
    transferred: 'info',
    graduated: '',
    expelled: 'danger'
  }
  return statusMap[status] || ''
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    enrolled: '在校',
    suspended: '休学',
    transferred: '转学',
    graduated: '毕业',
    expelled: '退学'
  }
  return statusMap[status] || status
}

// 关系变化处理
const handleRelationChange = (value: string) => {
  if (value !== 'other') {
    formData.relationOther = ''
  }
}

// 检查身份证号
const checkIdCard = async () => {
  if (!formData.idCardNumber || isEdit.value) return

  try {
    const res = await checkIdCardNumber(formData.idCardNumber)
    if (res && res.data && res.data.exists) {
      ElMessage.warning('该身份证号已存在')
      formData.idCardNumber = ''
    }
  } catch (error) {
    console.error('检查身份证号失败', error)
  }
}

// 搜索学生
const searchStudents = async (query: string) => {
  if (query) {
    searchLoading.value = true
    try {
      const res = await getStudentList({
        keyword: query,
        pageNum: 1,
        pageSize: 20
      })
      if (res && res.data) {
        studentOptions.value = res.data.list
      }
    } catch (error) {
      ElMessage.error('搜索学生失败')
    } finally {
      searchLoading.value = false
    }
  }
}

// 搜索学生（用于添加）
const searchStudentsForAdd = async (query: string) => {
  if (query) {
    searchLoading.value = true
    try {
      const res = await getStudentList({
        keyword: query,
        pageNum: 1,
        pageSize: 20
      })
      if (res && res.data) {
        studentOptionsForAdd.value = res.data.list
      }
    } catch (error) {
      ElMessage.error('搜索学生失败')
    } finally {
      searchLoading.value = false
    }
  }
}

// 检查学生是否已关联
const isStudentRelated = (studentId: string) => {
  return relatedStudents.value.some(s => s.studentId === studentId)
}

// 获取监护人详情
const fetchGuardianDetail = async () => {
  if (!isEdit.value) return

  loading.value = true
  try {
    const res = await getGuardianDetail(guardianId.value)
    if (res && res.data) {
      const data = res.data
      Object.assign(formData, {
        guardianName: data.guardianName,
        relation: data.relation,
        relationOther: data.relationOther || '',
        idCardNumber: data.idCardNumber,
        phone: data.phone,
        alternatePhone: data.alternatePhone || '',
        email: data.email || '',
        occupation: data.occupation || '',
        workplace: data.workplace || '',
        workAddress: data.workAddress || '',
        homeAddress: data.homeAddress,
        isEmergencyContact: data.isEmergencyContact,
        isLegalGuardian: data.isLegalGuardian,
        remark: data.remark || ''
      })

      // 获取关联的学生
      fetchRelatedStudents()
    }
  } catch (error) {
    ElMessage.error('获取监护人详情失败')
    console.error('获取监护人详情失败', error)
    router.back()
  } finally {
    loading.value = false
  }
}

// 获取关联的学生
const fetchRelatedStudents = async () => {
  if (!isEdit.value) return

  try {
    const res = await getGuardianStudents(guardianId.value)
    if (res && res.data) {
      relatedStudents.value = res.data
    }
  } catch (error) {
    console.error('获取关联学生失败', error)
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      const data = { ...formData }

      if (isEdit.value) {
        await updateGuardian(guardianId.value, data)
        ElMessage.success('修改成功')
      } else {
        await addGuardian(data)
        ElMessage.success('新增成功')
      }
      router.push('/personnel/guardian')
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
    }
  })
}

// 取消
const handleCancel = () => {
  ElMessageBox.confirm(
    '确定要离开当前页面吗？未保存的数据将会丢失。',
    '离开确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    router.push('/personnel/guardian')
  }).catch(() => {
    // 取消操作
  })
}

// 返回
const handleBack = () => {
  router.push('/personnel/guardian')
}

// 查看学生
const handleViewStudent = (student: StudentInfo) => {
  router.push(`/personnel/student/detail/${student.studentId}`)
}

// 添加学生
const handleAddStudent = () => {
  addStudentForm.studentIds = []
  addStudentDialogVisible.value = true
}

// 确认添加学生
const handleAddStudentConfirm = async () => {
  if (!addStudentForm.studentIds.length) {
    ElMessage.warning('请选择要关联的学生')
    return
  }

  try {
    await batchBindStudentGuardian({
      guardianId: guardianId.value,
      studentIds: addStudentForm.studentIds,
      relation: formData.relation,
      relationOther: formData.relationOther
    })
    ElMessage.success('关联成功')
    addStudentDialogVisible.value = false
    fetchRelatedStudents()
  } catch (error: any) {
    ElMessage.error(error.message || '关联失败')
  }
}

// 解除学生关联
const handleUnbindStudent = async (student: StudentInfo) => {
  try {
    await ElMessageBox.confirm(
      `确定要解除与学生 ${student.studentName} 的关联吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await unbindStudentGuardian(student.studentId, guardianId.value)
    ElMessage.success('解除关联成功')
    fetchRelatedStudents()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '解除关联失败')
    }
  }
}

// 初始化
onMounted(() => {
  fetchGuardianDetail()
})
</script>

<style lang="scss" scoped>
.guardian-edit-container {
  padding: 20px;

  .form-tip {
    margin-top: 5px;
    font-size: 12px;
    color: #909399;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>