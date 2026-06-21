import request from '@/utils/request'

// 获取装修页面数据
export function getAdornPageData(params) {
  return request({
    url: '/goods/adornPage/getAdornPageDataVo',
    method: 'get',
    params
  })
}

// 获取轮播图列表
export function listBanner(params) {
  return request({
    url: '/goods/banner/list',
    method: 'get',
    params
  })
}

// 获取金刚位列表
export function listDiamond(params) {
  return request({
    url: '/goods/diamond/list',
    method: 'get',
    params
  })
}

// 获取导航列表
export function listNavigation(params) {
  return request({
    url: '/goods/navigation/list',
    method: 'get',
    params
  })
}

// 获取店铺信息
export function getStoreInfo() {
  return request({
    url: '/goods/adornContactus/getStoreInfo',
    method: 'get'
  })
}
