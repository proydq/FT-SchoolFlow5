<template>
  <div class="create-campaign-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>创建活动</h1>
        <div class="header-actions">
          <el-button @click="saveDraft" :icon="Document">保存草稿</el-button>
          <el-button @click="previewCampaign" :icon="View">预览</el-button>
          <el-button type="primary" @click="createCampaign" :icon="Check">创建活动</el-button>
        </div>
      </div>
      
      <!-- 步骤指示器 -->
      <div class="steps-container">
        <el-steps :active="currentStep" finish-status="success">
          <el-step title="基本信息" description="设置活动基本信息" />
          <el-step title="目标客户" description="选择目标客户群体" />
          <el-step title="内容配置" description="配置活动内容" />
          <el-step title="渠道设置" description="选择发送渠道" />
          <el-step title="时间设置" description="设置发送时间" />
        </el-steps>
      </div>
    </div>

    <!-- 表单内容 -->
    <div class="form-container">
      <el-form
        ref="campaignFormRef"
        :model="campaignForm"
        :rules="formRules"
        label-width="120px"
        size="large"
      >
        <!-- 步骤1: 基本信息 -->
        <el-card v-show="currentStep === 0" class="step-card">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
              <el-tag type="primary">步骤 1/5</el-tag>
            </div>
          </template>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="活动名称" prop="name" required>
                <el-input
                  v-model="campaignForm.name"
                  placeholder="请输入活动名称"
                  maxlength="50"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="活动类型" prop="type" required>
                <el-select v-model="campaignForm.type" placeholder="选择活动类型">
                  <el-option label="促销活动" value="promotion" />
                  <el-option label="新品发布" value="launch" />
                  <el-option label="节日营销" value="holiday" />
                  <el-option label="会员关怀" value="member" />
                  <el-option label="内容营销" value="content" />
                  <el-option label="客户召回" value="retention" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="活动描述" prop="description">
                <el-input
                  v-model="campaignForm.description"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入活动描述"
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="活动标签">
                <el-select
                  v-model="campaignForm.tags"
                  multiple
                  placeholder="选择标签"
                  style="width: 100%"
                >
                  <el-option label="热门" value="hot" />
                  <el-option label="限时" value="limited" />
                  <el-option label="VIP专享" value="vip" />
                  <el-option label="新客专属" value="newbie" />
                  <el-option label="复购优惠" value="repeat" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="优先级">
                <el-select v-model="campaignForm.priority" placeholder="选择优先级">
                  <el-option label="低" value="low" />
                  <el-option label="中" value="medium" />
                  <el-option label="高" value="high" />
                  <el-option label="紧急" value="urgent" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="活动预算">
                <el-input-number
                  v-model="campaignForm.budget"
                  placeholder="设置预算"
                  :min="0"
                  :precision="2"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <!-- 步骤2: 目标客户 -->
        <el-card v-show="currentStep === 1" class="step-card">
          <template #header>
            <div class="card-header">
              <span>目标客户</span>
              <el-tag type="primary">步骤 2/5</el-tag>
            </div>
          </template>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="选择方式" prop="targetType" required>
                <el-radio-group v-model="campaignForm.targetType">
                  <el-radio value="all">全部客户</el-radio>
                  <el-radio value="group">客户分组</el-radio>
                  <el-radio value="condition">条件筛选</el-radio>
                  <el-radio value="manual">手动选择</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="预估触达">
                <div class="reach-estimate">
                  <span class="reach-number">{{ estimatedReach.toLocaleString() }}</span>
                  <span class="reach-unit">人</span>
                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 客户分组选择 -->
          <div v-if="campaignForm.targetType === 'group'">
            <el-form-item label="选择分组">
              <el-select
                v-model="campaignForm.selectedGroups"
                multiple
                placeholder="选择客户分组"
                style="width: 100%"
              >
                <el-option
                  v-for="group in customerGroups"
                  :key="group.id"
                  :label="`${group.name} (${group.count}人)`"
                  :value="group.id"
                />
              </el-select>
            </el-form-item>
          </div>

          <!-- 条件筛选 -->
          <div v-if="campaignForm.targetType === 'condition'">
            <el-row :gutter="24">
              <el-col :span="8">
                <el-form-item label="注册时间">
                  <el-date-picker
                    v-model="campaignForm.filters.registerDateRange"
                    type="daterange"
                    placeholder="选择注册时间范围"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="消费金额">
                  <el-input-number
                    v-model="campaignForm.filters.minAmount"
                    placeholder="最小消费金额"
                    :min="0"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="活跃状态">
                  <el-select v-model="campaignForm.filters.activeStatus" placeholder="选择活跃状态">
                    <el-option label="活跃用户" value="active" />
                    <el-option label="沉睡用户" value="inactive" />
                    <el-option label="流失用户" value="churned" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item label="地区筛选">
              <el-select
                v-model="campaignForm.filters.regions"
                multiple
                placeholder="选择目标地区"
                style="width: 100%"
              >
                <el-option label="北京" value="beijing" />
                <el-option label="上海" value="shanghai" />
                <el-option label="广州" value="guangzhou" />
                <el-option label="深圳" value="shenzhen" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </div>

          <!-- 排除设置 -->
          <el-form-item label="排除条件">
            <el-checkbox-group v-model="campaignForm.excludeConditions">
              <el-checkbox value="recent_campaign">最近30天接收过活动的客户</el-checkbox>
              <el-checkbox value="blacklist">黑名单客户</el-checkbox>
              <el-checkbox value="unsubscribed">已取消订阅的客户</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-card>

        <!-- 步骤3: 内容配置 -->
        <el-card v-show="currentStep === 2" class="step-card">
          <template #header>
            <div class="card-header">
              <span>内容配置</span>
              <el-tag type="primary">步骤 3/5</el-tag>
            </div>
          </template>

          <el-form-item label="内容模板">
            <el-radio-group v-model="campaignForm.contentType">
              <el-radio value="template">使用模板</el-radio>
              <el-radio value="custom">自定义内容</el-radio>
              <el-radio value="ai">AI生成</el-radio>
            </el-radio-group>
          </el-form-item>

          <!-- 模板选择 -->
          <div v-if="campaignForm.contentType === 'template'">
            <el-form-item label="选择模板">
              <div class="template-grid">
                <div
                  v-for="template in contentTemplates"
                  :key="template.id"
                  class="template-item"
                  :class="{ active: campaignForm.selectedTemplate === template.id }"
                  @click="campaignForm.selectedTemplate = template.id"
                >
                  <img :src="template.thumbnail" :alt="template.name" />
                  <div class="template-info">
                    <h4>{{ template.name }}</h4>
                    <p>{{ template.description }}</p>
                  </div>
                </div>
              </div>
            </el-form-item>
          </div>

          <!-- 自定义内容 -->
          <div v-if="campaignForm.contentType === 'custom'">
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="标题" prop="content.title" required>
                  <el-input
                    v-model="campaignForm.content.title"
                    placeholder="请输入标题"
                    maxlength="50"
                    show-word-limit
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="副标题">
                  <el-input
                    v-model="campaignForm.content.subtitle"
                    placeholder="请输入副标题"
                    maxlength="100"
                    show-word-limit
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="正文内容" prop="content.body" required>
              <el-input
                v-model="campaignForm.content.body"
                type="textarea"
                :rows="6"
                placeholder="请输入正文内容"
                maxlength="1000"
                show-word-limit
              />
            </el-form-item>

            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="按钮文字">
                  <el-input
                    v-model="campaignForm.content.buttonText"
                    placeholder="如：立即购买"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="跳转链接">
                  <el-input
                    v-model="campaignForm.content.buttonUrl"
                    placeholder="请输入链接地址"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="活动图片">
              <el-upload
                class="image-uploader"
                action="#"
                :show-file-list="false"
                :before-upload="beforeImageUpload"
              >
                <img v-if="campaignForm.content.imageUrl" :src="campaignForm.content.imageUrl" class="uploaded-image" />
                <el-icon v-else class="image-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>
          </div>

          <!-- AI生成 -->
          <div v-if="campaignForm.contentType === 'ai'">
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="内容主题">
                  <el-input
                    v-model="campaignForm.aiContent.topic"
                    placeholder="如：春节促销活动"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="语言风格">
                  <el-select v-model="campaignForm.aiContent.style" placeholder="选择语言风格">
                    <el-option label="专业正式" value="formal" />
                    <el-option label="亲切友好" value="friendly" />
                    <el-option label="活泼有趣" value="playful" />
                    <el-option label="简洁明了" value="concise" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="关键信息">
              <el-input
                v-model="campaignForm.aiContent.keyPoints"
                type="textarea"
                :rows="3"
                placeholder="请输入想要突出的关键信息，如优惠力度、产品特点等"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="generateAIContent" :loading="aiLoading">
                <el-icon><MagicStick /></el-icon>
                生成内容
              </el-button>
            </el-form-item>

            <!-- AI生成结果预览 -->
            <div v-if="aiGeneratedContent" class="ai-preview">
              <h4>AI生成内容预览</h4>
              <div class="preview-content">
                <h5>{{ aiGeneratedContent.title }}</h5>
                <p>{{ aiGeneratedContent.body }}</p>
                <el-button size="small">{{ aiGeneratedContent.buttonText }}</el-button>
              </div>
              <div class="preview-actions">
                <el-button @click="regenerateAIContent">重新生成</el-button>
                <el-button type="primary" @click="useAIContent">使用此内容</el-button>
              </div>
            </div>
          </div>

          <!-- 个性化变量 -->
          <el-form-item label="个性化变量">
            <el-checkbox-group v-model="campaignForm.personalizationVars">
              <el-checkbox value="customer_name">客户姓名</el-checkbox>
              <el-checkbox value="customer_level">客户等级</el-checkbox>
              <el-checkbox value="last_purchase">最近购买</el-checkbox>
              <el-checkbox value="points_balance">积分余额</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-card>

        <!-- 步骤4: 渠道设置 -->
        <el-card v-show="currentStep === 3" class="step-card">
          <template #header>
            <div class="card-header">
              <span>渠道设置</span>
              <el-tag type="primary">步骤 4/5</el-tag>
            </div>
          </template>

          <el-form-item label="发送渠道" prop="channels" required>
            <el-checkbox-group v-model="campaignForm.channels">
              <el-checkbox value="email">
                <div class="channel-option">
                  <el-icon><Message /></el-icon>
                  <span>邮件</span>
                </div>
              </el-checkbox>
              <el-checkbox value="sms">
                <div class="channel-option">
                  <el-icon><ChatLineSquare /></el-icon>
                  <span>短信</span>
                </div>
              </el-checkbox>
              <el-checkbox value="whatsapp">
                <div class="channel-option">
                  <el-icon><ChatDotSquare /></el-icon>
                  <span>WhatsApp</span>
                </div>
              </el-checkbox>
              <el-checkbox value="push">
                <div class="channel-option">
                  <el-icon><Bell /></el-icon>
                  <span>推送通知</span>
                </div>
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <!-- 邮件设置 -->
          <div v-if="campaignForm.channels.includes('email')">
            <h4>邮件设置</h4>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="发件人名称">
                  <el-input
                    v-model="campaignForm.emailConfig.senderName"
                    placeholder="如：营销团队"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="发件邮箱">
                  <el-input
                    v-model="campaignForm.emailConfig.senderEmail"
                    placeholder="如：marketing@company.com"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="邮件主题">
              <el-input
                v-model="campaignForm.emailConfig.subject"
                placeholder="请输入邮件主题"
              />
            </el-form-item>
          </div>

          <!-- 短信设置 -->
          <div v-if="campaignForm.channels.includes('sms')">
            <h4>短信设置</h4>
            <el-form-item label="短信签名">
              <el-input
                v-model="campaignForm.smsConfig.signature"
                placeholder="如：【品牌名】"
              />
            </el-form-item>
            <el-form-item label="短信内容">
              <el-input
                v-model="campaignForm.smsConfig.content"
                type="textarea"
                :rows="3"
                placeholder="请输入短信内容，建议控制在70字以内"
                maxlength="70"
                show-word-limit
              />
            </el-form-item>
          </div>

          <!-- 发送优先级 -->
          <el-form-item label="渠道优先级">
            <p class="form-tip">当客户有多个联系方式时，按此顺序发送</p>
            <div class="priority-list">
              <div 
                v-for="(item, index) in channelPriority" 
                :key="item.channel"
                class="priority-item"
              >
                <span class="priority-number">{{ index + 1 }}</span>
                <span>{{ getChannelName(item.channel) }}</span>
                <div class="priority-actions">
                  <el-button 
                    v-if="index > 0"
                    size="small" 
                    text 
                    @click="movePriorityUp(index)"
                  >
                    <el-icon><ArrowUp /></el-icon>
                  </el-button>
                  <el-button 
                    v-if="index < channelPriority.length - 1"
                    size="small" 
                    text 
                    @click="movePriorityDown(index)"
                  >
                    <el-icon><ArrowDown /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </el-form-item>
        </el-card>

        <!-- 步骤5: 时间设置 -->
        <el-card v-show="currentStep === 4" class="step-card">
          <template #header>
            <div class="card-header">
              <span>时间设置</span>
              <el-tag type="primary">步骤 5/5</el-tag>
            </div>
          </template>

          <el-form-item label="发送方式" prop="sendType" required>
            <el-radio-group v-model="campaignForm.sendType">
              <el-radio value="immediate">立即发送</el-radio>
              <el-radio value="scheduled">定时发送</el-radio>
              <el-radio value="triggered">触发发送</el-radio>
            </el-radio-group>
          </el-form-item>

          <!-- 定时发送 -->
          <div v-if="campaignForm.sendType === 'scheduled'">
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="发送日期">
                  <el-date-picker
                    v-model="campaignForm.schedule.date"
                    type="date"
                    placeholder="选择发送日期"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="发送时间">
                  <el-time-picker
                    v-model="campaignForm.schedule.time"
                    placeholder="选择发送时间"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="时区设置">
              <el-select v-model="campaignForm.schedule.timezone" placeholder="选择时区">
                <el-option label="北京时间 (GMT+8)" value="GMT+8" />
                <el-option label="纽约时间 (GMT-5)" value="GMT-5" />
                <el-option label="伦敦时间 (GMT+0)" value="GMT+0" />
              </el-select>
            </el-form-item>
          </div>

          <!-- 触发发送 -->
          <div v-if="campaignForm.sendType === 'triggered'">
            <el-form-item label="触发条件">
              <el-select v-model="campaignForm.trigger.condition" placeholder="选择触发条件">
                <el-option label="注册成功" value="register" />
                <el-option label="首次购买" value="first_purchase" />
                <el-option label="生日当天" value="birthday" />
                <el-option label="订单完成" value="order_complete" />
                <el-option label="购物车遗弃" value="cart_abandon" />
              </el-select>
            </el-form-item>

            <el-form-item label="延迟时间">
              <el-input-number
                v-model="campaignForm.trigger.delay"
                placeholder="延迟时间"
                :min="0"
                style="width: 200px"
              />
              <el-select v-model="campaignForm.trigger.delayUnit" style="width: 120px; margin-left: 10px">
                <el-option label="分钟" value="minutes" />
                <el-option label="小时" value="hours" />
                <el-option label="天" value="days" />
              </el-select>
            </el-form-item>
          </div>

          <!-- 发送频率控制 -->
          <el-form-item label="频率控制">
            <el-checkbox v-model="campaignForm.frequencyControl.enabled">
              启用发送频率控制
            </el-checkbox>
            <div v-if="campaignForm.frequencyControl.enabled" style="margin-top: 10px">
              <span>每个客户</span>
              <el-input-number
                v-model="campaignForm.frequencyControl.maxPerDay"
                :min="1"
                :max="10"
                style="width: 80px; margin: 0 10px"
              />
              <span>天内最多接收</span>
              <el-input-number
                v-model="campaignForm.frequencyControl.maxCount"
                :min="1"
                :max="5"
                style="width: 80px; margin: 0 10px"
              />
              <span>次营销信息</span>
            </div>
          </el-form-item>

          <!-- A/B测试设置 -->
          <el-form-item label="A/B测试">
            <el-checkbox v-model="campaignForm.abTest.enabled">
              启用A/B测试
            </el-checkbox>
            <div v-if="campaignForm.abTest.enabled" style="margin-top: 10px">
              <el-row :gutter="24">
                <el-col :span="8">
                  <span>测试比例：</span>
                  <el-slider
                    v-model="campaignForm.abTest.testRatio"
                    :min="10"
                    :max="50"
                    :step="10"
                    show-stops
                    show-input
                  />
                </el-col>
                <el-col :span="8">
                  <span>测试时长：</span>
                  <el-input-number
                    v-model="campaignForm.abTest.duration"
                    :min="1"
                    :max="7"
                  />
                  <span style="margin-left: 5px">天</span>
                </el-col>
              </el-row>
            </div>
          </el-form-item>
        </el-card>
      </el-form>

      <!-- 步骤导航 -->
      <div class="step-navigation">
        <el-button v-if="currentStep > 0" @click="prevStep">上一步</el-button>
        <el-button v-if="currentStep < 4" type="primary" @click="nextStep">下一步</el-button>
        <el-button v-if="currentStep === 4" type="success" @click="createCampaign">
          创建活动
        </el-button>
      </div>
    </div>

    <!-- 预览对话框 -->
    <el-dialog v-model="previewVisible" title="活动预览" width="80%" top="5vh">
      <div class="campaign-preview">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="活动名称">{{ campaignForm.name }}</el-descriptions-item>
          <el-descriptions-item label="活动类型">{{ getTypeLabel(campaignForm.type) }}</el-descriptions-item>
          <el-descriptions-item label="目标客户">{{ estimatedReach.toLocaleString() }} 人</el-descriptions-item>
          <el-descriptions-item label="发送渠道">{{ getChannelsLabel(campaignForm.channels) }}</el-descriptions-item>
          <el-descriptions-item label="发送方式" :span="2">{{ getSendTypeLabel(campaignForm.sendType) }}</el-descriptions-item>
          <el-descriptions-item label="活动描述" :span="2">{{ campaignForm.description || '暂无描述' }}</el-descriptions-item>
        </el-descriptions>

        <div v-if="campaignForm.contentType === 'custom' && campaignForm.content.title" class="content-preview">
          <h3>内容预览</h3>
          <div class="preview-card">
            <img v-if="campaignForm.content.imageUrl" :src="campaignForm.content.imageUrl" class="preview-image" />
            <h4>{{ campaignForm.content.title }}</h4>
            <h5 v-if="campaignForm.content.subtitle">{{ campaignForm.content.subtitle }}</h5>
            <p>{{ campaignForm.content.body }}</p>
            <el-button v-if="campaignForm.content.buttonText" type="primary">{{ campaignForm.content.buttonText }}</el-button>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Document, View, Check, Plus, MagicStick, Message, 
  ChatLineSquare, ChatDotSquare, Bell, Rank, ArrowUp, ArrowDown
} from '@element-plus/icons-vue'

