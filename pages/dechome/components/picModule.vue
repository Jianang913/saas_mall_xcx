<template>
  <view class="pic-module" @click="onClick">
    <image class="pic-image" :src="data.picUrl || data.image" mode="widthFix" />
  </view>
</template>

<script>
export default {
  name: 'PicModule',
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    onClick() {
      if (this.data.linkUrl) {
        this.$tab.navigateTo(this.data.linkUrl)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.pic-module {
  margin-bottom: 20rpx;
}

.pic-image {
  width: 100%;
  display: block;
}
</style>
