<template>
  <view class="pic-module" @click="onClick">
    <image class="pic-image" :src="picUrl" mode="widthFix" />
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
  computed: {
    picUrl() {
      if (this.data.re && this.data.re.length && this.data.re[0].picture) {
        const pic = this.data.re[0].picture
        if (pic.startsWith('http')) return pic
        const app = getApp()
        return (app.globalData.shopImg || '') + '/resource/oss/download/' + pic
      }
      const style = this.data.style || {}
      const pic = style.picUrl || style.image || ''
      if (pic && !pic.startsWith('http')) {
        const app = getApp()
        return (app.globalData.shopImg || '') + '/resource/oss/download/' + pic
      }
      return pic
    }
  },
  methods: {
    onClick() {
      // 链接信息在 banner 数据(re[0]) 中，不在模块顶层
      const linkData = (this.data.re && this.data.re[0]) || this.data
      if (linkData.linkType) {
        handleLink(linkData.linkType, linkData.content, linkData.contentName)
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
