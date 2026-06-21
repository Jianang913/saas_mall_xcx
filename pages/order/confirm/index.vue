<template>
  <view class="confirm-page">
    <!-- 收货地址 -->
    <view class="address-section" @click="selectAddress">
      <view v-if="address" class="address-info">
        <view class="address-top">
          <text class="address-name">{{ address.consignee }}</text>
          <text class="address-phone">{{ address.phone }}</text>
        </view>
        <text class="address-detail">{{ address.province }}{{ address.city }}{{ address.district }}{{ address.address }}</text>
      </view>
      <view v-else class="no-address">
        <text>请选择收货地址</text>
      </view>
      <text class="cuIcon-right"></text>
    </view>

    <!-- 商品列表 -->
    <view class="goods-section">
      <view class="goods-item" v-for="(item, index) in orderGoods" :key="index">
        <image class="goods-image" :src="item.goodsImage" mode="aspectFill" />
        <view class="goods-info">
          <text class="goods-name">{{ item.goodsName }}</text>
          <text class="goods-spec" v-if="item.specValues">{{ item.specValues }}</text>
          <view class="goods-bottom">
            <text class="goods-price">¥{{ item.price }}</text>
            <text class="goods-qty">x{{ item.quantity }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 备注 -->
    <view class="remark-section">
      <text class="remark-label">订单备注</text>
      <input class="remark-input" v-model="remark" placeholder="选填，建议先与商家沟通" maxlength="40" />
    </view>

    <!-- 金额汇总 -->
    <view class="amount-section">
      <view class="amount-row">
        <text class="amount-label">商品金额</text>
        <text class="amount-value">¥{{ goodsAmount }}</text>
      </view>
      <view class="amount-row">
        <text class="amount-label">运费</text>
        <text class="amount-value">¥{{ freight }}</text>
      </view>
    </view>

    <!-- 底部提交栏 -->
    <view class="submit-bar">
      <view class="submit-info">
        <text class="submit-count">共{{ totalCount }}件</text>
        <text class="submit-label">合计：</text>
        <text class="submit-price">¥{{ totalAmount }}</text>
      </view>
      <view class="submit-btn" @click="submitOrder">
        <text>提交订单</text>
      </view>
    </view>
  </view>
</template>

<script>
import { generateOrder } from '@/api/mall/order'
import { listAddress } from '@/api/mall/address'

export default {
  data() {
    return {
      orderGoods: [],
      address: null,
      remark: '',
      freight: '0.00',
      orderType: 'cart' // cart 或 detail
    }
  },
  computed: {
    goodsAmount() {
      return this.orderGoods.reduce((sum, item) => {
        return sum + (parseFloat(item.price) * item.quantity)
      }, 0).toFixed(2)
    },
    totalCount() {
      return this.orderGoods.reduce((sum, item) => sum + item.quantity, 0)
    },
    totalAmount() {
      return (parseFloat(this.goodsAmount) + parseFloat(this.freight)).toFixed(2)
    }
  },
  onLoad(options) {
    this.orderType = options.type || 'cart'
    this.loadOrderGoods()
    this.loadDefaultAddress()
  },
  onShow() {
    // 从地址选择页返回时，更新选中的地址
    const selectedAddress = uni.getStorageSync('selectedAddress')
    if (selectedAddress) {
      this.address = JSON.parse(selectedAddress)
      uni.removeStorageSync('selectedAddress')
    }
  },
  methods: {
    loadOrderGoods() {
      const carts = uni.getStorageSync('carts')
      if (carts) {
        this.orderGoods = JSON.parse(carts)
      }
    },
    async loadDefaultAddress() {
      try {
        const res = await listAddress({ pageSize: 100 })
        if (res.rows && res.rows.length) {
          // 优先使用默认地址
          this.address = res.rows.find(item => item.defaultFlag === '1') || res.rows[0]
        }
      } catch (e) {
        console.error('加载地址失败', e)
      }
    },
    selectAddress() {
      this.$tab.navigateTo('/pages/address/list/index?select=1')
    },
    async submitOrder() {
      if (!this.address) {
        this.$modal.msgError('请选择收货地址')
        return
      }
      if (!this.orderGoods.length) {
        this.$modal.msgError('请选择商品')
        return
      }

      try {
        const data = {
          addressId: this.address.addressId,
          remark: this.remark,
          goodsList: this.orderGoods.map(item => ({
            goodsId: item.goodsId,
            goodsSpeId: item.goodsSpeId,
            quantity: item.quantity
          }))
        }

        const res = await generateOrder(data)
        if (res.data) {
          // 清空购物车缓存
          uni.removeStorageSync('carts')
          // 跳转到订单详情或支付
          this.$modal.msgSuccess('下单成功')
          setTimeout(() => {
            this.$tab.redirectTo('/pages/order/detail/index?id=' + res.data.orderId)
          }, 1500)
        }
      } catch (e) {
        console.error('提交订单失败', e)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.confirm-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

.address-section {
  display: flex;
  align-items: center;
  background-color: #fff;
  padding: 24rpx;
  margin-bottom: 20rpx;
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

.no-address {
  flex: 1;
  font-size: 28rpx;
  color: #999;
}

.goods-section {
  background-color: #fff;
  padding: 24rpx;
  margin-bottom: 20rpx;
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
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
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
  margin-top: 8rpx;
}

.goods-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.goods-price {
  font-size: 30rpx;
  color: #e4393c;
  font-weight: bold;
}

.goods-qty {
  font-size: 26rpx;
  color: #999;
}

.remark-section {
  display: flex;
  align-items: center;
  background-color: #fff;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.remark-label {
  font-size: 28rpx;
  color: #333;
  margin-right: 20rpx;
  white-space: nowrap;
}

.remark-input {
  flex: 1;
  font-size: 28rpx;
}

.amount-section {
  background-color: #fff;
  padding: 24rpx;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.amount-row:last-child {
  margin-bottom: 0;
}

.amount-label {
  font-size: 28rpx;
  color: #666;
}

.amount-value {
  font-size: 28rpx;
  color: #333;
}

.submit-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.submit-info {
  display: flex;
  align-items: baseline;
}

.submit-count {
  font-size: 26rpx;
  color: #999;
  margin-right: 12rpx;
}

.submit-label {
  font-size: 28rpx;
  color: #333;
}

.submit-price {
  font-size: 36rpx;
  color: #e4393c;
  font-weight: bold;
}

.submit-btn {
  padding: 16rpx 48rpx;
  background-color: #e4393c;
  border-radius: 40rpx;
  color: #fff;
  font-size: 30rpx;
}
</style>
