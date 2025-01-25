import * as vscode from "vscode";

/**
 * Reads the content of a file.
 *
 * @param filePath The path to the file.
 * @returns The file content as a string.
 */
export async function getFileContent(filePath: string): Promise<string> {
  const fileUri = vscode.Uri.file(filePath);
  const fileContent = await vscode.workspace.fs.readFile(fileUri);
  return new TextDecoder().decode(fileContent);
}
