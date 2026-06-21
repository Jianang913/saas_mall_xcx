<template>
  <view class="diamond-nav" :class="layoutClass" v-if="navList.length">
    <view
      class="diamond-item"
      v-for="(item, index) in navList"
      :key="index"
      @click="onClick(item)"
    >
      <image class="diamond-icon" :src="formatImage(item.picture || item.icon)" mode="aspectFit" />
      <text class="diamond-name">{{ item.title || item.name }}</text>
    </view>
  </view>
</template>

<script>
import { handleLink } from '@/utils/linkType'

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
    },
    // show='1' 单行滑动，show='2' 双行排列（默认）
    layoutClass() {
      return this.data.show === '1' ? 'layout-scroll' : 'layout-grid'
    }
  },
  methods: {
    formatImage(pic) {
      if (!pic) return ''
      if (pic.startsWith('http')) return pic
      const app = getApp()
      return (app.globalData.shopImg || '') + '/resource/oss/download/' + pic
    },
    onClick(item) {
      handleLink(item.linkType, item.content, item.contentName)
    }
  }
}
</script>

<style lang="scss" scoped>
.diamond-nav {
  background-color: #fff;
  margin-bottom: 20rpx;
}

/* 单行滑动 */
.layout-scroll {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding: 20rpx 10rpx;

  .diamond-item {
    flex-shrink: 0;
    width: 20%;
  }
}

/* 双行排列：2列，每行4个 */
.layout-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 20rpx 10rpx;

  .diamond-item {
    width: 25%;
  }
}

.diamond-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 0;
}

.diamond-icon { width: 88rpx; height: 88rpx; margin-bottom: 12rpx; }
.diamond-name { font-size: 24rpx; color: #333; }
</style>
