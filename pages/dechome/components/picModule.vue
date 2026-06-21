<template>
  <view class="pic-module" @click="onClick">
    <image class="pic-image" :src="data.picUrl || data.image" mode="widthFix" />
  </view>
</template>

<script>
import { handleLink } from '@/utils/linkType'

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
      if (this.data.linkType) {
        handleLink(this.data.linkType, this.data.content || this.data.linkUrl, this.data.contentName)
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
