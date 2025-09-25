<template>
  <div class="content-configuration">
    <div class="config-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/campaign/list' }">活动列表</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/campaign/create' }">创建活动</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/campaign/customer-selection' }">客户选择</el-breadcrumb-item>
        <el-breadcrumb-item>内容配置</el-breadcrumb-item>
      </el-breadcrumb>
      
      <div class="config-actions">
        <el-button @click="saveTemplate">
          保存为模板
        </el-button>
        <el-button @click="previewContent" :disabled="!canPreview">
          预览效果
        </el-button>
        <el-button type="primary" @click="confirmConfiguration" :disabled="!canConfirm">
          确认配置
        </el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <!-- 左侧配置区域 -->
      <el-col :span="16">
        <div class="config-content">
          <el-tabs v-model="activeConfigTab" @tab-change="handleConfigTabChange">
            <!-- 模板选择 -->
            <el-tab-pane label="模板选择" name="template">
              <div class="template-selection">
                <div class="template-filters">
                  <el-row :gutter="16" align="middle">
                    <el-col :span="8">
                      <el-select v-model="templateFilter.category" @change="filterTemplates">
                        <el-option label="全部类型" value="" />
                        <el-option label="邮件模板" value="email" />
                        <el-option label="社媒模板" value="social" />
                        <el-option label="短信模板" value="sms" />
                        <el-option label="推送模板" value="push" />
                      </el-select>
                    </el-col>
                    <el-col :span="8">
                      <el-select v-model="templateFilter.style" @change="filterTemplates">
                        <el-option label="全部风格" value="" />
                        <el-option label="商务正式" value="business" />
                        <el-option label="时尚活泼" value="modern" />
                        <el-option label="简约清新" value="minimal" />
                        <el-option label="节日主题" value="holiday" />
                      </el-select>
                    </el-col>
                    <el-col :span="8">
                      <el-input
                        v-model="templateFilter.keyword"
                        placeholder="搜索模板..."
                        clearable
                        @input="filterTemplates"
                      >
                        <template #prefix>
                          <el-icon><Search /></el-icon>
                        </template>
                      </el-input>
                    </el-col>
                  </el-row>
                </div>

                <div class="template-grid">
                  <div 
                    v-for="template in filteredTemplates"
                    :key="template.id"
                    class="template-card"
                    :class="{ 'selected': selectedTemplate?.id === template.id }"
                    @click="selectTemplate(template)"
                  >
                    <div class="template-preview">
                      <img :src="template.preview" :alt="template.name" />
                      <div class="template-overlay">
                        <el-button type="primary" circle @click.stop="previewTemplate(template)">
                          <el-icon><View /></el-icon>
                        </el-button>
                      </div>
                    </div>
                    <div class="template-info">
                      <div class="template-header">
                        <h4>{{ template.name }}</h4>
                        <el-rate :model-value="template.rating" disabled show-score />
                      </div>
                      <p class="template-desc">{{ template.description }}</p>
                      <div class="template-meta">
                        <el-tag :type="getTemplateTypeColor(template.type)">{{ getTemplateTypeLabel(template.type) }}</el-tag>
                        <span class="template-usage">{{ template.usage }}次使用</span>
                      </div>
                    </div>
                  </div>

                  <!-- 自定义模板选项 -->
                  <div class="template-card custom-template" @click="createCustomTemplate">
                    <div class="template-preview">
                      <div class="custom-preview">
                        <el-icon class="custom-icon"><Plus /></el-icon>
                        <span>自定义模板</span>
                      </div>
                    </div>
                    <div class="template-info">
                      <h4>从零开始</h4>
                      <p class="template-desc">创建完全自定义的营销内容模板</p>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <!-- 内容编辑 -->
            <el-tab-pane label="内容编辑" name="content">
              <div class="content-editor">
                <el-form :model="contentForm" :rules="contentRules" ref="contentFormRef" label-width="100px">
                  <el-form-item label="内容标题" prop="title">
                    <el-input 
                      v-model="contentForm.title" 
                      placeholder="输入营销内容标题"
                      maxlength="100"
                      show-word-limit
                      @input="updatePreview"
                    />
                  </el-form-item>

                  <el-form-item label="主要内容" prop="body">
                    <div class="editor-container">
                      <div class="editor-toolbar">
                        <el-button-group>
                          <el-button size="small" @click="insertVariable('客户姓名')">
                            <el-icon><User /></el-icon>
                            客户姓名
                          </el-button>
                          <el-button size="small" @click="insertVariable('公司名称')">
                            <el-icon><OfficeBuilding /></el-icon>
                            公司名称
                          </el-button>
                          <el-button size="small" @click="insertVariable('产品名称')">
                            <el-icon><Box /></el-icon>
                            产品名称
                          </el-button>
                          <el-button size="small" @click="insertVariable('优惠金额')">
                            <el-icon><Money /></el-icon>
                            优惠金额
                          </el-button>
                        </el-button-group>
                        
                        <el-divider direction="vertical" />
                        
                        <el-button-group>
                          <el-button size="small" @click="formatText('bold')">
                            <el-icon><EditPen /></el-icon>
                            粗体
                          </el-button>
                          <el-button size="small" @click="formatText('italic')">
                            <el-icon><EditPen /></el-icon>
                            斜体
                          </el-button>
                          <el-button size="small" @click="insertLink">
                            <el-icon><Link /></el-icon>
                            链接
                          </el-button>
                        </el-button-group>

                        <el-divider direction="vertical" />
                        
                        <el-button size="small" @click="useAIGeneration">
                          <el-icon><MagicStick /></el-icon>
                          AI生成
                        </el-button>
                      </div>
                      
                      <el-input
                        v-model="contentForm.body"
                        type="textarea"
                        :rows="12"
                        placeholder="输入营销内容正文，可以使用个性化变量..."
                        @input="updatePreview"
                      />
                    </div>
                  </el-form-item>

                  <el-form-item label="行为召唤" prop="callToAction">
                    <el-row :gutter="12">
                      <el-col :span="12">
                        <el-input 
                          v-model="contentForm.callToAction.text" 
                          placeholder="按钮文字"
                          @input="updatePreview"
                        />
                      </el-col>
                      <el-col :span="12">
                        <el-input 
                          v-model="contentForm.callToAction.url" 
                          placeholder="链接地址"
                          @input="updatePreview"
                        />
                      </el-col>
                    </el-row>
                  </el-form-item>

                  <el-form-item label="附件" prop="attachments">
                    <el-upload
                      v-model:file-list="contentForm.attachments"
                      :action="uploadUrl"
                      :before-upload="beforeAttachmentUpload"
                      :on-success="handleAttachmentSuccess"
                      :on-remove="handleAttachmentRemove"
                      multiple
                      drag
                    >
                      <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
                      <div class="el-upload__text">
                        将文件拖到此处，或<em>点击上传</em>
                      </div>
                      <template #tip>
                        <div class="el-upload__tip">
                          支持图片、PDF、Word文档，单个文件不超过10MB
                        </div>
                      </template>
                    </el-upload>
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>

            <!-- 个性化变量 -->
            <el-tab-pane label="个性化变量" name="variables">
              <div class="variable-configuration">
                <el-alert
                  title="个性化变量说明"
                  type="info"
                  description="使用个性化变量可以为每个客户定制专属的营销内容，提高转化率和客户体验。"
                  show-icon
                  :closable="false"
                  style="margin-bottom: 20px;"
                />

                <div class="variable-categories">
                  <el-collapse v-model="activeVariableCategories">
                    <el-collapse-item title="客户信息变量" name="customer">
                      <div class="variable-list">
                        <div 
                          v-for="variable in customerVariables"
                          :key="variable.key"
                          class="variable-item"
                        >
                          <div class="variable-info">
                            <span class="variable-name">{{ variable.name }}</span>
                            <span class="variable-key">{{ variable.key }}</span>
                            <span class="variable-desc">{{ variable.description }}</span>
                          </div>
                          <div class="variable-actions">
                            <el-button size="small" @click="insertVariableToEditor(variable.key)">
                              插入内容
                            </el-button>
                            <el-button size="small" @click="insertVariableToSubject(variable.key)">
                              插入标题
                            </el-button>
                          </div>
                        </div>
                      </div>
                    </el-collapse-item>

                    <el-collapse-item title="产品信息变量" name="product">
                      <div class="variable-list">
                        <div 
                          v-for="variable in productVariables"
                          :key="variable.key"
                          class="variable-item"
                        >
                          <div class="variable-info">
                            <span class="variable-name">{{ variable.name }}</span>
                            <span class="variable-key">{{ variable.key }}</span>
                            <span class="variable-desc">{{ variable.description }}</span>
                          </div>
                          <div class="variable-actions">
                            <el-button size="small" @click="insertVariableToEditor(variable.key)">
                              插入内容
                            </el-button>
                            <el-button size="small" @click="insertVariableToSubject(variable.key)">
                              插入标题
                            </el-button>
                          </div>
                        </div>
                      </div>
                    </el-collapse-item>

                    <el-collapse-item title="营销活动变量" name="campaign">
                      <div class="variable-list">
                        <div 
                          v-for="variable in campaignVariables"
                          :key="variable.key"
                          class="variable-item"
                        >
                          <div class="variable-info">
                            <span class="variable-name">{{ variable.name }}</span>
                            <span class="variable-key">{{ variable.key }}</span>
                            <span class="variable-desc">{{ variable.description }}</span>
                          </div>
                          <div class="variable-actions">
                            <el-button size="small" @click="insertVariableToEditor(variable.key)">
                              插入内容
                            </el-button>
                            <el-button size="small" @click="insertVariableToSubject(variable.key)">
                              插入标题
                            </el-button>
                          </div>
                        </div>
                      </div>
                    </el-collapse-item>

                    <el-collapse-item title="自定义变量" name="custom">
                      <div class="custom-variables">
                        <div class="custom-variable-form">
                          <el-row :gutter="12">
                            <el-col :span="8">
                              <el-input
                                v-model="newVariable.name"
                                placeholder="变量名称"
                              />
                            </el-col>
                            <el-col :span="8">
                              <el-input
                                v-model="newVariable.key"
                                placeholder="变量标识（如：CUSTOM_FIELD_1）"
                              />
                            </el-col>
                            <el-col :span="6">
                              <el-input
                                v-model="newVariable.defaultValue"
                                placeholder="默认值"
                              />
                            </el-col>
                            <el-col :span="2">
                              <el-button type="primary" @click="addCustomVariable">
                                添加
                              </el-button>
                            </el-col>
                          </el-row>
                        </div>

                        <div class="variable-list">
                          <div 
                            v-for="variable in customVariables"
                            :key="variable.key"
                            class="variable-item"
                          >
                            <div class="variable-info">
                              <span class="variable-name">{{ variable.name }}</span>
                              <span class="variable-key">{{ variable.key }}</span>
                              <span class="variable-desc">默认值: {{ variable.defaultValue }}</span>
                            </div>
                            <div class="variable-actions">
                              <el-button size="small" @click="insertVariableToEditor(variable.key)">
                                插入内容
                              </el-button>
                              <el-button size="small" @click="insertVariableToSubject(variable.key)">
                                插入标题
                              </el-button>
                              <el-button size="small" type="danger" @click="removeCustomVariable(variable.key)">
                                删除
                              </el-button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </el-collapse-item>
                  </el-collapse>
                </div>
              </div>
            </el-tab-pane>

            <!-- 发送设置 -->
            <el-tab-pane label="发送设置" name="settings">
              <div class="send-settings">
                <el-form :model="sendSettings" label-width="120px">
                  <el-form-item label="发送时间">
                    <el-radio-group v-model="sendSettings.timeType">
                      <el-radio value="immediate">立即发送</el-radio>
                      <el-radio value="scheduled">定时发送</el-radio>
                      <el-radio value="optimal">最佳时间发送</el-radio>
                    </el-radio-group>
                  </el-form-item>

                  <el-form-item v-if="sendSettings.timeType === 'scheduled'" label="发送时间">
                    <el-date-picker
                      v-model="sendSettings.scheduledTime"
                      type="datetime"
                      placeholder="选择发送时间"
                      value-format="YYYY-MM-DD HH:mm:ss"
                      :disabled-date="disablePastDate"
                    />
                  </el-form-item>

                  <el-form-item v-if="sendSettings.timeType === 'optimal'" label="时间窗口">
                    <el-checkbox-group v-model="sendSettings.optimalTimeWindows">
                      <el-checkbox value="morning">上午 (9:00-12:00)</el-checkbox>
                      <el-checkbox value="afternoon">下午 (14:00-18:00)</el-checkbox>
                      <el-checkbox value="evening">晚上 (19:00-21:00)</el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>

                  <el-form-item label="发送频率限制">
                    <el-switch
                      v-model="sendSettings.frequencyControl.enabled"
                      active-text="启用频率控制"
                    />
                  </el-form-item>

                  <el-form-item v-if="sendSettings.frequencyControl.enabled" label="限制规则">
                    <el-row :gutter="12">
                      <el-col :span="8">
                        <el-input-number
                          v-model="sendSettings.frequencyControl.maxEmails"
                          :min="1"
                          :max="10"
                          controls-position="right"
                        />
                        <span style="margin-left: 8px;">封邮件</span>
                      </el-col>
                      <el-col :span="8">
                        <el-select v-model="sendSettings.frequencyControl.period">
                          <el-option label="每天" value="day" />
                          <el-option label="每周" value="week" />
                          <el-option label="每月" value="month" />
                        </el-select>
                      </el-col>
                    </el-row>
                  </el-form-item>

                  <el-form-item label="A/B测试">
                    <el-switch
                      v-model="sendSettings.abTest.enabled"
                      active-text="启用A/B测试"
                    />
                  </el-form-item>

                  <el-form-item v-if="sendSettings.abTest.enabled" label="测试配置">
                    <el-row :gutter="12">
                      <el-col :span="8">
                        <el-input-number
                          v-model="sendSettings.abTest.testRatio"
                          :min="10"
                          :max="50"
                          controls-position="right"
                        />
                        <span style="margin-left: 8px;">% 用于测试</span>
                      </el-col>
                      <el-col :span="8">
                        <el-select v-model="sendSettings.abTest.winnerCriteria">
                          <el-option label="打开率" value="open_rate" />
                          <el-option label="点击率" value="click_rate" />
                          <el-option label="转化率" value="conversion_rate" />
                        </el-select>
                      </el-col>
                      <el-col :span="8">
                        <el-input-number
                          v-model="sendSettings.abTest.testDuration"
                          :min="1"
                          :max="7"
                          controls-position="right"
                        />
                        <span style="margin-left: 8px;">天后发送获胜版本</span>
                      </el-col>
                    </el-row>
                  </el-form-item>

                  <el-form-item label="跟踪设置">
                    <el-checkbox-group v-model="sendSettings.tracking">
                      <el-checkbox value="open">打开追踪</el-checkbox>
                      <el-checkbox value="click">点击追踪</el-checkbox>
                      <el-checkbox value="unsubscribe">退订追踪</el-checkbox>
                      <el-checkbox value="bounce">退信追踪</el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-col>

      <!-- 右侧预览区域 -->
      <el-col :span="8">
        <div class="preview-panel">
          <div class="preview-header">
            <h4>实时预览</h4>
            <el-button-group size="small">
              <el-button 
                :type="previewDevice === 'desktop' ? 'primary' : ''"
                @click="previewDevice = 'desktop'"
              >
                <el-icon><Monitor /></el-icon>
                桌面
              </el-button>
              <el-button 
                :type="previewDevice === 'mobile' ? 'primary' : ''"
                @click="previewDevice = 'mobile'"
              >
                <el-icon><Cellphone /></el-icon>
                移动
              </el-button>
            </el-button-group>
          </div>
          
          <div class="preview-content" :class="`preview-${previewDevice}`">
            <div class="preview-frame">
              <div v-if="selectedTemplate" class="content-preview">
                <div class="preview-title">{{ processedContent.title || '营销活动标题' }}</div>
                <div class="preview-body" v-html="processedContent.body || '营销内容正文'"></div>
                <div v-if="processedContent.callToAction.text" class="preview-cta">
                  <el-button type="primary">{{ processedContent.callToAction.text }}</el-button>
                </div>
                <div v-if="processedContent.attachments.length > 0" class="preview-attachments">
                  <div class="attachment-list">
                    <div 
                      v-for="attachment in processedContent.attachments"
                      :key="attachment.uid"
                      class="attachment-item"
                    >
                      <el-icon><Document /></el-icon>
                      <span>{{ attachment.name }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="preview-placeholder">
                <el-icon class="placeholder-icon"><View /></el-icon>
                <p>请选择模板开始配置内容</p>
              </div>
            </div>
          </div>

          <!-- 预览统计 -->
          <div class="preview-stats">
            <el-card>
              <div class="stat-item">
                <span class="stat-label">标题长度:</span>
                <span class="stat-value">{{ contentForm.title.length }}/100</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">正文字数:</span>
                <span class="stat-value">{{ contentForm.body.length }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">个性化变量:</span>
                <span class="stat-value">{{ variableCount }}个</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">附件数量:</span>
                <span class="stat-value">{{ contentForm.attachments.length }}个</span>
              </div>
            </el-card>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 模板预览弹窗 -->
    <el-dialog v-model="showTemplatePreview" title="模板预览" width="80%" destroy-on-close>
      <div class="template-preview-dialog" v-if="previewingTemplate">
        <img :src="previewingTemplate.fullPreview" :alt="previewingTemplate.name" style="width: 100%;" />
      </div>
    </el-dialog>

    <!-- AI内容生成弹窗 -->
    <el-dialog v-model="showAIGeneration" title="AI内容生成" width="60%" destroy-on-close>
      <div class="ai-generation-dialog">
        <el-form :model="aiGenerationForm" label-width="120px">
          <el-form-item label="内容类型">
            <el-radio-group v-model="aiGenerationForm.type">
              <el-radio value="title">标题</el-radio>
              <el-radio value="body">正文</el-radio>
              <el-radio value="both">标题和正文</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="内容风格">
            <el-select v-model="aiGenerationForm.style" placeholder="选择内容风格">
              <el-option label="专业商务" value="professional" />
              <el-option label="友好亲切" value="friendly" />
              <el-option label="紧迫感" value="urgent" />
              <el-option label="幽默风趣" value="humorous" />
              <el-option label="简洁直接" value="concise" />
            </el-select>
          </el-form-item>

          <el-form-item label="关键信息">
            <el-input
              v-model="aiGenerationForm.keywords"
              type="textarea"
              :rows="3"
              placeholder="请输入要强调的关键信息，如：产品特点、优惠内容、行动号召等"
            />
          </el-form-item>

          <el-form-item label="目标受众">
            <el-input
              v-model="aiGenerationForm.audience"
              placeholder="如：企业决策者、年轻消费者、高净值客户等"
            />
          </el-form-item>

          <el-form-item label="字数要求">
            <el-row :gutter="12">
              <el-col :span="12">
                <el-input-number
                  v-model="aiGenerationForm.minWords"
                  :min="10"
                  :max="1000"
                  controls-position="right"
                />
                <span style="margin-left: 8px;">最少字数</span>
              </el-col>
              <el-col :span="12">
                <el-input-number
                  v-model="aiGenerationForm.maxWords"
                  :min="20"
                  :max="2000"
                  controls-position="right"
                />
                <span style="margin-left: 8px;">最多字数</span>
              </el-col>
            </el-row>
          </el-form-item>
        </el-form>

        <div class="ai-generation-result" v-if="aiGeneratedContent">
          <el-divider>生成结果</el-divider>
          <div v-if="aiGeneratedContent.title" class="generated-title">
            <h4>建议标题：</h4>
            <p>{{ aiGeneratedContent.title }}</p>
          </div>
          <div v-if="aiGeneratedContent.body" class="generated-body">
            <h4>建议正文：</h4>
            <p style="white-space: pre-line;">{{ aiGeneratedContent.body }}</p>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="ai-generation-footer">
          <el-button @click="generateWithAI" :loading="generatingWithAI">
            重新生成
          </el-button>
          <el-button v-if="aiGeneratedContent" @click="useAIResult">
            使用结果
          </el-button>
          <el-button @click="showAIGeneration = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, View, Plus, User, OfficeBuilding, Box, Money, EditPen, Link, 
  MagicStick, UploadFilled, Monitor, Cellphone, Document
} from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const activeConfigTab = ref('template')
const selectedTemplate = ref(null)
const previewDevice = ref('desktop')
const showTemplatePreview = ref(false)
const previewingTemplate = ref(null)
const showAIGeneration = ref(false)
const generatingWithAI = ref(false)
const aiGeneratedContent = ref(null)

// 模板筛选
const templateFilter = reactive({
  category: '',
  style: '',
  keyword: ''
})

// 内容表单
const contentForm = reactive({
  title: '',
  body: '',
  callToAction: {
    text: '',
    url: ''
  },
  attachments: []
})

const contentRules = {
  title: [
    { required: true, message: '请输入内容标题', trigger: 'blur' }
  ],
  body: [
    { required: true, message: '请输入主要内容', trigger: 'blur' },
    { min: 10, message: '内容长度至少10个字符', trigger: 'blur' }
  ]
}

// 发送设置
const sendSettings = reactive({
  timeType: 'immediate',
  scheduledTime: null,
  optimalTimeWindows: ['morning', 'afternoon'],
  frequencyControl: {
    enabled: false,
    maxEmails: 3,
    period: 'day'
  },
  abTest: {
    enabled: false,
    testRatio: 20,
    winnerCriteria: 'open_rate',
    testDuration: 3
  },
  tracking: ['open', 'click', 'unsubscribe']
})

// 个性化变量
const activeVariableCategories = ref(['customer'])
const newVariable = reactive({
  name: '',
  key: '',
  defaultValue: ''
})
const customVariables = ref([])

// AI生成表单
const aiGenerationForm = reactive({
  type: 'both',
  style: 'professional',
  keywords: '',
  audience: '',
  minWords: 50,
  maxWords: 200
})

// 模拟数据
const campaignTemplates = ref([
  {
    id: 1,
    name: '专业邮件模板',
    type: 'email',
    style: 'business',
    description: '适合B2B营销的专业邮件模板',
    preview: 'https://via.placeholder.com/300x200?text=Professional+Email',
    fullPreview: 'https://via.placeholder.com/800x600?text=Full+Email+Preview',
    rating: 4.5,
    usage: 1234
  },
  {
    id: 2,
    name: '节日促销模板',
    type: 'email',
    style: 'holiday',
    description: '适合节日促销活动的邮件模板',
    preview: 'https://via.placeholder.com/300x200?text=Holiday+Sale',
    fullPreview: 'https://via.placeholder.com/800x600?text=Full+Holiday+Preview',
    rating: 4.8,
    usage: 856
  },
  {
    id: 3,
    name: '简洁社媒模板',
    type: 'social',
    style: 'minimal',
    description: '适合社交媒体发布的简洁模板',
    preview: 'https://via.placeholder.com/300x200?text=Social+Media',
    fullPreview: 'https://via.placeholder.com/800x600?text=Full+Social+Preview',
    rating: 4.2,
    usage: 567
  },
  {
    id: 4,
    name: '现代短信模板',
    type: 'sms',
    style: 'modern',
    description: '现代化设计的短信营销模板',
    preview: 'https://via.placeholder.com/300x200?text=SMS+Template',
    fullPreview: 'https://via.placeholder.com/800x600?text=Full+SMS+Preview',
    rating: 4.0,
    usage: 234
  }
])

const customerVariables = ref([
  {
    name: '客户姓名',
    key: '{CUSTOMER_NAME}',
    description: '客户的真实姓名或称呼'
  },
  {
    name: '客户邮箱',
    key: '{CUSTOMER_EMAIL}',
    description: '客户的邮箱地址'
  },
  {
    name: '公司名称',
    key: '{COMPANY_NAME}',
    description: '客户所在公司名称'
  },
  {
    name: '客户等级',
    key: '{CUSTOMER_LEVEL}',
    description: '客户的等级标识（如VIP、普通等）'
  },
  {
    name: '注册时间',
    key: '{REGISTER_DATE}',
    description: '客户的注册日期'
  }
])

const productVariables = ref([
  {
    name: '产品名称',
    key: '{PRODUCT_NAME}',
    description: '推广的产品名称'
  },
  {
    name: '产品价格',
    key: '{PRODUCT_PRICE}',
    description: '产品的当前价格'
  },
  {
    name: '优惠金额',
    key: '{DISCOUNT_AMOUNT}',
    description: '优惠或折扣金额'
  },
  {
    name: '产品图片',
    key: '{PRODUCT_IMAGE}',
    description: '产品主图链接'
  },
  {
    name: '产品描述',
    key: '{PRODUCT_DESCRIPTION}',
    description: '产品的简要描述'
  }
])

const campaignVariables = ref([
  {
    name: '活动名称',
    key: '{CAMPAIGN_NAME}',
    description: '当前营销活动名称'
  },
  {
    name: '活动截止时间',
    key: '{CAMPAIGN_END_DATE}',
    description: '活动结束日期'
  },
  {
    name: '专属链接',
    key: '{TRACKING_LINK}',
    description: '带追踪参数的专属链接'
  },
  {
    name: '优惠码',
    key: '{PROMO_CODE}',
    description: '专属优惠码'
  }
])

const uploadUrl = 'https://api.example.com/upload'

// 计算属性
const filteredTemplates = computed(() => {
  let templates = campaignTemplates.value

  if (templateFilter.category) {
    templates = templates.filter(t => t.type === templateFilter.category)
  }

  if (templateFilter.style) {
    templates = templates.filter(t => t.style === templateFilter.style)
  }

  if (templateFilter.keyword) {
    const keyword = templateFilter.keyword.toLowerCase()
    templates = templates.filter(t => 
      t.name.toLowerCase().includes(keyword) || 
      t.description.toLowerCase().includes(keyword)
    )
  }

  return templates
})

const processedContent = computed(() => {
  return {
    title: processVariables(contentForm.title),
    body: processVariables(contentForm.body),
    callToAction: contentForm.callToAction,
    attachments: contentForm.attachments
  }
})

const variableCount = computed(() => {
  const titleVars = (contentForm.title.match(/\{[^}]+\}/g) || []).length
  const bodyVars = (contentForm.body.match(/\{[^}]+\}/g) || []).length
  return titleVars + bodyVars
})

