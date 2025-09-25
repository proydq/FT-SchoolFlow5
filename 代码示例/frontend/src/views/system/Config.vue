<template>
  <div class="system-config-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="title">
          <el-icon><Setting /></el-icon>
          系统配置
        </h2>
        <p class="description">管理系统基础设置、邮件服务器、API配置和系统参数</p>
      </div>
      <div class="header-right">
        <el-button :icon="Refresh" @click="refreshConfigs">刷新配置</el-button>
        <el-button type="primary" :icon="Upload" @click="handleImportConfig">
          导入配置
        </el-button>
        <el-button :icon="Download" @click="handleExportConfig">导出配置</el-button>
      </div>
    </div>

    <!-- 配置内容 -->
    <div class="config-content">
      <el-tabs v-model="activeTab" type="border-card" class="config-tabs">
        <!-- 基础设置 -->
        <el-tab-pane label="基础设置" name="basic">
          <el-card shadow="never" class="config-card">
            <template #header>
              <div class="card-header">
                <span class="title">基础设置</span>
                <el-button type="primary" size="small" @click="saveBasicConfig">
                  保存设置
                </el-button>
              </div>
            </template>

            <el-form
              ref="basicFormRef"
              :model="basicConfig"
              :rules="basicRules"
              label-width="150px"
              class="config-form"
            >
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="系统名称" prop="systemName">
                    <el-input v-model="basicConfig.systemName" placeholder="请输入系统名称" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="系统版本" prop="systemVersion">
                    <el-input v-model="basicConfig.systemVersion" placeholder="请输入系统版本" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="公司名称" prop="companyName">
                    <el-input v-model="basicConfig.companyName" placeholder="请输入公司名称" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="联系邮箱" prop="contactEmail">
                    <el-input v-model="basicConfig.contactEmail" placeholder="请输入联系邮箱" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="系统Logo" prop="logo">
                    <el-upload
                      class="logo-uploader"
                      action="#"
                      :show-file-list="false"
                      :on-success="handleLogoSuccess"
                      :before-upload="beforeLogoUpload"
                      :auto-upload="false"
                    >
                      <img v-if="basicConfig.logo" :src="basicConfig.logo" class="logo" />
                      <el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
                    </el-upload>
                    <div class="upload-tip">支持jpg、png格式，建议尺寸200x60px</div>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="系统favicon">
                    <el-upload
                      class="favicon-uploader"
                      action="#"
                      :show-file-list="false"
                      :on-success="handleFaviconSuccess"
                      :before-upload="beforeFaviconUpload"
                      :auto-upload="false"
                    >
                      <img v-if="basicConfig.favicon" :src="basicConfig.favicon" class="favicon" />
                      <el-icon v-else class="favicon-uploader-icon"><Plus /></el-icon>
                    </el-upload>
                    <div class="upload-tip">支持ico、png格式，建议尺寸32x32px</div>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="默认语言">
                    <el-select v-model="basicConfig.defaultLanguage" placeholder="请选择默认语言">
                      <el-option label="简体中文" value="zh-CN" />
                      <el-option label="English" value="en-US" />
                      <el-option label="日本語" value="ja-JP" />
                      <el-option label="한국어" value="ko-KR" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="默认时区">
                    <el-select v-model="basicConfig.defaultTimezone" placeholder="请选择默认时区">
                      <el-option label="北京时间 (UTC+8)" value="Asia/Shanghai" />
                      <el-option label="东京时间 (UTC+9)" value="Asia/Tokyo" />
                      <el-option label="首尔时间 (UTC+9)" value="Asia/Seoul" />
                      <el-option label="UTC时间 (UTC+0)" value="UTC" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="系统描述">
                <el-input
                  v-model="basicConfig.systemDescription"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入系统描述"
                />
              </el-form-item>

              <el-form-item label="版权信息">
                <el-input
                  v-model="basicConfig.copyright"
                  placeholder="请输入版权信息"
                />
              </el-form-item>

              <el-form-item label="备案信息">
                <el-input
                  v-model="basicConfig.recordNumber"
                  placeholder="请输入备案信息"
                />
              </el-form-item>
            </el-form>
          </el-card>
        </el-tab-pane>

        <!-- 邮件服务器 -->
        <el-tab-pane label="邮件服务器" name="email">
          <el-card shadow="never" class="config-card">
            <template #header>
              <div class="card-header">
                <span class="title">邮件服务器配置</span>
                <div class="header-actions">
                  <el-button size="small" @click="testEmailConnection">测试连接</el-button>
                  <el-button type="primary" size="small" @click="saveEmailConfig">
                    保存配置
                  </el-button>
                </div>
              </div>
            </template>

            <el-form
              ref="emailFormRef"
              :model="emailConfig"
              :rules="emailRules"
              label-width="150px"
              class="config-form"
            >
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="SMTP服务器" prop="smtpHost">
                    <el-input v-model="emailConfig.smtpHost" placeholder="smtp.example.com" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="SMTP端口" prop="smtpPort">
                    <el-input-number
                      v-model="emailConfig.smtpPort"
                      :min="1"
                      :max="65535"
                      controls-position="right"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="发送邮箱" prop="senderEmail">
                    <el-input v-model="emailConfig.senderEmail" placeholder="noreply@example.com" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="发送者名称" prop="senderName">
                    <el-input v-model="emailConfig.senderName" placeholder="营销系统" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="用户名" prop="username">
                    <el-input v-model="emailConfig.username" placeholder="请输入SMTP用户名" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="密码" prop="password">
                    <el-input
                      v-model="emailConfig.password"
                      type="password"
                      placeholder="请输入SMTP密码"
                      show-password
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="加密方式">
                    <el-select v-model="emailConfig.encryption" placeholder="请选择加密方式">
                      <el-option label="无加密" value="none" />
                      <el-option label="SSL" value="ssl" />
                      <el-option label="TLS" value="tls" />
                      <el-option label="STARTTLS" value="starttls" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="连接超时(秒)">
                    <el-input-number
                      v-model="emailConfig.timeout"
                      :min="5"
                      :max="300"
                      controls-position="right"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="测试邮箱">
                <el-input
                  v-model="emailConfig.testEmail"
                  placeholder="用于测试邮件发送的邮箱地址"
                />
              </el-form-item>

              <el-divider content-position="left">高级设置</el-divider>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="每小时发送限制">
                    <el-input-number
                      v-model="emailConfig.hourlyLimit"
                      :min="0"
                      :max="10000"
                      controls-position="right"
                    />
                    <div class="form-tip">0表示无限制</div>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="每日发送限制">
                    <el-input-number
                      v-model="emailConfig.dailyLimit"
                      :min="0"
                      :max="100000"
                      controls-position="right"
                    />
                    <div class="form-tip">0表示无限制</div>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="重试设置">
                <el-row :gutter="10">
                  <el-col :span="8">
                    <el-input-number
                      v-model="emailConfig.retryTimes"
                      :min="0"
                      :max="10"
                      controls-position="right"
                      placeholder="重试次数"
                    />
                  </el-col>
                  <el-col :span="8">
                    <el-input-number
                      v-model="emailConfig.retryInterval"
                      :min="1"
                      :max="3600"
                      controls-position="right"
                      placeholder="重试间隔(秒)"
                    />
                  </el-col>
                </el-row>
              </el-form-item>
            </el-form>
          </el-card>
        </el-tab-pane>

        <!-- API配置 -->
        <el-tab-pane label="API配置" name="api">
          <el-card shadow="never" class="config-card">
            <template #header>
              <div class="card-header">
                <span class="title">API接口配置</span>
                <el-button type="primary" size="small" @click="saveApiConfig">
                  保存配置
                </el-button>
              </div>
            </template>

            <el-form
              ref="apiFormRef"
              :model="apiConfig"
              :rules="apiRules"
              label-width="150px"
              class="config-form"
            >
              <el-divider content-position="left">基础API设置</el-divider>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="API基础地址" prop="baseUrl">
                    <el-input v-model="apiConfig.baseUrl" placeholder="https://api.example.com" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="API版本">
                    <el-input v-model="apiConfig.version" placeholder="v1" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="超时时间(秒)">
                    <el-input-number
                      v-model="apiConfig.timeout"
                      :min="5"
                      :max="300"
                      controls-position="right"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="重试次数">
                    <el-input-number
                      v-model="apiConfig.retryCount"
                      :min="0"
                      :max="10"
                      controls-position="right"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-divider content-position="left">第三方服务配置</el-divider>

              <!-- AI服务配置 -->
              <el-form-item label="AI服务">
                <el-card shadow="never" style="margin-bottom: 16px;">
                  <el-row :gutter="20">
                    <el-col :span="8">
                      <el-form-item label="OpenAI API Key">
                        <el-input
                          v-model="apiConfig.openaiApiKey"
                          type="password"
                          placeholder="sk-..."
                          show-password
                        />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="默认模型">
                        <el-select v-model="apiConfig.openaiModel" placeholder="请选择模型">
                          <el-option label="GPT-3.5 Turbo" value="gpt-3.5-turbo" />
                          <el-option label="GPT-4" value="gpt-4" />
                          <el-option label="GPT-4 Turbo" value="gpt-4-turbo" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="API地址">
                        <el-input
                          v-model="apiConfig.openaiBaseUrl"
                          placeholder="https://api.openai.com/v1"
                        />
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-card>
              </el-form-item>

              <!-- 短信服务配置 -->
              <el-form-item label="短信服务">
                <el-card shadow="never" style="margin-bottom: 16px;">
                  <el-row :gutter="20">
                    <el-col :span="8">
                      <el-form-item label="服务商">
                        <el-select v-model="apiConfig.smsProvider" placeholder="请选择服务商">
                          <el-option label="阿里云短信" value="aliyun" />
                          <el-option label="腾讯云短信" value="tencent" />
                          <el-option label="华为云短信" value="huawei" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="Access Key">
                        <el-input
                          v-model="apiConfig.smsAccessKey"
                          type="password"
                          placeholder="请输入Access Key"
                          show-password
                        />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="Secret Key">
                        <el-input
                          v-model="apiConfig.smsSecretKey"
                          type="password"
                          placeholder="请输入Secret Key"
                          show-password
                        />
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-card>
              </el-form-item>

              <!-- 存储服务配置 -->
              <el-form-item label="文件存储">
                <el-card shadow="never">
                  <el-row :gutter="20">
                    <el-col :span="8">
                      <el-form-item label="存储类型">
                        <el-select v-model="apiConfig.storageType" placeholder="请选择存储类型">
                          <el-option label="本地存储" value="local" />
                          <el-option label="阿里云OSS" value="aliyun-oss" />
                          <el-option label="腾讯云COS" value="tencent-cos" />
                          <el-option label="AWS S3" value="aws-s3" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="存储地址">
                        <el-input
                          v-model="apiConfig.storageUrl"
                          placeholder="存储服务地址"
                        />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="访问域名">
                        <el-input
                          v-model="apiConfig.storageDomain"
                          placeholder="https://cdn.example.com"
                        />
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-card>
              </el-form-item>
            </el-form>
          </el-card>
        </el-tab-pane>

        <!-- 系统参数 -->
        <el-tab-pane label="系统参数" name="system">
          <el-card shadow="never" class="config-card">
            <template #header>
              <div class="card-header">
                <span class="title">系统参数配置</span>
                <div class="header-actions">
                  <el-button size="small" @click="resetSystemParams">重置默认</el-button>
                  <el-button type="primary" size="small" @click="saveSystemConfig">
                    保存参数
                  </el-button>
                </div>
              </div>
            </template>

            <el-form
              ref="systemFormRef"
              :model="systemConfig"
              label-width="150px"
              class="config-form"
            >
              <el-divider content-position="left">安全设置</el-divider>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="密码最小长度">
                    <el-input-number
                      v-model="systemConfig.passwordMinLength"
                      :min="6"
                      :max="20"
                      controls-position="right"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="密码复杂度">
                    <el-checkbox-group v-model="systemConfig.passwordComplexity">
                      <el-checkbox value="uppercase">大写字母</el-checkbox>
                      <el-checkbox value="lowercase">小写字母</el-checkbox>
                      <el-checkbox value="number">数字</el-checkbox>
                      <el-checkbox value="special">特殊字符</el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="登录失败锁定">
                    <el-switch
                      v-model="systemConfig.loginLockEnabled"
                      active-text="启用"
                      inactive-text="禁用"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="失败次数限制">
                    <el-input-number
                      v-model="systemConfig.maxLoginAttempts"
                      :min="3"
                      :max="10"
                      :disabled="!systemConfig.loginLockEnabled"
                      controls-position="right"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="会话超时(分钟)">
                    <el-input-number
                      v-model="systemConfig.sessionTimeout"
                      :min="5"
                      :max="1440"
                      controls-position="right"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="强制定期修改密码">
                    <el-switch
                      v-model="systemConfig.forcePasswordChange"
                      active-text="启用"
                      inactive-text="禁用"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-divider content-position="left">业务设置</el-divider>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="最大客户数量">
                    <el-input-number
                      v-model="systemConfig.maxCustomers"
                      :min="1000"
                      :max="1000000"
                      controls-position="right"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="最大活动数量">
                    <el-input-number
                      v-model="systemConfig.maxCampaigns"
                      :min="100"
                      :max="10000"
                      controls-position="right"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="文件上传大小限制(MB)">
                    <el-input-number
                      v-model="systemConfig.maxUploadSize"
                      :min="1"
                      :max="1024"
                      controls-position="right"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="允许的文件类型">
                    <el-select
                      v-model="systemConfig.allowedFileTypes"
                      multiple
                      placeholder="请选择允许的文件类型"
                    >
                      <el-option label="图片 (jpg, png, gif)" value="image" />
                      <el-option label="文档 (pdf, doc, docx)" value="document" />
                      <el-option label="表格 (xls, xlsx, csv)" value="spreadsheet" />
                      <el-option label="视频 (mp4, avi, mov)" value="video" />
                      <el-option label="音频 (mp3, wav, ogg)" value="audio" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="数据备份周期">
                    <el-select v-model="systemConfig.backupFrequency" placeholder="请选择备份周期">
                      <el-option label="每日备份" value="daily" />
                      <el-option label="每周备份" value="weekly" />
                      <el-option label="每月备份" value="monthly" />
                      <el-option label="禁用备份" value="disabled" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="备份保留天数">
                    <el-input-number
                      v-model="systemConfig.backupRetentionDays"
                      :min="1"
                      :max="365"
                      :disabled="systemConfig.backupFrequency === 'disabled'"
                      controls-position="right"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-divider content-position="left">日志设置</el-divider>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="日志级别">
                    <el-select v-model="systemConfig.logLevel" placeholder="请选择日志级别">
                      <el-option label="DEBUG" value="debug" />
                      <el-option label="INFO" value="info" />
                      <el-option label="WARN" value="warn" />
                      <el-option label="ERROR" value="error" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="日志保留天数">
                    <el-input-number
                      v-model="systemConfig.logRetentionDays"
                      :min="7"
                      :max="365"
                      controls-position="right"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="记录操作日志">
                <el-checkbox-group v-model="systemConfig.operationLogs">
                  <el-checkbox value="login">登录日志</el-checkbox>
                  <el-checkbox value="user">用户操作</el-checkbox>
                  <el-checkbox value="campaign">活动操作</el-checkbox>
                  <el-checkbox value="customer">客户操作</el-checkbox>
                  <el-checkbox value="system">系统操作</el-checkbox>
                </el-checkbox-group>
              </el-form-item>

              <el-divider content-position="left">缓存设置</el-divider>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="缓存类型">
                    <el-select v-model="systemConfig.cacheType" placeholder="请选择缓存类型">
                      <el-option label="内存缓存" value="memory" />
                      <el-option label="Redis" value="redis" />
                      <el-option label="Memcached" value="memcached" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="缓存过期时间(秒)">
                    <el-input-number
                      v-model="systemConfig.cacheExpiration"
                      :min="60"
                      :max="86400"
                      controls-position="right"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-card>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 导入配置对话框 -->
    <el-dialog v-model="importDialogVisible" title="导入配置" width="600px">
      <el-upload
        ref="uploadRef"
        class="upload-area"
        drag
        action="#"
        :before-upload="beforeConfigUpload"
        :file-list="uploadFileList"
        :auto-upload="false"
        accept=".json"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          将配置文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            只能上传JSON格式的配置文件，且不超过10MB
          </div>
        </template>
      </el-upload>

      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfigImport">确定导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Setting,
  Refresh,
  Upload,
  Download,
  Plus,
  UploadFilled
} from '@element-plus/icons-vue'

