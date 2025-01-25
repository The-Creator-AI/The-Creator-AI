import * as vscode from "vscode";
/**
 * Opens a file in VS Code and shows the Git diff.
 *
 * @param filePath The path to the file.
 */
export async function openFileAndShowDiff(filePath: string): Promise<void> {
  const fileUri = vscode.Uri.file(filePath);
  const document = await vscode.workspace.openTextDocument(fileUri);
  await vscode.window.showTextDocument(document);
  await vscode.commands.executeCommand("git.openChange", fileUri);
}
