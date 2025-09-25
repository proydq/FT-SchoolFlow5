<template>
  <div class="device-detail-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-page-header @back="handleBack">
        <template #title>
          <span>设备详情</span>
        </template>
        <template #content>
          <div class="header-content">
            <el-tag :type="getStatusType(deviceInfo.status)" size="large">
              {{ getStatusLabel(deviceInfo.status) }}
            </el-tag>
            <span class="device-name">{{ deviceInfo.name }}</span>
          </div>
        </template>
        <template #extra>
          <el-button @click="handleEdit">编辑</el-button>
          <el-button type="primary" @click="handleSave">保存配置</el-button>
        </template>
      </el-page-header>
    </div>

    <div class="detail-container">
      <!-- 左侧信息面板 -->
      <div class="left-panel">
        <!-- 基础信息 -->
        <div class="info-section">
          <div class="section-header">
            <el-icon><Monitor /></el-icon>
            <span>基础信息</span>
          </div>
          <div class="info-content">
            <div class="info-item">
              <span class="label">终端名称：</span>
              <span class="value">{{ deviceInfo.name }}</span>
            </div>
            <div class="info-item">
              <span class="label">终端ID：</span>
              <span class="value">{{ deviceInfo.deviceId }}</span>
            </div>
            <div class="info-item">
              <span class="label">IP地址：</span>
              <span class="value">{{ deviceInfo.ipAddress }}</span>
            </div>
            <div class="info-item">
              <span class="label">所在位置：</span>
              <span class="value">{{ deviceInfo.location }}</span>
            </div>
            <div class="info-item">
              <span class="label">Android版本：</span>
              <span class="value">{{ deviceInfo.androidVersion }}</span>
            </div>
            <div class="info-item">
              <span class="label">显示分辨率：</span>
              <span class="value">{{ deviceInfo.resolution }}</span>
            </div>
            <div class="info-item">
              <span class="label">存储空间：</span>
              <span class="value">{{ deviceInfo.storage }}</span>
            </div>
          </div>
        </div>

        <!-- 节目信息 -->
        <div class="info-section">
          <div class="section-header">
            <el-icon><VideoPlay /></el-icon>
            <span>节目信息</span>
          </div>
          <div class="info-content">
            <div class="info-item">
              <span class="label">互动节目：</span>
              <span class="value">{{ deviceInfo.interactiveProgram }}</span>
            </div>
            <div class="info-item">
              <span class="label">播播节目：</span>
              <span class="value">{{ deviceInfo.broadcastProgram }}</span>
            </div>
            <div class="info-item">
              <span class="label">轮播节目：</span>
              <span class="value">{{ deviceInfo.carouselProgram }}</span>
            </div>
          </div>
        </div>

        <!-- 程序信息 -->
        <div class="info-section">
          <div class="section-header">
            <el-icon><Files /></el-icon>
            <span>程序信息</span>
          </div>
          <div class="info-content">
            <div class="info-item">
              <span class="label">daemon：</span>
              <span class="value">{{ deviceInfo.daemon }}</span>
            </div>
            <div class="info-item">
              <span class="label">touch：</span>
              <span class="value">{{ deviceInfo.touch }}</span>
            </div>
            <div class="info-item">
              <span class="label">固件版本：</span>
              <span class="value">{{ deviceInfo.firmware }}</span>
            </div>
          </div>
        </div>

        <!-- 运行信息 -->
        <div class="info-section">
          <div class="section-header">
            <el-icon><Timer /></el-icon>
            <span>运行信息</span>
          </div>
          <div class="info-content">
            <div class="info-item">
              <span class="label">本次开机时间：</span>
              <span class="value">{{ deviceInfo.bootTime }}</span>
            </div>
            <div class="info-item">
              <span class="label">本次运行时长：</span>
              <span class="value">{{ deviceInfo.runTime }}</span>
            </div>
            <div class="info-item">
              <span class="label">最后同步时间：</span>
              <span class="value">{{ deviceInfo.lastSync }}</span>
            </div>
            <div class="info-item">
              <span class="label">本机管理密码：</span>
              <span class="value">{{ deviceInfo.adminPassword }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧配置面板 -->
      <div class="right-panel">
        <!-- 标签按钮 -->
        <div class="tab-buttons">
          <el-button
            v-for="tab in tabs"
            :key="tab.key"
            :type="activeTab === tab.key ? 'primary' : 'default'"
            size="small"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </el-button>
        </div>

        <!-- 配置内容区 -->
        <el-scrollbar class="config-content">
          <!-- 外设配置 -->
          <div v-if="activeTab === 'peripheral'" class="config-section">
            <div class="config-item">
              <span class="config-label">活体识别：</span>
              <el-select v-model="config.livenessDetection" size="small" style="width: 150px">
                <el-option label="单目活体" value="monocular" />
                <el-option label="双目活体" value="binocular" />
                <el-option label="关闭" value="off" />
              </el-select>
            </div>

            <div class="config-item">
              <span class="config-label">刷卡提示高音：</span>
              <el-switch v-model="config.cardBeepHigh" size="small" />
            </div>

            <div class="config-item">
              <span class="config-label">卡号逻辑：</span>
              <el-switch v-model="config.cardLogic" size="small" />
            </div>

            <div class="config-item">
              <span class="config-label">内置开关门信号：</span>
              <el-switch v-model="config.builtinDoorControl" size="small" />
            </div>

            <div class="config-item">
              <span class="config-label">会议信息提示：</span>
              <el-switch v-model="config.meetingInfoDisplay" size="small" />
            </div>

            <div class="config-item">
              <span class="config-label">会议期间门禁常开：</span>
              <el-switch v-model="config.meetingDoorOpen" size="small" />
            </div>

            <div class="config-item">
              <span class="config-label">关机时间开门：</span>
              <el-switch v-model="config.shutdownDoorOpen" size="small" />
            </div>

            <div class="config-item">
              <span class="config-label">读卡器串口1：</span>
              <el-select v-model="config.cardReaderPort1" size="small" style="width: 150px">
                <el-option label="关闭" value="off" />
                <el-option label="RS232" value="rs232" />
                <el-option label="RS485" value="rs485" />
              </el-select>
            </div>

            <div class="config-item">
              <span class="config-label">类型：</span>
              <el-select v-model="config.cardReaderType1" size="small" style="width: 200px">
                <el-option label="10.1寸近距离刷卡器" value="10inch_near" />
                <el-option label="远距离刷卡器" value="far" />
                <el-option label="二维码扫描器" value="qrcode" />
              </el-select>
            </div>

            <div class="config-item">
              <span class="config-label">读卡器串口2：</span>
              <el-select v-model="config.cardReaderPort2" size="small" style="width: 150px">
                <el-option label="关闭" value="off" />
                <el-option label="RS232" value="rs232" />
                <el-option label="RS485" value="rs485" />
              </el-select>
            </div>

            <div class="config-item">
              <span class="config-label">类型：</span>
              <el-select v-model="config.cardReaderType2" size="small" style="width: 200px">
                <el-option label="开门按钮" value="door_button" />
                <el-option label="门磁传感器" value="door_sensor" />
                <el-option label="红外传感器" value="infrared" />
              </el-select>
            </div>

            <div class="config-item">
              <span class="config-label">门禁GPIO口：</span>
              <el-input v-model="config.gpioPort" size="small" style="width: 100px" />
              <span class="config-hint">（A74）</span>
            </div>

            <div class="config-item">
              <span class="config-label">组合串口：</span>
              <el-select v-model="config.combinedPort" size="small" style="width: 150px">
                <el-option label="关闭" value="off" />
                <el-option label="启用" value="on" />
              </el-select>
            </div>
          </div>

          <!-- 显示设置 -->
          <div v-if="activeTab === 'display'" class="config-section">
            <div class="config-item">
              <span class="config-label">屏幕亮度：</span>
              <el-slider v-model="config.brightness" :max="100" style="width: 200px" />
              <span class="config-hint">{{ config.brightness }}%</span>
            </div>
            <div class="config-item">
              <span class="config-label">屏幕旋转：</span>
              <el-select v-model="config.rotation" size="small" style="width: 150px">
                <el-option label="0°" value="0" />
                <el-option label="90°" value="90" />
                <el-option label="180°" value="180" />
                <el-option label="270°" value="270" />
              </el-select>
            </div>
            <div class="config-item">
              <span class="config-label">待机时间：</span>
              <el-input v-model="config.standbyTime" size="small" style="width: 100px" />
              <span class="config-hint">分钟</span>
            </div>
          </div>

          <!-- 定时开关机 -->
          <div v-if="activeTab === 'schedule'" class="config-section">
            <div class="config-item">
              <span class="config-label">启用定时开关机：</span>
              <el-switch v-model="config.scheduleEnabled" size="small" />
            </div>
            <div class="config-item">
              <span class="config-label">开机时间：</span>
              <el-time-picker v-model="config.startupTime" format="HH:mm" size="small" />
            </div>
            <div class="config-item">
              <span class="config-label">关机时间：</span>
              <el-time-picker v-model="config.shutdownTime" format="HH:mm" size="small" />
            </div>
          </div>

          <!-- 服务器信息 -->
          <div v-if="activeTab === 'server'" class="config-section">
            <div class="config-item">
              <span class="config-label">服务器地址：</span>
              <el-input v-model="config.serverUrl" size="small" style="width: 300px" />
            </div>
            <div class="config-item">
              <span class="config-label">端口号：</span>
              <el-input v-model="config.serverPort" size="small" style="width: 100px" />
            </div>
            <div class="config-item">
              <span class="config-label">心跳间隔：</span>
              <el-input v-model="config.heartbeatInterval" size="small" style="width: 100px" />
              <span class="config-hint">秒</span>
            </div>
          </div>

          <!-- 音量信息 -->
          <div v-if="activeTab === 'volume'" class="config-section">
            <div class="config-item">
              <span class="config-label">系统音量：</span>
              <el-slider v-model="config.systemVolume" :max="100" style="width: 200px" />
              <span class="config-hint">{{ config.systemVolume }}%</span>
            </div>
            <div class="config-item">
              <span class="config-label">提示音量：</span>
              <el-slider v-model="config.alertVolume" :max="100" style="width: 200px" />
              <span class="config-hint">{{ config.alertVolume }}%</span>
            </div>
            <div class="config-item">
              <span class="config-label">静音模式：</span>
              <el-switch v-model="config.muteMode" size="small" />
            </div>
          </div>

          <!-- 其他配置 -->
          <div v-if="activeTab === 'other'" class="config-section">
            <div class="empty-state">
              <el-empty description="其他配置项" />
            </div>
          </div>
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Monitor, VideoPlay, Files, Timer } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 设备信息
const deviceInfo = reactive({
  name: '',
  deviceId: '',
  ipAddress: '',
  location: '',
  androidVersion: '8.1.0',
  resolution: '1920*1080',
  storage: '7.97GB/9.30GB',
  status: 'online',
  interactiveProgram: '主题《包块提小学溪示2-2022-12-02 14:11:37》',
  broadcastProgram: '现实播播-2022-11-15 14:38:08',
  carouselProgram: '现实轮播-2022-11-15 14:38:08',
  daemon: '4.0.43',
  touch: '4.0.43',
  firmware: 'rk3399_mid-userdebug 8.1.0 QPM8.181205.001',
  bootTime: '2022.11.28 14:35:56',
  runTime: '32天16小时15分37秒',
  lastSync: '2024-01-15 14:30:00',
  adminPassword: '123456'
})

