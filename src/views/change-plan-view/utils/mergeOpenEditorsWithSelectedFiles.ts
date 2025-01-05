import * as vscode from "vscode";

/**
 * Merges the paths of open editors with the provided selected files,
 * ensuring no duplicates and prioritizing open editor paths.
 *
 * @param selectedFiles Array of initially selected file paths.
 * @returns Array of file paths including open editor paths.
 */
export function mergeOpenEditorsWithSelectedFiles(
  selectedFiles: string[]
): string[] {
  const openEditors = vscode.window.tabGroups.all
    .flatMap((group) => group.tabs)
    .map((tab) =>
      tab.input instanceof vscode.TabInputText ||
      tab.input instanceof vscode.TabInputNotebook
        ? tab.input.uri?.fsPath || ""
        : ""
    );

  return openEditors.reduce((acc: string[], tabPath) => {
    const selectedAncestorPath = selectedFiles.find(
      (f) => tabPath.startsWith(f) && f !== tabPath
    );
    if (selectedAncestorPath) {
      return acc;
    } else {
      return [...acc, tabPath];
    }
  }, selectedFiles);
}
