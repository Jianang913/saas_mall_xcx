<template>
  <!-- 调试信息：未配置时显示提示 -->
  <view class="card-module-debug" v-if="!hasConfig && !hasUserCard">
    <text class="debug-text">名片组件（请配置企业名片用户ID）</text>
  </view>
  <view class="card-module" v-else-if="cardInfo">
    <!-- 样式1：经典名片（垂直居中） -->
    <view class="card-style-1" v-if="cardStyle === 1" @click="goCardDetail">
      <view class="card-avatar-wrapper">
        <image class="card-avatar" :src="cardInfo.portrait || '/static/images/profile.jpg'" mode="aspectFill" />
      </view>
      <view class="card-name">{{ cardInfo.realName }}</view>
      <view class="card-position" v-if="cardInfo.position">{{ cardInfo.position }}</view>
      <view class="card-divider"></view>
      <view class="card-stats">
        <view class="stats-item">
          <text class="stats-num">{{ extendInfo.views || 0 }}</text>
          <text class="stats-label">浏览</text>
        </view>
        <view class="stats-item">
          <text class="stats-num">{{ extendInfo.thumbsUp || 0 }}</text>
          <text class="stats-label">点赞</text>
        </view>
        <view class="stats-item">
          <text class="stats-num">{{ extendInfo.forward || 0 }}</text>
          <text class="stats-label">转发</text>
        </view>
      </view>
      <view class="card-actions">
        <view class="action-btn" @click.stop="callPhone">
          <text>打电话</text>
        </view>
        <view class="action-btn primary" @click.stop="copyWechat">
          <text>加微信</text>
        </view>
      </view>
    </view>

    <!-- 样式2：商务名片（头像浮动） -->
    <view class="card-style-2" v-else-if="cardStyle === 2" @click="goCardDetail">
      <view class="card-avatar-float">
        <image class="card-avatar" :src="cardInfo.portrait || '/static/images/profile.jpg'" mode="aspectFill" />
      </view>
      <view class="card-body">
        <view class="card-name">{{ cardInfo.realName }}</view>
        <view class="card-position" v-if="cardInfo.position">{{ cardInfo.position }}</view>
        <view class="card-company" v-if="cardInfo.company">{{ cardInfo.company }}</view>
        <view class="card-phone" v-if="cardInfo.phone">
          <text class="cuIcon-phone"></text>
          <text>{{ cardInfo.phone }}</text>
        </view>
      </view>
      <view class="card-actions-vertical">
        <view class="action-icon" @click.stop="callPhone">
          <text class="cuIcon-phone"></text>
        </view>
        <view class="action-icon" @click.stop="copyWechat">
          <text class="cuIcon-weixin"></text>
        </view>
      </view>
    </view>

    <!-- 样式3：简约卡片（水平布局） -->
    <view class="card-style-3" v-else @click="goCardDetail">
      <view class="card-left">
        <image class="card-avatar" :src="cardInfo.portrait || '/static/images/profile.jpg'" mode="aspectFill" />
      </view>
      <view class="card-center">
        <view class="card-name">{{ cardInfo.realName }}</view>
        <view class="card-desc" v-if="cardInfo.position">{{ cardInfo.position }} · {{ cardInfo.company }}</view>
        <view class="card-stats-mini">
          <text class="stats-text">{{ extendInfo.views || 0 }}浏览</text>
          <text class="stats-text">{{ extendInfo.thumbsUp || 0 }}点赞</text>
        </view>
      </view>
      <view class="card-right">
        <view class="action-btn-small" @click.stop="callPhone">
          <text>联系</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getCardByUserId } from '@/api/mall/card'
import { getToken } from '@/utils/auth'

