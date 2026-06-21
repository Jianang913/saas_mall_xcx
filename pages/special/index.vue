<template>
  <view class="special-page">
    <!-- Banner -->
    <image v-if="pageData.pagePic" class="page-banner" :src="pageData.pagePic" mode="widthFix" />

    <!-- 图文说明 -->
    <view class="page-content" v-if="pageData.specialPageImageText">
      <rich-text :nodes="pageData.specialPageImageText"></rich-text>
    </view>

    <!-- 分类 Tab -->
    <view class="classify-tabs" v-if="classifyList.length">
      <scroll-view scroll-x class="tabs-scroll">
        <view
          class="tab-item"
          :class="{ active: currentClassifyId === item.classifyId }"
          v-for="item in classifyList"
          :key="item.classifyId"
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
        <image class="goods-image" :src="item.goodsImage" mode="aspectFill" />
        <view class="goods-info">
          <text class="goods-name">{{ item.goodsName }}</text>
          <view class="price-row">
            <text class="goods-price">¥{{ item.shopPrice }}</text>
            <text class="market-price" v-if="item.marketPrice">¥{{ item.marketPrice }}</text>
          </view>
        </view>
      </view>

      <view class="loading-tip" v-if="loading"><text>加载中...</text></view>
      <view class="loading-tip" v-else-if="noMore && goodsList.length"><text>没有更多了</text></view>
      <view class="empty" v-if="!goodsList.length && !loading"><text>暂无商品</text></view>
    </scroll-view>
  </view>
</template>

<script>
import { getSpecialPage, getSpecialClassifyGoods } from '@/api/mall/specialPage'

export default {
  data() {
    return {
      pageId: '',
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
  onLoad(options) {
    if (options.id) {
      this.pageId = options.id
    }
    this.loadPage()
  },
  methods: {
    async loadPage() {
      try {
        const res = await getSpecialPage(this.pageId)
        if (res.data) {
          this.pageData = res.data
          if (res.data.classifyList) {
            this.classifyList = res.data.classifyList
            if (this.classifyList.length) {
              this.switchClassify(this.classifyList[0])
            }
          }
        }
      } catch (e) {
        console.error(e)
      }
    },
    switchClassify(item) {
      this.currentClassifyId = item.classifyId
      this.page = 1
      this.goodsList = []
      this.noMore = false
      this.loadGoods()
    },
    async loadGoods() {
      if (this.loading || !this.currentClassifyId) return
      this.loading = true
      try {
        const res = await getSpecialClassifyGoods({
          classifyId: this.currentClassifyId,
          page: this.page,
          pageSize: this.pageSize
        })
        if (res.rows) {
          this.goodsList = this.page === 1 ? res.rows : [...this.goodsList, ...res.rows]
          if (res.rows.length < this.pageSize) this.noMore = true
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
    goDetail(item) {
      this.$tab.navigateTo('/pages/goods/detail/index?id=' + item.goodsId)
    }
  }
}
</script>

<style lang="scss" scoped>
.special-page { min-height: 100vh; background-color: #f5f5f5; }
.page-banner { width: 100%; display: block; }
.page-content { background-color: #fff; padding: 24rpx; margin-bottom: 20rpx; }
.classify-tabs { background-color: #fff; margin-bottom: 20rpx; }
.tabs-scroll { white-space: nowrap; padding: 0 12rpx; }
.tab-item { display: inline-block; padding: 20rpx 24rpx; font-size: 28rpx; color: #666; }
.tab-item.active { color: #f2b974; font-weight: bold; border-bottom: 4rpx solid #f2b974; }
.goods-list { height: calc(100vh - 400rpx); padding: 0 20rpx; }
.goods-card { background-color: #fff; border-radius: 12rpx; margin-bottom: 20rpx; overflow: hidden; }
.goods-image { width: 100%; height: 360rpx; }
.goods-info { padding: 20rpx; }
.goods-name { font-size: 28rpx; color: #333; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.price-row { display: flex; align-items: baseline; margin-top: 12rpx; }
.goods-price { font-size: 34rpx; color: #e4393c; font-weight: bold; }
.market-price { font-size: 24rpx; color: #999; text-decoration: line-through; margin-left: 12rpx; }
.loading-tip { text-align: center; padding: 30rpx 0; font-size: 26rpx; color: #999; }
.empty { text-align: center; padding: 200rpx 0; font-size: 28rpx; color: #999; }
</style>
