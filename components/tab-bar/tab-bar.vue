<template>
  <view class="tab-bar" v-if="tabList.length" :class="tabBarClass">
    <view class="tab-bar-placeholder" v-if="!isFloat"></view>
    <view class="tab-bar-content" :style="tabBarStyle">
      <view
        v-for="(item, index) in tabList"
        :key="index"
        class="tab-item"
        @click="onTabTap(item, index)"
      >
        <image
          class="tab-icon"
          :src="item.selected ? item.iconTwoUrl : item.iconOneUrl"
          mode="aspectFit"
        />
        <text class="tab-text" :class="{ active: item.selected }">
          {{ item.navigationName }}
        </text>
      </view>
    </view>
  </view>
</template>

<script>
import { navigateTo, switchTab } from '@/utils/navigate'

export default {
  name: 'TabBar',
  data() {
    return {
      tabList: [],
      navStyle: {},
      supportsBlur: true  // 缓存检测结果
    }
  },
  computed: {
    isFloat() {
      return this.navStyle.navPosition === 'float'
    },
    tabBarClass() {
      return {
        'tab-bar-float': this.isFloat
      }
    },
    tabBarStyle() {
      const bg = this.navStyle.navBackground || 'white'
      const opacity = Math.max((this.navStyle.navOpacity ?? 100) / 100, 0.3)

      if (bg === 'transparent') {
        return { background: `rgba(255, 255, 255, ${opacity * 0.3})` }
      } else if (bg === 'blur') {
        const blurVal = Math.round((1 - opacity) * 15 + 5)
        // 使用缓存的检测结果
        if (this.supportsBlur) {
          return {
            background: `rgba(255, 255, 255, ${0.2 + opacity * 0.6})`,
            '-webkit-backdrop-filter': `blur(${blurVal}px)`,
            'backdrop-filter': `blur(${blurVal}px)`
          }
        } else {
          // 降级方案：用更不透明的背景
          return {
            background: `rgba(255, 255, 255, ${0.8 + opacity * 0.2})`
          }
        }
      }
      return { background: '#ffffff' }
    }
  },
  created() {
    console.log('=== tab-bar created ===')
    // 延迟检测 backdrop-filter 支持
    try {
      this.supportsBlur = this.checkBackdropSupport()
    } catch (e) {
      console.warn('检测 backdrop-filter 支持失败', e)
      this.supportsBlur = true
    }
    this.initTabBar()
    // 监听专题页切换事件，更新选中态
    this._onRefresh = () => this.updateSelected()
    uni.$on('specialPageRefresh', this._onRefresh)
  },
  beforeUnmount() {
    this._destroyed = true
    if (this._retryTimer) {
      clearTimeout(this._retryTimer)
      this._retryTimer = null
    }
    uni.$off('specialPageRefresh', this._onRefresh)
  },
  methods: {
    async initTabBar() {
      const app = getApp()
      if (!app) return

      // 如果导航数据未就绪，轮询等待（最多 5 秒）
      if (!app.globalData.navigationReady) {
        let count = 0
        const poll = () => {
          if (app.globalData.navigationReady || count > 50) {
            this._loadTabs(app)
            return
          }
          count++
          this._retryTimer = setTimeout(poll, 100)
        }
        poll()
      } else {
        this._loadTabs(app)
      }
    },

    _loadTabs(app) {
      const tabs = app.globalData.tabBar.list
      if (tabs && tabs.length) {
        this.tabList = tabs.map(tab => ({ ...tab }))
        this.updateSelected()
      }
      // 加载导航样式配置
      this.navStyle = app.globalData.navStyle || {}
    },

    updateSelected() {
      const app = getApp()
      if (!app) return
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      if (!currentPage) return
      const currentRoute = '/' + currentPage.route
      const specialId = app.globalData.specialId

      this.tabList.forEach(tab => {
        tab.selected = false
        const tabPath = tab.pagePath || ''
        // 去掉查询参数再比较
        const tabBasePath = tabPath.split('?')[0]
        const linkType = String(tab.linkType)

        if (linkType === '0') {
          // 系统页面：pagePath 匹配
          tab.selected = tabBasePath === currentRoute
        } else if (linkType === '1' || linkType === '2') {
          // 专题页/装修页：路径匹配 + specialId 匹配
          tab.selected = (tabBasePath === currentRoute) && (String(specialId) === String(tab.linkUrlId))
        }
      })
    },

    onTabTap(item, index) {
      const app = getApp()
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const currentRoute = '/' + currentPage.route

      // 专题页/装修页 Tab
      if (item.linkType === 1 || item.linkType === 2) {
        app.switchSpecialPage(item.linkUrlId)
        const tabPath = item.pagePath || ''
        if (currentRoute === tabPath) {
          uni.$emit('specialPageRefresh', item.linkUrlId)
          this.updateSelected()
          return
        }
      }

      // linkType=0（系统页面）：直接跳转 pagePath，不设置 specialId
      if (item.linkType === 0) {
        const targetPath = item.pagePath || '/pages/dechome/index'
        const basePath = targetPath.split('?')[0]
        if (this.isTabPage(targetPath)) {
          switchTab(basePath)
        } else {
          navigateTo(targetPath)
        }
        return
      }

      // linkType=1/2（专题页/装修页）：设置 specialId 后跳转
      const targetPath = item.pagePath || '/pages/dechome/index'
      const basePath = targetPath.split('?')[0]
      if (this.isTabPage(targetPath)) {
        switchTab(basePath)
      } else {
        navigateTo(targetPath)
      }
    },

    isTabPage(path) {
      const tabPages = [
        '/pages/dechome/index',
        '/pages/classify/index',
        '/pages/cart/index',
        '/pages/special/index',
        '/pages/mine/index'
      ]
      // 去掉查询参数再匹配（如 /pages/dechome/index?specialId=xxx）
      const basePath = path.split('?')[0]
      return tabPages.includes(basePath)
    },

    // 检测是否支持 backdrop-filter
    checkBackdropSupport() {
      try {
        const sysInfo = uni.getSystemInfoSync()
        if (!sysInfo) return true

        const platform = sysInfo.platform
        const version = sysInfo.version || ''

        // iOS 基本都支持
        if (platform === 'ios') return true

        // Android 微信 8.0+ 支持 backdrop-filter
        if (platform === 'android') {
          const majorVersion = parseInt(version.split('.')[0]) || 0
          return majorVersion >= 8
        }

        // 开发工具默认支持
        return true
      } catch (e) {
        console.warn('检测 backdrop-filter 支持失败', e)
        return true
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;

  // 悬浮模式
  &.tab-bar-float {
    bottom: 80rpx;
    left: 20rpx;
    right: 20rpx;

    .tab-bar-content {
      border-radius: 40rpx;
      box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.12);
      height: 90rpx;
      padding-bottom: 0;
    }

    .tab-bar-placeholder {
      display: none;
    }
  }
}

.tab-bar-placeholder {

  height: calc(100rpx + constant(safe-area-inset-bottom));
  height: calc(100rpx + env(safe-area-inset-bottom));

}

.debug-info {
  position: absolute;
  top: -40rpx;
  left: 0;
  font-size: 20rpx;
  color: #f00;
  background: #ff0;
  padding: 4rpx 8rpx;
  z-index: 9999;
  white-space: nowrap;
}

.tab-bar-content {
  display: flex;
  height: 100rpx;
  background-color: #ffffff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  box-sizing: content-box;
  transition: all 0.3s ease;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.tab-icon {
  width: 48rpx;
  height: 48rpx;
  margin-bottom: 4rpx;
}

.tab-text {
  font-size: 22rpx;
  color: #999;
}

.tab-text.active {
  color: #f2b974;
  font-weight: bold;
}
</style>
