<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="title">价格体系管理</h2>
      <p class="description">管理多币种价格、阶梯价格、促销价格等价格策略</p>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-select
          v-model="currentCurrency"
          placeholder="选择币种"
          style="width: 150px"
          @change="changeCurrency"
        >
          <el-option
            v-for="currency in supportedCurrencies"
            :key="currency.code"
            :label="`${currency.name} (${currency.symbol})`"
            :value="currency.code"
          >
            <span class="currency-option">
              <span class="currency-symbol">{{ currency.symbol }}</span>
              <span class="currency-name">{{ currency.name }}</span>
            </span>
          </el-option>
        </el-select>

        <el-button-group style="margin-left: 15px">
          <el-button
            v-for="tab in priceTabs"
            :key="tab.key"
            :type="activeTab === tab.key ? 'primary' : ''"
            @click="switchTab(tab.key)"
          >
            <el-icon><component :is="tab.icon" /></el-icon>
            {{ tab.label }}
          </el-button>
        </el-button-group>
      </div>

      <div class="toolbar-right">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索产品"
          style="width: 200px; margin-right: 10px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-button type="primary" @click="showBatchPriceDialog">
          <el-icon><Edit /></el-icon>
          批量调价
        </el-button>

        <el-button @click="showPromotionDialog">
          <el-icon><Star /></el-icon>
          创建促销
        </el-button>

        <el-button @click="showImportDialog">
          <el-icon><Upload /></el-icon>
          导入价格
        </el-button>

        <el-button @click="exportPrices">
          <el-icon><Download /></el-icon>
          导出价格
        </el-button>
      </div>
    </div>

    <!-- 汇率信息 -->
    <el-card shadow="never" class="exchange-rate-card">
      <div class="exchange-rates">
        <div class="rate-info">
          <span class="rate-label">当前汇率 (基于美元)：</span>
          <span
            v-for="rate in exchangeRates"
            :key="rate.currency"
            class="rate-item"
            :class="{ active: rate.currency === currentCurrency }"
          >
            {{ rate.currency }}: {{ rate.rate }}
          </span>
          <span class="update-time">更新时间: {{ exchangeRates[0]?.updateTime }}</span>
        </div>
        <el-button size="small" @click="updateExchangeRates">
          <el-icon><Refresh /></el-icon>
          更新汇率
        </el-button>
      </div>
    </el-card>

    <!-- 价格表格 -->
    <el-card shadow="never">
      <el-table
        :data="filteredProducts"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column label="产品信息" min-width="200" fixed="left">
          <template #default="{ row }">
            <div class="product-info-cell">
              <img :src="row.image" class="product-image" />
              <div>
                <div class="product-name">{{ row.name }}</div>
                <div class="product-sku">SKU: {{ row.sku }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 基础价格 -->
        <el-table-column label="基础价格" min-width="120">
          <template #default="{ row }">
            <div class="price-cell">
              <span class="price-value">
                {{ getCurrentPrice(row, 'base') }}
              </span>
              <el-button
                type="text"
                size="small"
                @click="editBasePrice(row)"
              >
                编辑
              </el-button>
            </div>
          </template>
        </el-table-column>

        <!-- 成本价 -->
        <el-table-column label="成本价" min-width="120">
          <template #default="{ row }">
            <div class="price-cell">
              <span class="price-value">
                {{ getCurrentPrice(row, 'cost') }}
              </span>
              <span class="profit-margin">
                ({{ calculateProfitMargin(row) }}%)
              </span>
            </div>
          </template>
        </el-table-column>

        <!-- 市场价 -->
        <el-table-column label="市场价" min-width="120">
          <template #default="{ row }">
            <div class="price-cell">
              <span class="price-value">
                {{ getCurrentPrice(row, 'market') }}
              </span>
              <span class="discount-rate">
                (-{{ calculateDiscountRate(row) }}%)
              </span>
            </div>
          </template>
        </el-table-column>

        <!-- 阶梯价格 -->
        <el-table-column label="阶梯价格" min-width="150">
          <template #default="{ row }">
            <div class="tier-price-cell">
              <div v-if="row.tierPrices?.length" class="tier-list">
                <div
                  v-for="tier in row.tierPrices.slice(0, 2)"
                  :key="tier.minQty"
                  class="tier-item"
                >
                  {{ tier.minQty }}+ : {{ formatPrice(tier.price, currentCurrency) }}
                </div>
                <div v-if="row.tierPrices.length > 2" class="tier-more">
                  +{{ row.tierPrices.length - 2 }}个价格段
                </div>
              </div>
              <el-button
                type="text"
                size="small"
                @click="manageTierPrice(row)"
              >
                {{ row.tierPrices?.length ? '管理' : '设置' }}
              </el-button>
            </div>
          </template>
        </el-table-column>

        <!-- 促销价格 -->
        <el-table-column label="促销价格" min-width="150">
          <template #default="{ row }">
            <div class="promotion-cell">
              <div v-if="row.activePromotion" class="promotion-info">
                <div class="promotion-price">
                  {{ getCurrentPrice(row, 'promotion') }}
                </div>
                <div class="promotion-time">
                  {{ formatPromotionTime(row.activePromotion) }}
                </div>
              </div>
              <div v-else class="no-promotion">暂无促销</div>
              <el-button
                type="text"
                size="small"
                @click="managePromotion(row)"
              >
                管理
              </el-button>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="价格状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="getPriceStatusType(row)"
              size="small"
            >
              {{ getPriceStatusText(row) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button type="text" size="small" @click="editAllPrices(row)">
                编辑价格
              </el-button>
              <el-button type="text" size="small" @click="viewPriceHistory(row)">
                历史记录
              </el-button>
              <el-dropdown @command="handleRowAction">
                <el-button type="text" size="small">
                  更多<el-icon><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="{ action: 'copy', row }">
                      复制价格
                    </el-dropdown-item>
                    <el-dropdown-item :command="{ action: 'sync', row }">
                      同步价格
                    </el-dropdown-item>
                    <el-dropdown-item :command="{ action: 'reset', row }">
                      重置价格
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 编辑价格对话框 -->
    <el-dialog
      v-model="priceDialogVisible"
      :title="`编辑价格 - ${currentEditProduct?.name}`"
      width="900px"
    >
      <div v-if="currentEditProduct" class="price-edit-container">
        <el-tabs v-model="priceEditTab">
          <!-- 基础价格 -->
          <el-tab-pane label="基础价格" name="basic">
            <el-form :model="priceForm" label-width="100px">
              <el-row :gutter="20">
                <el-col :span="8" v-for="currency in supportedCurrencies" :key="currency.code">
                  <el-card shadow="hover" class="currency-card">
                    <template #header>
                      <div class="currency-header">
                        <span class="currency-symbol">{{ currency.symbol }}</span>
                        <span class="currency-name">{{ currency.name }}</span>
                      </div>
                    </template>

                    <el-form-item label="成本价">
                      <el-input-number
                        v-model="priceForm[currency.code].cost"
                        :precision="2"
                        :min="0"
                        style="width: 100%"
                        @change="calculateProfitMargin(priceForm, currency.code)"
                      />
                    </el-form-item>

                    <el-form-item label="基础价格">
                      <el-input-number
                        v-model="priceForm[currency.code].base"
                        :precision="2"
                        :min="0"
                        style="width: 100%"
                        @change="calculateProfitMargin(priceForm, currency.code)"
                      />
                    </el-form-item>

                    <el-form-item label="市场价">
                      <el-input-number
                        v-model="priceForm[currency.code].market"
                        :precision="2"
                        :min="0"
                        style="width: 100%"
                      />
                    </el-form-item>

                    <div class="price-analysis">
                      <div class="analysis-item">
                        <span>利润率: {{ getProfitMargin(priceForm, currency.code) }}%</span>
                      </div>
                      <div class="analysis-item">
                        <span>折扣率: {{ getDiscountRate(priceForm, currency.code) }}%</span>
                      </div>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </el-form>
          </el-tab-pane>

          <!-- 阶梯价格 -->
          <el-tab-pane label="阶梯价格" name="tier">
            <div class="tier-price-manager">
              <div class="tier-header">
                <h4>阶梯价格设置</h4>
                <el-button type="primary" size="small" @click="addTierPrice">
                  <el-icon><Plus /></el-icon>
                  添加价格段
                </el-button>
              </div>

              <el-table :data="tierPriceForm" style="width: 100%">
                <el-table-column label="最小数量" width="120">
                  <template #default="{ row, $index }">
                    <el-input-number
                      v-model="row.minQty"
                      :min="1"
                      controls-position="right"
                      @change="validateTierPrices"
                    />
                  </template>
                </el-table-column>
                
                <el-table-column
                  v-for="currency in supportedCurrencies"
                  :key="currency.code"
                  :label="currency.symbol"
                  width="120"
                >
                  <template #default="{ row }">
                    <el-input-number
                      v-model="row.prices[currency.code]"
                      :precision="2"
                      :min="0"
                      controls-position="right"
                    />
                  </template>
                </el-table-column>

                <el-table-column label="操作" width="80">
                  <template #default="{ $index }">
                    <el-button
                      type="text"
                      size="small"
                      class="danger"
                      @click="removeTierPrice($index)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>

          <!-- 促销设置 -->
          <el-tab-pane label="促销设置" name="promotion">
            <div class="promotion-manager">
              <el-form :model="promotionForm" label-width="100px">
                <el-form-item label="促销类型">
                  <el-radio-group v-model="promotionForm.type">
                    <el-radio label="fixed">固定价格</el-radio>
                    <el-radio label="discount">折扣比例</el-radio>
                    <el-radio label="amount">优惠金额</el-radio>
                  </el-radio-group>
                </el-form-item>

                <el-form-item label="促销时间">
                  <el-date-picker
                    v-model="promotionForm.timeRange"
                    type="datetimerange"
                    range-separator="至"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                    style="width: 100%"
                  />
                </el-form-item>

                <el-row :gutter="20">
                  <el-col :span="12" v-for="currency in supportedCurrencies" :key="currency.code">
                    <el-card shadow="hover" class="promotion-card">
                      <template #header>
                        {{ currency.name }} ({{ currency.symbol }})
                      </template>

                      <el-form-item v-if="promotionForm.type === 'fixed'" label="促销价格">
                        <el-input-number
                          v-model="promotionForm.prices[currency.code].fixed"
                          :precision="2"
                          :min="0"
                          style="width: 100%"
                        />
                      </el-form-item>

                      <el-form-item v-if="promotionForm.type === 'discount'" label="折扣比例">
                        <el-input-number
                          v-model="promotionForm.prices[currency.code].discount"
                          :precision="1"
                          :min="0"
                          :max="100"
                          style="width: 100%"
                        />
                        <span class="unit">%</span>
                      </el-form-item>

                      <el-form-item v-if="promotionForm.type === 'amount'" label="优惠金额">
                        <el-input-number
                          v-model="promotionForm.prices[currency.code].amount"
                          :precision="2"
                          :min="0"
                          style="width: 100%"
                        />
                      </el-form-item>

                      <div class="promotion-preview">
                        <span>促销后价格: {{ calculatePromotionPrice(currency.code) }}</span>
                      </div>
                    </el-card>
                  </el-col>
                </el-row>
              </el-form>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="priceDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="savePrices">保存价格</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量调价对话框 -->
    <el-dialog v-model="batchPriceDialogVisible" title="批量调价" width="600px">
      <el-form :model="batchForm" label-width="100px">
        <el-form-item label="调价类型">
          <el-radio-group v-model="batchForm.type">
            <el-radio label="percentage">按比例调整</el-radio>
            <el-radio label="amount">按金额调整</el-radio>
            <el-radio label="fixed">设置固定价格</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="目标币种">
          <el-select v-model="batchForm.currency" style="width: 100%">
            <el-option
              v-for="currency in supportedCurrencies"
              :key="currency.code"
              :label="currency.name"
              :value="currency.code"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="价格类型">
          <el-checkbox-group v-model="batchForm.priceTypes">
            <el-checkbox label="base">基础价格</el-checkbox>
            <el-checkbox label="market">市场价</el-checkbox>
            <el-checkbox label="cost">成本价</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item
          :label="batchForm.type === 'percentage' ? '调整比例' : 
                  batchForm.type === 'amount' ? '调整金额' : '固定价格'"
        >
          <el-input-number
            v-model="batchForm.value"
            :precision="2"
            style="width: 100%"
            :placeholder="batchForm.type === 'percentage' ? '如：10 表示上调10%' : ''"
          />
          <span v-if="batchForm.type === 'percentage'" class="unit">%</span>
        </el-form-item>

        <el-form-item label="应用范围">
          <el-radio-group v-model="batchForm.scope">
            <el-radio label="selected">仅选中产品</el-radio>
            <el-radio label="filtered">当前筛选结果</el-radio>
            <el-radio label="all">所有产品</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="batchPriceDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="executeBatchPrice">确认调价</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 导入价格对话框 -->
    <el-dialog v-model="importDialogVisible" title="导入价格" width="600px">
      <el-upload
        ref="uploadRef"
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleImportFile"
        accept=".xlsx,.csv"
      >
        <el-icon class="el-icon--upload"><Upload /></el-icon>
        <div class="el-upload__text">
          将价格文件拖拽到此处，或<em>点击选择文件</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 Excel、CSV 格式的价格文件
          </div>
        </template>
      </el-upload>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="executeImport">确认导入</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 支持的币种
const supportedCurrencies = [
  { code: 'USD', name: '美元', symbol: '$' },
  { code: 'EUR', name: '欧元', symbol: '€' },
  { code: 'GBP', name: '英镑', symbol: '£' },
  { code: 'JPY', name: '日元', symbol: '¥' },
  { code: 'CNY', name: '人民币', symbol: '¥' }
]

// 价格选项卡
const priceTabs = [
  { key: 'all', label: '全部价格', icon: 'Grid' },
  { key: 'base', label: '基础价格', icon: 'Money' },
  { key: 'tier', label: '阶梯价格', icon: 'TrendCharts' },
  { key: 'promotion', label: '促销价格', icon: 'Star' }
]

// 响应式数据
const currentCurrency = ref('USD')
const activeTab = ref('all')
const searchKeyword = ref('')

// 汇率数据
const exchangeRates = ref([
  { currency: 'USD', rate: 1.0000, updateTime: '2024-01-19 10:30:00' },
  { currency: 'EUR', rate: 0.8234, updateTime: '2024-01-19 10:30:00' },
  { currency: 'GBP', rate: 0.7123, updateTime: '2024-01-19 10:30:00' },
  { currency: 'JPY', rate: 148.52, updateTime: '2024-01-19 10:30:00' },
  { currency: 'CNY', rate: 7.1820, updateTime: '2024-01-19 10:30:00' }
])

// 对话框状态
const priceDialogVisible = ref(false)
const batchPriceDialogVisible = ref(false)
const importDialogVisible = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 选中的产品
const selectedProducts = ref([])
const currentEditProduct = ref(null)

// 表单数据
const priceEditTab = ref('basic')
const priceForm = reactive({})
const tierPriceForm = ref([])
const promotionForm = reactive({
  type: 'fixed',
  timeRange: null,
  prices: {}
})

const batchForm = reactive({
  type: 'percentage',
  currency: 'USD',
  priceTypes: ['base'],
  value: 0,
  scope: 'selected'
})

// 模拟产品数据
const products = ref([
  {
    id: 1,
    sku: 'SW-001',
    name: 'Apple Watch Series 9',
    image: 'https://via.placeholder.com/60x60',
    prices: {
      USD: { cost: 200, base: 399, market: 449 },
      EUR: { cost: 164, base: 329, market: 370 },
      GBP: { cost: 142, base: 284, market: 320 },
      JPY: { cost: 29700, base: 59300, market: 66700 },
      CNY: { cost: 1436, base: 2865, market: 3225 }
    },
    tierPrices: [
      { minQty: 10, prices: { USD: 380, EUR: 313, GBP: 270, JPY: 56400, CNY: 2730 } },
      { minQty: 50, prices: { USD: 360, EUR: 296, GBP: 256, JPY: 53500, CNY: 2586 } },
      { minQty: 100, prices: { USD: 340, EUR: 280, GBP: 242, JPY: 50500, CNY: 2443 } }
    ],
    activePromotion: {
      type: 'discount',
      value: 15,
      startTime: '2024-01-15 00:00:00',
      endTime: '2024-01-31 23:59:59',
      prices: { USD: 339.15, EUR: 279.65, GBP: 241.40, JPY: 50405, CNY: 2435.25 }
    }
  },
  {
    id: 2,
    sku: 'SW-002',
    name: 'Samsung Galaxy Watch 6',
    image: 'https://via.placeholder.com/60x60',
    prices: {
      USD: { cost: 150, base: 329, market: 379 },
      EUR: { cost: 123, base: 271, market: 312 },
      GBP: { cost: 107, base: 234, market: 270 },
      JPY: { cost: 22300, base: 48900, market: 56300 },
      CNY: { cost: 1077, base: 2363, market: 2722 }
    },
    tierPrices: [
      { minQty: 20, prices: { USD: 310, EUR: 255, GBP: 221, JPY: 46100, CNY: 2227 } },
      { minQty: 100, prices: { USD: 290, EUR: 239, GBP: 206, JPY: 43100, CNY: 2083 } }
    ],
    activePromotion: null
  },
  {
    id: 3,
    sku: 'CAM-001',
    name: 'Sony Alpha 7R V',
    image: 'https://via.placeholder.com/60x60',
    prices: {
      USD: { cost: 2800, base: 3899, market: 4299 },
      EUR: { cost: 2305, base: 3211, market: 3540 },
      GBP: { cost: 1994, base: 2777, market: 3061 },
      JPY: { cost: 415800, base: 579100, market: 638300 },
      CNY: { cost: 20104, base: 28008, market: 30871 }
    },
    tierPrices: [],
    activePromotion: null
  },
  {
    id: 4,
    sku: 'IP-001',
    name: 'iPhone 15 Pro Max',
    image: 'https://via.placeholder.com/60x60',
    prices: {
      USD: { cost: 600, base: 1199, market: 1299 },
      EUR: { cost: 494, base: 988, market: 1070 },
      GBP: { cost: 427, base: 854, market: 925 },
      JPY: { cost: 89100, base: 178200, market: 192900 },
      CNY: { cost: 4309, base: 8617, market: 9332 }
    },
    tierPrices: [
      { minQty: 5, prices: { USD: 1150, EUR: 947, GBP: 818, JPY: 170700, CNY: 8260 } },
      { minQty: 20, prices: { USD: 1100, EUR: 906, GBP: 783, JPY: 163500, CNY: 7904 } }
    ],
    activePromotion: {
      type: 'fixed',
      value: 999,
      startTime: '2024-02-01 00:00:00',
      endTime: '2024-02-29 23:59:59',
      prices: { USD: 999, EUR: 823, GBP: 712, JPY: 148300, CNY: 7175 }
    }
  },
  {
    id: 5,
    sku: 'TB-001',
    name: 'iPad Pro 12.9"',
    image: 'https://via.placeholder.com/60x60',
    prices: {
      USD: { cost: 450, base: 1099, market: 1199 },
      EUR: { cost: 371, base: 906, market: 988 },
      GBP: { cost: 321, base: 784, market: 855 },
      JPY: { cost: 66800, base: 163200, market: 178100 },
      CNY: { cost: 3234, base: 7896, market: 8617 }
    },
    tierPrices: [
      { minQty: 10, prices: { USD: 1050, EUR: 865, GBP: 748, JPY: 155900, CNY: 7544 } }
    ],
    activePromotion: null
  },
  {
    id: 6,
    sku: 'LT-001',
    name: 'MacBook Air M3',
    image: 'https://via.placeholder.com/60x60',
    prices: {
      USD: { cost: 700, base: 1099, market: 1199 },
      EUR: { cost: 577, base: 906, market: 988 },
      GBP: { cost: 499, base: 784, market: 855 },
      JPY: { cost: 103900, base: 163200, market: 178100 },
      CNY: { cost: 5028, base: 7896, market: 8617 }
    },
    tierPrices: [
      { minQty: 5, prices: { USD: 1050, EUR: 865, GBP: 748, JPY: 155900, CNY: 7544 } },
      { minQty: 15, prices: { USD: 999, EUR: 823, GBP: 712, JPY: 148300, CNY: 7175 } }
    ],
    activePromotion: null
  },
  {
    id: 7,
    sku: 'HP-001',
    name: 'AirPods Pro 2nd Gen',
    image: 'https://via.placeholder.com/60x60',
    prices: {
      USD: { cost: 120, base: 249, market: 279 },
      EUR: { cost: 99, base: 205, market: 230 },
      GBP: { cost: 86, base: 178, market: 199 },
      JPY: { cost: 17800, base: 37000, market: 41400 },
      CNY: { cost: 862, base: 1789, market: 2005 }
    },
    tierPrices: [
      { minQty: 20, prices: { USD: 230, EUR: 190, GBP: 164, JPY: 34100, CNY: 1651 } },
      { minQty: 50, prices: { USD: 210, EUR: 173, GBP: 150, JPY: 31200, CNY: 1509 } }
    ],
    activePromotion: {
      type: 'discount',
      value: 10,
      startTime: '2024-01-20 00:00:00',
      endTime: '2024-02-15 23:59:59',
      prices: { USD: 224.1, EUR: 184.5, GBP: 160.2, JPY: 33300, CNY: 1610.1 }
    }
  },
  {
    id: 8,
    sku: 'GM-001',
    name: 'PlayStation 5',
    image: 'https://via.placeholder.com/60x60',
    prices: {
      USD: { cost: 350, base: 499, market: 549 },
      EUR: { cost: 288, base: 411, market: 452 },
      GBP: { cost: 249, base: 356, market: 391 },
      JPY: { cost: 52000, base: 74100, market: 81500 },
      CNY: { cost: 2515, base: 3585, market: 3944 }
    },
    tierPrices: [
      { minQty: 10, prices: { USD: 475, EUR: 391, GBP: 338, JPY: 70500, CNY: 3412 } }
    ],
    activePromotion: null
  },
  {
    id: 9,
    sku: 'TV-001',
    name: 'Samsung 65" QLED 4K TV',
    image: 'https://via.placeholder.com/60x60',
    prices: {
      USD: { cost: 800, base: 1299, market: 1499 },
      EUR: { cost: 659, base: 1070, market: 1235 },
      GBP: { cost: 570, base: 927, market: 1069 },
      JPY: { cost: 118800, base: 192900, market: 222700 },
      CNY: { cost: 5746, base: 9332, market: 10765 }
    },
    tierPrices: [
      { minQty: 5, prices: { USD: 1250, EUR: 1030, GBP: 891, JPY: 185600, CNY: 8975 } }
    ],
    activePromotion: {
      type: 'fixed',
      value: 1099,
      startTime: '2024-01-10 00:00:00',
      endTime: '2024-01-31 23:59:59',
      prices: { USD: 1099, EUR: 906, GBP: 784, JPY: 163200, CNY: 7896 }
    }
  },
  {
    id: 10,
    sku: 'AC-001',
    name: 'Nintendo Switch OLED',
    image: 'https://via.placeholder.com/60x60',
    prices: {
      USD: { cost: 220, base: 349, market: 379 },
      EUR: { cost: 181, base: 288, market: 312 },
      GBP: { cost: 157, base: 249, market: 270 },
      JPY: { cost: 32700, base: 51800, market: 56300 },
      CNY: { cost: 1581, base: 2507, market: 2722 }
    },
    tierPrices: [
      { minQty: 15, prices: { USD: 330, EUR: 272, GBP: 235, JPY: 49000, CNY: 2370 } },
      { minQty: 30, prices: { USD: 315, EUR: 260, GBP: 225, JPY: 46800, CNY: 2263 } }
    ],
    activePromotion: null
  },
  {
    id: 11,
    sku: 'KB-001',
    name: 'Magic Keyboard',
    image: 'https://via.placeholder.com/60x60',
    prices: {
      USD: { cost: 80, base: 179, market: 199 },
      EUR: { cost: 66, base: 148, market: 164 },
      GBP: { cost: 57, base: 128, market: 142 },
      JPY: { cost: 11900, base: 26600, market: 29500 },
      CNY: { cost: 575, base: 1286, market: 1430 }
    },
    tierPrices: [
      { minQty: 25, prices: { USD: 165, EUR: 136, GBP: 118, JPY: 24500, CNY: 1186 } }
    ],
    activePromotion: null
  },
  {
    id: 12,
    sku: 'MS-001',
    name: 'Magic Mouse',
    image: 'https://via.placeholder.com/60x60',
    prices: {
      USD: { cost: 40, base: 79, market: 89 },
      EUR: { cost: 33, base: 65, market: 73 },
      GBP: { cost: 29, base: 56, market: 63 },
      JPY: { cost: 5940, base: 11700, market: 13200 },
      CNY: { cost: 287, base: 567, market: 639 }
    },
    tierPrices: [
      { minQty: 50, prices: { USD: 72, EUR: 59, GBP: 51, JPY: 10700, CNY: 517 } }
    ],
    activePromotion: {
      type: 'discount',
      value: 8,
      startTime: '2024-01-25 00:00:00',
      endTime: '2024-02-10 23:59:59',
      prices: { USD: 72.68, EUR: 59.8, GBP: 51.52, JPY: 10764, CNY: 521.64 }
    }
  }
])

// 计算属性
const filteredProducts = computed(() => {
  return products.value.filter(product => {
    const matchesKeyword = !searchKeyword.value ||
      product.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchKeyword.value.toLowerCase())

    return matchesKeyword
  })
})

// 方法
const changeCurrency = (currency) => {
  ElMessage.info(`切换到${currency}价格显示`)
}

const switchTab = (tab) => {
  activeTab.value = tab
}

const getCurrentPrice = (product, type) => {
  const price = product.prices[currentCurrency.value]?.[type]
  return formatPrice(price, currentCurrency.value)
}

const formatPrice = (price, currency) => {
  if (!price) return '-'
  const currencyInfo = supportedCurrencies.find(c => c.code === currency)
  const symbol = currencyInfo?.symbol || '$'
  
  if (currency === 'JPY') {
    return `${symbol}${Math.round(price).toLocaleString()}`
  }
  return `${symbol}${price.toFixed(2)}`
}

const calculateProfitMargin = (product) => {
  const prices = product.prices[currentCurrency.value]
  if (!prices?.cost || !prices?.base) return 0
  return (((prices.base - prices.cost) / prices.cost) * 100).toFixed(1)
}

const calculateDiscountRate = (product) => {
  const prices = product.prices[currentCurrency.value]
  if (!prices?.market || !prices?.base) return 0
  return (((prices.market - prices.base) / prices.market) * 100).toFixed(1)
}

const formatPromotionTime = (promotion) => {
  if (!promotion) return ''
  const start = new Date(promotion.startTime).toLocaleDateString()
  const end = new Date(promotion.endTime).toLocaleDateString()
  return `${start} - ${end}`
}

const getPriceStatusType = (product) => {
  if (product.activePromotion) {
    const now = new Date()
    const end = new Date(product.activePromotion.endTime)
    if (now > end) return 'info'
    return 'success'
  }
  return product.tierPrices?.length ? 'warning' : ''
}

const getPriceStatusText = (product) => {
  if (product.activePromotion) {
    const now = new Date()
    const end = new Date(product.activePromotion.endTime)
    if (now > end) return '促销已过期'
    return '促销中'
  }
  return product.tierPrices?.length ? '阶梯价格' : '普通价格'
}

const handleSelectionChange = (selection) => {
  selectedProducts.value = selection
}

const handleSizeChange = (size) => {
  pagination.size = size
}

const handlePageChange = (page) => {
  pagination.page = page
}

const handleRowAction = ({ action, row }) => {
  switch (action) {
    case 'copy':
      ElMessage.success(`已复制 ${row.name} 的价格`)
      break
    case 'sync':
      ElMessage.success(`已同步 ${row.name} 的价格`)
      break
    case 'reset':
      ElMessage.success(`已重置 ${row.name} 的价格`)
      break
  }
}

const editBasePrice = (product) => {
  ElMessage.info(`编辑 ${product.name} 的基础价格`)
}

const editAllPrices = (product) => {
  currentEditProduct.value = product
  
  // 初始化价格表单
  supportedCurrencies.forEach(currency => {
    priceForm[currency.code] = { ...product.prices[currency.code] }
  })
  
  // 初始化阶梯价格
  tierPriceForm.value = product.tierPrices ? [...product.tierPrices] : []
  
  // 初始化促销表单
  if (product.activePromotion) {
    promotionForm.type = product.activePromotion.type
    promotionForm.timeRange = [
      new Date(product.activePromotion.startTime),
      new Date(product.activePromotion.endTime)
    ]
    supportedCurrencies.forEach(currency => {
      promotionForm.prices[currency.code] = {
        fixed: product.activePromotion.prices[currency.code],
        discount: product.activePromotion.value,
        amount: 0
      }
    })
  }
  
  priceDialogVisible.value = true
}

const manageTierPrice = (product) => {
  currentEditProduct.value = product
  tierPriceForm.value = product.tierPrices ? [...product.tierPrices] : []
  priceEditTab.value = 'tier'
  priceDialogVisible.value = true
}

const managePromotion = (product) => {
  currentEditProduct.value = product
  priceEditTab.value = 'promotion'
  priceDialogVisible.value = true
}

const viewPriceHistory = (product) => {
  ElMessage.info(`查看 ${product.name} 的价格历史`)
}

const addTierPrice = () => {
  const newTier = {
    minQty: tierPriceForm.value.length > 0 
      ? Math.max(...tierPriceForm.value.map(t => t.minQty)) + 10 
      : 10,
    prices: {}
  }
  
  supportedCurrencies.forEach(currency => {
    newTier.prices[currency.code] = 0
  })
  
  tierPriceForm.value.push(newTier)
}

const removeTierPrice = (index) => {
  tierPriceForm.value.splice(index, 1)
}

const validateTierPrices = () => {
  tierPriceForm.value.sort((a, b) => a.minQty - b.minQty)
}

const getProfitMargin = (form, currency) => {
  const prices = form[currency]
  if (!prices?.cost || !prices?.base) return 0
  return (((prices.base - prices.cost) / prices.cost) * 100).toFixed(1)
}

const getDiscountRate = (form, currency) => {
  const prices = form[currency]
  if (!prices?.market || !prices?.base) return 0
  return (((prices.market - prices.base) / prices.market) * 100).toFixed(1)
}

const calculatePromotionPrice = (currency) => {
  if (!currentEditProduct.value) return '-'
  
  const basePrice = priceForm[currency]?.base || 0
  const promotionData = promotionForm.prices[currency]
  
  if (!promotionData) return '-'
  
  switch (promotionForm.type) {
    case 'fixed':
      return formatPrice(promotionData.fixed, currency)
    case 'discount':
      return formatPrice(basePrice * (1 - promotionData.discount / 100), currency)
    case 'amount':
      return formatPrice(basePrice - promotionData.amount, currency)
    default:
      return '-'
  }
}

const savePrices = () => {
  if (!currentEditProduct.value) return
  
  // 保存基础价格
  currentEditProduct.value.prices = { ...priceForm }
  
  // 保存阶梯价格
  currentEditProduct.value.tierPrices = [...tierPriceForm.value]
  
  // 保存促销设置
  if (promotionForm.timeRange) {
    currentEditProduct.value.activePromotion = {
      type: promotionForm.type,
      startTime: promotionForm.timeRange[0].toISOString(),
      endTime: promotionForm.timeRange[1].toISOString(),
      prices: {}
    }
    
    supportedCurrencies.forEach(currency => {
      const basePrice = priceForm[currency.code]?.base || 0
      const promotionData = promotionForm.prices[currency.code]
      
      switch (promotionForm.type) {
        case 'fixed':
          currentEditProduct.value.activePromotion.prices[currency.code] = promotionData.fixed
          break
        case 'discount':
          currentEditProduct.value.activePromotion.prices[currency.code] = 
            basePrice * (1 - promotionData.discount / 100)
          currentEditProduct.value.activePromotion.value = promotionData.discount
          break
        case 'amount':
          currentEditProduct.value.activePromotion.prices[currency.code] = 
            basePrice - promotionData.amount
          currentEditProduct.value.activePromotion.value = promotionData.amount
          break
      }
    })
  }
  
  priceDialogVisible.value = false
  ElMessage.success('价格保存成功')
}

const showBatchPriceDialog = () => {
  if (selectedProducts.value.length === 0) {
    ElMessage.warning('请先选择要调价的产品')
    return
  }
  batchPriceDialogVisible.value = true
}

const executeBatchPrice = () => {
  ElMessage.success(`批量调价完成，影响 ${selectedProducts.value.length} 个产品`)
  batchPriceDialogVisible.value = false
}

const showPromotionDialog = () => {
  ElMessage.info('创建促销活动')
}

const showImportDialog = () => {
  importDialogVisible.value = true
}

const executeImport = () => {
  ElMessage.success('价格导入完成')
  importDialogVisible.value = false
}

const exportPrices = () => {
  ElMessage.success('正在导出价格文件...')
}

const updateExchangeRates = () => {
  ElMessage.success('汇率更新完成')
}

const handleImportFile = (file) => {
  ElMessage.info(`选择了文件: ${file.name}`)
}

onMounted(() => {
  pagination.total = products.value.length
  
  // 初始化促销表单
  supportedCurrencies.forEach(currency => {
    promotionForm.prices[currency.code] = {
      fixed: 0,
      discount: 0,
      amount: 0
    }
  })
})
</script>

<style scoped lang="scss">
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-lg;
  padding: $spacing-md;
  background: $bg-white;
  border-radius: 4px;
  box-shadow: $box-shadow-base;
  
  .toolbar-left {
    display: flex;
    align-items: center;
  }
  
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }
}

