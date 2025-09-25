<template>
  <div class="whatsapp-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>WhatsApp营销</h1>
      <div class="header-actions">
        <el-button type="primary" @click="showCreateTemplate">
          <el-icon><Plus /></el-icon>
          创建模板
        </el-button>
        <el-button @click="showBulkSend">
          <el-icon><ChatDotRound /></el-icon>
          群发消息
        </el-button>
        <el-button @click="showChatList">
          <el-icon><ChatLineRound /></el-icon>
          聊天记录
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-icon messages">
                <el-icon><ChatDotRound /></el-icon>
              </div>
              <div class="stat-content">
                <h3>{{ whatsappStats.totalMessages.toLocaleString() }}</h3>
                <p>总消息数</p>
                <span class="growth-rate positive">+{{ whatsappStats.messageGrowth }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-icon delivered">
                <el-icon><Select /></el-icon>
              </div>
              <div class="stat-content">
                <h3>{{ whatsappStats.deliveryRate }}%</h3>
                <p>送达率</p>
                <span class="growth-rate positive">+{{ whatsappStats.deliveryGrowth }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-icon opened">
                <el-icon><View /></el-icon>
              </div>
              <div class="stat-content">
                <h3>{{ whatsappStats.openRate }}%</h3>
                <p>打开率</p>
                <span class="growth-rate" :class="whatsappStats.openGrowth > 0 ? 'positive' : 'negative'">
                  {{ whatsappStats.openGrowth > 0 ? '+' : '' }}{{ whatsappStats.openGrowth }}%
                </span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-icon replied">
                <el-icon><ChatLineRound /></el-icon>
              </div>
              <div class="stat-content">
                <h3>{{ whatsappStats.replyRate }}%</h3>
                <p>回复率</p>
                <span class="growth-rate positive">+{{ whatsappStats.replyGrowth }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 主要内容区域 -->
    <el-row :gutter="20" class="main-content">
      <!-- 消息模板管理 -->
      <el-col :span="16">
        <el-card class="template-card">
          <template #header>
            <div class="card-header">
              <span>消息模板</span>
              <div class="header-filters">
                <el-select v-model="templateFilter.status" placeholder="状态" size="small" style="width: 120px">
                  <el-option label="全部" value="" />
                  <el-option label="已批准" value="approved" />
                  <el-option label="待审核" value="pending" />
                  <el-option label="已拒绝" value="rejected" />
                  <el-option label="草稿" value="draft" />
                </el-select>
                <el-select v-model="templateFilter.category" placeholder="分类" size="small" style="width: 120px">
                  <el-option label="全部" value="" />
                  <el-option label="营销" value="marketing" />
                  <el-option label="通知" value="notification" />
                  <el-option label="验证" value="verification" />
                  <el-option label="客服" value="service" />
                </el-select>
              </div>
            </div>
          </template>

          <div class="template-list">
            <div v-for="template in filteredTemplates" :key="template.id" class="template-item">
              <div class="template-content">
                <div class="template-header">
                  <h4>{{ template.name }}</h4>
                  <div class="template-meta">
                    <el-tag :type="getStatusTagType(template.status)" size="small">
                      {{ getStatusText(template.status) }}
                    </el-tag>
                    <el-tag type="info" size="small">{{ getCategoryText(template.category) }}</el-tag>
                  </div>
                </div>
                
                <div class="template-preview">
                  <div class="preview-header">
                    <span class="language">{{ template.language }}</span>
                    <span class="last-used">最后使用：{{ formatRelativeTime(template.lastUsed) }}</span>
                  </div>
                  <div class="message-bubble">
                    <div class="message-text" v-html="formatTemplateText(template.content)"></div>
                    <div class="message-variables" v-if="template.variables?.length">
                      <span class="variable-label">变量：</span>
                      <el-tag v-for="variable in template.variables" :key="variable" size="small" class="variable-tag">
                        {{ variable }}
                      </el-tag>
                    </div>
                  </div>
                </div>
                
                <div class="template-stats">
                  <div class="stat">
                    <span class="label">发送次数</span>
                    <span class="value">{{ template.sendCount }}</span>
                  </div>
                  <div class="stat">
                    <span class="label">成功率</span>
                    <span class="value">{{ template.successRate }}%</span>
                  </div>
                  <div class="stat">
                    <span class="label">回复率</span>
                    <span class="value">{{ template.replyRate }}%</span>
                  </div>
                </div>
              </div>
              
              <div class="template-actions">
                <el-dropdown @command="handleTemplateAction" trigger="click">
                  <el-button type="text">
                    <el-icon><MoreFilled /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item :command="`send-${template.id}`">发送消息</el-dropdown-item>
                      <el-dropdown-item :command="`edit-${template.id}`">编辑模板</el-dropdown-item>
                      <el-dropdown-item :command="`duplicate-${template.id}`">复制模板</el-dropdown-item>
                      <el-dropdown-item :command="`analytics-${template.id}`">查看分析</el-dropdown-item>
                      <el-dropdown-item :command="`delete-${template.id}`" divided class="danger">删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="templatePagination.current"
              :page-size="templatePagination.size"
              :total="templatePagination.total"
              layout="total, prev, pager, next, jumper"
              @current-change="handleTemplatePageChange"
            />
          </div>
        </el-card>
      </el-col>

      <!-- 侧边栏 -->
      <el-col :span="8">
        <!-- 连接状态 -->
        <el-card class="connection-status-card">
          <template #header>
            <span>连接状态</span>
          </template>
          <div class="connection-info">
            <div class="status-indicator" :class="connectionStatus.status">
              <div class="status-dot"></div>
              <span class="status-text">{{ getConnectionStatusText(connectionStatus.status) }}</span>
            </div>
            <div class="connection-details" v-if="connectionStatus.status === 'connected'">
              <p><strong>账号：</strong>{{ connectionStatus.phoneNumber }}</p>
              <p><strong>名称：</strong>{{ connectionStatus.displayName }}</p>
              <p><strong>连接时间：</strong>{{ formatTime(connectionStatus.connectedAt) }}</p>
            </div>
            <div class="connection-actions">
              <el-button 
                v-if="connectionStatus.status === 'disconnected'" 
                type="primary" 
                @click="connectWhatsApp"
              >
                连接WhatsApp
              </el-button>
              <el-button 
                v-else-if="connectionStatus.status === 'connected'" 
                @click="disconnectWhatsApp"
              >
                断开连接
              </el-button>
              <el-button 
                v-else 
                :loading="true"
                disabled
              >
                连接中...
              </el-button>
            </div>
          </div>
        </el-card>

        <!-- 自动回复设置 -->
        <el-card class="auto-reply-card">
          <template #header>
            <div class="card-header">
              <span>自动回复</span>
              <el-switch v-model="autoReplySettings.enabled" @change="toggleAutoReply" />
            </div>
          </template>
          <div class="auto-reply-settings" v-if="autoReplySettings.enabled">
            <div class="setting-item">
              <label>工作时间回复</label>
              <el-time-picker
                v-model="autoReplySettings.workingHours"
                is-range
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                size="small"
              />
            </div>
            <div class="setting-item">
              <label>默认回复消息</label>
              <el-input
                v-model="autoReplySettings.defaultMessage"
                type="textarea"
                :rows="3"
                placeholder="输入自动回复消息"
                maxlength="160"
                show-word-limit
              />
            </div>
            <div class="setting-item">
              <label>关键词回复</label>
              <div class="keyword-replies">
                <div v-for="(reply, index) in autoReplySettings.keywordReplies" :key="index" class="keyword-reply">
                  <el-input
                    v-model="reply.keywords"
                    placeholder="关键词 (用逗号分隔)"
                    size="small"
                  />
                  <el-input
                    v-model="reply.message"
                    placeholder="回复消息"
                    size="small"
                  />
                  <el-button type="danger" size="small" @click="removeKeywordReply(index)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
                <el-button type="primary" size="small" @click="addKeywordReply">
                  <el-icon><Plus /></el-icon>
                  添加关键词回复
                </el-button>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 快速统计 -->
        <el-card class="quick-stats-card">
          <template #header>
            <span>今日统计</span>
          </template>
          <div class="quick-stats">
            <div class="quick-stat-item">
              <div class="stat-value">{{ todayStats.sent }}</div>
              <div class="stat-label">已发送</div>
            </div>
            <div class="quick-stat-item">
              <div class="stat-value">{{ todayStats.delivered }}</div>
              <div class="stat-label">已送达</div>
            </div>
            <div class="quick-stat-item">
              <div class="stat-value">{{ todayStats.read }}</div>
              <div class="stat-label">已读取</div>
            </div>
            <div class="quick-stat-item">
              <div class="stat-value">{{ todayStats.replied }}</div>
              <div class="stat-label">已回复</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 创建模板对话框 -->
    <el-dialog v-model="createTemplateDialog.visible" title="创建消息模板" width="600px">
      <el-form :model="createTemplateDialog.form" label-width="100px">
        <el-form-item label="模板名称" required>
          <el-input v-model="createTemplateDialog.form.name" placeholder="输入模板名称" />
        </el-form-item>
        
        <el-form-item label="分类" required>
          <el-select v-model="createTemplateDialog.form.category" placeholder="选择分类">
            <el-option label="营销" value="marketing" />
            <el-option label="通知" value="notification" />
            <el-option label="验证" value="verification" />
            <el-option label="客服" value="service" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="语言" required>
          <el-select v-model="createTemplateDialog.form.language" placeholder="选择语言">
            <el-option label="中文" value="zh_CN" />
            <el-option label="英文" value="en_US" />
            <el-option label="西班牙语" value="es" />
            <el-option label="法语" value="fr" />
            <el-option label="德语" value="de" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="消息内容" required>
          <el-input
            v-model="createTemplateDialog.form.content"
            type="textarea"
            :rows="6"
            placeholder="输入消息内容，使用 {{变量名}} 添加变量"
            maxlength="1024"
            show-word-limit
          />
          <div class="template-variables">
            <span>常用变量：</span>
            <el-button 
              v-for="variable in commonVariables" 
              :key="variable" 
              size="small" 
              type="primary" 
              text
              @click="insertVariable(variable)"
            >
              {{ variable }}
            </el-button>
          </div>
        </el-form-item>
        
        <el-form-item label="预览">
          <div class="template-preview-box">
            <div class="message-bubble preview">
              <div class="message-text" v-html="formatTemplateText(createTemplateDialog.form.content)"></div>
            </div>
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="createTemplateDialog.visible = false">取消</el-button>
          <el-button @click="saveAsDraft">保存草稿</el-button>
          <el-button type="primary" @click="submitTemplate" :loading="submitting">
            提交审核
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 群发消息对话框 -->
    <el-dialog v-model="bulkSendDialog.visible" title="群发消息" width="800px">
      <el-steps :active="bulkSendDialog.currentStep" align-center>
        <el-step title="选择模板" />
        <el-step title="选择客户" />
        <el-step title="设置变量" />
        <el-step title="确认发送" />
      </el-steps>
      
      <div class="bulk-send-content">
        <!-- Step 1: 选择模板 -->
        <div v-if="bulkSendDialog.currentStep === 0" class="step-content">
          <div class="template-selection">
            <div v-for="template in approvedTemplates" :key="template.id" 
                 class="template-option" 
                 :class="{ selected: bulkSendDialog.selectedTemplate?.id === template.id }"
                 @click="selectTemplate(template)">
              <div class="template-info">
                <h4>{{ template.name }}</h4>
                <el-tag size="small">{{ getCategoryText(template.category) }}</el-tag>
              </div>
              <div class="template-content-preview">
                {{ template.content.substring(0, 100) }}...
              </div>
            </div>
          </div>
        </div>
        
        <!-- Step 2: 选择客户 -->
        <div v-if="bulkSendDialog.currentStep === 1" class="step-content">
          <div class="customer-selection">
            <el-tabs v-model="customerSelectionTab">
              <el-tab-pane label="选择分组" name="groups">
                <el-checkbox-group v-model="bulkSendDialog.selectedGroups">
                  <el-checkbox v-for="group in customerGroups" :key="group.id" :value="group.id">
                    {{ group.name }} ({{ group.count }} 人)
                  </el-checkbox>
                </el-checkbox-group>
              </el-tab-pane>
              <el-tab-pane label="手动选择" name="manual">
                <el-input
                  v-model="customerSearchKeyword"
                  placeholder="搜索客户"
                  prefix-icon="Search"
                  style="margin-bottom: 16px;"
                />
                <el-checkbox-group v-model="bulkSendDialog.selectedCustomers">
                  <el-checkbox 
                    v-for="customer in filteredCustomers" 
                    :key="customer.id" 
                    :value="customer.id"
                    style="display: block; margin-bottom: 8px;"
                  >
                    {{ customer.name }} - {{ customer.whatsapp }}
                  </el-checkbox>
                </el-checkbox-group>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
        
        <!-- Step 3: 设置变量 -->
        <div v-if="bulkSendDialog.currentStep === 2" class="step-content">
          <div class="variable-settings">
            <div v-if="bulkSendDialog.selectedTemplate?.variables?.length">
              <div v-for="variable in bulkSendDialog.selectedTemplate.variables" :key="variable" class="variable-setting">
                <label>{{ variable }}</label>
                <el-select 
                  v-model="bulkSendDialog.variableMapping[variable]" 
                  placeholder="选择数据源"
                >
                  <el-option label="客户姓名" value="customer_name" />
                  <el-option label="公司名称" value="company_name" />
                  <el-option label="自定义文本" value="custom_text" />
                </el-select>
                <el-input 
                  v-if="bulkSendDialog.variableMapping[variable] === 'custom_text'"
                  v-model="bulkSendDialog.customTexts[variable]"
                  placeholder="输入自定义内容"
                  style="margin-top: 8px;"
                />
              </div>
            </div>
            <div v-else>
              <el-empty description="此模板不包含变量" />
            </div>
          </div>
        </div>
        
        <!-- Step 4: 确认发送 -->
        <div v-if="bulkSendDialog.currentStep === 3" class="step-content">
          <div class="send-confirmation">
            <div class="summary">
              <h4>发送摘要</h4>
              <div class="summary-item">
                <span>模板：</span>
                <span>{{ bulkSendDialog.selectedTemplate?.name }}</span>
              </div>
              <div class="summary-item">
                <span>目标客户：</span>
                <span>{{ getTotalRecipients() }} 人</span>
              </div>
              <div class="summary-item">
                <span>预计费用：</span>
                <span>${{ (getTotalRecipients() * 0.05).toFixed(2) }}</span>
              </div>
            </div>
            
            <div class="send-options">
              <el-radio-group v-model="bulkSendDialog.sendType">
                <el-radio value="now">立即发送</el-radio>
                <el-radio value="schedule">定时发送</el-radio>
              </el-radio-group>
              <el-date-picker
                v-if="bulkSendDialog.sendType === 'schedule'"
                v-model="bulkSendDialog.scheduleTime"
                type="datetime"
                placeholder="选择发送时间"
                style="margin-left: 20px;"
              />
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="bulkSendDialog.visible = false">取消</el-button>
          <el-button 
            v-if="bulkSendDialog.currentStep > 0" 
            @click="prevStep"
          >
            上一步
          </el-button>
          <el-button 
            v-if="bulkSendDialog.currentStep < 3" 
            type="primary" 
            @click="nextStep"
            :disabled="!canProceedToNext()"
          >
            下一步
          </el-button>
          <el-button 
            v-if="bulkSendDialog.currentStep === 3" 
            type="primary" 
            @click="sendBulkMessage"
            :loading="sending"
          >
            {{ bulkSendDialog.sendType === 'now' ? '立即发送' : '安排发送' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 聊天记录对话框 -->
    <el-dialog v-model="chatListDialog.visible" title="聊天记录" width="1000px">
      <div class="chat-list-container">
        <div class="chat-contacts">
          <el-input
            v-model="chatSearchKeyword"
            placeholder="搜索联系人"
            prefix-icon="Search"
            size="small"
            style="margin-bottom: 16px;"
          />
          <div class="contact-list">
            <div v-for="contact in filteredChatContacts" :key="contact.id" 
                 class="contact-item"
                 :class="{ active: selectedChatContact?.id === contact.id }"
                 @click="selectChatContact(contact)">
              <el-avatar :src="contact.avatar" :size="40">{{ contact.name[0] }}</el-avatar>
              <div class="contact-info">
                <div class="contact-name">{{ contact.name }}</div>
                <div class="last-message">{{ contact.lastMessage }}</div>
              </div>
              <div class="contact-meta">
                <div class="last-time">{{ formatRelativeTime(contact.lastTime) }}</div>
                <el-badge v-if="contact.unreadCount" :value="contact.unreadCount" />
              </div>
            </div>
          </div>
        </div>
        
        <div class="chat-messages" v-if="selectedChatContact">
          <div class="chat-header">
            <div class="contact-info">
              <el-avatar :src="selectedChatContact.avatar" :size="32">{{ selectedChatContact.name[0] }}</el-avatar>
              <span class="contact-name">{{ selectedChatContact.name }}</span>
              <span class="contact-phone">{{ selectedChatContact.whatsapp }}</span>
            </div>
            <div class="chat-actions">
              <el-button size="small" type="primary" @click="replyToContact">回复</el-button>
            </div>
          </div>
          
          <div class="messages-container">
            <div v-for="message in selectedChatContact.messages" :key="message.id" 
                 class="message-item"
                 :class="message.type">
              <div class="message-content">
                <div class="message-text">{{ message.content }}</div>
                <div class="message-time">{{ formatTime(message.timestamp) }}</div>
              </div>
              <div class="message-status" v-if="message.type === 'sent'">
                <el-icon v-if="message.status === 'sent'" class="status-sent"><Clock /></el-icon>
                <el-icon v-else-if="message.status === 'delivered'" class="status-delivered"><Select /></el-icon>
                <el-icon v-else-if="message.status === 'read'" class="status-read"><View /></el-icon>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="no-chat-selected">
          <el-empty description="选择一个联系人查看聊天记录" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, ChatDotRound, ChatLineRound, MoreFilled, Select, View, Clock,
  Delete, Search
} from '@element-plus/icons-vue'

// 响应式数据
const whatsappStats = ref({
  totalMessages: 8945,
  messageGrowth: 18.5,
  deliveryRate: 97.8,
  deliveryGrowth: 2.1,
  openRate: 84.2,
  openGrowth: -1.5,
  replyRate: 23.6,
  replyGrowth: 8.3
})

const templateFilter = ref({
  status: '',
  category: ''
})

const templatePagination = ref({
  current: 1,
  size: 10,
  total: 25
})

const whatsappTemplates = ref([
  {
    id: 1,
    name: '产品推广模板',
    category: 'marketing',
    status: 'approved',
    language: 'zh_CN',
    content: '🎉 {{customer_name}}，我们的新产品 {{product_name}} 现已上市！限时优惠价格 {{price}}，点击链接了解详情：{{link}}',
    variables: ['customer_name', 'product_name', 'price', 'link'],
    lastUsed: '2024-03-15 14:30:00',
    sendCount: 1234,
    successRate: 96.8,
    replyRate: 18.5
  },
  {
    id: 2,
    name: '订单确认通知',
    category: 'notification',
    status: 'approved',
    language: 'zh_CN',
    content: '亲爱的 {{customer_name}}，您的订单 {{order_id}} 已确认，预计 {{delivery_date}} 送达。感谢您的购买！',
    variables: ['customer_name', 'order_id', 'delivery_date'],
    lastUsed: '2024-03-15 16:45:00',
    sendCount: 567,
    successRate: 98.2,
    replyRate: 5.3
  },
  {
    id: 3,
    name: '客户验证码',
    category: 'verification',
    status: 'approved',
    language: 'zh_CN',
    content: '您的验证码是：{{code}}，请在5分钟内使用。如非本人操作，请忽略此消息。',
    variables: ['code'],
    lastUsed: '2024-03-15 18:20:00',
    sendCount: 2345,
    successRate: 99.1,
    replyRate: 0.8
  },
  {
    id: 4,
    name: '客服问候语',
    category: 'service',
    status: 'pending',
    language: 'zh_CN',
    content: '您好 {{customer_name}}！感谢联系我们的客服。我是您的专属客服 {{agent_name}}，有什么可以帮助您的吗？',
    variables: ['customer_name', 'agent_name'],
    lastUsed: null,
    sendCount: 0,
    successRate: 0,
    replyRate: 0
  }
])

const connectionStatus = ref({
  status: 'connected', // connected, disconnected, connecting
  phoneNumber: '+86 138****1234',
  displayName: '海外营销助手',
  connectedAt: '2024-03-15 09:30:00'
})

const autoReplySettings = ref({
  enabled: true,
  workingHours: [new Date('2024-03-15 09:00:00'), new Date('2024-03-15 18:00:00')],
  defaultMessage: '感谢您的消息！我们的客服将在工作时间内回复您。工作时间：周一至周五 9:00-18:00',
  keywordReplies: [
    {
      keywords: '价格,报价,多少钱',
      message: '关于产品价格，请访问我们的官网查看详细报价，或联系客服获取专属优惠。'
    },
    {
      keywords: '发货,物流,快递',
      message: '我们支持全球发货，一般3-7个工作日到达。您可以随时查询物流状态。'
    }
  ]
})

const todayStats = ref({
  sent: 156,
  delivered: 152,
  read: 128,
  replied: 34
})

const createTemplateDialog = ref({
  visible: false,
  form: {
    name: '',
    category: '',
    language: 'zh_CN',
    content: ''
  }
})

const bulkSendDialog = ref({
  visible: false,
  currentStep: 0,
  selectedTemplate: null,
  selectedGroups: [],
  selectedCustomers: [],
  variableMapping: {},
  customTexts: {},
  sendType: 'now',
  scheduleTime: null
})

const chatListDialog = ref({
  visible: false
})

const submitting = ref(false)
const sending = ref(false)
const customerSelectionTab = ref('groups')
const customerSearchKeyword = ref('')
const chatSearchKeyword = ref('')
const selectedChatContact = ref(null)

const commonVariables = [
  '{{customer_name}}',
  '{{company_name}}',
  '{{product_name}}',
  '{{price}}',
  '{{link}}',
  '{{code}}',
  '{{date}}'
]

const customerGroups = ref([
  { id: 1, name: '高价值客户', count: 234 },
  { id: 2, name: '潜在客户', count: 567 },
  { id: 3, name: '活跃客户', count: 345 },
  { id: 4, name: '流失客户', count: 123 }
])

const customers = ref([
  { id: 1, name: '张三', whatsapp: '+86 138****1234', company: 'ABC公司' },
  { id: 2, name: '李四', whatsapp: '+86 139****5678', company: 'XYZ企业' },
  { id: 3, name: 'John Smith', whatsapp: '+1 555****9999', company: 'Tech Corp' }
])

const chatContacts = ref([
  {
    id: 1,
    name: '张三',
    whatsapp: '+86 138****1234',
    avatar: 'https://picsum.photos/40/40?random=1',
    lastMessage: '好的，我们考虑一下',
    lastTime: '2024-03-15 16:30:00',
    unreadCount: 0,
    messages: [
      {
        id: 1,
        type: 'sent',
        content: '您好！我们有一款新产品，性价比很高，您是否有兴趣了解？',
        timestamp: '2024-03-15 14:30:00',
        status: 'read'
      },
      {
        id: 2,
        type: 'received',
        content: '可以发一下详细资料吗？',
        timestamp: '2024-03-15 14:35:00'
      },
      {
        id: 3,
        type: 'sent',
        content: '当然可以！这是我们的产品手册 [附件]',
        timestamp: '2024-03-15 14:40:00',
        status: 'read'
      },
      {
        id: 4,
        type: 'received',
        content: '好的，我们考虑一下',
        timestamp: '2024-03-15 16:30:00'
      }
    ]
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    whatsapp: '+1 555****8888',
    avatar: 'https://picsum.photos/40/40?random=2',
    lastMessage: 'Thanks for the quick response!',
    lastTime: '2024-03-15 15:45:00',
    unreadCount: 2,
    messages: [
      {
        id: 1,
        type: 'received',
        content: 'Hi, I\'m interested in your products.',
        timestamp: '2024-03-15 15:30:00'
      },
      {
        id: 2,
        type: 'sent',
        content: 'Hello! Thank you for your interest. What specific products are you looking for?',
        timestamp: '2024-03-15 15:35:00',
        status: 'read'
      },
      {
        id: 3,
        type: 'received',
        content: 'I need bulk orders for electronics.',
        timestamp: '2024-03-15 15:40:00'
      },
      {
        id: 4,
        type: 'received',
        content: 'Thanks for the quick response!',
        timestamp: '2024-03-15 15:45:00'
      }
    ]
  }
])

// 计算属性
const filteredTemplates = computed(() => {
  return whatsappTemplates.value.filter(template => {
    const statusMatch = !templateFilter.value.status || 
      template.status === templateFilter.value.status
    const categoryMatch = !templateFilter.value.category || 
      template.category === templateFilter.value.category
    return statusMatch && categoryMatch
  })
})

const approvedTemplates = computed(() => {
  return whatsappTemplates.value.filter(t => t.status === 'approved')
})

const filteredCustomers = computed(() => {
  if (!customerSearchKeyword.value) return customers.value
  return customers.value.filter(customer =>
    customer.name.toLowerCase().includes(customerSearchKeyword.value.toLowerCase()) ||
    customer.whatsapp.includes(customerSearchKeyword.value) ||
    customer.company.toLowerCase().includes(customerSearchKeyword.value.toLowerCase())
  )
})

const filteredChatContacts = computed(() => {
  if (!chatSearchKeyword.value) return chatContacts.value
  return chatContacts.value.filter(contact =>
    contact.name.toLowerCase().includes(chatSearchKeyword.value.toLowerCase()) ||
    contact.whatsapp.includes(chatSearchKeyword.value)
  )
})

// 方法
const showCreateTemplate = () => {
  createTemplateDialog.value.visible = true
  createTemplateDialog.value.form = {
    name: '',
    category: '',
    language: 'zh_CN',
    content: ''
  }
}

const showBulkSend = () => {
  bulkSendDialog.value.visible = true
  bulkSendDialog.value.currentStep = 0
  bulkSendDialog.value.selectedTemplate = null
  bulkSendDialog.value.selectedGroups = []
  bulkSendDialog.value.selectedCustomers = []
  bulkSendDialog.value.variableMapping = {}
  bulkSendDialog.value.customTexts = {}
}

const showChatList = () => {
  chatListDialog.value.visible = true
  selectedChatContact.value = null
}

const getStatusTagType = (status) => {
  const types = {
    approved: 'success',
    pending: 'warning',
    rejected: 'danger',
    draft: 'info'
  }
  return types[status] || 'default'
}

const getStatusText = (status) => {
  const texts = {
    approved: '已批准',
    pending: '待审核',
    rejected: '已拒绝',
    draft: '草稿'
  }
  return texts[status] || status
}

const getCategoryText = (category) => {
  const texts = {
    marketing: '营销',
    notification: '通知',
    verification: '验证',
    service: '客服'
  }
  return texts[category] || category
}

const getConnectionStatusText = (status) => {
  const texts = {
    connected: '已连接',
    disconnected: '未连接',
    connecting: '连接中'
  }
  return texts[status] || status
}

const formatTemplateText = (text) => {
  if (!text) return ''
  return text.replace(/\{\{([^}]+)\}\}/g, '<span class="template-variable">{{$1}}</span>')
}

const formatTime = (timeStr) => {
  const date = new Date(timeStr)
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
}

const formatRelativeTime = (timeStr) => {
  const now = new Date()
  const time = new Date(timeStr)
  const diff = Math.floor((now - time) / (1000 * 60))
  
  if (diff < 1) return '刚刚'
  if (diff < 60) return `${diff}分钟前`
  if (diff < 1440) return `${Math.floor(diff / 60)}小时前`
  return `${Math.floor(diff / 1440)}天前`
}

const handleTemplateAction = (command) => {
  const [action, id] = command.split('-')
  const templateId = parseInt(id)
  
  switch (action) {
    case 'send':
      sendWithTemplate(templateId)
      break
    case 'edit':
      editTemplate(templateId)
      break
    case 'duplicate':
      duplicateTemplate(templateId)
      break
    case 'analytics':
      viewTemplateAnalytics(templateId)
      break
    case 'delete':
      deleteTemplate(templateId)
      break
  }
}

const sendWithTemplate = (id) => {
  const template = whatsappTemplates.value.find(t => t.id === id)
  if (template) {
    bulkSendDialog.value.selectedTemplate = template
    showBulkSend()
  }
}

const editTemplate = (id) => {
  const template = whatsappTemplates.value.find(t => t.id === id)
  if (template) {
    createTemplateDialog.value.form = { ...template }
    createTemplateDialog.value.visible = true
  }
}

const duplicateTemplate = (id) => {
  const template = whatsappTemplates.value.find(t => t.id === id)
  if (template) {
    const newTemplate = {
      ...template,
      id: Date.now(),
      name: `${template.name} (副本)`,
      status: 'draft'
    }
    whatsappTemplates.value.unshift(newTemplate)
    ElMessage.success('模板已复制')
  }
}

const viewTemplateAnalytics = (id) => {
  ElMessage.info('查看模板分析功能开发中')
}

const deleteTemplate = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个模板吗？', '确认删除', {
      type: 'warning'
    })
    const index = whatsappTemplates.value.findIndex(t => t.id === id)
    if (index > -1) {
      whatsappTemplates.value.splice(index, 1)
      ElMessage.success('模板已删除')
    }
  } catch {
    // 用户取消删除
  }
}

