<template>
  <view class="order-detail" v-if="order">
    <!-- 状态头 -->
    <view class="status-header">
      <text class="status-text">{{ getStatusText(order.status) }}</text>
    </view>

    <!-- 物流信息 -->
    <view class="section courier-section" v-if="order.courier">
      <text class="section-label">物流信息</text>
      <view class="courier-info">
        <text>{{ order.courier.courierCompany }} {{ order.courier.courierNo }}</text>
        <text class="copy-btn" @click="copyText(order.courier.courierNo)">复制</text>
      </view>
    </view>

    <!-- 收货地址 -->
    <view class="section address-section">
      <text class="cuIcon-location"></text>
      <view class="address-info">
        <view class="address-top">
          <text class="address-name">{{ order.consignee }}</text>
          <text class="address-phone">{{ order.phone }}</text>
        </view>
        <text class="address-detail">{{ order.province }}{{ order.city }}{{ order.district }}{{ order.address }}</text>
      </view>
    </view>

    <!-- 商品列表 -->
    <view class="section goods-section">
      <view class="goods-item" v-for="(detail, index) in order.details" :key="index">
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

    <!-- 订单信息 -->
    <view class="section info-section">
      <view class="info-row">
        <text class="info-label">订单编号</text>
        <text class="info-value">{{ order.orderNo }}</text>
        <text class="copy-btn" @click="copyText(order.orderNo)">复制</text>
      </view>
      <view class="info-row">
        <text class="info-label">下单时间</text>
        <text class="info-value">{{ order.createTime }}</text>
      </view>
      <view class="info-row" v-if="order.payTime">
        <text class="info-label">支付时间</text>
        <text class="info-value">{{ order.payTime }}</text>
      </view>
      <view class="info-row" v-if="order.remark">
        <text class="info-label">订单备注</text>
        <text class="info-value">{{ order.remark }}</text>
      </view>
    </view>

    <!-- 金额汇总 -->
    <view class="section amount-section">
      <view class="amount-row">
        <text class="amount-label">商品金额</text>
        <text class="amount-value">¥{{ order.orderAmount }}</text>
      </view>
      <view class="amount-row">
        <text class="amount-label">运费</text>
        <text class="amount-value">¥{{ order.freight || '0.00' }}</text>
      </view>
      <view class="amount-row total">
        <text class="amount-label">实付款</text>
        <text class="amount-value highlight">¥{{ order.payAmount }}</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar" v-if="showActions">
      <view class="action-btn" v-if="order.status === 1" @click="cancelOrder">
        <text>取消订单</text>
      </view>
      <view class="action-btn primary" v-if="order.status === 1" @click="payOrder">
        <text>去支付</text>
      </view>
      <view class="action-btn" v-if="order.status === 3" @click="confirmReceive">
        <text>确认收货</text>
      </view>
      <view class="action-btn" v-if="order.status === 4 || order.status === 5" @click="delOrder">
        <text>删除订单</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getOrder, cancelOrder, confirmReceive, delOrder, wxPay } from '@/api/mall/order'

export default {
  data() {
    return {
      orderId: '',
      order: null
    }
  },
  computed: {
    showActions() {
      if (!this.order) return false
      return [1, 3, 4, 5].includes(this.order.status)
    }
  },
  onLoad(options) {
    if (options.id) {
      this.orderId = options.id
      this.loadOrder()
    }
  },
  methods: {
    async loadOrder() {
      try {
        const res = await getOrder(this.orderId)
        if (res.data) {
          this.order = res.data
        }
      } catch (e) {
        console.error('加载订单失败', e)
      }
    },
    getStatusText(status) {
      const map = {
        1: '待付款',
        2: '待发货',
        3: '待收货',
        4: '交易完成',
        5: '交易关闭'
      }
      return map[status] || '未知'
    },
    copyText(text) {
      uni.setClipboardData({
        data: text,
        success: () => {
          this.$modal.msgSuccess('已复制')
        }
      })
    },
    async cancelOrder() {
      try {
        await this.$modal.confirm('确定取消该订单？')
      } catch (e) { return }
      try {
        await cancelOrder({ orderId: this.orderId })
        this.$modal.msgSuccess('已取消')
        this.loadOrder()
      } catch (e) {
        console.error('取消失败', e)
      }
    },
    async payOrder() {
      try {
        const res = await wxPay({ orderId: this.orderId })
        if (res.data) {
          uni.requestPayment({
            ...res.data,
            success: () => {
              this.$modal.msgSuccess('支付成功')
              this.loadOrder()
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
    async confirmReceive() {
      try {
        await this.$modal.confirm('确认已收到商品？')
      } catch (e) { return }
      try {
        await confirmReceive({ orderId: this.orderId })
        this.$modal.msgSuccess('已确认收货')
        this.loadOrder()
      } catch (e) {
        console.error('确认收货失败', e)
      }
    },
    async delOrder() {
      try {
        await this.$modal.confirm('确定删除该订单？')
      } catch (e) { return }
      try {
        await delOrder(this.orderId)
        this.$modal.msgSuccess('已删除')
        setTimeout(() => {
          this.$tab.navigateBack()
        }, 1500)
      } catch (e) {
        console.error('删除失败', e)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.order-detail {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

.status-header {
  background-color: #f2b974;
  padding: 40rpx 24rpx;
}

.status-text {
  font-size: 36rpx;
  color: #fff;
  font-weight: bold;
}

.section {
  background-color: #fff;
  margin-bottom: 20rpx;
  padding: 24rpx;
}

.courier-section {
  margin-top: 20rpx;
}

.section-label {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 12rpx;
}

.courier-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 26rpx;
  color: #666;
}

.copy-btn {
  font-size: 24rpx;
  color: #f2b974;
  margin-left: 16rpx;
}

.address-section {
  display: flex;
  align-items: flex-start;
}

.address-section .cuIcon-location {
  font-size: 40rpx;
  color: #f2b974;
  margin-right: 16rpx;
  margin-top: 4rpx;
}

.address-info {
  flex: 1;
}

.address-top {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.address-name {
  font-size: 30rpx;
  color: #333;
  font-weight: bold;
  margin-right: 20rpx;
}

.address-phone {
  font-size: 28rpx;
  color: #666;
}

.address-detail {
  font-size: 26rpx;
  color: #999;
  line-height: 1.4;
}

.goods-item {
  display: flex;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.goods-item:last-child {
  border-bottom: none;
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

.info-row {
  display: flex;
  align-items: center;
  padding: 12rpx 0;
}

.info-label {
  font-size: 26rpx;
  color: #999;
  width: 150rpx;
}

.info-value {
  flex: 1;
  font-size: 26rpx;
  color: #333;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  padding: 12rpx 0;
}

.amount-row.total {
  border-top: 1rpx solid #f5f5f5;
  padding-top: 20rpx;
  margin-top: 8rpx;
}

.amount-label {
  font-size: 28rpx;
  color: #666;
}

.amount-value {
  font-size: 28rpx;
  color: #333;
}

.amount-value.highlight {
  font-size: 32rpx;
  color: #e4393c;
  font-weight: bold;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 24rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.action-btn {
  padding: 16rpx 32rpx;
  border: 1rpx solid #ddd;
  border-radius: 40rpx;
  margin-left: 16rpx;
  font-size: 28rpx;
  color: #666;
}

.action-btn.primary {
  border-color: #f2b974;
  color: #f2b974;
}
</style>