const canPreview = computed(() => {
  return selectedTemplate.value && (contentForm.title || contentForm.body)
})

const canConfirm = computed(() => {
  return selectedTemplate.value && contentForm.title && contentForm.body
})

// 方法
const handleConfigTabChange = (tabName) => {
  console.log('切换到配置标签:', tabName)
}

const filterTemplates = () => {
  // 筛选逻辑已在计算属性中处理
}

const selectTemplate = (template) => {
  selectedTemplate.value = template
  ElMessage.success(`已选择模板：${template.name}`)
}

const previewTemplate = (template) => {
  previewingTemplate.value = template
  showTemplatePreview.value = true
}

const createCustomTemplate = () => {
  ElMessage.info('跳转到自定义模板编辑器')
  // 这里可以跳转到模板编辑器或打开编辑弹窗
}

const getTemplateTypeColor = (type) => {
  const colors = {
    email: 'primary',
    social: 'success',
    sms: 'warning',
    push: 'info'
  }
  return colors[type] || ''
}

const getTemplateTypeLabel = (type) => {
  const labels = {
    email: '邮件',
    social: '社媒',
    sms: '短信',
    push: '推送'
  }
  return labels[type] || type
}

const updatePreview = () => {
  // 实时更新预览内容
}

const insertVariable = (variableName) => {
  const variableMap = {
    '客户姓名': '{CUSTOMER_NAME}',
    '公司名称': '{COMPANY_NAME}',
    '产品名称': '{PRODUCT_NAME}',
    '优惠金额': '{DISCOUNT_AMOUNT}'
  }
  
  const variable = variableMap[variableName]
  if (variable) {
    contentForm.body += variable
    updatePreview()
  }
}

