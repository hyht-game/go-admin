import React from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Input, Button, message as antdMessage } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/stores';
import { useNavigate } from 'react-router-dom';
import '../auth-form.style.less';

const Register: React.FC = () => {
  const { t } = useTranslation();
  const { register, registerLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (values: { 
    username: string; 
    password: string; 
    confirmPassword: string 
  }) => {
    // 验证密码一致性
    if (values.password !== values.confirmPassword) {
      antdMessage.error(t('auth:passwordMismatch'));
      return;
    }

    try {
      await register({
        username: values.username,
        password: values.password,
      });

      antdMessage.success(t('auth:registerSuccess'));

      // 注册成功后跳转到登录页
      setTimeout(() => {
        navigate('/auth/login');
      }, 300);
    } catch (error: any) {
      // 错误已在 store 中处理
    }
  };

  return (
    <div className="auth-form-container">
      {/* 标题 */}
      <div className="auth-form-header">
        <h2 className="auth-form-title">{t('auth:registerTitle')}</h2>
        <p className="auth-form-description">
          {t('auth:registerDescription')}
        </p>
      </div>

      {/* 注册表单 */}
      <Form
        name="register"
        onFinish={handleSubmit}
        size="large"
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
            {
              min: 6,
              message: t('auth:passwordMinLength'),
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder={t('auth:passwordPlaceholder')}
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          className="auth-form-item"
          rules={[
            {
              required: true,
              message: t('auth:confirmPasswordRequired'),
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error(t('auth:passwordMismatch')));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder={t('auth:confirmPasswordPlaceholder')}
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={registerLoading}
            block
            className="auth-submit-button"
          >
            {registerLoading ? t('auth:registering') : t('auth:registerButton')}
          </Button>
        </Form.Item>
      </Form>

      {/* 底部链接 */}
      <div className="auth-footer-link">
        <span className="auth-footer-text">
          {t('auth:hasAccount')}{' '}
        </span>
        <a href="/auth/login" className="auth-footer-anchor">
          {t('auth:backToLogin')}
        </a>
      </div>
    </div>
  );
};

export default Register;
