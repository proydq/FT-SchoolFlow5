import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/',
    component: () => import('@/layout/Layout.vue'),
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: {
          title: '首页',
          requiresAuth: true
        }
      },
      // 人员信息管理
      {
        path: 'personnel',
        name: 'Personnel',
        component: () => import('@/layout/RouteView.vue'),
        redirect: '/personnel/teacher',
        meta: {
          title: '人员信息管理'
        },
        children: [
          {
            path: 'teacher',
            name: 'TeacherList',
            component: () => import('@/views/personnel/TeacherList.vue'),
            meta: {
              title: '教师信息'
            }
          },
          {
            path: 'teacher/add',
            name: 'TeacherAdd',
            component: () => import('@/views/personnel/TeacherEdit.vue'),
            meta: {
              title: '新增教师'
            }
          },
          {
            path: 'teacher/edit/:id',
            name: 'TeacherEdit',
            component: () => import('@/views/personnel/TeacherEdit.vue'),
            meta: {
              title: '编辑教师'
            }
          },
          {
            path: 'teacher/detail/:id',
            name: 'TeacherDetail',
            component: () => import('@/views/personnel/TeacherDetail.vue'),
            meta: {
              title: '教师详情'
            }
          },
          {
            path: 'teacher/import',
            name: 'TeacherImport',
            component: () => import('@/views/personnel/TeacherImport.vue'),
            meta: {
              title: '批量导入教师'
            }
          },
          {
            path: 'student',
            name: 'StudentList',
            component: () => import('@/views/personnel/StudentList.vue'),
            meta: {
              title: '学生信息'
            }
          },
          {
            path: 'student/add',
            name: 'StudentAdd',
            component: () => import('@/views/personnel/StudentEdit.vue'),
            meta: {
              title: '新增学生'
            }
          },
          {
            path: 'student/edit/:id',
            name: 'StudentEdit',
            component: () => import('@/views/personnel/StudentEdit.vue'),
            meta: {
              title: '编辑学生'
            }
          },
          {
            path: 'student/detail/:id',
            name: 'StudentDetail',
            component: () => import('@/views/personnel/StudentDetail.vue'),
            meta: {
              title: '学生详情'
            }
          },
          {
            path: 'student/import',
            name: 'StudentImport',
            component: () => import('@/views/personnel/StudentImport.vue'),
            meta: {
              title: '批量导入学生'
            }
          },
          {
            path: 'guardian',
            name: 'GuardianList',
            component: () => import('@/views/personnel/GuardianList.vue'),
            meta: {
              title: '监护人信息'
            }
          },
          {
            path: 'guardian/add',
            name: 'GuardianAdd',
            component: () => import('@/views/personnel/GuardianEdit.vue'),
            meta: {
              title: '新增监护人'
            }
          },
          {
            path: 'guardian/edit/:id',
            name: 'GuardianEdit',
            component: () => import('@/views/personnel/GuardianEdit.vue'),
            meta: {
              title: '编辑监护人'
            }
          },
          {
            path: 'guardian/detail/:id',
            name: 'GuardianDetail',
            component: () => import('@/views/personnel/GuardianDetail.vue'),
            meta: {
              title: '监护人详情'
            }
          }
        ]
      },
      // 班级信息管理
      {
        path: 'class',
        name: 'Class',
        component: () => import('@/layout/RouteView.vue'),
        redirect: '/class/list',
        meta: {
          title: '班级信息管理'
        },
        children: [
          {
            path: 'list',
            name: 'ClassList',
            component: () => import('@/views/class/ClassList.vue'),
            meta: {
              title: '班级列表'
            }
          },
          {
            path: 'grade',
            name: 'GradeList',
            component: () => import('@/views/class/GradeList.vue'),
            meta: {
              title: '年级管理'
            }
          },
          {
            path: 'assignment',
            name: 'ClassAssignment',
            component: () => import('@/views/class/assignment.vue'),
            meta: {
              title: '班主任分配'
            }
          },
          {
            path: 'add',
            name: 'ClassAdd',
            component: () => import('@/views/class/ClassEdit.vue'),
            meta: {
              title: '新增班级'
            }
          },
          {
            path: 'edit/:id',
            name: 'ClassEdit',
            component: () => import('@/views/class/ClassEdit.vue'),
            meta: {
              title: '编辑班级'
            }
          },
          {
            path: 'detail/:id',
            name: 'ClassDetail',
            component: () => import('@/views/class/ClassDetail.vue'),
            meta: {
              title: '班级详情'
            }
          },
          {
            path: 'import',
            name: 'ClassImport',
            component: () => import('@/views/class/ClassImport.vue'),
            meta: {
              title: '批量导入'
            }
          },
          {
            path: 'assign-teacher/:id',
            name: 'AssignTeacher',
            component: () => import('@/views/class/assignment.vue'),
            meta: {
              title: '分配班主任'
            }
          },
          {
            path: 'grade/add',
            name: 'GradeAdd',
            component: () => import('@/views/class/GradeEdit.vue'),
            meta: {
              title: '新增年级'
            }
          },
          {
            path: 'grade/edit/:id',
            name: 'GradeEdit',
            component: () => import('@/views/class/GradeEdit.vue'),
            meta: {
              title: '编辑年级'
            }
          },
          {
            path: 'grade/detail/:id',
            name: 'GradeDetail',
            component: () => import('@/views/class/GradeDetail.vue'),
            meta: {
              title: '年级详情'
            }
          }
        ]
      },
      // 请假管理
      {
        path: 'leave',
        name: 'Leave',
        component: () => import('@/layout/RouteView.vue'),
        redirect: '/leave/apply',
        meta: {
          title: '请假管理'
        },
        children: [
          {
            path: 'type',
            name: 'LeaveType',
            component: () => import('@/views/leave/LeaveType.vue'),
            meta: {
              title: '请假类型配置'
            }
          },
          {
            path: 'type/add',
            name: 'LeaveTypeAdd',
            component: () => import('@/views/leave/LeaveTypeEdit.vue'),
            meta: {
              title: '新增请假类型'
            }
          },
          {
            path: 'type/edit/:id',
            name: 'LeaveTypeEdit',
            component: () => import('@/views/leave/LeaveTypeEdit.vue'),
            meta: {
              title: '编辑请假类型'
            }
          },
          {
            path: 'apply',
            name: 'LeaveApply',
            component: () => import('@/views/leave/LeaveApply.vue'),
            meta: {
              title: '请假申请'
            }
          },
          {
            path: 'approval',
            name: 'LeaveApproval',
            component: () => import('@/views/leave/LeaveApproval.vue'),
            meta: {
              title: '请假审批'
            }
          },
          {
            path: 'record',
            name: 'LeaveRecord',
            component: () => import('@/views/leave/LeaveRecord.vue'),
            meta: {
              title: '请假记录'
            }
          }
        ]
      },
      // 考勤管理
      {
        path: 'attendance',
        name: 'Attendance',
        component: () => import('@/layout/RouteView.vue'),
        redirect: '/attendance/rules',
        meta: {
          title: '考勤管理'
        },
        children: [
          {
            path: 'rules',
            name: 'AttendanceRuleList',
            component: () => import('@/views/attendance/AttendanceRuleList.vue'),
            meta: {
              title: '考勤规则管理'
            }
          },
          {
            path: 'rule/create',
            name: 'AttendanceRuleCreate',
            component: () => import('@/views/attendance/AttendanceRuleForm.vue'),
            meta: {
              title: '新增考勤规则'
            }
          },
          {
            path: 'rule/edit/:id',
            name: 'AttendanceRuleEdit',
            component: () => import('@/views/attendance/AttendanceRuleForm.vue'),
            meta: {
              title: '编辑考勤规则'
            }
          },
          {
            path: 'record',
            name: 'AttendanceRecord',
            component: () => import('@/views/attendance/AttendanceRecordList.vue'),
            meta: {
              title: '考勤记录'
            }
          },
          {
            path: 'records',
            name: 'AttendanceRecordList',
            component: () => import('@/views/attendance/AttendanceRecordList.vue'),
            meta: {
              title: '考勤记录管理'
            }
          },
          {
            path: 'exceptions',
            name: 'AttendanceExceptionList',
            component: () => import('@/views/attendance/AttendanceExceptionList.vue'),
            meta: {
              title: '考勤异常处理'
            }
          },
          {
            path: 'statistics',
            name: 'AttendanceStatistics',
            component: () => import('@/views/attendance/AttendanceStatistics.vue'),
            meta: {
              title: '考勤统计分析'
            }
          }
        ]
      },
      // 门禁通行管理
      {
        path: 'access',
        name: 'Access',
        component: () => import('@/layout/RouteView.vue'),
        redirect: '/access/permission',
        meta: {
          title: '门禁通行管理'
        },
        children: [
          {
            path: 'permission',
            name: 'AccessPermission',
            component: () => import('@/views/access/PermissionManagement.vue'),
            meta: {
              title: '通行权限管理'
            }
          },
          {
            path: 'record',
            name: 'AccessRecord',
            component: () => import('@/views/access/RecordQuery.vue'),
            meta: {
              title: '门禁记录查询'
            }
          },
          {
            path: 'device',
            name: 'AccessDevice',
            component: () => import('@/views/access/DeviceMonitor.vue'),
            meta: {
              title: '设备状态监控'
            }
          },
          {
            path: 'device/:id',
            name: 'AccessDeviceDetail',
            component: () => import('@/views/access/DeviceDetail.vue'),
            meta: {
              title: '设备详情'
            }
          },
          {
            path: 'exception',
            name: 'AccessException',
            component: () => import('@/views/access/ExceptionHandling.vue'),
            meta: {
              title: '异常通行处理'
            }
          },
          {
            path: 'permission/create',
            name: 'AccessPermissionCreate',
            component: () => import('@/views/access/PermissionForm.vue'),
            meta: {
              title: '手动创建通行权限'
            }
          }
        ]
      },
      // 系统配置
      {
        path: 'system',
        name: 'System',
        component: () => import('@/layout/RouteView.vue'),
        redirect: '/system/account',
        meta: {
          title: '系统配置'
        },
        children: [
          {
            path: 'account',
            name: 'Account',
            component: () => import('@/views/account/AccountList.vue'),
            meta: {
              title: '账号管理'
            }
          },
          {
            path: 'role-permission',
            name: 'RolePermission',
            component: () => import('@/views/role/RolePermission.vue'),
            meta: {
              title: '角色权限'
            }
          },
          {
            path: 'department',
            name: 'Department',
            component: () => import('@/views/department/DepartmentList.vue'),
            meta: {
              title: '部门管理'
            }
          },
          {
            path: 'position',
            name: 'Position',
            component: () => import('@/views/position/PositionList.vue'),
            meta: {
              title: '岗位管理'
            }
          },
          {
            path: 'operation-log',
            name: 'OperationLog',
            component: () => import('@/views/log/OperationLog.vue'),
            meta: {
              title: '操作日志'
            }
          },
          {
            path: 'message',
            name: 'Message',
            component: () => import('@/views/message/MessageList.vue'),
            meta: {
              title: '消息管理'
            }
          },
          {
            path: 'scheduled-tasks',
            name: 'ScheduledTasks',
            component: () => import('@/views/system/ScheduledTasks.vue'),
            meta: {
              title: '定时任务'
            }
          }
        ]
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title || '系统'} - 福田林校请假管理系统`

  // 检查是否需要登录
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    // 需要登录但没有token，跳转到登录页
    next('/login')
  } else if (to.path === '/login' && token) {
    // 已登录用户访问登录页，跳转到首页
    next('/dashboard')
  } else {
    next()
  }
})

export default router