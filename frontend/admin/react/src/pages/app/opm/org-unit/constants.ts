/**
 * 组织架构模块枚举映射常量
 */

type TFn = (key: string, options?: Record<string, any>) => string;

// ========== 组织状态（ON/OFF） ==========

export const STATUS_COLORS: Record<string, string> = {
  ON: 'success',
  OFF: 'error',
};

export function getStatusMap(t: TFn) {
  return {
    ON: { text: t('statusMap.ON'), color: STATUS_COLORS.ON },
    OFF: { text: t('statusMap.OFF'), color: STATUS_COLORS.OFF },
  };
}

export function getStatusOptions(t: TFn) {
  return [
    { label: t('statusMap.ON'), value: 'ON' },
    { label: t('statusMap.OFF'), value: 'OFF' },
  ];
}

// ========== 组织类型 ==========

export const ORG_TYPE_COLORS: Record<string, string> = {
  GROUP: 'purple',
  COMPANY: 'blue',
  DEPARTMENT: 'cyan',
  TEAM: 'green',
};

export function getOrgTypeMap(t: TFn) {
  return {
    GROUP: { text: t('typeMap.GROUP'), color: ORG_TYPE_COLORS.GROUP },
    COMPANY: { text: t('typeMap.COMPANY'), color: ORG_TYPE_COLORS.COMPANY },
    DEPARTMENT: { text: t('typeMap.DEPARTMENT'), color: ORG_TYPE_COLORS.DEPARTMENT },
    TEAM: { text: t('typeMap.TEAM'), color: ORG_TYPE_COLORS.TEAM },
  };
}

export function getOrgTypeOptions(t: TFn) {
  return [
    { label: t('typeMap.GROUP'), value: 'GROUP' },
    { label: t('typeMap.COMPANY'), value: 'COMPANY' },
    { label: t('typeMap.DEPARTMENT'), value: 'DEPARTMENT' },
    { label: t('typeMap.TEAM'), value: 'TEAM' },
  ];
}
