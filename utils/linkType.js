/**
 * 链接类型路由工具
 * 基于 RuoYi 数据字典 adorn_link_type，统一管理所有 clickable 元素的跳转逻辑
 *
 * linkType 值与字典 dictValue 一一对应：
 *   0  系统页面     → switchTab
 *   1  专题页       → switchTab /pages/special/index
 *   2  装修页       → navigateTo /pages/dechome/index?specialId=xxx
 *   3  商品分类     → switchTab /pages/classify/index
 *   6  全景图链接   → navigateTo
 *   7  全景图列表   → navigateTo
 *   9  自定义页面   → navigateTo 小程序内部路径
 *   10 其他小程序   → navigateToMiniProgram
 *   11 优惠券       → navigateTo
 *   12 自定义链接   → navigateTo webview
 *   13 案例         → navigateTo
 *   14 设计师       → navigateTo
 *   15 商品详情     → navigateTo /pages/goods/detail/index?id=xxx
 *   21 客服         → open-type="contact"
 */

/**
 * 根据 linkType 和 content 执行跳转
 * @param {number|string} linkType 链接类型（字典值）
 * @param {string} content 链接目标（商品ID/页面路径/URL等）
 * @param {string} contentName 链接名称（可选，用于显示）
 */
export function handleLink(linkType, content, contentName) {
  const type = Number(linkType)

  if (!type && type !== 0) {
    uni.showToast({ title: '即将上线，敬请期待！', icon: 'none' })
    return
  }

  switch (type) {
    case 0: // 系统页面
      // content 存的是页面路径，如 /pages/dechome/index
      navigateToPage(content)
      break

    case 1: // 专题页
      // content 存专题页 ID，设置到 globalData 后跳转
      if (content) {
        const app = getApp()
        if (app) app.globalData.specialId = content
      }
      uni.switchTab({ url: '/pages/special/index' })
      // 通知专题页刷新数据
      setTimeout(() => { uni.$emit('specialPageRefresh', content) }, 300)
      break

    case 2: // 装修页
      // content 存装修页 ID，跳转到首页并携带 specialId
      uni.navigateTo({
        url: '/pages/dechome/index?specialId=' + content
      })
      break

    case 3: // 商品分类
      uni.switchTab({ url: '/pages/classify/index' })
      break

    case 6: // 全景图链接
    case 7: // 全景图列表
      uni.showToast({ title: '全景图功能即将上线', icon: 'none' })
      break

    case 9: // 自定义页面（小程序内部路径）
      navigateToPage(content)
      break

    case 10: // 跳转其他小程序
      // content 存 appId，contentName 存路径
      uni.navigateToMiniProgram({
        appId: content,
        path: contentName || '',
        envVersion: 'release'
      })
      break

    case 11: // 优惠券
      uni.navigateTo({ url: '/pages/mine/coupon/index' })
      break

    case 12: // 自定义链接（H5 webview）
      uni.navigateTo({
        url: '/pages/common/webview/index?url=' + encodeURIComponent(content)
      })
      break

    case 13: // 案例
      uni.showToast({ title: '案例功能即将上线', icon: 'none' })
      break

    case 14: // 设计师
      uni.showToast({ title: '设计师功能即将上线', icon: 'none' })
      break

    case 15: // 商品详情
      uni.navigateTo({ url: '/pages/goods/detail/index?id=' + content })
      break

    case 21: // 客服（需在模板中用 open-type="contact"，此处在 JS 中无法触发）
      uni.showToast({ title: '请点击客服按钮', icon: 'none' })
      break

    default:
      uni.showToast({ title: '即将上线，敬请期待！', icon: 'none' })
      break
  }
}

/**
 * 智能跳转页面（自动判断 switchTab vs navigateTo）
 * @param {string} pagePath 页面路径
 */
function navigateToPage(pagePath) {
  if (!pagePath) return

  const path = pagePath.startsWith('/') ? pagePath : '/' + pagePath

  // tabBar 页面列表
  const tabPages = [
    '/pages/dechome/index',
    '/pages/classify/index',
    '/pages/cart/index',
    '/pages/special/index',
    '/pages/mine/index'
  ]

  if (tabPages.includes(path)) {
    uni.switchTab({ url: path })
  } else {
    uni.navigateTo({ url: path })
  }
}

/**
 * 判断 linkType 是否需要 open-type="contact"（客服）
 * @param {number|string} linkType
 * @returns {boolean}
 */
export function isContactType(linkType) {
  return Number(linkType) === 21
}
