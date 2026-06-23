<template>
  <view class="login-page">
    <view class="logo-content">
      <image class="logo" :src="globalConfig.appInfo.logo" mode="widthFix" />
      <text class="title">{{ globalConfig.appInfo.name }}</text>
    </view>

    <view class="login-form">
      <!-- 微信手机号快捷登录（推荐） -->
      <!-- #ifdef MP-WEIXIN -->
      <button class="wx-phone-btn" open-type="getPhoneNumber" @getphonenumber="onGetPhoneNumber">
        <text class="cuIcon-weixin"></text>
        <text>微信手机号快捷登录</text>
      </button>
      <!-- #endif -->

      <!-- 静默登录（访客模式） -->
      <!-- #ifdef MP-WEIXIN -->
      <view class="guest-btn" @click="silentLogin">
        <text>先逛逛，稍后登录</text>
      </view>
      <!-- #endif -->

      <!-- 账号密码登录（H5/APP 备用） -->
      <!-- #ifndef MP-WEIXIN -->
      <view class="input-item">
        <text class="cuIcon-user"></text>
        <input v-model="loginForm.username" class="input" type="text" placeholder="请输入账号" maxlength="30" />
      </view>
      <view class="input-item">
        <text class="cuIcon-lock"></text>
        <input v-model="loginForm.password" type="password" class="input" placeholder="请输入密码" maxlength="20" />
      </view>
      <view class="input-item captcha-item" v-if="captchaEnabled">
        <text class="cuIcon-code"></text>
        <input v-model="loginForm.code" type="number" class="input" placeholder="验证码" maxlength="4" />
        <image :src="codeUrl" @click="getCode" class="captcha-img" />
      </view>
      <button class="login-btn" @click="handleLogin">登录</button>
      <!-- #endif -->

      <view class="xieyi">
        <text class="text-grey">登录即代表同意</text>
        <text class="text-link" @click="handleUserAgrement">《用户协议》</text>
        <text class="text-link" @click="handlePrivacy">《隐私协议》</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getCodeImg } from '@/api/login'
import { wxPhoneLogin, silentLogin } from '@/api/mall/login'
import { getToken } from '@/utils/auth'
import { useUserStore } from '@/store/modules/user'