const router = useRouter()

// 当前步骤
const currentStep = ref(0)
const previewVisible = ref(false)
const aiLoading = ref(false)

// 表单引用
const campaignFormRef = ref()

// 表单数据
const campaignForm = reactive({
  // 基本信息
  name: '',
  type: '',
  description: '',
  tags: [],
  priority: 'medium',
  budget: 0,
  
  // 目标客户
  targetType: 'all',
  selectedGroups: [],
  filters: {
    registerDateRange: [],
    minAmount: 0,
    activeStatus: '',
    regions: []
  },
  excludeConditions: [],
  
  // 内容配置
  contentType: 'custom',
  selectedTemplate: '',
  content: {
    title: '',
    subtitle: '',
    body: '',
    buttonText: '',
    buttonUrl: '',
    imageUrl: ''
  },
  aiContent: {
    topic: '',
    style: 'friendly',
    keyPoints: ''
  },
  personalizationVars: [],
  
  // 渠道设置
  channels: ['email'],
  emailConfig: {
    senderName: '',
    senderEmail: '',
    subject: ''
  },
  smsConfig: {
    signature: '',
    content: ''
  },
  
  // 时间设置
  sendType: 'immediate',
  schedule: {
    date: '',
    time: '',
    timezone: 'GMT+8'
  },
  trigger: {
    condition: '',
    delay: 0,
    delayUnit: 'hours'
  },
  frequencyControl: {
    enabled: false,
    maxPerDay: 1,
    maxCount: 1
  },
  abTest: {
    enabled: false,
    testRatio: 20,
    duration: 3
  }
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入活动名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择活动类型', trigger: 'change' }
  ],
  targetType: [
    { required: true, message: '请选择目标客户类型', trigger: 'change' }
  ],
  'content.title': [
    { required: true, message: '请输入标题', trigger: 'blur' }
  ],
  'content.body': [
    { required: true, message: '请输入正文内容', trigger: 'blur' }
  ],
  channels: [
    { required: true, type: 'array', min: 1, message: '请选择至少一个发送渠道', trigger: 'change' }
  ],
  sendType: [
    { required: true, message: '请选择发送方式', trigger: 'change' }
  ]
}

