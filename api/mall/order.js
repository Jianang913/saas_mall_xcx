import request from '@/utils/request'

// 准备订单
export function readyOrder(data) {
  return request({
    url: '/mobile/order/readyOrder',
    method: 'post',
    data
  })
}

// 提交订单
export function generateOrder(data) {
  return request({
    url: '/mobile/order/submit',
    method: 'post',
    data
  })
}

// 订单列表
export function listOrder(params) {
  return request({
    url: '/mobile/order/list',
    method: 'get',
    params
  })
}

// 订单详情
export function getOrder(orderId) {
  return request({
    url: '/mobile/order/detail/' + orderId,
    method: 'get'
  })
}

// 取消订单
export function cancelOrder(data) {
  return request({
    url: '/mobile/order/cancel',
    method: 'post',
    data
  })
}

// 确认收货
export function confirmReceive(data) {
  return request({
    url: '/mobile/order/confirmReceive',
    method: 'post',
    data
  })
}

// 删除订单
export function delOrder(orderId) {
  return request({
    url: '/mobile/order/' + orderId,
    method: 'delete'
  })
}

// 微信支付
export function wxPay(data) {
  return request({
    url: '/mobile/order/pay',
    method: 'post',
    data
  })
}

// 获取订单数量统计
export function getOrderNum() {
  return request({
    url: '/mobile/order/count',
    method: 'get'
  })
}

// 获取物流信息
export function getDeliveryMsg(orderId) {
  return request({
    url: '/mobile/order/delivery/' + orderId,
    method: 'get'
  })
}
