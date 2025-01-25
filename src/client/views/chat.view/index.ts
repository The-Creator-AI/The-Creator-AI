import { VIEW_TYPES } from "@/common/view-types";
import { onMessage } from "./on-mesage";

export const viewConfig = {
  entry: "chatView.js",
  type: VIEW_TYPES.SIDEBAR.CHAT,
  handleMessage: onMessage,
};
