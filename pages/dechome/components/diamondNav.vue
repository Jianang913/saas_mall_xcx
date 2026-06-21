<template>
  <view class="diamond-nav">
    <view
      class="diamond-item"
      v-for="item in list"
      :key="item.id"
      @click="onClick(item)"
    >
      <image class="diamond-icon" :src="item.icon" mode="aspectFit" />
      <text class="diamond-name">{{ item.name }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'DiamondNav',
  props: {
    list: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    onClick(item) {
      if (item.link) {
        this.$tab.navigateTo(item.link)
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

.diamond-icon {
  width: 88rpx;
  height: 88rpx;
  margin-bottom: 12rpx;
}

.diamond-name {
  font-size: 24rpx;
  color: #333;
}
</style>