const handleTemplatePageChange = (page) => {
  templatePagination.value.current = page
}

const connectWhatsApp = () => {
  connectionStatus.value.status = 'connecting'
  setTimeout(() => {
    connectionStatus.value.status = 'connected'
    connectionStatus.value.connectedAt = new Date().toISOString()
    ElMessage.success('WhatsApp连接成功')
  }, 3000)
}

const disconnectWhatsApp = () => {
  connectionStatus.value.status = 'disconnected'
  ElMessage.info('WhatsApp连接已断开')
}

const toggleAutoReply = (enabled) => {
  if (enabled) {
    ElMessage.success('自动回复已启用')
  } else {
    ElMessage.info('自动回复已关闭')
  }
}

const addKeywordReply = () => {
  autoReplySettings.value.keywordReplies.push({
    keywords: '',
    message: ''
  })
}

const removeKeywordReply = (index) => {
  autoReplySettings.value.keywordReplies.splice(index, 1)
}

const insertVariable = (variable) => {
  const textarea = document.querySelector('textarea')
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = createTemplateDialog.value.form.content
  
  createTemplateDialog.value.form.content = 
    text.substring(0, start) + variable + text.substring(end)
}

const saveAsDraft = () => {
  const newTemplate = {
    id: Date.now(),
    ...createTemplateDialog.value.form,
    status: 'draft',
    variables: extractVariables(createTemplateDialog.value.form.content),
    lastUsed: null,
    sendCount: 0,
    successRate: 0,
    replyRate: 0
  }
  whatsappTemplates.value.unshift(newTemplate)
  createTemplateDialog.value.visible = false
  ElMessage.success('模板已保存为草稿')
}

