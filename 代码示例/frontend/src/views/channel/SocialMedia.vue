<template>
  <div class="social-media-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>社交媒体营销</h1>
      <div class="header-actions">
        <el-button type="primary" @click="showCreatePost">
          <el-icon><Plus /></el-icon>
          创建内容
        </el-button>
        <el-button @click="showScheduleDialog">
          <el-icon><Calendar /></el-icon>
          内容日历
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-icon followers">
                <el-icon><User /></el-icon>
              </div>
              <div class="stat-content">
                <h3>{{ socialStats.followers.toLocaleString() }}</h3>
                <p>总粉丝数</p>
                <span class="growth-rate positive">+{{ socialStats.followersGrowth }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-icon posts">
                <el-icon><Document /></el-icon>
              </div>
              <div class="stat-content">
                <h3>{{ socialStats.posts }}</h3>
                <p>本月发布</p>
                <span class="growth-rate positive">+{{ socialStats.postsGrowth }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-icon engagement">
                <el-icon><ChatDotRound /></el-icon>
              </div>
              <div class="stat-content">
                <h3>{{ socialStats.engagement }}%</h3>
                <p>平均互动率</p>
                <span class="growth-rate" :class="socialStats.engagementGrowth > 0 ? 'positive' : 'negative'">
                  {{ socialStats.engagementGrowth > 0 ? '+' : '' }}{{ socialStats.engagementGrowth }}%
                </span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-icon reach">
                <el-icon><View /></el-icon>
              </div>
              <div class="stat-content">
                <h3>{{ socialStats.reach.toLocaleString() }}</h3>
                <p>本月触达</p>
                <span class="growth-rate positive">+{{ socialStats.reachGrowth }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 主要内容区域 -->
    <el-row :gutter="20" class="main-content">
      <!-- 内容管理 -->
      <el-col :span="16">
        <el-card class="content-card">
          <template #header>
            <div class="card-header">
              <span>内容管理</span>
              <div class="header-filters">
                <el-select v-model="contentFilter.platform" placeholder="选择平台" size="small" style="width: 120px">
                  <el-option label="全部平台" value="" />
                  <el-option label="Facebook" value="facebook" />
                  <el-option label="Instagram" value="instagram" />
                  <el-option label="Twitter" value="twitter" />
                  <el-option label="LinkedIn" value="linkedin" />
                  <el-option label="TikTok" value="tiktok" />
                </el-select>
                <el-select v-model="contentFilter.status" placeholder="状态" size="small" style="width: 100px">
                  <el-option label="全部" value="" />
                  <el-option label="草稿" value="draft" />
                  <el-option label="已发布" value="published" />
                  <el-option label="已安排" value="scheduled" />
                  <el-option label="发布中" value="publishing" />
                </el-select>
              </div>
            </div>
          </template>

          <div class="content-list">
            <div v-for="post in paginatedPosts" :key="post.id" class="post-item">
              <div class="post-media">
                <img v-if="post.media?.type === 'image'" :src="post.media.url" alt="Post image" />
                <div v-else-if="post.media?.type === 'video'" class="video-placeholder">
                  <el-icon><VideoPlay /></el-icon>
                  <span>视频</span>
                </div>
                <div v-else class="text-placeholder">
                  <el-icon><Document /></el-icon>
                  <span>文本</span>
                </div>
              </div>
              
              <div class="post-content">
                <div class="post-header">
                  <div class="post-platforms">
                    <el-tag v-for="platform in post.platforms" :key="platform" :type="getPlatformTagType(platform)" size="small">
                      {{ getPlatformName(platform) }}
                    </el-tag>
                  </div>
                  <div class="post-status">
                    <el-tag :type="getStatusTagType(post.status)" size="small">
                      {{ getStatusText(post.status) }}
                    </el-tag>
                  </div>
                </div>
                
                <h4>{{ post.title }}</h4>
                <p class="post-description">{{ post.content }}</p>
                
                <div class="post-meta">
                  <span class="post-time">
                    <el-icon><Clock /></el-icon>
                    {{ post.status === 'scheduled' ? '计划发布：' : '发布时间：' }}{{ formatTime(post.publishTime) }}
                  </span>
                  <div class="post-stats" v-if="post.status === 'published'">
                    <span><el-icon><View /></el-icon> {{ post.views }}</span>
                    <span><el-icon><ChatDotRound /></el-icon> {{ post.engagement }}</span>
                    <span><el-icon><Share /></el-icon> {{ post.shares }}</span>
                  </div>
                </div>
              </div>
              
              <div class="post-actions">
                <el-dropdown @command="handlePostAction">
                  <el-button type="text">
                    <el-icon><MoreFilled /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item :command="`edit-${post.id}`">编辑</el-dropdown-item>
                      <el-dropdown-item :command="`duplicate-${post.id}`">复制</el-dropdown-item>
                      <el-dropdown-item :command="`analytics-${post.id}`" v-if="post.status === 'published'">查看分析</el-dropdown-item>
                      <el-dropdown-item :command="`delete-${post.id}`" divided class="danger">删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="pagination.current"
              :page-size="pagination.size"
              :total="filteredPosts.length"
              layout="total, prev, pager, next, jumper"
              @current-change="handlePageChange"
            />
          </div>
        </el-card>
      </el-col>

      <!-- 侧边栏 -->
      <el-col :span="8">
        <!-- 平台状态 -->
        <el-card class="platform-status-card">
          <template #header>
            <span>平台状态</span>
          </template>
          <div class="platform-list">
            <div v-for="platform in platforms" :key="platform.id" class="platform-item">
              <div class="platform-info">
                <div class="platform-icon" :class="platform.type">
                  <i :class="platform.icon"></i>
                </div>
                <div class="platform-details">
                  <h4>{{ platform.name }}</h4>
                  <p>{{ platform.followers.toLocaleString() }} 粉丝</p>
                </div>
              </div>
              <div class="platform-status">
                <el-switch
                  v-model="platform.connected"
                  @change="togglePlatformConnection(platform)"
                />
              </div>
            </div>
          </div>
        </el-card>

        <!-- 最佳发布时间 -->
        <el-card class="best-time-card">
          <template #header>
            <span>最佳发布时间</span>
          </template>
          <div class="time-heatmap">
            <div class="heatmap-header">
              <div class="day-labels">
                <span v-for="day in weekDays" :key="day">{{ day }}</span>
              </div>
            </div>
            <div class="heatmap-body">
              <div v-for="hour in 24" :key="hour" class="hour-row">
                <span class="hour-label">{{ hour }}:00</span>
                <div class="hour-cells">
                  <div
                    v-for="day in 7"
                    :key="day"
                    class="time-cell"
                    :class="getTimeIntensity(day, hour)"
                    :title="`${weekDays[day-1]} ${hour}:00 - 建议指数: ${getTimeScore(day, hour)}`"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 互动管理 -->
        <el-card class="interaction-card">
          <template #header>
            <div class="card-header">
              <span>待处理互动</span>
              <el-badge :value="pendingInteractions.length" class="badge">
                <el-button type="text" size="small">查看全部</el-button>
              </el-badge>
            </div>
          </template>
          <div class="interaction-list">
            <div v-for="interaction in pendingInteractions.slice(0, 5)" :key="interaction.id" class="interaction-item">
              <div class="interaction-avatar">
                <el-avatar :src="interaction.user.avatar" :size="32">{{ interaction.user.name[0] }}</el-avatar>
              </div>
              <div class="interaction-content">
                <div class="interaction-header">
                  <span class="user-name">{{ interaction.user.name }}</span>
                  <span class="interaction-type">{{ getInteractionTypeText(interaction.type) }}</span>
                </div>
                <p class="interaction-text">{{ interaction.content }}</p>
                <div class="interaction-meta">
                  <span class="platform">{{ getPlatformName(interaction.platform) }}</span>
                  <span class="time">{{ formatRelativeTime(interaction.createdAt) }}</span>
                </div>
              </div>
              <div class="interaction-actions">
                <el-button type="text" size="small" @click="replyToInteraction(interaction)">
                  <el-icon><ChatDotRound /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 创建内容对话框 -->
    <el-dialog v-model="createPostDialog.visible" title="创建社交媒体内容" width="900px">
      <el-form :model="createPostDialog.form" :rules="postFormRules" ref="postFormRef" label-width="100px">
        <el-form-item label="选择平台" prop="platforms" required>
          <el-checkbox-group v-model="createPostDialog.form.platforms">
            <el-checkbox v-for="platform in connectedPlatforms" :key="platform.type" :value="platform.type">
              <div class="platform-checkbox">
                <div class="platform-icon" :class="platform.type">
                  <i :class="platform.icon"></i>
                </div>
                <span>{{ platform.name }}</span>
              </div>
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <el-form-item label="内容标题" prop="title" required>
          <el-input 
            v-model="createPostDialog.form.title" 
            placeholder="输入内容标题" 
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="内容描述" prop="content" required>
          <el-input
            v-model="createPostDialog.form.content"
            type="textarea"
            :rows="6"
            placeholder="输入内容描述，支持@用户、#话题标签"
            maxlength="2000"
            show-word-limit
          />
          <div class="content-tips">
            <el-tag size="small" type="info">提示：使用 # 添加话题标签</el-tag>
            <el-tag size="small" type="info">使用 @ 提及用户</el-tag>
          </div>
        </el-form-item>
        
        <el-form-item label="添加媒体">
          <el-upload
            class="media-upload"
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleMediaUpload"
            :before-upload="beforeMediaUpload"
            accept=".jpg,.jpeg,.png,.gif,.mp4,.mov"
          >
            <div v-if="!createPostDialog.form.media">
              <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
              <div class="el-upload__text">拖拽文件到此处或<em>点击上传</em></div>
              <div class="el-upload__tip">支持 jpg/png/gif/mp4 格式，大小不超过 50MB</div>
            </div>
            <div v-else class="media-preview">
              <img v-if="createPostDialog.form.media.type === 'image'" :src="createPostDialog.form.media.url" class="preview-image" />
              <div v-else class="video-preview">
                <video :src="createPostDialog.form.media.url" controls class="preview-video"></video>
              </div>
              <div class="media-actions">
                <el-button size="small" @click="removeMedia">移除</el-button>
                <el-button size="small" type="primary" @click="replaceMedia">重新选择</el-button>
              </div>
            </div>
          </el-upload>
        </el-form-item>
        
        <el-form-item label="发布时间">
          <el-radio-group v-model="createPostDialog.form.publishType">
            <el-radio value="now">立即发布</el-radio>
            <el-radio value="schedule">定时发布</el-radio>
            <el-radio value="draft">保存草稿</el-radio>
          </el-radio-group>
          <el-date-picker
            v-if="createPostDialog.form.publishType === 'schedule'"
            v-model="createPostDialog.form.scheduleTime"
            type="datetime"
            placeholder="选择发布时间"
            :disabled-date="disabledDate"
            :disabled-hours="disabledHours"
            :disabled-minutes="disabledMinutes"
            style="margin-left: 20px; margin-top: 10px;"
          />
        </el-form-item>
        
        <el-form-item label="添加标签" v-if="createPostDialog.form.platforms.length > 0">
          <el-select
            v-model="createPostDialog.form.hashtags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="选择或输入话题标签"
            style="width: 100%"
          >
            <el-option
              v-for="tag in popularHashtags"
              :key="tag.name"
              :label="tag.name"
              :value="tag.name"
            >
              <span style="float: left">{{ tag.name }}</span>
              <span style="float: right; color: #999; font-size: 13px">{{ tag.count }}次使用</span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <div class="footer-left">
            <el-button @click="createPostDialog.visible = false">取消</el-button>
          </div>
          <div class="footer-right">
            <el-button @click="saveAsDraft" v-if="createPostDialog.form.publishType !== 'draft'">
              <el-icon><Document /></el-icon>
              保存草稿
            </el-button>
            <el-button type="primary" @click="publishPost" :loading="publishing">
              <el-icon v-if="!publishing">{{ getPublishIcon() }}</el-icon>
              {{ getPublishButtonText() }}
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- 内容日历对话框 -->
    <el-dialog v-model="scheduleDialog.visible" title="内容日历" width="1000px">
      <div class="calendar-container">
        <el-calendar v-model="calendarDate">
          <template #date-cell="{ data }">
            <div class="calendar-day">
              <span class="day-number">{{ data.day.split('-').pop() }}</span>
              <div class="day-posts">
                <div
                  v-for="post in getPostsForDate(data.day)"
                  :key="post.id"
                  class="calendar-post"
                  :class="post.status"
                  @click="viewCalendarPost(post)"
                >
                  <span class="post-title">{{ post.title }}</span>
                  <div class="post-platforms">
                    <span v-for="platform in post.platforms" :key="platform" class="platform-dot" :class="platform"></span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </el-calendar>
      </div>
    </el-dialog>

    <!-- 分析详情对话框 -->
    <el-dialog v-model="analyticsDialog.visible" title="内容分析" width="800px">
      <div class="analytics-content" v-if="analyticsDialog.post">
        <div class="analytics-header">
          <h3>{{ analyticsDialog.post.title }}</h3>
          <div class="post-platforms">
            <el-tag v-for="platform in analyticsDialog.post.platforms" :key="platform" :type="getPlatformTagType(platform)" size="small">
              {{ getPlatformName(platform) }}
            </el-tag>
          </div>
        </div>
        
        <el-row :gutter="20" class="analytics-stats">
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-number">{{ analyticsDialog.post.views || 0 }}</div>
              <div class="stat-label">总浏览量</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-number">{{ analyticsDialog.post.engagement || 0 }}</div>
              <div class="stat-label">互动次数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-number">{{ analyticsDialog.post.shares || 0 }}</div>
              <div class="stat-label">分享次数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-number">{{ calculateEngagementRate(analyticsDialog.post) }}%</div>
              <div class="stat-label">互动率</div>
            </div>
          </el-col>
        </el-row>

        <div class="analytics-charts">
          <h4>平台表现对比</h4>
          <div id="platformChart" style="height: 300px;"></div>
        </div>

        <div class="engagement-timeline">
          <h4>互动时间线</h4>
          <div id="timelineChart" style="height: 200px;"></div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Calendar, User, Document, ChatDotRound, View, Clock, MoreFilled,
  VideoPlay, Share, UploadFilled, Timer, Promotion
} from '@element-plus/icons-vue'

// 响应式数据
const socialStats = ref({
  followers: 127834,
  followersGrowth: 15.8,
  posts: 24,
  postsGrowth: 20.0,
  engagement: 4.2,
  engagementGrowth: -0.8,
  reach: 89567,
  reachGrowth: 12.3
})

const contentFilter = ref({
  platform: '',
  status: ''
})

const pagination = ref({
  current: 1,
  size: 20,
  total: 65
})

const generateSocialPosts = () => {
  const titles = [
    '春季新品发布预告', '客户见证分享', '行业趋势分析', '品牌故事分享',
    '产品使用技巧', '团队日常揭秘', '用户反馈收集', '节日特别活动',
    '数据报告解读', '未来规划展望', '合作伙伴介绍', '成功案例分析',
    '创新技术分享', '市场洞察报告', '用户体验优化', '品牌新动态',
    '产品发布会', '专家观点分享', '社区互动活动', '年度总结回顾',
    '未来趋势预测', '技术创新突破', '行业领导者访谈', '用户最爱产品',
    '绿色环保倡议', '全球布局更新', '创意营销案例', '数字化转型',
    'AI智能应用', '跨境电商经验', '客户服务升级', '供应链优化',
    '数据安全保障', '移动端体验', '云计算方案', '区块链技术',
    '人工智能趋势', '物联网应用', '虚拟现实体验', '大数据分析',
    '云原生技术', '边缘计算', '量子计算', '生物识别技术',
    '智能制造', '自动驾驶', '机器人技术', '空间科技',
    '清洁能源', '气候变化', '永续发展', '社会责任',
    '数字货币', '金融科技', '投资理财', '创业创新',
    '教育技术', '在线学习', '远程办公', '数字医疗',
    '智慧城市', '交通出行', '智能家居', '高科技农业',
    '太空探索', '深海探测', '极地科研', '生物多样性',
    '文化传承', '艺术创作', '体育运动', '旅游探索',
    '美食文化', '时尚潮流', '健康生活', '心理健康',
    '职场发展', '创业精神', '团队建设', '领导力提升',
    '沟通技巧', '时间管理', '目标设定', '效率提升'
  ]
  
  const contentTemplates = [
    '🌈 今天要分享给大家一个非常有意思的话题...',
    '🚀 最近我们做了一个有意思的实验，结果令人惊喜...',
    '🌟 让我们一起探索这个充满无限可能的领域...',
    '💫 在这个快速变化的时代，我们需要不断学习和成长...',
    '✨ 今天想和大家分享一个最近的发现，希望能给您带来启发...',
    '🌱 成长的路上充满挑战，但每一步都是我们变得更强的证明...',
    '🔥 热烈庆祝我们又迎来了一个重要的里程碑...',
    '🌍 全球化的今天，我们比以往任何时候都更加紧密地联系在一起...',
    '💡 创新不仅仅是一个概念，更是我们每天都在实践的信念...',
    '🎯 成功往往不是一蹴而就的，而是由无数个小的努力累积而成...'
  ]
  
  const platforms = [['facebook'], ['instagram'], ['twitter'], ['linkedin'], ['tiktok'], 
                    ['facebook', 'instagram'], ['twitter', 'linkedin'], ['facebook', 'twitter'], 
                    ['instagram', 'twitter'], ['facebook', 'instagram', 'twitter'], 
                    ['linkedin', 'facebook'], ['instagram', 'linkedin']]
  
  const statuses = ['published', 'scheduled', 'draft', 'publishing']
  const weights = [0.6, 0.2, 0.15, 0.05] // published比例最高
  
  const posts = []
  
  for (let i = 1; i <= 65; i++) {
    const randomTitle = titles[Math.floor(Math.random() * titles.length)]
    const randomContent = contentTemplates[Math.floor(Math.random() * contentTemplates.length)]
    const randomPlatforms = platforms[Math.floor(Math.random() * platforms.length)]
    
    // 根据权重选择状态
    const rand = Math.random()
    let status
    if (rand < weights[0]) status = 'published'
    else if (rand < weights[0] + weights[1]) status = 'scheduled' 
    else if (rand < weights[0] + weights[1] + weights[2]) status = 'draft'
    else status = 'publishing'
    
    const publishTime = new Date(2024, 2, Math.floor(Math.random() * 30) + 1, 
                                 Math.floor(Math.random() * 24), 
                                 Math.floor(Math.random() * 60))
    
    const views = status === 'published' ? Math.floor(Math.random() * 50000) + 1000 : 0
    const engagement = status === 'published' ? Math.floor(views * (0.01 + Math.random() * 0.08)) : 0
    const shares = status === 'published' ? Math.floor(engagement * (0.1 + Math.random() * 0.3)) : 0
    
    posts.push({
      id: i,
      title: `${randomTitle} ${i > 1 ? '(' + i + ')' : ''}`,
      content: randomContent,
      platforms: randomPlatforms,
      status,
      publishTime: publishTime.toISOString().replace('T', ' ').substring(0, 19),
      media: Math.random() > 0.5 ? {
        type: Math.random() > 0.3 ? 'image' : 'video',
        url: `https://picsum.photos/200/120?random=${i}`
      } : null,
      views,
      engagement,
      shares
    })
  }
  
  return posts
}

const socialPosts = ref(generateSocialPosts())

const platforms = ref([
  {
    id: 1,
    type: 'facebook',
    name: 'Facebook',
    icon: 'fab fa-facebook',
    followers: 15678,
    connected: true
  },
  {
    id: 2,
    type: 'instagram',
    name: 'Instagram',
    icon: 'fab fa-instagram',
    followers: 23456,
    connected: true
  },
  {
    id: 3,
    type: 'twitter',
    name: 'Twitter',
    icon: 'fab fa-twitter',
    followers: 9876,
    connected: true
  },
  {
    id: 4,
    type: 'linkedin',
    name: 'LinkedIn',
    icon: 'fab fa-linkedin',
    followers: 5432,
    connected: true
  },
  {
    id: 5,
    type: 'tiktok',
    name: 'TikTok',
    icon: 'fab fa-tiktok',
    followers: 34567,
    connected: false
  }
])

const pendingInteractions = ref([
  {
    id: 1,
    type: 'comment',
    platform: 'facebook',
    user: {
      name: 'Sarah Johnson',
      avatar: 'https://picsum.photos/32/32?random=1'
    },
    content: '这个产品看起来很不错，什么时候能在我们当地买到？',
    createdAt: '2024-03-15 15:30:00'
  },
  {
    id: 2,
    type: 'mention',
    platform: 'twitter',
    user: {
      name: 'Mike Chen',
      avatar: 'https://picsum.photos/32/32?random=2'
    },
    content: '@ourcompany 你们的客服响应速度真的很快！',
    createdAt: '2024-03-15 14:45:00'
  },
  {
    id: 3,
    type: 'message',
    platform: 'instagram',
    user: {
      name: 'Emily Davis',
      avatar: 'https://picsum.photos/32/32?random=3'
    },
    content: '能否提供更多关于这个产品的技术规格？',
    createdAt: '2024-03-15 13:20:00'
  }
])

const createPostDialog = ref({
  visible: false,
  form: {
    platforms: [],
    title: '',
    content: '',
    publishType: 'now',
    scheduleTime: null,
    media: null,
    hashtags: []
  }
})

const postFormRef = ref()

const postFormRules = {
  platforms: [
    { required: true, type: 'array', min: 1, message: '请选择至少一个平台', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请输入内容标题', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入内容描述', trigger: 'blur' },
    { min: 10, message: '内容至少输入10个字符', trigger: 'blur' }
  ]
}

const popularHashtags = ref([
  { name: '#海外营销', count: 1247 },
  { name: '#品牌推广', count: 892 },
  { name: '#数字营销', count: 673 },
  { name: '#社交媒体', count: 451 },
  { name: '#创意内容', count: 328 },
  { name: '#用户增长', count: 267 },
  { name: '#营销策略', count: 198 },
  { name: '#客户体验', count: 156 }
])

const scheduleDialog = ref({
  visible: false
})

const analyticsDialog = ref({
  visible: false,
  post: null
})

const calendarDate = ref(new Date())
const publishing = ref(false)

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

// 计算属性
const filteredPosts = computed(() => {
  return socialPosts.value.filter(post => {
    const platformMatch = !contentFilter.value.platform || 
      post.platforms.includes(contentFilter.value.platform)
    const statusMatch = !contentFilter.value.status || 
      post.status === contentFilter.value.status
    return platformMatch && statusMatch
  })
})

const paginatedPosts = computed(() => {
  const start = (pagination.value.current - 1) * pagination.value.size
  const end = start + pagination.value.size
  return filteredPosts.value.slice(start, end)
})

const connectedPlatforms = computed(() => {
  return platforms.value.filter(p => p.connected)
})

// 方法
const showCreatePost = () => {
  createPostDialog.value.visible = true
  createPostDialog.value.form = {
    platforms: [],
    title: '',
    content: '',
    publishType: 'now',
    scheduleTime: null,
    media: null,
    hashtags: []
  }
  // 重置表单验证
  setTimeout(() => {
    postFormRef.value?.clearValidate()
  }, 100)
}

const showScheduleDialog = () => {
  scheduleDialog.value.visible = true
}

const getPlatformTagType = (platform) => {
  const types = {
    facebook: 'primary',
    instagram: 'success',
    twitter: 'info',
    linkedin: 'warning',
    tiktok: 'danger'
  }
  return types[platform] || 'default'
}

const getPlatformName = (platform) => {
  const names = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    twitter: 'Twitter',
    linkedin: 'LinkedIn',
    tiktok: 'TikTok'
  }
  return names[platform] || platform
}

const getStatusTagType = (status) => {
  const types = {
    draft: 'info',
    published: 'success',
    scheduled: 'warning',
    publishing: 'primary'
  }
  return types[status] || 'default'
}

const getStatusText = (status) => {
  const texts = {
    draft: '草稿',
    published: '已发布',
    scheduled: '已安排',
    publishing: '发布中'
  }
  return texts[status] || status
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

const handlePostAction = (command) => {
  const [action, id] = command.split('-')
  const postId = parseInt(id)
  
  switch (action) {
    case 'edit':
      editPost(postId)
      break
    case 'duplicate':
      duplicatePost(postId)
      break
    case 'analytics':
      viewAnalytics(postId)
      break
    case 'delete':
      deletePost(postId)
      break
  }
}

const editPost = (id) => {
  const post = socialPosts.value.find(p => p.id === id)
  if (post) {
    createPostDialog.value.form = { ...post }
    createPostDialog.value.visible = true
  }
}

const duplicatePost = (id) => {
  const post = socialPosts.value.find(p => p.id === id)
  if (post) {
    const newPost = {
      ...post,
      id: Date.now(),
      title: `${post.title} (副本)`,
      status: 'draft',
      publishTime: new Date().toISOString()
    }
    socialPosts.value.unshift(newPost)
    ElMessage.success('内容已复制为草稿')
  }
}

const viewAnalytics = (id) => {
  const post = socialPosts.value.find(p => p.id === id)
  if (post) {
    analyticsDialog.value.post = post
    analyticsDialog.value.visible = true
    // 延迟初始化图表，等待DOM渲染
    setTimeout(initAnalyticsCharts, 300)
  }
}

const deletePost = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个内容吗？', '确认删除', {
      type: 'warning'
    })
    const index = socialPosts.value.findIndex(p => p.id === id)
    if (index > -1) {
      socialPosts.value.splice(index, 1)
      ElMessage.success('内容已删除')
    }
  } catch {
    // 用户取消删除
  }
}

