<template>
  <view class="card-page">
    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="nav-back" @click="goBack">
          <text class="cuIcon-back"></text>
        </view>
        <text class="nav-title">名片</text>
        <view class="nav-share" @click="onShare">
          <text class="cuIcon-share"></text>
        </view>
      </view>
    </view>
    <view :style="{ height: (statusBarHeight + 44) + 'px' }"></view>

    <!-- 名片内容 -->
    <scroll-view scroll-y class="card-scroll" v-if="cardInfo">
      <!-- 名片卡片 - 主题1：经典白 -->
      <view class="card-section" v-if="theme === 1">
        <view class="card-theme-1">
          <view class="card-main">
            <view class="card-info-left">
              <view class="card-name">{{ cardInfo.realName }}</view>
              <view class="card-tags">
                <text class="card-tag" v-if="cardInfo.position">{{ cardInfo.position }}</text>
                <text class="card-tag" v-if="cardInfo.department">{{ cardInfo.department }}</text>
              </view>
            </view>
            <view class="card-avatar-right">
              <image class="card-avatar" :src="cardInfo.portrait || '/static/images/profile.jpg'" mode="aspectFill" />
            </view>
          </view>
          <view class="card-contact-list">
            <view class="contact-item" v-if="cardInfo.company">
              <text class="contact-icon">🏢</text>
              <text class="contact-text">{{ cardInfo.company }}</text>
            </view>
            <view class="contact-item" v-if="cardInfo.phone" @click="callPhone">
              <text class="contact-icon">📱</text>
              <text class="contact-text">{{ cardInfo.phone }}</text>
            </view>
            <view class="contact-item" v-if="cardInfo.email" @click="copyEmail">
              <text class="contact-icon">📧</text>
              <text class="contact-text">{{ cardInfo.email }}</text>
            </view>
            <view class="contact-item" v-if="cardInfo.address" @click="openLocation">
              <text class="contact-icon">📍</text>
              <text class="contact-text">{{ cardInfo.address }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 名片卡片 - 主题2：深色 -->
      <view class="card-section" v-else-if="theme === 2">
        <view class="card-theme-2">
          <view class="card-main">
            <view class="card-info-left">
              <view class="card-name">{{ cardInfo.realName }}</view>
              <view class="card-tags">
                <text class="card-tag">{{ cardInfo.position }}</text>
              </view>
            </view>
            <view class="card-avatar-right">
              <image class="card-avatar" :src="cardInfo.portrait || '/static/images/profile.jpg'" mode="aspectFill" />
            </view>
          </view>
          <view class="card-contact-list">
            <view class="contact-item" v-if="cardInfo.phone" @click="callPhone">
              <text class="contact-icon">📱</text>
              <text class="contact-text">{{ cardInfo.phone }}</text>
            </view>
            <view class="contact-item" v-if="cardInfo.email" @click="copyEmail">
              <text class="contact-icon">📧</text>
              <text class="contact-text">{{ cardInfo.email }}</text>
            </view>
            <view class="contact-item" v-if="cardInfo.address" @click="openLocation">
              <text class="contact-icon">📍</text>
              <text class="contact-text">{{ cardInfo.address }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 名片卡片 - 主题3：渐变 -->
      <view class="card-section" v-else>
        <view class="card-theme-3">
          <view class="card-main">
            <view class="card-avatar-left">
              <image class="card-avatar" :src="cardInfo.portrait || '/static/images/profile.jpg'" mode="aspectFill" />
            </view>
            <view class="card-info-right">
              <view class="card-name">{{ cardInfo.realName }}</view>
              <view class="card-tags">
                <text class="card-tag" v-if="cardInfo.position">{{ cardInfo.position }}</text>
                <text class="card-tag" v-if="cardInfo.department">{{ cardInfo.department }}</text>
              </view>
            </view>
          </view>
          <view class="card-contact-list">
            <view class="contact-item" v-if="cardInfo.phone" @click="callPhone">
              <text class="contact-icon">📱</text>
              <text class="contact-text">{{ cardInfo.phone }}</text>
            </view>
            <view class="contact-item" v-if="cardInfo.email" @click="copyEmail">
              <text class="contact-icon">📧</text>
              <text class="contact-text">{{ cardInfo.email }}</text>
            </view>
            <view class="contact-item" v-if="cardInfo.address" @click="openLocation">
              <text class="contact-icon">📍</text>
              <text class="contact-text">{{ cardInfo.address }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 互动功能区 -->
      <view class="action-section">
        <view class="action-grid">
          <view class="action-item" @click="onThumbsUp">
            <view class="action-icon-wrapper" :class="{ active: isThumbsUp }">
              <text class="cuIcon-appreciate"></text>
            </view>
            <text class="action-label">靠谱</text>
            <text class="action-count">{{ extendInfo.thumbsUp || 0 }}</text>
          </view>
          <view class="action-item" @click="callPhone">
            <view class="action-icon-wrapper">
              <text class="cuIcon-phone"></text>
            </view>
            <text class="action-label">打电话</text>
            <text class="action-count">&nbsp;</text>
          </view>
          <view class="action-item" @click="copyWechat">
            <view class="action-icon-wrapper">
              <text class="cuIcon-weixin"></text>
            </view>
            <text class="action-label">加微信</text>
            <text class="action-count">&nbsp;</text>
          </view>
          <view class="action-item" @click="onShare">
            <view class="action-icon-wrapper">
              <text class="cuIcon-share"></text>
            </view>
            <text class="action-label">推荐TA</text>
            <text class="action-count">&nbsp;</text>
          </view>
        </view>
        <view class="view-count">
          <text class="cuIcon-attention"></text>
          <text>{{ extendInfo.views || 0 }}人浏览</text>
        </view>
      </view>

      <!-- 个人简介 -->
      <view class="section-card" v-if="cardInfo.introduce">
        <view class="section-title">
          <text>个人简介</text>
        </view>
        <view class="section-content">
          <text class="introduce-text">{{ cardInfo.introduce }}</text>
        </view>
      </view>

      <!-- 名片照片 -->
      <view class="section-card" v-if="imgList && imgList.length">
        <view class="section-title">
          <text>照片</text>
        </view>
        <view class="photo-grid">
          <image
            class="photo-item"
            v-for="(img, index) in imgList"
            :key="index"
            :src="img.img"
            mode="aspectFill"
            @click="previewImage(index)"
          />
        </view>
      </view>

      <!-- 统计数据 -->
      <view class="section-card">
        <view class="section-title">
          <text>数据统计</text>
        </view>
        <view class="stats-grid">
          <view class="stats-item">
            <text class="stats-num">{{ extendInfo.views || 0 }}</text>
            <text class="stats-label">浏览</text>
          </view>
          <view class="stats-item">
            <text class="stats-num">{{ extendInfo.thumbsUp || 0 }}</text>
            <text class="stats-label">靠谱</text>
          </view>
          <view class="stats-item">
            <text class="stats-num">{{ extendInfo.forward || 0 }}</text>
            <text class="stats-label">转发</text>
          </view>
          <view class="stats-item">
            <text class="stats-num">{{ extendInfo.orderNum || 0 }}</text>
            <text class="stats-label">订单</text>
          </view>
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar" v-if="cardInfo">
      <view class="bar-btn" @click="callPhone">
        <text class="cuIcon-phone"></text>
        <text>拨打电话</text>
      </view>
      <view class="bar-btn primary" @click="copyWechat">
        <text class="cuIcon-weixin"></text>
        <text>添加微信</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getCardByUserId, getCardDetail, addThumbsUp, addForward, readAction } from '@/api/mall/card'

export default {
  data() {
    return {
      statusBarHeight: 0,
      cardId: null,
      userId: null,
      cardInfo: null,
      extendInfo: {},
      imgList: [],
      theme: 1,
      isThumbsUp: false,
      startTime: 0
    }
  },
  onLoad(options) {
    const app = getApp()
    this.statusBarHeight = app.globalData.statusBarHeight || 0

    if (options.cardId) {
      this.cardId = options.cardId
      this.loadCardDetail(options.cardId)
    } else if (options.userId) {
      this.userId = options.userId
      this.loadCardByUserId(options.userId)
    }
  },
  onShow() {
    this.startTime = Date.now()
  },
  onUnload() {
    if (this.cardId && this.startTime) {
      const duration = Math.floor((Date.now() - this.startTime) / 1000)
      if (duration > 0) {
        readAction({ businessCardId: this.cardId, duration })
      }
    }
  },
  methods: {
    async loadCardByUserId(userId) {
      try {
        const res = await getCardByUserId({ userId })
        if (res.code === 200 && res.data) {
          this.cardInfo = res.data
          this.cardId = res.data.businessCardId
          this.theme = res.data.theme || 1
          this.loadCardDetail(this.cardId)
        }
      } catch (e) {
        console.error('加载名片失败', e)
      }
    },
    async loadCardDetail(cardId) {
      try {
        const res = await getCardDetail(cardId)
        if (res.code === 200 && res.data) {
          this.cardInfo = res.data
          this.theme = res.data.theme || 1
          this.extendInfo = res.data.extend || {}
          this.imgList = res.data.imgList || []
        }
      } catch (e) {
        console.error('加载名片详情失败', e)
      }
    },
    goBack() {
      uni.navigateBack()
    },
    onShare() {
      // 分享给好友
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
            this.$modal.msgSuccess('微信号已复制')
          }
        })
      }
    },
    copyEmail() {
      if (this.cardInfo.email) {
        uni.setClipboardData({
          data: this.cardInfo.email,
          success: () => {
            this.$modal.msgSuccess('邮箱已复制')
          }
        })
      }
    },
    openLocation() {
      if (this.cardInfo.province && this.cardInfo.city) {
        this.$modal.msgSuccess('地图功能开发中')
      }
    },
    async onThumbsUp() {
      if (this.isThumbsUp) {
        this.$modal.msg('已经点过赞了')
        return
      }
      try {
        await addThumbsUp(this.cardId)
        this.isThumbsUp = true
        this.extendInfo.thumbsUp = (this.extendInfo.thumbsUp || 0) + 1
        this.$modal.msgSuccess('点赞成功')
      } catch (e) {
        console.error('点赞失败', e)
      }
    },
    previewImage(index) {
      const urls = this.imgList.map(img => img.img)
      uni.previewImage({
        current: index,
        urls: urls
      })
    }
  },
  onShareAppMessage() {
    return {
      title: `${this.cardInfo.realName}的名片`,
      path: `/pages/card/index?cardId=${this.cardId}`
    }
  }
}
</script>

