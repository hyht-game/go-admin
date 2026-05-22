import { Avatar, Dropdown, Badge, Tooltip, Button } from 'antd';
import type { MenuProps } from 'antd';
import {
  LogoutOutlined,
  UserOutlined,
  SettingOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from '@ant-design/icons';
import { useI18n } from '@/core/i18n';

interface HeaderContentProps {
  userInfo: UserInfo | null;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onLogout: () => void;
}

export const HeaderContent = ({
  userInfo,
  isFullscreen,
  onToggleFullscreen,
  onLogout,
}: HeaderContentProps) => {
  const { t } = useI18n('common');

  // 用户菜单
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('header.profile'),
      onClick: () => {
        /* 跳转个人中心 */
      },
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('header.settings'),
      onClick: () => {
        /* 打开设置面板 */
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined className="text-red-500" />,
      label: <span className="text-red-500">{t('header.logout')}</span>,
      onClick: onLogout,
    },
  ];

  return (
    <div className="flex items-center gap-2">
      {/* 全屏切换 */}
      <Tooltip title={isFullscreen ? t('header.exitFullscreen') : t('header.fullscreen')}>
        <Button
          type="text"
          icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
          onClick={onToggleFullscreen}
          size="small"
        />
      </Tooltip>

      {/* 帮助 */}
      <Tooltip title={t('header.helpDoc')}>
        <Button
          type="text"
          icon={<QuestionCircleOutlined />}
          size="small"
          onClick={() => window.open('https://docs.example.com', '_blank')}
        />
      </Tooltip>

      {/* 通知（带未读数） */}
      <Badge count={3} size="small" offset={[0, 4]}>
        <Tooltip title={t('header.notification')}>
          <Button
            type="text"
            icon={<BellOutlined />}
            size="small"
            // onClick={openNotificationPanel}
          />
        </Tooltip>
      </Badge>

      {/* 用户头像 + 下拉菜单 */}
      <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-2 py-1 transition">
          <Avatar src={userInfo?.avatar} icon={<UserOutlined />} size="small" />
          <span className="text-sm font-medium hidden md:inline">
            {userInfo?.username || t('header.guest')}
          </span>
        </div>
      </Dropdown>
    </div>
  );
};

export default HeaderContent;
