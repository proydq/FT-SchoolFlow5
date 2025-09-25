<template>
  <div class="assignment-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card>
          <el-statistic title="班级总数" :value="statistics.totalClasses" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="已分配班主任" :value="statistics.assignedClasses">
            <template #suffix>
              <el-text type="success" size="small">
                {{ ((statistics.assignedClasses / statistics.totalClasses) * 100).toFixed(1) }}%
              </el-text>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="未分配班主任" :value="statistics.unassignedClasses">
            <template #suffix>
              <el-text type="warning" size="small">
                {{ ((statistics.unassignedClasses / statistics.totalClasses) * 100).toFixed(1) }}%
              </el-text>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="教师总数" :value="statistics.totalTeachers" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选区域 -->
    <el-card style="margin-top: 20px">
      <el-form :model="searchForm" inline>
        <el-form-item label="年级">
          <el-select
            v-model="searchForm.gradeId"
            placeholder="请选择年级"
            clearable
            style="width: 150px"
            @change="handleSearch"
          >
            <el-option
              v-for="grade in gradeList"
              :key="grade.id"
              :label="grade.gradeName"
              :value="grade.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="分配状态">
          <el-select
            v-model="searchForm.assignStatus"
            placeholder="请选择"
            clearable
            style="width: 120px"
            @change="handleSearch"
          >
            <el-option label="已分配" value="assigned" />
            <el-option label="未分配" value="unassigned" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级名称">
          <el-input
            v-model="searchForm.className"
            placeholder="搜索班级"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 班主任分配管理 -->
    <el-card style="margin-top: 20px">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>班主任分配管理</span>
          <div>
            <el-button type="primary" @click="handleBatchAssign">
              <el-icon><User /></el-icon>
              批量分配
            </el-button>
            <el-button @click="handleAutoAssign">
              <el-icon><MagicStick /></el-icon>
              智能分配
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="classList"
        v-loading="loading"
        stripe
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="className" label="班级名称" width="120" />
        <el-table-column prop="gradeName" label="年级" width="80" />
        <el-table-column prop="studentCount" label="学生数" width="80" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ row.studentCount }}人</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="teacherName" label="当前班主任" width="140">
          <template #default="{ row }">
            <div v-if="row.teacherName">
              <div>{{ row.teacherName }}</div>
              <el-text type="info" size="small">{{ row.teacherCode }}</el-text>
            </div>
            <el-tag v-else type="warning" size="small">未分配</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="分配新班主任" width="160">
          <template #default="{ row }">
            <el-select
              v-model="row.newTeacherId"
              placeholder="选择教师"
              clearable
              filterable
              size="small"
              style="width: 100%"
            >
              <el-option
                v-for="teacher in availableTeachers"
                :key="teacher.id"
                :label="`${teacher.name} (${teacher.code})`"
                :value="teacher.id"
                :disabled="teacher.classCount >= 2"
              >
                <div style="display: flex; justify-content: space-between;">
                  <span>{{ teacher.name }}</span>
                  <span>
                    <el-tag v-if="teacher.classCount >= 2" type="danger" size="small">
                      已满
                    </el-tag>
                    <el-tag v-else-if="teacher.classCount === 1" type="warning" size="small">
                      已带1班
                    </el-tag>
                    <el-tag v-else type="success" size="small">
                      可分配
                    </el-tag>
                  </span>
                </div>
              </el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right">
          <template #default="{ row }">
            <div style="display: flex; gap: 8px;">
              <el-button
                size="small"
                type="primary"
                :disabled="!row.newTeacherId"
                @click="handleAssign(row)"
              >
                确认分配
              </el-button>
              <el-button
                size="small"
                type="danger"
                plain
                :disabled="!row.teacherId"
                @click="handleRemove(row)"
              >
                解除关联
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchClassList"
          @current-change="fetchClassList"
        />
      </div>
    </el-card>

    <!-- 批量分配对话框 -->
    <el-dialog
      v-model="batchDialog.visible"
      title="批量分配班主任"
      width="600px"
    >
      <el-form :model="batchDialog" label-width="100px">
        <el-form-item label="选中班级">
          <el-tag>已选择 {{ selectedRows.length }} 个班级</el-tag>
        </el-form-item>
        <el-form-item label="分配方式" required>
          <el-radio-group v-model="batchDialog.assignType">
            <el-radio value="single">统一分配给一位教师</el-radio>
            <el-radio value="multiple">分别指定教师</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="batchDialog.assignType === 'single'"
          label="选择教师"
          required
        >
          <el-select
            v-model="batchDialog.teacherId"
            placeholder="请选择教师"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="teacher in availableTeachers"
              :key="teacher.id"
              :label="`${teacher.name} (${teacher.code})`"
              :value="teacher.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="batchDialog.assignType === 'multiple'"
          label="分配列表"
        >
          <el-table :data="selectedRows" border max-height="300">
            <el-table-column prop="className" label="班级" width="150" />
            <el-table-column label="分配给">
              <template #default="{ row }">
                <el-select
                  v-model="row.assignTeacherId"
                  placeholder="选择教师"
                  size="small"
                  filterable
                >
                  <el-option
                    v-for="teacher in availableTeachers"
                    :key="teacher.id"
                    :label="`${teacher.name}`"
                    :value="teacher.id"
                  />
                </el-select>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item label="分配原因" required>
          <el-input
            v-model="batchDialog.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入分配原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmBatchAssign">确定分配</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, User, MagicStick } from '@element-plus/icons-vue'
