import { VIEW_TYPES } from "@/common/view-types";
import { handleChangePlanViewMessages } from "./handleChangePlanViewMessages";

export const viewConfig = {
  entry: "changePlanView.js",
  type: VIEW_TYPES.SIDEBAR.CHANGE_PLAN,
  handleMessage: handleChangePlanViewMessages,
};
