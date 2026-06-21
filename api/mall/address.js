import request from '@/utils/request'

// 地址列表
export function listAddress(params) {
  return request({
    url: '/user/userAddress/list',
    method: 'get',
    params
  })
}

// 新增地址
export function addAddress(data) {
  return request({
    url: '/user/userAddress',
    method: 'post',
    data
  })
}

// 修改地址
export function updateAddress(data) {
  return request({
    url: '/user/userAddress',
    method: 'put',
    data
  })
}

// 删除地址
export function delAddress(addressId) {
  return request({
    url: '/user/userAddress/' + addressId,
    method: 'delete'
  })
}

// 获取省市区数据
export function getRegion() {
  return request({
    url: '/user/region/config',
    method: 'get'
  })
}
