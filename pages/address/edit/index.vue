<template>
  <view class="address-edit-page">
    <view class="form-item">
      <text class="form-label">收货人</text>
      <input class="form-input" v-model="form.consignee" placeholder="请输入收货人姓名" />
    </view>
    <view class="form-item">
      <text class="form-label">手机号</text>
      <input class="form-input" v-model="form.phone" placeholder="请输入手机号" type="number" maxlength="11" />
    </view>
    <view class="form-item" @click="showRegionPicker = true">
      <text class="form-label">所在地区</text>
      <text class="form-value" :class="{ placeholder: !regionText }">{{ regionText || '请选择省市区' }}</text>
      <text class="cuIcon-right"></text>
    </view>
    <view class="form-item">
      <text class="form-label">详细地址</text>
      <input class="form-input" v-model="form.address" placeholder="请输入详细地址" />
    </view>
    <view class="form-item switch-item">
      <text class="form-label">设为默认</text>
      <switch :checked="form.defaultFlag === '1'" @change="form.defaultFlag = $event.detail.value ? '1' : '0'" color="#f2b974" />
    </view>

    <!-- 保存按钮 -->
    <view class="save-btn" @click="save">
      <text>保存</text>
    </view>

    <!-- 删除按钮 -->
    <view class="delete-btn" v-if="addressId" @click="onDelete">
      <text>删除地址</text>
    </view>

    <!-- 省市区选择器 -->
    <view class="region-picker" v-if="showRegionPicker" @click.self="showRegionPicker = false">
      <view class="picker-content">
        <view class="picker-header">
          <text @click="showRegionPicker = false">取消</text>
          <text class="confirm" @click="confirmRegion">确定</text>
        </view>
        <picker-view class="picker-view" :value="pickerValue" @change="onPickerChange">
          <picker-view-column>
            <view class="picker-item" v-for="(item, index) in provinces" :key="index">{{ item.regionName }}</view>
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="(item, index) in cities" :key="index">{{ item.regionName }}</view>
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="(item, index) in districts" :key="index">{{ item.regionName }}</view>
          </picker-view-column>
        </picker-view>
      </view>
    </view>
  </view>
</template>

<script>
import { listAddress, addAddress, updateAddress, delAddress, getRegion } from '@/api/mall/address'

export default {
  data() {
    return {
      addressId: '',
      form: {
        consignee: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        address: '',
        defaultFlag: '0'
      },
      regionList: [],
      showRegionPicker: false,
      pickerValue: [0, 0, 0],
      tempProvince: '',
      tempCity: '',
      tempDistrict: ''
    }
  },
  computed: {
    regionText() {
      if (this.form.province) {
        return `${this.form.province} ${this.form.city} ${this.form.district}`
      }
      return ''
    },
    provinces() {
      return this.regionList
    },
    cities() {
      const prov = this.provinces[this.pickerValue[0]]
      return prov ? (prov.children || []) : []
    },
    districts() {
      const city = this.cities[this.pickerValue[1]]
      return city ? (city.children || []) : []
    }
  },
  onLoad(options) {
    if (options.id) {
      this.addressId = options.id
      this.loadAddress()
    }
    this.loadRegion()
  },
  methods: {
    async loadAddress() {
      try {
        const res = await listAddress({ pageSize: 100 })
        if (res.rows) {
          const addr = res.rows.find(a => a.addressId == this.addressId)
          if (addr) {
            this.form = { ...addr }
          }
        }
      } catch (e) {
        console.error(e)
      }
    },
    async loadRegion() {
      try {
        const res = await getRegion()
        if (res.data) {
          this.regionList = this.buildTree(res.data)
        }
      } catch (e) {
        console.error(e)
      }
    },
    buildTree(list) {
      const map = {}
      const tree = []
      list.forEach(item => {
        map[item.id] = { ...item, regionName: item.regionName || item.name, children: [] }
      })
      list.forEach(item => {
        if (item.parentId && map[item.parentId]) {
          map[item.parentId].children.push(map[item.id])
        } else if (!item.parentId || item.parentId === 0) {
          tree.push(map[item.id])
        }
      })
      return tree
    },
    onPickerChange(e) {
      this.pickerValue = e.detail.value
    },
    confirmRegion() {
      const prov = this.provinces[this.pickerValue[0]]
      const city = this.cities[this.pickerValue[1]]
      const dist = this.districts[this.pickerValue[2]]
      if (prov) this.form.province = prov.regionName
      if (city) this.form.city = city.regionName
      if (dist) this.form.district = dist.regionName
      this.showRegionPicker = false
    },
    async save() {
      if (!this.form.consignee) {
        this.$modal.msgError('请输入收货人')
        return
      }
      if (!this.form.phone || this.form.phone.length !== 11) {
        this.$modal.msgError('请输入正确的手机号')
        return
      }
      if (!this.form.province) {
        this.$modal.msgError('请选择省市区')
        return
      }
      if (!this.form.address) {
        this.$modal.msgError('请输入详细地址')
        return
      }

      try {
        if (this.addressId) {
          await updateAddress(this.form)
        } else {
          await addAddress(this.form)
        }
        this.$modal.msgSuccess('保存成功')
        setTimeout(() => {
          this.$tab.navigateBack()
        }, 1500)
      } catch (e) {
        console.error(e)
      }
    },
    async onDelete() {
      try {
        await this.$modal.confirm('确定删除该地址？')
      } catch (e) { return }
      try {
        await delAddress(this.addressId)
        this.$modal.msgSuccess('已删除')
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
.address-edit-page { min-height: 100vh; background-color: #f5f5f5; }
.form-item { display: flex; align-items: center; background-color: #fff; padding: 24rpx; margin-bottom: 2rpx; }
.form-label { font-size: 28rpx; color: #333; width: 160rpx; }
.form-input { flex: 1; font-size: 28rpx; }
.form-value { flex: 1; font-size: 28rpx; color: #333; }
.form-value.placeholder { color: #999; }
.switch-item { margin-top: 20rpx; }
.save-btn { margin: 40rpx 24rpx; height: 88rpx; background-color: #f2b974; border-radius: 44rpx; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 32rpx; }
.delete-btn { margin: 20rpx 24rpx; height: 88rpx; border: 1rpx solid #e4393c; border-radius: 44rpx; display: flex; align-items: center; justify-content: center; color: #e4393c; font-size: 32rpx; }
.region-picker { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.5); z-index: 999; display: flex; align-items: flex-end; }
.picker-content { width: 100%; background-color: #fff; border-radius: 24rpx 24rpx 0 0; }
.picker-header { display: flex; justify-content: space-between; padding: 24rpx; border-bottom: 1rpx solid #eee; font-size: 28rpx; color: #666; }
.picker-header .confirm { color: #f2b974; }
.picker-view { height: 480rpx; }
.picker-item { display: flex; align-items: center; justify-content: center; font-size: 28rpx; }
</style>
