import * as vscode from "vscode";
/**
 * Writes content to a file.
 * 
 * @param filePath The path to the file.
 * @param content The content to write.
 */
export async function writeFileContent(filePath: string, content: string): Promise<void> {
  const fileUri = vscode.Uri.file(filePath);
  const encoder = new TextEncoder();
  await vscode.workspace.fs.writeFile(fileUri, encoder.encode(content));
}