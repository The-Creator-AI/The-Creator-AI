import { VIEW_TYPES } from "@/common/view-types";
import { controller } from "./chat-view.controller";

export const viewConfig = {
  entry: "chatView.js",
  type: VIEW_TYPES.SIDEBAR.CHAT,
  handleMessage: controller,
};
