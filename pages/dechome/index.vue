<template>
  <view class="dechome">
    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="{ opacity: navOpacity, paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <image class="nav-logo" src="/static/logo.png" mode="aspectFit"></image>
        <view class="nav-search" @click="goSearch">
          <text class="cuIcon-search"></text>
          <text class="search-placeholder">搜索商品</text>
        </view>
      </view>
    </view>
    <view :style="{ height: (statusBarHeight + 44) + 'px' }"></view>

    <!-- 装修页面模块 -->
    <scroll-view scroll-y class="page-scroll" @scroll="onScroll">
      <!-- 加载骨架屏 -->
      <view v-if="loading" class="skeleton-wrap">
        <view class="skeleton-banner"></view>
        <view class="skeleton-nav">
          <view v-for="i in 5" :key="i" class="skeleton-icon"></view>
        </view>
        <view class="skeleton-goods">
          <view v-for="i in 4" :key="i" class="skeleton-card"></view>
        </view>
      </view>

      <view v-if="!loading && moduleList.length" class="page-content">
        <block v-for="(module, index) in moduleList" :key="module.id || index">
        <view class="module-anim" :style="{ animationDelay: Math.min(index * 0.05, 0.3) + 's' }">
          <!-- moduleId=1: 搜索入口 -->
          <search-module v-if="module.moduleId == 1" :data="module" />
          <!-- moduleId=2: 轮播图 -->
          <swiper-module v-if="module.moduleId == 2" :data="module" />
          <!-- moduleId=3: 金刚位 -->
          <diamond-nav v-if="module.moduleId == 3" :data="module" :merge-top="isSameAsPrev(module, index)" :merge-bottom="isSameAsNext(module, index)" />
          <!-- moduleId=4: 图片模块 -->
          <pic-module v-if="module.moduleId == 4" :data="module" />
          <!-- moduleId=5: 商品模块 -->
          <shop-module v-if="module.moduleId == 5" :data="module" @click="goGoodsDetail" />
          <!-- moduleId=6: 视频模块 -->
          <video-module v-if="module.moduleId == 6" :data="module" />
          <!-- moduleId=7: 分割线 -->
          <line-module v-if="module.moduleId == 7" :data="module" />
          <!-- moduleId=8: 标题模块 -->
          <title-module v-if="module.moduleId == 8" :data="module" />
          <!-- moduleId=9: 商品分组 -->
          <goods-group-module v-if="module.moduleId == 9" :data="module" />
          <!-- moduleId=11: 公告 -->
          <notice-module v-if="module.moduleId == 11" :data="module" />
          <!-- moduleId=12: 倒计时 -->
          <countdown-module v-if="module.moduleId == 12" :data="module" />
          <!-- moduleId=19: 联系我们 -->
          <contact-module v-if="module.moduleId == 19" :data="module" />
          <!-- moduleId=20: 品牌展示 -->
          <brand-module v-if="module.moduleId == 20" :data="module" />
          <!-- moduleId=21: 大屏轮播 -->
          <full-screen-module v-if="module.moduleId == 21" :data="module" />
          <!-- moduleId=22: 名片模块 -->
          <card-module v-if="module.moduleId == 22" :data="module" />
        </view>
      </block>
      </view>

      <uni-load-more v-if="!loading && !moduleList.length" status="noData" />
      <view class="bottom-tip" v-if="moduleList.length">
        <text>— 已经到底了 —</text>
      </view>
    </scroll-view>

    <tab-bar />
  </view>
</template>

<script>
import SwiperModule from './components/swiperModule.vue'
import DiamondNav from './components/diamondNav.vue'
import PicModule from './components/picModule.vue'
import ShopModule from './components/shopModule.vue'
import LineModule from './components/lineModule.vue'
import TitleModule from './components/titleModule.vue'
import NoticeModule from './components/noticeModule.vue'
import SearchModule from './components/searchModule.vue'
import VideoModule from './components/videoModule.vue'
import GoodsGroupModule from './components/goodsGroupModule.vue'
import CountdownModule from './components/countdownModule.vue'
import ContactModule from './components/contactModule.vue'
import BrandModule from './components/brandModule.vue'
import FullScreenModule from './components/fullScreenModule.vue'
import CardModule from './components/cardModule.vue'
import { getAdornPageData } from '@/api/mall/home'
import { navigateTo, switchTab } from '@/utils/navigate'

