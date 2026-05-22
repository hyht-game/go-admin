import { useMemo, useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation, useMatches } from 'react-router-dom';
import { ProLayout } from '@ant-design/pro-components';
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

/** 路由 handle 元数据类型 */
interface LayoutRouteHandle {
  title?: string;
  icon?: string;
}

/** 带类型的路由匹配 */
interface LayoutRouteMatch {
  pathname: string;
  handle: LayoutRouteHandle;
}

interface MainLayoutProps {
  routes?: AppRouteObject[]; // 可选：动态路由（后端模式）
}

export const MainLayout = ({ routes: dynamicRoutes }: MainLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const rawMatches = useMatches();
  const matches = rawMatches as LayoutRouteMatch[];

  // Stores
  const { userInfo, userRoles } = useUserStore();
  const { logout, refreshToken } = useAuthStore();

  // Preferences
  const preferences = usePreferencesStore((state) => state.preferences);
  const { setPreferences } = usePreferencesStore();

  // Theme & i18n
  const themeConfig = useThemeConfig();
  const { t } = useI18n('common');

  // 布局状态（本地状态，不与 preferences 冲突）
  const { collapsed, setCollapsed, isMobile, setIsMobile, selectedKeys, openKeys, setOpenKeys } =
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

  // 监听窗口大小（移动端适配）
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

  // 菜单项点击处理
  const handleMenuItemClick = useCallback(
    (menuInfo: any) => {
      const { key, path } = menuInfo.item.props;
      if (path) {
        // 外链处理
        if (path.startsWith('http')) {
          window.open(path, '_blank');
        } else {
          navigate(path);
        }
      }
    },
    [navigate],
  );

  // 面包屑项渲染
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
    [navigate],
  );

  // 右侧内容渲染（用户头像/通知/设置等）
  const rightContentRender = useCallback(() => {
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
      />
    );
  }, [userInfo, isFullscreen, logout]);

  // 菜单头渲染（Logo + 标题）
  const menuHeaderRender = useCallback(
    (logoDom: React.ReactNode, titleDom: React.ReactNode) => {
      return (
        <div className="flex items-center gap-2 cursor-pointer h-16" onClick={() => navigate('/')}>
          {logoDom}
          {preferences.app.dynamicTitle && (
            <span className="font-bold text-lg truncate max-w-[120px]">{preferences.app.name}</span>
          )}
        </div>
      );
    },
    [navigate, preferences.app],
  );

  // 处理侧边栏折叠
  const handleCollapse = useCallback(
    (collapsed: boolean) => {
      setCollapsed(collapsed);
    },
    [setCollapsed],
  );

  // 处理菜单展开
  const handleOpenChange = useCallback(
    (keys: string[]) => {
      setOpenKeys(keys);
    },
    [setOpenKeys],
  );

  return (
    <ConfigProvider {...themeConfig}>
      {/* ✅ 修复5：给 ProLayout 最外层设置高度，确保布局撑开全屏 */}
      <div className="h-screen w-screen overflow-hidden">
        <ProLayout
          // 🔹 基础配置
          title={preferences.app.name}
          logo={preferences.logo.enable ? preferences.logo.source : undefined}
          layout={preferences.app.layout}
          contentWidth={preferences.app.contentCompact === 'wide' ? 'Fluid' : 'Fixed'}
          fixedHeader={preferences.header.enable && preferences.header.mode === 'fixed'}
          fixSiderbar={preferences.sidebar.enable}
          // ✅ 修复2：传入 location，让 ProLayout 自动匹配路由
          location={{ pathname: location.pathname }}
          // 🔹 侧边栏
          collapsed={collapsed}
          collapsedButtonRender={isMobile ? false : undefined}
          onCollapse={handleCollapse}
          siderWidth={preferences.sidebar.width}
          collapsedWidth={preferences.sidebar.collapsedShowTitle ? 80 : 48}
          // ✅ 修复2：简化菜单配置，移除冲突的 menuItemRender
          menu={{
            autoClose: isMobile,
            ignoreOpenKeys: false, // 改为 false，让 ProLayout 自动管理展开状态
          }}
          menuData={menuData as MenuDataItem[]}
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          // 🔹 菜单头渲染
          menuHeaderRender={menuHeaderRender}
          onMenuHeaderClick={() => navigate('/')}
          // 🔹 面包屑
          breadcrumbRender={breadcrumbRender}
          breadcrumbProps={{
            separator: '>',
            itemRender: (route, params, routes, paths) => {
              const last = routes.indexOf(route) === routes.length - 1;
              return last ? (
                <span className="text-gray-500">{route.breadcrumbName}</span>
              ) : (
                <span
                  className="text-blue-600 cursor-pointer hover:underline"
                  onClick={() => route.path && navigate(route.path)}
                >
                  {route.breadcrumbName}
                </span>
              );
            },
          }}
          // 🔹 顶栏
          headerTheme={preferences.theme.semiDarkHeader ? 'light' : undefined}
          headerContentRender={() => preferences.header.enable && rightContentRender()}
          // 🔹 页脚
          footerRender={() => (preferences.footer.enable ? <AppFooter /> : false)}
          // ✅ 修复1：移除 pageContainerRender，避免与 children 冲突
          // 🔹 自定义侧边栏渲染
          siderMenuRender={(menuDom, actions) => (
            <SiderMenu
              menuDom={menuDom}
              actions={actions}
              collapsed={collapsed}
              isMobile={isMobile}
            />
          )}
          // ✅ 修复1&5：简化 children，移除 TabBar，确保内容区正确渲染
          children={
            <div className="h-full overflow-auto">
              <Outlet />
            </div>
          }
          // ✅ 修复4：使用标准主题色，移除半透明值
          token={{
            header: {
              colorBgHeader: preferences.theme.semiDarkHeader
                ? '#ffffff'
                : undefined,
            },
            sider: {
              colorMenuBackground: preferences.theme.semiDarkSidebar
                ? '#001529'
                : undefined,
            },
          }}
          //  移动端适配
          breakpoint={false}
        />
      </div>
    </ConfigProvider>
  );
};

export default MainLayout;