const handlePageChange = (page) => {
  pagination.value.current = page
  // 重置到页面顶部
  document.querySelector('.content-card')?.scrollIntoView({ behavior: 'smooth' })
}

const togglePlatformConnection = (platform) => {
  if (platform.connected) {
    ElMessage.success(`${platform.name} 连接成功`)
  } else {
    ElMessage.info(`${platform.name} 连接已断开`)
  }
}

const getTimeIntensity = (day, hour) => {
  // 模拟最佳发布时间热力图数据
  const score = getTimeScore(day, hour)
  if (score >= 8) return 'high'
  if (score >= 6) return 'medium'
  if (score >= 4) return 'low'
  return 'very-low'
}

const getTimeScore = (day, hour) => {
  // 模拟评分算法
  const weekendBonus = (day === 6 || day === 7) ? 2 : 0
  const primeTime = (hour >= 18 && hour <= 22) ? 3 : 
                   (hour >= 12 && hour <= 14) ? 2 : 
                   (hour >= 8 && hour <= 10) ? 1 : 0
  return Math.min(10, 3 + weekendBonus + primeTime + Math.random() * 2)
}

const getInteractionTypeText = (type) => {
  const types = {
    comment: '评论',
    mention: '提及',
    message: '私信',
    share: '分享'
  }
  return types[type] || type
}