const insertVariableToEditor = (variableKey) => {
  contentForm.body += variableKey
  updatePreview()
}

const insertVariableToSubject = (variableKey) => {
  contentForm.title += variableKey
  updatePreview()
}

const addCustomVariable = () => {
  if (!newVariable.name || !newVariable.key) {
    ElMessage.warning('请填写变量名称和标识')
    return
  }

  if (customVariables.value.some(v => v.key === newVariable.key)) {
    ElMessage.warning('变量标识已存在')
    return
  }

  customVariables.value.push({
    name: newVariable.name,
    key: `{${newVariable.key}}`,
    defaultValue: newVariable.defaultValue,
    description: `自定义变量：${newVariable.name}`
  })

  // 重置表单
  newVariable.name = ''
  newVariable.key = ''
  newVariable.defaultValue = ''

  ElMessage.success('自定义变量添加成功')
}

const removeCustomVariable = (variableKey) => {
  const index = customVariables.value.findIndex(v => v.key === variableKey)
  if (index > -1) {
    customVariables.value.splice(index, 1)
    ElMessage.success('变量删除成功')
  }
}

const formatText = (format) => {
  ElMessage.info(`应用${format}格式`)
  // 这里可以实现富文本编辑功能
}

const insertLink = () => {
  ElMessage.info('插入链接')
  // 这里可以打开链接插入对话框
}

