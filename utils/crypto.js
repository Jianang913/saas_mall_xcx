/**
 * 小程序加密工具
 * 用于请求体加密，与后端 api-decrypt 配置对应
 */

import CryptoJS from 'crypto-js'
import JSEncrypt from 'jsencrypt'

// 后端 RSA 公钥（用于加密 AES 密钥）
const RSA_PUBLIC_KEY = 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKoR8mX0rGKLqzcWmOzbfj64K8ZIgOdHnzkXSOVOZbFu/TJhZ7rFAN+eaGkl3C4buccQd/EjEsj9ir7ijT7h96MCAwEAAQ=='

/**
 * 生成随机字符串
 * @param {number} length 长度
 * @returns {string}
 */
function generateRandomString(length = 32) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

/**
 * 生成 AES 密钥
 * @returns {CryptoJS.lib.WordArray}
 */
function generateAesKey() {
  return CryptoJS.enc.Utf8.parse(generateRandomString(32))
}

/**
 * Base64 编码
 * @param {CryptoJS.lib.WordArray} wordArray
 * @returns {string}
 */
function encryptBase64(wordArray) {
  return CryptoJS.enc.Base64.stringify(wordArray)
}

/**
 * AES 加密
 * @param {string} data 要加密的数据
 * @param {CryptoJS.lib.WordArray} aesKey AES 密钥
 * @returns {string}
 */
function encryptWithAes(data, aesKey) {
  const encrypted = CryptoJS.AES.encrypt(data, aesKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })
  return encrypted.toString()
}

/**
 * RSA 加密（使用后端公钥加密 AES 密钥）
 * @param {string} data 要加密的数据
 * @returns {string}
 */
function encryptWithRsa(data) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(RSA_PUBLIC_KEY)
  return encryptor.encrypt(data)
}

/**
 * 加密请求体
 * @param {object|string} data 请求体数据
 * @returns {object} { encryptedData, encryptKey }
 */
export function encryptRequest(data) {
  // 生成 AES 密钥
  const aesKey = generateAesKey()

  // 将数据转为字符串
  const dataStr = typeof data === 'object' ? JSON.stringify(data) : data

  // 使用 AES 加密请求体
  const encryptedData = encryptWithAes(dataStr, aesKey)

  // 使用 RSA 公钥加密 AES 密钥
  const encryptKey = encryptWithRsa(encryptBase64(aesKey))

  return {
    encryptedData,
    encryptKey
  }
}

/**
 * 检查是否需要加密
 * @param {string} url 请求 URL
 * @returns {boolean}
 */
export function needEncrypt(url) {
  // 登录接口需要加密
  return url.includes('/auth/login') || url.includes('/auth/xcxLogin')
}
