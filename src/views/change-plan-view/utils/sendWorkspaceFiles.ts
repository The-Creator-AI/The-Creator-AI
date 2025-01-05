import { ServerToClientChannel } from "../../../ipc/channels.enum";
import { ServerPostMessageManager } from "../../../ipc/server-ipc";
import { createFileTree, getFilesRespectingGitignore } from "../../../backend/services/workspace-files.utils";
import * as vscode from "vscode";

/**
 * Sends the workspace file tree to the client.
 */
export async function sendWorkspaceFiles(serverIpc: ServerPostMessageManager) {
  const workspaceRoots =
    vscode.workspace.workspaceFolders?.map((folder) => folder.uri) || [];
  const files = await getFilesRespectingGitignore();
  const workspaceFileTree = createFileTree(workspaceRoots, files);

  serverIpc.sendToClient(ServerToClientChannel.SendWorkspaceFiles, {
    files: workspaceFileTree,
  });
}
