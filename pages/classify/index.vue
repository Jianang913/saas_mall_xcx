<template>
  <view class="classify-page">
    <!-- 搜索栏 -->
    <view class="search-bar" @click="goSearch">
      <view class="search-input">
        <text class="cuIcon-search"></text>
        <text class="search-placeholder">搜索商品</text>
      </view>
    </view>

    <view class="classify-content">
      <!-- 左侧一级分类 -->
      <scroll-view scroll-y class="col-left">
        <view
          class="left-item"
          :class="{ active: currentCatIdx === index }"
          v-for="(cat, index) in categoryList"
          :key="cat.goodsCatId"
          @click="switchCat(index)"
        >
          <text>{{ cat.catName || cat.alias }}</text>
        </view>
      </scroll-view>

      <!-- 中间二级分类 -->
      <scroll-view scroll-y class="col-mid">
        <view
          class="mid-item"
          :class="{ active: selectedSubCatId === sub.goodsCatId }"
          v-for="sub in subCatList"
          :key="sub.goodsCatId"
          @click="selectSubCat(sub)"
        >
          <image v-if="sub.catPic" class="mid-icon" :src="getImgUrl(sub.catPic)" mode="aspectFit" />
          <text class="mid-name">{{ sub.catName || sub.alias }}</text>
        </view>
      </scroll-view>

      <!-- 右侧商品列表 -->
      <scroll-view scroll-y class="col-right" :scroll-top="rightScrollTop" @scrolltolower="loadMoreGoods">
        <!-- 商品网格 -->
        <view class="goods-grid">
          <view
            class="goods-item"
            v-for="item in goodsList"
            :key="item.goodsId"
            @click="goDetail(item)"
          >
            <view class="goods-img-wrap">
              <image class="goods-img" :src="getImgUrl(item.outPic || item.headPic)" mode="aspectFill" />
            </view>
            <view class="goods-info">
              <text class="goods-name">{{ item.goodsName }}</text>
              <view class="goods-bottom">
                <text class="goods-price">¥{{ item.shopPrice }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 加载 / 空状态 -->
        <view class="load-more" v-if="goodsList.length > 0">
          <uni-load-more :status="goodsLoading ? 'loading' : goodsNoMore ? 'noMore' : 'more'" />
        </view>
        <view class="empty-state" v-if="!goodsList.length && !goodsLoading && goodsLoaded">
          <text class="empty-text">暂无商品</text>
        </view>
      </scroll-view>
    </view>

    <!-- SKU 选择弹窗 -->
    <view class="sku-modal" v-if="skuModal.visible" @click="skuModal.visible = false">
      <view class="sku-modal-content" @click.stop>
        <view class="sku-header">
          <image class="sku-goods-image" :src="getImgUrl(skuModal.goods?.outPic || skuModal.goods?.headPic)" mode="aspectFill" />
          <view class="sku-goods-info">
            <text class="sku-goods-price">¥{{ skuModal.selectedPrice }}</text>
            <text class="sku-goods-stock">库存：{{ skuModal.selectedStock }}</text>
          </view>
          <view class="sku-close" @click="skuModal.visible = false">×</view>
        </view>
        <scroll-view scroll-y class="sku-scroll">
          <view class="sku-group" v-for="group in skuModal.specGroups" :key="group.attrName">
            <text class="sku-group-name">{{ group.attrName }}</text>
            <view class="sku-values">
              <view
                class="sku-value-item"
                :class="{ active: group.selectedIdx === idx }"
                v-for="(val, idx) in group.values"
                :key="idx"
                @click="selectSpec(group, idx)"
              >
                <text>{{ val }}</text>
              </view>
            </view>
          </view>
          <view class="quantity-row">
            <text>数量</text>
            <view class="quantity-control">
              <view class="qty-btn" @click="skuModal.buyNum > 1 && skuModal.buyNum--"><text>−</text></view>
              <text class="qty-num">{{ skuModal.buyNum }}</text>
              <view class="qty-btn" @click="skuModal.buyNum++"><text>+</text></view>
            </view>
          </view>
        </scroll-view>
        <view class="sku-footer">
          <view class="sku-add-btn" @click="confirmAddCart"><text>加入购物车</text></view>
        </view>
      </view>
    </view>

    <tab-bar />
  </view>
</template>

<script>
import { listGoodsCat, listGoods, getGoods } from '@/api/mall/goods'
import { addCart } from '@/api/mall/cart'
import { resolveOssUrls } from '@/utils/oss'
import { navigateTo } from '@/utils/navigate'

export default {
  data() {
    return {
      categoryList: [],
      currentCatIdx: 0,
      selectedSubCatId: null,
      selectedSubCatName: '',
      goodsList: [],
      goodsTotal: 0,
      goodsLoading: false,
      goodsNoMore: false,
      goodsLoaded: false,
      goodsPage: 1,
      rightScrollTop: 0,
      urlCache: new Map(),
      skuModal: {
        visible: false,
        goods: null,
        specList: [],
        specGroups: [],
        selectedPrice: 0,
        selectedStock: 0,
        buyNum: 1,
        defaultSpeId: null
      }
    }
  },
  computed: {
    currentCat() {
      return this.categoryList[this.currentCatIdx] || null
    },
    subCatList() {
      return this.currentCat?.children || []
    }
  },
  onLoad() {
    this.loadCategories()
  },
  onPullDownRefresh() {
    this.loadCategories().then(() => uni.stopPullDownRefresh())
  },
  methods: {
    async loadCategories() {
      try {
        const res = await listGoodsCat()
        if (res.code === 200 && res.data) {
          this.categoryList = res.data
          this.resolveCategoryImages(res.data)
          // 默认选中第一个一级分类的第一个二级分类
          if (this.subCatList.length > 0) {
            this.$nextTick(() => this.selectSubCat(this.subCatList[0]))
          }
        }
      } catch (e) {
        console.error('加载分类失败', e)
      }
    },

    // 切换一级分类
    switchCat(index) {
      this.currentCatIdx = index
      this.goodsList = []
      this.goodsLoaded = false
      if (this.subCatList.length > 0) {
        this.selectSubCat(this.subCatList[0])
      }
    },

    // 选择二级分类 → 加载对应商品
    async selectSubCat(sub) {
      if (this.selectedSubCatId === sub.goodsCatId) return
      this.selectedSubCatId = sub.goodsCatId
      this.selectedSubCatName = sub.alias || sub.catName
      this.goodsPage = 1
      this.goodsList = []
      this.goodsNoMore = false
      this.goodsLoaded = false
      this.rightScrollTop = 0
      await this.loadGoods()
    },

    async loadGoods() {
      if (this.goodsLoading) return
      this.goodsLoading = true
      try {
        const res = await listGoods({
          catId: this.selectedSubCatId,
          pageNum: this.goodsPage,
          pageSize: 20
        })
        if (res.code === 200) {
          const data = res.data || {}
          const list = data.rows || []
          this.goodsTotal = data.total || 0
          this.goodsList = this.goodsPage === 1 ? list : [...this.goodsList, ...list]
          this.goodsNoMore = list.length < 20
          this.goodsLoaded = true
          this.resolveGoodsImages(list)
        }
      } catch (e) {
        console.error('加载商品失败', e)
      } finally {
        this.goodsLoading = false
      }
    },

    loadMoreGoods() {
      if (this.goodsNoMore || this.goodsLoading) return
      this.goodsPage++
      this.loadGoods()
    },

    goDetail(item) {
      navigateTo('/pages/goods/detail/index?id=' + item.goodsId)
    },
    goSearch() {
      navigateTo('/pages/search/index')
    },

    // ========== 加购 ==========
    async quickAddCart(item) {
      if (!item.defaultSpeId) {
        uni.showToast({ title: '暂无可选规格', icon: 'none' })
        return
      }
      if (item.speCount > 1) {
        this.openSkuModal(item)
        return
      }
      try {
        await addCart({ goodsSpeId: item.defaultSpeId, goodsNumber: 1 })
        uni.showToast({ title: '已加入购物车', icon: 'success' })
      } catch (e) {}
    },

    async openSkuModal(item) {
      this.skuModal.goods = item
      this.skuModal.buyNum = 1
      this.skuModal.defaultSpeId = item.defaultSpeId
      try {
        const res = await getGoods(item.goodsId)
        if (res.code === 200) {
          const specList = (res.data || {}).specList || []
          const grouped = {}
          specList.forEach(spe => {
            const values = (spe.attrValues || '').split(',').map(v => v.trim()).filter(Boolean)
            const attrName = spe.attrName || '规格'
            if (!grouped[attrName]) grouped[attrName] = []
            values.forEach(v => { if (!grouped[attrName].includes(v)) grouped[attrName].push(v) })
          })
          this.skuModal.specGroups = Object.keys(grouped).map(name => ({
            attrName: name, values: grouped[name], selectedIdx: 0
          }))
          this.skuModal.specList = specList
          this.updateSkuSelection()
          this.skuModal.visible = true
        }
      } catch (e) {
        console.error('获取SKU信息失败', e)
      }
    },

    selectSpec(group, idx) {
      group.selectedIdx = idx
      this.updateSkuSelection()
    },

    updateSkuSelection() {
      const { specGroups, specList } = this.skuModal
      const selectedValues = specGroups.map(g => g.values[g.selectedIdx]).join(',')
      let matched = specList.find(spe => {
        const values = (spe.attrValues || '').split(',').map(v => v.trim()).filter(Boolean).join(',')
        return values === selectedValues
      })
      if (!matched && specList.length > 0) matched = specList[0]
      if (matched) {
        this.skuModal.selectedPrice = matched.shopPrice || 0
        this.skuModal.selectedStock = matched.speNumber || 0
        this.skuModal.defaultSpeId = matched.goodsSpeId
      }
    },

    async confirmAddCart() {
      const speId = this.skuModal.defaultSpeId
      if (!speId) { uni.showToast({ title: '请选择规格', icon: 'none' }); return }
      try {
        await addCart({ goodsSpeId: speId, goodsNumber: this.skuModal.buyNum })
        uni.showToast({ title: '已加入购物车', icon: 'success' })
        this.skuModal.visible = false
      } catch (e) {}
    },

    // ========== 图片 ==========
    async resolveCategoryImages(list) {
      const collectPics = (items) => {
        let pics = []
        for (const item of items) {
          if (item.catPic && !item.catPic.startsWith('http')) pics.push(item.catPic)
          if (item.children) pics = pics.concat(collectPics(item.children))
        }
        return pics
      }
      const picIds = collectPics(list).join(',')
      if (picIds) this.urlCache = await resolveOssUrls(picIds)
    },
    async resolveGoodsImages(list) {
      const pics = list.map(g => [g.outPic, g.headPic]).flat().filter(p => p && !p.startsWith('http'))
      if (pics.length) {
        const cache = await resolveOssUrls(pics.join(','))
        this.urlCache = new Map([...this.urlCache, ...cache])
      }
    },
    getImgUrl(pic) {
      if (!pic) return ''
      if (pic.startsWith('http')) return pic
      return this.urlCache.get(pic) || ''
    }
  }
}
</script>

<style lang="scss" scoped>
.classify-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  padding-bottom: 130rpx;
}

