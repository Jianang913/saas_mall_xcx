import request from '@/utils/request'

// 专题页详情（移动端接口，不需要登录）
export function getSpecialPage(id) {
  return request({
    url: '/mobile/goods/specialPage/' + id,
    method: 'get'
  })
}

// 专题页分类商品（移动端接口，不需要登录）
export function getSpecialClassifyGoods(classifyId) {
  return request({
    url: '/mobile/goods/specialClassifyGoods',
    method: 'get',
    params: { classifyId }
  })
}
