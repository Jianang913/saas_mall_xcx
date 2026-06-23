import { useUserStore } from '@/store/modules/user'
import config from '@/config'
import { getToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import { toast, showConfirm, tansParams } from '@/utils/common'

let timeout = 10000
const baseUrl = config.baseUrl

const upload = config => {
  // 是否需要设置 token
  const noToken = (config.headers || {}).isToken === false
  config.header = config.header || {}
  if (getToken() && !noToken) {
    config.header['Authorization'] = 'Bearer ' + getToken()
  }
  // get请求映射params参数
  if (config.params) {
    let url = config.url + '?' + tansParams(config.params)
    url = url.slice(0, -1)
    config.url = url
  }
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      timeout: config.timeout || timeout,
      url: baseUrl + config.url,
      filePath: config.filePath,
      name: config.name || 'file',
      header: config.header,
      formData: config.formData,
      success: (res) => {
        let result
        try {
          result = JSON.parse(res.data)
        } catch (e) {
          toast('服务器返回数据格式错误')
          reject('JSON解析失败')
          return
        }

        const code = result.code !== undefined && result.code !== null ? result.code : 200
        const msg = errorCode[code] || result.msg || errorCode['default']

        if (code === 200) {
          resolve(result)
          return
        } else if (code === 401) {
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
        } else {
          toast(msg)
          reject(code)
          return
        }
      },
      fail: (error) => {
        let message = ''
        if (error && error.errMsg) {
          if (error.errMsg.includes('timeout')) {
            message = '系统接口请求超时'
          } else if (error.errMsg.includes('fail')) {
            message = '后端接口连接异常'
          } else {
            message = error.errMsg
          }
        } else {
          message = '系统未知错误'
        }
        toast(message)
        reject(error)
      }
    })
  })
}

export default upload
