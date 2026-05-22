import i18n from 'i18next';
import type { HttpResponse } from '@/core';

/**
 * 移除对象中的 null 和 undefined 值
 * @param obj
 */
export const removeNullUndefined = <T extends Record<string, unknown>>(obj: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== null && v !== undefined && v !== ''),
  ) as Partial<T>;

/**
 * 创建列表查询 JSON 过滤字符串
 * @param formValues 查询表单值
 * @param needCleanTenant 是否需要清理租户字段
 */
export function makeQueryString(
  formValues?: null | Record<string, unknown>,
  needCleanTenant: boolean = false,
): string | undefined {
  if (formValues === null || formValues === undefined) {
    return undefined;
  }

  // 去除掉空值
  const cleaned = removeNullUndefined(formValues);

  if (cleaned === undefined) return undefined;

  // 若是数组，直接按数组处理
  if (Array.isArray(cleaned)) {
    return cleaned.length === 0 ? undefined : JSON.stringify(cleaned);
  }

  // 过滤掉空对象
  if (Object.keys(cleaned).length === 0) {
    return undefined;
  }

  if (needCleanTenant) {
    // 删除租户相关字段 tenant_id 和 tenantId
    const { tenant_id, tenantId, ...rest } = cleaned as Record<string, unknown>;

    // 过滤掉空对象
    if (Object.keys(rest).length === 0) {
      return undefined;
    }

    return JSON.stringify(rest);
  }

  // 默认返回整个 cleaned 对象的 JSON 字符串
  return JSON.stringify(cleaned);
}

/**
 * 创建排序字符串
 * @param orderBy
 */
export function makeOrderBy(orderBy?: null | string[]): string | undefined {
  if (orderBy === undefined) {
    orderBy = ['-created_at'];
  }
  if (orderBy === null) {
    orderBy = ['-created_at'];
  }
  return JSON.stringify(orderBy) ?? undefined;
}

export function makeUpdateMask(keys: string[]): string {
  keys.push('id');
  return keys.join(',');
}

/**
 * 从对象中省略指定键，返回新对象
 * @example 用法示例
 * const original = { a: 1, b: 2, c: 3 };
 * const result = omit(original, ['b', 'c']);
 * // result 的值为 { a: 1 }
 * @param obj 原始对象
 * @param keys 需要省略的键或键数组
 */
export function omit<T extends Record<string, unknown>, K extends string>(
  obj: null | T | undefined,
  keys: K | K[],
): Omit<T, K> {
  if (obj === null || typeof obj !== 'object') return obj as unknown as T;
  const result = { ...obj } as Record<string, unknown>;
  const keysArr = Array.isArray(keys) ? keys : [keys];
  for (const key of keysArr) {
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      delete result[key];
    }
  }
  return result as Omit<T, K>;
}

/**
 * 默认的请求 ID 生成器
 */
export function defaultIdGenerator(): string {
  try {
    // 优先使用标准 API
    const rnd = (
      globalThis as unknown as { crypto?: { randomUUID?: () => string } }
    )?.crypto?.randomUUID?.();
    if (typeof rnd === 'string' && rnd.length > 0) return rnd;
  } catch {
    // ignore
  }
  // 降级方案
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * 按优先级获取错误提示文本
 * 1. reason → i18n error.xxx
 * 2. reason 无翻译 → 使用 message
 * 3. 都无 → 使用 status → i18n status.xxx
 * 4. 都无 → fallback
 */
export function getErrorMsg(error: unknown) {
  const i18nPrefix = 'request.';

  // 网络错误
  const errStr = String(error ?? '');
  if (errStr.includes('Network Error')) {
    return i18n.t(i18nPrefix + 'error.networkError');
  }

  // 超时
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    String(error.message).includes('timeout')
  ) {
    return i18n.t(i18nPrefix + 'error.timeout');
  }

  // 获取后端返回数据
  const resData =
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response
      ? (error.response.data as HttpResponse)
      : undefined;

  if (!resData) {
    return i18n.t(i18nPrefix + 'error.unknownError');
  }

  const { reason, message, code } = resData;

  console.log('resData:', resData);

  // =========================================
  // 1. 优先：reason → request.reason.xxx
  // =========================================
  if (reason) {
    const key = i18nPrefix + `reason.${reason}`;
    if (i18n.exists(key)) {
      return i18n.t(key);
    }
  }

  // =========================================
  // 2. reason 无翻译 → 使用后端 message
  // =========================================
  if (message?.trim()) {
    return message.trim();
  }

  // =========================================
  // 3. 都没有 → 使用 code 查 status
  // =========================================
  const statusKey = i18nPrefix + `status.${code}`;
  if (i18n.exists(statusKey)) {
    return i18n.t(statusKey);
  }

  // =========================================
  // 4. 全部失败 → 兜底
  // =========================================
  return i18n.t(i18nPrefix + `fallback.reason}`);
}
