import { Card, Empty } from 'antd';
import ContentContainer from '@/layouts/components/PageContainer/ContentContainer';

/**
 * 菜单管理页面
 *
 * 使用 ContentContainer 作为限定容器，统一页面布局
 * 组件链：MainLayout > PageContainer > 业务页面 > ContentContainer > Card
 *
 * 效果：撑满可视区域，四周保持一致的 margin/padding
 */
const MenuManagement = () => {
  return (
    <ContentContainer heightMode="fixed" padding="16px" bottomMargin={0}>
      <Card
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Empty description="菜单管理页面 - 开发中（已撑满可视区域）" />
      </Card>
    </ContentContainer>
  );
};

export default MenuManagement;
