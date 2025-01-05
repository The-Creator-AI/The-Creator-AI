import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export async function resolveFilePath(
  originalFilePath: string
): Promise<string | null> {
  async function findFile(filePath: string): Promise<string | null> {
    const files = await vscode.workspace.findFiles(`**/${filePath}`, null, 10);

    if (files.length === 1) {
      return files[0].fsPath;
    } else if (files.length > 1) {
      const selectedFile = await vscode.window.showQuickPick(
        files.map((file) => file.fsPath),
        {
          placeHolder: "Multiple files found. Please select the correct one.",
        }
      );
      return selectedFile || null;
    } else {
      const pathParts = filePath.split("/");
      if (pathParts.length > 1) {
        // Drop the first part of the path and try again
        const remainingPath = pathParts.slice(1).join("/");
        return findFile(remainingPath);
      }
      return null;
    }
  }

  const resolvedPath = await findFile(originalFilePath);

  if (resolvedPath) {
    return resolvedPath;
  } else {
    // File not found, ask the user to confirm or modify the path for creating an empty file
    // TODO: What if there are multiple workspace folders?
    const workspacePath = vscode.workspace.workspaceFolders![0].uri.fsPath;
    let newFilePath = await vscode.window.showInputBox({
      prompt:
        "The file is not found. Please confirm or modify the file path to create an empty file.",
      value: originalFilePath,
    });
    const isAbsolute = path.isAbsolute(newFilePath);
    newFilePath = isAbsolute ? newFilePath : path.join(workspacePath, newFilePath);

    if (newFilePath) {
      const dirPath = path.dirname(newFilePath);

      // Create directory if it doesn't exist
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      console.log("Creating new file at", newFilePath);

      // Create empty file
      fs.writeFileSync(newFilePath, "");
      vscode.window.showTextDocument(vscode.Uri.file(newFilePath));
      return newFilePath;
    }
    return null;
  }
}
