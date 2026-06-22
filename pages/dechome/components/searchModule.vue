<template>
  <view class="search-module" :class="'style-' + styleType" @click="goSearch">
    <view class="search-bar">
      <text class="cuIcon-search"></text>
      <text class="search-text">搜索商品</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'SearchModule',
  props: {
    data: { type: Object, default: () => ({}) }
  },
  computed: {
    styleData() {
      const style = this.data.style || {}
      if (typeof style === 'string') { try { return JSON.parse(style) } catch (e) { return {} } }
      return style
    },
    styleType() {
      return this.styleData.pic || '1'
    }
  },
  methods: {
    goSearch() {
      uni.navigateTo({ url: '/pages/search/index' })
    }
  }
}
</script>

<style lang="scss" scoped>
.search-module { padding: 8rpx 24rpx; background: #fff; }
.search-bar {
  display: flex; align-items: center; gap: 12rpx;
  height: 64rpx; padding: 0 24rpx; border-radius: 32rpx;
  font-size: 26rpx; color: #999; background: #f5f5f5;
}
.style-3 .search-bar { border: 1rpx solid #e8e8e8; }
</style>
