// src/api/request.js
import axios from 'axios'

// 创建 axios 实例
const request = axios.create({
    baseURL: '/api',
    timeout: 10000,
})

// 添加请求拦截器
request.interceptors.request.use(
    function (config) {
        console.log('[请求拦截] 即将发送请求', config)
        return config
    },
    function (error) {
        console.error('[请求错误]', error)
        return Promise.reject(error)
    }
)

// 添加响应拦截器
request.interceptors.response.use(
    function (response) {
        console.log('[响应拦截] 收到响应', response)
        return response.data // 推荐直接返回 data
    },
    function (error) {
        console.error('[响应错误]', error)
        return Promise.reject(error)
    }
)

export default request
