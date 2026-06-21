import request from '@/utils/request'

// 购物车列表
export function listCart() {
  return request({
    url: '/mobile/cart/list',
    method: 'get'
  })
}

// 添加购物车
export function addCart(data) {
  return request({
    url: '/mobile/cart/add',
    method: 'post',
    data
  })
}

// 修改购物车数量
export function updateCart(data) {
  return request({
    url: '/mobile/cart/update',
    method: 'put',
    data
  })
}

// 删除购物车
export function delCart(data) {
  return request({
    url: '/mobile/cart/delete',
    method: 'delete',
    data
  })
}
