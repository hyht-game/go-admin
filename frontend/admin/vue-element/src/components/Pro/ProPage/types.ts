import type { DialogProps, DrawerProps } from "element-plus";
import type { ProFormField } from "../ProForm/types";
import type { ProTableColumn } from "../ProTable/types";

// 工具栏按钮类型
export type ToolbarLeft = "add" | "delete" | "import" | "export";
export type ToolbarRight = "refresh" | "filter" | "search" | "imports" | "exports";

export interface ToolsButton {
  name: string;
  text?: string;
  textKey?: string;
  perm?: string | string[];
  attrs?: Record<string, any>;
  render?: (row: Record<string, any>) => boolean;
}

// 请求函数类型
export type IndexAction<TItem = any, TQuery = any> = (
  queryParams: TQuery
) => Promise<{ items: TItem[]; total: number } | TItem[]>;

export interface ProPageConfig<T = any, Q = any> {
  // 权限前缀
  permPrefix?: string;
  // 主键名(默认id)
  pk?: string;

  // === 搜索配置 ===
  search?: {
    formItems?: ProFormField[];
    isExpandable?: boolean;
    showNumber?: number;
    colon?: boolean;
    grid?: boolean | "left" | "right";
  };

  // === 表格配置 ===
  table: {
    columns: ProTableColumn<T>[];
    table?: Record<string, any>;
    pagination?: boolean;
    toolbar?: Array<ToolbarLeft | ToolsButton>;
    toolbarRight?: Array<ToolbarLeft | ToolsButton>;
    defaultToolbar?: Array<ToolbarRight | ToolsButton>;
    // 请求函数
    indexAction: IndexAction<T, Q>;
    // 请求参数名
    request?: { pageName: string; limitName: string };
    // 修改属性
    modifyAction?: (data: { [key: string]: any; field: string; value: any }) => Promise<any>;
    // 删除
    deleteAction?: (ids: string) => Promise<any>;
    // 导出
    exportAction?: (queryParams: Q) => Promise<any>;
    // 导入
    importAction?: (file: File) => Promise<any>;
    // 导入模板
    importTemplate?: string | (() => Promise<any>);
  };

  // === 弹窗配置 ===
  modal?: {
    component?: "dialog" | "drawer";
    dialog?: Partial<Omit<DialogProps, "modelValue">>;
    drawer?: Partial<Omit<DrawerProps, "modelValue">>;
    form?: Record<string, any>;
    colon?: boolean;
    formItems: ProFormField<T>[];
    beforeSubmit?: (data: T) => void;
    formAction?: (data: T) => Promise<any>;
  };
}
