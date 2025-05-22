<template>
  <div class="p-6 " style="width: 90vw ;display: flex; flex-wrap: wrap" >
    <h1 style="width: 100vw;height: 5vh"  class="text-3xl font-bold mb-6 text-center text-blue-700">frpc 管理面板</h1>

    <!-- 添加配置区域 -->
    <el-card style="width: 40%" class="bg-white rounded-xl shadow-md p-6 mb-6">
      <el-form label-width="auto">
        <el-form-item label="frps IP 地址">
          <el-input v-model="form.serverAddr" placeholder="请输入 frps IP 地址" />
        </el-form-item>
        <el-form-item label="frps 端口">
          <el-input v-model="form.serverPort" placeholder="请输入 frps 端口" />
        </el-form-item>
        <el-form-item label="frps 令牌">
          <el-input v-model="form.token" placeholder="请输入 frps 令牌" />
        </el-form-item>
        <el-form-item label="本地服务 IP">
          <el-input v-model="form.localIp" placeholder="请输入本地服务 IP" />
        </el-form-item>
        <el-form-item label="本地端口">
          <el-input v-model=" form.localPort" placeholder="请输入本地端口" />
        </el-form-item>
        <el-form-item label="远程端口">
          <el-input v-model="form.remotePort" placeholder="请输入远程端口" />
        </el-form-item>
        <el-form-item label="协议类型">
          <el-select v-model="form.type" placeholder="请选择协议类型">
            <el-option label="tcp" value="tcp" />
            <el-option label="http" value="http" />
            <el-option label="https" value="https" />
            <el-option label="stcp" value="stcp" />
            <el-option label="xtcp" value="xtcp" />
          </el-select>
       </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleAddConfig">添加配置</el-button>
        </el-form-item>
        <el-form-item>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 配置卡片列表 -->
    <el-card style="width: 59%">
      <el-table width="400" table-layout="auto"  style="margin-top: 20px" :data="frpcList">
        <el-table-column prop="serverAddr" label="frps IP 地址" />
        <el-table-column prop="serverPort" label="frps 端口" />
        <el-table-column prop="localIp" label="本地服务 IP" />
        <el-table-column prop="localPort" label="本地端口" />
        <el-table-column prop="remotePort" label="远程端口" />
        <el-table-column label="状态">
          <template v-slot="scope">
            <span v-if="scope.row.status === '运行中'" class="text-green-500">{{ scope.row.status }}</span>
            <span v-else-if="scope.row.status === '未运行'" class="text-red-500">{{ scope.row.status }}</span>
            <span v-else>{{ scope.row.status }}</span>
          </template>
        </el-table-column>
        <el-table-column width="150" label="操作">
          <template style="display: flex ; " v-slot="scope">
            <el-button @click="handleEditConfig(scope.row)" class="btn-primary">编辑</el-button>
            <el-button @click="handleStartFrpc(scope.row)" class="btn-green">启动</el-button>
            <el-button @click="handleStopFrpc(scope.row)" class="btn-red">停止</el-button>
            <el-button @click="handleFetchLogs(scope.row)" class="btn-outline">日志</el-button>
            <el-button @click="handleDeleteConfig(scope.row.id, scope.row.index)" class="btn-gray">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card style="width: 90vw">
      <el-table table-layout="auto"  style="margin-top: 20px" :data="frpcList">
        <el-table-column prop="logs" label="日志" />
      </el-table>
    </el-card>
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
  deleteConfig,
  updateConfig,
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
    if (form.id===null){
      const config = await addConfig({ ...form })
      frpcList.value.push({ ...config, status: '未运行', logs: '' })
    }else{
      const config = await updateConfig(form.id, { ...form })
    }
    await refreshStatus()
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

const handleEditConfig = async (config) => {
  form.id = config.id
  form.serverAddr = config.serverAddr
  form.serverPort = config.serverPort
  form.token = config.token
  form.localIp = config.localIp
  form.localPort = config.localPort
  form.remotePort = config.remotePort
  form.type = config.type
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
