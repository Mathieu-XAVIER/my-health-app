import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/health',
  },
  {
    path: '/health',
    component: () => import('../modules/health/views/HealthJournalView.vue'),
  },
  {
    path: '/nutrition',
    component: () => import('../modules/nutrition/views/NutritionJournalView.vue'),
  },
  {
    path: '/fitness',
    component: () => import('../modules/fitness/views/FitnessTrackerView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
