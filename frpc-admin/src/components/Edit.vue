<script setup>

import {onMounted, reactive, ref} from 'vue'
import {addConfig, deleteConfig, getConfigs, getLogs, getStatus, startFrpc, stopFrpc,} from '../api/base.js'
import scheduledTasks from '../util/utils/scheduled.js';
import {ElMessage, ElMessageBox} from "element-plus";
import {getLang, getTranslate} from '../i18n/language.js'
import {Orange} from "@element-plus/icons-vue";
import router from "../util/router/router.js";

const lang = getLang('home')
onMounted(() => {
  loadConfigs()
  const scheduler = scheduledTasks();
  scheduler.add(() => {
    refreshStatus()
  }, 30000);

})

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
    await refreshStatus()
  } catch (e) {
    console.log(e)
  }
}


const handleAddConfig = async () => {
  if (!form.serverAddr || !form.localIp || !form.remotePort) {
    ElMessage.info('请填写完整的配置信息')
    return
  }
  try {
    const config = await addConfig({...form})
    frpcList.value.push({...config, status: '未运行', logs: ''})
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
    config.logs = res || ''
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
  if (await ElMessageBox.confirm(getTranslate("确定删除吗？"), getTranslate("提示"))) {
    await deleteConfig(id)
  }
  await refreshStatus()
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


const lookLogs = async (config) => {
  await router.push(`/log/${config.remotePort}`)
}
</script>

<template>
  <div style="display: flex">
    <!-- 添加配置区域 -->
    <el-card>
      <el-form label-width="auto">
        <el-form-item label="frps IP 地址">
          <el-select allow-create filterable v-model="form.serverAddr" placeholder="请输入 frps IP 地址">
            <el-option label="frp.zorange.online" value="frp.zorange.online"/>
          </el-select>
        </el-form-item>
        <el-form-item label="frps 端口">
          <el-select allow-create filterable v-model="form.serverPort" placeholder="请输入 frps 端口">
            <el-option label="7000" value="7000"/>
          </el-select>
        </el-form-item>
        <el-form-item label="frps 令牌">
          <el-input type="password" v-model="form.token" placeholder="请输入 frps 令牌"/>
        </el-form-item>
        <el-form-item label="本地服务 IP">
          <el-select allow-create filterable v-model="form.localIp" placeholder="请输入本地服务地址">
            <el-option label="localhost" value="localhost"/>
            <el-option label="127.0.0.1" value="127.0.0.1"/>
          </el-select>
        </el-form-item>
        <el-form-item label="本地端口">
          <el-input v-model=" form.localPort" placeholder="请输入本地端口"/>
        </el-form-item>
        <el-form-item label="远程端口">
          <el-input v-model="form.remotePort" placeholder="请输入远程端口"/>
        </el-form-item>
        <el-form-item label="协议类型">
          <el-select v-model="form.type" placeholder="请选择协议类型">
            <el-option label="tcp" value="tcp"/>
            <el-option label="http" value="http"/>
            <el-option label="https" value="https"/>
            <el-option label="stcp" value="stcp"/>
            <el-option label="xtcp" value="xtcp"/>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleAddConfig">{{ getTranslate("添加配置") }}</el-button>
          <el-button type="warning" @click="loadConfigs">{{ getTranslate("加载") }}</el-button>
          <el-button type="success" @click="refreshStatus">{{ getTranslate("刷新") }}</el-button>
        </el-form-item>
        <el-form-item>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 配置卡片列表 -->
    <el-card>
      <el-table height="500" :data="frpcList">
        <el-table-column width="150" prop="serverAddr" label="frps IP 地址"/>
        <el-table-column width="100" prop="serverPort" label="frps 端口"/>
        <el-table-column width="120" prop="localIp" label="本地服务 IP"/>
        <el-table-column width="100" prop="localPort" label="本地端口"/>
        <el-table-column width="100" prop="remotePort" label="远程端口"/>
        <el-table-column width="90" label="状态">
          <template v-slot="scope">
                 <span v-if="scope.row.status === '运行中'">
                   <el-icon size="20" color="green"><Orange/></el-icon>
                 </span>
            <span v-else>
                  <el-icon size="20" color="grey"><Orange/></el-icon>
                 </span>
          </template>
        </el-table-column>
        <el-table-column width="120" label="操作">
          <template v-slot="scope">
            <el-button size="small" @click="handleEditConfig(scope.row)">编辑</el-button>
            <el-button size="small" @click="handleStartFrpc(scope.row)">启动</el-button>
            <el-button size="small" @click="handleStopFrpc(scope.row)">停止</el-button>
            <el-button size="small" @click="lookLogs(scope.row)">日志</el-button>
            <el-button size="small" @click="handleDeleteConfig(scope.row.id, scope.row.index)" class="btn-gray">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>

</style>