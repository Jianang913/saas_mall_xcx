<template>
  <view class="goods-detail" v-if="goods">
    <!-- 商品图片轮播 -->
    <swiper class="goods-swiper" :indicator-dots="true" :autoplay="false" :circular="true">
      <swiper-item v-for="(img, index) in goodsImages" :key="index">
        <image class="goods-image" :src="img" mode="aspectFill" @click="previewImage(index)" />
      </swiper-item>
    </swiper>

    <!-- 价格信息 -->
    <view class="price-section">
      <view class="price-row">
        <text class="current-price">¥{{ currentPrice }}</text>
        <text class="market-price" v-if="goods.marketPrice">¥{{ goods.marketPrice }}</text>
      </view>
      <text class="goods-title">{{ goods.goodsName }}</text>
      <text class="goods-subtitle" v-if="goods.goodsBrief">{{ goods.goodsBrief }}</text>
    </view>

    <!-- SKU 选择 -->
    <view class="sku-section" @click="showSkuModal = true">
      <text class="section-label">选择</text>
      <text class="sku-text">{{ selectedSkuText || '请选择规格' }}</text>
      <text class="cuIcon-right"></text>
    </view>

    <!-- 商品详情 -->
    <view class="detail-section">
      <view class="section-title">
        <text>商品详情</text>
      </view>
      <rich-text class="detail-content" :nodes="formatDetailContent(goods.detailDesc || goods.goodsDesc || '')"></rich-text>
    </view>

    <!-- SKU 选择弹窗 -->
    <view class="sku-modal" v-if="showSkuModal" @click="showSkuModal = false">
      <view class="sku-modal-content" @click.stop>
        <!-- 商品简要信息 -->
        <view class="sku-header">
          <image class="sku-goods-image" :src="selectedSkuImage || goodsImages[0]" mode="aspectFill" />
          <view class="sku-goods-info">
            <text class="sku-goods-price">¥{{ currentPrice }}</text>
            <text class="sku-goods-stock">库存：{{ currentStock }}</text>
          </view>
          <view class="sku-close" @click="showSkuModal = false">
            <text class="cuIcon-close"></text>
          </view>
        </view>

        <!-- 规格组 -->
        <scroll-view scroll-y class="sku-scroll">
          <view class="sku-group" v-for="group in specGroups" :key="group.attrId">
            <text class="sku-group-name">{{ group.attrName }}</text>
            <view class="sku-values">
              <view
                class="sku-value-item"
                :class="{ active: group.selectedValue === value.attrValueId }"
                v-for="value in group.values"
                :key="value.attrValueId"
                @click="selectSpec(group, value)"
              >
                <text>{{ value.attrValue }}</text>
              </view>
            </view>
          </view>

          <!-- 数量 -->
          <view class="quantity-section">
            <text class="quantity-label">数量</text>
            <view class="quantity-control">
              <view class="qty-btn" @click="buyNum > 1 && buyNum--">
                <text>−</text>
              </view>
              <text class="qty-num">{{ buyNum }}</text>
              <view class="qty-btn" @click="buyNum++">
                <text>+</text>
              </view>
            </view>
          </view>
        </scroll-view>

        <!-- 操作按钮 -->
        <view class="sku-actions">
          <view class="btn-add-cart" @click="addToCart">
            <text>加入购物车</text>
          </view>
          <view class="btn-buy-now" @click="buyNow">
            <text>立即购买</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="bar-content">
        <view class="bar-left">
          <view class="bar-item" @click="goHome">
            <text class="cuIcon-home"></text>
            <text class="bar-item-text">首页</text>
          </view>
          <view class="bar-item" @click="toggleCollect">
            <text :class="isCollected ? 'cuIcon-likefill' : 'cuIcon-like'" :style="{ color: isCollected ? '#e4393c' : '' }"></text>
            <text class="bar-item-text">收藏</text>
          </view>
          <view class="bar-item" @click="goCart">
            <text class="cuIcon-cart"></text>
            <text class="bar-item-text">购物车</text>
          </view>
        </view>
        <view class="bar-right">
          <view class="bar-btn btn-cart" @click="showSkuModal = true; actionType = 'cart'">
            <text>加入购物车</text>
          </view>
          <view class="bar-btn btn-buy" @click="showSkuModal = true; actionType = 'buy'">
            <text>立即购买</text>
          </view>
        </view>
      </view>
      <view class="bar-safe-area"></view>
    </view>

    <!-- 登录弹窗 -->
    <login-modal ref="loginModal" />
  </view>