// 模拟数据
const customerGroups = ref([
  { id: 1, name: 'VIP客户', count: 1258 },
  { id: 2, name: '新注册用户', count: 3456 },
  { id: 3, name: '活跃用户', count: 8921 },
  { id: 4, name: '沉睡用户', count: 2341 }
])

const contentTemplates = ref([
  {
    id: 1,
    name: '促销模板',
    description: '适用于促销活动的模板',
    thumbnail: 'https://via.placeholder.com/200x150/FF6B6B/ffffff?text=Promotion'
  },
  {
    id: 2,
    name: '节日模板',
    description: '节日营销活动模板',
    thumbnail: 'https://via.placeholder.com/200x150/4ECDC4/ffffff?text=Holiday'
  }
])

const channelPriority = ref([
  { channel: 'email', name: '邮件' },
  { channel: 'sms', name: '短信' },
  { channel: 'whatsapp', name: 'WhatsApp' },
  { channel: 'push', name: '推送通知' }
])

const aiGeneratedContent = ref(null)

// 计算属性
const estimatedReach = computed(() => {
  if (campaignForm.targetType === 'all') return 15680
  if (campaignForm.targetType === 'group') {
    return campaignForm.selectedGroups.reduce((total, groupId) => {
      const group = customerGroups.value.find(g => g.id === groupId)
      return total + (group ? group.count : 0)
    }, 0)
  }
  return 8500 // 模拟条件筛选结果
})

