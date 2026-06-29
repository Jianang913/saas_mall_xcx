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
import { resolveOssUrls } from '@/utils/oss'

export default {
  name: 'FullScreenModule',
  props: {
    data: { type: Object, default: () => ({}) }
  },
  data() {
    return { urlCache: new Map() }
  },
  computed: {
    list() { return this.data.re || [] }
  },
  watch: {
    list: {
      handler(list) { this.resolveImages(list) },
      immediate: true
    }
  },
  methods: {
    async resolveImages(list) {
      const picIds = list.map(item => item.picture).filter(pic => pic && !pic.startsWith('http')).join(',')
      if (picIds) this.urlCache = await resolveOssUrls(picIds)
    },
    formatImage(pic) {
      if (!pic) return ''
      if (pic.startsWith('http')) return pic
      return this.urlCache.get(pic) || ''
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
