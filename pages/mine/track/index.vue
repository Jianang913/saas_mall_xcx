<template>
  <view class="track-page">
    <scroll-view scroll-y class="track-list" @scrolltolower="loadMore">
      <view class="goods-item" v-for="item in trackList" :key="item.goodsId" @click="goDetail(item)">
        <image class="goods-image" :src="item.goodsImage" mode="aspectFill" />
        <view class="goods-info">
          <text class="goods-name">{{ item.goodsName }}</text>
          <text class="goods-price">¥{{ item.shopPrice }}</text>
          <text class="track-time">{{ item.createTime }}</text>
        </view>
      </view>
      <uni-load-more v-if="trackList.length || loading" :status="loading ? 'loading' : noMore ? 'noMore' : 'more'" />
      <uni-load-more v-if="!trackList.length && !loading" status="noData" />
    </scroll-view>
  </view>
</template>

<script>
import { listBrowsingHistory } from '@/api/mall/user'

export default {
  data() {
    return { trackList: [], page: 1, pageSize: 20, loading: false, noMore: false }
  },
  onLoad() { this.loadData() },
  methods: {
    async loadData() {
      if (this.loading) return
      this.loading = true
      try {
        const res = await listBrowsingHistory({ page: this.page, pageSize: this.pageSize })
        if (res.rows) {
          this.trackList = this.page === 1 ? res.rows : [...this.trackList, ...res.rows]
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
.track-page { min-height: 100vh; background-color: #f5f5f5; }
.track-list { height: 100vh; padding: 20rpx; }
.goods-item { display: flex; background-color: #fff; border-radius: 12rpx; margin-bottom: 20rpx; overflow: hidden; }
.goods-image { width: 200rpx; height: 200rpx; flex-shrink: 0; }
.goods-info { flex: 1; padding: 20rpx; display: flex; flex-direction: column; justify-content: space-between; }
.goods-name { font-size: 28rpx; color: #333; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.goods-price { font-size: 34rpx; color: #e4393c; font-weight: bold; }
.track-time { font-size: 24rpx; color: #999; }
</style>
