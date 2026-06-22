<template>
  <view class="fullscreen-module" v-if="list.length > 0">
    <swiper
      class="fullscreen-swiper"
      :indicator-dots="true"
      :autoplay="true"
      :interval="5000"
      :circular="true"
      indicator-color="rgba(255,255,255,0.5)"
      indicator-active-color="#ffffff"
    >
      <swiper-item v-for="(item, i) in list" :key="i" @click="onClick(item)">
        <image class="fullscreen-img" :src="formatImage(item.picture)" mode="aspectFill" />
      </swiper-item>
    </swiper>
  </view>
</template>

<script>
import { handleLink } from '@/utils/linkType'

export default {
  name: 'FullScreenModule',
  props: {
    data: { type: Object, default: () => ({}) }
  },
  computed: {
    list() { return this.data.re || [] }
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
.fullscreen-module { width: 100%; }
.fullscreen-swiper { width: 100%; height: 600rpx; }
.fullscreen-img { width: 100%; height: 100%; }
</style>