</template>

<script>
import { getGoods, listGoodsSpe, collectGoods, cancelCollect } from '@/api/mall/goods'
import { addCart } from '@/api/mall/cart'
import { getToken } from '@/utils/auth'

export default {
  data() {
    return {
      goodsId: '',
      goods: null,
      goodsImages: [],
      specGroups: [],
      skuList: [],
      showSkuModal: false,
      actionType: 'cart',
      buyNum: 1,
      selectedSpecs: {},
      isCollected: false
    }
  },
  computed: {
    currentPrice() {
      if (!this.skuList.length) return this.goods ? this.goods.shopPrice : 0
      const sku = this.findMatchSku()
      return sku ? sku.shopPrice : (this.goods ? this.goods.shopPrice : 0)
    },
    currentStock() {
      if (!this.skuList.length) return this.goods ? this.goods.goodsNumber : 0
      const sku = this.findMatchSku()
      return sku ? sku.speNumber : 0
    },
    selectedSkuImage() {
      const sku = this.findMatchSku()
      if (!sku || !sku.spePic) return ''
      const pic = sku.spePic
      if (pic.startsWith('http')) return pic
      const app = getApp()
      return (app.globalData.shopImg || '') + '/resource/oss/download/' + pic
    },
    selectedSkuText() {
      const values = Object.values(this.selectedSpecs).filter(v => v)
      return values.length ? values.join('，') : ''
    }
  },
  onLoad(options) {
    if (options.id) {
      this.goodsId = options.id
      this.loadGoods()
    }
  },
  methods: {
    async loadGoods() {
      try {
        const res = await getGoods(this.goodsId)
        if (res.data) {
          // 后端返回 { goods: {...}, specList: [...] }
          this.goods = res.data.goods || res.data
          this.skuList = res.data.specList || []
          // 解析商品图片（后端字段是 headPic，存储的是 OSS ID）
          if (this.goods.headPic) {
            const app = getApp()
            const baseUrl = app.globalData.shopImg || ''
            this.goodsImages = this.goods.headPic.split(',')
              .filter(Boolean)
              .map(pic => {
                if (pic.startsWith('http')) return pic
                return baseUrl + '/resource/oss/download/' + pic
              })
          }
          // 构建规格组
          if (this.skuList.length) {
            this.buildSpecGroups()
            // 默认选中每个规格组的第一个值
            this.specGroups.forEach(group => {
              if (group.values.length) {
                group.selectedValue = group.values[0].attrValueId
                this.selectedSpecs[group.attrName] = group.values[0].attrValue
              }
            })
          }
        }
      } catch (e) {
        console.error('加载商品失败', e)
      }
    },
    buildSpecGroups() {
      const groupMap = {}
      this.skuList.forEach(sku => {
        // 后端返回 attrValues 字符串，格式如 "600,蓝"（逗号分隔的属性值）
        if (sku.attrValues) {
          const values = sku.attrValues.split(',').map(v => v.trim())
          values.forEach((attrValue, index) => {
            const attrId = 'attr_' + index
            const attrName = '规格' + (index + 1)

            if (!groupMap[attrId]) {
              groupMap[attrId] = {
                attrId: attrId,
                attrName: attrName,
                selectedValue: null,
                values: []
              }
            }
            const group = groupMap[attrId]
            const exists = group.values.some(v => v.attrValue === attrValue)
            if (!exists) {
              group.values.push({
                attrValueId: attrId + '_' + attrValue,
                attrValue: attrValue
              })
            }
          })
        }
      })
      this.specGroups = Object.values(groupMap)
    },
    selectSpec(group, value) {
      group.selectedValue = value.attrValueId
      this.selectedSpecs[group.attrName] = value.attrValue
    },
    findMatchSku() {
      if (!this.specGroups.length) return null
      // 检查是否所有规格组都已选择
      const allSelected = this.specGroups.every(g => g.selectedValue)
      if (!allSelected) return null

      // 构建选中的规格值列表
      const selectedValues = this.specGroups.map(g => {
        const val = g.values.find(v => v.attrValueId === g.selectedValue)
        return val ? val.attrValue : ''
      })

      // 查找匹配的 SKU
      return this.skuList.find(sku => {
        if (!sku.attrValues) return false
        const skuValues = sku.attrValues.split(',').map(v => v.trim())
        return skuValues.length === selectedValues.length &&
          skuValues.every((v, i) => v === selectedValues[i])
      })
    },
    previewImage(index) {
      uni.previewImage({
        urls: this.goodsImages,
        current: index
      })
    },
    async addToCart() {
      // 检查登录
      if (!getToken()) {
        const loggedIn = await this.$refs.loginModal.show()
        if (!loggedIn) return
      }

      const sku = this.findMatchSku()
      if (!sku && this.specGroups.length) {
        this.$modal.msgError('请选择规格')
        return
      }
      try {
        await addCart({
          goodsId: this.goodsId,
          goodsSpeId: sku ? sku.goodsSpeId : null,
          quantity: this.buyNum
        })
        this.$modal.msgSuccess('已加入购物车')
        this.showSkuModal = false
      } catch (e) {
        console.error('加入购物车失败', e)
      }
    },
    async buyNow() {
      // 检查登录
      if (!getToken()) {
        const loggedIn = await this.$refs.loginModal.show()
        if (!loggedIn) return
      }

      const sku = this.findMatchSku()
      if (!sku && this.specGroups.length) {
        this.$modal.msgError('请选择规格')
        return
      }
      const orderGoods = [{
        goodsId: this.goodsId,
        goodsSpeId: sku ? sku.goodsSpeId : null,
        quantity: this.buyNum,
        price: this.currentPrice,
        goodsName: this.goods.goodsName,
        goodsImage: this.goodsImages[0] || this.goods.headPic,
        specValues: this.selectedSkuText
      }]
      uni.setStorageSync('carts', JSON.stringify(orderGoods))
      this.showSkuModal = false
      this.$tab.navigateTo('/pages/order/confirm/index?type=detail')
    },
    async toggleCollect() {
      // 检查登录
      if (!getToken()) {
        const loggedIn = await this.$refs.loginModal.show()
        if (!loggedIn) return
      }

      try {
        if (this.isCollected) {
          await cancelCollect({ goodsId: this.goodsId })
          this.isCollected = false
          this.$modal.msgSuccess('已取消收藏')
        } else {
          await collectGoods({ goodsId: this.goodsId })
          this.isCollected = true
          this.$modal.msgSuccess('收藏成功')
        }
      } catch (e) {
        console.error('收藏操作失败', e)
      }
    },
    goHome() {
      this.$tab.switchTab('/pages/dechome/index')
    },
    goCart() {
      this.$tab.switchTab('/pages/cart/index')
    },
    // 格式化详情内容，给图片添加样式限制
    formatDetailContent(html) {
      if (!html) return ''
      // 给 img 标签添加样式限制宽度
      return html.replace(/<img /g, '<img style="max-width:100%;height:auto;" ')
    }
  }
}
</script>