// 响应式数据
const activeTab = ref('basic')
const importDialogVisible = ref(false)
const uploadFileList = ref([])

// 表单引用
const basicFormRef = ref()
const emailFormRef = ref()
const apiFormRef = ref()
const systemFormRef = ref()
const uploadRef = ref()

// 基础设置配置
const basicConfig = reactive({
  systemName: '海外营销管理系统',
  systemVersion: '1.0.0',
  companyName: 'XX科技有限公司',
  contactEmail: 'contact@example.com',
  logo: '/logo.png',
  favicon: '/favicon.ico',
  defaultLanguage: 'zh-CN',
  defaultTimezone: 'Asia/Shanghai',
  systemDescription: '专业的海外营销管理解决方案',
  copyright: '© 2024 XX科技有限公司 版权所有',
  recordNumber: '京ICP备xxxxxxxx号'
})

// 邮件服务器配置
const emailConfig = reactive({
  smtpHost: 'smtp.qq.com',
  smtpPort: 587,
  senderEmail: 'noreply@example.com',
  senderName: '营销系统',
  username: '',
  password: '',
  encryption: 'tls',
  timeout: 30,
  testEmail: '',
  hourlyLimit: 1000,
  dailyLimit: 10000,
  retryTimes: 3,
  retryInterval: 60
})