const useAIGeneration = () => {
  showAIGeneration.value = true
  aiGeneratedContent.value = null
}

const generateWithAI = async () => {
  if (!aiGenerationForm.keywords.trim()) {
    ElMessage.warning('请输入关键信息')
    return
  }

  generatingWithAI.value = true
  try {
    // 模拟AI生成过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 模拟生成结果
    aiGeneratedContent.value = {
      title: `专属${aiGenerationForm.keywords}优惠 - 仅限{CUSTOMER_NAME}`,
      body: `亲爱的{CUSTOMER_NAME}，\n\n感谢您一直以来对我们的支持！\n\n我们特别为您准备了${aiGenerationForm.keywords}相关的专属优惠。作为我们的重要客户，您将享受到：\n\n• 专属折扣优惠\n• 优先购买权\n• 专业客服支持\n\n此优惠仅限3天，不要错过这个难得的机会！\n\n立即行动，享受专属优惠！`
    }
    
    ElMessage.success('AI内容生成完成')
  } catch (error) {
    ElMessage.error('AI生成失败，请重试')
  } finally {
    generatingWithAI.value = false
  }
}

const useAIResult = () => {
  if (aiGenerationForm.type === 'title' || aiGenerationForm.type === 'both') {
    contentForm.title = aiGeneratedContent.value.title || contentForm.title
  }
  
  if (aiGenerationForm.type === 'body' || aiGenerationForm.type === 'both') {
    contentForm.body = aiGeneratedContent.value.body || contentForm.body
  }
  
  updatePreview()
  showAIGeneration.value = false
  ElMessage.success('AI生成内容已应用')
}

