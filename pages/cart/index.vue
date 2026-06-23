<template>
  <view class="cart-page">
    <!-- 编辑按钮 -->
    <view class="cart-header" v-if="cartList.length">
      <view class="header-right" @click="isEdit = !isEdit">
        <text>{{ isEdit ? '完成' : '编辑' }}</text>
      </view>
    </view>

    <!-- 购物车列表 -->
    <scroll-view scroll-y class="cart-list" v-if="cartList.length">
      <view class="cart-item" v-for="(item, index) in cartList" :key="item.cartId">
        <!-- 勾选 -->
        <view class="item-check" @click="toggleCheck(index)">
          <text class="cuIcon-check" :class="{ checked: item.checked }"></text>
        </view>
        <!-- 商品图片 -->
        <image class="item-image" :src="item.goodsImage" mode="aspectFill" @click="goDetail(item)" />
        <!-- 商品信息 -->
        <view class="item-info">
          <text class="item-name">{{ item.goodsName }}</text>
          <text class="item-spec" v-if="item.specValues">{{ item.specValues }}</text>
          <view class="item-bottom">
            <text class="item-price">¥{{ item.price }}</text>
            <!-- 数量控制 -->
            <view class="quantity-control">
              <view class="qty-btn" @click="changeQty(index, -1)">
                <text>−</text>
              </view>
              <text class="qty-num">{{ item.quantity }}</text>
              <view class="qty-btn" @click="changeQty(index, 1)">
                <text>+</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 空购物车 -->
    <view class="empty-cart" v-else>
      <text class="cuIcon-cart empty-icon"></text>
      <text class="empty-text">购物车空空如也</text>
      <view class="empty-btn" @click="goShopping">
        <text>去逛逛</text>
      </view>
    </view>

    <!-- 底部结算栏 -->
    <view class="cart-footer" v-if="cartList.length">
      <view class="footer-left">
        <view class="check-all" @click="toggleCheckAll">
          <text class="cuIcon-check" :class="{ checked: isAllChecked }"></text>
          <text class="check-all-text">全选</text>
        </view>
      </view>
      <view class="footer-right">
        <view class="total-info" v-if="!isEdit">
          <text class="total-label">合计：</text>
          <text class="total-price">¥{{ totalPrice }}</text>
        </view>
        <view class="action-btn" :class="{ 'btn-delete': isEdit }" @click="onAction">
          <text>{{ isEdit ? '删除(' + checkedCount + ')' : '结算(' + checkedCount + ')' }}</text>
        </view>
      </view>
    </view>

    <!-- 自定义 Tab 栏 -->
    <tab-bar />
    <!-- 登录弹窗 -->
    <login-modal ref="loginModal" />
  </view>
</template>

<script>
import { listCart, updateCart, delCart } from '@/api/mall/cart'
import { getToken } from '@/utils/auth'

