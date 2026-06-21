<template>
  <view class="collect-page">
    <scroll-view scroll-y class="collect-list" @scrolltolower="loadMore">
      <view class="goods-item" v-for="item in collectList" :key="item.goodsId" @click="goDetail(item)">
        <image class="goods-image" :src="item.goodsImage" mode="aspectFill" />
        <view class="goods-info">
          <text class="goods-name">{{ item.goodsName }}</text>
          <text class="goods-price">¥{{ item.shopPrice }}</text>
        </view>
      </view>
      <view class="loading-tip" v-if="loading"><text>加载中...</text></view>
      <view class="loading-tip" v-else-if="noMore && collectList.length"><text>没有更多了</text></view>
      <view class="empty" v-if="!collectList.length && !loading"><text>暂无收藏</text></view>
    </scroll-view>
  </view>
</template>

<script>
import { collectList } from '@/api/mall/goods'

export default {
  data() {
    return { collectList: [], page: 1, pageSize: 20, loading: false, noMore: false }
  },
  onLoad() { this.loadData() },
  methods: {
    async loadData() {
      if (this.loading) return
      this.loading = true
      try {
        const res = await collectList({ page: this.page, pageSize: this.pageSize })
        if (res.rows) {
          this.collectList = this.page === 1 ? res.rows : [...this.collectList, ...res.rows]
          if (res.rows.length < this.pageSize) this.noMore = true
        }
      } catch (e) { console.error(e) }
      finally { this.loading = false }
    },
    loadMore() { if (this.noMore || this.loading) return; this.page++; this.loadData() },
    goDetail(item) { this.$tab.navigateTo('/pages/goods/detail/index?id=' + item.goodsId) }
  }
}
</script>

<style lang="scss" scoped>
.collect-page { min-height: 100vh; background-color: #f5f5f5; }
.collect-list { height: 100vh; padding: 20rpx; }
.goods-item { display: flex; background-color: #fff; border-radius: 12rpx; margin-bottom: 20rpx; overflow: hidden; }
.goods-image { width: 200rpx; height: 200rpx; flex-shrink: 0; }
.goods-info { flex: 1; padding: 20rpx; display: flex; flex-direction: column; justify-content: space-between; }
.goods-name { font-size: 28rpx; color: #333; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.goods-price { font-size: 34rpx; color: #e4393c; font-weight: bold; }
.loading-tip { text-align: center; padding: 30rpx 0; font-size: 26rpx; color: #999; }
.empty { text-align: center; padding: 200rpx 0; font-size: 28rpx; color: #999; }
</style>
