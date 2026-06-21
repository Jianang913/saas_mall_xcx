<template>
  <view class="special-page">
    <!-- Banner -->
    <image v-if="pageData.pagePic" class="page-banner" :src="formatImage(pageData.pagePic)" mode="widthFix" />

    <!-- 图文说明 -->
    <view class="page-content" v-if="pageData.specialPageImageText">
      <rich-text :nodes="pageData.specialPageImageText"></rich-text>
    </view>

    <!-- 分类 Tab -->
    <view class="classify-tabs" v-if="classifyList.length">
      <scroll-view scroll-x class="tabs-scroll">
        <view
          class="tab-item"
          :class="{ active: currentClassifyId === item.specialGoodsClassifyId }"
          v-for="item in classifyList"
          :key="item.specialGoodsClassifyId"
          @click="switchClassify(item)"
        >
          <text>{{ item.classifyName }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 商品列表 -->
    <scroll-view scroll-y class="goods-list" @scrolltolower="loadMore">
      <view
        class="goods-card"
        v-for="item in goodsList"
        :key="item.goodsId"
        @click="goDetail(item)"
      >
        <image class="goods-image" :src="formatImage(item.outPic)" mode="aspectFill" />
        <view class="goods-info">
          <text class="goods-name">{{ item.goodsName }}</text>
          <view class="price-row">
            <text class="goods-price">¥{{ item.shopPrice }}</text>
            <text class="market-price" v-if="item.marketPrice">¥{{ item.marketPrice }}</text>
          </view>
        </view>
      </view>

      <uni-load-more v-if="goodsList.length || loading" :status="loading ? 'loading' : noMore ? 'noMore' : 'more'" />
      <uni-load-more v-if="!goodsList.length && !loading" status="noData" />
    </scroll-view>

    <!-- 自定义 Tab 栏 -->
    <tab-bar />

    <!-- 登录提示弹窗 -->
    <uni-popup ref="loginPopup" type="center" :is-mask-click="true" @change="onLoginPopupChange">
      <view class="login-dialog">
        <view class="login-close" @click="closeLoginPopup">✕</view>
        <view class="login-icon">🎉</view>
        <view class="login-title">登录享更多优惠</view>
        <view class="login-desc">登录后可领取优惠券、查看专属价格、积分抵扣等</view>
        <view class="login-btn" @click="goLogin">立即登录</view>
        <view class="login-skip" @click="closeLoginPopup">先逛逛</view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { getSpecialPage, getSpecialClassifyGoods } from '@/api/mall/specialPage'
import { getToken } from '@/utils/auth'

export default {
  data() {
    return {
      pageData: {},
      classifyList: [],
      currentClassifyId: '',
      goodsList: [],
      page: 1,
      pageSize: 20,
      loading: false,
      noMore: false
    }
  },
  async onShow() {
    // 隐藏原生 Tab 栏
    // #ifdef MP-WEIXIN
    uni.hideTabBar({ animation: false })
    // #endif

    await this.loadPage()
  },
  onLoad() {
    // 监听专题页切换事件（从 Tab 栏组件触发）
    uni.$on('specialPageRefresh', (linkUrlId) => {
      this.pageData = {}
      this.classifyList = []
      this.goodsList = []
      this.loadPage()
    })
  },
  onUnload() {
    uni.$off('specialPageRefresh')
  },
  methods: {
    async loadPage() {
      const app = getApp()
      if (!app) return

      // 未登录时显示登录提示
      if (!getToken()) {
        this.$nextTick(() => {
          this.$refs.loginPopup.open()
        })
      }

      // 等待导航数据就绪
      await app.waitForNavigation()
      const pageId = app.globalData.specialId

      if (!pageId) {
        console.warn('未获取到专题页ID')
        return
      }

      try {
        const res = await getSpecialPage(pageId)
        if (res.data) {
          this.pageData = res.data
          // 设置导航栏标题
          if (res.data.pageName) {
            uni.setNavigationBarTitle({ title: res.data.pageName })
          }
          if (res.data.specialPageClassifyList) {
            this.classifyList = res.data.specialPageClassifyList
            if (this.classifyList.length) {
              this.switchClassify(this.classifyList[0])
            }
          }
        }
      } catch (e) {
        console.error('加载专题页失败', e)
      }
    },

    switchClassify(item) {
      this.currentClassifyId = item.specialGoodsClassifyId
      this.page = 1
      this.page = 1
      this.goodsList = []
      this.noMore = false
      this.loadGoods()
    },

    async loadGoods() {
      if (this.loading || !this.currentClassifyId) return
      this.loading = true
      try {
        const res = await getSpecialClassifyGoods(this.currentClassifyId)
        if (res.data && res.data.specialGoodsPoList) {
          this.goodsList = res.data.specialGoodsPoList
          this.noMore = true
        } else {
          this.goodsList = []
        }
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    loadMore() {
      if (this.noMore || this.loading) return
      this.page++
      this.loadGoods()
    },

    formatImage(pic) {
      if (!pic) return ''
      if (pic.startsWith('http')) return pic
      const app = getApp()
      return (app.globalData.shopImg || '') + '/resource/oss/download/' + pic
    },

    goDetail(item) {
      this.$tab.navigateTo('/pages/goods/detail/index?id=' + item.goodsId)
    },

    goLogin() {
      this.$refs.loginPopup.close()
      this.$tab.navigateTo('/pages/login')
    },

    closeLoginPopup() {
      this.$refs.loginPopup.close()
    },

    onLoginPopupChange(e) {
      // 弹窗状态变化时可做额外处理
    }
  }
}
</script>

<style lang="scss" scoped>
.special-page { min-height: 100vh; background-color: #f5f5f5; padding-bottom: 130rpx; }
.page-banner { width: 100%; display: block; }
.page-content { background-color: #fff; padding: 24rpx; margin-bottom: 20rpx; }
.classify-tabs { background-color: #fff; margin-bottom: 20rpx; }
.tabs-scroll { white-space: nowrap; padding: 0 12rpx; }
.tab-item { display: inline-block; padding: 20rpx 24rpx; font-size: 28rpx; color: #666; }
.tab-item.active { color: #f2b974; font-weight: bold; border-bottom: 4rpx solid #f2b974; }
.goods-list { height: calc(100vh - 500rpx); padding: 0 20rpx; }
.goods-card { background-color: #fff; border-radius: 12rpx; margin-bottom: 20rpx; overflow: hidden; }
.goods-image { width: 100%; height: 360rpx; }
.goods-info { padding: 20rpx; }
.goods-name { font-size: 28rpx; color: #333; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.price-row { display: flex; align-items: baseline; margin-top: 12rpx; }
.goods-price { font-size: 34rpx; color: #e4393c; font-weight: bold; }
.market-price { font-size: 24rpx; color: #999; text-decoration: line-through; margin-left: 12rpx; }
/* 登录提示弹窗 */
.login-dialog {
  width: 580rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 60rpx 40rpx 40rpx;
  text-align: center;
  position: relative;
}
.login-close {
  position: absolute;
  top: 20rpx;
  right: 24rpx;
  font-size: 36rpx;
  color: #999;
  padding: 10rpx;
}
.login-icon { font-size: 80rpx; margin-bottom: 20rpx; }
.login-title { font-size: 36rpx; font-weight: bold; color: #333; margin-bottom: 16rpx; }
.login-desc { font-size: 26rpx; color: #999; margin-bottom: 40rpx; line-height: 1.5; }
.login-btn {
  background: linear-gradient(135deg, #f2b974, #e4393c);
  color: #fff;
  font-size: 32rpx;
  padding: 24rpx 0;
  border-radius: 44rpx;
  margin-bottom: 20rpx;
}
.login-skip { font-size: 26rpx; color: #999; padding: 10rpx 0; }
</style>
