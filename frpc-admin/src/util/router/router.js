import {createRouter, createWebHistory} from 'vue-router';
import Home from "../../view/Home.vue";
import Edit from "../../components/Edit.vue";
import Log from "../../components/Log.vue";
import scheduledTasks from "../utils/scheduled.js";

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


router.beforeEach((to, from, next) => {
    scheduledTasks().clear()
    next();
});

export default router;
