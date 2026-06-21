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
          :src="item.selected ? item.iconOne : item.iconTwo"
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
    // 监听 globalData 变化
    this._timer = setInterval(() => {
      const app = getApp()
      if (app && app.globalData.tabBar.list.length) {
        this.updateSelected()
      }
    }, 300)
  },
  beforeDestroy() {
    if (this._timer) clearInterval(this._timer)
  },
  methods: {
    async initTabBar() {
      const app = getApp()
      if (!app) return

      // 等待导航数据就绪
      const tabs = await app.waitForNavigation()
      this.tabList = tabs.map(tab => ({ ...tab }))
      this.updateSelected()
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
        if (tab.linkType === 0) {
          // 普通页面：contentName 匹配
          tab.selected = tab.contentName === currentRoute
        } else if (tab.linkType === 1 || tab.linkType === 2) {
          // 专题页：路径匹配 + specialId 匹配
          tab.selected = (tab.contentName === currentRoute) && (specialId == tab.linkUrlId)
        }
      })
    },

    onTabTap(item, index) {
      const app = getApp()
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const currentRoute = '/' + currentPage.route

      // 专题页 Tab
      if (item.linkType === 1 || item.linkType === 2) {
        app.switchSpecialPage(item.linkUrlId)
        // 如果已经在专题页，触发刷新事件
        if (currentRoute === item.contentName || currentRoute === '/pages/special/index') {
          uni.$emit('specialPageRefresh', item.linkUrlId)
          this.updateSelected()
          return
        }
      }

      // 跳转
      const targetPath = item.contentName || this.getDefaultPath(item.navigationName)
      if (this.isTabPage(targetPath)) {
        uni.switchTab({ url: targetPath })
      } else {
        uni.navigateTo({ url: targetPath })
      }
    },

    getDefaultPath(name) {
      const map = {
        '首页': '/pages/dechome/index',
        '分类': '/pages/classify/index',
        '购物车': '/pages/cart/index',
        '专题': '/pages/special/index',
        '我的': '/pages/mine/index'
      }
      return map[name] || '/pages/dechome/index'
    },

    isTabPage(path) {
      const tabPages = [
        '/pages/dechome/index',
        '/pages/classify/index',
        '/pages/cart/index',
        '/pages/special/index',
        '/pages/mine/index'
      ]
      return tabPages.includes(path)
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
