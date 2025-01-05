import * as vscode from "vscode";
import { sendWorkspaceFiles } from "./sendWorkspaceFiles";
import { ServerPostMessageManager } from "../../../ipc/server-ipc";

/**
 * Sets up the file system watcher to listen for file changes and update the workspace files.
 */
let fileSystemWatcher: vscode.FileSystemWatcher | undefined;
export function setupFileSystemWatcher(serverIpc: ServerPostMessageManager) {
  if (fileSystemWatcher) {
    fileSystemWatcher.dispose();
  }

  fileSystemWatcher = vscode.workspace.createFileSystemWatcher("**/*");

  fileSystemWatcher.onDidCreate(() => sendWorkspaceFiles(serverIpc));
  fileSystemWatcher.onDidDelete(() => sendWorkspaceFiles(serverIpc));
  fileSystemWatcher.onDidChange(() => sendWorkspaceFiles(serverIpc));
}
