import { createRouter, createWebHistory } from 'vue-router';
import Home from "../../view/Home.vue";
import Edit from "../../components/Edit.vue";
import Log from "../../components/Log.vue";

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
          path: '/log',
          name: 'log',
          component: Log
        }
      ]
    },
  ],
});

export default router;
