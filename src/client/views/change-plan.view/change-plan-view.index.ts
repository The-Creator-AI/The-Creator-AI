import { moduleConfig } from "@/client/modules/plan.module/plan.module";
import { ServerPostMessageManager } from "@/common/ipc/server-ipc";
import { VIEW_TYPES } from "@/common/view-types";

export const viewConfig = {
  entry: "changePlanView.js",
  type: VIEW_TYPES.SIDEBAR.CHANGE_PLAN,
  handleMessage: (serverIpc: ServerPostMessageManager) => {
    moduleConfig.controllers.forEach((controller) => {
      controller(serverIpc);
    });
  },
};
