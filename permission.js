import { getToken } from '@/utils/auth'

// 登录页面
const loginPage = "/pages/login"

// 需要登录才能访问的页面（白名单之外的都不拦截，让用户先逛）
const authPages = [
  '/pages/order/list/index',       // 订单列表
  '/pages/order/detail/index',     // 订单详情
  '/pages/order/afterSale/index',  // 售后列表
  '/pages/order/afterSale/apply/index',
  '/pages/order/afterSale/detail/index',
]

// 检查是否需要登录
function needAuth(url) {
  const path = url.split('?')[0]
  return authPages.some(p => path.startsWith(p))
}

// 页面跳转拦截器
const list = ["navigateTo", "redirectTo", "reLaunch", "switchTab"]
list.forEach(item => {
  uni.addInterceptor(item, {
    invoke(to) {
      const token = getToken()

      // 已登录，正常跳转
      if (token) {
        // 如果要去登录页，跳转首页
        if (to.url.indexOf(loginPage) !== -1) {
          uni.reLaunch({ url: '/pages/dechome/index' })
          return false
        }
        return true
      }

      // 未登录
      // 登录页本身不拦截
      if (to.url.indexOf(loginPage) !== -1) {
        return true
      }

      // 需要登录的页面 → 跳转登录页
      if (needAuth(to.url)) {
        uni.navigateTo({ url: loginPage })
        return false
      }

      // 不需要登录的页面 → 放行（让用户先逛）
      return true
    },
    fail(err) {
      console.log(err)
    }
  })
})
