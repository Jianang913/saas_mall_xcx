<template>
  <view class="line-module">
    <view class="line-container" :style="containerStyle">
      <view v-if="lineType === '1'" class="line-solid"></view>
      <view v-else-if="lineType === '2'" class="line-dashed"></view>
      <view v-else class="line-blank"></view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'LineModule',
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
    lineType() {
      // 新格式: lineType (1=实线 2=虚线 3=留白)
      // 旧格式: 无 lineType，根据 blankSpace 判断
      if (this.styleData.lineType) return this.styleData.lineType
      if (this.data.show && this.data.show !== '0') return this.data.show
      // 旧数据有 blankSpace 时视为留白
      if (this.styleData.blankSpace) return '3'
      return '3'
    },
    containerStyle() {
      // 新格式: height + bgColor (height 单位为 rpx)
      // 旧格式: blankSpace + bkColor (blankSpace 需要乘 2 转 rpx)
      let h
      if (this.styleData.height) {
        h = this.styleData.height
      } else if (this.styleData.blankSpace) {
        h = this.styleData.blankSpace * 2
      } else {
        h = 20
      }
      const bg = this.styleData.bgColor || this.styleData.bkColor || '#ffffff'
      // uni-app 内联样式必须用 kebab-case
      return 'padding:' + h + 'rpx 0;background-color:' + bg + ';'
    }
  }
}
</script>

<style lang="scss" scoped>
.line-module {
  background-color: #fff;
}

.line-container {
  width: 100%;
}

.line-solid {
  height: 2rpx;
  background: #e8e8e8;
}

.line-dashed {
  height: 1rpx;
  border-top: 1rpx dashed #e8e8e8;
}

.line-blank {
  height: 20rpx;
}
</style>
