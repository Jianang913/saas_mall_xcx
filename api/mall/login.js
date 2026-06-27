import request from '@/utils/request'

// 微信手机号快捷登录
export function wxPhoneLogin(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data: {
      clientId: data.appId,
      grantType: 'xcxServiceProvider',
      appId: data.appId,
      code: data.code,
      phoneCode: data.phoneCode,  // 新版本
      nickname: data.nickname,
      portrait: data.portrait
    },
    headers: { isToken: false }
  })
}

// 静默登录（访客模式）
export function silentLogin(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data: {
      clientId: data.appId,
      grantType: 'xcxServiceProvider',
      appId: data.appId,
      code: data.code
    },
    headers: { isToken: false }
  })
}

// 退出登录
export function logout() {
  return request({
    url: '/mobile/login/logout',
    method: 'post'
  })
}
