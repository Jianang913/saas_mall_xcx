import { defineStore } from 'pinia'
import config from '@/config'
import storage from '@/utils/storage'
import constant from '@/utils/constant'
import { isHttp, isEmpty } from '@/utils/validate'
import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import defAva from '@/static/images/profile.jpg'

const baseUrl = config.baseUrl

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    id: storage.get(constant.id),
    name: storage.get(constant.name),
    avatar: storage.get(constant.avatar),
    roles: storage.get(constant.roles),
    permissions: storage.get(constant.permissions)
  }),

  actions: {
    // 登录
    async login(userInfo) {
      const username = userInfo.username.trim()
      const password = userInfo.password
      const code = userInfo.code
      const uuid = userInfo.uuid
      const res = await login(username, password, code, uuid)
      setToken(res.token)
      this.token = res.token
    },

    // 获取用户信息
    async getInfo() {
      const res = await getInfo()
      const user = res.user
      let avatar = user.avatar || ''
      if (!isHttp(avatar)) {
        avatar = isEmpty(avatar) ? defAva : baseUrl + avatar
      }
      const userid = isEmpty(user) || isEmpty(user.userId) ? '' : user.userId
      const username = isEmpty(user) || isEmpty(user.userName) ? '' : user.userName
      if (res.roles && res.roles.length > 0) {
        this.roles = res.roles
        this.permissions = res.permissions
        storage.set(constant.roles, res.roles)
        storage.set(constant.permissions, res.permissions)
      } else {
        this.roles = ['ROLE_DEFAULT']
        storage.set(constant.roles, ['ROLE_DEFAULT'])
      }
      this.id = userid
      this.name = username
      this.avatar = avatar
      storage.set(constant.id, userid)
      storage.set(constant.name, username)
      storage.set(constant.avatar, avatar)
      return res
    },

    // 设置头像
    setAvatar(avatar) {
      this.avatar = avatar
      storage.set(constant.avatar, avatar)
    },

    // 退出系统
    async logOut() {
      await logout(this.token)
      this.token = ''
      this.roles = []
      this.permissions = []
      removeToken()
      storage.clean()
    }
  }
})