export default {
  name: 'CardModule',
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      cardInfo: null,
      extendInfo: {},
      cardStyle: 1,
      hasConfig: false,
      hasUserCard: false
    }
  },
  created() {
    this.loadCard()
  },
  methods: {
    async loadCard() {
      const moduleData = this.data || {}
      let config = {}
      if (moduleData.style) {
        try {
          config = typeof moduleData.style === 'string' ? JSON.parse(moduleData.style) : moduleData.style
        } catch (e) {
          console.error('解析名片配置失败:', e)
        }
      }
      this.cardStyle = config.style || 1

      // 场景1：URL带了userId参数（分享场景）
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const pageParams = currentPage.options || {}
      const shareUserId = pageParams.userId

      if (shareUserId) {
        console.log('场景1：通过分享链接加载名片，userId:', shareUserId)
        await this.loadCardByUserId(shareUserId)
        return
      }

      // 场景2：当前登录用户有名片
      if (getToken()) {
        const app = getApp()
        const currentUserId = app.globalData.userId || uni.getStorageSync('userId')
        if (currentUserId) {
          console.log('场景2：尝试加载当前用户的名片，userId:', currentUserId)
          const success = await this.loadCardByUserId(currentUserId)
          if (success) {
            this.hasUserCard = true
            return
          }
        }
      }

      // 场景3：加载默认企业名片（不传userId，后端返回默认名片）
      console.log('场景3：加载默认企业名片')
      this.hasConfig = true
      await this.loadDefaultCard()
    },

    async loadDefaultCard() {
      try {
        const res = await getCardByUserId({}) // 不传userId，后端返回默认名片
        if (res.code === 200 && res.data) {
          this.cardInfo = res.data
          this.extendInfo = res.data.extend || {}
          return true
        }
      } catch (e) {
        console.error('加载默认名片失败', e)
      }
      return false
    },

    async loadCardByUserId(userId) {
      try {
        const res = await getCardByUserId({ userId })
        if (res.code === 200 && res.data) {
          this.cardInfo = res.data
          this.extendInfo = res.data.extend || {}
          return true
        }
      } catch (e) {
        console.error('加载名片失败', e)
      }
      return false
    },

    goCardDetail() {
      if (this.cardInfo) {
        uni.navigateTo({
          url: '/pages/card/index?cardId=' + this.cardInfo.businessCardId
        })
      }
    },

    callPhone() {
      if (this.cardInfo.phone) {
        uni.makePhoneCall({
          phoneNumber: this.cardInfo.phone,
          fail: () => {}
        })
      }
    },

    copyWechat() {
      if (this.cardInfo.weChatNu) {
        uni.setClipboardData({
          data: this.cardInfo.weChatNu,
          success: () => {
            uni.showToast({ title: '微信号已复制', icon: 'success' })
          }
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.card-module {
  padding: 24rpx;
}

// 调试信息
.card-module-debug {
  padding: 40rpx 24rpx;
  background-color: #fffbe6;
  border: 1rpx solid #ffe58f;
  border-radius: 12rpx;
  margin: 24rpx;
  text-align: center;
}

.debug-text {
  font-size: 24rpx;
  color: #d48806;
}

// 样式1：经典名片（垂直居中）
.card-style-1 {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 48rpx 32rpx 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-avatar-wrapper {
  width: 128rpx;
  height: 128rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 4rpx solid #f0f0f0;
  margin-bottom: 20rpx;
}

.card-avatar {
  width: 100%;
  height: 100%;
}

.card-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 8rpx;
}

.card-position {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 24rpx;
}

.card-divider {
  width: 80rpx;
  height: 4rpx;
  background: linear-gradient(90deg, #f2b974, #e6a05c);
  border-radius: 2rpx;
  margin-bottom: 24rpx;
}

.card-stats {
  display: flex;
  justify-content: center;
  gap: 60rpx;
  margin-bottom: 32rpx;
  width: 100%;
}

.stats-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stats-num {
  font-size: 36rpx;
  font-weight: bold;
  color: #f2b974;
  line-height: 1.2;
}

.stats-label {
  font-size: 22rpx;
  color: #999999;
  margin-top: 4rpx;
}

.card-actions {
  display: flex;
  gap: 24rpx;
  width: 100%;
}

.action-btn {
  flex: 1;
  height: 76rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 38rpx;
  font-size: 28rpx;
  background: #f5f5f5;
  color: #666666;

  &.primary {
    background: linear-gradient(135deg, #f2b974, #e6a05c);
    color: #ffffff;
  }
}

// 样式2：商务名片（头像浮动）
.card-style-2 {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 80rpx 32rpx 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  position: relative;
  display: flex;
}

.card-avatar-float {
  position: absolute;
  top: -48rpx;
  left: 32rpx;
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 4rpx solid #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.card-body {
  flex: 1;
}

.card-style-2 .card-name {
  font-size: 32rpx;
  margin-bottom: 8rpx;
}

.card-company {
  font-size: 24rpx;
  color: #666666;
  margin-bottom: 16rpx;
}

.card-phone {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #999999;

  .cuIcon-phone {
    margin-right: 8rpx;
    color: #f2b974;
  }
}

.card-actions-vertical {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  justify-content: center;
}

.action-icon {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 50%;
  font-size: 28rpx;
  color: #f2b974;
}

// 样式3：简约卡片（水平布局）
.card-style-3 {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
}

.card-left {
  margin-right: 20rpx;
}

.card-style-3 .card-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
}

.card-center {
  flex: 1;
}

.card-style-3 .card-name {
  font-size: 30rpx;
  margin-bottom: 8rpx;
}

.card-desc {
  font-size: 24rpx;
  color: #666666;
  margin-bottom: 12rpx;
}

.card-stats-mini {
  display: flex;
  gap: 20rpx;
}

.stats-text {
  font-size: 22rpx;
  color: #999999;
}

.card-right {
  margin-left: 16rpx;
}

.action-btn-small {
  padding: 12rpx 28rpx;
  background: linear-gradient(135deg, #f2b974, #e6a05c);
  border-radius: 28rpx;
  font-size: 24rpx;
  color: #ffffff;
}
</style>
