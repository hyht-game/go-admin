import { Suspense, lazy, type ComponentType } from 'react';
import PageSkeleton from '@/layouts/components/LoadingSkeleton/presets/PageSkeleton';

/**
 * 创建懒加载路由元素
 * 自动包裹 Suspense + 骨架屏 fallback
 *
 * @param loader Vite 动态导入函数，如 () => import('@/pages/dashboard')
 * @returns 可直接赋值给 route.element 的 ReactNode
 */
export const createLazyRoute = (loader: () => Promise<{ default: ComponentType<any> }>) => {
  const LazyComponent = lazy(loader);

  return (
    <Suspense fallback={<PageSkeleton delay={100} />}>
      <LazyComponent />
    </Suspense>
  );
};