const replyToInteraction = (interaction) => {
  ElMessage.info(`回复 ${interaction.user.name} 的${getInteractionTypeText(interaction.type)}`)
}

const beforeMediaUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isVideo = file.type.startsWith('video/')
  const isValidType = isImage || isVideo
  const isValidSize = file.size / 1024 / 1024 < 50

  if (!isValidType) {
    ElMessage.error('只能上传图片或视频文件！')
    return false
  }
  if (!isValidSize) {
    ElMessage.error('文件大小不能超过 50MB！')
    return false
  }
  return true
}

const handleMediaUpload = (file) => {
  if (beforeMediaUpload(file.raw)) {
    createPostDialog.value.form.media = {
      type: file.raw.type.startsWith('video/') ? 'video' : 'image',
      url: URL.createObjectURL(file.raw),
      file: file.raw,
      name: file.raw.name,
      size: (file.raw.size / 1024 / 1024).toFixed(2) + 'MB'
    }
    ElMessage.success('媒体文件上传成功')
  }
}

const removeMedia = () => {
  if (createPostDialog.value.form.media?.url) {
    URL.revokeObjectURL(createPostDialog.value.form.media.url)
  }
  createPostDialog.value.form.media = null
}

const replaceMedia = () => {
  removeMedia()
  // 触发上传
  document.querySelector('.media-upload input[type="file"]').click()
}

