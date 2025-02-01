import { VIEW_TYPES } from "@/common/view-types";
import { onMessage } from "../../modules/plan.module/plan.controller";

export const viewConfig = {
  entry: "changePlanView.js",
  type: VIEW_TYPES.SIDEBAR.CHANGE_PLAN,
  handleMessage: onMessage,
};
