<template>
  <view class="after-detail" v-if="detail">
    <!-- 状态头 -->
    <view class="status-header">
      <text class="status-text">{{ getStatusText(detail.afterStatus, detail.afterType) }}</text>
    </view>

    <!-- 退货地址 -->
    <view class="section" v-if="detail.afterStatus === 3 && returnAddress">
      <text class="section-title">退货地址</text>
      <view class="address-info">
        <text class="address-name">{{ returnAddress.consignee }} {{ returnAddress.phone }}</text>
        <text class="address-detail">{{ returnAddress.province }}{{ returnAddress.city }}{{ returnAddress.district }}{{ returnAddress.address }}</text>
      </view>
      <view class="copy-btn" @click="copyAddress">复制地址</view>
    </view>

    <!-- 售后信息 -->
    <view class="section">
      <text class="section-title">售后信息</text>
      <view class="info-row">
        <text class="info-label">服务类型</text>
        <text class="info-value">{{ detail.afterType === 1 ? '仅退款' : '退货退款' }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">退款金额</text>
        <text class="info-value highlight">¥{{ detail.refundAmount }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">退款原因</text>
        <text class="info-value">{{ detail.reason }}</text>
      </view>
      <view class="info-row" v-if="detail.description">
        <text class="info-label">退款说明</text>
        <text class="info-value">{{ detail.description }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">申请时间</text>
        <text class="info-value">{{ detail.createTime }}</text>
      </view>
    </view>

    <!-- 拒绝原因 -->
    <view class="section" v-if="detail.afterStatus === -1 && detail.auditorDesc">
      <text class="section-title">拒绝原因</text>
      <text class="reject-reason">{{ detail.auditorDesc }}</text>
    </view>

    <!-- 操作按钮 -->
    <view class="bottom-bar" v-if="detail.afterStatus === 3">
      <view class="action-btn" @click="cancelSale">取消售后</view>
      <view class="action-btn primary" @click="fillLogistics">我已寄出</view>
    </view>
    <view class="bottom-bar" v-if="detail.afterStatus === 2 || (detail.afterStatus === -1 && detail.afterType === 2)">
      <view class="action-btn" @click="cancelSale">撤销售后</view>
    </view>
  </view>
</template>

<script>
import { getAfterSale, cancelAfterSale, getAfterSaleAddress } from '@/api/mall/afterSale'

export default {
  data() {
    return {
      orderAfterId: '',
      detail: null,
      returnAddress: null
    }
  },
  onLoad(options) {
    if (options.id) {
      this.orderAfterId = options.id
      this.loadDetail()
    }
  },
  methods: {
    async loadDetail() {
      try {
        const res = await getAfterSale(this.orderAfterId)
        if (res.data) {
          this.detail = res.data
          if (this.detail.afterStatus === 3 && this.detail.addressId) {
            this.loadReturnAddress()
          }
        }
      } catch (e) {
        console.error(e)
      }
    },
    async loadReturnAddress() {
      try {
        const res = await getAfterSaleAddress(this.detail.addressId)
        if (res.data) {
          this.returnAddress = res.data
        }
      } catch (e) {
        console.error(e)
      }
    },
    getStatusText(status, type) {
      if (type === 1) {
        const map = { 1: '退款成功', 2: '退款处理中', '-1': '退款关闭' }
        return map[status] || '未知'
      }
      const map = { 1: '退款成功', 2: '退货退款中', 3: '请退货给商家', 4: '等待商家确认收货', '-1': '退款关闭' }
      return map[status] || '未知'
    },
    copyAddress() {
      const addr = this.returnAddress
      const text = `${addr.consignee} ${addr.phone}\n${addr.province}${addr.city}${addr.district}${addr.address}`
      uni.setClipboardData({ data: text, success: () => this.$modal.msgSuccess('已复制') })
    },
    async cancelSale() {
      try {
        await this.$modal.confirm('确定取消售后？')
      } catch (e) { return }
      try {
        await cancelAfterSale({ orderAfterId: this.orderAfterId })
        this.$modal.msgSuccess('已取消')
        this.loadDetail()
      } catch (e) {
        console.error(e)
      }
    },
    fillLogistics() {
      // TODO: 跳转填写物流页面
      this.$modal.msg('物流填写功能开发中')
    }
  }
}
</script>

<style lang="scss" scoped>
.after-detail { min-height: 100vh; background-color: #f5f5f5; padding-bottom: 120rpx; }
.status-header { background-color: #f2b974; padding: 40rpx 24rpx; }
.status-text { font-size: 36rpx; color: #fff; font-weight: bold; }
.section { background-color: #fff; margin-bottom: 20rpx; padding: 24rpx; }
.section-title { font-size: 28rpx; color: #333; font-weight: bold; margin-bottom: 16rpx; }
.address-info { margin-bottom: 16rpx; }
.address-name { font-size: 28rpx; color: #333; display: block; margin-bottom: 8rpx; }
.address-detail { font-size: 26rpx; color: #999; }
.copy-btn { font-size: 26rpx; color: #f2b974; text-align: right; }
.info-row { display: flex; padding: 12rpx 0; }
.info-label { font-size: 26rpx; color: #999; width: 150rpx; }
.info-value { flex: 1; font-size: 26rpx; color: #333; }
.highlight { color: #e4393c; font-weight: bold; }
.reject-reason { font-size: 26rpx; color: #e4393c; }
.bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; height: 100rpx; background-color: #fff; display: flex; align-items: center; justify-content: flex-end; padding: 0 24rpx; box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05); }
.action-btn { padding: 16rpx 32rpx; border: 1rpx solid #ddd; border-radius: 40rpx; margin-left: 16rpx; font-size: 28rpx; color: #666; }
.action-btn.primary { border-color: #f2b974; color: #f2b974; }
</style>
