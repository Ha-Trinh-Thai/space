import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/modules/workspace/views/HomeView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'workspace/:workspaceId',
        name: 'workspace',
        component: () => import('@/modules/workspace/views/WorkspaceView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'workspace/:workspaceId/doc/:documentId',
        name: 'document',
        component: () => import('@/modules/document/views/DocumentView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'workspace/:workspaceId/canvas/:canvasId',
        name: 'canvas',
        component: () => import('@/modules/canvas/views/CanvasView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'workspace/:workspaceId/mindmap/:mindmapId',
        name: 'mindmap',
        component: () => import('@/modules/mindmap/views/MindmapView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/modules/auth/views/ProfileView.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/auth',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('@/modules/auth/views/LoginView.vue'),
      },
      {
        path: 'signup',
        name: 'signup',
        component: () => import('@/modules/auth/views/SignupView.vue'),
      },
      {
        path: 'forgot-password',
        name: 'forgot-password',
        component: () => import('@/modules/auth/views/ForgotPasswordView.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('access_token');
  if (to.meta.requiresAuth && !token) {
    next({ name: 'login' });
  } else {
    next();
  }
});

export default router;
