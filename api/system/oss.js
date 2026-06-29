import request from '@/utils/request'

// 查询OSS对象基于id串
export function listByIds(ossIds) {
  return request({
    url: '/resource/oss/listByIds/' + ossIds,
    method: 'get'
  })
}
