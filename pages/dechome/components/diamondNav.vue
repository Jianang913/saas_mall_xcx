<template>
  <view class="diamond-nav" :class="layoutClass" :style="dynamicStyle" v-if="navList.length">
    <!-- 单行滑动：翻页式 -->
    <template v-if="layoutClass === 'layout-scroll'">
      <swiper class="scroll-swiper" :indicator-dots="false" :autoplay="false" :circular="false" @change="onSwiperChange">
        <swiper-item v-for="(page, pageIndex) in pages" :key="pageIndex">
          <view class="scroll-page">
            <view
              class="diamond-item"
              v-for="(item, index) in page"
              :key="index"
              @click="onClick(item)"
            >
              <image class="diamond-icon" :src="formatImage(item.picture || item.icon)" mode="aspectFit" />
              <text class="diamond-name">{{ item.title || item.name }}</text>
            </view>
          </view>
        </swiper-item>
      </swiper>
      <!-- 自定义指示器 -->
      <view v-if="pages.length > 1" class="page-dots">
        <view v-for="i in pages.length" :key="i" class="dot" :class="{ active: currentPage === i - 1 }"></view>
      </view>
    </template>
    <!-- 双行排列：网格 -->
    <template v-else>
      <view
        class="diamond-item"
        v-for="(item, index) in navList"
        :key="index"
        @click="onClick(item)"
      >
        <image class="diamond-icon" :src="formatImage(item.picture || item.icon)" mode="aspectFit" />
        <text class="diamond-name">{{ item.title || item.name }}</text>
      </view>
    </template>
  </view>
</template>

<script>
import { handleLink } from '@/utils/linkType'

export default {
  name: 'DiamondNav',
  props: {
    data: { type: Object, default: () => ({}) },
    mergeTop: { type: Boolean, default: false },
    mergeBottom: { type: Boolean, default: false }
  },
  data() {
    return {
      currentPage: 0
    }
  },
  computed: {
    navList() {
      if (this.data.re && this.data.re.length) return this.data.re
      const content = this.data.pageContent
      if (Array.isArray(content)) return content
      if (content && content.list) return content.list
      return []
    },
    // show='1' 单行滑动，show='2' 双行排列（默认）
    layoutClass() {
      return this.data.show === '1' ? 'layout-scroll' : 'layout-grid'
    },
    // 分页逻辑：每页5个
    pages() {
      const arr = this.navList
      const result = []
      for (let i = 0; i < arr.length; i += 5) {
        result.push(arr.slice(i, i + 5))
      }
      return result
    },
    // 动态样式：合并连续模块的间距
    dynamicStyle() {
      let top, right, bottom, left

      if (this.data.show === '1') {
        // 单行滑动
        top = '12rpx'
        right = '16rpx'
        left = '16rpx'
        // 有三个点时底部大一点，没三个点时小一点
        bottom = this.pages.length > 1 ? '12rpx' : '6rpx'
      } else {
        // 双行排列
        top = '20rpx'
        right = '16rpx'
        bottom = '20rpx'
        left = '16rpx'
      }

      if (this.mergeTop) top = '0rpx'
      if (this.mergeBottom) bottom = '0rpx'

      return `padding: ${top} ${right} ${bottom} ${left};`
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
    },
    onSwiperChange(e) {
      this.currentPage = e.detail.current
    }
  }
}
</script>

<style lang="scss" scoped>
.diamond-nav {
  background-color: #fff;
}

/* 单行滑动：翻页式 */
.layout-scroll {
  .scroll-swiper {
    height: 140rpx;
  }

  .scroll-page {
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 100%;
    padding: 0 8rpx;
  }

  .diamond-item {
    width: 20%;
    flex-shrink: 0;
  }

  .page-dots {
    display: flex;
    justify-content: center;
    gap: 6rpx;
    margin-top: 2rpx;

    .dot {
      width: 10rpx;
      height: 10rpx;
      border-radius: 50%;
      background-color: #ddd;

      &.active {
        background-color: #409eff;
      }
    }
  }
}

/* 双行排列：2列，每行4个 */
.layout-grid {
  display: flex;
  flex-wrap: wrap;

  .diamond-item {
    width: 25%;
  }
}

.diamond-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6rpx 0;
}

.diamond-icon { width: 88rpx; height: 88rpx; margin-bottom: 6rpx; }
.diamond-name { font-size: 24rpx; color: #333; }
</style>
