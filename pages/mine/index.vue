<template>
  <view class="mine-page">
    <!-- 用户信息 -->
    <view class="head-box">
      <view class="user-info" @click="goProfile">
        <!-- #ifdef MP-WEIXIN -->
        <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar" v-if="!nickname">
          <image class="user-avatar" :src="tempAvatar || '/static/images/profile.jpg'" mode="aspectFill" />
        </button>
        <image v-else class="user-avatar" :src="avatar || '/static/images/profile.jpg'" mode="aspectFill" @click.stop="changeAvatar" />
        <!-- #endif -->
        <!-- #ifndef MP-WEIXIN -->
        <image class="user-avatar" :src="avatar || '/static/images/profile.jpg'" mode="aspectFill" />
        <!-- #endif -->
        <view class="user-detail">
          <text class="user-name">{{ nickname || '未登录' }}</text>
          <view v-if="nickname" class="user-id">ID: {{ userId }}</view>
          <view v-if="!nickname" class="login-btn" @click.stop="goLogin">点击登录</view>
        </view>
      </view>
      <view class="history-link" @click="goPage('/pages/mine/track/index')">
        <view class="history-num" v-if="browseCount > 0">{{ browseCount }}</view>
        <text class="history-text">浏览记录</text>
      </view>
    </view>

    <!-- 我的订单 -->
    <view class="section">
      <view class="section-header" @click="goOrderList(0)">
        <text class="section-title">全部订单</text>
        <view class="section-more">
          <text class="more-text">查看全部</text>
          <text class="cuIcon-right more-arrow"></text>
        </view>
      </view>
      <view class="order-grid">
        <view class="order-item" @click="goOrderList(1)">
          <view class="order-icon">
            <text class="cuIcon-pay"></text>
            <view class="badge" v-if="orderNum.pendingPay > 0">{{ orderNum.pendingPay }}</view>
          </view>
          <text class="order-text">待付款</text>
        </view>
        <view class="order-item" @click="goOrderList(2)">
          <view class="order-icon">
            <text class="cuIcon-deliver"></text>
            <view class="badge" v-if="orderNum.pendingShip > 0">{{ orderNum.pendingShip }}</view>
          </view>
          <text class="order-text">待发货</text>
        </view>
        <view class="order-item" @click="goOrderList(3)">
          <view class="order-icon">
            <text class="cuIcon-form"></text>
            <view class="badge" v-if="orderNum.pendingReceive > 0">{{ orderNum.pendingReceive }}</view>
          </view>
          <text class="order-text">待收货</text>
        </view>
        <view class="order-item" @click="goOrderList(4)">
          <view class="order-icon">
            <text class="cuIcon-check"></text>
          </view>
          <text class="order-text">已收货</text>
        </view>
        <view class="order-item" @click="goAfterSale">
          <view class="order-icon">
            <text class="cuIcon-refund"></text>
          </view>
          <text class="order-text">售后</text>
        </view>
      </view>
    </view>

    <!-- 分隔条 -->
    <view class="bgcc"></view>

    <!-- 更多服务 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">更多服务</text>
      </view>
      <view class="more-grid">
        <view class="more-item" @click="goPage('/pages/address/list/index')">
          <view class="more-icon"><text class="cuIcon-location"></text></view>
          <text class="more-text">收货地址</text>
        </view>
        <view class="more-item" @click="goPage('/pages/mine/coupon/index')">
          <view class="more-icon"><text class="cuIcon-ticket"></text></view>
          <text class="more-text">优惠券</text>
        </view>
        <view class="more-item" @click="goPage('/pages/mine/collect/index')">
          <view class="more-icon"><text class="cuIcon-like"></text></view>
          <text class="more-text">收藏商品</text>
        </view>
        <view class="more-item" @click="goPage('/pages/mine/setting/index')">
          <view class="more-icon"><text class="cuIcon-settings"></text></view>
          <text class="more-text">设置</text>
        </view>
      </view>
    </view>

    <!-- 分隔条 -->
    <view class="bgcc"></view>

    <!-- 客服热线 -->
    <view class="service-line" @click="callService">
      <text class="cuIcon-phone service-icon"></text>
      <text class="service-text">客服热线</text>
      <text class="cuIcon-right"></text>
    </view>

    <!-- 分隔条 -->
    <view class="bgcc"></view>

    <!-- 底部占位 -->
    <view class="bottom-space"></view>

    <!-- 自定义 Tab 栏 -->
    <tab-bar />
  </view>
</template>

<script>
import { getOrderNum } from '@/api/mall/order'
import { useUserStore } from '@/store/modules/user'

