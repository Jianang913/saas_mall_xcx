<template>
  <view class="coupon-page">
    <scroll-view scroll-y class="coupon-list" @scrolltolower="loadMore">
      <view class="coupon-item" v-for="item in couponList" :key="item.couponId">
        <view class="coupon-left">
          <text class="coupon-amount">¥{{ item.amount }}</text>
          <text class="coupon-condition" v-if="item.minAmount">满{{ item.minAmount }}可用</text>
        </view>
        <view class="coupon-right">
          <text class="coupon-name">{{ item.couponName }}</text>
          <text class="coupon-time">{{ item.startTime }} - {{ item.endTime }}</text>
          <view class="coupon-status">
            <text v-if="item.status === 1" class="status-unused">可使用</text>
            <text v-else-if="item.status === 2" class="status-used">已使用</text>
            <text v-else class="status-expired">已过期</text>
          </view>
        </view>
      </view>
      <uni-load-more v-if="couponList.length || loading" :status="loading ? 'loading' : noMore ? 'noMore' : 'more'" />
      <uni-load-more v-if="!couponList.length && !loading" status="noData" />
    </scroll-view>
  </view>
</template>

<script>
import { listCoupon } from '@/api/mall/user'

export default {
  data() {
    return { couponList: [], page: 1, pageSize: 20, loading: false, noMore: false }
  },
  onLoad() { this.loadData() },
  methods: {
    async loadData() {
      if (this.loading) return
      this.loading = true
      try {
        const res = await listCoupon({ page: this.page, pageSize: this.pageSize })
        if (res.rows) {
          this.couponList = this.page === 1 ? res.rows : [...this.couponList, ...res.rows]
          if (res.rows.length < this.pageSize) this.noMore = true
        }
      } catch (e) { console.error(e) }
      finally { this.loading = false }
    },
    loadMore() { if (this.noMore || this.loading) return; this.page++; this.loadData() }
  }
}
</script>

<style lang="scss" scoped>
.coupon-page { min-height: 100vh; background-color: #f5f5f5; }
.coupon-list { height: 100vh; padding: 20rpx; }
.coupon-item { display: flex; background-color: #fff; border-radius: 12rpx; margin-bottom: 20rpx; overflow: hidden; }
.coupon-left { width: 200rpx; background: linear-gradient(135deg, #f2b974, #e4a04e); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24rpx; }
.coupon-amount { font-size: 44rpx; color: #fff; font-weight: bold; }
.coupon-condition { font-size: 22rpx; color: rgba(255,255,255,0.8); margin-top: 4rpx; }
.coupon-right { flex: 1; padding: 24rpx; display: flex; flex-direction: column; justify-content: center; }
.coupon-name { font-size: 28rpx; color: #333; font-weight: bold; margin-bottom: 8rpx; }
.coupon-time { font-size: 24rpx; color: #999; margin-bottom: 8rpx; }
.coupon-status { }
.status-unused { font-size: 24rpx; color: #f2b974; }
.status-used { font-size: 24rpx; color: #999; }
.status-expired { font-size: 24rpx; color: #ccc; }
</style>
