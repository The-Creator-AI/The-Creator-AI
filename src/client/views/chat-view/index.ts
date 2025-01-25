import { VIEW_TYPES } from "@/common/view-types";
import { handleChatViewMessages } from "./chat-view";

export const viewConfig = {
  entry: "chatView.js",
  type: VIEW_TYPES.SIDEBAR.CHAT,
  handleMessage: handleChatViewMessages,
};
