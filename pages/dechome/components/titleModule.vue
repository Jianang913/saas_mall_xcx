<template>
  <view class="title-module" :style="moduleStyle">
    <text class="title-text" :style="titleStyle">{{ titleText }}</text>
    <text v-if="subTitleText" class="sub-title" :style="subTitleStyle">{{ subTitleText }}</text>
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
    styleData() {
      const style = this.data.style || {}
      if (typeof style === 'string') {
        try { return JSON.parse(style) }
        catch (e) { return {} }
      }
      return style
    },
    titleText() {
      return this.styleData.title || this.data.title || this.data.content || ''
    },
    subTitleText() {
      return this.styleData.subTitle || ''
    },
    moduleStyle() {
      const bg = this.styleData.bgColor || '#ffffff'
      return `background-color:${bg};`
    },
    titleStyle() {
      const align = this.styleData.align || 'center'
      return `font-size:32rpx;color:#333;font-weight:bold;text-align:${align};`
    },
    subTitleStyle() {
      const align = this.styleData.align || 'center'
      return `font-size:24rpx;color:#999;text-align:${align};`
    }
  }
}
</script>

<style lang="scss" scoped>
.title-module {
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.title-text {
  display: block;
  line-height: 1.5;
}

.sub-title {
  display: block;
  margin-top: 8rpx;
  line-height: 1.4;
}
</style>
