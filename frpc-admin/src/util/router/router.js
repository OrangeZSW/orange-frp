import {createRouter, createWebHistory} from 'vue-router';
import Home from "../../view/Home.vue";
import Edit from "../../components/Edit.vue";
import Log from "../../components/Log.vue";
import scheduledTasks from "../utils/scheduled.js";
import {fr} from "element-plus/es/locale/index";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home,
            children: [
                {
                    path: '/',
                    name: 'Edit',
                    component: Edit
                },
                {
                    path: '/log/:remotePort',
                    name: 'log',
                    component: Log
                }
            ]
        },
    ],
});

// 路由切换前
router.beforeEach((to, from, next) => {
    //如果是原地刷新，则不清除，如果是跳转，在跳转之前清除
    if (from.name !== undefined && to.name !== from.name) {
        scheduledTasks().clear()
    }
    next()
});

// 路由切换后
router.afterEach((to, from) => {

})

export default router;
