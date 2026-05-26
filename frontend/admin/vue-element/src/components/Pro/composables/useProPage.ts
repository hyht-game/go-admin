import { defineComponent, h, onBeforeUnmount } from "vue";
import type { ProPageConfig } from "../ProPage/types";
import { ProPageApi } from "./ProPageApi";
import ProPage from "../ProPage/index.vue";

/**
 * useProPage —— Level 2：命令式 Api 控制模式
 *
 * 参考 plugins/vxe-table/use-vxe-grid.ts 的 useVxeGrid 设计。
 * 返回 [ProPageComponent, api]，通过 api 命令式控制 ProPage 实例。
 *
 * @example
 * ```ts
 * const [Page, pageApi] = useProPage(pageConfig);
 *
 * // 命令式操作
 * pageApi.refresh();
 * pageApi.openAdd();
 * pageApi.reload({ status: 1 });
 * ```
 *
 * @param config - ProPage 配置对象
 * @returns [ProPage 组件, ProPageApi 实例]
 */
export function useProPage<T = any, Q = any>(config: ProPageConfig<T, Q>) {
  const api = new ProPageApi(config);

  // 创建包装组件，自动注入 api 并处理生命周期
  const Page = defineComponent(
    (props: { config?: ProPageConfig<T, Q> }, { attrs, slots }) => {
      onBeforeUnmount(() => {
        api.unmount();
      });

      // 支持运行时覆盖配置
      const mergedConfig = props.config ?? config;

      return () =>
        h(
          ProPage as any,
          {
            ...attrs,
            config: mergedConfig,
            ref: (el: any) => {
              if (el) {
                api.mount(el as any);
              }
            },
          } as any,
          slots as any,
        ) as any;
    },
    {
      name: "ProPageWrapper",
      inheritAttrs: false,
    },
  );

  return [Page, api] as const;
}

export type UseProPage = typeof useProPage;