// API配置
const apiConfig = reactive({
  baseUrl: 'https://api.example.com',
  version: 'v1',
  timeout: 30,
  retryCount: 3,
  openaiApiKey: '',
  openaiModel: 'gpt-3.5-turbo',
  openaiBaseUrl: 'https://api.openai.com/v1',
  smsProvider: 'aliyun',
  smsAccessKey: '',
  smsSecretKey: '',
  storageType: 'local',
  storageUrl: '',
  storageDomain: ''
})

// 系统参数配置
const systemConfig = reactive({
  passwordMinLength: 8,
  passwordComplexity: ['lowercase', 'number'],
  loginLockEnabled: true,
  maxLoginAttempts: 5,
  sessionTimeout: 120,
  forcePasswordChange: false,
  maxCustomers: 100000,
  maxCampaigns: 1000,
  maxUploadSize: 50,
  allowedFileTypes: ['image', 'document', 'spreadsheet'],
  backupFrequency: 'daily',
  backupRetentionDays: 30,
  logLevel: 'info',
  logRetentionDays: 90,
  operationLogs: ['login', 'user', 'campaign', 'customer'],
  cacheType: 'redis',
  cacheExpiration: 3600
})

// 表单验证规则
const basicRules = {
  systemName: [{ required: true, message: '请输入系统名称', trigger: 'blur' }],
  systemVersion: [{ required: true, message: '请输入系统版本', trigger: 'blur' }],
  companyName: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
  contactEmail: [
    { required: true, message: '请输入联系邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

const emailRules = {
  smtpHost: [{ required: true, message: '请输入SMTP服务器', trigger: 'blur' }],
  smtpPort: [{ required: true, message: '请输入SMTP端口', trigger: 'blur' }],
  senderEmail: [
    { required: true, message: '请输入发送邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  senderName: [{ required: true, message: '请输入发送者名称', trigger: 'blur' }],
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const apiRules = {
  baseUrl: [
    { required: true, message: '请输入API基础地址', trigger: 'blur' },
    { type: 'url', message: '请输入正确的URL格式', trigger: 'blur' }
  ]
}

// 方法定义
const saveBasicConfig = async () => {
  if (!basicFormRef.value) return
  
  try {
    await basicFormRef.value.validate()
    
    // 这里应该调用API保存配置
    console.log('保存基础配置:', basicConfig)
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('基础设置保存成功')
  } catch (error) {
    // 表单验证失败
  }
}

const saveEmailConfig = async () => {
  if (!emailFormRef.value) return
  
  try {
    await emailFormRef.value.validate()
    
    // 这里应该调用API保存配置
    console.log('保存邮件配置:', emailConfig)
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('邮件服务器配置保存成功')
  } catch (error) {
    // 表单验证失败
  }
}

const testEmailConnection = async () => {
  if (!emailConfig.smtpHost || !emailConfig.username || !emailConfig.password) {
    ElMessage.warning('请先完善SMTP配置信息')
    return
  }
  
  try {
    // 这里应该调用API测试邮件连接
    console.log('测试邮件连接:', emailConfig)
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    ElMessage.success('邮件服务器连接测试成功')
  } catch (error) {
    ElMessage.error('邮件服务器连接测试失败')
  }
}

const saveApiConfig = async () => {
  if (!apiFormRef.value) return
  
  try {
    await apiFormRef.value.validate()
    
    // 这里应该调用API保存配置
    console.log('保存API配置:', apiConfig)
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('API配置保存成功')
  } catch (error) {
    // 表单验证失败
  }
}

const saveSystemConfig = async () => {
  try {
    // 这里应该调用API保存配置
    console.log('保存系统参数:', systemConfig)
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('系统参数保存成功')
  } catch (error) {
    ElMessage.error('系统参数保存失败')
  }
}

const resetSystemParams = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重置系统参数为默认值吗？此操作无法撤销。',
      '重置确认',
      {
        type: 'warning',
        confirmButtonText: '确定重置',
        cancelButtonText: '取消'
      }
    )
    
    // 重置为默认值
    Object.assign(systemConfig, {
      passwordMinLength: 8,
      passwordComplexity: ['lowercase', 'number'],
      loginLockEnabled: true,
      maxLoginAttempts: 5,
      sessionTimeout: 120,
      forcePasswordChange: false,
      maxCustomers: 100000,
      maxCampaigns: 1000,
      maxUploadSize: 50,
      allowedFileTypes: ['image', 'document', 'spreadsheet'],
      backupFrequency: 'daily',
      backupRetentionDays: 30,
      logLevel: 'info',
      logRetentionDays: 90,
      operationLogs: ['login', 'user', 'campaign', 'customer'],
      cacheType: 'redis',
      cacheExpiration: 3600
    })
    
    ElMessage.success('系统参数已重置为默认值')
  } catch (error) {
    // 用户取消重置
  }
}

const handleLogoSuccess = (response, file) => {
  basicConfig.logo = URL.createObjectURL(file.raw)
}

const beforeLogoUpload = (file) => {
  const isImage = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2
  
  if (!isImage) {
    ElMessage.error('Logo只能是JPG或PNG格式!')
  }
  if (!isLt2M) {
    ElMessage.error('Logo大小不能超过2MB!')
  }
  return isImage && isLt2M
}

const handleFaviconSuccess = (response, file) => {
  basicConfig.favicon = URL.createObjectURL(file.raw)
}

const beforeFaviconUpload = (file) => {
  const isValidType = file.type === 'image/x-icon' || file.type === 'image/png'
  const isLt1M = file.size / 1024 / 1024 < 1
  
  if (!isValidType) {
    ElMessage.error('Favicon只能是ICO或PNG格式!')
  }
  if (!isLt1M) {
    ElMessage.error('Favicon大小不能超过1MB!')
  }
  return isValidType && isLt1M
}

const refreshConfigs = () => {
  // 这里应该重新加载所有配置
  ElMessage.success('配置刷新成功')
}

const handleImportConfig = () => {
  importDialogVisible.value = true
}

const handleExportConfig = () => {
  // 导出所有配置
  const allConfigs = {
    basic: basicConfig,
    email: emailConfig,
    api: apiConfig,
    system: systemConfig,
    exportTime: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(allConfigs, null, 2)], {
    type: 'application/json'
  })
  
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `system-config-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  
  URL.revokeObjectURL(url)
  ElMessage.success('配置导出成功')
}

const beforeConfigUpload = (file) => {
  const isJSON = file.type === 'application/json'
  const isLt10M = file.size / 1024 / 1024 < 10
  
  if (!isJSON) {
    ElMessage.error('只能上传JSON格式的配置文件!')
  }
  if (!isLt10M) {
    ElMessage.error('配置文件大小不能超过10MB!')
  }
  return isJSON && isLt10M
}

const handleConfigImport = async () => {
  if (uploadFileList.value.length === 0) {
    ElMessage.warning('请选择要导入的配置文件')
    return
  }
  
  try {
    // 这里应该处理文件导入逻辑
    const file = uploadFileList.value[0]
    const text = await file.raw.text()
    const configs = JSON.parse(text)
    
    // 验证配置格式
    if (!configs.basic || !configs.email || !configs.api || !configs.system) {
      throw new Error('配置文件格式不正确')
    }
    
    // 更新配置
    Object.assign(basicConfig, configs.basic)
    Object.assign(emailConfig, configs.email)
    Object.assign(apiConfig, configs.api)
    Object.assign(systemConfig, configs.system)
    
    importDialogVisible.value = false
    uploadFileList.value = []
    
    ElMessage.success('配置导入成功')
  } catch (error) {
    ElMessage.error('配置导入失败: ' + error.message)
  }
}
</script>

<style scoped lang="scss">
.system-config-container {
  padding: 20px;
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
    
    .header-left {
      .title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 24px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin-bottom: 8px;
      }
      
      .description {
        color: var(--el-text-color-regular);
        margin: 0;
      }
    }
    
    .header-right {
      display: flex;
      gap: 12px;
    }
  }
  
  .config-content {
    .config-tabs {
      min-height: calc(100vh - 200px);
      
      .config-card {
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          
          .title {
            font-weight: 600;
            font-size: 16px;
          }
          
          .header-actions {
            display: flex;
            gap: 8px;
          }
        }
        
        .config-form {
          padding: 20px 0;
          
          .form-tip {
            font-size: 12px;
            color: var(--el-text-color-secondary);
            margin-top: 4px;
          }
          
          .upload-tip {
            font-size: 12px;
            color: var(--el-text-color-secondary);
            margin-top: 8px;
          }
          
          .logo-uploader {
            .logo {
              width: 200px;
              height: 60px;
              object-fit: contain;
              display: block;
            }
            
            .logo-uploader-icon {
              font-size: 28px;
              color: #8c939d;
              width: 200px;
              height: 60px;
              line-height: 60px;
              text-align: center;
              border: 1px dashed var(--el-border-color);
              border-radius: 6px;
            }
          }
          
          .favicon-uploader {
            .favicon {
              width: 32px;
              height: 32px;
              object-fit: contain;
              display: block;
            }
            
            .favicon-uploader-icon {
              font-size: 28px;
              color: #8c939d;
              width: 64px;
              height: 64px;
              line-height: 64px;
              text-align: center;
              border: 1px dashed var(--el-border-color);
              border-radius: 6px;
            }
          }
        }
      }
    }
  }
  
  .upload-area {
    width: 100%;
    
    .el-upload-dragger {
      width: 100%;
      height: 180px;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .system-config-container {
    padding: 10px;
    
    .page-header {
      flex-direction: column;
      gap: 16px;
      
      .header-right {
        align-self: stretch;
        justify-content: flex-end;
      }
    }
    
    .config-form {
      .el-row {
        .el-col {
          margin-bottom: 16px;
        }
      }
    }
  }
}
</style>
