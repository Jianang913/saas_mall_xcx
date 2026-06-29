<template>
  <view class="pic-module" @click="onClick">
    <image class="pic-image" :src="picUrl" mode="widthFix" />
  </view>
</template>

<script>
import { handleLink } from '@/utils/linkType'
import { resolveOssUrls } from '@/utils/oss'

export default {
  name: 'PicModule',
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      urlCache: new Map()
    }
  },
  computed: {
    picUrl() {
      if (this.data.re && this.data.re.length && this.data.re[0].picture) {
        const pic = this.data.re[0].picture
        if (pic.startsWith('http')) return pic
        return this.urlCache.get(pic) || ''
      }
      const style = this.data.style || {}
      const pic = style.picUrl || style.image || ''
      if (pic && !pic.startsWith('http')) {
        return this.urlCache.get(pic) || ''
      }
      return pic
    }
  },
  watch: {
    data: {
      handler() {
        this.resolveImage()
      },
      immediate: true
    }
  },
  methods: {
    async resolveImage() {
      let pic = ''
      if (this.data.re && this.data.re.length && this.data.re[0].picture) {
        pic = this.data.re[0].picture
      } else {
        const style = this.data.style || {}
        pic = style.picUrl || style.image || ''
      }
      if (pic && !pic.startsWith('http')) {
        this.urlCache = await resolveOssUrls(pic)
      }
    },
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
  
}

.pic-image {
  width: 100%;
  display: block;
}
</style>
