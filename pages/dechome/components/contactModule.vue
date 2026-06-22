<template>
  <view class="contact-module">
    <view class="contact-left">
      <text class="contact-name">{{ contactName }}</text>
      <text class="contact-address">{{ contactAddress }}</text>
    </view>
    <view class="contact-right" @click="callPhone">
      <text class="cuIcon-phone"></text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ContactModule',
  props: {
    data: { type: Object, default: () => ({}) }
  },
  computed: {
    list() { return this.data.re || [] },
    contactName() {
      const item = this.list.find(r => r.controlName)
      return item?.controlName || '店铺名称'
    },
    contactAddress() {
      const item = this.list.find(r => r.site)
      return item?.site || '暂无地址'
    },
    phone() {
      const item = this.list.find(r => r.phone)
      return item?.phone || ''
    }
  },
  methods: {
    callPhone() {
      if (this.phone) {
        uni.makePhoneCall({ phoneNumber: this.phone })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.contact-module {
  display: flex; align-items: center; padding: 24rpx;
  background: #fff; gap: 20rpx; 
}
.contact-left { flex: 1; }
.contact-name { font-size: 30rpx; font-weight: 600; color: #333; display: block; margin-bottom: 8rpx; }
.contact-address { font-size: 24rpx; color: #999; display: block; }
.contact-right {
  width: 88rpx; height: 88rpx; border-radius: 50%;
  background: #409eff; color: #fff; font-size: 40rpx;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
</style>
