<script setup>
import {getLang} from "../i18n/language.js";
import Log from "./Log.vue";
import router from "../util/router/router.js";

const lang = getLang('home')
</script>

<template>
  <div style="display: flex;flex-direction: column">
    <div style="font-weight: bold;font-size: 25px;margin-bottom: 10px;text-align: left">
      {{ lang.title }}
    </div>
    <el-card>
      <el-page-header @back="router.back" :title="lang.title">
        <template #breadcrumb>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">
              home
            </el-breadcrumb-item>
          </el-breadcrumb>
        </template>
      </el-page-header>
    </el-card>
  </div>
</template>

<style scoped>

</style>