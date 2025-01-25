import { getChangePlanViewState } from "@/client/views/change-plan-view/store/change-plan-view.store";
import { FileNode } from "@/common/types/file-node";

export const getSelectedFiles = (files: FileNode[]) => {
  const selectedFiles = getChangePlanViewState("selectedFiles");
  // Create an array to store absolute paths of selected files
  const absoluteSelectedFiles: string[] = [];

  // Iterate through updatedSelectedFiles and find corresponding absolute paths in files
  selectedFiles.forEach((relativePath) => {
    let matchingNode: FileNode | undefined = undefined;
    files.find((node) => {
      // Iterate through files to find the matching absolute path
      function findMatchingNode(node: FileNode) {
        if (node.absolutePath && node.absolutePath.endsWith(relativePath)) {
          return node;
        }
        if (node.children) {
          for (const child of node.children) {
            const matchingNode = findMatchingNode(child);
            if (matchingNode) {
              return matchingNode;
            }
          }
        }
        return undefined;
      }
      matchingNode = findMatchingNode(node);
    });

    if (matchingNode) {
      absoluteSelectedFiles.push(matchingNode.absolutePath || "");
    }
  });
  return absoluteSelectedFiles;
};
