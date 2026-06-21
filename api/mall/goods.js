import request from '@/utils/request'

// 商品列表
export function listGoods(params) {
  return request({
    url: '/goods/goods/list',
    method: 'get',
    params
  })
}

// 商品详情
export function getGoods(goodsId) {
  return request({
    url: '/goods/goods/' + goodsId,
    method: 'get'
  })
}

// 搜索商品
export function searchGoods(params) {
  return request({
    url: '/goods/goods/list',
    method: 'get',
    params
  })
}

// 获取商品分类列表
export function listGoodsCat(params) {
  return request({
    url: '/goods/goodsCat/list',
    method: 'get',
    params
  })
}

// 获取商品分类树
export function getGoodsCatTree() {
  return request({
    url: '/goods/goodsCat/treeselect',
    method: 'get'
  })
}

// 获取商品 SKU 规格
export function listGoodsSpe(params) {
  return request({
    url: '/goods/goodsSpe/list',
    method: 'get',
    params
  })
}

// 获取品牌列表
export function listBrand(params) {
  return request({
    url: '/goods/goodsBrand/list',
    method: 'get',
    params
  })
}

// 收藏商品
export function collectGoods(data) {
  return request({
    url: '/goods/goods/collect',
    method: 'post',
    data
  })
}

// 取消收藏
export function cancelCollect(data) {
  return request({
    url: '/goods/goods/cancelCollect',
    method: 'post',
    data
  })
}

// 收藏列表
export function collectList(params) {
  return request({
    url: '/goods/goods/collectList',
    method: 'get',
    params
  })
}
