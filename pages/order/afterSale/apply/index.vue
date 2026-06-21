<template>
  <view class="apply-page">
    <!-- 售后类型切换 -->
    <view class="type-tabs">
      <view class="type-tab" :class="{ active: afterType === 1 }" @click="afterType = 1">
        <text>仅退款</text>
      </view>
      <view class="type-tab" :class="{ active: afterType === 2 }" @click="afterType = 2">
        <text>退货退款</text>
      </view>
    </view>

    <!-- 退款原因 -->
    <view class="section">
      <text class="section-title">退款原因</text>
      <view class="reason-list">
        <view
          class="reason-item"
          :class="{ active: selectedReason === reason }"
          v-for="reason in reasonList"
          :key="reason"
          @click="selectedReason = reason"
        >
          <text>{{ reason }}</text>
        </view>
      </view>
    </view>

    <!-- 退款说明 -->
    <view class="section">
      <text class="section-title">退款说明</text>
      <textarea class="desc-input" v-model="description" placeholder="请描述退款原因（选填）" maxlength="200" />
    </view>

    <!-- 图片上传 -->
    <view class="section">
      <text class="section-title">上传凭证（最多3张）</text>
      <view class="image-list">
        <view class="image-item" v-for="(img, index) in images" :key="index">
          <image class="preview-image" :src="img" mode="aspectFill" />
          <view class="delete-btn" @click="images.splice(index, 1)">
            <text class="cuIcon-close"></text>
          </view>
        </view>
        <view class="add-image" v-if="images.length < 3" @click="chooseImage">
          <text class="cuIcon-cameraadd"></text>
        </view>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-btn" @click="submit">
      <text>提交申请</text>
    </view>
  </view>
</template>

<script>
import { applyAfterSale } from '@/api/mall/afterSale'

export default {
  data() {
    return {
      orderId: '',
      afterType: 1,
      selectedReason: '',
      description: '',
      images: []
    }
  },
  computed: {
    reasonList() {
      if (this.afterType === 1) {
        return ['长时间没发货', '其他原因']
      }
      return ['收到商品破损', '商品错发/漏发', '收到商品不符', '商品质量问题']
    }
  },
  onLoad(options) {
    if (options.id) {
      this.orderId = options.id
    }
  },
  methods: {
    chooseImage() {
      uni.chooseImage({
        count: 3 - this.images.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.images.push(...res.tempFilePaths)
        }
      })
    },
    async submit() {
      if (!this.selectedReason) {
        this.$modal.msgError('请选择退款原因')
        return
      }
      try {
        const data = {
          orderId: this.orderId,
          afterType: this.afterType,
          reason: this.selectedReason,
          description: this.description
        }
        await applyAfterSale(data)
        this.$modal.msgSuccess('申请已提交')
        setTimeout(() => {
          this.$tab.navigateBack()
        }, 1500)
      } catch (e) {
        console.error(e)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.apply-page { min-height: 100vh; background-color: #f5f5f5; padding-bottom: 120rpx; }
.type-tabs { display: flex; background-color: #fff; margin-bottom: 20rpx; }
.type-tab { flex: 1; text-align: center; padding: 24rpx; font-size: 28rpx; color: #666; position: relative; }
.type-tab.active { color: #f2b974; font-weight: bold; }
.type-tab.active::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 60rpx; height: 4rpx; background-color: #f2b974; }
.section { background-color: #fff; padding: 24rpx; margin-bottom: 20rpx; }
.section-title { font-size: 28rpx; color: #333; font-weight: bold; margin-bottom: 16rpx; }
.reason-list { display: flex; flex-wrap: wrap; }
.reason-item { padding: 16rpx 24rpx; background-color: #f5f5f5; border-radius: 8rpx; margin-right: 16rpx; margin-bottom: 16rpx; font-size: 26rpx; color: #666; }
.reason-item.active { background-color: #fff2e6; color: #f2b974; border: 1rpx solid #f2b974; }
.desc-input { width: 100%; height: 160rpx; font-size: 28rpx; }
.image-list { display: flex; flex-wrap: wrap; }
.image-item { position: relative; margin-right: 16rpx; margin-bottom: 16rpx; }
.preview-image { width: 160rpx; height: 160rpx; border-radius: 8rpx; }
.delete-btn { position: absolute; top: -10rpx; right: -10rpx; width: 40rpx; height: 40rpx; background-color: #e4393c; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 24rpx; }
.add-image { width: 160rpx; height: 160rpx; background-color: #f5f5f5; border-radius: 8rpx; display: flex; align-items: center; justify-content: center; font-size: 48rpx; color: #999; }
.submit-btn { position: fixed; bottom: 0; left: 0; right: 0; height: 100rpx; background-color: #e4393c; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 32rpx; }
</style>