// 标签页配置
const tabs = [
  { key: 'peripheral', label: '外设配置' },
  { key: 'display', label: '显示设置' },
  { key: 'schedule', label: '定时开关机' },
  { key: 'server', label: '服务器信息' },
  { key: 'volume', label: '音量信息' },
  { key: 'other', label: '其他配置' }
]

const activeTab = ref('peripheral')

// 配置信息
const config = reactive({
  // 外设配置
  livenessDetection: 'monocular',
  cardBeepHigh: false,
  cardLogic: true,
  builtinDoorControl: false,
  meetingInfoDisplay: true,
  meetingDoorOpen: true,
  shutdownDoorOpen: false,
  cardReaderPort1: 'off',
  cardReaderType1: '10inch_near',
  cardReaderPort2: 'off',
  cardReaderType2: 'door_button',
  gpioPort: '2',
  combinedPort: 'off',
  // 显示设置
  brightness: 80,
  rotation: '0',
  standbyTime: '30',
  // 定时开关机
  scheduleEnabled: false,
  startupTime: '',
  shutdownTime: '',
  // 服务器信息
  serverUrl: 'http://192.168.1.100',
  serverPort: '8080',
  heartbeatInterval: '60',
  // 音量信息
  systemVolume: 75,
  alertVolume: 80,
  muteMode: false
})