export default {
  setup() {
    const userStore = useUserStore()
    return { userStore }
  },
  data() {
    return {
      codeUrl: '',
      captchaEnabled: true,
      globalConfig: null,
      appId: '', // 小程序 appId，从 manifest 读取
      loginForm: {
        username: '',
        password: '',
        code: '',
        uuid: ''
      },
      wxCode: '' // wx.login 获取的 code
    }
  },
  created() {
    const app = getApp()
    this.globalConfig = app ? app.globalData.config : {}
    // #ifdef MP-WEIXIN
    // 读取小程序 appId
    const accountInfo = uni.getAccountInfoSync()
    this.appId = accountInfo.miniProgram.appId
    this.getWxCode()
    // #endif
    // #ifndef MP-WEIXIN
    this.getCode()
    // #endif
  },
  onLoad() {
    // #ifdef H5
    if (getToken()) {
      this.$tab.reLaunch('/pages/dechome/index')
    }
    // #endif
  },
  methods: {
    // 获取微信 login code
    getWxCode() {
      uni.login({
        provider: 'weixin',
        success: (res) => {
          this.wxCode = res.code
        },
        fail: (err) => {
          console.error('wx.login 失败', err)
        }
      })
    },

    // 微信手机号快捷登录回调
    async onGetPhoneNumber(e) {
      if (e.detail.errMsg !== 'getPhoneNumber:ok') {
        this.$modal.msgError('获取手机号失败')
        return
      }

      this.$modal.loading('登录中...')

      try {
        // 如果 wxCode 过期，重新获取
        if (!this.wxCode) {
          await new Promise((resolve, reject) => {
            uni.login({
              provider: 'weixin',
              success: (res) => {
                this.wxCode = res.code
                resolve()
              },
              fail: reject
            })
          })
        }

        const res = await wxPhoneLogin({
          code: this.wxCode,
          phoneCode: e.detail.code,
          appId: this.appId
        })

        this.$modal.closeLoading()

        if (res.code === 200 && res.data) {
          this.handleLoginSuccess(res.data)
        } else {
          this.$modal.msgError(res.msg || '登录失败')
          this.getWxCode() // 重新获取 code
        }
      } catch (err) {
        this.$modal.closeLoading()
        this.$modal.msgError('登录失败，请重试')
        this.getWxCode()
      }
    },

    // 静默登录（访客模式）
    async silentLogin() {
      if (!this.wxCode) {
        this.$modal.msgError('请稍后重试')
        this.getWxCode()
        return
      }

      this.$modal.loading('登录中...')

      try {
        const res = await silentLogin({
          code: this.wxCode,
          appId: this.appId
        })

        this.$modal.closeLoading()

        if (res.code === 200 && res.data) {
          this.handleLoginSuccess(res.data)
        } else {
          this.$modal.msgError(res.msg || '登录失败')
          this.getWxCode()
        }
      } catch (err) {
        this.$modal.closeLoading()
        this.$modal.msgError('登录失败，请重试')
        this.getWxCode()
      }
    },

    // 登录成功处理
    handleLoginSuccess(data) {
      // 保存 token
      uni.setStorageSync('App-Token', data.token)
      // 保存 openId
      if (data.openId) {
        uni.setStorageSync('xcxOpenId', data.openId)
      }
      // 保存用户信息
      if (data.userId) {
        uni.setStorageSync('userId', data.userId)
      }
      if (data.nickname) {
        uni.setStorageSync('nickname', data.nickname)
      }

      this.$modal.msgSuccess('登录成功')

      setTimeout(() => {
        this.$tab.reLaunch('/pages/dechome/index')
      }, 1000)
    },

    // 获取图形验证码
    getCode() {
      getCodeImg().then(res => {
        this.captchaEnabled = res.captchaEnabled === undefined ? true : res.captchaEnabled
        if (this.captchaEnabled) {
          this.codeUrl = 'data:image/gif;base64,' + res.img
          this.loginForm.uuid = res.uuid
        }
      })
    },

    // 账号密码登录
    async handleLogin() {
      if (!this.loginForm.username) {
        this.$modal.msgError('请输入账号')
        return
      }
      if (!this.loginForm.password) {
        this.$modal.msgError('请输入密码')
        return
      }
      if (!this.loginForm.code && this.captchaEnabled) {
        this.$modal.msgError('请输入验证码')
        return
      }

      this.$modal.loading('登录中...')
      this.userStore.login(this.loginForm).then(() => {
        this.$modal.closeLoading()
        this.userStore.getInfo().then(() => {
          this.$tab.reLaunch('/pages/dechome/index')
        })
      }).catch(() => {
        this.$modal.closeLoading()
        if (this.captchaEnabled) {
          this.getCode()
        }
      })
    },

    handlePrivacy() {
      const site = this.globalConfig.appInfo.agreements[0]
      this.$tab.navigateTo('/pages/common/webview/index?title=' + encodeURIComponent(site.title) + '&url=' + encodeURIComponent(site.url))
    },

    handleUserAgrement() {
      const site = this.globalConfig.appInfo.agreements[1]
      this.$tab.navigateTo('/pages/common/webview/index?title=' + encodeURIComponent(site.title) + '&url=' + encodeURIComponent(site.url))
    }
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-content {
  margin-top: 15%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  width: 120rpx;
  height: 120rpx;
  border-radius: 24rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-top: 20rpx;
}

.login-form {
  width: 80%;
  margin-top: 10%;
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

  .cuIcon-weixin {
    font-size: 40rpx;
    margin-right: 12rpx;
  }
}

.guest-btn {
  text-align: center;
  padding: 24rpx 0;
  font-size: 28rpx;
  color: #999;
}

.input-item {
  display: flex;
  align-items: center;
  height: 88rpx;
  background-color: #f5f6f7;
  border-radius: 44rpx;
  padding: 0 32rpx;
  margin-bottom: 24rpx;

  .cuIcon-user,
  .cuIcon-lock,
  .cuIcon-code {
    font-size: 36rpx;
    color: #999;
    margin-right: 16rpx;
  }

  .input {
    flex: 1;
    font-size: 28rpx;
  }
}

.captcha-item {
  .input {
    width: 50%;
    flex: none;
  }
}

.captcha-img {
  width: 200rpx;
  height: 60rpx;
  margin-left: auto;
}

.login-btn {
  height: 88rpx;
  background-color: #f2b974;
  color: #fff;
  font-size: 32rpx;
  border-radius: 44rpx;
  border: none;
  margin-top: 20rpx;
}

.xieyi {
  text-align: center;
  margin-top: 40rpx;
  font-size: 24rpx;

  .text-grey {
    color: #999;
  }

  .text-link {
    color: #f2b974;
  }
}
</style>
