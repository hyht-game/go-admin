<template>
  <div v-show="visible" class="pro-search">
    <ElCard v-bind="cardAttrs" class="pro-search__card" shadow="never">
      <ElForm
        ref="formRef"
        :model="queryParams"
        :inline="inline"
        v-bind="formAttrs"
        :class="formClass"
      >
        <template v-for="field in visibleFields" :key="field.field">
          <ElFormItem
            :label="field.label"
            :prop="String(field.field)"
            :class="{ 'pro-search__item--stretch': grid }"
          >
            <template #label>
              <span class="flex items-center gap-1">
                {{ field.label }}
                <ElTooltip
                  v-if="field.tips"
                  :content="typeof field.tips === 'string' ? field.tips : ''"
                  placement="top"
                >
                  <ElIcon class="text-gray-400"><QuestionFilled /></ElIcon>
                </ElTooltip>
                <span v-if="colon" class="ml-0.5">:</span>
              </span>
            </template>

            <!-- 自定义插槽 -->
            <slot
              v-if="field.slotName || field.type === 'custom'"
              :name="field.slotName ?? field.field"
              :model="queryParams"
              :field="field.field"
              :attrs="{ style: { width: '100%' }, ...field.attrs }"
            />

            <!-- api-tree-select -->
            <ElTreeSelect
              v-else-if="field.type === 'api-tree-select'"
              v-model="queryParams[field.field]"
              v-bind="{ style: { width: '100%' }, clearable: true, ...field.attrs }"
            />

            <!-- 动态组件 -->
            <component
              :is="resolveComponent(field.type)"
              v-else
              v-model="queryParams[field.field]"
              v-bind="{ style: { width: '100%' }, clearable: true, ...field.attrs }"
              @keyup.enter="handleSearch"
            >
              <template v-if="['select', 'radio', 'checkbox'].includes(field.type ?? '')">
                <component
                  :is="
                    field.type === 'select'
                      ? ElOption
                      : field.type === 'radio'
                        ? ElRadio
                        : ElCheckbox
                  "
                  v-for="opt in field.options"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                  :disabled="opt.disabled"
                />
              </template>
            </component>
          </ElFormItem>
        </template>

        <!-- 按钮区域 -->
        <ElFormItem :class="buttonClass">
          <ElButton
            v-if="showSearchButton"
            type="primary"
            :icon="Search"
            :loading="searching"
            @click="handleSearch"
          >
            {{ searchButtonText }}
          </ElButton>

          <ElButton v-if="showResetButton" :icon="Refresh" @click="handleReset">
            {{ resetButtonText }}
          </ElButton>

          <!-- 展开/收起 -->
          <ElLink
            v-if="isExpandable && hasHiddenFields"
            type="primary"
            class="ml-2"
            @click="toggleExpand"
          >
            {{ expanded ? "收起" : "展开" }}
            <ElIcon class="ml-1">
              <component :is="expanded ? ArrowUp : ArrowDown" />
            </ElIcon>
          </ElLink>
        </ElFormItem>
      </ElForm>
    </ElCard>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { computed, ref, reactive, onMounted, markRaw, h } from "vue";
import {
  ElCard,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElSelect,
  ElOption,
  ElRadio,
  ElCheckbox,
  ElCascader,
  ElTreeSelect,
  ElDatePicker,
  ElTimePicker,
  ElTimeSelect,
  ElButton,
  ElLink,
  ElIcon,
  ElTooltip,
} from "element-plus";
import { Search, Refresh, ArrowUp, ArrowDown, QuestionFilled } from "@element-plus/icons-vue";
import InputTag from "@/components/InputTag/index.vue";
import type { ProSearchConfig, ProSearchEmits } from "./types";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<ProSearchConfig<T>>(), {
  colon: false,
  inline: true,
  isExpandable: true,
  showNumber: 3,
  showSearchButton: true,
  showResetButton: true,
  searchButtonText: "搜索",
  resetButtonText: "重置",
});

const emit = defineEmits<ProSearchEmits<T>>();

const formRef = ref<InstanceType<typeof ElForm>>();
const queryParams = reactive<Record<string, any>>({});
const expanded = ref(false);
const searching = ref(false);
const visible = ref(true);

// 计算可见字段（处理展开/收起）
const visibleFields = computed(() => {
  if (!props.isExpandable || !expanded.value) {
    return props.fields.slice(0, props.showNumber);
  }
  return props.fields;
});

