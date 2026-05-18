<template>
  <div class="app-container h-full flex flex-1 flex-col">
    <!-- 搜索 -->
    <PageSearch
      ref="searchRef"
      :search-config="searchConfig"
      @query-click="handleQueryClick"
      @reset-click="handleResetClick"
    />

    <!-- 列表 -->
    <PageContent
      ref="contentRef"
      :content-config="contentConfig"
      @add-click="handleAddClick"
      @operate-click="handleOperateClick"
    >
      <!-- 类型 -->
      <template #type="{ row }">
        <ElTag :color="tenantTypeToColor(row.type)">
          {{ tenantTypeToName(row.type) }}
        </ElTag>
      </template>

      <!-- 审核状态 -->
      <template #auditStatus="{ row }">
        <ElTag :color="tenantAuditStatusToColor(row.auditStatus)">
          {{ tenantAuditStatusToName(row.auditStatus) }}
        </ElTag>
      </template>

      <!-- 状态 -->
      <template #status="{ row }">
        <ElTag :color="tenantStatusToColor(row.status)">
          {{ tenantStatusToName(row.status) }}
        </ElTag>
      </template>
    </PageContent>

    <!-- 新增/编辑弹窗 -->
    <TenantDrawer ref="drawerRef" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" setup>
import { ElTag, ElMessage, ElMessageBox } from "element-plus";

import PageContent from "@/components/CURD/PageContent.vue";
import PageSearch from "@/components/CURD/PageSearch.vue";
import usePage from "@/components/CURD/usePage";
import type { IOperateData } from "@/components/CURD/types";
import TenantDrawer from "./tenant-drawer.vue";

import {
  tenantAuditStatusList,
  tenantAuditStatusToColor,
  tenantAuditStatusToName,
  tenantStatusList,
  tenantStatusToColor,
  tenantStatusToName,
  tenantTypeList,
  tenantTypeToColor,
  tenantTypeToName,
  useTenantStore,
} from "@/stores";
import { $t } from "@/i18n";

const tenantStore = useTenantStore();

// 使用 CURD hook
const { searchRef, contentRef, handleQueryClick, handleResetClick } = usePage();

// 抽屉引用
const drawerRef = ref();

// 搜索配置
const searchConfig = {
  formItems: [
    {
      type: "input",
      label: $t("routes.tenant.name"),
      prop: "name",
      attrs: {
        placeholder: $t("ui.placeholder.input"),
        clearable: true,
      },
    },
    {
      type: "input",
      label: $t("routes.tenant.code"),
      prop: "code",
      attrs: {
        placeholder: $t("ui.placeholder.input"),
        clearable: true,
      },
    },
    {
      type: "select",
      label: $t("routes.tenant.type"),
      prop: "type",
      attrs: {
        placeholder: $t("ui.placeholder.select"),
        clearable: true,
      },
      options: tenantTypeList,
    },
    {
      type: "select",
      label: $t("routes.tenant.auditStatus"),
      prop: "auditStatus",
      attrs: {
        placeholder: $t("ui.placeholder.select"),
        clearable: true,
      },
      options: tenantAuditStatusList,
    },
    {
      type: "select",
      label: $t("ui.table.status"),
      prop: "status",
      attrs: {
        placeholder: $t("ui.placeholder.select"),
        clearable: true,
      },
      options: tenantStatusList,
    },
  ],
};

// 表格配置
const contentConfig = {
  table: {
    border: true,
    stripe: false,
  },
  indexAction: (query: any) => {
    return tenantStore.listTenant(
      {
        page: query.page || 1,
        pageSize: query.pageSize || 10,
      },
      query
    );
  },
  props: {
    list: "items",
    total: "total",
  },
  columns: [
    { type: "index", label: $t("ui.table.seq"), width: 60 },
    { prop: "name", label: $t("routes.tenant.name"), minWidth: 120 },
    { prop: "code", label: $t("routes.tenant.code"), minWidth: 120 },
    { prop: "adminUserName", label: $t("routes.tenant.adminUserName"), minWidth: 120 },
    {
      prop: "type",
      label: $t("routes.tenant.type"),
      minWidth: 100,
      slotName: "type",
    },
    {
      prop: "auditStatus",
      label: $t("routes.tenant.auditStatus"),
      minWidth: 100,
      slotName: "auditStatus",
    },
    {
      prop: "status",
      label: $t("ui.table.status"),
      minWidth: 100,
      slotName: "status",
    },
    {
      prop: "createdAt",
      label: $t("ui.table.createdAt"),
      minWidth: 160,
      formatter: (row: any) => {
        if (!row.createdAt) return "";
        return new Date(row.createdAt).toLocaleString("zh-CN");
      },
    },
    { prop: "remark", label: $t("ui.table.remark"), minWidth: 150 },
    {
      label: $t("ui.table.action"),
      fixed: "right",
      width: 150,
      operat: [
        {
          name: "edit",
          text: $t("ui.button.edit"),
        },
        {
          name: "delete",
          text: $t("ui.button.delete"),
          attrs: {
            type: "danger",
          },
        },
      ],
    },
  ],
};

// 处理操作点击
const handleOperateClick = (data: IOperateData) => {
  const { name, row } = data;

  if (name === "edit") {
    // 编辑
    drawerRef.value?.open(row);
  } else if (name === "delete") {
    // 删除
    ElMessageBox.confirm(
      $t("ui.text.do_you_want_delete", { moduleName: $t("routes.tenant.moduleName") }),
      $t("ui.title.confirm"),
      {
        confirmButtonText: $t("common.confirm"),
        cancelButtonText: $t("common.cancel"),
        type: "warning",
      }
    ).then(async () => {
      try {
        await tenantStore.deleteTenant(row.id);
        ElMessage.success($t("ui.notification.delete_success"));
        contentRef.value?.fetchPageData({}, true);
      } catch {
        ElMessage.error($t("ui.notification.delete_failed"));
      }
    });
  }
};

// 处理新增点击
const handleAddClick = () => {
  drawerRef.value?.open();
};

// 处理成功回调
const handleSuccess = () => {
  contentRef.value?.fetchPageData({}, true);
};
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}
</style>