// 方法
const nextStep = () => {
  if (currentStep.value < 4) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const saveDraft = () => {
  ElMessage.success('草稿已保存')
}

const previewCampaign = () => {
  previewVisible.value = true
}

const createCampaign = async () => {
  try {
    await campaignFormRef.value.validate()
    
    ElMessageBox.confirm(
      '确定要创建此活动吗？创建后将按设置的时间发送。',
      '确认创建',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      ElMessage.success('活动创建成功！')
      router.push('/campaign/list')
    })
  } catch (error) {
    ElMessage.error('请完善必填信息')
  }
}

const generateAIContent = () => {
  aiLoading.value = true
  
  // 模拟AI生成
  setTimeout(() => {
    aiGeneratedContent.value = {
      title: `${campaignForm.aiContent.topic} - 限时优惠`,
      body: `亲爱的客户，我们为您准备了特别的${campaignForm.aiContent.topic}活动！现在购买可享受8折优惠，数量有限，先到先得。这是您不容错过的绝佳机会，快来抢购吧！`,
      buttonText: '立即抢购'
    }
    aiLoading.value = false
  }, 2000)
}

const regenerateAIContent = () => {
  generateAIContent()
}

const useAIContent = () => {
  if (aiGeneratedContent.value) {
    campaignForm.content.title = aiGeneratedContent.value.title
    campaignForm.content.body = aiGeneratedContent.value.body
    campaignForm.content.buttonText = aiGeneratedContent.value.buttonText
    campaignForm.contentType = 'custom'
    ElMessage.success('AI内容已应用到自定义内容中')
  }
}

