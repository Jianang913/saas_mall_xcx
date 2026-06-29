<template>
  <view class="swiper-module" v-if="imageList.length">
    <swiper
      class="swiper"
      :indicator-dots="true"
      :autoplay="true"
      :interval="3000"
      :duration="500"
      :circular="true"
      indicator-color="rgba(255,255,255,0.5)"
      indicator-active-color="#ffffff"
    >
      <swiper-item v-for="(item, index) in imageList" :key="index" @click="onClick(item)">
        <view class="slide-wrap">
          <!-- 模糊背景：填满容器 -->
          <image class="slide-bg" :src="formatImage(item.picture)" mode="aspectFill" />
          <!-- 前景图：完整显示 -->
          <image class="slide-img" :src="formatImage(item.picture)" mode="aspectFit" />
        </view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script>
import { handleLink } from '@/utils/linkType'

export default {
  name: 'SwiperModule',
  props: {
    data: { type: Object, default: () => ({}) }
  },
  computed: {
    imageList() {
      if (this.data.re && this.data.re.length) return this.data.re
      const content = this.data.pageContent
      if (Array.isArray(content)) return content
      if (content && content.list) return content.list
      return []
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
.swiper-module { width: 100%; }
.swiper { width: 100%; height: 375rpx; }

.slide-wrap {
  position: relative;
  width: 100%;
  height: 100%;
}

.slide-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  filter: blur(40rpx);
  transform: scale(1.2);
}

.slide-img {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
