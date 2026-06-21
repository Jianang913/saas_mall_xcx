import request from '@/utils/request'

// 获取用户信息
export function getUserInfo() {
  return request({
    url: '/user/userCenter/getUserInfo',
    method: 'get'
  })
}

// 浏览记录数量
export function getBrowsingNum() {
  return request({
    url: '/user/userCenter/browsingHistoryNum',
    method: 'get'
  })
}

// 浏览记录列表
export function listBrowsingHistory(params) {
  return request({
    url: '/user/userCenter/track',
    method: 'get',
    params
  })
}

// 添加浏览记录
export function addBrowsingHistory(data) {
  return request({
    url: '/user/userCenter/addBrowsingHistory',
    method: 'post',
    data
  })
}

// 优惠券列表
export function listCoupon(params) {
  return request({
    url: '/user/userCenter/listCoupon',
    method: 'get',
    params
  })
}

// 领取优惠券
export function receiveCoupon(data) {
  return request({
    url: '/user/userCenter/receiveCoupon',
    method: 'post',
    data
  })
}
