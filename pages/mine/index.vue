<template>
  <view class="mine-page">
    <!-- 用户信息 -->
    <view class="user-header">
      <view class="user-info" @click="goProfile">
        <image class="user-avatar" :src="avatar || '/static/images/default-avatar.png'" mode="aspectFill" />
        <view class="user-detail">
          <text class="user-name">{{ nickname || '未登录' }}</text>
          <text class="user-id" v-if="nickname">ID: {{ userId }}</text>
          <view v-if="!nickname" class="login-btn" @click.stop="goLogin">
            <text>点击登录</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 订单入口 -->
    <view class="order-section">
      <view class="section-header" @click="goOrderList(0)">
        <text class="section-title">我的订单</text>
        <text class="section-more">全部订单 <text class="cuIcon-right"></text></text>
      </view>
      <view class="order-status-grid">
        <view class="status-item" @click="goOrderList(1)">
          <view class="status-icon-wrap">
            <text class="cuIcon-pay"></text>
            <text class="badge" v-if="orderNum.pendingPay > 0">{{ orderNum.pendingPay }}</text>
          </view>
          <text class="status-text">待付款</text>
        </view>
        <view class="status-item" @click="goOrderList(2)">
          <view class="status-icon-wrap">
            <text class="cuIcon-deliver"></text>
            <text class="badge" v-if="orderNum.pendingShip > 0">{{ orderNum.pendingShip }}</text>
          </view>
          <text class="status-text">待发货</text>
        </view>
        <view class="status-item" @click="goOrderList(3)">
          <view class="status-icon-wrap">
            <text class="cuIcon-package"></text>
            <text class="badge" v-if="orderNum.pendingReceive > 0">{{ orderNum.pendingReceive }}</text>
          </view>
          <text class="status-text">待收货</text>
        </view>
        <view class="status-item" @click="goOrderList(4)">
          <view class="status-icon-wrap">
            <text class="cuIcon-check"></text>
          </view>
          <text class="status-text">已完成</text>
        </view>
        <view class="status-item" @click="goAfterSale">
          <view class="status-icon-wrap">
            <text class="cuIcon-refund"></text>
          </view>
          <text class="status-text">售后</text>
        </view>
      </view>
    </view>

    <!-- 功能入口 -->
    <view class="function-section">
      <view class="function-item" @click="goPage('/pages/address/list/index')">
        <text class="cuIcon-location function-icon"></text>
        <text class="function-text">收货地址</text>
        <text class="cuIcon-right"></text>
      </view>
      <view class="function-item" @click="goPage('/pages/mine/coupon/index')">
        <text class="cuIcon-ticket function-icon"></text>
        <text class="function-text">优惠券</text>
        <text class="cuIcon-right"></text>
      </view>
      <view class="function-item" @click="goPage('/pages/mine/collect/index')">
        <text class="cuIcon-like function-icon"></text>
        <text class="function-text">我的收藏</text>
        <text class="cuIcon-right"></text>
      </view>
      <view class="function-item" @click="goPage('/pages/mine/track/index')">
        <text class="cuIcon-time function-icon"></text>
        <text class="function-text">浏览记录</text>
        <text class="cuIcon-right"></text>
      </view>
    </view>

    <!-- 其他 -->
    <view class="function-section">
      <view class="function-item" @click="goPage('/pages/mine/setting/index')">
        <text class="cuIcon-settings function-icon"></text>
        <text class="function-text">设置</text>
        <text class="cuIcon-right"></text>
      </view>
    </view>

    <!-- 自定义 Tab 栏 -->
    <tab-bar />
  </view>
</template>

<script>
import { getOrderNum } from '@/api/mall/order'

export default {
  data() {
    return {
      orderNum: {
        pendingPay: 0,
        pendingShip: 0,
        pendingReceive: 0
      }
    }
  },
  computed: {
    nickname() {
      return this.$store.getters.name
    },
    avatar() {
      return this.$store.getters.avatar
    },
    userId() {
      return this.$store.getters.id
    }
  },
  onShow() {
    // #ifdef MP-WEIXIN
    uni.hideTabBar({ animation: false })
    // #endif
    if (this.$store.getters.token) {
      this.loadOrderNum()
    }
  },
  methods: {
    async loadOrderNum() {
      try {
        const res = await getOrderNum()
        if (res.data) {
          this.orderNum = res.data
        }
      } catch (e) {
        console.error(e)
      }
    },
    goLogin() {
      this.$tab.navigateTo('/pages/login')
    },
    goProfile() {
      if (!this.nickname) {
        this.goLogin()
        return
      }
      this.$tab.navigateTo('/pages/mine/info/index')
    },
    goOrderList(status) {
      if (!this.nickname) {
        this.goLogin()
        return
      }
      this.$tab.navigateTo('/pages/order/list/index?status=' + status)
    },
    goAfterSale() {
      if (!this.nickname) {
        this.goLogin()
        return
      }
      this.$tab.navigateTo('/pages/order/afterSale/index')
    },
    goPage(url) {
      this.$tab.navigateTo(url)
    }
  }
}
</script>

<style lang="scss" scoped>
.mine-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 130rpx;
}

.user-header {
  background: linear-gradient(135deg, #f2b974, #e4a04e);
  padding: 60rpx 24rpx 40rpx;
  padding-top: calc(60rpx + var(--status-bar-height));
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.5);
}

.user-detail {
  margin-left: 24rpx;
}

.user-name {
  font-size: 36rpx;
  color: #fff;
  font-weight: bold;
  display: block;
}

.user-id {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8rpx;
  display: block;
}

.login-btn {
  margin-top: 12rpx;
  background: rgba(255, 255, 255, 0.3);
  padding: 8rpx 24rpx;
  border-radius: 24rpx;
  display: inline-block;
}

.login-btn text {
  font-size: 24rpx;
  color: #fff;
}

.order-section {
  background-color: #fff;
  margin: 20rpx;
  border-radius: 12rpx;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.section-title {
  font-size: 30rpx;
  color: #333;
  font-weight: bold;
}

.section-more {
  font-size: 26rpx;
  color: #999;
}

.order-status-grid {
  display: flex;
  padding: 24rpx 0;
}

.status-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.status-icon-wrap {
  position: relative;
  font-size: 44rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.badge {
  position: absolute;
  top: -10rpx;
  right: -16rpx;
  font-size: 20rpx;
  color: #fff;
  background-color: #e4393c;
  padding: 2rpx 8rpx;
  border-radius: 16rpx;
  min-width: 28rpx;
  text-align: center;
}

.status-text {
  font-size: 24rpx;
  color: #666;
}

.function-section {
  background-color: #fff;
  margin: 0 20rpx 20rpx;
  border-radius: 12rpx;
  overflow: hidden;
}

.function-item {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.function-item:last-child {
  border-bottom: none;
}

.function-icon {
  font-size: 36rpx;
  color: #f2b974;
  margin-right: 16rpx;
}

.function-text {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.function-item .cuIcon-right {
  font-size: 28rpx;
  color: #ccc;
}
</style>
