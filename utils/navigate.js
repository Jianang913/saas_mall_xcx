/**
 * 导航工具
 * 统一封装，方便后续全局处理
 */

export function navigateTo(url) {
  uni.navigateTo({ url })
}

export function switchTab(url) {
  uni.switchTab({ url })
}

export function redirectTo(url) {
  uni.redirectTo({ url })
}

export function reLaunch(url) {
  uni.reLaunch({ url })
}

export default { navigateTo, switchTab, redirectTo, reLaunch }
