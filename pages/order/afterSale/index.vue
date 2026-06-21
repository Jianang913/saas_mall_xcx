<template>
  <view class="after-sale-page">
    <scroll-view scroll-y class="sale-list" @scrolltolower="loadMore">
      <view
        class="sale-item"
        v-for="item in saleList"
        :key="item.orderAfterId"
        @click="goDetail(item)"
      >
        <view class="sale-header">
          <text class="sale-no">售后编号：{{ item.afterNo }}</text>
          <text class="sale-status">{{ getStatusText(item.afterStatus) }}</text>
        </view>
        <view class="sale-goods">
          <view class="goods-item" v-for="(detail, idx) in item.details" :key="idx">
            <image class="goods-image" :src="detail.goodsImage" mode="aspectFill" />
            <view class="goods-info">
              <text class="goods-name">{{ detail.goodsName }}</text>
              <view class="goods-bottom">
                <text class="goods-price">¥{{ detail.price }}</text>
                <text class="goods-qty">x{{ detail.quantity }}</text>
              </view>
            </view>
          </view>
        </view>
        <view class="sale-footer">
          <text class="sale-amount">退款金额：<text class="highlight">¥{{ item.refundAmount }}</text></text>
          <view class="action-btn" v-if="item.afterStatus === 2 || item.afterStatus === 3" @click.stop="cancelSale(item)">
            <text>取消售后</text>
          </view>
        </view>
      </view>

      <view class="loading-tip" v-if="loading"><text>加载中...</text></view>
      <view class="loading-tip" v-else-if="noMore && saleList.length"><text>没有更多了</text></view>
      <view class="empty" v-if="!saleList.length && !loading"><text>暂无售后订单</text></view>
    </scroll-view>
  </view>
</template>

<script>
import { listAfterSale, cancelAfterSale } from '@/api/mall/afterSale'

export default {
  data() {
    return {
      saleList: [],
      page: 1,
      pageSize: 10,
      loading: false,
      noMore: false
    }
  },
  onLoad() {
    this.loadData()
  },
  methods: {
    async loadData() {
      if (this.loading) return
      this.loading = true
      try {
        const res = await listAfterSale({ page: this.page, pageSize: this.pageSize })
        if (res.rows) {
          this.saleList = this.page === 1 ? res.rows : [...this.saleList, ...res.rows]
          if (res.rows.length < this.pageSize) this.noMore = true
        }
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },
    loadMore() {
      if (this.noMore || this.loading) return
      this.page++
      this.loadData()
    },
    getStatusText(status) {
      const map = { 1: '退款成功', 2: '待处理', 3: '等待退货', 4: '待确认收货', '-1': '退款关闭' }
      return map[status] || '未知'
    },
    goDetail(item) {
      this.$tab.navigateTo('/pages/order/afterSale/detail/index?id=' + item.orderAfterId)
    },
    async cancelSale(item) {
      await this.$modal.confirm('确定取消该售后申请？')
      try {
        await cancelAfterSale({ orderAfterId: item.orderAfterId })
        this.$modal.msgSuccess('已取消')
        this.page = 1
        this.saleList = []
        this.noMore = false
        this.loadData()
      } catch (e) {
        console.error(e)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.after-sale-page { min-height: 100vh; background-color: #f5f5f5; }
.sale-list { height: 100vh; padding: 20rpx; }
.sale-item { background-color: #fff; border-radius: 12rpx; margin-bottom: 20rpx; overflow: hidden; }
.sale-header { display: flex; justify-content: space-between; padding: 24rpx; border-bottom: 1rpx solid #f5f5f5; }
.sale-no { font-size: 26rpx; color: #999; }
.sale-status { font-size: 26rpx; color: #f2b974; font-weight: bold; }
.sale-goods { padding: 16rpx 24rpx; }
.goods-item { display: flex; padding: 12rpx 0; }
.goods-image { width: 120rpx; height: 120rpx; border-radius: 8rpx; margin-right: 16rpx; }
.goods-info { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
.goods-name { font-size: 28rpx; color: #333; }
.goods-bottom { display: flex; justify-content: space-between; }
.goods-price { font-size: 28rpx; color: #333; }
.goods-qty { font-size: 26rpx; color: #999; }
.sale-footer { display: flex; justify-content: space-between; align-items: center; padding: 20rpx 24rpx; border-top: 1rpx solid #f5f5f5; }
.sale-amount { font-size: 26rpx; color: #666; }
.highlight { color: #e4393c; font-weight: bold; }
.action-btn { padding: 12rpx 24rpx; border: 1rpx solid #ddd; border-radius: 30rpx; font-size: 26rpx; color: #666; }
.loading-tip { text-align: center; padding: 30rpx 0; font-size: 26rpx; color: #999; }
.empty { text-align: center; padding: 200rpx 0; font-size: 28rpx; color: #999; }
</style>
