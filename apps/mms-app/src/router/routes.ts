import { RouteRecordRaw } from 'vue-router';
import { ClientList } from '@adronix/mms-web'
import { ClientLocationList } from '@adronix/mms-web'
import { AreaList } from '@adronix/mms-web'
import { AssetList } from '@adronix/mms-web'


const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '/login', component: () => import('pages/Login.vue') },

      { path: '/clients', component: () => ClientList, meta: { context: 'clients' } },
      { path: '/clientLocations/:clientId', component: () => ClientLocationList, props: true, meta: { context: 'clients' } },
      { path: '/areas/:clientLocationId', component: () => AreaList, props: true, meta: { context: 'clients' } },

      { path: '/assets', component: () => AssetList, meta: { context: 'assets' } },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue'),
  },
];

export default routes;
