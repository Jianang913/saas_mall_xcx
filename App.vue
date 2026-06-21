<script>
import config from './config'
import { getToken } from '@/utils/auth'
import { silentLogin } from '@/api/mall/login'
import { getNavigation, getDictData } from '@/api/mall/home'

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

      // 加载数据字典（不依赖登录）
      this.loadDictData()

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

          // 找第一个装修页(linkType=2)的 linkUrlId 作为首页
          const homeTab = tabs.find(t => String(t.linkType) === '2')
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

    // 加载数据字典
    async loadDictData() {
      try {
        const dictTypes = ['adorn_link_type']
        for (const dictType of dictTypes) {
          const res = await getDictData(dictType)
          if (res.code === 200 && res.data) {
            this.globalData.dict[dictType] = res.data
          }
        }
        this.globalData.dictReady = true
        if (this._dictCallbacks) {
          this._dictCallbacks.forEach(cb => cb(this.globalData.dict))
          this._dictCallbacks = null
        }
      } catch (e) {
        console.error('加载字典数据失败', e)
      }
    },

    // 等待字典数据就绪
    waitForDict() {
      return new Promise((resolve) => {
        if (this.globalData.dictReady) {
          resolve(this.globalData.dict)
        } else {
          if (!this._dictCallbacks) this._dictCallbacks = []
          this._dictCallbacks.push(resolve)
        }
      })
    },

    /**
     * 根据字典类型和值获取标签
     * @param {string} dictType 字典类型
     * @param {string} dictValue 字典值
     * @returns {string} 字典标签
     */
    getDictLabel(dictType, dictValue) {
      const list = this.globalData.dict[dictType]
      if (!list) return ''
      const item = list.find(d => d.dictValue === String(dictValue))
      return item ? item.dictLabel : ''
    },

    /**
     * 根据字典类型获取所有选项
     * @param {string} dictType 字典类型
     * @returns {Array} 字典数据列表
     */
    getDictList(dictType) {
      return this.globalData.dict[dictType] || []
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
    dictReady: false,
    dict: {},
    loginReady: false,
    tabBar: { list: [] },
    shopImg: 'http://localhost:8080',
    appId: '',
    openId: '',
    userId: ''
  }
}
</script>

<style lang="scss">
@import '@/static/scss/index.scss'
</style>
