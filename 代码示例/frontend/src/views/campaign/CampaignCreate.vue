<template>
  <div class="campaign-create-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <el-button @click="goBack" :icon="ArrowLeft" text>
          返回活动列表
        </el-button>
        <div class="header-info">
          <h1>{{ editingCampaign ? '编辑营销活动' : '创建营销活动' }}</h1>
          <p class="page-desc">创建精准的营销活动，提升客户参与度和转化率</p>
        </div>
      </div>
      <div class="header-actions">
        <el-button @click="saveDraft" :loading="saving">
          保存草稿
        </el-button>
        <el-button @click="previewCampaign" :icon="View">
          预览活动
        </el-button>
        <el-button @click="submitCampaign" type="primary" :loading="submitting">
          {{ editingCampaign ? '更新活动' : '创建活动' }}
        </el-button>
      </div>
    </div>

    <!-- 步骤导航 -->
    <div class="steps-nav">
      <el-steps :active="currentStep" align-center>
        <el-step title="基础信息" description="设置活动基本信息" />
        <el-step title="目标设置" description="定义活动目标和指标" />
        <el-step title="预算配置" description="设置活动预算和成本" />
        <el-step title="模板选择" description="选择活动模板样式" />
        <el-step title="确认提交" description="检查并提交活动" />
      </el-steps>
    </div>

    <!-- 步骤内容 -->
    <div class="steps-content">
      <!-- 步骤1: 基础信息 -->
      <el-card v-show="currentStep === 0" class="step-card">
        <template #header>
          <div class="step-header">
            <h3>基础信息设置</h3>
            <p>设置活动的基本信息和时间安排</p>
          </div>
        </template>

        <el-form :model="campaignForm" :rules="formRules" ref="basicFormRef" label-width="120px">
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="活动名称" prop="name">
                <el-input 
                  v-model="campaignForm.name" 
                  placeholder="请输入活动名称"
                  maxlength="50"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="活动类型" prop="type">
                <el-select v-model="campaignForm.type" placeholder="请选择活动类型">
                  <el-option label="邮件营销" value="email" />
                  <el-option label="社媒推广" value="social" />
                  <el-option label="短信营销" value="sms" />
                  <el-option label="多渠道营销" value="multi-channel" />
                  <el-option label="产品推广" value="product-promotion" />
                  <el-option label="品牌宣传" value="brand-awareness" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="活动标签" prop="tags">
                <el-select 
                  v-model="campaignForm.tags" 
                  multiple 
                  filterable 
                  allow-create
                  placeholder="选择或创建标签"
                >
                  <el-option 
                    v-for="tag in availableTags" 
                    :key="tag.value"
                    :label="tag.label" 
                    :value="tag.value" 
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="优先级" prop="priority">
                <el-radio-group v-model="campaignForm.priority">
                  <el-radio label="low">低优先级</el-radio>
                  <el-radio label="medium">中优先级</el-radio>
                  <el-radio label="high">高优先级</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="开始时间" prop="startTime">
                <el-date-picker
                  v-model="campaignForm.startTime"
                  type="datetime"
                  placeholder="选择开始时间"
                  style="width: 100%;"
                  :disabled-date="(date) => date < new Date()"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="结束时间" prop="endTime">
                <el-date-picker
                  v-model="campaignForm.endTime"
                  type="datetime"
                  placeholder="选择结束时间"
                  style="width: 100%;"
                  :disabled-date="(date) => date < campaignForm.startTime"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="活动描述">
            <el-input 
              v-model="campaignForm.description" 
              type="textarea" 
              :rows="4"
              placeholder="请输入活动描述"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="目标受众">
            <div class="audience-selector">
              <el-radio-group v-model="campaignForm.audienceType" @change="handleAudienceTypeChange">
                <el-radio label="all">全部客户</el-radio>
                <el-radio label="groups">选择分组</el-radio>
                <el-radio label="custom">自定义条件</el-radio>
              </el-radio-group>

              <div v-if="campaignForm.audienceType === 'groups'" class="audience-groups">
                <el-select 
                  v-model="campaignForm.selectedGroups" 
                  multiple 
                  placeholder="选择客户分组"
                  style="width: 100%; margin-top: 12px;"
                >
                  <el-option 
                    v-for="group in customerGroups" 
                    :key="group.id"
                    :label="`${group.name} (${group.customerCount}人)`" 
                    :value="group.id" 
                  />
                </el-select>
              </div>

              <div v-if="campaignForm.audienceType === 'custom'" class="audience-custom">
                <div class="custom-conditions">
                  <div 
                    v-for="(condition, index) in campaignForm.customConditions" 
                    :key="index"
                    class="condition-item"
                  >
                    <el-select v-model="condition.field" placeholder="选择字段">
                      <el-option label="客户状态" value="status" />
                      <el-option label="客户等级" value="level" />
                      <el-option label="注册时间" value="registerTime" />
                      <el-option label="最后活跃" value="lastActive" />
                      <el-option label="总消费" value="totalSpent" />
                      <el-option label="订单数量" value="orderCount" />
                    </el-select>

                    <el-select v-model="condition.operator" placeholder="选择条件">
                      <el-option label="等于" value="equals" />
                      <el-option label="不等于" value="not_equals" />
                      <el-option label="大于" value="greater" />
                      <el-option label="小于" value="less" />
                      <el-option label="包含" value="contains" />
                    </el-select>

                    <el-input 
                      v-model="condition.value" 
                      placeholder="输入值"
                      style="width: 150px;"
                    />

                    <el-button @click="removeCondition(index)" :icon="Delete" size="small" text />
                  </div>

                  <el-button @click="addCondition" :icon="Plus" size="small" text>
                    添加条件
                  </el-button>
                </div>
              </div>

              <div class="audience-preview">
                <el-statistic 
                  title="预计覆盖人数" 
                  :value="estimatedAudience"
                  :value-style="{ color: '#1890ff' }"
                />
              </div>
            </div>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 步骤2: 目标设置 -->
      <el-card v-show="currentStep === 1" class="step-card">
        <template #header>
          <div class="step-header">
            <h3>目标设置</h3>
            <p>设置活动的关键目标和评估指标</p>
          </div>
        </template>

        <el-form :model="campaignForm" label-width="120px">
          <div class="objectives-section">
            <h4>主要目标</h4>
            <el-checkbox-group v-model="campaignForm.objectives">
              <el-row :gutter="16">
                <el-col :span="8">
                  <el-checkbox label="increase_sales">增加销售额</el-checkbox>
                </el-col>
                <el-col :span="8">
                  <el-checkbox label="brand_awareness">提升品牌知名度</el-checkbox>
                </el-col>
                <el-col :span="8">
                  <el-checkbox label="customer_retention">客户留存</el-checkbox>
                </el-col>
              </el-row>
              <el-row :gutter="16">
                <el-col :span="8">
                  <el-checkbox label="lead_generation">潜客获取</el-checkbox>
                </el-col>
                <el-col :span="8">
                  <el-checkbox label="engagement">用户互动</el-checkbox>
                </el-col>
                <el-col :span="8">
                  <el-checkbox label="conversion">转化提升</el-checkbox>
                </el-col>
              </el-row>
            </el-checkbox-group>
          </div>

          <div class="kpis-section">
            <h4>关键指标 (KPI)</h4>
            <el-row :gutter="24">
              <el-col :span="8">
                <el-form-item label="目标点击率">
                  <el-input-number
                    v-model="campaignForm.kpis.clickRate"
                    :min="0"
                    :max="100"
                    :step="0.1"
                    :precision="1"
                    style="width: 100%;"
                  />
                  <span class="input-suffix">%</span>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="目标转化率">
                  <el-input-number
                    v-model="campaignForm.kpis.conversionRate"
                    :min="0"
                    :max="100"
                    :step="0.1"
                    :precision="1"
                    style="width: 100%;"
                  />
                  <span class="input-suffix">%</span>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="目标ROI">
                  <el-input-number
                    v-model="campaignForm.kpis.roi"
                    :min="0"
                    :step="0.1"
                    :precision="1"
                    style="width: 100%;"
                  />
                  <span class="input-suffix">x</span>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :span="8">
                <el-form-item label="目标销售额">
                  <el-input-number
                    v-model="campaignForm.kpis.targetRevenue"
                    :min="0"
                    :step="1000"
                    style="width: 100%;"
                  />
                  <span class="input-suffix">USD</span>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="目标新客户">
                  <el-input-number
                    v-model="campaignForm.kpis.newCustomers"
                    :min="0"
                    style="width: 100%;"
                  />
                  <span class="input-suffix">人</span>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="目标互动数">
                  <el-input-number
                    v-model="campaignForm.kpis.engagements"
                    :min="0"
                    style="width: 100%;"
                  />
                  <span class="input-suffix">次</span>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <div class="success-criteria-section">
            <h4>成功标准</h4>
            <div class="success-criteria">
              <div 
                v-for="(criteria, index) in campaignForm.successCriteria" 
                :key="index"
                class="criteria-item"
              >
                <el-select v-model="criteria.metric" placeholder="选择指标">
                  <el-option label="点击率" value="click_rate" />
                  <el-option label="转化率" value="conversion_rate" />
                  <el-option label="ROI" value="roi" />
                  <el-option label="销售额" value="revenue" />
                  <el-option label="新客户数" value="new_customers" />
                </el-select>

                <el-select v-model="criteria.comparison" placeholder="比较方式">
                  <el-option label="大于" value="greater" />
                  <el-option label="大于等于" value="greater_equal" />
                  <el-option label="等于" value="equals" />
                  <el-option label="小于等于" value="less_equal" />
                  <el-option label="小于" value="less" />
                </el-select>

                <el-input 
                  v-model="criteria.target" 
                  placeholder="目标值"
                  style="width: 120px;"
                />

                <el-button @click="removeCriteria(index)" :icon="Delete" size="small" text />
              </div>

              <el-button @click="addCriteria" :icon="Plus" size="small" text>
                添加成功标准
              </el-button>
            </div>
          </div>
        </el-form>
      </el-card>

      <!-- 步骤3: 预算配置 -->
      <el-card v-show="currentStep === 2" class="step-card">
        <template #header>
          <div class="step-header">
            <h3>预算配置</h3>
            <p>设置活动预算和成本分配</p>
          </div>
        </template>

        <el-form :model="campaignForm" label-width="120px">
          <div class="budget-overview">
            <el-row :gutter="24">
              <el-col :span="8">
                <el-card class="budget-card">
                  <el-statistic 
                    title="总预算" 
                    :value="campaignForm.budget.total"
                    prefix="$"
                    :value-style="{ color: '#1890ff' }"
                  />
                </el-statistic>
              </el-col>
              <el-col :span="8">
                <el-card class="budget-card">
                  <el-statistic 
                    title="已分配预算" 
                    :value="allocatedBudget"
                    prefix="$"
                    :value-style="{ color: '#52c41a' }"
                  />
                </el-statistic>
              </el-col>
              <el-col :span="8">
                <el-card class="budget-card">
                  <el-statistic 
                    title="剩余预算" 
                    :value="remainingBudget"
                    prefix="$"
                    :value-style="{ color: remainingBudget >= 0 ? '#52c41a' : '#f5222d' }"
                  />
                </el-statistic>
              </el-col>
            </el-row>
          </div>

          <div class="budget-settings">
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="总预算" prop="budget.total">
                  <el-input-number
                    v-model="campaignForm.budget.total"
                    :min="0"
                    :step="100"
                    style="width: 100%;"
                  />
                  <span class="input-suffix">USD</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="预算类型">
                  <el-radio-group v-model="campaignForm.budget.type">
                    <el-radio label="fixed">固定预算</el-radio>
                    <el-radio label="daily">每日预算</el-radio>
                    <el-radio label="flexible">弹性预算</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <div class="budget-allocation">
            <h4>预算分配</h4>
            <div class="allocation-items">
              <div class="allocation-item">
                <div class="item-header">
                  <span class="item-name">内容制作</span>
                  <span class="item-percentage">{{ getPercentage(campaignForm.budget.contentCreation, campaignForm.budget.total) }}%</span>
                </div>
                <el-slider
                  v-model="campaignForm.budget.contentCreation"
                  :max="campaignForm.budget.total"
                  :step="50"
                  show-input
                />
              </div>

              <div class="allocation-item">
                <div class="item-header">
                  <span class="item-name">广告投放</span>
                  <span class="item-percentage">{{ getPercentage(campaignForm.budget.advertising, campaignForm.budget.total) }}%</span>
                </div>
                <el-slider
                  v-model="campaignForm.budget.advertising"
                  :max="campaignForm.budget.total"
                  :step="50"
                  show-input
                />
              </div>

              <div class="allocation-item">
                <div class="item-header">
                  <span class="item-name">人力成本</span>
                  <span class="item-percentage">{{ getPercentage(campaignForm.budget.personnel, campaignForm.budget.total) }}%</span>
                </div>
                <el-slider
                  v-model="campaignForm.budget.personnel"
                  :max="campaignForm.budget.total"
                  :step="50"
                  show-input
                />
              </div>

              <div class="allocation-item">
                <div class="item-header">
                  <span class="item-name">工具平台</span>
                  <span class="item-percentage">{{ getPercentage(campaignForm.budget.tools, campaignForm.budget.total) }}%</span>
                </div>
                <el-slider
                  v-model="campaignForm.budget.tools"
                  :max="campaignForm.budget.total"
                  :step="50"
                  show-input
                />
              </div>

              <div class="allocation-item">
                <div class="item-header">
                  <span class="item-name">其他费用</span>
                  <span class="item-percentage">{{ getPercentage(campaignForm.budget.others, campaignForm.budget.total) }}%</span>
                </div>
                <el-slider
                  v-model="campaignForm.budget.others"
                  :max="campaignForm.budget.total"
                  :step="50"
                  show-input
                />
              </div>
            </div>
          </div>

          <div class="cost-tracking">
            <h4>成本追踪设置</h4>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="成本跟踪">
                  <el-switch 
                    v-model="campaignForm.costTracking.enabled"
                    active-text="开启"
                    inactive-text="关闭"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="预算提醒">
                  <el-input-number
                    v-model="campaignForm.costTracking.alertThreshold"
                    :min="50"
                    :max="100"
                    :step="5"
                    style="width: 120px;"
                  />
                  <span class="input-suffix">% 时提醒</span>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-form>
      </el-card>

      <!-- 步骤4: 模板选择 -->
      <el-card v-show="currentStep === 3" class="step-card">
        <template #header>
          <div class="step-header">
            <h3>活动模板</h3>
            <p>选择适合的模板样式和设计风格</p>
          </div>
        </template>

        <div class="template-selection">
          <!-- 模板分类 -->
          <div class="template-categories">
            <el-radio-group v-model="selectedTemplateCategory" @change="filterTemplates">
              <el-radio-button label="all">全部模板</el-radio-button>
              <el-radio-button label="email">邮件模板</el-radio-button>
              <el-radio-button label="social">社媒模板</el-radio-button>
              <el-radio-button label="landing">落地页</el-radio-button>
              <el-radio-button label="banner">横幅广告</el-radio-button>
            </el-radio-group>
          </div>

          <!-- 模板网格 -->
          <div class="template-grid">
            <div 
              v-for="template in filteredTemplates" 
              :key="template.id"
              :class="['template-item', { active: campaignForm.selectedTemplate === template.id }]"
              @click="selectTemplate(template)"
            >
              <div class="template-preview">
                <img :src="template.preview" :alt="template.name" />
                <div class="template-overlay">
                  <el-button @click.stop="previewTemplate(template)" :icon="View" circle />
                </div>
              </div>
              <div class="template-info">
                <h4 class="template-name">{{ template.name }}</h4>
                <p class="template-desc">{{ template.description }}</p>
                <div class="template-meta">
                  <el-tag size="small" :type="getTemplateTypeColor(template.type)">
                    {{ template.type }}
                  </el-tag>
                  <el-rate :value="template.rating" disabled size="small" />
                </div>
              </div>
            </div>
          </div>

          <!-- 自定义模板 -->
          <div class="custom-template-section">
            <h4>或者创建自定义模板</h4>
            <el-button @click="createCustomTemplate" :icon="Plus" type="dashed" block>
              创建自定义模板
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 步骤5: 确认提交 -->
      <el-card v-show="currentStep === 4" class="step-card">
        <template #header>
          <div class="step-header">
            <h3>确认提交</h3>
            <p>检查活动配置信息，确认无误后提交</p>
          </div>
        </template>

        <div class="confirmation-summary">
          <!-- 基础信息摘要 -->
          <div class="summary-section">
            <h4>基础信息</h4>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="活动名称">{{ campaignForm.name }}</el-descriptions-item>
              <el-descriptions-item label="活动类型">{{ getTypeLabel(campaignForm.type) }}</el-descriptions-item>
              <el-descriptions-item label="开始时间">{{ formatDateTime(campaignForm.startTime) }}</el-descriptions-item>
              <el-descriptions-item label="结束时间">{{ formatDateTime(campaignForm.endTime) }}</el-descriptions-item>
              <el-descriptions-item label="目标受众">{{ getAudienceDescription() }}</el-descriptions-item>
              <el-descriptions-item label="优先级">{{ getPriorityLabel(campaignForm.priority) }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 目标和预算摘要 -->
          <div class="summary-section">
            <h4>目标与预算</h4>
            <el-row :gutter="24">
              <el-col :span="12">
                <div class="summary-card">
                  <h5>主要目标</h5>
                  <div class="objectives-list">
                    <el-tag 
                      v-for="obj in campaignForm.objectives" 
                      :key="obj"
                      class="objective-tag"
                    >
                      {{ getObjectiveLabel(obj) }}
                    </el-tag>
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="summary-card">
                  <h5>预算分配</h5>
                  <div class="budget-summary">
                    <div class="budget-item">
                      <span>总预算:</span>
                      <span class="budget-value">${{ campaignForm.budget.total }}</span>
                    </div>
                    <div class="budget-breakdown">
                      <div class="breakdown-item">内容制作: ${{ campaignForm.budget.contentCreation }}</div>
                      <div class="breakdown-item">广告投放: ${{ campaignForm.budget.advertising }}</div>
                      <div class="breakdown-item">人力成本: ${{ campaignForm.budget.personnel }}</div>
                    </div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 最终检查清单 -->
          <div class="summary-section">
            <h4>提交前检查</h4>
            <el-checkbox-group v-model="submissionChecklist">
              <el-row>
                <el-col :span="24">
                  <el-checkbox label="basic_info">已确认基础信息设置无误</el-checkbox>
                </el-col>
                <el-col :span="24">
                  <el-checkbox label="audience">已确认目标受众选择正确</el-checkbox>
                </el-col>
                <el-col :span="24">
                  <el-checkbox label="budget">已确认预算分配合理</el-checkbox>
                </el-col>
                <el-col :span="24">
                  <el-checkbox label="timeline">已确认活动时间安排</el-checkbox>
                </el-col>
                <el-col :span="24">
                  <el-checkbox label="approval">已获得相关负责人审批</el-checkbox>
                </el-col>
              </el-row>
            </el-checkbox-group>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 步骤导航按钮 -->
    <div class="steps-navigation">
      <el-button @click="prevStep" :disabled="currentStep === 0" :icon="ArrowLeft">
        上一步
      </el-button>
      <el-button @click="nextStep" v-if="currentStep < 4" type="primary" :icon="ArrowRight">
        下一步
      </el-button>
      <el-button 
        @click="submitCampaign" 
        v-if="currentStep === 4"
        type="primary" 
        :loading="submitting"
        :disabled="!canSubmit"
      >
        {{ editingCampaign ? '更新活动' : '创建活动' }}
      </el-button>
    </div>

    <!-- 模板预览对话框 -->
    <el-dialog v-model="showTemplatePreview" title="模板预览" width="80%" destroy-on-close>
      <div class="template-preview-content" v-if="previewingTemplate">
        <img :src="previewingTemplate.fullPreview" :alt="previewingTemplate.name" style="width: 100%;" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft, ArrowRight, View, Plus, Delete
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 页面状态
const currentStep = ref(0)
const saving = ref(false)
const submitting = ref(false)
const editingCampaign = ref(null)
const showTemplatePreview = ref(false)
const previewingTemplate = ref(null)
const selectedTemplateCategory = ref('all')
const submissionChecklist = ref([])

// 可选数据
const availableTags = ref([
  { label: '夏季促销', value: 'summer-sale' },
  { label: '新品发布', value: 'new-product' },
  { label: '品牌宣传', value: 'brand-awareness' },
  { label: '客户回馈', value: 'customer-feedback' }
])

const customerGroups = ref([
  { id: 1, name: 'VIP客户', customerCount: 156 },
  { id: 2, name: '高价值客户', customerCount: 89 },
  { id: 3, name: '新注册用户', customerCount: 234 }
])

const campaignTemplates = ref([
  {
    id: 1,
    name: '简洁邮件模板',
    type: 'email',
    category: 'email',
    description: '简洁大方的邮件营销模板',
    preview: 'https://via.placeholder.com/300x200?text=Email+Template',
    fullPreview: 'https://via.placeholder.com/800x600?text=Full+Email+Preview',
    rating: 4.5
  },
  {
    id: 2,
    name: '社媒宣传模板',
    type: 'social',
    category: 'social',
    description: '适合社交媒体推广的视觉模板',
    preview: 'https://via.placeholder.com/300x200?text=Social+Template',
    fullPreview: 'https://via.placeholder.com/800x600?text=Full+Social+Preview',
    rating: 4.8
  },
  {
    id: 3,
    name: '产品落地页',
    type: 'landing',
    category: 'landing',
    description: '高转化率的产品落地页模板',
    preview: 'https://via.placeholder.com/300x200?text=Landing+Page',
    fullPreview: 'https://via.placeholder.com/800x600?text=Full+Landing+Preview',
    rating: 4.2
  }
])

// 表单数据
const campaignForm = reactive({
  name: '',
  type: '',
  tags: [],
  priority: 'medium',
  startTime: null,
  endTime: null,
  description: '',
  audienceType: 'all',
  selectedGroups: [],
  customConditions: [],
  objectives: [],
  kpis: {
    clickRate: 5.0,
    conversionRate: 2.0,
    roi: 3.0,
    targetRevenue: 100000,
    newCustomers: 500,
    engagements: 1000
  },
  successCriteria: [],
  budget: {
    total: 10000,
    type: 'fixed',
    contentCreation: 2000,
    advertising: 5000,
    personnel: 2000,
    tools: 500,
    others: 500
  },
  costTracking: {
    enabled: true,
    alertThreshold: 80
  },
  selectedTemplate: null
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入活动名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择活动类型', trigger: 'change' }
  ],
  startTime: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  endTime: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ]
}

