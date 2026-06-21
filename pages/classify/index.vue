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
      <!-- 左侧分类 Tab -->
      <scroll-view scroll-y class="left-nav">
        <view
          class="nav-item"
          :class="{ active: currentIdx === index }"
          v-for="(cat, index) in categoryList"
          :key="cat.catId"
          @click="switchCat(index)"
        >
          <text>{{ cat.catName }}</text>
        </view>
      </scroll-view>

      <!-- 右侧子分类 -->
      <scroll-view scroll-y class="right-content">
        <!-- 分类 Banner -->
        <image
          v-if="currentCat && currentCat.catPic"
          class="cat-banner"
          :src="currentCat.catPic"
          mode="widthFix"
        />

        <!-- 子分类网格 -->
        <view class="sub-cat-grid">
          <view
            class="sub-cat-item"
            v-for="sub in subCatList"
            :key="sub.catId"
            @click="goGoodsList(sub)"
          >
            <image class="sub-cat-icon" :src="sub.catPic" mode="aspectFit" />
            <text class="sub-cat-name">{{ sub.catName }}</text>
          </view>
        </view>

        <!-- 空状态 -->
        <uni-load-more v-if="!subCatList.length && categoryList.length" status="noData" />
      </scroll-view>
    </view>

    <!-- 自定义 Tab 栏 -->
    <tab-bar />
  </view>
</template>

<script>
import { listGoodsCat } from '@/api/mall/goods'

export default {
  data() {
    return {
      categoryList: [],
      currentIdx: 0
    }
  },
  computed: {
    currentCat() {
      return this.categoryList[this.currentIdx] || null
    },
    subCatList() {
      if (!this.currentCat) return []
      return this.currentCat.children || []
    }
  },
  onLoad() {
    this.loadCategories()
  },
  onShow() {
    // #ifdef MP-WEIXIN
    uni.hideTabBar({ animation: false })
    // #endif
  },
  onPullDownRefresh() {
    this.loadCategories().then(() => {
      uni.stopPullDownRefresh()
    })
  },
  methods: {
    async loadCategories() {
      try {
        const res = await listGoodsCat({ pageSize: 200 })
        if (res.rows) {
          // 构建树形结构
          this.categoryList = this.buildTree(res.rows)
        }
      } catch (e) {
        console.error('加载分类失败', e)
      }
    },
    buildTree(list) {
      const map = {}
      const tree = []
      list.forEach(item => {
        map[item.catId] = { ...item, children: [] }
      })
      list.forEach(item => {
        if (item.parentId && map[item.parentId]) {
          map[item.parentId].children.push(map[item.catId])
        } else if (!item.parentId || item.parentId === 0) {
          tree.push(map[item.catId])
        }
      })
      return tree
    },
    switchCat(index) {
      this.currentIdx = index
    },
    goSearch() {
      this.$tab.navigateTo('/pages/search/index')
    },
    goGoodsList(sub) {
      this.$tab.navigateTo('/pages/search/index?catId=' + sub.catId + '&catName=' + sub.catName)
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
  width: 180rpx;
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

.right-content {
  flex: 1;
  padding: 20rpx;
  height: 100%;
}

.cat-banner {
  width: 100%;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
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
