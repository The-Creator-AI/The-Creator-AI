import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { resolveFilePath } from "./resolveFilePath";

/**
 * Handles the `RequestOpenFile` message from the client, opening the file in VS Code.
 *
 * @param data An object containing the file path
 */
export async function handleFileOpen(
    data: {
  filePath: string;
}) {
  const { filePath } = data;

  const absoluteFilePath = await resolveFilePath(filePath);
  if (!absoluteFilePath) {
    return; // Error message already shown in resolveFilePath
  }

  try {
    // Check if the file exists
    if (!fs.existsSync(absoluteFilePath)) {
      // If the file doesn't exist, create it
      if (path.isAbsolute(absoluteFilePath)) {
        // If the path is absolute, create it at that path
        fs.writeFileSync(absoluteFilePath, "");
      } else {
        // If the path is relative, create it relative to the workspace directory
        const workspacePath = vscode.workspace.workspaceFolders![0].uri.fsPath;
        const fullFilePath = path.join(workspacePath, absoluteFilePath);
        fs.writeFileSync(fullFilePath, "");
      }
    }

    await vscode.window.showTextDocument(vscode.Uri.file(absoluteFilePath), { preview: false });
  } catch (error) {
    vscode.window.showErrorMessage(`Error opening file: ${error}`);
  }
}
