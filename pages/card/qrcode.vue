<template>
  <view class="qrcode-page">
    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="nav-back" @click="goBack">
          <text class="cuIcon-back"></text>
        </view>
        <text class="nav-title">名片二维码</text>
        <view class="nav-save" @click="saveImage">
          <text class="cuIcon-download"></text>
        </view>
      </view>
    </view>
    <view :style="{ height: (statusBarHeight + 44) + 'px' }"></view>

    <!-- 二维码卡片 -->
    <view class="qrcode-card" v-if="cardInfo">
      <view class="card-header">
        <image class="card-avatar" :src="cardInfo.portrait || '/static/images/profile.jpg'" mode="aspectFill" />
        <view class="card-info">
          <text class="card-name">{{ cardInfo.realName }}</text>
          <text class="card-position" v-if="cardInfo.position">{{ cardInfo.position }}</text>
          <text class="card-company" v-if="cardInfo.company">{{ cardInfo.company }}</text>
        </view>
      </view>

      <view class="qrcode-container">
        <canvas canvas-id="qrcode" id="qrcode" class="qrcode-canvas" />
      </view>

      <view class="card-footer">
        <text class="footer-text">扫描二维码查看名片</text>
      </view>
    </view>

    <!-- 提示 -->
    <view class="tip-section">
      <text class="tip-text">长按或截图保存二维码，分享给客户</text>
    </view>
  </view>
</template>

<script>
import { getCardByUserId } from '@/api/mall/card'

export default {
  data() {
    return {
      statusBarHeight: 0,
      cardInfo: null,
      cardId: null
    }
  },
  onLoad(options) {
    const app = getApp()
    this.statusBarHeight = app.globalData.statusBarHeight || 0

    if (options.cardId) {
      this.cardId = options.cardId
      this.loadCardDetail(options.cardId)
    } else if (options.userId) {
      this.loadCardByUserId(options.userId)
    }
  },
  methods: {
    async loadCardByUserId(userId) {
      try {
        const res = await getCardByUserId({ userId })
        if (res.code === 200 && res.data) {
          this.cardInfo = res.data
          this.cardId = res.data.businessCardId
          this.generateQrcode()
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
          this.generateQrcode()
        }
      } catch (e) {
        console.error('加载名片详情失败', e)
      }
    },
    generateQrcode() {
      // 生成小程序码
      // 这里需要后端提供生成小程序码的接口
      // 暂时使用 Canvas 绘制简单的二维码占位
      const ctx = uni.createCanvasContext('qrcode', this)
      ctx.setFillStyle('#ffffff')
      ctx.fillRect(0, 0, 200, 200)
      ctx.setFillStyle('#333333')
      ctx.setFontSize(14)
      ctx.setTextAlign('center')
      ctx.fillText('名片二维码', 100, 100)
      ctx.draw()
    },
    saveImage() {
      uni.canvasToTempFilePath({
        canvasId: 'qrcode',
        success: (res) => {
          uni.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              this.$modal.msgSuccess('保存成功')
            },
            fail: () => {
              this.$modal.msgError('保存失败')
            }
          })
        }
      }, this)
    },
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.qrcode-page {
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

.nav-back, .nav-save {
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

// 二维码卡片
.qrcode-card {
  margin: 40rpx 32rpx;
  background-color: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
  padding-bottom: 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.card-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-right: 24rpx;
}

.card-info {
  flex: 1;
}

.card-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.card-position {
  font-size: 26rpx;
  color: #666;
  margin-top: 8rpx;
  display: block;
}

.card-company {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
  display: block;
}

.qrcode-container {
  display: flex;
  justify-content: center;
  margin: 40rpx 0;
}

.qrcode-canvas {
  width: 400rpx;
  height: 400rpx;
}

.card-footer {
  text-align: center;
  padding-top: 40rpx;
  border-top: 1rpx solid #f0f0f0;
}

.footer-text {
  font-size: 26rpx;
  color: #999;
}

.tip-section {
  text-align: center;
  padding: 40rpx;
}

.tip-text {
  font-size: 24rpx;
  color: #999;
}
</style>