<style lang="scss" scoped>
.goods-detail {
  padding-bottom: 180rpx;
  background-color: #f5f5f5;
}

.goods-swiper {
  width: 100%;
  height: 600rpx;
}

.goods-image {
  width: 100%;
  height: 100%;
}

.price-section {
  background-color: #fff;
  padding: 24rpx;
}

.price-row {
  display: flex;
  align-items: baseline;
  margin-bottom: 12rpx;
}

.current-price {
  font-size: 44rpx;
  color: #e4393c;
  font-weight: bold;
}

.market-price {
  font-size: 28rpx;
  color: #999;
  text-decoration: line-through;
  margin-left: 16rpx;
}

.goods-title {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
  line-height: 1.4;
}

.goods-subtitle {
  font-size: 26rpx;
  color: #999;
  margin-top: 8rpx;
}

.sku-section {
  display: flex;
  align-items: center;
  background-color: #fff;
  padding: 24rpx;
  margin-top: 20rpx;
}

.section-label {
  font-size: 28rpx;
  color: #999;
  margin-right: 16rpx;
}

.sku-text {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.detail-section {
  background-color: #fff;
  margin-top: 20rpx;
  padding: 24rpx;
}

.section-title {
  text-align: center;
  padding: 20rpx 0;
  font-size: 30rpx;
  color: #333;
  font-weight: bold;
  border-bottom: 1rpx solid #eee;
  margin-bottom: 20rpx;
}

.detail-content {
  font-size: 28rpx;
  line-height: 1.8;
  overflow: hidden;
  word-break: break-all;

  // 富文本中的图片限制宽度
  :deep(img) {
    max-width: 100% !important;
    height: auto !important;
  }

  :deep(image) {
    max-width: 100% !important;
    height: auto !important;
  }

  // 富文本中的视频限制宽度
  :deep(video) {
    max-width: 100% !important;
  }

  // 富文本中的表格限制宽度
  :deep(table) {
    width: 100% !important;
  }

  :deep(td) {
    word-break: break-all;
  }
}

// SKU 弹窗
.sku-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
}

