<template>
  <view class="goods-group-module">
    <!-- 分类 Tab -->
    <scroll-view scroll-x class="tab-bar" v-if="groupList.length > 0">
      <view
        v-for="(item, i) in groupList" :key="i"
        class="tab-item" :class="{ active: currentIndex === i }"
        @click="switchTab(i)"
      >{{ item.title || '分组' + (i + 1) }}</view>
    </scroll-view>
    <!-- 商品列表 -->
    <view class="goods-list">
      <view v-for="(item, i) in currentGoods" :key="i" class="goods-item" @click="goDetail(item)">
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
    return { currentIndex: 0, urlCache: new Map() }
  },
  computed: {
    groupList() {
      return this.data.re || []
    },
    currentGoods() {
      const group = this.groupList[this.currentIndex]
      return group?.goodsDtos || group?.goodsList || []
    }
  },
  watch: {
    groupList: {
      handler(list) { this.resolveImages(list) },
      immediate: true
    }
  },
  methods: {
    async resolveImages(list) {
      const allGoods = list.flatMap(g => g.goodsDtos || g.goodsList || [])
      const picIds = allGoods
        .map(item => item.goodsImage || item.outPic)
        .filter(pic => pic && !pic.startsWith('http'))
        .join(',')
      if (picIds) this.urlCache = await resolveOssUrls(picIds)
    },
    switchTab(i) {
      this.currentIndex = i
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
.goods-group-module { background: #fff;  }
.tab-bar { white-space: nowrap; border-bottom: 1rpx solid #f0f0f0; padding: 0 12rpx; }
.tab-item {
  display: inline-block; padding: 16rpx 24rpx; font-size: 26rpx; color: #666;
  border-bottom: 4rpx solid transparent;
  &.active { color: #333; font-weight: 600; border-bottom-color: #409eff; }
}
.goods-list { display: flex; flex-wrap: wrap; padding: 12rpx; gap: 12rpx; }
.goods-item { width: calc(50% - 6rpx); border: 1rpx solid #f0f0f0; border-radius: 12rpx; overflow: hidden; }
.goods-img { width: 100%; height: 320rpx; }
.goods-info { padding: 12rpx; }
.goods-name { font-size: 24rpx; color: #333; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.goods-price-row { display: flex; align-items: baseline; margin-top: 8rpx; }
.goods-price { font-size: 28rpx; color: #e4393c; font-weight: bold; }
.market-price { font-size: 22rpx; color: #999; text-decoration: line-through; margin-left: 8rpx; }
</style>
