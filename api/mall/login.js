import request from '@/utils/request'

// 微信手机号快捷登录
export function wxPhoneLogin(data) {
  return request({
    url: '/mobile/login/wxPhoneLogin',
    method: 'post',
    data,
    headers: { isToken: false }
  })
}

// 静默登录（访客模式）
export function silentLogin(data) {
  return request({
    url: '/mobile/login/silentLogin',
    method: 'post',
    data,
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
