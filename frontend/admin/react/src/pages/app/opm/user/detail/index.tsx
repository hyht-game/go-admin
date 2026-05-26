import { useState, useMemo } from 'react';
import { Card, Button, Tabs, Popconfirm, App } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUpdateUser } from '@/api/hooks/user';
import { queryClient } from '@/core';
import ContentContainer from '@/layouts/components/PageContainer/ContentContainer';
import { TabEnum } from './types';
import BasicInfoPage from './BasicInfoPage';
import ApiLogPage from './ApiLogPage';
import InternalMessagePage from './InternalMessagePage';
import EditPasswordModal from './EditPasswordModal';

/**
 * 用户详情页面
 */
const UserDetail = () => {
  const { t } = useTranslation('user-detail');
  const navigate = useNavigate();
  const { message } = App.useApp();

  const { id } = useParams<{ id: string }>();
  const userId = useMemo(() => {
    const num = Number(id);
    return isNaN(num) ? undefined : num;
  }, [id]);

  const [activeTab, setActiveTab] = useState<string>(TabEnum.BASIC_INFO);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  // 禁用账户
  const banMutation = useUpdateUser({
    onSuccess: () => {
      message.success(t('banSuccess'));
      queryClient.invalidateQueries({ queryKey: ['getUser'] });
    },
    onError: (error: Error) => {
      message.error(error.message || t('banFailed'));
    },
  });

  const handleBanAccount = () => {
    if (userId) {
      banMutation.mutate({ id: userId, values: { status: 'DISABLED' } });
    }
  };

  const goBack = () => {
    navigate('/opm/users');
  };

  return (
    <ContentContainer heightMode="fixed" padding="16px" bottomMargin={0}>
      {/* 顶部操作栏 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={goBack} />
          <span style={{ fontSize: 16, fontWeight: 600 }}>
            {t('title', { userId: userId ?? '-' })}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Popconfirm
            title={t('banConfirmTitle')}
            description={t('banConfirmDesc')}
            onConfirm={handleBanAccount}
            okText={t('common:button.ok')}
            cancelText={t('common:button.cancel')}
          >
            <Button danger>{t('button.banAccount')}</Button>
          </Popconfirm>
          <Button type="primary" onClick={() => setPasswordModalOpen(true)}>
            {t('button.editPassword')}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{ marginBottom: 0 }}
        items={[
          {
            key: TabEnum.BASIC_INFO,
            label: t('tab.basicInfo'),
          },
          {
            key: TabEnum.API_AUDIT_LOG,
            label: t('tab.apiAuditLog'),
          },
          {
            key: TabEnum.INTERNAL_MESSAGE,
            label: t('tab.internalMessage'),
          },
        ]}
      />

      {/* Tab 内容 */}
      <Card
        style={{ flex: 1, minHeight: 0, overflow: 'auto' }}
        styles={{
          body: {
            padding: activeTab === TabEnum.BASIC_INFO ? 0 : 16,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          },
        }}
      >
        {activeTab === TabEnum.BASIC_INFO && <BasicInfoPage userId={userId} />}
        {activeTab === TabEnum.API_AUDIT_LOG && <ApiLogPage userId={userId} />}
        {activeTab === TabEnum.INTERNAL_MESSAGE && <InternalMessagePage userId={userId} />}
      </Card>

      {/* 修改密码弹窗 */}
      <EditPasswordModal
        open={passwordModalOpen}
        userId={userId}
        onClose={() => setPasswordModalOpen(false)}
      />
    </ContentContainer>
  );
};

export default UserDetail;