const disabledDate = (time) => {
  return time.getTime() < Date.now() - 86400000 // 不能选择过去的日期
}

const disabledHours = () => {
  const hours = []
  const now = new Date()
  const selectedDate = createPostDialog.value.form.scheduleTime
  
  if (selectedDate && selectedDate.toDateString() === now.toDateString()) {
    // 如果是今天，不能选择过去的小时
    for (let i = 0; i < now.getHours(); i++) {
      hours.push(i)
    }
  }
  return hours
}

const disabledMinutes = (hour) => {
  const minutes = []
  const now = new Date()
  const selectedDate = createPostDialog.value.form.scheduleTime
  
  if (selectedDate && 
      selectedDate.toDateString() === now.toDateString() && 
      hour === now.getHours()) {
    // 如果是今天的当前小时，不能选择过去的分钟
    for (let i = 0; i <= now.getMinutes(); i++) {
      minutes.push(i)
    }
  }
  return minutes
}

const saveAsDraft = async () => {
  try {
    await postFormRef.value.validate()
    
    const newPost = {
      id: Date.now(),
      ...createPostDialog.value.form,
      status: 'draft',
      publishTime: new Date().toISOString(),
      views: 0,
      engagement: 0,
      shares: 0
    }
    socialPosts.value.unshift(newPost)
    createPostDialog.value.visible = false
    ElMessage.success('草稿已保存')
  } catch (error) {
    ElMessage.error('请完善必填信息')
  }
}

