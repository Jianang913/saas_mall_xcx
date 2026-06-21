import request from '@/utils/request'

// 申请售后
export function applyAfterSale(data) {
  return request({
    url: '/order/userOrderAfter/apply',
    method: 'post',
    data
  })
}

// 售后列表
export function listAfterSale(params) {
  return request({
    url: '/order/userOrderAfter/list',
    method: 'get',
    params
  })
}

// 售后详情
export function getAfterSale(orderAfterId) {
  return request({
    url: '/order/userOrderAfter/' + orderAfterId,
    method: 'get'
  })
}

// 取消售后
export function cancelAfterSale(data) {
  return request({
    url: '/order/userOrderAfter/cancel',
    method: 'post',
    data
  })
}

// 填写退货物流
export function addRefundCourier(data) {
  return request({
    url: '/order/userOrderAfter/addRefundCourier',
    method: 'post',
    data
  })
}

// 获取售后地址
export function getAfterSaleAddress(addressId) {
  return request({
    url: '/user/userAddress/getAfterSaleAddress',
    method: 'get',
    params: { addressId }
  })
}
