<template>
  <view class="goods-group-module" :style="containerStyle">
    <!-- Tab -->
    <scroll-view scroll-x class="tab-bar" v-if="goodsList.length > 0">
      <view class="tab-item active" :style="activeTabStyle">
        <text class="tab-title" :style="'color:' + activeColor">{{ groupTitle }}</text>
        <text v-if="showSubTitle === '2' && groupSubTitle" class="tab-sub">{{ groupSubTitle }}</text>
      </view>
    </scroll-view>
    <!-- 商品列表 -->
    <view class="goods-list">
      <view v-for="(item, i) in goodsList" :key="i" class="goods-item" @click="goDetail(item)">
        <image class="goods-img" :src="formatImage(item.goodsImage || item.outPic)" mode="aspectFill" />
        <view class="goods-info">
          <text class="goods-name">{{ item.goodsName }}</text>
          <view class="goods-price-row">
            <text class="goods-price">¥{{ formatPrice(item.shopPrice) }}</text>
            <text class="market-price" v-if="item.marketPrice">¥{{ formatPrice(item.marketPrice) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { resolveOssUrls } from '@/utils/oss'

export default {
  name: 'GoodsGroupModule',
  props: {
    data: { type: Object, default: () => ({}) }
  },
  data() {
    return { urlCache: new Map() }
  },
  computed: {
    styleData() {
      const style = this.data.style || {}
      if (typeof style === 'string') { try { return JSON.parse(style) } catch { return {} } }
      return style
    },
    // 后端 loadGoodsData 返回扁平的商品列表，放在 re 字段
    goodsList() {
      return this.data.re || []
    },
    groupTitle() {
      const list = this.data.re || []
      if (list.length && list[0].title) return list[0].title
      return '商品分组'
    },
    groupSubTitle() {
      const list = this.data.re || []
      if (list.length && list[0].subTitle) return list[0].subTitle
      return ''
    },
    showSubTitle() {
      return this.data.show || '1'
    },
    activeColor() {
      return this.styleData.wordColor || '#409eff'
    },
    bgColor() {
      return this.styleData.bkColor || '#ffffff'
    },
    containerStyle() {
      return 'background-color:' + this.bgColor + ';'
    },
    activeTabStyle() {
      const tabStyle = this.styleData.pic || '1'
      if (tabStyle === '2') return 'background:' + this.activeColor + ';color:#fff;border-radius:24rpx;'
      return ''
    }
  },
  watch: {
    goodsList: {
      handler(list) { this.resolveImages(list) },
      immediate: true
    }
  },
  methods: {
    async resolveImages(list) {
      const picIds = list
        .map(item => item.goodsImage || item.outPic)
        .filter(pic => pic && !pic.startsWith('http'))
        .join(',')
      if (picIds) this.urlCache = await resolveOssUrls(picIds)
    },
    formatImage(pic) {
      if (!pic) return ''
      if (pic.startsWith('http')) return pic
      return this.urlCache.get(pic) || ''
    },
    formatPrice(price) {
      if (!price) return '0.00'
      return (price / 100).toFixed(2)
    },
    goDetail(item) {
      uni.navigateTo({ url: '/pages/goods/detail/index?id=' + (item.goodsId || item.id) })
    }
  }
}
</script>

<style lang="scss" scoped>
.goods-group-module { }
.tab-bar { white-space: nowrap; border-bottom: 1rpx solid #f0f0f0; padding: 0 12rpx; }
.tab-item {
  display: inline-block; padding: 16rpx 24rpx; text-align: center;
  border-bottom: 4rpx solid transparent;
  &.active { border-bottom-color: #409eff; }
}
.tab-title { font-size: 30rpx; color: #1a1a2e; font-weight: 700; letter-spacing: 2rpx; }
.tab-sub { font-size: 20rpx; color: #8c939d; margin-top: 4rpx; display: block; }
.goods-list { display: flex; flex-wrap: wrap; padding: 12rpx; gap: 12rpx; }
.goods-item { width: calc(50% - 6rpx); border: 1rpx solid #f0f0f0; border-radius: 12rpx; overflow: hidden; }
.goods-img { width: 100%; height: 320rpx; }
.goods-info { padding: 12rpx; }
.goods-name { font-size: 24rpx; color: #333; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.goods-price-row { display: flex; align-items: baseline; margin-top: 8rpx; }
.goods-price { font-size: 28rpx; color: #e4393c; font-weight: bold; }
.market-price { font-size: 22rpx; color: #999; text-decoration: line-through; margin-left: 8rpx; }
</style>