const publishPost = async () => {
  try {
    await postFormRef.value.validate()
    
    if (createPostDialog.value.form.publishType === 'schedule' && !createPostDialog.value.form.scheduleTime) {
      ElMessage.error('请选择发布时间')
      return
    }
    
    publishing.value = true
    
    // 模拟发布过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    let status = 'published'
    let publishTime = new Date().toISOString()
    
    if (createPostDialog.value.form.publishType === 'schedule') {
      status = 'scheduled'
      publishTime = createPostDialog.value.form.scheduleTime.toISOString()
    } else if (createPostDialog.value.form.publishType === 'draft') {
      status = 'draft'
    }
    
    const newPost = {
      id: Date.now(),
      ...createPostDialog.value.form,
      status,
      publishTime,
      views: status === 'published' ? Math.floor(Math.random() * 1000) : 0,
      engagement: status === 'published' ? Math.floor(Math.random() * 100) : 0,
      shares: status === 'published' ? Math.floor(Math.random() * 50) : 0
    }
    
    socialPosts.value.unshift(newPost)
    createPostDialog.value.visible = false
    
    const messages = {
      'published': `内容已发布到 ${newPost.platforms.map(p => getPlatformName(p)).join('、')}`,
      'scheduled': `内容已安排于 ${formatTime(publishTime)} 发布`,
      'draft': '草稿已保存'
    }
    
    ElMessage.success(messages[status])
    
  } catch (error) {
    ElMessage.error('请完善必填信息')
  } finally {
    publishing.value = false
  }
}

