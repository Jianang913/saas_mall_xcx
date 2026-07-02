<template>
  <view class="goods-list-page">
    <!-- 导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px', height: navBarHeight + 'px' }">
      <view class="nav-back" @click="goBack">
        <text class="cuIcon-back"></text>
      </view>
      <text class="nav-title">{{ catName || '商品列表' }}</text>
      <view class="nav-placeholder"></view>
    </view>
    <view :style="{ height: navBarHeight + 'px' }"></view>

    <!-- 商品列表 -->
    <view class="goods-scroll" @scrolltolower="loadMore">
      <view class="goods-grid">
        <view
          class="goods-item"
          v-for="item in goodsList"
          :key="item.goodsId"
          @click="goDetail(item)"
        >
          <image class="goods-image" :src="getImgUrl(item.headPic)" mode="aspectFill" />
          <view class="goods-info">
            <text class="goods-name">{{ item.goodsName }}</text>
            <view class="goods-price-row">
              <text class="goods-price">¥{{ item.shopPrice }}</text>
              <text class="goods-market-price" v-if="item.marketPrice">¥{{ item.marketPrice }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载状态 -->
      <uni-load-more v-if="goodsList.length || loading" :status="loading ? 'loading' : noMore ? 'noMore' : 'more'" />
      <uni-load-more v-if="!goodsList.length && !loading && hasLoaded" status="noData" />
    </view>
  </view>
</template>

<script>
import { listGoods } from '@/api/mall/goods'
import { resolveOssUrls } from '@/utils/oss'

export default {
  data() {
    return {
      catId: '',
      catName: '',
      goodsList: [],
      loading: false,
      noMore: false,
      hasLoaded: false,
      page: 1,
      pageSize: 20,
      statusBarHeight: 0,
      navBarHeight: 0,
      menuButtonHeight: 0,
      urlCache: new Map()
    }
  },
  onLoad(options) {
    // 获取状态栏高度和胶囊按钮位置
    const sysInfo = uni.getSystemInfoSync()
    this.statusBarHeight = sysInfo.statusBarHeight || 0

    // #ifdef MP-WEIXIN
    try {
      const menuButton = uni.getMenuButtonBoundingClientRect()
      this.menuButtonHeight = menuButton.height
      this.navBarHeight = menuButton.top + menuButton.height + (menuButton.top - this.statusBarHeight)
    } catch (e) {
      this.navBarHeight = 44
    }
    // #endif

    // #ifndef MP-WEIXIN
    this.navBarHeight = 44
    // #endif

    if (options.catId) {
      this.catId = options.catId
      this.catName = options.catName || ''
      this.loadGoods()
    }
  },
  methods: {
    async loadGoods() {
      if (this.loading) return
      this.loading = true

      try {
        const res = await listGoods({
          catId: this.catId,
          pageNum: this.page,
          pageSize: this.pageSize
        })

        if (res.code === 200) {
          const data = res.data || {}
          const list = data.rows || []
          if (this.page === 1) {
            this.goodsList = list
          } else {
            this.goodsList = [...this.goodsList, ...list]
          }
          this.noMore = list.length < this.pageSize
          this.hasLoaded = true
          // 解析商品图片
          this.resolveGoodsImages(list)
        }
      } catch (e) {
        console.error('加载商品失败', e)
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    loadMore() {
      if (this.noMore || this.loading) return
      this.page++
      this.loadGoods()
    },
    async resolveGoodsImages(list) {
      const picIds = list.map(item => item.headPic).filter(pic => pic && !pic.startsWith('http')).join(',')
      if (picIds) {
        const newCache = await resolveOssUrls(picIds)
        this.urlCache = new Map([...this.urlCache, ...newCache])
      }
    },
    getImgUrl(pic) {
      if (!pic) return ''
      if (pic.startsWith('http')) return pic
      return this.urlCache.get(pic) || ''
    },
    goDetail(item) {
      uni.navigateTo({ url: '/pages/goods/detail/index?id=' + item.goodsId })
    },
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.goods-list-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
  background-color: #fff;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.nav-back {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: #333;
}

.nav-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.nav-placeholder {
  width: 60rpx;
}

.goods-scroll {
  width: 100%;
  height: calc(100vh - 88rpx);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.goods-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 16rpx;
}

.goods-item {
  width: calc(50% - 12rpx);
  margin: 6rpx;
  background-color: #fff;
  border-radius: 12rpx;
  overflow: hidden;
}

.goods-image {
  width: 100%;
  height: 340rpx;
}

.goods-info {
  padding: 16rpx;
}

.goods-name {
  font-size: 26rpx;
  color: #333;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  line-height: 1.4;
  height: 72rpx;
}

.goods-price-row {
  display: flex;
  align-items: baseline;
  margin-top: 12rpx;
}

.goods-price {
  font-size: 32rpx;
  color: #e4393c;
  font-weight: bold;
}

.goods-market-price {
  font-size: 22rpx;
  color: #999;
  text-decoration: line-through;
  margin-left: 12rpx;
}
</style>
