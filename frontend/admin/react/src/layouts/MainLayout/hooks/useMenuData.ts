import { useMemo } from 'react';
import type { AppRouteObject } from '@/core/router/types';
import { transformRoutesToMenu } from '@/core/router/utils/menu';

interface UseMenuDataOptions {
  staticRoutes?: AppRouteObject[]; // 静态路由（前端模式）
  dynamicRoutes?: AppRouteObject[]; // 动态路由（后端模式）
  permissions: string[]; // 权限列表
}

export const useMenuData = ({
  staticRoutes = [],
  dynamicRoutes,
  permissions,
}: UseMenuDataOptions) => {
  // 优先使用动态路由（后端模式），否则用静态路由
  const routes = useMemo(() => {
    return dynamicRoutes?.length ? dynamicRoutes : staticRoutes;
  }, [dynamicRoutes, staticRoutes]);

  // 转换路由 → 菜单
  return useMemo(() => {
    return transformRoutesToMenu(routes, permissions);
  }, [routes, permissions]);
};