const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  
  // 模拟上传成功
  const reader = new FileReader()
  reader.onload = (e) => {
    campaignForm.content.imageUrl = e.target.result
  }
  reader.readAsDataURL(file)
  
  return false // 阻止自动上传
}

const getChannelName = (channel) => {
  const map = {
    email: '邮件',
    sms: '短信',
    whatsapp: 'WhatsApp',
    push: '推送通知'
  }
  return map[channel] || channel
}

const getTypeLabel = (type) => {
  const map = {
    promotion: '促销活动',
    launch: '新品发布',
    holiday: '节日营销',
    member: '会员关怀',
    content: '内容营销',
    retention: '客户召回'
  }
  return map[type] || type
}

const getChannelsLabel = (channels) => {
  return channels.map(channel => getChannelName(channel)).join('、')
}

const getSendTypeLabel = (sendType) => {
  const map = {
    immediate: '立即发送',
    scheduled: '定时发送',
    triggered: '触发发送'
  }
  return map[sendType] || sendType
}

const movePriorityUp = (index) => {
  if (index > 0) {
    const temp = channelPriority.value[index]
    channelPriority.value[index] = channelPriority.value[index - 1]
    channelPriority.value[index - 1] = temp
  }
}

const movePriorityDown = (index) => {
  if (index < channelPriority.value.length - 1) {
    const temp = channelPriority.value[index]
    channelPriority.value[index] = channelPriority.value[index + 1]
    channelPriority.value[index + 1] = temp
  }
}
</script>

