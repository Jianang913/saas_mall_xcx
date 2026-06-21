<template>
  <view class="order-list-page">
    <!-- 状态 Tab -->
    <view class="status-tabs">
      <scroll-view scroll-x class="tabs-scroll">
        <view
          class="tab-item"
          :class="{ active: currentTab === tab.value }"
          v-for="tab in tabs"
          :key="tab.value"
          @click="switchTab(tab.value)"
        >
          <text>{{ tab.label }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 订单列表 -->
    <scroll-view scroll-y class="order-list" @scrolltolower="loadMore">
      <view
        class="order-item"
        v-for="order in orderList"
        :key="order.orderId"
        @click="goDetail(order)"
      >
        <!-- 订单头 -->
        <view class="order-header">
          <text class="order-no">订单号：{{ order.orderNo }}</text>
          <text class="order-status">{{ getStatusText(order.status) }}</text>
        </view>
        <!-- 商品列表 -->
        <view class="order-goods">
          <view class="goods-item" v-for="(detail, idx) in order.details" :key="idx">
            <image class="goods-image" :src="detail.goodsImage" mode="aspectFill" />
            <view class="goods-info">
              <text class="goods-name">{{ detail.goodsName }}</text>
              <text class="goods-spec" v-if="detail.specValues">{{ detail.specValues }}</text>
              <view class="goods-bottom">
                <text class="goods-price">¥{{ detail.price }}</text>
                <text class="goods-qty">x{{ detail.quantity }}</text>
              </view>
            </view>
          </view>
        </view>
        <!-- 订单底部 -->
        <view class="order-footer">
          <text class="order-total">共{{ order.totalCount }}件 合计：<text class="total-price">¥{{ order.totalAmount }}</text></text>
          <view class="order-actions">
            <view class="action-btn" v-if="order.status === 1" @click.stop="cancelOrder(order)">
              <text>取消</text>
            </view>
            <view class="action-btn primary" v-if="order.status === 1" @click.stop="payOrder(order)">
              <text>去支付</text>
            </view>
            <view class="action-btn" v-if="order.status === 3" @click.stop="confirmReceive(order)">
              <text>确认收货</text>
            </view>
            <view class="action-btn" v-if="order.status === 4" @click.stop="delOrder(order)">
              <text>删除</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载状态 -->
      <view class="loading-tip" v-if="loading">
        <text>加载中...</text>
      </view>
      <view class="loading-tip" v-else-if="noMore && orderList.length">
        <text>没有更多了</text>
      </view>

      <!-- 空状态 -->
      <view class="empty" v-if="!orderList.length && !loading">
        <text>暂无订单</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { listOrder, cancelOrder, confirmReceive, delOrder, wxPay } from '@/api/mall/order'

export default {
  data() {
    return {
      tabs: [
        { label: '全部', value: 0 },
        { label: '待付款', value: 1 },
        { label: '待发货', value: 2 },
        { label: '待收货', value: 3 },
        { label: '已完成', value: 4 }
      ],
      currentTab: 0,
      orderList: [],
      page: 1,
      pageSize: 10,
      loading: false,
      noMore: false
    }
  },
  onLoad(options) {
    if (options.status !== undefined) {
      this.currentTab = parseInt(options.status)
    }
    this.loadOrders()
  },
  methods: {
    switchTab(value) {
      this.currentTab = value
      this.page = 1
      this.orderList = []
      this.noMore = false
      this.loadOrders()
    },
    async loadOrders() {
      if (this.loading) return
      this.loading = true

      try {
        const params = {
          page: this.page,
          pageSize: this.pageSize
        }
        if (this.currentTab > 0) {
          params.status = this.currentTab
        }

        const res = await listOrder(params)
        if (res.rows) {
          const orders = res.rows.map(order => ({
            ...order,
            totalCount: (order.details || []).reduce((sum, d) => sum + d.quantity, 0),
            totalAmount: order.payAmount || order.orderAmount
          }))
          this.orderList = this.page === 1 ? orders : [...this.orderList, ...orders]
          if (res.rows.length < this.pageSize) {
            this.noMore = true
          }
        }
      } catch (e) {
        console.error('加载订单失败', e)
      } finally {
        this.loading = false
      }
    },
    loadMore() {
      if (this.noMore || this.loading) return
      this.page++
      this.loadOrders()
    },
    getStatusText(status) {
      const map = {
        1: '待付款',
        2: '待发货',
        3: '待收货',
        4: '已完成',
        5: '交易关闭'
      }
      return map[status] || '未知'
    },
    goDetail(order) {
      this.$tab.navigateTo('/pages/order/detail/index?id=' + order.orderId)
    },
    async cancelOrder(order) {
      await this.$modal.confirm('确定取消该订单？')
      try {
        await cancelOrder({ orderId: order.orderId })
        this.$modal.msgSuccess('已取消')
        this.switchTab(this.currentTab)
      } catch (e) {
        console.error('取消失败', e)
      }
    },
    async payOrder(order) {
      try {
        const res = await wxPay({ orderId: order.orderId })
        if (res.data) {
          uni.requestPayment({
            ...res.data,
            success: () => {
              this.$modal.msgSuccess('支付成功')
              this.switchTab(this.currentTab)
            },
            fail: () => {
              this.$modal.msgError('支付取消')
            }
          })
        }
      } catch (e) {
        console.error('支付失败', e)
      }
    },
    async confirmReceive(order) {
      await this.$modal.confirm('确认已收到商品？')
      try {
        await confirmReceive({ orderId: order.orderId })
        this.$modal.msgSuccess('已确认收货')
        this.switchTab(this.currentTab)
      } catch (e) {
        console.error('确认收货失败', e)
      }
    },
    async delOrder(order) {
      await this.$modal.confirm('确定删除该订单？')
      try {
        await delOrder(order.orderId)
        this.$modal.msgSuccess('已删除')
        this.switchTab(this.currentTab)
      } catch (e) {
        console.error('删除失败', e)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.order-list-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.status-tabs {
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
}

.tabs-scroll {
  white-space: nowrap;
}

.tab-item {
  display: inline-block;
  padding: 24rpx 32rpx;
  font-size: 28rpx;
  color: #666;
  position: relative;
}

.tab-item.active {
  color: #f2b974;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 4rpx;
  background-color: #f2b974;
  border-radius: 2rpx;
}

.order-list {
  height: calc(100vh - 90rpx);
  padding: 20rpx;
}

.order-item {
  background-color: #fff;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  padding: 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.order-no {
  font-size: 26rpx;
  color: #999;
}

.order-status {
  font-size: 26rpx;
  color: #f2b974;
  font-weight: bold;
}

.order-goods {
  padding: 16rpx 24rpx;
}

.goods-item {
  display: flex;
  padding: 12rpx 0;
}

.goods-image {
  width: 140rpx;
  height: 140rpx;
  border-radius: 8rpx;
  margin-right: 16rpx;
}

.goods-info {
  flex: 1;
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
}

.goods-spec {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
}

.goods-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.goods-price {
  font-size: 28rpx;
  color: #333;
}

.goods-qty {
  font-size: 26rpx;
  color: #999;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  border-top: 1rpx solid #f5f5f5;
}

.order-total {
  font-size: 26rpx;
  color: #666;
}

.total-price {
  font-size: 30rpx;
  color: #e4393c;
  font-weight: bold;
}

.order-actions {
  display: flex;
}

.action-btn {
  padding: 12rpx 24rpx;
  border: 1rpx solid #ddd;
  border-radius: 30rpx;
  margin-left: 16rpx;
  font-size: 26rpx;
  color: #666;
}

.action-btn.primary {
  border-color: #f2b974;
  color: #f2b974;
}

.loading-tip {
  text-align: center;
  padding: 30rpx 0;
  font-size: 26rpx;
  color: #999;
}

.empty {
  text-align: center;
  padding: 200rpx 0;
  font-size: 28rpx;
  color: #999;
}
</style>