const submitTemplate = async () => {
  submitting.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const newTemplate = {
      id: Date.now(),
      ...createTemplateDialog.value.form,
      status: 'pending',
      variables: extractVariables(createTemplateDialog.value.form.content),
      lastUsed: null,
      sendCount: 0,
      successRate: 0,
      replyRate: 0
    }
    
    whatsappTemplates.value.unshift(newTemplate)
    createTemplateDialog.value.visible = false
    ElMessage.success('模板已提交审核')
  } catch (error) {
    ElMessage.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

const extractVariables = (content) => {
  if (!content) return []
  const matches = content.match(/\{\{([^}]+)\}\}/g)
  return matches ? matches.map(match => match.slice(2, -2)) : []
}

const selectTemplate = (template) => {
  bulkSendDialog.value.selectedTemplate = template
}

const nextStep = () => {
  bulkSendDialog.value.currentStep++
}

const prevStep = () => {
  bulkSendDialog.value.currentStep--
}

const canProceedToNext = () => {
  switch (bulkSendDialog.value.currentStep) {
    case 0:
      return bulkSendDialog.value.selectedTemplate !== null
    case 1:
      return bulkSendDialog.value.selectedGroups.length > 0 || 
             bulkSendDialog.value.selectedCustomers.length > 0
    case 2:
      return true // 变量设置是可选的
    default:
      return false
  }
}

