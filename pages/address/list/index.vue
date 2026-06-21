<template>
  <view class="address-list-page">
    <scroll-view scroll-y class="address-list">
      <view
        class="address-item"
        v-for="item in addressList"
        :key="item.addressId"
        @click="onSelect(item)"
      >
        <view class="address-info">
          <view class="address-top">
            <text class="address-name">{{ item.consignee }}</text>
            <text class="address-phone">{{ item.phone }}</text>
            <text class="default-tag" v-if="item.defaultFlag === '1'">默认</text>
          </view>
          <text class="address-detail">{{ item.province }}{{ item.city }}{{ item.district }}{{ item.address }}</text>
        </view>
        <view class="address-actions">
          <text class="cuIcon-edit" @click.stop="editAddress(item)"></text>
        </view>
      </view>

      <uni-load-more v-if="!addressList.length" status="noData" />
    </scroll-view>

    <!-- 新增按钮 -->
    <view class="add-btn" @click="addAddress">
      <text>新增收货地址</text>
    </view>
  </view>
</template>

<script>
import { listAddress, delAddress } from '@/api/mall/address'

export default {
  data() {
    return {
      addressList: [],
      isSelect: false
    }
  },
  onLoad(options) {
    this.isSelect = options.select === '1'
    this.loadAddresses()
  },
  onShow() {
    this.loadAddresses()
  },
  methods: {
    async loadAddresses() {
      try {
        const res = await listAddress({ pageSize: 100 })
        if (res.rows) {
          this.addressList = res.rows
        }
      } catch (e) {
        console.error(e)
      }
    },
    onSelect(item) {
      if (this.isSelect) {
        uni.setStorageSync('selectedAddress', JSON.stringify(item))
        this.$tab.navigateBack()
      }
    },
    editAddress(item) {
      this.$tab.navigateTo('/pages/address/edit/index?id=' + item.addressId)
    },
    addAddress() {
      this.$tab.navigateTo('/pages/address/edit/index')
    }
  }
}
</script>

<style lang="scss" scoped>
.address-list-page { min-height: 100vh; background-color: #f5f5f5; padding-bottom: 120rpx; }
.address-list { height: calc(100vh - 120rpx); padding: 20rpx; }
.address-item { display: flex; align-items: center; background-color: #fff; border-radius: 12rpx; padding: 24rpx; margin-bottom: 20rpx; }
.address-info { flex: 1; }
.address-top { display: flex; align-items: center; margin-bottom: 8rpx; }
.address-name { font-size: 30rpx; color: #333; font-weight: bold; margin-right: 16rpx; }
.address-phone { font-size: 28rpx; color: #666; }
.default-tag { font-size: 22rpx; color: #f2b974; border: 1rpx solid #f2b974; padding: 2rpx 12rpx; border-radius: 4rpx; margin-left: 12rpx; }
.address-detail { font-size: 26rpx; color: #999; line-height: 1.4; }
.address-actions { font-size: 36rpx; color: #999; padding-left: 20rpx; }
.add-btn { position: fixed; bottom: 0; left: 0; right: 0; height: 100rpx; background-color: #f2b974; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 32rpx; }
</style>