export default {
  setup() {
    const userStore = useUserStore()
    return { userStore }
  },
  data() {
    return {
      orderNum: {
        pendingPay: 0,
        pendingShip: 0,
        pendingReceive: 0
      },
      browseCount: 0,
      tempAvatar: ''
    }
  },
  computed: {
    nickname() {
      return this.userStore.name
    },
    avatar() {
      return this.userStore.avatar
    },
    userId() {
      return this.userStore.id
    }
  },
  onShow() {
    if (this.userStore.token) {
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
    },
    callService() {
      // TODO: 后端加好店铺信息接口后改为动态获取
      uni.makePhoneCall({
        phoneNumber: '400-000-0000',
        fail: () => {}
      })
    },
    // 选择微信头像
    onChooseAvatar(e) {
      const avatarUrl = e.detail.avatarUrl
      this.tempAvatar = avatarUrl
      // 保存到本地
      uni.setStorageSync('tempAvatar', avatarUrl)
      // 提示用户去登录
      this.$modal.msgSuccess('头像已获取，请点击登录')
    },
    // 已登录用户更换头像
    changeAvatar() {
      // #ifdef MP-WEIXIN
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0]
          // 这里可以上传到服务器，暂时只本地保存
          this.userStore.setAvatar(tempFilePath)
          uni.setStorageSync('avatar', tempFilePath)
        }
      })
      // #endif
    }
  }
}
</script>

<style lang="scss" scoped>
.mine-page {
  min-height: 100vh;
  background-color: #fff;
  padding-bottom: 130rpx;
}

// 用户信息区域
.head-box {
  position: relative;
  width: 100%;
  padding: 60rpx 32rpx 40rpx;
  padding-top: calc(60rpx + var(--status-bar-height));
  background-color: #fff;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
}

// 头像选择按钮（小程序）
.avatar-btn {
  width: 120rpx;
  height: 120rpx;
  padding: 0;
  margin: 0;
  background: none;
  border: none;
  line-height: normal;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-btn::after {
  border: none;
}

.avatar-btn .user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
}

.user-detail {
  margin-left: 24rpx;
  flex: 1;
}

.user-name {
  font-size: 31rpx;
  font-weight: 500;
  color: #2D2D2D;
  display: block;
}

.user-id {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.login-btn {
  margin-top: 12rpx;
  font-size: 28rpx;
  color: #999;
}

.history-link {
  position: absolute;
  right: 32rpx;
  top: calc(60rpx + var(--status-bar-height) + 30rpx);
  text-align: center;
}

.history-num {
  font-size: 40rpx;
  font-weight: 500;
  color: #2D2D2D;
}

.history-text {
  font-size: 20rpx;
  color: #999;
}

// 分隔条
.bgcc {
  width: 100%;
  height: 10rpx;
  background: #eee;
}

// 区块
.section {
  background: #fff;
  padding: 0 32rpx;
}

.section-header {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #282828;
}

.section-more {
  display: flex;
  align-items: center;
}

.more-text {
  font-size: 24rpx;
  color: #999;
}

.more-arrow {
  font-size: 24rpx;
  color: #ccc;
  margin-left: 8rpx;
}

// 订单网格
.order-grid {
  display: flex;
  padding-bottom: 30rpx;
}

.order-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.order-icon {
  position: relative;
  font-size: 48rpx;
  color: #333;
  margin-bottom: 12rpx;
}

.badge {
  position: absolute;
  top: -10rpx;
  right: -16rpx;
  min-width: 32rpx;
  height: 32rpx;
  padding: 0 8rpx;
  background: #e33e33;
  color: #fff;
  font-size: 20rpx;
  border-radius: 16rpx;
  text-align: center;
  line-height: 32rpx;
}

.order-text {
  font-size: 24rpx;
  color: #666;
}

// 更多服务网格
.more-grid {
  display: flex;
  flex-wrap: wrap;
  padding-bottom: 20rpx;
}

.more-item {
  width: 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30rpx;
}

.more-icon {
  font-size: 48rpx;
  color: #333;
  margin-bottom: 12rpx;
}

.more-text {
  font-size: 24rpx;
  color: #333;
}

// 客服热线
.service-line {
  display: flex;
  align-items: center;
  height: 100rpx;
  padding: 0 32rpx;
  background: #fff;
}

.service-icon {
  font-size: 36rpx;
  color: #333;
  margin-right: 16rpx;
}

.service-text {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.service-line .cuIcon-right {
  font-size: 28rpx;
  color: #ccc;
}

// 底部占位
.bottom-space {
  width: 100%;
  height: 120rpx;
  background: #fff;
}
</style>
