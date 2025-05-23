<script setup>
import {onMounted, ref} from "vue";
import {useStore} from "../util/pinia/store.js";

// 从 Pinia store 获取日志
const logs = ref(useStore.log);  // 从 Pinia store 获取日志

// 如果你希望在组件加载时从 store 获取数据并动态更新
onMounted(() => {
  logs.value = useStore.log;
});
</script>

<template>
  <el-card style="font-weight: bold; padding: 20px;">
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
