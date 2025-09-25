<template>
  <div class="channel-settings">
    <div class="settings-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/campaign/list' }">活动列表</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/campaign/create' }">创建活动</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/campaign/customer-selection' }">客户选择</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/campaign/content-config' }">内容配置</el-breadcrumb-item>
        <el-breadcrumb-item>渠道设置</el-breadcrumb-item>
      </el-breadcrumb>
      
      <div class="settings-actions">
        <el-button @click="testAllChannels" :loading="testingChannels">
          测试所有渠道
        </el-button>
        <el-button @click="saveAsTemplate">
          保存为模板
        </el-button>
        <el-button type="primary" @click="launchCampaign" :disabled="!canLaunch">
          启动营销活动
        </el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <!-- 左侧渠道配置区域 -->
      <el-col :span="16">
        <div class="channel-config">
          <el-tabs v-model="activeChannelTab" @tab-change="handleChannelTabChange">
            <!-- 邮件营销配置 -->
            <el-tab-pane name="email">
              <template #label>
                <span class="channel-tab-label">
                  <el-icon><Message /></el-icon>
                  邮件营销
                  <el-badge 
                    v-if="emailSettings.enabled" 
                    is-dot 
                    class="channel-status-badge"
                  />
                </span>
              </template>
              
              <div class="channel-panel">
                <div class="channel-header">
                  <div class="channel-info">
                    <h3>邮件营销配置</h3>
                    <p>配置邮件发送参数、发送策略和追踪设置</p>
                  </div>
                  <el-switch 
                    v-model="emailSettings.enabled" 
                    active-text="启用" 
                    inactive-text="禁用"
                    size="large"
                  />
                </div>

                <div v-if="emailSettings.enabled" class="channel-content">
                  <el-form :model="emailSettings" :rules="emailRules" ref="emailFormRef" label-width="140px">
                    <el-form-item label="发送邮箱配置" prop="senderConfig">
                      <el-row :gutter="12">
                        <el-col :span="12">
                          <el-select v-model="emailSettings.senderConfig.account" placeholder="选择发送邮箱">
                            <el-option 
                              v-for="account in emailAccounts"
                              :key="account.id"
                              :label="account.email"
                              :value="account.id"
                            >
                              <div class="email-account-option">
                                <span>{{ account.email }}</span>
                                <el-tag :type="account.status === 'verified' ? 'success' : 'warning'" size="small">
                                  {{ account.status === 'verified' ? '已验证' : '未验证' }}
                                </el-tag>
                              </div>
                            </el-option>
                          </el-select>
                        </el-col>
                        <el-col :span="12">
                          <el-input v-model="emailSettings.senderConfig.name" placeholder="发送者姓名" />
                        </el-col>
                      </el-row>
                    </el-form-item>

                    <el-form-item label="邮件主题" prop="subject">
                      <el-input 
                        v-model="emailSettings.subject" 
                        placeholder="输入邮件主题，支持个性化变量"
                        maxlength="100"
                        show-word-limit
                      >
                        <template #append>
                          <el-button @click="insertEmailVariable('subject')">
                            <el-icon><Plus /></el-icon>
                            变量
                          </el-button>
                        </template>
                      </el-input>
                    </el-form-item>

                    <el-form-item label="发送策略">
                      <el-radio-group v-model="emailSettings.strategy.type">
                        <el-radio value="immediate">立即发送</el-radio>
                        <el-radio value="smart">智能发送</el-radio>
                        <el-radio value="batch">分批发送</el-radio>
                      </el-radio-group>
                    </el-form-item>

                    <el-form-item v-if="emailSettings.strategy.type === 'smart'" label="智能发送设置">
                      <div class="smart-send-config">
                        <el-checkbox v-model="emailSettings.strategy.smartSend.optimizeByTimezone">
                          按时区优化发送时间
                        </el-checkbox>
                        <el-checkbox v-model="emailSettings.strategy.smartSend.optimizeByBehavior">
                          按客户行为优化
                        </el-checkbox>
                        <el-checkbox v-model="emailSettings.strategy.smartSend.avoidBusyHours">
                          避开高峰时段
                        </el-checkbox>
                      </div>
                    </el-form-item>

                    <el-form-item v-if="emailSettings.strategy.type === 'batch'" label="分批发送设置">
                      <el-row :gutter="12">
                        <el-col :span="8">
                          <el-input-number 
                            v-model="emailSettings.strategy.batch.size" 
                            :min="10" 
                            :max="1000"
                            controls-position="right"
                          />
                          <span style="margin-left: 8px;">每批数量</span>
                        </el-col>
                        <el-col :span="8">
                          <el-input-number 
                            v-model="emailSettings.strategy.batch.interval" 
                            :min="1" 
                            :max="60"
                            controls-position="right"
                          />
                          <span style="margin-left: 8px;">间隔分钟</span>
                        </el-col>
                        <el-col :span="8">
                          <el-time-select
                            v-model="emailSettings.strategy.batch.startTime"
                            start="06:00"
                            step="00:30"
                            end="23:30"
                            placeholder="开始时间"
                          />
                        </el-col>
                      </el-row>
                    </el-form-item>

                    <el-form-item label="重试设置">
                      <el-row :gutter="12">
                        <el-col :span="8">
                          <el-input-number 
                            v-model="emailSettings.retry.maxAttempts" 
                            :min="0" 
                            :max="5"
                            controls-position="right"
                          />
                          <span style="margin-left: 8px;">最大重试次数</span>
                        </el-col>
                        <el-col :span="8">
                          <el-input-number 
                            v-model="emailSettings.retry.interval" 
                            :min="5" 
                            :max="60"
                            controls-position="right"
                          />
                          <span style="margin-left: 8px;">重试间隔(分钟)</span>
                        </el-col>
                      </el-row>
                    </el-form-item>

                    <el-form-item label="追踪设置">
                      <el-checkbox-group v-model="emailSettings.tracking">
                        <el-checkbox value="open">打开追踪</el-checkbox>
                        <el-checkbox value="click">点击追踪</el-checkbox>
                        <el-checkbox value="bounce">退信追踪</el-checkbox>
                        <el-checkbox value="unsubscribe">退订追踪</el-checkbox>
                        <el-checkbox value="forward">转发追踪</el-checkbox>
                      </el-checkbox-group>
                    </el-form-item>

                    <el-form-item>
                      <el-button @click="testEmailChannel" :loading="emailSettings.testing">
                        测试邮件发送
                      </el-button>
                    </el-form-item>
                  </el-form>
                </div>
              </div>
            </el-tab-pane>

            <!-- 社交媒体配置 -->
            <el-tab-pane name="social">
              <template #label>
                <span class="channel-tab-label">
                  <el-icon><Share /></el-icon>
                  社交媒体
                  <el-badge 
                    v-if="socialSettings.enabled" 
                    is-dot 
                    class="channel-status-badge"
                  />
                </span>
              </template>
              
              <div class="channel-panel">
                <div class="channel-header">
                  <div class="channel-info">
                    <h3>社交媒体营销配置</h3>
                    <p>配置各社交媒体平台的发布设置和策略</p>
                  </div>
                  <el-switch 
                    v-model="socialSettings.enabled" 
                    active-text="启用" 
                    inactive-text="禁用"
                    size="large"
                  />
                </div>

                <div v-if="socialSettings.enabled" class="channel-content">
                  <div class="social-platforms">
                    <div 
                      v-for="platform in socialPlatforms"
                      :key="platform.id"
                      class="platform-config"
                    >
                      <div class="platform-header">
                        <div class="platform-info">
                          <img :src="platform.icon" :alt="platform.name" class="platform-icon" />
                          <div class="platform-details">
                            <h4>{{ platform.name }}</h4>
                            <p>{{ platform.description }}</p>
                          </div>
                        </div>
                        <el-switch 
                          v-model="platform.enabled" 
                          @change="togglePlatform(platform)"
                        />
                      </div>

                      <div v-if="platform.enabled" class="platform-settings">
                        <el-form :model="platform.settings" label-width="120px">
                          <el-form-item label="发布账号">
                            <el-select 
                              v-model="platform.settings.accountId" 
                              placeholder="选择发布账号"
                            >
                              <el-option 
                                v-for="account in platform.accounts"
                                :key="account.id"
                                :label="account.name"
                                :value="account.id"
                              >
                                <div class="social-account-option">
                                  <span>{{ account.name }}</span>
                                  <el-tag size="small">{{ account.followersCount }}粉丝</el-tag>
                                </div>
                              </el-option>
                            </el-select>
                          </el-form-item>

                          <el-form-item label="发布时间">
                            <el-radio-group v-model="platform.settings.publishTime.type">
                              <el-radio value="immediate">立即发布</el-radio>
                              <el-radio value="scheduled">定时发布</el-radio>
                              <el-radio value="optimal">最佳时间</el-radio>
                            </el-radio-group>
                          </el-form-item>

                          <el-form-item v-if="platform.settings.publishTime.type === 'scheduled'" label="发布时间">
                            <el-date-picker
                              v-model="platform.settings.publishTime.scheduledTime"
                              type="datetime"
                              placeholder="选择发布时间"
                              value-format="YYYY-MM-DD HH:mm:ss"
                            />
                          </el-form-item>

                          <el-form-item label="内容策略">
                            <el-checkbox-group v-model="platform.settings.contentStrategy">
                              <el-checkbox value="hashtags">自动添加标签</el-checkbox>
                              <el-checkbox value="mentions">自动@相关用户</el-checkbox>
                              <el-checkbox value="crossPost">跨平台同步</el-checkbox>
                            </el-checkbox-group>
                          </el-form-item>

                          <el-form-item v-if="platform.settings.contentStrategy.includes('hashtags')" label="热门标签">
                            <el-select 
                              v-model="platform.settings.hashtags"
                              multiple
                              filterable
                              allow-create
                              placeholder="选择或创建标签"
                            >
                              <el-option 
                                v-for="tag in platform.popularHashtags"
                                :key="tag"
                                :label="tag"
                                :value="tag"
                              />
                            </el-select>
                          </el-form-item>
                        </el-form>
                      </div>
                    </div>
                  </div>

                  <div class="social-actions">
                    <el-button @click="testSocialChannels" :loading="socialSettings.testing">
                      测试社媒发布
                    </el-button>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <!-- 短信营销配置 -->
            <el-tab-pane name="sms">
              <template #label>
                <span class="channel-tab-label">
                  <el-icon><ChatDotSquare /></el-icon>
                  短信营销
                  <el-badge 
                    v-if="smsSettings.enabled" 
                    is-dot 
                    class="channel-status-badge"
                  />
                </span>
              </template>
              
              <div class="channel-panel">
                <div class="channel-header">
                  <div class="channel-info">
                    <h3>短信营销配置</h3>
                    <p>配置短信发送服务、内容和发送策略</p>
                  </div>
                  <el-switch 
                    v-model="smsSettings.enabled" 
                    active-text="启用" 
                    inactive-text="禁用"
                    size="large"
                  />
                </div>

                <div v-if="smsSettings.enabled" class="channel-content">
                  <el-form :model="smsSettings" :rules="smsRules" ref="smsFormRef" label-width="140px">
                    <el-form-item label="短信服务商" prop="provider">
                      <el-select v-model="smsSettings.provider.id" @change="loadProviderConfig">
                        <el-option 
                          v-for="provider in smsProviders"
                          :key="provider.id"
                          :label="provider.name"
                          :value="provider.id"
                        >
                          <div class="provider-option">
                            <img :src="provider.logo" :alt="provider.name" class="provider-logo" />
                            <div class="provider-details">
                              <span class="provider-name">{{ provider.name }}</span>
                              <span class="provider-rate">{{ provider.rate }}元/条</span>
                            </div>
                          </div>
                        </el-option>
                      </el-select>
                    </el-form-item>

                    <el-form-item label="发送签名" prop="signature">
                      <el-input 
                        v-model="smsSettings.signature" 
                        placeholder="【公司名称】"
                        maxlength="20"
                        show-word-limit
                      />
                    </el-form-item>

                    <el-form-item label="短信内容" prop="content">
                      <div class="sms-content-editor">
                        <el-input
                          v-model="smsSettings.content"
                          type="textarea"
                          :rows="4"
                          placeholder="输入短信内容，支持个性化变量"
                          maxlength="500"
                          show-word-limit
                          @input="updateSmsPreview"
                        />
                        <div class="sms-toolbar">
                          <el-button size="small" @click="insertSmsVariable('客户姓名')">
                            <el-icon><User /></el-icon>
                            客户姓名
                          </el-button>
                          <el-button size="small" @click="insertSmsVariable('优惠码')">
                            <el-icon><Ticket /></el-icon>
                            优惠码
                          </el-button>
                          <el-button size="small" @click="insertSmsVariable('链接')">
                            <el-icon><Link /></el-icon>
                            链接
                          </el-button>
                        </div>
                      </div>
                    </el-form-item>

                    <el-form-item label="发送时间限制">
                      <div class="time-restrictions">
                        <el-checkbox v-model="smsSettings.timeRestrictions.enabled">
                          启用发送时间限制
                        </el-checkbox>
                        <div v-if="smsSettings.timeRestrictions.enabled" class="time-range-config">
                          <el-row :gutter="12">
                            <el-col :span="6">
                              <el-time-picker
                                v-model="smsSettings.timeRestrictions.startTime"
                                placeholder="开始时间"
                                format="HH:mm"
                                value-format="HH:mm"
                              />
                            </el-col>
                            <el-col :span="6">
                              <el-time-picker
                                v-model="smsSettings.timeRestrictions.endTime"
                                placeholder="结束时间"
                                format="HH:mm"
                                value-format="HH:mm"
                              />
                            </el-col>
                            <el-col :span="12">
                              <el-checkbox-group v-model="smsSettings.timeRestrictions.allowedDays">
                                <el-checkbox value="1">周一</el-checkbox>
                                <el-checkbox value="2">周二</el-checkbox>
                                <el-checkbox value="3">周三</el-checkbox>
                                <el-checkbox value="4">周四</el-checkbox>
                                <el-checkbox value="5">周五</el-checkbox>
                                <el-checkbox value="6">周六</el-checkbox>
                                <el-checkbox value="7">周日</el-checkbox>
                              </el-checkbox-group>
                            </el-col>
                          </el-row>
                        </div>
                      </div>
                    </el-form-item>

                    <el-form-item label="频率控制">
                      <el-row :gutter="12">
                        <el-col :span="8">
                          <el-input-number 
                            v-model="smsSettings.frequencyControl.maxPerDay" 
                            :min="1" 
                            :max="10"
                            controls-position="right"
                          />
                          <span style="margin-left: 8px;">每日最大发送数</span>
                        </el-col>
                        <el-col :span="8">
                          <el-input-number 
                            v-model="smsSettings.frequencyControl.minInterval" 
                            :min="10" 
                            :max="1440"
                            controls-position="right"
                          />
                          <span style="margin-left: 8px;">最小间隔(分钟)</span>
                        </el-col>
                      </el-row>
                    </el-form-item>

                    <el-form-item>
                      <el-button @click="testSmsChannel" :loading="smsSettings.testing">
                        发送测试短信
                      </el-button>
                    </el-form-item>
                  </el-form>
                </div>
              </div>
            </el-tab-pane>

            <!-- 推送通知配置 -->
            <el-tab-pane name="push">
              <template #label>
                <span class="channel-tab-label">
                  <el-icon><Bell /></el-icon>
                  推送通知
                  <el-badge 
                    v-if="pushSettings.enabled" 
                    is-dot 
                    class="channel-status-badge"
                  />
                </span>
              </template>
              
              <div class="channel-panel">
                <div class="channel-header">
                  <div class="channel-info">
                    <h3>推送通知配置</h3>
                    <p>配置APP推送、Web推送和微信小程序通知</p>
                  </div>
                  <el-switch 
                    v-model="pushSettings.enabled" 
                    active-text="启用" 
                    inactive-text="禁用"
                    size="large"
                  />
                </div>

                <div v-if="pushSettings.enabled" class="channel-content">
                  <div class="push-types">
                    <el-radio-group v-model="pushSettings.type" @change="changePushType">
                      <el-radio-button value="app">APP推送</el-radio-button>
                      <el-radio-button value="web">Web推送</el-radio-button>
                      <el-radio-button value="wechat">微信小程序</el-radio-button>
                    </el-radio-group>
                  </div>

                  <el-form :model="pushSettings" label-width="140px">
                    <el-form-item label="推送标题">
                      <el-input 
                        v-model="pushSettings.title" 
                        placeholder="输入推送通知标题"
                        maxlength="50"
                        show-word-limit
                      />
                    </el-form-item>

                    <el-form-item label="推送内容">
                      <el-input
                        v-model="pushSettings.content"
                        type="textarea"
                        :rows="3"
                        placeholder="输入推送通知内容"
                        maxlength="200"
                        show-word-limit
                      />
                    </el-form-item>

                    <el-form-item label="推送图标">
                      <el-upload
                        v-model:file-list="pushSettings.icon"
                        :action="uploadUrl"
                        :limit="1"
                        list-type="picture-card"
                        :on-success="handleIconUpload"
                      >
                        <el-icon><Plus /></el-icon>
                      </el-upload>
                    </el-form-item>

                    <el-form-item label="点击行为">
                      <el-select v-model="pushSettings.clickAction.type">
                        <el-option label="打开应用" value="open_app" />
                        <el-option label="打开网页" value="open_url" />
                        <el-option label="打开特定页面" value="open_page" />
                      </el-select>
                    </el-form-item>

                    <el-form-item v-if="pushSettings.clickAction.type === 'open_url'" label="目标链接">
                      <el-input 
                        v-model="pushSettings.clickAction.url" 
                        placeholder="输入目标链接"
                      />
                    </el-form-item>

                    <el-form-item v-if="pushSettings.clickAction.type === 'open_page'" label="目标页面">
                      <el-input 
                        v-model="pushSettings.clickAction.page" 
                        placeholder="输入页面路径"
                      />
                    </el-form-item>

                    <el-form-item label="发送策略">
                      <el-radio-group v-model="pushSettings.strategy">
                        <el-radio value="all">全量推送</el-radio>
                        <el-radio value="staged">分阶段推送</el-radio>
                        <el-radio value="personalized">个性化推送</el-radio>
                      </el-radio-group>
                    </el-form-item>

                    <el-form-item v-if="pushSettings.strategy === 'staged'" label="推送批次">
                      <el-row :gutter="12">
                        <el-col :span="8">
                          <el-input-number 
                            v-model="pushSettings.stagedConfig.batchSize" 
                            :min="100" 
                            :max="10000"
                            controls-position="right"
                          />
                          <span style="margin-left: 8px;">每批数量</span>
                        </el-col>
                        <el-col :span="8">
                          <el-input-number 
                            v-model="pushSettings.stagedConfig.interval" 
                            :min="5" 
                            :max="60"
                            controls-position="right"
                          />
                          <span style="margin-left: 8px;">间隔分钟</span>
                        </el-col>
                      </el-row>
                    </el-form-item>

                    <el-form-item>
                      <el-button @click="testPushChannel" :loading="pushSettings.testing">
                        发送测试推送
                      </el-button>
                    </el-form-item>
                  </el-form>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-col>

      <!-- 右侧优先级和概览区域 -->
      <el-col :span="8">
        <div class="priority-panel">
          <el-card>
            <template #header>
              <h4>渠道优先级</h4>
            </template>
            
            <div class="priority-list">
              <draggable 
                v-model="channelPriorities" 
                item-key="id"
                @end="updatePriorities"
              >
                <template #item="{ element }">
                  <div class="priority-item" :class="{ 'disabled': !element.enabled }">
                    <div class="priority-rank">{{ element.priority }}</div>
                    <div class="priority-info">
                      <div class="channel-name">
                        <el-icon><component :is="element.icon" /></el-icon>
                        {{ element.name }}
                      </div>
                      <div class="channel-status">
                        <el-tag :type="element.enabled ? 'success' : 'info'">
                          {{ element.enabled ? '已启用' : '未启用' }}
                        </el-tag>
                      </div>
                    </div>
                    <div class="priority-actions">
                      <el-icon class="drag-handle"><Rank /></el-icon>
                    </div>
                  </div>
                </template>
              </draggable>
            </div>
          </el-card>

          <el-card>
            <template #header>
              <h4>发送概览</h4>
            </template>
            
            <div class="send-overview">
              <div class="overview-stats">
                <div class="stat-item">
                  <span class="stat-label">目标受众:</span>
                  <span class="stat-value">{{ targetAudience }}人</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">启用渠道:</span>
                  <span class="stat-value">{{ enabledChannelsCount }}个</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">预估送达:</span>
                  <span class="stat-value">{{ estimatedReach }}人</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">预计花费:</span>
                  <span class="stat-value">¥{{ estimatedCost }}</span>
                </div>
              </div>

              <div class="channel-breakdown">
                <div 
                  v-for="channel in enabledChannels"
                  :key="channel.id"
                  class="breakdown-item"
                >
                  <div class="breakdown-header">
                    <span class="channel-name">{{ channel.name }}</span>
                    <span class="channel-coverage">{{ channel.coverage }}%</span>
                  </div>
                  <el-progress 
                    :percentage="channel.coverage" 
                    :color="channel.color"
                    :show-text="false"
                  />
                </div>
              </div>
            </div>
          </el-card>

          <el-card>
            <template #header>
              <h4>发送时间线</h4>
            </template>
            
            <div class="send-timeline">
              <el-timeline>
                <el-timeline-item
                  v-for="event in sendTimeline"
                  :key="event.id"
                  :timestamp="event.time"
                  :color="event.color"
                >
                  <div class="timeline-content">
                    <h5>{{ event.title }}</h5>
                    <p>{{ event.description }}</p>
                  </div>
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-card>
        </div>
      </el-col>
    </el-row>

    <!-- 短信预览弹窗 -->
    <el-dialog v-model="showSmsPreview" title="短信预览" width="400px">
      <div class="sms-preview">
        <div class="phone-mockup">
          <div class="phone-screen">
            <div class="sms-message">
              <div class="message-content">
                {{ processedSmsContent }}
              </div>
              <div class="message-info">
                <span class="message-length">{{ smsLength }}/500字</span>
                <span class="message-cost">预计费用: ¥{{ smsCost }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import draggable from 'vuedraggable'
import { 
  Message, Share, ChatDotSquare, Bell, Plus, User, Ticket, Link,
  Rank
} from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const activeChannelTab = ref('email')
const testingChannels = ref(false)
const showSmsPreview = ref(false)
const targetAudience = ref(2456)

// 邮件设置
const emailSettings = reactive({
  enabled: true,
  senderConfig: {
    account: '',
    name: ''
  },
  subject: '',
  strategy: {
    type: 'smart',
    smartSend: {
      optimizeByTimezone: true,
      optimizeByBehavior: true,
      avoidBusyHours: true
    },
    batch: {
      size: 100,
      interval: 10,
      startTime: '09:00'
    }
  },
  retry: {
    maxAttempts: 3,
    interval: 15
  },
  tracking: ['open', 'click', 'unsubscribe'],
  testing: false
})

// 社交媒体设置
const socialSettings = reactive({
  enabled: false,
  testing: false
})

// 短信设置
const smsSettings = reactive({
  enabled: false,
  provider: {
    id: ''
  },
  signature: '',
  content: '',
  timeRestrictions: {
    enabled: false,
    startTime: '09:00',
    endTime: '21:00',
    allowedDays: ['1', '2', '3', '4', '5']
  },
  frequencyControl: {
    maxPerDay: 3,
    minInterval: 60
  },
  testing: false
})

// 推送设置
const pushSettings = reactive({
  enabled: false,
  type: 'app',
  title: '',
  content: '',
  icon: [],
  clickAction: {
    type: 'open_app',
    url: '',
    page: ''
  },
  strategy: 'all',
  stagedConfig: {
    batchSize: 1000,
    interval: 10
  },
  testing: false
})

// 渠道优先级
const channelPriorities = ref([
  { 
    id: 'email', 
    name: '邮件营销', 
    priority: 1, 
    enabled: true, 
    icon: 'Message',
    color: '#409eff'
  },
  { 
    id: 'sms', 
    name: '短信营销', 
    priority: 2, 
    enabled: false, 
    icon: 'ChatDotSquare',
    color: '#67c23a'
  },
  { 
    id: 'social', 
    name: '社交媒体', 
    priority: 3, 
    enabled: false, 
    icon: 'Share',
    color: '#e6a23c'
  },
  { 
    id: 'push', 
    name: '推送通知', 
    priority: 4, 
    enabled: false, 
    icon: 'Bell',
    color: '#f56c6c'
  }
])

// 模拟数据
const emailAccounts = ref([
  {
    id: 1,
    email: 'marketing@company.com',
    status: 'verified'
  },
  {
    id: 2,
    email: 'noreply@company.com', 
    status: 'verified'
  },
  {
    id: 3,
    email: 'support@company.com',
    status: 'pending'
  }
])

const socialPlatforms = ref([
  {
    id: 'wechat',
    name: '微信公众号',
    description: '发布到微信公众号',
    icon: 'https://via.placeholder.com/32x32?text=WX',
    enabled: false,
    accounts: [
      { id: 1, name: '公司官方账号', followersCount: '10.2K' },
      { id: 2, name: '产品推广账号', followersCount: '5.8K' }
    ],
    settings: {
      accountId: '',
      publishTime: {
        type: 'optimal',
        scheduledTime: null
      },
      contentStrategy: ['hashtags'],
      hashtags: []
    },
    popularHashtags: ['#营销', '#推广', '#新品', '#优惠', '#科技']
  },
  {
    id: 'weibo',
    name: '新浪微博',
    description: '发布到新浪微博',
    icon: 'https://via.placeholder.com/32x32?text=WB',
    enabled: false,
    accounts: [
      { id: 1, name: '@公司官方微博', followersCount: '25.6K' }
    ],
    settings: {
      accountId: '',
      publishTime: {
        type: 'immediate',
        scheduledTime: null
      },
      contentStrategy: ['hashtags', 'mentions'],
      hashtags: []
    },
    popularHashtags: ['#热门', '#推荐', '#新品上市', '#限时优惠']
  }
])

const smsProviders = ref([
  {
    id: 'aliyun',
    name: '阿里云短信',
    logo: 'https://via.placeholder.com/24x24?text=ALI',
    rate: '0.045'
  },
  {
    id: 'tencent',
    name: '腾讯云短信',
    logo: 'https://via.placeholder.com/24x24?text=TX',
    rate: '0.050'
  },
  {
    id: 'huawei',
    name: '华为云短信',
    logo: 'https://via.placeholder.com/24x24?text=HW',
    rate: '0.048'
  }
])

const uploadUrl = 'https://api.example.com/upload'

// 表单验证规则
const emailRules = {
  'senderConfig.account': [
    { required: true, message: '请选择发送邮箱', trigger: 'change' }
  ],
  subject: [
    { required: true, message: '请输入邮件主题', trigger: 'blur' }
  ]
}

const smsRules = {
  'provider.id': [
    { required: true, message: '请选择短信服务商', trigger: 'change' }
  ],
  signature: [
    { required: true, message: '请输入发送签名', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入短信内容', trigger: 'blur' }
  ]
}

// 计算属性
const enabledChannelsCount = computed(() => {
  return channelPriorities.value.filter(channel => channel.enabled).length
})

const enabledChannels = computed(() => {
  return channelPriorities.value.filter(channel => channel.enabled).map(channel => ({
    ...channel,
    coverage: Math.floor(Math.random() * 30 + 70) // 模拟覆盖率
  }))
})

const estimatedReach = computed(() => {
  const baseReach = targetAudience.value
  const channelMultiplier = enabledChannelsCount.value * 0.8
  return Math.floor(baseReach * channelMultiplier)
})

const estimatedCost = computed(() => {
  let cost = 0
  if (emailSettings.enabled) cost += targetAudience.value * 0.01 // 邮件成本
  if (smsSettings.enabled) cost += targetAudience.value * 0.05 // 短信成本
  if (socialSettings.enabled) cost += 50 // 社媒成本
  if (pushSettings.enabled) cost += 20 // 推送成本
  return cost.toFixed(2)
})

const processedSmsContent = computed(() => {
  let content = smsSettings.content
  content = content.replace(/\{客户姓名\}/g, '张先生')
  content = content.replace(/\{优惠码\}/g, 'SAVE2024')
  content = content.replace(/\{链接\}/g, 'https://example.com')
  return smsSettings.signature + content
})

const smsLength = computed(() => {
  return processedSmsContent.value.length
})

const smsCost = computed(() => {
  const provider = smsProviders.value.find(p => p.id === smsSettings.provider.id)
  const rate = provider ? parseFloat(provider.rate) : 0.05
  return (rate * targetAudience.value).toFixed(2)
})

const canLaunch = computed(() => {
  return enabledChannelsCount.value > 0 && 
         (emailSettings.enabled ? emailSettings.subject : true) &&
         (smsSettings.enabled ? smsSettings.content : true)
})

const sendTimeline = computed(() => {
  const timeline = []
  const now = new Date()
  
  if (emailSettings.enabled) {
    timeline.push({
      id: 'email',
      title: '邮件营销',
      description: `预计发送 ${targetAudience.value} 封邮件`,
      time: now.toLocaleString(),
      color: '#409eff'
    })
  }
  
  if (smsSettings.enabled) {
    const smsTime = new Date(now.getTime() + 5 * 60000)
    timeline.push({
      id: 'sms',
      title: '短信营销',
      description: `预计发送 ${targetAudience.value} 条短信`,
      time: smsTime.toLocaleString(),
      color: '#67c23a'
    })
  }
  
  return timeline
})

// 方法
const handleChannelTabChange = (tabName) => {
  console.log('切换到渠道标签:', tabName)
}

const togglePlatform = (platform) => {
  console.log('切换平台状态:', platform.name, platform.enabled)
}

const loadProviderConfig = (providerId) => {
  console.log('加载服务商配置:', providerId)
}

const changePushType = (type) => {
  console.log('切换推送类型:', type)
}

const insertEmailVariable = (target) => {
  if (target === 'subject') {
    emailSettings.subject += '{CUSTOMER_NAME}'
  }
}

const insertSmsVariable = (variableName) => {
  const variableMap = {
    '客户姓名': '{客户姓名}',
    '优惠码': '{优惠码}',
    '链接': '{链接}'
  }
  
  const variable = variableMap[variableName]
  if (variable) {
    smsSettings.content += variable
    updateSmsPreview()
  }
}

const updateSmsPreview = () => {
  // 实时更新短信预览
}

const handleIconUpload = (response, file) => {
  ElMessage.success('图标上传成功')
}

const updatePriorities = () => {
  channelPriorities.value.forEach((channel, index) => {
    channel.priority = index + 1
  })
  ElMessage.success('优先级更新成功')
}

const testEmailChannel = async () => {
  emailSettings.testing = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('测试邮件发送成功')
  } catch (error) {
    ElMessage.error('测试邮件发送失败')
  } finally {
    emailSettings.testing = false
  }
}

const testSocialChannels = async () => {
  socialSettings.testing = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    ElMessage.success('社媒发布测试成功')
  } catch (error) {
    ElMessage.error('社媒发布测试失败')
  } finally {
    socialSettings.testing = false
  }
}

