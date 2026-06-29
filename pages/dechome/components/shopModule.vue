<template>
  <view class="shop-module" v-if="goodsList.length">
    <view class="module-header" v-if="data.title">
      <text class="module-title">{{ data.title }}</text>
    </view>
    <view class="goods-list">
      <view
        class="goods-item"
        v-for="(goods, index) in goodsList"
        :key="index"
        @click="$emit('click', goods.goodsId)"
      >
        <image class="goods-image" :src="formatImage(goods.goodsImage || goods.outPic)" mode="aspectFill" />
        <view class="goods-info">
          <text class="goods-name">{{ goods.goodsName }}</text>
          <view class="goods-price-row">
            <text class="goods-price">¥{{ formatPrice(goods.shopPrice) }}</text>
            <text class="goods-market-price" v-if="goods.marketPrice">¥{{ formatPrice(goods.marketPrice) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { resolveOssUrls } from '@/utils/oss'

export default {
  name: 'ShopModule',
  props: {
    data: { type: Object, default: () => ({}) }
  },
  data() {
    return { urlCache: new Map() }
  },
  computed: {
    goodsList() {
      if (this.data.re && this.data.re.length) return this.data.re
      const content = this.data.pageContent
      if (Array.isArray(content)) return content
      if (content && content.list) return content.list
      return []
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
        .map(g => g.goodsImage || g.outPic)
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
    }
  }
}
</script>

<style lang="scss" scoped>
.shop-module { background-color: #fff;  padding: 20rpx; }
.module-header {  }
.module-title { font-size: 32rpx; font-weight: bold; color: #333; }
.goods-list { display: flex; flex-wrap: wrap; margin: 0 -10rpx; }
.goods-item { width: 50%; padding: 0 10rpx;  box-sizing: border-box; }
.goods-image { width: 100%; height: 320rpx; border-radius: 12rpx; }
.goods-info { padding: 12rpx 0; }
.goods-name { font-size: 26rpx; color: #333; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4; }
.goods-price-row { display: flex; align-items: baseline; margin-top: 8rpx; }
.goods-price { font-size: 32rpx; color: #e4393c; font-weight: bold; }
.goods-market-price { font-size: 24rpx; color: #999; text-decoration: line-through; margin-left: 12rpx; }
</style>