/* 搜索栏 */
.search-bar {
  padding: 16rpx 24rpx;
  background: #fff;
}
.search-input {
  display: flex;
  align-items: center;
  height: 72rpx;
  background: #f5f5f5;
  border-radius: 36rpx;
  padding: 0 28rpx;
  border: 1rpx solid #eee;
}
.search-placeholder {
  margin-left: 12rpx;
  font-size: 28rpx;
  color: #bbb;
}

.classify-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  height: calc(100vh - 104rpx - 130rpx);
}

/* ===== 左侧一级分类 ===== */
.col-left {
  width: 176rpx;
  background: #f5f5f5;
  height: 100%;
}
.left-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 108rpx;
  font-size: 26rpx;
  color: #666;
  position: relative;
  padding: 0 8rpx;
  text-align: center;
}
.left-item.active {
  background: #fff;
  color: #333;
  font-weight: 600;
}
.left-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 6rpx;
  height: 36rpx;
  background: linear-gradient(180deg, #f2b974, #f5a623);
  border-radius: 0 6rpx 6rpx 0;
}

/* ===== 中间二级分类 ===== */
.col-mid {
  width: 140rpx;
  background: #fafafa;
  height: 100%;
}
.mid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 130rpx;
  padding: 8rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}
.mid-item.active {
  background: #fff;
}
.mid-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 12rpx;
  margin-bottom: 8rpx;
  background: #f0f0f0;
}
.mid-item.active .mid-icon {
  border: 2rpx solid #f2b974;
}
.mid-name {
  font-size: 22rpx;
  color: #666;
  max-width: 140rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mid-item.active .mid-name {
  color: #f2b974;
  font-weight: 500;
}

/* ===== 右侧商品列表 ===== */
.col-right {
  flex: 1;
  height: 100%;
  background: #fff;
  padding: 0 16rpx;
}

.right-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0 12rpx;
  border-bottom: 1rpx solid #f5f5f5;
  margin-bottom: 12rpx;
}
.header-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}
.header-count {
  font-size: 22rpx;
  color: #999;
}

