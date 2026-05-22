import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { useAuthStore } from '@/stores';
import { usePreferencesStore } from '@/core/preferences/store';
import { useThemeConfig } from '@/core/preferences/hooks/useThemeConfig';
import Background from './components/Background';

interface UserLayoutProps {
  requireAuth?: boolean; // 是否需要登录（用于保护路由）
}

export const UserLayout = ({ requireAuth = false }: UserLayoutProps) => {
  const { accessToken } = useAuthStore();
  const preferences = usePreferencesStore((state) => state.preferences);
  const themeConfig = useThemeConfig();

  // 布局容器样式
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  };

  // 未登录保护
  if (requireAuth && !accessToken) {
    const redirect = encodeURIComponent(window.location.pathname + window.location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  // 已登录跳转（用于登录页）
  if (!requireAuth && accessToken) {
    return <Navigate to="/" replace />;
  }

  return (
    <ConfigProvider {...themeConfig}>
      <div style={containerStyle}>
        {/* 背景装饰 */}
        <Background layout={preferences.app.authPageLayout} />

        {/* 内容区域 */}
        <div className="relative z-10 w-full max-w-md px-4">
          {/* Logo + 标题 */}
          {preferences.logo.enable && (
            <div className="text-center mb-8">
              <img
                src={preferences.logo.source}
                alt={preferences.app.name}
                className="h-12 mx-auto mb-2"
              />
              {preferences.app.dynamicTitle && (
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {preferences.app.name}
                </h1>
              )}
            </div>
          )}

          {/* 路由出口 */}
          <Outlet />
        </div>

        {/* 页脚版权 */}
        {preferences.copyright.enable && (
          <div className="absolute bottom-4 left-0 right-0 text-center text-gray-400 text-sm z-10">
            © {preferences.copyright.date} {preferences.copyright.companyName}
            {preferences.copyright.icp && (
              <a
                href={preferences.copyright.icpLink}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 hover:text-blue-600"
              >
                {preferences.copyright.icp}
              </a>
            )}
          </div>
        )}
      </div>
    </ConfigProvider>
  );
};

export default UserLayout;
