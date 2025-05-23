// src/api/request.js
import axios from 'axios'
import {ElMessage} from "element-plus";

// 创建 axios 实例
const request = axios.create({
    baseURL: '/api',
    timeout: 10000,
})

// 添加请求拦截器
request.interceptors.request.use(
    function (config) {
        return config
    },
    function (error) {
        return Promise.reject(error)
    }
)

// 添加响应拦截器
request.interceptors.response.use(
    function (res) {
        res=res.data
        if (res.code !== 200) {
            ElMessage.error(res.message)
        }
        return res.data // 推荐直接返回 data
    },
    function (error) {
        console.error('[响应错误]', error)
        return Promise.reject(error)
    }
)

export default request
