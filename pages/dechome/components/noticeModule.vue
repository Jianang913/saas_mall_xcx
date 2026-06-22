<template>
  <view class="notice-module" v-if="noticeList.length" :style="moduleStyle">
    <view class="notice-icon">
      <text class="cuIcon-notice"></text>
    </view>
    <view class="notice-content">
      <swiper
        class="notice-swiper"
        vertical
        circular
        autoplay
        :interval="3000"
        :duration="500"
        :display-multiple-items="1"
      >
        <swiper-item v-for="(item, index) in noticeList" :key="index">
          <text class="notice-text" :style="{ color: styleData.wordColor || '#333' }">
            {{ item.title }}
          </text>
        </swiper-item>
      </swiper>
    </view>
  </view>
</template>

<script>
export default {
  name: 'NoticeModule',
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    noticeList() {
      return this.data.re || []
    },
    styleData() {
      if (typeof this.data.style === 'object') return this.data.style || {}
      try { return JSON.parse(this.data.style || '{}') } catch (e) { return {} }
    },
    moduleStyle() {
      return {
        background: this.styleData.bkColor || '#FFF8E1'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.notice-module {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background-color: #FFF8E1;
  
}

.notice-icon {
  margin-right: 12rpx;
  color: #f2b974;
  font-size: 32rpx;
  flex-shrink: 0;
}

.notice-content {
  flex: 1;
  overflow: hidden;
  height: 40rpx;
}

.notice-swiper {
  height: 40rpx;
}

.notice-text {
  font-size: 26rpx;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 40rpx;
}
</style>
