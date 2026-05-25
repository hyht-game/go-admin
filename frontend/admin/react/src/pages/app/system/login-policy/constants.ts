/**
 * 登录策略模块枚举映射常量
 * 页面和 Drawer 共用
 */

type TFn = (key: string, options?: Record<string, any>) => string;

// ========== 策略类型 ==========

/** 策略类型颜色映射 */
export const POLICY_TYPE_COLORS: Record<string, string> = {
  ALLOW: 'success',
  DENY: 'error',
};

/** 获取策略类型映射（text + color） */
export function getPolicyTypeMap(t: TFn) {
  return {
    ALLOW: { text: t('policyType.ALLOW'), color: POLICY_TYPE_COLORS.ALLOW },
    DENY: { text: t('policyType.DENY'), color: POLICY_TYPE_COLORS.DENY },
  };
}

/** 策略类型选项 */
export function getPolicyTypeOptions(t: TFn) {
  return [
    { label: t('policyType.ALLOW'), value: 'ALLOW' },
    { label: t('policyType.DENY'), value: 'DENY' },
  ];
}

// ========== 登录方式 ==========

/** 登录方式颜色映射 */
export const POLICY_METHOD_COLORS: Record<string, string> = {
  PASSWORD: 'blue',
  SMS: 'green',
  EMAIL: 'cyan',
  SOCIAL: 'purple',
  LDAP: 'orange',
  OTP: 'geekblue',
};

/** 获取登录方式映射（text + color） */
export function getPolicyMethodMap(t: TFn) {
  return {
    PASSWORD: { text: t('policyMethod.PASSWORD'), color: POLICY_METHOD_COLORS.PASSWORD },
    SMS: { text: t('policyMethod.SMS'), color: POLICY_METHOD_COLORS.SMS },
    EMAIL: { text: t('policyMethod.EMAIL'), color: POLICY_METHOD_COLORS.EMAIL },
    SOCIAL: { text: t('policyMethod.SOCIAL'), color: POLICY_METHOD_COLORS.SOCIAL },
    LDAP: { text: t('policyMethod.LDAP'), color: POLICY_METHOD_COLORS.LDAP },
    OTP: { text: t('policyMethod.OTP'), color: POLICY_METHOD_COLORS.OTP },
  };
}

/** 登录方式选项 */
export function getPolicyMethodOptions(t: TFn) {
  return [
    { label: t('policyMethod.PASSWORD'), value: 'PASSWORD' },
    { label: t('policyMethod.SMS'), value: 'SMS' },
    { label: t('policyMethod.EMAIL'), value: 'EMAIL' },
    { label: t('policyMethod.SOCIAL'), value: 'SOCIAL' },
    { label: t('policyMethod.LDAP'), value: 'LDAP' },
    { label: t('policyMethod.OTP'), value: 'OTP' },
  ];
}