<style scoped lang="scss">
@use "@/assets/styles/variables.scss" as *;

.create-campaign-page {
  padding: $spacing-lg;
  background: #f5f7fa;
  min-height: 100vh;

  .page-header {
    margin-bottom: $spacing-lg;
    background: white;
    padding: $spacing-lg;
    border-radius: $border-radius-lg;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: $spacing-lg;

      h1 {
        font-size: 24px;
        margin: 0;
      }

      .header-actions {
        display: flex;
        gap: $spacing-sm;
      }
    }

    .steps-container {
      ::v-deep(.el-steps) {
        .el-step__title {
          font-size: 14px;
          line-height: 1.5;
        }
        
        .el-step__description {
          font-size: 12px;
          color: $text-secondary;
        }
      }
    }
  }

  .form-container {
    .step-card {
      margin-bottom: $spacing-lg;
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 500;
      }

      .reach-estimate {
        .reach-number {
          font-size: 24px;
          font-weight: bold;
          color: $primary-color;
        }
        
        .reach-unit {
          color: $text-secondary;
          margin-left: $spacing-xs;
        }
      }

      .template-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: $spacing-md;

        .template-item {
          border: 2px solid $border-light;
          border-radius: $border-radius-base;
          padding: $spacing-md;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: $spacing-md;

          &:hover {
            border-color: $primary-color;
            transform: translateY(-2px);
          }

          &.active {
            border-color: $primary-color;
            background-color: rgba($primary-color, 0.05);
          }

          img {
            width: 80px;
            height: 60px;
            object-fit: cover;
            border-radius: $border-radius-base;
          }

          .template-info {
            flex: 1;

            h4 {
              margin: 0 0 $spacing-xs;
              font-size: 16px;
            }

            p {
              margin: 0;
              color: $text-secondary;
              font-size: 14px;
            }
          }
        }
      }

      .image-uploader {
        .uploaded-image {
          width: 150px;
          height: 150px;
          object-fit: cover;
          border-radius: $border-radius-base;
        }

        .image-uploader-icon {
          font-size: 28px;
          color: $text-placeholder;
          width: 150px;
          height: 150px;
          border: 2px dashed $border-light;
          border-radius: $border-radius-base;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;

          &:hover {
            border-color: $primary-color;
            color: $primary-color;
          }
        }
      }

      .ai-preview {
        margin-top: $spacing-lg;
        padding: $spacing-lg;
        background: #f8f9ff;
        border-radius: $border-radius-base;

        h4 {
          margin: 0 0 $spacing-md;
          color: $primary-color;
        }

        .preview-content {
          background: white;
          padding: $spacing-md;
          border-radius: $border-radius-base;
          margin-bottom: $spacing-md;

          h5 {
            margin: 0 0 $spacing-sm;
            font-size: 18px;
          }

          p {
            margin: 0 0 $spacing-md;
            line-height: 1.6;
          }
        }

        .preview-actions {
          text-align: right;
        }
      }

      .channel-option {
        display: flex;
        align-items: center;
        gap: $spacing-xs;
      }

      .priority-list {
        .priority-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: $spacing-sm;
          background: white;
          border: 1px solid $border-light;
          border-radius: $border-radius-base;
          margin-bottom: $spacing-xs;

          &:hover {
            border-color: $primary-color;
          }

          .priority-number {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            background: $primary-color;
            color: white;
            border-radius: 50%;
            font-size: 12px;
            font-weight: bold;
            margin-right: $spacing-sm;
          }

          .priority-actions {
            display: flex;
            gap: $spacing-xs;
          }
        }
      }

      .form-tip {
        color: $text-secondary;
        font-size: 14px;
        margin: 0 0 $spacing-sm;
      }
    }

    .step-navigation {
      text-align: center;
      margin-top: $spacing-xl;
    }
  }

  .campaign-preview {
    .content-preview {
      margin-top: $spacing-lg;

      h3 {
        margin: 0 0 $spacing-md;
      }

      .preview-card {
        background: #f8f9fa;
        padding: $spacing-lg;
        border-radius: $border-radius-base;
        text-align: center;

        .preview-image {
          max-width: 100%;
          height: auto;
          margin-bottom: $spacing-md;
          border-radius: $border-radius-base;
        }

        h4 {
          margin: 0 0 $spacing-sm;
          font-size: 20px;
        }

        h5 {
          margin: 0 0 $spacing-md;
          color: $text-secondary;
        }

        p {
          margin: 0 0 $spacing-lg;
          line-height: 1.6;
        }
      }
    }
  }
}
</style>