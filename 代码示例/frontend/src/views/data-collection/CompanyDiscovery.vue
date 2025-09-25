<template>
  <div class="company-discovery">
    <!-- 页面头部 v1.1 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h2>🎯 公司发现</h2>
          <span class="subtitle">通过AI自然语言或高级筛选条件发现目标公司</span>
        </div>
        <div class="header-actions">
          <el-button type="primary" icon="Search" @click="handleSearch">
            开始搜索
          </el-button>
          <el-button icon="Refresh" @click="handleReset">重置条件</el-button>
        </div>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="search-section">
      <!-- AI自然语言搜索 -->
      <el-card class="search-card">
        <template #header>
          <div class="card-header">
            <el-icon><Search /></el-icon>
            <span>智能搜索</span>
            <el-tag type="success" size="small">AI驱动</el-tag>
          </div>
        </template>
        <div class="natural-search">
          <el-input
            v-model="naturalQuery"
            type="textarea"
            :rows="3"
            placeholder="用自然语言描述您的目标公司，例如：&#10;• 欧洲50-200人的SaaS公司&#10;• 使用Salesforce的金融科技公司&#10;• 最近获得A轮融资的电商平台"
            resize="none"
          />
          <div class="query-examples">
            <span class="label">快速示例：</span>
            <el-tag
              v-for="example in queryExamples"
              :key="example"
              @click="naturalQuery = example"
              class="example-tag"
              effect="plain"
            >
              {{ example }}
            </el-tag>
          </div>
        </div>
      </el-card>

      <!-- 高级筛选条件 - 暂时隐藏整个卡片 -->
      <el-card class="filter-card" v-if="showPremiumFeatures">
        <template #header>
          <div class="card-header">
            <el-icon><Filter /></el-icon>
            <span>高级筛选</span>
            <el-button text size="small" @click="showAdvanced = !showAdvanced">
              {{ showAdvanced ? '收起' : '展开' }}
              <el-icon><ArrowDown v-if="!showAdvanced" /><ArrowUp v-else /></el-icon>
            </el-button>
          </div>
        </template>

        <el-form
          v-show="showAdvanced"
          :model="filterForm"
          label-width="100px"
          class="filter-form"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="公司规模">
                <el-select v-model="filterForm.headcount" multiple placeholder="请选择" style="width: 240px">
                  <el-option label="1-10人" value="1-10" />
                  <el-option label="11-50人" value="11-50" />
                  <el-option label="51-200人" value="51-200" />
                  <el-option label="201-500人" value="201-500" />
                  <el-option label="501-1000人" value="501-1000" />
                  <el-option label="1001-5000人" value="1001-5000" />
                  <el-option label="5001-10000人" value="5001-10000" />
                  <el-option label="10000+人" value="10001+" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="所在地区">
                <el-cascader
                  v-model="filterForm.location"
                  :options="locationOptions"
                  :props="{ multiple: true }"
                  placeholder="请选择地区"
                  collapse-tags
                  collapse-tags-tooltip
                  style="width: 240px"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="公司类型">
                <el-select v-model="filterForm.company_type" multiple placeholder="选择公司类型" style="width: 240px">
                  <el-option label="教育机构" value="educational" />
                  <el-option label="教育院校" value="educational institution" />
                  <el-option label="政府机构" value="government agency" />
                  <el-option label="非营利组织" value="non profit" />
                  <el-option label="合伙企业" value="partnership" />
                  <el-option label="私营企业" value="privately held" />
                  <el-option label="上市公司" value="public company" />
                  <el-option label="自雇" value="self employed" />
                  <el-option label="个人拥有" value="self owned" />
                  <el-option label="独资企业" value="sole proprietorship" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="行业领域">
                <el-select v-model="filterForm.industry.include" multiple placeholder="选择包含的行业" style="width: 240px">
                  <el-option label="科技/IT" value="Technology" />
                  <el-option label="金融服务" value="Finance" />
                  <el-option label="医疗健康" value="Healthcare" />
                  <el-option label="教育" value="Education" />
                  <el-option label="电子商务" value="E-commerce" />
                  <el-option label="制造业" value="Manufacturing" />
                  <el-option label="软件/SaaS" value="Software" />
                  <el-option label="咨询服务" value="Consulting" />
                  <el-option label="广告营销" value="Marketing" />
                  <el-option label="房地产" value="Real Estate" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 高级功能区域 - 暂时隐藏，保留代码以备将来使用 -->
          <el-row :gutter="20" v-if="showPremiumFeatures">
            <el-col :span="12">
              <el-form-item label="技术栈">
                <div style="display: flex; align-items: center; gap: 10px">
                  <el-select
                    v-model="filterForm.technology.include"
                    multiple
                    placeholder="包含的技术"
                    style="width: 300px"
                  >
                    <el-option label="Salesforce" value="salesforce" />
                    <el-option label="HubSpot" value="hubspot" />
                    <el-option label="AWS" value="aws" />
                    <el-option label="Google Cloud" value="google-cloud" />
                    <el-option label="Microsoft Azure" value="azure" />
                    <el-option label="Shopify" value="shopify" />
                    <el-option label="WordPress" value="wordpress" />
                    <el-option label="React" value="react" />
                    <el-option label="Node.js" value="nodejs" />
                    <el-option label="Python" value="python" />
                  </el-select>
                  <el-tag type="warning" size="small">高级功能</el-tag>
                </div>
                <el-radio-group v-model="filterForm.technology.match" size="small" style="margin-top: 10px">
                  <el-radio label="all">必须全部匹配</el-radio>
                  <el-radio label="any">匹配任意一个</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="融资阶段">
                <div style="display: flex; align-items: center; gap: 10px">
                  <el-select v-model="filterForm.funding.series" multiple placeholder="选择融资轮次" style="width: 300px">
                    <el-option label="种子轮前" value="pre_seed" />
                    <el-option label="种子轮" value="seed" />
                    <el-option label="Pre-A轮" value="pre_series_a" />
                    <el-option label="A轮" value="series_a" />
                    <el-option label="Pre-B轮" value="pre_series_b" />
                    <el-option label="B轮" value="series_b" />
                    <el-option label="Pre-C轮" value="pre_series_c" />
                    <el-option label="C轮及以上" value="series_c+" />
                    <el-option label="其他" value="other" />
                  </el-select>
                  <el-tag type="warning" size="small">高级功能</el-tag>
                </div>
              </el-form-item>
            </el-col>
            </el-row>
            <el-row :gutter="20" v-if="showPremiumFeatures">
            <el-col :span="12">
              <el-form-item label="成立时间">
                <div style="display: flex; align-items: center; gap: 10px">
                  <el-date-picker
                    v-model="yearFoundedRange"
                    type="yearrange"
                    range-separator="至"
                    start-placeholder="开始年份"
                    end-placeholder="结束年份"
                    @change="handleYearChange"
                    style="width: 300px"
                  />
                  <el-tag type="warning" size="small">高级功能</el-tag>
                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 关键词和指定公司 - 暂时隐藏 -->
          <el-row :gutter="20" v-if="showPremiumFeatures">
            <el-col :span="12">
              <el-form-item label="关键词">
                <div>
                  <el-input
                    v-model="keywordsInput"
                    placeholder="输入关键词后按回车添加"
                    @keyup.enter="addKeyword"
                    style="width: 240px; margin-bottom: 10px"
                  />
                  <div style="min-height: 32px">
                    <el-tag
                      v-for="keyword in filterForm.keywords.include"
                      :key="keyword"
                      closable
                      @close="removeKeyword(keyword)"
                      style="margin-right: 5px"
                    >
                      {{ keyword }}
                    </el-tag>
                  </div>
                  <el-radio-group v-model="filterForm.keywords.match" size="small" style="margin-top: 5px">
                    <el-radio label="all">必须全部匹配</el-radio>
                    <el-radio label="any">匹配任意一个</el-radio>
                  </el-radio-group>
                </div>
              </el-form-item>
            </el-col>
            <!-- 相似公司查找 - 高级功能，暂时隐藏 -->
            <el-col :span="12" v-if="showPremiumFeatures">
              <el-form-item label="相似公司">
                <div style="display: flex; align-items: center; gap: 10px">
                  <el-input
                    v-model="filterForm.similar_to"
                    placeholder="输入域名或公司名称"
                    style="width: 300px"
                  />
                  <el-tag type="warning" size="small">高级功能</el-tag>
                </div>
                <div style="margin-top: 5px; color: #909399; font-size: 12px">
                  例如：salesforce.com 或 Salesforce
                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20" v-if="showPremiumFeatures">
            <el-col :span="24">
              <el-form-item label="指定公司">
                <div>
                  <el-input
                    v-model="organizationInput"
                    placeholder="输入域名或公司名称后按回车添加（可添加多个）"
                    @keyup.enter="addOrganization"
                    style="width: 500px; margin-bottom: 10px"
                  />
                  <div style="min-height: 32px">
                    <el-tag
                      v-for="org in filterForm.organization"
                      :key="org"
                      closable
                      @close="removeOrganization(org)"
                      style="margin-right: 5px; margin-bottom: 5px"
                    >
                      {{ org }}
                    </el-tag>
                  </div>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
      <!-- 更新时间: 2024-01-20 13:16 -->
    </div>

    <!-- 搜索结果 -->
    <div class="results-section">
      <div class="results-header">
        <div class="results-info">
          <span>找到 <strong>{{ totalCompanies }}</strong> 家符合条件的公司</span>
          <el-divider direction="vertical" />
          <span>已选择 <strong>{{ selectedCompanies.length }}</strong> 家</span>
        </div>
        <div class="results-actions" v-if="selectedCompanies.length > 0">
          <el-button type="primary" icon="Plus" @click="handleBatchAdd">
            添加到列表
          </el-button>
          <el-button type="success" icon="Download" @click="handleBatchExport">
            导出选中
          </el-button>
          <el-button @click="clearSelection">清除选择</el-button>
        </div>
      </div>

      <!-- 结果列表 -->
      <div class="results-list">
        <!-- 自定义加载动画 -->
        <div v-if="loading" class="custom-loading">
          <div class="loading-container">
            <el-icon class="loading-icon" :size="50" color="#409EFF">
              <Loading />
            </el-icon>
            <div class="loading-text">正在搜索公司数据</div>
            <div class="loading-subtext">AI正在分析您的搜索条件，请稍候...</div>
            <el-progress
              :percentage="loadingProgress"
              :show-text="false"
              :stroke-width="3"
              color="#409EFF"
              style="width: 300px; margin-top: 20px"
            />
          </div>
        </div>

        <el-table
          v-show="!loading"
          ref="companiesTableRef"
          :data="companies"
          @selection-change="handleSelectionChange"
          stripe
          style="width: 100%"
        >
          <el-table-column type="selection" width="50" />
          <el-table-column prop="organization" label="公司名称" min-width="250">
            <template #default="{ row }">
              <div class="company-name">
                <div>
                  <div class="name">{{ row.organization || '未知公司' }}</div>
                  <div class="domain">
                    <el-link type="primary" :href="`https://${row.domain}`" target="_blank">
                      {{ row.domain }}
                    </el-link>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="个人邮箱" width="100" align="center">
            <template #default="{ row }">
              <el-tag type="success" size="small">
                {{ row.emails_count?.personal || 0 }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="通用邮箱" width="100" align="center">
            <template #default="{ row }">
              <el-tag type="info" size="small">
                {{ row.emails_count?.generic || 0 }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="邮箱总数" width="100" align="center">
            <template #default="{ row }">
              <div style="display: flex; align-items: center; justify-content: center">
                <el-tag type="primary" size="small">
                  {{ row.emails_count?.total || 0 }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <div style="display: flex; gap: 5px">
                <el-button size="small" text type="primary" icon="View" @click="viewCompany(row)">
                  查看
                </el-button>
                <el-button
                  size="small"
                  text
                  type="success"
                  icon="Search"
                  @click="searchEmails(row)"
                  :disabled="!row.domain"
                >
                  查找邮箱
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="totalCompanies"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>

    <!-- 公司详情对话框 -->
    <el-dialog
      v-model="companyDialogVisible"
      :title="currentCompany?.name"
      width="800px"
    >
      <div class="company-detail" v-if="currentCompany">
        <!-- 详情内容 -->
        <el-descriptions :column="2" border>
          <el-descriptions-item label="网站">
            <a :href="`https://${currentCompany.domain}`" target="_blank">
              {{ currentCompany.domain }}
            </a>
          </el-descriptions-item>
          <el-descriptions-item label="行业">
            {{ currentCompany.industry }}
          </el-descriptions-item>
          <el-descriptions-item label="规模">
            {{ currentCompany.size }}
          </el-descriptions-item>
          <el-descriptions-item label="地址">
            {{ currentCompany.city }}, {{ currentCompany.country }}
          </el-descriptions-item>
          <el-descriptions-item label="成立时间">
            {{ currentCompany.yearFounded }}
          </el-descriptions-item>
          <el-descriptions-item label="邮箱数量">
            {{ currentCompany.emailCount }}
          </el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">
            {{ currentCompany.description }}
          </el-descriptions-item>
          <el-descriptions-item label="技术栈" :span="2">
            <el-tag
              v-for="tech in currentCompany.technologies"
              :key="tech"
              style="margin: 2px"
            >
              {{ tech }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="companyDialogVisible = false">关闭</el-button>
        <el-button
          type="primary"
          @click="searchEmails(currentCompany)"
          :disabled="!currentCompany?.domain"
        >
          查找邮箱
        </el-button>
      </template>
    </el-dialog>

    <!-- 添加到列表对话框 -->
    <el-dialog
      v-model="addToListDialogVisible"
      title="添加到列表"
      width="600px"
    >
      <div class="add-to-list-dialog">
        <!-- 选择已有列表 -->
        <div class="existing-lists">
          <h4>选择列表</h4>
          <el-radio-group v-model="selectedListId" class="list-radio-group">
            <el-radio
              v-for="list in userLists"
              :key="list.id"
              :value="list.id"
              class="list-radio-item"
            >
              <div class="list-info">
                <span class="list-name">{{ list.name }}</span>
                <el-tag v-if="list.isDefault" type="primary" size="small">默认</el-tag>
                <span class="list-count">（{{ list.companyCount || 0 }} 个公司）</span>
              </div>
            </el-radio>
          </el-radio-group>
        </div>

        <!-- 创建新列表 -->
        <div class="new-list-section">
          <el-divider>或</el-divider>
          <el-button @click="showCreateList = !showCreateList" text type="primary">
            <el-icon><Plus /></el-icon>
            创建新列表
          </el-button>
          <div v-if="showCreateList" class="create-list-form">
            <el-form :model="newListForm" label-width="80px">
              <el-form-item label="列表名称" required>
                <el-input
                  v-model="newListForm.name"
                  placeholder="请输入列表名称"
                  maxlength="100"
                />
              </el-form-item>
              <el-form-item label="描述">
                <el-input
                  v-model="newListForm.description"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入列表描述（可选）"
                  maxlength="500"
                />
              </el-form-item>
            </el-form>
          </div>
        </div>

        <!-- 显示要添加的公司数量 -->
        <div class="summary">
          <el-alert
            :title="`将添加 ${companiesToAdd.length} 个公司到列表`"
            type="info"
            :closable="false"
          />
        </div>
      </div>

      <template #footer>
        <el-button @click="addToListDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="confirmAddToList"
          :loading="addingToList"
        >
          确定添加
        </el-button>
      </template>
    </el-dialog>

    <!-- 邮箱列表对话框 -->
    <el-dialog
      v-model="emailDialogVisible"
      width="80%"
      top="5vh"
    >
      <template #header>
        <div style="display: flex; align-items: center;">
          <span>{{ currentCompany?.organization || currentDomain }} - 邮箱列表</span>
          <el-button
            type="success"
            size="small"
            style="margin-left: 20px;"
            @click="exportEmailList"
            :disabled="emailList.length === 0"
          >
            <el-icon style="margin-right: 4px;"><Download /></el-icon>
            导出
          </el-button>
        </div>
      </template>
      <div v-loading="emailLoading">
        <!-- 公司信息卡片 -->
        <el-card class="company-info-card" shadow="never" v-if="emailData">
          <div class="info-grid">
            <div class="info-item">
              <span class="label">公司名称：</span>
              <span class="value">{{ emailData.organization || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">域名：</span>
              <span class="value">{{ emailData.domain }}</span>
            </div>
            <div class="info-item">
              <span class="label">行业：</span>
              <span class="value">{{ emailData.industry || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">公司类型：</span>
              <span class="value">{{ emailData.company_type || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">员工规模：</span>
              <el-tag type="success" v-if="emailData.headcount">{{ emailData.headcount }}</el-tag>
              <span v-else>-</span>
            </div>
            <div class="info-item">
              <span class="label">地址：</span>
              <span class="value">
                {{ [emailData.city, emailData.state, emailData.country].filter(Boolean).join(', ') || '-' }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">邮箱总数：</span>
              <el-tag type="primary">{{ emailTotal || 0 }} 个</el-tag>
            </div>
            <div class="info-item full-width" v-if="emailData.description">
              <span class="label">公司描述：</span>
              <span class="value">{{ emailData.description }}</span>
            </div>
            <div class="info-item full-width" v-if="emailData.technologies && emailData.technologies.length > 0">
              <span class="label">技术栈：</span>
              <div class="tech-tags">
                <el-tag
                  v-for="tech in (showAllTechnologies ? emailData.technologies : emailData.technologies.slice(0, 15))"
                  :key="tech"
                  size="small"
                  style="margin: 2px"
                >
                  {{ tech }}
                </el-tag>
                <el-button
                  v-if="emailData.technologies.length > 15"
                  type="primary"
                  text
                  size="small"
                  @click="showAllTechnologies = !showAllTechnologies"
                  style="color: #409eff; cursor: pointer; margin-left: 4px;"
                >
                  {{ showAllTechnologies ? '收起' : `+${emailData.technologies.length - 15} 更多` }}
                </el-button>
              </div>
            </div>
            <div class="info-item full-width social-links" v-if="emailData.twitter || emailData.facebook || emailData.linkedin || emailData.instagram || emailData.youtube">
              <span class="label">社交媒体：</span>
              <div class="links">
                <el-link v-if="emailData.twitter" :href="emailData.twitter" target="_blank" type="primary">
                  Twitter
                </el-link>
                <el-link v-if="emailData.facebook" :href="emailData.facebook" target="_blank" type="primary">
                  Facebook
                </el-link>
                <el-link v-if="emailData.linkedin" :href="emailData.linkedin" target="_blank" type="primary">
                  LinkedIn
                </el-link>
                <el-link v-if="emailData.instagram" :href="emailData.instagram" target="_blank" type="primary">
                  Instagram
                </el-link>
                <el-link v-if="emailData.youtube" :href="emailData.youtube" target="_blank" type="primary">
                  YouTube
                </el-link>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 邮箱列表表格 -->
        <el-table
          :data="emailList"
          style="width: 100%; margin-top: 20px"
          max-height="400"
        >
          <el-table-column prop="value" label="邮箱地址" min-width="200">
            <template #default="{ row }">
              <div style="display: flex; align-items: center; gap: 8px">
                <span>{{ row.value }}</span>
                <el-button
                  text
                  type="primary"
                  size="small"
                  icon="CopyDocument"
                  @click="copyEmail(row.value)"
                >
                  复制
                </el-button>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="姓名" min-width="150">
            <template #default="{ row }">
              {{ row.first_name || '' }} {{ row.last_name || '' }}
            </template>
          </el-table-column>
          <el-table-column prop="position" label="职位" min-width="200" show-overflow-tooltip />
          <el-table-column prop="department" label="部门" width="120" />
          <el-table-column prop="seniority" label="级别" width="100">
            <template #default="{ row }">
              <el-tag v-if="row.seniority" size="small" type="info">
                {{ row.seniority }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="LinkedIn" width="100">
            <template #default="{ row }">
              <el-link v-if="row.linkedin" :href="row.linkedin" target="_blank" type="primary">
                查看
              </el-link>
            </template>
          </el-table-column>
          <el-table-column label="验证状态" width="100">
            <template #default="{ row }">
              <el-tag
                v-if="row.verification?.status"
                :type="row.verification.status === 'valid' ? 'success' : 'warning'"
                size="small"
              >
                {{ row.verification.status === 'valid' ? '有效' : '待验证' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination" v-if="emailTotal > 0" style="display: flex; justify-content: flex-end; margin-top: 20px;">
          <el-pagination
            v-model:current-page="emailPage"
            v-model:page-size="emailPageSize"
            :page-sizes="[10, 20, 50]"
            :total="emailTotal"
            layout="total, sizes, prev, pager, next"
            @size-change="handleEmailPageChange"
            @current-change="handleEmailPageChange"
          />
        </div>

        <!-- 空状态 -->
        <el-empty v-if="!emailLoading && emailList.length === 0" description="暂无邮箱数据" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Filter, ArrowDown, ArrowUp, Location, Message, Plus, Download, Loading } from '@element-plus/icons-vue'
import { getHunterAPI } from '@/api/hunter-config'
import hunterBackendAPI from '@/api/hunter-backend'
import companyListsAPI from '@/api/company-lists'

// 数据状态
const loading = ref(false)
const loadingProgress = ref(0)
const showAdvanced = ref(false)
// 控制高级功能显示（需要高级计划）- 暂时设为false，将来可根据用户计划动态设置
const showPremiumFeatures = ref(false)
const naturalQuery = ref('')
const companies = ref([])
const selectedCompanies = ref([])
const totalCompanies = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const companyDialogVisible = ref(false)
const currentCompany = ref(null)

// 添加到列表相关
const addToListDialogVisible = ref(false)
const userLists = ref([])
const selectedListId = ref('')
const showCreateList = ref(false)
const newListForm = reactive({
  name: '',
  description: ''
})
const companiesToAdd = ref([])
const addingToList = ref(false)

// Hunter API实例
let hunterAPI = null

// 表格引用
const companiesTableRef = ref(null)

// 查询示例
const queryExamples = [
  'Cosmetics companies in Europe',
  'LED Screen in Europe',
  'LCD in Europe',
  'LCD MODULE in Europe'
]

// 显示高级筛选(高级计划功能) - 已通过showAdvanced控制
// const showAdvancedFilters = ref(false)

// 年份范围选择器的绑定值
const yearFoundedRange = ref(null)

// 处理年份变化
const handleYearChange = (value) => {
  if (value && value.length === 2) {
    filterForm.year_founded.from = value[0] ? value[0].getFullYear() : null
    filterForm.year_founded.to = value[1] ? value[1].getFullYear() : null
  } else {
    filterForm.year_founded.from = null
    filterForm.year_founded.to = null
  }
}

// 输入框绑定值
const keywordsInput = ref('')
const organizationInput = ref('')

// 筛选表单 - 根据Hunter.io API文档设置
const filterForm = reactive({
  // 公司规模 - Hunter API: headcount
  headcount: [],
  // 总部位置 - Hunter API: headquarters_location
  headquarters_location: {
    include: {
      continent: [],
      country: [],
      state: [],
      city: []
    },
    exclude: {
      continent: [],
      country: [],
      state: [],
      city: []
    }
  },
  // 行业 - Hunter API: industry
  industry: {
    include: [],
    exclude: []
  },
  // 公司类型 - Hunter API: company_type
  company_type: [],
  // 技术栈 - Hunter API: technology (高级计划功能)
  technology: {
    include: [],
    exclude: [],
    match: 'all' // all 或 any
  },
  // 融资 - Hunter API: funding (高级计划功能)
  funding: {
    series: [],
    amount: {
      from: null,
      to: null
    },
    date: {
      from: null,
      to: null
    }
  },
  // 成立年份 - Hunter API: year_founded (高级计划功能)
  year_founded: {
    from: null,
    to: null
  },
  // 关键词 - Hunter API: keywords
  keywords: {
    include: [],
    exclude: [],
    match: 'all' // all 或 any
  },
  // 相似公司 - Hunter API: similar_to (高级计划功能)
  similar_to: '',
  // 组织/域名 - Hunter API: organization
  organization: []
})

// 地区选项
const locationOptions = [
  {
    value: 'North America',
    label: '北美',
    children: [
      { value: 'US', label: '美国' },
      { value: 'CA', label: '加拿大' }
    ]
  },
  {
    value: 'Europe',
    label: '欧洲',
    children: [
      { value: 'GB', label: '英国' },
      { value: 'DE', label: '德国' },
      { value: 'FR', label: '法国' }
    ]
  },
  {
    value: 'Asia',
    label: '亚洲',
    children: [
      { value: 'CN', label: '中国' },
      { value: 'JP', label: '日本' },
      { value: 'SG', label: '新加坡' }
    ]
  }
]

// 添加关键词
const addKeyword = () => {
  if (keywordsInput.value.trim() && !filterForm.keywords.include.includes(keywordsInput.value.trim())) {
    filterForm.keywords.include.push(keywordsInput.value.trim())
    keywordsInput.value = ''
  }
}

// 移除关键词
const removeKeyword = (keyword) => {
  const index = filterForm.keywords.include.indexOf(keyword)
  if (index > -1) {
    filterForm.keywords.include.splice(index, 1)
  }
}

// 添加组织/域名
const addOrganization = () => {
  if (organizationInput.value.trim() && !filterForm.organization.includes(organizationInput.value.trim())) {
    filterForm.organization.push(organizationInput.value.trim())
    organizationInput.value = ''
  }
}

// 移除组织/域名
const removeOrganization = (org) => {
  const index = filterForm.organization.indexOf(org)
  if (index > -1) {
    filterForm.organization.splice(index, 1)
  }
}

// 搜索公司
const handleSearch = async () => {
  if (!naturalQuery.value && !hasAdvancedFilters()) {
    ElMessage.warning('请输入搜索条件')
    return
  }


  console.log('开始搜索，loading状态:', loading.value)
  loading.value = true
  console.log('设置loading为true后:', loading.value)
  loadingProgress.value = 0

  // 创建进度条动画
  const progressInterval = setInterval(() => {
    if (loadingProgress.value < 90) {
      loadingProgress.value += Math.random() * 10
    }
  }, 300)

  // 记录开始时间，确保最小显示时间
  const startTime = Date.now()
  const minLoadingTime = 1500 // 最小显示1.5秒

  try {
    const params = {
      query: naturalQuery.value,
      page: currentPage.value,
      pageSize: pageSize.value,
      ...filterForm
    }

    // 临时使用后端API直接搜索，避免hunterAPI初始化问题
    console.log('调用搜索API，参数:', params)
    const response = await hunterBackendAPI.companyDiscovery.search(params)

    // 完成进度条
    clearInterval(progressInterval)
    loadingProgress.value = 100

    // 确保最小加载时间
    const elapsedTime = Date.now() - startTime
    if (elapsedTime < minLoadingTime) {
      await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime))
    }

    if (response.code === 200) {
      companies.value = response.data.companies
      totalCompanies.value = response.data.total
      ElMessage.success(`找到 ${response.data.total} 家匹配的公司`)
    } else {
      ElMessage.error('搜索失败，请稍后重试')
    }
  } catch (error) {
    console.error('Search error:', error)
    ElMessage.error('搜索失败：' + (error.message || '未知错误'))
    clearInterval(progressInterval)

    // 错误时也确保最小加载时间
    const elapsedTime = Date.now() - startTime
    if (elapsedTime < minLoadingTime) {
      await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime))
    }
  } finally {
    loading.value = false
    loadingProgress.value = 0
  }
}

// 检查是否有高级筛选条件
const hasAdvancedFilters = () => {
  return filterForm.headcount.length > 0 ||
    filterForm.location.length > 0 ||
    filterForm.industry.length > 0 ||
    filterForm.technology.length > 0 ||
    filterForm.funding.length > 0 ||
    filterForm.yearFounded !== null
}

// 重置条件
const handleReset = () => {
  naturalQuery.value = ''
  Object.keys(filterForm).forEach(key => {
    if (Array.isArray(filterForm[key])) {
      filterForm[key] = []
    } else {
      filterForm[key] = null
    }
  })
  companies.value = []
  totalCompanies.value = 0
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedCompanies.value = selection
}

// 查看公司详情
const viewCompany = (company) => {
  currentCompany.value = company
  companyDialogVisible.value = true
}

// 邮箱相关数据
const emailDialogVisible = ref(false)
const emailLoading = ref(false)
const emailData = ref(null)
const emailList = ref([])
const allEmailList = ref([]) // 存储所有邮箱数据
const emailPage = ref(1)
const emailPageSize = ref(10)
const emailTotal = ref(0)
const currentDomain = ref('')
const showAllTechnologies = ref(false)

// 搜索邮箱
const searchEmails = async (company) => {
  if (!company.domain) {
    ElMessage.warning('该公司没有域名信息')
    return
  }

  currentDomain.value = company.domain
  currentCompany.value = company
  showAllTechnologies.value = false // 重置技术栈展开状态
  emailPage.value = 1 // 重置到第一页
  allEmailList.value = [] // 清空缓存数据
  emailDialogVisible.value = true
  await loadDomainEmails()
}

// 加载域名邮箱
const loadDomainEmails = async () => {
  emailLoading.value = true
  try {
    // 只请求第一页数据，限制为10条
    const response = await hunterBackendAPI.domainSearch({
      domain: currentDomain.value,
      limit: 10,
      offset: 0
    })

    if (response.code === 200 && response.data) {
      const data = response.data.data
      const meta = response.data.meta
      emailData.value = data
      emailList.value = data.emails || []
      // 如果总数超过10，就只显示10条（避免分页）
      emailTotal.value = Math.min(meta?.results || 0, 10)
    }
  } catch (error) {
    console.error('加载邮箱失败:', error)
    ElMessage.error('加载邮箱失败')
  } finally {
    emailLoading.value = false
  }
}

// 邮箱分页变化
const handleEmailPageChange = () => {
  // 暂时禁用分页，只显示第一页
  if (emailPage.value > 1) {
    ElMessage.info('由于API限制，暂时只能显示前10条邮箱')
    emailPage.value = 1
  }
}

// 复制邮箱
const copyEmail = (email) => {
  navigator.clipboard.writeText(email).then(() => {
    ElMessage.success('邮箱已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

// 导出邮箱列表
const exportEmailList = () => {
  if (!emailList.value || emailList.value.length === 0) {
    ElMessage.warning('没有可导出的邮箱')
    return
  }

  const csvContent = [
    ['邮箱', '姓名', '职位', '部门', 'LinkedIn', '验证状态'],
    ...emailList.value.map(item => [
      item.value || '',
      `${item.first_name || ''} ${item.last_name || ''}`.trim(),
      item.position || '',
      item.department || '',
      item.linkedin || '',
      item.verification?.status || ''
    ])
  ].map(row => row.join(',')).join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${currentDomain.value}_emails_${new Date().getTime()}.csv`
  link.click()

  ElMessage.success('邮箱列表已导出')
}

// 批量添加到列表
const handleBatchAdd = async () => {
  if (selectedCompanies.value.length === 0) {
    ElMessage.warning('请先选择要添加的公司')
    return
  }

  companiesToAdd.value = selectedCompanies.value
  showCreateList.value = false
  newListForm.name = ''
  newListForm.description = ''

  try {
    // 获取用户的列表
    const response = await companyListsAPI.getUserLists()
    if (response.code === 200) {
      userLists.value = response.data || []

      // 如果有默认列表，自动选中
      const defaultList = userLists.value.find(list => list.isDefault)
      if (defaultList) {
        selectedListId.value = defaultList.id
      } else if (userLists.value.length > 0) {
        selectedListId.value = userLists.value[0].id
      }

      addToListDialogVisible.value = true
    }
  } catch (error) {
    console.error('获取列表失败:', error)
    ElMessage.error('获取列表失败')
  }
}

// 确认添加到列表
const confirmAddToList = async () => {
  addingToList.value = true

  try {
    let listId = selectedListId.value

    // 如果需要创建新列表
    if (showCreateList.value) {
      if (!newListForm.name) {
        ElMessage.warning('请输入列表名称')
        addingToList.value = false
        return
      }

      const createResponse = await companyListsAPI.createList(
        newListForm.name,
        newListForm.description
      )

      if (createResponse.code === 200) {
        listId = createResponse.data.id
        ElMessage.success('列表创建成功')
      } else {
        throw new Error(createResponse.message || '创建列表失败')
      }
    }

    if (!listId) {
      ElMessage.warning('请选择或创建一个列表')
      addingToList.value = false
      return
    }

    // 添加公司到列表
    const response = await companyListsAPI.addCompaniesToList(listId, companiesToAdd.value)

    if (response.code === 200) {
      ElMessage.success(response.message || '添加成功')
      addToListDialogVisible.value = false
      clearSelection()
    } else {
      throw new Error(response.message || '添加失败')
    }
  } catch (error) {
    console.error('添加到列表失败:', error)
    ElMessage.error(error.message || '添加到列表失败')
  } finally {
    addingToList.value = false
  }
}

// 批量导出
const handleBatchExport = () => {
  ElMessage.info('导出功能待实现')
}

// 清除选择
const clearSelection = () => {
  if (companiesTableRef.value) {
    companiesTableRef.value.clearSelection()
  }
  selectedCompanies.value = []
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  handleSearch()
}

const handlePageChange = (val) => {
  currentPage.value = val
  handleSearch()
}

onMounted(async () => {
  // 加载Hunter API
  hunterAPI = await getHunterAPI()

  // 页面加载时可以执行默认搜索
  // handleSearch()
})
</script>

<style lang="scss" scoped>
.company-discovery {
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

      .header-actions {
        display: flex;
        gap: 12px;
      }
    }
  }

  .search-section {
    margin-bottom: 24px;

    .search-card, .filter-card {
      margin-bottom: 16px;

      .card-header {
        display: flex;
        align-items: center;
        gap: 8px;

        .el-icon {
          font-size: 18px;
          color: $primary-color;
        }
      }

      .natural-search {
        .query-examples {
          margin-top: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;

          .label {
            color: #909399;
            font-size: 13px;
          }

          .example-tag {
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
              color: $primary-color;
              border-color: $primary-color;
            }
          }
        }
      }
    }

    .filter-form {
      padding-top: 12px;
    }
  }

  .results-section {
    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #f5f7fa;
      border-radius: 4px;
      margin-bottom: 16px;

      .results-info {
        display: flex;
        align-items: center;
        gap: 12px;
        color: #606266;

        strong {
          color: $primary-color;
          font-size: 18px;
        }
      }

      .results-actions {
        display: flex;
        gap: 8px;
      }
    }

    .results-list {
      background: white;
      border-radius: 4px;

      .custom-loading {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 400px;
        background: linear-gradient(135deg, #f8f9ff 0%, #fff 100%);

        .loading-container {
          text-align: center;
          padding: 40px;

          .loading-icon {
            animation: loading-rotate 2s linear infinite;
            margin-bottom: 20px;
          }

          .loading-text {
            font-size: 18px;
            font-weight: 500;
            color: #409EFF;
            margin-bottom: 8px;
          }

          .loading-subtext {
            font-size: 14px;
            color: #909399;
            margin-bottom: 20px;
          }
        }
      }

      .company-name {
        display: flex;
        align-items: center;
        gap: 8px;

        .company-logo {
          width: 32px;
          height: 32px;
          border-radius: 4px;
          object-fit: contain;
        }

        .name {
          font-weight: 500;
          color: #303133;
        }

        .domain {
          font-size: 12px;
          color: #909399;
        }
      }

      .location {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #606266;

        .el-icon {
          color: #909399;
        }
      }

      .more {
        color: #909399;
        font-size: 12px;
        margin-left: 4px;
      }

      .pagination {
        padding: 20px;
        display: flex;
        justify-content: flex-end;
      }
    }
  }

  .company-detail {
    padding: 20px;
  }

  .add-to-list-dialog {
    .existing-lists {
      margin-bottom: 20px;

      h4 {
        margin-bottom: 12px;
        color: #303133;
      }

      .list-radio-group {
        width: 100%;

        .list-radio-item {
          display: block;
          margin-bottom: 12px;
          padding: 12px;
          border: 1px solid #e4e7ed;
          border-radius: 4px;
          width: 100%;

          &:hover {
            border-color: $primary-color;
          }

          .list-info {
            display: flex;
            align-items: center;
            gap: 8px;

            .list-name {
              font-weight: 500;
            }

            .list-count {
              color: #909399;
              font-size: 13px;
            }
          }
        }
      }
    }

    .new-list-section {
      margin-bottom: 20px;

      .create-list-form {
        margin-top: 12px;
        padding: 16px;
        background: #f5f7fa;
        border-radius: 4px;
      }
    }

    .summary {
      margin-top: 20px;
    }
  }
}

// 邮箱对话框样式
.company-info-card {
  margin-bottom: 20px;

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;

    .info-item {
      display: flex;
      align-items: flex-start;

      .label {
        font-weight: 500;
        color: #606266;
        margin-right: 8px;
        min-width: 90px;
        flex-shrink: 0;
      }

      .value {
        color: #303133;
        flex: 1;
        word-break: break-word;
      }

      &.full-width {
        grid-column: span 2;
      }

      &.social-links {
        .links {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
      }

      .tech-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        align-items: center;
      }
    }
  }
}

// 加载动画关键帧
@keyframes loading-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>