const testSmsChannel = async () => {
  if (!smsSettings.content) {
    ElMessage.warning('请先输入短信内容')
    return
  }
  
  smsSettings.testing = true
  try {
    showSmsPreview.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('测试短信发送成功')
  } catch (error) {
    ElMessage.error('测试短信发送失败')
  } finally {
    smsSettings.testing = false
  }
}

const testPushChannel = async () => {
  pushSettings.testing = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    ElMessage.success('测试推送发送成功')
  } catch (error) {
    ElMessage.error('测试推送发送失败')
  } finally {
    pushSettings.testing = false
  }
}

const testAllChannels = async () => {
  testingChannels.value = true
  try {
    const promises = []
    if (emailSettings.enabled) promises.push(testEmailChannel())
    if (socialSettings.enabled) promises.push(testSocialChannels())
    if (smsSettings.enabled) promises.push(testSmsChannel())
    if (pushSettings.enabled) promises.push(testPushChannel())
    
    await Promise.all(promises)
    ElMessage.success('所有渠道测试完成')
  } catch (error) {
    ElMessage.error('渠道测试过程中出现错误')
  } finally {
    testingChannels.value = false
  }
}

const saveAsTemplate = async () => {
  try {
    const result = await ElMessageBox.prompt('请输入模板名称', '保存渠道配置模板', {
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
    ElMessage.success(`渠道配置模板 "${result.value}" 保存成功`)
  } catch {
    // 用户取消
  }
}

const launchCampaign = async () => {
  if (!canLaunch.value) {
    ElMessage.warning('请完成渠道配置')
    return
  }

  try {
    const result = await ElMessageBox.confirm(
      `确定启动营销活动吗？\n\n目标受众: ${targetAudience.value}人\n启用渠道: ${enabledChannelsCount.value}个\n预计费用: ¥${estimatedCost.value}`,
      '确认启动营销活动',
      {
        confirmButtonText: '立即启动',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }
    )

    if (result === 'confirm') {
      // 模拟启动营销活动
      ElMessage.success('营销活动启动中...')
      
      setTimeout(() => {
        ElMessage.success('营销活动已成功启动！')
        router.push('/campaign/list')
      }, 2000)
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
.channel-settings {
  padding: 20px;

  .settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .settings-actions {
      display: flex;
      gap: 10px;
    }
  }

  .channel-config {
    .channel-tab-label {
      display: flex;
      align-items: center;
      gap: 6px;
      position: relative;

      .channel-status-badge {
        position: absolute;
        top: -6px;
        right: -6px;
      }
    }

    .channel-panel {
      .channel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding: 20px;
        background: var(--el-fill-color-lighter);
        border-radius: 8px;

        .channel-info {
          h3 {
            margin: 0 0 5px 0;
            font-size: 18px;
          }

          p {
            margin: 0;
            color: var(--el-text-color-secondary);
            font-size: 14px;
          }
        }
      }

      .channel-content {
        .email-account-option,
        .social-account-option,
        .provider-option {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;

          .provider-details {
            display: flex;
            align-items: center;
            gap: 10px;

            .provider-logo {
              width: 24px;
              height: 24px;
              object-fit: contain;
            }
          }
        }

        .smart-send-config {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .time-restrictions {
          .time-range-config {
            margin-top: 15px;
            padding: 15px;
            background: var(--el-fill-color-lighter);
            border-radius: 6px;
          }
        }

        .sms-content-editor {
          .sms-toolbar {
            margin-top: 10px;
            padding: 10px;
            background: var(--el-fill-color-lighter);
            border-radius: 6px;
            display: flex;
            gap: 8px;
          }
        }

        .social-platforms {
          .platform-config {
            margin-bottom: 20px;
            border: 1px solid var(--el-border-color-light);
            border-radius: 8px;
            overflow: hidden;

            .platform-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 15px 20px;
              background: var(--el-fill-color-lighter);

              .platform-info {
                display: flex;
                align-items: center;
                gap: 12px;

                .platform-icon {
                  width: 32px;
                  height: 32px;
                  border-radius: 4px;
                }

                .platform-details {
                  h4 {
                    margin: 0 0 3px 0;
                    font-size: 16px;
                  }

                  p {
                    margin: 0;
                    color: var(--el-text-color-secondary);
                    font-size: 13px;
                  }
                }
              }
            }

            .platform-settings {
              padding: 20px;
            }
          }
        }

        .social-actions {
          text-align: center;
          padding-top: 20px;
        }

        .push-types {
          margin-bottom: 20px;
          text-align: center;
        }
      }
    }
  }

  .priority-panel {
    position: sticky;
    top: 20px;

    .el-card {
      margin-bottom: 20px;

      h4 {
        margin: 0;
        font-size: 16px;
      }
    }

    .priority-list {
      .priority-item {
        display: flex;
        align-items: center;
        padding: 12px;
        border: 1px solid var(--el-border-color-lighter);
        border-radius: 6px;
        margin-bottom: 8px;
        cursor: move;
        transition: all 0.3s;

        &:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        &.disabled {
          opacity: 0.5;
        }

        .priority-rank {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--el-color-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          margin-right: 12px;
        }

        .priority-info {
          flex: 1;

          .channel-name {
            display: flex;
            align-items: center;
            gap: 6px;
            font-weight: 500;
            margin-bottom: 4px;
          }

          .channel-status {
            .el-tag {
              font-size: 11px;
            }
          }
        }

        .priority-actions {
          .drag-handle {
            cursor: move;
            color: var(--el-text-color-placeholder);
          }
        }
      }
    }

    .send-overview {
      .overview-stats {
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

      .channel-breakdown {
        margin-top: 20px;

        .breakdown-item {
          margin-bottom: 15px;

          .breakdown-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 5px;

            .channel-name {
              font-size: 13px;
              font-weight: 500;
            }

            .channel-coverage {
              font-size: 12px;
              color: var(--el-text-color-secondary);
            }
          }
        }
      }
    }

    .send-timeline {
      .timeline-content {
        h5 {
          margin: 0 0 5px 0;
          font-size: 14px;
        }

        p {
          margin: 0;
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }

  .sms-preview {
    .phone-mockup {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 400px;

      .phone-screen {
        width: 300px;
        height: 200px;
        border: 2px solid #333;
        border-radius: 20px;
        padding: 20px;
        background: #f0f0f0;
        display: flex;
        flex-direction: column;
        justify-content: center;

        .sms-message {
          background: white;
          padding: 15px;
          border-radius: 10px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

          .message-content {
            font-size: 14px;
            line-height: 1.4;
            margin-bottom: 10px;
            word-wrap: break-word;
          }

          .message-info {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: var(--el-text-color-secondary);
          }
        }
      }
    }
  }
}
</style>