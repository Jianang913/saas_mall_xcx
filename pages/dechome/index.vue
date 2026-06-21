<template>
  <view class="dechome">
    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="{ opacity: navOpacity }">
      <view class="nav-content">
        <image class="nav-logo" src="/static/logo.png" mode="aspectFit"></image>
        <view class="nav-search" @click="goSearch">
          <text class="cuIcon-search"></text>
          <text class="search-placeholder">搜索商品</text>
        </view>
      </view>
    </view>
    <view class="nav-placeholder"></view>

    <!-- 装修页面模块 -->
    <scroll-view scroll-y class="page-scroll" @scroll="onScroll" @scrolltolower="onLoadMore">
      <!-- 轮播图模块 -->
      <swiper-module v-if="swiperList.length" :list="swiperList" />

      <!-- 金刚位模块 -->
      <diamond-nav v-if="diamondList.length" :list="diamondList" />

      <!-- 动态模块渲染 -->
      <block v-for="(module, index) in pageModules" :key="index">
        <!-- 图片模块 -->
        <pic-module v-if="module.moduleId == 4" :data="module" />

        <!-- 商品模块 -->
        <shop-module v-if="module.moduleId == 5" :data="module" @click="goGoodsDetail" />

        <!-- 分割线 -->
        <line-module v-if="module.moduleId == 7" :data="module" />

        <!-- 标题模块 -->
        <title-module v-if="module.moduleId == 8" :data="module" />

        <!-- 公告模块 -->
        <notice-module v-if="module.moduleId == 11" :data="module" />
      </block>

      <!-- 底部提示 -->
      <view class="bottom-tip" v-if="pageModules.length">
        <text>— 已经到底了 —</text>
      </view>
    </scroll-view>
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
import { getAdornPageData, listBanner, listDiamond } from '@/api/mall/home'

export default {
  components: {
    SwiperModule,
    DiamondNav,
    PicModule,
    ShopModule,
    LineModule,
    TitleModule,
    NoticeModule
  },
  data() {
    return {
      navOpacity: 0,
      swiperList: [],
      diamondList: [],
      pageModules: [],
      pageId: ''
    }
  },
  onLoad(options) {
    if (options.pageId) {
      this.pageId = options.pageId
    }
    this.loadData()
  },
  onPullDownRefresh() {
    this.loadData().then(() => {
      uni.stopPullDownRefresh()
    })
  },
  methods: {
    async loadData() {
      try {
        // 并行加载轮播图、金刚位、装修页面数据
        const [bannerRes, diamondRes, pageRes] = await Promise.all([
          listBanner({ pageSize: 10 }).catch(() => ({ rows: [] })),
          listDiamond({ pageSize: 10 }).catch(() => ({ rows: [] })),
          this.pageId ? getAdornPageData({ pageId: this.pageId }).catch(() => null) : Promise.resolve(null)
        ])

        // 轮播图
        if (bannerRes.rows) {
          this.swiperList = bannerRes.rows.map(item => ({
            id: item.bannerId,
            image: item.imageUrl,
            link: item.linkUrl
          }))
        }

        // 金刚位
        if (diamondRes.rows) {
          this.diamondList = diamondRes.rows.map(item => ({
            id: item.diamondId,
            icon: item.iconUrl,
            name: item.name,
            link: item.linkUrl
          }))
        }

        // 装修页面模块
        if (pageRes && pageRes.data && pageRes.data.moduleList) {
          this.pageModules = pageRes.data.moduleList
        }
      } catch (e) {
        console.error('加载首页数据失败', e)
      }
    },
    onScroll(e) {
      const scrollTop = e.detail.scrollTop
      // 导航栏透明度：0-100rpx 范围内渐变
      this.navOpacity = Math.min(scrollTop / 100, 1)
    },
    onPullDownRefresh() {
      this.loadData().then(() => {
        uni.stopPullDownRefresh()
      })
    },
    onLoadMore() {
      // 首页暂无分页加载
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
.dechome {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background-color: #fff;
  opacity: 0;
}

.nav-content {
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  height: 88rpx;
  padding-top: var(--status-bar-height);
}

.nav-logo {
  width: 60rpx;
  height: 60rpx;
  margin-right: 20rpx;
}

.nav-search {
  flex: 1;
  display: flex;
  align-items: center;
  height: 60rpx;
  background-color: #f5f5f5;
  border-radius: 30rpx;
  padding: 0 24rpx;
}

.search-placeholder {
  margin-left: 12rpx;
  font-size: 26rpx;
  color: #999;
}

.nav-placeholder {
  height: calc(88rpx + var(--status-bar-height));
}

.page-scroll {
  height: calc(100vh - 88rpx - var(--status-bar-height));
}

.bottom-tip {
  text-align: center;
  padding: 30rpx 0;
  font-size: 24rpx;
  color: #999;
}
</style>
