import { VIEW_TYPES } from "@/common/view-types";
import { onMessage } from "./on-mesage";

export const viewConfig = {
  entry: "fileExplorerView.js",
  type: VIEW_TYPES.SIDEBAR.FILE_EXPLORER,
  handleMessage: onMessage,
};
