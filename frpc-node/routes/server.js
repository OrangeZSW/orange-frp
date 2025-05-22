import express from "express";
import path from 'path'
import { randomUUID } from 'crypto'
import { promises as fs } from 'fs'
import { spawn } from 'child_process'

//拦截器
const interceptor = (req, res, next) => {
    console.log('请求方法:', req.method)
    console.log('请求路径:', req.url)
    console.log('请求参数:', req.method === 'GET' ? req.query : req.body)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
    res.setHeader('Access-Control-Allow-Credentials', true)
    next()
}

const app = express();
app.use(express.json()); // 使用内置 json 解析
app.use(interceptor)

const CONFIG_PATH = path.resolve(process.cwd(), 'configs.json')


// 进程和日志缓存
const frpcProcesses = new Map() // key: remotePort, value: child process
const frpcLogs = new Map()      // key: remotePort, value: string（日志内容缓存）

// 读取配置文件
async function readConfigs() {
    try {
        const data = await fs.readFile(CONFIG_PATH, 'utf-8')
        return JSON.parse(data)
    } catch {
        return []
    }
}

// 写入配置文件
async function writeConfigs(configs) {
    await fs.writeFile(CONFIG_PATH, JSON.stringify(configs, null, 2))
}

// 启动 frpc
app.post('/api/start', (req, res) => {
    const { remotePort, serverAddr, serverPort, token, localIp, localPort, type } = req.body

    if (!remotePort) return res.status(400).json({ error: '缺少 remotePort 参数' })
    if (frpcProcesses.has(remotePort)) return res.status(400).json({ error: '该配置已启动' })

    // TODO: 这里你要根据参数动态生成配置文件或者配置内容，暂用示例 config 文件路径
    // 例如写一个临时 ini 配置文件：
    const configContent = `
[common]
server_addr = ${serverAddr}
server_port = ${serverPort}
token = ${token}

[${remotePort}]
type = ${type}
local_ip = ${localIp}
local_port = ${localPort}
remote_port = ${remotePort}
  `.trim()

    // 临时配置文件路径，建议用 remotePort 命名，防止冲突
    const tmpConfigPath = path.resolve(`./frpc_${remotePort}.ini`)

    fs.writeFile(tmpConfigPath, configContent, 'utf-8')
        .then(() => {
            // 启动 frpc 子进程
            const frpcPath = path.resolve(process.cwd(), 'frpc-mac', 'frpc')

            const child = spawn(frpcPath, ['-c', tmpConfigPath])

            frpcProcesses.set(remotePort, child)
            frpcLogs.set(remotePort, '') // 初始化日志缓存

            child.stdout.on('data', (data) => {
                const msg = data.toString()
                console.log(`[frpc ${remotePort}]: ${msg}`)
                frpcLogs.set(remotePort, (frpcLogs.get(remotePort) || '') + msg)
            })

            child.stderr.on('data', (data) => {
                const msg = data.toString()
                console.error(`[frpc ${remotePort} ERROR]: ${msg}`)
                frpcLogs.set(remotePort, (frpcLogs.get(remotePort) || '') + msg)
            })

            child.on('close', (code) => {
                console.log(`[frpc ${remotePort}] exited with code ${code}`)
                frpcProcesses.delete(remotePort)
                frpcLogs.delete(remotePort)
                // 删除临时配置文件
                fs.unlink(tmpConfigPath).catch(() => {})
            })

            res.json({ message: '启动成功' })
        })
        .catch(err => {
            console.error('写配置文件失败:', err)
            res.status(500).json({ error: '启动失败：写配置文件失败' })
        })
})

// 停止 frpc
app.post('/api/stop', (req, res) => {
    const { remotePort } = req.body
    if (!remotePort) return res.status(400).json({ error: '缺少 remotePort 参数' })

    const proc = frpcProcesses.get(remotePort)
    if (!proc) return res.status(400).json({ error: '该配置未运行' })

    proc.kill()
    frpcProcesses.delete(remotePort)
    frpcLogs.delete(remotePort)
    res.json({ message: '已停止' })
})

// 查询运行状态
app.get('/api/status', (req, res) => {
    const remotePort = req.query.remotePort
    if (remotePort) {
        res.json({ running: frpcProcesses.has(remotePort) })
    } else {
        res.json({ runningPorts: Array.from(frpcProcesses.keys()) })
    }
})

// 获取日志
app.get('/api/logs', (req, res) => {
    const remotePort = req.query.remotePort
    if (!remotePort) return res.status(400).json({ error: '缺少 remotePort 参数' })

    const log = frpcLogs.get(remotePort)
    if (!log) return res.status(404).json({ error: '未找到日志' })

    res.json({ logs: log })
})

// 查询所有配置
app.get('/api/configs', async (req, res) => {
    try {
        const configs = await readConfigs()
        res.json(configs)
    } catch (e) {
        res.status(500).json({ error: '读取配置失败' })
    }
})

// 新增配置
app.post('/api/configs', async (req, res) => {
    console.log("configs add {}", req.body)
    try {
        const configs = await readConfigs()
        const newConfig = { id: randomUUID(), ...req.body }
        configs.push(newConfig)
        await writeConfigs(configs)
        res.status(201).json(newConfig)
    } catch (e) {
        res.status(500).json({ error: '新增配置失败' })
    }
})

// 更新配置
app.put('/api/configs/:id', async (req, res) => {
    try {
        const configs = await readConfigs()
        const idx = configs.findIndex(c => c.id === req.params.id)
        if (idx === -1) return res.status(404).json({ error: '配置未找到' })

        configs[idx] = { ...configs[idx], ...req.body }
        await writeConfigs(configs)
        res.json(configs[idx])
    } catch (e) {
        res.status(500).json({ error: '更新配置失败' })
    }
})

// 删除配置
app.delete('/api/configs/:id', async (req, res) => {
    try {
        let configs = await readConfigs()
        const idx = configs.findIndex(c => c.id === req.params.id)
        if (idx === -1) return res.status(404).json({ error: '配置未找到' })

        const deleted = configs.splice(idx, 1)
        await writeConfigs(configs)
        res.json(deleted[0])
    } catch (e) {
        res.status(500).json({ error: '删除配置失败' })
    }
})



export default app;