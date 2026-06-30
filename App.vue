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

      // 确保 appId 已初始化后再发起请求
      console.log('appId:', this.globalData.appId)

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
      try {
        const accountInfo = uni.getAccountInfoSync()
        if (accountInfo && accountInfo.miniProgram) {
          this.globalData.appId = accountInfo.miniProgram.appId || ''
          uni.setStorageSync('appId', this.globalData.appId)
        }
      } catch (e) {
        console.warn('获取appId失败:', e)
      }
      console.log('appId:', this.globalData.appId)
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

          // 解析导航样式配置（从第一条记录的 ext1）
          if (res.data.length > 0 && res.data[0].ext1) {
            const raw = res.data[0].ext1
            // 框架可能已自动解析为对象，也可能是 JSON 字符串
            if (typeof raw === 'object') {
              this.globalData.navStyle = raw
            } else {
              try {
                this.globalData.navStyle = JSON.parse(raw)
              } catch (e) {
                console.warn('解析导航样式配置失败', e)
                this.globalData.navStyle = {}
              }
            }
          } else {
            this.globalData.navStyle = {}
          }
          // 通知 tab-bar 更新样式
          uni.$emit('navStyleUpdate')

          // 只找装修页(linkType=2)设置 specialId，系统页面(linkType=0)不设置
          const homeTab = tabs.find(t => String(t.linkType) === '2' && t.linkUrlId)
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
          // 系统登录接口返回格式：access_token, expire_in, client_id, openid
          const { access_token, openid } = res.data
          uni.setStorageSync('App-Token', access_token)
          if (openid) uni.setStorageSync('xcxOpenId', openid)
          this.globalData.loginReady = true
          console.log('静默登录成功')
        }
      } catch (e) {
        //TODO 这个失败的以后要处理掉，要不查的是全量数据没有租户id
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
    navStyle: {},
    shopImg: config.baseUrl || '',
    appId: '',
    openId: '',
    userId: ''
  }
}
</script>

<style lang="scss">
@import '@/static/scss/index.scss';

/* 全局页面背景色，防止跳转时穿透 */
page {
  background-color: #ffffff;
}

/* 所有页面根容器 */
page > view {
  min-height: 100vh;
  background-color: #ffffff;
}
</style>
