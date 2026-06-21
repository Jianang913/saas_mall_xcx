<template>
  <view class="shop-module">
    <view class="module-header" v-if="data.title">
      <text class="module-title">{{ data.title }}</text>
    </view>
    <view class="goods-list">
      <view
        class="goods-item"
        v-for="(goods, index) in goodsList"
        :key="index"
        @click="$emit('click', goods.goodsId)"
      >
        <image class="goods-image" :src="goods.goodsImage || goods.image" mode="aspectFill" />
        <view class="goods-info">
          <text class="goods-name">{{ goods.goodsName || goods.name }}</text>
          <view class="goods-price-row">
            <text class="goods-price">¥{{ goods.shopPrice || goods.price }}</text>
            <text class="goods-market-price" v-if="goods.marketPrice">¥{{ goods.marketPrice }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ShopModule',
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    goodsList() {
      return this.data.goodsList || this.data.list || []
    }
  }
}
</script>

<style lang="scss" scoped>
.shop-module {
  background-color: #fff;
  margin-bottom: 20rpx;
  padding: 20rpx;
}

.module-header {
  margin-bottom: 20rpx;
}

.module-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.goods-list {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -10rpx;
}

.goods-item {
  width: 50%;
  padding: 0 10rpx;
  margin-bottom: 20rpx;
  box-sizing: border-box;
}

.goods-image {
  width: 100%;
  height: 320rpx;
  border-radius: 12rpx;
}

.goods-info {
  padding: 12rpx 0;
}

.goods-name {
  font-size: 26rpx;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.goods-price-row {
  display: flex;
  align-items: baseline;
  margin-top: 8rpx;
}

.goods-price {
  font-size: 32rpx;
  color: #e4393c;
  font-weight: bold;
}

.goods-market-price {
  font-size: 24rpx;
  color: #999;
  text-decoration: line-through;
  margin-left: 12rpx;
}
</style>
