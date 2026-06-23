import request from '@/utils/request'

// 申请售后
export function applyAfterSale(data) {
  return request({
    url: '/mobile/afterSale/apply',
    method: 'post',
    data
  })
}

// 售后列表
export function listAfterSale(params) {
  return request({
    url: '/mobile/afterSale/list',
    method: 'get',
    params
  })
}

// 售后详情
export function getAfterSale(orderAfterId) {
  return request({
    url: '/mobile/afterSale/detail/' + orderAfterId,
    method: 'get'
  })
}

// 取消售后
export function cancelAfterSale(data) {
  return request({
    url: '/mobile/afterSale/cancel',
    method: 'post',
    data
  })
}

// 填写退货物流
export function addRefundCourier(data) {
  return request({
    url: '/mobile/afterSale/addRefundCourier',
    method: 'post',
    data
  })
}

// 获取退货地址
export function getAfterSaleAddress(addressId) {
  return request({
    url: '/mobile/afterSale/address/' + addressId,
    method: 'get'
  })
}
