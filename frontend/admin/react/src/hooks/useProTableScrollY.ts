import { useState, useEffect, useRef, useCallback, type RefObject } from 'react';

/**
 * 基于容器实际 DOM 尺寸动态计算 ProTable 的 scroll.y 值
 *
 * 测量策略（精确方案）：
 *   使用 getBoundingClientRect 精确测量 .ant-table-body 上下方占用的空间，
 *   自动包含 margin/padding/border 等所有间距，无需逐个测量组件。
 *
 *   scroll.y = 容器高度 - 表体上方空间 - 表体下方空间 - 安全边距
 *
 * 优势：
 *   - 自动包含所有 margin，不受 ProTable 内部间距影响
 *   - 不需要知道 ProTable 的 DOM 结构细节
 *   - ResizeObserver + MutationObserver 实时响应变化
 *
 * @param containerRef - .page-container-content 容器 div 的 ref
 * @param options.buffer - 安全边距（像素），默认 4
 * @param options.minHeight - scroll.y 最小值，默认 200
 */
export function useProTableScrollY(
  containerRef: RefObject<HTMLElement | null>,
  options: {
    buffer?: number;
    minHeight?: number;
  } = {},
): string {
  const { buffer = 4, minHeight = 200 } = options;

  const [scrollY, setScrollY] = useState<string>('auto');

  const measureRef = useRef<(container: HTMLElement) => void>();

  const measureCallback = useCallback(
    (container: HTMLElement) => {
      const containerHeight = container.clientHeight;
      if (containerHeight <= 0) return;

      // 查找 .ant-table-body（scroll.y 设置后 antd 会创建此元素）
      const tableBody = container.querySelector('.ant-table-body');
      if (!tableBody) return;

      const containerRect = container.getBoundingClientRect();
      const bodyRect = tableBody.getBoundingClientRect();

      // 表体上方空间（搜索表单 + 工具栏 + 表头 + 所有 margin）
      const aboveSpace = bodyRect.top - containerRect.top;

      // 表体下方空间（分页器 + 所有 margin）
      // 如果分页器被 overflow:hidden 截断，用直接测量法
      const pagination = container.querySelector('.ant-pagination');
      let belowSpace: number;
      if (pagination) {
        const pagStyle = getComputedStyle(pagination);
        const pagMarginTop = parseFloat(pagStyle.marginTop) || 0;
        const pagMarginBottom = parseFloat(pagStyle.marginBottom) || 0;
        belowSpace = pagination.offsetHeight + pagMarginTop + pagMarginBottom;
      } else {
        // 分页器可能还没渲染，用容器底部到表体底部的距离
        belowSpace = containerRect.bottom - bodyRect.bottom;
        if (belowSpace < 0) belowSpace = 0;
      }

      const available = containerHeight - aboveSpace - belowSpace - buffer;
      const result = Math.max(available, minHeight);

      setScrollY(`${result}px`);
    },
    [buffer, minHeight],
  );

  measureRef.current = measureCallback;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => measureRef.current?.(container);

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(measure);
    });

    const mutationObserver = new MutationObserver(() => {
      requestAnimationFrame(measure);
    });

    // 首次测量：多次重试，确保 ProTable 完全渲染
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(measure);
    });

    const timers = [
      setTimeout(measure, 100),
      setTimeout(measure, 300),
      setTimeout(measure, 600),
      setTimeout(measure, 1200),
    ];

    resizeObserver.observe(container);
    mutationObserver.observe(container, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(rafId);
      timers.forEach(clearTimeout);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [containerRef]);

  return scrollY;
}
