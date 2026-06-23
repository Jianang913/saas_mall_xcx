<template>
  <view class="tab-bar" v-if="tabList.length">
    <view class="tab-bar-placeholder"></view>
    <view class="tab-bar-content">
      <view
        class="tab-item"
        v-for="(item, index) in tabList"
        :key="index"
        @click="onTabTap(item, index)"
      >
        <image
          class="tab-icon"
          :src="item.selected ? item.iconOneUrl : item.iconTwoUrl"
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
export default {
  name: 'TabBar',
  data() {
    return {
      tabList: []
    }
  },
  created() {
    this.initTabBar()
    // 监听专题页切换事件，更新选中态
    this._onRefresh = () => this.updateSelected()
    uni.$on('specialPageRefresh', this._onRefresh)
  },
  beforeUnmount() {
    if (this._retryTimer) clearTimeout(this._retryTimer)
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
        if (tab.linkType === 0) {
          // 系统页面：pagePath 匹配
          tab.selected = tabPath === currentRoute
        } else if (tab.linkType === 1 || tab.linkType === 2) {
          // 专题页/装修页：路径匹配 + specialId 匹配
          tab.selected = (tabPath === currentRoute) && (specialId == tab.linkUrlId)
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

      // 跳转
      const targetPath = item.pagePath || '/pages/dechome/index'
      const basePath = targetPath.split('?')[0]
      if (this.isTabPage(targetPath)) {
        // switchTab 不支持 query 参数，装修页通过 globalData.specialId 传递
        uni.switchTab({ url: basePath })
      } else {
        uni.navigateTo({ url: targetPath })
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
}

.tab-bar-placeholder {
  height: 100rpx;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-bar-content {
  display: flex;
  height: 100rpx;
  background-color: #ffffff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
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
