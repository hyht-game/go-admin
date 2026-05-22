import { useMemo, useState, useCallback, useEffect } from 'react';
import { Tabs } from 'antd';
import { useLocation, useNavigate, useMatches } from 'react-router-dom';
import { usePreferencesStore } from '@/core/preferences/store';

/** 路由 handle 元数据类型 */
interface TabRouteHandle {
  title?: string;
  icon?: string;
}

/** 带类型的路由匹配 */
interface TabRouteMatch {
  pathname: string;
  handle: TabRouteHandle;
}

/** 已打开的标签页缓存（用于持久化） */
let cachedTabKeys: string[] = [];

export const TabBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const rawMatches = useMatches();
  const tabbar = usePreferencesStore((state) => state.preferences.tabbar);

  // 类型安全的路由匹配
  const matches = rawMatches as TabRouteMatch[];

  // 已打开的标签页列表
  const [openTabs, setOpenTabs] = useState<string[]>(cachedTabKeys);

  // 根据 styleType 映射 antd Tabs type
  const tabsType = useMemo(() => {
    switch (tabbar.styleType) {
      case 'chrome':
        return 'editable-card';
      case 'card':
        return 'card';
      case 'brisk':
        return 'line';
      case 'plain':
        return 'line';
      default:
        return 'editable-card';
    }
  }, [tabbar.styleType]);

  // 生成标签数据
  const items = useMemo(() => {
    const matchedPaths = matches
      .filter((match) => match.handle?.title)
      .map((match) => match.pathname);

    // 合并已缓存的标签和当前匹配的标签
    const allPaths = tabbar.persist ? [...new Set([...openTabs, ...matchedPaths])] : matchedPaths;

    type TabItem = { key: string; label: string; closable: boolean };

    return allPaths.flatMap((pathname): TabItem[] => {
      const match = matches.find((m) => m.pathname === pathname);
      if (!match?.handle?.title) return [];

      return [
        {
          key: pathname,
          label:
            tabbar.showIcon && match.handle.icon
              ? `${match.handle.icon} ${match.handle.title}`
              : match.handle.title,
          closable: pathname !== '/', // 首页不可关闭
        },
      ];
    });
  }, [matches, openTabs, tabbar.persist, tabbar.showIcon]);

  // 持久化缓存（移到 useEffect 避免无限循环）
  useEffect(() => {
    if (tabbar.persist && items.length > 0) {
      cachedTabKeys = items.map((item) => item.key);
      setOpenTabs(cachedTabKeys);
    }
  }, [items, tabbar.persist]);

  const activeKey = location.pathname;

  // 关闭标签
  const handleRemove = useCallback(
    (targetKey: string) => {
      const newTabs = openTabs.filter((key) => key !== targetKey);
      cachedTabKeys = newTabs;
      setOpenTabs(newTabs);

      // 如果关闭的是当前标签，跳转到相邻标签
      if (targetKey === location.pathname) {
        const remaining = items.filter((item) => item.key !== targetKey);
        const target = remaining[remaining.length - 1];
        navigate(target?.key || '/');
      }
    },
    [openTabs, items, location.pathname, navigate],
  );

  // 标签编辑（关闭）
  const handleEdit = useCallback(
    (targetKey: any, action: 'add' | 'remove') => {
      if (action === 'remove' && typeof targetKey === 'string') {
        handleRemove(targetKey);
      }
    },
    [handleRemove],
  );

  // 标签页切换
  const handleTabChange = useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate],
  );

  if (!tabbar.enable) return null;

  return (
    <div
      className="tabbar-container"
      style={{
        height: tabbar.height,
        lineHeight: `${tabbar.height}px`,
      }}
    >
      <Tabs
        type={tabsType}
        size="small"
        activeKey={activeKey}
        items={items}
        onChange={handleTabChange}
        onEdit={handleEdit}
        tabBarStyle={{
          height: tabbar.height,
          margin: 0,
        }}
      />
    </div>
  );
};

export default TabBar;
