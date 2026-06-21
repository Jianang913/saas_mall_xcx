import request from '@/utils/request'

// 商品列表
export function listGoods(params) {
  return request({
    url: '/mobile/goods/list',
    method: 'get',
    params
  })
}

// 商品详情
export function getGoods(goodsId) {
  return request({
    url: '/mobile/goods/detail/' + goodsId,
    method: 'get'
  })
}

// 搜索商品
export function searchGoods(params) {
  return request({
    url: '/mobile/goods/list',
    method: 'get',
    params
  })
}

// 获取商品分类（树形）
export function listGoodsCat() {
  return request({
    url: '/mobile/goods/category',
    method: 'get'
  })
}

// 获取商品 SKU 规格
export function listGoodsSpe(params) {
  return request({
    url: '/mobile/goods/spec',
    method: 'get',
    params
  })
}

// 收藏商品
export function collectGoods(data) {
  return request({
    url: '/mobile/goods/collect',
    method: 'post',
    data
  })
}

// 取消收藏
export function cancelCollect(data) {
  return request({
    url: '/mobile/goods/cancelCollect',
    method: 'post',
    data
  })
}

// 收藏列表
export function collectList(params) {
  return request({
    url: '/mobile/goods/collectList',
    method: 'get',
    params
  })
}
