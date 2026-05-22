import { useMemo, useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation, useMatches } from 'react-router-dom';
import { ProLayout, PageContainer } from '@ant-design/pro-components';
import { ConfigProvider } from 'antd';

// 内部组件
import HeaderContent from './components/HeaderContent';
import SiderMenu from './components/SiderMenu';
import AppFooter from './components/Footer';

// Hooks
import { useMenuData } from './hooks/useMenuData';
import { useLayoutState } from './hooks/useLayoutState';

// Stores & Preferences
import { useUserStore, useAuthStore } from '@/stores';
import { usePreferencesStore } from '@/core/preferences/store';
import { useThemeConfig } from '@/core/preferences/hooks/useThemeConfig';
import { useI18n } from '@/core/i18n';

import { staticRoutes } from '@/router/config/static';
import type { AppRouteObject } from '@/core/router/types';
import type { MenuDataItem } from '@ant-design/pro-components';

interface LayoutRouteHandle {
  title?: string;
  icon?: string;
}

interface LayoutRouteMatch {
  pathname: string;
  handle: LayoutRouteHandle;
}

interface MainLayoutProps {
  routes?: AppRouteObject[];
}

export const MainLayout = ({ routes: dynamicRoutes }: MainLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const rawMatches = useMatches();
  const matches = rawMatches as LayoutRouteMatch[];

  // Stores
  const { userInfo } = useUserStore();
  const { logout } = useAuthStore();

  // Preferences
  const preferences = usePreferencesStore((state) => state.preferences);
  const setPreferences = usePreferencesStore((state) => state.setPreferences);

  // Theme
  const themeConfig = useThemeConfig();
  const { t } = useI18n('common');
  const [isDark, setIsDark] = useState(() => {
    const { theme } = preferences;
    if (theme.mode === 'dark') return true;
    if (theme.mode === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const { theme } = preferences;
      if (theme.mode === 'auto') {
        setIsDark(mediaQuery.matches);
      }
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [preferences.theme.mode]);

  // 监听偏好设置变化
  useEffect(() => {
    const { theme } = preferences;
    if (theme.mode === 'dark') setIsDark(true);
    else if (theme.mode === 'light') setIsDark(false);
    else setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }, [preferences.theme.mode]);

  // 布局状态
  const { collapsed, setCollapsed, isMobile, setIsMobile, openKeys, setOpenKeys } =
    useLayoutState();

  // 菜单数据
  const permissions = useMemo(() => userInfo?.permissions || [], [userInfo?.permissions]);
  const menuData = useMenuData({
    staticRoutes,
    dynamicRoutes,
    permissions,
  });

  // 全屏状态
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 窗口大小监听
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && !collapsed) setCollapsed(true);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [collapsed, setCollapsed, setIsMobile]);

  // 菜单项点击
  const handleMenuItemClick = useCallback(
    (item: MenuDataItem) => {
      if (item.path) {
        if (item.path.startsWith('http')) {
          window.open(item.path, '_blank');
        } else {
          navigate(item.path);
        }
        if (isMobile) setCollapsed(true);
      }
    },
    [navigate, isMobile, setCollapsed],
  );

  // 面包屑
  const breadcrumbRender = useCallback(
    (routers: any[] = []) => {
      return [
        {
          path: '/',
          breadcrumbName: t('home'),
          onClick: () => navigate('/'),
        },
        ...routers.map((route) => ({
          ...route,
          onClick: route.path ? () => navigate(route.path) : undefined,
        })),
      ];
    },
    [navigate, t],
  );

  // 顶栏右侧
  const rightContentRender = useCallback(() => {
    const toggleTheme = () => {
      setPreferences({
        theme: {
          mode: isDark ? 'light' : 'dark',
        },
      });
    };

    return (
      <HeaderContent
        userInfo={userInfo}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
          } else {
            document.exitFullscreen();
            setIsFullscreen(false);
          }
        }}
        onLogout={logout}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />
    );
  }, [userInfo, isFullscreen, logout, isDark, setPreferences]);

  // 侧边栏折叠
  const handleCollapse = useCallback(
    (collapsed: boolean) => {
      setCollapsed(collapsed);
    },
    [setCollapsed],
  );

  // 菜单展开
  const handleOpenChange = useCallback(
    (keys: string[] | false) => {
      if (keys !== false) {
        setOpenKeys(keys);
      }
    },
    [setOpenKeys],
  );

  return (
    <ConfigProvider theme={themeConfig}>
      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: isDark ? '#000000' : '#f5f5f5',
        }}
      >
        {/* 顶栏 */}
        <div
          style={{
            height: 56,
            backgroundColor: isDark ? '#141414' : '#ffffff',
            borderBottom: `1px solid ${isDark ? '#303030' : '#e5e7eb'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            flexShrink: 0,
            zIndex: 100,
          }}
        >
          {/* 左侧：Logo 和标题 */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
            style={{ height: '100%' }}
          >
            {preferences.logo.enable && (
              <img src={preferences.logo.source} alt="logo" style={{ height: 32, width: 32 }} />
            )}
            {preferences.app.dynamicTitle && (
              <span
                className="font-bold text-lg truncate"
                style={{
                  color: isDark ? '#ffffff' : '#262626',
                  maxWidth: 140,
                }}
              >
                {preferences.app.name}
              </span>
            )}
          </div>

          {/* 右侧：操作按钮 */}
          {rightContentRender()}
        </div>

        {/* 主体区域 */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <ProLayout
            // 核心配置
            layout="side"
            contentWidth="Fluid"
            fixedHeader={false}
            fixSiderbar={true}
            location={{ pathname: location.pathname }}
            // 侧边栏配置
            collapsed={collapsed}
            onCollapse={handleCollapse}
            siderWidth={256}
            menu={{
              autoClose: isMobile ? undefined : false,
              type: 'group',
            }}
            menuData={menuData as MenuDataItem[]}
            openKeys={openKeys}
            onOpenChange={handleOpenChange}
            menuItemRender={(item, dom) => (
              <div onClick={() => handleMenuItemClick(item)} className="w-full h-full">
                {dom}
              </div>
            )}
            // 面包屑
            breadcrumbRender={breadcrumbRender}
            breadcrumbProps={{
              separator: '/',
              itemRender: (route, _params, routes) => {
                const last = routes.indexOf(route) === routes.length - 1;
                return last ? (
                  <span>{route.title}</span>
                ) : (
                  <span
                    className="cursor-pointer hover:text-blue-400 transition-colors"
                    onClick={() => route.path && navigate(route.path)}
                  >
                    {route.title}
                  </span>
                );
              },
            }}
            // 页脚
            footerRender={() => (preferences.footer.enable ? <AppFooter /> : false)}
            // 侧边栏渲染
            menuContentRender={(_, defaultDom) => (
              <SiderMenu menuDom={defaultDom} collapsed={collapsed} isMobile={isMobile} />
            )}
            // 内容区
            token={{
              sider: {
                colorMenuBackground: isDark ? '#141414' : '#ffffff',
                colorTextMenu: isDark ? '#a6a6a6' : '#595959',
                colorTextMenuSelected: '#1677ff',
                colorBgMenuItemSelected: isDark ? '#1f1f1f' : '#e6f7ff',
                colorBgMenuItemHover: isDark ? '#1f1f1f' : '#f5f5f5',
                colorTextMenuActive: '#1677ff',
                colorTextMenuTitle: isDark ? '#ffffff' : '#262626',
                colorBgMenuItemCollapsedElevated: isDark ? '#1f1f1f' : '#f5f5f5',
              },
              colorPrimary: '#1677ff',
            }}
            breakpoint={false}
            style={{
              flex: 1,
              background: 'transparent',
            }}
          >
            <div
              style={{
                minHeight: 'calc(100vh - 56px)',
                backgroundColor: isDark ? '#000000' : '#f5f5f5',
              }}
            >
              <PageContainer
                ghost={true}
                header={{
                  title: matches.at(-1)?.handle?.title || '',
                  breadcrumb: {},
                }}
                style={{
                  padding: '24px',
                  background: 'transparent',
                }}
              >
                <Outlet />
              </PageContainer>
            </div>
          </ProLayout>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default MainLayout;