const processVariables = (text) => {
  if (!text) return text
  
  // 模拟变量替换（实际应用中会从客户数据中获取真实值）
  const sampleData = {
    '{CUSTOMER_NAME}': '张先生',
    '{COMPANY_NAME}': '科技有限公司',
    '{PRODUCT_NAME}': '智能营销系统',
    '{DISCOUNT_AMOUNT}': '1000元',
    '{CAMPAIGN_NAME}': '春季促销活动',
    '{PROMO_CODE}': 'SAVE2024'
  }
  
  let processedText = text
  Object.keys(sampleData).forEach(variable => {
    processedText = processedText.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), sampleData[variable])
  })
  
  return processedText
}

const beforeAttachmentUpload = (file) => {
  const isValidType = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword'].includes(file.type)
  const isValidSize = file.size / 1024 / 1024 < 10

  if (!isValidType) {
    ElMessage.error('只支持JPG、PNG、PDF、Word格式的文件')
    return false
  }
  if (!isValidSize) {
    ElMessage.error('文件大小不能超过10MB')
    return false
  }
  return true
}

const handleAttachmentSuccess = (response, file) => {
  ElMessage.success('附件上传成功')
}

const handleAttachmentRemove = (file) => {
  ElMessage.info('附件已移除')
}

const disablePastDate = (time) => {
  return time.getTime() < Date.now()
}