export default {
  data() {
    return {
      cartList: [],
      isEdit: false
    }
  },
  computed: {
    isAllChecked() {
      return this.cartList.length > 0 && this.cartList.every(item => item.checked)
    },
    checkedList() {
      return this.cartList.filter(item => item.checked)
    },
    checkedCount() {
      return this.checkedList.length
    },
    totalPrice() {
      return this.checkedList.reduce((sum, item) => {
        return sum + (parseFloat(item.price) * item.quantity)
      }, 0).toFixed(2)
    }
  },
  onShow() {
    this.loadCart()
  },
  onPullDownRefresh() {
    this.loadCart().then(() => {
      uni.stopPullDownRefresh()
    })
  },
  methods: {
    async loadCart() {
      try {
        const res = await listCart()
        if (res.rows) {
          this.cartList = res.rows.map(item => ({
            ...item,
            checked: false
          }))
        }
      } catch (e) {
        console.error('加载购物车失败', e)
      }
    },
    toggleCheck(index) {
      this.cartList[index].checked = !this.cartList[index].checked
    },
    toggleCheckAll() {
      const allChecked = this.isAllChecked
      this.cartList.forEach(item => {
        item.checked = !allChecked
      })
    },
    async changeQty(index, delta) {
      const item = this.cartList[index]
      const newQty = item.quantity + delta
      if (newQty < 1) return

      try {
        await updateCart({
          cartId: item.cartId,
          quantity: newQty
        })
        item.quantity = newQty
      } catch (e) {
        console.error('修改数量失败', e)
      }
    },
    async onAction() {
      if (this.checkedCount === 0) {
        this.$modal.msgError('请选择商品')
        return
      }

      if (this.isEdit) {
        // 删除
        const ids = this.checkedList.map(item => item.cartId).join(',')
        try {
          await this.$modal.confirm('确定删除选中的商品？')
        } catch (e) {
          return // 用户取消
        }
        try {
          await delCart({ ids })
          this.$modal.msgSuccess('删除成功')
          this.loadCart()
        } catch (e) {
          console.error('删除失败', e)
        }
      } else {
        // 结算 — 检查登录
        if (!getToken()) {
          const loggedIn = await this.$refs.loginModal.show()
          if (!loggedIn) return
        }

        const carts = this.checkedList.map(item => ({
          cartId: item.cartId,
          goodsId: item.goodsId,
          goodsSpeId: item.goodsSpeId,
          quantity: item.quantity,
          price: item.price,
          goodsName: item.goodsName,
          goodsImage: item.goodsImage,
          specValues: item.specValues
        }))
        uni.setStorageSync('carts', JSON.stringify(carts))
        this.$tab.navigateTo('/pages/order/confirm/index?type=cart')
      }
    },
    goDetail(item) {
      this.$tab.navigateTo('/pages/goods/detail/index?id=' + item.goodsId)
    },
    goShopping() {
      this.$tab.switchTab('/pages/dechome/index')
    }
  }
}
</script>

<style lang="scss" scoped>
.cart-page {
  min-height: 100vh;
  background-color: #fff;
  padding-bottom: 230rpx;
}

.cart-header {
  display: flex;
  justify-content: flex-end;
  padding: 20rpx 24rpx;
  background-color: #fff;
}

.header-right {
  font-size: 28rpx;
  color: #666;
}

.cart-list {
  height: calc(100vh - 120rpx);
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
}

.item-check {
  margin-right: 20rpx;
}

.item-check .cuIcon-check {
  font-size: 40rpx;
  color: #ddd;
}

.item-check .cuIcon-check.checked {
  color: #f2b974;
}

.item-image {
  width: 160rpx;
  height: 160rpx;
  margin-right: 20rpx;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 160rpx;
}

.item-name {
  font-size: 28rpx;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-spec {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.item-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12rpx;
}

.item-price {
  font-size: 32rpx;
  color: #e4393c;
  font-weight: bold;
}

.quantity-control {
  display: flex;
  align-items: center;
}

.qty-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.qty-num {
  width: 64rpx;
  text-align: center;
  font-size: 28rpx;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.empty-icon {
  font-size: 120rpx;
  color: #ddd;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  margin: 24rpx 0;
}

.empty-btn {
  padding: 16rpx 48rpx;
  background-color: #f2b974;
  border-radius: 40rpx;
  color: #fff;
  font-size: 28rpx;
}

.cart-footer {
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

.footer-left {
  display: flex;
  align-items: center;
}

.check-all {
  display: flex;
  align-items: center;
}

.check-all .cuIcon-check {
  font-size: 40rpx;
  color: #ddd;
  margin-right: 8rpx;
}

.check-all .cuIcon-check.checked {
  color: #f2b974;
}

.check-all-text {
  font-size: 28rpx;
  color: #333;
}

.footer-right {
  display: flex;
  align-items: center;
}

.total-info {
  margin-right: 20rpx;
}

.total-label {
  font-size: 28rpx;
  color: #333;
}

.total-price {
  font-size: 32rpx;
  color: #e4393c;
  font-weight: bold;
}

.action-btn {
  padding: 16rpx 40rpx;
  background-color: #f2b974;
  border-radius: 40rpx;
  color: #fff;
  font-size: 28rpx;
}

.action-btn.btn-delete {
  background-color: #e4393c;
}
</style>
