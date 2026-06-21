import request from '@/utils/request'

// 地址列表
export function listAddress() {
  return request({
    url: '/mobile/address/list',
    method: 'get'
  })
}

// 新增地址
export function addAddress(data) {
  return request({
    url: '/mobile/address/add',
    method: 'post',
    data
  })
}

// 修改地址
export function updateAddress(data) {
  return request({
    url: '/mobile/address/update',
    method: 'put',
    data
  })
}

// 删除地址
export function delAddress(addressId) {
  return request({
    url: '/mobile/address/' + addressId,
    method: 'delete'
  })
}

// 获取省市区数据
export function getRegion() {
  return request({
    url: '/mobile/address/region',
    method: 'get'
  })
}