.currency-option {
  display: flex;
  align-items: center;
  
  .currency-symbol {
    margin-right: 8px;
    font-weight: bold;
  }
}

.exchange-rate-card {
  margin-bottom: $spacing-lg;
  
  .exchange-rates {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .rate-info {
      display: flex;
      align-items: center;
      gap: $spacing-md;
      
      .rate-label {
        font-weight: 500;
        color: $text-primary;
      }
      
      .rate-item {
        padding: 4px 8px;
        background: $bg-color;
        border-radius: 4px;
        font-size: $font-size-sm;
        
        &.active {
          background: $primary-color;
          color: white;
        }
      }
      
      .update-time {
        font-size: $font-size-sm;
        color: $text-secondary;
      }
    }
  }
}

.product-info-cell {
  display: flex;
  align-items: center;
  
  .product-image {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 4px;
    margin-right: $spacing-md;
  }
  
  .product-name {
    font-weight: 500;
    color: $text-primary;
    margin-bottom: 4px;
  }
  
  .product-sku {
    font-size: $font-size-sm;
    color: $text-secondary;
  }
}

.price-cell {
  .price-value {
    font-weight: 500;
    color: $text-primary;
    display: block;
    margin-bottom: 4px;
  }
  
  .profit-margin {
    font-size: $font-size-sm;
    color: $success-color;
  }
  
  .discount-rate {
    font-size: $font-size-sm;
    color: $danger-color;
  }
}

