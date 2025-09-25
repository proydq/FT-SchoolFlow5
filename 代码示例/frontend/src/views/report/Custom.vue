<template>
  <div class="custom-report-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h2>自定义报表</h2>
        <div class="header-actions">
          <el-button @click="showTemplateDialog = true">
            <el-icon><Collection /></el-icon>
            报表模板
          </el-button>
          <el-button type="primary" @click="createNewReport">
            <el-icon><Plus /></el-icon>
            新建报表
          </el-button>
        </div>
      </div>
    </div>

    <!-- 报表列表 -->
    <div class="report-list-section">
      <div class="section-header">
        <div class="search-filters">
          <el-input
            v-model="searchQuery"
            placeholder="搜索报表名称"
            prefix-icon="Search"
            style="width: 300px"
            @change="handleSearch"
          />
          <el-select v-model="categoryFilter" placeholder="报表分类" style="width: 150px" @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="营销报表" value="marketing" />
            <el-option label="客户报表" value="customer" />
            <el-option label="渠道报表" value="channel" />
            <el-option label="财务报表" value="finance" />
          </el-select>
          <el-select v-model="statusFilter" placeholder="状态" style="width: 120px" @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="已发布" value="published" />
            <el-option label="草稿" value="draft" />
          </el-select>
        </div>
        <div class="view-toggle">
          <el-radio-group v-model="viewMode" @change="handleViewModeChange">
            <el-radio-button label="list">列表</el-radio-button>
            <el-radio-button label="grid">卡片</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-if="viewMode === 'list'" class="table-view">
        <el-table :data="filteredReports" style="width: 100%">
          <el-table-column prop="name" label="报表名称" width="200">
            <template #default="{ row }">
              <div class="report-name">
                <el-icon class="report-icon" :style="{ color: getCategoryColor(row.category) }">
                  <Document />
                </el-icon>
                {{ row.name }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="category" label="分类" width="120">
            <template #default="{ row }">
              <el-tag :type="getCategoryTagType(row.category)">{{ getCategoryLabel(row.category) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'published' ? 'success' : ''">
                {{ row.status === 'published' ? '已发布' : '草稿' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="lastModified" label="最后修改" width="180" />
          <el-table-column prop="creator" label="创建者" width="120" />
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <div class="operation-buttons">
                <el-button size="small" @click="viewReport(row)">预览</el-button>
                <el-button size="small" type="primary" @click="editReport(row)">编辑</el-button>
                <el-dropdown trigger="click">
                  <el-button size="small" type="info">
                    更多<el-icon><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="duplicateReport(row)">复制</el-dropdown-item>
                      <el-dropdown-item @click="exportReport(row)">导出</el-dropdown-item>
                      <el-dropdown-item @click="shareReport(row)">分享</el-dropdown-item>
                      <el-dropdown-item divided @click="deleteReport(row)">删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 卡片视图 -->
      <div v-else class="grid-view">
        <div class="report-grid">
          <div v-for="report in filteredReports" :key="report.id" class="report-card">
            <div class="card-header">
              <div class="report-info">
                <el-icon class="report-icon" :style="{ color: getCategoryColor(report.category) }">
                  <Document />
                </el-icon>
                <div>
                  <h4>{{ report.name }}</h4>
                  <p>{{ report.description }}</p>
                </div>
              </div>
              <el-dropdown trigger="click">
                <el-button size="small" text>
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="duplicateReport(report)">复制</el-dropdown-item>
                    <el-dropdown-item @click="exportReport(report)">导出</el-dropdown-item>
                    <el-dropdown-item @click="shareReport(report)">分享</el-dropdown-item>
                    <el-dropdown-item divided @click="deleteReport(report)">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <div class="card-content">
              <div class="report-meta">
                <el-tag size="small" :type="getCategoryTagType(report.category)">
                  {{ getCategoryLabel(report.category) }}
                </el-tag>
                <el-tag size="small" :type="report.status === 'published' ? 'success' : ''">
                  {{ report.status === 'published' ? '已发布' : '草稿' }}
                </el-tag>
              </div>
              <div class="report-stats">
                <div class="stat-item">
                  <span class="label">图表数:</span>
                  <span class="value">{{ report.chartCount }}</span>
                </div>
                <div class="stat-item">
                  <span class="label">数据源:</span>
                  <span class="value">{{ report.dataSource }}</span>
                </div>
              </div>
              <div class="report-footer">
                <span class="creator">{{ report.creator }}</span>
                <span class="time">{{ report.lastModified }}</span>
              </div>
            </div>
            <div class="card-actions">
              <el-button size="small" @click="viewReport(report)">预览</el-button>
              <el-button size="small" type="primary" @click="editReport(report)">编辑</el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalReports"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 报表设计器 -->
    <el-dialog
      v-model="designerVisible"
      title="报表设计器"
      width="95%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="report-designer">
        <!-- 工具栏 -->
        <div class="designer-toolbar">
          <div class="toolbar-left">
            <el-button @click="saveReport" type="primary">
              <el-icon><Document /></el-icon>
              保存
            </el-button>
            <el-button @click="previewReport">
              <el-icon><View /></el-icon>
              预览
            </el-button>
            <el-button @click="publishReport">
              <el-icon><Upload /></el-icon>
              发布
            </el-button>
          </div>
          <div class="toolbar-right">
            <el-button @click="undoAction" :disabled="!canUndo">
              <el-icon><RefreshLeft /></el-icon>
              撤销
            </el-button>
            <el-button @click="redoAction" :disabled="!canRedo">
              <el-icon><RefreshRight /></el-icon>
              重做
            </el-button>
            <el-button @click="designerVisible = false">关闭</el-button>
          </div>
        </div>

        <div class="designer-content">
          <!-- 左侧组件面板 -->
          <div class="component-panel">
            <div class="panel-header">
              <h4>组件库</h4>
            </div>
            <el-collapse v-model="activeCollapse">
              <el-collapse-item title="图表组件" name="charts">
                <div class="component-grid">
                  <div 
                    v-for="chart in chartComponents" 
                    :key="chart.type"
                    class="component-item"
                    draggable="true"
                    @dragstart="handleDragStart($event, chart)"
                  >
                    <el-icon>
                      <component :is="chart.icon" />
                    </el-icon>
                    <span>{{ chart.name }}</span>
                  </div>
                </div>
              </el-collapse-item>
              <el-collapse-item title="表格组件" name="tables">
                <div class="component-grid">
                  <div 
                    v-for="table in tableComponents" 
                    :key="table.type"
                    class="component-item"
                    draggable="true"
                    @dragstart="handleDragStart($event, table)"
                  >
                    <el-icon>
                      <component :is="table.icon" />
                    </el-icon>
                    <span>{{ table.name }}</span>
                  </div>
                </div>
              </el-collapse-item>
              <el-collapse-item title="筛选组件" name="filters">
                <div class="component-grid">
                  <div 
                    v-for="filter in filterComponents" 
                    :key="filter.type"
                    class="component-item"
                    draggable="true"
                    @dragstart="handleDragStart($event, filter)"
                  >
                    <el-icon>
                      <component :is="filter.icon" />
                    </el-icon>
                    <span>{{ filter.name }}</span>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>

          <!-- 中间设计区域 -->
          <div class="design-canvas">
            <div class="canvas-header">
              <div class="report-info">
                <el-input v-model="currentReport.name" placeholder="报表名称" style="width: 200px" />
                <el-select v-model="currentReport.category" placeholder="选择分类" style="width: 150px">
                  <el-option label="营销报表" value="marketing" />
                  <el-option label="客户报表" value="customer" />
                  <el-option label="渠道报表" value="channel" />
                  <el-option label="财务报表" value="finance" />
                </el-select>
              </div>
              <div class="canvas-tools">
                <el-select v-model="canvasZoom" @change="handleZoomChange">
                  <el-option label="50%" value="0.5" />
                  <el-option label="75%" value="0.75" />
                  <el-option label="100%" value="1" />
                  <el-option label="125%" value="1.25" />
                  <el-option label="150%" value="1.5" />
                </el-select>
              </div>
            </div>
            <div 
              class="canvas-area"
              :style="{ transform: `scale(${canvasZoom})` }"
              @drop="handleDrop"
              @dragover.prevent
            >
              <div 
                v-for="(component, index) in reportComponents" 
                :key="component.id"
                class="canvas-component"
                :class="{ active: selectedComponent === component.id }"
                :style="{ 
                  left: component.x + 'px', 
                  top: component.y + 'px',
                  width: component.width + 'px',
                  height: component.height + 'px'
                }"
                @click="selectComponent(component.id)"
              >
                <div class="component-content">
                  <component 
                    :is="getComponentView(component.type)" 
                    :config="component.config"
                    :data="component.data"
                  />
                </div>
                <div v-if="selectedComponent === component.id" class="component-controls">
                  <div class="resize-handle resize-handle-nw"></div>
                  <div class="resize-handle resize-handle-ne"></div>
                  <div class="resize-handle resize-handle-sw"></div>
                  <div class="resize-handle resize-handle-se"></div>
                  <el-button size="small" class="delete-btn" @click="deleteComponent(index)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
              <div v-if="reportComponents.length === 0" class="canvas-placeholder">
                <el-icon><Plus /></el-icon>
                <p>拖拽组件到此处开始设计报表</p>
              </div>
            </div>
          </div>

          <!-- 右侧属性面板 -->
          <div class="property-panel">
            <div class="panel-header">
              <h4>属性配置</h4>
            </div>
            <div class="property-content">
              <el-tabs v-model="activeTab">
                <el-tab-pane label="数据源" name="datasource">
                  <div class="datasource-config">
                    <el-form label-width="80px">
                      <el-form-item label="数据源">
                        <el-select v-model="selectedDataSource" placeholder="选择数据源">
                          <el-option label="营销活动数据" value="campaign" />
                          <el-option label="客户数据" value="customer" />
                          <el-option label="邮件数据" value="email" />
                          <el-option label="社媒数据" value="social" />
                          <el-option label="WhatsApp数据" value="whatsapp" />
                        </el-select>
                      </el-form-item>
                      <el-form-item label="查询条件">
                        <el-button size="small" @click="showQueryBuilder = true">配置查询</el-button>
                      </el-form-item>
                      <el-form-item label="数据字段">
                        <div class="field-list">
                          <div v-for="field in availableFields" :key="field.key" class="field-item">
                            <el-checkbox v-model="field.selected">{{ field.label }}</el-checkbox>
                            <el-tag size="small">{{ field.type }}</el-tag>
                          </div>
                        </div>
                      </el-form-item>
                    </el-form>
                  </div>
                </el-tab-pane>
                <el-tab-pane label="样式" name="style">
                  <div class="style-config">
                    <el-form label-width="80px">
                      <el-form-item label="主题色">
                        <el-color-picker v-model="componentStyle.primaryColor" />
                      </el-form-item>
                      <el-form-item label="背景色">
                        <el-color-picker v-model="componentStyle.backgroundColor" />
                      </el-form-item>
                      <el-form-item label="字体大小">
                        <el-slider v-model="componentStyle.fontSize" :min="12" :max="24" />
                      </el-form-item>
                      <el-form-item label="边框">
                        <el-switch v-model="componentStyle.showBorder" />
                      </el-form-item>
                    </el-form>
                  </div>
                </el-tab-pane>
                <el-tab-pane label="交互" name="interaction">
                  <div class="interaction-config">
                    <el-form label-width="80px">
                      <el-form-item label="点击事件">
                        <el-select v-model="componentInteraction.clickAction">
                          <el-option label="无" value="none" />
                          <el-option label="跳转链接" value="link" />
                          <el-option label="钻取" value="drill" />
                          <el-option label="筛选" value="filter" />
                        </el-select>
                      </el-form-item>
                      <el-form-item label="工具提示">
                        <el-switch v-model="componentInteraction.showTooltip" />
                      </el-form-item>
                      <el-form-item label="动画效果">
                        <el-switch v-model="componentInteraction.enableAnimation" />
                      </el-form-item>
                    </el-form>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 报表模板对话框 -->
    <el-dialog v-model="showTemplateDialog" title="报表模板" width="800px">
      <div class="template-gallery">
        <div class="template-grid">
          <div v-for="template in reportTemplates" :key="template.id" class="template-card">
            <div class="template-preview">
              <img :src="template.preview" :alt="template.name" />
            </div>
            <div class="template-info">
              <h4>{{ template.name }}</h4>
              <p>{{ template.description }}</p>
              <div class="template-meta">
                <el-tag size="small">{{ template.category }}</el-tag>
                <span class="usage-count">{{ template.usage }}次使用</span>
              </div>
            </div>
            <div class="template-actions">
              <el-button size="small" @click="previewTemplate(template)">预览</el-button>
              <el-button size="small" type="primary" @click="useTemplate(template)">使用</el-button>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 查询构建器对话框 -->
    <el-dialog v-model="showQueryBuilder" title="查询构建器" width="900px">
      <div class="query-builder">
        <div class="query-conditions">
          <h4>查询条件</h4>
          <div v-for="(condition, index) in queryConditions" :key="index" class="condition-row">
            <el-select v-model="condition.field" placeholder="选择字段">
              <el-option v-for="field in availableFields" :key="field.key" :label="field.label" :value="field.key" />
            </el-select>
            <el-select v-model="condition.operator" placeholder="操作符">
              <el-option label="等于" value="eq" />
              <el-option label="不等于" value="ne" />
              <el-option label="大于" value="gt" />
              <el-option label="小于" value="lt" />
              <el-option label="包含" value="contains" />
            </el-select>
            <el-input v-model="condition.value" placeholder="值" />
            <el-button @click="removeCondition(index)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
          <el-button @click="addCondition">添加条件</el-button>
        </div>
        <div class="query-preview">
          <h4>SQL预览</h4>
          <el-input type="textarea" :value="generatedSQL" readonly rows="6" />
        </div>
      </div>
      <template #footer>
        <el-button @click="showQueryBuilder = false">取消</el-button>
        <el-button type="primary" @click="applyQuery">应用</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Search,
  Document,
  View,
  Upload,
  Delete,
  ArrowDown,
  MoreFilled,
  Collection,
  RefreshLeft,
  RefreshRight,
  TrendCharts,
  Histogram,
  PieChart,
  Grid,
  Calendar,
  Filter
} from '@element-plus/icons-vue'

// 基础数据
const searchQuery = ref('')
const categoryFilter = ref('')
const statusFilter = ref('')
const viewMode = ref('list')
const currentPage = ref(1)
const pageSize = ref(10)
const totalReports = ref(0)

// 报表列表
const reports = ref([
  {
    id: 1,
    name: '月度营销效果报表',
    category: 'marketing',
    description: '展示月度营销活动的整体效果和ROI分析',
    status: 'published',
    lastModified: '2024-01-15 14:30',
    creator: '张三',
    chartCount: 8,
    dataSource: '营销数据'
  },
  {
    id: 2,
    name: '客户增长分析',
    category: 'customer',
    description: '客户增长趋势和获客渠道分析报表',
    status: 'draft',
    lastModified: '2024-01-14 09:15',
    creator: '李四',
    chartCount: 5,
    dataSource: '客户数据'
  },
  {
    id: 3,
    name: '邮件营销效果统计',
    category: 'channel',
    description: '邮件发送、打开、点击等核心指标统计',
    status: 'published',
    lastModified: '2024-01-13 16:45',
    creator: '王五',
    chartCount: 6,
    dataSource: '邮件数据'
  },
  {
    id: 4,
    name: '社媒渠道对比分析',
    category: 'channel',
    description: '不同社交媒体平台的投放效果对比',
    status: 'published',
    lastModified: '2024-01-12 11:20',
    creator: '赵六',
    chartCount: 4,
    dataSource: '社媒数据'
  },
  {
    id: 5,
    name: '营销预算执行报告',
    category: 'finance',
    description: '营销预算使用情况和成本效益分析',
    status: 'draft',
    lastModified: '2024-01-11 13:30',
    creator: '孙七',
    chartCount: 7,
    dataSource: '财务数据'
  },
  {
    id: 6,
    name: '客户满意度调研报告',
    category: 'customer',
    description: '客户满意度调研结果分析和改进建议',
    status: 'published',
    lastModified: '2024-01-10 15:20',
    creator: '周八',
    chartCount: 3,
    dataSource: '调研数据'
  },
  {
    id: 7,
    name: '产品销售趋势分析',
    category: 'marketing',
    description: '各产品线销售趋势和市场占有率分析',
    status: 'published',
    lastModified: '2024-01-09 10:45',
    creator: '吴九',
    chartCount: 9,
    dataSource: '销售数据'
  },
  {
    id: 8,
    name: '线上活动效果评估',
    category: 'channel',
    description: '线上营销活动的参与度和转化效果评估',
    status: 'draft',
    lastModified: '2024-01-08 14:15',
    creator: '郑十',
    chartCount: 6,
    dataSource: '活动数据'
  },
  {
    id: 9,
    name: '广告投放ROI分析',
    category: 'finance',
    description: '各广告渠道的投资回报率对比分析',
    status: 'published',
    lastModified: '2024-01-07 16:30',
    creator: '王十一',
    chartCount: 5,
    dataSource: '广告数据'
  },
  {
    id: 10,
    name: '用户行为路径分析',
    category: 'customer',
    description: '用户在平台上的行为路径和转化漏斗分析',
    status: 'published',
    lastModified: '2024-01-06 09:25',
    creator: '冯十二',
    chartCount: 4,
    dataSource: '用户数据'
  },
  {
    id: 11,
    name: '竞品分析报告',
    category: 'marketing',
    description: '主要竞争对手的营销策略和市场表现分析',
    status: 'draft',
    lastModified: '2024-01-05 11:40',
    creator: '陈十三',
    chartCount: 7,
    dataSource: '市场数据'
  },
  {
    id: 12,
    name: '会员等级分布统计',
    category: 'customer',
    description: '会员等级分布和消费行为统计分析',
    status: 'published',
    lastModified: '2024-01-04 13:50',
    creator: '褚十四',
    chartCount: 3,
    dataSource: '会员数据'
  },
  {
    id: 13,
    name: '季度营销总结',
    category: 'marketing',
    description: '第四季度营销活动总结和效果评估',
    status: 'published',
    lastModified: '2024-01-03 15:20',
    creator: '卫十五',
    chartCount: 8,
    dataSource: '营销数据'
  },
  {
    id: 14,
    name: '客服工单分析',
    category: 'customer',
    description: '客服工单处理效率和客户问题分类分析',
    status: 'draft',
    lastModified: '2024-01-02 10:30',
    creator: '蒋十六',
    chartCount: 4,
    dataSource: '客服数据'
  },
  {
    id: 15,
    name: '渠道成本效益分析',
    category: 'finance',
    description: '各营销渠道的成本投入和收益对比',
    status: 'published',
    lastModified: '2024-01-01 14:45',
    creator: '沈十七',
    chartCount: 6,
    dataSource: '财务数据'
  },
  {
    id: 16,
    name: '邮件营销A/B测试',
    category: 'channel',
    description: '邮件营销不同版本的效果对比测试报告',
    status: 'published',
    lastModified: '2023-12-31 16:10',
    creator: '韩十八',
    chartCount: 5,
    dataSource: '测试数据'
  },
  {
    id: 17,
    name: '用户留存率分析',
    category: 'customer',
    description: '新用户和老用户的留存率趋势分析',
    status: 'draft',
    lastModified: '2023-12-30 11:25',
    creator: '杨十九',
    chartCount: 3,
    dataSource: '用户数据'
  },
  {
    id: 18,
    name: '营销活动投放计划',
    category: 'marketing',
    description: '下季度营销活动投放计划和预算分配',
    status: 'draft',
    lastModified: '2023-12-29 09:15',
    creator: '朱二十',
    chartCount: 7,
    dataSource: '计划数据'
  },
  {
    id: 19,
    name: '社交媒体粉丝增长',
    category: 'channel',
    description: '各社交媒体平台粉丝增长趋势和互动率',
    status: 'published',
    lastModified: '2023-12-28 13:40',
    creator: '秦二十一',
    chartCount: 4,
    dataSource: '社媒数据'
  },
  {
    id: 20,
    name: '客户价值分层分析',
    category: 'customer',
    description: '基于RFM模型的客户价值分层和营销策略',
    status: 'published',
    lastModified: '2023-12-27 15:55',
    creator: '尤二十二',
    chartCount: 6,
    dataSource: '客户数据'
  },
  {
    id: 21,
    name: '移动端转化漏斗',
    category: 'channel',
    description: '移动端用户转化漏斗和优化建议分析',
    status: 'draft',
    lastModified: '2023-12-26 10:20',
    creator: '许二十三',
    chartCount: 5,
    dataSource: '移动数据'
  },
  {
    id: 22,
    name: '营销活动成本核算',
    category: 'finance',
    description: '各营销活动的详细成本核算和效益评估',
    status: 'published',
    lastModified: '2023-12-25 14:30',
    creator: '何二十四',
    chartCount: 8,
    dataSource: '成本数据'
  },
  {
    id: 23,
    name: '品牌知名度调研',
    category: 'marketing',
    description: '品牌知名度和认知度市场调研结果分析',
    status: 'published',
    lastModified: '2023-12-24 16:45',
    creator: '吕二十五',
    chartCount: 4,
    dataSource: '调研数据'
  },
  {
    id: 24,
    name: '线下活动效果追踪',
    category: 'channel',
    description: '线下营销活动的参与度和后续转化追踪',
    status: 'draft',
    lastModified: '2023-12-23 11:10',
    creator: '施二十六',
    chartCount: 3,
    dataSource: '活动数据'
  },
  {
    id: 25,
    name: '客户画像标签体系',
    category: 'customer',
    description: '客户画像标签体系建设和应用效果分析',
    status: 'published',
    lastModified: '2023-12-22 13:25',
    creator: '张二十七',
    chartCount: 7,
    dataSource: '画像数据'
  },
  {
    id: 26,
    name: '内容营销效果评估',
    category: 'marketing',
    description: '内容营销的阅读量、分享量和转化效果评估',
    status: 'published',
    lastModified: '2023-12-21 15:40',
    creator: '孔二十八',
    chartCount: 5,
    dataSource: '内容数据'
  },
  {
    id: 27,
    name: '付费推广效果对比',
    category: 'finance',
    description: '不同付费推广渠道的效果和成本对比',
    status: 'draft',
    lastModified: '2023-12-20 09:50',
    creator: '曹二十九',
    chartCount: 6,
    dataSource: '推广数据'
  },
  {
    id: 28,
    name: '用户反馈情感分析',
    category: 'customer',
    description: '用户反馈和评论的情感倾向分析报告',
    status: 'published',
    lastModified: '2023-12-19 14:15',
    creator: '严三十',
    chartCount: 4,
    dataSource: '反馈数据'
  },
  {
    id: 29,
    name: '营销自动化效果',
    category: 'marketing',
    description: '营销自动化工具的使用效果和优化建议',
    status: 'published',
    lastModified: '2023-12-18 11:30',
    creator: '华三十一',
    chartCount: 7,
    dataSource: '自动化数据'
  },
  {
    id: 30,
    name: '跨渠道用户行为',
    category: 'channel',
    description: '用户在不同渠道间的行为轨迹和偏好分析',
    status: 'draft',
    lastModified: '2023-12-17 16:20',
    creator: '金三十二',
    chartCount: 8,
    dataSource: '行为数据'
  },
  {
    id: 31,
    name: '季度财务营销报告',
    category: 'finance',
    description: '季度营销投入产出和财务效益综合报告',
    status: 'published',
    lastModified: '2023-12-16 10:45',
    creator: '魏三十三',
    chartCount: 9,
    dataSource: '财务数据'
  },
  {
    id: 32,
    name: '新产品推广效果',
    category: 'marketing',
    description: '新产品推广活动的市场反响和销售表现',
    status: 'published',
    lastModified: '2023-12-15 13:55',
    creator: '陶三十四',
    chartCount: 6,
    dataSource: '产品数据'
  }
])

// 报表设计器
const designerVisible = ref(false)
const currentReport = ref({
  name: '',
  category: '',
  description: ''
})
const reportComponents = ref([])
const selectedComponent = ref(null)
const canvasZoom = ref(1)
const canUndo = ref(false)
const canRedo = ref(false)

// 组件面板
const activeCollapse = ref(['charts', 'tables', 'filters'])
const chartComponents = ref([
  { type: 'line-chart', name: '折线图', icon: 'TrendCharts' },
  { type: 'bar-chart', name: '柱状图', icon: 'Histogram' },
  { type: 'pie-chart', name: '饼图', icon: 'PieChart' },
  { type: 'area-chart', name: '面积图', icon: 'TrendCharts' }
])
const tableComponents = ref([
  { type: 'data-table', name: '数据表格', icon: 'Grid' },
  { type: 'summary-table', name: '汇总表格', icon: 'Grid' }
])
const filterComponents = ref([
  { type: 'date-filter', name: '日期筛选', icon: 'Calendar' },
  { type: 'dropdown-filter', name: '下拉筛选', icon: 'Filter' }
])

// 属性面板
const activeTab = ref('datasource')
const selectedDataSource = ref('')
const availableFields = ref([
  { key: 'date', label: '日期', type: 'date', selected: false },
  { key: 'campaign_name', label: '活动名称', type: 'string', selected: false },
  { key: 'send_count', label: '发送量', type: 'number', selected: false },
  { key: 'open_rate', label: '打开率', type: 'percentage', selected: false },
  { key: 'click_rate', label: '点击率', type: 'percentage', selected: false },
  { key: 'conversion_rate', label: '转化率', type: 'percentage', selected: false }
])
const componentStyle = ref({
  primaryColor: '#409EFF',
  backgroundColor: '#FFFFFF',
  fontSize: 14,
  showBorder: true
})
const componentInteraction = ref({
  clickAction: 'none',
  showTooltip: true,
  enableAnimation: true
})

// 模板和查询
const showTemplateDialog = ref(false)
const showQueryBuilder = ref(false)
const queryConditions = ref([])
const reportTemplates = ref([
  {
    id: 1,
    name: '营销概览模板',
    category: '营销报表',
    description: '包含核心营销指标的综合报表模板',
    preview: '/images/template-marketing.png',
    usage: 156
  },
  {
    id: 2,
    name: '客户分析模板',
    category: '客户报表',
    description: '客户行为和特征分析模板',
    preview: '/images/template-customer.png',
    usage: 89
  },
  {
    id: 3,
    name: '渠道效果模板',
    category: '渠道报表',
    description: '多渠道效果对比分析模板',
    preview: '/images/template-channel.png',
    usage: 67
  }
])

// 计算属性
const filteredReports = computed(() => {
  let filtered = reports.value

  if (searchQuery.value) {
    filtered = filtered.filter(report => 
      report.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (categoryFilter.value) {
    filtered = filtered.filter(report => report.category === categoryFilter.value)
  }

  if (statusFilter.value) {
    filtered = filtered.filter(report => report.status === statusFilter.value)
  }

  totalReports.value = filtered.length
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filtered.slice(start, end)
})

const generatedSQL = computed(() => {
  if (queryConditions.value.length === 0) return ''
  
  let sql = `SELECT * FROM ${selectedDataSource.value || 'table_name'}`
  if (queryConditions.value.length > 0) {
    const conditions = queryConditions.value
      .filter(c => c.field && c.operator && c.value)
      .map(c => `${c.field} ${getOperatorSQL(c.operator)} '${c.value}'`)
      .join(' AND ')
    if (conditions) {
      sql += ` WHERE ${conditions}`
    }
  }
  return sql
})

// 工具函数
const getCategoryColor = (category) => {
  const colors = {
    marketing: '#409EFF',
    customer: '#67C23A',
    channel: '#E6A23C',
    finance: '#F56C6C'
  }
  return colors[category] || '#909399'
}

const getCategoryTagType = (category) => {
  const types = {
    marketing: 'primary',
    customer: 'success',
    channel: 'warning',
    finance: 'danger'
  }
  return types[category] || 'info'
}

const getCategoryLabel = (category) => {
  const labels = {
    marketing: '营销报表',
    customer: '客户报表',
    channel: '渠道报表',
    finance: '财务报表'
  }
  return labels[category] || category
}

const getOperatorSQL = (operator) => {
  const operators = {
    eq: '=',
    ne: '!=',
    gt: '>',
    lt: '<',
    contains: 'LIKE'
  }
  return operators[operator] || '='
}

const getComponentView = (type) => {
  // 这里返回对应的组件视图
  return 'div'
}

// 事件处理
const handleSearch = () => {
  currentPage.value = 1
}

const handleFilter = () => {
  currentPage.value = 1
}

const handleViewModeChange = () => {
  // 视图模式切换逻辑
}

const handleSizeChange = (size) => {
  pageSize.value = size
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

// 报表操作
const createNewReport = () => {
  currentReport.value = {
    name: '新建报表',
    category: 'marketing',
    description: ''
  }
  reportComponents.value = []
  selectedComponent.value = null
  designerVisible.value = true
}

const viewReport = (report) => {
  ElMessage.info(`预览报表: ${report.name}`)
}

const editReport = (report) => {
  currentReport.value = { ...report }
  // 加载报表组件配置
  designerVisible.value = true
}

const duplicateReport = (report) => {
  ElMessage.success(`复制报表: ${report.name}`)
}

const exportReport = (report) => {
  ElMessage.info(`导出报表: ${report.name}`)
}

const shareReport = (report) => {
  ElMessage.info(`分享报表: ${report.name}`)
}

const deleteReport = (report) => {
  ElMessageBox.confirm(
    `确定要删除报表 "${report.name}" 吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = reports.value.findIndex(r => r.id === report.id)
    if (index > -1) {
      reports.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  })
}

// 设计器操作
const saveReport = () => {
  ElMessage.success('报表保存成功')
}

const previewReport = () => {
  ElMessage.info('预览报表')
}

const publishReport = () => {
  ElMessage.success('报表发布成功')
}

const undoAction = () => {
  ElMessage.info('撤销操作')
}

const redoAction = () => {
  ElMessage.info('重做操作')
}

const handleZoomChange = () => {
  // 缩放处理
}

// 拖拽处理
const handleDragStart = (event, component) => {
  event.dataTransfer.setData('application/json', JSON.stringify(component))
}

const handleDrop = (event) => {
  const data = JSON.parse(event.dataTransfer.getData('application/json'))
  const rect = event.currentTarget.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  const newComponent = {
    id: Date.now(),
    type: data.type,
    x: x,
    y: y,
    width: 300,
    height: 200,
    config: {},
    data: []
  }
  
  reportComponents.value.push(newComponent)
  selectedComponent.value = newComponent.id
}

const selectComponent = (id) => {
  selectedComponent.value = id
}

const deleteComponent = (index) => {
  reportComponents.value.splice(index, 1)
  selectedComponent.value = null
}

// 模板操作
const previewTemplate = (template) => {
  ElMessage.info(`预览模板: ${template.name}`)
}

const useTemplate = (template) => {
  currentReport.value.name = `基于${template.name}的报表`
  currentReport.value.category = template.category.toLowerCase()
  showTemplateDialog.value = false
  designerVisible.value = true
  ElMessage.success(`已使用模板: ${template.name}`)
}

// 查询构建器
const addCondition = () => {
  queryConditions.value.push({
    field: '',
    operator: 'eq',
    value: ''
  })
}

const removeCondition = (index) => {
  queryConditions.value.splice(index, 1)
}

const applyQuery = () => {
  showQueryBuilder.value = false
  ElMessage.success('查询条件已应用')
}

onMounted(() => {
  // 初始化数据
})
</script>

<style scoped lang="scss">
.custom-report-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    
    .header-actions {
      display: flex;
      gap: 12px;
    }
  }
}

.report-list-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .search-filters {
      display: flex;
      gap: 12px;
    }
  }
}

.table-view {
  .report-name {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .report-icon {
      font-size: 16px;
    }
  }
  
  .operation-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: nowrap;
    
    .el-button {
      margin: 0;
    }
  }
}

.grid-view {
  .report-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
  }
  
  .report-card {
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    padding: 16px;
    transition: box-shadow 0.3s;
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
      
      .report-info {
        display: flex;
        gap: 12px;
        flex: 1;
        
        .report-icon {
          font-size: 20px;
          margin-top: 2px;
        }
        
        h4 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
        }
        
        p {
          margin: 0;
          font-size: 14px;
          color: #606266;
          line-height: 1.4;
        }
      }
    }
    
    .card-content {
      margin-bottom: 16px;
      
      .report-meta {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
      }
      
      .report-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-bottom: 12px;
        
        .stat-item {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          
          .label {
            color: #909399;
          }
          
          .value {
            font-weight: 500;
          }
        }
      }
      
      .report-footer {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: #909399;
      }
    }
    
    .card-actions {
      display: flex;
      gap: 8px;
    }
  }
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.report-designer {
  height: 80vh;
  display: flex;
  flex-direction: column;
  
  .designer-toolbar {
    display: flex;
    justify-content: space-between;
    padding: 12px 16px;
    background: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    
    .toolbar-left,
    .toolbar-right {
      display: flex;
      gap: 8px;
    }
  }
  
  .designer-content {
    flex: 1;
    display: flex;
    height: calc(100% - 60px);
  }
}

.component-panel {
  width: 250px;
  background: #fafafa;
  border-right: 1px solid #e4e7ed;
  
  .panel-header {
    padding: 16px;
    border-bottom: 1px solid #e4e7ed;
    
    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  .component-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    padding: 12px;
  }
  
  .component-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 8px;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    cursor: grab;
    transition: all 0.3s;
    
    &:hover {
      border-color: #409EFF;
      background: #ecf5ff;
    }
    
    &:active {
      cursor: grabbing;
    }
    
    span {
      font-size: 12px;
      text-align: center;
      margin-top: 4px;
    }
  }
}

.design-canvas {
  flex: 1;
  display: flex;
  flex-direction: column;
  
  .canvas-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: white;
    border-bottom: 1px solid #e4e7ed;
    
    .report-info {
      display: flex;
      gap: 12px;
    }
  }
  
  .canvas-area {
    flex: 1;
    background: white;
    position: relative;
    overflow: auto;
    transform-origin: top left;
    
    .canvas-component {
      position: absolute;
      border: 1px solid transparent;
      
      &.active {
        border-color: #409EFF;
      }
      
      .component-content {
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      
      .component-controls {
        position: absolute;
        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;
        
        .resize-handle {
          position: absolute;
          width: 8px;
          height: 8px;
          background: #409EFF;
          border: 1px solid white;
          border-radius: 50%;
          
          &.resize-handle-nw {
            top: 0;
            left: 0;
            cursor: nw-resize;
          }
          
          &.resize-handle-ne {
            top: 0;
            right: 0;
            cursor: ne-resize;
          }
          
          &.resize-handle-sw {
            bottom: 0;
            left: 0;
            cursor: sw-resize;
          }
          
          &.resize-handle-se {
            bottom: 0;
            right: 0;
            cursor: se-resize;
          }
        }
        
        .delete-btn {
          position: absolute;
          top: -12px;
          right: -12px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #f56c6c;
          color: white;
          border: none;
          
          &:hover {
            background: #f02c2c;
          }
        }
      }
    }
    
    .canvas-placeholder {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      color: #909399;
      
      .el-icon {
        font-size: 48px;
        margin-bottom: 12px;
      }
      
      p {
        margin: 0;
        font-size: 16px;
      }
    }
  }
}

.property-panel {
  width: 300px;
  background: #fafafa;
  border-left: 1px solid #e4e7ed;
  
  .panel-header {
    padding: 16px;
    border-bottom: 1px solid #e4e7ed;
    
    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  .property-content {
    padding: 16px;
  }
}

.field-list {
  max-height: 200px;
  overflow-y: auto;
  
  .field-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
  }
}

.template-gallery {
  .template-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }
  
  .template-card {
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    overflow: hidden;
    transition: box-shadow 0.3s;
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .template-preview {
      height: 120px;
      background: #f5f7fa;
      display: flex;
      align-items: center;
      justify-content: center;
      
      img {
        max-width: 100%;
        max-height: 100%;
      }
    }
    
    .template-info {
      padding: 12px;
      
      h4 {
        margin: 0 0 8px 0;
        font-size: 14px;
        font-weight: 600;
      }
      
      p {
        margin: 0 0 8px 0;
        font-size: 12px;
        color: #606266;
        line-height: 1.4;
      }
      
      .template-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .usage-count {
          font-size: 12px;
          color: #909399;
        }
      }
    }
    
    .template-actions {
      padding: 0 12px 12px;
      display: flex;
      gap: 8px;
    }
  }
}

.query-builder {
  .query-conditions {
    margin-bottom: 20px;
    
    h4 {
      margin: 0 0 12px 0;
    }
    
    .condition-row {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
      align-items: center;
      
      .el-select,
      .el-input {
        flex: 1;
      }
    }
  }
  
  .query-preview {
    h4 {
      margin: 0 0 12px 0;
    }
  }
}
</style>