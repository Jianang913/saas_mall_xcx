import request from '@/utils/request'

// 购物车列表
export function listCart(params) {
  return request({
    url: '/user/userCart/list',
    method: 'get',
    params
  })
}

// 添加购物车
export function addCart(data) {
  return request({
    url: '/user/userCart/add',
    method: 'post',
    data
  })
}

// 修改购物车数量
export function updateCart(data) {
  return request({
    url: '/user/userCart/update',
    method: 'put',
    data
  })
}

// 删除购物车
export function delCart(data) {
  return request({
    url: '/user/userCart/delete',
    method: 'delete',
    data
  })
}

// 猜你喜欢
export function guessYouLike(params) {
  return request({
    url: '/goods/goods/recommend',
    method: 'get',
    params
  })
}
