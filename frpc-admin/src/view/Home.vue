<template>
  <div class="p-6 max-w-5xl mx-auto">
    <h1 class="text-3xl font-bold mb-6 text-center text-blue-700">frpc 管理面板</h1>

    <!-- 添加配置区域 -->
    <div class="bg-white rounded-xl shadow-md p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">添加配置</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <input v-model="form.serverAddr" class="input" placeholder="frps IP 地址" />
        <input v-model="form.serverPort" class="input" placeholder="frps 端口" />
        <input v-model="form.token" class="input" placeholder="Token" />
        <input v-model="form.localIp" class="input" placeholder="本地服务 IP" />
        <input v-model="form.localPort" class="input" placeholder="本地端口" />
        <input v-model="form.remotePort" class="input" placeholder="远程端口" />
        <select v-model="form.type" class="input">
          <option value="tcp">TCP</option>
          <option value="http">HTTP</option>
          <option value="udp">UDP</option>
        </select>
      </div>
      <button @click="handleAddConfig" class="btn-primary mt-4">添加配置</button>
    </div>

    <!-- 操作按钮 -->
    <div class="flex justify-end mb-4">
      <button @click="refreshStatus" class="btn-gray">刷新状态</button>
    </div>

    <!-- 配置卡片列表 -->
    <div class="grid gap-6">
      <div
          v-for="(item, index) in frpcList"
          :key="item.id"
          class="bg-white rounded-xl shadow-md p-5 relative"
      >
        <h3 class="text-lg font-bold mb-2 text-gray-800">配置 {{ index + 1 }}</h3>

        <div class="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-gray-700">
          <div><strong>frps 地址:</strong> {{ item.serverAddr }}</div>
          <div><strong>frps 端口:</strong> {{ item.serverPort }}</div>
          <div><strong>Token:</strong> {{ item.token }}</div>
          <div><strong>本地 IP:</strong> {{ item.localIp }}</div>
          <div><strong>本地端口:</strong> {{ item.localPort }}</div>
          <div><strong>远程端口:</strong> {{ item.remotePort }}</div>
          <div><strong>类型:</strong> {{ item.type.toUpperCase() }}</div>
        </div>

        <div class="mt-4 flex flex-wrap gap-3">
          <button @click="handleStartFrpc(item)" class="btn-green">启动</button>
          <button @click="handleStopFrpc(item)" class="btn-red">停止</button>
          <button @click="handleFetchLogs(item)" class="btn-gray">查看日志</button>
          <button @click="handleDeleteConfig(item.id, index)" class="btn-outline">删除</button>
        </div>

        <div class="mt-4">
          <strong>运行状态：</strong> {{ item.status }}
        </div>

        <div v-if="item.logs" class="mt-2">
          <strong>日志输出：</strong>
          <pre class="bg-gray-100 p-2 h-48 overflow-auto text-sm">{{ item.logs }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
  startFrpc,
  stopFrpc,
  getStatus,
  getLogs,
  getConfigs,
  addConfig,
  deleteConfig
} from '../api/base.js'

const form = reactive({
  serverAddr: '',
  serverPort: '',
  token: '',
  localIp: '',
  localPort: '',
  remotePort: '',
  type: 'tcp'
})

const frpcList = ref([])

const loadConfigs = async () => {
  try {
    const res = await getConfigs()
    frpcList.value = res.map(config => ({
      ...config,
      status: '未知',
      logs: ''
    }))
  } catch (e) {
    alert('加载配置失败')
  }
}

onMounted(() => {
  loadConfigs()
})

const handleAddConfig = async () => {
  if (!form.serverAddr || !form.localIp || !form.remotePort) {
    alert('请填写完整配置')
    return
  }
  try {
    const config = await addConfig({ ...form })
    frpcList.value.push({ ...config, status: '未运行', logs: '' })
  } catch (e) {
    alert('添加失败')
  }
}

const handleStartFrpc = async (config) => {
  try {
    await startFrpc(config)
    config.status = '运行中'
  } catch {
    config.status = '启动失败'
  }
}

const handleStopFrpc = async (config) => {
  try {
    await stopFrpc(config.remotePort)
    config.status = '已停止'
  } catch {
    config.status = '停止失败'
  }
}

const handleFetchLogs = async (config) => {
  try {
    const res = await getLogs(config.remotePort)
    config.logs = res.logs || ''
  } catch {
    config.logs = '日志获取失败'
  }
}

const handleDeleteConfig = async (id, index) => {
  try {
    await deleteConfig(id)
    frpcList.value.splice(index, 1)
  } catch {
    alert('删除失败')
  }
}

const refreshStatus = async () => {
  for (const item of frpcList.value) {
    try {
      const res = await getStatus(item.remotePort)
      item.status = res.running ? '运行中' : '未运行'
    } catch {
      item.status = '未知'
    }
  }
}
</script>

<style scoped>
.input {
  @apply w-full border border-gray-300 p-2 rounded;
}
.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700;
}
.btn-green {
  @apply bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600;
}
.btn-red {
  @apply bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600;
}
.btn-gray {
  @apply bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600;
}
.btn-outline {
  @apply border border-gray-400 text-gray-700 px-3 py-1 rounded hover:bg-gray-100;
}
</style>
