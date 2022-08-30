import { RouteRecordRaw } from 'vue-router';
import { ClientList, PartRequirementList } from '@adronix/mms-web'
import { ClientLocationList } from '@adronix/mms-web'
import { AreaList } from '@adronix/mms-web'
import { AssetList } from '@adronix/mms-web'
import { Models } from '@adronix/mms-web'
import { AssetModelList } from '@adronix/mms-web'
import { ResourceTypeList } from '@adronix/mms-web'
import { ResourceModelList } from '@adronix/mms-web'
import { PartList } from '@adronix/mms-web'
import { TaskModelList } from '@adronix/mms-web'
import { Planning } from '@adronix/mms-web'
import { AssetAttributeList } from '@adronix/mms-web'
import { SchedulingList } from '@adronix/mms-web'
import { AreaModelList } from '@adronix/mms-web'
import { AssetComponentList } from '@adronix/mms-web'
import { AssetComponentModelList } from '@adronix/mms-web'
import { TaskList } from '@adronix/mms-web'
import { WorkPlanList } from '@adronix/mms-web'
import { ResourceList } from '@adronix/mms-web'
import { ServiceList } from '@adronix/mms-web'
import { WorkOrderList } from '@adronix/mms-web'
import { ChecklistModelList } from '@adronix/mms-web'
import { ChecklistItemModelList } from '@adronix/mms-web'
import { ChecklistList } from '@adronix/mms-web'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '/login', component: () => import('pages/Login.vue') },

      { path: '/resources', component: () => ResourceList, meta: { context: 'resources' } },
      { path: '/services', component: () => ServiceList, meta: { context: 'models' } },

      { path: '/clients', component: () => ClientList, meta: { context: 'clients' } },
      { path: '/clientLocations/:clientId', component: () => ClientLocationList, props: true, meta: { context: 'clients' } },
      { path: '/areas/:clientLocationId', component: () => AreaList, props: true, meta: { context: 'clients' } },

      { path: '/tasks', name: 'tasks', component: () => TaskList, props: true, meta: { context: 'tasks' } },
      { path: '/workOrders', component: () => WorkOrderList, meta: { context: 'workOrders' } },
      { path: '/assets', name: 'assets', component: () => AssetList, props: true, meta: { context: 'assets' } },
      { path: '/assetComponents/:assetId', component: () => AssetComponentList, props: true, meta: { context: 'assets' } },
      { path: '/checklists/:assetId', component: () => ChecklistList, props: true, meta: { context: 'assets' } },

      { path: '/models', component: () => Models, meta: { context: 'models' } },
      { path: '/taskModels', component: () => TaskModelList, meta: { context: 'models' } },
      { path: '/assetModels', component: () => AssetModelList, meta: { context: 'models' } },
      { path: '/checklistModels', component: () => ChecklistModelList, meta: { context: 'models' } },
      { path: '/checklistItemModels', component: () => ChecklistItemModelList, meta: { context: 'models' } },
      { path: '/assetComponentModels', component: () => AssetComponentModelList, meta: { context: 'models' } },
      { path: '/areaModels', component: () => AreaModelList, meta: { context: 'models' } },
      { path: '/assetAttributes', component: () => AssetAttributeList, meta: { context: 'models' } },
      { path: '/resourceTypes', component: () => ResourceTypeList, meta: { context: 'models' } },
      { path: '/resourceModels', component: () => ResourceModelList, meta: { context: 'models' } },
      { path: '/parts', component: () => PartList, meta: { context: 'models' } },

      { path: '/planning', component: () => Planning, meta: { context: 'planning' } },
      { path: '/partRequirements', component: () => PartRequirementList, meta: { context: 'planning' } },
      { path: '/workPlans', component: () => WorkPlanList, meta: { context: 'planning' } },
      { path: '/schedulings', component: () => SchedulingList, meta: { context: 'planning' } },
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
