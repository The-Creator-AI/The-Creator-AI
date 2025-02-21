import { VIEW_TYPES } from "@/common/view-types";
import { controller } from "./file-explorer.controller";

export const viewConfig = {
  entry: "fileExplorerView.js",
  type: VIEW_TYPES.SIDEBAR.FILE_EXPLORER,
  handleMessage: controller,
};