// 计算属性
const estimatedAudience = computed(() => {
  if (campaignForm.audienceType === 'all') {
    return 1248
  } else if (campaignForm.audienceType === 'groups') {
    return customerGroups.value
      .filter(g => campaignForm.selectedGroups.includes(g.id))
      .reduce((sum, g) => sum + g.customerCount, 0)
  } else {
    return Math.floor(Math.random() * 500) + 100
  }
})

const allocatedBudget = computed(() => {
  return campaignForm.budget.contentCreation + 
         campaignForm.budget.advertising + 
         campaignForm.budget.personnel + 
         campaignForm.budget.tools + 
         campaignForm.budget.others
})

const remainingBudget = computed(() => {
  return campaignForm.budget.total - allocatedBudget.value
})

const filteredTemplates = computed(() => {
  if (selectedTemplateCategory.value === 'all') {
    return campaignTemplates.value
  }
  return campaignTemplates.value.filter(t => t.category === selectedTemplateCategory.value)
})

const canSubmit = computed(() => {
  return submissionChecklist.value.length >= 4
})

// 方法
const goBack = () => {
  router.push('/campaign/list')
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const nextStep = async () => {
  if (currentStep.value === 0) {
    // 验证基础信息
    const basicFormRef = document.querySelector('[ref="basicFormRef"]')
    // 这里应该添加表单验证逻辑
  }
  
  if (currentStep.value < 4) {
    currentStep.value++
  }
}

const handleAudienceTypeChange = (type) => {
  if (type === 'custom' && campaignForm.customConditions.length === 0) {
    addCondition()
  }
}

const addCondition = () => {
  campaignForm.customConditions.push({
    field: '',
    operator: '',
    value: ''
  })
}

const removeCondition = (index) => {
  campaignForm.customConditions.splice(index, 1)
}

const addCriteria = () => {
  campaignForm.successCriteria.push({
    metric: '',
    comparison: '',
    target: ''
  })
}

const removeCriteria = (index) => {
  campaignForm.successCriteria.splice(index, 1)
}

const getPercentage = (value, total) => {
  return total > 0 ? Math.round((value / total) * 100) : 0
}

const filterTemplates = () => {
  // 模板筛选逻辑已在 computed 中处理
}

const selectTemplate = (template) => {
  campaignForm.selectedTemplate = template.id
}

const previewTemplate = (template) => {
  previewingTemplate.value = template
  showTemplatePreview.value = true
}

const createCustomTemplate = () => {
  ElMessage.info('跳转到自定义模板编辑器')
}

const getTemplateTypeColor = (type) => {
  const colors = {
    'email': 'primary',
    'social': 'success',
    'landing': 'warning',
    'banner': 'info'
  }
  return colors[type] || 'default'
}

const saveDraft = async () => {
  saving.value = true
  try {
    // 模拟保存草稿
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('草稿保存成功')
  } catch (error) {
    ElMessage.error('保存草稿失败')
  } finally {
    saving.value = false
  }
}

const previewCampaign = () => {
  ElMessage.info('打开活动预览')
}

const submitCampaign = async () => {
  if (currentStep.value === 4 && !canSubmit.value) {
    ElMessage.warning('请完成提交前检查')
    return
  }

  submitting.value = true
  try {
    // 模拟提交
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const action = editingCampaign.value ? '更新' : '创建'
    ElMessage.success(`活动${action}成功`)
    
    if (editingCampaign.value) {
      // 如果是编辑模式，返回列表页
      router.push('/campaign/list')
    } else {
      // 如果是新建模式，跳转到客户选择页面
      ElMessage.info('正在跳转到客户选择页面...')
      setTimeout(() => {
        router.push('/campaign/customer-selection')
      }, 1000)
    }
  } catch (error) {
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}

// 辅助方法
const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

const getTypeLabel = (type) => {
  const labels = {
    'email': '邮件营销',
    'social': '社媒推广',
    'sms': '短信营销',
    'multi-channel': '多渠道营销',
    'product-promotion': '产品推广',
    'brand-awareness': '品牌宣传'
  }
  return labels[type] || type
}

const getPriorityLabel = (priority) => {
  const labels = {
    'low': '低优先级',
    'medium': '中优先级',
    'high': '高优先级'
  }
  return labels[priority] || priority
}

const getObjectiveLabel = (objective) => {
  const labels = {
    'increase_sales': '增加销售额',
    'brand_awareness': '提升品牌知名度',
    'customer_retention': '客户留存',
    'lead_generation': '潜客获取',
    'engagement': '用户互动',
    'conversion': '转化提升'
  }
  return labels[objective] || objective
}

const getAudienceDescription = () => {
  if (campaignForm.audienceType === 'all') {
    return '全部客户'
  } else if (campaignForm.audienceType === 'groups') {
    const count = campaignForm.selectedGroups.length
    return `已选择${count}个分组`
  } else {
    return '自定义条件筛选'
  }
}

onMounted(() => {
  // 如果是编辑模式，加载现有活动数据
  if (route.params.id && route.params.id !== 'create') {
    editingCampaign.value = route.params.id
    // 加载活动数据
  }
  
  // 初始化成功标准
  addCriteria()
})
</script>

<style lang="scss" scoped>
.campaign-create-page {
  padding: 20px;
  background-color: #f5f7fa;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  
  .header-left {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    
    .header-info {
      h1 {
        font-size: 24px;
        font-weight: 600;
        color: #303133;
        margin: 0 0 8px 0;
      }
      
      .page-desc {
        color: #606266;
        font-size: 14px;
        margin: 0;
      }
    }
  }
  
  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.steps-nav {
  margin-bottom: 32px;
  
  :deep(.el-steps) {
    .el-step__title {
      font-size: 14px;
      font-weight: 500;
    }
  }
}

.steps-content {
  .step-card {
    margin-bottom: 24px;
    min-height: 500px;
    
    .step-header {
      h3 {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
        margin: 0 0 8px 0;
      }
      
      p {
        color: #606266;
        font-size: 14px;
        margin: 0;
      }
    }
  }
}

.audience-selector {
  .audience-groups,
  .audience-custom {
    margin-top: 16px;
  }
  
  .custom-conditions {
    .condition-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
  }
  
  .audience-preview {
    margin-top: 16px;
    padding: 16px;
    background-color: #f0f9ff;
    border-radius: 6px;
  }
}

.objectives-section,
.kpis-section,
.success-criteria-section {
  margin-bottom: 32px;
  
  h4 {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 16px 0;
  }
}

.input-suffix {
  margin-left: 8px;
  color: #909399;
  font-size: 14px;
}

.success-criteria {
  .criteria-item {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }
}

.budget-overview {
  margin-bottom: 32px;
  
  .budget-card {
    text-align: center;
  }
}

.allocation-items {
  .allocation-item {
    margin-bottom: 24px;
    
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      
      .item-name {
        font-weight: 500;
        color: #303133;
      }
      
      .item-percentage {
        color: #409eff;
        font-weight: 600;
      }
    }
  }
}

.template-selection {
  .template-categories {
    margin-bottom: 24px;
  }
  
  .template-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
    
    .template-item {
      border: 2px solid #e4e7ed;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        border-color: #409eff;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
      }
      
      &.active {
        border-color: #409eff;
        box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
      }
      
      .template-preview {
        position: relative;
        height: 200px;
        overflow: hidden;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .template-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s;
          
          .el-button {
            background-color: rgba(255, 255, 255, 0.9);
          }
        }
        
        &:hover .template-overlay {
          opacity: 1;
        }
      }
      
      .template-info {
        padding: 16px;
        
        .template-name {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
          margin: 0 0 8px 0;
        }
        
        .template-desc {
          font-size: 14px;
          color: #606266;
          margin: 0 0 12px 0;
          line-height: 1.4;
        }
        
        .template-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      }
    }
  }
  
  .custom-template-section {
    h4 {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 16px 0;
    }
  }
}

.confirmation-summary {
  .summary-section {
    margin-bottom: 32px;
    
    h4 {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 16px 0;
    }
    
    .summary-card {
      padding: 16px;
      background-color: #fafafa;
      border-radius: 6px;
      
      h5 {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
        margin: 0 0 12px 0;
      }
      
      .objectives-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        
        .objective-tag {
          margin-bottom: 8px;
        }
      }
      
      .budget-summary {
        .budget-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          
          .budget-value {
            font-size: 18px;
            font-weight: 600;
            color: #1890ff;
          }
        }
        
        .budget-breakdown {
          .breakdown-item {
            font-size: 14px;
            color: #606266;
            margin-bottom: 4px;
          }
        }
      }
    }
  }
}

.steps-navigation {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 24px 0;
  border-top: 1px solid #e4e7ed;
  background-color: white;
}

.template-preview-content {
  text-align: center;
}

@media (max-width: 768px) {
  .campaign-create-page {
    padding: 12px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    
    .header-actions {
      width: 100%;
      justify-content: flex-start;
    }
  }
  
  .template-grid {
    grid-template-columns: 1fr !important;
  }
  
  .steps-navigation {
    flex-direction: column;
  }
}
</style>