/* 商品网格 */
.goods-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.goods-item {
  width: calc(50% - 8rpx);
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  border: 1rpx solid #f5f5f5;
}
.goods-img-wrap {
  width: 100%;
  height: 180rpx;
  background: #fafafa;
}
.goods-img {
  width: 100%;
  height: 100%;
}
.goods-info {
  padding: 10rpx 12rpx 14rpx;
}
.goods-name {
  font-size: 24rpx;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  min-height: 67rpx;
}
.goods-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12rpx;
}
.goods-price {
  font-size: 32rpx;
  color: #e4393c;
  font-weight: bold;
}

.load-more { padding: 20rpx 0; }
.empty-state { padding: 80rpx 0; text-align: center; }
.empty-text { font-size: 26rpx; color: #ccc; }

/* ===== SKU 弹窗 ===== */
.sku-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
}
.sku-modal-content {
  width: 100%;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}
.sku-header {
  display: flex;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
  position: relative;
}
.sku-goods-image {
  width: 180rpx; height: 180rpx;
  border-radius: 16rpx; margin-right: 24rpx;
  border: 1rpx solid #f0f0f0;
}
.sku-goods-info { display: flex; flex-direction: column; justify-content: flex-end; }
.sku-goods-price { font-size: 40rpx; color: #e4393c; font-weight: bold; }
.sku-goods-stock { font-size: 24rpx; color: #999; margin-top: 10rpx; }
.sku-close {
  position: absolute; top: 24rpx; right: 28rpx;
  width: 48rpx; height: 48rpx;
  display: flex; align-items: center; justify-content: center;
  font-size: 36rpx; color: #999;
  background: #f5f5f5; border-radius: 50%;
}
.sku-scroll { flex: 1; padding: 24rpx 32rpx; max-height: 50vh; }
.sku-group { margin-bottom: 28rpx; }
.sku-group-name { font-size: 28rpx; color: #333; font-weight: 600; margin-bottom: 16rpx; display: block; }
.sku-values { display: flex; flex-wrap: wrap; gap: 16rpx; }
.sku-value-item {
  padding: 12rpx 28rpx; border: 1rpx solid #e0e0e0;
  border-radius: 8rpx; font-size: 26rpx; color: #666; background: #fafafa;
}
.sku-value-item.active { border-color: #f2b974; color: #f5a623; background: #fdf6ec; font-weight: 500; }
.quantity-row { display: flex; justify-content: space-between; align-items: center; padding: 20rpx 0; }
.quantity-control { display: flex; align-items: center; }
.qty-btn {
  width: 56rpx; height: 56rpx;
  border: 1rpx solid #e0e0e0; border-radius: 8rpx;
  display: flex; align-items: center; justify-content: center;
  font-size: 32rpx; color: #333; background: #fafafa;
}
.qty-num { width: 80rpx; text-align: center; font-size: 30rpx; font-weight: 500; }
.sku-footer { padding: 20rpx 32rpx; padding-bottom: calc(20rpx + env(safe-area-inset-bottom)); border-top: 1rpx solid #f0f0f0; }
.sku-add-btn {
  width: 100%; height: 88rpx;
  background: linear-gradient(135deg, #f2b974, #f5a623);
  border-radius: 44rpx;
  display: flex; align-items: center; justify-content: center;
  font-size: 32rpx; color: #fff; font-weight: 600;
  box-shadow: 0 4rpx 16rpx rgba(242, 185, 116, 0.4);
}
</style>