const getPostsForDate = (date) => {
  return socialPosts.value.filter(post => {
    const postDate = new Date(post.publishTime).toISOString().split('T')[0]
    return postDate === date && (post.status === 'scheduled' || post.status === 'published')
  })
}

const viewCalendarPost = (post) => {
  ElMessage.info(`查看内容：${post.title}`)
}

const getPublishIcon = () => {
  const icons = {
    'now': 'Promotion',
    'schedule': 'Timer',
    'draft': 'Document'
  }
  return icons[createPostDialog.value.form.publishType] || 'Promotion'
}

const getPublishButtonText = () => {
  const texts = {
    'now': '立即发布',
    'schedule': '安排发布',
    'draft': '保存草稿'
  }
  return texts[createPostDialog.value.form.publishType] || '发布'
}

const calculateEngagementRate = (post) => {
  if (!post.views || post.views === 0) return 0
  return ((post.engagement / post.views) * 100).toFixed(1)
}

const initAnalyticsCharts = () => {
  // 这里可以使用ECharts初始化图表
  // 暂时用占位符替代
  console.log('初始化分析图表')
}

onMounted(() => {
  // 模拟定期更新统计数据
  setInterval(() => {
    if (Math.random() > 0.7) {
      socialStats.value.followers += Math.floor(Math.random() * 10)
      socialStats.value.reach += Math.floor(Math.random() * 100)
    }
  }, 10000)
})
</script>

