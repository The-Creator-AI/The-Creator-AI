import { VIEW_TYPES } from "@/common/view-types";
import { onMessage } from "./on-mesage";

export const viewConfig = {
  entry: "changePlanView.js",
  type: VIEW_TYPES.SIDEBAR.CHANGE_PLAN,
  handleMessage: onMessage,
};