import {
  getClassList,
  changeClassTeacher,
  removeClassTeacher,
  batchUpdateTeacher,
  getGradeList,
  getAvailableTeachers
} from '@/api/class'

// 搜索表单
const searchForm = reactive({
  gradeId: '',
  assignStatus: '',
  className: ''
})

// 统计数据
const statistics = reactive({
  totalClasses: 120,
  assignedClasses: 95,
  unassignedClasses: 25,
  totalTeachers: 50
})

// 列表数据
const classList = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const selectedRows = ref<any[]>([])

// 下拉数据
const gradeList = ref<any[]>([])
const availableTeachers = ref<any[]>([])

// 批量分配对话框
const batchDialog = reactive({
  visible: false,
  assignType: 'single',
  teacherId: '',
  reason: ''
})

// 获取班级列表
const fetchClassList = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    const res = await getClassList(params as any)
    classList.value = res.data.list.map((item: any) => ({
      ...item,
      newTeacherId: '',
      assignTeacherId: ''
    }))
    total.value = res.data.total
  } catch (error) {
    ElMessage.error('获取班级列表失败')
  } finally {
    loading.value = false
  }
}

// 获取年级列表
const fetchGradeList = async () => {
  try {
    const res = await getGradeList()
    gradeList.value = res.data
  } catch (error) {
    console.error('获取年级列表失败', error)
  }
}

// 获取可用教师列表
const fetchAvailableTeachers = async () => {
  try {
    const res = await getAvailableTeachers()
    availableTeachers.value = res.data.map((item: any) => ({
      ...item,
      classCount: Math.floor(Math.random() * 3) // 模拟数据
    }))
  } catch (error) {
    console.error('获取教师列表失败', error)
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchClassList()
}

// 重置
const handleReset = () => {
  searchForm.gradeId = ''
  searchForm.assignStatus = ''
  searchForm.className = ''
  handleSearch()
}

// 单个分配
const handleAssign = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要将班级「${row.className}」分配给新班主任吗？`,
      '分配确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await changeClassTeacher(row.id, row.newTeacherId, '班主任调整')
    ElMessage.success('分配成功')
    fetchClassList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('分配失败')
    }
  }
}

// 解除关联
const handleRemove = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要解除班级「${row.className}」的班主任关联吗？`,
      '解除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await removeClassTeacher(row.id, '班主任调整')
    ElMessage.success('解除成功')
    fetchClassList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('解除失败')
    }
  }
}

// 批量分配
const handleBatchAssign = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要分配的班级')
    return
  }
  batchDialog.visible = true
  batchDialog.assignType = 'single'
  batchDialog.teacherId = ''
  batchDialog.reason = ''
}

// 确认批量分配
const confirmBatchAssign = async () => {
  if (batchDialog.assignType === 'single' && !batchDialog.teacherId) {
    ElMessage.warning('请选择教师')
    return
  }
  if (!batchDialog.reason) {
    ElMessage.warning('请输入分配原因')
    return
  }

  try {
    if (batchDialog.assignType === 'single') {
      const classIds = selectedRows.value.map(row => row.id)
      await batchUpdateTeacher(classIds, batchDialog.teacherId, batchDialog.reason)
    } else {
      // 分别指定教师
      const unassigned = selectedRows.value.filter(row => !row.assignTeacherId)
      if (unassigned.length > 0) {
        ElMessage.warning(`还有${unassigned.length}个班级未指定教师`)
        return
      }

      const promises = selectedRows.value.map(row =>
        changeClassTeacher(row.id, row.assignTeacherId, batchDialog.reason)
      )
      await Promise.all(promises)
    }

    ElMessage.success('批量分配成功')
    batchDialog.visible = false
    fetchClassList()
  } catch (error) {
    ElMessage.error('批量分配失败')
  }
}

// 智能分配
const handleAutoAssign = () => {
  ElMessageBox.confirm(
    '智能分配将根据教师工作量、专业特长等因素自动为未分配班主任的班级分配合适的教师，是否继续？',
    '智能分配',
    {
      confirmButtonText: '开始分配',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    ElMessage.success('智能分配完成')
    fetchClassList()
  }).catch(() => {
    // 取消操作
  })
}

// 选择变化
const handleSelectionChange = (rows: any[]) => {
  selectedRows.value = rows
}

// 初始化
onMounted(() => {
  fetchClassList()
  fetchGradeList()
  fetchAvailableTeachers()
})
</script>

<style lang="scss" scoped>
.assignment-container {
  padding: 20px;
}

:deep(.el-statistic__content) {
  font-size: 24px;
}
</style>