<style scoped>
.social-media-page {
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

.stat-icon.followers {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.posts {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.engagement {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.reach {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
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

.content-card {
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

.content-list {
  margin: 20px 0;
}

.post-item {
  display: flex;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  margin-bottom: 12px;
  background: white;
  transition: all 0.3s;
}

.post-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.post-media {
  width: 80px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  margin-right: 16px;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.post-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-placeholder,
.text-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #909399;
}

.post-content {
  flex: 1;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.post-platforms {
  display: flex;
  gap: 6px;
}

.post-content h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
}

.post-description {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
}

.post-time {
  display: flex;
  align-items: center;
  gap: 4px;
}

.post-stats {
  display: flex;
  gap: 16px;
}

.post-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.post-actions {
  margin-left: 16px;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}

.platform-status-card {
  margin-bottom: 20px;
}

.platform-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.platform-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
}

.platform-info {
  display: flex;
  align-items: center;
}

.platform-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: white;
  font-size: 20px;
}

.platform-icon.facebook {
  background: #1877f2;
}

.platform-icon.instagram {
  background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
}

.platform-icon.twitter {
  background: #1da1f2;
}

.platform-icon.linkedin {
  background: #0077b5;
}

.platform-icon.tiktok {
  background: #000000;
}

.platform-details h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
}

.platform-details p {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.best-time-card {
  margin-bottom: 20px;
}

.time-heatmap {
  font-size: 10px;
}

.heatmap-header {
  margin-bottom: 8px;
}

.day-labels {
  display: flex;
  margin-left: 40px;
}

.day-labels span {
  width: 20px;
  text-align: center;
  font-weight: 500;
  color: #666;
}

.hour-row {
  display: flex;
  align-items: center;
  margin-bottom: 2px;
}

.hour-label {
  width: 35px;
  font-size: 10px;
  color: #666;
}

.hour-cells {
  display: flex;
  gap: 2px;
}

.time-cell {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  cursor: pointer;
}

.time-cell.very-low {
  background: #ebedf0;
}

.time-cell.low {
  background: #c6e48b;
}

.time-cell.medium {
  background: #7bc96f;
}

.time-cell.high {
  background: #239a3b;
}

.interaction-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.interaction-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.interaction-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
}

.interaction-content {
  flex: 1;
}

.interaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.user-name {
  font-weight: 500;
  font-size: 14px;
}

.interaction-type {
  font-size: 12px;
  color: #666;
}

.interaction-text {
  margin: 0 0 8px 0;
  font-size: 13px;
  line-height: 1.4;
}

.interaction-meta {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: #999;
}

.media-upload {
  width: 100%;
}

.calendar-container {
  height: 500px;
  overflow: auto;
}

.calendar-day {
  height: 100px;
  position: relative;
}

.day-number {
  position: absolute;
  top: 4px;
  left: 4px;
  font-weight: 500;
}

.day-posts {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.calendar-post {
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 10px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.calendar-post.scheduled {
  background: #fef0e6;
  border-left: 3px solid #e6a23c;
}

.calendar-post.published {
  background: #f0f9ff;
  border-left: 3px solid #409eff;
}

.post-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-platforms {
  display: flex;
  gap: 2px;
}

.platform-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.platform-dot.facebook {
  background: #1877f2;
}

.platform-dot.instagram {
  background: #e4405f;
}

.platform-dot.twitter {
  background: #1da1f2;
}

.platform-dot.linkedin {
  background: #0077b5;
}

.platform-dot.tiktok {
  background: #000000;
}

.danger {
  color: #f56c6c !important;
}

/* 创建内容对话框样式 */
.platform-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.platform-checkbox .platform-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.content-tips {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}

.media-preview {
  text-align: center;
  padding: 20px;
}

.preview-image,
.preview-video {
  max-width: 300px;
  max-height: 200px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.media-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-left,
.footer-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 分析对话框样式 */
.analytics-content {
  padding: 0;
}

.analytics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.analytics-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.analytics-stats {
  margin-bottom: 32px;
}

.analytics-stats .stat-item {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.analytics-charts,
.engagement-timeline {
  margin-bottom: 24px;
}

.analytics-charts h4,
.engagement-timeline h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}
</style>