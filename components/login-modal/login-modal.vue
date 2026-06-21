<template>
  <view class="login-modal" v-if="visible" @click.self="onClose">
    <view class="modal-content" @click.stop>
      <!-- 关闭按钮 -->
      <view class="close-btn" @click="onClose">
        <text class="cuIcon-close"></text>
      </view>

      <!-- 标题 -->
      <view class="modal-title">
        <text>登录后享受更多服务</text>
      </view>

      <!-- 微信手机号快捷登录 -->
      <!-- #ifdef MP-WEIXIN -->
      <button class="wx-phone-btn" open-type="getPhoneNumber" @getphonenumber="onGetPhoneNumber">
        <text class="cuIcon-weixin wx-icon"></text>
        <text>微信手机号快捷登录</text>
      </button>
      <!-- #endif -->

      <!-- 访客模式 -->
      <view class="guest-link" @click="onGuest">
        <text>先逛逛，稍后登录</text>
      </view>

      <!-- 协议 -->
      <view class="agreement">
        <text class="agreement-text">登录即同意</text>
        <text class="agreement-link" @click="goAgreement">《用户协议》</text>
        <text class="agreement-link" @click="goPrivacy">《隐私政策》</text>
      </view>
    </view>
  </view>
</template>

<script>
import { wxPhoneLogin } from '@/api/mall/login'
import { getToken } from '@/utils/auth'

export default {
  name: 'LoginModal',
  data() {
    return {
      visible: false,
      wxCode: '',
      resolvePromise: null,
      rejectPromise: null
    }
  },
  methods: {
    /**
     * 显示登录弹窗，返回 Promise
     * 用法：
     *   const success = await this.$refs.loginModal.show()
     *   if (success) { /* 登录成功 *\/ }
     */
    show() {
      // 已登录直接返回
      if (getToken()) {
        return Promise.resolve(true)
      }

      this.visible = true
      this.refreshWxCode()

      return new Promise((resolve, reject) => {
        this.resolvePromise = resolve
        this.rejectPromise = reject
      })
    },

    // 刷新 wx.login code
    refreshWxCode() {
      // #ifdef MP-WEIXIN
      uni.login({
        provider: 'weixin',
        success: res => {
          this.wxCode = res.code
        }
      })
      // #endif
    },

    // 手机号登录回调
    async onGetPhoneNumber(e) {
      if (e.detail.errMsg !== 'getPhoneNumber:ok') {
        this.$modal.msgError('获取手机号失败')
        return
      }

      this.$modal.loading('登录中...')

      try {
        if (!this.wxCode) {
          await new Promise((resolve, reject) => {
            uni.login({ provider: 'weixin', success: res => { this.wxCode = res.code; resolve() }, fail: reject })
          })
        }

        const app = getApp()
        const res = await wxPhoneLogin({
          code: this.wxCode,
          phoneCode: e.detail.code,
          appId: app.globalData.appId
        })

        this.$modal.closeLoading()

        if (res.code === 200 && res.data) {
          this.handleLoginSuccess(res.data)
        } else {
          this.$modal.msgError(res.msg || '登录失败')
          this.refreshWxCode()
        }
      } catch (err) {
        this.$modal.closeLoading()
        this.$modal.msgError('登录失败，请重试')
        this.refreshWxCode()
      }
    },

    // 登录成功
    handleLoginSuccess(data) {
      uni.setStorageSync('App-Token', data.token)
      if (data.openId) uni.setStorageSync('xcxOpenId', data.openId)
      if (data.userId) uni.setStorageSync('userId', data.userId)
      if (data.nickname) uni.setStorageSync('nickname', data.nickname)
      if (data.tenantId) uni.setStorageSync('tenantId', data.tenantId)

      this.visible = false
      this.$modal.msgSuccess('登录成功')

      if (this.resolvePromise) {
        this.resolvePromise(true)
        this.resolvePromise = null
      }
    },

    // 访客模式
    onGuest() {
      this.visible = false
      if (this.resolvePromise) {
        this.resolvePromise(false)
        this.resolvePromise = null
      }
    },

    // 关闭
    onClose() {
      this.visible = false
      if (this.rejectPromise) {
        this.rejectPromise('cancel')
        this.rejectPromise = null
      }
    },

    goAgreement() {
      // TODO: 跳转用户协议
    },

    goPrivacy() {
      // TODO: 跳转隐私政策
    }
  }
}
</script>

<style lang="scss" scoped>
.login-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  width: 600rpx;
  background-color: #fff;
  border-radius: 24rpx;
  padding: 60rpx 40rpx 40rpx;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  font-size: 40rpx;
  color: #999;
}

.modal-title {
  text-align: center;
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 60rpx;
}

.wx-phone-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  background-color: #07c160;
  color: #fff;
  font-size: 32rpx;
  border-radius: 44rpx;
  border: none;
  margin-bottom: 24rpx;

  .wx-icon {
    font-size: 40rpx;
    margin-right: 12rpx;
  }
}

.guest-link {
  text-align: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #999;
}

.agreement {
  text-align: center;
  margin-top: 30rpx;
  font-size: 22rpx;

  .agreement-text {
    color: #999;
  }

  .agreement-link {
    color: #f2b974;
  }
}
</style>
