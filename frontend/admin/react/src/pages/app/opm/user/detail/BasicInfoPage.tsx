import { Avatar, Descriptions, Tag, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import type { identityservicev1_User as User } from '@/api/generated/admin/service/v1';
import { useGetUser } from '@/api/hooks/user';
import { getGenderMap } from '../constants';
import { getCharColor } from '@/utils/color';
import { formatDateTime } from '@/utils/date';

interface BasicInfoPageProps {
  userId: number | undefined;
}

/**
 * 用户详情 - 基本信息 Tab
 */
const BasicInfoPage: React.FC<BasicInfoPageProps> = ({ userId }) => {
  const { t } = useTranslation('user-detail');
  const { t: tUser } = useTranslation('user');
  const genderMap = getGenderMap(tUser);

  const { data, isLoading } = useGetUser({ id: userId ?? 0 }, { enabled: !!userId } as any);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  const user = data as User | undefined;
  if (!user) return null;

  // 获取首字母
  const firstChar = user?.username?.slice(0, 1).toUpperCase() || '?';
  const avatarColor = getCharColor(firstChar);

  return (
    <div style={{ display: 'flex', gap: 32, padding: 24, flexWrap: 'wrap' }}>
      {/* 头像区 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <Avatar
          src={user.avatar || undefined}
          size={140}
          style={!user.avatar ? { backgroundColor: avatarColor, fontSize: 64 } : {}}
        >
          {!user.avatar && firstChar}
        </Avatar>
      </div>

      {/* 详细信息 */}
      <Descriptions style={{ flex: 1, minWidth: 400 }} column={2}>
        <Descriptions.Item label={t('desc.username')}>{user.username}</Descriptions.Item>
        <Descriptions.Item label={t('desc.realname')}>{user.realname || '-'}</Descriptions.Item>
        <Descriptions.Item label={t('desc.nickname')}>{user.nickname || '-'}</Descriptions.Item>
        <Descriptions.Item label={t('desc.gender')}>
          <Tag color={genderMap[user.gender || '']?.color || 'default'}>
            {genderMap[user.gender || '']?.text || '-'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label={t('desc.roleNames')}>
          {(user.roleNames || []).map((role) => (
            <Tag
              key={role}
              style={{
                backgroundColor: `hsl(${Math.abs(role.split('').reduce((h, c) => c.charCodeAt(0) + ((h << 5) - h), 0) % 360)}, 50%, 85%)`,
                color: '#333',
                border: 'none',
              }}
            >
              {role}
            </Tag>
          ))}
        </Descriptions.Item>
        <Descriptions.Item label={t('desc.mobile')}>{user.mobile || '-'}</Descriptions.Item>
        <Descriptions.Item label={t('desc.email')}>{user.email || '-'}</Descriptions.Item>
        <Descriptions.Item label={t('desc.region')}>{user.region || '-'}</Descriptions.Item>
        <Descriptions.Item label={t('desc.address')}>{user.address || '-'}</Descriptions.Item>
        <Descriptions.Item label={t('desc.tenantName')}>{user.tenantName || '-'}</Descriptions.Item>
        <Descriptions.Item label={t('desc.orgUnitName')}>
          {(user.orgUnitNames || []).map((org) => (
            <Tag
              key={org}
              style={{
                backgroundColor: `hsl(${Math.abs(org.split('').reduce((h, c) => c.charCodeAt(0) + ((h << 5) - h), 0) % 360)}, 50%, 85%)`,
                color: '#333',
                border: 'none',
              }}
            >
              {org}
            </Tag>
          ))}
        </Descriptions.Item>
        <Descriptions.Item label={t('desc.positionName')}>
          {(user.positionNames || []).map((pos) => (
            <Tag
              key={pos}
              style={{
                backgroundColor: `hsl(${Math.abs(pos.split('').reduce((h, c) => c.charCodeAt(0) + ((h << 5) - h), 0) % 360)}, 50%, 85%)`,
                color: '#333',
                border: 'none',
              }}
            >
              {pos}
            </Tag>
          ))}
        </Descriptions.Item>
        <Descriptions.Item label={t('desc.createdAt')}>
          {formatDateTime(user.createdAt)}
        </Descriptions.Item>
        <Descriptions.Item label={t('desc.lastLoginAt')}>
          {formatDateTime(user.lastLoginAt)}
        </Descriptions.Item>
        <Descriptions.Item label={t('desc.lastLoginIp')}>
          {user.lastLoginIp || '-'}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export default BasicInfoPage;
