import { createAdminPortalServiceClient } from "@/api/generated/admin/service/v1";
import { requestApi } from "@/core/transport/rest";

let _instance: ReturnType<typeof createAdminPortalServiceClient> | null = null;

export function getAdminPortalService() {
  if (!_instance) {
    _instance = createAdminPortalServiceClient(requestApi);
  }
  return _instance;
}

export async function getNavigation() {
  return getAdminPortalService().GetNavigation({});
}

export async function getMyPermissionCode() {
  return getAdminPortalService().GetMyPermissionCode({});
}

export async function getInitialContext() {
  return getAdminPortalService().GetInitialContext({});
}
