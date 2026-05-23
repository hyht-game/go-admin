import type { AppRouteObject } from '@/core/router/types';

import BlankLayout from '@/layouts/BlankLayout';
import RouteErrorFallback from '@/layouts/components/ErrorFallback/RouteErrorFallback';
import {
  Unauthorized,
  Forbidden,
  InternalError,
  Offline,
  ComingSoon,
  NotFound,
} from '@/pages/core/error';

export const errorRoutes: AppRouteObject[] = [
  {
    name: 'error-pages',
    path: '/',
    element: <BlankLayout />,
    errorElement: <RouteErrorFallback />,
    meta: { title: '错误', hideInMenu: true, hideInTab: true },
    children: [
      {
        name: 'unauthorized',
        path: '401',
        element: <Unauthorized />,
        meta: { title: '未授权', ignoreAccess: true, hideInMenu: true, hideInTab: true },
      },
      {
        name: 'forbidden',
        path: '403',
        element: <Forbidden />,
        meta: { title: '无权限', ignoreAccess: true, hideInMenu: true, hideInTab: true },
      },
      {
        name: 'server-error',
        path: '500',
        element: <InternalError />,
        meta: { title: '服务器错误', ignoreAccess: true, hideInMenu: true, hideInTab: true },
      },
      {
        name: 'offline',
        path: 'offline',
        element: <Offline />,
        meta: { title: '离线', ignoreAccess: true, hideInMenu: true, hideInTab: true },
      },
      {
        name: 'coming-soon',
        path: 'coming-soon',
        element: <ComingSoon />,
        meta: { title: '即将上线', ignoreAccess: true, hideInMenu: true, hideInTab: true },
      },

      // ========== 404 通配符路由（必须放在最后！） ==========
      {
        name: 'not-found',
        path: '*',
        element: <NotFound />,
        meta: { title: '404', ignoreAccess: true, hideInMenu: true, hideInTab: true },
      },
    ],
  },
];

export default errorRoutes;
