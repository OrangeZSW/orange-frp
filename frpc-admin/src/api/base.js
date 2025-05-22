    import axios from '../util/axios/axios.js'


    // 启动 frpc
    export function startFrpc(form) {
        // form 应包含服务器地址、端口、token、本地IP端口、远程端口、类型等字段
        return axios.post('/start', form)
    }

    // 停止 frpc，参数是 remotePort
    export function stopFrpc(remotePort) {
        return axios.post('/stop', { remotePort })
    }

    // 查询状态，传入 remotePort，可选。不传则返回所有运行的端口
    export function getStatus(remotePort) {
        const params = {}
        if (remotePort) params.remotePort = remotePort
        return axios.get('/status', { params })
    }

    // 获取日志，需要 remotePort
    export function getLogs(remotePort) {
        return axios.get('/logs', { params: { remotePort } })
    }


    // 获取所有配置
    export function getConfigs() {
        return axios.get('/configs')
    }

    // 新增配置
    export function addConfig(config) {
        return axios.post('/configs', config)
    }

    // 更新配置
    export function updateConfig(id, config) {
        return axios.put(`/configs/${id}`, config)
    }

    // 删除配置
    export function deleteConfig(id) {
        return axios.delete(`/configs/${id}`)
    }
