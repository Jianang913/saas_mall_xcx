<template>
  <view class="video-module">
    <video v-if="videoUrl" class="video-player" :src="videoUrl" :poster="posterUrl" object-fit="fill" />
    <view v-else class="video-empty">
      <text>暂无视频</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'VideoModule',
  props: {
    data: { type: Object, default: () => ({}) }
  },
  computed: {
    pageContent() {
      const pc = this.data.pageContent
      if (!pc) return {}
      if (typeof pc === 'string') { try { return JSON.parse(pc) } catch (e) { return {} } }
      return pc
    },
    videoUrl() {
      const v = this.pageContent.video
      if (!v) return ''
      if (v.startsWith('http')) return v
      const app = getApp()
      return (app.globalData.shopImg || '') + '/resource/oss/download/' + v
    },
    posterUrl() {
      const p = this.pageContent.videoPic
      if (!p) return ''
      if (p.startsWith('http')) return p
      const app = getApp()
      return (app.globalData.shopImg || '') + '/resource/oss/download/' + p
    }
  }
}
</script>

<style lang="scss" scoped>
.video-module { background: #000; }
.video-player { width: 100%; height: 400rpx; }
.video-empty {
  height: 300rpx; display: flex; align-items: center; justify-content: center;
  background: #1a1a1a; color: #666; font-size: 26rpx;
}
</style>