const getTotalRecipients = () => {
  let total = 0
  
  // 计算分组中的客户数量
  bulkSendDialog.value.selectedGroups.forEach(groupId => {
    const group = customerGroups.value.find(g => g.id === groupId)
    if (group) total += group.count
  })
  
  // 添加手动选择的客户数量
  total += bulkSendDialog.value.selectedCustomers.length
  
  return total
}

const sendBulkMessage = async () => {
  sending.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    bulkSendDialog.value.visible = false
    
    if (bulkSendDialog.value.sendType === 'now') {
      ElMessage.success(`消息已发送给 ${getTotalRecipients()} 位客户`)
    } else {
      ElMessage.success(`消息已安排在 ${formatTime(bulkSendDialog.value.scheduleTime)} 发送`)
    }
  } catch (error) {
    ElMessage.error('发送失败，请重试')
  } finally {
    sending.value = false
  }
}

const selectChatContact = (contact) => {
  selectedChatContact.value = contact
  // 清除未读消息数量
  contact.unreadCount = 0
}

const replyToContact = () => {
  ElMessage.info('回复功能开发中')
}

onMounted(() => {
  // 模拟实时数据更新
  setInterval(() => {
    if (Math.random() > 0.8) {
      todayStats.value.sent += Math.floor(Math.random() * 3)
      todayStats.value.delivered += Math.floor(Math.random() * 2)
      todayStats.value.read += Math.floor(Math.random() * 2)
      if (Math.random() > 0.7) {
        todayStats.value.replied += 1
      }
    }
  }, 10000)
})
</script>

