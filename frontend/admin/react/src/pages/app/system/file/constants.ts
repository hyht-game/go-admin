/**
 * 文件模块枚举映射常量
 * 页面和 Drawer 共用
 */

type TFn = (key: string, options?: Record<string, any>) => string;

// ========== 存储提供商 ==========

/** 提供商颜色映射 */
export const PROVIDER_COLORS: Record<string, string> = {
  MINIO: 'blue',
  ALIYUN_OSS: 'orange',
  TENCENT_COS: 'green',
  AWS_S3: 'cyan',
};

/** 获取提供商映射（text + color） */
export function getProviderMap(t: TFn) {
  return {
    MINIO: { text: t('providerMap.MINIO'), color: PROVIDER_COLORS.MINIO },
    ALIYUN_OSS: { text: t('providerMap.ALIYUN_OSS'), color: PROVIDER_COLORS.ALIYUN_OSS },
    TENCENT_COS: { text: t('providerMap.TENCENT_COS'), color: PROVIDER_COLORS.TENCENT_COS },
    AWS_S3: { text: t('providerMap.AWS_S3'), color: PROVIDER_COLORS.AWS_S3 },
  };
}

// ========== 文件大小格式化 ==========

/** 将字节数格式化为可读字符串 */
export function formatFileSize(bytes: number | undefined | null): string {
  if (bytes == null || bytes === 0) return '-';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
}
