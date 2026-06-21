<script>
import config from './config'
import { getToken } from '@/utils/auth'
import { getNavigation } from '@/api/mall/home'

export default {
  onLaunch(options) {
    this.initApp(options)
  },
  onShow(options) {
    // 记录场景值
    if (options.scene) {
      uni.setStorageSync('scene', options.scene)
    }
  },
  methods: {
    async initApp(options) {
      // 初始化配置
      this.globalData.config = config
      // 获取系统信息
      this.initSystemInfo()
      // 记录分享参数
      this.initShareParams(options)
      // 获取导航配置
      await this.loadNavigation()
    },

    // 获取系统信息
    initSystemInfo() {
      const sysInfo = uni.getSystemInfoSync()
      this.globalData.systemInfo = sysInfo
      this.globalData.statusBarHeight = sysInfo.statusBarHeight || 0
      this.globalData.safeAreaBottom = sysInfo.screenHeight - (sysInfo.safeArea?.bottom || sysInfo.screenHeight)

      // #ifdef MP-WEIXIN
      try {
        const menuBtn = uni.getMenuButtonBoundingClientRect()
        this.globalData.menuButtonInfo = menuBtn
        this.globalData.navBarHeight = sysInfo.statusBarHeight + 44
      } catch (e) {
        this.globalData.navBarHeight = sysInfo.statusBarHeight + 44
      }
      // #endif
    },

    // 记录分享参数
    initShareParams(options) {
      if (options.query) {
        const { userId, shopId } = options.query
        if (userId) uni.setStorageSync('userId', userId)
        if (shopId) uni.setStorageSync('shopId', shopId)
      }
    },

    // 获取导航配置（Tab 栏）
    async loadNavigation() {
      try {
        const res = await getNavigation({ pageSize: 10 })
        if (res.rows && res.rows.length) {
          const tabs = res.rows
            .filter(item => item.navigationStatusFlag === '0') // 过滤启用的
            .sort((a, b) => (a.sort || 0) - (b.sort || 0))
            .map(item => ({
              navigationId: item.navigationId,
              navigationName: item.navigationName,
              iconOne: item.iconOne,   // 选中图标
              iconTwo: item.iconTwo,   // 未选中图标
              linkType: item.linkType || 0,  // 0=系统页面, 1=专题页
              linkUrlId: item.linkUrlId,     // 专题页ID
              contentName: item.contentName, // 页面路径标识
              selected: false
            }))

          this.globalData.tabBar.list = tabs

          // 找到首页对应的专题页ID
          const homeTab = tabs.find(t => t.navigationName === '首页')
          if (homeTab && homeTab.linkUrlId) {
            this.globalData.specialId = homeTab.linkUrlId
          }

          // 通知等待导航数据的页面
          this.globalData.navigationReady = true
          if (this._navigationCallbacks) {
            this._navigationCallbacks.forEach(cb => cb(tabs))
            this._navigationCallbacks = null
          }
        }
      } catch (e) {
        console.error('加载导航配置失败', e)
      }
    },

    // 等待导航数据就绪
    waitForNavigation() {
      return new Promise((resolve) => {
        if (this.globalData.navigationReady) {
          resolve(this.globalData.tabBar.list)
        } else {
          if (!this._navigationCallbacks) this._navigationCallbacks = []
          this._navigationCallbacks.push(resolve)
        }
      })
    },

    // 等待登录就绪（轮询 token）
    waitForLogin() {
      return new Promise((resolve, reject) => {
        let count = 0
        const timer = setInterval(() => {
          count++
          if (getToken()) {
            clearInterval(timer)
            resolve(true)
          }
          if (count > 25) { // 5秒超时
            clearInterval(timer)
            resolve(false)
          }
        }, 200)
      })
    },

    // 设置当前选中的Tab
    setSelectedTab(pagePath) {
      const list = this.globalData.tabBar.list
      if (!list) return
      list.forEach(tab => {
        tab.selected = false
        if (tab.linkType === 0) {
          // 普通页面：路径匹配即选中
          tab.selected = tab.contentName === pagePath || tab.pagePath === pagePath
        } else if (tab.linkType === 1 || tab.linkType === 2) {
          // 专题页：路径匹配 + specialId 匹配
          tab.selected = (tab.contentName === pagePath) && (this.globalData.specialId == tab.linkUrlId)
        }
      })
    },

    // 切换专题页
    switchSpecialPage(linkUrlId) {
      this.globalData.specialId = linkUrlId
    }
  },

  globalData: {
    config: null,
    systemInfo: null,
    statusBarHeight: 0,
    navBarHeight: 0,
    menuButtonInfo: null,
    safeAreaBottom: 0,
    specialId: null,        // 当前专题页/装修页ID
    navigationReady: false,
    tabBar: {
      list: []              // 动态Tab配置
    },
    shopImg: '',            // 图片前缀
    openId: '',
    userId: ''
  }
}
</script>

<style lang="scss">
@import '@/static/scss/index.scss'
</style>