<style scoped>
.whatsapp-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  height: 120px;
}

.stat-item {
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  color: white;
}

.stat-icon.messages {
  background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
}

.stat-icon.delivered {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.opened {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-icon.replied {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-content h3 {
  margin: 0 0 4px 0;
  font-size: 28px;
  font-weight: 600;
}

.stat-content p {
  margin: 0 0 4px 0;
  color: #666;
  font-size: 14px;
}

.growth-rate {
  font-size: 12px;
  font-weight: 500;
}

.growth-rate.positive {
  color: #67c23a;
}

.growth-rate.negative {
  color: #f56c6c;
}

.main-content {
  margin-top: 20px;
}

.template-card {
  min-height: 600px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-filters {
  display: flex;
  gap: 12px;
}

.template-list {
  margin: 20px 0;
}

.template-item {
  display: flex;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  margin-bottom: 16px;
  background: white;
  transition: all 0.3s;
}

.template-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.template-content {
  flex: 1;
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.template-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.template-meta {
  display: flex;
  gap: 8px;
}

.template-preview {
  margin-bottom: 16px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
  color: #666;
}

.message-bubble {
  background: #f0f9ff;
  border: 1px solid #e1f5fe;
  border-radius: 12px;
  padding: 12px 16px;
  position: relative;
}

.message-bubble.preview {
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
}

.message-text {
  line-height: 1.4;
  margin-bottom: 8px;
}

.template-variable {
  background: #e3f2fd;
  color: #1976d2;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.message-variables {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.variable-label {
  color: #666;
}

.variable-tag {
  margin: 0 2px;
}

.template-stats {
  display: flex;
  gap: 24px;
  font-size: 12px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat .label {
  color: #666;
  margin-bottom: 2px;
}

.stat .value {
  font-weight: 500;
  color: #333;
}

.template-actions {
  margin-left: 16px;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}

.connection-status-card {
  margin-bottom: 20px;
}

.connection-info {
  text-align: center;
}

.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
  font-weight: 500;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-indicator.connected .status-dot {
  background: #67c23a;
}

.status-indicator.disconnected .status-dot {
  background: #f56c6c;
}

.status-indicator.connecting .status-dot {
  background: #e6a23c;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.connection-details {
  text-align: left;
  margin-bottom: 16px;
  font-size: 14px;
}

.connection-details p {
  margin: 4px 0;
}

.auto-reply-card {
  margin-bottom: 20px;
}

.auto-reply-settings {
  margin-top: 16px;
}

.setting-item {
  margin-bottom: 16px;
}

.setting-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 14px;
}

.keyword-replies {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.keyword-reply {
  display: flex;
  gap: 8px;
  align-items: center;
}

.quick-stats-card .quick-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.quick-stat-item {
  text-align: center;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #25d366;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.template-variables {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.template-preview-box {
  margin-top: 8px;
}

.bulk-send-content {
  margin: 20px 0;
  min-height: 300px;
}

.step-content {
  padding: 20px 0;
}

.template-selection {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.template-option {
  padding: 16px;
  border: 2px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.template-option:hover {
  border-color: #409eff;
}

.template-option.selected {
  border-color: #409eff;
  background: #f0f9ff;
}

.template-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.template-info h4 {
  margin: 0;
}

.template-content-preview {
  color: #666;
  font-size: 14px;
}

.customer-selection {
  min-height: 250px;
}

.variable-settings {
  min-height: 200px;
}

.variable-setting {
  margin-bottom: 16px;
}

.variable-setting label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.send-confirmation .summary {
  background: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.summary h4 {
  margin: 0 0 12px 0;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.send-options {
  display: flex;
  align-items: center;
}

.chat-list-container {
  display: flex;
  height: 500px;
}

.chat-contacts {
  width: 300px;
  border-right: 1px solid #ebeef5;
  padding-right: 16px;
}

.contact-list {
  height: 400px;
  overflow-y: auto;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.contact-item:hover {
  background: #f5f7fa;
}

.contact-item.active {
  background: #e3f2fd;
}

.contact-info {
  flex: 1;
  margin: 0 12px;
}

.contact-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.last-message {
  font-size: 12px;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.contact-meta {
  text-align: right;
}

.last-time {
  font-size: 11px;
  color: #999;
  margin-bottom: 4px;
}

.chat-messages {
  flex: 1;
  padding-left: 16px;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.chat-header .contact-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.contact-phone {
  font-size: 12px;
  color: #666;
}

.messages-container {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
}

.message-item {
  display: flex;
  margin-bottom: 16px;
}

.message-item.sent {
  justify-content: flex-end;
}

.message-item.received {
  justify-content: flex-start;
}

.message-content {
  max-width: 70%;
  padding: 8px 12px;
  border-radius: 12px;
  position: relative;
}

.message-item.sent .message-content {
  background: #25d366;
  color: white;
}

.message-item.received .message-content {
  background: #f0f0f0;
  color: #333;
}

.message-text {
  margin-bottom: 4px;
}

.message-time {
  font-size: 11px;
  opacity: 0.7;
}

.message-status {
  margin-left: 8px;
  display: flex;
  align-items: flex-end;
}

.status-sent {
  color: #999;
}

.status-delivered {
  color: #409eff;
}

.status-read {
  color: #67c23a;
}

.no-chat-selected {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.danger {
  color: #f56c6c !important;
}
</style>
