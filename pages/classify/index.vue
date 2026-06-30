<template>
  <view class="classify-page">
    <!-- 搜索栏 -->
    <view class="search-bar" @click="goSearch">
      <view class="search-input">
        <text class="cuIcon-search"></text>
        <text class="search-placeholder">搜索商品</text>
      </view>
    </view>

    <view class="classify-content">
      <!-- 左侧一级分类 Tab -->
      <scroll-view scroll-y class="left-nav">
        <view
          class="nav-item"
          :class="{ active: currentIdx === index }"
          v-for="(cat, index) in categoryList"
          :key="cat.goodsCatId"
          @click="switchCat(index)"
        >
          <text>{{ cat.alias || cat.catName }}</text>
        </view>
      </scroll-view>

      <!-- 右侧二级分类 -->
      <scroll-view scroll-y class="mid-nav">
        <view
          class="mid-item"
          :class="{ active: currentMidIdx === index }"
          v-for="(sub, index) in subCatList"
          :key="sub.goodsCatId"
          @click="switchMidCat(index)"
        >
          <text>{{ sub.alias || sub.catName }}</text>
        </view>
      </scroll-view>

      <!-- 右侧三级分类网格 -->
      <scroll-view scroll-y class="right-content">
        <view class="sub-cat-grid">
          <view
            class="sub-cat-item"
            v-for="third in thirdCatList"
            :key="third.goodsCatId"
            @click="goGoodsList(third)"
          >
            <image class="sub-cat-icon" :src="getImgUrl(third.catPic)" mode="aspectFit" />
            <text class="sub-cat-name">{{ third.alias || third.catName }}</text>
          </view>
        </view>

        <!-- 空状态 -->
        <uni-load-more v-if="!thirdCatList.length && subCatList.length" status="noData" />
      </scroll-view>
    </view>

    <!-- 自定义 Tab 栏 -->
    <tab-bar />
  </view>
</template>

<script>
import { listGoodsCat } from '@/api/mall/goods'
import { resolveOssUrls } from '@/utils/oss'
import { navigateTo } from '@/utils/navigate'

export default {
  data() {
    return {
      categoryList: [],
      currentIdx: 0,
      currentMidIdx: 0,
      urlCache: new Map()
    }
  },
  computed: {
    currentCat() {
      return this.categoryList[this.currentIdx] || null
    },
    subCatList() {
      if (!this.currentCat) return []
      return this.currentCat.children || []
    },
    thirdCatList() {
      if (!this.subCatList.length) return []
      const currentSub = this.subCatList[this.currentMidIdx]
      return currentSub ? currentSub.children || [] : []
    }
  },
  onLoad() {
    this.loadCategories()
  },
  onShow() {
  },
  onPullDownRefresh() {
    this.loadCategories().then(() => {
      uni.stopPullDownRefresh()
    })
  },
  methods: {
    async loadCategories() {
      try {
        const res = await listGoodsCat()
        if (res.code === 200 && res.data) {
          // 后端已经返回树形结构，直接使用
          this.categoryList = res.data
          // 解析所有分类图片
          this.resolveCategoryImages(res.data)
        }
      } catch (e) {
        console.error('加载分类失败', e)
      }
    },
    switchCat(index) {
      this.currentIdx = index
      this.currentMidIdx = 0
    },
    switchMidCat(index) {
      this.currentMidIdx = index
    },
    async resolveCategoryImages(list) {
      // 递归收集所有分类的图片ID
      const collectPics = (items) => {
        let pics = []
        for (const item of items) {
          if (item.catPic && !item.catPic.startsWith('http')) pics.push(item.catPic)
          if (item.children) pics = pics.concat(collectPics(item.children))
        }
        return pics
      }
      const picIds = collectPics(list).join(',')
      if (picIds) this.urlCache = await resolveOssUrls(picIds)
    },
    getImgUrl(pic) {
      if (!pic) return ''
      if (pic.startsWith('http')) return pic
      return this.urlCache.get(pic) || ''
    },
    goSearch() {
      navigateTo('/pages/search/index')
    },
    goGoodsList(third) {
      navigateTo('/pages/goods/list/index?catId=' + third.goodsCatId + '&catName=' + (third.alias || third.catName))
    }
  }
}
</script>

<style lang="scss" scoped>
.classify-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  padding-bottom: 130rpx;
}

.search-bar {
  padding: 16rpx 24rpx;
  background-color: #fff;
}

.search-input {
  display: flex;
  align-items: center;
  height: 64rpx;
  background-color: #f5f5f5;
  border-radius: 32rpx;
  padding: 0 24rpx;
}

.search-placeholder {
  margin-left: 12rpx;
  font-size: 26rpx;
  color: #999;
}

.classify-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.left-nav {
  width: 160rpx;
  background-color: #f5f5f5;
  height: 100%;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100rpx;
  font-size: 26rpx;
  color: #666;
  position: relative;
}

.nav-item.active {
  background-color: #fff;
  color: #333;
  font-weight: bold;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 6rpx;
  height: 40rpx;
  background-color: #f2b974;
  border-radius: 0 3rpx 3rpx 0;
}

.mid-nav {
  width: 160rpx;
  background-color: #fafafa;
  height: 100%;
}

.mid-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  font-size: 24rpx;
  color: #666;
}

.mid-item.active {
  color: #f2b974;
  font-weight: bold;
}

.right-content {
  flex: 1;
  padding: 20rpx;
  height: 100%;
}

.sub-cat-grid {
  display: flex;
  flex-wrap: wrap;
}

.sub-cat-item {
  width: 33.33%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 0;
}

.sub-cat-icon {
  width: 100rpx;
  height: 100rpx;
  margin-bottom: 12rpx;
}

.sub-cat-name {
  font-size: 24rpx;
  color: #333;
}
</style>
