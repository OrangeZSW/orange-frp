<template>
  <el-container>
   <el-header style="height: auto;margin-bottom: 5px">
     <Heard/>
   </el-header>
    <el-main>
      <router-view/>
    </el-main>
  </el-container>
</template>

<script setup>
import Heard from "../components/heard.vue";
</script>

<style scoped>
</style>
