<template>
  <view class="line-module">
    <view class="line-container" :style="containerStyle">
      <!-- 实线 -->
      <template v-if="lineType === '1'">
        <view v-if="text" class="line-with-text">
          <view class="line-text-line" :style="'background:' + lineColor"></view>
          <text class="line-text-content" :style="textStyle">{{ text }}</text>
          <view class="line-text-line" :style="'background:' + lineColor"></view>
        </view>
        <view v-else class="line-solid" :style="'background:' + lineColor"></view>
      </template>

      <!-- 虚线 -->
      <template v-else-if="lineType === '2'">
        <view v-if="text" class="line-with-text">
          <view class="line-text-line dashed" :style="'border-color:' + lineColor"></view>
          <text class="line-text-content" :style="textStyle">{{ text }}</text>
          <view class="line-text-line dashed" :style="'border-color:' + lineColor"></view>
        </view>
        <view v-else class="line-dashed" :style="'border-color:' + lineColor"></view>
      </template>

      <!-- 留白 -->
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
      if (this.styleData.lineType) return this.styleData.lineType
      if (this.data.show && this.data.show !== '0') return this.data.show
      if (this.styleData.blankSpace) return '3'
      return '3'
    },
    text() {
      return this.styleData.text || ''
    },
    lineColor() {
      return this.styleData.lineColor || '#e8e8e8'
    },
    containerStyle() {
      let h
      if (this.styleData.height) {
        h = this.styleData.height
      } else if (this.styleData.blankSpace) {
        h = this.styleData.blankSpace * 2
      } else {
        h = 20
      }
      const bg = this.styleData.bgColor || this.styleData.bkColor || '#ffffff'
      return 'padding:' + h + 'rpx 0;background-color:' + bg + ';'
    },
    textStyle() {
      const color = this.styleData.textColor || '#999999'
      const size = (this.styleData.textSize || 12) * 2 + 'rpx'
      return 'color:' + color + ';font-size:' + size + ';'
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
}

.line-dashed {
  height: 0;
  border-top: 1rpx dashed;
}

.line-blank {
  height: 20rpx;
}

.line-with-text {
  display: flex;
  align-items: center;
  padding: 0 24rpx;
}

.line-text-line {
  flex: 1;
  height: 2rpx;

  &.dashed {
    border-top: 1rpx dashed;
    height: 0;
  }
}

.line-text-content {
  white-space: nowrap;
  flex-shrink: 0;
  padding: 0 24rpx;
}
</style>
