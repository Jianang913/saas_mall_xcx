import { listByIds } from '@/api/system/oss'

// 缓存已解析的URL，避免重复请求
const urlCache = new Map()

/**
 * 批量解析ossId为URL
 * @param {string} ossIds - 逗号分隔的ossId字符串
 * @returns {Promise<Map>} ossId → url 的映射
 */
export async function resolveOssUrls(ossIds) {
  if (!ossIds) return new Map()

  const ids = ossIds.split(',').filter(Boolean)
  if (!ids.length) return new Map()

  // 过滤出未缓存的id
  const uncachedIds = ids.filter(id => !urlCache.has(id))

  // 只请求未缓存的
  if (uncachedIds.length) {
    const res = await listByIds(uncachedIds.join(','))
    if (res.data) {
      res.data.forEach(item => {
        urlCache.set(item.ossId.toString(), item.url)
      })
    }
  }

  // 返回所有请求的id对应的url
  return new Map(ids.map(id => [id, urlCache.get(id) || '']))
}

/**
 * 解析单个ossId为URL（支持直接URL或ossId）
 * @param {string} pic - ossId或URL
 * @returns {Promise<string>} 图片URL
 */
export async function resolveImageUrl(pic) {
  if (!pic) return ''
  if (pic.startsWith('http')) return pic

  // 先查缓存
  if (urlCache.has(pic)) return urlCache.get(pic)

  const map = await resolveOssUrls(pic)
  return map.get(pic) || ''
}

/**
 * 解析多个ossId为URL数组
 * @param {string} ossIds - 逗号分隔的ossId字符串
 * @returns {Promise<string[]>} URL数组
 */
export async function resolveImageUrls(ossIds) {
  if (!ossIds) return []

  const map = await resolveOssUrls(ossIds)
  return ossIds.split(',').filter(Boolean).map(id => map.get(id) || '')
}

/**
 * 清除缓存（可选，一般不需要）
 */
export function clearOssCache() {
  urlCache.clear()
}