const saveTemplate = async () => {
  if (!canConfirm.value) {
    ElMessage.warning('请先完成内容配置')
    return
  }

  try {
    const result = await ElMessageBox.prompt('请输入模板名称', '保存为模板', {
      confirmButtonText: '保存',
      cancelButtonText: '取消',
      inputValidator: (value) => {
        if (!value) {
          return '请输入模板名称'
        }
        return true
      }
    })

    // 模拟保存模板
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success(`模板 "${result.value}" 保存成功`)
  } catch {
    // 用户取消
  }
}

const previewContent = () => {
  if (!canPreview.value) {
    ElMessage.warning('请先选择模板并输入内容')
    return
  }
  
  ElMessage.success('预览功能已开启，请查看右侧预览区域')
}

const confirmConfiguration = async () => {
  if (!canConfirm.value) {
    ElMessage.warning('请完成内容配置')
    return
  }

  try {
    const result = await ElMessageBox.confirm(
      '确定完成内容配置并进入下一步吗？',
      '确认内容配置',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    if (result === 'confirm') {
      ElMessage.success('内容配置完成，正在跳转到渠道设置...')
      // 跳转到下一步：渠道设置
      setTimeout(() => {
        router.push('/campaign/channel-settings')
      }, 1000)
    }
  } catch {
    // 用户取消
  }
}

// 组件挂载
onMounted(() => {
  // 初始化数据
})
</script>

<style lang="scss" scoped>
.content-configuration {
  padding: 20px;

  .config-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .config-actions {
      display: flex;
      gap: 10px;
    }
  }

  .config-content {
    .template-selection {
      .template-filters {
        margin-bottom: 20px;
        padding: 15px;
        background: var(--el-fill-color-lighter);
        border-radius: 6px;
      }

      .template-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;

        .template-card {
          border: 2px solid var(--el-border-color-light);
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            border-color: var(--el-color-primary);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          &.selected {
            border-color: var(--el-color-primary);
            background-color: var(--el-color-primary-light-9);
          }

          &.custom-template {
            border-style: dashed;
            border-color: var(--el-color-primary);

            .template-preview {
              display: flex;
              align-items: center;
              justify-content: center;
              height: 160px;
              background: var(--el-fill-color-lighter);

              .custom-preview {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
                color: var(--el-color-primary);

                .custom-icon {
                  font-size: 32px;
                }
              }
            }
          }

          .template-preview {
            position: relative;
            height: 160px;
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
              background: rgba(0, 0, 0, 0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              opacity: 0;
              transition: opacity 0.3s;

              .el-button {
                transform: scale(0.8);
                transition: transform 0.3s;
              }
            }

            &:hover .template-overlay {
              opacity: 1;

              .el-button {
                transform: scale(1);
              }
            }
          }

          .template-info {
            padding: 15px;

            .template-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;

              h4 {
                margin: 0;
                font-size: 16px;
                font-weight: 500;
              }
            }

            .template-desc {
              color: var(--el-text-color-secondary);
              font-size: 13px;
              margin-bottom: 10px;
            }

            .template-meta {
              display: flex;
              justify-content: space-between;
              align-items: center;

              .template-usage {
                font-size: 12px;
                color: var(--el-text-color-placeholder);
              }
            }
          }
        }
      }
    }

    .content-editor {
      .editor-container {
        .editor-toolbar {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
          padding: 10px;
          background: var(--el-fill-color-lighter);
          border-radius: 6px;
          border: 1px solid var(--el-border-color-light);
        }
      }
    }

    .variable-configuration {
      .variable-categories {
        .variable-list {
          .variable-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            border: 1px solid var(--el-border-color-lighter);
            border-radius: 6px;
            margin-bottom: 10px;

            .variable-info {
              flex: 1;

              .variable-name {
                font-weight: 500;
                margin-right: 10px;
              }

              .variable-key {
                background: var(--el-fill-color-light);
                color: var(--el-color-primary);
                padding: 2px 6px;
                border-radius: 4px;
                font-family: monospace;
                font-size: 12px;
                margin-right: 10px;
              }

              .variable-desc {
                color: var(--el-text-color-secondary);
                font-size: 12px;
              }
            }

            .variable-actions {
              display: flex;
              gap: 8px;
            }
          }
        }

        .custom-variables {
          .custom-variable-form {
            margin-bottom: 20px;
            padding: 15px;
            background: var(--el-fill-color-lighter);
            border-radius: 6px;
          }
        }
      }
    }

    .send-settings {
      .el-form-item {
        margin-bottom: 20px;
      }
    }
  }

  .preview-panel {
    position: sticky;
    top: 20px;

    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding: 12px 15px;
      background: var(--el-fill-color-lighter);
      border-radius: 6px;

      h4 {
        margin: 0;
        font-size: 16px;
      }
    }

    .preview-content {
      margin-bottom: 15px;
      border: 1px solid var(--el-border-color-light);
      border-radius: 8px;
      overflow: hidden;

      &.preview-desktop {
        .preview-frame {
          padding: 20px;
        }
      }

      &.preview-mobile {
        max-width: 375px;
        margin: 0 auto;

        .preview-frame {
          padding: 15px;
        }
      }

      .preview-frame {
        min-height: 400px;
        background: #fff;

        .content-preview {
          .preview-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            color: var(--el-text-color-primary);
          }

          .preview-body {
            line-height: 1.6;
            margin-bottom: 20px;
            color: var(--el-text-color-regular);
          }

          .preview-cta {
            text-align: center;
            margin-bottom: 20px;
          }

          .preview-attachments {
            .attachment-list {
              .attachment-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px;
                background: var(--el-fill-color-lighter);
                border-radius: 4px;
                margin-bottom: 5px;
                font-size: 13px;
              }
            }
          }
        }

        .preview-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--el-text-color-placeholder);

          .placeholder-icon {
            font-size: 48px;
            margin-bottom: 10px;
          }
        }
      }
    }

    .preview-stats {
      .el-card {
        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid var(--el-border-color-lighter);

          &:last-child {
            border-bottom: none;
          }

          .stat-label {
            font-size: 13px;
            color: var(--el-text-color-secondary);
          }

          .stat-value {
            font-weight: 500;
            color: var(--el-text-color-primary);
          }
        }
      }
    }
  }

  .ai-generation-dialog {
    .ai-generation-result {
      margin-top: 20px;

      .generated-title,
      .generated-body {
        margin-bottom: 15px;
        padding: 15px;
        background: var(--el-fill-color-lighter);
        border-radius: 6px;

        h4 {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: var(--el-text-color-secondary);
        }

        p {
          margin: 0;
          color: var(--el-text-color-primary);
        }
      }
    }

    .ai-generation-footer {
      text-align: right;
    }
  }
}
</style>