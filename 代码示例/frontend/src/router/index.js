import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

// 导入布局组件
import MainLayout from '@/layouts/MainLayout.vue'

// 路由配置
const routes = [
  {
    path: '/',
    redirect: (to) => {
      // 如果用户已登录，直接跳转到仪表板
      const isAuth = localStorage.getItem('token') || sessionStorage.getItem('user')
      return isAuth ? '/dashboard' : '/login'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/system-select',
    name: 'SystemSelect',
    component: () => import('@/views/SystemSelect.vue'),
    meta: {
      title: '系统选择',
      requiresAuth: true
    }
  },
  {
    path: '/dashboard',
    component: MainLayout,
    redirect: '/dashboard/index',
    children: [
      {
        path: 'index',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Index.vue'),
        meta: {
          title: '营销控制台',
          requiresAuth: true,
          keepAlive: true
        }
      }
    ]
  },
  {
    path: '/product',
    component: MainLayout,
    redirect: '/product/list',
    children: [
      {
        path: 'category',
        name: 'ProductCategory',
        component: () => import('@/views/product/Category.vue'),
        meta: {
          title: '产品分类',
          requiresAuth: true
        }
      },
      {
        path: 'list',
        name: 'ProductList',
        component: () => import('@/views/product/List.vue'),
        meta: {
          title: '产品管理',
          requiresAuth: true,
          keepAlive: true
        }
      },
      {
        path: 'media',
        name: 'ProductMedia',
        component: () => import('@/views/product/Media.vue'),
        meta: {
          title: '多媒体管理',
          requiresAuth: true
        }
      },
      {
        path: 'multilang',
        name: 'ProductMultilang',
        component: () => import('@/views/product/Multilang.vue'),
        meta: {
          title: '多语言内容',
          requiresAuth: true
        }
      },
      {
        path: 'price',
        name: 'ProductPrice',
        component: () => import('@/views/product/Price.vue'),
        meta: {
          title: '价格管理',
          requiresAuth: true
        }
      }
    ]
  },
  // 保留原有的客户路由（已注释，可随时恢复）
  // {
  //   path: '/customer',
  //   component: MainLayout,
  //   redirect: '/customer/import',
  //   children: [
  //     {
  //       path: 'import',
  //       name: 'CustomerImport',
  //       component: () => import('@/views/customer/Import.vue'),
  //       meta: {
  //         title: '数据导入',
  //         requiresAuth: true
  //       }
  //     },
  //     {
  //       path: 'api',
  //       name: 'CustomerApi',
  //       component: () => import('@/views/customer/Api.vue'),
  //       meta: {
  //         title: 'API采集',
  //         requiresAuth: true
  //       }
  //     },
  //     {
  //       path: 'clean',
  //       name: 'CustomerClean',
  //       component: () => import('@/views/customer/Clean.vue'),
  //       meta: {
  //         title: '数据清洗',
  //         requiresAuth: true
  //       }
  //     }
  //   ]
  // },

  // 新的数据采集管理路由
  {
    path: '/data-collection',
    component: MainLayout,
    redirect: '/data-collection/company-discovery',
    children: [
      {
        path: 'company-discovery',
        name: 'CompanyDiscovery',
        component: () => import('@/views/data-collection/CompanyDiscovery.vue'),
        meta: {
          title: '公司发现',
          requiresAuth: true
        }
      },
      {
        path: 'email-search',
        name: 'EmailSearch',
        component: () => import('@/views/data-collection/EmailSearch.vue'),
        meta: {
          title: '邮箱搜索',
          requiresAuth: true,
          hidden: true
        }
      },
      {
        path: 'email-finder',
        name: 'EmailFinder',
        component: () => import('@/views/data-collection/EmailFinder.vue'),
        meta: {
          title: '精准查找',
          requiresAuth: true,
          hidden: true
        }
      },
      {
        path: 'email-verifier',
        name: 'EmailVerifier',
        component: () => import('@/views/data-collection/EmailVerifier.vue'),
        meta: {
          title: '邮箱验证',
          requiresAuth: true,
          hidden: true
        }
      },
      {
        path: 'enrichment',
        name: 'DataEnrichment',
        component: () => import('@/views/data-collection/Enrichment.vue'),
        meta: {
          title: '信息丰富化',
          requiresAuth: true,
          hidden: true
        }
      },
      {
        path: 'monitor',
        name: 'CollectionMonitor',
        component: () => import('@/views/data-collection/Monitor.vue'),
        meta: {
          title: '采集监控',
          requiresAuth: true
        }
      },
      {
        path: 'settings',
        name: 'CollectionSettings',
        component: () => import('@/views/data-collection/Settings.vue'),
        meta: {
          title: '采集配置',
          requiresAuth: true
        }
      },
      {
        path: 'company-lists',
        name: 'CompanyLists',
        component: () => import('@/views/data-collection/CompanyLists.vue'),
        meta: {
          title: '我的公司列表',
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/ai-assistant',
    component: MainLayout,
    redirect: '/ai-assistant/content',
    children: [
      {
        path: 'content',
        name: 'AiContent',
        component: () => import('@/views/ai-assistant/Content.vue'),
        meta: {
          title: '内容生成',
          requiresAuth: true
        }
      },
      {
        path: 'email-template',
        name: 'AiEmailTemplate',
        component: () => import('@/views/ai-assistant/EmailTemplate.vue'),
        meta: {
          title: '邮件模板生成',
          requiresAuth: true
        }
      },
      {
        path: 'social-content',
        name: 'AiSocialContent',
        component: () => import('@/views/ai-assistant/SocialContent.vue'),
        meta: {
          title: '社媒话术生成',
          requiresAuth: true
        }
      },
      {
        path: 'multi-language',
        name: 'AiMultiLanguage',
        component: () => import('@/views/ai-assistant/MultiLanguage.vue'),
        meta: {
          title: '多语言生成',
          requiresAuth: true
        }
      },
      {
        path: 'translate',
        name: 'AiTranslate',
        component: () => import('@/views/ai-assistant/Translate.vue'),
        meta: {
          title: '多语言翻译',
          requiresAuth: true
        }
      },
      {
        path: 'recommend',
        name: 'AiRecommend',
        component: () => import('@/views/ai-assistant/Recommend.vue'),
        meta: {
          title: '智能推荐',
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/customer-center',
    component: MainLayout,
    redirect: '/customer-center/list',
    children: [
      {
        path: 'list',
        name: 'CustomerCenterList',
        component: () => import('@/views/customer-center/CustomerList.vue'),
        meta: {
          title: '客户列表',
          requiresAuth: true,
          keepAlive: true
        }
      },
      {
        path: 'detail/:id',
        name: 'CustomerDetail',
        component: () => import('@/views/customer-center/CustomerDetail.vue'),
        meta: {
          title: '客户详情',
          requiresAuth: true
        }
      },
      {
        path: 'profile',
        name: 'CustomerProfile',
        component: () => import('@/views/customer-center/Profile.vue'),
        meta: {
          title: '客户画像',
          requiresAuth: true
        }
      },
      {
        path: 'group',
        name: 'CustomerGroup',
        component: () => import('@/views/customer-center/CustomerGroup.vue'),
        meta: {
          title: '客户分组',
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/campaign',
    component: MainLayout,
    redirect: '/campaign/list',
    children: [
      {
        path: 'list',
        name: 'CampaignList',
        component: () => import('@/views/campaign/List.vue'),
        meta: {
          title: '活动列表',
          requiresAuth: true,
          keepAlive: true
        }
      },
      // 创建活动路由已隐藏，但保留定义
      // {
      //   path: 'create',
      //   name: 'CampaignCreate',
      //   component: () => import('@/views/campaign/Create.vue'),
      //   meta: {
      //     title: '创建活动',
      //     requiresAuth: true
      //   }
      // },
      {
        path: 'customer-selection',
        name: 'CampaignCustomerSelection',
        component: () => import('@/views/campaign/CustomerSelection.vue'),
        meta: {
          title: '客户选择',
          requiresAuth: true
        }
      },
      {
        path: 'content-config',
        name: 'CampaignContentConfiguration',
        component: () => import('@/views/campaign/ContentConfiguration.vue'),
        meta: {
          title: '内容配置',
          requiresAuth: true
        }
      },
      {
        path: 'channel-settings',
        name: 'CampaignChannelSettings',
        component: () => import('@/views/campaign/ChannelSettings.vue'),
        meta: {
          title: '渠道设置',
          requiresAuth: true
        }
      },
      {
        path: 'template',
        name: 'CampaignTemplate',
        component: () => import('@/views/campaign/Template.vue'),
        meta: {
          title: '活动模板',
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/channel',
    component: MainLayout,
    redirect: '/channel/email',
    children: [
      {
        path: 'email',
        name: 'ChannelEmail',
        component: () => import('@/views/channel/Email.vue'),
        meta: {
          title: '邮件营销',
          requiresAuth: true
        }
      },
      {
        path: 'social',
        name: 'ChannelSocial',
        component: () => import('@/views/channel/SocialMedia.vue'),
        meta: {
          title: '社媒营销',
          requiresAuth: true
        }
      },
      {
        path: 'whatsapp',
        name: 'ChannelWhatsapp',
        component: () => import('@/views/channel/Whatsapp.vue'),
        meta: {
          title: 'WhatsApp营销',
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/tracking',
    component: MainLayout,
    redirect: '/tracking/email',
    children: [
      {
        path: 'email',
        name: 'TrackingEmail',
        component: () => import('@/views/tracking/Email.vue'),
        meta: {
          title: '邮件追踪',
          requiresAuth: true
        }
      },
      {
        path: 'website',
        name: 'TrackingWebsite',
        component: () => import('@/views/tracking/Website.vue'),
        meta: {
          title: '网站追踪',
          requiresAuth: true
        }
      },
      {
        path: 'funnel',
        name: 'TrackingFunnel',
        component: () => import('@/views/tracking/Funnel.vue'),
        meta: {
          title: '转化漏斗',
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/report',
    component: MainLayout,
    redirect: '/report/overview',
    children: [
      {
        path: 'overview',
        name: 'ReportOverview',
        component: () => import('@/views/report/Overview.vue'),
        meta: {
          title: '营销总览',
          requiresAuth: true
        }
      },
      {
        path: 'customer',
        name: 'ReportCustomer',
        component: () => import('@/views/report/Customer.vue'),
        meta: {
          title: '客户分析',
          requiresAuth: true
        }
      },
      {
        path: 'custom',
        name: 'ReportCustom',
        component: () => import('@/views/report/Custom.vue'),
        meta: {
          title: '自定义报表',
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/system',
    component: MainLayout,
    redirect: '/system/person',
    children: [
      {
        path: 'person',
        name: 'SystemPerson',
        component: () => import('@/views/system/Person.vue'),
        meta: {
          title: '人员信息',
          requiresAuth: true
        }
      },
      {
        path: 'account',
        name: 'SystemAccount',
        component: () => import('@/views/system/Account.vue'),
        meta: {
          title: '账号管理',
          requiresAuth: true
        }
      },
      {
        path: 'role',
        name: 'SystemRole',
        component: () => import('@/views/system/Role.vue'),
        meta: {
          title: '角色权限',
          requiresAuth: true
        }
      },
      {
        path: 'department',
        name: 'SystemDepartment',
        component: () => import('@/views/system/Department.vue'),
        meta: {
          title: '部门管理',
          requiresAuth: true
        }
      },
      {
        path: 'position',
        name: 'SystemPosition',
        component: () => import('@/views/system/Position.vue'),
        meta: {
          title: '岗位管理',
          requiresAuth: true
        }
      },
      {
        path: 'personnel',
        name: 'SystemPersonnel',
        component: () => import('@/views/system/Personnel.vue'),
        meta: {
          title: '人员管理',
          requiresAuth: true
        }
      },
      {
        path: 'config',
        name: 'SystemConfig',
        component: () => import('@/views/system/Config.vue'),
        meta: {
          title: '系统配置',
          requiresAuth: true
        }
      },
      {
        path: 'log',
        name: 'SystemLog',
        component: () => import('@/views/system/Log.vue'),
        meta: {
          title: '操作日志',
          requiresAuth: true
        }
      },
      {
        path: 'notification',
        name: 'SystemNotification',
        component: () => import('@/views/system/Notification.vue'),
        meta: {
          title: '消息管理',
          requiresAuth: true
        }
      },
      {
        path: 'scheduled-tasks',
        name: 'SystemScheduledTasks',
        component: () => import('@/views/system/ScheduledTasks.vue'),
        meta: {
          title: '定时任务管理',
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/message',
    component: MainLayout,
    redirect: '/message/center',
    children: [
      {
        path: 'center',
        name: 'MessageCenter',
        component: () => import('@/views/message/MessageCenter.vue'),
        meta: {
          title: '消息中心',
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: '页面不存在'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 模拟登录状态检查
const isAuthenticated = () => {
  // 这里可以检查 token、localStorage 等
  return localStorage.getItem('token') || sessionStorage.getItem('user')
}

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - 海外营销管理系统`
  }

  // 检查是否需要认证
  if (to.meta?.requiresAuth) {
    if (isAuthenticated()) {
      // 如果已登录，检查是否有权限访问该页面
      if (hasPermission(to)) {
        next()
      } else {
        ElMessage.error('您没有权限访问该页面')
        next('/dashboard')
      }
    } else {
      ElMessage.warning('请先登录')
      next('/login')
    }
  } else {
    // 如果是登录页面，但用户已经登录，则重定向到仪表板
    if (to.path === '/login' && isAuthenticated()) {
      next('/dashboard')
    } else {
      next()
    }
  }
})

// 检查用户权限（简化版本）
const hasPermission = (route) => {
  // 这里可以根据用户角色和权限进行检查
  // 现在简化为所有已登录用户都有权限
  return true
}

// 全局后置钩子
router.afterEach((to, from) => {
  // 页面加载完成后的处理
  // 可以在这里处理页面加载完成的逻辑，如埋点统计等
})

export default router