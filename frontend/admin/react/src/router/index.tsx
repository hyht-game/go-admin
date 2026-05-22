import { useState, useEffect, useMemo } from 'react';
import { RouterProvider } from 'react-router-dom';
import { createAccessibleRouter } from '@/core/router/factory';
import { staticRoutes } from './config/static';
import { useAuthStore, useUserStore } from '@/stores';

import Forbidden from '@/pages/core/error/401.tsx';
import BlankLayout from '@/layouts/BlankLayout';
import Login from '@/pages/core/auth/login';
import Register from '@/pages/core/auth/register';
import { NotFound } from '@/pages/core/error';
import RouteErrorFallback from '@/layouts/components/ErrorFallback/RouteErrorFallback.tsx';

export const AppRouter = () => {
  const [router, setRouter] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { accessToken } = useAuthStore();
  const { userInfo } = useUserStore();

  // 计算属性：是否已认证、权限列表（使用 useMemo 稳定化）
  const isAuthenticated = !!accessToken;
  const permissions = useMemo(() => userInfo?.permissions || [], [userInfo?.permissions]);

  useEffect(() => {
    const initRouter = async () => {
      setLoading(true);

      try {
        // 未登录：只允许访问登录页、注册页和 404，并强制重定向到登录页
        if (!isAuthenticated) {
          // 直接构建公开路由，避免从 staticRoutes 中提取导致引用问题
          const publicRoutes = [
            {
              path: '/auth',
              element: <BlankLayout />,
              errorElement: <RouteErrorFallback />,
              children: [
                {
                  path: 'login',
                  element: <Login />,
                },
                {
                  path: 'register',
                  element: <Register />,
                },
              ],
            },
            {
              path: '*',
              element: <BlankLayout />,
              children: [
                {
                  index: true,
                  element: <NotFound />,
                },
              ],
            },
          ] as any;

          const router = await createAccessibleRouter({
            routes: publicRoutes,
            permissions: [],
            autoInjectRedirect: false,
            autoSort: false,
          });
          setRouter(router);
          setLoading(false);
          return;
        }

        // 已登录：生成完整路由
        const appRouter = await createAccessibleRouter({
          routes: staticRoutes,
          permissions,
          forbiddenElement: <Forbidden />,
          autoInjectRedirect: true,
          autoSort: true,
        });
        setRouter(appRouter);
      } catch (err) {
        console.error('Router init failed:', err);
      } finally {
        setLoading(false);
      }
    };

    initRouter();
  }, [isAuthenticated, permissions]);

  if (loading || !router)
    return <div className="h-screen flex items-center justify-center">初始化中...</div>;

  return <RouterProvider router={router} />;
};
