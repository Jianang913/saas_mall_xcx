<template>
  <view class="notice-module" v-if="data.content">
    <view class="notice-icon">
      <text class="cuIcon-notice"></text>
    </view>
    <view class="notice-content">
      <text class="notice-text">{{ data.content }}</text>
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
  }
}
</script>

<style lang="scss" scoped>
.notice-module {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background-color: #fff8f0;
  margin-bottom: 20rpx;
}

.notice-icon {
  margin-right: 12rpx;
  color: #f2b974;
  font-size: 32rpx;
}

.notice-content {
  flex: 1;
  overflow: hidden;
}

.notice-text {
  font-size: 26rpx;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
