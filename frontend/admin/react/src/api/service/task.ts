import {
  createTaskServiceClient,
  type taskservicev1_CreateTaskRequest,
  type taskservicev1_DeleteTaskRequest,
  type taskservicev1_GetTaskRequest,
  type taskservicev1_UpdateTaskRequest,
} from '@/api/generated/admin/service/v1';
import { type PaginationQuery, requestApi, requestClient } from '@/core';

let _instance: ReturnType<typeof createTaskServiceClient> | null = null;

export function getTaskService() {
  if (!_instance) {
    _instance = createTaskServiceClient(requestApi);
  }
  return _instance;
}

export async function listTasks(query: PaginationQuery) {
  const params = query.toRawParams();
  return getTaskService().List(params);
}

export async function getTask(request: taskservicev1_GetTaskRequest) {
  return getTaskService().Get(request);
}

export async function createTask(request: taskservicev1_CreateTaskRequest) {
  return getTaskService().Create(request);
}

export async function updateTask(request: taskservicev1_UpdateTaskRequest) {
  return getTaskService().Update(request);
}

export async function deleteTask(request: taskservicev1_DeleteTaskRequest) {
  return getTaskService().Delete(request);
}

/** 获取任务类型名称列表 */
export async function listTaskTypeNames() {
  return requestClient.get<{ typeNames: string[] }>('/admin/v1/task/type-names');
}

/** 控制单个任务（Start/Stop/Restart） */
export async function controlTask(typeName: string, controlType: string) {
  return requestClient.post('/admin/v1/task/control', {
    typeName,
    controlType,
  });
}

/** 启动所有任务 */
export async function startAllTasks() {
  return requestClient.post('/admin/v1/task/start-all');
}

/** 停止所有任务 */
export async function stopAllTasks() {
  return requestClient.post('/admin/v1/task/stop-all');
}

/** 重启所有任务 */
export async function restartAllTasks() {
  return requestClient.post('/admin/v1/task/restart-all');
}
