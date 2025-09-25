import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data

    // 根据后端返回的状态码判断
    if (res.code !== 200) {
      ElMessage({
        message: res.message || '请求失败',
        type: 'error',
        duration: 5 * 1000
      })

      // 401: Token 过期或未登录
      if (res.code === 401) {
        ElMessage({
          message: '登录已过期，请重新登录',
          type: 'error',
          duration: 3 * 1000
        })
        localStorage.removeItem('token')
        router.push('/login')
      }

      return Promise.reject(new Error(res.message || '请求失败'))
    } else {
      return res
    }
  },
  (error) => {
    console.error('响应错误:', error)

    // 处理网络错误
    if (error.message.includes('timeout')) {
      ElMessage({
        message: '请求超时，请稍后重试',
        type: 'error',
        duration: 5 * 1000
      })
    } else if (error.message.includes('Network Error')) {
      ElMessage({
        message: '网络错误，请检查网络连接',
        type: 'error',
        duration: 5 * 1000
      })
    } else {
      ElMessage({
        message: error.message || '请求失败',
        type: 'error',
        duration: 5 * 1000
      })
    }

    return Promise.reject(error)
  }
)

// 模拟响应（开发阶段）
const mockResponse = (config: AxiosRequestConfig) => {
  const { url, method, data, params } = config

  // 模拟数据
  const mockData: any = {
    '/api/class/list': {
      code: 200,
      data: {
        list: [
          {
            id: '1',
            className: '高一（1）班',
            gradeId: '1',
            gradeName: '高一年级',
            location: '教学楼3楼301室',
            sort: 1,
            status: 'normal',
            studentCount: 45,
            teacherId: '1',
            teacherName: '张老师',
            teacherCode: 'T001',
            remark: '',
            createTime: '2024-01-15 10:00:00',
            updateTime: '2024-01-15 10:00:00'
          },
          {
            id: '2',
            className: '高一（2）班',
            gradeId: '1',
            gradeName: '高一年级',
            location: '教学楼3楼302室',
            sort: 2,
            status: 'normal',
            studentCount: 43,
            teacherId: '2',
            teacherName: '李老师',
            teacherCode: 'T002',
            remark: '',
            createTime: '2024-01-15 10:00:00',
            updateTime: '2024-01-15 10:00:00'
          }
        ],
        total: 2
      },
      message: '获取成功'
    },
    '/api/grade/list': {
      code: 200,
      data: [
        { id: '1', gradeName: '高一年级' },
        { id: '2', gradeName: '高二年级' },
        { id: '3', gradeName: '高三年级' },
        { id: '4', gradeName: '初一年级' },
        { id: '5', gradeName: '初二年级' },
        { id: '6', gradeName: '初三年级' }
      ],
      message: '获取成功'
    },
    '/api/teacher/available': {
      code: 200,
      data: [
        { id: '1', name: '张老师', code: 'T001', classCount: 1 },
        { id: '2', name: '李老师', code: 'T002', classCount: 1 },
        { id: '3', name: '王老师', code: 'T003', classCount: 0 },
        { id: '4', name: '赵老师', code: 'T004', classCount: 0 },
        { id: '5', name: '刘老师', code: 'T005', classCount: 2 }
      ],
      message: '获取成功'
    },
    '/api/class/detail': {
      code: 200,
      data: {
        id: '1',
        className: '高一（1）班',
        gradeId: '1',
        gradeName: '高一年级',
        location: '教学楼3楼301室',
        sort: 1,
        status: 'normal',
        studentCount: 45,
        teacherId: '1',
        teacherName: '张老师',
        teacherCode: 'T001',
        remark: '重点班',
        createTime: '2024-01-15 10:00:00',
        updateTime: '2024-01-15 10:00:00'
      },
      message: '获取成功'
    },
    '/api/class/students': {
      code: 200,
      data: [
        {
          id: '1',
          studentCode: 'S001',
          studentName: '张三',
          gender: '男',
          age: 16,
          contactPhone: '13800138001',
          guardianName: '张父',
          guardianPhone: '13800138002',
          enrollmentDate: '2023-09-01',
          status: 'active'
        },
        {
          id: '2',
          studentCode: 'S002',
          studentName: '李四',
          gender: '女',
          age: 15,
          contactPhone: '13800138003',
          guardianName: '李母',
          guardianPhone: '13800138004',
          enrollmentDate: '2023-09-01',
          status: 'active'
        }
      ],
      message: '获取成功'
    },
    '/api/grade/list': {
      code: 200,
      data: {
        list: [
          {
            id: '1',
            gradeName: '高一年级',
            gradeLevel: 1,
            stage: 'senior',
            stageText: '高中',
            classCount: 8,
            studentCount: 360,
            gradeDirectorId: '1',
            gradeDirectorName: '王主任',
            sort: 1,
            status: 'active',
            remark: '高一年级',
            createTime: '2024-01-15 10:00:00',
            updateTime: '2024-01-15 10:00:00'
          },
          {
            id: '2',
            gradeName: '高二年级',
            gradeLevel: 2,
            stage: 'senior',
            stageText: '高中',
            classCount: 7,
            studentCount: 315,
            gradeDirectorId: '2',
            gradeDirectorName: '李主任',
            sort: 2,
            status: 'active',
            remark: '高二年级',
            createTime: '2024-01-15 10:00:00',
            updateTime: '2024-01-15 10:00:00'
          },
          {
            id: '3',
            gradeName: '高三年级',
            gradeLevel: 3,
            stage: 'senior',
            stageText: '高中',
            classCount: 6,
            studentCount: 270,
            sort: 3,
            status: 'active',
            remark: '高三年级',
            createTime: '2024-01-15 10:00:00',
            updateTime: '2024-01-15 10:00:00'
          }
        ],
        total: 3
      },
      message: '获取成功'
    },
    '/api/grade/statistics': {
      code: 200,
      data: {
        totalCount: 3,
        activeCount: 3,
        inactiveCount: 0,
        stageDistribution: [
          {
            stage: 'senior',
            stageName: '高中',
            count: 3,
            classCount: 21,
            studentCount: 945
          }
        ]
      },
      message: '获取成功'
    },
    '/api/teacher/available-directors': {
      code: 200,
      data: [
        {
          teacherId: '1',
          teacherName: '王主任',
          teacherCode: 'T001',
          currentGrade: '高一年级',
          status: 'active'
        },
        {
          teacherId: '2',
          teacherName: '李主任',
          teacherCode: 'T002',
          currentGrade: '高二年级',
          status: 'active'
        },
        {
          teacherId: '3',
          teacherName: '赵老师',
          teacherCode: 'T003',
          status: 'active'
        },
        {
          teacherId: '4',
          teacherName: '刘老师',
          teacherCode: 'T004',
          status: 'active'
        }
      ],
      message: '获取成功'
    },
    '/api/teacher/list': {
      code: 200,
      data: {
        list: [
          {
            teacherId: 'T2024001',
            teacherName: '张三',
            gender: 'male',
            department: '语文教研组',
            position: 'class_teacher',
            relatedClass: '高一（1）班',
            mobile: '13800138001',
            email: 'zhangsan@ftschool.com',
            joinDate: '2020-09-01',
            status: 'active',
            createTime: '2020-09-01 10:00:00'
          },
          {
            teacherId: 'T2024002',
            teacherName: '李四',
            gender: 'female',
            department: '数学教研组',
            position: 'grade_director',
            relatedGrade: '高一年级',
            mobile: '13800138002',
            email: 'lisi@ftschool.com',
            joinDate: '2019-09-01',
            status: 'active',
            createTime: '2019-09-01 10:00:00'
          },
          {
            teacherId: 'T2023003',
            teacherName: '王五',
            gender: 'male',
            department: '英语教研组',
            position: 'teacher',
            mobile: '13800138003',
            email: 'wangwu@ftschool.com',
            joinDate: '2021-09-01',
            status: 'active',
            createTime: '2021-09-01 10:00:00'
          },
          {
            teacherId: 'T2022004',
            teacherName: '赵六',
            gender: 'female',
            department: '物理教研组',
            position: 'academic_director',
            mobile: '13800138004',
            email: 'zhaoliu@ftschool.com',
            joinDate: '2018-09-01',
            status: 'active',
            createTime: '2018-09-01 10:00:00'
          },
          {
            teacherId: 'T2020005',
            teacherName: '陈七',
            gender: 'male',
            department: '化学教研组',
            position: 'teacher',
            mobile: '13800138005',
            joinDate: '2015-09-01',
            status: 'resigned',
            resignDate: '2023-07-01',
            createTime: '2015-09-01 10:00:00'
          }
        ],
        total: 5
      },
      message: '获取成功'
    },
    '/api/department/list': {
      code: 200,
      data: [
        { departmentId: '1', departmentName: '语文教研组' },
        { departmentId: '2', departmentName: '数学教研组' },
        { departmentId: '3', departmentName: '英语教研组' },
        { departmentId: '4', departmentName: '物理教研组' },
        { departmentId: '5', departmentName: '化学教研组' },
        { departmentId: '6', departmentName: '生物教研组' },
        { departmentId: '7', departmentName: '历史教研组' },
        { departmentId: '8', departmentName: '地理教研组' },
        { departmentId: '9', departmentName: '政治教研组' },
        { departmentId: '10', departmentName: '体育教研组' },
        { departmentId: '11', departmentName: '艺术教研组' },
        { departmentId: '12', departmentName: '信息技术教研组' }
      ],
      message: '获取成功'
    },
    '/api/teacher/available-classes': {
      code: 200,
      data: [
        { classId: '3', className: '高一（3）班' },
        { classId: '4', className: '高一（4）班' },
        { classId: '5', className: '高二（1）班' },
        { classId: '6', className: '高二（2）班' }
      ],
      message: '获取成功'
    },
    '/api/student/list': {
      code: 200,
      data: {
        list: [
          {
            studentId: '2024010101',
            studentName: '小明',
            gender: 'male',
            gradeId: '1',
            gradeName: '高一年级',
            classId: '1',
            className: '高一（1）班',
            enrollDate: '2024-09-01',
            status: 'enrolled',
            guardianName: '小明爸爸',
            guardianPhone: '13900139001',
            createTime: '2024-09-01 10:00:00'
          },
          {
            studentId: '2024010102',
            studentName: '小红',
            gender: 'female',
            gradeId: '1',
            gradeName: '高一年级',
            classId: '1',
            className: '高一（1）班',
            enrollDate: '2024-09-01',
            status: 'enrolled',
            guardianName: '小红妈妈',
            guardianPhone: '13900139002',
            createTime: '2024-09-01 10:00:00'
          },
          {
            studentId: '2024010201',
            studentName: '小刚',
            gender: 'male',
            gradeId: '1',
            gradeName: '高一年级',
            classId: '2',
            className: '高一（2）班',
            enrollDate: '2024-09-01',
            status: 'enrolled',
            guardianName: '小刚爸爸',
            guardianPhone: '13900139003',
            createTime: '2024-09-01 10:00:00'
          },
          {
            studentId: '2023010101',
            studentName: '小李',
            gender: 'male',
            gradeId: '2',
            gradeName: '高二年级',
            classId: '5',
            className: '高二（1）班',
            enrollDate: '2023-09-01',
            status: 'enrolled',
            guardianName: '小李妈妈',
            guardianPhone: '13900139004',
            createTime: '2023-09-01 10:00:00'
          },
          {
            studentId: '2022010101',
            studentName: '小王',
            gender: 'female',
            gradeId: '3',
            gradeName: '高三年级',
            classId: '8',
            className: '高三（1）班',
            enrollDate: '2022-09-01',
            status: 'graduated',
            graduateDate: '2024-07-15',
            guardianName: '小王爸爸',
            guardianPhone: '13900139005',
            createTime: '2022-09-01 10:00:00'
          }
        ],
        total: 5
      },
      message: '获取成功'
    },
    '/api/student/grade-class-cascade': {
      code: 200,
      data: [
        {
          gradeId: '1',
          gradeName: '高一年级',
          classList: [
            { classId: '1', className: '高一（1）班' },
            { classId: '2', className: '高一（2）班' },
            { classId: '3', className: '高一（3）班' },
            { classId: '4', className: '高一（4）班' }
          ]
        },
        {
          gradeId: '2',
          gradeName: '高二年级',
          classList: [
            { classId: '5', className: '高二（1）班' },
            { classId: '6', className: '高二（2）班' },
            { classId: '7', className: '高二（3）班' }
          ]
        },
        {
          gradeId: '3',
          gradeName: '高三年级',
          classList: [
            { classId: '8', className: '高三（1）班' },
            { classId: '9', className: '高三（2）班' }
          ]
        }
      ],
      message: '获取成功'
    },
    '/api/personnel/statistics': {
      code: 200,
      data: {
        totalTeachers: 120,
        activeTeachers: 115,
        resignedTeachers: 3,
        retiredTeachers: 2,
        totalStudents: 1500,
        enrolledStudents: 1450,
        graduatedStudents: 40,
        suspendedStudents: 10
      },
      message: '获取成功'
    },
    '/api/student/detail': {
      code: 200,
      data: {
        studentId: '2024010101',
        studentName: '张三',
        gender: 'male',
        gradeId: '1',
        gradeName: '高一年级',
        classId: '1',
        className: '高一（1）班',
        enrollDate: '2024-09-01',
        status: 'enrolled',
        suspendReason: '',
        guardianName: '张父',
        guardianPhone: '13800138000',
        secondaryPhone: '13900139000',
        remark: '品学兼优，表现良好',
        createTime: '2024-09-01T08:00:00',
        updateTime: '2024-09-01T08:00:00'
      },
      message: '获取成功'
    }
  }

  // 监护人列表
  if (config.url === '/api/guardian/list') {
    const params = config.params || {}
    const pageNum = params.pageNum || 1
    const pageSize = params.pageSize || 10

    // 完整的监护人数据
    const allGuardians = [
      {
        guardianId: 'GD001',
        guardianName: '张伟',
        relation: 'father',
        idCardNumber: '440304198501156789',
        phone: '13800138001',
        alternatePhone: '0755-88889999',
        email: 'zhangwei@email.com',
        occupation: '软件工程师',
        workplace: '深圳科技有限公司',
        workAddress: '深圳市南山区科技园',
        homeAddress: '深圳市福田区梅林街道xx小区',
        isEmergencyContact: true,
        isLegalGuardian: true,
        students: [
          {
            studentId: '2024010101',
            studentName: '张小明',
            gradeName: '一年级',
            className: '一班'
          }
        ],
        createTime: '2024-01-15 10:00:00',
        updateTime: '2024-01-15 10:00:00'
      },
      {
        guardianId: 'GD002',
        guardianName: '李娜',
        relation: 'mother',
        idCardNumber: '440304198601234567',
        phone: '13800138002',
        email: 'lina@email.com',
        occupation: '教师',
        workplace: '深圳市第一中学',
        homeAddress: '深圳市福田区梅林街道xx小区',
        isEmergencyContact: false,
        isLegalGuardian: true,
        students: [
          {
            studentId: '2024010101',
            studentName: '张小明',
            gradeName: '一年级',
            className: '一班'
          }
        ],
        createTime: '2024-01-15 10:00:00',
        updateTime: '2024-01-15 10:00:00'
      },
      {
        guardianId: 'GD003',
        guardianName: '王大爷',
        relation: 'grandfather',
        idCardNumber: '440304195501234567',
        phone: '13800138003',
        occupation: '退休',
        homeAddress: '深圳市福田区华强北街道',
        isEmergencyContact: true,
        isLegalGuardian: false,
        students: [
          {
            studentId: '2024010201',
            studentName: '王小花',
            gradeName: '一年级',
            className: '二班'
          }
        ],
        createTime: '2024-01-16 10:00:00',
        updateTime: '2024-01-16 10:00:00'
      },
      {
        guardianId: 'GD004',
        guardianName: '陈建国',
        relation: 'father',
        idCardNumber: '440304197801234567',
        phone: '13900139001',
        alternatePhone: '0755-88881111',
        email: 'chenjg@email.com',
        occupation: '公务员',
        workplace: '深圳市政府',
        homeAddress: '深圳市罗湖区东门街道',
        isEmergencyContact: true,
        isLegalGuardian: true,
        students: [
          {
            studentId: '2024010301',
            studentName: '陈小龙',
            gradeName: '二年级',
            className: '一班'
          }
        ],
        createTime: '2024-01-17 10:00:00',
        updateTime: '2024-01-17 10:00:00'
      },
      {
        guardianId: 'GD005',
        guardianName: '刘美华',
        relation: 'mother',
        idCardNumber: '440304198201234567',
        phone: '13900139002',
        email: 'liumh@email.com',
        occupation: '医生',
        workplace: '深圳市人民医院',
        homeAddress: '深圳市罗湖区东门街道',
        isEmergencyContact: false,
        isLegalGuardian: true,
        students: [
          {
            studentId: '2024010301',
            studentName: '陈小龙',
            gradeName: '二年级',
            className: '一班'
          }
        ],
        createTime: '2024-01-17 10:00:00',
        updateTime: '2024-01-17 10:00:00'
      },
      {
        guardianId: 'GD006',
        guardianName: '赵大海',
        relation: 'father',
        idCardNumber: '440304197501234567',
        phone: '13700137001',
        occupation: '个体经营',
        workplace: '自营店铺',
        homeAddress: '深圳市宝安区西乡街道',
        isEmergencyContact: true,
        isLegalGuardian: true,
        students: [
          {
            studentId: '2024020101',
            studentName: '赵小宇',
            gradeName: '二年级',
            className: '二班'
          },
          {
            studentId: '2024030101',
            studentName: '赵小雨',
            gradeName: '三年级',
            className: '一班'
          }
        ],
        createTime: '2024-01-18 10:00:00',
        updateTime: '2024-01-18 10:00:00'
      },
      {
        guardianId: 'GD007',
        guardianName: '孙丽娟',
        relation: 'mother',
        idCardNumber: '440304197701234567',
        phone: '13700137002',
        occupation: '会计',
        workplace: '深圳会计事务所',
        homeAddress: '深圳市宝安区西乡街道',
        isEmergencyContact: false,
        isLegalGuardian: true,
        students: [
          {
            studentId: '2024020101',
            studentName: '赵小宇',
            gradeName: '二年级',
            className: '二班'
          },
          {
            studentId: '2024030101',
            studentName: '赵小雨',
            gradeName: '三年级',
            className: '一班'
          }
        ],
        createTime: '2024-01-18 10:00:00',
        updateTime: '2024-01-18 10:00:00'
      },
      {
        guardianId: 'GD008',
        guardianName: '周奶奶',
        relation: 'grandmother',
        idCardNumber: '440304194501234567',
        phone: '13600136001',
        occupation: '退休',
        homeAddress: '深圳市南山区蛇口街道',
        isEmergencyContact: true,
        isLegalGuardian: false,
        students: [
          {
            studentId: '2024030201',
            studentName: '周小帆',
            gradeName: '三年级',
            className: '二班'
          }
        ],
        createTime: '2024-01-19 10:00:00',
        updateTime: '2024-01-19 10:00:00'
      },
      {
        guardianId: 'GD009',
        guardianName: '吴志强',
        relation: 'father',
        idCardNumber: '440304198301234567',
        phone: '13500135001',
        email: 'wuzq@email.com',
        occupation: '律师',
        workplace: '深圳律师事务所',
        homeAddress: '深圳市龙岗区布吉街道',
        isEmergencyContact: true,
        isLegalGuardian: true,
        students: [
          {
            studentId: '2024040101',
            studentName: '吴小萌',
            gradeName: '四年级',
            className: '一班'
          }
        ],
        createTime: '2024-01-20 10:00:00',
        updateTime: '2024-01-20 10:00:00'
      },
      {
        guardianId: 'GD010',
        guardianName: '郑秀英',
        relation: 'mother',
        idCardNumber: '440304198401234567',
        phone: '13500135002',
        occupation: '设计师',
        workplace: '深圳设计公司',
        homeAddress: '深圳市龙岗区布吉街道',
        isEmergencyContact: false,
        isLegalGuardian: true,
        students: [
          {
            studentId: '2024040101',
            studentName: '吴小萌',
            gradeName: '四年级',
            className: '一班'
          }
        ],
        createTime: '2024-01-20 10:00:00',
        updateTime: '2024-01-20 10:00:00'
      },
      {
        guardianId: 'GD011',
        guardianName: '冯大叔',
        relation: 'uncle',
        idCardNumber: '440304197001234567',
        phone: '13400134001',
        occupation: '司机',
        homeAddress: '深圳市龙华区民治街道',
        isEmergencyContact: true,
        isLegalGuardian: false,
        students: [
          {
            studentId: '2024040201',
            studentName: '冯小军',
            gradeName: '四年级',
            className: '二班'
          }
        ],
        createTime: '2024-01-21 10:00:00',
        updateTime: '2024-01-21 10:00:00'
      },
      {
        guardianId: 'GD012',
        guardianName: '蒋国华',
        relation: 'father',
        idCardNumber: '440304197901234567',
        phone: '13300133001',
        occupation: '工程师',
        workplace: '华为技术有限公司',
        homeAddress: '深圳市坂田华为基地附近',
        isEmergencyContact: true,
        isLegalGuardian: true,
        students: [
          {
            studentId: '2024050101',
            studentName: '蒋小涵',
            gradeName: '五年级',
            className: '一班'
          }
        ],
        createTime: '2024-01-22 10:00:00',
        updateTime: '2024-01-22 10:00:00'
      },
      {
        guardianId: 'GD013',
        guardianName: '沈丽萍',
        relation: 'mother',
        idCardNumber: '440304198101234567',
        phone: '13300133002',
        occupation: '产品经理',
        workplace: '腾讯科技有限公司',
        homeAddress: '深圳市南山区科技园',
        isEmergencyContact: false,
        isLegalGuardian: true,
        students: [
          {
            studentId: '2024050101',
            studentName: '蒋小涵',
            gradeName: '五年级',
            className: '一班'
          }
        ],
        createTime: '2024-01-22 10:00:00',
        updateTime: '2024-01-22 10:00:00'
      },
      {
        guardianId: 'GD014',
        guardianName: '韩爷爷',
        relation: 'grandfather',
        idCardNumber: '440304194801234567',
        phone: '13200132001',
        occupation: '退休教授',
        homeAddress: '深圳市福田区园岭街道',
        isEmergencyContact: true,
        isLegalGuardian: false,
        students: [
          {
            studentId: '2024050201',
            studentName: '韩小雪',
            gradeName: '五年级',
            className: '二班'
          }
        ],
        createTime: '2024-01-23 10:00:00',
        updateTime: '2024-01-23 10:00:00'
      },
      {
        guardianId: 'GD015',
        guardianName: '杨建军',
        relation: 'father',
        idCardNumber: '440304197601234567',
        phone: '13100131001',
        occupation: '银行经理',
        workplace: '中国建设银行',
        homeAddress: '深圳市福田区车公庙',
        isEmergencyContact: true,
        isLegalGuardian: true,
        students: [
          {
            studentId: '2024060101',
            studentName: '杨小晨',
            gradeName: '六年级',
            className: '一班'
          }
        ],
        createTime: '2024-01-24 10:00:00',
        updateTime: '2024-01-24 10:00:00'
      }
    ]

    // 根据查询条件过滤
    let filteredData = [...allGuardians]

    if (params.guardianName) {
      filteredData = filteredData.filter(item =>
        item.guardianName.includes(params.guardianName)
      )
    }

    if (params.phone) {
      filteredData = filteredData.filter(item =>
        item.phone.includes(params.phone)
      )
    }

    if (params.relation) {
      filteredData = filteredData.filter(item =>
        item.relation === params.relation
      )
    }

    // 分页处理
    const start = (pageNum - 1) * pageSize
    const end = start + pageSize
    const pageData = filteredData.slice(start, end)

    return Promise.resolve({
      code: 200,
      data: {
        list: pageData,
        total: filteredData.length
      },
      message: '获取成功'
    })
  }

  // 监护人详情
  if (config.url?.startsWith('/api/guardian/detail/')) {
    const guardianId = config.url.split('/').pop()
    return Promise.resolve({
      code: 200,
      data: {
        guardianId: guardianId,
        guardianName: '张伟',
        relation: 'father',
        idCardNumber: '440304198501156789',
        phone: '13800138001',
        alternatePhone: '0755-88889999',
        email: 'zhangwei@email.com',
        occupation: '软件工程师',
        workplace: '深圳科技有限公司',
        workAddress: '深圳市南山区科技园',
        homeAddress: '深圳市福田区梅林街道xx小区',
        isEmergencyContact: true,
        isLegalGuardian: true,
        remark: '工作繁忙，紧急情况请先联系母亲',
        createTime: '2024-01-15 10:00:00',
        updateTime: '2024-01-15 10:00:00'
      },
      message: '获取成功'
    })
  }

  // 获取监护人关联的学生
  if (config.url?.startsWith('/api/guardian/students/')) {
    return Promise.resolve({
      code: 200,
      data: [
        {
          studentId: '2024010101',
          studentName: '张小明',
          gender: 'male',
          gradeId: 'G001',
          gradeName: '一年级',
          classId: 'C001',
          className: '一班',
          enrollDate: '2024-09-01',
          status: 'enrolled',
          guardianPhone: '13800138001'
        }
      ],
      message: '获取成功'
    })
  }

  // 监护人统计数据
  if (config.url === '/api/guardian/statistics') {
    return Promise.resolve({
      code: 200,
      data: {
        totalCount: 150,
        fatherCount: 65,
        motherCount: 70,
        otherCount: 15,
        emergencyContactCount: 120,
        legalGuardianCount: 140
      },
      message: '获取成功'
    })
  }

  // 检查身份证号
  if (config.url === '/api/guardian/check-idcard') {
    return Promise.resolve({
      code: 200,
      data: {
        exists: false
      },
      message: '检查成功'
    })
  }

  // ============ 请假管理模块 Mock 数据 ============

  // 请假类型列表
  if (config.url === '/api/leave/type/list') {
    const params = config.params || {}
    const pageNum = params.pageNum || 1
    const pageSize = params.pageSize || 10

    const leaveTypes = [
      {
        id: '1',
        typeName: '教师病假',
        applicablePersonType: 'teacher',
        description: '教师因病请假',
        maxDuration: 7,
        durationUnit: 'day',
        requiresProof: true,
        proofMaterialType: '医院诊断书',
        status: 'active',
        remark: '',
        createTime: '2024-09-01 10:00:00',
        updateTime: '2024-09-01 10:00:00'
      },
      {
        id: '2',
        typeName: '教师事假',
        applicablePersonType: 'teacher',
        description: '教师因个人事务请假',
        maxDuration: 3,
        durationUnit: 'day',
        requiresProof: false,
        proofMaterialType: '',
        status: 'active',
        remark: '事假每月不超过3天',
        createTime: '2024-09-01 10:00:00',
        updateTime: '2024-09-01 10:00:00'
      },
      {
        id: '3',
        typeName: '教师公假',
        applicablePersonType: 'teacher',
        description: '教师参加校外培训申请的公假',
        maxDuration: 5,
        durationUnit: 'day',
        requiresProof: true,
        proofMaterialType: '培训通知书',
        status: 'active',
        remark: '',
        createTime: '2024-09-01 10:00:00',
        updateTime: '2024-09-01 10:00:00'
      },
      {
        id: '4',
        typeName: '学生病假',
        applicablePersonType: 'student',
        description: '学生因病请假',
        maxDuration: 3,
        durationUnit: 'day',
        requiresProof: true,
        proofMaterialType: '医院诊断书或家长说明',
        status: 'active',
        remark: '',
        createTime: '2024-09-01 10:00:00',
        updateTime: '2024-09-01 10:00:00'
      },
      {
        id: '5',
        typeName: '学生事假',
        applicablePersonType: 'student',
        description: '学生因个人事务请假',
        maxDuration: 1,
        durationUnit: 'day',
        requiresProof: false,
        proofMaterialType: '',
        status: 'active',
        remark: '学生事假每月不超过2次',
        createTime: '2024-09-01 10:00:00',
        updateTime: '2024-09-01 10:00:00'
      },
      {
        id: '6',
        typeName: '教师短时请假',
        applicablePersonType: 'teacher',
        description: '教师短时间请假（2小时内）',
        maxDuration: 2,
        durationUnit: 'hour',
        requiresProof: false,
        proofMaterialType: '',
        status: 'inactive',
        remark: '已停用的类型',
        createTime: '2024-08-01 10:00:00',
        updateTime: '2024-08-15 10:00:00'
      }
    ]

    // 筛选逻辑
    let filteredData = [...leaveTypes]

    if (params.applicablePersonType && params.applicablePersonType !== 'all') {
      filteredData = filteredData.filter(item => item.applicablePersonType === params.applicablePersonType)
    }

    if (params.status && params.status !== 'all') {
      filteredData = filteredData.filter(item => item.status === params.status)
    }

    if (params.typeName) {
      filteredData = filteredData.filter(item =>
        item.typeName.toLowerCase().includes(params.typeName.toLowerCase())
      )
    }

    // 分页逻辑
    const start = (pageNum - 1) * pageSize
    const end = start + pageSize
    const pageData = filteredData.slice(start, end)

    return Promise.resolve({
      code: 200,
      data: {
        list: pageData,
        total: filteredData.length
      },
      message: '获取成功'
    })
  }

  // 请假类型详情
  if (config.url?.includes('/api/leave/type/') && config.method === 'get' && !config.url.includes('/usage')) {
    const id = config.url.split('/').pop()
    const leaveType = {
      id: id,
      typeName: '教师病假',
      applicablePersonType: 'teacher',
      description: '教师因病请假',
      maxDuration: 7,
      durationUnit: 'day',
      requiresProof: true,
      proofMaterialType: '医院诊断书',
      status: 'active',
      remark: '',
      createTime: '2024-09-01 10:00:00',
      updateTime: '2024-09-01 10:00:00'
    }

    return Promise.resolve({
      code: 200,
      data: leaveType,
      message: '获取成功'
    })
  }

  // 检查类型名称
  if (config.url === '/api/leave/type/check-name') {
    return Promise.resolve({
      code: 200,
      data: {
        exists: false
      },
      message: '检查成功'
    })
  }

  // 类型应用详情
  if (config.url?.includes('/usage')) {
    return Promise.resolve({
      code: 200,
      data: {
        applicablePersons: [
          { type: 'teacher', count: 5 },
          { type: 'student', count: 12 }
        ],
        recentUsage: [
          { date: '2024-09-01', count: 3 },
          { date: '2024-09-02', count: 5 }
        ],
        totalApplications: 25
      },
      message: '获取成功'
    })
  }

  // 获取可用的请假类型（申请页面用）
  if (config.url === '/api/leave/application/available-types') {
    return Promise.resolve({
      code: 200,
      data: [
        {
          id: 'LT001',
          typeName: '病假',
          description: '因病需要休息治疗',
          applicablePersonType: 'student',
          maxDuration: 7,
          durationUnit: 'day',
          requiresProof: true,
          status: 'active'
        },
        {
          id: 'LT002',
          typeName: '事假',
          description: '因私人事务需要请假',
          applicablePersonType: 'student',
          maxDuration: 3,
          durationUnit: 'day',
          requiresProof: false,
          status: 'active'
        },
        {
          id: 'LT003',
          typeName: '丧假',
          description: '直系亲属去世需要请假',
          applicablePersonType: 'student',
          maxDuration: 3,
          durationUnit: 'day',
          requiresProof: true,
          status: 'active'
        },
        {
          id: 'LT005',
          typeName: '短时请假',
          description: '短时间离开教室',
          applicablePersonType: 'student',
          maxDuration: 4,
          durationUnit: 'hour',
          requiresProof: false,
          status: 'active'
        }
      ],
      message: '获取成功'
    })
  }

  // 获取审批流程
  if (config.url === '/api/leave/common/approval-flow') {
    const params = config.params || {}
    const duration = parseFloat(params.duration) || 1

    // 根据请假时长返回不同的审批流程
    let levels = []
    if (duration <= 1) {
      levels = [
        {
          level: 1,
          roleName: '班主任',
          description: '班级管理老师审批',
          required: true
        }
      ]
    } else if (duration <= 3) {
      levels = [
        {
          level: 1,
          roleName: '班主任',
          description: '班级管理老师审批',
          required: true
        },
        {
          level: 2,
          roleName: '年级主任',
          description: '年级管理负责人审批',
          required: true
        }
      ]
    } else {
      levels = [
        {
          level: 1,
          roleName: '班主任',
          description: '班级管理老师审批',
          required: true
        },
        {
          level: 2,
          roleName: '年级主任',
          description: '年级管理负责人审批',
          required: true
        },
        {
          level: 3,
          roleName: '教务主任',
          description: '教务处负责人审批',
          required: true
        }
      ]
    }

    return Promise.resolve({
      code: 200,
      data: { levels },
      message: '获取成功'
    })
  }

  // 提交请假申请
  if (config.url === '/api/leave/application' && config.method === 'post') {
    return Promise.resolve({
      code: 200,
      data: {
        applicationId: 'APP' + Date.now()
      },
      message: '申请提交成功'
    })
  }

  // 保存请假申请草稿
  if (config.url === '/api/leave/application/draft' && config.method === 'post') {
    return Promise.resolve({
      code: 200,
      data: {
        applicationId: 'DRAFT' + Date.now()
      },
      message: '草稿保存成功'
    })
  }

  // 获取待审批申请列表
  if (config.url === '/api/leave/approval/pending') {
    const params = config.params || {}
    const pageNum = params.pageNum || 1
    const pageSize = params.pageSize || 10

    const pendingApplications = [
      {
        id: 'APP001',
        applicationId: 'APP2024092201',
        applicantId: 'STU001',
        applicantName: '张三',
        applicantType: 'student',
        leaveTypeId: 'LT001',
        leaveTypeName: '病假',
        reason: '发烧感冒需要休息',
        description: '昨天开始发烧，体温38.5度，医生建议在家休息2天。已到医院检查，诊断为急性上呼吸道感染。',
        startTime: '2024-09-23 08:00:00',
        endTime: '2024-09-24 18:00:00',
        duration: 2,
        durationUnit: 'day',
        applicationTime: '2024-09-22 15:30:00',
        status: 'pending',
        emergencyContactName: '张父',
        emergencyContactPhone: '13800138000',
        proofFiles: [
          {
            fileId: 'FILE001',
            fileName: '医院诊断书.pdf',
            filePath: '/uploads/proof/FILE001.pdf'
          }
        ]
      },
      {
        id: 'APP002',
        applicationId: 'APP2024092202',
        applicantId: 'STU002',
        applicantName: '李四',
        applicantType: 'student',
        leaveTypeId: 'LT002',
        leaveTypeName: '事假',
        reason: '家中有急事需要处理',
        description: '家里老人突然生病需要陪同去医院，预计需要请假1天时间处理。',
        startTime: '2024-09-23 13:00:00',
        endTime: '2024-09-23 18:00:00',
        duration: 5,
        durationUnit: 'hour',
        applicationTime: '2024-09-22 14:20:00',
        status: 'pending',
        emergencyContactName: '李母',
        emergencyContactPhone: '13900139000'
      },
      {
        id: 'APP003',
        applicationId: 'APP2024092203',
        applicantId: 'TCH001',
        applicantName: '王老师',
        applicantType: 'teacher',
        leaveTypeId: 'LT003',
        leaveTypeName: '丧假',
        reason: '祖父去世需要回家办理后事',
        description: '祖父昨日去世，需要回老家处理丧事，预计需要3天时间。',
        startTime: '2024-09-24 08:00:00',
        endTime: '2024-09-26 18:00:00',
        duration: 3,
        durationUnit: 'day',
        applicationTime: '2024-09-22 16:45:00',
        status: 'pending',
        emergencyContactName: '王配偶',
        emergencyContactPhone: '13700137000',
        proofFiles: [
          {
            fileId: 'FILE002',
            fileName: '死亡证明.jpg',
            filePath: '/uploads/proof/FILE002.jpg'
          }
        ]
      },
      {
        id: 'APP004',
        applicationId: 'APP2024092204',
        applicantId: 'STU003',
        applicantName: '赵五',
        applicantType: 'student',
        leaveTypeId: 'LT005',
        leaveTypeName: '短时请假',
        reason: '需要去银行办理业务',
        description: '需要去银行办理助学贷款相关手续，大概需要2小时。',
        startTime: '2024-09-23 14:00:00',
        endTime: '2024-09-23 16:00:00',
        duration: 2,
        durationUnit: 'hour',
        applicationTime: '2024-09-22 17:10:00',
        status: 'pending'
      }
    ]

    // 应用筛选
    let filteredData = [...pendingApplications]

    if (params.applicantType) {
      filteredData = filteredData.filter(app => app.applicantType === params.applicantType)
    }

    if (params.leaveTypeId) {
      filteredData = filteredData.filter(app => app.leaveTypeId === params.leaveTypeId)
    }

    const total = filteredData.length
    const start = (pageNum - 1) * pageSize
    const end = start + pageSize
    const list = filteredData.slice(start, end)

    return Promise.resolve({
      code: 200,
      data: {
        list,
        total,
        pageNum,
        pageSize
      },
      message: '获取成功'
    })
  }

  // 获取已审批申请列表
  if (config.url === '/api/leave/approval/processed') {
    const params = config.params || {}
    const pageNum = params.pageNum || 1
    const pageSize = params.pageSize || 10

    const processedApplications = [
      {
        id: 'APP101',
        applicationId: 'APP2024092101',
        applicantId: 'STU101',
        applicantName: '陈六',
        applicantType: 'student',
        leaveTypeId: 'LT001',
        leaveTypeName: '病假',
        reason: '肠胃炎需要住院治疗',
        description: '急性肠胃炎，医生建议住院观察治疗3天。',
        startTime: '2024-09-21 08:00:00',
        endTime: '2024-09-23 18:00:00',
        duration: 3,
        durationUnit: 'day',
        applicationTime: '2024-09-20 19:30:00',
        status: 'approved',
        approvalTime: '2024-09-21 09:15:00',
        emergencyContactName: '陈父',
        emergencyContactPhone: '13600136000'
      },
      {
        id: 'APP102',
        applicationId: 'APP2024092102',
        applicantId: 'STU102',
        applicantName: '孙七',
        applicantType: 'student',
        leaveTypeId: 'LT002',
        leaveTypeName: '事假',
        reason: '参加驾考',
        description: '科目三考试，已预约好时间。',
        startTime: '2024-09-21 13:00:00',
        endTime: '2024-09-21 17:00:00',
        duration: 4,
        durationUnit: 'hour',
        applicationTime: '2024-09-20 20:10:00',
        status: 'rejected',
        approvalTime: '2024-09-21 08:45:00',
        emergencyContactName: '孙母',
        emergencyContactPhone: '13500135000'
      }
    ]

    // 应用筛选
    let filteredData = [...processedApplications]

    if (params.applicantType) {
      filteredData = filteredData.filter(app => app.applicantType === params.applicantType)
    }

    if (params.leaveTypeId) {
      filteredData = filteredData.filter(app => app.leaveTypeId === params.leaveTypeId)
    }

    const total = filteredData.length
    const start = (pageNum - 1) * pageSize
    const end = start + pageSize
    const list = filteredData.slice(start, end)

    return Promise.resolve({
      code: 200,
      data: {
        list,
        total,
        pageNum,
        pageSize
      },
      message: '获取成功'
    })
  }

  // 提交审批决策
  if (config.url?.includes('/api/leave/approval/') && config.method === 'post' && !config.url.includes('batch')) {
    return Promise.resolve({
      code: 200,
      data: {},
      message: '审批提交成功'
    })
  }

  // 批量审批
  if (config.url === '/api/leave/approval/batch') {
    return Promise.resolve({
      code: 200,
      data: {},
      message: '批量审批成功'
    })
  }

  // 获取审批历史
  if (config.url?.includes('/api/leave/approval/') && config.url.includes('/history')) {
    return Promise.resolve({
      code: 200,
      data: [
        {
          id: 'AR001',
          applicationId: 'APP2024092101',
          level: 1,
          approverId: 'TCH101',
          approverName: '班主任-李老师',
          result: 'approved',
          comment: '情况属实，同意请假。注意身体，早日康复。',
          approvalTime: '2024-09-21 09:15:00'
        },
        {
          id: 'AR002',
          applicationId: 'APP2024092101',
          level: 2,
          approverId: 'TCH102',
          approverName: '年级主任-张老师',
          result: 'approved',
          comment: '已与班主任沟通，同意该学生请假。',
          approvalTime: '2024-09-21 09:30:00'
        }
      ],
      message: '获取成功'
    })
  }

  // 预览文件
  if (config.url?.includes('/api/leave/common/file/') && config.url.includes('/preview')) {
    return Promise.resolve({
      code: 200,
      data: {
        previewUrl: 'https://example.com/preview/file.pdf'
      },
      message: '获取预览链接成功'
    })
  }

  // 获取请假记录列表
  if (config.url === '/api/leave/record/list') {
    const params = config.params || {}
    const pageNum = params.pageNum || 1
    const pageSize = params.pageSize || 10

    const allRecords = [
      {
        id: 'APP001',
        applicationId: 'APP2024092201',
        applicantId: 'STU001',
        applicantName: '张三',
        applicantType: 'student',
        leaveTypeId: 'LT001',
        leaveTypeName: '病假',
        reason: '发烧感冒需要休息',
        description: '昨天开始发烧，体温38.5度，医生建议在家休息2天。',
        startTime: '2024-09-23 08:00:00',
        endTime: '2024-09-24 18:00:00',
        duration: 2,
        durationUnit: 'day',
        applicationTime: '2024-09-22 15:30:00',
        status: 'pending',
        approvalTime: null
      },
      {
        id: 'APP002',
        applicationId: 'APP2024092202',
        applicantId: 'STU002',
        applicantName: '李四',
        applicantType: 'student',
        leaveTypeId: 'LT002',
        leaveTypeName: '事假',
        reason: '家中有急事需要处理',
        description: '家里老人突然生病需要陪同去医院。',
        startTime: '2024-09-23 13:00:00',
        endTime: '2024-09-23 18:00:00',
        duration: 5,
        durationUnit: 'hour',
        applicationTime: '2024-09-22 14:20:00',
        status: 'approved',
        approvalTime: '2024-09-22 16:45:00'
      },
      {
        id: 'APP003',
        applicationId: 'APP2024092203',
        applicantId: 'TCH001',
        applicantName: '王老师',
        applicantType: 'teacher',
        leaveTypeId: 'LT003',
        leaveTypeName: '丧假',
        reason: '祖父去世需要回家办理后事',
        description: '祖父昨日去世，需要回老家处理丧事。',
        startTime: '2024-09-24 08:00:00',
        endTime: '2024-09-26 18:00:00',
        duration: 3,
        durationUnit: 'day',
        applicationTime: '2024-09-22 16:45:00',
        status: 'approved',
        approvalTime: '2024-09-22 18:20:00'
      },
      {
        id: 'APP004',
        applicationId: 'APP2024092204',
        applicantId: 'STU003',
        applicantName: '赵五',
        applicantType: 'student',
        leaveTypeId: 'LT005',
        leaveTypeName: '短时请假',
        reason: '需要去银行办理业务',
        description: '需要去银行办理助学贷款相关手续。',
        startTime: '2024-09-23 14:00:00',
        endTime: '2024-09-23 16:00:00',
        duration: 2,
        durationUnit: 'hour',
        applicationTime: '2024-09-22 17:10:00',
        status: 'rejected',
        approvalTime: '2024-09-22 19:30:00'
      },
      {
        id: 'APP005',
        applicationId: 'APP2024092205',
        applicantId: 'STU004',
        applicantName: '钱六',
        applicantType: 'student',
        leaveTypeId: 'LT001',
        leaveTypeName: '病假',
        reason: '牙痛需要看医生',
        description: '智齿发炎疼痛，需要去口腔科治疗。',
        startTime: '2024-09-21 13:00:00',
        endTime: '2024-09-21 18:00:00',
        duration: 5,
        durationUnit: 'hour',
        applicationTime: '2024-09-21 10:15:00',
        status: 'withdrawn',
        approvalTime: null
      },
      {
        id: 'APP006',
        applicationId: 'APP2024092206',
        applicantId: 'TCH002',
        applicantName: '孙老师',
        applicantType: 'teacher',
        leaveTypeId: 'LT002',
        leaveTypeName: '事假',
        reason: '参加学术会议',
        description: '受邀参加教育部门组织的学术交流会议。',
        startTime: '2024-09-25 08:00:00',
        endTime: '2024-09-26 18:00:00',
        duration: 2,
        durationUnit: 'day',
        applicationTime: '2024-09-20 14:30:00',
        status: 'approved',
        approvalTime: '2024-09-20 16:15:00'
      }
    ]

    // 应用筛选条件
    let filteredData = [...allRecords]

    if (params.applicantType) {
      filteredData = filteredData.filter(record => record.applicantType === params.applicantType)
    }

    if (params.leaveTypeId) {
      filteredData = filteredData.filter(record => record.leaveTypeId === params.leaveTypeId)
    }

    if (params.status) {
      filteredData = filteredData.filter(record => record.status === params.status)
    }

    if (params.applicantName) {
      filteredData = filteredData.filter(record =>
        record.applicantName.includes(params.applicantName)
      )
    }

    const total = filteredData.length
    const start = (pageNum - 1) * pageSize
    const end = start + pageSize
    const list = filteredData.slice(start, end)

    return Promise.resolve({
      code: 200,
      data: {
        list,
        total,
        pageNum,
        pageSize
      },
      message: '获取成功'
    })
  }

  // 获取请假统计信息
  if (config.url === '/api/leave/record/statistics') {
    return Promise.resolve({
      code: 200,
      data: {
        totalApplications: 6,
        approvedApplications: 3,
        rejectedApplications: 1,
        pendingApplications: 1
      },
      message: '获取成功'
    })
  }

  // 撤回请假申请
  if (config.url?.includes('/api/leave/application/') && config.url.includes('/withdraw')) {
    return Promise.resolve({
      code: 200,
      data: {},
      message: '撤回成功'
    })
  }

  // 批量撤回请假申请
  if (config.url === '/api/leave/application/batch-withdraw') {
    return Promise.resolve({
      code: 200,
      data: {},
      message: '批量撤回成功'
    })
  }

  // 导出申请详情
  if (config.url?.includes('/api/leave/record/') && config.url.includes('/export')) {
    return Promise.resolve({
      code: 200,
      data: {},
      message: '导出成功'
    })
  }

  // 导出请假记录
  if (config.url === '/api/leave/record/export') {
    return Promise.resolve({
      code: 200,
      data: {},
      message: '导出成功'
    })
  }

  // ============ 考勤管理模块 Mock 数据 ============

  // 获取考勤规则列表
  if (config.url === '/api/attendance/rules') {
    const params = config.params || {}
    const pageNum = params.pageNum || 1
    const pageSize = params.pageSize || 10

    const allRules = [
      {
        id: 'AR001',
        ruleName: '教师工作日上午打卡规则',
        applicableType: 'teacher',
        relatedGrades: null,
        checkType: 'work_checkin',
        timeSlots: [
          {
            id: 'TS001',
            name: '上午',
            startTime: '07:30',
            endTime: '08:30'
          }
        ],
        allowedDeviation: {
          lateMinutes: 15,
          earlyMinutes: 5
        },
        status: 'active',
        effectiveDate: '2024-09-01',
        expiryDate: null,
        remark: '教师上午打卡时间',
        createdAt: '2024-09-01 10:00:00',
        updatedAt: '2024-09-01 10:00:00',
        createdBy: 'admin'
      },
      {
        id: 'AR002',
        ruleName: '教师工作日下午打卡规则',
        applicableType: 'teacher',
        relatedGrades: null,
        checkType: 'work_checkout',
        timeSlots: [
          {
            id: 'TS002',
            name: '下午',
            startTime: '17:00',
            endTime: '18:00'
          }
        ],
        allowedDeviation: {
          lateMinutes: 10,
          earlyMinutes: 10
        },
        status: 'active',
        effectiveDate: '2024-09-01',
        expiryDate: null,
        remark: '教师下午下班打卡',
        createdAt: '2024-09-01 10:00:00',
        updatedAt: '2024-09-01 10:00:00',
        createdBy: 'admin'
      },
      {
        id: 'AR003',
        ruleName: '学生上学打卡规则',
        applicableType: 'student',
        relatedGrades: ['1', '2', '3'],
        checkType: 'work_checkin',
        timeSlots: [
          {
            id: 'TS003',
            name: '上午',
            startTime: '07:30',
            endTime: '08:00'
          }
        ],
        allowedDeviation: {
          lateMinutes: 10,
          earlyMinutes: 0
        },
        status: 'active',
        effectiveDate: '2024-09-01',
        expiryDate: null,
        remark: '高中学生上学打卡',
        createdAt: '2024-09-01 10:00:00',
        updatedAt: '2024-09-01 10:00:00',
        createdBy: 'admin'
      },
      {
        id: 'AR004',
        ruleName: '学生放学打卡规则',
        applicableType: 'student',
        relatedGrades: ['1', '2', '3'],
        checkType: 'work_checkout',
        timeSlots: [
          {
            id: 'TS004',
            name: '下午',
            startTime: '17:30',
            endTime: '18:00'
          }
        ],
        allowedDeviation: {
          lateMinutes: 0,
          earlyMinutes: 15
        },
        status: 'active',
        effectiveDate: '2024-09-01',
        expiryDate: null,
        remark: '高中学生放学打卡',
        createdAt: '2024-09-01 10:00:00',
        updatedAt: '2024-09-01 10:00:00',
        createdBy: 'admin'
      },
      {
        id: 'AR005',
        ruleName: '教师午休外出打卡规则',
        applicableType: 'teacher',
        relatedGrades: null,
        checkType: 'lunch_break',
        timeSlots: [
          {
            id: 'TS005',
            name: '午休外出',
            startTime: '12:00',
            endTime: '13:30'
          }
        ],
        allowedDeviation: {
          lateMinutes: 5,
          earlyMinutes: 5
        },
        status: 'pending',
        effectiveDate: '2024-10-01',
        expiryDate: null,
        remark: '试运行阶段',
        createdAt: '2024-09-15 10:00:00',
        updatedAt: '2024-09-15 10:00:00',
        createdBy: 'admin'
      },
      {
        id: 'AR006',
        ruleName: '已停用的旧规则',
        applicableType: 'student',
        relatedGrades: ['1'],
        checkType: 'work_checkin',
        timeSlots: [
          {
            id: 'TS006',
            name: '早上',
            startTime: '08:00',
            endTime: '08:30'
          }
        ],
        allowedDeviation: {
          lateMinutes: 5,
          earlyMinutes: 0
        },
        status: 'inactive',
        effectiveDate: '2024-08-01',
        expiryDate: '2024-08-31',
        remark: '已停用的规则',
        createdAt: '2024-08-01 10:00:00',
        updatedAt: '2024-08-31 10:00:00',
        createdBy: 'admin'
      }
    ]

    // 应用筛选条件
    let filteredData = [...allRules]

    if (params.applicableType) {
      filteredData = filteredData.filter(rule => rule.applicableType === params.applicableType)
    }

    if (params.status) {
      filteredData = filteredData.filter(rule => rule.status === params.status)
    }

    if (params.ruleName) {
      filteredData = filteredData.filter(rule =>
        rule.ruleName.toLowerCase().includes(params.ruleName.toLowerCase())
      )
    }

    const total = filteredData.length
    const start = (pageNum - 1) * pageSize
    const end = start + pageSize
    const list = filteredData.slice(start, end)

    return Promise.resolve({
      code: 200,
      data: {
        list,
        total
      },
      message: '获取成功'
    })
  }

  // 获取考勤规则详情
  if (config.url?.startsWith('/api/attendance/rules/') && config.method === 'get' && !config.url.includes('/application')) {
    const id = config.url.split('/').pop()
    const rule = {
      id: id,
      ruleName: '教师工作日上午打卡规则',
      applicableType: 'teacher',
      relatedGrades: null,
      checkType: 'work_checkin',
      timeSlots: [
        {
          id: 'TS001',
          name: '上午',
          startTime: '07:30',
          endTime: '08:30'
        }
      ],
      allowedDeviation: {
        lateMinutes: 15,
        earlyMinutes: 5
      },
      status: 'active',
      effectiveDate: '2024-09-01',
      expiryDate: null,
      remark: '教师上午打卡时间',
      createdAt: '2024-09-01 10:00:00',
      updatedAt: '2024-09-01 10:00:00',
      createdBy: 'admin'
    }

    return Promise.resolve({
      code: 200,
      data: rule,
      message: '获取成功'
    })
  }

  // 获取规则应用详情
  if (config.url?.includes('/application')) {
    return Promise.resolve({
      code: 200,
      data: {
        applicableCount: 120,
        recentMatchCount: 567
      },
      message: '获取成功'
    })
  }

  // 创建考勤规则
  if (config.url === '/api/attendance/rules' && config.method === 'post') {
    return Promise.resolve({
      code: 200,
      data: {
        id: 'AR' + Date.now()
      },
      message: '规则创建成功'
    })
  }

  // 更新考勤规则
  if (config.url?.startsWith('/api/attendance/rules/') && config.method === 'put') {
    return Promise.resolve({
      code: 200,
      data: {},
      message: '规则更新成功'
    })
  }

  // 删除考勤规则
  if (config.url?.startsWith('/api/attendance/rules/') && config.method === 'delete') {
    return Promise.resolve({
      code: 200,
      data: {},
      message: '规则删除成功'
    })
  }

  // 批量更新规则状态
  if (config.url === '/api/attendance/rules/batch-status') {
    return Promise.resolve({
      code: 200,
      data: {},
      message: '批量操作成功'
    })
  }

  // 导出考勤规则
  if (config.url === '/api/attendance/rules/export') {
    return Promise.resolve({
      code: 200,
      data: {},
      message: '导出成功'
    })
  }

  // 获取年级列表（系统接口）
  if (config.url === '/api/system/grades') {
    return Promise.resolve({
      code: 200,
      data: [
        { id: '1', name: '高一年级', gradeLevel: 1, stage: 'senior' },
        { id: '2', name: '高二年级', gradeLevel: 2, stage: 'senior' },
        { id: '3', name: '高三年级', gradeLevel: 3, stage: 'senior' },
        { id: '4', name: '初一年级', gradeLevel: 1, stage: 'junior' },
        { id: '5', name: '初二年级', gradeLevel: 2, stage: 'junior' },
        { id: '6', name: '初三年级', gradeLevel: 3, stage: 'junior' }
      ],
      message: '获取成功'
    })
  }

  // 获取班级列表（系统接口）
  if (config.url === '/api/system/classes') {
    return Promise.resolve({
      code: 200,
      data: [
        { id: '1', name: '高一（1）班', gradeId: '1' },
        { id: '2', name: '高一（2）班', gradeId: '1' },
        { id: '3', name: '高二（1）班', gradeId: '2' },
        { id: '4', name: '高二（2）班', gradeId: '2' },
        { id: '5', name: '高三（1）班', gradeId: '3' },
        { id: '6', name: '高三（2）班', gradeId: '3' }
      ],
      message: '获取成功'
    })
  }

  // 获取部门列表（系统接口）
  if (config.url === '/api/system/departments') {
    return Promise.resolve({
      code: 200,
      data: [
        { id: '1', name: '语文教研组' },
        { id: '2', name: '数学教研组' },
        { id: '3', name: '英语教研组' },
        { id: '4', name: '物理教研组' },
        { id: '5', name: '化学教研组' },
        { id: '6', name: '生物教研组' },
        { id: '7', name: '历史教研组' },
        { id: '8', name: '地理教研组' },
        { id: '9', name: '政治教研组' },
        { id: '10', name: '体育教研组' }
      ],
      message: '获取成功'
    })
  }

  // 搜索用户（系统接口）
  if (config.url === '/api/system/users/search') {
    const params = config.params || {}
    const userType = params.userType
    const keyword = params.keyword || ''

    let users = []
    if (userType === 'teacher') {
      users = [
        { id: 'T001', name: '张老师', code: 'T001', department: '语文教研组' },
        { id: 'T002', name: '李老师', code: 'T002', department: '数学教研组' },
        { id: 'T003', name: '王老师', code: 'T003', department: '英语教研组' }
      ]
    } else if (userType === 'student') {
      users = [
        { id: 'S001', name: '张三', code: 'S001', grade: '高一年级', class: '高一（1）班' },
        { id: 'S002', name: '李四', code: 'S002', grade: '高一年级', class: '高一（2）班' },
        { id: 'S003', name: '王五', code: 'S003', grade: '高二年级', class: '高二（1）班' }
      ]
    }

    // 应用关键词筛选
    if (keyword) {
      users = users.filter(user =>
        user.name.includes(keyword) || user.code.includes(keyword)
      )
    }

    return Promise.resolve({
      code: 200,
      data: users,
      message: '获取成功'
    })
  }

  // 考勤记录相关接口
  if (config.url === '/api/attendance/records') {
    const params = config.params || {}
    const pageNum = params.pageNum || 1
    const pageSize = params.pageSize || 20

    // 生成模拟考勤记录数据
    const generateAttendanceRecords = () => {
      const records = []
      const statuses = ['normal', 'late', 'early_leave', 'absent', 'leave', 'exception']
      const userTypes = ['teacher', 'student']
      const dataSources = ['device', 'manual', 'import']
      const organizations = ['高一（1）班', '高一（2）班', '高二（1）班', '高二（2）班', '高三（1）班', '语文教研组', '数学教研组']

      for (let i = 1; i <= 100; i++) {
        const userType = userTypes[Math.floor(Math.random() * userTypes.length)]
        const isTeacher = userType === 'teacher'
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        const dataSource = dataSources[Math.floor(Math.random() * dataSources.length)]
        const hasException = Math.random() > 0.8

        // 生成打卡时间
        let checkInTime = null
        let checkOutTime = null
        let checkInStatus = 'normal'
        let checkOutStatus = 'normal'
        let workHours = null

        if (status !== 'absent') {
          // 生成上班打卡时间
          const baseCheckIn = new Date()
          baseCheckIn.setHours(8, 30, 0, 0)
          if (status === 'late') {
            baseCheckIn.setMinutes(baseCheckIn.getMinutes() + Math.floor(Math.random() * 60))
            checkInStatus = 'late'
          } else if (status === 'normal') {
            baseCheckIn.setMinutes(baseCheckIn.getMinutes() - Math.floor(Math.random() * 30))
          }
          checkInTime = baseCheckIn.toTimeString().slice(0, 8)

          // 生成下班打卡时间
          const baseCheckOut = new Date()
          if (isTeacher) {
            baseCheckOut.setHours(17, 30, 0, 0)
          } else {
            baseCheckOut.setHours(16, 30, 0, 0)
          }

          if (status === 'early_leave') {
            baseCheckOut.setHours(baseCheckOut.getHours() - 1)
            checkOutStatus = 'early'
          }
          checkOutTime = baseCheckOut.toTimeString().slice(0, 8)

          // 计算工作时长
          const checkInDate = new Date()
          checkInDate.setHours(...checkInTime.split(':').map(Number))
          const checkOutDate = new Date()
          checkOutDate.setHours(...checkOutTime.split(':').map(Number))
          workHours = ((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60)).toFixed(1)
        }

        records.push({
          id: `AR${i.toString().padStart(6, '0')}`,
          userId: `${isTeacher ? 'T' : 'S'}${i.toString().padStart(3, '0')}`,
          userName: `${isTeacher ? '教师' : '学生'}${i}`,
          userCode: `${isTeacher ? 'T' : 'S'}${i.toString().padStart(3, '0')}`,
          userType,
          userAvatar: null,
          organizationName: organizations[Math.floor(Math.random() * organizations.length)],
          attendanceDate: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          ruleId: `RULE${Math.floor(Math.random() * 3) + 1}`,
          ruleName: `${isTeacher ? '教师' : '学生'}考勤规则${Math.floor(Math.random() * 3) + 1}`,
          checkInTime,
          checkOutTime,
          checkInStatus,
          checkOutStatus,
          status,
          workHours: status === 'absent' ? null : workHours,
          dataSource,
          hasException,
          deviceCode: dataSource === 'device' ? `DEV${Math.floor(Math.random() * 10) + 1}` : null,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
          updatedAt: Math.random() > 0.5 ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null,
          remark: hasException ? '考勤异常' : null
        })
      }

      return records
    }

    let records = generateAttendanceRecords()

    // 应用筛选条件
    if (params.userType) {
      records = records.filter(r => r.userType === params.userType)
    }
    if (params.userName) {
      records = records.filter(r => r.userName.includes(params.userName))
    }
    if (params.userCode) {
      records = records.filter(r => r.userCode.includes(params.userCode))
    }
    if (params.status) {
      records = records.filter(r => r.status === params.status)
    }
    if (params.ruleId) {
      records = records.filter(r => r.ruleId === params.ruleId)
    }
    if (params.dataSource) {
      records = records.filter(r => r.dataSource === params.dataSource)
    }
    if (params.hasException !== undefined) {
      records = records.filter(r => r.hasException === params.hasException)
    }
    if (params.deviceCode) {
      records = records.filter(r => r.deviceCode && r.deviceCode.includes(params.deviceCode))
    }
    if (params.startDate && params.endDate) {
      records = records.filter(r => r.attendanceDate >= params.startDate && r.attendanceDate <= params.endDate)
    }

    // 分页
    const total = records.length
    const start = (pageNum - 1) * pageSize
    const end = start + pageSize
    records = records.slice(start, end)

    return Promise.resolve({
      code: 200,
      data: {
        records,
        total,
        pageNum,
        pageSize
      },
      message: '获取成功'
    })
  }

  // 获取单个考勤记录详情
  if (config.url?.startsWith('/api/attendance/records/') && config.method === 'get' && !config.url.includes('/sync') && !config.url.includes('/manual') && !config.url.includes('/export') && !config.url.includes('/mark-exception')) {
    const recordId = config.url.split('/').pop()

    return Promise.resolve({
      code: 200,
      data: {
        id: recordId,
        userId: 'T001',
        userName: '张老师',
        userCode: 'T001',
        userType: 'teacher',
        userAvatar: null,
        organizationName: '语文教研组',
        attendanceDate: '2024-01-22',
        ruleId: 'RULE1',
        ruleName: '教师考勤规则1',
        checkInTime: '08:25:30',
        checkOutTime: '17:35:20',
        checkInStatus: 'normal',
        checkOutStatus: 'normal',
        status: 'normal',
        workHours: '9.2',
        dataSource: 'device',
        hasException: false,
        deviceCode: 'DEV001',
        createdAt: '2024-01-22 08:25:30',
        updatedAt: '2024-01-22 17:35:20',
        remark: null
      },
      message: '获取成功'
    })
  }

  // 手动补录考勤记录
  if (config.url === '/api/attendance/records/manual' && config.method === 'post') {
    return Promise.resolve({
      code: 200,
      data: {
        id: `AR${Date.now()}`,
        message: '补录成功'
      },
      message: '补录成功'
    })
  }

  // 同步设备记录
  if (config.url === '/api/attendance/records/sync' && config.method === 'post') {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          code: 200,
          data: {
            syncCount: Math.floor(Math.random() * 50) + 10,
            newRecords: Math.floor(Math.random() * 20) + 5,
            updatedRecords: Math.floor(Math.random() * 10) + 2
          },
          message: '同步成功'
        })
      }, 2000) // 模拟同步延迟
    })
  }

  // 导出考勤记录
  if (config.url === '/api/attendance/records/export' && config.method === 'post') {
    return Promise.resolve({
      code: 200,
      data: {},
      message: '导出成功'
    })
  }

  // 标记考勤记录为异常
  if (config.url === '/api/attendance/records/mark-exception' && config.method === 'post') {
    return Promise.resolve({
      code: 200,
      data: {
        successCount: config.data?.ids?.length || 0
      },
      message: '标记成功'
    })
  }

  // 更新考勤记录
  if (config.url?.startsWith('/api/attendance/records/') && config.method === 'put') {
    return Promise.resolve({
      code: 200,
      data: {},
      message: '更新成功'
    })
  }

  // 考勤异常相关接口
  if (config.url === '/api/attendance/exceptions') {
    const params = config.params || {}
    const pageNum = params.pageNum || 1
    const pageSize = params.pageSize || 20

    // 生成模拟考勤异常数据
    const generateAttendanceExceptions = () => {
      const exceptions = []
      const exceptionTypes = ['absent_no_report', 'late_serious', 'early_serious', 'device_error', 'data_missing', 'other']
      const severities = ['low', 'medium', 'high', 'urgent']
      const statuses = ['pending', 'processing', 'resolved', 'ignored']
      const userTypes = ['teacher', 'student']
      const organizations = ['高一（1）班', '高一（2）班', '高二（1）班', '高二（2）班', '高三（1）班', '语文教研组', '数学教研组']

      for (let i = 1; i <= 50; i++) {
        const userType = userTypes[Math.floor(Math.random() * userTypes.length)]
        const isTeacher = userType === 'teacher'
        const exceptionType = exceptionTypes[Math.floor(Math.random() * exceptionTypes.length)]
        const severity = severities[Math.floor(Math.random() * severities.length)]
        const status = statuses[Math.floor(Math.random() * statuses.length)]

        const exceptionDate = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
        const createdAt = new Date(exceptionDate.getTime() + Math.floor(Math.random() * 12) * 60 * 60 * 1000)

        exceptions.push({
          id: `EX${i.toString().padStart(6, '0')}`,
          exceptionCode: `EX${new Date().getFullYear()}${(i).toString().padStart(4, '0')}`,
          userId: `${isTeacher ? 'T' : 'S'}${i.toString().padStart(3, '0')}`,
          userName: `${isTeacher ? '教师' : '学生'}${i}`,
          userCode: `${isTeacher ? 'T' : 'S'}${i.toString().padStart(3, '0')}`,
          userType,
          userAvatar: null,
          organizationName: organizations[Math.floor(Math.random() * organizations.length)],
          exceptionDate: exceptionDate.toISOString().split('T')[0],
          exceptionType,
          severity,
          status,
          description: getExceptionDescription(exceptionType, severity),
          processorId: status !== 'pending' ? 'ADMIN001' : null,
          processorName: status !== 'pending' ? '管理员' : null,
          processTime: status !== 'pending' ? new Date(createdAt.getTime() + Math.floor(Math.random() * 48) * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ') : null,
          processResult: status === 'resolved' ? '异常已处理，记录已更正' : status === 'ignored' ? '异常已忽略' : null,
          createdAt: createdAt.toISOString().slice(0, 19).replace('T', ' '),
          updatedAt: status !== 'pending' ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null,
          relatedRecords: [
            {
              attendanceDate: exceptionDate.toISOString().split('T')[0],
              checkInTime: exceptionType === 'absent_no_report' ? null : '08:45:00',
              checkOutTime: exceptionType === 'early_serious' ? '15:30:00' : '17:30:00',
              status: exceptionType === 'absent_no_report' ? 'absent' : exceptionType === 'late_serious' ? 'late' : 'early_leave',
              dataSource: 'device'
            }
          ],
          processHistory: status !== 'pending' ? [
            {
              action: '创建异常',
              processorName: '系统',
              createTime: createdAt.toISOString().slice(0, 19).replace('T', ' '),
              remark: '自动检测到考勤异常'
            },
            {
              action: status === 'resolved' ? '处理异常' : '忽略异常',
              processorName: '管理员',
              createTime: new Date(createdAt.getTime() + Math.floor(Math.random() * 48) * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
              remark: status === 'resolved' ? '异常已处理，记录已更正' : '异常情况属实，予以忽略'
            }
          ] : [
            {
              action: '创建异常',
              processorName: '系统',
              createTime: createdAt.toISOString().slice(0, 19).replace('T', ' '),
              remark: '自动检测到考勤异常'
            }
          ]
        })
      }

      return exceptions
    }

    // 获取异常描述
    const getExceptionDescription = (type: string, severity: string) => {
      const descriptions: Record<string, Record<string, string>> = {
        absent_no_report: {
          low: '员工缺勤但未提交请假申请',
          medium: '员工连续缺勤未报告',
          high: '员工长期缺勤无故不报告',
          urgent: '员工失联，连续多日缺勤'
        },
        late_serious: {
          low: '员工迟到超过30分钟',
          medium: '员工迟到超过1小时',
          high: '员工迟到超过2小时',
          urgent: '员工严重迟到影响工作'
        },
        early_serious: {
          low: '员工早退超过30分钟',
          medium: '员工早退超过1小时',
          high: '员工早退超过2小时',
          urgent: '员工严重早退影响工作'
        },
        device_error: {
          low: '打卡设备偶发性故障',
          medium: '打卡设备间歇性故障',
          high: '打卡设备持续故障',
          urgent: '打卡设备完全故障'
        },
        data_missing: {
          low: '考勤数据部分缺失',
          medium: '考勤数据大量缺失',
          high: '考勤数据完全缺失',
          urgent: '系统数据异常导致大面积数据丢失'
        },
        other: {
          low: '其他轻微考勤异常',
          medium: '其他一般考勤异常',
          high: '其他严重考勤异常',
          urgent: '其他紧急考勤异常'
        }
      }

      return descriptions[type]?.[severity] || '考勤异常'
    }

    let exceptions = generateAttendanceExceptions()

    // 应用筛选条件
    if (params.exceptionType) {
      exceptions = exceptions.filter(e => e.exceptionType === params.exceptionType)
    }
    if (params.status) {
      exceptions = exceptions.filter(e => e.status === params.status)
    }
    if (params.userType) {
      exceptions = exceptions.filter(e => e.userType === params.userType)
    }
    if (params.userName) {
      exceptions = exceptions.filter(e => e.userName.includes(params.userName))
    }
    if (params.userCode) {
      exceptions = exceptions.filter(e => e.userCode.includes(params.userCode))
    }
    if (params.severity) {
      exceptions = exceptions.filter(e => e.severity === params.severity)
    }
    if (params.processorName) {
      exceptions = exceptions.filter(e => e.processorName && e.processorName.includes(params.processorName))
    }
    if (params.startDate && params.endDate) {
      exceptions = exceptions.filter(e => e.exceptionDate >= params.startDate && e.exceptionDate <= params.endDate)
    }
    if (params.createStartTime && params.createEndTime) {
      exceptions = exceptions.filter(e => e.createdAt >= params.createStartTime && e.createdAt <= params.createEndTime)
    }

    // 分页
    const total = exceptions.length
    const start = (pageNum - 1) * pageSize
    const end = start + pageSize
    exceptions = exceptions.slice(start, end)

    return Promise.resolve({
      code: 200,
      data: {
        records: exceptions,
        total,
        pageNum,
        pageSize
      },
      message: '获取成功'
    })
  }

  // 获取单个考勤异常详情
  if (config.url?.startsWith('/api/attendance/exceptions/') && config.method === 'get' && !config.url.includes('/history')) {
    const exceptionId = config.url.split('/').pop()

    return Promise.resolve({
      code: 200,
      data: {
        id: exceptionId,
        exceptionCode: `EX${new Date().getFullYear()}0001`,
        userId: 'T001',
        userName: '张老师',
        userCode: 'T001',
        userType: 'teacher',
        userAvatar: null,
        organizationName: '语文教研组',
        exceptionDate: '2024-01-22',
        exceptionType: 'late_serious',
        severity: 'medium',
        status: 'pending',
        description: '员工迟到超过1小时',
        processorId: null,
        processorName: null,
        processTime: null,
        processResult: null,
        createdAt: '2024-01-22 09:30:00',
        updatedAt: null,
        relatedRecords: [
          {
            attendanceDate: '2024-01-22',
            checkInTime: '09:30:00',
            checkOutTime: '17:30:00',
            status: 'late',
            dataSource: 'device'
          }
        ],
        processHistory: [
          {
            action: '创建异常',
            processorName: '系统',
            createTime: '2024-01-22 09:30:00',
            remark: '自动检测到考勤异常'
          }
        ]
      },
      message: '获取成功'
    })
  }

  // 处理考勤异常
  if (config.url === '/api/attendance/exceptions/process' && config.method === 'post') {
    return Promise.resolve({
      code: 200,
      data: {
        id: Date.now().toString()
      },
      message: '处理成功'
    })
  }

  // 获取异常处理历史
  if (config.url?.startsWith('/api/attendance/exceptions/') && config.url.includes('/history')) {
    return Promise.resolve({
      code: 200,
      data: [
        {
          action: '创建异常',
          processorName: '系统',
          createTime: '2024-01-22 09:30:00',
          remark: '自动检测到考勤异常'
        },
        {
          action: '处理异常',
          processorName: '管理员',
          createTime: '2024-01-22 10:15:00',
          remark: '异常已处理，记录已更正'
        }
      ],
      message: '获取成功'
    })
  }

  // 考勤统计相关接口
  if (config.url === '/api/attendance/statistics') {
    return Promise.resolve({
      code: 200,
      data: {
        totalAttendance: 1234,
        normalCount: 1089,
        lateCount: 89,
        earlyLeaveCount: 34,
        absentCount: 22,
        attendanceRate: 94.2,
        punctualityRate: 89.7,
        averageWorkHours: 8.2,
        exceptionCount: 156
      },
      message: '获取成功'
    })
  }

  // 考勤报告数据
  if (config.url === '/api/attendance/reports') {
    const params = config.params || {}
    const pageNum = params.pageNum || 1
    const pageSize = params.pageSize || 20

    // 生成模拟报告数据
    const generateReportData = () => {
      const reports = []
      const now = new Date()

      for (let i = 0; i < 30; i++) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const totalCount = Math.floor(Math.random() * 50) + 200

        // 先生成各个比例，确保总和不超过1
        const normalRate = 0.75 + Math.random() * 0.15     // 75-90%
        const lateRate = 0.02 + Math.random() * 0.05       // 2-7%
        const earlyLeaveRate = 0.01 + Math.random() * 0.03 // 1-4%
        const absentRate = 0.01 + Math.random() * 0.03     // 1-4%
        const leaveRate = 0.02 + Math.random() * 0.05      // 2-7%

        // 归一化，确保总和为1
        const totalRate = normalRate + lateRate + earlyLeaveRate + absentRate + leaveRate

        const normalCount = Math.floor(totalCount * (normalRate / totalRate))
        const lateCount = Math.floor(totalCount * (lateRate / totalRate))
        const earlyLeaveCount = Math.floor(totalCount * (earlyLeaveRate / totalRate))
        const absentCount = Math.floor(totalCount * (absentRate / totalRate))
        // 剩余的都算作请假，避免舍入误差
        const leaveCount = totalCount - normalCount - lateCount - earlyLeaveCount - absentCount

        // 出勤率 = (正常+迟到+早退) / (总人数-请假人数) * 100
        // 不包括请假和缺勤的人
        const actualAttendance = normalCount + lateCount + earlyLeaveCount
        const shouldAttend = totalCount - leaveCount  // 应出勤人数（不包括请假）
        const attendanceRate = shouldAttend > 0 ? Math.min(100, Math.round((actualAttendance / shouldAttend) * 100)) : 0

        // 准时率 = 正常 / 应出勤人数 * 100
        const punctualityRate = shouldAttend > 0 ? Math.min(100, Math.round((normalCount / shouldAttend) * 100)) : 0

        reports.push({
          date: date.toISOString().split('T')[0],
          totalCount,
          normalCount,
          lateCount,
          earlyLeaveCount,
          absentCount,
          leaveCount,
          attendanceRate,
          punctualityRate,
          averageWorkHours: (8 + Math.random() * 2).toFixed(1)
        })
      }

      return reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }

    let reports = generateReportData()

    // 分页
    const total = reports.length
    const start = (pageNum - 1) * pageSize
    const end = start + pageSize
    reports = reports.slice(start, end)

    return Promise.resolve({
      code: 200,
      data: {
        records: reports,
        total,
        pageNum,
        pageSize
      },
      message: '获取成功'
    })
  }

  // 导出考勤报告
  if (config.url === '/api/attendance/reports/export') {
    return Promise.resolve({
      code: 200,
      data: {},
      message: '导出成功'
    })
  }

  // 获取考勤趋势数据
  if (config.url === '/api/attendance/trend') {
    return Promise.resolve({
      code: 200,
      data: {
        dates: ['1月', '2月', '3月', '4月', '5月', '6月'],
        attendanceRates: [94, 95, 93, 96, 94, 95],
        punctualityRates: [89, 91, 87, 92, 89, 90]
      },
      message: '获取成功'
    })
  }

  // 获取考勤分布数据
  if (config.url === '/api/attendance/distribution') {
    return Promise.resolve({
      code: 200,
      data: {
        distribution: [
          { value: 1048, name: '正常出勤', itemStyle: { color: '#67c23a' } },
          { value: 735, name: '迟到', itemStyle: { color: '#e6a23c' } },
          { value: 580, name: '早退', itemStyle: { color: '#f56c6c' } },
          { value: 484, name: '缺勤', itemStyle: { color: '#909399' } },
          { value: 300, name: '请假', itemStyle: { color: '#409eff' } }
        ]
      },
      message: '获取成功'
    })
  }

  // 获取设备状态
  if (config.url === '/api/attendance/devices/status') {
    return Promise.resolve({
      code: 200,
      data: {
        totalDevices: 10,
        onlineDevices: 8,
        offlineDevices: 2,
        devices: [
          { id: 'DEV001', name: '大门考勤机1', status: 'online', location: '学校大门' },
          { id: 'DEV002', name: '大门考勤机2', status: 'online', location: '学校大门' },
          { id: 'DEV003', name: '教学楼考勤机', status: 'offline', location: '教学楼入口' }
        ]
      },
      message: '获取成功'
    })
  }

  // 触发设备同步
  if (config.url === '/api/attendance/devices/sync') {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          code: 200,
          data: {
            syncResult: {
              totalDevices: 10,
              successDevices: 8,
              failedDevices: 2,
              syncRecords: 156
            }
          },
          message: '同步成功'
        })
      }, 3000) // 模拟同步延迟
    })
  }

  // 根据URL返回对应的模拟数据
  const matchedUrl = Object.keys(mockData).find(key => url?.includes(key))
  if (matchedUrl) {
    return Promise.resolve(mockData[matchedUrl])
  }

  // 默认返回成功
  return Promise.resolve({
    code: 200,
    data: {},
    message: '操作成功'
  })
}

// 创建支持 mock 的 request 实例
const request = {
  get: (url: string, config?: AxiosRequestConfig) => {
    const requestConfig = { ...config, method: 'GET', url }
    if (import.meta.env.DEV) {
      return mockResponse(requestConfig)
    }
    return service.get(url, config)
  },

  post: (url: string, data?: any, config?: AxiosRequestConfig) => {
    const requestConfig = { ...config, method: 'POST', url, data }
    if (import.meta.env.DEV) {
      return mockResponse(requestConfig)
    }
    return service.post(url, data, config)
  },

  put: (url: string, data?: any, config?: AxiosRequestConfig) => {
    const requestConfig = { ...config, method: 'PUT', url, data }
    if (import.meta.env.DEV) {
      return mockResponse(requestConfig)
    }
    return service.put(url, data, config)
  },

  delete: (url: string, config?: AxiosRequestConfig) => {
    const requestConfig = { ...config, method: 'DELETE', url }
    if (import.meta.env.DEV) {
      return mockResponse(requestConfig)
    }
    return service.delete(url, config)
  }
}

// 导出 request 实例
export default request

// 导出 service 实例
export { service }