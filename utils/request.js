import { useUserStore } from '@/store/modules/user'
import config from '@/config'
import { getToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import { toast, showConfirm, tansParams } from '@/utils/common'
import { encryptRequest, needEncrypt } from '@/utils/crypto'

let timeout = 15000
const baseUrl = config.baseUrl

const request = config => {
  // 是否需要设置 token（headers.isToken === false 表示不需要）
  const noToken = (config.headers || {}).isToken === false
  config.header = config.header || {}

  // 商城自定义 Headers
  const app = getApp()
  const globalData = app ? app.globalData : {}

  if (getToken() && !noToken) {
    config.header['Authorization'] = 'Bearer ' + getToken()
  }

  // 附加商城业务 Headers
  config.header['openId'] = uni.getStorageSync('xcxOpenId') || ''
  config.header['appId'] = globalData.appId || uni.getStorageSync('appId') || ''
  config.header['clientid'] = globalData.appId || uni.getStorageSync('appId') || ''  // 用于 Sa-Token 校验（小写）
  config.header['sUserId'] = uni.getStorageSync('userId') || ''
  config.header['shareOpenId'] = uni.getStorageSync('shareOpenId') || ''
  config.header['iType'] = uni.getStorageSync('iType') || ''

  // 请求加密处理
  if (needEncrypt(config.url) && (config.method === 'post' || config.method === 'put')) {
    const { encryptedData, encryptKey } = encryptRequest(config.data)
    config.data = encryptedData
    config.header['encrypt-key'] = encryptKey
  }

  // get请求映射params参数
  if (config.params) {
    let url = config.url + '?' + tansParams(config.params)
    url = url.slice(0, -1)
    config.url = url
  }

  // 构建完整 URL
  const url = config.baseUrl || baseUrl + config.url

  return new Promise((resolve, reject) => {
    uni.request({
      method: config.method || 'get',
      timeout: config.timeout || timeout,
      url: url,
      data: config.data,
      header: config.header,
      dataType: 'json'
    }).then(response => {
      // Vue 3: response 直接是 res 对象；Vue 2: [error, res] 数组
      let res = Array.isArray(response) ? response[1] : response
      if (!res) {
        toast('后端接口连接异常')
        reject('后端接口连接异常')
        return
      }

      const code = res.data.code !== undefined && res.data.code !== null ? res.data.code : 200
      const msg = errorCode[code] || res.data.msg || errorCode['default']

      if (code === 401) {
        // 未登录时的 401 静默处理（静默登录期间不弹框）
        if (!getToken()) {
          reject('未登录')
          return
        }
        // 已登录但 token 过期，弹提示
        showConfirm('登录状态已过期，您可以继续留在该页面，或者重新登录?').then(res => {
          if (res.confirm) {
            const userStore = useUserStore()
            userStore.logOut().then(() => {
              uni.reLaunch({ url: '/pages/login' })
            })
          }
        })
        reject('无效的会话，或者会话已过期，请重新登录。')
        return
      } else if (code === 500) {
        toast(msg)
        reject('500')
        return
      } else if (code !== 200) {
        toast(msg)
        reject(code)
        return
      }

      // 兼容旧项目：检查 header 中的 newToken
      if (res.header && res.header.newToken) {
        uni.setStorageSync('sessionId', res.header.newToken)
      }

      resolve(res.data)
    }).catch(error => {
      let message = ''
      if (error && error.errMsg) {
        // uni.request 返回的错误格式
        if (error.errMsg.includes('timeout')) {
          message = '系统接口请求超时'
        } else if (error.errMsg.includes('fail')) {
          message = '后端接口连接异常'
        } else {
          message = error.errMsg
        }
      } else if (error && error.message) {
        message = error.message
      } else {
        message = '系统未知错误'
      }
      toast(message)
      reject(error)
    })
  })
}

export default request
