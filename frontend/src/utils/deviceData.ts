// 设备数据共享工具
// 这里集中管理设备数据，供各个页面使用

export interface DeviceGroup {
  id: string
  label: string
  level: number
  count?: number
  children?: DeviceGroup[]
}

export interface Device {
  id: string
  name: string
  ip: string
  location: string
  status: 'online' | 'offline' | 'shutdown' | 'unbind'
  lastSync: string
  groupId?: string
}

// 生成模拟设备数据
function generateMockDevices(count: number): Device[] {
  const devices: Device[] = []
  const statuses: Device['status'][] = ['online', 'offline', 'shutdown', 'unbind']
  const statusWeights = [0.5, 0.2, 0.15, 0.15] // 设置状态权重，让在线设备更多
  const locations = ['1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', 'B1', 'B2']
  const buildings = ['主楼', '办公楼', '宿舍楼', '实验楼', '图书馆', '体育馆', '食堂', '教学楼A', '教学楼B', '科技楼']
  const deviceTypes = ['闸机', '门禁', '考勤机', '通道闸', '人脸识别终端']

  // 获取加权随机状态
  function getWeightedStatus(): Device['status'] {
    const random = Math.random()
    let cumulative = 0
    for (let i = 0; i < statuses.length; i++) {
      cumulative += statusWeights[i]
      if (random < cumulative) {
        return statuses[i]
      }
    }
    return statuses[statuses.length - 1]
  }

  for (let i = 1; i <= count; i++) {
    const status = getWeightedStatus()
    const location = locations[Math.floor(Math.random() * locations.length)]
    const building = buildings[Math.floor(Math.random() * buildings.length)]
    const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)]

    devices.push({
      id: `DEV${String(i).padStart(4, '0')}`,
      name: `${building}${location}-${deviceType}${String(i % 100).padStart(2, '0')}`,
      ip: status === 'unbind' ? '' : `192.168.${Math.floor(i / 250)}.${(i % 250) + 1}`,
      location: `${building} ${location}`,
      status: status,
      lastSync: status === 'unbind' ? '-' : `2024-09-${String(10 + Math.floor(Math.random() * 20)).padStart(2, '0')} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`
    })
  }

  return devices
}

// 设备分组树结构（与DeviceMonitor.vue保持一致）
export const deviceGroups: DeviceGroup[] = [
  {
    id: 'root',
    label: '全部设备',
    level: 0,
    count: 500,
    children: [
      {
        id: 'building-main',
        label: '主楼',
        level: 1,
        count: 200,
        children: [
          { id: 'b2', label: 'B2层', level: 2, count: 12 },
          { id: 'b1', label: 'B1层', level: 2, count: 18 },
          { id: '1f', label: '1楼', level: 2, count: 35 },
          { id: '2f', label: '2楼', level: 2, count: 28 },
          { id: '3f', label: '3楼', level: 2, count: 32 },
          { id: '4f', label: '4楼', level: 2, count: 30 },
          { id: '5f', label: '5楼', level: 2, count: 25 },
          { id: '6f', label: '6楼', level: 2, count: 20 }
        ]
      },
      {
        id: 'special',
        label: '特殊区域',
        level: 1,
        count: 35,
        children: [
          { id: 'secret', label: '密室区', level: 2, count: 8 },
          { id: 'dining', label: '餐厅区', level: 2, count: 15 },
          { id: 'broadcast', label: '播课区', level: 2, count: 12 }
        ]
      },
      {
        id: 'office-building',
        label: '办公楼',
        level: 1,
        count: 80,
        children: [
          { id: 'office-1f', label: '办公楼1F', level: 2, count: 20 },
          { id: 'office-2f', label: '办公楼2F', level: 2, count: 25 },
          { id: 'office-3f', label: '办公楼3F', level: 2, count: 20 },
          { id: 'office-4f', label: '办公楼4F', level: 2, count: 15 }
        ]
      },
      {
        id: 'dormitory',
        label: '宿舍区',
        level: 1,
        count: 60,
        children: [
          { id: 'dorm-a', label: '宿舍楼A', level: 2, count: 30 },
          { id: 'dorm-b', label: '宿舍楼B', level: 2, count: 30 }
        ]
      },
      {
        id: 'gate',
        label: '校门区域',
        level: 1,
        count: 25,
        children: [
          { id: 'main-gate', label: '正门', level: 2, count: 10 },
          { id: 'side-gate', label: '侧门', level: 2, count: 8 },
          { id: 'back-gate', label: '后门', level: 2, count: 7 }
        ]
      }
    ]
  }
]

// 生成设备数据
export const allDevices = generateMockDevices(500)

// 获取在线设备列表
export function getOnlineDevices(): Device[] {
  return allDevices.filter(device => device.status === 'online')
}

// 根据分组获取设备
export function getDevicesByGroup(groupId: string): Device[] {
  if (groupId === 'root') {
    return allDevices
  }
  // 这里可以根据实际业务逻辑来筛选设备
  // 现在简化处理，返回所有设备
  return allDevices
}

// 获取扁平化的分组列表（用于下拉选择）
export function getFlatGroups(): DeviceGroup[] {
  const result: DeviceGroup[] = []

  function traverse(node: DeviceGroup, level: number = 0) {
    result.push({
      id: node.id,
      label: node.label,
      level,
      count: node.count
    })

    if (node.children) {
      node.children.forEach(child => traverse(child, level + 1))
    }
  }

  if (deviceGroups.length > 0) {
    traverse(deviceGroups[0])
  }

  return result
}

// 根据设备类型分类（用于权限管理）
export function getDevicesByType(): {
  gate: Device[]      // 校门闸机
  office: Device[]    // 办公楼闸机
  dormitory: Device[] // 宿舍区闸机
  other: Device[]     // 其他
} {
  const result = {
    gate: [] as Device[],
    office: [] as Device[],
    dormitory: [] as Device[],
    other: [] as Device[]
  }

  allDevices.forEach(device => {
    if (device.name.includes('校门') || device.name.includes('正门') || device.name.includes('侧门') || device.name.includes('后门')) {
      result.gate.push(device)
    } else if (device.name.includes('办公楼')) {
      result.office.push(device)
    } else if (device.name.includes('宿舍')) {
      result.dormitory.push(device)
    } else {
      result.other.push(device)
    }
  })

  return result
}

// 获取设备状态统计
export function getDeviceStats() {
  const stats = {
    total: allDevices.length,
    online: 0,
    offline: 0,
    shutdown: 0,
    unbind: 0
  }

  allDevices.forEach(device => {
    stats[device.status]++
  })

  return stats
}