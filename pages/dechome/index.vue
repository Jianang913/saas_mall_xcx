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
      <block v-for="(module, index) in moduleList" :key="index">
        <!-- moduleId=1: 搜索入口 -->
        <search-module v-if="module.moduleId == 1" :data="module" />
        <!-- moduleId=2: 轮播图 -->
        <swiper-module v-if="module.moduleId == 2" :data="module" />
        <!-- moduleId=3: 金刚位 -->
        <diamond-nav v-if="module.moduleId == 3" :data="module" />
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
      </block>

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
import { getAdornPageData } from '@/api/mall/home'

export default {
  components: {
    SwiperModule, DiamondNav, PicModule, ShopModule, LineModule, TitleModule, NoticeModule,
    SearchModule, VideoModule, GoodsGroupModule, CountdownModule, ContactModule, BrandModule, FullScreenModule
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
    // #ifdef MP-WEIXIN
    uni.hideTabBar({ animation: false })
    // #endif
    await this.loadPageData()
  },
  methods: {
    async loadPageData() {
      const app = getApp()
      if (!app) return
      this.loading = true

      try {
        await app.waitForNavigation()
        const pageId = app.globalData.specialId
        if (!pageId) {
          console.warn('未获取到首页装修页ID')
          return
        }

        const res = await getAdornPageData({ pageId })
        if (res.code === 200 && res.data) {
          const { jsonArray, adornPageVo } = res.data
          if (jsonArray && jsonArray.length) {
            this.moduleList = jsonArray.map(item => {
              const parsed = { ...item }
              try {
                if (typeof item.style === 'string') parsed.style = JSON.parse(item.style)
              } catch (e) {}
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
      this.$tab.navigateTo('/pages/search/index')
    },

    goGoodsDetail(goodsId) {
      this.$tab.navigateTo('/pages/goods/detail/index?id=' + goodsId)
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
</style>
