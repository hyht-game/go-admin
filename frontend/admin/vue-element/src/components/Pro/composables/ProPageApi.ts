import type { Ref } from "vue";
import type { ProPageConfig } from "../ProPage/types";

/**
 * ProPage 组件暴露的实例方法
 */
export interface ProPageExpose {
  refresh: () => void;
  tableRef: any;
  tableState: {
    data: Ref<any[]>;
    loading: Ref<boolean>;
    pagination: {
      currentPage: number;
      pageSize: number;
      total: number;
      pageSizes: number[];
      background: boolean;
    };
    selection: Ref<any[]>;
    fetch: (params?: any, resetPage?: boolean) => Promise<void>;
    handleSelectionChange: (rows: any[]) => void;
    getSelectionIds: () => any[];
  };
  modalState: {
    visible: Ref<boolean>;
    mode: Ref<"add" | "edit" | "view">;
    formData: Record<string, any>;
    open: (mode: "add" | "edit" | "view", row?: any) => void;
  };
  searchParams: Record<string, any>;
}

/**
 * ProPage 外部可操作的状态
 */
export interface ProPageState<T = any, Q = any> {
  /** 页面配置 */
  config?: ProPageConfig<T, Q>;
  /** 搜索参数（只读快照） */
  searchParams?: Record<string, any>;
}

/**
 * ProPage Api —— 命令式控制 ProPage 实例
 *
 * 参考 plugins/vxe-table/api.ts 的 VxeGridApi 设计，
 * 提供外部命令式控制能力，用于 Level 2 使用模式。
 */
export class ProPageApi {
  private isMounted = false;
  private pageExpose: ProPageExpose | null = null;

  /** 获取当前配置引用 */
  get config(): ProPageConfig | undefined {
    return this._config;
  }
  private _config: ProPageConfig | undefined;

  constructor(config?: ProPageConfig) {
    this._config = config;
  }

  /**
   * 由 ProPage 组件 mount 时调用
   */
  mount(expose: ProPageExpose) {
    if (!this.isMounted && expose) {
      this.pageExpose = expose;
      this.isMounted = true;
    }
  }

  /**
   * 由 ProPage 组件 unmount 时调用
   */
  unmount() {
    this.isMounted = false;
    this.pageExpose = null;
  }

  // ==================== 数据操作 ====================

  /** 刷新当前页数据 */
  refresh() {
    this.pageExpose?.refresh();
  }

  /** 重新查询（重置到第 1 页） */
  reload(params?: Record<string, any>) {
    if (!this.pageExpose) return;
    if (params) {
      Object.assign(this.pageExpose.searchParams, params);
    }
    this.pageExpose.tableState.fetch(this.pageExpose.searchParams, true);
  }

  /** 追加查询参数并刷新 */
  query(params: Record<string, any>) {
    if (!this.pageExpose) return;
    Object.assign(this.pageExpose.searchParams, params);
    this.pageExpose.tableState.fetch(this.pageExpose.searchParams);
  }

  // ==================== 表格操作 ====================

  /** 获取表格数据 */
  getData(): any[] {
    return this.pageExpose?.tableState.data.value ?? [];
  }

  /** 获取选中行 */
  getSelection(): any[] {
    return this.pageExpose?.tableState.selection.value ?? [];
  }

  /** 获取选中行 ID */
  getSelectionIds(): any[] {
    return this.pageExpose?.tableState.getSelectionIds() ?? [];
  }

  /** 清空选中 */
  clearSelection() {
    this.pageExpose?.tableState.handleSelectionChange([]);
    this.pageExpose?.tableRef?.clearSelection?.();
  }

  /** 获取 loading 状态 */
  isLoading(): boolean {
    return this.pageExpose?.tableState.loading.value ?? false;
  }

  /** 获取分页信息 */
  getPagination(): {
    currentPage: number;
    pageSize: number;
    total: number;
  } {
    const p = this.pageExpose?.tableState.pagination;
    return {
      currentPage: p?.currentPage ?? 1,
      pageSize: p?.pageSize ?? 20,
      total: p?.total ?? 0,
    };
  }

  // ==================== 弹窗操作 ====================

  /** 打开新增弹窗 */
  openAdd() {
    this.pageExpose?.modalState.open("add");
  }

  /** 打开编辑弹窗 */
  openEdit(row: any) {
    this.pageExpose?.modalState.open("edit", row);
  }

  /** 打开查看弹窗 */
  openView(row: any) {
    this.pageExpose?.modalState.open("view", row);
  }

  /** 关闭弹窗 */
  closeModal() {
    if (this.pageExpose) {
      this.pageExpose.modalState.visible.value = false;
    }
  }

  // ==================== 搜索操作 ====================

  /** 获取当前搜索参数 */
  getSearchParams(): Record<string, any> {
    return { ...(this.pageExpose?.searchParams ?? {}) };
  }

  // ==================== 内部方法 ====================

  /** 更新配置（响应式更新） */
  setConfig(config: ProPageConfig) {
    this._config = config;
  }
}
