<template>
  <view class="search-page">
    <!-- 搜索栏 -->
    <view class="search-header">
      <view class="search-input-wrap">
        <text class="cuIcon-search"></text>
        <input
          class="search-input"
          v-model="keyword"
          placeholder="搜索商品"
          confirm-type="search"
          @confirm="doSearch"
          :focus="true"
        />
        <text class="cuIcon-close" v-if="keyword" @click="keyword = ''"></text>
      </view>
      <text class="search-btn" @click="doSearch">搜索</text>
    </view>

    <!-- 搜索历史 -->
    <view class="search-history" v-if="!keyword && searchHistory.length">
      <view class="history-header">
        <text class="history-title">最近搜索</text>
        <text class="history-clear" @click="clearHistory">清空</text>
      </view>
      <view class="history-tags">
        <view
          class="history-tag"
          v-for="(item, index) in searchHistory"
          :key="index"
          @click="keyword = item; doSearch()"
        >
          <text>{{ item }}</text>
        </view>
      </view>
    </view>

    <!-- 搜索结果 -->
    <scroll-view
      scroll-y
      class="result-list"
      v-if="hasSearched"
      @scrolltolower="loadMore"
    >
      <view
        class="goods-item"
        v-for="item in goodsList"
        :key="item.goodsId"
        @click="goDetail(item)"
      >
        <image class="goods-image" :src="item.goodsImage" mode="aspectFill" />
        <view class="goods-info">
          <text class="goods-name">{{ item.goodsName }}</text>
          <view class="goods-price-row">
            <text class="goods-price">¥{{ item.shopPrice }}</text>
          </view>
        </view>
      </view>

      <!-- 加载状态 -->
      <uni-load-more v-if="goodsList.length || loading" :status="loading ? 'loading' : noMore ? 'noMore' : 'more'" />
      <uni-load-more v-if="!goodsList.length && !loading" status="noData" />
    </scroll-view>
  </view>
</template>

<script>
import { searchGoods } from '@/api/mall/goods'

export default {
  data() {
    return {
      keyword: '',
      catId: '',
      goodsList: [],
      hasSearched: false,
      loading: false,
      noMore: false,
      page: 1,
      pageSize: 20,
      searchHistory: []
    }
  },
  onLoad(options) {
    if (options.catId) {
      this.catId = options.catId
      if (options.catName) {
        this.keyword = options.catName
      }
      this.doSearch()
    }
    // 加载搜索历史
    const history = uni.getStorageSync('searchHistory')
    if (history) {
      this.searchHistory = JSON.parse(history)
    }
  },
  methods: {
    async doSearch() {
      if (!this.keyword.trim() && !this.catId) return

      // 保存搜索历史
      if (this.keyword.trim()) {
        this.saveHistory(this.keyword.trim())
      }

      this.page = 1
      this.goodsList = []
      this.noMore = false
      this.hasSearched = true
      await this.loadData()
    },
    async loadData() {
      if (this.loading) return
      this.loading = true

      try {
        const params = {
          page: this.page,
          pageSize: this.pageSize
        }
        if (this.keyword.trim()) {
          params.goodsName = this.keyword.trim()
        }
        if (this.catId) {
          params.catId = this.catId
        }

        const res = await searchGoods(params)
        if (res.rows) {
          this.goodsList = this.page === 1 ? res.rows : [...this.goodsList, ...res.rows]
          if (res.rows.length < this.pageSize) {
            this.noMore = true
          }
        }
      } catch (e) {
        console.error('搜索失败', e)
      } finally {
        this.loading = false
      }
    },
    loadMore() {
      if (this.noMore || this.loading) return
      this.page++
      this.loadData()
    },
    saveHistory(keyword) {
      let history = this.searchHistory.filter(item => item !== keyword)
      history.unshift(keyword)
      if (history.length > 10) {
        history = history.slice(0, 10)
      }
      this.searchHistory = history
      uni.setStorageSync('searchHistory', JSON.stringify(history))
    },
    clearHistory() {
      this.searchHistory = []
      uni.removeStorageSync('searchHistory')
    },
    goDetail(item) {
      this.$tab.navigateTo('/pages/goods/detail/index?id=' + item.goodsId)
    }
  }
}
</script>

<style lang="scss" scoped>
.search-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.search-header {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background-color: #fff;
}

.search-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  height: 64rpx;
  background-color: #f5f5f5;
  border-radius: 32rpx;
  padding: 0 24rpx;
}

.search-input {
  flex: 1;
  margin-left: 12rpx;
  font-size: 28rpx;
}

.search-btn {
  margin-left: 20rpx;
  font-size: 28rpx;
  color: #f2b974;
}

.search-history {
  background-color: #fff;
  padding: 24rpx;
  margin-top: 20rpx;
}

.history-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.history-title {
  font-size: 30rpx;
  color: #333;
  font-weight: bold;
}

.history-clear {
  font-size: 26rpx;
  color: #999;
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
}

.history-tag {
  padding: 12rpx 24rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  margin-right: 16rpx;
  margin-bottom: 16rpx;
  font-size: 26rpx;
  color: #666;
}

.result-list {
  height: calc(100vh - 100rpx);
  padding: 20rpx;
}

.goods-item {
  display: flex;
  background-color: #fff;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.goods-image {
  width: 200rpx;
  height: 200rpx;
  flex-shrink: 0;
}

.goods-info {
  flex: 1;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.goods-name {
  font-size: 28rpx;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.goods-price-row {
  margin-top: 12rpx;
}

.goods-price {
  font-size: 34rpx;
  color: #e4393c;
  font-weight: bold;
}

</style>
