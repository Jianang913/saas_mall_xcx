<template>
  <view class="countdown-module" :style="moduleStyle">
    <text class="cd-title">{{ titleText }}</text>
    <view class="cd-blocks">
      <text class="cd-block">{{ hours }}</text>
      <text class="cd-sep">:</text>
      <text class="cd-block">{{ minutes }}</text>
      <text class="cd-sep">:</text>
      <text class="cd-block">{{ seconds }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CountdownModule',
  props: {
    data: { type: Object, default: () => ({}) }
  },
  data() {
    return { hours: '00', minutes: '00', seconds: '00', timer: null }
  },
  computed: {
    styleData() {
      const style = this.data.style || {}
      if (typeof style === 'string') { try { return JSON.parse(style) } catch (e) { return {} } }
      return style
    },
    titleText() {
      return this.data.title || this.data.pageContent || '限时抢购'
    },
    moduleStyle() {
      const bg = this.styleData.bkColor || '#ffffff'
      const color = this.styleData.wordColor || '#333333'
      return `background-color:${bg};color:${color};`
    }
  },
  mounted() {
    this.tick()
    this.timer = setInterval(this.tick, 1000)
  },
  beforeUnmount() {
    if (this.timer) clearInterval(this.timer)
  },
  methods: {
    tick() {
      const now = Date.now()
      const end = this.data.endTime ? new Date(this.data.endTime).getTime() : now + 3600000
      const diff = Math.max(0, end - now)
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      this.hours = String(h).padStart(2, '0')
      this.minutes = String(m).padStart(2, '0')
      this.seconds = String(s).padStart(2, '0')
    }
  }
}
</script>

<style lang="scss" scoped>
.countdown-module {
  display: flex; align-items: center; justify-content: center;
  gap: 20rpx; padding: 20rpx 24rpx; background: #fff;
}
.cd-title { font-size: 28rpx; font-weight: 500; }
.cd-blocks { display: flex; align-items: center; gap: 4rpx; }
.cd-block {
  display: inline-block; width: 52rpx; height: 44rpx; line-height: 44rpx;
  text-align: center; background: #333; color: #fff;
  border-radius: 8rpx; font-size: 26rpx; font-weight: 600;
}
.cd-sep { font-weight: 700; margin: 0 2rpx; }
</style>