// 获取设备详情
const fetchDeviceDetail = () => {
  const deviceId = route.params.id as string

  // 检查deviceId是否存在
  if (!deviceId) {
    console.error('Device ID is undefined')
    return
  }

  // 模拟获取设备数据
  deviceInfo.name = `主楼1F-闸机${deviceId.slice(-2)}`
  deviceInfo.deviceId = deviceId
  deviceInfo.ipAddress = `192.168.1.${Math.floor(Math.random() * 254) + 1}`
  deviceInfo.location = '主楼 1F'

  // 根据ID判断状态
  const lastDigit = parseInt(deviceId.slice(-1))
  if (lastDigit % 3 === 0) {
    deviceInfo.status = 'offline'
  } else if (lastDigit % 5 === 0) {
    deviceInfo.status = 'shutdown'
  } else {
    deviceInfo.status = 'online'
  }
}

// 返回
const handleBack = () => {
  router.push('/access/device')
}

// 编辑
const handleEdit = () => {
  ElMessage.info('进入编辑模式')
}

// 保存配置
const handleSave = () => {
  ElMessage.success('配置保存成功')
}

// 获取状态类型
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    online: 'success',
    offline: 'danger',
    shutdown: 'warning',
    unbind: 'info'
  }
  return types[status] || 'info'
}