.sku-modal-content {
  width: 100%;
  background-color: #fff;
  border-radius: 24rpx 24rpx 0 0;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.sku-header {
  display: flex;
  padding: 24rpx;
  border-bottom: 1rpx solid #eee;
}

.sku-goods-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
}

.sku-goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.sku-goods-price {
  font-size: 40rpx;
  color: #e4393c;
  font-weight: bold;
}

.sku-goods-stock {
  font-size: 26rpx;
  color: #999;
  margin-top: 8rpx;
}

.sku-close {
  align-self: flex-start;
  font-size: 40rpx;
  color: #999;
}

.sku-scroll {
  flex: 1;
  padding: 24rpx;
}

.sku-group {
  margin-bottom: 24rpx;
}

.sku-group-name {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 16rpx;
}

.sku-values {
  display: flex;
  flex-wrap: wrap;
}

.sku-value-item {
  padding: 12rpx 24rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  margin-right: 16rpx;
  margin-bottom: 16rpx;
  font-size: 26rpx;
  color: #333;
}

.sku-value-item.active {
  background-color: #fff2e6;
  color: #f2b974;
  border: 1rpx solid #f2b974;
}

.quantity-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
}

.quantity-label {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.quantity-control {
  display: flex;
  align-items: center;
}

.qty-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  font-size: 32rpx;
}

.qty-num {
  width: 80rpx;
  text-align: center;
  font-size: 30rpx;
}

.sku-actions {
  display: flex;
  padding: 24rpx;
  border-top: 1rpx solid #eee;
}

.btn-add-cart,
.btn-buy-now {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 40rpx;
  font-size: 30rpx;
}

.btn-add-cart {
  background-color: #ff9500;
  color: #fff;
  margin-right: 16rpx;
}

.btn-buy-now {
  background-color: #e4393c;
  color: #fff;
}

// 底部操作栏
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.bar-content {
  display: flex;
  align-items: center;
  height: 100rpx;
}

.bar-safe-area {
  height: constant(safe-area-inset-bottom);
  height: env(safe-area-inset-bottom);
}

.bar-left {
  display: flex;
  width: 240rpx;
}

.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
}

.bar-item-text {
  font-size: 20rpx;
  color: #666;
  margin-top: 4rpx;
}

.bar-right {
  flex: 1;
  display: flex;
  padding: 0 24rpx;
}

.bar-btn {
  flex: 1;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 36rpx;
  font-size: 28rpx;
  color: #fff;
}

.btn-cart {
  background-color: #ff9500;
  margin-right: 16rpx;
}

.btn-buy {
  background-color: #e4393c;
}
</style>
