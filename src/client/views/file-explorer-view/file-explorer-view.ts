import * as vscode from "vscode";
import { ServerPostMessageManager } from "@/common/ipc/server-ipc";
import {
  ClientToServerChannel,
  ServerToClientChannel,
} from "@/common/ipc/channels.enum";
import { createFileTree, getFilesRespectingGitignore } from "@/backend/services/workspace-files.utils";

// Function to get HTML for file explorer view
export function getFileExplorerViewHtml(
  webview: vscode.Webview,
  nonce: string,
  extensionUri: vscode.Uri
): string {
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "dist", "fileExplorerView.js")
  );

  // HTML for the view
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>File Explorer</title>
  </head>
  <body>
      <div id="file-explorer-root"></div>
      <script nonce="${nonce}" src="${scriptUri}"></script>
  </body>
  </html>`;
}

// Function to handle messages for the file explorer view
export function handleFileExplorerViewMessages(
  serverIpc: ServerPostMessageManager
) {
  serverIpc.onClientMessage(
    ClientToServerChannel.RequestWorkspaceFiles,
    async (data) => {
      const workspaceRoots =
      vscode.workspace.workspaceFolders?.map((folder) => folder.uri) || [];
      const files = await getFilesRespectingGitignore();
      const fileTree = createFileTree(workspaceRoots, files);

      // Use the VSCode API to retrieve workspace files
      // const files = await vscode.workspace.findFiles("**/*");

      // // Format the files into the expected response structure
      // const formattedFiles = files.map((file) => ({
      //   name: file.path.split("/").pop() || "", // Extract file name from path
      //   path: file.fsPath, // Use fsPath for the actual file path
      //   // type: vscode.workspace.fs
      //   //   .stat(file)
      //   //   .then((stat) => (stat.isDirectory() ? "directory" : "file")),
      // }));

      // const fileTypes = await Promise.all(
      //   formattedFiles.map((file) => file.type)
      // );
      // Send the files back to the client
      serverIpc.sendToClient(ServerToClientChannel.SendWorkspaceFiles, {
        // files: formattedFiles.map((file, index) => ({
        //   ...file,
        //   // type: fileTypes[index],
        //   type: 'file'
        // })),
        files: fileTree
      });
    }
  );
}
