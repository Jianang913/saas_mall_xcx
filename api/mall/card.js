import request from '@/utils/request'

// 根据用户ID获取名片
export function getCardByUserId(params) {
  return request({
    url: '/mobile/businessCard/getByUserId',
    method: 'get',
    params
  })
}

// 获取名片详情（含扩展信息和图片列表）
export function getCardDetail(cardId) {
  return request({
    url: '/mobile/businessCard/getDetail/' + cardId,
    method: 'get'
  })
}

// 名片点赞
export function addThumbsUp(cardId) {
  return request({
    url: '/mobile/businessCard/addThumbsUp/' + cardId,
    method: 'put'
  })
}

// 名片转发
export function addForward(cardId) {
  return request({
    url: '/mobile/businessCard/addForward/' + cardId,
    method: 'put'
  })
}

// 记录阅读名片行为
export function readAction(data) {
  return request({
    url: '/mobile/businessCard/readAction',
    method: 'post',
    params: data
  })
}
