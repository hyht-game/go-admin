import React, { useMemo } from 'react';
import { usePreferencesStore } from '@/core/preferences/store';

interface SiderMenuProps {
  menuDom: React.ReactNode;
  actions?: React.ReactNode;
  collapsed: boolean;
  isMobile: boolean;
}

export const SiderMenu = ({ menuDom, actions, collapsed, isMobile }: SiderMenuProps) => {
  const { navigation } = usePreferencesStore((state) => state.preferences);

  // 菜单样式（根据偏好设置）
  const menuStyle = useMemo(() => {
    const style: React.CSSProperties = {};

    // 手风琴模式
    if (navigation.accordion) {
      // ProLayout 通过 menu.props 传递，这里可添加 className
    }

    // 分割模式（混合布局时）
    if (navigation.split) {
      style.borderRight = '1px solid rgba(0,0,0,0.06)';
    }

    return style;
  }, [navigation]);

  return (
    <div className="h-full flex flex-col" style={menuStyle}>
      {/* 菜单区域 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">{menuDom}</div>

      {/* 底部操作区（可选） */}
      {actions && !collapsed && !isMobile && (
        <div className="p-2 border-t border-gray-100 dark:border-gray-800">{actions}</div>
      )}
    </div>
  );
};

export default SiderMenu;
