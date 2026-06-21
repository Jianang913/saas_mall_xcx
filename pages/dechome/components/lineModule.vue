<template>
  <view class="line-module">
    <view class="line" :style="lineStyle"></view>
  </view>
</template>

<script>
export default {
  name: 'LineModule',
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    lineStyle() {
      return {
        height: (this.data.height || 1) + 'rpx',
        backgroundColor: this.data.color || '#eee'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.line-module {
  padding: 0 24rpx;
  background-color: #fff;
}

.line {
  width: 100%;
}
</style>
