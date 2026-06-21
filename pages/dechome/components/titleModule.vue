<template>
  <view class="title-module">
    <text class="title-text" :style="titleStyle">{{ data.title || data.content }}</text>
  </view>
</template>

<script>
export default {
  name: 'TitleModule',
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    titleStyle() {
      return {
        fontSize: (this.data.fontSize || 28) + 'rpx',
        color: this.data.color || '#333',
        fontWeight: this.data.bold ? 'bold' : 'normal',
        textAlign: this.data.align || 'center'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.title-module {
  padding: 24rpx;
  background-color: #fff;
  margin-bottom: 20rpx;
}

.title-text {
  display: block;
  line-height: 1.5;
}
</style>
