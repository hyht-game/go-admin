import type { ColProps, FormItemRule } from "element-plus";

export type FormValueType =
  | "input"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "switch"
  | "date-picker"
  | "time-picker"
  | "time-select"
  | "input-number"
  | "cascader"
  | "tree-select"
  | "api-tree-select"
  | "input-tag"
  | "custom-tag"
  | "icon-select"
  | "number"
  | "date"
  | "custom";

export interface ProFormField<T = any> {
  // 组件类型
  type?: FormValueType;
  // 标签文本
  label: string;
  // 键名
  field: keyof T & string;
  // 标签提示
  tips?: string | Record<string, any>;
  // 组件属性
  attrs?: Record<string, any>;
  // 组件可选项(select/radio/checkbox)
  options?: { label: string; value: any; [key: string]: any }[];
  // 验证规则
  rules?: FormItemRule[];
  // 初始值
  initialValue?: any;
  // 插槽名(自定义组件)
  slotName?: string;
  // 是否隐藏
  hidden?: boolean;
  // layout Col 属性
  span?: number;
  col?: Partial<ColProps>;
  // 组件事件
  events?: Record<string, (...args: any) => void>;
  // 初始化数据函数
  initFn?: (item: Record<string, any>) => void;
  // 异步加载数据函数(api-tree-select)
  api?: () => Promise<any[]>;
}
