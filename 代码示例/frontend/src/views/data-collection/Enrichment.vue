<template>
  <div class="enrichment">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h2>💎 信息丰富化</h2>
          <span class="subtitle">基于邮箱或LinkedIn获取联系人的详细信息</span>
        </div>
      </div>
    </div>

    <!-- 丰富化选项 -->
    <el-tabs v-model="enrichType" class="enrich-tabs">
      <el-tab-pane label="个人信息" name="person">
        <el-card>
          <el-form :model="personForm" label-width="120px">
            <el-form-item label="查询方式">
              <el-radio-group v-model="personQueryType">
                <el-radio label="email">通过邮箱</el-radio>
                <el-radio label="linkedin">通过LinkedIn</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item :label="personQueryType === 'email' ? '邮箱地址' : 'LinkedIn URL'">
              <el-input
                v-model="personForm.query"
                :placeholder="personQueryType === 'email' ? 'john@example.com' : 'linkedin.com/in/username'"
                clearable
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="enrichPerson" :loading="loading">
                获取信息
              </el-button>
            </el-form-item>
          </el-form>

          <div v-if="personResult" class="result-display">
            <el-divider>查询结果</el-divider>
            <div class="person-profile">
              <el-avatar :size="80" :src="personResult.avatar" />
              <div class="person-info">
                <h3>{{ personResult.firstName }} {{ personResult.lastName }}</h3>
                <p>{{ personResult.position }} @ {{ personResult.company }}</p>
                <p>📍 {{ personResult.location }}</p>
              </div>
            </div>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="邮箱">{{ personResult.email }}</el-descriptions-item>
              <el-descriptions-item label="电话">{{ personResult.phone || '未知' }}</el-descriptions-item>
              <el-descriptions-item label="LinkedIn">
                <a :href="personResult.linkedin" target="_blank">查看档案</a>
              </el-descriptions-item>
              <el-descriptions-item label="Twitter">{{ personResult.twitter || '未知' }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="公司信息" name="company">
        <el-card>
          <el-form :model="companyForm" label-width="120px">
            <el-form-item label="公司域名">
              <el-input v-model="companyForm.domain" placeholder="example.com" clearable />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="enrichCompany" :loading="loading">
                获取信息
              </el-button>
            </el-form-item>
          </el-form>

          <div v-if="companyResult" class="result-display">
            <el-divider>查询结果</el-divider>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="公司名称">{{ companyResult.name }}</el-descriptions-item>
              <el-descriptions-item label="行业">{{ companyResult.industry }}</el-descriptions-item>
              <el-descriptions-item label="规模">{{ companyResult.size }}</el-descriptions-item>
              <el-descriptions-item label="地址">{{ companyResult.location }}</el-descriptions-item>
              <el-descriptions-item label="成立时间">{{ companyResult.founded }}</el-descriptions-item>
              <el-descriptions-item label="类型">{{ companyResult.type }}</el-descriptions-item>
              <el-descriptions-item label="描述" :span="2">{{ companyResult.description }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="组合查询" name="combined">
        <el-card>
          <el-form :model="combinedForm" label-width="120px">
            <el-form-item label="邮箱地址">
              <el-input v-model="combinedForm.email" placeholder="john@example.com" clearable />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="enrichCombined" :loading="loading">
                获取完整信息
              </el-button>
            </el-form-item>
          </el-form>

          <div v-if="combinedResult" class="result-display">
            <el-divider>个人信息</el-divider>
            <div class="person-profile">
              <el-avatar :size="60" :src="combinedResult.person?.avatar" />
              <div class="person-info">
                <h4>{{ combinedResult.person?.firstName }} {{ combinedResult.person?.lastName }}</h4>
                <p>{{ combinedResult.person?.position }}</p>
              </div>
            </div>

            <el-divider>公司信息</el-divider>
            <el-descriptions :column="2" size="small">
              <el-descriptions-item label="公司">{{ combinedResult.company?.name }}</el-descriptions-item>
              <el-descriptions-item label="行业">{{ combinedResult.company?.industry }}</el-descriptions-item>
              <el-descriptions-item label="规模">{{ combinedResult.company?.size }}</el-descriptions-item>
              <el-descriptions-item label="地址">{{ combinedResult.company?.location }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

// 数据状态
const enrichType = ref('person')
const personQueryType = ref('email')
const loading = ref(false)

// 表单数据
const personForm = reactive({ query: '' })
const companyForm = reactive({ domain: '' })
const combinedForm = reactive({ email: '' })

// 结果数据
const personResult = ref(null)
const companyResult = ref(null)
const combinedResult = ref(null)

// 丰富个人信息
const enrichPerson = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    personResult.value = {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com',
      position: 'Chief Technology Officer',
      company: 'Example Corp',
      location: 'San Francisco, CA',
      phone: '+1 415-555-0123',
      linkedin: 'https://linkedin.com/in/johnsmith',
      twitter: '@johnsmith',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
    }
    ElMessage.success('信息获取成功')
  } catch (error) {
    ElMessage.error('获取失败')
  } finally {
    loading.value = false
  }
}

// 丰富公司信息
const enrichCompany = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    companyResult.value = {
      name: 'Example Corporation',
      domain: companyForm.domain,
      industry: 'Technology',
      size: '1000-5000',
      location: 'San Francisco, CA',
      founded: '2010',
      type: 'Private',
      description: '领先的技术解决方案提供商'
    }
    ElMessage.success('信息获取成功')
  } catch (error) {
    ElMessage.error('获取失败')
  } finally {
    loading.value = false
  }
}

// 组合查询
const enrichCombined = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    combinedResult.value = {
      person: {
        firstName: 'John',
        lastName: 'Smith',
        position: 'CTO',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
      },
      company: {
        name: 'Example Corp',
        industry: 'Technology',
        size: '1000+',
        location: 'San Francisco'
      }
    }
    ElMessage.success('信息获取成功')
  } catch (error) {
    ElMessage.error('获取失败')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.enrichment {
  padding: 20px;

  .page-header {
    margin-bottom: 24px;

    .header-content {
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

  .result-display {
    margin-top: 24px;

    .person-profile {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 20px;
      background: #f5f7fa;
      border-radius: 8px;
      margin-bottom: 20px;

      .person-info {
        h3, h4 {
          margin: 0 0 8px 0;
          color: #303133;
        }

        p {
          margin: 4px 0;
          color: #606266;
          font-size: 14px;
        }
      }
    }
  }
}
</style>