import request from '@/utils/request'

// 专题页详情
export function getSpecialPage(id) {
  return request({
    url: '/goods/specialPage/' + id,
    method: 'get'
  })
}

// 专题页分类商品
export function getSpecialClassifyGoods(params) {
  return request({
    url: '/goods/specialGoodsClassify/getGoods',
    method: 'get',
    params
  })
}
