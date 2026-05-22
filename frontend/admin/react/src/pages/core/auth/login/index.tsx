import React from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Input, Button, Checkbox, message as antdMessage } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/stores';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../auth-form.style.less';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const { login, loginLoading } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (values: { username: string; password: string; remember?: boolean }) => {
    try {
      await login({
        username: values.username,
        password: values.password,
        grant_type: 'password',
      });

      antdMessage.success(t('auth:loginSuccess'));

      // 跳转到重定向页面或首页
      const redirect = searchParams.get('redirect') || '/';
      setTimeout(() => {
        navigate(redirect);
      }, 300);
    } catch (error: any) {
      // 错误已在 store 中处理
    }
  };

  return (
    <div className="auth-form-container">
      {/* 标题 */}
      <div className="auth-form-header">
        <h2 className="auth-form-title">{t('auth:welcomeBack')}</h2>
        <p className="auth-form-description">
          {t('auth:loginDescription')}
        </p>
      </div>

      {/* 登录表单 */}
      <Form
        name="login"
        onFinish={handleSubmit}
        size="large"
        initialValues={{ remember: true }}
      >
        <Form.Item
          name="username"
          className="auth-form-item"
          rules={[
            {
              required: true,
              message: t('auth:usernameRequired'),
            },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder={t('auth:usernamePlaceholder')}
            autoComplete="username"
          />
        </Form.Item>

        <Form.Item
          name="password"
          className="auth-form-item"
          rules={[
            {
              required: true,
              message: t('auth:passwordRequired'),
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder={t('auth:passwordPlaceholder')}
            autoComplete="current-password"
          />
        </Form.Item>

        <Form.Item className="auth-remember-checkbox">
          <div className="flex items-center justify-between">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>{t('auth:rememberAccount')}</Checkbox>
            </Form.Item>
          </div>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loginLoading}
            block
            className="auth-submit-button"
          >
            {loginLoading ? t('auth:loggingIn') : t('auth:loginButton')}
          </Button>
        </Form.Item>
      </Form>

      {/* 底部链接 */}
      <div className="auth-footer-link">
        <span className="auth-footer-text">
          {t('auth:noAccount')}{' '}
        </span>
        <a href="/auth/register" className="auth-footer-anchor">
          {t('auth:createAccount')}
        </a>
      </div>
    </div>
  );
};

export default Login;
