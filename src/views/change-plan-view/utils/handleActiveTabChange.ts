import * as vscode from "vscode";
import { ServerPostMessageManager } from "../../../ipc/server-ipc";
import { remoteSetChangePlanViewState } from "./remoteSetChangePlanViewState";

/**
 * Handles active tab changes in VS Code and sends the active file path to the server.
 *
 * @param serverIpc - The server IPC instance used to send messages to the server.
 */
export const handleActiveTabChange = (serverIpc: ServerPostMessageManager) => {
  remoteSetChangePlanViewState(
    serverIpc,
    "activeTab",
    vscode.window.activeTextEditor?.document.fileName
  );
  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (editor) {
      remoteSetChangePlanViewState(
        serverIpc,
        "activeTab",
        editor.document.fileName
      );
    }
  });
};
