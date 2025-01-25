import { getChangePlanViewHtml } from "./change-plan-view/getChangePlanViewHtml";
import { handleChangePlanViewMessages } from "./change-plan-view/handleChangePlanViewMessages";
import { getChatViewHtml, handleChatViewMessages } from "./chat-view/chat-view";
import {
  getFileExplorerViewHtml,
  handleFileExplorerViewMessages,
} from "./file-explorer-view/file-explorer-view";
import { VIEW_TYPES } from "@/common/view-types";

export const views = [
  {
    type: VIEW_TYPES.SIDEBAR.CHAT,
    getHtml: getChatViewHtml,
    handleMessage: handleChatViewMessages,
  },
  {
    type: VIEW_TYPES.SIDEBAR.FILE_EXPLORER,
    getHtml: getFileExplorerViewHtml,
    handleMessage: handleFileExplorerViewMessages,
  },
  {
    type: VIEW_TYPES.SIDEBAR.CHANGE_PLAN,
    getHtml: getChangePlanViewHtml,
    handleMessage: handleChangePlanViewMessages,
  },
];
