<script setup>
import {onMounted, ref} from "vue";
import {getLogs} from '../api/base.js'
import scheduledTasks from '../util/utils/scheduled.js'
import router from "../util/router/router.js";

const logs = ref([])

// 如果你希望在组件加载时从 store 获取数据并动态更新
onMounted(() => {
  scheduledTasks().add(setLogs, 5000)
});

const setLogs = () => {
  const remotePort = router.currentRoute.value.params.remotePort
  getLogs(remotePort).then(res => {
    logs.value = res
  })
}


</script>

<template>
  <el-card style="font-weight: bold; padding: 20px;min-width: 50vw;min-height: 50vh">
    <!-- 这里如果没有日志内容，显示一个默认提示 -->
    <div v-if="logs!=null && logs.length === 0" class="no-logs">
      <el-text>没有日志内容</el-text>
    </div>
    <!-- 如果有日志内容，展示在 el-text 中 -->
    <div v-else>
      <el-text class="log-content">{{ logs }}</el-text>
    </div>
  </el-card>
</template>

<style scoped>
.no-logs {
  color: #999;
  font-size: 14px;
  text-align: left; /* 改为左对齐 */
}

.el-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 20px auto;
}

.log-content {
  word-wrap: break-word; /* 使长文本换行显示 */
  text-align: left; /* 确保日志内容左对齐 */
  white-space: pre-line; /* 保留换行符 */
  font-size: 14px;
  line-height: 1.6;
}
</style>