const hasHiddenFields = computed(() => props.fields.length > props.showNumber);

// 卡片属性
const cardAttrs = computed(() => ({
  shadow: "never",
  bodyStyle: { padding: "16px" },
  ...props.cardAttrs,
}));

// 表单属性
const formAttrs = computed<Record<string, any>>(() => ({
  labelPosition: "right" as const,
  labelWidth: "auto",
  size: "default",
  ...props.form,
}));

// 表单 class
const formClass = computed(() => ({
  "pro-search__form--grid": props.grid,
  "pro-search__form--flex": !props.grid,
  "pro-search__form--inline": props.inline,
}));

// 按钮 class
const buttonClass = computed(() => ({
  "pro-search__buttons": true,
  "pro-search__buttons--grid": props.grid === true || props.grid === "right",
  "pro-search__buttons--left": props.grid === "left",
  "pro-search__buttons--right": props.grid === "right",
}));

// 动态解析组件
const resolveComponent = (type?: string) => {
  const map: Record<string, any> = {
    input: markRaw(ElInput),
    select: markRaw(ElSelect),
    "input-number": markRaw(ElInputNumber),
    "date-picker": markRaw(ElDatePicker),
    "time-picker": markRaw(ElTimePicker),
    "time-select": markRaw(ElTimeSelect),
    cascader: markRaw(ElCascader),
    "tree-select": markRaw(ElTreeSelect),
    "input-tag": markRaw(InputTag),
    "custom-tag": markRaw(InputTag),
    date: markRaw(ElDatePicker),
    datetime: () => h(ElDatePicker, { type: "datetime" }),
    daterange: () => h(ElDatePicker, { type: "daterange" }),
    number: markRaw(ElInputNumber),
  };
  return map[type ?? "input"] || ElInput;
};

// 搜索
async function handleSearch() {
  try {
    searching.value = true;
    // 过滤空值
    const params = {} as Record<string, any>;
    Object.keys(queryParams).forEach((key) => {
      const val = queryParams[key];
      if (val !== "" && val !== null && val !== undefined) {
        params[key] = val;
      }
    });
    emit("search", params as T);
  } finally {
    searching.value = false;
  }
}

// 重置
function handleReset() {
  formRef.value?.resetFields();
  // 恢复初始值
  props.fields.forEach((field) => {
    if (field.initialValue !== undefined) {
      (queryParams as any)[field.field] = field.initialValue;
    }
  });
  emit("reset", { ...queryParams } as T);
}

// 展开/收起
function toggleExpand() {
  expanded.value = !expanded.value;
  emit("expand", expanded.value);
}

// 初始化
onMounted(() => {
  props.fields.forEach((field) => {
    if (field.initFn) field.initFn(field as any);
    // api-tree-select: 异步加载数据
    if (field.type === "api-tree-select" && typeof field.api === "function") {
      field.api().then((data) => {
        if (!field.attrs) field.attrs = {};
        field.attrs.data = data;
      });
    }
    // 初始值
    if (["input-tag", "custom-tag", "cascader"].includes(field.type ?? "")) {
      (queryParams as any)[field.field] = Array.isArray(field.initialValue)
        ? field.initialValue
        : [];
    } else if (field.type === "input-number" || field.type === "number") {
      (queryParams as any)[field.field] = field.initialValue ?? null;
    } else {
      (queryParams as any)[field.field] = field.initialValue ?? "";
    }
  });
});

// 暴露方法
defineExpose({
  queryParams,
  formRef,
  visible,
  expanded,
  toggleVisible: () => {
    visible.value = !visible.value;
  },
  toggleExpand,
  reset: handleReset,
  search: handleSearch,
  setQueryParams: (params: Partial<T>) => {
    Object.assign(queryParams, params);
  },
});
</script>

<style scoped lang="scss">
.pro-search {
  &__card {
    margin-bottom: 12px;
  }

  &__form {
    &--grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    &--flex {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }

    &--inline {
      :deep(.el-form-item) {
        margin-bottom: 16px;
      }
    }

    &--stretch {
      :deep(.el-form-item__content) {
        flex: 1;
        min-width: 0;
      }
    }
  }

  &__buttons {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 0;

    &--grid {
      grid-column: -1;
      justify-self: end;
    }

    &--left {
      justify-content: flex-start;
    }

    &--right {
      justify-content: flex-end;
      margin-left: auto;
    }
  }
}
</style>