// 获取状态标签
const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    online: '在线',
    offline: '离线',
    shutdown: '关机',
    unbind: '未绑定'
  }
  return labels[status] || '未知'
}

onMounted(() => {
  fetchDeviceDetail()
})
</script>

<style lang="scss" scoped>
.device-detail-page {
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  background: white;
  padding: 16px 24px;
  border-bottom: 1px solid #e4e7ed;

  .header-content {
    display: flex;
    align-items: center;
    gap: 12px;

    .device-name {
      font-size: 18px;
      font-weight: 500;
      color: #303133;
    }
  }
}

.detail-container {
  display: flex;
  padding: 20px;
  gap: 20px;
  height: calc(100vh - 100px);
}

// 左侧信息面板
.left-panel {
  width: 400px;
  background: white;
  border-radius: 4px;
  padding: 20px;
  overflow-y: auto;

  .info-section {
    margin-bottom: 24px;

    .section-header {
      display: flex;
      align-items: center;
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e4e7ed;

      .el-icon {
        margin-right: 6px;
        color: #409eff;
      }
    }

    .info-content {
      .info-item {
        display: flex;
        margin-bottom: 10px;
        font-size: 13px;

        .label {
          width: 110px;
          color: #909399;
          flex-shrink: 0;
        }

        .value {
          flex: 1;
          color: #303133;
          word-break: break-all;
        }
      }
    }
  }
}

// 右侧配置面板
.right-panel {
  flex: 1;
  background: white;
  border-radius: 4px;
  padding: 20px;
  display: flex;
  flex-direction: column;

  .tab-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e4e7ed;

    .el-button {
      height: 32px;
      padding: 0 16px;
    }
  }

  .config-content {
    flex: 1;
    overflow-y: auto;
    padding-right: 10px;

    .config-section {
      padding: 10px 0;

      .config-item {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        min-height: 32px;

        .config-label {
          width: 140px;
          font-size: 14px;
          color: #606266;
          flex-shrink: 0;
          text-align: right;
          margin-right: 12px;
        }

        .config-hint {
          margin-left: 10px;
          color: #909399;
          font-size: 12px;
        }

        :deep(.el-switch) {
          height: 20px;
        }

        :deep(.el-select) {
          .el-input__inner {
            height: 32px;
          }
        }

        :deep(.el-input) {
          .el-input__inner {
            height: 32px;
          }
        }

        :deep(.el-slider) {
          margin-top: 4px;
        }
      }

      .empty-state {
        padding: 60px 0;
        text-align: center;
      }
    }
  }
}
</style>