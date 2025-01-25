import { VIEW_TYPES } from "@/common/view-types";
import { handleFileExplorerViewMessages } from "./file-explorer-view";

export const viewConfig = {
  entry: "fileExplorerView.js",
  type: VIEW_TYPES.SIDEBAR.FILE_EXPLORER,
  handleMessage: handleFileExplorerViewMessages,
};