.tier-price-cell {
  .tier-list {
    margin-bottom: $spacing-sm;
    
    .tier-item {
      font-size: $font-size-sm;
      color: $text-regular;
      margin-bottom: 2px;
    }
    
    .tier-more {
      font-size: $font-size-sm;
      color: $text-secondary;
      font-style: italic;
    }
  }
}

.promotion-cell {
  .promotion-info {
    margin-bottom: $spacing-sm;
    
    .promotion-price {
      font-weight: 500;
      color: $danger-color;
      margin-bottom: 2px;
    }
    
    .promotion-time {
      font-size: $font-size-sm;
      color: $text-secondary;
    }
  }
  
  .no-promotion {
    font-size: $font-size-sm;
    color: $text-secondary;
    margin-bottom: $spacing-sm;
  }
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  white-space: nowrap;
  
  .el-button {
    margin: 0;
  }
  
  .el-dropdown {
    display: inline-flex;
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: $spacing-lg 0;
}

.price-edit-container {
  .currency-card {
    .currency-header {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      
      .currency-symbol {
        font-size: 18px;
        font-weight: bold;
      }
      
      .currency-name {
        font-size: $font-size-sm;
        color: $text-secondary;
      }
    }
    
    .price-analysis {
      border-top: 1px solid $border-light;
      padding-top: $spacing-sm;
      margin-top: $spacing-sm;
      
      .analysis-item {
        font-size: $font-size-sm;
        color: $text-secondary;
        margin-bottom: $spacing-xs;
      }
    }
  }
}

.tier-price-manager {
  .tier-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-lg;
    
    h4 {
      margin: 0;
      color: $text-primary;
    }
  }
}

.promotion-manager {
  .promotion-card {
    .promotion-preview {
      border-top: 1px solid $border-light;
      padding-top: $spacing-sm;
      margin-top: $spacing-sm;
      font-size: $font-size-sm;
      color: $text-secondary;
    }
  }
  
  .unit {
    margin-left: $spacing-xs;
    color: $text-secondary;
  }
}

.danger {
  color: $danger-color !important;
}

:deep(.el-table) {
  .el-table__row {
    &:hover {
      background-color: #f8f9fa;
    }
  }
}
</style>