export default {
  components: {
    SwiperModule, DiamondNav, PicModule, ShopModule, LineModule, TitleModule, NoticeModule,
    SearchModule, VideoModule, GoodsGroupModule, CountdownModule, ContactModule, BrandModule, FullScreenModule, CardModule
  },
  data() {
    return {
      navOpacity: 0,
      statusBarHeight: 0,
      moduleList: [],
      loading: false
    }
  },
  onLoad() {
    const app = getApp()
    this.statusBarHeight = app.globalData.statusBarHeight || 0
  },
  async onShow() {
    await this.loadPageData()
  },
  methods: {
    async loadPageData() {
      const app = getApp()
      if (!app) return
      this.loading = true

      try {
        await app.waitForNavigation()

        // 等待 specialId 就绪（最多 3 秒）
        let pageId = app.globalData.specialId
        if (!pageId) {
          for (let i = 0; i < 30; i++) {
            await new Promise(r => setTimeout(r, 100))
            pageId = app.globalData.specialId
            if (pageId) break
          }
        }

        if (!pageId) {
          console.warn('未获取到首页装修页ID，加载默认数据')
          this.moduleList = []
          this.loading = false
          return
        }

        const res = await getAdornPageData({ pageId })
        if (res.code === 200 && res.data) {
          const { jsonArray, adornPageVo } = res.data
          if (jsonArray && jsonArray.length) {
            this.moduleList = jsonArray.map(item => {
              const parsed = { ...item }
              if (typeof item.style === 'string') {
                try {
                  parsed.style = JSON.parse(item.style)
                } catch (e) {
                  console.warn('模块样式JSON解析失败:', item.style)
                  parsed.style = {}
                }
              }
              return parsed
            })
          }
        }
      } catch (e) {
        console.error('加载首页装修数据失败', e)
      } finally {
        this.loading = false
      }
    },

    onScroll(e) {
      this.navOpacity = Math.min(e.detail.scrollTop / 100, 1)
    },

    goSearch() {
      navigateTo('/pages/search/index')
    },

    goGoodsDetail(goodsId) {
      navigateTo('/pages/goods/detail/index?id=' + goodsId)
    },

    isSameAsPrev(module, index) {
      const prevModule = index > 0 ? this.moduleList[index - 1] : null
      return prevModule && prevModule.moduleId === module.moduleId
    },

    isSameAsNext(module, index) {
      const nextModule = index < this.moduleList.length - 1 ? this.moduleList[index + 1] : null
      return nextModule && nextModule.moduleId === module.moduleId
    }
  }
}
</script>

<style lang="scss" scoped>
.dechome { min-height: 100vh; background-color: #f5f5f5; }
.nav-bar { position: fixed; top: 0; left: 0; right: 0; z-index: 999; background-color: #fff; }
.nav-content { display: flex; align-items: center; padding: 0 24rpx; height: 44px; }
.nav-logo { width: 60rpx; height: 60rpx; margin-right: 20rpx; }
.nav-search { flex: 1; display: flex; align-items: center; height: 60rpx; background-color: #f5f5f5; border-radius: 30rpx; padding: 0 24rpx; }
.search-placeholder { margin-left: 12rpx; font-size: 26rpx; color: #999; }
.page-scroll { height: calc(100vh - 44px - var(--status-bar-height) - 100rpx); }
.bottom-tip { text-align: center; padding: 30rpx 0 130rpx; font-size: 24rpx; color: #999; }

/* 页面内容淡入 */
.page-content {
  animation: pageIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes pageIn {
  from { opacity: 0; transform: translateY(8rpx); }
  to { opacity: 1; transform: translateY(0); }
}

/* 模块淡入动画 */
.module-anim {
  animation: moduleIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

@keyframes moduleIn {
  from {
    opacity: 0;
    transform: translateY(16rpx) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 骨架屏 - 渐变呼吸效果 */
.skeleton-wrap {
  padding: 20rpx;
}

.skeleton-banner {
  width: 100%;
  height: 300rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  animation: breathe 1.8s ease-in-out infinite;
}

.skeleton-nav {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20rpx;
}

.skeleton-icon {
  width: 80rpx;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 50%;
  animation: breathe 1.8s ease-in-out infinite;
}

.skeleton-goods {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.skeleton-card {
  width: calc(50% - 8rpx);
  height: 400rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  animation: breathe 1.8s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}
</style>