<style lang="scss" scoped>
.card-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

// 导航栏
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background-color: #fff;
}

.nav-content {
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 24rpx;
}

.nav-back, .nav-share {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: 500;
}

.card-scroll {
  height: calc(100vh - 120rpx);
}

// 名片卡片区域
.card-section {
  padding: 24rpx;
}

// 主题1：经典白
.card-theme-1 {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.card-main {
  display: flex;
  justify-content: space-between;
  margin-bottom: 32rpx;
}

.card-info-left {
  flex: 1;
}

.card-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 16rpx;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.card-tag {
  font-size: 22rpx;
  color: #999999;
  background: #f5f5f5;
  padding: 4rpx 16rpx;
  border-radius: 4rpx;
}

.card-avatar-right {
  margin-left: 24rpx;
}

.card-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
}

.card-contact-list {
  border-top: 1rpx solid #f0f0f0;
  padding-top: 24rpx;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
}

.contact-icon {
  font-size: 36rpx;
  margin-right: 16rpx;
}

.contact-text {
  font-size: 28rpx;
  color: #666666;
}

// 主题2：深色
.card-theme-2 {
  background: linear-gradient(135deg, #2c3e50, #3498db);
  border-radius: 16rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);
}

.card-theme-2 .card-name {
  color: #ffffff;
}

