import request from '@/utils/request'

// 获取装修页面数据
export function getAdornPageData(params) {
  return request({
    url: '/mobile/goods/adornPageData',
    method: 'get',
    params
  })
}

// 获取导航配置（Tab 栏）
export function getNavigation(params) {
  return request({
    url: '/mobile/goods/navigation',
    method: 'get',
    params
  })
}

// 获取店铺信息
export function getStoreInfo() {
  return request({
    url: '/mobile/goods/storeInfo',
    method: 'get'
  })
}

// 根据字典类型获取字典数据
export function getDictData(dictType) {
  return request({
    url: '/mobile/goods/dict/' + dictType,
    method: 'get'
  })
}
