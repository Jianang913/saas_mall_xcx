<template>
  <view class="diamond-nav" v-if="navList.length">
    <view
      class="diamond-item"
      v-for="(item, index) in navList"
      :key="index"
      @click="onClick(item)"
    >
      <image class="diamond-icon" :src="formatImage(item.pic || item.icon)" mode="aspectFit" />
      <text class="diamond-name">{{ item.title || item.name }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'DiamondNav',
  props: {
    data: { type: Object, default: () => ({}) }
  },
  computed: {
    navList() {
      if (this.data.re && this.data.re.length) return this.data.re
      const content = this.data.pageContent
      if (Array.isArray(content)) return content
      if (content && content.list) return content.list
      return []
    }
  },
  methods: {
    formatImage(pic) {
      if (!pic) return ''
      if (pic.startsWith('http')) return pic
      const app = getApp()
      return (app.globalData.shopImg || '') + pic
    },
    onClick(item) {
      if (item.content) {
        this.$tab.navigateTo(item.content)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.diamond-nav {
  display: flex;
  flex-wrap: wrap;
  padding: 20rpx 10rpx;
  background-color: #fff;
  margin-bottom: 20rpx;
}
.diamond-item {
  width: 20%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 0;
}
.diamond-icon { width: 88rpx; height: 88rpx; margin-bottom: 12rpx; }
.diamond-name { font-size: 24rpx; color: #333; }
</style>