.card-theme-2 .card-tag {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.2);
}

.card-theme-2 .contact-text {
  color: rgba(255, 255, 255, 0.9);
}

// 主题3：渐变
.card-theme-3 {
  background: linear-gradient(135deg, #f2b974, #e6a05c);
  border-radius: 16rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.card-avatar-left {
  margin-right: 24rpx;
}

.card-avatar-left .card-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.5);
}

.card-info-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-theme-3 .card-name {
  color: #ffffff;
}

.card-theme-3 .card-tag {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.2);
}

.card-theme-3 .contact-text {
  color: rgba(255, 255, 255, 0.9);
}

// 互动功能区
.action-section {
  margin: 24rpx;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.action-grid {
  display: flex;
  justify-content: space-around;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.action-icon-wrapper {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 50%;
  font-size: 36rpx;
  color: #666666;
  margin-bottom: 8rpx;

  &.active {
    background: #fff3e0;
    color: #f2b974;
  }
}

.action-label {
  font-size: 24rpx;
  color: #666666;
  margin-bottom: 4rpx;
}

.action-count {
  font-size: 22rpx;
  color: #999999;
}

.view-count {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #f0f0f0;
  font-size: 24rpx;
  color: #999999;

  .cuIcon-attention {
    margin-right: 8rpx;
  }
}

// 内容区块
.section-card {
  margin: 24rpx;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 24rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.section-content {
  padding: 0;
}

.introduce-text {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.8;
}

// 照片网格
.photo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.photo-item {
  width: calc((100% - 32rpx) / 3);
  height: 200rpx;
  border-radius: 8rpx;
}

// 统计数据
.stats-grid {
  display: flex;
  justify-content: space-around;
}

.stats-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stats-num {
  font-size: 40rpx;
  font-weight: bold;
  color: #f2b974;
  line-height: 1.2;
}

.stats-label {
  font-size: 24rpx;
  color: #999999;
  margin-top: 8rpx;
}

// 底部操作栏
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  padding: 16rpx 24rpx;
  background: #ffffff;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
  padding-bottom: calc(16rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
}

.bar-btn {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 44rpx;
  font-size: 28rpx;
  background: #f5f5f5;
  color: #666666;
  margin: 0 8rpx;

  .cuIcon-phone, .cuIcon-weixin {
    margin-right: 8rpx;
    font-size: 32rpx;
  }

  &.primary {
    background: linear-gradient(135deg, #f2b974, #e6a05c);
    color: #ffffff;
  }
}

.bottom-space {
  height: 180rpx;
}
</style>
