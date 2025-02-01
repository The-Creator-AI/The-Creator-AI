import { Services } from "@/backend/services/services";
import {
  ClientToServerChannel,
  ServerToClientChannel,
} from "@/common/ipc/channels.enum";
import { ServerPostMessageManager } from "@/common/ipc/server-ipc";
import * as vscode from "vscode";

// Function to handle messages for the file explorer view
export function onMessage(
  serverIpc: ServerPostMessageManager
) {onMessage
  serverIpc.onClientMessage(
    ClientToServerChannel.RequestContextData,
    async (data) => {
      const workspaceRoots =
      vscode.workspace.workspaceFolders?.map((folder) => folder.uri) || [];
      const fsService = Services.getFSService();
      const files = await fsService.getFilesRespectingGitignore();
      const fileTree = fsService.createFileTree(workspaceRoots, files);

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
      serverIpc.sendToClient(ServerToClientChannel.SendContextData, {
        // files: formattedFiles.map((file, index) => ({
        //   ...file,
        //   // type: fileTypes[index],
        //   type: 'file'
        // })),
        files: fileTree,
        architecture: [],
        features: [],
        guidelines: [],
      });
    }
  );
}
