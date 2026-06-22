<template>
  <view class="brand-module" v-if="list.length > 0">
    <view class="brand-list">
      <view v-for="(item, i) in list" :key="i" class="brand-item" @click="onClick(item)">
        <image class="brand-logo" :src="formatImage(item.picture)" mode="aspectFill" />
        <text class="brand-name">{{ item.title || '品牌' }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'BrandModule',
  props: {
    data: { type: Object, default: () => ({}) }
  },
  computed: {
    list() { return this.data.re || [] }
  },
  methods: {
    formatImage(pic) {
      if (!pic) return ''
      if (pic.startsWith('http')) return pic
      const app = getApp()
      return (app.globalData.shopImg || '') + '/resource/oss/download/' + pic
    },
    onClick(item) {
      // 品牌点击跳转
      if (item.linkType && item.content) {
        uni.navigateTo({ url: item.content })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.brand-module { background: #fff; padding: 20rpx;  }
.brand-list { display: flex; flex-wrap: wrap; gap: 20rpx; }
.brand-item {
  display: flex; flex-direction: column; align-items: center; gap: 10rpx;
  width: calc(25% - 15rpx);
}
.brand-logo { width: 120rpx; height: 120rpx; border-radius: 12rpx; }
.brand-name { font-size: 22rpx; color: #333; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 140rpx; }
</style>
