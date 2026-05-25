/**
 * 内部消息模块枚举映射常量
 */

type TFn = (key: string, options?: Record<string, any>) => string;

// ========== 消息状态 ==========

export const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'default',
  SENT: 'success',
  SCHEDULED: 'processing',
  REVOKED: 'warning',
};

export function getStatusMap(t: TFn) {
  return {
    DRAFT: { text: t('statusMap.DRAFT'), color: STATUS_COLORS.DRAFT },
    SENT: { text: t('statusMap.SENT'), color: STATUS_COLORS.SENT },
    SCHEDULED: { text: t('statusMap.SCHEDULED'), color: STATUS_COLORS.SCHEDULED },
    REVOKED: { text: t('statusMap.REVOKED'), color: STATUS_COLORS.REVOKED },
  };
}

export function getStatusOptions(t: TFn) {
  return [
    { label: t('statusMap.DRAFT'), value: 'DRAFT' },
    { label: t('statusMap.SENT'), value: 'SENT' },
    { label: t('statusMap.SCHEDULED'), value: 'SCHEDULED' },
    { label: t('statusMap.REVOKED'), value: 'REVOKED' },
  ];
}

// ========== 消息类型 ==========

export const TYPE_COLORS: Record<string, string> = {
  NOTIFICATION: 'blue',
  ANNOUNCEMENT: 'green',
  SYSTEM: 'orange',
};

export function getTypeMap(t: TFn) {
  return {
    NOTIFICATION: { text: t('typeMap.NOTIFICATION'), color: TYPE_COLORS.NOTIFICATION },
    ANNOUNCEMENT: { text: t('typeMap.ANNOUNCEMENT'), color: TYPE_COLORS.ANNOUNCEMENT },
    SYSTEM: { text: t('typeMap.SYSTEM'), color: TYPE_COLORS.SYSTEM },
  };
}

export function getTypeOptions(t: TFn) {
  return [
    { label: t('typeMap.NOTIFICATION'), value: 'NOTIFICATION' },
    { label: t('typeMap.ANNOUNCEMENT'), value: 'ANNOUNCEMENT' },
    { label: t('typeMap.SYSTEM'), value: 'SYSTEM' },
  ];
}
