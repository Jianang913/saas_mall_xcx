<script>
import config from './config'
import { getToken } from '@/utils/auth'
import { silentLogin } from '@/api/mall/login'
import { getNavigation } from '@/api/mall/home'

export default {
  onLaunch(options) {
    this.initApp(options)
  },
  onShow(options) {
    if (options.scene) {
      uni.setStorageSync('scene', options.scene)
    }
  },
  methods: {
    async initApp(options) {
      this.globalData.config = config
      this.initSystemInfo()
      this.initShareParams(options)

      // 获取导航配置（不依赖登录）
      this.loadNavigation()

      // 自动静默登录（不阻塞页面加载）
      this.silentLoginAsync()
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

      // 读取小程序 appId
      const accountInfo = uni.getAccountInfoSync()
      this.globalData.appId = accountInfo.miniProgram.appId
      // #endif
    },

    // 记录分享参数
    initShareParams(options) {
      if (options && options.query) {
        const { userId, shopId } = options.query
        if (userId) uni.setStorageSync('userId', userId)
        if (shopId) uni.setStorageSync('shopId', shopId)
      }
    },

    // 获取导航配置
    async loadNavigation() {
      try {
        const res = await getNavigation({ pageSize: 10 })
        if (res.code === 200 && res.data) {
          const tabs = res.data
            .filter(item => item.navigationStatusFlag === '0')
            .sort((a, b) => (a.sort || 0) - (b.sort || 0))

          this.globalData.tabBar.list = tabs

          // 找首页的装修页ID
          const homeTab = tabs.find(t => t.navigationName === '首页')
          if (homeTab && homeTab.linkUrlId) {
            this.globalData.specialId = homeTab.linkUrlId
          }

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

    // 静默登录（异步，不阻塞页面）
    async silentLoginAsync() {
      // #ifdef MP-WEIXIN
      // 已有 token 则跳过
      if (getToken()) {
        this.globalData.loginReady = true
        return
      }

      try {
        const loginCode = await new Promise((resolve, reject) => {
          uni.login({
            provider: 'weixin',
            success: res => resolve(res.code),
            fail: reject
          })
        })

        const res = await silentLogin({
          code: loginCode,
          appId: this.globalData.appId
        })

        if (res.code === 200 && res.data) {
          const { token, openId, userId, tenantId } = res.data
          uni.setStorageSync('App-Token', token)
          if (openId) uni.setStorageSync('xcxOpenId', openId)
          if (userId) uni.setStorageSync('userId', userId)
          if (tenantId) uni.setStorageSync('tenantId', tenantId)
          this.globalData.loginReady = true
          console.log('静默登录成功')
        }
      } catch (e) {
        console.warn('静默登录失败（不影响浏览）', e)
      }
      // #endif

      // #ifndef MP-WEIXIN
      this.globalData.loginReady = true
      // #endif
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

    // 等待登录就绪
    waitForLogin() {
      return new Promise((resolve) => {
        if (this.globalData.loginReady) {
          resolve(true)
        } else {
          let count = 0
          const timer = setInterval(() => {
            count++
            if (this.globalData.loginReady || getToken()) {
              clearInterval(timer)
              resolve(true)
            }
            if (count > 50) { // 5秒超时
              clearInterval(timer)
              resolve(false)
            }
          }, 100)
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
    specialId: null,
    navigationReady: false,
    loginReady: false,
    tabBar: { list: [] },
    shopImg: '',
    appId: '',
    openId: '',
    userId: ''
  }
}
</script>

<style lang="scss">
@import '@/static/scss/index.scss'
</style>
